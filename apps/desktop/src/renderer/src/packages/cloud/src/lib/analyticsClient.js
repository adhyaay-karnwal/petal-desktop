// Reconstructed from index-C74mRL57.js — original module: packages/cloud/src/lib/analyticsClient.ts

var REDACTED = "[redacted]";
/** Customer content in session replays: terminal, code editors, chat. */
var MASK_TEXT_SELECTOR = ".xterm, .cm-editor, [data-ph-mask]";
/**
* Replaced by a placeholder: these repeat canvas text or local paths in attributes, which masking skips.
* The canvas is blocked, not masked: recording its ~30k nodes freezes the editor for seconds.
*/
var BLOCK_SELECTOR = ".ed-context-chip, [data-canvas-content], [data-ph-block]";
/**
* Autocapture reports the clicked element's text in `$el_text` and its chain,
* so a click inside customer content ships that content. Two regions are
* dropped rather than sampled:
*  - the design canvas (`data-canvas-content`), whose drill-in click runs also
*    read as rage clicks;
*  - anything marked `data-ph-mask` (chat messages and the composer, i.e.
*    prompts) or `data-ph-block` (context chips, the Layers panel), which
*    repeat customer content.
* `maskTextSelector`/`blockSelector` below cover replays only; they do not
* reach autocapture, which is why the same markers are honoured here too.
* `ph-no-capture` would work for autocapture but blanks the element in
* replays as well.
*/
var CONTENT_CLICK_EVENTS = /* @__PURE__ */ new Set([
	"$autocapture",
	"$rageclick",
	"$dead_click"
]);
var CONTENT_MARKERS = [
	"attr__data-canvas-content",
	"attr__data-ph-mask",
	"attr__data-ph-block"
];
var isContentClick = (event) => CONTENT_CLICK_EVENTS.has(event.event) && typeof event.properties.$elements_chain === "string" && CONTENT_MARKERS.some((marker) => event.properties.$elements_chain.includes(marker));
/**
* Automatic events with no product question behind them, dropped before send.
* Each fires once per page load, so on a SPA they outnumber the events we
* actually designed:
*  - `$web_vitals` — no insight or dashboard reads them (4.6% of 30d volume).
*  - `$conversations_loaded` — telemetry for PostHog's support widget, not
*    product behaviour (4.5%). Dropping the event does not affect the widget.
* Delete an entry here to start collecting it again; nothing else changes.
*/
var NOISE_EVENTS = /* @__PURE__ */ new Set(["$web_vitals", "$conversations_loaded"]);
/**
* Person- and group-property events carry no behaviour, only current values, so
* a repeat with an identical payload tells us nothing. posthog-js emits one per
* page load (ours and its own), which on a SPA outnumbers the events we
* designed. Remember the last payload sent for each and drop exact repeats.
*
* `$identify` is never deduped: it establishes the distinct id.
* The first send of any payload always goes through, so `$set_once` attribution
* (initial referrer, UTM) is never the one dropped.
*/
var DEDUPED_PROPERTY_EVENTS = /* @__PURE__ */ new Set(["$set", "$groupidentify"]);
/** Stable across key order, so a re-render can't look like a change. */
function propertyFingerprint(event) {
	const payload = {
		set: event.$set ?? event.properties.$set,
		setOnce: event.$set_once ?? event.properties.$set_once,
		groups: event.properties.$groups,
		groupType: event.properties.$group_type,
		groupKey: event.properties.$group_key,
		groupSet: event.properties.$group_set
	};
	return JSON.stringify(payload, (_k, v) => v && typeof v === "object" && !Array.isArray(v) ? Object.fromEntries(Object.entries(v).sort(([a], [b]) => a.localeCompare(b))) : v);
}
/** Falls back to memory where localStorage is unavailable (private mode, tests),
*  so repeats are still deduped within the page even if not across reloads. */
var lastPropertyPayload = /* @__PURE__ */ new Map();
function isRepeatedPropertyEvent(event) {
	if (!DEDUPED_PROPERTY_EVENTS.has(event.event)) return false;
	const key = `lg_ph_last_${event.event}`;
	const fingerprint = propertyFingerprint(event);
	let previous = lastPropertyPayload.get(key);
	try {
		previous = localStorage.getItem(key) ?? previous;
	} catch {}
	if (previous === fingerprint) return true;
	lastPropertyPayload.set(key, fingerprint);
	try {
		localStorage.setItem(key, fingerprint);
	} catch {}
	return false;
}
/** rrweb event type for a page meta event (`data.href`); it is never compressed. */
var RRWEB_META_EVENT = 4;
/**
* Redacts secrets and local paths that end up in URLs, referrers, element
* attributes and stack traces: share/invite tokens in the path, OAuth codes and
* auth tokens in the query or hash, and the install path (which holds the OS
* username) in the desktop's file:// URLs.
*/
function scrubAnalyticsText(text) {
	if (!text.includes("/") && !text.includes("=") && !text.includes("\\")) return text;
	return text.replace(/\/(share|invite|org-invite)\/[^/?#\s"'<>]+/g, `/$1/${REDACTED}`).replace(/([?&#](?:code|state|token)=)[^&#\s"'<>]+/g, `$1${REDACTED}`).replace(/file:\/\/\/?(?:[^\s"'<>()?#]*\/)?/g, "app://petal/").replace(/\b([A-Za-z]:\\+Users\\+)[^\\\s"'<>]+/g, `$1${REDACTED}`);
}
function scrubValue(value) {
	if (typeof value === "string") return scrubAnalyticsText(value);
	if (Array.isArray(value)) return value.map(scrubValue);
	if (value && typeof value === "object") {
		const out = {};
		for (const [key, v] of Object.entries(value)) out[scrubAnalyticsText(key)] = scrubValue(v);
		return out;
	}
	return value;
}
function scrubSnapshot(properties) {
	const data = properties.$snapshot_data;
	if (!Array.isArray(data)) return properties;
	return {
		...properties,
		$snapshot_data: data.map((event) => event?.type === RRWEB_META_EVENT && typeof event.data?.href === "string" ? {
			...event,
			data: {
				...event.data,
				href: scrubAnalyticsText(event.data.href)
			}
		} : event)
	};
}
/**
* Dashboard-facing aliases. The canvas is `page_id` and the file is `project_id`
* everywhere in code, but analysis asks for them under these names, so both
* spellings ship. Aliased here rather than at each capture site so they can't
* drift apart. Note `file_id` means a source file on disk in the database —
* this alias is the UI's "file", which is a project.
*/
var ID_ALIASES = {
	page_id: "canvas_id",
	project_id: "file_id"
};
function withIdAliases(properties) {
	let aliased = properties;
	for (const [from, to] of Object.entries(ID_ALIASES)) {
		if (properties[from] === void 0 || properties[to] !== void 0) continue;
		aliased = {
			...aliased,
			[to]: properties[from]
		};
	}
	return aliased;
}
function scrubAnalyticsEvent(event, context) {
	const properties = event.event === "$snapshot" ? scrubSnapshot(event.properties) : withIdAliases(scrubValue(event.properties));
	return {
		...event,
		properties: {
			...properties,
			...context
		},
		...event.$set ? { $set: scrubValue(event.$set) } : {},
		...event.$set_once ? { $set_once: scrubValue(event.$set_once) } : {}
	};
}
function analyticsClientConfig(context) {
	return {
		before_send: (event) => !event || isContentClick(event) || NOISE_EVENTS.has(event.event) || isRepeatedPropertyEvent(event) ? null : scrubAnalyticsEvent(event, context),
		session_recording: {
			maskAllInputs: true,
			maskTextSelector: MASK_TEXT_SELECTOR,
			blockSelector: BLOCK_SELECTOR,
			captureCanvas: { recordCanvas: false },
			maskCapturedNetworkRequestFn: (request) => ({
				...request,
				name: scrubAnalyticsText(request.name),
				requestHeaders: void 0,
				requestBody: void 0,
				responseHeaders: void 0,
				responseBody: void 0
			})
		}
	};
}

export { analyticsClientConfig };
