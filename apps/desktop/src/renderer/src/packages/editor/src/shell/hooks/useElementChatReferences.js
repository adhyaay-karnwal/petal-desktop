// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/hooks/useElementChatReferences.ts
import { import_compiler_runtime } from "../../../../cloud/src/hooks/useSession.js";
import { useWebviewEditState } from "../../shared/state/webviewEditStore.js";
import { elementChatReference } from "../utils/elementChatReference.js";

/** Selection chips refresh when browser inspection changes; pinned references keep their captured identity. */
function useElementChatReferences(elements, pageId) {
	const $ = (0, import_compiler_runtime.c)(7);
	const inspection = useWebviewEditState();
	let t0;
	if ($[0] !== elements || $[1] !== inspection || $[2] !== pageId) {
		let t1;
		if ($[4] !== inspection || $[5] !== pageId) {
			t1 = (element) => elementChatReference(element, pageId, inspection);
			$[4] = inspection;
			$[5] = pageId;
			$[6] = t1;
		} else t1 = $[6];
		t0 = elements.map(t1);
		$[0] = elements;
		$[1] = inspection;
		$[2] = pageId;
		$[3] = t0;
	} else t0 = $[3];
	return t0;
}

export { useElementChatReferences };
