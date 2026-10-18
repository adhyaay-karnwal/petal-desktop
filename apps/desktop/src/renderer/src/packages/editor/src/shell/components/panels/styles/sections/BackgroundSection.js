// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/panels/styles/sections/BackgroundSection.tsx
import { import_jsx_runtime, import_react } from "../../../../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../../../../cloud/src/hooks/useSession.js";
import { AddVariableIcon, CaretDownIcon, MinusIcon, PlusIcon, UnlinkIcon } from "../../../../../../../ui/src/icons.js";
import { Text$4 } from "../../../../../../../ui/src/components/Text.js";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../../../../../../ui/src/components/DropdownMenu.js";
import { Popover, PopoverAnchor, PopoverTrigger } from "../../../../../../../ui/src/components/Popover.js";
import { IMAGE_ADJUST_PROP } from "../../../../../../../compiler/src/store/sanitize.js";
import { VIDEO_FILL_PROP, canHoldVideoFill, parseVideoFill, serializeVideoFill } from "../../../../../../../compiler/src/store/videoFill.js";
import { IconBtn, InspectorControlAction, InspectorControlShell, InspectorDraggableRow } from "../primitives.js";
import { parseTailwindClass } from "../../../../../shared/utils/tailwindScale.js";
import { ClassPickerPopover } from "../inputs/parts/ClassPickerPopover.js";
import { InspectorSection } from "./InspectorSection.js";
import { useStyleOps } from "../StyleOpsContext.js";
import { useClassesForProperty } from "../../../../hooks/useClassSuggestions.js";
import { onImageFillEditRequest } from "../../../../../shared/state/imageFillEdit.js";
import { isTransparentColor, parseFill } from "../../../../utils/fillValue.js";
import { isEmptyImage, isVideoFill, parseFills, serializeFills } from "../../../../utils/backgroundFills.js";
import { isBackgroundMixed, selectionBackgroundClasses } from "../../../../utils/backgroundSelection.js";
import { ImageAdjustments } from "../image/ImageAdjustments.js";
import { swapImageUrl } from "../image/imageUrls.js";
import { useImageFilePicker } from "../image/useImageFilePicker.js";
import { ColorRow } from "../inputs/ColorRow.js";

