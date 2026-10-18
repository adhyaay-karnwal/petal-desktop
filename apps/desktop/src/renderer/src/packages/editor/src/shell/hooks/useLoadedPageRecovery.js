// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/hooks/useLoadedPageRecovery.ts
import { import_react } from "../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../cloud/src/hooks/useSession.js";

/** Failed page loads must return to painted data, including after rapid switches. */
function useLoadedPageRecovery(pages, activePageId, loaded) {
	const $ = (0, import_compiler_runtime.c)(14);
	const lastLoadedId = (0, import_react.useRef)(null);
	let t0;
	if ($[0] !== activePageId || $[1] !== loaded?.activeLoaded || $[2] !== pages) {
		t0 = loaded?.activeLoaded ?? pages.some((page) => page.id === activePageId && page.loaded);
		$[0] = activePageId;
		$[1] = loaded?.activeLoaded;
		$[2] = pages;
		$[3] = t0;
	} else t0 = $[3];
	const activeLoaded = t0;
	let t1;
	if ($[4] !== loaded?.isLoaded || $[5] !== pages) {
		t1 = loaded?.isLoaded ?? ((id) => pages.some((page_0) => page_0.id === id && page_0.loaded));
		$[4] = loaded?.isLoaded;
		$[5] = pages;
		$[6] = t1;
	} else t1 = $[6];
	const isLoaded = t1;
	let t2;
	let t3;
	if ($[7] !== activeLoaded || $[8] !== activePageId) {
		t2 = () => {
			if (activeLoaded) lastLoadedId.current = activePageId;
		};
		t3 = [activeLoaded, activePageId];
		$[7] = activeLoaded;
		$[8] = activePageId;
		$[9] = t2;
		$[10] = t3;
	} else {
		t2 = $[9];
		t3 = $[10];
	}
	(0, import_react.useLayoutEffect)(t2, t3);
	let t4;
	if ($[11] !== isLoaded || $[12] !== pages) {
		t4 = (previousPageId) => pages.find((page_3) => page_3.id === lastLoadedId.current && isLoaded(page_3.id))?.id ?? pages.find((page_2) => page_2.id === previousPageId && isLoaded(page_2.id))?.id ?? pages.find((page_1) => isLoaded(page_1.id))?.id ?? null;
		$[11] = isLoaded;
		$[12] = pages;
		$[13] = t4;
	} else t4 = $[13];
	return t4;
}

export { useLoadedPageRecovery };
