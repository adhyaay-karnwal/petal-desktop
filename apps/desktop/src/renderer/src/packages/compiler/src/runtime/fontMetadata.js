// Reconstructed from index-C74mRL57.js — original module: packages/compiler/src/runtime/fontMetadata.ts

/** Read the metadata needed for a face from an SFNT font, without executing it. */
function readFontMetadata(buffer) {
	const view = new DataView(buffer);
	const text = (offset, length) => new TextDecoder().decode(new Uint8Array(buffer, offset, length));
	if (buffer.byteLength < 12 || ![
		65536,
		1330926671,
		1953658213
	].includes(view.getUint32(0))) throw new Error("Use a TrueType or OpenType font file.");
	const tables = /* @__PURE__ */ new Map();
	const count = view.getUint16(4);
	if (12 + count * 16 > buffer.byteLength) throw new Error("Invalid font table directory.");
	for (let i = 0; i < count; i++) {
		const at = 12 + i * 16;
		const offset = view.getUint32(at + 8), length = view.getUint32(at + 12);
		if (offset + length > buffer.byteLength) throw new Error("Invalid font table.");
		tables.set(text(at, 4), {
			offset,
			length
		});
	}
	const names = tables.get("name");
	if (!names || names.length < 6) throw new Error("Font has no names.");
	const nameCount = view.getUint16(names.offset + 2), storage = view.getUint16(names.offset + 4);
	if (6 + nameCount * 12 > names.length) throw new Error("Invalid font names.");
	const values = /* @__PURE__ */ new Map();
	for (let i = 0; i < nameCount; i++) {
		const at = names.offset + 6 + i * 12;
		const platform = view.getUint16(at), language = view.getUint16(at + 4), id = view.getUint16(at + 6);
		const length = view.getUint16(at + 8), offset = storage + view.getUint16(at + 10);
		if (offset + length > names.length) throw new Error("Invalid font name offset.");
		if (platform !== 0 && platform !== 3) continue;
		const value = new TextDecoder("utf-16be").decode(new Uint8Array(buffer, names.offset + offset, length)).replace(/\0/g, "").trim();
		if (value && (!values.has(id) || language === 1033)) values.set(id, value);
	}
	const family = values.get(16) ?? values.get(1);
	if (!family || family.length > 200) throw new Error("Font family name is missing or too long.");
	const os2 = tables.get("OS/2");
	if (!os2 || os2.length < 64) throw new Error("Font has no weight metadata.");
	let weight = String(Math.max(1, Math.min(1e3, view.getUint16(os2.offset + 4))));
	const flags = view.getUint16(os2.offset + 62);
	const post = tables.get("post");
	const head = tables.get("head");
	const hasItalicAngle = post && post.length >= 8 && view.getInt32(post.offset + 4) !== 0;
	const hasItalicMacStyle = head && head.length >= 46 && (view.getUint16(head.offset + 44) & 2) !== 0;
	const style = flags & 513 || hasItalicAngle || hasItalicMacStyle || /italic|oblique|slant/i.test(values.get(17) ?? values.get(2) ?? "") ? "italic" : "normal";
	const fvar = tables.get("fvar");
	if (fvar && fvar.length >= 16) {
		const axisOffset = view.getUint16(fvar.offset + 4), axes = view.getUint16(fvar.offset + 8), size = view.getUint16(fvar.offset + 10);
		if (size < 20 || axisOffset + axes * size > fvar.length) throw new Error("Invalid variable font axes.");
		for (let i = 0; i < axes; i++) {
			const at = fvar.offset + axisOffset + i * size;
			if (text(at, 4) === "wght") {
				const min = view.getInt32(at + 4) / 65536, max = view.getInt32(at + 12) / 65536;
				if (min < 1 || max > 1e3 || min > max) throw new Error("Invalid font weight range.");
				weight = `${min} ${max}`;
			}
		}
	}
	return {
		family,
		weight,
		style,
		extension: view.getUint32(0) === 1330926671 ? "otf" : "ttf"
	};
}

export { readFontMetadata };
