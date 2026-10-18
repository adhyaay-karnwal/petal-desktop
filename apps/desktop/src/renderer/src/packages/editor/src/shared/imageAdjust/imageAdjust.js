// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shared/imageAdjust/imageAdjust.ts

var ADJUST_KEYS = [
	"exposure",
	"contrast",
	"saturation",
	"temperature",
	"tint",
	"highlights",
	"shadows"
];
function isNeutralAdjust(adjust) {
	return ADJUST_KEYS.every((key) => !adjust[key]);
}
var GAMMA = 2.2;
var clamp01 = (v) => v < 0 ? 0 : v > 1 ? 1 : v;
function toLinear(c) {
	for (let i = 0; i < 3; i++) c[i] = clamp01(c[i]) ** GAMMA;
}
function toEncoded(c) {
	for (let i = 0; i < 3; i++) c[i] = clamp01(c[i]) ** (1 / GAMMA);
}
var LUMA_R = .2126;
var LUMA_G = .7152;
var LUMA_B = .0722;
var WHITE_X = .9505;
var WHITE_Z = 1.089;
/** Lab a/b shift at slider value 1. */
var TEMP_TINT_SHIFT = 30;
function shiftLab(c, da, db) {
	const [r, g, b] = c;
	const fx0 = Math.cbrt((.4124 * r + .3576 * g + .1805 * b) / WHITE_X);
	const fy = Math.cbrt(.2126 * r + .7152 * g + .0722 * b);
	const fz0 = Math.cbrt((.0193 * r + .1192 * g + .9505 * b) / WHITE_Z);
	const fx = fx0 + da / 500;
	const fz = fz0 - db / 200;
	const x = fx * fx * fx * WHITE_X;
	const y = fy * fy * fy;
	const z = fz * fz * fz * WHITE_Z;
	c[0] = clamp01(3.240625477320054 * x - 1.537207972210319 * y - .4986285986982478 * z);
	c[1] = clamp01(-.9689307147293196 * x + 1.8757560608852415 * y + .04151752384295395 * z);
	c[2] = clamp01(.05571012044551064 * x - .20402105059848671 * y + 1.0569959422543882 * z);
}
function saturate(c, value) {
	const y = LUMA_R * c[0] + LUMA_G * c[1] + LUMA_B * c[2];
	let k = 1 + value;
	if (value > 0) {
		let limit = Infinity;
		for (let i = 0; i < 3; i++) {
			const d = c[i] - y;
			if (d > 1e-9) limit = Math.min(limit, (1 - y) / d);
			else if (d < -1e-9) limit = Math.min(limit, y / -d);
		}
		k = Math.min(2, 1 + value * (limit - 1));
	}
	for (let i = 0; i < 3; i++) c[i] = clamp01(y + (c[i] - y) * k);
}
/**
* Trilinear lookup into an n^3 RGB table at `offset`, for a colour in 0..1.
* Writes `scale` * the sample into `out`.
*/
function trilinear(table, offset, n, r, g, b, scale, out, outOffset) {
	const last = n - 1;
	const fr = clamp01(r) * last;
	const fg = clamp01(g) * last;
	const fb = clamp01(b) * last;
	const r0 = fr >= last ? last - 1 : fr | 0;
	const g0 = fg >= last ? last - 1 : fg | 0;
	const b0 = fb >= last ? last - 1 : fb | 0;
	const tr = fr - r0;
	const tg = fg - g0;
	const tb = fb - b0;
	const dR = n * n * 3;
	const dG = n * 3;
	const base = offset + ((r0 * n + g0) * n + b0) * 3;
	for (let ch = 0; ch < 3; ch++) {
		const i = base + ch;
		const c00 = table[i] + (table[i + 3] - table[i]) * tb;
		const c01 = table[i + dG] + (table[i + dG + 3] - table[i + dG]) * tb;
		const c10 = table[i + dR] + (table[i + dR + 3] - table[i + dR]) * tb;
		const c11 = table[i + dR + dG] + (table[i + dR + dG + 3] - table[i + dR + dG]) * tb;
		const c0 = c00 + (c01 - c00) * tg;
		const c1 = c10 + (c11 - c10) * tg;
		out[outOffset + ch] = (c0 + (c1 - c0) * tr) * scale;
	}
}
var TONE_GRID = 17;
var scratchA = /* @__PURE__ */ new Float64Array(3);
var scratchB = /* @__PURE__ */ new Float64Array(3);
function sampleTone(tables, slider, step, c, out) {
	if (step === 0) out.set(c);
	else trilinear(tables.data, tables.offset(slider, step), TONE_GRID, c[0], c[1], c[2], 1 / 255, out, 0);
}
function applyTone(tables, slider, value, c) {
	const steps = tables.steps[slider];
	const position = clamp01((value + 1) / 2) * 2 * steps - steps;
	const lo = Math.floor(position);
	const hi = Math.ceil(position);
	sampleTone(tables, slider, lo, c, scratchA);
	if (hi === lo) {
		c.set(scratchA);
		return;
	}
	sampleTone(tables, slider, hi, c, scratchB);
	const t = position - lo;
	for (let i = 0; i < 3; i++) c[i] = clamp01(scratchA[i] + (scratchB[i] - scratchA[i]) * t);
}
function adjustInPlace(c, adjust, tables) {
	if (adjust.contrast) applyTone(tables, "contrast", adjust.contrast, c);
	if (adjust.temperature || adjust.tint) {
		toLinear(c);
		shiftLab(c, TEMP_TINT_SHIFT * (adjust.tint ?? 0), TEMP_TINT_SHIFT * (adjust.temperature ?? 0));
		toEncoded(c);
	}
	if (adjust.highlights) applyTone(tables, "highlights", adjust.highlights, c);
	if (adjust.shadows) applyTone(tables, "shadows", adjust.shadows, c);
	if (adjust.exposure) applyTone(tables, "exposure", adjust.exposure, c);
	if (adjust.saturation) {
		toLinear(c);
		saturate(c, adjust.saturation);
		toEncoded(c);
	}
}
/** Bakes the chain into one RGB->RGB table so each pixel costs a single trilinear lookup. */
function buildAdjustLut(adjust, tables, size = 33) {
	const lut = new Float32Array(size ** 3 * 3);
	const step = 1 / (size - 1);
	const c = /* @__PURE__ */ new Float64Array(3);
	let k = 0;
	for (let r = 0; r < size; r++) for (let g = 0; g < size; g++) for (let b = 0; b < size; b++) {
		c[0] = r * step;
		c[1] = g * step;
		c[2] = b * step;
		adjustInPlace(c, adjust, tables);
		lut[k++] = c[0];
		lut[k++] = c[1];
		lut[k++] = c[2];
	}
	return lut;
}
/** Applies a table from buildAdjustLut to RGBA pixels in place; alpha is untouched. */
function applyAdjustLut(pixels, lut) {
	const n = Math.round(Math.cbrt(lut.length / 3));
	for (let p = 0; p < pixels.length; p += 4) trilinear(lut, 0, n, pixels[p] / 255, pixels[p + 1] / 255, pixels[p + 2] / 255, 255, pixels, p);
}

export { ADJUST_KEYS, applyAdjustLut, buildAdjustLut, isNeutralAdjust };
