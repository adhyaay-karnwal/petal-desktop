// Reconstructed from index-C74mRL57.js — original module: vendor/@radix-ui/react-id
import { import_react } from "../@tanstack/react-query.js";
import { useLayoutEffect2 } from "./react-use-layout-effect.js";

var useReactId = import_react[" useId ".trim().toString()] || (() => void 0);
var count$1 = 0;
function useId$12(deterministicId) {
	const [id, setId] = import_react.useState(useReactId());
	useLayoutEffect2(() => {
		if (!deterministicId) setId((reactId) => reactId ?? String(count$1++));
	}, [deterministicId]);
	return deterministicId || (id ? `radix-${id}` : "");
}

export { useId$12 };
