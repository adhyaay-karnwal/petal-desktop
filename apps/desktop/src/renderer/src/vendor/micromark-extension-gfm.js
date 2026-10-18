// Reconstructed from index-C74mRL57.js — original module: vendor/micromark-extension-gfm
import { combineExtensions } from "./micromark-util-combine-extensions.js";
import { gfmAutolinkLiteral } from "./micromark-extension-gfm-autolink-literal.js";
import { gfmFootnote } from "./micromark-extension-gfm-footnote.js";
import { gfmStrikethrough } from "./micromark-extension-gfm-strikethrough.js";
import { gfmTable } from "./micromark-extension-gfm-table.js";
import { gfmTaskListItem } from "./micromark-extension-gfm-task-list-item.js";

/**
* @typedef {import('micromark-extension-gfm-footnote').HtmlOptions} HtmlOptions
* @typedef {import('micromark-extension-gfm-strikethrough').Options} Options
* @typedef {import('micromark-util-types').Extension} Extension
* @typedef {import('micromark-util-types').HtmlExtension} HtmlExtension
*/
/**
* Create an extension for `micromark` to enable GFM syntax.
*
* @param {Options | null | undefined} [options]
*   Configuration (optional).
*
*   Passed to `micromark-extens-gfm-strikethrough`.
* @returns {Extension}
*   Extension for `micromark` that can be passed in `extensions` to enable GFM
*   syntax.
*/
function gfm(options) {
	return combineExtensions([
		gfmAutolinkLiteral(),
		gfmFootnote(),
		gfmStrikethrough(options),
		gfmTable(),
		gfmTaskListItem()
	]);
}

export { gfm };