/**
* Background section — a Figma-style ordered list of fills. Each row is one fill
* (solid / gradient / image); the list serializes to layered CSS via
* {@link serializeFills}. Fills of any kind can repeat and stack (top row = top
* layer, drag the grip to reorder), each with a per-fill opacity and, when
* stacking, a blend mode. The bottom-most solid is the base color and may be
* linked to a Tailwind `bg-*` token (the variable button). The shared
* InspectorSection owns the empty/addable state; each fill row removes itself.
*
* The list is held in local state (stable ids for keys + reorder) and resynced
* from CSS when it changes underneath us (element switch, undo); every edit
* writes back.
*/
var BASE_FILL_KINDS = [
	"solid",
	"gradient",
	"image"
];
var MEDIA_FILL_KINDS = [...BASE_FILL_KINDS, "video"];
var KIND_LABEL = {
	solid: "Color",
	gradient: "Gradient",
	image: "Image",
	video: "Video"
};
var SIZE_TO_FIT$1 = {
	cover: "cover",
	contain: "contain",
	"100% 100%": "fill"
};
var fitToSize = (fit) => fit === "fill" ? "100% 100%" : fit;
var mediaUrlOf = (f) => {
	const fill = parseFill(f.value);
	return fill.kind === "image" || fill.kind === "video" ? fill.url : "";
};
/** The video fill a list stands for: its video row with an address, if any. */
function videoFillOf(fills) {
	const row = fills.find((f) => isVideoFill(f) && mediaUrlOf(f));
	return row ? {
		src: mediaUrlOf(row),
		fit: SIZE_TO_FIT$1[row.size ?? "cover"] ?? "cover"
	} : null;
}
var videoFillKey = (fill) => fill ? serializeVideoFill(fill) : "";
var BLEND_MODES = [
	"normal",
	"multiply",
	"screen",
	"overlay",
	"darken",
	"lighten",
	"difference",
	"exclusion"
];
var STYLE_KEYS = [
	"backgroundColor",
	"backgroundImage",
	"backgroundSize",
	"backgroundPosition",
	"backgroundRepeat",
	"backgroundBlendMode",
	"background"
];
var equalStyle = (a, b) => STYLE_KEYS.every((k) => (a[k] ?? "") === (b[k] ?? ""));
function BackgroundSection(t0) {
	const $ = (0, import_compiler_runtime.c)(16);
	const { selectedElements } = t0 === void 0 ? {} : t0;
	const ops = useStyleOps();
	const { setMultiple, removeClassesByCategory, addClassForProperty } = ops;
	const bgSuggestions = useClassesForProperty("backgroundColor");
	const mixed = isBackgroundMixed(selectedElements ?? []);
	const sharedToken = selectedElements && selectedElements.length > 1 && !mixed ? selectionBackgroundClasses(selectedElements).find((c) => bgSuggestions.some((x) => x.className === c) || parseTailwindClass(c)?.backgroundColor) : void 0;
	let t1;
	if ($[0] !== ops) {
		t1 = () => ({
			backgroundColor: ops.getExplicit("backgroundColor") || void 0,
			backgroundImage: ops.getExplicit("backgroundImage") || void 0,
			background: ops.getExplicit("background") || void 0,
			backgroundSize: ops.getExplicit("backgroundSize") || void 0,
			backgroundPosition: ops.getExplicit("backgroundPosition") || void 0,
			backgroundRepeat: ops.getExplicit("backgroundRepeat") || void 0,
			backgroundBlendMode: ops.getExplicit("backgroundBlendMode") || void 0
		});
		$[0] = ops;
		$[1] = t1;
	} else t1 = $[1];
	const readCss = t1;
	const buildFills = () => {
		if (mixed) return [{
			kind: "solid",
			value: ""
		}];
		const css = readCss();
		const src = ops.sourceProps("backgroundColor");
		const token = src?.source === "class" ? src.sourceClass : sharedToken;
		if (token) css.backgroundColor = void 0;
		const parsed = parseFills(css);
		if (token) parsed.push({
			kind: "solid",
			value: src?.source === "class" && ops.get("backgroundColor") || bgSuggestions.find((x_0) => x_0.className === token)?.value || parseTailwindClass(token)?.backgroundColor || "",
			token
		});
		const video = parseVideoFill(ops.element?.props?.[VIDEO_FILL_PROP]);
		if (video) parsed.unshift({
			kind: "video",
			value: `video("${video.src}")`,
			size: fitToSize(video.fit)
		});
		return parsed;
	};
	const [fills, setFills] = (0, import_react.useState)(() => buildFills().map(_temp$68));
	const [openId, setOpenId] = (0, import_react.useState)(null);
	const selectionKey = selectedElements?.map(_temp2$45).join(",") ?? ops.selectedElementId;
	const [openForElement, setOpenForElement] = (0, import_react.useState)(selectionKey);
	if (openForElement !== selectionKey) {
		setOpenForElement(selectionKey);
		setOpenId(null);
	}
	const [mediaFillRequested, setMediaFillRequested] = (0, import_react.useState)(false);
	const elementId = ops.selectedElementId;
	let t2;
	let t3;
	if ($[2] !== elementId) {
		t2 = () => onImageFillEditRequest((id) => {
			if (id === elementId) setMediaFillRequested(true);
		});
		t3 = [elementId];
		$[2] = elementId;
		$[3] = t2;
		$[4] = t3;
	} else {
		t2 = $[3];
		t3 = $[4];
	}
	(0, import_react.useEffect)(t2, t3);
	if (mediaFillRequested) {
		setMediaFillRequested(false);
		const media = fills.find(_temp3$32);
		if (media) setOpenId(media.id);
	}
	const [dragId, setDragId] = (0, import_react.useState)(null);
	const [mediaPreview, setMediaPreview] = (0, import_react.useState)(null);
	const dragStartOrder = (0, import_react.useRef)(null);
	const [showLibrary, setShowLibrary] = (0, import_react.useState)(false);
	const cssFills = buildFills();
	const cssStyle = serializeFills(cssFills);
	const cssToken = cssFills[cssFills.length - 1]?.token ?? "";
	const localToken = fills[fills.length - 1]?.token ?? "";
	if (dragId === null && (!equalStyle(cssStyle, serializeFills(fills)) || cssToken !== localToken || videoFillKey(videoFillOf(cssFills)) !== videoFillKey(videoFillOf(fills)))) setFills(buildFills().map(_temp4$30));
	const write = (rows) => {
		const next = [...rows.filter(isVideoFill), ...rows.filter(_temp5$27)];
		setFills(next);
		const video_0 = videoFillOf(next);
		if (videoFillKey(video_0) !== videoFillKey(videoFillOf(cssFills)) && ops.updateElement) ops.updateElement((t4) => {
			const { styles } = t4;
			return {
				styles: {
					...serializeFills(next),
					...video_0 && (!styles.position || styles.position === "static") ? { position: "relative" } : {},
					isolation: video_0 ? "isolate" : styles.isolation === "isolate" ? void 0 : styles.isolation
				},
				props: { [VIDEO_FILL_PROP]: video_0 ? serializeVideoFill(video_0) : void 0 }
			};
		});
		else setMultiple(serializeFills(next));
		const real = next.filter(_temp6$22);
		const base = real[real.length - 1];
		const token_0 = base?.kind === "solid" ? base.token : void 0;
		const classes = ops.elementClassName.split(/\s+/).filter(Boolean);
		if (token_0) {
			if (mixed || !classes.includes(token_0)) addClassForProperty(token_0, "backgroundColor");
		} else if (mixed) {
			const bgClasses = selectionBackgroundClasses(selectedElements ?? []);
			if (bgClasses.length) ops.removeClass(bgClasses);
		} else if (classes.some(_temp7$17)) removeClassesByCategory("background");
	};
	const imageAdjustments = (f_4) => {
		const url = mediaUrlOf(f_4);
		if (!url || !ops.updateElement) return;
		const updateElement = ops.updateElement;
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImageAdjustments, {
			elementId: ops.selectedElementId,
			url,
			recordValue: ops.element?.props?.[IMAGE_ADJUST_PROP],
			target: isVideoFill(f_4) ? "video" : "background",
			apply: (from, to, entry) => updateElement(swapImageUrl(from, to, entry)),
			onPreview: setMediaPreview,
			onUpload: imagePicker.open
		}, `${ops.selectedElementId}|${f_4.id}`);
	};
	const patch = (id_0, changes) => write(fills.map((f_5) => f_5.id === id_0 ? {
		...f_5,
		...changes
	} : f_5));
	const addFill = () => {
		const computed = mixed ? "" : ops.computed.backgroundColor ?? "";
		const seed = !isTransparentColor(computed) && computed ? computed : "#FFFFFF";
		const base_0 = mixed ? [] : fills;
		const nf = {
			id: Math.max(0, ...base_0.map(_temp8$13)) + 1,
			kind: "solid",
			value: seed
		};
		write([...base_0, nf]);
		setOpenId(nf.id);
	};
	const changeFill = (id_1, value, kind) => {
		const current = kind === "video" ? fills.find((f_7) => f_7.id !== id_1 && isVideoFill(f_7)) : void 0;
		const rows_0 = current ? fills.filter((f_8) => f_8 !== current) : fills;
		write(rows_0.map((f_9) => f_9.id !== id_1 ? f_9 : current && kind !== f_9.kind ? {
			id: id_1,
			kind,
			value: current.value,
			size: current.size
		} : kind !== f_9.kind ? {
			id: id_1,
			kind,
			value,
			blend: f_9.blend
		} : {
			...f_9,
			value,
			token: void 0
		}));
	};
	const removeFill = (id_2) => write(fills.filter((f_10) => f_10.id !== id_2));
	let t5;
	if ($[5] !== openId) {
		t5 = (f_11) => f_11.id === openId;
		$[5] = openId;
		$[6] = t5;
	} else t5 = $[6];
	const openRow = fills.find(t5);
	const imagePicker = useImageFilePicker((url_0) => {
		if (!openRow) return;
		if (isVideoFill(openRow)) changeFill(openRow.id, `video("${url_0}")`, "video");
		else changeFill(openRow.id, `url("${url_0}")`, "image");
	}, openRow && isVideoFill(openRow) ? "video/*" : "image/*");
	let t6;
	if ($[7] !== fills) {
		t6 = (e, id_3) => {
			e.stopPropagation();
			dragStartOrder.current = fills.map(_temp9$11);
			setDragId(id_3);
			e.dataTransfer.effectAllowed = "move";
			e.dataTransfer.setData("text/plain", String(id_3));
		};
		$[7] = fills;
		$[8] = t6;
	} else t6 = $[8];
	const handleDragStart = t6;
	let t7;
	if ($[9] !== dragId) {
		t7 = (e_0, targetId) => {
			e_0.preventDefault();
			if (dragId === null || dragId === targetId) return;
			const rect = e_0.currentTarget.getBoundingClientRect();
			const after = e_0.clientY > rect.top + rect.height / 2;
			setFills((prev) => {
				const from_0 = prev.findIndex((f_13) => f_13.id === dragId);
				const t = prev.findIndex((f_14) => f_14.id === targetId);
				if (from_0 < 0 || t < 0) return prev;
				let to_0 = after ? t + 1 : t;
				if (from_0 < to_0) to_0 = to_0 - 1;
				if (to_0 === from_0) return prev;
				const next_0 = [...prev];
				const [moved] = next_0.splice(from_0, 1);
				next_0.splice(to_0, 0, moved);
				return next_0;
			});
		};
		$[9] = dragId;
		$[10] = t7;
	} else t7 = $[10];
	const handleDragOver = t7;
	const commitDrag = () => {
		const start = dragStartOrder.current;
		dragStartOrder.current = null;
		setDragId(null);
		if (start && fills.some((f_15, i_1) => f_15.id !== start[i_1])) write(fills);
	};
	const linkToken = (cls) => {
		const real_0 = fills.filter(_temp0$10);
		const base_1 = real_0[real_0.length - 1];
		if (base_1?.kind === "solid") patch(base_1.id, { token: cls });
		else write([...fills, {
			id: Math.max(0, ...fills.map(_temp1$10)) + 1,
			kind: "solid",
			value: ops.get("backgroundColor") || "",
			token: cls
		}]);
		setShowLibrary(false);
	};
	const unlinkToken = (id_4) => patch(id_4, {
		token: void 0,
		value: fills.find((f_18) => f_18.id === id_4)?.value || ops.get("backgroundColor") || "#000000"
	});
	const applyLibraryColor = (id_5, isBase, cls_0) => {
		const s = bgSuggestions.find((x_1) => x_1.className === cls_0);
		const layerValue = s?.rawValue ?? s?.value ?? parseTailwindClass(cls_0)?.backgroundColor;
		if (!isBase && !layerValue) return;
		write(fills.map((f_19) => f_19.id !== id_5 ? f_19 : isBase ? {
			id: id_5,
			kind: "solid",
			value: s?.value ?? "",
			token: cls_0,
			blend: f_19.blend
		} : {
			id: id_5,
			kind: "solid",
			value: layerValue,
			blend: f_19.blend
		}));
	};
	const stacked = fills.length > 1;
	const fillKinds = ops.updateElement && ops.element && canHoldVideoFill(ops.element) ? MEDIA_FILL_KINDS : BASE_FILL_KINDS;
	let t8;
	if ($[11] !== fills) {
		t8 = fills.filter(_temp10$10);
		$[11] = fills;
		$[12] = t8;
	} else t8 = $[12];
	const renderedFills = t8;
	const bottomFill = renderedFills[renderedFills.length - 1];
	const backgroundColorFillId = bottomFill?.kind === "solid" ? bottomFill.id : null;
	let t9;
	if ($[13] === Symbol.for("react.memo_cache_sentinel")) {
		t9 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
				label: "Link a color token",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AddVariableIcon, {})
			})
		});
		$[13] = t9;
	} else t9 = $[13];
	let t10;
	if ($[14] === Symbol.for("react.memo_cache_sentinel")) {
		t10 = () => setShowLibrary(false);
		$[14] = t10;
	} else t10 = $[14];
	let t11;
	if ($[15] === Symbol.for("react.memo_cache_sentinel")) {
		t11 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlusIcon, {});
		$[15] = t11;
	} else t11 = $[15];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorSection, {
		reserveActionRail: true,
		variant: "addable",
		title: "Background",
		isSet: fills.length > 0,
		onAdd: addFill,
		onRemove: () => write([]),
		classSuggestions: bgSuggestions,
		cssProperty: "backgroundColor",
		onSelectClass: linkToken,
		action: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-1.5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Popover, {
				open: showLibrary,
				onOpenChange: setShowLibrary,
				modal: false,
				children: [t9, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClassPickerPopover, {
					suggestions: bgSuggestions,
					cssProperty: "backgroundColor",
					onSelect: linkToken,
					onClose: t10
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
				label: "Add fill",
				onClick: addFill,
				children: t11
			})]
		}),
		children: fills.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-2",
			children: [imagePicker.input, fills.map((f_20, i_2) => {
				const isBase_0 = i_2 === fills.length - 1;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorDraggableRow, {
					dragging: dragId === f_20.id,
					reorderable: stacked,
					action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RemoveButton, { onClick: () => removeFill(f_20.id) }),
					contentClassName: "flex items-center gap-1",
					onDragOver: (e_1) => handleDragOver(e_1, f_20.id),
					onDrop: (e_2) => {
						e_2.preventDefault();
						commitDrag();
					},
					onDragHandleStart: (e_3) => handleDragStart(e_3, f_20.id),
					onDragHandleEnd: commitDrag,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex-1 min-w-0",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ColorRow, {
							label: KIND_LABEL[f_20.kind],
							hideLabel: true,
							showTooltip: false,
							value: f_20.token ? ops.computed.backgroundColor || f_20.value || "#000000" : f_20.value,
							isMixedValue: mixed,
							source: f_20.token ? "class" : void 0,
							sourceClass: f_20.token,
							onClearOverride: f_20.token ? () => unlinkToken(f_20.id) : void 0,
							clearOverrideTitle: "Detach",
							cssProperty: "backgroundColor",
							allowedFillKinds: fillKinds,
							onSelectClass: (cls_1) => applyLibraryColor(f_20.id, isBase_0, cls_1),
							defaultPickerTab: "custom",
							onChange: (v) => changeFill(f_20.id, v, f_20.kind),
							onChangeFill: (v_0, k) => changeFill(f_20.id, v_0, k),
							imageConfig: {
								size: f_20.size,
								position: f_20.position,
								repeat: f_20.repeat
							},
							onChangeImageConfig: (p) => patch(f_20.id, p),
							imageExtras: imageAdjustments(f_20),
							mediaPreview: openId === f_20.id ? mediaPreview : null,
							endAddon: stacked && f_20.id !== backgroundColorFillId && !isVideoFill(f_20) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BlendDropdown, {
								value: f_20.blend ?? "normal",
								onChange: (v_1) => patch(f_20.id, { blend: v_1 === "normal" ? void 0 : v_1 })
							}) : void 0,
							open: openId === f_20.id,
							onOpenChange: (o) => setOpenId(o ? f_20.id : null)
						})
					})
				}, f_20.id);
			})]
		}) : null
	});
}
/** The Tailwind-class row: a bordered card with the resolved-color swatch, the
*  class name, and an unlink icon. Clicking the card re-picks the class. */
function _temp10$10(fill) {
	return !isEmptyImage(fill);
}
function _temp1$10(f_17) {
	return f_17.id;
}
function _temp0$10(f_16) {
	return !isEmptyImage(f_16);
}
function _temp9$11(f_12) {
	return f_12.id;
}
function _temp8$13(f_6) {
	return f_6.id;
}
function _temp7$17(c_0) {
	return c_0.startsWith("bg-");
}
function _temp6$22(f_3) {
	return !isEmptyImage(f_3) && !isVideoFill(f_3);
}
function _temp5$27(f_2) {
	return !isVideoFill(f_2);
}
function _temp4$30(f_1, i_0) {
	return {
		...f_1,
		id: i_0 + 1
	};
}
function _temp3$32(f_0) {
	return isVideoFill(f_0) || f_0.kind === "image" && !isEmptyImage(f_0);
}
function _temp2$45(el) {
	return el.id;
}
function _temp$68(f, i) {
	return {
		...f,
		id: i + 1
	};
}
function TokenRow(t0) {
	const $ = (0, import_compiler_runtime.c)(25);
	const { token, color, suggestions, open, onOpenChange, onPick, onUnlink } = t0;
	let t1;
	if ($[0] !== color) {
		t1 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "size-4 shrink-0 rounded-xs border border-ed-border",
			style: { backgroundColor: color }
		});
		$[0] = color;
		$[1] = t1;
	} else t1 = $[1];
	let t2;
	if ($[2] !== token) {
		t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
			size: "2xs",
			weight: "medium",
			variant: "primary",
			className: "flex-1 truncate text-left",
			children: token
		});
		$[2] = token;
		$[3] = t2;
	} else t2 = $[3];
	let t3;
	if ($[4] !== t1 || $[5] !== t2) {
		t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(InspectorControlAction, {
				className: "min-w-0 flex-1 justify-start gap-2 px-1.5",
				children: [t1, t2]
			})
		});
		$[4] = t1;
		$[5] = t2;
		$[6] = t3;
	} else t3 = $[6];
	let t4;
	if ($[7] === Symbol.for("react.memo_cache_sentinel")) {
		t4 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UnlinkIcon, {});
		$[7] = t4;
	} else t4 = $[7];
	let t5;
	if ($[8] !== onUnlink) {
		t5 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorControlAction, {
			"aria-label": "Unlink class",
			title: "Unlink class",
			onClick: onUnlink,
			children: t4
		});
		$[8] = onUnlink;
		$[9] = t5;
	} else t5 = $[9];
	let t6;
	if ($[10] !== open || $[11] !== t3 || $[12] !== t5) {
		t6 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverAnchor, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(InspectorControlShell, {
				active: open,
				children: [t3, t5]
			})
		});
		$[10] = open;
		$[11] = t3;
		$[12] = t5;
		$[13] = t6;
	} else t6 = $[13];
	let t7;
	if ($[14] !== onOpenChange) {
		t7 = () => onOpenChange(false);
		$[14] = onOpenChange;
		$[15] = t7;
	} else t7 = $[15];
	let t8;
	if ($[16] !== onPick || $[17] !== suggestions || $[18] !== t7) {
		t8 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClassPickerPopover, {
			suggestions,
			cssProperty: "backgroundColor",
			onSelect: onPick,
			onClose: t7
		});
		$[16] = onPick;
		$[17] = suggestions;
		$[18] = t7;
		$[19] = t8;
	} else t8 = $[19];
	let t9;
	if ($[20] !== onOpenChange || $[21] !== open || $[22] !== t6 || $[23] !== t8) {
		t9 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Popover, {
			open,
			onOpenChange,
			modal: false,
			children: [t6, t8]
		});
		$[20] = onOpenChange;
		$[21] = open;
		$[22] = t6;
		$[23] = t8;
		$[24] = t9;
	} else t9 = $[24];
	return t9;
}
function BlendDropdown(t0) {
	const $ = (0, import_compiler_runtime.c)(12);
	const { value, onChange } = t0;
	const t1 = value === "normal" ? "Normal" : value;
	let t2;
	if ($[0] !== t1) {
		t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "truncate",
			children: t1
		});
		$[0] = t1;
		$[1] = t2;
	} else t2 = $[1];
	let t3;
	if ($[2] === Symbol.for("react.memo_cache_sentinel")) {
		t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CaretDownIcon, { className: "size-3 shrink-0" });
		$[2] = t3;
	} else t3 = $[2];
	let t4;
	if ($[3] !== t2) {
		t4 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(InspectorControlAction, {
				"aria-label": "Blend mode",
				className: "w-[88px] justify-between gap-1 px-2 capitalize",
				children: [t2, t3]
			})
		});
		$[3] = t2;
		$[4] = t4;
	} else t4 = $[4];
	let t5;
	if ($[5] !== onChange) {
		t5 = BLEND_MODES.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
			onSelect: () => onChange(m),
			className: "text-[12px] capitalize",
			children: m
		}, m));
		$[5] = onChange;
		$[6] = t5;
	} else t5 = $[6];
	let t6;
	if ($[7] !== t5) {
		t6 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuContent, {
			align: "end",
			className: "min-w-[120px]",
			children: t5
		});
		$[7] = t5;
		$[8] = t6;
	} else t6 = $[8];
	let t7;
	if ($[9] !== t4 || $[10] !== t6) {
		t7 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [t4, t6] });
		$[9] = t4;
		$[10] = t6;
		$[11] = t7;
	} else t7 = $[11];
	return t7;
}
function RemoveButton(t0) {
	const $ = (0, import_compiler_runtime.c)(3);
	const { onClick } = t0;
	let t1;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t1 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MinusIcon, {});
		$[0] = t1;
	} else t1 = $[0];
	let t2;
	if ($[1] !== onClick) {
		t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
			label: "Remove fill",
			onClick,
			children: t1
		});
		$[1] = onClick;
		$[2] = t2;
	} else t2 = $[2];
	return t2;
}

export { BackgroundSection, TokenRow };
