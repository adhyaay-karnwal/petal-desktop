// Reconstructed from index.js — original module: packages/compiler/src/codegen/canvasAiEdit.ts

/** Format search_components lines with types / required / examples. */
function formatComponentSearchLine(name, path, props) {
	if (!props || Object.keys(props).length === 0) return `  ${name} (${path})`;
	const parts = [];
	let usageHint = "";
	for (const [propName, raw] of Object.entries(props)) {
		const type = typeof raw === "object" && raw && "type" in raw ? String(raw.type) : "unknown";
		const required = typeof raw === "object" && raw && "required" in raw ? !!raw.required : false;
		const example = typeof raw === "object" && raw && "example" in raw ? raw.example : void 0;
		let s = `${propName}: ${type}`;
		if (required) s += "*";
		if (example !== void 0) s += `=${JSON.stringify(example)}`;
		parts.push(s);
		if ((propName === "variant" || propName === "size") && type.includes("|") && !usageHint) {
			const literals = [...type.matchAll(/['"]([^'"]+)['"]/g)].map((x) => x[1]);
			if (literals.length > 0 && propName === "variant") usageHint = ` e.g. <${name} variant="${literals[0]}">…</${name}>`;
			else if (literals.length > 0 && propName === "size" && !usageHint) usageHint = ` e.g. <${name} size="${literals[0]}">…</${name}>`;
		}
	}
	return `  ${name} (${path}) — ${parts.join(", ")}${usageHint}`;
}

export { formatComponentSearchLine };
