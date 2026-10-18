// Petal updates from GitHub Releases (PETAL_UPDATE_REPO). The repo is private, so the
// release feed is read with the GitHub connection the user set up in Petal (gh login or
// a pasted token). Replaces electron-updater: an ad-hoc signed mac app can't use
// Squirrel.Mac, so the new bundle is swapped in by a small script after quit.
import { child_process, electron, events, fs, path } from "../../../__bundle__/_preamble.js";
import { getApiUrl } from "./auth.js";
import { internalKey } from "./petalServer.js";

var REPO = process.env.PETAL_UPDATE_REPO || "adhyaay-karnwal/petal-desktop";
var API = `https://api.github.com/repos/${REPO}`;

function isNewer(a, b) {
	const parse = (v) => v.replace(/^v/i, "").split(/[.-]/).map((p) => parseInt(p, 10) || 0);
	const pa = parse(a);
	const pb = parse(b);
	for (let i = 0; i < Math.max(pa.length, pb.length); i++) if ((pa[i] ?? 0) !== (pb[i] ?? 0)) return (pa[i] ?? 0) > (pb[i] ?? 0);
	return false;
}

function assetName(version) {
	if (process.platform === "darwin") return `Petal-${version}-${process.arch}.zip`;
	if (process.platform === "win32") return `Petal-Setup-${version}.exe`;
	return null;
}

async function githubToken() {
	try {
		const res = await fetch(`${getApiUrl()}/internal/github-token`, { headers: { "x-petal-internal": internalKey() } });
		if (res.ok) return (await res.json()).token || null;
	} catch {}
	return process.env.GITHUB_TOKEN || null;
}

function github(url, token, accept = "application/vnd.github+json") {
	return fetch(url, { headers: {
		Accept: accept,
		"User-Agent": "Petal",
		...token ? { Authorization: `Bearer ${token}` } : {}
	} });
}

class PetalUpdater extends events.EventEmitter {
	logger = console;
	autoDownload = true;
	autoInstallOnAppQuit = true;
	downloaded = null;
	checking = null;
	installing = false;

	constructor() {
		super();
		electron.app.on("will-quit", () => {
			if (this.autoInstallOnAppQuit && this.downloaded && !this.installing) this.install(false);
		});
	}

	/** Resolves to the newer version that is ready to install, or null when up to date. */
	checkForUpdates() {
		this.checking ??= this.check().finally(() => this.checking = null);
		return this.checking;
	}

	async check() {
		try {
			const token = await githubToken();
			const res = await github(`${API}/releases/latest`, token);
			if (res.status === 404) throw new Error(token ? `No release found in ${REPO} (or this GitHub account can't see it).` : `Connect GitHub in Petal to get updates from the private ${REPO} repo.`);
			if (!res.ok) throw new Error(`GitHub returned ${res.status} for the release feed.`);
			const release = await res.json();
			const version = String(release.tag_name || "").replace(/^v/i, "");
			if (!version || !isNewer(version, electron.app.getVersion())) return null;
			if (this.downloaded?.version === version) return version;
			const name = assetName(version);
			const asset = release.assets?.find((a) => a.name === name);
			if (!asset) throw new Error(`Release ${version} has no ${name ?? "build for this platform"}.`);
			this.emit("update-available", { version });
			const dir = path.join(electron.app.getPath("userData"), "updates");
			fs.rmSync(dir, { recursive: true, force: true });
			fs.mkdirSync(dir, { recursive: true });
			const file = path.join(dir, name);
			const dl = await github(asset.url, token, "application/octet-stream");
			if (!dl.ok) throw new Error(`Download failed (${dl.status}).`);
			fs.writeFileSync(file, Buffer.from(await dl.arrayBuffer()));
			if (fs.statSync(file).size !== asset.size) throw new Error("Download was incomplete.");
			this.downloaded = { version, file };
			this.emit("update-downloaded", { version });
			return version;
		} catch (err) {
			this.emit("error", err);
			throw err;
		}
	}

	/** Menu "Check for Updates…": same check, with a dialog for every outcome. */
	async checkNow() {
		const show = (message, detail) => electron.dialog.showMessageBox({ type: "info", message, detail, buttons: ["OK"] });
		try {
			const version = await this.checkForUpdates();
			if (!version) return show("Petal is up to date.", `You're on version ${electron.app.getVersion()}.`);
			const { response } = await electron.dialog.showMessageBox({ type: "info", message: `Petal ${version} is ready.`, detail: "Restart now to update.", buttons: ["Restart", "Later"], defaultId: 0 });
			if (response === 0) this.quitAndInstall();
		} catch (err) {
			show("Couldn't check for updates.", err instanceof Error ? err.message : String(err));
		}
	}

	quitAndInstall() {
		if (!this.downloaded) return;
		this.install(true);
		electron.app.quit();
	}

	install(relaunch) {
		this.installing = true;
		const { file } = this.downloaded;
		if (process.platform === "darwin") {
			// .../Petal.app/Contents/MacOS/Petal -> .../Petal.app
			const bundle = path.resolve(process.execPath, "../../..");
			const stage = path.join(path.dirname(file), "staged");
			fs.rmSync(stage, { recursive: true, force: true });
			child_process.execFileSync("ditto", ["-x", "-k", file, stage]);
			const script = "while kill -0 \"$PETAL_PID\" 2>/dev/null; do sleep 0.2; done; rm -rf \"$PETAL_OLD.old\"; mv \"$PETAL_OLD\" \"$PETAL_OLD.old\" && if mv \"$PETAL_NEW\" \"$PETAL_OLD\"; then rm -rf \"$PETAL_OLD.old\"; else mv \"$PETAL_OLD.old\" \"$PETAL_OLD\"; fi; [ \"$PETAL_RELAUNCH\" = 1 ] && open \"$PETAL_OLD\"";
			child_process.spawn("/bin/sh", ["-c", script], {
				detached: true,
				stdio: "ignore",
				env: {
					PATH: "/usr/bin:/bin:/usr/sbin:/sbin",
					PETAL_PID: String(process.pid),
					PETAL_OLD: bundle,
					PETAL_NEW: path.join(stage, "Petal.app"),
					PETAL_RELAUNCH: relaunch ? "1" : "0"
				}
			}).unref();
		} else if (process.platform === "win32") child_process.spawn(file, relaunch ? ["/S", "--force-run"] : ["/S"], { detached: true, stdio: "ignore" }).unref();
	}
}

var petalUpdater = new PetalUpdater();

export { petalUpdater };
