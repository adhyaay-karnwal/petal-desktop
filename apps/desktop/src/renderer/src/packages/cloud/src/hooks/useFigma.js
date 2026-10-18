// Reconstructed from index-C74mRL57.js — original module: packages/cloud/src/hooks/useFigma.ts
import { useQuery, useQueryClient } from "../../../../vendor/@tanstack/react-query.js";
import { getApiUrl, getWebUrl } from "../client.js";
import { import_compiler_runtime } from "./useSession.js";
import { FIGMA_REDIRECT_KEY, FIGMA_STATE_KEY, FIGMA_VERIFIER_KEY, buildFigmaAuthorizeUrl, figmaCallbackUrl, generatePkce } from "../lib/figmaOAuth.js";

var FigmaRequestError = class extends Error {
	constructor(message, code) {
		super(message);
		this.name = "FigmaRequestError";
		this.code = code;
	}
};
function isFigmaNotConnectedError(err) {
	return err instanceof FigmaRequestError && err.code === "FIGMA_NOT_CONNECTED";
}
async function figmaFetch(path, options) {
	const res = await fetch(`${getApiUrl()}${path}`, {
		...options,
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
			...options?.headers
		}
	});
	const data = await res.json().catch(() => ({}));
	if (!res.ok) {
		const code = typeof data.code === "string" ? data.code : void 0;
		throw new FigmaRequestError(data.error || data.message || `Request failed: ${res.status}`, code);
	}
	return data;
}
function useFigmaStatus() {
	const $ = (0, import_compiler_runtime.c)(1);
	let t0;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t0 = {
			queryKey: ["figma-status"],
			queryFn: _temp$113,
			staleTime: 3e4
		};
		$[0] = t0;
	} else t0 = $[0];
	return useQuery(t0);
}
function _temp$113() {
	return figmaFetch("/figma/status");
}
function useFigmaIntegration(projectId) {
	const $ = (0, import_compiler_runtime.c)(12);
	const queryClient = useQueryClient();
	const statusQuery = useFigmaStatus();
	let t0;
	if ($[0] !== queryClient) {
		t0 = async () => queryClient.fetchQuery({
			queryKey: ["figma-status"],
			queryFn: _temp2$74,
			staleTime: 3e4
		});
		$[0] = queryClient;
		$[1] = t0;
	} else t0 = $[1];
	const ensureFigmaStatus = t0;
	let t1;
	if ($[2] !== queryClient) {
		t1 = async () => {
			const clientId = "XYmYaLeffEjKD6yHJgg9x9";
			const state = crypto.randomUUID();
			const { verifier, challenge } = await generatePkce();
			const redirectUri = figmaCallbackUrl();
			localStorage.setItem(FIGMA_STATE_KEY, state);
			localStorage.setItem(FIGMA_VERIFIER_KEY, verifier);
			localStorage.setItem(FIGMA_REDIRECT_KEY, redirectUri);
			const figmaUrl = buildFigmaAuthorizeUrl({
				clientId,
				redirectUri,
				state,
				codeChallenge: challenge
			});
			return await new Promise((resolve) => {
				let settled = false;
				const finish = (result) => {
					if (settled) return;
					settled = true;
					window.removeEventListener("message", onMessage);
					window.clearInterval(timer);
					resolve(result);
				};
				const popup = window.open(figmaUrl, "figma-oauth", "width=600,height=700,popup=yes");
				if (!popup) {
					finish({
						connected: false,
						error: "Popup blocked. Allow popups for this site and try again."
					});
					return;
				}
				const onMessage = (e) => {
					if (e.origin !== window.location.origin) return;
					if (e.data?.type === "figma-connected") {
						popup.close();
						queryClient.invalidateQueries({ queryKey: ["figma-status"] });
						finish({ connected: true });
					}
					if (e.data?.type === "figma-connect-failed") finish({
						connected: false,
						error: typeof e.data.error === "string" ? e.data.error : "Figma connection failed"
					});
				};
				window.addEventListener("message", onMessage);
				const timer = window.setInterval(() => {
					if (!popup.closed || settled) return;
					window.clearInterval(timer);
					(async () => {
						try {
							if ((await queryClient.fetchQuery({
								queryKey: ["figma-status"],
								queryFn: _temp3$54
							})).connected) {
								finish({ connected: true });
								return;
							}
						} catch {}
						finish({
							connected: false,
							error: "OAuth window closed before connection completed. Check the popup for an error message."
						});
					})();
				}, 500);
			});
		};
		$[2] = queryClient;
		$[3] = t1;
	} else t1 = $[3];
	const openFigmaOAuth = t1;
	const openFigmaOAuthElectron = _temp4$46;
	let t2;
	if ($[4] !== projectId) {
		t2 = async (fileKey, hashes) => figmaFetch(`/projects/${projectId}/figma/resolve-images`, {
			method: "POST",
			body: JSON.stringify({
				fileKey,
				hashes
			})
		});
		$[4] = projectId;
		$[5] = t2;
	} else t2 = $[5];
	const resolveFigmaImages = t2;
	let t3;
	if ($[6] !== ensureFigmaStatus || $[7] !== openFigmaOAuth || $[8] !== resolveFigmaImages || $[9] !== statusQuery.data || $[10] !== statusQuery.isLoading) {
		t3 = {
			status: statusQuery.data,
			isLoading: statusQuery.isLoading,
			ensureFigmaStatus,
			openFigmaOAuth,
			openFigmaOAuthElectron,
			resolveFigmaImages
		};
		$[6] = ensureFigmaStatus;
		$[7] = openFigmaOAuth;
		$[8] = resolveFigmaImages;
		$[9] = statusQuery.data;
		$[10] = statusQuery.isLoading;
		$[11] = t3;
	} else t3 = $[11];
	return t3;
}
function _temp4$46() {
	const webUrl = getWebUrl();
	window.open(`${webUrl}/figma/connect?source=electron`, "_blank");
}
function _temp3$54() {
	return figmaFetch("/figma/status");
}
function _temp2$74() {
	return figmaFetch("/figma/status");
}

export { isFigmaNotConnectedError, useFigmaIntegration };
