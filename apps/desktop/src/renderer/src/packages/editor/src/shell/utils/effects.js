// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/utils/effects.ts
import { EFFECT_DEFS } from "../constants.js";

/**
* Effects classification — bucket Tailwind utility classes into the
* Effects section's editable subtypes (size, color, blur, etc.).
*/
/** Map a Tailwind class to its Effects subtype (size, color, blur…) or null. */
function classifyEffect(cls) {
	for (const def of EFFECT_DEFS) if (def.prefix.test(cls)) return def.type;
	return null;
}

export { classifyEffect };
