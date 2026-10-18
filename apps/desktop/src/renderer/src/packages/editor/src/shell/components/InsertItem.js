// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/InsertItem.tsx
import { import_jsx_runtime, import_react } from "../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../cloud/src/hooks/useSession.js";
import { Text$4 } from "../../../../ui/src/components/Text.js";
import { setElementDragData } from "../../shared/utils/clipboard.js";
import { createElementFromTag } from "../utils/htmlTagsData.js";

var renderPreview = (tagData) => {
	const element = createElementFromTag(tagData);
	if (element.type !== "html") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: "Component" });
	const previewStyles = {
		...element.styles,
		width: "auto",
		height: "auto",
		maxWidth: "100%",
		maxHeight: "100%",
		position: "static",
		margin: "0",
		fontSize: "6px",
		padding: "2px"
	};
	const isVoidElement = [
		"input",
		"img",
		"br",
		"hr",
		"meta",
		"link",
		"area",
		"base",
		"col",
		"embed",
		"param",
		"source",
		"track",
		"wbr"
	].includes(element.tag?.toLowerCase() || "");
	const usesValueProp = ["textarea", "select"].includes(element.tag?.toLowerCase() || "");
	const textChild = element.children?.find((child) => child.type === "text");
	const textContent = textChild?.type === "text" ? textChild.text : void 0;
	const elementProps = { style: previewStyles };
	if (usesValueProp && textContent) elementProps.defaultValue = textContent;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "pointer-events-none text-[6px] leading-tight",
		children: (0, import_react.createElement)(element.tag ?? "div", elementProps, isVoidElement || usesValueProp ? void 0 : textContent)
	});
};
var InsertItem = (t0) => {
	const $ = (0, import_compiler_runtime.c)(24);
	const { tagData, onClick, readOnly: t1 } = t0;
	const readOnly = t1 === void 0 ? false : t1;
	let t2;
	if ($[0] !== readOnly || $[1] !== tagData) {
		t2 = (e) => {
			if (readOnly) return;
			setElementDragData(e, createElementFromTag(tagData));
		};
		$[0] = readOnly;
		$[1] = tagData;
		$[2] = t2;
	} else t2 = $[2];
	const handleDragStart = t2;
	const t3 = !readOnly;
	const t4 = `w-full flex items-center gap-3 px-4 py-2.5 hover:bg-ed-accent border-b border-ed-border ${!readOnly && "cursor-grab active:cursor-grabbing"}`;
	let t5;
	if ($[3] !== tagData) {
		t5 = renderPreview(tagData);
		$[3] = tagData;
		$[4] = t5;
	} else t5 = $[4];
	let t6;
	if ($[5] !== t5) {
		t6 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			"data-panel-drag-preview": true,
			className: "shrink-0 w-10 h-10 rounded border border-ed-border flex items-center justify-center bg-ed-secondary overflow-hidden",
			children: t5
		});
		$[5] = t5;
		$[6] = t6;
	} else t6 = $[6];
	let t7;
	if ($[7] !== tagData.title) {
		t7 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
			size: "sm",
			weight: "medium",
			variant: "primary",
			className: "mb-0.5 block",
			children: tagData.title
		});
		$[7] = tagData.title;
		$[8] = t7;
	} else t7 = $[8];
	let t8;
	if ($[9] !== tagData.description) {
		t8 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
			size: "xs",
			variant: "secondary",
			className: "truncate block",
			children: tagData.description
		});
		$[9] = tagData.description;
		$[10] = t8;
	} else t8 = $[10];
	let t9;
	if ($[11] !== t7 || $[12] !== t8) {
		t9 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex-1 min-w-0 text-left",
			children: [t7, t8]
		});
		$[11] = t7;
		$[12] = t8;
		$[13] = t9;
	} else t9 = $[13];
	let t10;
	if ($[14] !== tagData.tag) {
		t10 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "shrink-0",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Text$4, {
				size: "2xs",
				variant: "tertiary",
				className: "font-mono",
				children: [
					"<",
					tagData.tag,
					">"
				]
			})
		});
		$[14] = tagData.tag;
		$[15] = t10;
	} else t10 = $[15];
	let t11;
	if ($[16] !== handleDragStart || $[17] !== onClick || $[18] !== t10 || $[19] !== t3 || $[20] !== t4 || $[21] !== t6 || $[22] !== t9) {
		t11 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			draggable: t3,
			onDragStart: handleDragStart,
			onClick,
			className: t4,
			children: [
				t6,
				t9,
				t10
			]
		});
		$[16] = handleDragStart;
		$[17] = onClick;
		$[18] = t10;
		$[19] = t3;
		$[20] = t4;
		$[21] = t6;
		$[22] = t9;
		$[23] = t11;
	} else t11 = $[23];
	return t11;
};

export { InsertItem };
