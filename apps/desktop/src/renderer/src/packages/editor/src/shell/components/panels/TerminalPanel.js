// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/panels/TerminalPanel.tsx
import { import_jsx_runtime, import_react } from "../../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../../cloud/src/hooks/useSession.js";
import { require_xterm } from "../../../../../../vendor/@xterm/xterm.js";
import { require_addon_fit } from "../../../../../../vendor/@xterm/addon-fit.js";

var import_xterm = require_xterm();
var import_addon_fit = require_addon_fit();
/** Light palette matching editor chrome (--ed-background/--ed-foreground light values). */
var LIGHT_TERMINAL_THEME = {
	background: "#f7f7f7",
	foreground: "#313131",
	cursor: "#313131",
	selectionBackground: "#b4d8fd"
};
/** Dark palette matching editor chrome (--ed-background/--ed-foreground dark values). */
var DARK_TERMINAL_THEME = {
	background: "#242424",
	foreground: "#dedede",
	cursor: "#dedede",
	selectionBackground: "rgba(99, 143, 214, 0.18)"
};
function getBridge$1() {
	if (typeof window === "undefined") return null;
	const api = window.api;
	return api && typeof api.invoke === "function" ? api : null;
}
/**
* xterm.js terminal wired to a real PTY in the Electron main process.
* One session per mounted panel; the session is created on mount and disposed
* on unmount. Keep this component mounted (visually hidden) across tab
* switches so the shell survives.
*
* `active` should flip true when the panel becomes visible — it triggers a
* refit + focus once the container actually has a size.
*/
function TerminalPanel(t0) {
	const $ = (0, import_compiler_runtime.c)(22);
	const { active, initialCommand, cwd, theme } = t0;
	const containerRef = (0, import_react.useRef)(null);
	const termRef = (0, import_react.useRef)(null);
	const fitRef = (0, import_react.useRef)(null);
	const sessionIdRef = (0, import_react.useRef)(null);
	let t1;
	if ($[0] !== initialCommand) {
		t1 = () => initialCommand;
		$[0] = initialCommand;
		$[1] = t1;
	} else t1 = $[1];
	const commandAtMount = (0, import_react.useEffectEvent)(t1);
	let t2;
	if ($[2] !== cwd) {
		t2 = () => cwd;
		$[2] = cwd;
		$[3] = t2;
	} else t2 = $[3];
	const cwdAtMount = (0, import_react.useEffectEvent)(t2);
	const resolvedTheme = theme ?? LIGHT_TERMINAL_THEME;
	const initialThemeRef = (0, import_react.useRef)(resolvedTheme);
	let t3;
	if ($[4] !== commandAtMount || $[5] !== cwdAtMount) {
		t3 = () => {
			const bridge = getBridge$1();
			const container = containerRef.current;
			if (!bridge || !container) return;
			const term = new import_xterm.Terminal({
				fontFamily: getComputedStyle(document.documentElement).getPropertyValue("--ed-font-mono").trim(),
				fontSize: 12,
				cursorBlink: true,
				theme: initialThemeRef.current
			});
			const fit = new import_addon_fit.FitAddon();
			term.loadAddon(fit);
			term.open(container);
			termRef.current = term;
			fitRef.current = fit;
			term.attachCustomKeyEventHandler(_temp$49);
			const safeFit = () => {
				if (container.clientWidth === 0 || container.clientHeight === 0) return null;
				try {
					fit.fit();
					return {
						cols: term.cols,
						rows: term.rows
					};
				} catch {
					return null;
				}
			};
			let disposed = false;
			const offFns = [];
			let inputSub = null;
			const dims = safeFit();
			bridge.invoke("terminal:create", {
				cols: dims?.cols ?? 80,
				rows: dims?.rows ?? 24,
				initialCommand: commandAtMount(),
				...cwdAtMount() ? { cwd: cwdAtMount() } : {}
			}).then((res) => {
				if (disposed) {
					if (res.ok) bridge.send("terminal:dispose", { id: res.id });
					return;
				}
				if (!res.ok) {
					term.writeln(`\x1b[31mFailed to start terminal: ${res.error}\x1b[0m`);
					return;
				}
				sessionIdRef.current = res.id;
				offFns.push(bridge.on("terminal:data", (payload) => {
					const p = payload;
					if (p?.id === res.id) term.write(p.data);
				}));
				offFns.push(bridge.on("terminal:exit", (payload_0) => {
					const p_0 = payload_0;
					if (p_0?.id === res.id) term.writeln(`\r\n\x1b[90m[process exited with code ${p_0.exitCode}]\x1b[0m`);
				}));
				inputSub = term.onData((data) => {
					if (sessionIdRef.current) bridge.send("terminal:input", {
						id: sessionIdRef.current,
						data
					});
				});
			});
			const sendResize = () => {
				const d = safeFit();
				const id = sessionIdRef.current;
				if (d && id) bridge.send("terminal:resize", {
					id,
					cols: d.cols,
					rows: d.rows
				});
			};
			const ro = new ResizeObserver(() => sendResize());
			ro.observe(container);
			return () => {
				disposed = true;
				ro.disconnect();
				inputSub?.dispose();
				for (const off of offFns) off();
				if (sessionIdRef.current) {
					bridge.send("terminal:dispose", { id: sessionIdRef.current });
					sessionIdRef.current = null;
				}
				term.dispose();
				termRef.current = null;
				fitRef.current = null;
			};
		};
		$[4] = commandAtMount;
		$[5] = cwdAtMount;
		$[6] = t3;
	} else t3 = $[6];
	let t4;
	if ($[7] === Symbol.for("react.memo_cache_sentinel")) {
		t4 = [];
		$[7] = t4;
	} else t4 = $[7];
	(0, import_react.useEffect)(t3, t4);
	let t5;
	if ($[8] !== resolvedTheme) {
		t5 = JSON.stringify(resolvedTheme);
		$[8] = resolvedTheme;
		$[9] = t5;
	} else t5 = $[9];
	const themeJson = t5;
	let t6;
	let t7;
	if ($[10] !== themeJson) {
		t6 = () => {
			if (termRef.current) termRef.current.options.theme = JSON.parse(themeJson);
		};
		t7 = [themeJson];
		$[10] = themeJson;
		$[11] = t6;
		$[12] = t7;
	} else {
		t6 = $[11];
		t7 = $[12];
	}
	(0, import_react.useEffect)(t6, t7);
	let t8;
	let t9;
	if ($[13] !== active) {
		t8 = () => {
			if (!active) return;
			const fit_0 = fitRef.current;
			const term_0 = termRef.current;
			if (!fit_0 || !term_0) return;
			const raf = requestAnimationFrame(() => {
				try {
					fit_0.fit();
				} catch {}
				term_0.focus();
			});
			return () => cancelAnimationFrame(raf);
		};
		t9 = [active];
		$[13] = active;
		$[14] = t8;
		$[15] = t9;
	} else {
		t8 = $[14];
		t9 = $[15];
	}
	(0, import_react.useEffect)(t8, t9);
	if (!getBridge$1()) {
		let t10;
		if ($[16] === Symbol.for("react.memo_cache_sentinel")) {
			t10 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "h-full w-full flex items-center justify-center text-ed-muted-foreground text-sm",
				children: "The terminal is only available in the Petal desktop app."
			});
			$[16] = t10;
		} else t10 = $[16];
		return t10;
	}
	let t10;
	if ($[17] !== resolvedTheme.background) {
		t10 = { backgroundColor: resolvedTheme.background };
		$[17] = resolvedTheme.background;
		$[18] = t10;
	} else t10 = $[18];
	let t11;
	if ($[19] === Symbol.for("react.memo_cache_sentinel")) {
		t11 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			ref: containerRef,
			className: "h-full w-full"
		});
		$[19] = t11;
	} else t11 = $[19];
	let t12;
	if ($[20] !== t10) {
		t12 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "h-full w-full p-2 overflow-hidden",
			style: t10,
			children: t11
		});
		$[20] = t10;
		$[21] = t12;
	} else t12 = $[21];
	return t12;
}
function _temp$49(event) {
	if (event.type !== "keydown") return true;
	if (event.key === "Escape") return false;
	if (event.key === "Tab" && event.shiftKey) return false;
	return true;
}

export { DARK_TERMINAL_THEME, LIGHT_TERMINAL_THEME, TerminalPanel };
