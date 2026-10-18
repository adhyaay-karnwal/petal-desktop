// Reconstructed from index.js — original module: app/src/main/canvasToolResult.ts

var CREATION_TOOLS = /* @__PURE__ */ new Set([
	"canvas_add",
	"canvas_insert",
	"canvas_duplicate"
]);
/**
* New IDs from a creation result; chat needs them for names and canvas links.
*
* The renderer reports them structurally. The text fallback only covers results from
* an older renderer — do not rely on it: ids carry many prefixes (html-, text-,
* shadcn-div-126, el-), so scraping the message cannot recognise them all.
*/
function getCreatedCanvasElementIds(toolName, result) {
	if (!CREATION_TOOLS.has(toolName) || result?.isError) return void 0;
	const reported = result?._createdElementIds;
	if (Array.isArray(reported)) {
		const ids = reported.filter((id) => typeof id === "string" && !!id);
		return ids.length > 0 ? [...new Set(ids)] : void 0;
	}
	const ids = [...(result?.content ?? []).filter((block) => block.type === "text").map((block) => block.text ?? "").join("\n").matchAll(/^- (el-[^\s]+)\s*$/gm)].map((match) => match[1]);
	return ids.length > 0 ? [...new Set(ids)] : void 0;
}
var resultText = (result) => (result?.content ?? []).filter((block) => block.type === "text").map((block) => block.text ?? "").join("\n");
/**
* One result for several queries run as separate canvas operations, a line per
* query. It is an error only when every query failed, so partial results stay
* usable and a total failure still reads as one.
*/
function combineQueryResults(queries, results) {
	return {
		...results.length > 0 && results.every((result) => result?.isError) ? { isError: true } : {},
		content: [{
			type: "text",
			text: queries.map((query, i) => `${query}: ${resultText(results[i])}`).join("\n")
		}]
	};
}
/** Drop renderer bookkeeping so it never reaches the agent's context. */
function stripCreatedElementIds(result) {
	if (!result || !("_createdElementIds" in result)) return result;
	const { _createdElementIds: _, ...rest } = result;
	return rest;
}

export { combineQueryResults, getCreatedCanvasElementIds, stripCreatedElementIds };
