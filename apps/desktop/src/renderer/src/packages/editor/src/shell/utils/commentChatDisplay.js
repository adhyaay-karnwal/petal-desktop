// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/utils/commentChatDisplay.ts

/** Display older comment requests without their serialized model context. New requests
* already store the user's comment as content and model context in a separate field. */
function commentChatDisplayText(content) {
	if (typeof content !== "string") return "";
	if (!content.startsWith("Respond to the specific @Agent request below.")) return content;
	const startMarker = "\n\nRequest (JSON):\n\n";
	const endMarker = "\n\nThread context (JSON):";
	const start = content.indexOf(startMarker);
	const end = content.indexOf(endMarker, start + 19);
	if (start < 0 || end < 0) return content;
	try {
		const request = JSON.parse(content.slice(start + 19, end));
		if (typeof request === "object" && request !== null && "id" in request && typeof request.id === "string" && "body" in request && typeof request.body === "string") return request.body;
	} catch {}
	return content;
}

export { commentChatDisplayText };
