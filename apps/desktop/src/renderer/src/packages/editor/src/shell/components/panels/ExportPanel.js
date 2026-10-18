// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/panels/ExportPanel.tsx
import { __bundled__mapDeps } from "../../../../../../__bundle__/_preamble.js";
import { import_jsx_runtime, import_react } from "../../../../../../vendor/@tanstack/react-query.js";
import { __bundledVitePreload } from "../../../../../../__bundle__/_vite_preload_helper.js";
import { import_compiler_runtime } from "../../../../../cloud/src/hooks/useSession.js";
import { CaretDownIcon, CaretRightIcon, DotsThreeIcon, MinusIcon, PlusIcon } from "../../../../../ui/src/icons.js";
import { Button } from "../../../../../ui/src/components/Button.js";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../../ui/src/components/Select.js";
import { toast } from "../../../../../../vendor/sonner.js";
import { Popover, PopoverTrigger } from "../../../../../ui/src/components/Popover.js";
import { DEFAULT_EXPORT_SIZE, EXPORT_FORMATS, EXPORT_SIZES, exportFormatLabel, exportLayerName, exportSettingsOf, exportSizeLabel, parseExportSize } from "../../../shared/utils/assetExport.js";
import { INSPECTOR_CONTROL_TEXT_STYLE, IconBtn, InspectorControlInput, InspectorControlShell, InspectorRailRow, releaseInspectorControlFocus } from "./styles/primitives.js";
import { InspectorPopoverContent, InspectorPopoverHeader } from "./styles/InspectorPopover.js";
import { InspectorSection } from "./styles/sections/InspectorSection.js";
import { InspectorDropdown } from "./styles/inputs/parts/InspectorDropdown.js";

