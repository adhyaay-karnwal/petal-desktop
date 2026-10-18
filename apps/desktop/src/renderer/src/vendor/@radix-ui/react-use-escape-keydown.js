// Reconstructed from index-C74mRL57.js — original module: vendor/@radix-ui/react-use-escape-keydown
import { import_react } from "../@tanstack/react-query.js";
import { useCallbackRef$1 } from "./react-use-callback-ref.js";

function useEscapeKeydown(onEscapeKeyDownProp, ownerDocument = globalThis?.document) {
	const onEscapeKeyDown = useCallbackRef$1(onEscapeKeyDownProp);
	import_react.useEffect(() => {
		const handleKeyDown = (event) => {
			if (event.key === "Escape") onEscapeKeyDown(event);
		};
		ownerDocument.addEventListener("keydown", handleKeyDown, { capture: true });
		return () => ownerDocument.removeEventListener("keydown", handleKeyDown, { capture: true });
	}, [onEscapeKeyDown, ownerDocument]);
}

export { useEscapeKeydown };
