// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/panels/PropsPanel.tsx
import { import_jsx_runtime, import_react } from "../../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../../cloud/src/hooks/useSession.js";
import { ArrowCounterClockwiseIcon, PlusIcon, SpinnerIcon, UploadIcon, XIcon } from "../../../../../ui/src/icons.js";
import { Text$4 } from "../../../../../ui/src/components/Text.js";
import { c$13, r$8 } from "../../../../../../vendor/@phosphor-icons/react.js";
import { toast } from "../../../../../../vendor/sonner.js";
import { isPetalOwnedDomProp } from "../../../../../compiler/src/store/sanitize.js";
import { getById } from "../../../../../compiler/src/store/read.js";
import { IconBtn, InspectorControlAction, InspectorControlInput, InspectorControlShell } from "./styles/primitives.js";
import { useUploadImage } from "../../../shared/hooks/useUploadImage.js";
import { fileToUrl } from "../../../shared/utils/clipboard.js";
import { useAssetResolver } from "../../../shared/contexts/AssetContext.js";
import { LUCIDE_PROPS_SCHEMA, PHOSPHOR_PROPS_SCHEMA } from "../../../types/components.js";
import { PropField, PropRow, handlePropInputKeyDown } from "./props/PropField.js";

function ElementHeader(t0) {
	const $ = (0, import_compiler_runtime.c)(16);
	const { name, kind, detail, onGoToMain, onCreateComponent, disabled } = t0;
	const isComponent = kind === "component";
	const Icon = isComponent ? c$13 : r$8;
	const tooltipLabel = isComponent ? "Open component file" : "Create Component";
	const shortcut = isComponent ? "⌃⌥⌘K" : "⌥⌘K";
	const onClick = isComponent ? onGoToMain : kind === "html" ? onCreateComponent : void 0;
	const actionAvailable = !disabled && Boolean(onClick);
	let t1;
	if ($[0] !== name) {
		t1 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "truncate",
			children: name
		});
		$[0] = name;
		$[1] = t1;
	} else t1 = $[1];
	let t2;
	if ($[2] !== detail) {
		t2 = detail && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "shrink-0 text-ed-muted-foreground/60",
			children: ["/ ", detail]
		});
		$[2] = detail;
		$[3] = t2;
	} else t2 = $[3];
	let t3;
	if ($[4] !== t1 || $[5] !== t2) {
		t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex min-w-0 items-center gap-1 text-ed-ui font-normal leading-6 text-ed-inspector-value",
			children: [t1, t2]
		});
		$[4] = t1;
		$[5] = t2;
		$[6] = t3;
	} else t3 = $[6];
	let t4;
	if ($[7] !== Icon || $[8] !== actionAvailable || $[9] !== onClick || $[10] !== shortcut || $[11] !== tooltipLabel) {
		t4 = actionAvailable && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex h-6 shrink-0 items-center",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
				label: tooltipLabel,
				tooltip: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: tooltipLabel }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "opacity-60",
						children: shortcut
					})]
				}),
				onClick,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {})
			})
		});
		$[7] = Icon;
		$[8] = actionAvailable;
		$[9] = onClick;
		$[10] = shortcut;
		$[11] = tooltipLabel;
		$[12] = t4;
	} else t4 = $[12];
	let t5;
	if ($[13] !== t3 || $[14] !== t4) {
		t5 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full flex items-center justify-between gap-2 px-3 py-2 border-b border-ed-divider",
			children: [t3, t4]
		});
		$[13] = t3;
		$[14] = t4;
		$[15] = t5;
	} else t5 = $[15];
	return t5;
}
function normalizePropType(propType) {
	if (!propType) return "";
	return propType.toLowerCase().split("|").map((s) => s.trim()).filter((s) => s && s !== "undefined" && s !== "null").join("|");
}
function isBooleanType(propType) {
	return normalizePropType(propType) === "boolean";
}
var DEFAULT_ICON_PROPS_SCHEMA = {
	size: {
		type: "number",
		default: 24,
		label: "Size"
	},
	color: {
		type: "color",
		label: "Color"
	}
};
function getIconPropsSchema(libraryName, config) {
	if (config?.propsSchema) return config.propsSchema;
	if (libraryName.includes("phosphor")) return PHOSPHOR_PROPS_SCHEMA;
	if (libraryName.includes("lucide")) return LUCIDE_PROPS_SCHEMA;
	return DEFAULT_ICON_PROPS_SCHEMA;
}
var htmlPropsSchema = {
	img: [
		{
			type: "string",
			label: "src"
		},
		{
			type: "string",
			label: "alt"
		},
		{
			type: "number",
			label: "width"
		},
		{
			type: "number",
			label: "height"
		}
	],
	a: [
		{
			type: "string",
			label: "href"
		},
		{
			type: "string",
			label: "target"
		},
		{
			type: "string",
			label: "rel"
		}
	],
	input: [
		{
			type: "string",
			label: "type"
		},
		{
			type: "string",
			label: "placeholder"
		},
		{
			type: "string",
			label: "name"
		},
		{
			type: "string",
			label: "value"
		},
		{
			type: "boolean",
			label: "disabled"
		},
		{
			type: "boolean",
			label: "required"
		}
	],
	textarea: [
		{
			type: "string",
			label: "placeholder"
		},
		{
			type: "string",
			label: "name"
		},
		{
			type: "number",
			label: "rows"
		},
		{
			type: "number",
			label: "cols"
		},
		{
			type: "boolean",
			label: "disabled"
		},
		{
			type: "boolean",
			label: "required"
		}
	],
	button: [{
		type: "string",
		label: "type"
	}, {
		type: "boolean",
		label: "disabled"
	}],
	video: [
		{
			type: "string",
			label: "src"
		},
		{
			type: "boolean",
			label: "controls"
		},
		{
			type: "boolean",
			label: "autoPlay"
		},
		{
			type: "boolean",
			label: "loop"
		},
		{
			type: "boolean",
			label: "muted"
		}
	],
	audio: [
		{
			type: "string",
			label: "src"
		},
		{
			type: "boolean",
			label: "controls"
		},
		{
			type: "boolean",
			label: "autoPlay"
		},
		{
			type: "boolean",
			label: "loop"
		}
	],
	iframe: [
		{
			type: "string",
			label: "src"
		},
		{
			type: "string",
			label: "title"
		},
		{
			type: "number",
			label: "width"
		},
		{
			type: "number",
			label: "height"
		},
		{
			type: "string",
			label: "sandbox"
		},
		{
			type: "string",
			label: "allow"
		},
		{
			type: "boolean",
			label: "allowFullScreen"
		},
		{
			type: "string",
			label: "loading"
		},
		{
			type: "string",
			label: "referrerPolicy"
		}
	],
	label: [{
		type: "string",
		label: "htmlFor"
	}],
	select: [
		{
			type: "string",
			label: "name"
		},
		{
			type: "string",
			label: "value"
		},
		{
			type: "boolean",
			label: "disabled"
		},
		{
			type: "boolean",
			label: "required"
		},
		{
			type: "boolean",
			label: "multiple"
		}
	],
	option: [{
		type: "string",
		label: "value"
	}, {
		type: "boolean",
		label: "disabled"
	}]
};
/** Props handled elsewhere in the editor — hide from the right-panel props list. */
var PANEL_HIDDEN_PROPS = /* @__PURE__ */ new Set([
	"style",
	"className",
	"children"
]);
function isPanelHiddenProp(key) {
	return PANEL_HIDDEN_PROPS.has(key) || isPetalOwnedDomProp(key);
}
function buildPropStringValues(store, selectedElementId, selectedElementIds, isMultiSelect) {
	if (!selectedElementId && !isMultiSelect) return {};
	const el = selectedElementId ? getById(store, selectedElementId) ?? null : null;
	const allSelected = isMultiSelect ? Array.from(selectedElementIds).map((id) => getById(store, id)).filter(Boolean) : [];
	const targetElement = isMultiSelect ? allSelected.find((e) => e?.type === "component" || e?.type === "icon" || e?.type === "html") ?? el : el;
	if (!targetElement) return {};
	if (targetElement.type === "webview") return {
		src: targetElement.src ?? "",
		viewportWidth: targetElement.viewportWidth != null ? String(targetElement.viewportWidth) : "",
		viewportHeight: String(targetElement.viewportHeight ?? 600),
		label: targetElement.label ?? ""
	};
	if (targetElement.type !== "component" && targetElement.type !== "icon" && targetElement.type !== "html") return {};
	const currentProps = isMultiSelect && allSelected.length > 1 ? (() => {
		const first = allSelected[0]?.props || {};
		const consensus = {};
		for (const [key, value] of Object.entries(first)) {
			if (isPanelHiddenProp(key)) continue;
			if (allSelected.every((e) => {
				const v = e.props?.[key];
				return v === value || String(v ?? "") === String(value ?? "");
			})) consensus[key] = value;
		}
		return consensus;
	})() : targetElement.props || {};
	const stringValues = {};
	Object.entries(currentProps).forEach(([key, value]) => {
		if (isPanelHiddenProp(key)) return;
		stringValues[key] = typeof value === "object" ? JSON.stringify(value) : String(value);
	});
	return stringValues;
}
var COLOR_NAME_RE = /(^|[a-z_])(color|colour|fill|stroke|tint|accent|bg|background)$/i;
var CSS_COLOR_RE = /^#[0-9a-f]{3,8}$|^(rgba?|hsla?|oklch|oklab|color|hwb|lab|lch)\s*\(/i;
var NAMED_CSS_COLORS = /* @__PURE__ */ new Set([
	"transparent",
	"currentcolor",
	"inherit",
	"red",
	"blue",
	"green",
	"yellow",
	"orange",
	"purple",
	"pink",
	"brown",
	"black",
	"white",
	"gray",
	"grey",
	"cyan",
	"magenta",
	"lime",
	"navy",
	"teal",
	"olive",
	"maroon",
	"silver",
	"gold"
]);
function looksLikeCssColor(v) {
	if (typeof v !== "string") return false;
	const s = v.trim();
	if (!s) return false;
	if (CSS_COLOR_RE.test(s)) return true;
	if (NAMED_CSS_COLORS.has(s.toLowerCase())) return true;
	return false;
}
function detectColorProp(propName, currentValue, defaultValue) {
	if (COLOR_NAME_RE.test(propName)) {
		if (defaultValue !== void 0 && defaultValue !== "" && !looksLikeCssColor(defaultValue)) return false;
		return true;
	}
	return looksLikeCssColor(defaultValue) || looksLikeCssColor(currentValue);
}
var NUMBER_LITERAL_RE = /^-?(?:\d+\.?\d*|\.\d+)$/;
/** Parse a union type string like `"a" | "b"` or `1 | 2` into its typed literal values */
function parseUnionLiterals(typeStr) {
	const parts = typeStr.split("|").map((s) => s.trim());
	const literals = [];
	for (const part of parts) {
		if (part === "undefined" || part === "null" || part === "void") continue;
		const match = part.match(/^["'](.*)["']$/);
		if (match) {
			if (match[1] !== "") literals.push(match[1]);
		} else if (NUMBER_LITERAL_RE.test(part)) literals.push(Number(part));
		else return null;
	}
	const unique = literals.filter((literal, i) => literals.findIndex((other) => String(other) === String(literal)) === i);
	return unique.length > 0 ? unique : null;
}
var SLOT_TYPE_RE = /\b(?:ReactNode|ReactElement|ComponentType|ElementType)\b|\bJSX\.Element\b/;
var TEXT_SLOT_MEMBER_RE = /^(?:(?:React\.)?ReactNode|string)$/;
/** Union members outside generics, so `ComponentType<{ a: string }>` stays one member. */
function topLevelUnionMembers(typeStr) {
	const members = [];
	let depth = 0;
	let start = 0;
	for (let i = 0; i < typeStr.length; i++) {
		const ch = typeStr[i];
		if ("<({[".includes(ch)) depth++;
		else if (")}]".includes(ch) || ch === ">" && typeStr[i - 1] !== "=") depth--;
		else if (ch === "|" && depth === 0) {
			members.push(typeStr.slice(start, i).trim());
			start = i + 1;
		}
	}
	members.push(typeStr.slice(start).trim());
	return members;
}
/** JSX and other non-static expressions parse to a present prop with an undefined value. */
function holdsCode(props, propName) {
	return !!props && propName in props && props[propName] === void 0;
}
/** Scanner examples are invented sample values: shown as placeholders, never stored. */
function examplePlaceholder(example) {
	if (typeof example === "number") return String(example);
	if (typeof example === "string" && example) return example;
}
/** Map a scanned component prop type to the PropField control to render. */
function resolveComponentPropKind(propName, propType, currentValue, propDefault, isCode) {
	if (SLOT_TYPE_RE.test(propType)) {
		const takesText = topLevelUnionMembers(propType).some((member) => TEXT_SLOT_MEMBER_RE.test(member));
		return {
			kind: "string",
			readOnly: isCode || !takesText
		};
	}
	const literals = parseUnionLiterals(propType);
	if (literals) return {
		kind: "enum",
		literals
	};
	if (isBooleanType(propType)) return { kind: "boolean" };
	if (detectColorProp(propName, currentValue, propDefault)) return { kind: "color" };
	if (normalizePropType(propType) === "number") return { kind: "number" };
	return { kind: "string" };
}
/** Map an icon-library schema entry to the PropField control to render. */
function iconPropKind(propConfig) {
	if (propConfig.type === "enum" && propConfig.options) return {
		kind: "enum",
		options: propConfig.options
	};
	if (propConfig.type === "color") return { kind: "color" };
	if (isBooleanType(propConfig.type)) return { kind: "boolean" };
	if (propConfig.type === "number") return { kind: "number" };
	return { kind: "string" };
}
function componentHasScannedProps(componentName, componentIndex) {
	return componentIndex?.[componentName]?.props !== void 0;
}
var EMPTY_SELECTED_IDS = /* @__PURE__ */ new Set();
function sameElements(a, b) {
	return a.length === b.length && a.every((el, i) => el === b[i]);
}
function PropsScanLoading() {
	const $ = (0, import_compiler_runtime.c)(1);
	let t0;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t0 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex items-center justify-center px-2 py-4 border-b border-ed-border",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpinnerIcon, {
				width: 14,
				height: 14,
				className: "animate-spin text-ed-muted-foreground"
			})
		});
		$[0] = t0;
	} else t0 = $[0];
	return t0;
}
function PropsPanel(t0) {
	const $ = (0, import_compiler_runtime.c)(152);
	const { selectedElementId, selectedElementIds: t1, store, componentIndex, iconLibraries, onUpdateElementProps, onSetElementPropsTransient, onUpdateMultipleElementsProps, onReplaceElement, onOpenComponent, onCreateComponent, readOnly: t2, scanLoading: t3, onRequestPropsScan, hideHeader: t4 } = t0;
	const selectedElementIds = t1 === void 0 ? EMPTY_SELECTED_IDS : t1;
	const readOnly = t2 === void 0 ? false : t2;
	const scanLoading = t3 === void 0 ? false : t3;
	const hideHeader = t4 === void 0 ? false : t4;
	const isMultiSelect = selectedElementIds.size > 1;
	let t5;
	if ($[0] !== isMultiSelect || $[1] !== selectedElementId || $[2] !== selectedElementIds || $[3] !== store) {
		t5 = buildPropStringValues(store, selectedElementId, selectedElementIds, isMultiSelect);
		$[0] = isMultiSelect;
		$[1] = selectedElementId;
		$[2] = selectedElementIds;
		$[3] = store;
		$[4] = t5;
	} else t5 = $[4];
	const storePropValues = t5;
	const selectedElements = isMultiSelect ? Array.from(selectedElementIds).map((id) => getById(store, id)).filter(Boolean) : void 0;
	const element = selectedElementId ? getById(store, selectedElementId) ?? null : selectedElements?.[0] ?? null;
	const sourceElements = selectedElements ? [element, ...selectedElements] : [element];
	const [propValues, setPropValues] = (0, import_react.useState)(storePropValues);
	const [propSource, setPropSource] = (0, import_react.useState)({
		elements: sourceElements,
		selectedElementId,
		selectedElementIds,
		isMultiSelect
	});
	const [newAttrName, setNewAttrName] = (0, import_react.useState)("");
	const propsScanRequestedRef = (0, import_react.useRef)(false);
	const [editingProp, setEditingProp] = (0, import_react.useState)(null);
	const uploadImage = useUploadImage();
	const imageFileInputRef = (0, import_react.useRef)(null);
	const [uploadingImage, setUploadingImage] = (0, import_react.useState)(false);
	const assetResolver = useAssetResolver();
	const [srcFieldFocused, setSrcFieldFocused] = (0, import_react.useState)(false);
	if (!sameElements(propSource.elements, sourceElements) || propSource.selectedElementId !== selectedElementId || propSource.selectedElementIds !== selectedElementIds || propSource.isMultiSelect !== isMultiSelect) {
		setPropSource({
			elements: sourceElements,
			selectedElementId,
			selectedElementIds,
			isMultiSelect
		});
		if (editingProp) setPropValues((prev) => ({
			...storePropValues,
			[editingProp]: prev[editingProp] ?? ""
		}));
		else setPropValues(storePropValues);
	}
	let t6;
	if ($[5] === Symbol.for("react.memo_cache_sentinel")) {
		t6 = () => {
			propsScanRequestedRef.current = false;
		};
		$[5] = t6;
	} else t6 = $[5];
	let t7;
	if ($[6] !== componentIndex) {
		t7 = [componentIndex];
		$[6] = componentIndex;
		$[7] = t7;
	} else t7 = $[7];
	(0, import_react.useEffect)(t6, t7);
	let t8;
	let t9;
	if ($[8] !== componentIndex || $[9] !== element || $[10] !== isMultiSelect || $[11] !== onRequestPropsScan || $[12] !== readOnly || $[13] !== scanLoading || $[14] !== selectedElements) {
		t8 = () => {
			if (propsScanRequestedRef.current || scanLoading || readOnly || !onRequestPropsScan) return;
			if (!componentIndex || Object.keys(componentIndex).length === 0) return;
			if (element?.type === "component") {
				if (!componentHasScannedProps(element.componentName, componentIndex)) {
					propsScanRequestedRef.current = true;
					onRequestPropsScan(element.componentName);
				}
				return;
			}
			if (isMultiSelect && selectedElements) {
				const componentElements = selectedElements.filter(_temp$41);
				if (componentElements.length === 0) return;
				const componentName = componentElements[0].componentName;
				if (!componentHasScannedProps(componentName, componentIndex)) {
					propsScanRequestedRef.current = true;
					onRequestPropsScan(componentName);
				}
			}
		};
		t9 = [
			element,
			isMultiSelect,
			selectedElements,
			componentIndex,
			scanLoading,
			readOnly,
			onRequestPropsScan
		];
		$[8] = componentIndex;
		$[9] = element;
		$[10] = isMultiSelect;
		$[11] = onRequestPropsScan;
		$[12] = readOnly;
		$[13] = scanLoading;
		$[14] = selectedElements;
		$[15] = t8;
		$[16] = t9;
	} else {
		t8 = $[15];
		t9 = $[16];
	}
	(0, import_react.useEffect)(t8, t9);
	const parsePropValue = _temp2$24;
	let t10;
	if ($[17] !== setEditingProp || $[18] !== setPropValues) {
		t10 = (propName, value_0) => {
			setEditingProp(propName);
			setPropValues((prev_0) => ({
				...prev_0,
				[propName]: value_0
			}));
		};
		$[17] = setEditingProp;
		$[18] = setPropValues;
		$[19] = t10;
	} else t10 = $[19];
	const handlePropInput = t10;
	let t11;
	let t12;
	let t13;
	if ($[20] !== assetResolver || $[21] !== componentIndex || $[22] !== editingProp || $[23] !== element || $[24] !== handlePropInput || $[25] !== hideHeader || $[26] !== iconLibraries || $[27] !== isMultiSelect || $[28] !== newAttrName || $[29] !== onCreateComponent || $[30] !== onOpenComponent || $[31] !== onReplaceElement || $[32] !== onSetElementPropsTransient || $[33] !== onUpdateElementProps || $[34] !== onUpdateMultipleElementsProps || $[35] !== propValues || $[36] !== readOnly || $[37] !== scanLoading || $[38] !== selectedElementId || $[39] !== selectedElementIds || $[40] !== selectedElements || $[41] !== setEditingProp || $[42] !== setNewAttrName || $[43] !== setPropValues || $[44] !== setSrcFieldFocused || $[45] !== setUploadingImage || $[46] !== srcFieldFocused || $[47] !== uploadImage || $[48] !== uploadingImage) {
		t13 = Symbol.for("react.early_return_sentinel");
		bb0: {
			const commitPropValue = (propName_0, value_1, propType_0) => {
				commitParsedPropValue(propName_0, value_1, parsePropValue(value_1, propType_0));
			};
			const commitParsedPropValue = (propName_1, value_2, parsedValue) => {
				setEditingProp(null);
				setPropValues((prev_1) => ({
					...prev_1,
					[propName_1]: value_2
				}));
				if (isMultiSelect && onUpdateMultipleElementsProps) onUpdateMultipleElementsProps(selectedElementIds, (currentProps) => {
					const newProps = { ...currentProps };
					if (parsedValue === void 0) delete newProps[propName_1];
					else newProps[propName_1] = parsedValue;
					return newProps;
				});
				else if (element && selectedElementId) {
					const newProps_0 = { ...element.props };
					if (parsedValue === void 0) delete newProps_0[propName_1];
					else newProps_0[propName_1] = parsedValue;
					onUpdateElementProps(selectedElementId, newProps_0);
				}
			};
			const renderComponentProp = (propName_2, propInfo, currentValue, isMixed, isSet, isCode) => {
				const propType_1 = propInfo.type || "string";
				const { kind, literals, readOnly: isSlot } = resolveComponentPropKind(propName_2, propType_1, currentValue, propInfo.default, isCode);
				const example = isSlot ? void 0 : examplePlaceholder(propInfo.example);
				const canReset = isSet && !readOnly && (kind === "enum" || kind === "boolean");
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PropField, {
					label: propName_2,
					required: propInfo.required,
					kind,
					options: literals?.map(String),
					value: currentValue,
					isMixed,
					placeholder: kind === "enum" ? example : kind === "string" || kind === "number" ? example ?? propType_1 : void 0,
					readOnly: isSlot,
					onInput: (v) => handlePropInput(propName_2, v),
					onCommit: literals ? (v_0) => commitParsedPropValue(propName_2, v_0, literals.find((literal) => String(literal) === v_0)) : (v_1) => commitPropValue(propName_2, v_1, propType_1),
					rail: readOnly ? void 0 : canReset ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
						label: `Reset ${propName_2}`,
						onClick: () => commitPropValue(propName_2, ""),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowCounterClockwiseIcon, {})
					}) : null
				}, propName_2);
			};
			const handleImageFileSelected = async (e) => {
				const file = e.target.files?.[0];
				e.target.value = "";
				if (!file) return;
				const loadingId = !isMultiSelect && selectedElementId ? selectedElementId : null;
				const baseProps = loadingId ? { ...element?.props ?? {} } : null;
				const previewUrl = file.type.startsWith("image/") ? URL.createObjectURL(file) : void 0;
				if (loadingId && baseProps && onSetElementPropsTransient) {
					const marker = {
						...baseProps,
						"data-uploading": "true"
					};
					if (previewUrl) marker["data-upload-preview"] = previewUrl;
					onSetElementPropsTransient(loadingId, marker);
				}
				setUploadingImage(true);
				const toastId = toast.loading(`Adding ${file.name || "file"}…`);
				const result = await fileToUrl(file, uploadImage);
				setUploadingImage(false);
				if (result.error) {
					if (loadingId && baseProps) onSetElementPropsTransient?.(loadingId, baseProps);
					toast.error(result.errorMessage ?? "Failed to upload file", { id: toastId });
				} else if (result.src) {
					const src = result.src;
					if (loadingId && baseProps) {
						onUpdateElementProps(loadingId, {
							...baseProps,
							src
						});
						setPropValues((prev_2) => ({
							...prev_2,
							src
						}));
					} else commitPropValue("src", src);
					toast.dismiss(toastId);
				} else {
					if (loadingId && baseProps) onSetElementPropsTransient?.(loadingId, baseProps);
					toast.dismiss(toastId);
				}
				if (previewUrl) URL.revokeObjectURL(previewUrl);
			};
			if (!selectedElementId && !isMultiSelect) {
				t13 = null;
				break bb0;
			}
			if (!element) {
				t13 = null;
				break bb0;
			}
			if (isMultiSelect) {
				const iconElements = selectedElements.filter(_temp3$19);
				const componentElements_0 = selectedElements.filter(_temp4$19);
				if (iconElements.length === selectedElements.length && iconElements.length > 0) {
					const libraryName = iconElements[0].library;
					const libraryConfig = iconLibraries?.[libraryName];
					const schema = getIconPropsSchema(libraryName, libraryConfig);
					let t14;
					if ($[52] === Symbol.for("react.memo_cache_sentinel")) {
						t14 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
							size: "sm",
							weight: "semibold",
							children: "Icon"
						});
						$[52] = t14;
					} else t14 = $[52];
					const t15 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-baseline gap-1.5",
						children: [t14, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Text$4, {
							size: "xs",
							variant: "tertiary",
							children: [
								"(",
								iconElements.length,
								" selected)"
							]
						})]
					});
					let t16;
					if ($[53] !== t15) {
						t16 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "p-3 border-b border-ed-border",
							children: t15
						});
						$[53] = t15;
						$[54] = t16;
					} else t16 = $[54];
					const t17 = readOnly ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "p-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
							size: "xs",
							variant: "tertiary",
							children: "Props editing disabled in read-only mode"
						})
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-col gap-2 px-3.5 py-2.5",
						children: Object.entries(schema).map((t18) => {
							const [propName_3, propConfig] = t18;
							const values = iconElements.map((el_2) => el_2.props?.[propName_3]);
							const isMixed_0 = new Set(values.map((v_2) => v_2 === void 0 ? String(propConfig.default ?? "") : String(v_2))).size > 1;
							const currentValue_0 = editingProp === propName_3 ? propValues[propName_3] ?? "" : isMixed_0 ? "" : propValues[propName_3] ?? String(propConfig.default ?? "");
							const { kind: kind_0, options } = iconPropKind(propConfig);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PropField, {
								label: propConfig.label || propName_3,
								kind: kind_0,
								options,
								value: currentValue_0,
								isMixed: isMixed_0,
								placeholder: String(propConfig.default ?? ""),
								onInput: (v_3) => handlePropInput(propName_3, v_3),
								onCommit: (v_4) => commitPropValue(propName_3, v_4, propConfig.type)
							}, propName_3);
						})
					});
					let t19;
					if ($[55] !== t16 || $[56] !== t17) {
						t19 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "border-b border-ed-border",
							children: [t16, t17]
						});
						$[55] = t16;
						$[56] = t17;
						$[57] = t19;
					} else t19 = $[57];
					t13 = t19;
					break bb0;
				}
				const htmlElements = selectedElements.filter(_temp5$17);
				if (htmlElements.length === selectedElements.length && htmlElements.length > 0) {
					if (new Set(htmlElements.map(_temp6$12)).size === 1) {
						const tag = htmlElements[0].tag;
						const propsForTag = htmlPropsSchema[tag] || [];
						if (propsForTag.length > 0 && !readOnly) {
							let t14;
							if ($[58] === Symbol.for("react.memo_cache_sentinel")) {
								t14 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
									size: "sm",
									weight: "semibold",
									children: "Attributes"
								});
								$[58] = t14;
							} else t14 = $[58];
							const t15 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-baseline gap-1.5",
								children: [t14, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Text$4, {
									size: "xs",
									variant: "tertiary",
									children: [
										"<",
										tag,
										"> (",
										htmlElements.length,
										")"
									]
								})]
							});
							let t16;
							if ($[59] !== t15) {
								t16 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "p-3 border-b border-ed-border",
									children: t15
								});
								$[59] = t15;
								$[60] = t16;
							} else t16 = $[60];
							t13 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "border-b border-ed-border",
								children: [t16, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex flex-col gap-2 px-3.5 py-2.5",
									children: propsForTag.map((propConfig_0) => {
										const propName_4 = propConfig_0.label;
										const values_0 = htmlElements.map((el_5) => el_5.props?.[propName_4]);
										const isMixed_1 = new Set(values_0.map(_temp7$10)).size > 1;
										const currentValue_1 = editingProp === propName_4 ? propValues[propName_4] ?? "" : isMixed_1 ? "" : propValues[propName_4] ?? "";
										return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PropField, {
											label: propName_4,
											kind: propConfig_0.type,
											value: currentValue_1,
											isMixed: isMixed_1,
											onInput: (v_6) => handlePropInput(propName_4, v_6),
											onCommit: (v_7) => commitPropValue(propName_4, v_7, propConfig_0.type)
										}, propName_4);
									})
								})]
							});
							break bb0;
						}
					}
				}
				if (componentElements_0.length === 0) {
					t13 = null;
					break bb0;
				}
				if (new Set(componentElements_0.map(_temp8$8)).size !== 1) {
					let t14;
					if ($[61] !== selectedElementIds.size) {
						t14 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "p-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Text$4, {
								size: "xs",
								variant: "tertiary",
								children: [selectedElementIds.size, " elements selected (mixed types)"]
							})
						});
						$[61] = selectedElementIds.size;
						$[62] = t14;
					} else t14 = $[62];
					t13 = t14;
					break bb0;
				}
				const componentName_0 = componentElements_0[0].componentName;
				const availableProps = (componentIndex?.[componentName_0])?.props || {};
				const editableProps = Object.entries(availableProps).filter(_temp9$6);
				if (editableProps.length === 0 && scanLoading) {
					let t14;
					if ($[63] === Symbol.for("react.memo_cache_sentinel")) {
						t14 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PropsScanLoading, {});
						$[63] = t14;
					} else t14 = $[63];
					t13 = t14;
					break bb0;
				}
				if (editableProps.length === 0) {
					t13 = null;
					break bb0;
				}
				let t14;
				if ($[64] === Symbol.for("react.memo_cache_sentinel")) {
					t14 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
						size: "sm",
						weight: "semibold",
						children: "Props"
					});
					$[64] = t14;
				} else t14 = $[64];
				const t15 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-baseline gap-1.5",
					children: [t14, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Text$4, {
						size: "xs",
						variant: "tertiary",
						children: [
							componentName_0,
							" (",
							componentElements_0.length,
							")"
						]
					})]
				});
				let t16;
				if ($[65] !== t15) {
					t16 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "p-3 border-b border-ed-border",
						children: t15
					});
					$[65] = t15;
					$[66] = t16;
				} else t16 = $[66];
				const t17 = readOnly ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "p-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
						size: "xs",
						variant: "tertiary",
						children: "Props editing disabled in read-only mode"
					})
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-col gap-2 px-3.5 py-2.5",
					children: editableProps.map((t18) => {
						const [propName_5, propInfo_0] = t18;
						const values_1 = componentElements_0.map((el_7) => el_7.props?.[propName_5]);
						const isMixed_2 = new Set(values_1.map(_temp0$5)).size > 1;
						const currentValue_2 = editingProp === propName_5 ? propValues[propName_5] ?? "" : isMixed_2 ? "" : propValues[propName_5] || "";
						const isSet_0 = values_1.some(_temp1$5);
						const isCode_0 = componentElements_0.some((el_8) => holdsCode(el_8.props, propName_5));
						return renderComponentProp(propName_5, propInfo_0, currentValue_2, isMixed_2, isSet_0, isCode_0);
					})
				});
				let t19;
				if ($[67] !== t16 || $[68] !== t17) {
					t19 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "border-b border-ed-border",
						children: [t16, t17]
					});
					$[67] = t16;
					$[68] = t17;
					$[69] = t19;
				} else t19 = $[69];
				t13 = t19;
				break bb0;
			}
			if (element.type === "webview") {
				const webviewElement = element;
				let t14;
				if ($[70] !== onReplaceElement || $[71] !== selectedElementId || $[72] !== setEditingProp || $[73] !== webviewElement) {
					t14 = (patch) => {
						if (!onReplaceElement) return;
						setEditingProp(null);
						onReplaceElement(selectedElementId, {
							...webviewElement,
							...patch
						});
					};
					$[70] = onReplaceElement;
					$[71] = selectedElementId;
					$[72] = setEditingProp;
					$[73] = webviewElement;
					$[74] = t14;
				} else t14 = $[74];
				const commitWebview = t14;
				let t15;
				if ($[75] === Symbol.for("react.memo_cache_sentinel")) {
					t15 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
						size: "sm",
						weight: "semibold",
						children: "Live Preview"
					});
					$[75] = t15;
				} else t15 = $[75];
				let t16;
				if ($[76] !== webviewElement.src) {
					t16 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "p-3 border-b border-ed-border",
						children: [t15, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
							size: "xs",
							variant: "tertiary",
							className: "mt-1",
							children: webviewElement.src
						})]
					});
					$[76] = webviewElement.src;
					$[77] = t16;
				} else t16 = $[77];
				const t17 = propValues.src ?? "";
				let t18;
				if ($[78] !== handlePropInput) {
					t18 = (v_10) => handlePropInput("src", v_10);
					$[78] = handlePropInput;
					$[79] = t18;
				} else t18 = $[79];
				let t19;
				if ($[80] !== commitWebview) {
					t19 = (v_11) => {
						if (v_11.trim()) commitWebview({ src: v_11.trim() });
					};
					$[80] = commitWebview;
					$[81] = t19;
				} else t19 = $[81];
				let t20;
				if ($[82] !== t17 || $[83] !== t18 || $[84] !== t19) {
					t20 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PropField, {
						label: "URL",
						kind: "string",
						value: t17,
						placeholder: "http://localhost:3000",
						onInput: t18,
						onCommit: t19
					});
					$[82] = t17;
					$[83] = t18;
					$[84] = t19;
					$[85] = t20;
				} else t20 = $[85];
				const t21 = propValues.viewportWidth ?? "";
				let t22;
				if ($[86] !== handlePropInput) {
					t22 = (v_12) => handlePropInput("viewportWidth", v_12);
					$[86] = handlePropInput;
					$[87] = t22;
				} else t22 = $[87];
				let t23;
				if ($[88] !== commitWebview || $[89] !== webviewElement.viewportWidth) {
					t23 = (v_13) => {
						const n = parseInt(v_13, 10);
						commitWebview({ viewportWidth: Number.isFinite(n) ? Math.max(200, n) : webviewElement.viewportWidth });
					};
					$[88] = commitWebview;
					$[89] = webviewElement.viewportWidth;
					$[90] = t23;
				} else t23 = $[90];
				let t24;
				if ($[91] !== t21 || $[92] !== t22 || $[93] !== t23) {
					t24 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PropField, {
						label: "Width",
						kind: "number",
						value: t21,
						onInput: t22,
						onCommit: t23
					});
					$[91] = t21;
					$[92] = t22;
					$[93] = t23;
					$[94] = t24;
				} else t24 = $[94];
				const t25 = propValues.viewportHeight ?? "";
				let t26;
				if ($[95] !== handlePropInput) {
					t26 = (v_14) => handlePropInput("viewportHeight", v_14);
					$[95] = handlePropInput;
					$[96] = t26;
				} else t26 = $[96];
				let t27;
				if ($[97] !== commitWebview) {
					t27 = (v_15) => {
						const n_0 = parseInt(v_15, 10);
						commitWebview({ viewportHeight: Number.isFinite(n_0) ? Math.max(200, n_0) : void 0 });
					};
					$[97] = commitWebview;
					$[98] = t27;
				} else t27 = $[98];
				let t28;
				if ($[99] !== t25 || $[100] !== t26 || $[101] !== t27) {
					t28 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PropField, {
						label: "Height",
						kind: "number",
						value: t25,
						onInput: t26,
						onCommit: t27
					});
					$[99] = t25;
					$[100] = t26;
					$[101] = t27;
					$[102] = t28;
				} else t28 = $[102];
				const t29 = propValues.label ?? "";
				let t30;
				if ($[103] !== handlePropInput) {
					t30 = (v_16) => handlePropInput("label", v_16);
					$[103] = handlePropInput;
					$[104] = t30;
				} else t30 = $[104];
				let t31;
				if ($[105] !== commitWebview) {
					t31 = (v_17) => commitWebview({ label: v_17 || void 0 });
					$[105] = commitWebview;
					$[106] = t31;
				} else t31 = $[106];
				let t32;
				if ($[107] !== t29 || $[108] !== t30 || $[109] !== t31) {
					t32 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PropField, {
						label: "Label",
						kind: "string",
						value: t29,
						placeholder: "Auto-detected from URL",
						onInput: t30,
						onCommit: t31
					});
					$[107] = t29;
					$[108] = t30;
					$[109] = t31;
					$[110] = t32;
				} else t32 = $[110];
				let t33;
				if ($[111] !== t20 || $[112] !== t24 || $[113] !== t28 || $[114] !== t32) {
					t33 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-2 px-3.5 py-2.5",
						children: [
							t20,
							t24,
							t28,
							t32
						]
					});
					$[111] = t20;
					$[112] = t24;
					$[113] = t28;
					$[114] = t32;
					$[115] = t33;
				} else t33 = $[115];
				let t34;
				if ($[116] !== t16 || $[117] !== t33) {
					t34 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "border-b border-ed-border",
						children: [t16, t33]
					});
					$[116] = t16;
					$[117] = t33;
					$[118] = t34;
				} else t34 = $[118];
				t13 = t34;
				break bb0;
			}
			if (element.type !== "component" && element.type !== "icon" && element.type !== "html") {
				t13 = null;
				break bb0;
			}
			if (element.type === "icon") {
				const iconElement = element;
				const libraryConfig_0 = iconLibraries?.[iconElement.library];
				const schema_0 = getIconPropsSchema(iconElement.library, libraryConfig_0);
				let t14;
				if ($[119] !== hideHeader || $[120] !== iconElement.iconName || $[121] !== iconElement.library || $[122] !== libraryConfig_0?.displayName) {
					t14 = !hideHeader && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ElementHeader, {
						name: iconElement.iconName,
						kind: "icon",
						detail: libraryConfig_0?.displayName || iconElement.library
					});
					$[119] = hideHeader;
					$[120] = iconElement.iconName;
					$[121] = iconElement.library;
					$[122] = libraryConfig_0?.displayName;
					$[123] = t14;
				} else t14 = $[123];
				const t16 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-col gap-2 px-3.5 py-2.5 max-h-[300px] overflow-auto",
					children: Object.entries(schema_0).map((t15) => {
						const [propName_6, propConfig_1] = t15;
						const currentValue_3 = propValues[propName_6] ?? String(propConfig_1.default ?? "");
						const { kind: kind_1, options: options_0 } = iconPropKind(propConfig_1);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PropField, {
							label: propConfig_1.label || propName_6,
							kind: kind_1,
							options: options_0,
							value: currentValue_3,
							placeholder: String(propConfig_1.default ?? ""),
							onInput: (v_18) => handlePropInput(propName_6, v_18),
							onCommit: (v_19) => commitPropValue(propName_6, v_19, propConfig_1.type)
						}, propName_6);
					})
				});
				let t17;
				if ($[124] !== t14 || $[125] !== t16) {
					t17 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "border-b border-ed-border",
						children: [t14, t16]
					});
					$[124] = t14;
					$[125] = t16;
					$[126] = t17;
				} else t17 = $[126];
				t13 = t17;
				break bb0;
			}
			if (element.type === "html") {
				const tag_0 = element.tag;
				const propsForTag_0 = htmlPropsSchema[tag_0] || [];
				const schemaKeys = new Set(propsForTag_0.map(_temp10$5));
				const internalProps = /* @__PURE__ */ new Set([
					"style",
					"className",
					"key",
					"ref",
					"children"
				]);
				const isInternalProp = (key_0) => internalProps.has(key_0) || isPetalOwnedDomProp(key_0);
				const customAttrs = Object.entries(element.props || {}).filter((t14) => {
					const [key_1] = t14;
					return !schemaKeys.has(key_1) && !isInternalProp(key_1);
				});
				let t15;
				if ($[127] !== element || $[128] !== newAttrName || $[129] !== onUpdateElementProps || $[130] !== selectedElementId || $[131] !== setNewAttrName) {
					t15 = () => {
						const name = newAttrName.trim();
						if (!name) return;
						if (element && selectedElementId) onUpdateElementProps(selectedElementId, {
							...element.props,
							[name]: ""
						});
						setNewAttrName("");
					};
					$[127] = element;
					$[128] = newAttrName;
					$[129] = onUpdateElementProps;
					$[130] = selectedElementId;
					$[131] = setNewAttrName;
					$[132] = t15;
				} else t15 = $[132];
				const handleAddAttr = t15;
				let t16;
				if ($[133] !== element.props || $[134] !== onUpdateElementProps || $[135] !== selectedElementId) {
					t16 = (attrName) => {
						const newProps_1 = { ...element.props };
						delete newProps_1[attrName];
						onUpdateElementProps(selectedElementId, newProps_1);
					};
					$[133] = element.props;
					$[134] = onUpdateElementProps;
					$[135] = selectedElementId;
					$[136] = t16;
				} else t16 = $[136];
				const handleRemoveAttr = t16;
				const hasSchemaProps = propsForTag_0.length > 0;
				const hasCustomAttrs = customAttrs.length > 0;
				const showAttrsSection = hasSchemaProps || hasCustomAttrs || !readOnly;
				const t17 = `<${tag_0}>`;
				let t18;
				if ($[137] !== onCreateComponent || $[138] !== readOnly || $[139] !== t17) {
					t18 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ElementHeader, {
						name: t17,
						kind: "html",
						onCreateComponent,
						disabled: readOnly
					});
					$[137] = onCreateComponent;
					$[138] = readOnly;
					$[139] = t17;
					$[140] = t18;
				} else t18 = $[140];
				const t19 = showAttrsSection && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col w-full px-3.5 py-2.5 gap-2 border-b border-ed-border",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex items-center justify-between w-full gap-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
								size: "2xs",
								weight: "regular",
								variant: "secondary",
								children: "Attributes"
							})
						}),
						propsForTag_0.map((propConfig_2) => {
							const propName_7 = propConfig_2.label;
							const currentValue_4 = propValues[propName_7] ?? "";
							if ((tag_0 === "img" || tag_0 === "video") && propName_7 === "src") {
								const isVideo = tag_0 === "video";
								const uploadLabel = isVideo ? "Upload video" : "Upload image";
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_react.Fragment, { children: [currentValue_4.startsWith("data:") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "p-2 bg-ed-muted rounded border border-ed-border",
									children: isVideo ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
										src: currentValue_4,
										className: "max-w-full max-h-24 mx-auto",
										muted: true
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
										src: currentValue_4,
										alt: "Preview",
										className: "max-w-full max-h-24 object-contain mx-auto"
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PropRow, {
									label: propName_7,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(InspectorControlShell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorControlInput, {
										value: srcFieldFocused ? currentValue_4 : currentValue_4 ? assetResolver(currentValue_4) : "",
										selectOnFocus: false,
										onFocus: () => setSrcFieldFocused(true),
										onChange: (e_0) => handlePropInput(propName_7, e_0.target.value),
										onBlur: (e_1) => {
											setSrcFieldFocused(false);
											commitPropValue(propName_7, e_1.target.value);
										},
										onKeyDown: handlePropInputKeyDown,
										placeholder: "https://...",
										className: "pl-2"
									}), !readOnly && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorControlAction, {
										"aria-label": uploadLabel,
										title: uploadLabel,
										disabled: uploadingImage,
										onClick: () => imageFileInputRef.current?.click(),
										className: "pr-1.5",
										children: uploadingImage ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpinnerIcon, { className: "animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UploadIcon, {})
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										ref: imageFileInputRef,
										type: "file",
										accept: isVideo ? "video/*" : "image/*",
										className: "hidden",
										onChange: handleImageFileSelected
									})]
								})] }, propName_7);
							}
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PropField, {
								label: propName_7,
								kind: propConfig_2.type,
								value: currentValue_4,
								onInput: (v_20) => handlePropInput(propName_7, v_20),
								onCommit: (v_21) => commitPropValue(propName_7, v_21, propConfig_2.type)
							}, propName_7);
						}),
						hasCustomAttrs && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [hasSchemaProps && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
							size: "3xs",
							weight: "medium",
							variant: "tertiary",
							className: "mt-1",
							children: "Custom Attributes"
						}), customAttrs.map((t20) => {
							const [attrName_0] = t20;
							const currentValue_5 = propValues[attrName_0] ?? "";
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PropField, {
								label: attrName_0,
								kind: "string",
								value: currentValue_5,
								readOnly,
								onInput: (v_22) => handlePropInput(attrName_0, v_22),
								onCommit: (v_23) => commitPropValue(attrName_0, v_23),
								action: !readOnly ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => handleRemoveAttr(attrName_0),
									"aria-label": `Remove ${attrName_0}`,
									className: "shrink-0 rounded p-0.5 text-ed-muted-foreground hover:bg-ed-muted hover:text-ed-foreground",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(XIcon, {
										width: 10,
										height: 10
									})
								}) : void 0
							}, attrName_0);
						})] }),
						!readOnly && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex w-full items-center gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorControlShell, {
								className: "flex-1",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorControlInput, {
									value: newAttrName,
									selectOnFocus: false,
									onChange: (e_2) => setNewAttrName(e_2.target.value),
									onKeyDown: (e_3) => {
										e_3.stopPropagation();
										if (e_3.key === "Enter") handleAddAttr();
									},
									placeholder: "data-theme, role, aria-label...",
									className: "pl-2"
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
								label: "Add attribute",
								onClick: handleAddAttr,
								disabled: !newAttrName.trim(),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlusIcon, {})
							})]
						})
					]
				});
				let t21;
				if ($[141] !== t18 || $[142] !== t19) {
					t21 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [t18, t19] });
					$[141] = t18;
					$[142] = t19;
					$[143] = t21;
				} else t21 = $[143];
				t13 = t21;
				break bb0;
			}
			const componentElement = element;
			const componentName_1 = componentElement.componentName;
			const componentInfo_0 = componentIndex?.[componentName_1];
			const componentFilePath = componentInfo_0?.path;
			const availableProps_0 = componentInfo_0?.props || {};
			const editableProps_0 = Object.entries(availableProps_0).filter(_temp11$5);
			if ($[144] !== componentFilePath || $[145] !== componentName_1 || $[146] !== hideHeader || $[147] !== onOpenComponent) {
				t11 = !hideHeader && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ElementHeader, {
					name: componentName_1,
					kind: "component",
					onGoToMain: componentFilePath && onOpenComponent ? () => onOpenComponent(componentName_1, componentFilePath) : void 0
				});
				$[144] = componentFilePath;
				$[145] = componentName_1;
				$[146] = hideHeader;
				$[147] = onOpenComponent;
				$[148] = t11;
			} else t11 = $[148];
			t12 = scanLoading && editableProps_0.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PropsScanLoading, {}) : editableProps_0.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-col w-full px-3.5 py-2.5 gap-2 border-b border-ed-border",
				children: editableProps_0.map((t14) => {
					const [propName_8, propInfo_1] = t14;
					const currentValue_6 = propValues[propName_8] || "";
					const isSet_1 = componentElement.props?.[propName_8] !== void 0;
					const isCode_1 = holdsCode(componentElement.props, propName_8);
					return renderComponentProp(propName_8, propInfo_1, currentValue_6, false, isSet_1, isCode_1);
				})
			}) : null;
		}
		$[20] = assetResolver;
		$[21] = componentIndex;
		$[22] = editingProp;
		$[23] = element;
		$[24] = handlePropInput;
		$[25] = hideHeader;
		$[26] = iconLibraries;
		$[27] = isMultiSelect;
		$[28] = newAttrName;
		$[29] = onCreateComponent;
		$[30] = onOpenComponent;
		$[31] = onReplaceElement;
		$[32] = onSetElementPropsTransient;
		$[33] = onUpdateElementProps;
		$[34] = onUpdateMultipleElementsProps;
		$[35] = propValues;
		$[36] = readOnly;
		$[37] = scanLoading;
		$[38] = selectedElementId;
		$[39] = selectedElementIds;
		$[40] = selectedElements;
		$[41] = setEditingProp;
		$[42] = setNewAttrName;
		$[43] = setPropValues;
		$[44] = setSrcFieldFocused;
		$[45] = setUploadingImage;
		$[46] = srcFieldFocused;
		$[47] = uploadImage;
		$[48] = uploadingImage;
		$[49] = t11;
		$[50] = t12;
		$[51] = t13;
	} else {
		t11 = $[49];
		t12 = $[50];
		t13 = $[51];
	}
	if (t13 !== Symbol.for("react.early_return_sentinel")) return t13;
	let t14;
	if ($[149] !== t11 || $[150] !== t12) {
		t14 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [t11, t12] });
		$[149] = t11;
		$[150] = t12;
		$[151] = t14;
	} else t14 = $[151];
	return t14;
}
function _temp11$5(t0) {
	const [key_2] = t0;
	return !isPanelHiddenProp(key_2);
}
function _temp10$5(p) {
	return p.label;
}
function _temp1$5(v_9) {
	return v_9 !== void 0;
}
function _temp0$5(v_8) {
	return v_8 === void 0 ? "" : typeof v_8 === "object" ? JSON.stringify(v_8) : String(v_8);
}
function _temp9$6(t0) {
	const [key] = t0;
	return !isPanelHiddenProp(key);
}
function _temp8$8(el_6) {
	return el_6.componentName;
}
function _temp7$10(v_5) {
	return v_5 === void 0 ? "" : String(v_5);
}
function _temp6$12(el_4) {
	return el_4.tag;
}
function _temp5$17(el_3) {
	return el_3.type === "html";
}
function _temp4$19(el_1) {
	return el_1.type === "component";
}
function _temp3$19(el_0) {
	return el_0.type === "icon";
}
function _temp2$24(value, propType) {
	if (value === "") return;
	const normalized = normalizePropType(propType);
	if (normalized === "number") return Number(value);
	else if (normalized === "boolean") return value === "true";
	else if (value.startsWith("{") || value.startsWith("[")) try {
		return JSON.parse(value);
	} catch {
		try {
			return new Function(`return ${value}`)();
		} catch {
			return value;
		}
	}
	else if (value === "true") return true;
	else if (value === "false") return false;
	else if (!isNaN(Number(value))) return Number(value);
	return value;
}
function _temp$41(el) {
	return el.type === "component";
}

export { ElementHeader, PropsPanel };