async function runAssetExport(elements, count, onProgress, onError, onDone) {
	const startedAt = Date.now();
	let outcome = "cancelled";
	try {
		const { exportAssets } = await __bundledVitePreload(async () => {
			const { exportAssets } = await import("../../../shared/utils/exportAssets.js");
			return { exportAssets };
		}, [], import.meta.url);
		if (await exportAssets(elements, onProgress)) {
			outcome = "completed";
			toast.success(count === 1 ? "Export complete" : `${count} exports complete`);
		}
	} catch (cause) {
		outcome = "errored";
		onError(cause instanceof Error ? cause.message : "Export failed. Please try again.");
	} finally {
		onProgress("");
		onDone(outcome, Date.now() - startedAt);
	}
}
var FORMAT_OPTIONS = EXPORT_FORMATS.map((value) => ({
	value,
	label: exportFormatLabel(value)
}));
var sizeKey = ({ constraint, value }) => `${constraint}:${value}`;
/** Longer side of the preview render: about twice the panel width, for high-density screens. */
var PREVIEW_SIDE = 480;
/** A layer edited while the preview is open re-renders once the edits pause. */
var PREVIEW_DEBOUNCE_MS$1 = 400;
var renderPreview$1 = (element) => __bundledVitePreload(async () => {
	const { renderAssetPreview } = await import("../../../shared/utils/exportAssets.js");
	return { renderAssetPreview };
}, [], import.meta.url).then(({ renderAssetPreview }) => renderAssetPreview([element], PREVIEW_SIDE));
/** Inspector text that commits on blur or Enter; Escape restores the last committed value. */
function useCommittedDraft(shown, parse, commit) {
	const $ = (0, import_compiler_runtime.c)(16);
	const [draft, setDraft] = (0, import_react.useState)(null);
	const [invalid, setInvalid] = (0, import_react.useState)(false);
	const cancelled = (0, import_react.useRef)(false);
	const t0 = draft ?? shown;
	const t1 = invalid || void 0;
	let t2;
	if ($[0] !== shown) {
		t2 = () => {
			cancelled.current = false;
			setDraft(shown);
		};
		$[0] = shown;
		$[1] = t2;
	} else t2 = $[1];
	let t3;
	if ($[2] === Symbol.for("react.memo_cache_sentinel")) {
		t3 = (event) => {
			setDraft(event.target.value);
			setInvalid(false);
		};
		$[2] = t3;
	} else t3 = $[2];
	let t4;
	if ($[3] !== commit || $[4] !== draft || $[5] !== parse) {
		t4 = () => {
			const text = draft;
			if (text === null || cancelled.current) {
				setDraft(null);
				setInvalid(false);
				return;
			}
			const parsed = parse(text);
			if (parsed === null) {
				setInvalid(true);
				return;
			}
			commit(parsed);
			setDraft(null);
		};
		$[3] = commit;
		$[4] = draft;
		$[5] = parse;
		$[6] = t4;
	} else t4 = $[6];
	let t5;
	if ($[7] === Symbol.for("react.memo_cache_sentinel")) {
		t5 = (event_0) => {
			if (event_0.key === "Enter" && !event_0.nativeEvent.isComposing) event_0.currentTarget.blur();
			if (event_0.key === "Escape") {
				cancelled.current = true;
				event_0.currentTarget.blur();
			}
		};
		$[7] = t5;
	} else t5 = $[7];
	let t6;
	if ($[8] !== t0 || $[9] !== t1 || $[10] !== t2 || $[11] !== t4) {
		t6 = {
			value: t0,
			"aria-invalid": t1,
			onFocus: t2,
			onChange: t3,
			onBlur: t4,
			onKeyDown: t5
		};
		$[8] = t0;
		$[9] = t1;
		$[10] = t2;
		$[11] = t4;
		$[12] = t6;
	} else t6 = $[12];
	let t7;
	if ($[13] !== invalid || $[14] !== t6) {
		t7 = {
			invalid,
			inputProps: t6
		};
		$[13] = invalid;
		$[14] = t6;
		$[15] = t7;
	} else t7 = $[15];
	return t7;
}
/** Free-text size ("2x", "512w") with the presets behind a trailing menu. */
function ExportSizeInput(t0) {
	const $ = (0, import_compiler_runtime.c)(24);
	const { size, disabled, onChange } = t0;
	const [open, setOpen] = (0, import_react.useState)(false);
	let t1;
	if ($[0] !== onChange || $[1] !== size) {
		t1 = (next) => {
			if (sizeKey(next) !== sizeKey(size)) onChange(next);
		};
		$[0] = onChange;
		$[1] = size;
		$[2] = t1;
	} else t1 = $[2];
	const apply = t1;
	let t2;
	if ($[3] !== size) {
		t2 = exportSizeLabel(size);
		$[3] = size;
		$[4] = t2;
	} else t2 = $[4];
	const { invalid, inputProps } = useCommittedDraft(t2, parseExportSize, apply);
	const t3 = invalid || void 0;
	let t4;
	if ($[5] !== disabled || $[6] !== inputProps) {
		t4 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorControlInput, {
			"aria-label": "Export size",
			tooltip: "Export size",
			disabled,
			className: "pl-2",
			...inputProps
		});
		$[5] = disabled;
		$[6] = inputProps;
		$[7] = t4;
	} else t4 = $[7];
	let t5;
	if ($[8] !== size) {
		t5 = EXPORT_SIZES.some((preset) => sizeKey(preset) === sizeKey(size)) ? sizeKey(size) : "";
		$[8] = size;
		$[9] = t5;
	} else t5 = $[9];
	let t6;
	if ($[10] !== apply) {
		t6 = (key) => {
			const preset_1 = EXPORT_SIZES.find((preset_0) => sizeKey(preset_0) === key);
			if (preset_1) apply(preset_1);
		};
		$[10] = apply;
		$[11] = t6;
	} else t6 = $[11];
	let t7;
	if ($[12] === Symbol.for("react.memo_cache_sentinel")) {
		t7 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
			"aria-label": "Export size presets",
			size: "xs",
			className: "h-full w-auto min-w-6 gap-0 rounded-none border-0 bg-transparent px-1.5 py-0 text-ed-inspector-chrome shadow-none hover:text-ed-foreground-secondary focus:ring-0 data-[state=open]:text-ed-foreground-secondary [&>span]:hidden! [&>svg]:size-3 [&>svg]:opacity-100",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
		});
		$[12] = t7;
	} else t7 = $[12];
	let t8;
	if ($[13] === Symbol.for("react.memo_cache_sentinel")) {
		t8 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, {
			position: "popper",
			align: "end",
			style: INSPECTOR_CONTROL_TEXT_STYLE,
			className: "w-max min-w-0",
			onCloseAutoFocus: releaseInspectorControlFocus,
			children: EXPORT_SIZES.map(_temp$109)
		});
		$[13] = t8;
	} else t8 = $[13];
	let t9;
	if ($[14] !== disabled || $[15] !== open || $[16] !== t5 || $[17] !== t6) {
		t9 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
			value: t5,
			onValueChange: t6,
			open,
			onOpenChange: setOpen,
			disabled,
			children: [t7, t8]
		});
		$[14] = disabled;
		$[15] = open;
		$[16] = t5;
		$[17] = t6;
		$[18] = t9;
	} else t9 = $[18];
	let t10;
	if ($[19] !== open || $[20] !== t3 || $[21] !== t4 || $[22] !== t9) {
		t10 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(InspectorControlShell, {
			active: open,
			"aria-invalid": t3,
			children: [t4, t9]
		});
		$[19] = open;
		$[20] = t3;
		$[21] = t4;
		$[22] = t9;
		$[23] = t10;
	} else t10 = $[23];
	return t10;
}
function _temp$109(preset_2) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
		value: sizeKey(preset_2),
		className: "justify-start gap-1.5 whitespace-nowrap px-1 [&>span:first-child]:ml-0 [&>span:first-child]:size-4",
		children: preset_2.label
	}, sizeKey(preset_2));
}
function ExportSettingField(t0) {
	const $ = (0, import_compiler_runtime.c)(6);
	const { label, children } = t0;
	let t1;
	if ($[0] !== label) {
		t1 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-[11px] text-ed-muted-foreground",
			children: label
		});
		$[0] = label;
		$[1] = t1;
	} else t1 = $[1];
	let t2;
	if ($[2] !== children || $[3] !== label || $[4] !== t1) {
		t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			role: "group",
			"aria-label": label,
			className: "grid min-w-0 grid-cols-[56px_minmax(0,1fr)] items-center gap-2",
			children: [t1, children]
		});
		$[2] = children;
		$[3] = label;
		$[4] = t1;
		$[5] = t2;
	} else t2 = $[5];
	return t2;
}
/** The row's ••• popover: file name suffix, and quality for JPEG. */
function ExportRowSettings(t0) {
	const $ = (0, import_compiler_runtime.c)(27);
	const { setting, disabled, onChange } = t0;
	const [open, setOpen] = (0, import_react.useState)(false);
	let t1;
	if ($[0] !== onChange) {
		t1 = (text_0) => onChange({ suffix: text_0 || void 0 });
		$[0] = onChange;
		$[1] = t1;
	} else t1 = $[1];
	const suffix = useCommittedDraft(setting.suffix ?? "", _temp2$70, t1);
	let t2;
	if ($[2] !== onChange) {
		t2 = (value_0) => onChange({ quality: value_0 === 92 ? void 0 : value_0 });
		$[2] = onChange;
		$[3] = t2;
	} else t2 = $[3];
	const quality = useCommittedDraft(String(setting.quality ?? 92), _temp3$51, t2);
	let t3;
	if ($[4] === Symbol.for("react.memo_cache_sentinel")) {
		t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DotsThreeIcon, {});
		$[4] = t3;
	} else t3 = $[4];
	let t4;
	if ($[5] !== disabled || $[6] !== open) {
		t4 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
				label: "Export settings",
				active: open,
				disabled,
				children: t3
			})
		});
		$[5] = disabled;
		$[6] = open;
		$[7] = t4;
	} else t4 = $[7];
	let t5;
	if ($[8] === Symbol.for("react.memo_cache_sentinel")) {
		t5 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorPopoverHeader, {
			title: "Export settings",
			closeLabel: "Close export settings",
			onClose: () => setOpen(false)
		});
		$[8] = t5;
	} else t5 = $[8];
	const t6 = suffix.invalid || void 0;
	let t7;
	if ($[9] !== setting) {
		t7 = exportSizeLabel(setting);
		$[9] = setting;
		$[10] = t7;
	} else t7 = $[10];
	const t8 = `@${t7}`;
	let t9;
	if ($[11] !== suffix.inputProps || $[12] !== t8) {
		t9 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorControlInput, {
			"aria-label": "File name suffix",
			placeholder: t8,
			className: "pl-2",
			...suffix.inputProps
		});
		$[11] = suffix.inputProps;
		$[12] = t8;
		$[13] = t9;
	} else t9 = $[13];
	let t10;
	if ($[14] !== t6 || $[15] !== t9) {
		t10 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExportSettingField, {
			label: "Suffix",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorControlShell, {
				"aria-invalid": t6,
				children: t9
			})
		});
		$[14] = t6;
		$[15] = t9;
		$[16] = t10;
	} else t10 = $[16];
	let t11;
	if ($[17] !== quality || $[18] !== setting.format) {
		t11 = setting.format === "jpg" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExportSettingField, {
			label: "Quality",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorControlShell, {
				"aria-invalid": quality.invalid || void 0,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorControlInput, {
					"aria-label": "JPEG quality",
					inputMode: "numeric",
					className: "pl-2",
					...quality.inputProps
				})
			})
		});
		$[17] = quality;
		$[18] = setting.format;
		$[19] = t11;
	} else t11 = $[19];
	let t12;
	if ($[20] !== t10 || $[21] !== t11) {
		t12 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(InspectorPopoverContent, {
			"aria-label": "Export settings",
			children: [t5, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-2 p-1 pt-0",
				children: [t10, t11]
			})]
		});
		$[20] = t10;
		$[21] = t11;
		$[22] = t12;
	} else t12 = $[22];
	let t13;
	if ($[23] !== open || $[24] !== t12 || $[25] !== t4) {
		t13 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Popover, {
			open,
			onOpenChange: setOpen,
			modal: false,
			children: [t4, t12]
		});
		$[23] = open;
		$[24] = t12;
		$[25] = t4;
		$[26] = t13;
	} else t13 = $[26];
	return t13;
}
function _temp3$51(text_1) {
	const value = text_1.trim() ? Number(text_1) : NaN;
	return Number.isInteger(value) && value >= 0 && value <= 100 ? value : null;
}
function _temp2$70(text) {
	return text.trim();
}
function ExportRow(t0) {
	const $ = (0, import_compiler_runtime.c)(30);
	const { setting, disabled, onChange, onRemove } = t0;
	let t1;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t1 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MinusIcon, {});
		$[0] = t1;
	} else t1 = $[0];
	let t2;
	if ($[1] !== disabled || $[2] !== onRemove) {
		t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
			label: "Remove export setting",
			disabled,
			onClick: onRemove,
			children: t1
		});
		$[1] = disabled;
		$[2] = onRemove;
		$[3] = t2;
	} else t2 = $[3];
	let t3;
	if ($[4] !== onChange) {
		t3 = (t4) => {
			const { constraint, value } = t4;
			return onChange({
				constraint,
				value
			});
		};
		$[4] = onChange;
		$[5] = t3;
	} else t3 = $[5];
	let t4;
	if ($[6] !== disabled || $[7] !== setting || $[8] !== t3) {
		t4 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExportSizeInput, {
			size: setting,
			disabled,
			onChange: t3
		});
		$[6] = disabled;
		$[7] = setting;
		$[8] = t3;
		$[9] = t4;
	} else t4 = $[9];
	let t5;
	if ($[10] !== setting.format) {
		t5 = exportFormatLabel(setting.format);
		$[10] = setting.format;
		$[11] = t5;
	} else t5 = $[11];
	let t6;
	if ($[12] !== onChange) {
		t6 = (format) => onChange({ format });
		$[12] = onChange;
		$[13] = t6;
	} else t6 = $[13];
	let t7;
	if ($[14] !== disabled || $[15] !== setting.format || $[16] !== t5 || $[17] !== t6) {
		t7 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorDropdown, {
			label: "Export format",
			hasIcon: false,
			value: t5,
			selectedValue: setting.format,
			options: FORMAT_OPTIONS,
			disabled,
			onValueChange: t6
		});
		$[14] = disabled;
		$[15] = setting.format;
		$[16] = t5;
		$[17] = t6;
		$[18] = t7;
	} else t7 = $[18];
	let t8;
	if ($[19] !== disabled || $[20] !== onChange || $[21] !== setting) {
		t8 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExportRowSettings, {
			setting,
			disabled,
			onChange
		});
		$[19] = disabled;
		$[20] = onChange;
		$[21] = setting;
		$[22] = t8;
	} else t8 = $[22];
	let t9;
	if ($[23] !== t4 || $[24] !== t7 || $[25] !== t8) {
		t9 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid min-w-0 grid-cols-[minmax(0,1fr)_minmax(0,1fr)_26px] gap-1.5",
			children: [
				t4,
				t7,
				t8
			]
		});
		$[23] = t4;
		$[24] = t7;
		$[25] = t8;
		$[26] = t9;
	} else t9 = $[26];
	let t10;
	if ($[27] !== t2 || $[28] !== t9) {
		t10 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorRailRow, {
			action: t2,
			children: t9
		});
		$[27] = t2;
		$[28] = t9;
		$[29] = t10;
	} else t10 = $[29];
	return t10;
}
/** Collapsed by default. Renders the layer only while open, since a capture is costly. */
function ExportPreview(t0) {
	const $ = (0, import_compiler_runtime.c)(20);
	const { element } = t0;
	const [open, setOpen] = (0, import_react.useState)(false);
	const [src, setSrc] = (0, import_react.useState)(null);
	const [failed, setFailed] = (0, import_react.useState)(false);
	const srcRef = (0, import_react.useRef)(null);
	let t1;
	let t2;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t1 = () => () => {
			if (srcRef.current) URL.revokeObjectURL(srcRef.current);
		};
		t2 = [];
		$[0] = t1;
		$[1] = t2;
	} else {
		t1 = $[0];
		t2 = $[1];
	}
	(0, import_react.useEffect)(t1, t2);
	let t3;
	let t4;
	if ($[2] !== element || $[3] !== open) {
		t3 = () => {
			if (!open) return;
			let stale = false;
			const timer = setTimeout(() => {
				renderPreview$1(element).then((png) => {
					if (stale) return;
					if (srcRef.current) URL.revokeObjectURL(srcRef.current);
					srcRef.current = URL.createObjectURL(png);
					setSrc(srcRef.current);
					setFailed(false);
				}, () => {
					if (!stale) setFailed(true);
				});
			}, PREVIEW_DEBOUNCE_MS$1);
			return () => {
				stale = true;
				clearTimeout(timer);
			};
		};
		t4 = [open, element];
		$[2] = element;
		$[3] = open;
		$[4] = t3;
		$[5] = t4;
	} else {
		t3 = $[4];
		t4 = $[5];
	}
	(0, import_react.useEffect)(t3, t4);
	const Caret = open ? CaretDownIcon : CaretRightIcon;
	let t5;
	if ($[6] === Symbol.for("react.memo_cache_sentinel")) {
		t5 = () => setOpen(_temp4$43);
		$[6] = t5;
	} else t5 = $[6];
	let t6;
	if ($[7] !== Caret) {
		t6 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Caret, { className: "size-3" });
		$[7] = Caret;
		$[8] = t6;
	} else t6 = $[8];
	let t7;
	if ($[9] !== open || $[10] !== t6) {
		t7 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			"aria-expanded": open,
			onClick: t5,
			className: "flex h-6 items-center gap-1 text-[11px] text-ed-muted-foreground hover:text-ed-foreground-secondary",
			children: [t6, "Preview"]
		});
		$[9] = open;
		$[10] = t6;
		$[11] = t7;
	} else t7 = $[11];
	let t8;
	if ($[12] !== element || $[13] !== failed || $[14] !== open || $[15] !== src) {
		t8 = open && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-1 flex min-h-16 items-center justify-center rounded-[5px] border border-ed-divider p-2",
			children: failed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-[11px] text-ed-muted-foreground",
				children: "Preview unavailable"
			}) : src ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src,
				alt: `Export preview of ${exportLayerName(element)}`,
				className: "max-h-40 max-w-full object-contain"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-[11px] text-ed-muted-foreground",
				children: "Rendering preview…"
			})
		});
		$[12] = element;
		$[13] = failed;
		$[14] = open;
		$[15] = src;
		$[16] = t8;
	} else t8 = $[16];
	let t9;
	if ($[17] !== t7 || $[18] !== t8) {
		t9 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [t7, t8] });
		$[17] = t7;
		$[18] = t8;
		$[19] = t9;
	} else t9 = $[19];
	return t9;
}
function _temp4$43(value) {
	return !value;
}
function ExportPanel(t0) {
	const $ = (0, import_compiler_runtime.c)(57);
	const { elements, onUpdateSettings, onExported, readOnly: t1, exportRequest: t2, onExportRequestHandled } = t0;
	const readOnly = t1 === void 0 ? false : t1;
	const exportRequest = t2 === void 0 ? null : t2;
	const [progress, setProgress] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)("");
	const busy = !!progress;
	const settings = elements.length ? exportSettingsOf(elements[0]) : [];
	const signature = _temp6$31;
	const mixed = elements.some((element) => signature(exportSettingsOf(element)) !== signature(settings));
	let t3;
	if ($[0] !== elements) {
		t3 = elements.map(_temp7$24);
		$[0] = elements;
		$[1] = t3;
	} else t3 = $[1];
	const ids = t3;
	const configured = elements.reduce(_temp8$19, 0);
	let t4;
	if ($[2] !== configured || $[3] !== elements) {
		t4 = configured ? elements.filter(_temp9$17) : [];
		$[2] = configured;
		$[3] = elements;
		$[4] = t4;
	} else t4 = $[4];
	const unset = t4;
	const count = configured + unset.length;
	const disabled = busy || readOnly;
	let t5;
	if ($[5] !== ids || $[6] !== onUpdateSettings) {
		t5 = (fn) => onUpdateSettings(ids, fn);
		$[5] = ids;
		$[6] = onUpdateSettings;
		$[7] = t5;
	} else t5 = $[7];
	const update = t5;
	let t6;
	if ($[8] !== busy || $[9] !== configured || $[10] !== elements || $[11] !== onExported || $[12] !== onUpdateSettings || $[13] !== unset) {
		t6 = (t7) => {
			const defaults = t7 === void 0 ? unset : t7;
			const total = configured + defaults.length;
			if (busy || !total) return;
			let exporting = elements;
			if (defaults.length) {
				const rows_0 = [{
					id: crypto.randomUUID(),
					format: "png",
					...DEFAULT_EXPORT_SIZE
				}];
				onUpdateSettings(defaults.map(_temp0$15), () => rows_0);
				exporting = elements.map((element_4) => defaults.includes(element_4) ? {
					...element_4,
					exportSettings: rows_0
				} : element_4);
			}
			setError("");
			setProgress("Preparing exports");
			const exportedFormats = [...new Set(exporting.flatMap(_temp10$14))];
			runAssetExport(exporting, total, setProgress, setError, (outcome, durationMs) => onExported?.({
				formats: exportedFormats,
				count: total,
				outcome,
				durationMs
			}));
		};
		$[8] = busy;
		$[9] = configured;
		$[10] = elements;
		$[11] = onExported;
		$[12] = onUpdateSettings;
		$[13] = unset;
		$[14] = t6;
	} else t6 = $[14];
	const runExport = t6;
	const showsRequest = !!exportRequest && elements.length > 0;
	let t7;
	if ($[15] !== configured || $[16] !== elements || $[17] !== onExportRequestHandled || $[18] !== runExport || $[19] !== unset) {
		t7 = () => {
			onExportRequestHandled?.();
			runExport(configured ? unset : elements);
		};
		$[15] = configured;
		$[16] = elements;
		$[17] = onExportRequestHandled;
		$[18] = runExport;
		$[19] = unset;
		$[20] = t7;
	} else t7 = $[20];
	const runRequest = (0, import_react.useEffectEvent)(t7);
	const handledRequest = (0, import_react.useRef)(null);
	let t8;
	if ($[21] !== exportRequest || $[22] !== runRequest || $[23] !== showsRequest) {
		t8 = () => {
			if (!showsRequest || handledRequest.current === exportRequest) return;
			handledRequest.current = exportRequest;
			runRequest();
		};
		$[21] = exportRequest;
		$[22] = runRequest;
		$[23] = showsRequest;
		$[24] = t8;
	} else t8 = $[24];
	let t9;
	if ($[25] !== exportRequest || $[26] !== showsRequest) {
		t9 = [showsRequest, exportRequest];
		$[25] = exportRequest;
		$[26] = showsRequest;
		$[27] = t9;
	} else t9 = $[27];
	(0, import_react.useEffect)(t8, t9);
	const addSetting = () => {
		if (disabled) return;
		const row = {
			id: crypto.randomUUID(),
			format: "png",
			...DEFAULT_EXPORT_SIZE
		};
		update((rows_1) => mixed ? [row] : [...rows_1, row]);
	};
	const t10 = mixed ? "Replace mixed export settings" : "Add export setting";
	let t11;
	if ($[28] === Symbol.for("react.memo_cache_sentinel")) {
		t11 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlusIcon, {});
		$[28] = t11;
	} else t11 = $[28];
	let t12;
	if ($[29] !== addSetting || $[30] !== disabled || $[31] !== t10) {
		t12 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
			label: t10,
			disabled,
			onClick: addSetting,
			children: t11
		});
		$[29] = addSetting;
		$[30] = disabled;
		$[31] = t10;
		$[32] = t12;
	} else t12 = $[32];
	const addAction = t12;
	const T0 = InspectorSection;
	const t13 = "Export";
	const t14 = true;
	const t15 = "addable";
	const t16 = mixed || settings.length > 0;
	const t17 = false;
	const t18 = "space-y-2";
	const t19 = mixed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-[11px] leading-6 text-ed-muted-foreground",
		children: "Click + to replace mixed export settings"
	}) : settings.map((setting_0, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExportRow, {
		setting: setting_0,
		disabled,
		onChange: (patch) => update((rows_2) => rows_2.map((row_0, i) => i === index ? {
			...row_0,
			...patch
		} : row_0)),
		onRemove: () => update((rows_3) => rows_3.filter((_, i_0) => i_0 !== index))
	}, setting_0.id));
	let t20;
	if ($[33] !== busy || $[34] !== count || $[35] !== elements[0] || $[36] !== elements.length || $[37] !== progress || $[38] !== runExport) {
		t20 = count > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "outline",
			size: "xs",
			className: "w-full min-w-0",
			loading: busy,
			onClick: () => runExport(),
			role: busy ? "status" : void 0,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "truncate",
				children: busy ? progress : elements.length === 1 ? `Export ${exportLayerName(elements[0])}` : `Export ${elements.length} layers`
			})
		});
		$[33] = busy;
		$[34] = count;
		$[35] = elements[0];
		$[36] = elements.length;
		$[37] = progress;
		$[38] = runExport;
		$[39] = t20;
	} else t20 = $[39];
	let t21;
	if ($[40] !== count || $[41] !== elements[0] || $[42] !== elements.length) {
		t21 = count > 0 && elements.length === 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExportPreview, { element: elements[0] });
		$[40] = count;
		$[41] = elements[0];
		$[42] = elements.length;
		$[43] = t21;
	} else t21 = $[43];
	let t22;
	if ($[44] !== error) {
		t22 = error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			role: "alert",
			className: "break-words text-[11px] text-ed-foreground",
			children: error
		});
		$[44] = error;
		$[45] = t22;
	} else t22 = $[45];
	let t23;
	if ($[46] !== t19 || $[47] !== t20 || $[48] !== t21 || $[49] !== t22) {
		t23 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: t18,
			children: [
				t19,
				t20,
				t21,
				t22
			]
		});
		$[46] = t19;
		$[47] = t20;
		$[48] = t21;
		$[49] = t22;
		$[50] = t23;
	} else t23 = $[50];
	let t24;
	if ($[51] !== T0 || $[52] !== addAction || $[53] !== addSetting || $[54] !== t16 || $[55] !== t23) {
		t24 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(T0, {
			title: t13,
			reserveActionRail: t14,
			variant: t15,
			isSet: t16,
			onAdd: addSetting,
			optimisticOpenOnAdd: t17,
			collapsedAction: addAction,
			action: addAction,
			children: t23
		});
		$[51] = T0;
		$[52] = addAction;
		$[53] = addSetting;
		$[54] = t16;
		$[55] = t23;
		$[56] = t24;
	} else t24 = $[56];
	return t24;
}
function _temp10$14(element_5) {
	return exportSettingsOf(element_5).map(_temp1$14);
}
function _temp1$14(setting) {
	return setting.format;
}
function _temp0$15(element_3) {
	return element_3.id;
}
function _temp9$17(element_2) {
	return !exportSettingsOf(element_2).length;
}
function _temp8$19(sum, element_1) {
	return sum + exportSettingsOf(element_1).length;
}
function _temp7$24(element_0) {
	return element_0.id;
}
function _temp6$31(rows) {
	return JSON.stringify(rows.map(_temp5$37));
}
function _temp5$37(t0) {
	const { constraint, value, format, suffix, quality } = t0;
	return {
		constraint,
		value,
		format,
		suffix,
		quality
	};
}

export { ExportPanel };
