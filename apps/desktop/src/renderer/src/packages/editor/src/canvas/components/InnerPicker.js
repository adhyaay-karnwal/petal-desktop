// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/canvas/components/InnerPicker.tsx
import { import_jsx_runtime, import_react } from "../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../cloud/src/hooks/useSession.js";
import { getById } from "../../../../compiler/src/store/read.js";
import { subscribeCamera } from "../../shell/hooks/useCommentAgent.js";
import { canvasElementIdFor } from "../utils/canvasRegionSource.js";
import { runCapture } from "../lib/capture/runCapture.js";
import { usePages } from "../../shared/state/pages.js";
import { isTypingTarget } from "../../shared/shortcuts/matchShortcut.js";
import { isPrimaryModifier } from "../../shared/utils/platform.js";
import { useModifiers } from "../../shared/state/modifierKeys.js";
import { innerPickStore, useInnerPickState } from "../../shared/state/innerPickStore.js";
import { COMPONENT_PICK_COLOR, COMPONENT_PICK_OUTLINE, pickLabelStyle } from "../utils/pickOutline.js";
import { useSnapshotDrag } from "../utils/renderElement.js";
import { hasOpenLayer } from "../../shared/utils/mouseButtonPolicy.js";

/**
* Picking inside a component instance on the canvas (see innerPickStore):
* ⌘-hover/⌘-click reach the deepest element, ⇧⏎ climbs to its parent, Esc
* lets go, and ⌥-drag on the pick (or ⌘⌥-drag anywhere inside) snapshots
* the element onto the canvas. A plain click and a plain ⌥-drag (duplicate)
* stay the canvas's.
*
* A component's DOM lives in the editor document, so this is all host-side:
* hit-testing with `elementsFromPoint` scoped to the component's subtree,
* outlines drawn in the viewport, capture with the in-process engine.
*
* Perf: React renders when the store or a modifier changes. Hover, outlines
* and the drag are written straight to the DOM, at most once per frame, and
* follow pan/zoom through the camera channel.
*/
/** Editor chrome over the canvas — hit-testing looks through it, including the
*  canvas's own hover/selection overlays, which render inside the content when
*  the camera is not driving them. */
var CHROME$1 = "[data-inner-pick], [data-region-mask], [data-overlay-container], [data-canvas-bottom-chrome], [data-drag-overlay], [data-hover-outline-id], [data-selection-overlay-id], [data-selection-label-id], [data-parent-outline-id], [data-resize-handle]";
var DRAG_START_PX = 4;
/**
* Snapshot `el` onto the canvas with the Chrome extension's capture
* (`withoutHover` and BASE_RUN_OPTS in apps/chrome-extension/content.js): how
* it looks, component names as hints for the agent. The element is under the
* cursor, so a shield covers the page for two frames first and its :hover
* styles clear; that also lets the ghost paint before the capture walks the
* subtree on this thread.
*/
async function captureWithoutHover(el) {
	const shield = document.createElement("div");
	shield.setAttribute("data-inner-pick", "");
	shield.style.cssText = "position:fixed;inset:0;z-index:2147483647;background:transparent";
	document.body.appendChild(shield);
	try {
		await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
		const res = await runCapture({
			rootElement: el,
			includeRoot: true,
			snapshot: true,
			withFiber: true,
			maxDepth: 400,
			knownComponents: [],
			skipSelector: CHROME$1
		});
		return "elements" in res ? res.elements[0] ?? null : null;
	} catch {
		return null;
	} finally {
		shield.remove();
	}
}
/** Whether the mounted picker holds a press it took (⌥ on the pick, ⌘⌥ inside a component). */
var tookPress = () => false;
/** The canvas drags nothing from a press the picker took: the press is the snapshot's. */
function innerPickTookPress() {
	return tookPress();
}
function isComponentLayer(store, id) {
	return !!id && getById(store, id)?.type === "component";
}
/** Direct child of `parent` on the way down to `target`, or null when target is not inside. */
function childToward(parent, target) {
	let n = target;
	while (n && n.parentElement !== parent) n = n.parentElement;
	return n;
}
/** Child-index path from `root` down to `el`, to re-find the node after React remounts the subtree. */
function pathFrom(root, el) {
	const path = [];
	for (let n = el; n && n !== root; n = n.parentElement) {
		const parent = n.parentElement;
		if (!parent) return null;
		path.unshift(Array.prototype.indexOf.call(parent.children, n));
	}
	return path;
}
function resolvePath(root, path) {
	let n = root;
	for (const i of path) {
		n = n?.children[i] ?? null;
		if (!n) return null;
	}
	return n;
}
/** Nearest named React component rendering `el`, for the ghost/outline label. */
function componentNameOf(el) {
	const key = Object.keys(el).find((k) => k.startsWith("__reactFiber$"));
	let fiber = key ? el[key] : null;
	for (let hops = 0; fiber && hops < 12; hops++, fiber = fiber.return) {
		const t = fiber.type;
		if (t && typeof t !== "string") {
			const name = t.displayName || t.name || t.render?.displayName || t.render?.name;
			if (name) return name;
		}
	}
	return null;
}
function labelFor(el) {
	const r = el.getBoundingClientRect();
	return `${componentNameOf(el) ?? el.tagName.toLowerCase()}  ${Math.round(r.width)} × ${Math.round(r.height)}`;
}
function place$1(box, el, origin) {
	if (!box) return;
	if (!el) {
		box.style.display = "none";
		return;
	}
	const r = el.getBoundingClientRect();
	box.style.display = "block";
	box.style.transform = `translate(${Math.round(r.left - origin.left)}px, ${Math.round(r.top - origin.top)}px)`;
	box.style.width = `${Math.round(r.width)}px`;
	box.style.height = `${Math.round(r.height)}px`;
}
function InnerPicker(t0) {
	const $ = (0, import_compiler_runtime.c)(87);
	const { viewportRef, selectedElementIds, onSelectElement, onPlaceCapturedElement, onViewportPan, renderOptions, disabled: t1 } = t0;
	const disabled = t1 === void 0 ? false : t1;
	const store = usePages(_temp$94);
	const { inner, interactiveIds } = useInnerPickState();
	const mods = useModifiers();
	const engaged = inner?.kind === "component" ? inner : null;
	const live = mods.meta || !!engaged;
	const hoverRef = (0, import_react.useRef)(null);
	const selectedRef = (0, import_react.useRef)(null);
	const labelRef = (0, import_react.useRef)(null);
	const hoverElRef = (0, import_react.useRef)(null);
	const selectedElRef = (0, import_react.useRef)(null);
	const selectedPathRef = (0, import_react.useRef)(null);
	const drillRef = (0, import_react.useRef)(null);
	let t2;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t2 = {
			x: -1,
			y: -1
		};
		$[0] = t2;
	} else t2 = $[0];
	const pointerRef = (0, import_react.useRef)(t2);
	const hoverWantRef = (0, import_react.useRef)(null);
	const frameRef = (0, import_react.useRef)(0);
	const engagedRef = (0, import_react.useRef)(null);
	let t3;
	if ($[1] !== engaged) {
		t3 = () => {
			engagedRef.current = engaged;
		};
		$[1] = engaged;
		$[2] = t3;
	} else t3 = $[2];
	(0, import_react.useLayoutEffect)(t3);
	const pressRef = (0, import_react.useRef)(null);
	const selectRequestedRef = (0, import_react.useRef)(null);
	let t4;
	if ($[3] !== onPlaceCapturedElement) {
		t4 = onPlaceCapturedElement ? (el, at) => onPlaceCapturedElement(el, at) : void 0;
		$[3] = onPlaceCapturedElement;
		$[4] = t4;
	} else t4 = $[4];
	let t5;
	if ($[5] !== viewportRef) {
		t5 = () => viewportRef.current;
		$[5] = viewportRef;
		$[6] = t5;
	} else t5 = $[6];
	const drag = useSnapshotDrag({
		onPlace: t4,
		onViewportPan,
		viewportOf: t5,
		renderOptions,
		onEnd: () => {
			const layerId = pressRef.current?.layerId ?? innerPickStore.getState().inner?.layerId;
			selectedElRef.current = null;
			selectedPathRef.current = null;
			drillRef.current = null;
			if (layerId) innerPickStore.clear(layerId);
			schedulePaint();
		}
	});
	const storeRef = (0, import_react.useRef)(store);
	let t6;
	if ($[7] !== store) {
		t6 = () => {
			storeRef.current = store;
		};
		$[7] = store;
		$[8] = t6;
	} else t6 = $[8];
	(0, import_react.useLayoutEffect)(t6);
	let t7;
	if ($[9] !== viewportRef) {
		t7 = (x, y) => {
			const viewport = viewportRef.current;
			if (!viewport) return null;
			for (const el_0 of document.elementsFromPoint(x, y)) {
				if (el_0.closest(CHROME$1)) continue;
				if (!viewport.contains(el_0)) return null;
				const id = canvasElementIdFor(el_0);
				return isComponentLayer(storeRef.current, id) ? {
					el: el_0,
					layerId: id
				} : null;
			}
			return null;
		};
		$[9] = viewportRef;
		$[10] = t7;
	} else t7 = $[10];
	const targetAt = t7;
	const contentRootOf = _temp3$41;
	let t8;
	if ($[11] !== contentRootOf) {
		t8 = (target, layerId_1, deep) => {
			if (deep) return target;
			const root = contentRootOf(layerId_1);
			if (!root) return target;
			const drill = drillRef.current;
			return childToward(drill && drill.contains(target) ? drill : root, target) ?? childToward(root, target) ?? target;
		};
		$[11] = contentRootOf;
		$[12] = t8;
	} else t8 = $[12];
	const topmostFor = t8;
	let t9;
	if ($[13] !== contentRootOf || $[14] !== targetAt || $[15] !== topmostFor || $[16] !== viewportRef) {
		t9 = () => {
			frameRef.current = 0;
			const viewport_0 = viewportRef.current;
			if (!viewport_0) return;
			const origin = viewport_0.getBoundingClientRect();
			const picked = selectedElRef.current;
			if (picked && !picked.isConnected) {
				const p = selectedPathRef.current;
				const root_0 = p ? contentRootOf(p.layerId) : null;
				const again = root_0 && p ? resolvePath(root_0, p.path) : null;
				selectedElRef.current = again;
				if (again && p) {
					const r = again.getBoundingClientRect();
					innerPickStore.setHit(p.layerId, "component", {
						left: r.left,
						top: r.top,
						width: r.width,
						height: r.height
					});
				} else if (p) innerPickStore.clear(p.layerId);
			}
			const want = hoverWantRef.current;
			if (want) {
				const t = targetAt(pointerRef.current.x, pointerRef.current.y);
				const allowed = t && (want.any || engagedRef.current?.layerId === t.layerId);
				hoverElRef.current = allowed ? topmostFor(t.el, t.layerId, want.deep) : null;
			}
			place$1(selectedRef.current, selectedElRef.current, origin);
			const label = labelRef.current;
			if (label && selectedElRef.current) {
				const r_0 = selectedElRef.current.getBoundingClientRect();
				label.style.display = "block";
				label.textContent = labelFor(selectedElRef.current);
				label.style.transform = `translate(${Math.round(Math.max(0, r_0.left - origin.left))}px, ${Math.round(r_0.top - origin.top) - 1}px) translateY(-100%)`;
			} else if (label) label.style.display = "none";
			const hover = hoverElRef.current;
			place$1(hoverRef.current, hover && hover !== selectedElRef.current ? hover : null, origin);
		};
		$[13] = contentRootOf;
		$[14] = targetAt;
		$[15] = topmostFor;
		$[16] = viewportRef;
		$[17] = t9;
	} else t9 = $[17];
	const paint = t9;
	let t10;
	if ($[18] !== paint) {
		t10 = () => {
			if (!frameRef.current) frameRef.current = requestAnimationFrame(paint);
		};
		$[18] = paint;
		$[19] = t10;
	} else t10 = $[19];
	const schedulePaint = t10;
	let t11;
	if ($[20] !== contentRootOf || $[21] !== onSelectElement || $[22] !== schedulePaint || $[23] !== selectedElementIds) {
		t11 = (el_2, layerId_2) => {
			selectedElRef.current = el_2;
			const root_1 = el_2 ? contentRootOf(layerId_2) : null;
			const path = el_2 && root_1 ? pathFrom(root_1, el_2) : null;
			selectedPathRef.current = path ? {
				layerId: layerId_2,
				path
			} : null;
			if (!el_2) innerPickStore.clear(layerId_2);
			else {
				const r_1 = el_2.getBoundingClientRect();
				innerPickStore.setHit(layerId_2, "component", {
					left: r_1.left,
					top: r_1.top,
					width: r_1.width,
					height: r_1.height
				});
				if (!selectedElementIds.has(layerId_2)) {
					selectRequestedRef.current = layerId_2;
					onSelectElement?.(layerId_2);
				}
			}
			schedulePaint();
		};
		$[20] = contentRootOf;
		$[21] = onSelectElement;
		$[22] = schedulePaint;
		$[23] = selectedElementIds;
		$[24] = t11;
	} else t11 = $[24];
	const select = t11;
	let t12;
	if ($[25] !== disabled || $[26] !== live || $[27] !== schedulePaint) {
		t12 = (e) => {
			pointerRef.current = {
				x: e.clientX,
				y: e.clientY
			};
			if (!live || disabled || e.buttons !== 0 && !pressRef.current || e.target instanceof Element && e.target.closest("[data-region-mask]")) {
				if (!hoverWantRef.current && !hoverElRef.current) return;
				hoverWantRef.current = null;
				hoverElRef.current = null;
				schedulePaint();
				return;
			}
			const deep_0 = isPrimaryModifier(e);
			hoverWantRef.current = {
				deep: deep_0,
				any: deep_0
			};
			schedulePaint();
		};
		$[25] = disabled;
		$[26] = live;
		$[27] = schedulePaint;
		$[28] = t12;
	} else t12 = $[28];
	const onPointerMove = (0, import_react.useEffectEvent)(t12);
	let t13;
	if ($[29] !== disabled || $[30] !== select || $[31] !== targetAt) {
		t13 = (e_0) => {
			if (disabled || e_0.target instanceof Element && e_0.target.closest("[data-region-mask]")) return;
			if (e_0.button !== 0 || e_0.shiftKey) return;
			if (pressRef.current) {
				pressRef.current = null;
				e_0.preventDefault();
				e_0.stopPropagation();
				return;
			}
			if (!isPrimaryModifier(e_0)) return;
			const t_0 = targetAt(e_0.clientX, e_0.clientY);
			if (!t_0) return;
			e_0.preventDefault();
			e_0.stopPropagation();
			drillRef.current = t_0.el.parentElement;
			select(t_0.el, t_0.layerId);
		};
		$[29] = disabled;
		$[30] = select;
		$[31] = targetAt;
		$[32] = t13;
	} else t13 = $[32];
	const onClick = (0, import_react.useEffectEvent)(t13);
	let t14;
	if ($[33] !== disabled || $[34] !== engaged?.layerId || $[35] !== targetAt) {
		t14 = (e_1) => {
			pressRef.current = null;
			if (disabled || e_1.target instanceof Element && e_1.target.closest("[data-region-mask]")) return;
			if (e_1.button !== 0 || !e_1.altKey) return;
			const t_1 = targetAt(e_1.clientX, e_1.clientY);
			if (!t_1) return;
			const selected = selectedElRef.current;
			const onPick = !!selected && engaged?.layerId === t_1.layerId && selected.contains(t_1.el);
			if (!onPick && !isPrimaryModifier(e_1)) return;
			e_1.stopPropagation();
			const el_3 = onPick ? selected : t_1.el;
			pressRef.current = {
				x: e_1.clientX,
				y: e_1.clientY,
				el: el_3,
				layerId: t_1.layerId,
				started: false
			};
		};
		$[33] = disabled;
		$[34] = engaged?.layerId;
		$[35] = targetAt;
		$[36] = t14;
	} else t14 = $[36];
	const onPointerDown = (0, import_react.useEffectEvent)(t14);
	let t15;
	if ($[37] !== drag) {
		t15 = (e_2) => {
			const press = pressRef.current;
			if (!press || press.started) return;
			if (Math.hypot(e_2.clientX - press.x, e_2.clientY - press.y) < DRAG_START_PX) return;
			press.started = true;
			const r_2 = press.el.getBoundingClientRect();
			drag.start({
				clientX: e_2.clientX,
				clientY: e_2.clientY,
				box: {
					left: r_2.left,
					top: r_2.top,
					width: r_2.width,
					height: r_2.height
				},
				label: labelFor(press.el),
				payload: captureWithoutHover(press.el)
			});
		};
		$[37] = drag;
		$[38] = t15;
	} else t15 = $[38];
	const onPressMove = (0, import_react.useEffectEvent)(t15);
	let t16;
	if ($[39] === Symbol.for("react.memo_cache_sentinel")) {
		t16 = () => {
			if (pressRef.current && !pressRef.current.started) pressRef.current = null;
		};
		$[39] = t16;
	} else t16 = $[39];
	const onPointerUp = (0, import_react.useEffectEvent)(t16);
	let t17;
	if ($[40] !== drag) {
		t17 = () => {
			pressRef.current = null;
			drag.cancel();
		};
		$[40] = drag;
		$[41] = t17;
	} else t17 = $[41];
	const cancelPress = (0, import_react.useEffectEvent)(t17);
	let t18;
	if ($[42] !== contentRootOf || $[43] !== engaged || $[44] !== select) {
		t18 = (e_3) => {
			if (!engaged || isTypingTarget(e_3)) return;
			if (e_3.key === "Escape") {
				if (hasOpenLayer()) return;
				e_3.preventDefault();
				e_3.stopPropagation();
				drillRef.current = null;
				select(null, engaged.layerId);
				return;
			}
			if (e_3.key !== "Enter" || !e_3.shiftKey) return;
			const selected_0 = selectedElRef.current;
			const root_2 = contentRootOf(engaged.layerId);
			const parent_0 = selected_0?.parentElement;
			if (!selected_0 || !parent_0 || !root_2 || selected_0 === root_2 || parent_0 === root_2 || !root_2.contains(parent_0)) return;
			e_3.preventDefault();
			e_3.stopPropagation();
			drillRef.current = parent_0.parentElement;
			select(parent_0, engaged.layerId);
		};
		$[42] = contentRootOf;
		$[43] = engaged;
		$[44] = select;
		$[45] = t18;
	} else t18 = $[45];
	const onKeyDown = (0, import_react.useEffectEvent)(t18);
	let t19;
	if ($[46] !== cancelPress || $[47] !== onClick || $[48] !== onKeyDown || $[49] !== onPointerDown || $[50] !== onPointerMove || $[51] !== onPointerUp || $[52] !== onPressMove) {
		t19 = () => {
			const took = () => !!pressRef.current;
			tookPress = took;
			const move = (e_4) => {
				onPointerMove(e_4);
				onPressMove(e_4);
			};
			window.addEventListener("pointermove", move, {
				capture: true,
				passive: true
			});
			window.addEventListener("pointerdown", onPointerDown, true);
			window.addEventListener("pointerup", onPointerUp, true);
			window.addEventListener("click", onClick, true);
			window.addEventListener("keydown", onKeyDown, true);
			window.addEventListener("pointercancel", cancelPress);
			window.addEventListener("blur", cancelPress);
			return () => {
				window.removeEventListener("pointermove", move, true);
				window.removeEventListener("pointerdown", onPointerDown, true);
				window.removeEventListener("pointerup", onPointerUp, true);
				window.removeEventListener("click", onClick, true);
				window.removeEventListener("keydown", onKeyDown, true);
				window.removeEventListener("pointercancel", cancelPress);
				window.removeEventListener("blur", cancelPress);
				if (tookPress === took) tookPress = _temp4$35;
				if (innerPickStore.getState().inner?.kind === "component") innerPickStore.clear();
			};
		};
		$[46] = cancelPress;
		$[47] = onClick;
		$[48] = onKeyDown;
		$[49] = onPointerDown;
		$[50] = onPointerMove;
		$[51] = onPointerUp;
		$[52] = onPressMove;
		$[53] = t19;
	} else t19 = $[53];
	let t20;
	if ($[54] === Symbol.for("react.memo_cache_sentinel")) {
		t20 = [];
		$[54] = t20;
	} else t20 = $[54];
	(0, import_react.useEffect)(t19, t20);
	let t21;
	if ($[55] !== engaged || $[56] !== schedulePaint || $[57] !== selectedElementIds || $[58] !== store) {
		t21 = () => {
			if (engaged && selectedElementIds.has(engaged.layerId)) selectRequestedRef.current = null;
			const awaitingSelection = !!engaged && selectRequestedRef.current === engaged.layerId;
			if (!engaged || !selectedElementIds.has(engaged.layerId) && !awaitingSelection || !isComponentLayer(store, engaged.layerId)) {
				selectedElRef.current = null;
				drillRef.current = null;
				if (engaged) innerPickStore.clear(engaged.layerId);
			}
			schedulePaint();
		};
		$[55] = engaged;
		$[56] = schedulePaint;
		$[57] = selectedElementIds;
		$[58] = store;
		$[59] = t21;
	} else t21 = $[59];
	(0, import_react.useLayoutEffect)(t21);
	let t22;
	let t23;
	if ($[60] !== engaged) {
		t22 = () => {
			if (!engaged) return;
			return innerPickStore.registerHitResolver(engaged.layerId, () => {
				const el_4 = selectedElRef.current;
				if (!el_4 || !el_4.isConnected) return null;
				const r_3 = el_4.getBoundingClientRect();
				return {
					left: r_3.left,
					top: r_3.top,
					width: r_3.width,
					height: r_3.height
				};
			});
		};
		t23 = [engaged];
		$[60] = engaged;
		$[61] = t22;
		$[62] = t23;
	} else {
		t22 = $[61];
		t23 = $[62];
	}
	(0, import_react.useEffect)(t22, t23);
	let t24;
	if ($[63] !== disabled || $[64] !== live || $[65] !== mods.meta || $[66] !== schedulePaint) {
		t24 = () => {
			if (!live || !mods.meta || disabled) {
				hoverWantRef.current = null;
				hoverElRef.current = null;
			}
			schedulePaint();
		};
		$[63] = disabled;
		$[64] = live;
		$[65] = mods.meta;
		$[66] = schedulePaint;
		$[67] = t24;
	} else t24 = $[67];
	let t25;
	if ($[68] !== disabled || $[69] !== live || $[70] !== mods.meta || $[71] !== schedulePaint) {
		t25 = [
			live,
			mods.meta,
			disabled,
			schedulePaint
		];
		$[68] = disabled;
		$[69] = live;
		$[70] = mods.meta;
		$[71] = schedulePaint;
		$[72] = t25;
	} else t25 = $[72];
	(0, import_react.useEffect)(t24, t25);
	let t26;
	let t27;
	if ($[73] !== interactiveIds || $[74] !== store) {
		t26 = () => {
			for (const id_0 of interactiveIds) if (!isComponentLayer(store, id_0)) innerPickStore.setInteractive(id_0, false);
		};
		t27 = [store, interactiveIds];
		$[73] = interactiveIds;
		$[74] = store;
		$[75] = t26;
		$[76] = t27;
	} else {
		t26 = $[75];
		t27 = $[76];
	}
	(0, import_react.useEffect)(t26, t27);
	let t28;
	if ($[77] !== schedulePaint) {
		t28 = () => {
			const unsubscribe = subscribeCamera(() => {
				if (selectedElRef.current || hoverElRef.current) schedulePaint();
			});
			return () => {
				unsubscribe();
				if (frameRef.current) cancelAnimationFrame(frameRef.current);
				frameRef.current = 0;
			};
		};
		$[77] = schedulePaint;
		$[78] = t28;
	} else t28 = $[78];
	let t29;
	if ($[79] !== schedulePaint) {
		t29 = [schedulePaint];
		$[79] = schedulePaint;
		$[80] = t29;
	} else t29 = $[80];
	(0, import_react.useLayoutEffect)(t28, t29);
	let t30;
	if ($[81] === Symbol.for("react.memo_cache_sentinel")) {
		t30 = {
			position: "absolute",
			inset: 0,
			zIndex: 60,
			pointerEvents: "none"
		};
		$[81] = t30;
	} else t30 = $[81];
	let t31;
	if ($[82] === Symbol.for("react.memo_cache_sentinel")) {
		t31 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			ref: hoverRef,
			style: {
				position: "absolute",
				left: 0,
				top: 0,
				display: "none",
				outline: COMPONENT_PICK_OUTLINE,
				willChange: "transform"
			}
		});
		$[82] = t31;
	} else t31 = $[82];
	let t32;
	if ($[83] === Symbol.for("react.memo_cache_sentinel")) {
		t32 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			ref: selectedRef,
			style: {
				position: "absolute",
				left: 0,
				top: 0,
				display: "none",
				outline: COMPONENT_PICK_OUTLINE,
				willChange: "transform"
			}
		});
		$[83] = t32;
	} else t32 = $[83];
	let t33;
	if ($[84] === Symbol.for("react.memo_cache_sentinel")) {
		t33 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			"data-inner-pick": "",
			style: t30,
			children: [
				t31,
				t32,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					ref: labelRef,
					style: {
						...pickLabelStyle,
						color: COMPONENT_PICK_COLOR,
						position: "absolute",
						left: 0,
						top: 0,
						display: "none"
					}
				})
			]
		});
		$[84] = t33;
	} else t33 = $[84];
	let t34;
	if ($[85] !== drag.ghost) {
		t34 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [t33, drag.ghost] });
		$[85] = drag.ghost;
		$[86] = t34;
	} else t34 = $[86];
	return t34;
}
function _temp4$35() {
	return false;
}
function _temp3$41(layerId_0) {
	let el_1 = document.querySelector(`[data-element-id="${CSS.escape(layerId_0)}"]`);
	for (let d = 0; el_1 && d < 8; d++) {
		const kids = Array.from(el_1.children).filter(_temp2$59);
		if (kids.length !== 1) break;
		el_1 = kids[0];
	}
	return el_1;
}
function _temp2$59(c) {
	return !c.closest(CHROME$1);
}
function _temp$94(s) {
	return s.visibleTree;
}

export { InnerPicker, innerPickTookPress };
