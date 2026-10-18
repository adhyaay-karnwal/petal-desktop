// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/panels/styles/sections/ImageSection.tsx
import { import_jsx_runtime, import_react } from "../../../../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../../../../cloud/src/hooks/useSession.js";
import { IMAGE_ADJUST_PROP } from "../../../../../../../compiler/src/store/sanitize.js";
import { InspectorSection } from "./InspectorSection.js";
import { useStyleOps } from "../StyleOpsContext.js";
import { onImageFillEditRequest } from "../../../../../shared/state/imageFillEdit.js";
import { parseFill } from "../../../../utils/fillValue.js";
import { ImageAdjustments } from "../image/ImageAdjustments.js";
import { swapImageUrl } from "../image/imageUrls.js";
import { useImageFilePicker } from "../image/useImageFilePicker.js";
import { ColorRow } from "../inputs/ColorRow.js";

/**
* The source of a selected <img> or <video>, as one fill-style row. Its picker is the image fill's:
* replace or paste the source, Resize and Position (object-fit and object-position), and Color.
*/
var SIZE_TO_FIT = {
	cover: "cover",
	contain: "contain",
	"100% 100%": "fill",
	auto: "none"
};
var FIT_TO_SIZE = {
	cover: "cover",
	contain: "contain",
	fill: "100% 100%",
	none: "auto"
};
function ImageSection() {
	const $ = (0, import_compiler_runtime.c)(41);
	const ops = useStyleOps();
	const element = ops.element;
	const rawSrc = element?.props?.src;
	const src = typeof rawSrc === "string" ? rawSrc : "";
	const updateElement = ops.updateElement;
	const isVideo = element?.tag === "video";
	const [mediaPreview, setMediaPreview] = (0, import_react.useState)(null);
	const [pickerOpen, setPickerOpen] = (0, import_react.useState)(false);
	const elementId = ops.selectedElementId;
	let t0;
	let t1;
	if ($[0] !== elementId) {
		t0 = () => onImageFillEditRequest((id) => {
			if (id === elementId) setPickerOpen(true);
		});
		t1 = [elementId];
		$[0] = elementId;
		$[1] = t0;
		$[2] = t1;
	} else {
		t0 = $[1];
		t1 = $[2];
	}
	(0, import_react.useEffect)(t0, t1);
	let t2;
	if ($[3] !== src || $[4] !== updateElement) {
		t2 = (url) => {
			if (!updateElement || url === src) return;
			if (!src) updateElement(() => ({ props: { src: url } }));
			else updateElement(swapImageUrl(src, url, {
				source: url,
				adjust: {}
			}));
		};
		$[3] = src;
		$[4] = updateElement;
		$[5] = t2;
	} else t2 = $[5];
	const replaceSource = t2;
	const picker = useImageFilePicker(replaceSource, isVideo ? "video/*" : "image/*");
	if (element?.type !== "html" || element.tag !== "img" && !isVideo || !updateElement) return null;
	let t3;
	if ($[6] !== ops) {
		t3 = ops.get("objectFit") || "fill";
		$[6] = ops;
		$[7] = t3;
	} else t3 = $[7];
	const objectFit = String(t3);
	const t4 = FIT_TO_SIZE[objectFit] ?? objectFit;
	let t5;
	if ($[8] !== ops) {
		t5 = ops.get("objectPosition") || "center";
		$[8] = ops;
		$[9] = t5;
	} else t5 = $[9];
	const t6 = String(t5);
	let t7;
	if ($[10] !== t4 || $[11] !== t6) {
		t7 = {
			size: t4,
			position: t6
		};
		$[10] = t4;
		$[11] = t6;
		$[12] = t7;
	} else t7 = $[12];
	const imageConfig = t7;
	const value = isVideo ? `video("${src}")` : `url("${src}")`;
	let t8;
	if ($[13] !== replaceSource) {
		t8 = (next) => {
			const fill = parseFill(next);
			if (fill.kind === "image" || fill.kind === "video") replaceSource(fill.url);
		};
		$[13] = replaceSource;
		$[14] = t8;
	} else t8 = $[14];
	const onFillChange = t8;
	const t9 = isVideo ? "Video" : "Image";
	const t10 = isVideo ? "Video" : "Image";
	const t11 = isVideo ? "video" : "image";
	let t12;
	if ($[15] !== t11) {
		t12 = [t11];
		$[15] = t11;
		$[16] = t12;
	} else t12 = $[16];
	let t13;
	if ($[17] !== ops) {
		t13 = (patch) => {
			if (patch.size !== void 0) ops.set("objectFit", SIZE_TO_FIT[patch.size] ?? patch.size);
			if (patch.position !== void 0) ops.set("objectPosition", patch.position);
		};
		$[17] = ops;
		$[18] = t13;
	} else t13 = $[18];
	let t14;
	if ($[19] !== element || $[20] !== isVideo || $[21] !== ops.selectedElementId || $[22] !== picker.open || $[23] !== src || $[24] !== updateElement) {
		t14 = src ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImageAdjustments, {
			elementId: ops.selectedElementId,
			url: src,
			recordValue: element.props?.[IMAGE_ADJUST_PROP],
			target: isVideo ? "video" : "img",
			apply: (from, to, entry) => updateElement(swapImageUrl(from, to, entry)),
			onPreview: setMediaPreview,
			onUpload: picker.open
		}, ops.selectedElementId) : void 0;
		$[19] = element;
		$[20] = isVideo;
		$[21] = ops.selectedElementId;
		$[22] = picker.open;
		$[23] = src;
		$[24] = updateElement;
		$[25] = t14;
	} else t14 = $[25];
	let t15;
	if ($[26] !== imageConfig || $[27] !== mediaPreview || $[28] !== onFillChange || $[29] !== pickerOpen || $[30] !== src || $[31] !== t10 || $[32] !== t12 || $[33] !== t13 || $[34] !== t14 || $[35] !== value) {
		t15 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ColorRow, {
			label: t10,
			hideLabel: true,
			showTooltip: false,
			cssProperty: "objectFit",
			value,
			allowedFillKinds: t12,
			onChange: onFillChange,
			onChangeFill: onFillChange,
			imageSizing: "object",
			fillText: src,
			imageConfig,
			onChangeImageConfig: t13,
			imageExtras: t14,
			mediaPreview,
			open: pickerOpen,
			onOpenChange: setPickerOpen
		});
		$[26] = imageConfig;
		$[27] = mediaPreview;
		$[28] = onFillChange;
		$[29] = pickerOpen;
		$[30] = src;
		$[31] = t10;
		$[32] = t12;
		$[33] = t13;
		$[34] = t14;
		$[35] = value;
		$[36] = t15;
	} else t15 = $[36];
	let t16;
	if ($[37] !== picker.input || $[38] !== t15 || $[39] !== t9) {
		t16 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(InspectorSection, {
			title: t9,
			reserveActionRail: true,
			children: [picker.input, t15]
		});
		$[37] = picker.input;
		$[38] = t15;
		$[39] = t9;
		$[40] = t16;
	} else t16 = $[40];
	return t16;
}

export { ImageSection };
