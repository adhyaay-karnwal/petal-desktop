// Reconstructed from index-C74mRL57.js — original module: packages/ui/src/lib/utils.ts
import { clsx } from "../../../../vendor/clsx.js";
import { extendTailwindMerge } from "../../../../vendor/tailwind-merge.js";

var twMerge = extendTailwindMerge({ extend: { theme: { text: ["ed-ui", "ed-chat"] } } });
function cn$2(...inputs) {
	return twMerge(clsx(inputs));
}

export { cn$2 };
