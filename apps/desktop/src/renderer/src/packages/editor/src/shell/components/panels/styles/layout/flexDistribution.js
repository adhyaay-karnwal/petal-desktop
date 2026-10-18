// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/panels/styles/layout/flexDistribution.ts

/**
* The `justify-content` values that distribute flex items along the main axis
* instead of packing them. Ordered as the alignment matrix cycles through them.
*/
var FLEX_DISTRIBUTIONS = [
	"space-between",
	"space-around",
	"space-evenly"
];
function asFlexDistribution(value) {
	return FLEX_DISTRIBUTIONS.includes(value) ? value : null;
}

export { FLEX_DISTRIBUTIONS, asFlexDistribution };
