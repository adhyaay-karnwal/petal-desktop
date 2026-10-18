// Reconstructed from index-C74mRL57.js — original module: packages/compiler/src/runtime/figma/translator/styles/stackAlign.ts
import { FIGMA_SPACE_BETWEEN } from "../constants.js";

var CSS_ALIGN = {
	MIN: "flex-start",
	MAX: "flex-end",
	CENTER: "center",
	SPACE_BETWEEN: "space-between",
	[FIGMA_SPACE_BETWEEN]: "space-between",
	BASELINE: "baseline",
	STRETCH: "stretch"
};
function cssAlign(value) {
	return value ? CSS_ALIGN[value] : void 0;
}
function isDistributedAlign(value) {
	return value === "SPACE_BETWEEN" || value === "SPACE_EVENLY" || value === "SPACE_AROUND";
}

export { cssAlign, isDistributedAlign };
