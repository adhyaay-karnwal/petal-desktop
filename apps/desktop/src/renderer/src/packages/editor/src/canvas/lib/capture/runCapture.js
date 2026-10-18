// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/canvas/lib/capture/runCapture.ts
import { Se$1 } from "../../../../../../vendor/bippy.js";
import { detectProjectRoot, resolveSourceInfoBatch } from "./fiber.js";
import { preloadSheets } from "./stylesheets.js";
import { createCounters, createUaBaseline } from "./snapshot.js";
import { createIdGen, walkChildren, walkNode } from "./walk.js";

async function runCapture(options = {}) {
	const snapshot = options.snapshot ?? false;
	const maxDepth = options.maxDepth ?? 30;
	const withFiber = options.withFiber ?? false;
	const withComputedStyles = snapshot || (options.withComputedStyles ?? true);
	const withStyleHeuristics = !snapshot && (options.withStyleHeuristics ?? withComputedStyles);
	const withStylesheetPreload = !snapshot && (options.withStylesheetPreload ?? false);
	const includeRoot = options.includeRoot ?? false;
	let root = options.rootElement ?? null;
	if (!root && options.selector) root = document.querySelector(options.selector);
	if (!root) root = document.body;
	if (!root) return { error: "no_body" };
	let knownComponents = null;
	if (options.knownComponents !== void 0) knownComponents = options.knownComponents instanceof Set ? options.knownComponents : new Set(options.knownComponents);
	const sheetCache = withStylesheetPreload ? await preloadSheets() : null;
	const ua = snapshot ? createUaBaseline() : null;
	const ctx = {
		maxDepth,
		ua,
		counters: createCounters(),
		captureRoots: /* @__PURE__ */ new Set(),
		annotateGeometry: snapshot && (options.annotateGeometry ?? false),
		withFiber,
		knownComponents,
		withComputedStyles,
		withStyleHeuristics,
		sheetCache,
		skipSelector: options.skipSelector,
		nextId: createIdGen(),
		emittedComponentFibers: /* @__PURE__ */ new WeakSet()
	};
	const rootCS = window.getComputedStyle(root);
	const rootFlex = rootCS.display === "flex" || rootCS.display === "inline-flex" ? rootCS.flexDirection : void 0;
	let elements;
	try {
		if (includeRoot && (root !== document.body || snapshot)) {
			const captured = walkNode(root, 0, null, void 0, ctx);
			elements = captured ? [captured] : [];
		} else elements = walkChildren(root, 0, rootCS, rootFlex, ctx);
	} finally {
		ua?.dispose();
	}
	if (elements.length === 0) return { error: "no_elements" };
	let projectRoot = null;
	if (withFiber && !snapshot) {
		const sampleFiber = pickSampleFiber(elements);
		const [_, detected] = await Promise.all([resolveSourceInfoBatch(elements), detectProjectRoot(sampleFiber)]);
		projectRoot = detected;
	}
	if (options.canvasPosition) {
		const { x, y: startY } = options.canvasPosition;
		let y = startY;
		const rootChildren = Array.from(root.children);
		for (let i = 0; i < elements.length; i++) {
			const e = elements[i];
			if (!e) continue;
			e.canvasPosition = {
				x,
				y
			};
			const rect = rootChildren[i]?.getBoundingClientRect?.();
			y += (rect?.height ?? 200) + 40;
		}
	}
	let componentCount = 0;
	let elementCount = 0;
	const count = (els) => {
		for (const el of els) {
			elementCount++;
			if (el.type === "component") componentCount++;
			if (el.children) count(el.children);
		}
	};
	count(elements);
	return {
		elements,
		componentCount,
		elementCount,
		projectRoot
	};
}
/**
* Walk captured elements and return a fiber whose `_debugStack` is set.
* detectProjectRoot needs the stack to extract a Next chunk-URL frame; if
* we hand it a fiber without one, detection bails immediately. The first
* fiber we encounter (root captured element's host) often lacks _debugStack
* because it's rendered by Next/React internals — but fibers deeper in the
* tree typically have it. Falls back to any fiber if none has _debugStack.
*/
function pickSampleFiber(elements) {
	let firstAny = null;
	const visit = (nodes) => {
		for (const el of nodes) {
			const fiber = el._fiber;
			if (fiber) {
				if (!firstAny) firstAny = fiber;
				if (Se$1(fiber)) return fiber;
				if (fiber.alternate && Se$1(fiber.alternate)) return fiber.alternate;
			}
			const kids = el.children;
			if (kids) {
				const found = visit(kids);
				if (found) return found;
			}
		}
		return null;
	};
	return visit(elements) || firstAny;
}

export { runCapture };
