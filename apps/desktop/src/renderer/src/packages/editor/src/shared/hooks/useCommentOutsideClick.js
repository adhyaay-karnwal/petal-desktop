// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shared/hooks/useCommentOutsideClick.ts
import { import_react } from "../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../cloud/src/hooks/useSession.js";

/**
* Dismiss on a click outside. A comment-mode click on the canvas is left to the canvas: the input
* machine places a draft on the press's release, before its click, so dismissing on that click
* would close the draft it just opened (see `handleCommentClick`).
*/
function useCommentOutsideClick(ref, onDismiss) {
	const $ = (0, import_compiler_runtime.c)(4);
	let t0;
	let t1;
	if ($[0] !== onDismiss || $[1] !== ref) {
		t0 = () => {
			const handleClick = (event) => {
				const target = event.target;
				if (!(target instanceof Element) || !ref.current || ref.current.contains(target)) return;
				if (target.closest("[data-comment-menu], [data-comment-pin]")) return;
				if (target.matches("[data-comment-mode] [data-cursor-layer]")) return;
				onDismiss();
			};
			document.addEventListener("click", handleClick, true);
			return () => document.removeEventListener("click", handleClick, true);
		};
		t1 = [ref, onDismiss];
		$[0] = onDismiss;
		$[1] = ref;
		$[2] = t0;
		$[3] = t1;
	} else {
		t0 = $[2];
		t1 = $[3];
	}
	(0, import_react.useEffect)(t0, t1);
}

export { useCommentOutsideClick };
