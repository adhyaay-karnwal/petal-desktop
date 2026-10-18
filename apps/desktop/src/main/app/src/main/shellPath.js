// Use the login shell's PATH when launched from Finder/Dock (macOS gives GUI apps /usr/bin:/bin:...).
import { child_process, electron } from "../../../__bundle__/_preamble.js";

if (process.platform === "darwin" && electron.app.isPackaged) try {
	const marker = "__PETAL_PATH__";
	const out = child_process.execFileSync(process.env.SHELL || "/bin/zsh", ["-ilc", `printf '${marker}%s${marker}' "$PATH"`], {
		encoding: "utf8",
		timeout: 5e3,
		stdio: ["ignore", "pipe", "ignore"]
	});
	const shellPath = out.split(marker)[1];
	if (shellPath) process.env.PATH = [...new Set([...shellPath.split(":"), ...(process.env.PATH || "").split(":")])].filter(Boolean).join(":");
} catch {}
