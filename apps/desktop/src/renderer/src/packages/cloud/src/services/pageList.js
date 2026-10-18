// Reconstructed from index-C74mRL57.js — original module: packages/cloud/src/services/pageList.ts
import { getApiUrl } from "../client.js";
import { queryClient } from "../queryClient.js";

/**
* `GET /projects/:id/pages` returns every page with its full canvas. Opening a
* file needs it twice: ComponentLoader scans it for component names, then the
* editor loads its pages. Both go through one query, so the payload crosses the
* network and is parsed once. It is a load-time share, not a cache: the
* response is reused for 10 s at most, and the editor's load drops it, so a
* later load never gets pages from before an autosave.
*/
var SHARE_MS = 1e4;
var pageListKey = (projectId) => ["project-pages", projectId];
/** Parsed page list, or null when the request fails. Joins a request in flight. */
function fetchPageList(projectId) {
	return queryClient.fetchQuery({
		queryKey: pageListKey(projectId),
		queryFn: async () => {
			const res = await fetch(`${getApiUrl()}/projects/${projectId}/pages`, { credentials: "include" });
			if (!res.ok) throw new Error(`GET /pages failed: ${res.status}`);
			return await res.json();
		},
		staleTime: SHARE_MS,
		gcTime: SHARE_MS,
		retry: false
	}).catch(() => null);
}
/**
* `fetchPageList`, then dropped from the cache so the next load fetches fresh
* data. A failed request is not cached, so the second call fetches again
* instead of reusing the error from a request it joined.
*/
async function takePageList(projectId) {
	const pages = await fetchPageList(projectId) ?? await fetchPageList(projectId);
	queryClient.removeQueries({
		queryKey: pageListKey(projectId),
		exact: true
	});
	return pages;
}

export { fetchPageList, takePageList };
