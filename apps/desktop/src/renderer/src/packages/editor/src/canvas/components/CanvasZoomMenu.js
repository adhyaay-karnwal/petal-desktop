// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/canvas/components/CanvasZoomMenu.tsx
import { import_jsx_runtime, import_react } from "../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../cloud/src/hooks/useSession.js";
import { Button } from "../../../../ui/src/components/Button.js";
import { s$12 } from "../../../../../vendor/@phosphor-icons/react.js";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuTrigger } from "../../../../ui/src/components/DropdownMenu.js";
import { getRootIds } from "../../../../compiler/src/store/read.js";
import { driveCamera, getCamera, getCameraScale, notifyUserCameraGesture, subscribeCameraScale } from "../../shell/hooks/useCommentAgent.js";
import { InspectorControlInput, InspectorControlShell } from "../../shell/components/panels/styles/primitives.js";
import { LOCAL_SHORTCUTS } from "../../shared/shortcuts/catalog.js";
import { getVisibleTree, usePages } from "../../shared/state/pages.js";
import { getSelectedElementIds, useSelection } from "../../shared/state/selection.js";
import { getPixelGridEnabled, setPixelGridEnabled, subscribePixelGridEnabled } from "../../shared/state/canvasDisplayPreferences.js";
import { isTypingTarget, matchesShortcut } from "../../shared/shortcuts/matchShortcut.js";
import { getCanvasSpaceRect } from "../utils/domGeometry.js";
import { CANVAS_ZOOM_STEP, MIN_CANVAS_SCALE, cameraToFit, zoomAtCenter } from "../utils/zoom.js";

