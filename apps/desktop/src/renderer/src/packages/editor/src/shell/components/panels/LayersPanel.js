// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/panels/LayersPanel.tsx
import { import_jsx_runtime, import_react } from "../../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../../cloud/src/hooks/useSession.js";
import { cn$2 } from "../../../../../ui/src/lib/utils.js";
import { CaretDownIcon, CaretRightIcon, CollapseAllIcon, CrosshairIcon, OpenAllIcon } from "../../../../../ui/src/icons.js";
import { Text$4 } from "../../../../../ui/src/components/Text.js";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../../../../ui/src/components/Tooltip.js";
import { Button } from "../../../../../ui/src/components/Button.js";
import { InlineRenameInput, usePendingRename } from "../../../../../ui/src/components/InlineRenameInput.js";
import { ContextMenu$1, ContextMenuContent, ContextMenuTrigger } from "../../../../../ui/src/components/ContextMenu.js";
import { ScrollArea } from "../../../../../ui/src/components/ScrollArea.js";
import { hasChildren$1 } from "../../../../../compiler/src/store/types.js";
import { getById, getChildren$2, getParentId, getRootIds, isTextLikeOwner } from "../../../../../compiler/src/store/read.js";
import { IconBtn } from "./styles/primitives.js";
import { createLayerSearchIndex, getElementLabel, splitLabelMatches, withTextParents } from "./layerSearch.js";
import { withVisibleTree } from "../../../shared/state/pages.js";
import { getSelectedElementIds, useSelectedElementIds } from "../../../shared/state/selection.js";
import { useHover } from "../../../shared/state/hover.js";
import { hasAncestorIn, resolveLayerTreeDrop } from "../../../shared/utils/dropPlan.js";
import { PanelSearchInput } from "./PanelSearchInput.js";
import { defaultRangeExtractor } from "../../../../../../vendor/@tanstack/virtual-core.js";
import { useVirtualizer } from "../../../../../../vendor/@tanstack/react-virtual.js";
import { getLayerAccent } from "./layerAppearance.js";
import { LayerIcon } from "./LayerIcon.js";
import { SidebarSectionHeader } from "../SidebarSectionHeader.js";
import { useScrolledHeader } from "../../hooks/useScrolledHeader.js";

