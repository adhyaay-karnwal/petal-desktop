// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/hooks/useScrolledHeader.ts
import { import_react } from "../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../cloud/src/hooks/useSession.js";

/** Track the viewport's top edge, including restored scroll and remounts. */
function useScrolledHeader(externalRef) {
	const $ = (0, import_compiler_runtime.c)(9);
	const [hasScrolled, setHasScrolled] = (0, import_react.useState)(false);
	const [scrollElement, setScrollElement] = (0, import_react.useState)(null);
	let t0;
	if ($[0] !== externalRef) {
		t0 = (viewport) => {
			if (externalRef) externalRef.current = viewport;
			setScrollElement(viewport);
		};
		$[0] = externalRef;
		$[1] = t0;
	} else t0 = $[1];
	const viewportRef = t0;
	let t1;
	let t2;
	if ($[2] !== scrollElement) {
		t1 = () => {
			if (!scrollElement) return;
			const update = () => setHasScrolled(scrollElement.scrollTop > 0);
			update();
			scrollElement.addEventListener("scroll", update, { passive: true });
			return () => scrollElement.removeEventListener("scroll", update);
		};
		t2 = [scrollElement];
		$[2] = scrollElement;
		$[3] = t1;
		$[4] = t2;
	} else {
		t1 = $[3];
		t2 = $[4];
	}
	(0, import_react.useLayoutEffect)(t1, t2);
	let t3;
	if ($[5] !== hasScrolled || $[6] !== scrollElement || $[7] !== viewportRef) {
		t3 = {
			hasScrolled,
			viewportRef,
			scrollElement
		};
		$[5] = hasScrolled;
		$[6] = scrollElement;
		$[7] = viewportRef;
		$[8] = t3;
	} else t3 = $[8];
	return t3;
}

export { useScrolledHeader };
