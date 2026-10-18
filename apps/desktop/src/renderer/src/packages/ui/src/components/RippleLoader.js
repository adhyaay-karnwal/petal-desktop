// Reconstructed from index-C74mRL57.js — original module: packages/ui/src/components/RippleLoader.tsx
import { import_jsx_runtime, import_react } from "../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../cloud/src/hooks/useSession.js";

var SOURCE_Y = .62;
var WAVELENGTH = .42;
/**
* Dots are batched into one `<path>` per opacity level, so a frame costs one
* `d` write per level instead of two attribute writes per dot — at ~190 dots a
* loader, per-dot elements made a screen of loaders dominate the main thread.
*/
var OPACITY_LEVELS = 16;
var LEVEL_OPACITIES = Array.from({ length: OPACITY_LEVELS }, (_, level) => ((level + .5) / OPACITY_LEVELS).toFixed(3));
/**
* The pattern loops every `duration`, so each loop is sampled at a fixed rate
* and every frame's path strings are cached, shared by all loaders with the
* same grid, variant and duration. A painted frame is then a lookup plus the
* changed `d` writes, and half the display frames at 60Hz do no work at all.
*/
var FRAMES_PER_SECOND = 30;
var geometryCache = /* @__PURE__ */ new Map();
function rippleGeometry(grid) {
	const cached = geometryCache.get(grid);
	if (cached) return cached;
	const cell = 100 / grid;
	const maxRadius = cell * .46;
	const dots = [];
	for (let row = 0; row < grid; row++) for (let column = 0; column < grid; column++) {
		const cx = cell * (column + .5);
		const cy = cell * (row + .5);
		const x = (cx - 50) / 50;
		const y = (cy - 50) / 50;
		if (x * x + y * y > .9) continue;
		dots.push({
			cx,
			cy,
			top: Math.hypot(x, y + SOURCE_Y),
			bottom: Math.hypot(x, y - SOURCE_Y)
		});
	}
	const rimCount = Math.round(grid * 2.2);
	const rim = [];
	for (let index = 0; index < rimCount; index++) {
		const angle = index / rimCount * Math.PI * 2;
		rim.push({
			cx: 50 + Math.cos(angle) * (50 - maxRadius),
			cy: 50 + Math.sin(angle) * (50 - maxRadius),
			index
		});
	}
	const geometry = {
		dots,
		rim,
		minRadius: cell * .08,
		maxRadius
	};
	geometryCache.set(grid, geometry);
	return geometry;
}
function ringsAt(distance, time, simple) {
	const wave = .5 + .5 * Math.cos((distance / WAVELENGTH - time) * Math.PI * 2);
	return Math.pow(wave, simple ? 5 : 3) * Math.max(0, 1 - distance * .45);
}
function circlePath(cx, cy, r) {
	const radius = r.toFixed(2);
	return `M${(cx - r).toFixed(2)} ${cy.toFixed(2)}a${radius} ${radius} 0 1 0 ${(2 * r).toFixed(2)} 0a${radius} ${radius} 0 1 0 ${(-2 * r).toFixed(2)} 0`;
}
/** The `d` of every opacity level's path at `time` (0–1 through the loop). */
function rippleFrame(geometry, time, simple) {
	const { dots, rim, minRadius, maxRadius } = geometry;
	const levels = Array.from({ length: OPACITY_LEVELS }, () => []);
	const add = (opacity, path) => {
		levels[Math.min(15, Math.floor(opacity * OPACITY_LEVELS))].push(path);
	};
	for (const dot of dots) {
		const top = ringsAt(dot.top, time, simple);
		const bottom = ringsAt(dot.bottom, time, simple);
		const value = Math.min(1, simple ? Math.max(top, bottom) : top + bottom + top * bottom * 1.5);
		if (simple && value < .2) continue;
		add(simple ? .3 + .7 * value : .14 + .86 * value, circlePath(dot.cx, dot.cy, minRadius + (maxRadius - minRadius) * value));
	}
	for (const point of rim) {
		const shimmer = .5 + .5 * Math.sin((point.index / rim.length - time) * Math.PI * 4);
		add(.85 + .15 * shimmer, circlePath(point.cx, point.cy, maxRadius * (.88 + .12 * shimmer)));
	}
	return levels.map((level) => level.join(""));
}
var frameCache = /* @__PURE__ */ new Map();
/** Frame `index` of a loop sampled `frameCount` times, built on first use. */
function rippleFrameAt(grid, simple, frameCount, index) {
	const key = `${grid}:${simple}:${frameCount}`;
	let frames = frameCache.get(key);
	if (!frames) {
		frames = new Array(frameCount);
		frameCache.set(key, frames);
	}
	return frames[index] ?? (frames[index] = rippleFrame(rippleGeometry(grid), index / frameCount, simple));
}
/** One animation frame loop shared by every mounted loader. */
var subscribers = /* @__PURE__ */ new Set();
var tickerFrame = 0;
function tick(now) {
	for (const subscriber of subscribers) subscriber(now);
	tickerFrame = subscribers.size ? requestAnimationFrame(tick) : 0;
}
function subscribe(subscriber) {
	subscribers.add(subscriber);
	if (!tickerFrame) tickerFrame = requestAnimationFrame(tick);
	return () => {
		subscribers.delete(subscriber);
		if (subscribers.size || !tickerFrame) return;
		cancelAnimationFrame(tickerFrame);
		tickerFrame = 0;
	};
}
/** The Petal mark rendered as a halftone ripple-interference loader. */
function RippleLoader(t0) {
	const $ = (0, import_compiler_runtime.c)(14);
	const { size: t1, duration: t2, grid: t3, variant: t4, className } = t0;
	const size = t1 === void 0 ? 40 : t1;
	const duration = t2 === void 0 ? 2 : t2;
	const grid = t3 === void 0 ? 15 : t3;
	const simple = (t4 === void 0 ? "default" : t4) === "simple";
	const svgRef = import_react.useRef(null);
	let t5;
	let t6;
	if ($[0] !== duration || $[1] !== grid || $[2] !== simple) {
		t5 = () => {
			const svg = svgRef.current;
			if (!svg) return;
			const frameCount = Math.max(1, Math.round(duration * FRAMES_PER_SECOND));
			const paths = Array.from(svg.children);
			const painted = new Array(OPACITY_LEVELS).fill("");
			let shown = -1;
			const paint = (index) => {
				if (index === shown) return;
				shown = index;
				const frame = rippleFrameAt(grid, simple, frameCount, index);
				for (let level = 0; level < OPACITY_LEVELS; level++) {
					if (frame[level] === painted[level]) continue;
					paths[level].setAttribute("d", frame[level]);
					painted[level] = frame[level];
				}
			};
			const start = performance.now();
			paint(0);
			return subscribe((now) => paint(Math.floor(Math.max(0, now - start) / 1e3 / duration % 1 * frameCount)));
		};
		t6 = [
			grid,
			duration,
			simple
		];
		$[0] = duration;
		$[1] = grid;
		$[2] = simple;
		$[3] = t5;
		$[4] = t6;
	} else {
		t5 = $[3];
		t6 = $[4];
	}
	import_react.useLayoutEffect(t5, t6);
	let t7;
	if ($[5] !== size) {
		t7 = {
			width: size,
			height: size,
			display: "inline-block",
			lineHeight: 0
		};
		$[5] = size;
		$[6] = t7;
	} else t7 = $[6];
	let t8;
	if ($[7] === Symbol.for("react.memo_cache_sentinel")) {
		t8 = LEVEL_OPACITIES.map(_temp$120);
		$[7] = t8;
	} else t8 = $[7];
	let t9;
	if ($[8] !== size) {
		t9 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
			ref: svgRef,
			viewBox: "0 0 100 100",
			width: size,
			height: size,
			fill: "currentColor",
			"aria-hidden": "true",
			children: t8
		});
		$[8] = size;
		$[9] = t9;
	} else t9 = $[9];
	let t10;
	if ($[10] !== className || $[11] !== t7 || $[12] !== t9) {
		t10 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className,
			style: t7,
			children: t9
		});
		$[10] = className;
		$[11] = t7;
		$[12] = t9;
		$[13] = t10;
	} else t10 = $[13];
	return t10;
}
function _temp$120(opacity) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { opacity }, opacity);
}

export { RippleLoader };
