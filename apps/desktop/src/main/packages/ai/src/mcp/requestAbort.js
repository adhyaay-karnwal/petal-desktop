// Reconstructed from index.js — original module: packages/ai/src/mcp/requestAbort.ts
import { node_async_hooks } from "../../../../__bundle__/_preamble.js";

/**
* The HTTP request that is currently inside `startMcpServer`. Tool hooks and
* host commands read it so a client disconnect aborts in-flight work. The SDK
* only aborts `extra.signal` when the transport closes, and closing the POST
* response must not close the session.
*/
var requestAbort = new node_async_hooks.AsyncLocalStorage();
function runWithRequestAbort(signal, fn) {
	return requestAbort.run(signal, fn);
}
function currentRequestAbortSignal() {
	return requestAbort.getStore();
}
/** One signal that aborts when any of `signals` aborts. */
function linkAbortSignals(...signals) {
	const present = signals.filter((signal) => signal != null);
	if (present.length === 0) return void 0;
	if (present.length === 1) return present[0];
	const controller = new AbortController();
	for (const signal of present) {
		if (signal.aborted) {
			controller.abort(signal.reason);
			return controller.signal;
		}
		signal.addEventListener("abort", () => {
			if (!controller.signal.aborted) controller.abort(signal.reason);
		}, { once: true });
	}
	return controller.signal;
}

export { currentRequestAbortSignal, linkAbortSignals, runWithRequestAbort };
