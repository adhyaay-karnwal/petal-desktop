// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/panels/styles/image/useImageFilePicker.tsx
import { import_jsx_runtime, import_react } from "../../../../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../../../../cloud/src/hooks/useSession.js";
import { toast } from "../../../../../../../../vendor/sonner.js";
import { useUploadImage } from "../../../../../shared/hooks/useUploadImage.js";
import { fileToUrl } from "../../../../../shared/utils/clipboard.js";

/** Hidden file input that uploads the picked file (images by default) and hands back its URL. */
function useImageFilePicker(onUploaded, t0) {
	const $ = (0, import_compiler_runtime.c)(11);
	const accept = t0 === void 0 ? "image/*" : t0;
	const uploadImage = useUploadImage();
	const inputRef = (0, import_react.useRef)(null);
	let t1;
	if ($[0] !== onUploaded || $[1] !== uploadImage) {
		t1 = async (file) => {
			const result = await fileToUrl(file, uploadImage);
			if (result.src) onUploaded(result.src);
			else toast.error(result.errorMessage ?? "Failed to upload file");
		};
		$[0] = onUploaded;
		$[1] = uploadImage;
		$[2] = t1;
	} else t1 = $[2];
	const upload = t1;
	let t2;
	if ($[3] !== upload) {
		t2 = (e) => {
			const file_0 = e.target.files?.[0];
			e.target.value = "";
			if (file_0) upload(file_0);
		};
		$[3] = upload;
		$[4] = t2;
	} else t2 = $[4];
	let t3;
	if ($[5] !== accept || $[6] !== t2) {
		t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			ref: inputRef,
			type: "file",
			accept,
			hidden: true,
			onChange: t2
		});
		$[5] = accept;
		$[6] = t2;
		$[7] = t3;
	} else t3 = $[7];
	const input = t3;
	let t4;
	if ($[8] === Symbol.for("react.memo_cache_sentinel")) {
		t4 = () => inputRef.current?.click();
		$[8] = t4;
	} else t4 = $[8];
	let t5;
	if ($[9] !== input) {
		t5 = {
			input,
			open: t4
		};
		$[9] = input;
		$[10] = t5;
	} else t5 = $[10];
	return t5;
}

export { useImageFilePicker };
