// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/utils/fontPickerRows.ts

/** One family per name. Reuse project faces before fetching or uploading copies. */
function getFontPickerRows({ filter, search, catalog, fonts, environment }) {
	if (filter === "library") return [];
	const project = /* @__PURE__ */ new Map();
	for (const name of environment.projectFamilies) project.set(name.toLowerCase(), {
		name,
		family: name,
		source: "project"
	});
	for (const font of fonts?.local ?? []) if (!project.has(font.name.toLowerCase())) project.set(font.name.toLowerCase(), {
		name: font.name,
		family: font.name,
		source: "project"
	});
	const families = /* @__PURE__ */ new Map();
	if (filter !== "google") for (const [key, row] of project) families.set(key, row);
	const addGoogle = (name) => {
		const key = name.toLowerCase();
		families.set(key, project.get(key) ?? {
			name,
			family: name,
			source: "google"
		});
	};
	if (filter !== "local") {
		for (const font of fonts?.google ?? []) addGoogle(font.name.replace(/_/g, " "));
		if (environment.googleFontsEnabled) for (const font of catalog) addGoogle(font.family);
	}
	if (filter !== "google") for (const name of environment.localFamilies) {
		const key = name.toLowerCase();
		if (!families.has(key)) families.set(key, {
			name,
			family: name,
			source: "local"
		});
	}
	const query = search.trim().toLowerCase();
	return [...families.values()].filter((font) => font.name.toLowerCase().includes(query)).sort((a, b) => a.name.localeCompare(b.name, void 0, {
		numeric: true,
		sensitivity: "base"
	}));
}

export { getFontPickerRows };
