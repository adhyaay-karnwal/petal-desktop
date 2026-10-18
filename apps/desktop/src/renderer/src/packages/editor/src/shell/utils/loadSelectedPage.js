// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/utils/loadSelectedPage.ts
import { readLoadedCanvasElements } from "../../canvas/utils/canvasPayload.js";

/** A stale request cannot apply data, recover selection, or clear a newer loader. */
async function loadSelectedPage(options) {
	try {
		const result = await options.load();
		if (!options.isCurrent()) return;
		options.apply(readLoadedCanvasElements(result));
	} catch (error) {
		if (!options.isCurrent()) return;
		options.recover(error);
		return false;
	} finally {
		if (options.isCurrent()) options.finish();
	}
}

export { loadSelectedPage };
