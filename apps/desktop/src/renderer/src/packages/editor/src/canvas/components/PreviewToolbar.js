// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/canvas/components/PreviewToolbar.tsx
import { import_jsx_runtime } from "../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../cloud/src/hooks/useSession.js";
import { CameraIcon, CrosshairIcon, CursorIcon } from "../../../../ui/src/icons.js";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../../../ui/src/components/Tooltip.js";
import { Button } from "../../../../ui/src/components/Button.js";
import { useInnerPickState } from "../../shared/state/innerPickStore.js";
import { useWebviewEditValue, webviewEditStore } from "../../shared/state/webviewEditStore.js";

/**
* The selected Live Preview's own tools, floating above the canvas toolbar.
* Interact (the page works as usual) and Capture (hover outlines, click
* picks, ⌘C / ⌘V copy and paste the pick, drag pulls it out onto the
* canvas) make the preview live; pressing the lit one again makes it static.
* Then a snapshot of the page or the pick.
*/
function PreviewToolButton(t0) {
	const $ = (0, import_compiler_runtime.c)(15);
	const { icon: Icon, label, active: t1, disabled: t2, onClick } = t0;
	const active = t1 === void 0 ? false : t1;
	const disabled = t2 === void 0 ? false : t2;
	const t3 = active ? "toolbarSelected" : "ghost";
	const t4 = active ? "size-[18px]" : "size-[18px] text-ed-muted-foreground";
	let t5;
	if ($[0] !== Icon || $[1] !== t4) {
		t5 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
			strokeWidth: .8,
			className: t4
		});
		$[0] = Icon;
		$[1] = t4;
		$[2] = t5;
	} else t5 = $[2];
	let t6;
	if ($[3] !== active || $[4] !== disabled || $[5] !== label || $[6] !== onClick || $[7] !== t3 || $[8] !== t5) {
		t6 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "icon-sm",
				variant: t3,
				isChildText: false,
				"aria-label": label,
				"aria-pressed": active,
				disabled,
				onClick,
				children: t5
			})
		});
		$[3] = active;
		$[4] = disabled;
		$[5] = label;
		$[6] = onClick;
		$[7] = t3;
		$[8] = t5;
		$[9] = t6;
	} else t6 = $[9];
	let t7;
	if ($[10] !== label) {
		t7 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipContent, {
			side: "top",
			children: label
		});
		$[10] = label;
		$[11] = t7;
	} else t7 = $[11];
	let t8;
	if ($[12] !== t6 || $[13] !== t7) {
		t8 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [t6, t7] });
		$[12] = t6;
		$[13] = t7;
		$[14] = t8;
	} else t8 = $[14];
	return t8;
}
function PreviewToolbar(t0) {
	const $ = (0, import_compiler_runtime.c)(21);
	const { previewId } = t0;
	const tool = useWebviewEditValue(_temp$93);
	const snapshotting = useWebviewEditValue(_temp2$58);
	const { inner } = useInnerPickState();
	let t1;
	if ($[0] !== tool) {
		t1 = (next) => {
			if (tool === next) webviewEditStore.goStatic();
			else webviewEditStore.goLive(next);
		};
		$[0] = tool;
		$[1] = t1;
	} else t1 = $[1];
	const toggle = t1;
	const picked = inner?.kind === "webview" && inner.layerId === previewId && !!inner.hit;
	let t2;
	if ($[2] === Symbol.for("react.memo_cache_sentinel")) {
		t2 = {
			gap: 2,
			padding: 4,
			borderRadius: 10
		};
		$[2] = t2;
	} else t2 = $[2];
	const t3 = tool === "interact";
	let t4;
	if ($[3] !== toggle) {
		t4 = () => toggle("interact");
		$[3] = toggle;
		$[4] = t4;
	} else t4 = $[4];
	let t5;
	if ($[5] !== t3 || $[6] !== t4) {
		t5 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewToolButton, {
			icon: CursorIcon,
			label: "Interact (I)",
			active: t3,
			onClick: t4
		});
		$[5] = t3;
		$[6] = t4;
		$[7] = t5;
	} else t5 = $[7];
	const t6 = tool === "capture";
	let t7;
	if ($[8] !== toggle) {
		t7 = () => toggle("capture");
		$[8] = toggle;
		$[9] = t7;
	} else t7 = $[9];
	let t8;
	if ($[10] !== t6 || $[11] !== t7) {
		t8 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewToolButton, {
			icon: CrosshairIcon,
			label: "Capture (I)",
			active: t6,
			onClick: t7
		});
		$[10] = t6;
		$[11] = t7;
		$[12] = t8;
	} else t8 = $[12];
	let t9;
	if ($[13] === Symbol.for("react.memo_cache_sentinel")) {
		t9 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "bg-ed-border",
			style: {
				width: 1,
				height: 20,
				marginLeft: 4,
				marginRight: 4
			}
		});
		$[13] = t9;
	} else t9 = $[13];
	const t10 = picked ? "Snapshot selection as layers" : "Snapshot page as layers";
	let t11;
	if ($[14] !== snapshotting || $[15] !== t10) {
		t11 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewToolButton, {
			icon: CameraIcon,
			label: t10,
			disabled: snapshotting,
			onClick: _temp3$40
		});
		$[14] = snapshotting;
		$[15] = t10;
		$[16] = t11;
	} else t11 = $[16];
	let t12;
	if ($[17] !== t11 || $[18] !== t5 || $[19] !== t8) {
		t12 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			"data-preview-toolbar": "",
			className: "flex items-center border border-ed-border bg-ed-toolbar shadow-lg pointer-events-auto",
			style: t2,
			children: [
				t5,
				t8,
				t9,
				t11
			]
		});
		$[17] = t11;
		$[18] = t5;
		$[19] = t8;
		$[20] = t12;
	} else t12 = $[20];
	return t12;
}
function _temp3$40() {
	return webviewEditStore.requestSnapshot();
}
function _temp2$58(s_0) {
	return s_0.snapshotting;
}
function _temp$93(s) {
	return s.live ? s.tool : null;
}
/**
* Strict containment, not intersection. Partial overlap keeps "draw a container
* as an overlay" usable, and is the line LUN-106 drew for the drag-nest path.
*/
function isContainedWithin(child, frame, tolerance = 1) {
	return child.left >= frame.left - tolerance && child.top >= frame.top - tolerance && child.left + child.width <= frame.left + frame.width + tolerance && child.top + child.height <= frame.top + frame.height + tolerance;
}
/**
* Pick the enclosed candidates and measure each from the drawn rect's top-left.
* Margins are subtracted because an absolute offset positions the margin box.
* A zero-area layer (an empty <ol>, say) still has a position and is still
* adopted — pinning it preserves that exactly. Store order in, store order out.
*/
function collectAdoptedChildren(frameRect, candidates, scale) {
	if (scale <= 0) return [];
	const adopted = [];
	for (const c of candidates) {
		if (!isContainedWithin(c.rect, frameRect)) continue;
		adopted.push({
			id: c.id,
			left: Math.round((c.rect.left - frameRect.left) / scale - c.marginLeft),
			top: Math.round((c.rect.top - frameRect.top) / scale - c.marginTop),
			width: Math.round(c.rect.width / scale),
			height: Math.round(c.rect.height / scale)
		});
	}
	return adopted;
}
/** Layers within this many layout px of each other share a row/column. */
var SAME_TRACK_PX = 1;
/**
* A frame keeps store order — its children are absolute, so DOM order is paint
* order. Everything else takes visual order: a row stack reads left to right, a
* column stack and a grid read top to bottom (a grid auto-places row by row).
*/
function orderAdoptedChildren(children, layout) {
	if (layout === "absolute") return [...children];
	const topFirst = layout !== "row";
	const storeOrder = new Map(children.map((c, i) => [c.id, i]));
	return [...children].sort((a, b) => {
		const primary = topFirst ? a.top - b.top : a.left - b.left;
		if (Math.abs(primary) > SAME_TRACK_PX) return primary;
		const cross = topFirst ? a.left - b.left : a.top - b.top;
		if (Math.abs(cross) > SAME_TRACK_PX) return cross;
		return (storeOrder.get(a.id) ?? 0) - (storeOrder.get(b.id) ?? 0);
	});
}
/**
* How many columns a grid drawn over these layers should have: the number that
* shared the topmost row. Keeps a 3-wide arrangement 3-wide instead of
* reflowing it into the tool's default two columns.
*/
function countGridColumns$1(children, fallback = 2) {
	if (children.length === 0) return fallback;
	const rowTolerance = Math.max(SAME_TRACK_PX, Math.min(...children.map((c) => c.height)) / 2);
	const firstRowTop = Math.min(...children.map((c) => c.top));
	const inFirstRow = children.filter((c) => c.top - firstRowTop <= rowTolerance);
	return Math.max(1, inFirstRow.length);
}

export { PreviewToolbar, collectAdoptedChildren, countGridColumns$1, isContainedWithin, orderAdoptedChildren };
