// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/canvas/hooks/useResizing.tsx
import { import_react } from "../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../cloud/src/hooks/useSession.js";
import { getById, getParentId } from "../../../../compiler/src/store/read.js";
import { getCamera } from "../../shell/hooks/useCommentAgent.js";
import { resolveVisibleElement$1 } from "../../shared/utils/visibleElement.js";
import { removeScaleAnchorTransform, scaleFactorForDrag, scaleTransformAtHandle, scaleTransformAtPoint } from "../../shared/utils/scaleTransform.js";
import { IDENTITY_LINEAR, accumulatedLinearTransform, invertLinear, linearFromTransform, multiplyLinear, relativeTranslationMatrix } from "../utils/transformMatrix.js";
import { applyScalePivot } from "../../shared/utils/scalePivot.js";
import { usePages } from "../../shared/state/pages.js";
import { parseTransformControls, topEdgeOfRotatedBox, withTransformFlips } from "../../shared/utils/transformControls.js";
import { capSelectionLabel } from "../components/CanvasOverlays.js";
import { NO_SNAP_MEMORY, computeResizeSnap } from "../utils/snapping.js";
import { companionGeometry } from "../utils/multiResize.js";

function readScaleStart(node, element, preservePosition = true) {
	const computed = window.getComputedStyle(node);
	const computedPosition = computed.position;
	preservePosition ||= computedPosition === "absolute" || computedPosition === "fixed";
	const [x, y] = computed.transformOrigin.split(" ").map(parseFloat);
	const rect = node.getBoundingClientRect();
	const originalMatrix = new DOMMatrix(computed.transform);
	const authored = element?.styles?.transform || computed.transform;
	const transform = removeScaleAnchorTransform(authored, element?.scaleAnchorTransform);
	let legacyTranslation = {
		x: 0,
		y: 0
	};
	if (transform !== authored && element?.scaleAnchorTransform) {
		const previous = node.style.transform;
		node.style.transform = transform;
		const clean = new DOMMatrix(getComputedStyle(node).transform);
		legacyTranslation = {
			x: originalMatrix.e - clean.e,
			y: originalMatrix.f - clean.f
		};
		node.style.transform = previous;
	}
	let positionResetDelta = {
		x: 0,
		y: 0
	};
	if (!preservePosition && element?.scalePivot) {
		const restored = applyScalePivot(element.styles ?? {}, element.scalePivot, computedPosition, {
			transform,
			transformOrigin: computed.transformOrigin,
			positionDelta: {
				x: 0,
				y: 0
			}
		}, false).styles;
		const cssText = node.style.cssText;
		try {
			node.style.setProperty("transition", "none", "important");
			for (const key of [
				"position",
				"left",
				"right",
				"top",
				"bottom"
			]) {
				const value = restored[key];
				node.style[key] = typeof value === "number" ? `${value}px` : value ?? "";
			}
			const after = node.getBoundingClientRect();
			const inverse = invertLinear(node.parentElement ? accumulatedLinearTransform(node.parentElement) : IDENTITY_LINEAR);
			const zoom = getCamera().scale || 1;
			const dx = (after.x - rect.x) / zoom, dy = (after.y - rect.y) / zoom;
			positionResetDelta = {
				x: inverse.a * dx + inverse.c * dy,
				y: inverse.b * dx + inverse.d * dy
			};
		} finally {
			node.style.cssText = cssText;
		}
	}
	return {
		screenCenter: {
			x: rect.x + rect.width / 2,
			y: rect.y + rect.height / 2
		},
		accumulated: accumulatedLinearTransform(node),
		transform,
		styles: element?.styles ?? {},
		pivot: element?.scalePivot,
		computedPosition,
		preservePosition,
		positionResetDelta,
		legacyTranslation,
		linear: {
			a: originalMatrix.a,
			b: originalMatrix.b,
			c: originalMatrix.c,
			d: originalMatrix.d
		},
		origin: {
			x,
			y
		}
	};
}
function previewScale(node, start, scaled) {
	const update = applyScalePivot(start.styles, start.pivot, start.computedPosition, {
		...scaled,
		positionDelta: {
			x: scaled.positionDelta.x + start.legacyTranslation.x,
			y: scaled.positionDelta.y + start.legacyTranslation.y
		}
	}, start.preservePosition);
	node.style.transform = update.styles.transform || "";
	node.style.transformOrigin = String(update.styles.transformOrigin || "");
	for (const key of [
		"position",
		"left",
		"right",
		"top",
		"bottom"
	]) {
		const value = update.styles[key];
		node.style[key] = typeof value === "number" ? `${value}px` : value ?? "";
	}
	return update;
}
function useResizing(t0) {
	const $ = (0, import_compiler_runtime.c)(27);
	const { setResizing, onResizeElement, getSnapTargets, selectedElementIds, scaleMode: t1, scaleAspectLocked: t2, onScaleElements, onCancelScale } = t0;
	const scaleMode = t1 === void 0 ? false : t1;
	const scaleAspectLocked = t2 === void 0 ? true : t2;
	let t3;
	if ($[0] !== onCancelScale || $[1] !== onResizeElement || $[2] !== onScaleElements || $[3] !== scaleAspectLocked) {
		t3 = {
			scaleAspectLocked,
			onCancelScale,
			onScaleElements,
			onResizeElement
		};
		$[0] = onCancelScale;
		$[1] = onResizeElement;
		$[2] = onScaleElements;
		$[3] = scaleAspectLocked;
		$[4] = t3;
	} else t3 = $[4];
	const latestRef = (0, import_react.useRef)(t3);
	let t4;
	if ($[5] !== onCancelScale || $[6] !== onResizeElement || $[7] !== onScaleElements || $[8] !== scaleAspectLocked) {
		t4 = () => {
			latestRef.current = {
				scaleAspectLocked,
				onCancelScale,
				onScaleElements,
				onResizeElement
			};
		};
		$[5] = onCancelScale;
		$[6] = onResizeElement;
		$[7] = onScaleElements;
		$[8] = scaleAspectLocked;
		$[9] = t4;
	} else t4 = $[9];
	(0, import_react.useLayoutEffect)(t4);
	const previewRef = (0, import_react.useRef)(null);
	const startRef = (0, import_react.useRef)(null);
	const resizePreviewRectRef = (0, import_react.useRef)(null);
	let t5;
	if ($[10] === Symbol.for("react.memo_cache_sentinel")) {
		t5 = [];
		$[10] = t5;
	} else t5 = $[10];
	const [resizeSnapGuides, setResizeSnapGuides] = (0, import_react.useState)(t5);
	let t6;
	if ($[11] === Symbol.for("react.memo_cache_sentinel")) {
		t6 = (guides) => {
			setResizeSnapGuides((prev) => {
				if (prev.length === guides.length && prev.every((g, i) => g.axis === guides[i].axis && g.pos === guides[i].pos && g.spanStart === guides[i].spanStart && g.spanEnd === guides[i].spanEnd)) return prev;
				return guides;
			});
		};
		$[11] = t6;
	} else t6 = $[11];
	const commitResizeGuides = t6;
	let startResize;
	if ($[12] !== getSnapTargets || $[13] !== scaleMode || $[14] !== selectedElementIds || $[15] !== setResizing) {
		startResize = (id, handle, element, x, y) => {
			const docTree = usePages.getState().tree;
			if (scaleMode && selectedElementIds) {
				let parent = getParentId(docTree, id);
				while (parent && parent !== "ROOT") {
					if (selectedElementIds.has(parent)) {
						const ancestor = getById(docTree, parent);
						if (ancestor) startResize(parent, handle, ancestor, x, y);
						return;
					}
					parent = getParentId(docTree, parent);
				}
			}
			const rawDomElement = document.querySelector(`[data-element-id="${CSS.escape(id)}"]`);
			const domElement = rawDomElement ? resolveVisibleElement$1(rawDomElement) : null;
			const rect = domElement?.getBoundingClientRect() || {
				width: 100,
				height: 100
			};
			const scale = getCamera().scale || 1;
			const currentWidth = !scaleMode && element.type === "html" && typeof element.styles?.width === "number" ? element.styles?.width : domElement?.offsetWidth || rect.width / scale;
			const currentHeight = !scaleMode && element.type === "html" && typeof element.styles?.height === "number" ? element.styles?.height : domElement?.offsetHeight || rect.height / scale;
			const accumulatedLinear = domElement ? accumulatedLinearTransform(domElement) : IDENTITY_LINEAR;
			const ownLinear = domElement ? linearFromTransform(window.getComputedStyle(domElement).transform) : IDENTITY_LINEAR;
			const relativeTranslation = relativeTranslationMatrix(element.styles?.transform);
			if (domElement) {
				const [ox, oy] = getComputedStyle(domElement).transformOrigin.split(" ").map(parseFloat);
				const rx = ox / currentWidth - .5;
				const ry = oy / currentHeight - .5;
				relativeTranslation.a = relativeTranslation.a + (1 - ownLinear.a) * rx;
				relativeTranslation.b = relativeTranslation.b - ownLinear.b * rx;
				relativeTranslation.c = relativeTranslation.c - ownLinear.c * ry;
				relativeTranslation.d = relativeTranslation.d + (1 - ownLinear.d) * ry;
			}
			const transformParts = parseTransformControls(element.styles?.transform);
			const overlayElement = document.querySelector(`[data-selection-overlay-id="${CSS.escape(id)}"]`);
			const overlayLeft = overlayElement ? parseFloat(overlayElement.style.left) || 0 : 0;
			const overlayTop = overlayElement ? parseFloat(overlayElement.style.top) || 0 : 0;
			const overlayWidth = overlayElement ? parseFloat(overlayElement.style.width) || rect.width : rect.width;
			const overlayHeight = overlayElement ? parseFloat(overlayElement.style.height) || rect.height : rect.height;
			const isAxisAligned = Math.abs(ownLinear.a - 1) < .001 && Math.abs(ownLinear.d - 1) < .001 && Math.abs(ownLinear.b) < .001 && Math.abs(ownLinear.c) < .001;
			const snapTargets = !scaleMode && isAxisAligned && getSnapTargets ? getSnapTargets(id) : null;
			const companions = [];
			if (selectedElementIds && selectedElementIds.size > 1) for (const otherId of selectedElementIds) {
				if (otherId === id) continue;
				if (scaleMode) {
					let parent_0 = getParentId(docTree, otherId);
					while (parent_0 && parent_0 !== "ROOT" && !selectedElementIds.has(parent_0)) parent_0 = getParentId(docTree, parent_0);
					if (parent_0 && parent_0 !== "ROOT") continue;
				}
				const raw = document.querySelector(`[data-element-id="${CSS.escape(otherId)}"]`);
				const node = raw ? resolveVisibleElement$1(raw) : null;
				if (!node) continue;
				const position = window.getComputedStyle(node).position;
				companions.push({
					id: otherId,
					scaleStart: scaleMode ? readScaleStart(node, getById(docTree, otherId)) : void 0,
					domElement: node,
					overlayElement: document.querySelector(`[data-selection-overlay-id="${CSS.escape(otherId)}"]`),
					positioned: position === "absolute" || position === "fixed",
					start: {
						width: node.offsetWidth,
						height: node.offsetHeight,
						left: node.offsetLeft,
						top: node.offsetTop
					},
					final: null
				});
			}
			for (const companion of companions) {
				const overlay = companion.overlayElement;
				if (overlay) companion.overlayRect = {
					left: parseFloat(overlay.style.left),
					top: parseFloat(overlay.style.top),
					width: parseFloat(overlay.style.width),
					height: parseFloat(overlay.style.height)
				};
			}
			previewRef.current = domElement ? {
				domElement,
				relativeTranslation,
				scaleStart: scaleMode ? readScaleStart(domElement, element, companions.length > 0 || !getParentId(docTree, id) || getParentId(docTree, id) === "ROOT") : void 0,
				companions,
				rootWrapper: document.querySelector(`[data-canvas-root-id="${CSS.escape(id)}"]`),
				overlayElement,
				labelElement: document.querySelector(`[data-selection-label-id="${CSS.escape(id)}"]`),
				startOverlayCenterX: overlayLeft + overlayWidth / 2,
				startOverlayCenterY: overlayTop + overlayHeight / 2,
				parentLinear: multiplyLinear(accumulatedLinear, invertLinear(ownLinear)),
				scale,
				finalSize: null,
				finalPosition: null,
				startScreenRect: {
					left: rect.left ?? 0,
					top: rect.top ?? 0,
					width: rect.width,
					height: rect.height
				},
				isAxisAligned,
				snapTargets,
				snapMemory: NO_SNAP_MEMORY,
				transformParts,
				startFlipX: transformParts.flipX,
				startFlipY: transformParts.flipY,
				finalTransform: null,
				flipChanged: false,
				startOverlayTransform: overlayElement?.style.transform || "",
				startOverlayWidth: overlayWidth,
				startOverlayHeight: overlayHeight,
				aspectGuide: null,
				aspectGuideLine: null,
				guideAntiDiagonal: handle === "ne" || handle === "sw"
			} : null;
			if (previewRef.current) {
				const preview = previewRef.current;
				preview.originalStyles = [
					preview.domElement,
					preview.overlayElement,
					preview.labelElement,
					preview.scaleStart ? null : preview.rootWrapper,
					...companions.flatMap(_temp$96)
				].flatMap(_temp2$60);
			}
			let aspectRatio;
			if (element.type === "html" && element.tag === "img" && currentWidth > 0 && currentHeight > 0) aspectRatio = currentWidth / currentHeight;
			const start = {
				id,
				handle,
				startX: x,
				startY: y,
				startWidth: currentWidth,
				startHeight: currentHeight,
				startLeft: "canvasPosition" in element && element.canvasPosition?.x || 0,
				startTop: "canvasPosition" in element && element.canvasPosition?.y || 0,
				inverseLinear: invertLinear(accumulatedLinear),
				ownLinear,
				aspectRatio
			};
			startRef.current = start;
			setResizing(start);
		};
		$[12] = getSnapTargets;
		$[13] = scaleMode;
		$[14] = selectedElementIds;
		$[15] = setResizing;
		$[16] = startResize;
	} else startResize = $[16];
	const rafRef = (0, import_react.useRef)(null);
	const latestPointerRef = (0, import_react.useRef)(null);
	const cmdPressedRef = (0, import_react.useRef)(false);
	const symmetricRef = (0, import_react.useRef)(false);
	const shiftPressedRef = (0, import_react.useRef)(false);
	let t7;
	if ($[17] === Symbol.for("react.memo_cache_sentinel")) {
		t7 = () => {
			rafRef.current = null;
			const e = latestPointerRef.current;
			const resizing = startRef.current;
			if (!e || !resizing) return;
			const symmetric = symmetricRef.current;
			let rawDeltaX = e.clientX - resizing.startX;
			let rawDeltaY = e.clientY - resizing.startY;
			const snapPreview = previewRef.current;
			let guides_0 = [];
			if (snapPreview && snapPreview.isAxisAligned && snapPreview.snapTargets && !cmdPressedRef.current && !symmetric) {
				const ssr = snapPreview.startScreenRect;
				const moving = {};
				if (resizing.handle.includes("e")) moving.x = "right";
				else if (resizing.handle.includes("w")) moving.x = "left";
				if (resizing.handle.includes("s")) moving.y = "bottom";
				else if (resizing.handle.includes("n")) moving.y = "top";
				let left = ssr.left;
				let top = ssr.top;
				let width = ssr.width;
				let height = ssr.height;
				if (moving.x === "right") width = ssr.width + rawDeltaX;
				else if (moving.x === "left") {
					left = ssr.left + rawDeltaX;
					width = ssr.width - rawDeltaX;
				}
				if (moving.y === "bottom") height = ssr.height + rawDeltaY;
				else if (moving.y === "top") {
					top = ssr.top + rawDeltaY;
					height = ssr.height - rawDeltaY;
				}
				const snap = computeResizeSnap({
					left,
					top,
					width,
					height
				}, moving, snapPreview.snapTargets, void 0, snapPreview.snapMemory);
				snapPreview.snapMemory = snap.memory;
				rawDeltaX = rawDeltaX + snap.dx;
				rawDeltaY = rawDeltaY + snap.dy;
				guides_0 = [...snap.guidesV.map(_temp3$42), ...snap.guidesH.map(_temp4$36)];
			}
			commitResizeGuides(guides_0);
			const scale_0 = getCamera().scale || 1;
			const screenDeltaX = rawDeltaX / scale_0;
			const screenDeltaY = rawDeltaY / scale_0;
			const inverse = resizing.inverseLinear ?? IDENTITY_LINEAR;
			const deltaX = inverse.a * screenDeltaX + inverse.c * screenDeltaY;
			const deltaY = inverse.b * screenDeltaX + inverse.d * screenDeltaY;
			let newLeft = resizing.startLeft;
			let newTop = resizing.startTop;
			let signedWidth = resizing.startWidth;
			let signedHeight = resizing.startHeight;
			const sizeFactor = symmetric ? 2 : 1;
			if (resizing.handle.includes("e")) signedWidth = resizing.startWidth + deltaX * sizeFactor;
			else if (resizing.handle.includes("w")) signedWidth = resizing.startWidth - deltaX * sizeFactor;
			if (resizing.handle.includes("s")) signedHeight = resizing.startHeight + deltaY * sizeFactor;
			else if (resizing.handle.includes("n")) signedHeight = resizing.startHeight - deltaY * sizeFactor;
			let flippedX = signedWidth < 0;
			let flippedY = signedHeight < 0;
			let newWidth = Math.abs(signedWidth);
			let newHeight = Math.abs(signedHeight);
			const startAr = resizing.startHeight > 0 ? resizing.startWidth / resizing.startHeight : void 0;
			const shiftHeld = shiftPressedRef.current;
			const scaling = previewRef.current?.scaleStart;
			const lockAspect = scaling ? latestRef.current.scaleAspectLocked !== shiftHeld : !!startAr && (shiftHeld || !!resizing.aspectRatio && !cmdPressedRef.current);
			if (scaling) {
				const factor = scaleFactorForDrag(resizing.startWidth, resizing.startHeight, resizing.handle, deltaX, deltaY, symmetric);
				newWidth = resizing.startWidth * (lockAspect ? factor : Math.max(.01, signedWidth / resizing.startWidth));
				newHeight = resizing.startHeight * (lockAspect ? factor : Math.max(.01, signedHeight / resizing.startHeight));
				flippedX = false;
				flippedY = false;
			} else if (lockAspect && startAr) {
				let scale_1 = Math.max(newWidth / resizing.startWidth, newHeight / resizing.startHeight);
				scale_1 = Math.max(scale_1, 50 / resizing.startWidth, 30 / resizing.startHeight);
				newWidth = resizing.startWidth * scale_1;
				newHeight = resizing.startHeight * scale_1;
			} else {
				newWidth = Math.max(50, newWidth);
				newHeight = Math.max(30, newHeight);
			}
			const A = resizing.ownLinear ?? IDENTITY_LINEAR;
			const sx = flippedX ? -1 : 1;
			const sy = flippedY ? -1 : 1;
			const Ap = {
				a: A.a * sx,
				b: A.b * sx,
				c: A.c * sy,
				d: A.d * sy
			};
			const oaX = symmetric || !!scaling && !/[ew]/.test(resizing.handle) ? 0 : resizing.handle.includes("w") ? resizing.startWidth / 2 : -resizing.startWidth / 2;
			const oaY = symmetric || !!scaling && !/[ns]/.test(resizing.handle) ? 0 : resizing.handle.includes("n") ? resizing.startHeight / 2 : -resizing.startHeight / 2;
			const naX = symmetric || !!scaling && !/[ew]/.test(resizing.handle) ? 0 : resizing.handle.includes("w") ? newWidth / 2 : -newWidth / 2;
			const naY = symmetric || !!scaling && !/[ns]/.test(resizing.handle) ? 0 : resizing.handle.includes("n") ? newHeight / 2 : -newHeight / 2;
			const dispX = A.a * oaX + A.c * oaY - (Ap.a * naX + Ap.c * naY);
			const dispY = A.b * oaX + A.d * oaY - (Ap.b * naX + Ap.d * naY);
			newLeft = newLeft + ((resizing.startWidth - newWidth) / 2 + dispX);
			newTop = newTop + ((resizing.startHeight - newHeight) / 2 + dispY);
			const preview_0 = previewRef.current;
			const relative = !scaling ? preview_0?.relativeTranslation : void 0;
			const dw = newWidth - resizing.startWidth;
			const dh = newHeight - resizing.startHeight;
			const translateDeltaX = relative ? relative.a * dw + relative.c * dh : 0;
			const translateDeltaY = relative ? relative.b * dw + relative.d * dh : 0;
			newLeft = newLeft - translateDeltaX;
			newTop = newTop - translateDeltaY;
			if (preview_0) {
				const newFlipX = preview_0.startFlipX !== flippedX;
				const newFlipY = preview_0.startFlipY !== flippedY;
				const factor_0 = newWidth / resizing.startWidth;
				const factorY = newHeight / resizing.startHeight;
				const scaled = scaling ? scaleTransformAtHandle(scaling.transform, factor_0, resizing.startWidth, resizing.startHeight, resizing.handle, scaling.linear, scaling.origin, symmetric, factorY) : null;
				const newTransform = scaled ? scaled.transform : withTransformFlips(preview_0.transformParts, newFlipX, newFlipY);
				if (scaled && scaling && !scaling.preservePosition) {
					newLeft = newLeft + (scaling.positionResetDelta.x - scaled.positionDelta.x - scaling.legacyTranslation.x);
					newTop = newTop + (scaling.positionResetDelta.y - scaled.positionDelta.y - scaling.legacyTranslation.y);
				}
				preview_0.finalSize = {
					width: newWidth,
					height: newHeight
				};
				preview_0.finalPosition = {
					x: newLeft,
					y: newTop
				};
				preview_0.finalTransform = newTransform;
				if (scaled && scaling) preview_0.scaleUpdate = previewScale(preview_0.domElement, scaling, scaled);
				preview_0.flipChanged = flippedX || flippedY;
				if (!preview_0.aspectGuide) {
					preview_0.aspectGuide = document.querySelector(`[data-aspect-guide-id="${CSS.escape(resizing.id)}"]`);
					preview_0.aspectGuideLine = preview_0.aspectGuide?.querySelector("[data-aspect-guide-line]");
				}
				if (preview_0.aspectGuide) {
					if (lockAspect) {
						const cdX = newLeft + newWidth / 2 - (resizing.startLeft + resizing.startWidth / 2) + translateDeltaX;
						const cdY = newTop + newHeight / 2 - (resizing.startTop + resizing.startHeight / 2) + translateDeltaY;
						const vX = (preview_0.parentLinear.a * cdX + preview_0.parentLinear.c * cdY) * preview_0.scale;
						const vY = (preview_0.parentLinear.b * cdX + preview_0.parentLinear.d * cdY) * preview_0.scale;
						const gW = preview_0.startOverlayWidth * factor_0;
						const gH = preview_0.startOverlayHeight * factorY;
						const g_0 = preview_0.aspectGuide.style;
						g_0.left = `${preview_0.startOverlayCenterX + vX - gW / 2}px`;
						g_0.top = `${preview_0.startOverlayCenterY + vY - gH / 2}px`;
						g_0.width = `${gW}px`;
						g_0.height = `${gH}px`;
						g_0.transform = preview_0.startOverlayTransform || "none";
						if (preview_0.aspectGuideLine) {
							preview_0.aspectGuideLine.setAttribute("x1", preview_0.guideAntiDiagonal ? "100%" : "0");
							preview_0.aspectGuideLine.setAttribute("x2", preview_0.guideAntiDiagonal ? "0" : "100%");
						}
						g_0.display = "block";
					} else preview_0.aspectGuide.style.display = "none";
				}
				preview_0.domElement.style.transform = newTransform || "none";
				if (!scaling) {
					preview_0.domElement.style.width = `${newWidth}px`;
					preview_0.domElement.style.height = `${newHeight}px`;
				}
				if (preview_0.companions.length > 0) {
					const deltaWidth = newWidth - resizing.startWidth;
					const deltaHeight = newHeight - resizing.startHeight;
					for (const companion_0 of preview_0.companions) {
						if (scaling && companion_0.scaleStart) {
							const start_0 = companion_0.scaleStart;
							const anchorScreen = {
								x: scaling.screenCenter.x + (scaling.accumulated.a * oaX + scaling.accumulated.c * oaY) * preview_0.scale,
								y: scaling.screenCenter.y + (scaling.accumulated.b * oaX + scaling.accumulated.d * oaY) * preview_0.scale
							};
							const inverse_0 = invertLinear(start_0.accumulated);
							const dx = (anchorScreen.x - start_0.screenCenter.x) / preview_0.scale;
							const dy = (anchorScreen.y - start_0.screenCenter.y) / preview_0.scale;
							const localDx = inverse_0.a * dx + inverse_0.c * dy;
							const localDy = inverse_0.b * dx + inverse_0.d * dy;
							const scaled_0 = scaleTransformAtPoint(start_0.transform, factor_0, start_0.linear, start_0.origin, {
								x: companion_0.start.width / 2 + localDx,
								y: companion_0.start.height / 2 + localDy
							}, companion_0.start, factorY);
							companion_0.finalTransform = scaled_0.transform;
							companion_0.scaleUpdate = previewScale(companion_0.domElement, start_0, scaled_0);
							if (companion_0.overlayElement && companion_0.overlayRect) {
								const rect_0 = companion_0.overlayRect;
								const style = companion_0.overlayElement.style;
								style.width = `${rect_0.width * factor_0}px`;
								style.height = `${rect_0.height * factorY}px`;
								style.left = `${rect_0.left + rect_0.width * (1 - factor_0) / 2 - ((factor_0 - 1) * start_0.accumulated.a * localDx + (factorY - 1) * start_0.accumulated.c * localDy) * preview_0.scale}px`;
								style.top = `${rect_0.top + rect_0.height * (1 - factorY) / 2 - ((factor_0 - 1) * start_0.accumulated.b * localDx + (factorY - 1) * start_0.accumulated.d * localDy) * preview_0.scale}px`;
							}
							continue;
						}
						const geom = companionGeometry(companion_0.start, resizing.handle, deltaWidth, deltaHeight);
						companion_0.final = geom;
						companion_0.domElement.style.width = `${geom.width}px`;
						companion_0.domElement.style.height = `${geom.height}px`;
						if (companion_0.positioned) {
							companion_0.domElement.style.left = `${geom.left}px`;
							companion_0.domElement.style.top = `${geom.top}px`;
						}
						if (companion_0.overlayElement && companion_0.overlayRect) {
							companion_0.overlayElement.style.width = `${companion_0.overlayRect.width * geom.width / companion_0.start.width}px`;
							companion_0.overlayElement.style.height = `${companion_0.overlayRect.height * geom.height / companion_0.start.height}px`;
						}
					}
				}
				if (preview_0.rootWrapper && !scaling) {
					preview_0.rootWrapper.style.left = `${newLeft}px`;
					preview_0.rootWrapper.style.top = `${newTop}px`;
				}
				if (preview_0.overlayElement) {
					const centerDeltaX = newLeft + newWidth / 2 - (resizing.startLeft + resizing.startWidth / 2) + translateDeltaX;
					const centerDeltaY = newTop + newHeight / 2 - (resizing.startTop + resizing.startHeight / 2) + translateDeltaY;
					const visualDeltaX = (preview_0.parentLinear.a * centerDeltaX + preview_0.parentLinear.c * centerDeltaY) * preview_0.scale;
					const visualDeltaY = (preview_0.parentLinear.b * centerDeltaX + preview_0.parentLinear.d * centerDeltaY) * preview_0.scale;
					const overlayWidth_0 = preview_0.startOverlayWidth * factor_0;
					const overlayHeight_0 = preview_0.startOverlayHeight * factorY;
					const oLeft = preview_0.startOverlayCenterX + visualDeltaX - overlayWidth_0 / 2;
					const oTop = preview_0.startOverlayCenterY + visualDeltaY - overlayHeight_0 / 2;
					preview_0.overlayElement.style.left = `${oLeft}px`;
					preview_0.overlayElement.style.top = `${oTop}px`;
					preview_0.overlayElement.style.width = `${overlayWidth_0}px`;
					preview_0.overlayElement.style.height = `${overlayHeight_0}px`;
					resizePreviewRectRef.current = {
						id: resizing.id,
						left: oLeft,
						top: oTop,
						width: overlayWidth_0,
						height: overlayHeight_0
					};
					if (preview_0.labelElement) {
						const edge = topEdgeOfRotatedBox(oLeft + overlayWidth_0 / 2, oTop + overlayHeight_0 / 2, overlayWidth_0, overlayHeight_0, preview_0.overlayElement.style.transform);
						preview_0.labelElement.style.left = `${edge.x}px`;
						preview_0.labelElement.style.top = `${edge.y}px`;
						preview_0.labelElement.style.transform = `rotate(${edge.angleDeg}deg)`;
						capSelectionLabel(preview_0.labelElement, edge.length);
					}
				}
			}
		};
		$[17] = t7;
	} else t7 = $[17];
	const processResize = t7;
	let t8;
	if ($[18] === Symbol.for("react.memo_cache_sentinel")) {
		t8 = () => {
			if (rafRef.current === null && latestPointerRef.current) rafRef.current = requestAnimationFrame(processResize);
		};
		$[18] = t8;
	} else t8 = $[18];
	const reprocess = t8;
	let t9;
	if ($[19] !== setResizing) {
		t9 = (commit) => {
			if (rafRef.current !== null) {
				cancelAnimationFrame(rafRef.current);
				rafRef.current = null;
				if (commit) processResize();
			}
			latestPointerRef.current = null;
			const resizing_0 = startRef.current;
			const preview_1 = previewRef.current;
			if (preview_1?.aspectGuide) preview_1.aspectGuide.style.display = "none";
			if (!commit) for (const original of preview_1?.originalStyles ?? []) original.node.style.cssText = original.cssText;
			else if (resizing_0 && preview_1?.scaleStart && preview_1.scaleUpdate) {
				for (const original_0 of preview_1.originalStyles ?? []) original_0.node.style.cssText = original_0.cssText;
				latestRef.current.onScaleElements?.([{
					id: resizing_0.id,
					...preview_1.scaleUpdate
				}, ...preview_1.companions.flatMap(_temp5$31)]);
			} else if (resizing_0 && preview_1?.finalSize && preview_1.finalPosition) {
				const transform = preview_1.flipChanged ? preview_1.finalTransform ?? void 0 : void 0;
				const roundedSize = {
					width: Math.round(preview_1.finalSize.width),
					height: Math.round(preview_1.finalSize.height)
				};
				latestRef.current.onResizeElement(resizing_0.id, roundedSize, preview_1.finalPosition, transform, preview_1.companions.flatMap(_temp6$25));
			}
			startRef.current = null;
			previewRef.current = null;
			resizePreviewRectRef.current = null;
			cmdPressedRef.current = false;
			symmetricRef.current = false;
			shiftPressedRef.current = false;
			commitResizeGuides([]);
			setResizing(null);
		};
		$[19] = setResizing;
		$[20] = t9;
	} else t9 = $[20];
	const finishResize = t9;
	let resizeFromHandle;
	if ($[21] !== finishResize || $[22] !== startResize) {
		resizeFromHandle = {
			begin(id_0, handle_0, at) {
				const element_0 = getById(usePages.getState().visibleTree, id_0);
				if (!element_0) return false;
				startResize(id_0, handle_0, element_0, at.clientX, at.clientY);
				if (!previewRef.current) {
					finishResize(false);
					return false;
				}
				resizeFromHandle.modifiers(at);
				return true;
			},
			move(at_0) {
				latestPointerRef.current = {
					clientX: at_0.clientX,
					clientY: at_0.clientY
				};
				resizeFromHandle.modifiers(at_0);
				reprocess();
			},
			modifiers(at_1) {
				shiftPressedRef.current = at_1.shift;
				symmetricRef.current = at_1.alt;
				cmdPressedRef.current = at_1.cmd;
				reprocess();
			},
			end: finishResize
		};
		$[21] = finishResize;
		$[22] = startResize;
		$[23] = resizeFromHandle;
	} else resizeFromHandle = $[23];
	let t10;
	if ($[24] !== resizeFromHandle || $[25] !== resizeSnapGuides) {
		t10 = {
			resizeFromHandle,
			resizeSnapGuides,
			resizePreviewRectRef
		};
		$[24] = resizeFromHandle;
		$[25] = resizeSnapGuides;
		$[26] = t10;
	} else t10 = $[26];
	return t10;
}
function _temp6$25(c_1) {
	return c_1.final ? [{
		id: c_1.id,
		size: {
			width: Math.round(c_1.final.width),
			height: Math.round(c_1.final.height)
		},
		pos: c_1.positioned ? {
			x: c_1.final.left,
			y: c_1.final.top
		} : void 0
	}] : [];
}
function _temp5$31(c_0) {
	return c_0.scaleUpdate ? [{
		id: c_0.id,
		...c_0.scaleUpdate
	}] : [];
}
function _temp4$36(l_0) {
	return {
		axis: "h",
		pos: l_0.pos,
		spanStart: l_0.spanStart,
		spanEnd: l_0.spanEnd
	};
}
function _temp3$42(l) {
	return {
		axis: "v",
		pos: l.pos,
		spanStart: l.spanStart,
		spanEnd: l.spanEnd
	};
}
function _temp2$60(node_0) {
	return node_0 ? [{
		node: node_0,
		cssText: node_0.style.cssText
	}] : [];
}
function _temp$96(c) {
	return [c.domElement, c.overlayElement];
}

export { useResizing };