function expandCollapsedAncestors(collapsed, store, ids, expandTextOwners) {
	if (collapsed.size === 0) return collapsed;
	const next = new Set(collapsed);
	let changed = false;
	for (const id of ids) {
		if (expandTextOwners && isTextLikeOwner(store, id)) changed = next.delete(id) || changed;
		for (let parentId = getParentId(store, id); parentId && parentId !== "ROOT"; parentId = getParentId(store, parentId)) changed = next.delete(parentId) || changed;
	}
	return changed ? next : collapsed;
}
var expandableIdsByShape = /* @__PURE__ */ new WeakMap();
var treeRowsByShape = /* @__PURE__ */ new WeakMap();
function collectExpandableIds(store) {
	const cached = expandableIdsByShape.get(store.childrenByParent);
	if (cached) return cached;
	const ids = [];
	for (const [parentId, childIds] of store.childrenByParent) {
		if (parentId === "ROOT" || childIds.length === 0) continue;
		const parent = getById(store, parentId);
		if (parent && hasChildren$1(parent)) ids.push(parentId);
	}
	expandableIdsByShape.set(store.childrenByParent, ids);
	return ids;
}
function treeRows(store, collapsedIds) {
	const cached = treeRowsByShape.get(store.childrenByParent);
	if (cached && cached.collapsedIds === collapsedIds) return cached;
	const rows = flattenVisibleLayerRows(store, collapsedIds);
	const next = {
		collapsedIds,
		rows,
		indexById: layerRowIndexById(rows)
	};
	treeRowsByShape.set(store.childrenByParent, next);
	return next;
}
var LAYER_ROW_GAP = 6;
/** 26px row (`h-6.5`) + gap. Shared by virtualization and drop targeting. */
var LAYER_ROW_HEIGHT = 32;
var LAYER_LIST_TOP_PADDING = 0;
var LAYER_LIST_BOTTOM_PADDING = 8;
/**
* Pre-order visible rows: children of a collapsed parent are omitted.
* `subtreeEnd` is written after descendants so drop-after can sit under the
* whole expanded wrap, matching the recursive list's wrap box. Rows carry no
* selection state, so a selection change never re-flattens the tree.
*/
function flattenVisibleLayerRows(store, collapsedIds) {
	const rows = [];
	const walk = (id, depth) => {
		const element = getById(store, id);
		if (!element) return;
		const row = {
			id,
			depth,
			subtreeEnd: rows.length + 1
		};
		rows.push(row);
		const childIds = getChildren$2(store, id);
		if (hasChildren$1(element) && childIds.length > 0 && !collapsedIds.has(id)) for (const childId of childIds) walk(childId, depth + 1);
		row.subtreeEnd = rows.length;
	};
	for (const id of getRootIds(store)) walk(id, 0);
	return rows;
}
/** Search results are already a flat list. */
function flattenSearchLayerRows(resultRows) {
	return resultRows.map((result, index) => ({
		id: result.id,
		depth: result.depth,
		subtreeEnd: index + 1
	}));
}
/**
* Selection shells and sticky parents, built from the selected ids' row indexes
* instead of a scan over every row. A shell starts at each selected row with no
* selected ancestor and covers its visible subtree; flat search rows are each
* their own shell. A selected row with visible descendants is a sticky parent.
*/
function layerSelectionLayout(store, rows, indexById, selectedIds, flat) {
	const indexes = [];
	for (const id of selectedIds) {
		const index = indexById.get(id);
		if (index !== void 0) indexes.push(index);
	}
	indexes.sort((a, b) => a - b);
	const shells = [];
	const stickyParents = /* @__PURE__ */ new Map();
	for (const index of indexes) {
		const row = rows[index];
		if (row.subtreeEnd > index + 1) stickyParents.set(index, row.subtreeEnd);
		if (flat || !hasAncestorIn(store, row.id, selectedIds)) shells.push({
			start: index,
			end: row.subtreeEnd
		});
	}
	return {
		shells,
		stickyParents
	};
}
/** An ancestor is selected, so the row sits inside that selection shell. */
function isInheritedLayerRow(store, id, selectedIds, flat) {
	return !flat && !selectedIds.has(id) && hasAncestorIn(store, id, selectedIds);
}
function layerRowIndexById(rows) {
	const map = /* @__PURE__ */ new Map();
	for (let i = 0; i < rows.length; i++) map.set(rows[i].id, i);
	return map;
}
function revealLayerRow(virtualizer, index) {
	const inView = virtualizer.getOffsetForIndex(index, "auto");
	const item = virtualizer.measurementsCache[index];
	if (!inView || !item || inView[0] === virtualizer.scrollOffset) return;
	virtualizer.scrollToOffset(item.start + item.size / 2, { align: "center" });
}
/**
* Indent per tree level. Rows and the drop indicator share this value so their
* geometry cannot drift.
*/
var INDENT_STEP$1 = 20;
var INDENT_BASE$1 = 0;
var indentOf$1 = (depth) => depth * INDENT_STEP$1 + INDENT_BASE$1;
/** Caret column (`w-4`) + the gap before the icon — the line starts at the icon, not under the chevron. */
var DROP_LINE_INSET = 18;
/** Right inset on the drop line. */
var DROP_LINE_RIGHT_INSET = 12;
/** How close to the list edge a drag starts scrolling, and max px per frame. */
var DROP_SCROLL_EDGE = 36;
var DROP_SCROLL_MAX = 18;
/** Linger on a container before the nest outline replaces the sibling line. */
var NEST_DWELL_MS = 220;
/** A 1x1 transparent GIF. Decoded once at module load, because setDragImage
*  silently falls back to the default ghost for an image that hasn't loaded. */
var EMPTY_DRAG_IMAGE = typeof Image !== "undefined" ? new Image() : null;
if (EMPTY_DRAG_IMAGE) EMPTY_DRAG_IMAGE.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
/** The drop indicator line and the target outline already say where the rows
*  will land, at the depth they'll land at. A row-shaped image dragging along
*  under the cursor only competes with that — and the tree scrolls horizontally,
*  so every row's layout box is stretched to the width of the widest row, which
*  the browser would happily paint out over the canvas. Suppress it. */
function suppressRowDragImage(e) {
	if (EMPTY_DRAG_IMAGE) e.dataTransfer.setDragImage(EMPTY_DRAG_IMAGE, 0, 0);
}
var DROP_INSIDE_ROW = "data-[drop-inside]:outline data-[drop-inside]:outline-1 data-[drop-inside]:outline-ed-canvas-selection";
/** Sticky canvas-focus control. Its backing matches the row beneath it. */
function LayerFocusScrub(t0) {
	const $ = (0, import_compiler_runtime.c)(8);
	const { isSelected, isInherited, onFocus } = t0;
	const base = isSelected ? "bg-ed-layer-active" : isInherited ? "bg-ed-layer-child-hover" : "bg-ed-layer-hover";
	let t1;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t1 = cn$2("relative right-0 sticky z-10 ml-auto flex shrink-0 items-stretch opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto");
		$[0] = t1;
	} else t1 = $[0];
	let t2;
	if ($[1] !== base) {
		t2 = cn$2("relative flex items-center", base);
		$[1] = base;
		$[2] = t2;
	} else t2 = $[2];
	let t3;
	if ($[3] !== onFocus) {
		t3 = onFocus && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
			label: "Focus layer on canvas",
			onClick: (e) => {
				e.stopPropagation();
				onFocus();
			},
			className: "group/focus relative z-[1] text-ed-muted-foreground hover:bg-transparent hover:text-ed-foreground",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CrosshairIcon, { className: "size-3.75 opacity-60 group-hover/focus:opacity-100 group-focus-visible/focus:opacity-100" })
		});
		$[3] = onFocus;
		$[4] = t3;
	} else t3 = $[4];
	let t4;
	if ($[5] !== t2 || $[6] !== t3) {
		t4 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: t1,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: t2,
				children: t3
			})
		});
		$[5] = t2;
		$[6] = t3;
		$[7] = t4;
	} else t4 = $[7];
	return t4;
}
/**
* Rows stretch to fill the list. Measure only their intrinsic content, never
* that stretched width, so sidebar resizing can shrink the list.
*/
function measureLayerRowContentWidth(row) {
	const style = getComputedStyle(row);
	const children = [...row.children];
	let width = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight) + (parseFloat(style.columnGap) || 0) * Math.max(0, children.length - 1);
	for (const child of children) {
		const childStyle = getComputedStyle(child);
		width += Math.max(child.getBoundingClientRect().width, child.scrollWidth);
		if (!child.classList.contains("ml-auto")) width += parseFloat(childStyle.marginLeft) || 0;
		width += parseFloat(childStyle.marginRight) || 0;
	}
	return Math.ceil(width);
}
/** A loop, not `Math.max(...)`: the cache can hold every row in a large tree. */
function maxWidth(widths) {
	let max = 0;
	for (const width of widths.values()) if (width > max) max = width;
	return max;
}
/**
* Owns the virtualized scroll range. Kept out of LayersPanel so the panel
* itself compiles; see the `use no memo` note inside for why this component
* cannot be compiled.
*/
function VirtualizedLayerRows({ count, getItemKey, scrollElement, pinnedIndexes, overscan = 8, listRef, virtualizerRef, minWidthResetKey, shells, stickyParents, dropLine, renderRow }) {
	"use no memo";
	const virtualizer = useVirtualizer({
		count,
		getScrollElement: () => scrollElement,
		estimateSize: () => LAYER_ROW_HEIGHT,
		overscan,
		paddingStart: LAYER_LIST_TOP_PADDING,
		paddingEnd: LAYER_LIST_BOTTOM_PADDING,
		scrollPaddingStart: 56,
		scrollPaddingEnd: 56,
		useFlushSync: false,
		getItemKey,
		rangeExtractor: (range) => {
			const indexes = defaultRangeExtractor(range);
			const next = new Set(indexes);
			for (const [start, end] of stickyParents) if (start <= range.endIndex && end > range.startIndex) next.add(start);
			for (const i of pinnedIndexes) if (i >= 0 && i < range.count) next.add(i);
			return [...next].sort((a, b) => a - b);
		}
	});
	(0, import_react.useLayoutEffect)(() => {
		virtualizerRef.current = virtualizer;
	});
	const virtualItems = virtualizer.getVirtualItems();
	const rangeKey = virtualItems.map((item) => item.key).join("\0");
	const rowContentWidths = (0, import_react.useRef)(/* @__PURE__ */ new Map());
	const widthResetKey = (0, import_react.useRef)(null);
	const rowResizeObserver = (0, import_react.useRef)(null);
	const observedRowChildren = (0, import_react.useRef)(/* @__PURE__ */ new Map());
	const [minWidth, setMinWidth] = (0, import_react.useState)(0);
	(0, import_react.useLayoutEffect)(() => {
		const widths = rowContentWidths.current;
		const observed = observedRowChildren.current;
		const observer = new ResizeObserver((entries) => {
			const rows = /* @__PURE__ */ new Set();
			for (const entry of entries) {
				const row = observed.get(entry.target);
				if (row?.isConnected) rows.add(row);
			}
			for (const row_0 of rows) widths.set(row_0.dataset.layerId, measureLayerRowContentWidth(row_0));
			setMinWidth(maxWidth(widths));
		});
		rowResizeObserver.current = observer;
		return () => {
			observer.disconnect();
			observed.clear();
			rowResizeObserver.current = null;
		};
	}, []);
	(0, import_react.useLayoutEffect)(() => {
		const list = listRef.current;
		const observer_0 = rowResizeObserver.current;
		if (!list || !observer_0) return;
		const widths_0 = rowContentWidths.current;
		const observed_0 = observedRowChildren.current;
		if (widthResetKey.current !== minWidthResetKey) {
			widthResetKey.current = minWidthResetKey;
			widths_0.clear();
		}
		for (const child of observed_0.keys()) {
			if (child.isConnected) continue;
			observer_0.unobserve(child);
			observed_0.delete(child);
		}
		for (const row_1 of list.querySelectorAll("[data-layer-id]")) {
			for (const child_0 of row_1.children) {
				if (observed_0.has(child_0)) continue;
				observer_0.observe(child_0);
				observed_0.set(child_0, row_1);
			}
			const id = row_1.dataset.layerId;
			if (!widths_0.has(id)) widths_0.set(id, measureLayerRowContentWidth(row_1));
		}
		setMinWidth(maxWidth(widths_0));
	}, [
		listRef,
		rangeKey,
		minWidthResetKey
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref: listRef,
		"data-layer-list": "",
		className: "relative min-w-full",
		style: {
			height: virtualizer.getTotalSize(),
			minWidth: minWidth || void 0
		},
		children: [
			shells.map((shell) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				"aria-hidden": true,
				className: "absolute left-0 right-0 rounded-[5px] bg-ed-layer-active-child pointer-events-none",
				style: {
					top: LAYER_LIST_TOP_PADDING + shell.start * LAYER_ROW_HEIGHT,
					height: (shell.end - shell.start) * LAYER_ROW_HEIGHT - LAYER_ROW_GAP
				}
			}, `shell-${shell.start}`)),
			virtualItems.map((item_0) => {
				const subtreeEnd = stickyParents.get(item_0.index);
				const sticky = subtreeEnd !== void 0;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					"data-index": item_0.index,
					"data-sticky-parent": sticky ? "" : void 0,
					className: cn$2("absolute left-0", sticky ? "z-10 pointer-events-none overflow-clip rounded-[5px]" : "z-[1]"),
					style: {
						height: sticky ? (subtreeEnd - item_0.index) * LAYER_ROW_HEIGHT - LAYER_ROW_GAP : item_0.size,
						top: item_0.start,
						width: "max-content",
						minWidth: "100%"
					},
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: sticky ? "sticky top-0 pointer-events-auto bg-ed-background" : void 0,
						children: renderRow(item_0.index)
					})
				}, item_0.key);
			}),
			dropLine
		]
	});
}
/**
* Sizes a layer's rename field to end at its row's end, or the panel's visible edge
* when the row is wider than the panel (rows are as wide as the widest one). Flex
* growth can't do this: the list is `w-max`, so a growing field widens every row.
* Measured once as the rename starts, before the field has changed the row: the 8px
* is the list's inset and the 4px the row's right padding.
*/
function fitToVisibleRow(label) {
	const row = label?.closest("[data-layer-id]");
	const viewport = label?.closest("[data-radix-scroll-area-viewport]");
	if (!label || !row || !viewport) return;
	const end = Math.min(row.getBoundingClientRect().right, viewport.getBoundingClientRect().right - 8) - 4;
	label.style.width = `${end - label.getBoundingClientRect().left}px`;
	return () => {
		label.style.width = "";
	};
}
function LayerRow(t0) {
	const $ = (0, import_compiler_runtime.c)(115);
	const { element, depth, index, subtreeEnd, isSelected, isInherited, endsShell, isCollapsed, isDragging, isEditing, flat, searchQuery, store, currentlyHasChildren, onRename, onRenameDone, onSelectElement, onSelectElements, onFocusElement, onDragStart, onDragEnd, onToggleCollapse, onStartRename, anchorIdRef } = t0;
	let T0;
	let t1;
	let t10;
	let t11;
	let t12;
	let t13;
	let t14;
	let t15;
	let t16;
	let t17;
	let t18;
	let t2;
	let t3;
	let t4;
	let t5;
	let t6;
	let t7;
	let t8;
	let t9;
	if ($[0] !== anchorIdRef || $[1] !== currentlyHasChildren || $[2] !== depth || $[3] !== element || $[4] !== endsShell || $[5] !== flat || $[6] !== index || $[7] !== isCollapsed || $[8] !== isDragging || $[9] !== isEditing || $[10] !== isInherited || $[11] !== isSelected || $[12] !== onDragEnd || $[13] !== onDragStart || $[14] !== onFocusElement || $[15] !== onSelectElement || $[16] !== onSelectElements || $[17] !== onStartRename || $[18] !== onToggleCollapse || $[19] !== store || $[20] !== subtreeEnd) {
		const layerAccent = getLayerAccent(element);
		t7 = element.id;
		t8 = element.id;
		t9 = depth;
		t10 = !isEditing && !flat;
		if ($[40] !== element.id || $[41] !== onDragStart) {
			t11 = (e) => onDragStart(e, element.id);
			$[40] = element.id;
			$[41] = onDragStart;
			$[42] = t11;
		} else t11 = $[42];
		t12 = onDragEnd;
		const t19 = !isSelected && !isInherited && "hover:bg-ed-layer-hover data-[canvas-hover]:bg-ed-layer-hover";
		const t20 = isSelected && "bg-ed-layer-active";
		const t21 = isSelected && subtreeEnd > index + 1 && "rounded-b-none";
		const t22 = isInherited && "hover:bg-ed-layer-child-hover data-[canvas-hover]:bg-ed-layer-child-hover";
		const t23 = isInherited && (endsShell ? "rounded-t-none" : "rounded-none");
		const t24 = isDragging && "opacity-50";
		if ($[43] !== t19 || $[44] !== t20 || $[45] !== t21 || $[46] !== t22 || $[47] !== t23 || $[48] !== t24) {
			t13 = cn$2("flex h-6.5 min-w-full w-max items-center gap-0.5 overflow-clip rounded-[5px] py-0 pl-3 pr-1 group relative", DROP_INSIDE_ROW, t19, t20, t21, t22, t23, t24);
			$[43] = t19;
			$[44] = t20;
			$[45] = t21;
			$[46] = t22;
			$[47] = t23;
			$[48] = t24;
			$[49] = t13;
		} else t13 = $[49];
		let t25;
		if ($[50] !== depth) {
			t25 = indentOf$1(depth);
			$[50] = depth;
			$[51] = t25;
		} else t25 = $[51];
		const t26 = `${t25}px`;
		if ($[52] !== t26) {
			t14 = { paddingLeft: t26 };
			$[52] = t26;
			$[53] = t14;
		} else t14 = $[53];
		if ($[54] !== element || $[55] !== isEditing || $[56] !== onStartRename) {
			t15 = isEditing ? void 0 : (e_0) => {
				const icon = e_0.currentTarget.querySelector("[data-layer-icon]");
				if (e_0.target.closest("button")) return;
				if (icon && e_0.clientX < icon.getBoundingClientRect().right) return;
				onStartRename(e_0, element);
			};
			$[54] = element;
			$[55] = isEditing;
			$[56] = onStartRename;
			$[57] = t15;
		} else t15 = $[57];
		if ($[58] !== anchorIdRef || $[59] !== element.id || $[60] !== flat || $[61] !== onFocusElement || $[62] !== onSelectElement || $[63] !== onSelectElements || $[64] !== store) {
			t16 = (e_1) => {
				const selection = getSelectedElementIds();
				const anchor = anchorIdRef.current;
				if (e_1.shiftKey && anchor && selection.has(anchor) && onSelectElements) {
					const parentKey = getParentId(store, anchor);
					if (parentKey !== null) {
						const siblings = getChildren$2(store, parentKey);
						const anchorIdx = siblings.indexOf(anchor);
						let effectiveId = element.id;
						while (effectiveId !== null && siblings.indexOf(effectiveId) === -1) {
							const p = getParentId(store, effectiveId);
							if (p === null || p === "ROOT") {
								effectiveId = null;
								break;
							}
							effectiveId = p;
						}
						const clickedIdx = effectiveId !== null ? siblings.indexOf(effectiveId) : -1;
						if (anchorIdx !== -1 && clickedIdx !== -1) {
							const start = Math.min(anchorIdx, clickedIdx);
							const end = Math.max(anchorIdx, clickedIdx);
							onSelectElements([...selection, ...siblings.slice(start, end + 1)]);
							return;
						}
					}
				}
				const toggle = e_1.metaKey || e_1.ctrlKey;
				onSelectElement(element.id, e_1.shiftKey || toggle);
				if (!e_1.shiftKey) anchorIdRef.current = element.id;
				if (flat && !toggle && !e_1.shiftKey) onFocusElement?.(element.id);
			};
			$[58] = anchorIdRef;
			$[59] = element.id;
			$[60] = flat;
			$[61] = onFocusElement;
			$[62] = onSelectElement;
			$[63] = onSelectElements;
			$[64] = store;
			$[65] = t16;
		} else t16 = $[65];
		let t27;
		if ($[66] !== currentlyHasChildren || $[67] !== element || $[68] !== flat || $[69] !== isCollapsed || $[70] !== onToggleCollapse) {
			t27 = currentlyHasChildren && !flat && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "ghost",
				size: "icon-3xs",
				isChildText: false,
				"aria-label": `${isCollapsed ? "Expand" : "Collapse"} ${getElementLabel(element)}`,
				onClick: (e_2) => {
					e_2.stopPropagation();
					onToggleCollapse(element.id);
				},
				className: "group/caret h-full w-4 hover:bg-transparent [&_svg]:translate-x-0.5",
				children: isCollapsed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CaretRightIcon, { className: "size-2.5 text-ed-muted-foreground group-hover/caret:text-ed-foreground" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CaretDownIcon, { className: "size-2.5 text-ed-muted-foreground group-hover/caret:text-ed-foreground" })
			});
			$[66] = currentlyHasChildren;
			$[67] = element;
			$[68] = flat;
			$[69] = isCollapsed;
			$[70] = onToggleCollapse;
			$[71] = t27;
		} else t27 = $[71];
		if ($[72] !== t27) {
			t17 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex h-full w-4 shrink-0 items-center justify-center",
				children: t27
			});
			$[72] = t27;
			$[73] = t17;
		} else t17 = $[73];
		if ($[74] !== element) {
			t18 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				"data-layer-icon": "",
				className: "mr-1 shrink-0 flex [&_svg]:size-3.5",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayerIcon, {
					element,
					size: 14
				})
			});
			$[74] = element;
			$[75] = t18;
		} else t18 = $[75];
		t4 = isEditing ? fitToVisibleRow : void 0;
		t5 = "";
		t6 = "flex h-full shrink-0 items-center";
		T0 = Text$4;
		t1 = "2xs";
		t2 = "primary";
		t3 = cn$2("whitespace-nowrap select-none text-left", isEditing ? "flex min-w-0 flex-1" : "shrink-0", layerAccent.label);
		$[0] = anchorIdRef;
		$[1] = currentlyHasChildren;
		$[2] = depth;
		$[3] = element;
		$[4] = endsShell;
		$[5] = flat;
		$[6] = index;
		$[7] = isCollapsed;
		$[8] = isDragging;
		$[9] = isEditing;
		$[10] = isInherited;
		$[11] = isSelected;
		$[12] = onDragEnd;
		$[13] = onDragStart;
		$[14] = onFocusElement;
		$[15] = onSelectElement;
		$[16] = onSelectElements;
		$[17] = onStartRename;
		$[18] = onToggleCollapse;
		$[19] = store;
		$[20] = subtreeEnd;
		$[21] = T0;
		$[22] = t1;
		$[23] = t10;
		$[24] = t11;
		$[25] = t12;
		$[26] = t13;
		$[27] = t14;
		$[28] = t15;
		$[29] = t16;
		$[30] = t17;
		$[31] = t18;
		$[32] = t2;
		$[33] = t3;
		$[34] = t4;
		$[35] = t5;
		$[36] = t6;
		$[37] = t7;
		$[38] = t8;
		$[39] = t9;
	} else {
		T0 = $[21];
		t1 = $[22];
		t10 = $[23];
		t11 = $[24];
		t12 = $[25];
		t13 = $[26];
		t14 = $[27];
		t15 = $[28];
		t16 = $[29];
		t17 = $[30];
		t18 = $[31];
		t2 = $[32];
		t3 = $[33];
		t4 = $[34];
		t5 = $[35];
		t6 = $[36];
		t7 = $[37];
		t8 = $[38];
		t9 = $[39];
	}
	let t19;
	if ($[76] !== element || $[77] !== flat || $[78] !== isEditing || $[79] !== onRename || $[80] !== onRenameDone || $[81] !== searchQuery) {
		t19 = isEditing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InlineRenameInput, {
			"aria-label": `Rename ${getElementLabel(element)}`,
			value: element.name ?? getElementLabel(element),
			onCommit: (name) => onRename(element.id, name),
			onDone: onRenameDone,
			className: "mr-0.5 flex-1"
		}) : flat ? splitLabelMatches(getElementLabel(element), searchQuery).map(_temp$54) : getElementLabel(element);
		$[76] = element;
		$[77] = flat;
		$[78] = isEditing;
		$[79] = onRename;
		$[80] = onRenameDone;
		$[81] = searchQuery;
		$[82] = t19;
	} else t19 = $[82];
	let t20;
	if ($[83] !== T0 || $[84] !== t1 || $[85] !== t19 || $[86] !== t2 || $[87] !== t3) {
		t20 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(T0, {
			size: t1,
			variant: t2,
			className: t3,
			children: t19
		});
		$[83] = T0;
		$[84] = t1;
		$[85] = t19;
		$[86] = t2;
		$[87] = t3;
		$[88] = t20;
	} else t20 = $[88];
	let t21;
	if ($[89] !== t20 || $[90] !== t4 || $[91] !== t5 || $[92] !== t6) {
		t21 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			ref: t4,
			"data-layer-label": t5,
			className: t6,
			children: t20
		});
		$[89] = t20;
		$[90] = t4;
		$[91] = t5;
		$[92] = t6;
		$[93] = t21;
	} else t21 = $[93];
	let t22;
	if ($[94] !== element.id || $[95] !== isEditing || $[96] !== isInherited || $[97] !== isSelected || $[98] !== onFocusElement) {
		t22 = !isEditing && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayerFocusScrub, {
			isSelected,
			isInherited,
			onFocus: onFocusElement ? () => onFocusElement(element.id) : void 0
		});
		$[94] = element.id;
		$[95] = isEditing;
		$[96] = isInherited;
		$[97] = isSelected;
		$[98] = onFocusElement;
		$[99] = t22;
	} else t22 = $[99];
	let t23;
	if ($[100] !== t10 || $[101] !== t11 || $[102] !== t12 || $[103] !== t13 || $[104] !== t14 || $[105] !== t15 || $[106] !== t16 || $[107] !== t17 || $[108] !== t18 || $[109] !== t21 || $[110] !== t22 || $[111] !== t7 || $[112] !== t8 || $[113] !== t9) {
		t23 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			"data-layer-id": t7,
			"data-layer-wrap": t8,
			"data-layer-depth": t9,
			draggable: t10,
			onDragStart: t11,
			onDragEnd: t12,
			className: t13,
			style: t14,
			onDoubleClick: t15,
			onClick: t16,
			children: [
				t17,
				t18,
				t21,
				t22
			]
		});
		$[100] = t10;
		$[101] = t11;
		$[102] = t12;
		$[103] = t13;
		$[104] = t14;
		$[105] = t15;
		$[106] = t16;
		$[107] = t17;
		$[108] = t18;
		$[109] = t21;
		$[110] = t22;
		$[111] = t7;
		$[112] = t8;
		$[113] = t9;
		$[114] = t23;
	} else t23 = $[114];
	return t23;
}
function _temp$54(seg, i) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn$2(seg.match && "font-semibold"),
		children: seg.text
	}, i);
}
function LayersPanel(t0) {
	const $ = (0, import_compiler_runtime.c)(178);
	const { store, selectedElementIds, onSelectElement, onSelectElements, onDragElements, onRenameElement, onFocusElement, searchInputRef, renameRequestId, onRenameRequestHandled, suppressMenuCloseFocusRef, onContextMenuRow, renderRowContextMenu, readOnly: t1, headerVariant: t2, searchValue, onSearchValueChange } = t0;
	const readOnly = t1 === void 0 ? false : t1;
	const headerVariant = t2 === void 0 ? "default" : t2;
	const [collapsedIds, setCollapsedIds] = (0, import_react.useState)(_temp2$34);
	const [openMenuId, setOpenMenuId] = (0, import_react.useState)(null);
	const [dragIds, setDragIds] = (0, import_react.useState)(null);
	const [renamingId, setRenamingId] = (0, import_react.useState)(null);
	const [internalSearchQuery, setInternalSearchQuery] = (0, import_react.useState)("");
	const searchQuery = searchValue ?? internalSearchQuery;
	const setSearchQuery = onSearchValueChange ?? setInternalSearchQuery;
	let t3;
	if ($[0] !== selectedElementIds) {
		t3 = Array.from(selectedElementIds).sort().join(",");
		$[0] = selectedElementIds;
		$[1] = t3;
	} else t3 = $[1];
	const selectionKey = t3;
	const [expandedForSelection, setExpandedForSelection] = (0, import_react.useState)(selectionKey);
	const [handledRenameId, setHandledRenameId] = (0, import_react.useState)(null);
	let nextCollapsed = collapsedIds;
	if (selectionKey !== expandedForSelection) {
		setExpandedForSelection(selectionKey);
		if (selectedElementIds.size > 0) nextCollapsed = expandCollapsedAncestors(nextCollapsed, store, selectedElementIds, true);
	}
	if ((renameRequestId ?? null) !== handledRenameId) {
		setHandledRenameId(renameRequestId ?? null);
		if (renameRequestId) {
			nextCollapsed = expandCollapsedAncestors(nextCollapsed, store, [renameRequestId], false);
			const element = getById(store, renameRequestId);
			if (element && !readOnly && onRenameElement) setRenamingId(element.id);
		}
	}
	if (nextCollapsed !== collapsedIds) setCollapsedIds(nextCollapsed);
	const anchorIdRef = (0, import_react.useRef)(null);
	const dragIdsRef = (0, import_react.useRef)(null);
	const dropStickyRef = (0, import_react.useRef)(null);
	const dropLineRef = (0, import_react.useRef)(null);
	const dropListRef = (0, import_react.useRef)(null);
	const dropInsideRowRef = (0, import_react.useRef)(null);
	const hoverRowRef = (0, import_react.useRef)(null);
	const dropPaintRef = (0, import_react.useRef)(null);
	const lastDragPointRef = (0, import_react.useRef)(null);
	const autoScrollRafRef = (0, import_react.useRef)(0);
	const autoScrollTickRef = (0, import_react.useRef)(_temp3$25);
	const storeRef = (0, import_react.useRef)(store);
	const collapsedIdsRef = (0, import_react.useRef)(collapsedIds);
	let t4;
	if ($[2] === Symbol.for("react.memo_cache_sentinel")) {
		t4 = [];
		$[2] = t4;
	} else t4 = $[2];
	const visibleRowsRef = (0, import_react.useRef)(t4);
	let t5;
	if ($[3] === Symbol.for("react.memo_cache_sentinel")) {
		t5 = /* @__PURE__ */ new Map();
		$[3] = t5;
	} else t5 = $[3];
	const indexByIdRef = (0, import_react.useRef)(t5);
	let t6;
	if ($[4] === Symbol.for("react.memo_cache_sentinel")) {
		t6 = {
			hoveredId: null,
			armed: false,
			timer: 0
		};
		$[4] = t6;
	} else t6 = $[4];
	const nestDwellRef = (0, import_react.useRef)(t6);
	const scrollContainerRef = (0, import_react.useRef)(null);
	const { hasScrolled, viewportRef, scrollElement } = useScrolledHeader(scrollContainerRef);
	const virtualizerRef = (0, import_react.useRef)(null);
	const handleRowHover = _temp4$24;
	const handleRowUnhover = _temp5$21;
	let t7;
	let t8;
	if ($[5] === Symbol.for("react.memo_cache_sentinel")) {
		t7 = () => useHover.subscribe(_temp6$16, (id_0) => {
			hoverRowRef.current?.removeAttribute("data-canvas-hover");
			hoverRowRef.current = null;
			const container = scrollContainerRef.current;
			if (!container) return;
			if (!id_0 || useHover.getState().source !== "canvas") return;
			const row = container.querySelector(`[data-layer-id="${CSS.escape(id_0)}"]`);
			if (!row) return;
			row.setAttribute("data-canvas-hover", "");
			hoverRowRef.current = row;
		});
		t8 = [];
		$[5] = t7;
		$[6] = t8;
	} else {
		t7 = $[5];
		t8 = $[6];
	}
	(0, import_react.useEffect)(t7, t8);
	let t10;
	let t9;
	if ($[7] === Symbol.for("react.memo_cache_sentinel")) {
		t9 = () => {
			const scrollContainer = scrollContainerRef.current;
			if (!scrollContainer) return;
			const handleWheel = (e_0) => {
				if (!(e_0.metaKey || e_0.shiftKey)) return;
				const horizontalDelta = Math.abs(e_0.deltaX) > Math.abs(e_0.deltaY) ? e_0.deltaX : e_0.deltaY;
				if (horizontalDelta === 0) return;
				scrollContainer.scrollLeft = scrollContainer.scrollLeft + horizontalDelta;
				e_0.preventDefault();
			};
			scrollContainer.addEventListener("wheel", handleWheel, { passive: false });
			return () => scrollContainer.removeEventListener("wheel", handleWheel);
		};
		t10 = [];
		$[7] = t10;
		$[8] = t9;
	} else {
		t10 = $[7];
		t9 = $[8];
	}
	(0, import_react.useEffect)(t9, t10);
	let t11;
	if ($[9] !== onRenameElement || $[10] !== readOnly) {
		t11 = (element_0) => {
			if (readOnly || !onRenameElement) return;
			setRenamingId(element_0.id);
		};
		$[9] = onRenameElement;
		$[10] = readOnly;
		$[11] = t11;
	} else t11 = $[11];
	const startRename = t11;
	let t12;
	let t13;
	if ($[12] !== onRenameRequestHandled || $[13] !== renameRequestId) {
		t12 = () => {
			if (!renameRequestId) return;
			onRenameRequestHandled?.();
		};
		t13 = [renameRequestId, onRenameRequestHandled];
		$[12] = onRenameRequestHandled;
		$[13] = renameRequestId;
		$[14] = t12;
		$[15] = t13;
	} else {
		t12 = $[14];
		t13 = $[15];
	}
	(0, import_react.useEffect)(t12, t13);
	let t14;
	let t15;
	if ($[16] !== onRenameElement || $[17] !== readOnly || $[18] !== renamingId || $[19] !== selectedElementIds || $[20] !== startRename || $[21] !== store) {
		t14 = () => {
			if (readOnly || !onRenameElement) return;
			const handleKeyDown = (e_1) => {
				if (renamingId || selectedElementIds.size !== 1) return;
				if (e_1.key !== "F2") return;
				const target_0 = e_1.target;
				if (target_0.tagName === "INPUT" || target_0.tagName === "TEXTAREA" || target_0.isContentEditable) return;
				const element_1 = getById(store, Array.from(selectedElementIds)[0]);
				if (!element_1) return;
				e_1.preventDefault();
				startRename(element_1);
			};
			window.addEventListener("keydown", handleKeyDown);
			return () => window.removeEventListener("keydown", handleKeyDown);
		};
		t15 = [
			selectedElementIds,
			renamingId,
			readOnly,
			onRenameElement,
			store,
			startRename
		];
		$[16] = onRenameElement;
		$[17] = readOnly;
		$[18] = renamingId;
		$[19] = selectedElementIds;
		$[20] = startRename;
		$[21] = store;
		$[22] = t14;
		$[23] = t15;
	} else {
		t14 = $[22];
		t15 = $[23];
	}
	(0, import_react.useEffect)(t14, t15);
	let t16;
	if ($[24] !== startRename) {
		t16 = (e_2, element_2) => {
			e_2.stopPropagation();
			startRename(element_2);
		};
		$[24] = startRename;
		$[25] = t16;
	} else t16 = $[25];
	const handleStartRename = t16;
	let t17;
	if ($[26] !== store) {
		t17 = (id_1) => getById(store, id_1)?.name;
		$[26] = store;
		$[27] = t17;
	} else t17 = $[27];
	const pendingName = usePendingRename(t17);
	let t18;
	if ($[28] !== onRenameElement || $[29] !== pendingName) {
		t18 = (id_2, name) => {
			if (onRenameElement?.(id_2, name)) pendingName.hold(id_2, name);
		};
		$[28] = onRenameElement;
		$[29] = pendingName;
		$[30] = t18;
	} else t18 = $[30];
	const handleRename = t18;
	let t19;
	if ($[31] === Symbol.for("react.memo_cache_sentinel")) {
		t19 = () => setRenamingId(null);
		$[31] = t19;
	} else t19 = $[31];
	const handleRenameDone = t19;
	let expandableIds;
	let t20;
	if ($[32] !== collapsedIds || $[33] !== store) {
		expandableIds = collectExpandableIds(store);
		let t21;
		if ($[36] !== collapsedIds) {
			t21 = (id_3) => !collapsedIds.has(id_3);
			$[36] = collapsedIds;
			$[37] = t21;
		} else t21 = $[37];
		t20 = expandableIds.some(t21);
		$[32] = collapsedIds;
		$[33] = store;
		$[34] = expandableIds;
		$[35] = t20;
	} else {
		expandableIds = $[34];
		t20 = $[35];
	}
	const hasExpanded = t20;
	const allCollapsed = expandableIds.length > 0 && !hasExpanded;
	let t21;
	if ($[38] !== collapsedIds || $[39] !== store) {
		t21 = () => {
			const ids = collectExpandableIds(store);
			if (!ids.some((id_4) => !collapsedIds.has(id_4))) return;
			setCollapsedIds(new Set(ids));
		};
		$[38] = collapsedIds;
		$[39] = store;
		$[40] = t21;
	} else t21 = $[40];
	const collapseAll = t21;
	let t22;
	if ($[41] !== allCollapsed || $[42] !== expandableIds) {
		t22 = () => {
			if (expandableIds.length === 0) return;
			setCollapsedIds(allCollapsed ? /* @__PURE__ */ new Set() : new Set(expandableIds));
		};
		$[41] = allCollapsed;
		$[42] = expandableIds;
		$[43] = t22;
	} else t22 = $[43];
	const toggleAll = t22;
	let t23;
	let t24;
	if ($[44] !== collapseAll || $[45] !== headerVariant || $[46] !== toggleAll) {
		t23 = () => {
			const handleKeyDown_0 = (e_3) => {
				if (!e_3.altKey || e_3.metaKey || e_3.ctrlKey) return;
				if (e_3.code !== "KeyL") return;
				const target_1 = e_3.target;
				if (target_1.tagName === "INPUT" || target_1.tagName === "TEXTAREA" || target_1.isContentEditable) return;
				e_3.preventDefault();
				if (headerVariant === "sidebar-v2") toggleAll();
				else collapseAll();
			};
			window.addEventListener("keydown", handleKeyDown_0);
			return () => window.removeEventListener("keydown", handleKeyDown_0);
		};
		t24 = [
			collapseAll,
			toggleAll,
			headerVariant
		];
		$[44] = collapseAll;
		$[45] = headerVariant;
		$[46] = toggleAll;
		$[47] = t23;
		$[48] = t24;
	} else {
		t23 = $[47];
		t24 = $[48];
	}
	(0, import_react.useEffect)(t23, t24);
	let t25;
	if ($[49] === Symbol.for("react.memo_cache_sentinel")) {
		t25 = (id_5) => {
			setCollapsedIds((prev) => {
				const next = new Set(prev);
				if (next.has(id_5)) next.delete(id_5);
				else next.add(id_5);
				return next;
			});
		};
		$[49] = t25;
	} else t25 = $[49];
	const toggleCollapse = t25;
	let t26;
	if ($[50] !== readOnly) {
		t26 = (e_4, id_6) => {
			if (readOnly) {
				e_4.preventDefault();
				return;
			}
			e_4.stopPropagation();
			const selection = getSelectedElementIds();
			const ids_0 = selection.has(id_6) && selection.size > 1 ? new Set(selection) : /* @__PURE__ */ new Set([id_6]);
			dragIdsRef.current = ids_0;
			dropStickyRef.current = null;
			setDragIds(ids_0);
			e_4.dataTransfer.effectAllowed = "move";
			e_4.dataTransfer.setData("text/plain", id_6);
			suppressRowDragImage(e_4);
		};
		$[50] = readOnly;
		$[51] = t26;
	} else t26 = $[51];
	const handleDragStart = t26;
	let t27;
	if ($[52] === Symbol.for("react.memo_cache_sentinel")) {
		t27 = () => {
			const line = dropLineRef.current;
			if (line) {
				line.style.opacity = "0";
				line.removeAttribute("data-drop-indicator");
			}
			dropInsideRowRef.current?.removeAttribute("data-drop-inside");
			dropInsideRowRef.current = null;
			dropPaintRef.current = null;
		};
		$[52] = t27;
	} else t27 = $[52];
	const clearDropPaint = t27;
	let t28;
	if ($[53] === Symbol.for("react.memo_cache_sentinel")) {
		t28 = () => {
			if (autoScrollRafRef.current) {
				cancelAnimationFrame(autoScrollRafRef.current);
				autoScrollRafRef.current = 0;
			}
			lastDragPointRef.current = null;
		};
		$[53] = t28;
	} else t28 = $[53];
	const stopAutoScroll = t28;
	let t29;
	if ($[54] === Symbol.for("react.memo_cache_sentinel")) {
		t29 = () => {
			const dwell = nestDwellRef.current;
			if (dwell.timer) window.clearTimeout(dwell.timer);
			nestDwellRef.current = {
				hoveredId: null,
				armed: false,
				timer: 0
			};
		};
		$[54] = t29;
	} else t29 = $[54];
	const resetNestDwell = t29;
	let t30;
	if ($[55] === Symbol.for("react.memo_cache_sentinel")) {
		t30 = (targetId, position) => {
			const prev_0 = dropPaintRef.current;
			if (prev_0 && prev_0.targetId === targetId && prev_0.position === position) return;
			dropPaintRef.current = {
				targetId,
				position
			};
			const list = dropListRef.current;
			const line_0 = dropLineRef.current;
			if (!list || !line_0) return;
			const insideRow = dropInsideRowRef.current;
			if (insideRow && (position !== "inside" || insideRow.getAttribute("data-layer-id") !== targetId)) {
				insideRow.removeAttribute("data-drop-inside");
				dropInsideRowRef.current = null;
			}
			if (position === "inside") {
				line_0.style.opacity = "0";
				line_0.removeAttribute("data-drop-indicator");
				const row_0 = list.querySelector(`[data-layer-id="${CSS.escape(targetId)}"]`);
				if (row_0) {
					row_0.setAttribute("data-drop-inside", "");
					dropInsideRowRef.current = row_0;
				}
				return;
			}
			const index = indexByIdRef.current.get(targetId);
			const hit = index == null ? void 0 : visibleRowsRef.current[index];
			if (index == null || !hit) {
				line_0.style.opacity = "0";
				line_0.removeAttribute("data-drop-indicator");
				return;
			}
			const top = position === "before" ? LAYER_LIST_TOP_PADDING + index * LAYER_ROW_HEIGHT : LAYER_LIST_TOP_PADDING + hit.subtreeEnd * LAYER_ROW_HEIGHT;
			line_0.style.top = `${top}px`;
			line_0.style.marginLeft = `${indentOf$1(hit.depth) + DROP_LINE_INSET}px`;
			line_0.style.opacity = "1";
			line_0.setAttribute("data-drop-indicator", position);
		};
		$[55] = t30;
	} else t30 = $[55];
	const paintDrop = t30;
	let hitTestLayerRow;
	let retargetDropAt;
	if ($[56] !== store) {
		const applyDropHover = (targetId_0, depth, canHaveChildren, expanded, clientX, clientY, rowRect) => {
			const ids_1 = dragIdsRef.current;
			if (!ids_1 || ids_1.has(targetId_0) || hasAncestorIn(store, targetId_0, ids_1)) return;
			const dwell_0 = nestDwellRef.current;
			if (dwell_0.hoveredId !== targetId_0) {
				if (dwell_0.timer) window.clearTimeout(dwell_0.timer);
				dwell_0.hoveredId = targetId_0;
				dwell_0.armed = false;
				dwell_0.timer = canHaveChildren ? window.setTimeout(() => {
					dwell_0.timer = 0;
					dwell_0.armed = true;
					const pt = lastDragPointRef.current;
					if (pt) retargetDropAt(pt.x, pt.y);
				}, NEST_DWELL_MS) : 0;
			}
			const intent = resolveLayerTreeDrop(store, {
				hoveredId: targetId_0,
				depth,
				canHaveChildren,
				expanded,
				xInRow: clientX - rowRect.left,
				yRatio: (clientY - rowRect.top) / (rowRect.height || 1),
				indentBase: INDENT_BASE$1,
				indentStep: INDENT_STEP$1,
				sticky: dropStickyRef.current,
				dragIds: ids_1,
				allowInside: dwell_0.armed
			});
			dropStickyRef.current = intent.sticky;
			paintDrop(intent.targetId, intent.position);
		};
		let t31;
		if ($[59] === Symbol.for("react.memo_cache_sentinel")) {
			t31 = (clientX_0, clientY_0) => {
				const list_0 = dropListRef.current;
				const rows = visibleRowsRef.current;
				if (!list_0 || rows.length === 0) return null;
				const box = list_0.getBoundingClientRect();
				if (clientY_0 < box.top || clientY_0 > box.bottom || clientX_0 < box.left || clientX_0 > box.right) return null;
				const stickyRow = document.elementFromPoint(clientX_0, clientY_0)?.closest("[data-sticky-parent] [data-layer-id]");
				if (stickyRow && list_0.contains(stickyRow)) {
					const index_0 = indexByIdRef.current.get(stickyRow.dataset.layerId);
					if (index_0 !== void 0) return {
						row: rows[index_0],
						index: index_0,
						rect: stickyRow.getBoundingClientRect()
					};
				}
				const y = clientY_0 - box.top - LAYER_LIST_TOP_PADDING;
				const index_1 = Math.max(0, Math.min(rows.length - 1, Math.floor(y / LAYER_ROW_HEIGHT)));
				const row_1 = rows[index_1];
				if (!row_1) return null;
				const top_0 = box.top + LAYER_LIST_TOP_PADDING + index_1 * LAYER_ROW_HEIGHT;
				return {
					row: row_1,
					index: index_1,
					rect: new DOMRect(box.left, top_0, box.width, LAYER_ROW_HEIGHT)
				};
			};
			$[59] = t31;
		} else t31 = $[59];
		hitTestLayerRow = t31;
		retargetDropAt = (clientX_1, clientY_1) => {
			const hit_0 = hitTestLayerRow(clientX_1, clientY_1);
			if (!hit_0) return;
			const { row: row_2, rect } = hit_0;
			const element_3 = getById(store, row_2.id);
			if (!element_3) return;
			const canHaveChildren_0 = hasChildren$1(element_3);
			const expanded_0 = canHaveChildren_0 && getChildren$2(store, row_2.id).length > 0 && !collapsedIdsRef.current.has(row_2.id);
			applyDropHover(row_2.id, row_2.depth, canHaveChildren_0, expanded_0, clientX_1, clientY_1, rect);
		};
		$[56] = store;
		$[57] = hitTestLayerRow;
		$[58] = retargetDropAt;
	} else {
		hitTestLayerRow = $[57];
		retargetDropAt = $[58];
	}
	let t31;
	if ($[60] !== retargetDropAt) {
		t31 = () => {
			autoScrollTickRef.current = () => {
				const pt_0 = lastDragPointRef.current;
				const sc = scrollContainerRef.current;
				if (!pt_0 || !sc || !dragIdsRef.current) {
					autoScrollRafRef.current = 0;
					return;
				}
				const rect_0 = sc.getBoundingClientRect();
				let dy = 0;
				if (pt_0.y < rect_0.top + DROP_SCROLL_EDGE) {
					const t = Math.min(1, (rect_0.top + DROP_SCROLL_EDGE - pt_0.y) / DROP_SCROLL_EDGE);
					dy = -Math.max(1, Math.round(DROP_SCROLL_MAX * t));
				} else if (pt_0.y > rect_0.bottom - DROP_SCROLL_EDGE) {
					const t_0 = Math.min(1, (pt_0.y - (rect_0.bottom - DROP_SCROLL_EDGE)) / DROP_SCROLL_EDGE);
					dy = Math.max(1, Math.round(DROP_SCROLL_MAX * t_0));
				}
				if (dy) {
					const prev_1 = sc.scrollTop;
					sc.scrollTop = sc.scrollTop + dy;
					if (sc.scrollTop !== prev_1) {
						retargetDropAt(pt_0.x, pt_0.y);
						autoScrollRafRef.current = requestAnimationFrame(() => autoScrollTickRef.current());
						return;
					}
				}
				autoScrollRafRef.current = 0;
			};
		};
		$[60] = retargetDropAt;
		$[61] = t31;
	} else t31 = $[61];
	(0, import_react.useLayoutEffect)(t31);
	let t32;
	if ($[62] === Symbol.for("react.memo_cache_sentinel")) {
		t32 = () => {
			if (autoScrollRafRef.current) return;
			autoScrollRafRef.current = requestAnimationFrame(() => autoScrollTickRef.current());
		};
		$[62] = t32;
	} else t32 = $[62];
	const kickAutoScroll = t32;
	let t33;
	if ($[63] === Symbol.for("react.memo_cache_sentinel")) {
		t33 = () => {
			dragIdsRef.current = null;
			dropStickyRef.current = null;
			stopAutoScroll();
			resetNestDwell();
			clearDropPaint();
			setDragIds(null);
		};
		$[63] = t33;
	} else t33 = $[63];
	const handleDragEnd = t33;
	let t34;
	if ($[64] !== retargetDropAt || $[65] !== searchQuery) {
		t34 = (e_5) => {
			if (!dragIdsRef.current || searchQuery.trim().length > 0) return;
			e_5.preventDefault();
			lastDragPointRef.current = {
				x: e_5.clientX,
				y: e_5.clientY
			};
			retargetDropAt(e_5.clientX, e_5.clientY);
			kickAutoScroll();
		};
		$[64] = retargetDropAt;
		$[65] = searchQuery;
		$[66] = t34;
	} else t34 = $[66];
	const handleListDragOver = t34;
	let t35;
	if ($[67] !== hitTestLayerRow || $[68] !== onDragElements || $[69] !== searchQuery || $[70] !== store) {
		t35 = (e_6) => {
			e_6.preventDefault();
			if (searchQuery.trim().length > 0) {
				handleDragEnd();
				return;
			}
			const ids_2 = dragIdsRef.current;
			const hit_1 = hitTestLayerRow(e_6.clientX, e_6.clientY);
			if (ids_2 && onDragElements && hit_1 && !ids_2.has(hit_1.row.id) && !hasAncestorIn(store, hit_1.row.id, ids_2)) {
				const element_4 = getById(store, hit_1.row.id);
				if (element_4) {
					const canHaveChildren_1 = hasChildren$1(element_4);
					const expanded_1 = canHaveChildren_1 && getChildren$2(store, hit_1.row.id).length > 0 && !collapsedIdsRef.current.has(hit_1.row.id);
					const intent_0 = resolveLayerTreeDrop(store, {
						hoveredId: hit_1.row.id,
						depth: hit_1.row.depth,
						canHaveChildren: canHaveChildren_1,
						expanded: expanded_1,
						xInRow: e_6.clientX - hit_1.rect.left,
						yRatio: (e_6.clientY - hit_1.rect.top) / (hit_1.rect.height || 1),
						indentBase: INDENT_BASE$1,
						indentStep: INDENT_STEP$1,
						sticky: dropStickyRef.current,
						dragIds: ids_2,
						allowInside: nestDwellRef.current.armed && nestDwellRef.current.hoveredId === hit_1.row.id
					});
					if (!ids_2.has(intent_0.targetId)) onDragElements([...ids_2], intent_0.targetId, intent_0.position);
				}
			}
			handleDragEnd();
		};
		$[67] = hitTestLayerRow;
		$[68] = onDragElements;
		$[69] = searchQuery;
		$[70] = store;
		$[71] = t35;
	} else t35 = $[71];
	const handleListDrop = t35;
	let t36;
	if ($[72] === Symbol.for("react.memo_cache_sentinel")) {
		t36 = (e_7) => {
			const related = e_7.relatedTarget;
			if (related && e_7.currentTarget.contains(related)) return;
			stopAutoScroll();
			resetNestDwell();
			dropStickyRef.current = null;
			clearDropPaint();
		};
		$[72] = t36;
	} else t36 = $[72];
	const handleListDragLeave = t36;
	let filtering;
	let matches;
	let searchResult;
	let t37;
	let visibleRows;
	if ($[73] !== collapsedIds || $[74] !== searchQuery || $[75] !== store) {
		const searchIndex = createLayerSearchIndex();
		let t38;
		if ($[81] !== searchQuery) {
			t38 = searchQuery.trim();
			$[81] = searchQuery;
			$[82] = t38;
		} else t38 = $[82];
		filtering = t38.length > 0;
		searchResult = searchIndex.search(store, searchQuery);
		matches = searchResult?.matches ?? [];
		const resultRows = matches.length ? withTextParents(store, matches) : [];
		const tree = filtering ? null : treeRows(store, collapsedIds);
		visibleRows = tree ? tree.rows : flattenSearchLayerRows(resultRows);
		t37 = tree ? tree.indexById : layerRowIndexById(visibleRows);
		$[73] = collapsedIds;
		$[74] = searchQuery;
		$[75] = store;
		$[76] = filtering;
		$[77] = matches;
		$[78] = searchResult;
		$[79] = t37;
		$[80] = visibleRows;
	} else {
		filtering = $[76];
		matches = $[77];
		searchResult = $[78];
		t37 = $[79];
		visibleRows = $[80];
	}
	const indexById = t37;
	let t38;
	if ($[83] !== collapsedIds || $[84] !== indexById || $[85] !== store || $[86] !== visibleRows) {
		t38 = () => {
			storeRef.current = store;
			collapsedIdsRef.current = collapsedIds;
			visibleRowsRef.current = visibleRows;
			indexByIdRef.current = indexById;
		};
		$[83] = collapsedIds;
		$[84] = indexById;
		$[85] = store;
		$[86] = visibleRows;
		$[87] = t38;
	} else t38 = $[87];
	(0, import_react.useLayoutEffect)(t38);
	let t39;
	if ($[88] !== indexById || $[89] !== selectedElementIds || $[90] !== store) {
		const firstSelectedId = selectedElementIds.values().next().value;
		const revealId = firstSelectedId !== void 0 && isTextLikeOwner(store, firstSelectedId) ? getChildren$2(store, firstSelectedId)[0] ?? firstSelectedId : firstSelectedId;
		t39 = revealId === void 0 ? void 0 : indexById.get(revealId);
		$[88] = indexById;
		$[89] = selectedElementIds;
		$[90] = store;
		$[91] = t39;
	} else t39 = $[91];
	const revealIndex = t39;
	let t40;
	if ($[92] !== revealIndex) {
		t40 = () => {
			if (revealIndex == null) return;
			const virtualizer = virtualizerRef.current;
			if (virtualizer) revealLayerRow(virtualizer, revealIndex);
		};
		$[92] = revealIndex;
		$[93] = t40;
	} else t40 = $[93];
	let t41;
	if ($[94] !== collapsedIds || $[95] !== revealIndex || $[96] !== selectedElementIds) {
		t41 = [
			selectedElementIds,
			collapsedIds,
			revealIndex
		];
		$[94] = collapsedIds;
		$[95] = revealIndex;
		$[96] = selectedElementIds;
		$[97] = t41;
	} else t41 = $[97];
	(0, import_react.useEffect)(t40, t41);
	let shells;
	let stickyParents;
	let t42;
	if ($[98] !== filtering || $[99] !== indexById || $[100] !== selectedElementIds || $[101] !== store || $[102] !== visibleRows) {
		({shells, stickyParents} = layerSelectionLayout(store, visibleRows, indexById, selectedElementIds, filtering));
		t42 = new Set(shells.map(_temp7$13));
		$[98] = filtering;
		$[99] = indexById;
		$[100] = selectedElementIds;
		$[101] = store;
		$[102] = visibleRows;
		$[103] = shells;
		$[104] = stickyParents;
		$[105] = t42;
	} else {
		shells = $[103];
		stickyParents = $[104];
		t42 = $[105];
	}
	const shellEnds = t42;
	let pinnedIndexes;
	if ($[106] !== indexById || $[107] !== openMenuId || $[108] !== renamingId) {
		pinnedIndexes = [];
		if (renamingId != null) {
			let t43;
			if ($[110] !== indexById || $[111] !== renamingId) {
				t43 = indexById.get(renamingId);
				$[110] = indexById;
				$[111] = renamingId;
				$[112] = t43;
			} else t43 = $[112];
			const i = t43;
			if (i != null) pinnedIndexes.push(i);
		}
		if (openMenuId != null) {
			let t43;
			if ($[113] !== indexById || $[114] !== openMenuId) {
				t43 = indexById.get(openMenuId);
				$[113] = indexById;
				$[114] = openMenuId;
				$[115] = t43;
			} else t43 = $[115];
			const i_0 = t43;
			if (i_0 != null) pinnedIndexes.push(i_0);
		}
		$[106] = indexById;
		$[107] = openMenuId;
		$[108] = renamingId;
		$[109] = pinnedIndexes;
	} else pinnedIndexes = $[109];
	let t43;
	if ($[116] !== collapsedIds || $[117] !== dragIds || $[118] !== filtering || $[119] !== handleDragStart || $[120] !== handleRename || $[121] !== handleStartRename || $[122] !== onFocusElement || $[123] !== onSelectElement || $[124] !== onSelectElements || $[125] !== pendingName || $[126] !== renamingId || $[127] !== searchQuery || $[128] !== selectedElementIds || $[129] !== shellEnds || $[130] !== store || $[131] !== visibleRows) {
		t43 = (index_2) => {
			const row_3 = visibleRows[index_2];
			if (!row_3) return null;
			const stored = getById(store, row_3.id);
			if (!stored) return null;
			const name_0 = pendingName.nameOf(stored.id, stored.name ?? "");
			const element_5 = name_0 === (stored.name ?? "") ? stored : {
				...stored,
				name: name_0 || void 0
			};
			const childIds = getChildren$2(store, row_3.id);
			const isInherited = isInheritedLayerRow(store, element_5.id, selectedElementIds, filtering);
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayerRow, {
				element: element_5,
				depth: row_3.depth,
				index: index_2,
				subtreeEnd: row_3.subtreeEnd,
				isSelected: selectedElementIds.has(element_5.id),
				isInherited,
				endsShell: isInherited && shellEnds.has(index_2 + 1),
				isCollapsed: collapsedIds.has(element_5.id),
				isDragging: dragIds?.has(element_5.id) ?? false,
				isEditing: renamingId === element_5.id,
				flat: filtering,
				searchQuery,
				store,
				currentlyHasChildren: hasChildren$1(element_5) && childIds.length > 0,
				onRename: handleRename,
				onRenameDone: handleRenameDone,
				onSelectElement,
				onSelectElements,
				onFocusElement,
				onDragStart: handleDragStart,
				onDragEnd: handleDragEnd,
				onToggleCollapse: toggleCollapse,
				onStartRename: handleStartRename,
				anchorIdRef
			});
		};
		$[116] = collapsedIds;
		$[117] = dragIds;
		$[118] = filtering;
		$[119] = handleDragStart;
		$[120] = handleRename;
		$[121] = handleStartRename;
		$[122] = onFocusElement;
		$[123] = onSelectElement;
		$[124] = onSelectElements;
		$[125] = pendingName;
		$[126] = renamingId;
		$[127] = searchQuery;
		$[128] = selectedElementIds;
		$[129] = shellEnds;
		$[130] = store;
		$[131] = visibleRows;
		$[132] = t43;
	} else t43 = $[132];
	const renderLayerRow = t43;
	const noMatches = filtering && matches.length === 0;
	const resultCount = searchResult?.truncated ? `300+ results` : `${matches.length} ${matches.length === 1 ? "result" : "results"}`;
	const t44 = headerVariant === "default" && "pt-1";
	const t45 = headerVariant === "sidebar-v2" && "border-t border-ed-border";
	let t46;
	if ($[133] !== t44 || $[134] !== t45) {
		t46 = cn$2("h-full min-w-0 flex flex-col", t44, t45);
		$[133] = t44;
		$[134] = t45;
		$[135] = t46;
	} else t46 = $[135];
	let t47;
	if ($[136] !== collapseAll || $[137] !== hasExpanded || $[138] !== headerVariant || $[139] !== searchInputRef || $[140] !== searchQuery || $[141] !== setSearchQuery) {
		t47 = headerVariant === "default" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "px-3 pb-2 border-b border-ed-border flex items-center gap-1.5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex-1 min-w-0",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelSearchInput, {
					inputRef: searchInputRef,
					value: searchQuery,
					onChange: setSearchQuery,
					onKeyDown: (e_8) => {
						if (e_8.nativeEvent.isComposing || e_8.keyCode === 229) return;
						if (e_8.key === "Escape") setSearchQuery("");
					},
					placeholder: "Search layers..."
				})
			}), hasExpanded && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					size: "icon",
					isChildText: false,
					"aria-label": "Collapse layers",
					onClick: collapseAll,
					className: "size-8",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CollapseAllIcon, { className: "size-4 text-ed-muted-foreground" })
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipContent, {
				side: "bottom",
				children: "Collapse layers ⌥L"
			})] })]
		});
		$[136] = collapseAll;
		$[137] = hasExpanded;
		$[138] = headerVariant;
		$[139] = searchInputRef;
		$[140] = searchQuery;
		$[141] = setSearchQuery;
		$[142] = t47;
	} else t47 = $[142];
	let t48;
	if ($[143] !== allCollapsed || $[144] !== expandableIds.length || $[145] !== hasScrolled || $[146] !== headerVariant || $[147] !== toggleAll) {
		t48 = headerVariant === "sidebar-v2" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarSectionHeader, {
			title: "Layers",
			showScrollBorder: hasScrolled,
			alignWithLayerRows: true,
			leadingAction: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "ghost",
				size: "icon-3xs",
				isChildText: false,
				"aria-label": allCollapsed ? "Expand all layers" : "Collapse all layers",
				title: `${allCollapsed ? "Expand all layers" : "Collapse all layers"} ⌥L`,
				onClick: toggleAll,
				disabled: expandableIds.length === 0,
				className: "h-6.5 w-4 text-ed-foreground-secondary hover:bg-transparent hover:text-ed-foreground [&_svg]:translate-x-0.5",
				children: allCollapsed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OpenAllIcon, { className: "size-2.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CollapseAllIcon, { className: "size-2.5" })
			})
		});
		$[143] = allCollapsed;
		$[144] = expandableIds.length;
		$[145] = hasScrolled;
		$[146] = headerVariant;
		$[147] = toggleAll;
		$[148] = t48;
	} else t48 = $[148];
	let t49;
	if ($[149] !== filtering || $[150] !== noMatches || $[151] !== resultCount) {
		t49 = filtering && !noMatches && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "px-3 py-1",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
				size: "3xs",
				variant: "secondary",
				children: resultCount
			})
		});
		$[149] = filtering;
		$[150] = noMatches;
		$[151] = resultCount;
		$[152] = t49;
	} else t49 = $[152];
	let t50;
	if ($[153] !== dragIds || $[154] !== filtering || $[155] !== noMatches || $[156] !== onContextMenuRow || $[157] !== openMenuId || $[158] !== pinnedIndexes || $[159] !== renderLayerRow || $[160] !== renderRowContextMenu || $[161] !== scrollElement || $[162] !== shells || $[163] !== stickyParents || $[164] !== suppressMenuCloseFocusRef || $[165] !== visibleRows) {
		t50 = noMatches ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex items-center justify-center h-32",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
				size: "3xs",
				variant: "tertiary",
				children: "No matching layers"
			})
		}) : visibleRows.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ContextMenu$1, {
			onOpenChange: (open) => {
				if (!open) setOpenMenuId(null);
			},
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ContextMenuTrigger, {
				asChild: true,
				onContextMenu: (e_9) => {
					const id_7 = e_9.target.closest("[data-layer-id]")?.getAttribute("data-layer-id");
					if (!id_7 || !renderRowContextMenu) {
						e_9.preventDefault();
						return;
					}
					setOpenMenuId(id_7);
					onContextMenuRow?.(id_7);
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "w-max min-w-full px-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VirtualizedLayerRows, {
						count: visibleRows.length,
						getItemKey: (i_1) => visibleRows[i_1]?.id ?? String(i_1),
						scrollElement,
						pinnedIndexes,
						overscan: dragIds ? 24 : 8,
						listRef: dropListRef,
						virtualizerRef,
						minWidthResetKey: `${filtering}:${visibleRows.length}:${visibleRows[0]?.id ?? ""}:${visibleRows[visibleRows.length - 1]?.id ?? ""}`,
						shells,
						stickyParents,
						renderRow: renderLayerRow,
						dropLine: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							ref: dropLineRef,
							className: "absolute left-0 right-0 z-20 h-0.5 -translate-y-1/2 rounded-full pointer-events-none opacity-0",
							style: {
								marginRight: DROP_LINE_RIGHT_INSET,
								backgroundColor: "var(--ed-canvas-selection)"
							}
						})
					})
				})
			}), openMenuId != null && renderRowContextMenu && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ContextMenuContent, {
				className: "min-w-[14rem]",
				onCloseAutoFocus: (e_10) => {
					if (suppressMenuCloseFocusRef?.current) {
						e_10.preventDefault();
						suppressMenuCloseFocusRef.current = false;
					}
				},
				children: renderRowContextMenu(openMenuId)
			})]
		}) : null;
		$[153] = dragIds;
		$[154] = filtering;
		$[155] = noMatches;
		$[156] = onContextMenuRow;
		$[157] = openMenuId;
		$[158] = pinnedIndexes;
		$[159] = renderLayerRow;
		$[160] = renderRowContextMenu;
		$[161] = scrollElement;
		$[162] = shells;
		$[163] = stickyParents;
		$[164] = suppressMenuCloseFocusRef;
		$[165] = visibleRows;
		$[166] = t50;
	} else t50 = $[166];
	let t51;
	if ($[167] !== handleListDragOver || $[168] !== handleListDrop || $[169] !== t50 || $[170] !== viewportRef) {
		t51 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
			horizontal: true,
			viewportRef,
			viewportClassName: "overscroll-x-contain",
			className: "flex-1 min-w-0",
			"data-horizontal-scroll": "",
			onDragOver: handleListDragOver,
			onDrop: handleListDrop,
			onDragLeave: handleListDragLeave,
			onMouseOver: handleRowHover,
			onMouseLeave: handleRowUnhover,
			children: t50
		});
		$[167] = handleListDragOver;
		$[168] = handleListDrop;
		$[169] = t50;
		$[170] = viewportRef;
		$[171] = t51;
	} else t51 = $[171];
	let t52;
	if ($[172] !== t46 || $[173] !== t47 || $[174] !== t48 || $[175] !== t49 || $[176] !== t51) {
		t52 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			"data-ph-block": true,
			className: t46,
			children: [
				t47,
				t48,
				t49,
				t51
			]
		});
		$[172] = t46;
		$[173] = t47;
		$[174] = t48;
		$[175] = t49;
		$[176] = t51;
		$[177] = t52;
	} else t52 = $[177];
	return t52;
}
function _temp7$13(shell) {
	return shell.end;
}
function _temp6$16(s) {
	return s.hoveredId;
}
function _temp5$21() {
	useHover.getState().clearHover();
}
function _temp4$24(e) {
	const id = e.target?.closest?.("[data-layer-id]")?.getAttribute("data-layer-id");
	if (id) useHover.getState().setHovered(id, "panel");
	else useHover.getState().clearHover();
}
function _temp3$25() {}
function _temp2$34() {
	return /* @__PURE__ */ new Set();
}
var LayersPanelWithStore = withVisibleTree(LayersPanel);
function LayersPanelLive(props) {
	const $ = (0, import_compiler_runtime.c)(3);
	const selectedElementIds = useSelectedElementIds();
	let t0;
	if ($[0] !== props || $[1] !== selectedElementIds) {
		t0 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayersPanelWithStore, {
			...props,
			selectedElementIds
		});
		$[0] = props;
		$[1] = selectedElementIds;
		$[2] = t0;
	} else t0 = $[2];
	return t0;
}

export { LayersPanelLive };
