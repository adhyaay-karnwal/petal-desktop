// Reconstructed from index-C74mRL57.js — original module: vendor/@radix-ui/react-direction
import { import_react } from "../@tanstack/react-query.js";

var DirectionContext$1 = import_react.createContext(void 0);
function useDirection$1(localDir) {
	const globalDir = import_react.useContext(DirectionContext$1);
	return localDir || globalDir || "ltr";
}

export { useDirection$1 };