var keepFieldFocus = (event) => event.preventDefault();
var zoomMenuItemPointerProps = {
	onPointerMove: keepFieldFocus,
	onPointerLeave: keepFieldFocus,
	onMouseDown: keepFieldFocus,
	className: "hover:bg-ed-accent hover:text-ed-accent-foreground"
};
function CanvasZoomMenu(t0) {
	const $ = (0, import_compiler_runtime.c)(81);
	const { viewportRef, commentsHidden, onCommentsHiddenChange } = t0;
	const scale = (0, import_react.useSyncExternalStore)(subscribeCameraScale, getCameraScale, _temp$105);
	const pixelGridEnabled = (0, import_react.useSyncExternalStore)(subscribePixelGridEnabled, getPixelGridEnabled, _temp2$67);
	const hasRoots = usePages(_temp3$48);
	const hasSelection = useSelection(_temp4$42);
	const [open, setOpen] = (0, import_react.useState)(false);
	const [draft, setDraft] = (0, import_react.useState)(null);
	const inputRef = (0, import_react.useRef)(null);
	const menuRef = (0, import_react.useRef)(null);
	let t1;
	if ($[0] !== scale) {
		t1 = Math.round(scale * 100);
		$[0] = scale;
		$[1] = t1;
	} else t1 = $[1];
	const percentage = t1;
	let t2;
	if ($[2] !== viewportRef) {
		t2 = (nextScale) => {
			const viewport = viewportRef.current;
			if (!viewport || !Number.isFinite(nextScale)) return;
			driveCamera(zoomAtCenter(getCamera(), nextScale, viewport.clientWidth, viewport.clientHeight));
			notifyUserCameraGesture();
		};
		$[2] = viewportRef;
		$[3] = t2;
	} else t2 = $[3];
	const setScale = t2;
	let t3;
	if ($[4] !== viewportRef) {
		t3 = (ids) => {
			const viewport_0 = viewportRef.current;
			if (!viewport_0) return;
			const camera = cameraToFit(Array.from(ids, getCanvasSpaceRect).filter(_temp5$36), viewport_0.clientWidth, viewport_0.clientHeight);
			if (!camera) return;
			driveCamera(camera);
			notifyUserCameraGesture();
		};
		$[4] = viewportRef;
		$[5] = t3;
	} else t3 = $[5];
	const fit = t3;
	let t4;
	if ($[6] !== fit) {
		t4 = (event) => {
			if (event.defaultPrevented || isTypingTarget(event)) return;
			if (matchesShortcut(event, LOCAL_SHORTCUTS.canvas.zoomFit)) {
				event.preventDefault();
				fit(getRootIds(getVisibleTree()));
			} else if (matchesShortcut(event, LOCAL_SHORTCUTS.canvas.zoomSelection)) {
				event.preventDefault();
				fit(getSelectedElementIds());
			}
		};
		$[6] = fit;
		$[7] = t4;
	} else t4 = $[7];
	const handleFitKey = (0, import_react.useEffectEvent)(t4);
	let t5;
	if ($[8] !== handleFitKey) {
		t5 = () => {
			window.addEventListener("keydown", handleFitKey);
			return () => window.removeEventListener("keydown", handleFitKey);
		};
		$[8] = handleFitKey;
		$[9] = t5;
	} else t5 = $[9];
	let t6;
	if ($[10] === Symbol.for("react.memo_cache_sentinel")) {
		t6 = [];
		$[10] = t6;
	} else t6 = $[10];
	(0, import_react.useEffect)(t5, t6);
	let t7;
	if ($[11] === Symbol.for("react.memo_cache_sentinel")) {
		t7 = (next) => {
			setOpen(next);
			setDraft(null);
		};
		$[11] = t7;
	} else t7 = $[11];
	let t8;
	if ($[12] === Symbol.for("react.memo_cache_sentinel")) {
		t8 = { "aria-hidden": true };
		$[12] = t8;
	} else t8 = $[12];
	const t9 = `Canvas zoom, ${percentage}%`;
	let t10;
	if ($[13] !== percentage || $[14] !== t9) {
		t10 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "ghost",
				size: "xs",
				className: "tabular-nums",
				RightIcon: s$12,
				rightIconSize: 12,
				rightIconClassName: "size-[12px]",
				rightIconProps: t8,
				"aria-label": t9,
				children: [percentage, "%"]
			})
		});
		$[13] = percentage;
		$[14] = t9;
		$[15] = t10;
	} else t10 = $[15];
	let t11;
	let t12;
	if ($[16] === Symbol.for("react.memo_cache_sentinel")) {
		t11 = (event_0) => {
			if (event_0.target === event_0.currentTarget) queueMicrotask(() => inputRef.current?.focus());
		};
		t12 = (event_1) => {
			const firstItem = menuRef.current?.querySelector("[role=\"menuitem\"]:not([data-disabled])");
			if (event_1.key === "ArrowUp" && event_1.target === firstItem) {
				event_1.preventDefault();
				event_1.stopPropagation();
				inputRef.current?.focus();
			}
		};
		$[16] = t11;
		$[17] = t12;
	} else {
		t11 = $[16];
		t12 = $[17];
	}
	let t13;
	if ($[18] !== draft || $[19] !== percentage || $[20] !== setScale) {
		t13 = (event_2) => {
			event_2.preventDefault();
			const value = (draft ?? String(percentage)).trim().replace(/%$/, "").trim();
			if (!value || !Number.isFinite(Number(value))) return;
			setScale(Number(value) / 100);
			setOpen(false);
			setDraft(null);
		};
		$[18] = draft;
		$[19] = percentage;
		$[20] = setScale;
		$[21] = t13;
	} else t13 = $[21];
	const t14 = draft ?? `${percentage}%`;
	let t15;
	let t16;
	if ($[22] === Symbol.for("react.memo_cache_sentinel")) {
		t15 = (event_3) => setDraft(event_3.target.value);
		t16 = (event_4) => {
			if (event_4.key === "Escape") return;
			event_4.stopPropagation();
			if (event_4.key === "ArrowDown" || event_4.key === "ArrowUp" || event_4.key === "Tab") {
				event_4.preventDefault();
				const items = menuRef.current?.querySelectorAll("[role=\"menuitem\"]:not([data-disabled])");
				(event_4.key === "ArrowUp" || event_4.key === "Tab" && event_4.shiftKey ? items?.[items.length - 1] : items?.[0])?.focus();
			}
		};
		$[22] = t15;
		$[23] = t16;
	} else {
		t15 = $[22];
		t16 = $[23];
	}
	let t17;
	if ($[24] !== t14) {
		t17 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorControlShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorControlInput, {
			ref: inputRef,
			"aria-label": "Zoom percentage",
			className: "px-2 tabular-nums",
			inputMode: "decimal",
			value: t14,
			onChange: t15,
			onKeyDown: t16
		}) });
		$[24] = t14;
		$[25] = t17;
	} else t17 = $[25];
	let t18;
	if ($[26] !== t13 || $[27] !== t17) {
		t18 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("form", {
			className: "p-1.5",
			onSubmit: t13,
			children: t17
		});
		$[26] = t13;
		$[27] = t17;
		$[28] = t18;
	} else t18 = $[28];
	let t19;
	if ($[29] === Symbol.for("react.memo_cache_sentinel")) {
		t19 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {});
		$[29] = t19;
	} else t19 = $[29];
	const t20 = scale >= 256;
	let t21;
	if ($[30] !== setScale) {
		t21 = () => setScale(getCameraScale() * CANVAS_ZOOM_STEP);
		$[30] = setScale;
		$[31] = t21;
	} else t21 = $[31];
	let t22;
	if ($[32] === Symbol.for("react.memo_cache_sentinel")) {
		t22 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuShortcut, { children: LOCAL_SHORTCUTS.canvas.zoomIn.keyLabel });
		$[32] = t22;
	} else t22 = $[32];
	let t23;
	if ($[33] !== t20 || $[34] !== t21) {
		t23 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
			...zoomMenuItemPointerProps,
			disabled: t20,
			onSelect: t21,
			children: ["Zoom in ", t22]
		});
		$[33] = t20;
		$[34] = t21;
		$[35] = t23;
	} else t23 = $[35];
	const t24 = scale <= MIN_CANVAS_SCALE;
	let t25;
	if ($[36] !== setScale) {
		t25 = () => setScale(getCameraScale() / CANVAS_ZOOM_STEP);
		$[36] = setScale;
		$[37] = t25;
	} else t25 = $[37];
	let t26;
	if ($[38] === Symbol.for("react.memo_cache_sentinel")) {
		t26 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuShortcut, { children: LOCAL_SHORTCUTS.canvas.zoomOut.keyLabel });
		$[38] = t26;
	} else t26 = $[38];
	let t27;
	if ($[39] !== t24 || $[40] !== t25) {
		t27 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
			...zoomMenuItemPointerProps,
			disabled: t24,
			onSelect: t25,
			children: ["Zoom out ", t26]
		});
		$[39] = t24;
		$[40] = t25;
		$[41] = t27;
	} else t27 = $[41];
	const t28 = !hasRoots;
	let t29;
	if ($[42] !== fit) {
		t29 = () => fit(getRootIds(getVisibleTree()));
		$[42] = fit;
		$[43] = t29;
	} else t29 = $[43];
	let t30;
	if ($[44] === Symbol.for("react.memo_cache_sentinel")) {
		t30 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuShortcut, { children: LOCAL_SHORTCUTS.canvas.zoomFit.keyLabel });
		$[44] = t30;
	} else t30 = $[44];
	let t31;
	if ($[45] !== t28 || $[46] !== t29) {
		t31 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
			...zoomMenuItemPointerProps,
			disabled: t28,
			onSelect: t29,
			children: ["Zoom to fit ", t30]
		});
		$[45] = t28;
		$[46] = t29;
		$[47] = t31;
	} else t31 = $[47];
	const t32 = !hasSelection;
	let t33;
	if ($[48] !== fit) {
		t33 = () => fit(getSelectedElementIds());
		$[48] = fit;
		$[49] = t33;
	} else t33 = $[49];
	let t34;
	if ($[50] === Symbol.for("react.memo_cache_sentinel")) {
		t34 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuShortcut, { children: LOCAL_SHORTCUTS.canvas.zoomSelection.keyLabel });
		$[50] = t34;
	} else t34 = $[50];
	let t35;
	if ($[51] !== t32 || $[52] !== t33) {
		t35 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
			...zoomMenuItemPointerProps,
			disabled: t32,
			onSelect: t33,
			children: ["Zoom to selection ", t34]
		});
		$[51] = t32;
		$[52] = t33;
		$[53] = t35;
	} else t35 = $[53];
	let t36;
	let t37;
	if ($[54] === Symbol.for("react.memo_cache_sentinel")) {
		t36 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {});
		t37 = [
			50,
			100,
			200
		];
		$[54] = t36;
		$[55] = t37;
	} else {
		t36 = $[54];
		t37 = $[55];
	}
	let t38;
	if ($[56] !== setScale) {
		t38 = t37.map((value_0) => /* @__PURE__ */ (0, import_react.createElement)(DropdownMenuItem, {
			...zoomMenuItemPointerProps,
			key: value_0,
			onSelect: () => setScale(value_0 / 100)
		}, "Zoom to ", value_0, "%", value_0 === 100 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuShortcut, { children: LOCAL_SHORTCUTS.canvas.zoomActual.keyLabel })));
		$[56] = setScale;
		$[57] = t38;
	} else t38 = $[57];
	let t39;
	if ($[58] === Symbol.for("react.memo_cache_sentinel")) {
		t39 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {});
		$[58] = t39;
	} else t39 = $[58];
	const t40 = !commentsHidden;
	let t41;
	if ($[59] !== onCommentsHiddenChange) {
		t41 = (checked) => onCommentsHiddenChange(checked !== true);
		$[59] = onCommentsHiddenChange;
		$[60] = t41;
	} else t41 = $[60];
	let t42;
	if ($[61] !== t40 || $[62] !== t41) {
		t42 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuCheckboxItem, {
			...zoomMenuItemPointerProps,
			checked: t40,
			onCheckedChange: t41,
			onSelect: _temp6$30,
			children: "Comments"
		});
		$[61] = t40;
		$[62] = t41;
		$[63] = t42;
	} else t42 = $[63];
	let t43;
	if ($[64] !== pixelGridEnabled) {
		t43 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuCheckboxItem, {
			...zoomMenuItemPointerProps,
			checked: pixelGridEnabled,
			onCheckedChange: _temp7$23,
			onSelect: _temp8$18,
			children: "Pixel grid"
		});
		$[64] = pixelGridEnabled;
		$[65] = t43;
	} else t43 = $[65];
	let t44;
	let t45;
	if ($[66] === Symbol.for("react.memo_cache_sentinel")) {
		t44 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {});
		t45 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
			...zoomMenuItemPointerProps,
			onSelect: _temp9$16,
			children: "Re-center"
		});
		$[66] = t44;
		$[67] = t45;
	} else {
		t44 = $[66];
		t45 = $[67];
	}
	let t46;
	if ($[68] !== t18 || $[69] !== t23 || $[70] !== t27 || $[71] !== t31 || $[72] !== t35 || $[73] !== t38 || $[74] !== t42 || $[75] !== t43) {
		t46 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
			ref: menuRef,
			align: "end",
			className: "w-56",
			"aria-label": "Canvas zoom",
			onFocusCapture: t11,
			onKeyDownCapture: t12,
			children: [
				t18,
				t19,
				t23,
				t27,
				t31,
				t35,
				t36,
				t38,
				t39,
				t42,
				t43,
				t44,
				t45
			]
		});
		$[68] = t18;
		$[69] = t23;
		$[70] = t27;
		$[71] = t31;
		$[72] = t35;
		$[73] = t38;
		$[74] = t42;
		$[75] = t43;
		$[76] = t46;
	} else t46 = $[76];
	let t47;
	if ($[77] !== open || $[78] !== t10 || $[79] !== t46) {
		t47 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, {
			open,
			onOpenChange: t7,
			children: [t10, t46]
		});
		$[77] = open;
		$[78] = t10;
		$[79] = t46;
		$[80] = t47;
	} else t47 = $[80];
	return t47;
}
function _temp9$16() {
	driveCamera({
		scale: 1,
		positionX: 0,
		positionY: 0
	});
	notifyUserCameraGesture();
}
function _temp8$18(event_6) {
	return event_6.preventDefault();
}
function _temp7$23(checked_0) {
	return setPixelGridEnabled(checked_0 === true);
}
function _temp6$30(event_5) {
	return event_5.preventDefault();
}
function _temp5$36(rect) {
	return rect !== null;
}
function _temp4$42(s_0) {
	return s_0.selectedElementIds.size > 0;
}
function _temp3$48(s) {
	return getRootIds(s.visibleTree).length > 0;
}
function _temp2$67() {
	return true;
}
function _temp$105() {
	return 1;
}

export { CanvasZoomMenu };
