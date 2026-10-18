// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/canvas/components/MediaUploadPlaceholder.tsx
import { import_jsx_runtime, import_react } from "../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../cloud/src/hooks/useSession.js";
import { cn$2 } from "../../../../ui/src/lib/utils.js";
import { ArrowRightIcon, FileImageIcon, FileVideoIcon, SpinnerIcon } from "../../../../ui/src/icons.js";
import { Text$4 } from "../../../../ui/src/components/Text.js";
import { Button } from "../../../../ui/src/components/Button.js";
import { Input } from "../../../../ui/src/components/Input.js";
import { toast } from "../../../../../vendor/sonner.js";
import { useUploadImage } from "../../shared/hooks/useUploadImage.js";
import { fileToUrl } from "../../shared/utils/clipboard.js";

function MediaUploadPlaceholder(t0) {
	const $ = (0, import_compiler_runtime.c)(62);
	const { tag, style, commonProps, onCommitSource } = t0;
	const uploadImage = useUploadImage();
	const fileInputRef = (0, import_react.useRef)(null);
	const [isDragOver, setIsDragOver] = (0, import_react.useState)(false);
	const [uploading, setUploading] = (0, import_react.useState)(false);
	const [previewUrl, setPreviewUrl] = (0, import_react.useState)(void 0);
	const [url, setUrl] = (0, import_react.useState)("");
	const isVideo = tag === "video";
	const mediaWord = isVideo ? "video" : "image";
	const accept = isVideo ? "video/*" : "image/*";
	const MediaIcon = isVideo ? FileVideoIcon : FileImageIcon;
	const t1 = style?.width ?? 200;
	const t2 = style?.height ?? 150;
	let t3;
	if ($[0] !== t1 || $[1] !== t2) {
		t3 = {
			width: t1,
			height: t2
		};
		$[0] = t1;
		$[1] = t2;
		$[2] = t3;
	} else t3 = $[2];
	const sizeStyle = t3;
	let t4;
	if ($[3] !== mediaWord || $[4] !== onCommitSource || $[5] !== uploadImage) {
		t4 = async (file) => {
			setUploading(true);
			const preview = file.type.startsWith("image/") ? URL.createObjectURL(file) : void 0;
			setPreviewUrl(preview);
			const result = await fileToUrl(file, uploadImage);
			if (result.error || !result.src) {
				if (preview) URL.revokeObjectURL(preview);
				setPreviewUrl(void 0);
				setUploading(false);
				toast.error(result.errorMessage || `Failed to upload ${mediaWord}`);
				return;
			}
			onCommitSource(result.src);
			if (preview) URL.revokeObjectURL(preview);
		};
		$[3] = mediaWord;
		$[4] = onCommitSource;
		$[5] = uploadImage;
		$[6] = t4;
	} else t4 = $[6];
	const handleFile = t4;
	let t5;
	if ($[7] !== handleFile) {
		t5 = (e) => {
			e.preventDefault();
			e.stopPropagation();
			setIsDragOver(false);
			const file_0 = e.dataTransfer.files?.[0];
			if (file_0) handleFile(file_0);
		};
		$[7] = handleFile;
		$[8] = t5;
	} else t5 = $[8];
	const handleDrop = t5;
	let t6;
	if ($[9] !== onCommitSource || $[10] !== url) {
		t6 = () => {
			const trimmed = url.trim();
			if (trimmed) onCommitSource(trimmed);
		};
		$[9] = onCommitSource;
		$[10] = url;
		$[11] = t6;
	} else t6 = $[11];
	const submitUrl = t6;
	let t7;
	if ($[12] === Symbol.for("react.memo_cache_sentinel")) {
		t7 = {
			onPointerDown: stop$1,
			onMouseDown: stop$1,
			onClick: stop$1
		};
		$[12] = t7;
	} else t7 = $[12];
	const stopPointer = t7;
	if (uploading) {
		let t8;
		if ($[13] !== previewUrl) {
			t8 = previewUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: previewUrl,
				"aria-hidden": true,
				draggable: false,
				className: "absolute inset-0 h-full w-full scale-110 object-cover blur-md brightness-75"
			});
			$[13] = previewUrl;
			$[14] = t8;
		} else t8 = $[14];
		const t9 = previewUrl ? "text-white" : "text-card-foreground";
		let t10;
		if ($[15] !== t9) {
			t10 = cn$2("relative animate-spin", t9);
			$[15] = t9;
			$[16] = t10;
		} else t10 = $[16];
		let t11;
		if ($[17] !== t10) {
			t11 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpinnerIcon, {
				width: 28,
				height: 28,
				className: t10
			});
			$[17] = t10;
			$[18] = t11;
		} else t11 = $[18];
		let t12;
		if ($[19] !== commonProps || $[20] !== sizeStyle || $[21] !== t11 || $[22] !== t8) {
			t12 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				...commonProps,
				style: sizeStyle,
				"data-media-placeholder": "loading",
				className: "relative box-border flex items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-border bg-card",
				children: [t8, t11]
			});
			$[19] = commonProps;
			$[20] = sizeStyle;
			$[21] = t11;
			$[22] = t8;
			$[23] = t12;
		} else t12 = $[23];
		return t12;
	}
	let t8;
	let t9;
	if ($[24] === Symbol.for("react.memo_cache_sentinel")) {
		t8 = (e_0) => {
			e_0.preventDefault();
			e_0.stopPropagation();
			setIsDragOver(true);
		};
		t9 = (e_1) => {
			e_1.preventDefault();
			setIsDragOver(false);
		};
		$[24] = t8;
		$[25] = t9;
	} else {
		t8 = $[24];
		t9 = $[25];
	}
	const t10 = isDragOver ? "border-foreground bg-accent" : "border-border bg-card";
	let t11;
	if ($[26] !== t10) {
		t11 = cn$2("relative box-border flex flex-col items-center justify-center gap-3 overflow-hidden rounded-xl border-[1.5px] border-dashed p-4 text-center", t10);
		$[26] = t10;
		$[27] = t11;
	} else t11 = $[27];
	let t12;
	if ($[28] !== handleFile) {
		t12 = (e_2) => {
			const file_1 = e_2.target.files?.[0];
			e_2.target.value = "";
			if (file_1) handleFile(file_1);
		};
		$[28] = handleFile;
		$[29] = t12;
	} else t12 = $[29];
	let t13;
	if ($[30] !== accept || $[31] !== t12) {
		t13 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			ref: fileInputRef,
			type: "file",
			accept,
			hidden: true,
			onChange: t12
		});
		$[30] = accept;
		$[31] = t12;
		$[32] = t13;
	} else t13 = $[32];
	let t14;
	if ($[33] !== MediaIcon) {
		t14 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "relative",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "relative text-muted-foreground",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MediaIcon, {
					width: 36,
					height: 36
				})
			})
		});
		$[33] = MediaIcon;
		$[34] = t14;
	} else t14 = $[34];
	let t15;
	if ($[35] === Symbol.for("react.memo_cache_sentinel")) {
		t15 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-center justify-center gap-1 leading-snug",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				variant: "link",
				size: "text",
				isChildText: false,
				...stopPointer,
				onClick: (e_3) => {
					stop$1(e_3);
					fileInputRef.current?.click();
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
					size: "2xs",
					weight: "semibold",
					children: "Click to upload"
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
				size: "2xs",
				variant: "tertiary",
				children: "or drag and drop"
			})]
		});
		$[35] = t15;
	} else t15 = $[35];
	const t16 = `Or paste ${mediaWord} URL`;
	let t17;
	if ($[36] === Symbol.for("react.memo_cache_sentinel")) {
		t17 = (e_4) => setUrl(e_4.target.value);
		$[36] = t17;
	} else t17 = $[36];
	let t18;
	if ($[37] !== submitUrl) {
		t18 = (e_5) => {
			if (e_5.key === "Enter") {
				e_5.preventDefault();
				submitUrl();
			}
		};
		$[37] = submitUrl;
		$[38] = t18;
	} else t18 = $[38];
	let t19;
	if ($[39] !== t16 || $[40] !== t18 || $[41] !== url) {
		t19 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
			type: "text",
			size: "xs",
			value: url,
			placeholder: t16,
			onChange: t17,
			onKeyDown: t18,
			className: "flex-1 h-6"
		});
		$[39] = t16;
		$[40] = t18;
		$[41] = url;
		$[42] = t19;
	} else t19 = $[42];
	const t20 = `Add ${mediaWord} from URL`;
	let t21;
	if ($[43] !== url) {
		t21 = url.trim();
		$[43] = url;
		$[44] = t21;
	} else t21 = $[44];
	const t22 = !t21;
	let t23;
	if ($[45] !== submitUrl) {
		t23 = (e_6) => {
			stop$1(e_6);
			submitUrl();
		};
		$[45] = submitUrl;
		$[46] = t23;
	} else t23 = $[46];
	let t24;
	if ($[47] !== t20 || $[48] !== t22 || $[49] !== t23) {
		t24 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			type: "button",
			size: "icon-xs",
			RightIcon: ArrowRightIcon,
			"aria-label": t20,
			disabled: t22,
			...stopPointer,
			onClick: t23
		});
		$[47] = t20;
		$[48] = t22;
		$[49] = t23;
		$[50] = t24;
	} else t24 = $[50];
	let t25;
	if ($[51] !== t19 || $[52] !== t24) {
		t25 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			...stopPointer,
			className: "flex w-full max-w-[280px] items-center gap-1.5",
			children: [t19, t24]
		});
		$[51] = t19;
		$[52] = t24;
		$[53] = t25;
	} else t25 = $[53];
	let t26;
	if ($[54] !== commonProps || $[55] !== handleDrop || $[56] !== sizeStyle || $[57] !== t11 || $[58] !== t13 || $[59] !== t14 || $[60] !== t25) {
		t26 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			...commonProps,
			style: sizeStyle,
			"data-media-placeholder": "empty",
			onDragOver: t8,
			onDragLeave: t9,
			onDrop: handleDrop,
			className: t11,
			children: [
				t13,
				t14,
				t15,
				t25
			]
		});
		$[54] = commonProps;
		$[55] = handleDrop;
		$[56] = sizeStyle;
		$[57] = t11;
		$[58] = t13;
		$[59] = t14;
		$[60] = t25;
		$[61] = t26;
	} else t26 = $[61];
	return t26;
}
function stop$1(e) {
	e.stopPropagation();
}

export { MediaUploadPlaceholder };
