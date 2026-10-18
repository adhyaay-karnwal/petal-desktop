// Reconstructed from index-C74mRL57.js — original module: vendor/@ai-sdk/provider

var marker$1 = "vercel.ai.error";
var symbol$2 = Symbol.for(marker$1);
var _a$5;
var _b$3;
var AISDKError = class _AISDKError extends (_b$3 = Error, _a$5 = symbol$2, _b$3) {
	/**
	* Creates an AI SDK Error.
	*
	* @param {Object} params - The parameters for creating the error.
	* @param {string} params.name - The name of the error.
	* @param {string} params.message - The error message.
	* @param {unknown} [params.cause] - The underlying cause of the error.
	*/
	constructor({ name: name16, message, cause }) {
		super(message);
		this[_a$5] = true;
		this.name = name16;
		this.cause = cause;
	}
	/**
	* Checks if the given error is an AI SDK Error.
	* @param {unknown} error - The error to check.
	* @returns {boolean} True if the error is an AI SDK Error, false otherwise.
	*/
	static isInstance(error) {
		return _AISDKError.hasMarker(error, marker$1);
	}
	static hasMarker(error, marker17) {
		const markerSymbol = Symbol.for(marker17);
		return error != null && typeof error === "object" && markerSymbol in error && typeof error[markerSymbol] === "boolean" && error[markerSymbol] === true;
	}
};
var name$2 = "AI_APICallError";
var marker2$2 = `vercel.ai.error.${name$2}`;
var symbol2$2 = Symbol.for(marker2$2);
var _a2$2;
var _b2$2;
var APICallError = class extends (_b2$2 = AISDKError, _a2$2 = symbol2$2, _b2$2) {
	constructor({ message, url, requestBodyValues, statusCode, responseHeaders, responseBody, cause, isRetryable = statusCode != null && (statusCode === 408 || statusCode === 409 || statusCode === 429 || statusCode >= 500), data }) {
		super({
			name: name$2,
			message,
			cause
		});
		this[_a2$2] = true;
		this.url = url;
		this.requestBodyValues = requestBodyValues;
		this.statusCode = statusCode;
		this.responseHeaders = responseHeaders;
		this.responseBody = responseBody;
		this.isRetryable = isRetryable;
		this.data = data;
	}
	static isInstance(error) {
		return AISDKError.hasMarker(error, marker2$2);
	}
};
var name2$2 = "AI_EmptyResponseBodyError";
var marker3$2 = `vercel.ai.error.${name2$2}`;
var symbol3$1 = Symbol.for(marker3$2);
var _a3$1;
var _b3$1;
var EmptyResponseBodyError = class extends (_b3$1 = AISDKError, _a3$1 = symbol3$1, _b3$1) {
	constructor({ message = "Empty response body" } = {}) {
		super({
			name: name2$2,
			message
		});
		this[_a3$1] = true;
	}
	static isInstance(error) {
		return AISDKError.hasMarker(error, marker3$2);
	}
};
function getErrorMessage(error) {
	if (error == null) return "unknown error";
	if (typeof error === "string") return error;
	if (error instanceof Error) return error.toString();
	return JSON.stringify(error);
}
var name4$1 = "AI_InvalidArgumentError";
var marker5$1 = `vercel.ai.error.${name4$1}`;
var symbol5$1 = Symbol.for(marker5$1);
var _a5$1;
var _b5$1;
var InvalidArgumentError$1 = class extends (_b5$1 = AISDKError, _a5$1 = symbol5$1, _b5$1) {
	constructor({ message, cause, argument }) {
		super({
			name: name4$1,
			message,
			cause
		});
		this[_a5$1] = true;
		this.argument = argument;
	}
	static isInstance(error) {
		return AISDKError.hasMarker(error, marker5$1);
	}
};
var name7$1 = "AI_JSONParseError";
var marker8$1 = `vercel.ai.error.${name7$1}`;
var symbol8$1 = Symbol.for(marker8$1);
var _a8$1;
var _b8$1;
var JSONParseError = class extends (_b8$1 = AISDKError, _a8$1 = symbol8$1, _b8$1) {
	constructor({ text, cause }) {
		super({
			name: name7$1,
			message: `JSON parsing failed: Text: ${text}.
Error message: ${getErrorMessage(cause)}`,
			cause
		});
		this[_a8$1] = true;
		this.text = text;
	}
	static isInstance(error) {
		return AISDKError.hasMarker(error, marker8$1);
	}
};
var name14$1 = "AI_TypeValidationError";
var marker15$1 = `vercel.ai.error.${name14$1}`;
var symbol15$1 = Symbol.for(marker15$1);
var _a15$1;
var _b15$1;
var TypeValidationError = class _TypeValidationError extends (_b15$1 = AISDKError, _a15$1 = symbol15$1, _b15$1) {
	constructor({ value, cause, context }) {
		let contextPrefix = "Type validation failed";
		if (context == null ? void 0 : context.field) contextPrefix += ` for ${context.field}`;
		if ((context == null ? void 0 : context.entityName) || (context == null ? void 0 : context.entityId)) {
			contextPrefix += " (";
			const parts = [];
			if (context.entityName) parts.push(context.entityName);
			if (context.entityId) parts.push(`id: "${context.entityId}"`);
			contextPrefix += parts.join(", ");
			contextPrefix += ")";
		}
		super({
			name: name14$1,
			message: `${contextPrefix}: Value: ${JSON.stringify(value)}.
Error message: ${getErrorMessage(cause)}`,
			cause
		});
		this[_a15$1] = true;
		this.value = value;
		this.context = context;
	}
	static isInstance(error) {
		return AISDKError.hasMarker(error, marker15$1);
	}
	/**
	* Wraps an error into a TypeValidationError.
	* If the cause is already a TypeValidationError with the same value and context, it returns the cause.
	* Otherwise, it creates a new TypeValidationError.
	*
	* @param {Object} params - The parameters for wrapping the error.
	* @param {unknown} params.value - The value that failed validation.
	* @param {unknown} params.cause - The original error or cause of the validation failure.
	* @param {TypeValidationContext} params.context - Optional context about what is being validated.
	* @returns {TypeValidationError} A TypeValidationError instance.
	*/
	static wrap({ value, cause, context }) {
		var _a17, _b17, _c;
		if (_TypeValidationError.isInstance(cause) && cause.value === value && ((_a17 = cause.context) == null ? void 0 : _a17.field) === (context == null ? void 0 : context.field) && ((_b17 = cause.context) == null ? void 0 : _b17.entityName) === (context == null ? void 0 : context.entityName) && ((_c = cause.context) == null ? void 0 : _c.entityId) === (context == null ? void 0 : context.entityId)) return cause;
		return new _TypeValidationError({
			value,
			cause,
			context
		});
	}
};
var name15$1 = "AI_UnsupportedFunctionalityError";
var marker16$1 = `vercel.ai.error.${name15$1}`;
var symbol16$1 = Symbol.for(marker16$1);
var _a16$1;
var _b16$1;
var UnsupportedFunctionalityError = class extends (_b16$1 = AISDKError, _a16$1 = symbol16$1, _b16$1) {
	constructor({ functionality, message = `'${functionality}' functionality not supported.` }) {
		super({
			name: name15$1,
			message
		});
		this[_a16$1] = true;
		this.functionality = functionality;
	}
	static isInstance(error) {
		return AISDKError.hasMarker(error, marker16$1);
	}
};
Object.freeze({ status: "aborted" });
function $constructor(name, initializer, params) {
	function init(inst, def) {
		if (!inst._zod) Object.defineProperty(inst, "_zod", {
			value: {
				def,
				constr: _,
				traits: /* @__PURE__ */ new Set()
			},
			enumerable: false
		});
		if (inst._zod.traits.has(name)) return;
		inst._zod.traits.add(name);
		initializer(inst, def);
		const proto = _.prototype;
		const keys = Object.keys(proto);
		for (let i = 0; i < keys.length; i++) {
			const k = keys[i];
			if (!(k in inst)) inst[k] = proto[k].bind(inst);
		}
	}
	const Parent = params?.Parent ?? Object;
	class Definition extends Parent {}
	Object.defineProperty(Definition, "name", { value: name });
	function _(def) {
		var _a;
		const inst = params?.Parent ? new Definition() : this;
		init(inst, def);
		(_a = inst._zod).deferred ?? (_a.deferred = []);
		for (const fn of inst._zod.deferred) fn();
		return inst;
	}
	Object.defineProperty(_, "init", { value: init });
	Object.defineProperty(_, Symbol.hasInstance, { value: (inst) => {
		if (params?.Parent && inst instanceof params.Parent) return true;
		return inst?._zod?.traits?.has(name);
	} });
	Object.defineProperty(_, "name", { value: name });
	return _;
}
var $ZodAsyncError = class extends Error {
	constructor() {
		super(`Encountered Promise during synchronous parse. Use .parseAsync() instead.`);
	}
};
var $ZodEncodeError = class extends Error {
	constructor(name) {
		super(`Encountered unidirectional transform during encode: ${name}`);
		this.name = "ZodEncodeError";
	}
};
var globalConfig = {};
function config(newConfig) {
	if (newConfig) Object.assign(globalConfig, newConfig);
	return globalConfig;
}

export { $ZodAsyncError, $ZodEncodeError, $constructor, AISDKError, APICallError, EmptyResponseBodyError, InvalidArgumentError$1, JSONParseError, TypeValidationError, UnsupportedFunctionalityError, config, globalConfig };
