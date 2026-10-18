// Reconstructed from index-C74mRL57.js — original module: packages/cloud/src/services/localFonts.ts
import { readFontMetadata } from "../../../compiler/src/runtime/fontMetadata.js";

/** Only called by the desktop font provider after account consent. */
async function discoverLocalFonts() {
	const desktop = window;
	if (!desktop.api?.getApiUrl || !desktop.queryLocalFonts) throw new Error("Installed fonts are available in the Petal desktop app.");
	return desktop.queryLocalFonts();
}
async function prepareLocalFamily(fonts, family) {
	const files = [];
	const loaded = [];
	try {
		for (const font of fonts.filter((f) => f.family === family)) {
			const blob = await font.blob();
			if (blob.size > 10485760) throw new Error("Font files must be smaller than 10 MB.");
			const bytes = await blob.arrayBuffer();
			const metadata = readFontMetadata(bytes);
			const face = new FontFace(metadata.family, bytes, {
				weight: metadata.weight,
				style: metadata.style
			});
			await face.load();
			document.fonts.add(face);
			loaded.push(face);
			files.push({
				bytes,
				metadata
			});
		}
		if (!files.length) throw new Error("This font is no longer installed. Reopen the font picker to refresh.");
		return {
			files,
			loaded,
			family: files[0].metadata.family
		};
	} catch (error) {
		loaded.forEach((face) => document.fonts.delete(face));
		throw error;
	}
}

export { discoverLocalFonts, prepareLocalFamily };
