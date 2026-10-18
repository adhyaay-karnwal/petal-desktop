// Reconstructed from index-C74mRL57.js — original module: packages/compiler/src/runtime/figma/utils/imagePaint.ts

function paintImageHashHex(paint) {
	return hashBytesToHex(paint.image?.hash) ?? hashBytesToHex(paint.imageThumbnail?.hash);
}
function hashBytesToHex(raw) {
	if (!raw) return null;
	if (typeof raw === "string") {
		const hex = raw.replace(/[^a-f0-9]/gi, "").toLowerCase();
		return hex.length > 0 ? hex : null;
	}
	let bytes;
	if (raw instanceof Uint8Array) bytes = raw;
	else if (typeof raw !== "object") return null;
	else {
		const keys = Object.keys(raw).map(Number).filter((n) => !Number.isNaN(n)).sort((a, b) => a - b);
		if (keys.length === 0) return null;
		bytes = new Uint8Array(keys.length);
		for (let i = 0; i < keys.length; i++) bytes[i] = raw[String(keys[i])] ?? 0;
	}
	return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export { paintImageHashHex };
