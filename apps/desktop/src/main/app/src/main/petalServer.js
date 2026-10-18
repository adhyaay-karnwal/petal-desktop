// Petal: runs the API server (apps/server, bundled to out/server/index.mjs) as an
// Electron utility process, so the app needs no hosted backend. It listens on
// 127.0.0.1 only and signs every request in as the one local user.
import { child_process, crypto$1, electron, fs, os, path } from "../../../__bundle__/_preamble.js";

var PORT = Number(process.env.PETAL_API_PORT) || 4280;
/** Per-launch secret for main-process-only server routes (/internal/*). */
var INTERNAL_KEY = (0, crypto$1.randomBytes)(32).toString("hex");
var child = null;
var stopping = false;
var restarts = 0;

function localUserName() {
	if (process.platform === "darwin") try {
		const full = child_process.execFileSync("id", ["-F"], { encoding: "utf8" }).trim();
		if (full) return full;
	} catch {}
	const name = os.userInfo().username || "Me";
	return name.charAt(0).toUpperCase() + name.slice(1);
}

async function isHealthy(url) {
	try {
		return (await fetch(`${url}/health`)).ok;
	} catch {
		return false;
	}
}

function fork(log) {
	const serverDir = path.join(__dirname, "../server");
	child = electron.utilityProcess.fork(path.join(serverDir, "index.mjs"), [], {
		serviceName: "Petal Server",
		stdio: "pipe",
		env: {
			...process.env,
			PETAL_LOCAL_MODE: "1",
			PETAL_USER_NAME: localUserName(),
			HOST: "127.0.0.1",
			PORT: String(PORT),
			DATA_DIR: path.join(electron.app.getPath("userData"), "data"),
			WEB_DIR: path.join(serverDir, "web"),
			PETAL_DESKTOP_SRC: path.join(serverDir, "compiler"),
			PETAL_INTERNAL_KEY: INTERNAL_KEY,
			GITHUB_OAUTH_LOOPBACK_PORT: String(Number(process.env.PETAL_GITHUB_OAUTH_PORT) || 23584),
			DESKTOP_SCHEME: "com.petal.desktop"
		}
	});
	child.stdout?.pipe(log, { end: false });
	child.stderr?.pipe(log, { end: false });
	child.on("exit", (code) => {
		child = null;
		if (stopping) return;
		log.write(`[petal] server exited (${code})\n`);
		if (restarts++ < 5) setTimeout(async () => {
			// Another Petal window process already serves this port.
			if (!await isHealthy(`http://127.0.0.1:${PORT}`)) fork(log);
		}, 1e3 * restarts);
	});
}

/** Resolves once the built-in server answers; no-op when PETAL_API_URL is set. */
async function startEmbeddedServer() {
	if (process.env.PETAL_API_URL) return;
	const url = `http://127.0.0.1:${PORT}`;
	const logFile = path.join(electron.app.getPath("logs"), "server.log");
	fs.mkdirSync(path.dirname(logFile), { recursive: true });
	const log = fs.createWriteStream(logFile, { flags: "a" });
	log.setMaxListeners(0);
	fork(log);
	for (let i = 0; i < 300; i++) {
		if (await isHealthy(url)) return;
		await new Promise((r) => setTimeout(r, 100));
	}
	console.error(`[Petal] built-in server did not start; see ${logFile}`);
}

function stopEmbeddedServer() {
	stopping = true;
	child?.kill();
}

function internalKey() {
	return INTERNAL_KEY;
}

export { internalKey, startEmbeddedServer, stopEmbeddedServer };
