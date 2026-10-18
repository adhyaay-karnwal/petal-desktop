// Reconstructed from index-C74mRL57.js — original module: packages/compiler/src/runtime/figma/utils/color.ts

function rgbaToCss(color, opacity = 1) {
	if (!color) return void 0;
	return `rgba(${Math.round((color.r ?? 0) * 255)}, ${Math.round((color.g ?? 0) * 255)}, ${Math.round((color.b ?? 0) * 255)}, ${(color.a ?? 1) * opacity})`;
}

export { rgbaToCss };
