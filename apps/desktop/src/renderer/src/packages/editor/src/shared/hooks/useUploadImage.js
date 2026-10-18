// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shared/hooks/useUploadImage.ts
import { import_compiler_runtime } from "../../../../cloud/src/hooks/useSession.js";
import { useBackend } from "../../backends/BackendContext.js";

/**
* Design system audit core: how a product's code actually uses its design
* system's components.
*
* Reads each design system component's own variant axes (cva maps, lookup
* objects indexed by a prop, string-literal union prop types), then finds every
* JSX usage in the product and splits what it passes into intentional variants
* (a declared axis with a declared value) and overrides (styling classes, an
* inline style, or a value the component doesn't declare). Usages that pass the
* same variants and the same overrides form one group. Also records which
* design system components render which, so a component the product never
* names can still count as used through another one.
*
* Pure: the caller supplies the files and the module resolver.
*/
/**
* Convert a data URL to a Blob for backend.uploadAsset()
*/
function dataUrlToBlob(dataUrl) {
	const [header, base64] = dataUrl.split(",");
	const mimeMatch = header.match(/:(.*?);/);
	const mime = mimeMatch ? mimeMatch[1] : "image/png";
	const binary = atob(base64);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
	return new Blob([bytes], { type: mime });
}
/**
* Hook that returns an upload function for images via the PetalBackend.
*
* IMPORTANT: Returns canonical paths (like /.petal-assets/xxx.png), NOT resolved URLs.
* The rendering layer (renderElement) handles resolution via assetResolver at render time.
* This prevents stale absolute URLs (with ephemeral ports) from being stored in elements.
*/
function useUploadImage() {
	const $ = (0, import_compiler_runtime.c)(2);
	const backend = useBackend();
	let t0;
	if ($[0] !== backend) {
		t0 = async (dataUrl, mimeType) => {
			let ext = "png";
			if (mimeType) {
				const subtype = mimeType.split("/")[1];
				if (subtype) ext = subtype;
			}
			try {
				const blob = dataUrlToBlob(dataUrl);
				const result = await backend.uploadAsset(blob, `image-${Date.now()}.${ext}`);
				if (result.success) {
					if (result.url) return { url: result.url };
				}
			} catch (t1) {
				console.warn("[useUploadImage] Backend upload failed:", t1);
			}
			return { url: null };
		};
		$[0] = backend;
		$[1] = t0;
	} else t0 = $[1];
	return t0;
}

export { useUploadImage };
