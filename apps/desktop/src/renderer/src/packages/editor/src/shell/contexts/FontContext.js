// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/contexts/FontContext.tsx
import { import_react } from "../../../../../vendor/@tanstack/react-query.js";

var FontContext = (0, import_react.createContext)({
	googleFontsEnabled: true,
	projectFamilies: [],
	localFamilies: [],
	localEnabled: false,
	localFontsAllowed: true,
	localLoading: false,
	desktop: false,
	openPicker: async () => true,
	enableLocalFonts: async () => true,
	selectLocalFamily: async (family) => family
});
var useFontEnvironment = () => {
	return (0, import_react.useContext)(FontContext);
};

export { FontContext, useFontEnvironment };
