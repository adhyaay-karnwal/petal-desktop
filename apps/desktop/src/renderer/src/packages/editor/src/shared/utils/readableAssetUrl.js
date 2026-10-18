// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shared/utils/readableAssetUrl.ts

var withQuery = (url, query) => `${url}${url.includes("?") ? "&" : "?"}${query}`;
/** The API-served copy (`inline=1`, with CORS). Capped at 10 MB server-side. Other URLs pass through. */
function inlineAssetUrl(url) {
	if (!url.includes("/assets/by-path") || url.includes("inline=")) return url;
	return withQuery(url, "inline=1");
}
/**
* A URL script can fetch (and range-request) for `url`: the asset's R2 public URL, which sends CORS
* for the editor's origin at any size, falling back to the inline copy. Other URLs pass through.
*/
async function readableAssetUrl(url) {
	if (!url.includes("/assets/by-path")) return url;
	try {
		const res = await fetch(withQuery(url, "resolve=url"));
		const { publicUrl } = await res.json();
		if (res.ok && typeof publicUrl === "string") return new URL(publicUrl, res.url).href;
	} catch {}
	return inlineAssetUrl(url);
}

export { readableAssetUrl };
