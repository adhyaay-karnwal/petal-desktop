// Reconstructed from index-C74mRL57.js — original module: vendor/@radix-ui/react-use-previous
import { import_react } from "../@tanstack/react-query.js";

function usePrevious(value) {
	const ref = import_react.useRef({
		value,
		previous: value
	});
	return import_react.useMemo(() => {
		if (ref.current.value !== value) {
			ref.current.previous = ref.current.value;
			ref.current.value = value;
		}
		return ref.current.previous;
	}, [value]);
}

export { usePrevious };
