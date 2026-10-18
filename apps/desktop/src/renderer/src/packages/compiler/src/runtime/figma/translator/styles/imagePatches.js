// Reconstructed from index-C74mRL57.js — original module: packages/compiler/src/runtime/figma/translator/styles/imagePatches.ts
import { asFigmaNode } from "../model/node.js";
import { imageFillAsMaskStyles, mapImageFillStyles } from "./image.js";
import { mapLayeredFillStyles } from "./fill.js";

function patchContext(parsed, imageUrls) {
	return {
		parsed,
		sceneIndex: {
			nodeById: parsed.doc.nodeMap,
			childrenByParent: /* @__PURE__ */ new Map(),
			pasteRootIds: []
		},
		warnings: [],
		skipped: [],
		pendingImagePatches: [],
		options: {
			skipHidden: true,
			resolveImageUrl: ({ hashHex }) => imageUrls.get(hashHex) ?? null
		}
	};
}
function stylePatchFor(entry, node, ctx) {
	if (entry.kind === "layered") return mapLayeredFillStyles(node.fillPaints, entry.figmaNodeId, ctx, node.size?.x ?? 0, node.size?.y ?? 0);
	const imageFill = mapImageFillStyles(node, entry.figmaNodeId, ctx);
	if (!imageFill?.backgroundImage) return null;
	return entry.kind === "mask" ? imageFillAsMaskStyles(imageFill) : {
		...imageFill,
		backgroundColor: "transparent"
	};
}
function buildFigmaImageStylePatches(parsed, pending, imageUrls) {
	const ctx = patchContext(parsed, imageUrls);
	const layeredNodes = /* @__PURE__ */ new Set();
	return pending.flatMap((entry) => {
		const node = parsed.doc.nodeMap.get(entry.figmaNodeId);
		if (!imageUrls.has(entry.imageHash) || !node) return [];
		if (entry.kind === "layered") {
			if (layeredNodes.has(entry.figmaNodeId)) return [];
			layeredNodes.add(entry.figmaNodeId);
		}
		const stylePatch = stylePatchFor(entry, asFigmaNode(node), ctx);
		return stylePatch ? [{
			figmaNodeId: entry.figmaNodeId,
			stylePatch
		}] : [];
	});
}

export { buildFigmaImageStylePatches };
