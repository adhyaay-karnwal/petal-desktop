// Reconstructed from index.js — original module: vendor/@ai-sdk/gateway
import { require_dist$2, require_rolldown_runtime } from "../../__bundle__/_preamble.js";
import { WORKFLOW_DESERIALIZE, WORKFLOW_SERIALIZE } from "../@workflow/serde.js";
import { require_auth_errors, require_get_context, require_get_vercel_oidc_token, require_token_util } from "../@vercel/oidc.js";

var import_dist = (/* @__PURE__ */ require_rolldown_runtime.__commonJSMin(((exports, module) => {
	var __defProp = Object.defineProperty;
	var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
	var __getOwnPropNames = Object.getOwnPropertyNames;
	var __hasOwnProp = Object.prototype.hasOwnProperty;
	var __export = (target, all) => {
		for (var name in all) __defProp(target, name, {
			get: all[name],
			enumerable: true
		});
	};
	var __copyProps = (to, from, except, desc) => {
		if (from && typeof from === "object" || typeof from === "function") {
			for (let key of __getOwnPropNames(from)) if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
				get: () => from[key],
				enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
			});
		}
		return to;
	};
	var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
	var src_exports = {};
	__export(src_exports, {
		AccessTokenMissingError: () => import_auth_errors.AccessTokenMissingError,
		RefreshAccessTokenFailedError: () => import_auth_errors.RefreshAccessTokenFailedError,
		getContext: () => import_get_context.getContext,
		getVercelOidcToken: () => import_get_vercel_oidc_token.getVercelOidcToken,
		getVercelOidcTokenSync: () => import_get_vercel_oidc_token.getVercelOidcTokenSync,
		getVercelToken: () => import_token_util.getVercelToken
	});
	module.exports = __toCommonJS(src_exports);
	var import_get_vercel_oidc_token = require_get_vercel_oidc_token();
	var import_get_context = require_get_context();
	var import_auth_errors = require_auth_errors();
	var import_token_util = require_token_util();
	0 && (module.exports = {
		AccessTokenMissingError,
		RefreshAccessTokenFailedError,
		getContext,
		getVercelOidcToken,
		getVercelOidcTokenSync,
		getVercelToken
	});
})))();
var GATEWAY_REALTIME_SUBPROTOCOL = "ai-gateway-realtime.v1";
var GATEWAY_TRANSCRIPTION_SUBPROTOCOL = "ai-gateway-transcription.v1";
var GATEWAY_AUTH_SUBPROTOCOL_PREFIX = "ai-gateway-auth.";
var GATEWAY_TEAM_SUBPROTOCOL_PREFIX = "ai-gateway-team.";
function getGatewayRealtimeProtocols(token, options) {
	return buildGatewayProtocols(GATEWAY_REALTIME_SUBPROTOCOL, token, options);
}
function getGatewayTranscriptionProtocols(token, options) {
	return buildGatewayProtocols(GATEWAY_TRANSCRIPTION_SUBPROTOCOL, token, options);
}
function buildGatewayProtocols(marker12, token, options) {
	const protocols = [marker12, `${GATEWAY_AUTH_SUBPROTOCOL_PREFIX}${token}`];
	if (options == null ? void 0 : options.teamIdOrSlug) protocols.push(`${GATEWAY_TEAM_SUBPROTOCOL_PREFIX}${encodeSubprotocolValue(options.teamIdOrSlug)}`);
	return protocols;
}
function encodeSubprotocolValue(value) {
	const bytes = new TextEncoder().encode(value);
	let binary = "";
	for (const byte of bytes) binary += String.fromCharCode(byte);
	return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/u, "");
}
var z$1 = {
	any: require_dist$2.any,
	array: require_dist$2.array,
	boolean: require_dist$2.boolean,
	discriminatedUnion: require_dist$2.discriminatedUnion,
	enum: require_dist$2._enum,
	literal: require_dist$2.literal,
	number: require_dist$2.number,
	object: require_dist$2.object,
	record: require_dist$2.record,
	string: require_dist$2.string,
	union: require_dist$2.union,
	unknown: require_dist$2.unknown
};
var symbol$1 = Symbol.for("vercel.ai.gateway.error");
var _a$1;
var _b$1;
var GatewayError = class _GatewayError extends (_b$1 = Error, _a$1 = symbol$1, _b$1) {
	constructor({ message, statusCode = 500, cause, generationId, isRetryable = statusCode != null && (statusCode === 408 || statusCode === 409 || statusCode === 429 || statusCode >= 500) }) {
		super(generationId ? `${message} [${generationId}]` : message);
		this[_a$1] = true;
		this.statusCode = statusCode;
		this.cause = cause;
		this.generationId = generationId;
		this.isRetryable = isRetryable;
	}
	/**
	* Checks if the given error is a Gateway Error.
	* @param {unknown} error - The error to check.
	* @returns {boolean} True if the error is a Gateway Error, false otherwise.
	*/
	static isInstance(error) {
		return _GatewayError.hasMarker(error);
	}
	static hasMarker(error) {
		return typeof error === "object" && error !== null && symbol$1 in error && error[symbol$1] === true;
	}
};
var name$1 = "GatewayAuthenticationError";
var marker2$1 = `vercel.ai.gateway.error.${name$1}`;
var symbol2$1 = Symbol.for(marker2$1);
var _a2$1;
var _b2$1;
var GatewayAuthenticationError = class _GatewayAuthenticationError extends (_b2$1 = GatewayError, _a2$1 = symbol2$1, _b2$1) {
	constructor({ message = "Authentication failed", statusCode = 401, cause, generationId } = {}) {
		super({
			message,
			statusCode,
			cause,
			generationId
		});
		this[_a2$1] = true;
		this.name = name$1;
		this.type = "authentication_error";
	}
	static isInstance(error) {
		return GatewayError.hasMarker(error) && symbol2$1 in error;
	}
	/**
	* Creates a contextual error message when authentication fails
	*/
	static createContextualError({ apiKeyProvided, oidcTokenProvided, statusCode = 401, cause, generationId }) {
		let contextualMessage;
		if (apiKeyProvided) contextualMessage = `AI Gateway authentication failed: Invalid API key or token.

Create a new API key: https://vercel.com/d?to=%2F%5Bteam%5D%2F%7E%2Fai%2Fapi-keys

Provide an API key or Vercel access token via 'apiKey' option or 'AI_GATEWAY_API_KEY' environment variable.`;
		else if (oidcTokenProvided) contextualMessage = `AI Gateway authentication failed: Invalid OIDC token.

Run 'npx vercel link' to link your project, then 'vc env pull' to fetch the token.

Alternatively, use an API key: https://vercel.com/d?to=%2F%5Bteam%5D%2F%7E%2Fai%2Fapi-keys
or pass a Vercel access token via the 'apiKey' option.`;
		else contextualMessage = `AI Gateway authentication failed: No authentication provided.

Option 1 - API key:
Create an API key: https://vercel.com/d?to=%2F%5Bteam%5D%2F%7E%2Fai%2Fapi-keys
Provide via 'apiKey' option or 'AI_GATEWAY_API_KEY' environment variable.

Option 2 - Vercel access token:
Pass a Vercel personal access token or Vercel app access token via the 'apiKey' option.

Option 3 - OIDC token:
Run 'npx vercel link' to link your project, then 'vc env pull' to fetch the token.`;
		return new _GatewayAuthenticationError({
			message: contextualMessage,
			statusCode,
			cause,
			generationId
		});
	}
};
var name2$1 = "GatewayInvalidRequestError";
var marker3$1 = `vercel.ai.gateway.error.${name2$1}`;
var symbol3$1 = Symbol.for(marker3$1);
var _a3$1;
var _b3$1;
var GatewayInvalidRequestError = class extends (_b3$1 = GatewayError, _a3$1 = symbol3$1, _b3$1) {
	constructor({ message = "Invalid request", statusCode = 400, cause, generationId } = {}) {
		super({
			message,
			statusCode,
			cause,
			generationId
		});
		this[_a3$1] = true;
		this.name = name2$1;
		this.type = "invalid_request_error";
	}
	static isInstance(error) {
		return GatewayError.hasMarker(error) && symbol3$1 in error;
	}
};
var name3$1 = "GatewayRateLimitError";
var marker4$1 = `vercel.ai.gateway.error.${name3$1}`;
var symbol4$1 = Symbol.for(marker4$1);
var _a4$1;
var _b4$1;
var GatewayRateLimitError = class extends (_b4$1 = GatewayError, _a4$1 = symbol4$1, _b4$1) {
	constructor({ message = "Rate limit exceeded", statusCode = 429, cause, generationId } = {}) {
		super({
			message,
			statusCode,
			cause,
			generationId
		});
		this[_a4$1] = true;
		this.name = name3$1;
		this.type = "rate_limit_exceeded";
	}
	static isInstance(error) {
		return GatewayError.hasMarker(error) && symbol4$1 in error;
	}
};
var name4$1 = "GatewayModelNotFoundError";
var marker5$1 = `vercel.ai.gateway.error.${name4$1}`;
var symbol5$1 = Symbol.for(marker5$1);
var modelNotFoundParamSchema = require_dist$2.lazySchema(() => require_dist$2.zodSchema(z$1.object({ modelId: z$1.string() })));
var _a5$1;
var _b5$1;
var GatewayModelNotFoundError = class extends (_b5$1 = GatewayError, _a5$1 = symbol5$1, _b5$1) {
	constructor({ message = "Model not found", statusCode = 404, modelId, cause, generationId } = {}) {
		super({
			message,
			statusCode,
			cause,
			generationId
		});
		this[_a5$1] = true;
		this.name = name4$1;
		this.type = "model_not_found";
		this.modelId = modelId;
	}
	static isInstance(error) {
		return GatewayError.hasMarker(error) && symbol5$1 in error;
	}
};
var name5$1 = "GatewayNotFoundError";
var marker6$1 = `vercel.ai.gateway.error.${name5$1}`;
var symbol6$1 = Symbol.for(marker6$1);
var _a6$1;
var _b6$1;
var GatewayNotFoundError = class extends (_b6$1 = GatewayError, _a6$1 = symbol6$1, _b6$1) {
	constructor({ message = "Resource not found", statusCode = 404, cause, generationId } = {}) {
		super({
			message,
			statusCode,
			cause,
			generationId
		});
		this[_a6$1] = true;
		this.name = name5$1;
		this.type = "not_found";
	}
	static isInstance(error) {
		return GatewayError.hasMarker(error) && symbol6$1 in error;
	}
};
var name6$1 = "GatewayInternalServerError";
var marker7$1 = `vercel.ai.gateway.error.${name6$1}`;
var symbol7$1 = Symbol.for(marker7$1);
var _a7$1;
var _b7$1;
var GatewayInternalServerError = class extends (_b7$1 = GatewayError, _a7$1 = symbol7$1, _b7$1) {
	constructor({ message = "Internal server error", statusCode = 500, cause, generationId } = {}) {
		super({
			message,
			statusCode,
			cause,
			generationId
		});
		this[_a7$1] = true;
		this.name = name6$1;
		this.type = "internal_server_error";
	}
	static isInstance(error) {
		return GatewayError.hasMarker(error) && symbol7$1 in error;
	}
};
var name7$1 = "GatewayFailedDependencyError";
var marker8$1 = `vercel.ai.gateway.error.${name7$1}`;
var symbol8$1 = Symbol.for(marker8$1);
var _a8$1;
var _b8$1;
var GatewayFailedDependencyError = class extends (_b8$1 = GatewayError, _a8$1 = symbol8$1, _b8$1) {
	constructor({ message = "Failed dependency", statusCode = 424, cause, generationId } = {}) {
		super({
			message,
			statusCode,
			cause,
			generationId
		});
		this[_a8$1] = true;
		this.name = name7$1;
		this.type = "failed_dependency";
	}
	static isInstance(error) {
		return GatewayError.hasMarker(error) && symbol8$1 in error;
	}
};
var name8$1 = "GatewayForbiddenError";
var marker9$1 = `vercel.ai.gateway.error.${name8$1}`;
var symbol9$1 = Symbol.for(marker9$1);
var forbiddenParamSchema = require_dist$2.lazySchema(() => require_dist$2.zodSchema(z$1.object({ ruleId: z$1.string() })));
var _a9$1;
var _b9$1;
var GatewayForbiddenError = class extends (_b9$1 = GatewayError, _a9$1 = symbol9$1, _b9$1) {
	constructor({ message = "Forbidden", statusCode = 403, cause, generationId, ruleId } = {}) {
		super({
			message,
			statusCode,
			cause,
			generationId
		});
		this[_a9$1] = true;
		this.name = name8$1;
		this.type = "forbidden";
		this.ruleId = ruleId;
	}
	static isInstance(error) {
		return GatewayError.hasMarker(error) && symbol9$1 in error;
	}
};
var name9$1 = "GatewayResponseError";
var marker10$1 = `vercel.ai.gateway.error.${name9$1}`;
var symbol10$1 = Symbol.for(marker10$1);
var _a10$1;
var _b10$1;
var GatewayResponseError = class extends (_b10$1 = GatewayError, _a10$1 = symbol10$1, _b10$1) {
	constructor({ message = "Invalid response from Gateway", statusCode = 502, response, validationError, cause, generationId, isRetryable } = {}) {
		super({
			message,
			statusCode,
			cause,
			generationId,
			isRetryable
		});
		this[_a10$1] = true;
		this.name = name9$1;
		this.type = "response_error";
		this.response = response;
		this.validationError = validationError;
	}
	static isInstance(error) {
		return GatewayError.hasMarker(error) && symbol10$1 in error;
	}
};
async function createGatewayErrorFromResponse({ response, statusCode, defaultMessage = "Gateway request failed", cause, authMethod, isRetryable }) {
	var _a12;
	const parseResult = await require_dist$2.safeValidateTypes({
		value: response,
		schema: gatewayErrorResponseSchema
	});
	if (!parseResult.success) {
		const rawGenerationId = typeof response === "object" && response !== null && "generationId" in response ? response.generationId : void 0;
		return new GatewayResponseError({
			message: `Invalid error response format: ${defaultMessage}`,
			statusCode,
			response,
			validationError: parseResult.error,
			cause,
			generationId: rawGenerationId,
			isRetryable
		});
	}
	const validatedResponse = parseResult.value;
	const errorType = validatedResponse.error.type;
	const message = validatedResponse.error.message;
	const generationId = (_a12 = validatedResponse.generationId) != null ? _a12 : void 0;
	switch (errorType) {
		case "authentication_error": return GatewayAuthenticationError.createContextualError({
			apiKeyProvided: authMethod === "api-key",
			oidcTokenProvided: authMethod === "oidc",
			statusCode,
			cause,
			generationId
		});
		case "invalid_request_error": return new GatewayInvalidRequestError({
			message,
			statusCode,
			cause,
			generationId
		});
		case "rate_limit_exceeded": return new GatewayRateLimitError({
			message,
			statusCode,
			cause,
			generationId
		});
		case "model_not_found": {
			const modelResult = await require_dist$2.safeValidateTypes({
				value: validatedResponse.error.param,
				schema: modelNotFoundParamSchema
			});
			return new GatewayModelNotFoundError({
				message,
				statusCode,
				modelId: modelResult.success ? modelResult.value.modelId : void 0,
				cause,
				generationId
			});
		}
		case "not_found": return new GatewayNotFoundError({
			message,
			statusCode,
			cause,
			generationId
		});
		case "internal_server_error": return new GatewayInternalServerError({
			message,
			statusCode,
			cause,
			generationId
		});
		case "failed_dependency": return new GatewayFailedDependencyError({
			message,
			statusCode,
			cause,
			generationId
		});
		case "forbidden": {
			const ruleResult = await require_dist$2.safeValidateTypes({
				value: validatedResponse.error.param,
				schema: forbiddenParamSchema
			});
			return new GatewayForbiddenError({
				message,
				statusCode,
				cause,
				generationId,
				ruleId: ruleResult.success ? ruleResult.value.ruleId : void 0
			});
		}
		default: return new GatewayInternalServerError({
			message,
			statusCode,
			cause,
			generationId
		});
	}
}
var gatewayErrorResponseSchema = require_dist$2.lazySchema(() => require_dist$2.zodSchema(z$1.object({
	error: z$1.object({
		message: z$1.string(),
		type: z$1.string().nullish(),
		param: z$1.unknown().nullish(),
		code: z$1.union([z$1.string(), z$1.number()]).nullish()
	}),
	generationId: z$1.string().nullish()
})));
function extractApiCallResponse(error) {
	if (error.data !== void 0) return error.data;
	if (error.responseBody != null) try {
		return require_dist$2.secureJsonParse(error.responseBody);
	} catch (e) {
		return error.responseBody;
	}
	return {};
}
var name10$1 = "GatewayTimeoutError";
var marker11$1 = `vercel.ai.gateway.error.${name10$1}`;
var symbol11$1 = Symbol.for(marker11$1);
var _a11$1;
var _b11$1;
var GatewayTimeoutError = class _GatewayTimeoutError extends (_b11$1 = GatewayError, _a11$1 = symbol11$1, _b11$1) {
	constructor({ message = "Request timed out", statusCode = 408, cause, generationId } = {}) {
		super({
			message,
			statusCode,
			cause,
			generationId
		});
		this[_a11$1] = true;
		this.name = name10$1;
		this.type = "timeout_error";
	}
	static isInstance(error) {
		return GatewayError.hasMarker(error) && symbol11$1 in error;
	}
	/**
	* Creates a helpful timeout error message with troubleshooting guidance
	*/
	static createTimeoutError({ originalMessage, statusCode = 408, cause, generationId }) {
		const message = `Gateway request timed out: ${originalMessage}

    This is a client-side timeout. To resolve this, increase your timeout configuration: https://vercel.com/docs/ai-gateway/capabilities/video-generation#extending-timeouts-for-node.js`;
		return new _GatewayTimeoutError({
			message,
			statusCode,
			cause,
			generationId
		});
	}
};
function isTimeoutError(error) {
	if (!(error instanceof Error)) return false;
	const errorCode = error.code;
	if (typeof errorCode === "string") return [
		"UND_ERR_HEADERS_TIMEOUT",
		"UND_ERR_BODY_TIMEOUT",
		"UND_ERR_CONNECT_TIMEOUT"
	].includes(errorCode);
	return false;
}
async function asGatewayError(error, authMethod) {
	var _a12;
	if (GatewayError.isInstance(error)) return error;
	if (isTimeoutError(error)) return GatewayTimeoutError.createTimeoutError({
		originalMessage: error instanceof Error ? error.message : "Unknown error",
		cause: error
	});
	if (require_dist$2.APICallError.isInstance(error)) {
		if (error.cause && isTimeoutError(error.cause)) return GatewayTimeoutError.createTimeoutError({
			originalMessage: error.message,
			cause: error
		});
		return await createGatewayErrorFromResponse({
			response: extractApiCallResponse(error),
			statusCode: (_a12 = error.statusCode) != null ? _a12 : 500,
			defaultMessage: "Gateway request failed",
			cause: error,
			authMethod,
			isRetryable: error.isRetryable && (error.statusCode == null || error.statusCode < 400) ? true : void 0
		});
	}
	return await createGatewayErrorFromResponse({
		response: {},
		statusCode: 500,
		defaultMessage: error instanceof Error ? `Gateway request failed: ${error.message}` : "Unknown Gateway error",
		cause: error,
		authMethod
	});
}
var GATEWAY_AUTH_METHOD_HEADER = "ai-gateway-auth-method";
var VERCEL_AI_GATEWAY_TEAM_HEADER = "x-vercel-ai-gateway-team";
async function parseAuthMethod(headers) {
	const result = await require_dist$2.safeValidateTypes({
		value: headers[GATEWAY_AUTH_METHOD_HEADER],
		schema: gatewayAuthMethodSchema
	});
	return result.success ? result.value : void 0;
}
var gatewayAuthMethodSchema = require_dist$2.lazySchema(() => require_dist$2.zodSchema(z$1.union([z$1.literal("api-key"), z$1.literal("oidc")])));
var KNOWN_MODEL_TYPES = [
	"embedding",
	"evaluation",
	"image",
	"language",
	"realtime",
	"reranking",
	"speech",
	"transcription",
	"video"
];
var GatewayFetchMetadata = class {
	constructor(config) {
		this.config = config;
	}
	async getAvailableModels() {
		try {
			const { value } = await require_dist$2.getFromApi({
				url: `${this.config.baseURL}/config`,
				validateUrl: false,
				headers: this.config.headers ? await require_dist$2.resolve(this.config.headers) : void 0,
				successfulResponseHandler: require_dist$2.createJsonResponseHandler(gatewayAvailableModelsResponseSchema),
				failedResponseHandler: require_dist$2.createJsonErrorResponseHandler({
					errorSchema: z$1.any(),
					errorToMessage: (data) => {
						var _a12;
						return (_a12 = require_dist$2.getErrorMessage(data)) != null ? _a12 : "unknown error";
					}
				}),
				fetch: this.config.fetch
			});
			return value;
		} catch (error) {
			throw await asGatewayError(error);
		}
	}
	async getCredits() {
		try {
			const baseUrl = new URL(this.config.baseURL);
			const { value } = await require_dist$2.getFromApi({
				url: `${baseUrl.origin}/v1/credits`,
				validateUrl: false,
				headers: this.config.headers ? await require_dist$2.resolve(this.config.headers) : void 0,
				successfulResponseHandler: require_dist$2.createJsonResponseHandler(gatewayCreditsResponseSchema),
				failedResponseHandler: require_dist$2.createJsonErrorResponseHandler({
					errorSchema: z$1.any(),
					errorToMessage: (data) => {
						var _a12;
						return (_a12 = require_dist$2.getErrorMessage(data)) != null ? _a12 : "unknown error";
					}
				}),
				fetch: this.config.fetch
			});
			return value;
		} catch (error) {
			throw await asGatewayError(error);
		}
	}
};
var gatewayAvailableModelsResponseSchema = require_dist$2.lazySchema(() => require_dist$2.zodSchema(z$1.object({ models: z$1.array(z$1.object({
	id: z$1.string(),
	name: z$1.string(),
	description: z$1.string().nullish(),
	pricing: z$1.object({
		input: z$1.string(),
		output: z$1.string(),
		input_cache_read: z$1.string().nullish(),
		input_cache_write: z$1.string().nullish()
	}).transform(({ input, output, input_cache_read, input_cache_write }) => ({
		input,
		output,
		...input_cache_read ? { cachedInputTokens: input_cache_read } : {},
		...input_cache_write ? { cacheCreationInputTokens: input_cache_write } : {}
	})).nullish(),
	specification: z$1.object({
		specificationVersion: z$1.literal("v4"),
		provider: z$1.string(),
		modelId: z$1.string()
	}),
	modelType: z$1.string().nullish()
})).transform((models) => models.filter((m) => m.modelType == null || KNOWN_MODEL_TYPES.includes(m.modelType))) })));
var gatewayCreditsResponseSchema = require_dist$2.lazySchema(() => require_dist$2.zodSchema(z$1.object({
	balance: z$1.string(),
	total_used: z$1.string()
}).transform(({ balance, total_used }) => ({
	balance,
	totalUsed: total_used
}))));
var GatewaySpendReport = class {
	constructor(config) {
		this.config = config;
	}
	async getSpendReport(params) {
		try {
			const baseUrl = new URL(this.config.baseURL);
			const searchParams = new URLSearchParams();
			searchParams.set("start_date", params.startDate);
			searchParams.set("end_date", params.endDate);
			if (params.groupBy) searchParams.set("group_by", params.groupBy);
			if (params.datePart) searchParams.set("date_part", params.datePart);
			if (params.userId) searchParams.set("user_id", params.userId);
			if (params.model) searchParams.set("model", params.model);
			if (params.provider) searchParams.set("provider", params.provider);
			if (params.credentialType) searchParams.set("credential_type", params.credentialType);
			if (params.tags && params.tags.length > 0) searchParams.set("tags", params.tags.join(","));
			const { value } = await require_dist$2.getFromApi({
				url: `${baseUrl.origin}/v1/report?${searchParams.toString()}`,
				validateUrl: false,
				headers: this.config.headers ? await require_dist$2.resolve(this.config.headers) : void 0,
				successfulResponseHandler: require_dist$2.createJsonResponseHandler(gatewaySpendReportResponseSchema),
				failedResponseHandler: require_dist$2.createJsonErrorResponseHandler({
					errorSchema: z$1.any(),
					errorToMessage: (data) => {
						var _a12;
						return (_a12 = require_dist$2.getErrorMessage(data)) != null ? _a12 : "unknown error";
					}
				}),
				fetch: this.config.fetch
			});
			return value;
		} catch (error) {
			throw await asGatewayError(error);
		}
	}
};
var gatewaySpendReportResponseSchema = require_dist$2.lazySchema(() => require_dist$2.zodSchema(z$1.object({ results: z$1.array(z$1.object({
	day: z$1.string().optional(),
	hour: z$1.string().optional(),
	user: z$1.string().optional(),
	model: z$1.string().optional(),
	tag: z$1.string().optional(),
	provider: z$1.string().optional(),
	credential_type: z$1.enum(["byok", "system"]).optional(),
	total_cost: z$1.number(),
	market_cost: z$1.number().optional(),
	input_tokens: z$1.number().optional(),
	output_tokens: z$1.number().optional(),
	cached_input_tokens: z$1.number().optional(),
	cache_creation_input_tokens: z$1.number().optional(),
	reasoning_tokens: z$1.number().optional(),
	request_count: z$1.number().optional()
}).transform(({ credential_type, total_cost, market_cost, input_tokens, output_tokens, cached_input_tokens, cache_creation_input_tokens, reasoning_tokens, request_count, ...rest }) => ({
	...rest,
	...credential_type !== void 0 ? { credentialType: credential_type } : {},
	totalCost: total_cost,
	...market_cost !== void 0 ? { marketCost: market_cost } : {},
	...input_tokens !== void 0 ? { inputTokens: input_tokens } : {},
	...output_tokens !== void 0 ? { outputTokens: output_tokens } : {},
	...cached_input_tokens !== void 0 ? { cachedInputTokens: cached_input_tokens } : {},
	...cache_creation_input_tokens !== void 0 ? { cacheCreationInputTokens: cache_creation_input_tokens } : {},
	...reasoning_tokens !== void 0 ? { reasoningTokens: reasoning_tokens } : {},
	...request_count !== void 0 ? { requestCount: request_count } : {}
}))) })));
var GatewayGenerationInfoFetcher = class {
	constructor(config) {
		this.config = config;
	}
	async getGenerationInfo(params) {
		try {
			const baseUrl = new URL(this.config.baseURL);
			const { value } = await require_dist$2.getFromApi({
				url: `${baseUrl.origin}/v1/generation?id=${encodeURIComponent(params.id)}`,
				validateUrl: false,
				headers: this.config.headers ? await require_dist$2.resolve(this.config.headers) : void 0,
				successfulResponseHandler: require_dist$2.createJsonResponseHandler(gatewayGenerationInfoResponseSchema),
				failedResponseHandler: require_dist$2.createJsonErrorResponseHandler({
					errorSchema: z$1.any(),
					errorToMessage: (data) => {
						var _a12;
						return (_a12 = require_dist$2.getErrorMessage(data)) != null ? _a12 : "unknown error";
					}
				}),
				fetch: this.config.fetch
			});
			return value;
		} catch (error) {
			throw await asGatewayError(error);
		}
	}
};
var gatewayGenerationInfoResponseSchema = require_dist$2.lazySchema(() => require_dist$2.zodSchema(z$1.object({ data: z$1.object({
	id: z$1.string(),
	total_cost: z$1.number(),
	upstream_inference_cost: z$1.number(),
	usage: z$1.number(),
	created_at: z$1.string(),
	model: z$1.string(),
	is_byok: z$1.boolean(),
	provider_name: z$1.string(),
	streamed: z$1.boolean(),
	finish_reason: z$1.string(),
	latency: z$1.number(),
	generation_time: z$1.number(),
	native_tokens_prompt: z$1.number(),
	native_tokens_completion: z$1.number(),
	native_tokens_reasoning: z$1.number(),
	native_tokens_cached: z$1.number(),
	native_tokens_cache_creation: z$1.number(),
	billable_web_search_calls: z$1.number()
}).transform(({ total_cost, upstream_inference_cost, created_at, is_byok, provider_name, finish_reason, generation_time, native_tokens_prompt, native_tokens_completion, native_tokens_reasoning, native_tokens_cached, native_tokens_cache_creation, billable_web_search_calls, ...rest }) => ({
	...rest,
	totalCost: total_cost,
	upstreamInferenceCost: upstream_inference_cost,
	createdAt: created_at,
	isByok: is_byok,
	providerName: provider_name,
	finishReason: finish_reason,
	generationTime: generation_time,
	promptTokens: native_tokens_prompt,
	completionTokens: native_tokens_completion,
	reasoningTokens: native_tokens_reasoning,
	cachedTokens: native_tokens_cached,
	cacheCreationTokens: native_tokens_cache_creation,
	billableWebSearchCalls: billable_web_search_calls
})) }).transform(({ data }) => data)));
var GatewayBatch = class {
	constructor(config) {
		this.config = config;
		this.specificationVersion = "v4";
		this.supportedUrls = { "*/*": [/.*/] };
		this.provider = `${config.provider}.batch`;
	}
	/**
	* Starts a durable batch of text-generation requests through the Gateway's
	* async batch surface (`POST {baseURL}/batch/start`). The returned
	* `batchId` is the Gateway job id — provider-native batch ids stay
	* server-side, so status and results always route back through the
	* Gateway job.
	*/
	async doStartBatch({ requests, providerOptions, headers, abortSignal, webhookUrl }) {
		var _a12;
		assertTextBatchRequests(requests);
		const modelId = validateSingleModel(requests);
		const resolvedHeaders = this.config.headers ? await require_dist$2.resolve(this.config.headers) : void 0;
		const idempotencyKey = getGatewayBatchIdempotencyKey(providerOptions);
		const forwardedProviderOptions = omitGatewayIdempotencyKey(providerOptions);
		try {
			const { value: responseBody } = await require_dist$2.postJsonToApi({
				url: this.getBatchUrl("start"),
				headers: require_dist$2.combineHeaders(resolvedHeaders, headers, { "ai-model-id": modelId }, await require_dist$2.resolve(this.config.o11yHeaders), idempotencyKey != null ? { "idempotency-key": idempotencyKey } : void 0),
				body: {
					...webhookUrl != null && { callbackUrl: webhookUrl },
					requests: requests.map((request) => ({
						id: request.id,
						type: request.type,
						modelId: request.modelId,
						options: maybeEncodeBatchFileParts(request.options)
					})),
					...forwardedProviderOptions != null && { providerOptions: forwardedProviderOptions }
				},
				successfulResponseHandler: require_dist$2.createJsonResponseHandler(gatewayBatchStartResponseSchema),
				failedResponseHandler: require_dist$2.createJsonErrorResponseHandler({
					errorSchema: z$1.any(),
					errorToMessage: (data) => {
						var _a13;
						return (_a13 = require_dist$2.getErrorMessage(data)) != null ? _a13 : "unknown error";
					}
				}),
				...abortSignal && { abortSignal },
				fetch: this.config.fetch
			});
			return {
				batchId: responseBody.batchId,
				...convertGatewayBatchStatus(responseBody),
				warnings: (_a12 = responseBody.warnings) != null ? _a12 : []
			};
		} catch (error) {
			if (isAbortOrTimeoutError(error)) throw error;
			throw await asGatewayError(error, await parseAuthMethod(resolvedHeaders != null ? resolvedHeaders : {}));
		}
	}
	/**
	* Retrieves the lifecycle status of a Gateway batch job
	* (`POST {baseURL}/batch/status`).
	*/
	async doGetBatchStatus({ batchId, headers, abortSignal }) {
		const resolvedHeaders = this.config.headers ? await require_dist$2.resolve(this.config.headers) : void 0;
		try {
			const { value: responseBody } = await require_dist$2.postJsonToApi({
				url: this.getBatchUrl("status"),
				headers: require_dist$2.combineHeaders(resolvedHeaders, headers, await require_dist$2.resolve(this.config.o11yHeaders)),
				body: { batchId },
				successfulResponseHandler: require_dist$2.createJsonResponseHandler(gatewayBatchStatusResponseSchema),
				failedResponseHandler: require_dist$2.createJsonErrorResponseHandler({
					errorSchema: z$1.any(),
					errorToMessage: (data) => {
						var _a12;
						return (_a12 = require_dist$2.getErrorMessage(data)) != null ? _a12 : "unknown error";
					}
				}),
				...abortSignal && { abortSignal },
				fetch: this.config.fetch
			});
			return convertGatewayBatchStatus(responseBody);
		} catch (error) {
			if (isAbortOrTimeoutError(error)) throw error;
			throw await asGatewayError(error, await parseAuthMethod(resolvedHeaders != null ? resolvedHeaders : {}));
		}
	}
	/**
	* Streams the per-request results of a terminal Gateway batch job
	* (`POST {baseURL}/batch/results`, `application/x-ndjson`: one
	* `BatchV4ItemResult` JSON object per line). Items are validated minimally
	* (id + status) and passed through — the Gateway sanitizes them
	* server-side. The route responds 400 while the batch is non-terminal.
	*/
	async doGetBatchResults({ batchId, headers, abortSignal }) {
		const resolvedHeaders = this.config.headers ? await require_dist$2.resolve(this.config.headers) : void 0;
		try {
			const { value: lines } = await require_dist$2.postJsonToApi({
				url: this.getBatchUrl("results"),
				headers: require_dist$2.combineHeaders(resolvedHeaders, headers, await require_dist$2.resolve(this.config.o11yHeaders)),
				body: { batchId },
				successfulResponseHandler: require_dist$2.createJsonLinesResponseHandler(gatewayBatchItemResultLineSchema),
				failedResponseHandler: require_dist$2.createJsonErrorResponseHandler({
					errorSchema: z$1.any(),
					errorToMessage: (data) => {
						var _a12;
						return (_a12 = require_dist$2.getErrorMessage(data)) != null ? _a12 : "unknown error";
					}
				}),
				...abortSignal && { abortSignal },
				fetch: this.config.fetch
			});
			return require_dist$2.convertAsyncIteratorToReadableStream(convertGatewayBatchResultLines(lines));
		} catch (error) {
			if (isAbortOrTimeoutError(error)) throw error;
			throw await asGatewayError(error, await parseAuthMethod(resolvedHeaders != null ? resolvedHeaders : {}));
		}
	}
	/** Requests cancellation; status and partial results remain separate reads. */
	async doCancelBatch({ batchId, headers, abortSignal }) {
		const resolvedHeaders = this.config.headers ? await require_dist$2.resolve(this.config.headers) : void 0;
		try {
			const { value: responseBody } = await require_dist$2.postJsonToApi({
				url: this.getBatchUrl("cancel"),
				headers: require_dist$2.combineHeaders(resolvedHeaders, headers, await require_dist$2.resolve(this.config.o11yHeaders)),
				body: { batchId },
				successfulResponseHandler: require_dist$2.createJsonResponseHandler(gatewayBatchStatusResponseSchema),
				failedResponseHandler: require_dist$2.createJsonErrorResponseHandler({
					errorSchema: z$1.any(),
					errorToMessage: (data) => {
						var _a12;
						return (_a12 = require_dist$2.getErrorMessage(data)) != null ? _a12 : "unknown error";
					}
				}),
				...abortSignal && { abortSignal },
				fetch: this.config.fetch
			});
			return { ...responseBody.providerMetadata != null && { providerMetadata: responseBody.providerMetadata } };
		} catch (error) {
			if (isAbortOrTimeoutError(error)) throw error;
			throw await asGatewayError(error, await parseAuthMethod(resolvedHeaders != null ? resolvedHeaders : {}));
		}
	}
	getBatchUrl(path) {
		return `${this.config.baseURL}/batch/${path}`;
	}
};
function maybeEncodeBatchFileParts(options) {
	for (const message of options.prompt) {
		if (!Array.isArray(message.content)) continue;
		for (const part of message.content) if (part.type === "file" || part.type === "reasoning-file") part.data = maybeBase64EncodeFileData(part.data);
		else if (part.type === "tool-result" && part.output.type === "content") {
			for (const contentPart of part.output.value) if (contentPart.type === "file") contentPart.data = maybeBase64EncodeFileData(contentPart.data);
		}
	}
	return options;
}
function maybeBase64EncodeFileData(data) {
	if (data.type === "data") {
		const bytes = data.data;
		if (bytes instanceof Uint8Array) return {
			...data,
			data: Buffer.from(bytes).toString("base64")
		};
	}
	return data;
}
function validateSingleModel(requests) {
	var _a12;
	const modelId = (_a12 = requests[0]) == null ? void 0 : _a12.modelId;
	if (modelId == null) throw new require_dist$2.InvalidArgumentError({
		argument: "requests",
		message: "The AI Gateway Batch API requires at least one request."
	});
	for (const request of requests) if (request.modelId !== modelId) throw new require_dist$2.InvalidArgumentError({
		argument: "requests",
		message: `The AI Gateway Batch API requires all requests in a batch to use the same model. Found "${modelId}" and "${request.modelId}".`
	});
	return modelId;
}
function assertTextBatchRequests(requests) {
	for (const request of requests) {
		const requestType = request.type;
		if (requestType !== "text") throw new require_dist$2.UnsupportedFunctionalityError({
			functionality: `batch request type: ${requestType}`,
			message: `The AI Gateway Batch API does not support batch requests with type "${requestType}".`
		});
	}
}
function getGatewayBatchIdempotencyKey(providerOptions) {
	const gatewayOptions = providerOptions == null ? void 0 : providerOptions.gateway;
	if (gatewayOptions == null || typeof gatewayOptions !== "object" || Array.isArray(gatewayOptions)) return;
	const key = gatewayOptions.idempotencyKey;
	return typeof key === "string" && key.length > 0 ? key : void 0;
}
function omitGatewayIdempotencyKey(providerOptions) {
	const gatewayOptions = providerOptions == null ? void 0 : providerOptions.gateway;
	if (gatewayOptions == null || typeof gatewayOptions !== "object" || Array.isArray(gatewayOptions) || !("idempotencyKey" in gatewayOptions)) return providerOptions;
	const { idempotencyKey: _idempotencyKey, ...restGatewayOptions } = gatewayOptions;
	const restProviderOptions = { ...providerOptions };
	if (Object.keys(restGatewayOptions).length === 0) delete restProviderOptions.gateway;
	else restProviderOptions.gateway = restGatewayOptions;
	if (Object.keys(restProviderOptions).length === 0) return;
	return restProviderOptions;
}
function isAbortOrTimeoutError(error) {
	if (!(error instanceof Error || error instanceof DOMException)) return false;
	return error.name === "AbortError" || error.name === "TimeoutError";
}
function convertGatewayBatchStatus(body) {
	var _a12, _b12, _c, _d;
	const requestCounts = require_dist$2.normalizeBatchRequestCounts({
		total: (_a12 = body.requestCounts) == null ? void 0 : _a12.total,
		pending: (_b12 = body.requestCounts) == null ? void 0 : _b12.pending,
		completed: (_c = body.requestCounts) == null ? void 0 : _c.completed,
		failed: (_d = body.requestCounts) == null ? void 0 : _d.failed
	});
	return {
		status: body.status,
		...body.rawStatus != null && { rawStatus: body.rawStatus },
		...requestCounts != null && { requestCounts },
		...body.error != null && { error: {
			message: body.error.message,
			...body.error.type != null && { type: body.error.type },
			...body.error.code != null && { code: body.error.code },
			...body.error.statusCode != null && { statusCode: body.error.statusCode }
		} },
		...body.createdAt != null && { createdAt: body.createdAt },
		...body.expiresAt != null && { expiresAt: body.expiresAt },
		...body.providerMetadata != null && { providerMetadata: body.providerMetadata }
	};
}
async function* convertGatewayBatchResultLines(lines) {
	var _a12;
	for await (const line of lines) {
		const item = line;
		if (item.status === "succeeded") {
			const response = (_a12 = item.result) == null ? void 0 : _a12.response;
			if (response !== void 0 && typeof response.timestamp === "string") response.timestamp = new Date(response.timestamp);
		}
		yield item;
	}
}
var gatewayBatchItemResultLineSchema = z$1.object({
	type: z$1.literal("text"),
	id: z$1.string(),
	status: z$1.enum([
		"cancelled",
		"expired",
		"failed",
		"succeeded"
	])
}).catchall(z$1.unknown());
var gatewayBatchErrorSchema = z$1.object({
	message: z$1.string(),
	type: z$1.string().nullish(),
	code: z$1.string().nullish(),
	statusCode: z$1.number().nullish()
});
var gatewayBatchRequestCountsSchema = z$1.object({
	total: z$1.number().nullish(),
	pending: z$1.number().nullish(),
	completed: z$1.number().nullish(),
	failed: z$1.number().nullish()
});
var gatewayBatchProviderMetadataSchema = z$1.record(z$1.string(), z$1.record(z$1.string(), z$1.unknown()));
var gatewayBatchStatusFieldsSchema = z$1.object({
	status: z$1.enum([
		"completed",
		"failed",
		"pending"
	]),
	rawStatus: z$1.string().nullish(),
	requestCounts: gatewayBatchRequestCountsSchema.nullish(),
	error: gatewayBatchErrorSchema.nullish(),
	createdAt: z$1.string().nullish(),
	expiresAt: z$1.string().nullish(),
	providerMetadata: gatewayBatchProviderMetadataSchema.nullish()
});
var gatewayBatchStartResponseSchema = gatewayBatchStatusFieldsSchema.extend({
	batchId: z$1.string(),
	warnings: z$1.array(z$1.object({
		requestId: z$1.string().nullish(),
		warning: z$1.unknown()
	}).catchall(z$1.unknown())).nullish()
});
var gatewayBatchStatusResponseSchema = gatewayBatchStatusFieldsSchema;
var GatewayLanguageModel = class _GatewayLanguageModel {
	constructor(modelId, config) {
		this.modelId = modelId;
		this.config = config;
		this.specificationVersion = "v4";
		this.supportedUrls = { "*/*": [/.*/] };
	}
	static [WORKFLOW_SERIALIZE](model) {
		return require_dist$2.serializeModelOptions({
			modelId: model.modelId,
			config: model.config
		});
	}
	static [WORKFLOW_DESERIALIZE](options) {
		return new _GatewayLanguageModel(options.modelId, options.config);
	}
	get provider() {
		return this.config.provider;
	}
	async getArgs(options) {
		const { abortSignal: _abortSignal, ...optionsWithoutSignal } = options;
		return {
			args: this.maybeEncodeFileParts(optionsWithoutSignal),
			warnings: []
		};
	}
	async doGenerate(options) {
		var _a12;
		const { args, warnings } = await this.getArgs(options);
		const { abortSignal } = options;
		const resolvedHeaders = this.config.headers ? await require_dist$2.resolve(this.config.headers) : void 0;
		try {
			const { responseHeaders, value: responseBody, rawValue: rawResponse } = await require_dist$2.postJsonToApi({
				url: this.getUrl(),
				headers: require_dist$2.combineHeaders(resolvedHeaders, options.headers, this.getModelConfigHeaders(this.modelId, false), await require_dist$2.resolve(this.config.o11yHeaders)),
				body: args,
				successfulResponseHandler: require_dist$2.createJsonResponseHandler(z$1.any()),
				failedResponseHandler: require_dist$2.createJsonErrorResponseHandler({
					errorSchema: z$1.any(),
					errorToMessage: (data) => {
						var _a13;
						return (_a13 = require_dist$2.getErrorMessage(data)) != null ? _a13 : "unknown error";
					}
				}),
				...abortSignal && { abortSignal },
				fetch: this.config.fetch
			});
			return {
				...responseBody,
				request: { body: args },
				response: {
					headers: responseHeaders,
					body: rawResponse
				},
				warnings: [...(_a12 = responseBody.warnings) != null ? _a12 : [], ...warnings]
			};
		} catch (error) {
			throw await asGatewayError(error, await parseAuthMethod(resolvedHeaders != null ? resolvedHeaders : {}));
		}
	}
	async doStream(options) {
		const { args, warnings } = await this.getArgs(options);
		const { abortSignal } = options;
		const resolvedHeaders = this.config.headers ? await require_dist$2.resolve(this.config.headers) : void 0;
		try {
			const { value: response, responseHeaders } = await require_dist$2.postJsonToApi({
				url: this.getUrl(),
				headers: require_dist$2.combineHeaders(resolvedHeaders, options.headers, this.getModelConfigHeaders(this.modelId, true), await require_dist$2.resolve(this.config.o11yHeaders)),
				body: args,
				successfulResponseHandler: require_dist$2.createEventSourceResponseHandler(z$1.any()),
				failedResponseHandler: require_dist$2.createJsonErrorResponseHandler({
					errorSchema: z$1.any(),
					errorToMessage: (data) => {
						var _a12;
						return (_a12 = require_dist$2.getErrorMessage(data)) != null ? _a12 : "unknown error";
					}
				}),
				...abortSignal && { abortSignal },
				fetch: this.config.fetch
			});
			return {
				stream: response.pipeThrough(new TransformStream({
					start(controller) {
						if (warnings.length > 0) controller.enqueue({
							type: "stream-start",
							warnings
						});
					},
					transform(chunk, controller) {
						if (chunk.success) {
							const streamPart = chunk.value;
							if (streamPart.type === "raw" && !options.includeRawChunks) return;
							if (streamPart.type === "response-metadata" && streamPart.timestamp && typeof streamPart.timestamp === "string") streamPart.timestamp = new Date(streamPart.timestamp);
							controller.enqueue(streamPart);
						} else controller.error(chunk.error);
					}
				})),
				request: { body: args },
				response: { headers: responseHeaders }
			};
		} catch (error) {
			throw await asGatewayError(error, await parseAuthMethod(resolvedHeaders != null ? resolvedHeaders : {}));
		}
	}
	/**
	* Encodes inline `Uint8Array` file data to a base64 string in place.
	* @param options - The options to encode.
	* @returns The options with the file data encoded.
	*/
	maybeEncodeFileParts(options) {
		for (const message of options.prompt) {
			if (!Array.isArray(message.content)) continue;
			for (const part of message.content) if (part.type === "file" || part.type === "reasoning-file") part.data = maybeBase64EncodeFileData2(part.data);
			else if (part.type === "tool-result" && part.output.type === "content") {
				for (const contentPart of part.output.value) if (contentPart.type === "file") contentPart.data = maybeBase64EncodeFileData2(contentPart.data);
			}
		}
		return options;
	}
	getUrl() {
		return `${this.config.baseURL}/language-model`;
	}
	getModelConfigHeaders(modelId, streaming) {
		return {
			"ai-language-model-specification-version": "4",
			"ai-language-model-id": modelId,
			"ai-language-model-streaming": String(streaming)
		};
	}
};
function maybeBase64EncodeFileData2(data) {
	if (data.type === "data") {
		const bytes = data.data;
		if (bytes instanceof Uint8Array) return {
			...data,
			data: Buffer.from(bytes).toString("base64")
		};
	}
	return data;
}
var GatewayEmbeddingModel = class _GatewayEmbeddingModel {
	constructor(modelId, config) {
		this.modelId = modelId;
		this.config = config;
		this.specificationVersion = "v4";
		this.maxEmbeddingsPerCall = 2048;
		this.supportsParallelCalls = true;
	}
	static [WORKFLOW_SERIALIZE](model) {
		return require_dist$2.serializeModelOptions({
			modelId: model.modelId,
			config: model.config
		});
	}
	static [WORKFLOW_DESERIALIZE](options) {
		return new _GatewayEmbeddingModel(options.modelId, options.config);
	}
	get provider() {
		return this.config.provider;
	}
	async doEmbed({ values, headers, abortSignal, providerOptions }) {
		var _a12, _b12;
		const resolvedHeaders = this.config.headers ? await require_dist$2.resolve(this.config.headers) : void 0;
		try {
			const { responseHeaders, value: responseBody, rawValue } = await require_dist$2.postJsonToApi({
				url: this.getUrl(),
				headers: require_dist$2.combineHeaders(resolvedHeaders, headers != null ? headers : {}, this.getModelConfigHeaders(), await require_dist$2.resolve(this.config.o11yHeaders)),
				body: {
					values,
					...providerOptions ? { providerOptions } : {}
				},
				successfulResponseHandler: require_dist$2.createJsonResponseHandler(gatewayEmbeddingResponseSchema),
				failedResponseHandler: require_dist$2.createJsonErrorResponseHandler({
					errorSchema: z$1.any(),
					errorToMessage: (data) => {
						var _a13;
						return (_a13 = require_dist$2.getErrorMessage(data)) != null ? _a13 : "unknown error";
					}
				}),
				...abortSignal && { abortSignal },
				fetch: this.config.fetch
			});
			return {
				embeddings: responseBody.embeddings,
				usage: (_a12 = responseBody.usage) != null ? _a12 : void 0,
				providerMetadata: responseBody.providerMetadata,
				response: {
					headers: responseHeaders,
					body: rawValue
				},
				warnings: (_b12 = responseBody.warnings) != null ? _b12 : []
			};
		} catch (error) {
			throw await asGatewayError(error, await parseAuthMethod(resolvedHeaders != null ? resolvedHeaders : {}));
		}
	}
	getUrl() {
		return `${this.config.baseURL}/embedding-model`;
	}
	getModelConfigHeaders() {
		return {
			"ai-embedding-model-specification-version": "4",
			"ai-model-id": this.modelId
		};
	}
};
var gatewayEmbeddingWarningSchema = z$1.discriminatedUnion("type", [
	z$1.object({
		type: z$1.literal("unsupported"),
		feature: z$1.string(),
		details: z$1.string().optional()
	}),
	z$1.object({
		type: z$1.literal("compatibility"),
		feature: z$1.string(),
		details: z$1.string().optional()
	}),
	z$1.object({
		type: z$1.literal("deprecated"),
		setting: z$1.string(),
		message: z$1.string()
	}),
	z$1.object({
		type: z$1.literal("other"),
		message: z$1.string()
	})
]);
var gatewayEmbeddingResponseSchema = require_dist$2.lazySchema(() => require_dist$2.zodSchema(z$1.object({
	embeddings: z$1.array(z$1.array(z$1.number())),
	usage: z$1.object({ tokens: z$1.number() }).nullish(),
	warnings: z$1.array(gatewayEmbeddingWarningSchema).optional(),
	providerMetadata: z$1.record(z$1.string(), z$1.record(z$1.string(), z$1.unknown())).optional()
})));
var GatewayImageModel = class _GatewayImageModel {
	constructor(modelId, config) {
		this.modelId = modelId;
		this.config = config;
		this.specificationVersion = "v4";
		this.maxImagesPerCall = Number.MAX_SAFE_INTEGER;
	}
	static [WORKFLOW_SERIALIZE](model) {
		return require_dist$2.serializeModelOptions({
			modelId: model.modelId,
			config: model.config
		});
	}
	static [WORKFLOW_DESERIALIZE](options) {
		return new _GatewayImageModel(options.modelId, options.config);
	}
	get provider() {
		return this.config.provider;
	}
	async doGenerate({ prompt, n, size, aspectRatio, seed, files, mask, providerOptions, headers, abortSignal }) {
		var _a12, _b12, _c, _d;
		const resolvedHeaders = this.config.headers ? await require_dist$2.resolve(this.config.headers) : void 0;
		try {
			const { responseHeaders, value: responseBody } = await require_dist$2.postJsonToApi({
				url: this.getUrl(),
				headers: require_dist$2.combineHeaders(resolvedHeaders, headers != null ? headers : {}, this.getModelConfigHeaders(), await require_dist$2.resolve(this.config.o11yHeaders)),
				body: {
					prompt,
					n,
					...size && { size },
					...aspectRatio && { aspectRatio },
					...seed && { seed },
					...providerOptions && { providerOptions },
					...files && { files: files.map((file) => maybeEncodeImageFile(file)) },
					...mask && { mask: maybeEncodeImageFile(mask) }
				},
				successfulResponseHandler: require_dist$2.createJsonResponseHandler(gatewayImageResponseSchema),
				failedResponseHandler: require_dist$2.createJsonErrorResponseHandler({
					errorSchema: z$1.any(),
					errorToMessage: (data) => {
						var _a13;
						return (_a13 = require_dist$2.getErrorMessage(data)) != null ? _a13 : "unknown error";
					}
				}),
				...abortSignal && { abortSignal },
				fetch: this.config.fetch
			});
			return {
				images: responseBody.images,
				...responseBody.isRetryable != null && { isRetryable: responseBody.isRetryable },
				warnings: (_a12 = responseBody.warnings) != null ? _a12 : [],
				providerMetadata: responseBody.providerMetadata,
				response: {
					timestamp: /* @__PURE__ */ new Date(),
					modelId: this.modelId,
					headers: responseHeaders
				},
				...responseBody.usage != null && { usage: {
					inputTokens: (_b12 = responseBody.usage.inputTokens) != null ? _b12 : void 0,
					outputTokens: (_c = responseBody.usage.outputTokens) != null ? _c : void 0,
					totalTokens: (_d = responseBody.usage.totalTokens) != null ? _d : void 0
				} }
			};
		} catch (error) {
			throw await asGatewayError(error, await parseAuthMethod(resolvedHeaders != null ? resolvedHeaders : {}));
		}
	}
	getUrl() {
		return `${this.config.baseURL}/image-model`;
	}
	getModelConfigHeaders() {
		return {
			"ai-image-model-specification-version": "4",
			"ai-model-id": this.modelId
		};
	}
};
function maybeEncodeImageFile(file) {
	if (file.type === "file" && file.data instanceof Uint8Array) return {
		...file,
		data: require_dist$2.convertUint8ArrayToBase64(file.data)
	};
	return file;
}
var providerMetadataEntrySchema = z$1.object({ images: z$1.array(z$1.unknown()).optional() }).catchall(z$1.unknown());
var gatewayImageWarningSchema = z$1.discriminatedUnion("type", [
	z$1.object({
		type: z$1.literal("unsupported"),
		feature: z$1.string(),
		details: z$1.string().optional()
	}),
	z$1.object({
		type: z$1.literal("compatibility"),
		feature: z$1.string(),
		details: z$1.string().optional()
	}),
	z$1.object({
		type: z$1.literal("deprecated"),
		setting: z$1.string(),
		message: z$1.string()
	}),
	z$1.object({
		type: z$1.literal("other"),
		message: z$1.string()
	})
]);
var gatewayImageUsageSchema = z$1.object({
	inputTokens: z$1.number().nullish(),
	outputTokens: z$1.number().nullish(),
	totalTokens: z$1.number().nullish()
});
var gatewayImageResponseSchema = z$1.object({
	images: z$1.array(z$1.string()),
	isRetryable: z$1.boolean().optional(),
	warnings: z$1.array(gatewayImageWarningSchema).optional(),
	providerMetadata: z$1.record(z$1.string(), providerMetadataEntrySchema).optional(),
	usage: gatewayImageUsageSchema.optional()
});
var GatewayVideoModel = class {
	constructor(modelId, config) {
		this.modelId = modelId;
		this.config = config;
		this.specificationVersion = "v4";
		this.maxVideosPerCall = Number.MAX_SAFE_INTEGER;
	}
	get provider() {
		return this.config.provider;
	}
	async doGenerate(options) {
		var _a12, _b12;
		const { headers, abortSignal } = options;
		const resolvedHeaders = this.config.headers ? await require_dist$2.resolve(this.config.headers) : void 0;
		try {
			const { responseHeaders, value: responseBody } = await require_dist$2.postJsonToApi({
				url: this.getUrl(),
				headers: require_dist$2.combineHeaders(resolvedHeaders, headers != null ? headers : {}, this.getModelConfigHeaders(), await require_dist$2.resolve(this.config.o11yHeaders), { accept: "text/event-stream" }),
				body: this.buildRequestBody(options),
				successfulResponseHandler: async ({ response, url, requestBodyValues }) => {
					if (response.body == null) throw new require_dist$2.APICallError({
						message: "SSE response body is empty",
						url,
						requestBodyValues,
						statusCode: response.status
					});
					const reader = require_dist$2.parseJsonEventStream({
						stream: response.body,
						schema: gatewayVideoEventSchema
					}).getReader();
					const { done, value: parseResult } = await reader.read();
					reader.releaseLock();
					if (done || !parseResult) throw new require_dist$2.APICallError({
						message: "SSE stream ended without a data event",
						url,
						requestBodyValues,
						statusCode: response.status
					});
					if (!parseResult.success) throw new require_dist$2.APICallError({
						message: "Failed to parse video SSE event",
						cause: parseResult.error,
						url,
						requestBodyValues,
						statusCode: response.status
					});
					const event = parseResult.value;
					if (event.type === "error") throw new require_dist$2.APICallError({
						message: event.message,
						statusCode: event.statusCode,
						url,
						requestBodyValues,
						responseHeaders: Object.fromEntries([...response.headers]),
						responseBody: JSON.stringify(event),
						data: { error: {
							message: event.message,
							type: event.errorType,
							param: event.param
						} }
					});
					return {
						value: {
							videos: event.videos,
							warnings: event.warnings,
							providerMetadata: event.providerMetadata
						},
						responseHeaders: Object.fromEntries([...response.headers])
					};
				},
				failedResponseHandler: require_dist$2.createJsonErrorResponseHandler({
					errorSchema: z$1.any(),
					errorToMessage: (data) => {
						var _a13;
						return (_a13 = require_dist$2.getErrorMessage(data)) != null ? _a13 : "unknown error";
					}
				}),
				...abortSignal && { abortSignal },
				fetch: this.config.fetch
			});
			return {
				videos: responseBody.videos,
				warnings: (_a12 = responseBody.warnings) != null ? _a12 : [],
				providerMetadata: (_b12 = responseBody.providerMetadata) != null ? _b12 : void 0,
				response: {
					timestamp: /* @__PURE__ */ new Date(),
					modelId: this.modelId,
					headers: responseHeaders
				}
			};
		} catch (error) {
			throw await asGatewayError(error, await parseAuthMethod(resolvedHeaders != null ? resolvedHeaders : {}));
		}
	}
	async handleWebhookOption({ webhook }) {
		const { url, received } = await webhook();
		return {
			webhookUrl: url,
			received
		};
	}
	async doStart(options) {
		var _a12, _b12;
		const { headers, abortSignal, webhookUrl } = options;
		const resolvedHeaders = this.config.headers ? await require_dist$2.resolve(this.config.headers) : void 0;
		try {
			const { responseHeaders, value: responseBody } = await require_dist$2.postJsonToApi({
				url: this.getStartUrl(),
				headers: require_dist$2.combineHeaders(resolvedHeaders, headers != null ? headers : {}, this.getModelConfigHeaders(), await require_dist$2.resolve(this.config.o11yHeaders)),
				body: {
					...this.buildRequestBody(options),
					...webhookUrl && { callbackUrl: webhookUrl }
				},
				successfulResponseHandler: require_dist$2.createJsonResponseHandler(gatewayVideoStartResponseSchema),
				failedResponseHandler: require_dist$2.createJsonErrorResponseHandler({
					errorSchema: z$1.any(),
					errorToMessage: (data) => {
						var _a13;
						return (_a13 = require_dist$2.getErrorMessage(data)) != null ? _a13 : "unknown error";
					}
				}),
				...abortSignal && { abortSignal },
				fetch: this.config.fetch
			});
			return {
				operation: responseBody.operation,
				warnings: (_a12 = responseBody.warnings) != null ? _a12 : [],
				providerMetadata: (_b12 = responseBody.providerMetadata) != null ? _b12 : void 0,
				response: {
					timestamp: /* @__PURE__ */ new Date(),
					modelId: this.modelId,
					headers: responseHeaders
				}
			};
		} catch (error) {
			throw await asGatewayError(error, await parseAuthMethod(resolvedHeaders != null ? resolvedHeaders : {}));
		}
	}
	async doStatus({ operation, abortSignal, headers }) {
		var _a12, _b12, _c, _d, _e, _f;
		const resolvedHeaders = this.config.headers ? await require_dist$2.resolve(this.config.headers) : void 0;
		try {
			const { responseHeaders, value: responseBody } = await require_dist$2.postJsonToApi({
				url: this.getStatusUrl(),
				headers: require_dist$2.combineHeaders(resolvedHeaders, headers != null ? headers : {}, this.getModelConfigHeaders(), await require_dist$2.resolve(this.config.o11yHeaders)),
				body: { operation },
				successfulResponseHandler: require_dist$2.createJsonResponseHandler(gatewayVideoStatusResponseSchema),
				failedResponseHandler: require_dist$2.createJsonErrorResponseHandler({
					errorSchema: z$1.any(),
					errorToMessage: (data) => {
						var _a13;
						return (_a13 = require_dist$2.getErrorMessage(data)) != null ? _a13 : "unknown error";
					}
				}),
				...abortSignal && { abortSignal },
				fetch: this.config.fetch
			});
			const response = {
				timestamp: /* @__PURE__ */ new Date(),
				modelId: this.modelId,
				headers: responseHeaders
			};
			if (responseBody.status === "completed") return {
				status: "completed",
				videos: responseBody.videos,
				warnings: (_a12 = responseBody.warnings) != null ? _a12 : [],
				providerMetadata: (_b12 = responseBody.providerMetadata) != null ? _b12 : void 0,
				response
			};
			if (responseBody.status === "error") return {
				status: "error",
				error: responseBody.error,
				providerMetadata: (_c = responseBody.providerMetadata) != null ? _c : void 0,
				response
			};
			if (responseBody.status === "cancelled") return {
				status: "error",
				error: "Video generation was cancelled.",
				providerMetadata: (_d = responseBody.providerMetadata) != null ? _d : void 0,
				response
			};
			return {
				status: "pending",
				warnings: (_e = responseBody.warnings) != null ? _e : [],
				providerMetadata: (_f = responseBody.providerMetadata) != null ? _f : void 0,
				response
			};
		} catch (error) {
			throw await asGatewayError(error, await parseAuthMethod(resolvedHeaders != null ? resolvedHeaders : {}));
		}
	}
	buildRequestBody({ prompt, n, aspectRatio, resolution, duration, fps, seed, generateAudio, image, frameImages, inputReferences, providerOptions }) {
		return {
			prompt,
			n,
			...aspectRatio && { aspectRatio },
			...resolution && { resolution },
			...duration && { duration },
			...fps && { fps },
			...seed && { seed },
			...generateAudio !== void 0 && { generateAudio },
			...providerOptions && { providerOptions },
			...image && { image: maybeEncodeVideoFile(image) },
			...frameImages && { frameImages: frameImages.map((frame) => ({
				...frame,
				image: maybeEncodeVideoFile(frame.image)
			})) },
			...inputReferences && { inputReferences: inputReferences.map((reference) => maybeEncodeVideoFile(reference)) }
		};
	}
	getUrl() {
		return `${this.config.baseURL}/video-model`;
	}
	getStartUrl() {
		return `${this.config.baseURL}/video-model/start`;
	}
	getStatusUrl() {
		return `${this.config.baseURL}/video-model/status`;
	}
	getModelConfigHeaders() {
		return {
			"ai-video-model-specification-version": "4",
			"ai-model-id": this.modelId
		};
	}
};
function maybeEncodeVideoFile(file) {
	if (file.type === "file" && file.data instanceof Uint8Array) return {
		...file,
		data: require_dist$2.convertUint8ArrayToBase64(file.data)
	};
	return file;
}
var providerMetadataEntrySchema2 = z$1.object({ videos: z$1.array(z$1.unknown()).optional() }).catchall(z$1.unknown());
var gatewayVideoDataSchema = z$1.union([z$1.object({
	type: z$1.literal("url"),
	url: z$1.string(),
	mediaType: z$1.string()
}), z$1.object({
	type: z$1.literal("base64"),
	data: z$1.string(),
	mediaType: z$1.string()
})]);
var gatewayVideoWarningSchema = z$1.discriminatedUnion("type", [
	z$1.object({
		type: z$1.literal("unsupported"),
		feature: z$1.string(),
		details: z$1.string().optional()
	}),
	z$1.object({
		type: z$1.literal("compatibility"),
		feature: z$1.string(),
		details: z$1.string().optional()
	}),
	z$1.object({
		type: z$1.literal("deprecated"),
		setting: z$1.string(),
		message: z$1.string()
	}),
	z$1.object({
		type: z$1.literal("other"),
		message: z$1.string()
	})
]);
var gatewayVideoEventSchema = z$1.discriminatedUnion("type", [z$1.object({
	type: z$1.literal("result"),
	videos: z$1.array(gatewayVideoDataSchema),
	warnings: z$1.array(gatewayVideoWarningSchema).optional(),
	providerMetadata: z$1.record(z$1.string(), providerMetadataEntrySchema2).optional()
}), z$1.object({
	type: z$1.literal("error"),
	message: z$1.string(),
	errorType: z$1.string(),
	statusCode: z$1.number(),
	param: z$1.unknown().nullable()
})]);
var gatewayVideoStartResponseSchema = z$1.object({
	operation: z$1.unknown(),
	warnings: z$1.array(gatewayVideoWarningSchema).nullish(),
	providerMetadata: z$1.record(z$1.string(), providerMetadataEntrySchema2).nullish()
});
var gatewayVideoStatusResponseSchema = z$1.discriminatedUnion("status", [
	z$1.object({
		status: z$1.literal("pending"),
		warnings: z$1.array(gatewayVideoWarningSchema).nullish(),
		providerMetadata: z$1.record(z$1.string(), providerMetadataEntrySchema2).nullish()
	}),
	z$1.object({
		status: z$1.literal("completed"),
		videos: z$1.array(gatewayVideoDataSchema),
		warnings: z$1.array(gatewayVideoWarningSchema).nullish(),
		providerMetadata: z$1.record(z$1.string(), providerMetadataEntrySchema2).nullish()
	}),
	z$1.object({
		status: z$1.literal("error"),
		error: z$1.string(),
		providerMetadata: z$1.record(z$1.string(), providerMetadataEntrySchema2).nullish()
	}),
	z$1.object({
		status: z$1.literal("cancelled"),
		providerMetadata: z$1.record(z$1.string(), providerMetadataEntrySchema2).nullish()
	})
]);
var GatewayEvaluationModel = class {
	constructor(modelId, config) {
		this.modelId = modelId;
		this.config = config;
		this.specificationVersion = "v4";
		this.supportedQuestionTypes = [
			"choice",
			"score",
			"boolean"
		];
	}
	get provider() {
		return this.config.provider;
	}
	async doEvaluate({ state, questions, headers, abortSignal, providerOptions }) {
		var _a12;
		const resolvedHeaders = this.config.headers ? await require_dist$2.resolve(this.config.headers) : void 0;
		try {
			const { responseHeaders, value: responseBody, rawValue } = await require_dist$2.postJsonToApi({
				url: this.getUrl(),
				headers: require_dist$2.combineHeaders(resolvedHeaders, headers != null ? headers : {}, this.getModelConfigHeaders(), await require_dist$2.resolve(this.config.o11yHeaders)),
				body: {
					state,
					questions,
					...providerOptions ? { providerOptions } : {}
				},
				successfulResponseHandler: require_dist$2.createJsonResponseHandler(gatewayEvaluationResponseSchema),
				failedResponseHandler: require_dist$2.createJsonErrorResponseHandler({
					errorSchema: z$1.any(),
					errorToMessage: (data) => {
						var _a13;
						return (_a13 = require_dist$2.getErrorMessage(data)) != null ? _a13 : "unknown error";
					}
				}),
				...abortSignal && { abortSignal },
				fetch: this.config.fetch
			});
			return {
				answers: responseBody.answers,
				...responseBody.rounding ? { rounding: responseBody.rounding } : {},
				...responseBody.usage ? { usage: responseBody.usage } : {},
				warnings: (_a12 = responseBody.warnings) != null ? _a12 : [],
				providerMetadata: responseBody.providerMetadata,
				response: {
					modelId: this.modelId,
					headers: responseHeaders,
					body: rawValue
				}
			};
		} catch (error) {
			throw await asGatewayError(error, await parseAuthMethod(resolvedHeaders != null ? resolvedHeaders : {}));
		}
	}
	getUrl() {
		return `${this.config.baseURL}/evaluation-model`;
	}
	getModelConfigHeaders() {
		return {
			"ai-evaluation-model-specification-version": "4",
			"ai-model-id": this.modelId
		};
	}
};
var gatewayEvaluationAnswerSchema = z$1.discriminatedUnion("type", [
	z$1.object({
		type: z$1.literal("choice"),
		choice: z$1.string(),
		probabilities: z$1.record(z$1.string(), z$1.number()).optional()
	}),
	z$1.object({
		type: z$1.literal("score"),
		score: z$1.number(),
		probabilities: z$1.record(z$1.string(), z$1.number()).optional()
	}),
	z$1.object({
		type: z$1.literal("boolean"),
		probability: z$1.number()
	})
]);
var gatewayEvaluationWarningSchema = z$1.discriminatedUnion("type", [
	z$1.object({
		type: z$1.literal("unsupported"),
		feature: z$1.string(),
		details: z$1.string().optional()
	}),
	z$1.object({
		type: z$1.literal("compatibility"),
		feature: z$1.string(),
		details: z$1.string().optional()
	}),
	z$1.object({
		type: z$1.literal("deprecated"),
		setting: z$1.string(),
		message: z$1.string()
	}),
	z$1.object({
		type: z$1.literal("other"),
		message: z$1.string()
	})
]);
var gatewayEvaluationResponseSchema = require_dist$2.lazySchema(() => require_dist$2.zodSchema(z$1.object({
	answers: z$1.record(z$1.string(), gatewayEvaluationAnswerSchema),
	rounding: z$1.object({
		probabilityDecimals: z$1.number().optional(),
		scoreDecimals: z$1.number().optional()
	}).optional(),
	usage: z$1.object({
		inputTokens: z$1.number().optional(),
		outputTokens: z$1.number().optional()
	}).optional(),
	warnings: z$1.array(gatewayEvaluationWarningSchema).optional(),
	providerMetadata: z$1.record(z$1.string(), z$1.record(z$1.string(), z$1.unknown())).optional()
})));
var GatewayRerankingModel = class {
	constructor(modelId, config) {
		this.modelId = modelId;
		this.config = config;
		this.specificationVersion = "v4";
	}
	get provider() {
		return this.config.provider;
	}
	async doRerank({ documents, query, topN, headers, abortSignal, providerOptions }) {
		var _a12;
		const resolvedHeaders = this.config.headers ? await require_dist$2.resolve(this.config.headers) : void 0;
		try {
			const { responseHeaders, value: responseBody, rawValue } = await require_dist$2.postJsonToApi({
				url: this.getUrl(),
				headers: require_dist$2.combineHeaders(resolvedHeaders, headers != null ? headers : {}, this.getModelConfigHeaders(), await require_dist$2.resolve(this.config.o11yHeaders)),
				body: {
					documents,
					query,
					...topN != null ? { topN } : {},
					...providerOptions ? { providerOptions } : {}
				},
				successfulResponseHandler: require_dist$2.createJsonResponseHandler(gatewayRerankingResponseSchema),
				failedResponseHandler: require_dist$2.createJsonErrorResponseHandler({
					errorSchema: z$1.any(),
					errorToMessage: (data) => {
						var _a13;
						return (_a13 = require_dist$2.getErrorMessage(data)) != null ? _a13 : "unknown error";
					}
				}),
				...abortSignal && { abortSignal },
				fetch: this.config.fetch
			});
			return {
				ranking: responseBody.ranking,
				providerMetadata: responseBody.providerMetadata,
				response: {
					headers: responseHeaders,
					body: rawValue
				},
				warnings: (_a12 = responseBody.warnings) != null ? _a12 : []
			};
		} catch (error) {
			throw await asGatewayError(error, await parseAuthMethod(resolvedHeaders != null ? resolvedHeaders : {}));
		}
	}
	getUrl() {
		return `${this.config.baseURL}/reranking-model`;
	}
	getModelConfigHeaders() {
		return {
			"ai-reranking-model-specification-version": "4",
			"ai-model-id": this.modelId
		};
	}
};
var gatewayRerankingWarningSchema = z$1.discriminatedUnion("type", [
	z$1.object({
		type: z$1.literal("unsupported"),
		feature: z$1.string(),
		details: z$1.string().optional()
	}),
	z$1.object({
		type: z$1.literal("compatibility"),
		feature: z$1.string(),
		details: z$1.string().optional()
	}),
	z$1.object({
		type: z$1.literal("deprecated"),
		setting: z$1.string(),
		message: z$1.string()
	}),
	z$1.object({
		type: z$1.literal("other"),
		message: z$1.string()
	})
]);
var gatewayRerankingResponseSchema = require_dist$2.lazySchema(() => require_dist$2.zodSchema(z$1.object({
	ranking: z$1.array(z$1.object({
		index: z$1.number(),
		relevanceScore: z$1.number()
	})),
	warnings: z$1.array(gatewayRerankingWarningSchema).optional(),
	providerMetadata: z$1.record(z$1.string(), z$1.record(z$1.string(), z$1.unknown())).optional()
})));
var GatewaySpeechModel = class {
	constructor(modelId, config) {
		this.modelId = modelId;
		this.config = config;
		this.specificationVersion = "v4";
	}
	get provider() {
		return this.config.provider;
	}
	async doGenerate({ text, voice, outputFormat, instructions, speed, language, providerOptions, headers, abortSignal }) {
		var _a12;
		const resolvedHeaders = this.config.headers ? await require_dist$2.resolve(this.config.headers) : void 0;
		try {
			const { responseHeaders, value: responseBody, rawValue } = await require_dist$2.postJsonToApi({
				url: this.getUrl(),
				headers: require_dist$2.combineHeaders(resolvedHeaders, headers != null ? headers : {}, this.getModelConfigHeaders(), await require_dist$2.resolve(this.config.o11yHeaders)),
				body: {
					text,
					...voice && { voice },
					...outputFormat && { outputFormat },
					...instructions && { instructions },
					...speed != null && { speed },
					...language && { language },
					...providerOptions && { providerOptions }
				},
				successfulResponseHandler: require_dist$2.createJsonResponseHandler(gatewaySpeechResponseSchema),
				failedResponseHandler: require_dist$2.createJsonErrorResponseHandler({
					errorSchema: z$1.any(),
					errorToMessage: (data) => {
						var _a13;
						return (_a13 = require_dist$2.getErrorMessage(data)) != null ? _a13 : "unknown error";
					}
				}),
				...abortSignal && { abortSignal },
				fetch: this.config.fetch
			});
			return {
				audio: responseBody.audio,
				warnings: (_a12 = responseBody.warnings) != null ? _a12 : [],
				providerMetadata: responseBody.providerMetadata,
				response: {
					timestamp: /* @__PURE__ */ new Date(),
					modelId: this.modelId,
					headers: responseHeaders,
					body: rawValue
				}
			};
		} catch (error) {
			throw await asGatewayError(error, await parseAuthMethod(resolvedHeaders != null ? resolvedHeaders : {}));
		}
	}
	getUrl() {
		return `${this.config.baseURL}/speech-model`;
	}
	getModelConfigHeaders() {
		return {
			"ai-speech-model-specification-version": "4",
			"ai-model-id": this.modelId
		};
	}
};
var providerMetadataEntrySchema3 = z$1.object({}).catchall(z$1.unknown());
var gatewaySpeechWarningSchema = z$1.discriminatedUnion("type", [
	z$1.object({
		type: z$1.literal("unsupported"),
		feature: z$1.string(),
		details: z$1.string().optional()
	}),
	z$1.object({
		type: z$1.literal("compatibility"),
		feature: z$1.string(),
		details: z$1.string().optional()
	}),
	z$1.object({
		type: z$1.literal("deprecated"),
		setting: z$1.string(),
		message: z$1.string()
	}),
	z$1.object({
		type: z$1.literal("other"),
		message: z$1.string()
	})
]);
var gatewaySpeechResponseSchema = z$1.object({
	audio: z$1.string(),
	warnings: z$1.array(gatewaySpeechWarningSchema).optional(),
	providerMetadata: z$1.record(z$1.string(), providerMetadataEntrySchema3).optional()
});
var GatewayTranscriptionModel = class {
	constructor(modelId, config) {
		this.modelId = modelId;
		this.config = config;
		this.specificationVersion = "v4";
	}
	get provider() {
		return this.config.provider;
	}
	async doGenerate({ audio, mediaType, providerOptions, headers, abortSignal }) {
		var _a12, _b12, _c, _d;
		const resolvedHeaders = this.config.headers ? await require_dist$2.resolve(this.config.headers) : void 0;
		try {
			const { responseHeaders, value: responseBody, rawValue } = await require_dist$2.postJsonToApi({
				url: this.getUrl(),
				headers: require_dist$2.combineHeaders(resolvedHeaders, headers != null ? headers : {}, this.getModelConfigHeaders(), await require_dist$2.resolve(this.config.o11yHeaders)),
				body: {
					audio: audio instanceof Uint8Array ? require_dist$2.convertUint8ArrayToBase64(audio) : audio,
					mediaType,
					...providerOptions && { providerOptions }
				},
				successfulResponseHandler: require_dist$2.createJsonResponseHandler(gatewayTranscriptionResponseSchema),
				failedResponseHandler: require_dist$2.createJsonErrorResponseHandler({
					errorSchema: z$1.any(),
					errorToMessage: (data) => {
						var _a13;
						return (_a13 = require_dist$2.getErrorMessage(data)) != null ? _a13 : "unknown error";
					}
				}),
				...abortSignal && { abortSignal },
				fetch: this.config.fetch
			});
			return {
				text: responseBody.text,
				segments: (_a12 = responseBody.segments) != null ? _a12 : [],
				language: (_b12 = responseBody.language) != null ? _b12 : void 0,
				durationInSeconds: (_c = responseBody.durationInSeconds) != null ? _c : void 0,
				warnings: (_d = responseBody.warnings) != null ? _d : [],
				providerMetadata: responseBody.providerMetadata,
				response: {
					timestamp: /* @__PURE__ */ new Date(),
					modelId: this.modelId,
					headers: responseHeaders,
					body: rawValue
				}
			};
		} catch (error) {
			throw await asGatewayError(error, await parseAuthMethod(resolvedHeaders != null ? resolvedHeaders : {}));
		}
	}
	async doStream(options) {
		var _a12, _b12, _c, _d, _e;
		const currentDate = (_c = (_b12 = (_a12 = this.config._internal) == null ? void 0 : _a12.currentDate) == null ? void 0 : _b12.call(_a12)) != null ? _c : /* @__PURE__ */ new Date();
		const headers = require_dist$2.combineHeaders(await require_dist$2.resolve((_d = this.config.headers) != null ? _d : {}), (_e = options.headers) != null ? _e : {}, this.getModelConfigHeaders(), await require_dist$2.resolve(this.config.o11yHeaders));
		const authMethod = await parseAuthMethod(headers);
		const startFrame = {
			type: require_dist$2.TRANSCRIPTION_STREAM_START_FRAME_TYPE,
			inputAudioFormat: options.inputAudioFormat,
			...options.providerOptions != null && { providerOptions: options.providerOptions },
			...options.includeRawChunks != null && { includeRawChunks: options.includeRawChunks }
		};
		return {
			stream: createGatewayTranscriptionStream({
				webSocket: this.config.webSocket,
				url: toGatewayTranscriptionUrl(this.config.baseURL, this.modelId),
				protocols: getProtocolsFromHeaders(headers),
				headers,
				startFrame,
				audio: options.audio,
				abortSignal: options.abortSignal,
				authMethod
			}),
			request: { body: startFrame },
			response: {
				timestamp: currentDate,
				modelId: this.modelId
			}
		};
	}
	getUrl() {
		return `${this.config.baseURL}/transcription-model`;
	}
	getModelConfigHeaders() {
		return {
			"ai-transcription-model-specification-version": "4",
			"ai-model-id": this.modelId
		};
	}
};
function toGatewayTranscriptionUrl(baseURL, modelId) {
	const url = new URL(`${baseURL.replace(/^http/, "ws")}/transcription-model`);
	url.searchParams.set("ai-model-id", modelId);
	return url.toString();
}
function getProtocolsFromHeaders(headers) {
	const normalizedHeaders = require_dist$2.normalizeHeaders(headers);
	const authorization = normalizedHeaders.authorization;
	const token = (authorization == null ? void 0 : authorization.startsWith("Bearer ")) ? authorization.slice(7) : void 0;
	return token == null ? [GATEWAY_TRANSCRIPTION_SUBPROTOCOL] : getGatewayTranscriptionProtocols(token, { teamIdOrSlug: normalizedHeaders[VERCEL_AI_GATEWAY_TEAM_HEADER] });
}
var MAX_AUDIO_FRAME_BYTES = 65536;
function createGatewayTranscriptionStream({ webSocket, url, protocols, headers, startFrame, audio, abortSignal, authMethod }) {
	let finished = false;
	let cleanup = () => {};
	return new ReadableStream({
		start: (controller) => {
			let audioReader;
			let hasServerErrorPart = false;
			let lastServerError;
			let audioStopped = false;
			let connection;
			cleanup = (closeCode) => {
				if (audioReader != null) audioReader.cancel().catch(() => {});
				else audio.cancel().catch(() => {});
				connection?.close(closeCode);
			};
			const stopAudio = () => {
				audioStopped = true;
				if (audioReader != null) {
					audioReader.cancel().catch(() => {});
					audioReader = void 0;
				} else audio.cancel().catch(() => {});
			};
			const finishWithError = (error) => {
				if (finished) return;
				finished = true;
				cleanup();
				errorControllerWithGatewayError(controller, error, authMethod);
			};
			const sendAudio = async (socket) => {
				const reader = audio.getReader();
				audioReader = reader;
				try {
					while (true) {
						const { done, value } = await reader.read();
						if (done || finished) break;
						const bytes = typeof value === "string" ? require_dist$2.convertBase64ToUint8Array(value) : value;
						for (let offset = 0; offset < bytes.length; offset += MAX_AUDIO_FRAME_BYTES) {
							if (finished) break;
							socket.send(bytes.subarray(offset, offset + MAX_AUDIO_FRAME_BYTES));
							await require_dist$2.waitForWebSocketBufferDrain(socket);
						}
					}
				} finally {
					reader.releaseLock();
					if (audioReader === reader) audioReader = void 0;
				}
				if (!finished && !audioStopped) socket.send(JSON.stringify({ type: require_dist$2.TRANSCRIPTION_STREAM_AUDIO_DONE_FRAME_TYPE }));
			};
			connection = require_dist$2.connectToWebSocket({
				url,
				protocols,
				headers,
				webSocket,
				abortSignal,
				onAbort: (reason) => {
					if (finished) return;
					finished = true;
					cleanup();
					controller.error(reason);
				},
				onProcessingError: finishWithError,
				onOpen: (socket) => {
					socket.send(JSON.stringify(startFrame));
					sendAudio(socket).catch(finishWithError);
				},
				onMessageText: (text) => {
					if (finished) return;
					const part = require_dist$2.parseTranscriptionStreamPart(text);
					if (part == null) return;
					if (part.type === "finish") {
						finished = true;
						controller.enqueue(part);
						controller.close();
						cleanup(1e3);
						return;
					}
					if (part.type === "error") {
						hasServerErrorPart = true;
						lastServerError = part.error;
						stopAudio();
					}
					controller.enqueue(part);
				},
				onSocketError: () => {
					finishWithError(/* @__PURE__ */ new Error("Connection error on AI Gateway transcription stream"));
				},
				onClose: () => {
					if (hasServerErrorPart) {
						if (finished) return;
						createErrorFromServerErrorPart(lastServerError, authMethod).then(finishWithError);
						return;
					}
					finishWithError(/* @__PURE__ */ new Error("AI Gateway transcription stream closed before a finish part was received"));
				}
			});
		},
		cancel: () => {
			if (finished) return;
			finished = true;
			cleanup();
		}
	});
}
var providerMetadataEntrySchema4 = z$1.object({}).catchall(z$1.unknown());
var gatewayTranscriptionWarningSchema = z$1.discriminatedUnion("type", [
	z$1.object({
		type: z$1.literal("unsupported"),
		feature: z$1.string(),
		details: z$1.string().optional()
	}),
	z$1.object({
		type: z$1.literal("compatibility"),
		feature: z$1.string(),
		details: z$1.string().optional()
	}),
	z$1.object({
		type: z$1.literal("deprecated"),
		setting: z$1.string(),
		message: z$1.string()
	}),
	z$1.object({
		type: z$1.literal("other"),
		message: z$1.string()
	})
]);
var gatewayTranscriptionResponseSchema = z$1.object({
	text: z$1.string(),
	segments: z$1.array(z$1.object({
		text: z$1.string(),
		startSecond: z$1.number(),
		endSecond: z$1.number()
	})).optional(),
	language: z$1.string().nullish(),
	durationInSeconds: z$1.number().nullish(),
	warnings: z$1.array(gatewayTranscriptionWarningSchema).optional(),
	providerMetadata: z$1.record(z$1.string(), providerMetadataEntrySchema4).optional()
});
async function errorControllerWithGatewayError(controller, error, authMethod) {
	controller.error(await asGatewayError(error, authMethod));
}
function getServerErrorMessage(error) {
	if (error != null && typeof error === "object" && "message" in error && typeof error.message === "string") return error.message;
	return require_dist$2.getErrorMessage(error);
}
var SERVER_ERROR_STATUS_CODES = {
	authentication_error: 401,
	failed_dependency: 424,
	forbidden: 403,
	internal_server_error: 500,
	invalid_request_error: 400,
	model_not_found: 404,
	rate_limit_exceeded: 429
};
async function createErrorFromServerErrorPart(error, authMethod) {
	if (typeof error === "object" && error != null && "message" in error && typeof error.message === "string" && "type" in error && typeof error.type === "string" && error.type in SERVER_ERROR_STATUS_CODES) return createGatewayErrorFromResponse({
		response: { error: {
			message: error.message,
			type: error.type
		} },
		statusCode: SERVER_ERROR_STATUS_CODES[error.type],
		authMethod
	});
	return /* @__PURE__ */ new Error(`AI Gateway transcription stream failed: ${getServerErrorMessage(error)}`);
}
var GatewayRealtimeModel = class {
	constructor(modelId, config) {
		this.specificationVersion = "v4";
		this.modelId = modelId;
		this.provider = config.provider;
		this.config = config;
	}
	/**
	* Mints a single-use, short-lived client secret (`vcst_`) the browser uses to
	* open the realtime WebSocket without ever holding the long-lived Gateway
	* credential. The customer's server calls this (via
	* `gateway.experimental_realtime.getToken`) and hands the returned token to
	* the browser, which connects with it through the `ai-gateway-auth.<token>`
	* subprotocol. `expiresAfterSeconds` is forwarded to the mint endpoint;
	* `sessionConfig` is intentionally unused here — it is applied later via the
	* normalized `session-update` event.
	*/
	async doCreateClientSecret(options) {
		const secret = await this.config.createClientSecret({
			modelId: this.modelId,
			...(options == null ? void 0 : options.expiresAfterSeconds) != null && { expiresAfterSeconds: options.expiresAfterSeconds }
		});
		return {
			token: secret.token,
			url: toGatewayRealtimeUrl(this.config.baseURL, this.modelId),
			...secret.expiresAt != null && { expiresAt: secret.expiresAt }
		};
	}
	getWebSocketConfig(options) {
		return {
			url: options.url,
			protocols: getGatewayRealtimeProtocols(options.token, { teamIdOrSlug: this.config.teamIdOrSlug })
		};
	}
	parseServerEvent(raw) {
		return raw;
	}
	serializeClientEvent(event) {
		return event;
	}
	buildSessionConfig(config) {
		return config;
	}
};
function toGatewayRealtimeUrl(baseURL, modelId) {
	const url = new URL(`${baseURL.replace(/^http/, "ws")}/realtime-model`);
	url.searchParams.set("ai-model-id", modelId);
	return url.toString();
}
var exaSearchInputSchema = require_dist$2.lazySchema(() => require_dist$2.zodSchema(z$1.object({
	query: z$1.string().describe("Natural-language web search query. This is required."),
	type: z$1.enum([
		"auto",
		"fast",
		"instant"
	]).optional().describe("Search method. Use auto for the default balance of speed and quality."),
	num_results: z$1.number().optional().describe("Maximum number of results to return (1-100, default: 10)."),
	category: z$1.enum([
		"company",
		"people",
		"research paper",
		"news",
		"personal site",
		"financial report"
	]).optional().describe("Optional content category to focus results."),
	user_location: z$1.string().optional().describe("Two-letter ISO country code such as 'US'."),
	include_domains: z$1.array(z$1.string()).optional().describe("Only return results from these domains."),
	exclude_domains: z$1.array(z$1.string()).optional().describe("Exclude results from these domains."),
	start_published_date: z$1.string().optional().describe("Only return links published after this ISO 8601 date."),
	end_published_date: z$1.string().optional().describe("Only return links published before this ISO 8601 date."),
	contents: z$1.object({
		text: z$1.union([z$1.boolean(), z$1.object({
			max_characters: z$1.number().optional(),
			include_html_tags: z$1.boolean().optional(),
			verbosity: z$1.enum([
				"compact",
				"standard",
				"full"
			]).optional(),
			include_sections: z$1.array(z$1.enum([
				"header",
				"navigation",
				"banner",
				"body",
				"sidebar",
				"footer",
				"metadata"
			])).optional(),
			exclude_sections: z$1.array(z$1.enum([
				"header",
				"navigation",
				"banner",
				"body",
				"sidebar",
				"footer",
				"metadata"
			])).optional()
		})]).optional(),
		highlights: z$1.union([z$1.boolean(), z$1.object({
			query: z$1.string().optional(),
			max_characters: z$1.number().optional()
		})]).optional(),
		max_age_hours: z$1.number().optional(),
		livecrawl_timeout: z$1.number().optional(),
		subpages: z$1.number().optional(),
		subpage_target: z$1.union([z$1.string(), z$1.array(z$1.string())]).optional(),
		extras: z$1.object({
			links: z$1.number().optional(),
			image_links: z$1.number().optional()
		}).optional()
	}).optional().describe("Controls extracted page content and freshness.")
})));
var exaSearchOutputSchema = require_dist$2.lazySchema(() => require_dist$2.zodSchema(z$1.union([z$1.object({
	requestId: z$1.string(),
	searchType: z$1.string().optional(),
	resolvedSearchType: z$1.string().optional(),
	results: z$1.array(z$1.object({
		title: z$1.string(),
		url: z$1.string(),
		id: z$1.string(),
		publishedDate: z$1.string().nullable().optional(),
		author: z$1.string().nullable().optional(),
		image: z$1.string().nullable().optional(),
		favicon: z$1.string().nullable().optional(),
		text: z$1.string().optional(),
		highlights: z$1.array(z$1.string()).optional(),
		highlightScores: z$1.array(z$1.number()).optional(),
		summary: z$1.string().optional(),
		subpages: z$1.array(z$1.any()).optional(),
		extras: z$1.object({
			links: z$1.array(z$1.string()).optional(),
			imageLinks: z$1.array(z$1.string()).optional()
		}).optional()
	})),
	costDollars: z$1.object({
		total: z$1.number().optional(),
		search: z$1.record(z$1.string(), z$1.number()).optional()
	}).optional()
}), z$1.object({
	error: z$1.enum([
		"api_error",
		"rate_limit",
		"timeout",
		"invalid_input",
		"configuration_error",
		"execution_error",
		"unknown"
	]),
	statusCode: z$1.number().optional(),
	message: z$1.string()
})])));
var exaSearchToolFactory = require_dist$2.createProviderExecutedToolFactory({
	id: "gateway.exa_search",
	inputSchema: exaSearchInputSchema,
	outputSchema: exaSearchOutputSchema
});
var exaSearch = (config = {}) => exaSearchToolFactory(config);
var parallelSearchInputSchema = require_dist$2.lazySchema(() => require_dist$2.zodSchema(z$1.object({
	objective: z$1.string().describe("Natural-language description of the web research goal, including source or freshness guidance and broader context from the task. Maximum 5000 characters."),
	search_queries: z$1.array(z$1.string()).optional().describe("Optional search queries to supplement the objective. Maximum 200 characters per query."),
	mode: z$1.enum(["one-shot", "agentic"]).optional().describe("Mode preset: \"one-shot\" for comprehensive results with longer excerpts (default), \"agentic\" for concise, token-efficient results for multi-step workflows."),
	max_results: z$1.number().optional().describe("Maximum number of results to return (1-20). Defaults to 10 if not specified."),
	source_policy: z$1.object({
		include_domains: z$1.array(z$1.string()).optional().describe("Limit results to these domains. Use plain domain names only — e.g. example.com or sub.example.gov, or a bare extension like .edu. Do not include a scheme, path, or port (e.g. not https://example.com/page)."),
		exclude_domains: z$1.array(z$1.string()).optional().describe("Exclude results from these domains. Use plain domain names only — e.g. example.com or sub.example.gov, or a bare extension like .edu. Do not include a scheme, path, or port (e.g. not https://example.com/page)."),
		after_date: z$1.string().optional().describe("Only include results published after this date. Use an ISO 8601 calendar date formatted YYYY-MM-DD (e.g. 2025-01-01); do not include a time.")
	}).optional().describe("Source policy for controlling which domains to include/exclude and freshness."),
	excerpts: z$1.object({
		max_chars_per_result: z$1.number().optional().describe("Maximum characters per result."),
		max_chars_total: z$1.number().optional().describe("Maximum total characters across all results.")
	}).optional().describe("Excerpt configuration for controlling result length."),
	fetch_policy: z$1.object({ max_age_seconds: z$1.number().optional().describe("Maximum age in seconds for cached content. Set to 0 to always fetch fresh content.") }).optional().describe("Fetch policy for controlling content freshness.")
})));
var parallelSearchOutputSchema = require_dist$2.lazySchema(() => require_dist$2.zodSchema(z$1.union([z$1.object({
	searchId: z$1.string(),
	results: z$1.array(z$1.object({
		url: z$1.string(),
		title: z$1.string(),
		excerpt: z$1.string(),
		publishDate: z$1.string().nullable().optional(),
		relevanceScore: z$1.number().optional()
	}))
}), z$1.object({
	error: z$1.enum([
		"api_error",
		"rate_limit",
		"timeout",
		"invalid_input",
		"configuration_error",
		"unknown"
	]),
	statusCode: z$1.number().optional(),
	message: z$1.string()
})])));
var parallelSearchToolFactory = require_dist$2.createProviderExecutedToolFactory({
	id: "gateway.parallel_search",
	inputSchema: parallelSearchInputSchema,
	outputSchema: parallelSearchOutputSchema
});
var parallelSearch = (config = {}) => parallelSearchToolFactory(config);
var perplexitySearchInputSchema = require_dist$2.lazySchema(() => require_dist$2.zodSchema(z$1.object({
	query: z$1.union([z$1.string(), z$1.array(z$1.string())]).describe("Search query (string) or multiple queries (array of up to 5 strings). Multi-query searches return combined results from all queries."),
	max_results: z$1.number().optional().describe("Maximum number of search results to return (1-20, default: 10)"),
	max_tokens_per_page: z$1.number().optional().describe("Maximum number of tokens to extract per search result page (256-2048, default: 2048)"),
	max_tokens: z$1.number().optional().describe("Maximum total tokens across all search results (default: 25000, max: 1000000)"),
	country: z$1.string().optional().describe("Two-letter ISO 3166-1 alpha-2 country code for regional search results (e.g., 'US', 'GB', 'FR')"),
	search_domain_filter: z$1.array(z$1.string()).optional().describe("List of domains to include or exclude from search results (max 20). To include: ['nature.com', 'science.org']. To exclude: ['-example.com', '-spam.net']"),
	search_language_filter: z$1.array(z$1.string()).optional().describe("List of ISO 639-1 language codes to filter results (max 10, lowercase). Examples: ['en', 'fr', 'de']"),
	search_after_date: z$1.string().optional().describe("Include only results published after this date. Format: 'MM/DD/YYYY' (e.g., '3/1/2025'). Cannot be used with search_recency_filter."),
	search_before_date: z$1.string().optional().describe("Include only results published before this date. Format: 'MM/DD/YYYY' (e.g., '3/15/2025'). Cannot be used with search_recency_filter."),
	last_updated_after_filter: z$1.string().optional().describe("Include only results last updated after this date. Format: 'MM/DD/YYYY' (e.g., '3/1/2025'). Cannot be used with search_recency_filter."),
	last_updated_before_filter: z$1.string().optional().describe("Include only results last updated before this date. Format: 'MM/DD/YYYY' (e.g., '3/15/2025'). Cannot be used with search_recency_filter."),
	search_recency_filter: z$1.enum([
		"day",
		"week",
		"month",
		"year"
	]).optional().describe("Filter results by relative time period. Cannot be used with search_after_date or search_before_date.")
})));
var perplexitySearchOutputSchema = require_dist$2.lazySchema(() => require_dist$2.zodSchema(z$1.union([z$1.object({
	results: z$1.array(z$1.object({
		title: z$1.string(),
		url: z$1.string(),
		snippet: z$1.string(),
		date: z$1.string().optional(),
		lastUpdated: z$1.string().optional()
	})),
	id: z$1.string()
}), z$1.object({
	error: z$1.enum([
		"api_error",
		"rate_limit",
		"timeout",
		"invalid_input",
		"unknown"
	]),
	statusCode: z$1.number().optional(),
	message: z$1.string()
})])));
var perplexitySearchToolFactory = require_dist$2.createProviderExecutedToolFactory({
	id: "gateway.perplexity_search",
	inputSchema: perplexitySearchInputSchema,
	outputSchema: perplexitySearchOutputSchema
});
var perplexitySearch = (config = {}) => perplexitySearchToolFactory(config);
var takoDataSourceInputSchema = z$1.object({
	count: z$1.number().optional().describe("Maximum number of data results to return (1-20). When include_contents is true, each additional result adds its own data surcharge."),
	include_contents: z$1.boolean().optional().describe("Inline rows for each data result. This adds a data surcharge based on row count and dataset source. To estimate cost, search with include_contents disabled and inspect cards.content.export_pricing. This applies to every returned card; limit sources.data.count and sources.data.max_rows to control cost."),
	mode: z$1.enum(["inline", "url"]).optional().describe("Requested data delivery mode. Search card data is always inline."),
	content_format: z$1.enum([
		"card_json",
		"csv",
		"json_compact",
		"json_records"
	]).optional().describe("Serialization for inlined card data."),
	max_rows: z$1.number().optional().describe("Maximum rows to inline per result. Omit to use the allowance in cards.content.export_pricing. A data surcharge applies per 1,000 exported rows; lower values reduce cost."),
	node_ids: z$1.array(z$1.string()).optional().describe("Data Graph node IDs to prioritize. Maximum 20."),
	strict: z$1.boolean().optional().describe("Only return cards matching node_ids. Requires a non-empty node_ids.")
});
var takoWebSourceInputSchema = z$1.object({
	count: z$1.number().optional().describe("Maximum number of web results to return (1-20)."),
	include_contents: z$1.boolean().optional().describe("Inline extracted web page text. This can add a data charge."),
	category: z$1.enum([
		"finance",
		"news",
		"sports"
	]).optional().describe("Optional web-result category filter."),
	include_domains: z$1.array(z$1.string()).optional().describe("Only return results from these bare domains."),
	exclude_domains: z$1.array(z$1.string()).optional().describe("Exclude results from these bare domains."),
	snippet_max_chars: z$1.number().optional().describe("Maximum characters in each web-result snippet."),
	highlights: z$1.boolean().optional().describe("Include highlighted passages in web results. Defaults to true in AI Gateway."),
	article_content_max_chars: z$1.number().optional().describe("Maximum extracted characters per web page when including contents."),
	published_after: z$1.string().optional().describe("Keep results published on or after this ISO date (YYYY-MM-DD)."),
	published_before: z$1.string().optional().describe("Keep results published on or before this ISO date (YYYY-MM-DD).")
});
var takoSearchInputSchema = require_dist$2.lazySchema(() => require_dist$2.zodSchema(z$1.object({
	query: z$1.string().describe("Natural-language search query. Include the entity, metric, and time period. Quote a phrase to force it to one entity, for example \"Tesla\":PRODUCT price."),
	effort: z$1.enum([
		"deep",
		"fast",
		"instant"
	]).optional().describe("Search effort. fast is the balanced default, instant favors cached results and low latency, and deep broadens retrieval with reranking at higher cost and latency."),
	sources: z$1.object({
		data: takoDataSourceInputSchema.optional(),
		web: takoWebSourceInputSchema.optional()
	}).optional().describe("Sources to search. Omit to search both curated data and the web. When provided, only keys present are searched."),
	location: z$1.object({
		latitude: z$1.number().describe("Latitude between -90 and 90."),
		longitude: z$1.number().describe("Longitude between -180 and 180.")
	}).optional().describe("End-user coordinates for localized results."),
	country_code: z$1.string().optional().describe("Two-letter ISO 3166-1 country code, such as 'US'."),
	locale: z$1.string().optional().describe("BCP-47 locale, such as 'en-US'."),
	timezone: z$1.string().optional().describe("IANA timezone, such as 'America/New_York'."),
	output_settings: z$1.object({
		image_dark_mode: z$1.boolean().optional().describe("Render card preview images in dark mode."),
		force_refresh: z$1.boolean().optional().describe("Instant-effort only. Request a refreshed instant result.")
	}).optional().describe("Controls card rendering in the search response."),
	include_related: z$1.number().optional().describe("Maximum related search suggestions to include (1-20).")
})));
var takoDatasetCellSchema = z$1.union([
	z$1.boolean(),
	z$1.number(),
	z$1.string()
]).nullable();
var takoResultContentSchema = z$1.object({
	content_format: z$1.enum([
		"card_json",
		"csv",
		"json_compact",
		"json_records"
	]).nullish(),
	cost: z$1.number().optional(),
	data: z$1.string().nullish(),
	records: z$1.array(z$1.record(z$1.string(), takoDatasetCellSchema)).nullish(),
	dataset: z$1.object({
		columns: z$1.array(z$1.object({
			name: z$1.string(),
			type: z$1.enum([
				"boolean",
				"date",
				"datetime",
				"number",
				"string"
			]),
			unit: z$1.string().nullish()
		})),
		rows: z$1.array(z$1.array(takoDatasetCellSchema)),
		total_rows: z$1.number(),
		truncated: z$1.boolean(),
		ref: z$1.string(),
		sources: z$1.array(z$1.object({
			name: z$1.string(),
			index: z$1.enum(["data", "web"]).optional()
		})),
		provenance: z$1.enum(["query", "web_extraction"]).optional()
	}).nullish(),
	card_data: z$1.object({}).passthrough().nullish(),
	card_data_schema: z$1.object({}).passthrough().nullish(),
	url: z$1.string().nullish(),
	expires_at: z$1.string().nullish(),
	total_rows: z$1.number().nullish(),
	truncated: z$1.boolean().optional(),
	export_pricing: z$1.object({
		baseline_usd: z$1.number(),
		free_rows: z$1.number(),
		max_rows_ceiling: z$1.number(),
		row_cpm_usd: z$1.number()
	}).nullish(),
	manifest: z$1.array(z$1.object({
		dtype: z$1.enum([
			"boolean",
			"date",
			"datetime",
			"number",
			"string"
		]).nullish(),
		entity: z$1.string().nullish(),
		metric: z$1.string().nullish(),
		name: z$1.string().nullish(),
		unit: z$1.string().nullish()
	})).nullish()
}).passthrough();
var takoCardSchema = z$1.object({
	card_id: z$1.string().nullish(),
	title: z$1.string().nullish(),
	description: z$1.string().nullish(),
	semantic_description: z$1.string().nullish(),
	webpage_url: z$1.string().nullish(),
	image_url: z$1.string().nullish(),
	embed_url: z$1.string().nullish(),
	sources: z$1.array(z$1.object({
		source_name: z$1.string().nullish(),
		source_description: z$1.string().nullish(),
		source_index: z$1.enum(["data", "web"]),
		source_text: z$1.string().nullish(),
		url: z$1.string().nullish()
	})).nullish(),
	methodologies: z$1.array(z$1.object({
		methodology_name: z$1.string().nullable(),
		methodology_description: z$1.string().nullable()
	})).nullish(),
	source_indexes: z$1.array(z$1.enum(["data", "web"])).nullish(),
	card_type: z$1.string().nullish(),
	relevance: z$1.enum([
		"High",
		"Low",
		"Medium"
	]).nullish(),
	content: takoResultContentSchema.nullish(),
	exportable: z$1.boolean().optional(),
	nodes: z$1.array(z$1.object({
		id: z$1.string(),
		type: z$1.enum(["entity", "metric"]),
		name: z$1.string(),
		description: z$1.string().nullish()
	})).nullish(),
	metric_definitions: z$1.array(z$1.object({
		name: z$1.string(),
		definition: z$1.string()
	})).nullish(),
	data_freshness: z$1.object({
		coverage_end: z$1.string().nullish(),
		data_as_of: z$1.string().nullish(),
		last_updated: z$1.string().nullish()
	}).nullish()
}).passthrough();
var takoWebResultSchema = z$1.object({
	title: z$1.string(),
	url: z$1.string(),
	snippet: z$1.string().nullish(),
	source_name: z$1.string().nullish(),
	publish_date: z$1.string().nullish(),
	content: takoResultContentSchema.nullish()
}).passthrough();
var takoSearchOutputSchema = require_dist$2.lazySchema(() => require_dist$2.zodSchema(z$1.union([z$1.object({
	request_id: z$1.string(),
	cards: z$1.array(takoCardSchema).optional(),
	web_results: z$1.array(takoWebResultSchema).optional(),
	usage: z$1.object({
		total_cost_usd: z$1.number(),
		compute: z$1.object({ cost_usd: z$1.number() }).nullish(),
		data: z$1.object({
			cost_usd: z$1.number(),
			datasets: z$1.number()
		}).nullish()
	}).nullish(),
	related: z$1.array(z$1.object({}).passthrough()).nullish()
}).passthrough(), z$1.object({
	error: z$1.enum([
		"api_error",
		"configuration_error",
		"execution_error",
		"invalid_input",
		"rate_limit",
		"timeout",
		"unknown_tool"
	]),
	statusCode: z$1.number().optional(),
	message: z$1.string()
})])));
var takoSearchToolFactory = require_dist$2.createProviderExecutedToolFactory({
	id: "gateway.tako_search",
	inputSchema: takoSearchInputSchema,
	outputSchema: takoSearchOutputSchema
});
var takoSearch = (config = {}) => takoSearchToolFactory(config);
var gatewayTools = {
	/**
	* Search the web using Exa for current information and token-efficient
	* excerpts optimized for agent workflows.
	*
	* Supports search type, category, domain, date, location, and content
	* extraction controls.
	*/
	exaSearch,
	/**
	* Search the web using Parallel AI's Search API for LLM-optimized excerpts.
	*
	* Takes a natural language objective and returns relevant excerpts,
	* replacing multiple keyword searches with a single call for broad
	* or complex queries. Supports different search types for depth vs
	* breadth tradeoffs.
	*/
	parallelSearch,
	/**
	* Search the web using Perplexity's Search API for real-time information,
	* news, research papers, and articles.
	*
	* Provides ranked search results with advanced filtering options including
	* domain, language, date range, and recency filters.
	*/
	perplexitySearch,
	/**
	* Search the web and Tako's curated knowledge graph in one call for
	* token-efficient web excerpts and structured data results grounded in
	* premium sources, each with an embed-ready visualization.
	*
	* Supports effort, per-source web and data controls, localization, and inline
	* contents for agents that need to reason over underlying data.
	*/
	takoSearch
};
async function getVercelRequestId() {
	var _a12;
	return (_a12 = (0, import_dist.getContext)().headers) == null ? void 0 : _a12["x-vercel-id"];
}
var VERSION$1 = "4.0.88";
var AI_GATEWAY_PROTOCOL_VERSION = "0.0.1";
var gatewayClientSecretResponseSchema = z$1.object({
	token: z$1.string(),
	expiresAt: z$1.number().nullish()
});
function createGateway(options = {}) {
	var _a12, _b12;
	let pendingMetadata = null;
	let metadataCache = null;
	const cacheRefreshMillis = (_a12 = options.metadataCacheRefreshMillis) != null ? _a12 : 3e5;
	let lastFetchTime = 0;
	const baseURL = (_b12 = require_dist$2.withoutTrailingSlash(options.baseURL)) != null ? _b12 : "https://ai-gateway.vercel.sh/v4/ai";
	const createAuthHeaders = (auth) => require_dist$2.withUserAgentSuffix({
		Authorization: `Bearer ${auth.token}`,
		"ai-gateway-protocol-version": AI_GATEWAY_PROTOCOL_VERSION,
		[GATEWAY_AUTH_METHOD_HEADER]: auth.authMethod,
		...options.teamIdOrSlug != null ? { [VERCEL_AI_GATEWAY_TEAM_HEADER]: options.teamIdOrSlug } : {},
		...options.headers
	}, `ai-sdk/gateway/${VERSION$1}`);
	const getHeaders = async () => {
		try {
			return createAuthHeaders(await getGatewayAuthToken(options));
		} catch (error) {
			throw GatewayAuthenticationError.createContextualError({
				apiKeyProvided: false,
				oidcTokenProvided: false,
				statusCode: 401,
				cause: error
			});
		}
	};
	const getRealtimeAuthToken = async () => {
		try {
			return await getGatewayAuthToken(options);
		} catch (error) {
			throw GatewayAuthenticationError.createContextualError({
				apiKeyProvided: false,
				oidcTokenProvided: false,
				statusCode: 401,
				cause: error
			});
		}
	};
	const mintClientSecret = async (params) => {
		assertGatewayClientSecretServerEnvironment();
		const auth = await getRealtimeAuthToken();
		const headers = createAuthHeaders(auth);
		const url = new URL("/v1/realtime/client-secrets", baseURL).toString();
		try {
			const { value } = await require_dist$2.postJsonToApi({
				url,
				headers,
				body: {
					model: params.modelId,
					...params.routeKind != null && { routeKind: params.routeKind },
					...params.expiresAfterSeconds != null && { expiresIn: params.expiresAfterSeconds }
				},
				successfulResponseHandler: require_dist$2.createJsonResponseHandler(gatewayClientSecretResponseSchema),
				failedResponseHandler: require_dist$2.createJsonErrorResponseHandler({
					errorSchema: z$1.any(),
					errorToMessage: (data) => {
						var _a13;
						return (_a13 = require_dist$2.getErrorMessage(data)) != null ? _a13 : "unknown error";
					}
				}),
				fetch: options.fetch
			});
			return {
				token: value.token,
				...value.expiresAt != null && { expiresAt: value.expiresAt }
			};
		} catch (error) {
			throw await asGatewayError(error, await parseAuthMethod(headers));
		}
	};
	const createO11yHeaders = () => {
		const deploymentId = require_dist$2.loadOptionalSetting({
			settingValue: void 0,
			environmentVariableName: "VERCEL_DEPLOYMENT_ID"
		});
		const environment = require_dist$2.loadOptionalSetting({
			settingValue: void 0,
			environmentVariableName: "VERCEL_ENV"
		});
		const region = require_dist$2.loadOptionalSetting({
			settingValue: void 0,
			environmentVariableName: "VERCEL_REGION"
		});
		const projectId = require_dist$2.loadOptionalSetting({
			settingValue: void 0,
			environmentVariableName: "VERCEL_PROJECT_ID"
		});
		return async () => {
			const requestId = await getVercelRequestId();
			return {
				...deploymentId && { "ai-o11y-deployment-id": deploymentId },
				...environment && { "ai-o11y-environment": environment },
				...region && { "ai-o11y-region": region },
				...requestId && { "ai-o11y-request-id": requestId },
				...projectId && { "ai-o11y-project-id": projectId }
			};
		};
	};
	const createLanguageModel = (modelId) => {
		return new GatewayLanguageModel(modelId, {
			provider: "gateway",
			baseURL,
			headers: getHeaders,
			fetch: options.fetch,
			o11yHeaders: createO11yHeaders()
		});
	};
	const createBatch = () => new GatewayBatch({
		provider: "gateway",
		baseURL,
		headers: getHeaders,
		fetch: options.fetch,
		o11yHeaders: createO11yHeaders()
	});
	const getAvailableModels = async () => {
		var _a13, _b13, _c;
		const now = (_c = (_b13 = (_a13 = options._internal) == null ? void 0 : _a13.currentDate) == null ? void 0 : _b13.call(_a13).getTime()) != null ? _c : Date.now();
		if (!pendingMetadata || now - lastFetchTime > cacheRefreshMillis) {
			lastFetchTime = now;
			pendingMetadata = new GatewayFetchMetadata({
				baseURL,
				headers: getHeaders,
				fetch: options.fetch
			}).getAvailableModels().then((metadata) => {
				metadataCache = metadata;
				return metadata;
			}).catch(async (error) => {
				throw await asGatewayError(error, await parseAuthMethod(await getHeaders()));
			});
		}
		return metadataCache ? Promise.resolve(metadataCache) : pendingMetadata;
	};
	const getCredits = async () => {
		return new GatewayFetchMetadata({
			baseURL,
			headers: getHeaders,
			fetch: options.fetch
		}).getCredits().catch(async (error) => {
			throw await asGatewayError(error, await parseAuthMethod(await getHeaders()));
		});
	};
	const getSpendReport = async (params) => {
		return new GatewaySpendReport({
			baseURL,
			headers: getHeaders,
			fetch: options.fetch
		}).getSpendReport(params).catch(async (error) => {
			throw await asGatewayError(error, await parseAuthMethod(await getHeaders()));
		});
	};
	const getGenerationInfo = async (params) => {
		return new GatewayGenerationInfoFetcher({
			baseURL,
			headers: getHeaders,
			fetch: options.fetch
		}).getGenerationInfo(params).catch(async (error) => {
			throw await asGatewayError(error, await parseAuthMethod(await getHeaders()));
		});
	};
	const provider = function(modelId) {
		if (new.target) throw new Error("The Gateway Provider model function cannot be called with the new keyword.");
		return createLanguageModel(modelId);
	};
	provider.specificationVersion = "v4";
	provider.getAvailableModels = getAvailableModels;
	provider.getCredits = getCredits;
	provider.getSpendReport = getSpendReport;
	provider.getGenerationInfo = getGenerationInfo;
	provider.imageModel = (modelId) => {
		return new GatewayImageModel(modelId, {
			provider: "gateway",
			baseURL,
			headers: getHeaders,
			fetch: options.fetch,
			o11yHeaders: createO11yHeaders()
		});
	};
	provider.languageModel = createLanguageModel;
	provider.experimental_batch = createBatch;
	const createEmbeddingModel = (modelId) => {
		return new GatewayEmbeddingModel(modelId, {
			provider: "gateway",
			baseURL,
			headers: getHeaders,
			fetch: options.fetch,
			o11yHeaders: createO11yHeaders()
		});
	};
	provider.embeddingModel = createEmbeddingModel;
	provider.textEmbeddingModel = createEmbeddingModel;
	provider.videoModel = (modelId) => {
		return new GatewayVideoModel(modelId, {
			provider: "gateway",
			baseURL,
			headers: getHeaders,
			fetch: options.fetch,
			o11yHeaders: createO11yHeaders()
		});
	};
	const createRerankingModel = (modelId) => {
		return new GatewayRerankingModel(modelId, {
			provider: "gateway",
			baseURL,
			headers: getHeaders,
			fetch: options.fetch,
			o11yHeaders: createO11yHeaders()
		});
	};
	provider.rerankingModel = createRerankingModel;
	provider.reranking = createRerankingModel;
	const createEvaluationModel = (modelId) => {
		return new GatewayEvaluationModel(modelId, {
			provider: "gateway",
			baseURL,
			headers: getHeaders,
			fetch: options.fetch,
			o11yHeaders: createO11yHeaders()
		});
	};
	provider.evaluationModel = createEvaluationModel;
	provider.evaluation = createEvaluationModel;
	const createSpeechModel = (modelId) => {
		return new GatewaySpeechModel(modelId, {
			provider: "gateway",
			baseURL,
			headers: getHeaders,
			fetch: options.fetch,
			o11yHeaders: createO11yHeaders()
		});
	};
	provider.speechModel = createSpeechModel;
	provider.speech = createSpeechModel;
	const createTranscriptionModel = (modelId) => {
		return new GatewayTranscriptionModel(modelId, {
			provider: "gateway",
			baseURL,
			headers: getHeaders,
			fetch: options.fetch,
			o11yHeaders: createO11yHeaders(),
			webSocket: options.webSocket
		});
	};
	provider.transcriptionModel = createTranscriptionModel;
	provider.transcription = createTranscriptionModel;
	provider.experimental_transcription = Object.assign((modelId) => createTranscriptionModel(modelId), { getToken: async (tokenOptions) => {
		const secret = await mintClientSecret({
			modelId: tokenOptions.model,
			routeKind: "transcription",
			...tokenOptions.expiresAfterSeconds != null && { expiresAfterSeconds: tokenOptions.expiresAfterSeconds }
		});
		return {
			token: secret.token,
			url: toGatewayTranscriptionUrl(baseURL, tokenOptions.model),
			...secret.expiresAt != null && { expiresAt: secret.expiresAt }
		};
	} });
	const createRealtimeModel = (modelId) => new GatewayRealtimeModel(modelId, {
		provider: "gateway.realtime",
		baseURL,
		teamIdOrSlug: options.teamIdOrSlug,
		createClientSecret: mintClientSecret
	});
	provider.experimental_realtime = Object.assign((modelId) => createRealtimeModel(modelId), { getToken: async (tokenOptions) => {
		const { model: modelId, ...secretOptions } = tokenOptions;
		const secret = await createRealtimeModel(modelId).doCreateClientSecret(secretOptions);
		return {
			token: secret.token,
			url: secret.url,
			...secret.expiresAt != null && { expiresAt: secret.expiresAt }
		};
	} });
	provider.chat = provider.languageModel;
	provider.embedding = provider.embeddingModel;
	provider.image = provider.imageModel;
	provider.video = provider.videoModel;
	provider.tools = gatewayTools;
	return provider;
}
var gateway = createGateway();
async function getGatewayAuthToken(options) {
	const apiKey = require_dist$2.loadOptionalSetting({
		settingValue: options.apiKey,
		environmentVariableName: "AI_GATEWAY_API_KEY"
	});
	if (apiKey) return {
		token: apiKey,
		authMethod: "api-key"
	};
	return {
		token: await (0, import_dist.getVercelOidcToken)(),
		authMethod: "oidc"
	};
}
function assertGatewayClientSecretServerEnvironment() {
	if (typeof globalThis.window !== "undefined") throw new Error("AI Gateway client secrets must be minted server-side: minting needs your Gateway credential, which must never reach the browser. Call gateway.experimental_realtime.getToken() or gateway.experimental_transcription.getToken() from your server and pass the returned token to the client.");
}

export { GatewayAuthenticationError, GatewayError, gateway };
