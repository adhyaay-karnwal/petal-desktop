// Reconstructed from index-C74mRL57.js — original module: vendor/mdast-util-gfm
import { gfmAutolinkLiteralFromMarkdown, gfmAutolinkLiteralToMarkdown } from "./mdast-util-gfm-autolink-literal.js";
import { gfmFootnoteFromMarkdown, gfmFootnoteToMarkdown } from "./mdast-util-gfm-footnote.js";
import { gfmStrikethroughFromMarkdown, gfmStrikethroughToMarkdown } from "./mdast-util-gfm-strikethrough.js";
import { gfmTableFromMarkdown, gfmTableToMarkdown } from "./mdast-util-gfm-table.js";
import { gfmTaskListItemFromMarkdown, gfmTaskListItemToMarkdown } from "./mdast-util-gfm-task-list-item.js";

/**
* @import {Extension as FromMarkdownExtension} from 'mdast-util-from-markdown'
* @import {Options} from 'mdast-util-gfm'
* @import {Options as ToMarkdownExtension} from 'mdast-util-to-markdown'
*/
/**
* Create an extension for `mdast-util-from-markdown` to enable GFM (autolink
* literals, footnotes, strikethrough, tables, tasklists).
*
* @returns {Array<FromMarkdownExtension>}
*   Extension for `mdast-util-from-markdown` to enable GFM (autolink literals,
*   footnotes, strikethrough, tables, tasklists).
*/
function gfmFromMarkdown() {
	return [
		gfmAutolinkLiteralFromMarkdown(),
		gfmFootnoteFromMarkdown(),
		gfmStrikethroughFromMarkdown(),
		gfmTableFromMarkdown(),
		gfmTaskListItemFromMarkdown()
	];
}
/**
* Create an extension for `mdast-util-to-markdown` to enable GFM (autolink
* literals, footnotes, strikethrough, tables, tasklists).
*
* @param {Options | null | undefined} [options]
*   Configuration (optional).
* @returns {ToMarkdownExtension}
*   Extension for `mdast-util-to-markdown` to enable GFM (autolink literals,
*   footnotes, strikethrough, tables, tasklists).
*/
function gfmToMarkdown(options) {
	return { extensions: [
		gfmAutolinkLiteralToMarkdown(),
		gfmFootnoteToMarkdown(options),
		gfmStrikethroughToMarkdown(),
		gfmTableToMarkdown(options),
		gfmTaskListItemToMarkdown()
	] };
}

export { gfmFromMarkdown, gfmToMarkdown };
