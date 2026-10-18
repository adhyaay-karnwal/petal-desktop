// Reconstructed from index-C74mRL57.js — original module: packages/compiler/src/runtime/figma/utils/node.ts

function figGuidKey(guid) {
	if (!guid || typeof guid.sessionID !== "number" || typeof guid.localID !== "number") return null;
	return `${guid.sessionID}:${guid.localID}`;
}

export { figGuidKey };
