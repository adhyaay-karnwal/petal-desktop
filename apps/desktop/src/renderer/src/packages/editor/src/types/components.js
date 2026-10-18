// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/types/components.ts

var PHOSPHOR_PROPS_SCHEMA = {
	size: {
		type: "number",
		default: 24,
		label: "Size"
	},
	weight: {
		type: "enum",
		options: [
			"thin",
			"light",
			"regular",
			"bold",
			"fill",
			"duotone"
		],
		default: "regular",
		label: "Weight"
	},
	color: {
		type: "color",
		label: "Color"
	},
	mirrored: {
		type: "boolean",
		default: false,
		label: "Mirrored"
	}
};
var LUCIDE_PROPS_SCHEMA = {
	size: {
		type: "number",
		default: 24,
		label: "Size"
	},
	strokeWidth: {
		type: "number",
		default: 2,
		label: "Stroke Width"
	},
	color: {
		type: "color",
		label: "Color"
	},
	absoluteStrokeWidth: {
		type: "boolean",
		default: false,
		label: "Absolute Stroke"
	}
};

export { LUCIDE_PROPS_SCHEMA, PHOSPHOR_PROPS_SCHEMA };
