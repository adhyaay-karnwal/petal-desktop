// Reconstructed from index.js — original module: packages/compiler/src/codegen/extractPartialJson.ts

/**
* Pull string / primitive fields out of a JSON object that is still being
* streamed (unterminated string, missing closing braces).
*/
var STRING_FIELD = (field) => new RegExp(`"${escapeRegExp(field)}"\\s*:\\s*"`);
function extractPartialJsonStringField(json, field) {
	const match = STRING_FIELD(field).exec(json);
	if (!match) return void 0;
	return readJsonString(json, match.index + match[0].length);
}
var CANVAS_DRAW_TOOLS = /* @__PURE__ */ new Set([
	"canvas_add",
	"canvas_insert",
	"canvas_update"
]);
var FILE_WRITE_TOOLS = /* @__PURE__ */ new Set([
	"project_write",
	"project_edit",
	"local_write",
	"local_edit"
]);
function extractPartialMcpToolName(json) {
	return /"name"\s*:\s*"((?:mcp__petal__)?canvas_(?:add|insert|update))"/.exec(json)?.[1];
}
function shortPetalToolName(name) {
	return name.startsWith("mcp__petal__") ? name.slice(12) : name;
}
function isCanvasDrawToolName(name) {
	if (!name) return false;
	return CANVAS_DRAW_TOOLS.has(shortPetalToolName(name));
}
function isFileWriteToolName(name) {
	if (!name) return false;
	return FILE_WRITE_TOOLS.has(shortPetalToolName(name));
}
function extractPartialFileWriteArgs(json) {
	return {
		file_path: extractPartialJsonStringField(json, "file_path") ?? extractPartialJsonStringField(json, "path"),
		content: extractPartialJsonStringField(json, "content") ?? extractPartialJsonStringField(json, "new_string")
	};
}
function extractPartialCanvasDrawArgs(json) {
	return {
		jsx: extractPartialJsonStringField(json, "jsx"),
		parent_id: extractPartialJsonStringField(json, "parent_id"),
		element_id: extractPartialJsonStringField(json, "element_id"),
		before_id: extractPartialJsonStringField(json, "before_id"),
		after_id: extractPartialJsonStringField(json, "after_id"),
		anchor_id: extractPartialJsonStringField(json, "anchor_id")
	};
}
function readJsonString(src, start) {
	let out = "";
	for (let i = start; i < src.length; i++) {
		const c = src[i];
		if (c === "\\") {
			if (i + 1 >= src.length) break;
			const n = src[i + 1];
			if (n === "u") {
				if (i + 5 >= src.length) break;
				const code = Number.parseInt(src.slice(i + 2, i + 6), 16);
				if (Number.isNaN(code)) break;
				out += String.fromCharCode(code);
				i += 5;
				continue;
			}
			out += n === "n" ? "\n" : n === "r" ? "\r" : n === "t" ? "	" : n === "b" ? "\b" : n === "f" ? "\f" : n;
			i++;
			continue;
		}
		if (c === "\"") return out;
		out += c;
	}
	return out;
}
function escapeRegExp(value) {
	return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export { extractPartialCanvasDrawArgs, extractPartialFileWriteArgs, extractPartialMcpToolName, isCanvasDrawToolName, isFileWriteToolName };
