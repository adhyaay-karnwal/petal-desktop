// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/panels/PagesPanel.tsx
import { import_jsx_runtime, import_react } from "../../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../../cloud/src/hooks/useSession.js";
import { cn$2 } from "../../../../../ui/src/lib/utils.js";
import { FileIcon, PlusIcon, SearchIcon, SpinnerIcon } from "../../../../../ui/src/icons.js";
import { Text$4 } from "../../../../../ui/src/components/Text.js";
import { Button, buttonClassName } from "../../../../../ui/src/components/Button.js";
import { InlineRenameInput } from "../../../../../ui/src/components/InlineRenameInput.js";
import { ContextMenu$1, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "../../../../../ui/src/components/ContextMenu.js";
import { ScrollArea } from "../../../../../ui/src/components/ScrollArea.js";
import { IconBtn } from "./styles/primitives.js";
import { SidebarSectionHeader } from "../SidebarSectionHeader.js";
import { useScrolledHeader } from "../../hooks/useScrolledHeader.js";
import { ConfirmDialog } from "../ConfirmDialog.js";

var PAGE_ROW_LEFT_PADDING = 18;
function PageRowContextMenu(t0) {
	const $ = (0, import_compiler_runtime.c)(15);
	const { children, disabled, onRename, onDelete } = t0;
	const pendingAction = (0, import_react.useRef)(null);
	let t1;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t1 = (open) => {
			if (open) pendingAction.current = null;
		};
		$[0] = t1;
	} else t1 = $[0];
	const t2 = disabled || !onRename && !onDelete;
	let t3;
	if ($[1] !== children || $[2] !== t2) {
		t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ContextMenuTrigger, {
			asChild: true,
			disabled: t2,
			children
		});
		$[1] = children;
		$[2] = t2;
		$[3] = t3;
	} else t3 = $[3];
	let t4;
	if ($[4] === Symbol.for("react.memo_cache_sentinel")) {
		t4 = (event) => {
			const action = pendingAction.current;
			if (action) {
				event.preventDefault();
				pendingAction.current = null;
				requestAnimationFrame(action);
			}
		};
		$[4] = t4;
	} else t4 = $[4];
	let t5;
	if ($[5] !== onRename) {
		t5 = onRename && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ContextMenuItem, {
			onSelect: () => {
				pendingAction.current = onRename;
			},
			children: "Rename"
		});
		$[5] = onRename;
		$[6] = t5;
	} else t5 = $[6];
	let t6;
	if ($[7] !== onDelete) {
		t6 = onDelete && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ContextMenuItem, {
			onSelect: () => {
				pendingAction.current = onDelete;
			},
			children: "Delete"
		});
		$[7] = onDelete;
		$[8] = t6;
	} else t6 = $[8];
	let t7;
	if ($[9] !== t5 || $[10] !== t6) {
		t7 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ContextMenuContent, {
			onCloseAutoFocus: t4,
			children: [t5, t6]
		});
		$[9] = t5;
		$[10] = t6;
		$[11] = t7;
	} else t7 = $[11];
	let t8;
	if ($[12] !== t3 || $[13] !== t7) {
		t8 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ContextMenu$1, {
			onOpenChange: t1,
			children: [t3, t7]
		});
		$[12] = t3;
		$[13] = t7;
		$[14] = t8;
	} else t8 = $[14];
	return t8;
}
function PagesPanel(t0) {
	const $ = (0, import_compiler_runtime.c)(60);
	const { pages, activePageId, isPageLoading, onSelectPage, onCreatePage, onRenamePage, onDeletePage, onReorderPages, readOnly: t1, variant: t2, expanded, onExpandedChange, onSearchClick } = t0;
	const readOnly = t1 === void 0 ? false : t1;
	const sidebarV2 = (t2 === void 0 ? "default" : t2) === "sidebar-v2";
	const { hasScrolled, viewportRef } = useScrolledHeader();
	const [internalExpanded, setInternalExpanded] = (0, import_react.useState)(true);
	const isExpanded = expanded ?? internalExpanded;
	let t3;
	if ($[0] !== expanded || $[1] !== onExpandedChange) {
		t3 = (next) => {
			if (expanded === void 0) setInternalExpanded(next);
			onExpandedChange?.(next);
		};
		$[0] = expanded;
		$[1] = onExpandedChange;
		$[2] = t3;
	} else t3 = $[2];
	const setExpanded = t3;
	const [editingPageId, setEditingPageId] = (0, import_react.useState)(null);
	const [showDeletePage, setShowDeletePage] = (0, import_react.useState)(false);
	const [pageToDelete, setPageToDelete] = (0, import_react.useState)(null);
	const [draggedId, setDraggedId] = (0, import_react.useState)(null);
	const [dropIndex, setDropIndex] = (0, import_react.useState)(null);
	const listRef = (0, import_react.useRef)(null);
	const pointerStartY = (0, import_react.useRef)(0);
	const didDrag = (0, import_react.useRef)(false);
	const draggedIdRef = (0, import_react.useRef)(null);
	const dropIndexRef = (0, import_react.useRef)(null);
	const canRename = !readOnly && !!onRenamePage;
	let t4;
	if ($[3] !== canRename) {
		t4 = (page) => {
			if (canRename) setEditingPageId(page.id);
		};
		$[3] = canRename;
		$[4] = t4;
	} else t4 = $[4];
	const handleStartRename = t4;
	let t5;
	if ($[5] !== onRenamePage) {
		t5 = (page_0, className) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InlineRenameInput, {
			"aria-label": `Rename ${page_0.name}`,
			value: page_0.name,
			onCommit: (name) => {
				if (name) onRenamePage?.(page_0.id, name);
			},
			onDone: () => setEditingPageId(null),
			className
		});
		$[5] = onRenamePage;
		$[6] = t5;
	} else t5 = $[6];
	const renameField = t5;
	let t6;
	if ($[7] === Symbol.for("react.memo_cache_sentinel")) {
		t6 = (page_1) => {
			setPageToDelete(page_1);
			setShowDeletePage(true);
		};
		$[7] = t6;
	} else t6 = $[7];
	const handleDelete = t6;
	let t7;
	if ($[8] !== onDeletePage || $[9] !== pageToDelete) {
		t7 = () => {
			if (pageToDelete && onDeletePage) onDeletePage(pageToDelete.id);
			setShowDeletePage(false);
			setPageToDelete(null);
		};
		$[8] = onDeletePage;
		$[9] = pageToDelete;
		$[10] = t7;
	} else t7 = $[10];
	const confirmDeletePage = t7;
	const computeDropIndex = (clientY) => {
		const list = listRef.current;
		if (!list) return null;
		const items = Array.from(list.querySelectorAll(":scope > [data-page-row]"));
		for (let i = 0; i < items.length; i++) {
			const rect = items[i].getBoundingClientRect();
			if (clientY < rect.top + rect.height / 2) return i;
		}
		return items.length;
	};
	const handlePointerDown = (e, pageId) => {
		if (readOnly || editingPageId) return;
		if (e.button !== 0) return;
		const target = e.target;
		if (sidebarV2 ? target.closest("[data-page-action]") : target.closest("button")) return;
		pointerStartY.current = e.clientY;
		didDrag.current = false;
		const startPageId = pageId;
		const onMove = (me) => {
			if (Math.abs(me.clientY - pointerStartY.current) > 4) {
				didDrag.current = true;
				draggedIdRef.current = startPageId;
				setDraggedId(startPageId);
				const nextIndex = computeDropIndex(me.clientY);
				dropIndexRef.current = nextIndex;
				setDropIndex(nextIndex);
			}
			if (didDrag.current) {
				const nextIndex_0 = computeDropIndex(me.clientY);
				dropIndexRef.current = nextIndex_0;
				setDropIndex(nextIndex_0);
			}
		};
		const onUp = () => {
			document.removeEventListener("pointermove", onMove);
			document.removeEventListener("pointerup", onUp);
			if (didDrag.current) {
				const prev = draggedIdRef.current;
				const prevDrop = dropIndexRef.current;
				if (prev && prevDrop !== null && onReorderPages) {
					const fromIndex = pages.findIndex((p) => p.id === prev);
					let toIndex = prevDrop;
					if (toIndex > fromIndex) toIndex--;
					if (fromIndex !== -1 && toIndex !== fromIndex) {
						const reordered = [...pages];
						const [moved] = reordered.splice(fromIndex, 1);
						reordered.splice(toIndex, 0, moved);
						onReorderPages(reordered);
					}
				}
				draggedIdRef.current = null;
				dropIndexRef.current = null;
				setDraggedId(null);
				setDropIndex(null);
			}
		};
		document.addEventListener("pointermove", onMove);
		document.addEventListener("pointerup", onUp);
	};
	if (sidebarV2) {
		let t8;
		if ($[11] === Symbol.for("react.memo_cache_sentinel")) {
			t8 = cn$2("flex h-full min-h-0 flex-col");
			$[11] = t8;
		} else t8 = $[11];
		const t9 = isExpanded && hasScrolled;
		let t10;
		if ($[12] !== isExpanded || $[13] !== setExpanded) {
			t10 = () => setExpanded(!isExpanded);
			$[12] = isExpanded;
			$[13] = setExpanded;
			$[14] = t10;
		} else t10 = $[14];
		let t11;
		if ($[15] !== onSearchClick) {
			t11 = onSearchClick && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
				"data-page-action": "",
				label: "Search layers",
				onClick: onSearchClick,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchIcon, {})
			});
			$[15] = onSearchClick;
			$[16] = t11;
		} else t11 = $[16];
		let t12;
		if ($[17] !== onCreatePage || $[18] !== readOnly) {
			t12 = !readOnly && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
				"data-page-action": "",
				label: "Create new page",
				onClick: onCreatePage,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlusIcon, {})
			});
			$[17] = onCreatePage;
			$[18] = readOnly;
			$[19] = t12;
		} else t12 = $[19];
		let t13;
		if ($[20] !== t11 || $[21] !== t12) {
			t13 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-0.5",
				children: [t11, t12]
			});
			$[20] = t11;
			$[21] = t12;
			$[22] = t13;
		} else t13 = $[22];
		let t14;
		if ($[23] !== isExpanded || $[24] !== t10 || $[25] !== t13 || $[26] !== t9) {
			t14 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarSectionHeader, {
				title: "Pages",
				className: "pr-2",
				showScrollBorder: t9,
				alignWithLayerRows: true,
				expanded: isExpanded,
				onToggle: t10,
				actions: t13
			});
			$[23] = isExpanded;
			$[24] = t10;
			$[25] = t13;
			$[26] = t9;
			$[27] = t14;
		} else t14 = $[27];
		const t15 = isExpanded && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
			className: "min-h-0 flex-1",
			viewportRef,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				ref: listRef,
				className: "relative flex w-full flex-col gap-0.5 px-2 pb-2",
				children: [pages.map((page_2, index) => {
					const isActive = page_2.id === activePageId;
					const isEditing = editingPageId === page_2.id;
					const isDragging = draggedId === page_2.id;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageRowContextMenu, {
						disabled: readOnly || isEditing,
						onRename: onRenamePage ? () => handleStartRename(page_2) : void 0,
						onDelete: pages.length > 1 && onDeletePage ? () => handleDelete(page_2) : void 0,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-page-row": "",
							onPointerDown: (e_0) => handlePointerDown(e_0, page_2.id),
							className: cn$2("group relative flex w-full shrink-0 select-none", isDragging && "opacity-30"),
							children: [dropIndex === index && draggedId && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "pointer-events-none absolute -top-0.5 left-0 right-0 z-10 h-0.5 rounded-full",
								style: {
									marginRight: 12,
									backgroundColor: "var(--ed-canvas-selection)"
								}
							}), isEditing ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-active": isActive ? "true" : void 0,
								className: buttonClassName("ghost", "text", cn$2("h-6.5 justify-start gap-2 rounded-[5px] px-1.5 text-ed-ui font-normal text-ed-foreground-secondary hover:text-ed-foreground [&_svg]:size-4", "data-[active=true]:bg-ed-accent data-[active=true]:text-ed-foreground", "w-full gap-1.5 [&_svg]:size-3.5")),
								style: { paddingLeft: PAGE_ROW_LEFT_PADDING },
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileIcon, {
										width: 14,
										height: 14,
										className: "size-3.5 shrink-0 text-ed-foreground-secondary"
									}),
									renameField(page_2, "flex-1 text-left"),
									isActive && isPageLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpinnerIcon, { className: "shrink-0 animate-spin text-ed-foreground-secondary" })
								]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								type: "button",
								variant: "ghost",
								size: "text",
								isChildText: false,
								"data-active": isActive ? "true" : void 0,
								className: cn$2("h-6.5 justify-start gap-2 rounded-[5px] px-1.5 text-ed-ui font-normal text-ed-foreground-secondary hover:text-ed-foreground [&_svg]:size-4", "data-[active=true]:bg-ed-accent data-[active=true]:text-ed-foreground", "w-full gap-1.5 [&_svg]:size-3.5", draggedId && "pointer-events-none hover:bg-transparent! hover:text-ed-foreground-secondary!"),
								style: { paddingLeft: PAGE_ROW_LEFT_PADDING },
								onClick: () => {
									if (!didDrag.current) onSelectPage(page_2.id);
								},
								onDoubleClick: () => handleStartRename(page_2),
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileIcon, {
										width: 14,
										height: 14,
										className: "size-3.5 shrink-0 text-ed-foreground-secondary"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "min-w-0 flex-1 truncate text-left",
										children: page_2.name
									}),
									isActive && isPageLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpinnerIcon, { className: "shrink-0 animate-spin text-ed-foreground-secondary" })
								]
							})]
						})
					}, page_2.id);
				}), dropIndex === pages.length && draggedId && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "pointer-events-none absolute bottom-0 left-0 right-0 z-10 h-0.5 rounded-full",
					style: {
						marginRight: 12,
						backgroundColor: "var(--ed-canvas-selection)"
					}
				})]
			})
		});
		let t16;
		if ($[28] === Symbol.for("react.memo_cache_sentinel")) {
			t16 = () => {
				setShowDeletePage(false);
				setPageToDelete(null);
			};
			$[28] = t16;
		} else t16 = $[28];
		const t17 = `${pageToDelete?.name} and all its versions will be permanently deleted. Commit to Git first to keep a copy.`;
		let t18;
		if ($[29] !== confirmDeletePage || $[30] !== showDeletePage || $[31] !== t17) {
			t18 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmDialog, {
				isOpen: showDeletePage,
				onClose: t16,
				onConfirm: confirmDeletePage,
				title: "Delete page",
				description: t17,
				confirmText: "Delete page",
				destructive: true
			});
			$[29] = confirmDeletePage;
			$[30] = showDeletePage;
			$[31] = t17;
			$[32] = t18;
		} else t18 = $[32];
		let t19;
		if ($[33] !== t14 || $[34] !== t15 || $[35] !== t18) {
			t19 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: t8,
				children: [
					t14,
					t15,
					t18
				]
			});
			$[33] = t14;
			$[34] = t15;
			$[35] = t18;
			$[36] = t19;
		} else t19 = $[36];
		return t19;
	}
	const t8 = "flex flex-col";
	let t9;
	if ($[37] === Symbol.for("react.memo_cache_sentinel")) {
		t9 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
			size: "xs",
			weight: "semibold",
			variant: "primary",
			children: "Pages"
		});
		$[37] = t9;
	} else t9 = $[37];
	let t10;
	if ($[38] !== onCreatePage || $[39] !== readOnly) {
		t10 = !readOnly && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "ghost",
			size: "icon-2xs",
			onClick: onCreatePage,
			title: "Create new page",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlusIcon, {
				width: 14,
				height: 14
			})
		});
		$[38] = onCreatePage;
		$[39] = readOnly;
		$[40] = t10;
	} else t10 = $[40];
	let t11;
	if ($[41] !== t10) {
		t11 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between px-4 py-3",
			children: [t9, t10]
		});
		$[41] = t10;
		$[42] = t11;
	} else t11 = $[42];
	const t12 = "relative flex flex-col gap-0.5 pb-2";
	const t13 = pages.map((page_3, index_0) => {
		const isActive_0 = page_3.id === activePageId;
		const isEditing_0 = editingPageId === page_3.id;
		const isDragging_0 = draggedId === page_3.id;
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageRowContextMenu, {
			disabled: readOnly || isEditing_0,
			onRename: onRenamePage ? () => handleStartRename(page_3) : void 0,
			onDelete: pages.length > 1 && onDeletePage ? () => handleDelete(page_3) : void 0,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-page-row": "",
				onPointerDown: (e_1) => handlePointerDown(e_1, page_3.id),
				className: cn$2("group flex items-center gap-2 px-4 py-1.5 cursor-default hover:bg-ed-accent/50 relative select-none", isActive_0 && "bg-ed-accent font-medium", isDragging_0 && "opacity-30"),
				onClick: () => {
					if (!didDrag.current && !isEditing_0) onSelectPage(page_3.id);
				},
				onDoubleClick: isEditing_0 ? void 0 : () => handleStartRename(page_3),
				children: [
					dropIndex === index_0 && draggedId && !isDragging_0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute -top-px left-2 right-2 h-0.5 bg-ed-primary rounded-full pointer-events-none z-10" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
						size: "sm",
						variant: isActive_0 ? "primary" : "secondary",
						className: cn$2("flex-1 select-none", isEditing_0 ? "flex min-w-0" : "truncate"),
						children: isEditing_0 ? renameField(page_3, "flex-1") : page_3.name
					}),
					isActive_0 && isPageLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpinnerIcon, {
						width: 14,
						height: 14,
						className: "shrink-0 text-ed-muted-foreground animate-spin"
					})
				]
			})
		}, page_3.id);
	});
	let t14;
	if ($[43] !== draggedId || $[44] !== dropIndex || $[45] !== pages.length) {
		t14 = dropIndex === pages.length && draggedId && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute bottom-2 left-2 right-2 h-0.5 bg-ed-primary rounded-full pointer-events-none z-10" });
		$[43] = draggedId;
		$[44] = dropIndex;
		$[45] = pages.length;
		$[46] = t14;
	} else t14 = $[46];
	let t15;
	if ($[47] !== listRef || $[48] !== t13 || $[49] !== t14) {
		t15 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			ref: listRef,
			className: t12,
			children: [t13, t14]
		});
		$[47] = listRef;
		$[48] = t13;
		$[49] = t14;
		$[50] = t15;
	} else t15 = $[50];
	let t16;
	if ($[51] === Symbol.for("react.memo_cache_sentinel")) {
		t16 = () => {
			setShowDeletePage(false);
			setPageToDelete(null);
		};
		$[51] = t16;
	} else t16 = $[51];
	const t17 = `${pageToDelete?.name} and all its versions will be permanently deleted. Commit to Git first to keep a copy.`;
	let t18;
	if ($[52] !== confirmDeletePage || $[53] !== showDeletePage || $[54] !== t17) {
		t18 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmDialog, {
			isOpen: showDeletePage,
			onClose: t16,
			onConfirm: confirmDeletePage,
			title: "Delete page",
			description: t17,
			confirmText: "Delete page",
			destructive: true
		});
		$[52] = confirmDeletePage;
		$[53] = showDeletePage;
		$[54] = t17;
		$[55] = t18;
	} else t18 = $[55];
	let t19;
	if ($[56] !== t11 || $[57] !== t15 || $[58] !== t18) {
		t19 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: t8,
			children: [
				t11,
				t15,
				t18
			]
		});
		$[56] = t11;
		$[57] = t15;
		$[58] = t18;
		$[59] = t19;
	} else t19 = $[59];
	return t19;
}

export { PagesPanel };
