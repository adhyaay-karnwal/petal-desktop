// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/chat-v2/modelLines.ts

var VERSION_RE = /\d+(?:\.\d+)*/g;
function lineOf(label) {
	return label.replace(VERSION_RE, "#").trim().toLowerCase();
}
function versionOf(label) {
	return (label.match(VERSION_RE)?.[0] ?? "").split(".").filter(Boolean).map(Number);
}
function compareVersions(a, b) {
	for (let i = 0; i < Math.max(a.length, b.length); i++) {
		const diff = (a[i] ?? 0) - (b[i] ?? 0);
		if (diff !== 0) return diff;
	}
	return 0;
}
function byCapability(a, b) {
	if (a.rank === void 0 || b.rank === void 0) return (a.rank === void 0 ? 1 : 0) - (b.rank === void 0 ? 1 : 0);
	return a.rank - b.rank || compareVersions(versionOf(b.label), versionOf(a.label));
}
function splitLatestModels(models) {
	const newest = /* @__PURE__ */ new Map();
	for (const model of models) {
		const line = lineOf(model.label);
		const current = newest.get(line);
		if (!current || compareVersions(versionOf(model.label), versionOf(current.label)) > 0) newest.set(line, model);
	}
	const featured = new Set(newest.values());
	const latest = models.filter((model) => featured.has(model) || model.isDefault).sort(byCapability);
	return {
		latest,
		more: models.filter((model) => !latest.includes(model)).sort(byCapability)
	};
}
/**
* Splits models by provider, in the order each provider first appears, with
* models of no known provider last under "Other". A single provider still gets
* its own group, so the picker shows whose models they are. A list with no
* providers stays a single group without a provider.
*/
function groupByProvider(models) {
	const groups = /* @__PURE__ */ new Map();
	const other = [];
	for (const model of models) if (!model.provider) other.push(model);
	else groups.set(model.provider, [...groups.get(model.provider) ?? [], model]);
	if (groups.size === 0) return models.length ? [{ models }] : [];
	const grouped = [...groups].map(([provider, entries]) => ({
		provider,
		models: entries
	}));
	return other.length ? [...grouped, {
		provider: "Other",
		models: other
	}] : grouped;
}
/**
* Models whose label or provider contains every word of the query, newest of
* each line first like the picker, then the rest.
*/
function filterModels(models, query) {
	const words = query.toLowerCase().split(/\s+/).filter(Boolean);
	const { latest, more } = splitLatestModels(models);
	return [...latest, ...more].filter((model) => {
		const text = `${model.label} ${model.provider ?? ""}`.toLowerCase();
		return words.every((word) => text.includes(word));
	});
}

export { filterModels, groupByProvider, splitLatestModels };
