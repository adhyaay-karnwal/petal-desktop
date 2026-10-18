// Reconstructed from index.js — original module: packages/ai/src/mcp/requestGuard.ts

/**
* Only local, non-browser clients may call the MCP server. Binding to 127.0.0.1
* is not enough: a DNS-rebound web page reaches it with a foreign Host, and any
* browser request carries Origin.
*
* v1 and v2 both call this before routing a request.
*/
function isTrustedLocalRequest(headers, port) {
	if (headers.origin !== void 0) return false;
	return headers.host === `127.0.0.1:${port}` || headers.host === `localhost:${port}`;
}

export { isTrustedLocalRequest };
