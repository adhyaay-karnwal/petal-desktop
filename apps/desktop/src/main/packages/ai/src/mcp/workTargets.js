// Reconstructed from index.js — original module: packages/ai/src/mcp/workTargets.ts

var ELEMENT_ID_RESULTS = /* @__PURE__ */ new Set([
	"canvas_add",
	"canvas_insert",
	"canvas_duplicate"
]);
var ELEMENT_ID_INPUTS = /* @__PURE__ */ new Set(["canvas_update", "canvas_edit"]);
var FILE_INPUTS = /* @__PURE__ */ new Set(["project_write", "project_edit"]);
var nonEmpty = (value) => typeof value === "string" && value.length > 0;
function workTargetForToolCall(name, input, result) {
	if (result.isError) return null;
	if (ELEMENT_ID_RESULTS.has(name)) {
		const data = result.data;
		const elementIds = Array.isArray(data?.elementIds) ? data.elementIds.filter(nonEmpty) : [];
		if (elementIds.length === 0) return null;
		return name === "canvas_add" && nonEmpty(input.canvas_id) ? {
			elementIds,
			canvasId: input.canvas_id
		} : { elementIds };
	}
	if (ELEMENT_ID_INPUTS.has(name)) return nonEmpty(input.element_id) ? { elementIds: [input.element_id] } : null;
	if (FILE_INPUTS.has(name)) return nonEmpty(input.file_path) ? {
		elementIds: [],
		path: input.file_path
	} : null;
	return null;
}

export { workTargetForToolCall };
