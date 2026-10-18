// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shared/imageAdjust/toneTables.ts
import { __bundledVitePreload } from "../../../../../__bundle__/_vite_preload_helper.js";
import { browser_exports } from "../../../../../vendor/fflate.js";

/** Table order and resolution in the generated blob: exposure needs finer value steps. */
var LAYOUT = [
	["contrast", 8],
	["highlights", 8],
	["shadows", 8],
	["exposure", 16]
];
var GRID = 17;
var TABLE_BYTES = GRID ** 3 * 3;
var pending$1 = null;
function loadToneTables() {
	pending$1 ??= decode$2().catch((error) => {
		pending$1 = null;
		throw error;
	});
	return pending$1;
}
async function decode$2() {
	const [{ TONE_TABLES_ZLIB_BASE64 }, { unzlibSync }] = await Promise.all([__bundledVitePreload(() => import("./toneTables.generated.js"), [], import.meta.url), __bundledVitePreload(() => Promise.resolve().then(() => browser_exports), void 0, import.meta.url)]);
	const binary = atob(TONE_TABLES_ZLIB_BASE64);
	const compressed = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) compressed[i] = binary.charCodeAt(i);
	const data = unzlibSync(compressed);
	const input = new Uint8Array(TABLE_BYTES);
	const level = (i) => Math.min(255, Math.round(i * 255 / 16));
	for (let r = 0, k = 0; r < GRID; r++) for (let g = 0; g < GRID; g++) for (let b = 0; b < GRID; b++) {
		input[k++] = level(r);
		input[k++] = level(g);
		input[k++] = level(b);
	}
	for (let i = 0; i < data.length; i++) data[i] = data[i] + input[i % TABLE_BYTES] & 255;
	const starts = {};
	const steps = {};
	let tableIndex = 0;
	for (const [slider, count] of LAYOUT) {
		starts[slider] = tableIndex;
		steps[slider] = count;
		tableIndex += count * 2;
	}
	if (data.length !== tableIndex * TABLE_BYTES) throw new Error("Tone tables are corrupt");
	return {
		data,
		steps,
		offset(slider, step) {
			const slot = step < 0 ? step + steps[slider] : step + steps[slider] - 1;
			return (starts[slider] + slot) * TABLE_BYTES;
		}
	};
}

export { loadToneTables };
