// Reconstructed from index-C74mRL57.js — original module: packages/compiler/src/runtime/figma/types.ts

function uniqueFigmaImageHashes(pending) {
	const seen = /* @__PURE__ */ new Set();
	const hashes = [];
	for (const { imageHash } of pending) {
		if (seen.has(imageHash)) continue;
		seen.add(imageHash);
		hashes.push(imageHash);
	}
	return hashes;
}

export { uniqueFigmaImageHashes };
