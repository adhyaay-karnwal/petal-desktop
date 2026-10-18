// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/panels/styles/image/useImageAdjust.ts
import { import_react } from "../../../../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../../../../cloud/src/hooks/useSession.js";
import { toast } from "../../../../../../../../vendor/sonner.js";
import { useBackend } from "../../../../../backends/BackendContext.js";
import { useAssetResolver } from "../../../../../shared/contexts/AssetContext.js";
import { ADJUST_KEYS, isNeutralAdjust } from "../../../../../shared/imageAdjust/imageAdjust.js";
import { parseAdjustRecord, resolveAdjust } from "../../../../../shared/imageAdjust/adjustRecord.js";
import { UnreadableImageError } from "../../../../../shared/imageAdjust/bake.js";
import { UnsupportedVideoError } from "../../../../../shared/imageAdjust/bakeVideo.js";
import { strategyFor } from "./mediaAdjustStrategy.js";
import { abortPendingBake, endPendingPreview, peekPendingAdjust, pendingAdjust, releasePendingAdjust } from "./pendingAdjust.js";

function isExternal(resolvedUrl) {
	if (!/^https?:/i.test(resolvedUrl) || resolvedUrl.includes("/assets/by-path")) return false;
	try {
		return new URL(resolvedUrl).origin !== window.location.origin;
	} catch {
		return false;
	}
}
/** Identifies an image and its adjustment values, independent of key order. */
var adjustKey = (url, adjust) => `${url}|${ADJUST_KEYS.map((key) => adjust[key] ?? 0).join(",")}`;
var sameAdjust = (a, b) => ADJUST_KEYS.every((key) => (a[key] ?? 0) === (b[key] ?? 0));
/** Pause after the last change before saving; leaving the image saves straight away. */
var SAVE_IDLE_MS = 2e3;
var statusForError = (error) => error instanceof UnreadableImageError ? "unreadable" : error instanceof UnsupportedVideoError ? "unsupported" : "failed";
function useImageAdjust(t0) {
	const $ = (0, import_compiler_runtime.c)(86);
	const { elementId, url, recordValue, target, apply, onPreview } = t0;
	const backend = useBackend();
	const resolveAsset = useAssetResolver();
	let entry;
	let entryKey;
	let initialStatus;
	let t1;
	let t2;
	if ($[0] !== recordValue || $[1] !== resolveAsset || $[2] !== target || $[3] !== url) {
		entry = resolveAdjust(parseAdjustRecord(recordValue), url);
		entryKey = adjustKey(url, entry.adjust);
		initialStatus = isExternal(resolveAsset(entry.source)) ? "unreadable" : "idle";
		t1 = target;
		t2 = resolveAsset(entry.source);
		$[0] = recordValue;
		$[1] = resolveAsset;
		$[2] = target;
		$[3] = url;
		$[4] = entry;
		$[5] = entryKey;
		$[6] = initialStatus;
		$[7] = t1;
		$[8] = t2;
	} else {
		entry = $[4];
		entryKey = $[5];
		initialStatus = $[6];
		t1 = $[7];
		t2 = $[8];
	}
	const sessionKey = `${t1}|${t2}`;
	const pendingKey = `${elementId}|${sessionKey}`;
	let t3;
	if ($[9] !== entry.adjust || $[10] !== pendingKey) {
		t3 = () => peekPendingAdjust(pendingKey)?.bake?.adjust ?? entry.adjust;
		$[9] = entry.adjust;
		$[10] = pendingKey;
		$[11] = t3;
	} else t3 = $[11];
	const [values, setValues] = (0, import_react.useState)(t3);
	const [status, setStatus] = (0, import_react.useState)(initialStatus);
	const [syncedKey, setSyncedKey] = (0, import_react.useState)(entryKey);
	const [ownCommitKey, setOwnCommitKey] = (0, import_react.useState)(null);
	const [syncedPendingKey, setSyncedPendingKey] = (0, import_react.useState)(pendingKey);
	if (syncedPendingKey !== pendingKey) {
		setSyncedPendingKey(pendingKey);
		setStatus(initialStatus);
	}
	if (syncedKey !== entryKey && status !== "saving") {
		setSyncedKey(entryKey);
		if (entryKey !== ownCommitKey) {
			setValues(entry.adjust);
			setStatus(initialStatus);
		}
	}
	const valuesRef = (0, import_react.useRef)(values);
	let t4;
	let t5;
	if ($[12] !== values) {
		t4 = () => {
			valuesRef.current = values;
		};
		t5 = [values];
		$[12] = values;
		$[13] = t4;
		$[14] = t5;
	} else {
		t4 = $[13];
		t5 = $[14];
	}
	(0, import_react.useLayoutEffect)(t4, t5);
	let t6;
	if ($[15] !== target) {
		t6 = strategyFor(target);
		$[15] = target;
		$[16] = t6;
	} else t6 = $[16];
	const strategy = t6;
	const [progress, setProgress] = (0, import_react.useState)(null);
	const onPreviewRef = (0, import_react.useRef)(onPreview);
	let t7;
	if ($[17] !== onPreview) {
		t7 = () => {
			onPreviewRef.current = onPreview;
		};
		$[17] = onPreview;
		$[18] = t7;
	} else t7 = $[18];
	(0, import_react.useEffect)(t7);
	let t8;
	if ($[19] !== resolveAsset || $[20] !== url) {
		t8 = resolveAsset(url);
		$[19] = resolveAsset;
		$[20] = url;
		$[21] = t8;
	} else t8 = $[21];
	const shownUrlRef = (0, import_react.useRef)(t8);
	let t9;
	if ($[22] !== resolveAsset || $[23] !== url) {
		t9 = () => {
			shownUrlRef.current = resolveAsset(url);
		};
		$[22] = resolveAsset;
		$[23] = url;
		$[24] = t9;
	} else t9 = $[24];
	(0, import_react.useLayoutEffect)(t9);
	let t10;
	if ($[25] !== pendingKey) {
		t10 = (restore) => {
			endPendingPreview(pendingKey, restore ? shownUrlRef.current : void 0);
			onPreviewRef.current?.(null);
		};
		$[25] = pendingKey;
		$[26] = t10;
	} else t10 = $[26];
	const endSession = t10;
	let t11;
	let t12;
	if ($[27] !== entryKey || $[28] !== pendingKey || $[29] !== url) {
		t11 = () => {
			const session = peekPendingAdjust(pendingKey)?.session;
			if (session && adjustKey(url, valuesRef.current) !== entryKey) session.request(valuesRef.current);
		};
		t12 = [
			url,
			entryKey,
			pendingKey
		];
		$[27] = entryKey;
		$[28] = pendingKey;
		$[29] = url;
		$[30] = t11;
		$[31] = t12;
	} else {
		t11 = $[30];
		t12 = $[31];
	}
	(0, import_react.useLayoutEffect)(t11, t12);
	const saveTimer = (0, import_react.useRef)(null);
	const mounted = (0, import_react.useRef)(true);
	let t13;
	if ($[32] === Symbol.for("react.memo_cache_sentinel")) {
		t13 = (key, value) => {
			const next = {
				...valuesRef.current,
				[key]: value
			};
			if (!value) delete next[key];
			valuesRef.current = next;
			setValues(next);
			return next;
		};
		$[32] = t13;
	} else t13 = $[32];
	const setValue = t13;
	let t14;
	if ($[33] === Symbol.for("react.memo_cache_sentinel")) {
		t14 = () => {
			if (saveTimer.current) clearTimeout(saveTimer.current);
			saveTimer.current = null;
		};
		$[33] = t14;
	} else t14 = $[33];
	const clearTimer = t14;
	let t15;
	if ($[34] !== pendingKey) {
		t15 = () => abortPendingBake(pendingKey);
		$[34] = pendingKey;
		$[35] = t15;
	} else t15 = $[35];
	const abortBake = t15;
	let t16;
	if ($[36] !== abortBake || $[37] !== elementId || $[38] !== entry.source || $[39] !== pendingKey || $[40] !== resolveAsset || $[41] !== sessionKey || $[42] !== status || $[43] !== strategy) {
		t16 = (key_0, value_0) => {
			if (status === "unreadable") return;
			if (peekPendingAdjust(pendingKey)?.bake) {
				abortBake();
				setStatus("idle");
			}
			const next_0 = setValue(key_0, value_0);
			const shared = pendingAdjust(pendingKey);
			if (!shared.session) shared.session = strategy.createSession(sessionKey, elementId, () => shownUrlRef.current, resolveAsset(entry.source), {
				onShown: (preview) => onPreviewRef.current?.(preview),
				onLoadError: (error) => setStatus(statusForError(error))
			});
			shared.session.request(next_0);
		};
		$[36] = abortBake;
		$[37] = elementId;
		$[38] = entry.source;
		$[39] = pendingKey;
		$[40] = resolveAsset;
		$[41] = sessionKey;
		$[42] = status;
		$[43] = strategy;
		$[44] = t16;
	} else t16 = $[44];
	const change = t16;
	let t17;
	if ($[45] !== apply || $[46] !== backend || $[47] !== endSession || $[48] !== entry.source || $[49] !== pendingKey || $[50] !== resolveAsset || $[51] !== strategy || $[52] !== url) {
		t17 = (adjust) => {
			const controller = new AbortController();
			const shared_0 = pendingAdjust(pendingKey);
			shared_0.bake = {
				controller,
				adjust
			};
			const settle = () => {
				shared_0.bake = null;
				releasePendingAdjust(pendingKey);
			};
			setStatus("saving");
			setProgress(null);
			const context = {
				backend,
				resolveAsset,
				signal: controller.signal,
				onProgress: setProgress
			};
			strategy.bake(resolveAsset(entry.source), adjust, context).then((bakedUrl) => {
				if (controller.signal.aborted) return;
				settle();
				setOwnCommitKey(adjustKey(bakedUrl, adjust));
				apply(url, bakedUrl, {
					source: entry.source,
					adjust
				});
				if (!mounted.current || sameAdjust(valuesRef.current, adjust)) endSession(false);
				setStatus("idle");
			}, (error_0) => {
				if (controller.signal.aborted) return;
				settle();
				setStatus(statusForError(error_0));
				if (!mounted.current) {
					endSession(true);
					toast.error("Couldn’t save image adjustments");
				}
			});
		};
		$[45] = apply;
		$[46] = backend;
		$[47] = endSession;
		$[48] = entry.source;
		$[49] = pendingKey;
		$[50] = resolveAsset;
		$[51] = strategy;
		$[52] = url;
		$[53] = t17;
	} else t17 = $[53];
	const runBake = t17;
	let t18;
	if ($[54] !== abortBake || $[55] !== apply || $[56] !== endSession || $[57] !== entry.adjust || $[58] !== entry.source || $[59] !== pendingKey || $[60] !== runBake || $[61] !== status || $[62] !== url) {
		t18 = () => {
			clearTimer();
			if (status === "unreadable") return;
			const adjust_0 = valuesRef.current;
			const inFlight = peekPendingAdjust(pendingKey)?.bake;
			if (inFlight && sameAdjust(inFlight.adjust, adjust_0)) return;
			abortBake();
			if (sameAdjust(adjust_0, entry.adjust)) {
				endSession(true);
				setStatus("idle");
				return;
			}
			if (isNeutralAdjust(adjust_0)) {
				endSession(true);
				setStatus("idle");
				setOwnCommitKey(adjustKey(entry.source, {}));
				apply(url, entry.source, {
					source: entry.source,
					adjust: {}
				});
				return;
			}
			runBake(adjust_0);
		};
		$[54] = abortBake;
		$[55] = apply;
		$[56] = endSession;
		$[57] = entry.adjust;
		$[58] = entry.source;
		$[59] = pendingKey;
		$[60] = runBake;
		$[61] = status;
		$[62] = url;
		$[63] = t18;
	} else t18 = $[63];
	const flush = t18;
	const flushRef = (0, import_react.useRef)(flush);
	let t19;
	if ($[64] !== flush) {
		t19 = () => {
			flushRef.current = flush;
		};
		$[64] = flush;
		$[65] = t19;
	} else t19 = $[65];
	(0, import_react.useLayoutEffect)(t19);
	let t20;
	let t21;
	if ($[66] === Symbol.for("react.memo_cache_sentinel")) {
		t20 = () => {
			mounted.current = true;
			return () => {
				mounted.current = false;
				flushRef.current();
			};
		};
		t21 = [];
		$[66] = t20;
		$[67] = t21;
	} else {
		t20 = $[66];
		t21 = $[67];
	}
	(0, import_react.useEffect)(t20, t21);
	const previousPendingKey = (0, import_react.useRef)(pendingKey);
	let t22;
	let t23;
	if ($[68] !== pendingKey) {
		t22 = () => {
			const previous = previousPendingKey.current;
			if (previous === pendingKey) return;
			previousPendingKey.current = pendingKey;
			clearTimer();
			abortPendingBake(previous);
			endPendingPreview(previous, shownUrlRef.current);
			onPreviewRef.current?.(null);
		};
		t23 = [pendingKey];
		$[68] = pendingKey;
		$[69] = t22;
		$[70] = t23;
	} else {
		t22 = $[69];
		t23 = $[70];
	}
	(0, import_react.useEffect)(t22, t23);
	let t24;
	if ($[71] !== endSession || $[72] !== entry.adjust || $[73] !== pendingKey || $[74] !== status) {
		t24 = (key_1, value_1) => {
			if (status === "unreadable") return;
			const next_1 = setValue(key_1, value_1);
			clearTimer();
			if (sameAdjust(next_1, entry.adjust) && !peekPendingAdjust(pendingKey)?.bake) {
				endSession(true);
				return;
			}
			saveTimer.current = setTimeout(() => flushRef.current(), SAVE_IDLE_MS);
		};
		$[71] = endSession;
		$[72] = entry.adjust;
		$[73] = pendingKey;
		$[74] = status;
		$[75] = t24;
	} else t24 = $[75];
	const commitValue = t24;
	let t25;
	if ($[76] !== flush) {
		t25 = () => {
			valuesRef.current = {};
			setValues({});
			flush();
		};
		$[76] = flush;
		$[77] = t25;
	} else t25 = $[77];
	const reset = t25;
	let t26;
	if ($[78] !== change || $[79] !== commitValue || $[80] !== flush || $[81] !== progress || $[82] !== reset || $[83] !== status || $[84] !== values) {
		t26 = {
			values,
			status,
			progress,
			change,
			commitValue,
			retry: flush,
			reset
		};
		$[78] = change;
		$[79] = commitValue;
		$[80] = flush;
		$[81] = progress;
		$[82] = reset;
		$[83] = status;
		$[84] = values;
		$[85] = t26;
	} else t26 = $[85];
	return t26;
}

export { useImageAdjust };
