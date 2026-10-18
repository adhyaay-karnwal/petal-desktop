// Reconstructed from index-C74mRL57.js — original module: packages/cloud/src/components/LoginSplash.tsx
import { import_jsx_runtime, import_react } from "../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../hooks/useSession.js";
import { cn$2 } from "../../../ui/src/lib/utils.js";
import { Text$4 } from "../../../ui/src/components/Text.js";
import { Button } from "../../../ui/src/components/Button.js";
import { s$14 } from "../../../../vendor/@phosphor-icons/react.js";
import { logoText_default } from "../assets/logoText.png.js";
import { ClaudeCanvasPanel, CodeComponentsPanel, ProduceCodePanel } from "../assets/claudeMark.webp.js";

var ROTATE_MS = 5e3;
var SLIDES = [
	{
		title: "Work with your code components",
		body: "Import your repo and design with the exact components your app already ships.",
		Panel: CodeComponentsPanel
	},
	{
		title: "Use Claude Code on the canvas",
		body: "Chat to create, refine, and rearrange designs. Claude works right where you do.",
		Panel: ClaudeCanvasPanel
	},
	{
		title: "Produce code",
		body: "Ship your designs back to the codebase as real, production-ready code.",
		Panel: ProduceCodePanel
	}
];
function useMediaQuery(query) {
	const $ = (0, import_compiler_runtime.c)(5);
	let t0;
	if ($[0] !== query) {
		t0 = () => window.matchMedia(query).matches;
		$[0] = query;
		$[1] = t0;
	} else t0 = $[1];
	const [matches, setMatches] = (0, import_react.useState)(t0);
	const [trackedQuery, setTrackedQuery] = (0, import_react.useState)(query);
	if (query !== trackedQuery) {
		setTrackedQuery(query);
		setMatches(window.matchMedia(query).matches);
	}
	let t1;
	let t2;
	if ($[2] !== query) {
		t1 = () => {
			const mq = window.matchMedia(query);
			const onChange = (e) => setMatches(e.matches);
			mq.addEventListener("change", onChange);
			return () => mq.removeEventListener("change", onChange);
		};
		t2 = [query];
		$[2] = query;
		$[3] = t1;
		$[4] = t2;
	} else {
		t1 = $[3];
		t2 = $[4];
	}
	(0, import_react.useEffect)(t1, t2);
	return matches;
}
/** Rotates through the slides, unless paused by interaction. */
function useRotation(count, paused) {
	const $ = (0, import_compiler_runtime.c)(8);
	const [active, setActive] = (0, import_react.useState)(0);
	const activeRef = (0, import_react.useRef)(active);
	let t0;
	if ($[0] !== active) {
		t0 = () => {
			activeRef.current = active;
		};
		$[0] = active;
		$[1] = t0;
	} else t0 = $[1];
	(0, import_react.useLayoutEffect)(t0);
	let t1;
	let t2;
	if ($[2] !== count || $[3] !== paused) {
		t1 = () => {
			if (paused) return;
			const id = setInterval(() => setActive((activeRef.current + 1) % count), ROTATE_MS);
			return () => clearInterval(id);
		};
		t2 = [count, paused];
		$[2] = count;
		$[3] = paused;
		$[4] = t1;
		$[5] = t2;
	} else {
		t1 = $[4];
		t2 = $[5];
	}
	(0, import_react.useEffect)(t1, t2);
	let t3;
	if ($[6] !== active) {
		t3 = [active, setActive];
		$[6] = active;
		$[7] = t3;
	} else t3 = $[7];
	return t3;
}
/**
* Full-width muted frame. Artwork is only scaled down when the container is
* narrower than PANEL_WIDTH (never up). When wider, the layout area fills the
* frame so panels like the Claude chat rail can stay flush to the right edge.
*/
function ScaleToFit(t0) {
	const $ = (0, import_compiler_runtime.c)(24);
	const { className, children } = t0;
	const ref = (0, import_react.useRef)(null);
	const [scale, setScale] = (0, import_react.useState)(1);
	const [frameWidth, setFrameWidth] = (0, import_react.useState)(466);
	let t1;
	let t2;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t1 = () => {
			const el = ref.current;
			if (!el) return;
			const observer = new ResizeObserver((t3) => {
				const [entry] = t3;
				const width = entry.contentRect.width;
				if (width <= 0) return;
				setFrameWidth(width);
				setScale(Math.min(1, width / 466));
			});
			observer.observe(el);
			return () => observer.disconnect();
		};
		t2 = [];
		$[0] = t1;
		$[1] = t2;
	} else {
		t1 = $[0];
		t2 = $[1];
	}
	(0, import_react.useEffect)(t1, t2);
	const layoutWidth = scale < 1 ? 466 : frameWidth;
	let t3;
	if ($[2] !== className) {
		t3 = cn$2("w-full min-w-0", className);
		$[2] = className;
		$[3] = t3;
	} else t3 = $[3];
	const t4 = 416 * scale;
	let t5;
	if ($[4] !== t4) {
		t5 = { height: t4 };
		$[4] = t4;
		$[5] = t5;
	} else t5 = $[5];
	const t6 = layoutWidth * scale;
	const t7 = 416 * scale;
	let t8;
	if ($[6] !== t6 || $[7] !== t7) {
		t8 = {
			width: t6,
			height: t7
		};
		$[6] = t6;
		$[7] = t7;
		$[8] = t8;
	} else t8 = $[8];
	const t9 = scale === 1 ? void 0 : `scale(${scale})`;
	let t10;
	if ($[9] !== layoutWidth || $[10] !== t9) {
		t10 = {
			width: layoutWidth,
			height: 416,
			transform: t9,
			transformOrigin: "top left"
		};
		$[9] = layoutWidth;
		$[10] = t9;
		$[11] = t10;
	} else t10 = $[11];
	let t11;
	if ($[12] !== children || $[13] !== t10) {
		t11 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex",
			style: t10,
			children
		});
		$[12] = children;
		$[13] = t10;
		$[14] = t11;
	} else t11 = $[14];
	let t12;
	if ($[15] !== t11 || $[16] !== t8) {
		t12 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "absolute top-0 left-0",
			style: t8,
			children: t11
		});
		$[15] = t11;
		$[16] = t8;
		$[17] = t12;
	} else t12 = $[17];
	let t13;
	if ($[18] !== t12 || $[19] !== t5) {
		t13 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "relative w-full rounded-xl border border-ed-border bg-ed-muted",
			style: t5,
			children: t12
		});
		$[18] = t12;
		$[19] = t5;
		$[20] = t13;
	} else t13 = $[20];
	let t14;
	if ($[21] !== t13 || $[22] !== t3) {
		t14 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			ref,
			className: t3,
			children: t13
		});
		$[21] = t13;
		$[22] = t3;
		$[23] = t14;
	} else t14 = $[23];
	return t14;
}
var DRAG = { WebkitAppRegion: "drag" };
var NO_DRAG = { WebkitAppRegion: "no-drag" };
function AuthButtons(t0) {
	const $ = (0, import_compiler_runtime.c)(9);
	const { onSignUp, onLogIn, size: t1 } = t0;
	const size = t1 === void 0 ? "default" : t1;
	let t2;
	if ($[0] !== onSignUp || $[1] !== size) {
		t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			className: "w-fit shrink-0",
			size,
			RightIcon: s$14,
			onClick: onSignUp,
			children: "Sign up"
		});
		$[0] = onSignUp;
		$[1] = size;
		$[2] = t2;
	} else t2 = $[2];
	let t3;
	if ($[3] !== onLogIn || $[4] !== size) {
		t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			className: "w-fit shrink-0",
			size,
			variant: "outline",
			onClick: onLogIn,
			children: "Log in"
		});
		$[3] = onLogIn;
		$[4] = size;
		$[5] = t3;
	} else t3 = $[5];
	let t4;
	if ($[6] !== t2 || $[7] !== t3) {
		t4 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex shrink-0 flex-row gap-1.5",
			children: [t2, t3]
		});
		$[6] = t2;
		$[7] = t3;
		$[8] = t4;
	} else t4 = $[8];
	return t4;
}
function LoginSplash(t0) {
	const $ = (0, import_compiler_runtime.c)(41);
	const { onSignUp, onLogIn, draggableBackdrop } = t0;
	const [paused, setPaused] = (0, import_react.useState)(false);
	const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
	const isMobile = useMediaQuery("(max-width: 767px)");
	const [active, setActive] = useRotation(SLIDES.length, paused || reducedMotion);
	const t1 = draggableBackdrop ? DRAG : void 0;
	const t2 = isMobile ? "gap-4 px-4 pt-10 pb-4" : "gap-6 p-6";
	let t3;
	if ($[0] !== t2) {
		t3 = cn$2("flex min-h-full flex-col items-center justify-center", t2);
		$[0] = t2;
		$[1] = t3;
	} else t3 = $[1];
	let t4;
	if ($[2] === Symbol.for("react.memo_cache_sentinel")) {
		t4 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
			src: logoText_default,
			alt: "Petal",
			className: "h-7 w-auto shrink-0 object-contain [.editor-dark_&]:invert"
		});
		$[2] = t4;
	} else t4 = $[2];
	const t5 = isMobile ? "max-w-[512px] gap-8 px-5 pt-8 pb-5" : "gap-7 px-11 py-10 md:max-xl:max-w-[780px] xl:max-w-[944px] xl:gap-8 xl:px-12 xl:py-11";
	let t6;
	if ($[3] !== t5) {
		t6 = cn$2("flex w-full shrink-0 flex-col rounded-2xl border border-ed-border bg-ed-background shadow-2xl/7", t5);
		$[3] = t5;
		$[4] = t6;
	} else t6 = $[4];
	const t7 = draggableBackdrop ? NO_DRAG : void 0;
	const t8 = isMobile ? "flex-col items-start" : "flex-row items-center justify-between";
	let t9;
	if ($[5] !== t8) {
		t9 = cn$2("flex w-full gap-3", t8);
		$[5] = t8;
		$[6] = t9;
	} else t9 = $[6];
	let t10;
	if ($[7] === Symbol.for("react.memo_cache_sentinel")) {
		t10 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "m-0 min-w-0 text-base leading-6 tracking-[-0.02em] font-semibold text-ed-foreground",
			children: "Design, with code"
		});
		$[7] = t10;
	} else t10 = $[7];
	let t11;
	if ($[8] !== onLogIn || $[9] !== onSignUp) {
		t11 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "shrink-0",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthButtons, {
				onSignUp,
				onLogIn,
				size: "sm"
			})
		});
		$[8] = onLogIn;
		$[9] = onSignUp;
		$[10] = t11;
	} else t11 = $[10];
	let t12;
	if ($[11] !== t11 || $[12] !== t9) {
		t12 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: t9,
			children: [t10, t11]
		});
		$[11] = t11;
		$[12] = t9;
		$[13] = t12;
	} else t12 = $[13];
	let t13;
	let t14;
	let t15;
	let t16;
	if ($[14] === Symbol.for("react.memo_cache_sentinel")) {
		t13 = () => setPaused(true);
		t14 = () => setPaused(false);
		t15 = () => setPaused(true);
		t16 = () => setPaused(false);
		$[14] = t13;
		$[15] = t14;
		$[16] = t15;
		$[17] = t16;
	} else {
		t13 = $[14];
		t14 = $[15];
		t15 = $[16];
		t16 = $[17];
	}
	let t17;
	if ($[18] !== active || $[19] !== setActive) {
		t17 = SLIDES.map((slide, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			"aria-current": i === active,
			onClick: () => setActive(i),
			onFocus: () => setActive(i),
			className: cn$2("flex shrink-0 flex-col gap-0.5 rounded-xl border-none p-4 text-left xl:p-5", "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ed-ring", i === active ? "bg-ed-muted" : "bg-transparent"),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
				size: "md",
				weight: "medium",
				className: "md:max-xl:text-[13px] md:max-xl:leading-tight",
				children: slide.title
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
				size: "xs",
				variant: "tertiary",
				className: "md:max-xl:text-[11px]",
				children: slide.body
			})]
		}, slide.title));
		$[18] = active;
		$[19] = setActive;
		$[20] = t17;
	} else t17 = $[20];
	let t18;
	if ($[21] !== t17) {
		t18 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid gap-1.5 max-md:grid-cols-1 md:max-xl:grid-cols-3 xl:col-start-1 xl:grid-cols-1",
			onMouseEnter: t13,
			onMouseLeave: t14,
			onFocusCapture: t15,
			onBlurCapture: t16,
			children: t17
		});
		$[21] = t17;
		$[22] = t18;
	} else t18 = $[22];
	let t19;
	if ($[23] !== active) {
		t19 = SLIDES.map((slide_0, i_0) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			"aria-hidden": i_0 !== active,
			className: cn$2("absolute inset-0 flex", i_0 === active ? "scale-100 opacity-100" : "pointer-events-none scale-[0.98] opacity-0"),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(slide_0.Panel, {})
		}, slide_0.title));
		$[23] = active;
		$[24] = t19;
	} else t19 = $[24];
	let t20;
	if ($[25] !== t19) {
		t20 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScaleToFit, {
			className: "min-w-0 xl:col-start-2",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "relative flex-1",
				"aria-hidden": "true",
				inert: true,
				children: t19
			})
		});
		$[25] = t19;
		$[26] = t20;
	} else t20 = $[26];
	let t21;
	if ($[27] !== t18 || $[28] !== t20) {
		t21 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid max-xl:grid-cols-1 max-xl:gap-7 xl:grid-cols-[336px_466px] xl:gap-x-10",
			children: [t18, t20]
		});
		$[27] = t18;
		$[28] = t20;
		$[29] = t21;
	} else t21 = $[29];
	let t22;
	if ($[30] !== t12 || $[31] !== t21 || $[32] !== t6 || $[33] !== t7) {
		t22 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: t6,
			style: t7,
			children: [t12, t21]
		});
		$[30] = t12;
		$[31] = t21;
		$[32] = t6;
		$[33] = t7;
		$[34] = t22;
	} else t22 = $[34];
	let t23;
	if ($[35] !== t22 || $[36] !== t3) {
		t23 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: t3,
			children: [t4, t22]
		});
		$[35] = t22;
		$[36] = t3;
		$[37] = t23;
	} else t23 = $[37];
	let t24;
	if ($[38] !== t1 || $[39] !== t23) {
		t24 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "h-screen w-full overflow-auto bg-ed-muted",
			style: t1,
			children: t23
		});
		$[38] = t1;
		$[39] = t23;
		$[40] = t24;
	} else t24 = $[40];
	return t24;
}

export { LoginSplash };
