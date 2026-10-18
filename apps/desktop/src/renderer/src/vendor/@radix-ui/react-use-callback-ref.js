// Reconstructed from index-C74mRL57.js — original module: vendor/@radix-ui/react-use-callback-ref
import { import_react } from "../@tanstack/react-query.js";

function useCallbackRef$1(callback) {
	const callbackRef = import_react.useRef(callback);
	import_react.useEffect(() => {
		callbackRef.current = callback;
	});
	return import_react.useMemo(() => (...args) => callbackRef.current?.(...args), []);
}

export { useCallbackRef$1 };
