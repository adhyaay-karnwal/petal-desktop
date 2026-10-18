// Reconstructed from index.js — original module: app/src/main/captureImage.ts

/**
* Downscale an offscreen page capture for review and encode it as base64 PNG.
*
* Mirrors the shared capture budget (see @petal/editor/lib):
* width drives legibility, so a tall page keeps its proportions and grows taller
* instead of being squashed into a fixed box.
*/
var MAX_WIDTH = 2400;
var MAX_PIXELS = 6e6;
function toPngBase64(image) {
	const { width, height } = image.getSize();
	const scale = Math.min(1, MAX_WIDTH / width, Math.sqrt(MAX_PIXELS / (width * height)));
	return (scale < 1 ? image.resize({
		width: Math.round(width * scale),
		height: Math.round(height * scale)
	}) : image).toPNG().toString("base64");
}

export { toPngBase64 };
