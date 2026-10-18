// Reconstructed from index-C74mRL57.js — original module: vendor/@radix-ui/react-focus-guards
import { import_react } from "../@tanstack/react-query.js";

var count$2 = 0;
function useFocusGuards() {
	import_react.useEffect(() => {
		const edgeGuards = document.querySelectorAll("[data-radix-focus-guard]");
		document.body.insertAdjacentElement("afterbegin", edgeGuards[0] ?? createFocusGuard());
		document.body.insertAdjacentElement("beforeend", edgeGuards[1] ?? createFocusGuard());
		count$2++;
		return () => {
			if (count$2 === 1) document.querySelectorAll("[data-radix-focus-guard]").forEach((node) => node.remove());
			count$2--;
		};
	}, []);
}
function createFocusGuard() {
	const element = document.createElement("span");
	element.setAttribute("data-radix-focus-guard", "");
	element.tabIndex = 0;
	element.style.outline = "none";
	element.style.opacity = "0";
	element.style.position = "fixed";
	element.style.pointerEvents = "none";
	return element;
}

export { useFocusGuards };
