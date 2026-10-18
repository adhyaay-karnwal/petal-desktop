// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/canvas/components/MediaWithFallback.tsx
import { import_react } from "../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../cloud/src/hooks/useSession.js";
import { ImageBrokenIcon, ImageIcon, SpinnerIcon, VideoCameraIcon } from "../../../../ui/src/icons.js";
import { c$5 } from "../../../../../vendor/@phosphor-icons/react.js";
import { normalizeReactAttrs } from "../../../../compiler/src/codegen/htmlAttrCasing.js";
import { MediaUploadPlaceholder } from "./MediaUploadPlaceholder.js";

var PLACEHOLDER_ICON = {
	img: {
		empty: ImageIcon,
		error: ImageBrokenIcon,
		loading: SpinnerIcon
	},
	video: {
		empty: VideoCameraIcon,
		error: c$5,
		loading: SpinnerIcon
	}
};
function MediaWithFallback(t0) {
	const $ = (0, import_compiler_runtime.c)(22);
	const { tag, elementProps, style, commonProps, children, onCommitSource } = t0;
	const src = elementProps.src;
	const [errored, setErrored] = (0, import_react.useState)(false);
	const [seenSrc, setSeenSrc] = (0, import_react.useState)(src);
	if (src !== seenSrc) {
		setSeenSrc(src);
		if (errored) setErrored(false);
	}
	const hasSource = isNonEmptyString(src) || tag === "video" && hasChildren(children);
	const isUploading = elementProps["data-uploading"] === "true";
	const previewSrc = elementProps["data-upload-preview"];
	if (isUploading && !errored && isNonEmptyString(previewSrc)) {
		let t1;
		if ($[0] !== commonProps || $[1] !== previewSrc || $[2] !== style) {
			t1 = renderUploadingPreview(previewSrc, style, commonProps);
			$[0] = commonProps;
			$[1] = previewSrc;
			$[2] = style;
			$[3] = t1;
		} else t1 = $[3];
		return t1;
	}
	if (!hasSource || errored) {
		if (!errored && !isUploading && onCommitSource) {
			let t1;
			if ($[4] !== commonProps || $[5] !== onCommitSource || $[6] !== style || $[7] !== tag) {
				t1 = (0, import_react.createElement)(MediaUploadPlaceholder, {
					tag,
					style,
					commonProps,
					onCommitSource
				});
				$[4] = commonProps;
				$[5] = onCommitSource;
				$[6] = style;
				$[7] = tag;
				$[8] = t1;
			} else t1 = $[8];
			return t1;
		}
		const state = errored ? "error" : isUploading ? "loading" : "empty";
		const failedSrc = errored && tag === "img" ? src : void 0;
		let t1;
		if ($[9] !== commonProps || $[10] !== failedSrc || $[11] !== state || $[12] !== style || $[13] !== tag) {
			t1 = renderPlaceholder(tag, state, style, commonProps, failedSrc);
			$[9] = commonProps;
			$[10] = failedSrc;
			$[11] = state;
			$[12] = style;
			$[13] = tag;
			$[14] = t1;
		} else t1 = $[14];
		return t1;
	}
	let t1;
	if ($[15] !== children || $[16] !== commonProps || $[17] !== elementProps || $[18] !== style || $[19] !== tag) {
		let t2;
		if ($[21] === Symbol.for("react.memo_cache_sentinel")) {
			t2 = () => setErrored(true);
			$[21] = t2;
		} else t2 = $[21];
		t1 = (0, import_react.createElement)(tag, {
			...normalizeReactAttrs(elementProps),
			style,
			...commonProps,
			draggable: false,
			onError: t2
		}, tag === "video" ? children : void 0);
		$[15] = children;
		$[16] = commonProps;
		$[17] = elementProps;
		$[18] = style;
		$[19] = tag;
		$[20] = t1;
	} else t1 = $[20];
	return t1;
}
function renderPlaceholder(tag, state, style, commonProps, failedSrc) {
	const Icon = PLACEHOLDER_ICON[tag][state];
	const sizeStyle = {
		width: style?.width ?? 200,
		height: style?.height ?? 150
	};
	return (0, import_react.createElement)("div", {
		...commonProps,
		style: sizeStyle,
		"data-media-placeholder": state,
		"data-failed-src": failedSrc,
		className: "box-border flex items-center justify-center overflow-hidden rounded-xl border-[1.5px] border-dashed border-border bg-muted text-muted-foreground"
	}, (0, import_react.createElement)(Icon, {
		width: 36,
		height: 36,
		className: state === "loading" ? "animate-spin" : void 0
	}));
}
function renderUploadingPreview(previewSrc, style, commonProps) {
	const sizeStyle = {
		width: style?.width ?? 200,
		height: style?.height ?? 150
	};
	return (0, import_react.createElement)("div", {
		...commonProps,
		style: sizeStyle,
		"data-media-placeholder": "loading",
		className: "relative box-border flex items-center justify-center overflow-hidden bg-muted"
	}, (0, import_react.createElement)("img", {
		src: previewSrc,
		draggable: false,
		"aria-hidden": true,
		className: "absolute inset-0 h-full w-full scale-110 object-cover blur-md brightness-75"
	}), (0, import_react.createElement)(SpinnerIcon, {
		width: 32,
		height: 32,
		className: "relative animate-spin text-white drop-shadow"
	}));
}
function isNonEmptyString(value) {
	return typeof value === "string" && value.trim() !== "";
}
function hasChildren(children) {
	return Array.isArray(children) ? children.length > 0 : children != null;
}

export { MediaWithFallback };
