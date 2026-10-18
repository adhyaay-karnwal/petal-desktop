// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shared/utils/assetExport.ts

/** Formats new rows can pick. WEBP and AVIF rows saved earlier still export. */
var EXPORT_FORMATS = [
	"png",
	"jpg",
	"pdf"
];
var exportFormatLabel = (format) => format === "jpg" ? "JPEG" : format.toUpperCase();
var DEFAULT_EXPORT_SIZE = {
	constraint: "scale",
	value: 1
};
var NO_EXPORT_SETTINGS = [];
/** Layers export nothing until the user adds a preset. */
var exportSettingsOf = (element) => element.exportSettings ?? NO_EXPORT_SETTINGS;
var EXPORT_SIZES = [
	...[
		.5,
		.75,
		1,
		1.5,
		2,
		3,
		4
	].map((value) => ({
		constraint: "scale",
		value,
		label: `${value}x`
	})),
	{
		constraint: "width",
		value: 512,
		label: "512w"
	},
	{
		constraint: "height",
		value: 512,
		label: "512h"
	}
];
function exportSizeLabel({ constraint, value }) {
	return EXPORT_SIZES.find((size) => size.constraint === constraint && size.value === value)?.label ?? `${value}${constraint === "scale" ? "x" : constraint === "width" ? "w" : "h"}`;
}
/** Parse a typed size such as "2x", "1.5", "1080p", "720h", or "512w". Pixel sizes round to whole pixels. */
function parseExportSize(text) {
	const match = /^\s*(\d*\.?\d+)\s*([x×whp]?)\s*$/i.exec(text);
	if (!match) return null;
	const value = Number(match[1]);
	const suffix = match[2].toLowerCase();
	if (!(value > 0)) return null;
	if (suffix === "w") return {
		constraint: "width",
		value: Math.round(value)
	};
	if (suffix === "h" || suffix === "p") return {
		constraint: "height",
		value: Math.round(value)
	};
	return {
		constraint: "scale",
		value
	};
}
/** The multiplier that turns the captured bounds into the requested output size. */
function resolveExportScale({ constraint, value }, width, height) {
	return constraint === "scale" ? value : value / (constraint === "width" ? width : height);
}
var MAX_EXPORT_PIXELS = 64e6;
var MAX_EXPORT_DIMENSION = 32e3;
var outputSize = (width, height, scale) => ({
	width: Math.max(1, Math.round(width * scale)),
	height: Math.max(1, Math.round(height * scale))
});
var exceedsExportLimits = ({ width, height }) => width > 32e3 || height > 32e3 || width * height > 64e6;
function exportDimensions(width, height, scale) {
	if (![
		width,
		height,
		scale
	].every((value) => Number.isFinite(value) && value > 0)) throw new Error("Export size and scale must be positive numbers.");
	const result = outputSize(width, height, scale);
	if (exceedsExportLimits(result)) throw new Error("This export is too large. Choose a smaller size (maximum 32,000 px per side and 64 megapixels).");
	return result;
}
/** Toast for a finished Copy as PNG. Rounds down so a shrunk copy never reads as its full scale. */
function copiedPngMessage({ scale, reduced }) {
	if (!reduced) return "Copied as PNG";
	return `Copied as PNG at ${Math.floor(scale * 100) / 100 || +scale.toPrecision(1)}x to fit the size limit`;
}
/** The largest scale, up to `scale`, whose output stays within the export limits. */
function fitExportScale(width, height, scale) {
	let fitted = Math.min(scale, MAX_EXPORT_DIMENSION / width, MAX_EXPORT_DIMENSION / height, Math.sqrt(MAX_EXPORT_PIXELS / (width * height)));
	while (exceedsExportLimits(outputSize(width, height, fitted))) fitted *= .999;
	return fitted;
}
function exportLayerName(element) {
	return element.name || (element.type === "component" ? element.componentName : element.type === "webview" ? element.label || "Live Preview" : element.type === "icon" ? element.iconName : element.type === "text" ? element.text?.slice(0, 60) || "Text" : element.type === "capture" ? element.original.componentName : element.tag);
}
var UNSAFE_FILENAME_CHARS = /[<>:"/\\|?*\u0000-\u001f]/g;
function exportFilename(name, setting, used) {
	const base = `${name.replace(UNSAFE_FILENAME_CHARS, "-").replace(/[. ]+$/g, "").trim().slice(0, 120) || "Export"}${(setting.suffix ?? `@${exportSizeLabel(setting)}`).replace(UNSAFE_FILENAME_CHARS, "-")}`;
	let result = `${base}.${setting.format}`;
	let index = 2;
	while (used.has(result.toLowerCase())) result = `${base}-${index++}.${setting.format}`;
	used.add(result.toLowerCase());
	return result;
}
function exportDocument(snapshot, scale, title = "Export") {
	const escapedTitle = title.replace(/[&<>"']/g, (char) => ({
		"&": "&amp;",
		"<": "&lt;",
		">": "&gt;",
		"\"": "&quot;",
		"'": "&#39;"
	})[char]);
	const size = exportDimensions(snapshot.width, snapshot.height, scale);
	return `<!doctype html><html><head><meta charset="utf-8"><title>${escapedTitle}</title><meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data: blob:; font-src data:; style-src 'unsafe-inline';"><style>
    @page { size: ${size.width}px ${size.height}px; margin: 0; }
    html, body { margin: 0; padding: 0; width: ${size.width}px; height: ${size.height}px; overflow: hidden; }
    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; animation: none !important; transition: none !important; }
    #asset-export-root { position: relative; width: ${snapshot.width}px; height: ${snapshot.height}px; transform: scale(${scale}); transform-origin: 0 0; }
  </style></head><body><div id="asset-export-root">${snapshot.html}</div></body></html>`;
}

export { DEFAULT_EXPORT_SIZE, EXPORT_FORMATS, EXPORT_SIZES, copiedPngMessage, exportDimensions, exportDocument, exportFilename, exportFormatLabel, exportLayerName, exportSettingsOf, exportSizeLabel, fitExportScale, parseExportSize, resolveExportScale };
