// Reconstructed from index-C74mRL57.js — original module: vendor/ai
import { AISDKError, APICallError, EmptyResponseBodyError, TypeValidationError, UnsupportedFunctionalityError } from "./@ai-sdk/provider.js";
import { _enum, _instanceof, _null, array, boolean, custom, discriminatedUnion, lazy, literal, looseObject, never, number, object, record, string, union, unknown } from "./zod.js";
import { asSchema, createIdGenerator, generateId, isBuffer, lazySchema, normalizeHeaders, parseJsonEventStream, resolve, safeParseJSON, safeValidateTypes, validateTypes, zodSchema } from "./eventsource-parser.js";

var __defProp = Object.defineProperty;
var __export = (target, all) => {
	for (var name25 in all) __defProp(target, name25, {
		get: all[name25],
		enumerable: true
	});
};
var name = "AI_InvalidArgumentError";
var marker = `vercel.ai.error.${name}`;
var symbol = Symbol.for(marker);
var _a$2;
var _b$1;
var InvalidArgumentError = class extends (_b$1 = AISDKError, _a$2 = symbol, _b$1) {
	constructor({ parameter, value, message }) {
		super({
			name,
			message: `Invalid argument for parameter ${parameter}: ${message}`
		});
		this[_a$2] = true;
		this.parameter = parameter;
		this.value = value;
	}
	static isInstance(error) {
		return AISDKError.hasMarker(error, marker);
	}
};
var name9 = "AI_NoObjectGeneratedError";
var marker9 = `vercel.ai.error.${name9}`;
var symbol9 = Symbol.for(marker9);
var _a9;
var _b9;
var NoObjectGeneratedError = class extends (_b9 = AISDKError, _a9 = symbol9, _b9) {
	constructor({ message = "No object generated.", cause, text: text2, response, usage, finishReason }) {
		super({
			name: name9,
			message,
			cause
		});
		this[_a9] = true;
		this.text = text2;
		this.response = response;
		this.usage = usage;
		this.finishReason = finishReason;
	}
	static isInstance(error) {
		return AISDKError.hasMarker(error, marker9);
	}
};
var name19 = "AI_UIMessageStreamError";
var marker19 = `vercel.ai.error.${name19}`;
var symbol19 = Symbol.for(marker19);
var _a19;
var _b19;
var UIMessageStreamError = class extends (_b19 = AISDKError, _a19 = symbol19, _b19) {
	constructor({ chunkType, chunkId, message }) {
		super({
			name: name19,
			message
		});
		this[_a19] = true;
		this.chunkType = chunkType;
		this.chunkId = chunkId;
	}
	static isInstance(error) {
		return AISDKError.hasMarker(error, marker19);
	}
};
function formatWarning({ warning, provider, model }) {
	const prefix = `AI SDK Warning${provider != null && model != null ? ` (${provider} / ${model})` : ""}:`;
	switch (warning.type) {
		case "unsupported": {
			let message = `${prefix} The feature "${warning.feature}" is not supported.`;
			if (warning.details) message += ` ${warning.details}`;
			return message;
		}
		case "compatibility": {
			let message = `${prefix} The feature "${warning.feature}" is used in a compatibility mode.`;
			if (warning.details) message += ` ${warning.details}`;
			return message;
		}
		case "deprecated": return `${prefix} Deprecated: "${warning.setting}". ${warning.message}`;
		case "other": return `${prefix} ${warning.message}`;
		default: return `${prefix} ${JSON.stringify(warning, null, 2)}`;
	}
}
var FIRST_WARNING_INFO_MESSAGE = "AI SDK Warning System: To turn off warning logging, set the AI_SDK_LOG_WARNINGS global to false.";
var hasLoggedBefore = false;
function emitWarning({ message, type }) {
	if (typeof process !== "undefined" && typeof process.emitWarning === "function") process.emitWarning(message, { type });
	else console.warn(message);
}
var logWarnings = (options) => {
	if (options.warnings.length === 0) return;
	const logger = globalThis.AI_SDK_LOG_WARNINGS;
	if (logger === false) return;
	if (typeof logger === "function") {
		logger(options);
		return;
	}
	if (!hasLoggedBefore) {
		hasLoggedBefore = true;
		emitWarning({
			message: FIRST_WARNING_INFO_MESSAGE,
			type: "Warning"
		});
	}
	for (const warning of options.warnings) emitWarning({
		message: formatWarning({
			warning,
			provider: options.provider,
			model: options.model
		}),
		type: warning.type === "deprecated" ? "DeprecationWarning" : "Warning"
	});
};
function mergeObjects(base, overrides) {
	if (base === void 0 && overrides === void 0) return;
	if (base === void 0) return overrides;
	if (overrides === void 0) return base;
	const result = { ...base };
	for (const key in overrides) {
		if (key === "__proto__" || key === "constructor" || key === "prototype") continue;
		if (Object.prototype.hasOwnProperty.call(overrides, key)) {
			const overridesValue = overrides[key];
			if (overridesValue === void 0) continue;
			const baseValue = key in base ? base[key] : void 0;
			const isSourceObject = overridesValue !== null && typeof overridesValue === "object" && !Array.isArray(overridesValue) && !(overridesValue instanceof Date) && !(overridesValue instanceof RegExp);
			const isTargetObject = baseValue !== null && baseValue !== void 0 && typeof baseValue === "object" && !Array.isArray(baseValue) && !(baseValue instanceof Date) && !(baseValue instanceof RegExp);
			if (isSourceObject && isTargetObject) result[key] = mergeObjects(baseValue, overridesValue);
			else result[key] = overridesValue;
		}
	}
	return result;
}
var z$1 = {
	array,
	boolean,
	custom,
	discriminatedUnion,
	enum: _enum,
	instanceof: _instanceof,
	lazy,
	literal,
	looseObject,
	never,
	null: _null,
	number,
	object,
	record,
	string,
	union,
	unknown
};
var jsonValueSchema = z$1.lazy(() => z$1.union([
	z$1.null(),
	z$1.string(),
	z$1.number(),
	z$1.boolean(),
	z$1.record(z$1.string(), jsonValueSchema.optional()),
	z$1.array(jsonValueSchema)
]));
var providerMetadataSchema = z$1.record(z$1.string(), z$1.record(z$1.string(), jsonValueSchema.optional()));
var fileInlineDataSchema = z$1.union([
	z$1.string(),
	z$1.instanceof(Uint8Array),
	z$1.instanceof(ArrayBuffer),
	z$1.custom(isBuffer, { message: "Must be a Buffer" })
]);
var providerReferenceSchema = z$1.record(z$1.string(), z$1.string());
var textPartSchema = z$1.object({
	type: z$1.literal("text"),
	text: z$1.string(),
	providerOptions: providerMetadataSchema.optional()
});
var imagePartSchema = z$1.object({
	type: z$1.literal("image"),
	image: z$1.union([
		fileInlineDataSchema,
		z$1.instanceof(URL),
		providerReferenceSchema
	]),
	mediaType: z$1.string().optional(),
	providerOptions: providerMetadataSchema.optional()
});
var taggedFileDataSchema = z$1.discriminatedUnion("type", [
	z$1.object({
		type: z$1.literal("data"),
		data: fileInlineDataSchema
	}),
	z$1.object({
		type: z$1.literal("url"),
		url: z$1.instanceof(URL)
	}),
	z$1.object({
		type: z$1.literal("reference"),
		reference: providerReferenceSchema
	}),
	z$1.object({
		type: z$1.literal("text"),
		text: z$1.string()
	})
]);
var taggedReasoningFileDataSchema = z$1.discriminatedUnion("type", [z$1.object({
	type: z$1.literal("data"),
	data: fileInlineDataSchema
}), z$1.object({
	type: z$1.literal("url"),
	url: z$1.instanceof(URL)
})]);
var filePartSchema = z$1.object({
	type: z$1.literal("file"),
	data: z$1.union([
		taggedFileDataSchema,
		fileInlineDataSchema,
		z$1.instanceof(URL),
		providerReferenceSchema
	]),
	filename: z$1.string().optional(),
	mediaType: z$1.string(),
	providerOptions: providerMetadataSchema.optional()
});
var reasoningPartSchema = z$1.object({
	type: z$1.literal("reasoning"),
	text: z$1.string(),
	providerOptions: providerMetadataSchema.optional()
});
var customPartSchema = z$1.object({
	type: z$1.literal("custom"),
	kind: z$1.string().transform((value) => value),
	providerOptions: providerMetadataSchema.optional()
});
var reasoningFilePartSchema = z$1.object({
	type: z$1.literal("reasoning-file"),
	data: z$1.union([
		taggedReasoningFileDataSchema,
		fileInlineDataSchema,
		z$1.instanceof(URL)
	]),
	mediaType: z$1.string(),
	providerOptions: providerMetadataSchema.optional()
});
var toolCallPartSchema = z$1.object({
	type: z$1.literal("tool-call"),
	toolCallId: z$1.string(),
	toolName: z$1.string(),
	input: z$1.unknown(),
	providerOptions: providerMetadataSchema.optional(),
	providerExecuted: z$1.boolean().optional()
});
var outputSchema = z$1.discriminatedUnion("type", [
	z$1.object({
		type: z$1.literal("text"),
		value: z$1.string(),
		providerOptions: providerMetadataSchema.optional()
	}),
	z$1.object({
		type: z$1.literal("json"),
		value: jsonValueSchema,
		providerOptions: providerMetadataSchema.optional()
	}),
	z$1.object({
		type: z$1.literal("execution-denied"),
		reason: z$1.string().optional(),
		providerOptions: providerMetadataSchema.optional()
	}),
	z$1.object({
		type: z$1.literal("error-text"),
		value: z$1.string(),
		providerOptions: providerMetadataSchema.optional()
	}),
	z$1.object({
		type: z$1.literal("error-json"),
		value: jsonValueSchema,
		providerOptions: providerMetadataSchema.optional()
	}),
	z$1.object({
		type: z$1.literal("content"),
		value: z$1.array(z$1.union([
			z$1.object({
				type: z$1.literal("text"),
				text: z$1.string(),
				providerOptions: providerMetadataSchema.optional()
			}),
			z$1.object({
				type: z$1.literal("file"),
				data: taggedFileDataSchema,
				mediaType: z$1.string(),
				filename: z$1.string().optional(),
				providerOptions: providerMetadataSchema.optional()
			}),
			z$1.object({
				type: z$1.literal("file-data"),
				data: z$1.string(),
				mediaType: z$1.string(),
				filename: z$1.string().optional(),
				providerOptions: providerMetadataSchema.optional()
			}),
			z$1.object({
				type: z$1.literal("file-url"),
				url: z$1.string(),
				mediaType: z$1.string().optional(),
				providerOptions: providerMetadataSchema.optional()
			}),
			z$1.object({
				type: z$1.literal("file-id"),
				fileId: z$1.union([z$1.string(), z$1.record(z$1.string(), z$1.string())]),
				providerOptions: providerMetadataSchema.optional()
			}),
			z$1.object({
				type: z$1.literal("file-reference"),
				providerReference: z$1.record(z$1.string(), z$1.string()),
				providerOptions: providerMetadataSchema.optional()
			}),
			z$1.object({
				type: z$1.literal("image-data"),
				data: z$1.string(),
				mediaType: z$1.string(),
				providerOptions: providerMetadataSchema.optional()
			}),
			z$1.object({
				type: z$1.literal("image-url"),
				url: z$1.string(),
				providerOptions: providerMetadataSchema.optional()
			}),
			z$1.object({
				type: z$1.literal("image-file-id"),
				fileId: z$1.union([z$1.string(), z$1.record(z$1.string(), z$1.string())]),
				providerOptions: providerMetadataSchema.optional()
			}),
			z$1.object({
				type: z$1.literal("image-file-reference"),
				providerReference: z$1.record(z$1.string(), z$1.string()),
				providerOptions: providerMetadataSchema.optional()
			}),
			z$1.object({
				type: z$1.literal("custom"),
				providerOptions: providerMetadataSchema.optional()
			})
		]))
	})
]);
var toolResultPartSchema = z$1.object({
	type: z$1.literal("tool-result"),
	toolCallId: z$1.string(),
	toolName: z$1.string(),
	output: outputSchema,
	providerOptions: providerMetadataSchema.optional()
});
var toolApprovalRequestSchema = z$1.object({
	type: z$1.literal("tool-approval-request"),
	approvalId: z$1.string(),
	toolCallId: z$1.string(),
	reason: z$1.string().optional()
});
var toolApprovalResponseSchema = z$1.object({
	type: z$1.literal("tool-approval-response"),
	approvalId: z$1.string(),
	approved: z$1.boolean(),
	reason: z$1.string().optional()
});
var systemModelMessageSchema = z$1.object({
	role: z$1.literal("system"),
	content: z$1.string(),
	providerOptions: providerMetadataSchema.optional()
});
var userModelMessageSchema = z$1.object({
	role: z$1.literal("user"),
	content: z$1.union([z$1.string(), z$1.array(z$1.union([
		textPartSchema,
		imagePartSchema,
		filePartSchema
	]))]),
	providerOptions: providerMetadataSchema.optional()
});
var assistantModelMessageSchema = z$1.object({
	role: z$1.literal("assistant"),
	content: z$1.union([z$1.string(), z$1.array(z$1.union([
		textPartSchema,
		customPartSchema,
		filePartSchema,
		reasoningPartSchema,
		reasoningFilePartSchema,
		toolCallPartSchema,
		toolResultPartSchema,
		toolApprovalRequestSchema
	]))]),
	providerOptions: providerMetadataSchema.optional()
});
var toolModelMessageSchema = z$1.object({
	role: z$1.literal("tool"),
	content: z$1.array(z$1.union([toolResultPartSchema, toolApprovalResponseSchema])),
	providerOptions: providerMetadataSchema.optional()
});
z$1.union([
	systemModelMessageSchema,
	userModelMessageSchema,
	assistantModelMessageSchema,
	toolModelMessageSchema
]);
__export({}, {
	array: () => array2,
	choice: () => choice,
	json: () => json,
	object: () => object2,
	text: () => text
});
function fixJson(input) {
	const stack = ["ROOT"];
	let lastValidIndex = -1;
	let literalStart = null;
	let unicodeEscapeDigits = 0;
	function isHexDigit(char) {
		return char >= "0" && char <= "9" || char >= "A" && char <= "F" || char >= "a" && char <= "f";
	}
	function processValueStart(char, i, swapState) {
		switch (char) {
			case "\"":
				lastValidIndex = i;
				stack.pop();
				stack.push(swapState);
				stack.push("INSIDE_STRING");
				break;
			case "f":
			case "t":
			case "n":
				lastValidIndex = i;
				literalStart = i;
				stack.pop();
				stack.push(swapState);
				stack.push("INSIDE_LITERAL");
				break;
			case "-":
				stack.pop();
				stack.push(swapState);
				stack.push("INSIDE_NUMBER");
				break;
			case "0":
			case "1":
			case "2":
			case "3":
			case "4":
			case "5":
			case "6":
			case "7":
			case "8":
			case "9":
				lastValidIndex = i;
				stack.pop();
				stack.push(swapState);
				stack.push("INSIDE_NUMBER");
				break;
			case "{":
				lastValidIndex = i;
				stack.pop();
				stack.push(swapState);
				stack.push("INSIDE_OBJECT_START");
				break;
			case "[":
				lastValidIndex = i;
				stack.pop();
				stack.push(swapState);
				stack.push("INSIDE_ARRAY_START");
		}
	}
	function processAfterObjectValue(char, i) {
		switch (char) {
			case ",":
				stack.pop();
				stack.push("INSIDE_OBJECT_AFTER_COMMA");
				break;
			case "}":
				lastValidIndex = i;
				stack.pop();
		}
	}
	function processAfterArrayValue(char, i) {
		switch (char) {
			case ",":
				stack.pop();
				stack.push("INSIDE_ARRAY_AFTER_COMMA");
				break;
			case "]":
				lastValidIndex = i;
				stack.pop();
		}
	}
	for (let i = 0; i < input.length; i++) {
		const char = input[i];
		switch (stack[stack.length - 1]) {
			case "ROOT":
				processValueStart(char, i, "FINISH");
				break;
			case "INSIDE_OBJECT_START":
				switch (char) {
					case "\"":
						stack.pop();
						stack.push("INSIDE_OBJECT_KEY");
						break;
					case "}":
						lastValidIndex = i;
						stack.pop();
				}
				break;
			case "INSIDE_OBJECT_AFTER_COMMA":
				switch (char) {
					case "\"":
						stack.pop();
						stack.push("INSIDE_OBJECT_KEY");
				}
				break;
			case "INSIDE_OBJECT_KEY":
				switch (char) {
					case "\"":
						stack.pop();
						stack.push("INSIDE_OBJECT_AFTER_KEY");
				}
				break;
			case "INSIDE_OBJECT_AFTER_KEY":
				switch (char) {
					case ":":
						stack.pop();
						stack.push("INSIDE_OBJECT_BEFORE_VALUE");
				}
				break;
			case "INSIDE_OBJECT_BEFORE_VALUE":
				processValueStart(char, i, "INSIDE_OBJECT_AFTER_VALUE");
				break;
			case "INSIDE_OBJECT_AFTER_VALUE":
				processAfterObjectValue(char, i);
				break;
			case "INSIDE_STRING":
				switch (char) {
					case "\"":
						stack.pop();
						lastValidIndex = i;
						break;
					case "\\":
						stack.push("INSIDE_STRING_ESCAPE");
						break;
					default: lastValidIndex = i;
				}
				break;
			case "INSIDE_ARRAY_START":
				switch (char) {
					case "]":
						lastValidIndex = i;
						stack.pop();
						break;
					default:
						lastValidIndex = i;
						processValueStart(char, i, "INSIDE_ARRAY_AFTER_VALUE");
				}
				break;
			case "INSIDE_ARRAY_AFTER_VALUE":
				switch (char) {
					case ",":
						stack.pop();
						stack.push("INSIDE_ARRAY_AFTER_COMMA");
						break;
					case "]":
						lastValidIndex = i;
						stack.pop();
						break;
					default: lastValidIndex = i;
				}
				break;
			case "INSIDE_ARRAY_AFTER_COMMA":
				processValueStart(char, i, "INSIDE_ARRAY_AFTER_VALUE");
				break;
			case "INSIDE_STRING_ESCAPE":
				stack.pop();
				if (char === "u") {
					unicodeEscapeDigits = 0;
					stack.push("INSIDE_STRING_UNICODE_ESCAPE");
				} else lastValidIndex = i;
				break;
			case "INSIDE_STRING_UNICODE_ESCAPE":
				if (isHexDigit(char)) {
					unicodeEscapeDigits++;
					if (unicodeEscapeDigits === 4) {
						stack.pop();
						lastValidIndex = i;
					}
				}
				break;
			case "INSIDE_NUMBER":
				switch (char) {
					case "0":
					case "1":
					case "2":
					case "3":
					case "4":
					case "5":
					case "6":
					case "7":
					case "8":
					case "9":
						lastValidIndex = i;
						break;
					case "e":
					case "E":
					case "-":
					case ".": break;
					case ",":
						stack.pop();
						if (stack[stack.length - 1] === "INSIDE_ARRAY_AFTER_VALUE") processAfterArrayValue(char, i);
						if (stack[stack.length - 1] === "INSIDE_OBJECT_AFTER_VALUE") processAfterObjectValue(char, i);
						break;
					case "}":
						stack.pop();
						if (stack[stack.length - 1] === "INSIDE_OBJECT_AFTER_VALUE") processAfterObjectValue(char, i);
						break;
					case "]":
						stack.pop();
						if (stack[stack.length - 1] === "INSIDE_ARRAY_AFTER_VALUE") processAfterArrayValue(char, i);
						break;
					default: stack.pop();
				}
				break;
			case "INSIDE_LITERAL": {
				const partialLiteral = input.substring(literalStart, i + 1);
				if (!"false".startsWith(partialLiteral) && !"true".startsWith(partialLiteral) && !"null".startsWith(partialLiteral)) {
					stack.pop();
					if (stack[stack.length - 1] === "INSIDE_OBJECT_AFTER_VALUE") processAfterObjectValue(char, i);
					else if (stack[stack.length - 1] === "INSIDE_ARRAY_AFTER_VALUE") processAfterArrayValue(char, i);
				} else lastValidIndex = i;
				break;
			}
		}
	}
	let result = input.slice(0, lastValidIndex + 1);
	for (let i = stack.length - 1; i >= 0; i--) switch (stack[i]) {
		case "INSIDE_STRING":
			result += "\"";
			break;
		case "INSIDE_OBJECT_KEY":
		case "INSIDE_OBJECT_AFTER_KEY":
		case "INSIDE_OBJECT_AFTER_COMMA":
		case "INSIDE_OBJECT_START":
		case "INSIDE_OBJECT_BEFORE_VALUE":
		case "INSIDE_OBJECT_AFTER_VALUE":
			result += "}";
			break;
		case "INSIDE_ARRAY_START":
		case "INSIDE_ARRAY_AFTER_COMMA":
		case "INSIDE_ARRAY_AFTER_VALUE":
			result += "]";
			break;
		case "INSIDE_LITERAL": {
			const partialLiteral = input.substring(literalStart, input.length);
			if ("true".startsWith(partialLiteral)) result += "true".slice(partialLiteral.length);
			else if ("false".startsWith(partialLiteral)) result += "false".slice(partialLiteral.length);
			else if ("null".startsWith(partialLiteral)) result += "null".slice(partialLiteral.length);
		}
	}
	return result;
}
async function parsePartialJson(jsonText) {
	if (jsonText === void 0) return {
		value: void 0,
		state: "undefined-input"
	};
	let result = await safeParseJSON({ text: jsonText });
	if (result.success) return {
		value: result.value,
		state: "successful-parse"
	};
	result = await safeParseJSON({ text: fixJson(jsonText) });
	if (result.success) return {
		value: result.value,
		state: "repaired-parse"
	};
	return {
		value: void 0,
		state: "failed-parse"
	};
}
var text = () => ({
	name: "text",
	responseFormat: Promise.resolve({ type: "text" }),
	async parseCompleteOutput({ text: text2 }) {
		return text2;
	},
	async parsePartialOutput({ text: text2 }) {
		return { partial: text2 };
	},
	createElementStreamTransform() {}
});
var object2 = ({ schema: inputSchema, name: name25, description }) => {
	const schema = asSchema(inputSchema);
	return {
		name: "object",
		responseFormat: resolve(schema.jsonSchema).then((jsonSchema3) => ({
			type: "json",
			schema: jsonSchema3,
			...name25 != null && { name: name25 },
			...description != null && { description }
		})),
		async parseCompleteOutput({ text: text2 }, context) {
			const parseResult = await safeParseJSON({ text: text2 });
			if (!parseResult.success) throw new NoObjectGeneratedError({
				message: "No object generated: could not parse the response.",
				cause: parseResult.error,
				text: text2,
				response: context.response,
				usage: context.usage,
				finishReason: context.finishReason
			});
			const validationResult = await safeValidateTypes({
				value: parseResult.value,
				schema
			});
			if (!validationResult.success) throw new NoObjectGeneratedError({
				message: "No object generated: response did not match schema.",
				cause: validationResult.error,
				text: text2,
				response: context.response,
				usage: context.usage,
				finishReason: context.finishReason
			});
			return validationResult.value;
		},
		async parsePartialOutput({ text: text2 }) {
			const result = await parsePartialJson(text2);
			switch (result.state) {
				case "failed-parse":
				case "undefined-input": return;
				case "repaired-parse":
				case "successful-parse": return { partial: result.value };
			}
		},
		createElementStreamTransform() {}
	};
};
var array2 = ({ element: inputElementSchema, minItems, maxItems, name: name25, description }) => {
	validateArrayBound({
		name: "minItems",
		value: minItems
	});
	validateArrayBound({
		name: "maxItems",
		value: maxItems
	});
	if (minItems != null && maxItems != null && minItems > maxItems) throw new InvalidArgumentError({
		parameter: "minItems",
		value: minItems,
		message: "minItems must be less than or equal to maxItems"
	});
	const elementSchema = asSchema(inputElementSchema);
	return {
		name: "array",
		responseFormat: resolve(elementSchema.jsonSchema).then((jsonSchema3) => {
			const { $schema: _$schema, definitions, $defs, ...itemSchema } = jsonSchema3;
			return {
				type: "json",
				schema: {
					$schema: "http://json-schema.org/draft-07/schema#",
					...definitions != null && { definitions },
					...$defs != null && { $defs },
					type: "object",
					properties: { elements: {
						type: "array",
						items: itemSchema,
						...minItems != null && { minItems },
						...maxItems != null && { maxItems }
					} },
					required: ["elements"],
					additionalProperties: false
				},
				...name25 != null && { name: name25 },
				...description != null && { description }
			};
		}),
		async parseCompleteOutput({ text: text2 }, context) {
			const parseResult = await safeParseJSON({ text: text2 });
			if (!parseResult.success) throw new NoObjectGeneratedError({
				message: "No object generated: could not parse the response.",
				cause: parseResult.error,
				text: text2,
				response: context.response,
				usage: context.usage,
				finishReason: context.finishReason
			});
			const outerValue = parseResult.value;
			if (outerValue == null || typeof outerValue !== "object" || !("elements" in outerValue) || !Array.isArray(outerValue.elements)) throw new NoObjectGeneratedError({
				message: "No object generated: response did not match schema.",
				cause: new TypeValidationError({
					value: outerValue,
					cause: "response must be an object with an elements array"
				}),
				text: text2,
				response: context.response,
				usage: context.usage,
				finishReason: context.finishReason
			});
			const lengthValidationError = getArrayLengthValidationError({
				value: outerValue.elements,
				minItems,
				maxItems
			});
			if (lengthValidationError != null) throw new NoObjectGeneratedError({
				message: "No object generated: response did not match schema.",
				cause: lengthValidationError,
				text: text2,
				response: context.response,
				usage: context.usage,
				finishReason: context.finishReason
			});
			const validatedElements = [];
			for (const element of outerValue.elements) {
				const validationResult = await safeValidateTypes({
					value: element,
					schema: elementSchema
				});
				if (!validationResult.success) throw new NoObjectGeneratedError({
					message: "No object generated: response did not match schema.",
					cause: validationResult.error,
					text: text2,
					response: context.response,
					usage: context.usage,
					finishReason: context.finishReason
				});
				validatedElements.push(validationResult.value);
			}
			return validatedElements;
		},
		async parsePartialOutput({ text: text2 }) {
			const result = await parsePartialJson(text2);
			switch (result.state) {
				case "failed-parse":
				case "undefined-input": return;
				case "repaired-parse":
				case "successful-parse": {
					const outerValue = result.value;
					if (outerValue == null || typeof outerValue !== "object" || !("elements" in outerValue) || !Array.isArray(outerValue.elements)) return;
					const rawElements = result.state === "repaired-parse" && outerValue.elements.length > 0 ? outerValue.elements.slice(0, -1) : outerValue.elements;
					const parsedElements = [];
					for (const rawElement of rawElements) {
						const validationResult = await safeValidateTypes({
							value: rawElement,
							schema: elementSchema
						});
						if (validationResult.success) parsedElements.push(validationResult.value);
					}
					return { partial: parsedElements };
				}
			}
		},
		createElementStreamTransform() {
			let publishedElements = 0;
			return new TransformStream({ transform({ partialOutput }, controller) {
				if (partialOutput != null) for (; publishedElements < partialOutput.length; publishedElements++) {
					if (maxItems != null && publishedElements >= maxItems) {
						controller.error(getArrayLengthValidationError({
							value: partialOutput,
							maxItems
						}));
						return;
					}
					controller.enqueue(partialOutput[publishedElements]);
				}
			} });
		}
	};
};
function validateArrayBound({ name: name25, value }) {
	if (value == null) return;
	if (!Number.isInteger(value)) throw new InvalidArgumentError({
		parameter: name25,
		value,
		message: `${name25} must be an integer`
	});
	if (value < 0) throw new InvalidArgumentError({
		parameter: name25,
		value,
		message: `${name25} must be greater than or equal to 0`
	});
}
function getArrayLengthValidationError({ value, minItems, maxItems }) {
	if (minItems != null && value.length < minItems) return new TypeValidationError({
		value,
		cause: `elements array must contain at least ${minItems} items`
	});
	if (maxItems != null && value.length > maxItems) return new TypeValidationError({
		value,
		cause: `elements array must contain at most ${maxItems} items`
	});
}
var choice = ({ options: choiceOptions, name: name25, description }) => {
	return {
		name: "choice",
		responseFormat: Promise.resolve({
			type: "json",
			schema: {
				$schema: "http://json-schema.org/draft-07/schema#",
				type: "object",
				properties: { result: {
					type: "string",
					enum: choiceOptions
				} },
				required: ["result"],
				additionalProperties: false
			},
			...name25 != null && { name: name25 },
			...description != null && { description }
		}),
		async parseCompleteOutput({ text: text2 }, context) {
			const parseResult = await safeParseJSON({ text: text2 });
			if (!parseResult.success) throw new NoObjectGeneratedError({
				message: "No object generated: could not parse the response.",
				cause: parseResult.error,
				text: text2,
				response: context.response,
				usage: context.usage,
				finishReason: context.finishReason
			});
			const outerValue = parseResult.value;
			if (outerValue == null || typeof outerValue !== "object" || !("result" in outerValue) || typeof outerValue.result !== "string" || !choiceOptions.includes(outerValue.result)) throw new NoObjectGeneratedError({
				message: "No object generated: response did not match schema.",
				cause: new TypeValidationError({
					value: outerValue,
					cause: "response must be an object that contains a choice value."
				}),
				text: text2,
				response: context.response,
				usage: context.usage,
				finishReason: context.finishReason
			});
			return outerValue.result;
		},
		async parsePartialOutput({ text: text2 }) {
			const result = await parsePartialJson(text2);
			switch (result.state) {
				case "failed-parse":
				case "undefined-input": return;
				case "repaired-parse":
				case "successful-parse": {
					const outerValue = result.value;
					if (outerValue == null || typeof outerValue !== "object" || !("result" in outerValue) || typeof outerValue.result !== "string") return;
					const potentialMatches = choiceOptions.filter((choiceOption) => choiceOption.startsWith(outerValue.result));
					if (result.state === "successful-parse") return potentialMatches.includes(outerValue.result) ? { partial: outerValue.result } : void 0;
					else return potentialMatches.length === 1 ? { partial: potentialMatches[0] } : void 0;
				}
			}
		},
		createElementStreamTransform() {}
	};
};
var json = ({ name: name25, description } = {}) => {
	return {
		name: "json",
		responseFormat: Promise.resolve({
			type: "json",
			...name25 != null && { name: name25 },
			...description != null && { description }
		}),
		async parseCompleteOutput({ text: text2 }, context) {
			const parseResult = await safeParseJSON({ text: text2 });
			if (!parseResult.success) throw new NoObjectGeneratedError({
				message: "No object generated: could not parse the response.",
				cause: parseResult.error,
				text: text2,
				response: context.response,
				usage: context.usage,
				finishReason: context.finishReason
			});
			return parseResult.value;
		},
		async parsePartialOutput({ text: text2 }) {
			const result = await parsePartialJson(text2);
			switch (result.state) {
				case "failed-parse":
				case "undefined-input": return;
				case "repaired-parse":
				case "successful-parse": return result.value === void 0 ? void 0 : { partial: result.value };
			}
		},
		createElementStreamTransform() {}
	};
};
new TextEncoder();
new TextEncoder();
createIdGenerator({
	prefix: "aitxt",
	size: 24
});
createIdGenerator({
	prefix: "call",
	size: 24
});
TransformStream;
var toolMetadataSchema = z$1.record(z$1.string(), jsonValueSchema.optional());
var uiMessageChunkSchema = lazySchema(() => zodSchema(z$1.union([
	z$1.looseObject({
		type: z$1.literal("text-start"),
		id: z$1.string(),
		providerMetadata: providerMetadataSchema.optional()
	}),
	z$1.looseObject({
		type: z$1.literal("text-delta"),
		id: z$1.string(),
		delta: z$1.string(),
		providerMetadata: providerMetadataSchema.optional()
	}),
	z$1.looseObject({
		type: z$1.literal("text-end"),
		id: z$1.string(),
		providerMetadata: providerMetadataSchema.optional()
	}),
	z$1.looseObject({
		type: z$1.literal("error"),
		errorText: z$1.string()
	}),
	z$1.looseObject({
		type: z$1.literal("tool-input-start"),
		toolCallId: z$1.string(),
		toolName: z$1.string(),
		providerExecuted: z$1.boolean().optional(),
		providerMetadata: providerMetadataSchema.optional(),
		toolMetadata: toolMetadataSchema.optional(),
		dynamic: z$1.boolean().optional(),
		title: z$1.string().optional()
	}),
	z$1.looseObject({
		type: z$1.literal("tool-input-delta"),
		toolCallId: z$1.string(),
		inputTextDelta: z$1.string()
	}),
	z$1.looseObject({
		type: z$1.literal("tool-input-available"),
		toolCallId: z$1.string(),
		toolName: z$1.string(),
		input: z$1.unknown(),
		providerExecuted: z$1.boolean().optional(),
		providerMetadata: providerMetadataSchema.optional(),
		toolMetadata: toolMetadataSchema.optional(),
		dynamic: z$1.boolean().optional(),
		title: z$1.string().optional()
	}),
	z$1.looseObject({
		type: z$1.literal("tool-input-error"),
		toolCallId: z$1.string(),
		toolName: z$1.string(),
		input: z$1.unknown(),
		providerExecuted: z$1.boolean().optional(),
		providerMetadata: providerMetadataSchema.optional(),
		toolMetadata: toolMetadataSchema.optional(),
		dynamic: z$1.boolean().optional(),
		errorText: z$1.string(),
		title: z$1.string().optional()
	}),
	z$1.looseObject({
		type: z$1.literal("tool-approval-request"),
		approvalId: z$1.string(),
		toolCallId: z$1.string(),
		approvalDescriptor: z$1.unknown().optional(),
		reason: z$1.string().optional(),
		isAutomatic: z$1.boolean().optional(),
		signature: z$1.string().optional()
	}),
	z$1.looseObject({
		type: z$1.literal("tool-approval-response"),
		approvalId: z$1.string(),
		approved: z$1.boolean(),
		reason: z$1.string().optional(),
		providerExecuted: z$1.boolean().optional(),
		providerMetadata: providerMetadataSchema.optional()
	}),
	z$1.looseObject({
		type: z$1.literal("tool-output-available"),
		toolCallId: z$1.string(),
		output: z$1.unknown(),
		providerExecuted: z$1.boolean().optional(),
		providerMetadata: providerMetadataSchema.optional(),
		toolMetadata: toolMetadataSchema.optional(),
		dynamic: z$1.boolean().optional(),
		preliminary: z$1.boolean().optional()
	}),
	z$1.looseObject({
		type: z$1.literal("tool-output-error"),
		toolCallId: z$1.string(),
		errorText: z$1.string(),
		providerExecuted: z$1.boolean().optional(),
		providerMetadata: providerMetadataSchema.optional(),
		toolMetadata: toolMetadataSchema.optional(),
		dynamic: z$1.boolean().optional()
	}),
	z$1.looseObject({
		type: z$1.literal("tool-output-denied"),
		toolCallId: z$1.string()
	}),
	z$1.looseObject({
		type: z$1.literal("reasoning-start"),
		id: z$1.string(),
		providerMetadata: providerMetadataSchema.optional()
	}),
	z$1.looseObject({
		type: z$1.literal("reasoning-delta"),
		id: z$1.string(),
		delta: z$1.string(),
		providerMetadata: providerMetadataSchema.optional()
	}),
	z$1.looseObject({
		type: z$1.literal("reasoning-end"),
		id: z$1.string(),
		providerMetadata: providerMetadataSchema.optional()
	}),
	z$1.looseObject({
		type: z$1.literal("custom"),
		kind: z$1.string().transform((value) => value),
		providerMetadata: providerMetadataSchema.optional()
	}),
	z$1.looseObject({
		type: z$1.literal("source-url"),
		sourceId: z$1.string(),
		url: z$1.string(),
		title: z$1.string().optional(),
		providerMetadata: providerMetadataSchema.optional()
	}),
	z$1.looseObject({
		type: z$1.literal("source-document"),
		sourceId: z$1.string(),
		mediaType: z$1.string(),
		title: z$1.string(),
		filename: z$1.string().optional(),
		providerMetadata: providerMetadataSchema.optional()
	}),
	z$1.looseObject({
		type: z$1.literal("file"),
		url: z$1.string(),
		mediaType: z$1.string(),
		providerMetadata: providerMetadataSchema.optional()
	}),
	z$1.looseObject({
		type: z$1.literal("reasoning-file"),
		url: z$1.string(),
		mediaType: z$1.string(),
		providerMetadata: providerMetadataSchema.optional()
	}),
	z$1.looseObject({
		type: z$1.custom((value) => typeof value === "string" && value.startsWith("data-"), { message: "Type must start with \"data-\"" }),
		id: z$1.string().optional(),
		data: z$1.unknown(),
		transient: z$1.boolean().optional()
	}),
	z$1.looseObject({ type: z$1.literal("start-step") }),
	z$1.looseObject({ type: z$1.literal("finish-step") }),
	z$1.looseObject({ type: z$1.literal("reset-step") }),
	z$1.looseObject({
		type: z$1.literal("start"),
		messageId: z$1.string().optional(),
		messageMetadata: z$1.unknown().optional()
	}),
	z$1.looseObject({
		type: z$1.literal("finish"),
		finishReason: z$1.enum([
			"stop",
			"length",
			"content-filter",
			"tool-calls",
			"error",
			"other"
		]).optional(),
		messageMetadata: z$1.unknown().optional()
	}),
	z$1.looseObject({
		type: z$1.literal("abort"),
		reason: z$1.string().optional()
	}),
	z$1.looseObject({
		type: z$1.literal("message-metadata"),
		messageMetadata: z$1.unknown()
	})
])));
function isDataUIMessageChunk(chunk) {
	return chunk.type.startsWith("data-");
}
function createIdMap() {
	return /* @__PURE__ */ Object.create(null);
}
function isStaticToolUIPart(part) {
	return part.type.startsWith("tool-");
}
function isDynamicToolUIPart(part) {
	return part.type === "dynamic-tool";
}
function isToolUIPart(part) {
	return isStaticToolUIPart(part) || isDynamicToolUIPart(part);
}
function getStaticToolName(part) {
	return part.type.split("-").slice(1).join("-");
}
var rawInputDeprecationWarning = {
	type: "deprecated",
	setting: "rawInput in output-error UI message parts",
	message: "Use the \"input\" field instead. The \"rawInput\" field will be removed in the next major version."
};
function warnIfUIMessageHasDeprecatedRawInput(messages) {
	if (messages.some((message) => message.parts.some((part) => part != null && typeof part === "object" && "type" in part && typeof part.type === "string" && (part.type === "dynamic-tool" || part.type.startsWith("tool-")) && "state" in part && part.state === "output-error" && Object.prototype.hasOwnProperty.call(part, "rawInput") && "rawInput" in part && part.rawInput !== void 0))) logWarnings({ warnings: [rawInputDeprecationWarning] });
}
function createStreamingUIMessageState({ lastMessage, messageId }) {
	return {
		message: (lastMessage == null ? void 0 : lastMessage.role) === "assistant" ? lastMessage : {
			id: messageId,
			metadata: void 0,
			role: "assistant",
			parts: []
		},
		activeTextParts: createIdMap(),
		activeReasoningParts: createIdMap(),
		partialToolCalls: createIdMap()
	};
}
function processUIMessageStream({ stream, messageMetadataSchema, dataPartSchemas, runUpdateMessageJob, onError, onToolCall, onData }) {
	return stream.pipeThrough(new TransformStream({ async transform(chunk, controller) {
		await runUpdateMessageJob(async ({ state, write }) => {
			var _a25, _b25, _c, _d;
			function getCurrentStepParts() {
				const parts = state.message.parts;
				let currentStepStartIndex = parts.length - 1;
				while (currentStepStartIndex >= 0 && parts[currentStepStartIndex].type !== "step-start") currentStepStartIndex--;
				return parts.slice(currentStepStartIndex + 1);
			}
			function getCurrentStepToolInvocations() {
				return getCurrentStepParts().filter(isToolUIPart);
			}
			function getToolInvocation(toolCallId) {
				let toolInvocation = getCurrentStepToolInvocations().find((invocation) => invocation.toolCallId === toolCallId);
				if (toolInvocation == null) {
					const parts = state.message.parts;
					for (let i = parts.length - 1; i >= 0; i--) {
						const part = parts[i];
						if (isToolUIPart(part) && part.toolCallId === toolCallId) {
							toolInvocation = part;
							break;
						}
					}
				}
				if (toolInvocation == null) throw new UIMessageStreamError({
					chunkType: "tool-invocation",
					chunkId: toolCallId,
					message: `No tool invocation found for tool call ID "${toolCallId}".`
				});
				return toolInvocation;
			}
			function getToolInvocationByApprovalId(approvalId) {
				const toolInvocation = state.message.parts.filter(isToolUIPart).find((invocation) => {
					var _a26;
					return ((_a26 = invocation.approval) == null ? void 0 : _a26.id) === approvalId;
				});
				if (toolInvocation == null) throw new UIMessageStreamError({
					chunkType: "tool-approval-response",
					chunkId: approvalId,
					message: `No tool invocation found for approval ID "${approvalId}".`
				});
				return toolInvocation;
			}
			function updateToolPart(options, existingPart) {
				var _a26;
				const part = existingPart != null ? existingPart : getCurrentStepParts().find((part2) => isStaticToolUIPart(part2) && part2.toolCallId === options.toolCallId);
				const anyOptions = options;
				const anyPart = part;
				if (part != null) {
					part.state = options.state;
					anyPart.input = anyOptions.input;
					anyPart.output = anyOptions.output;
					anyPart.errorText = anyOptions.errorText;
					anyPart.rawInput = anyOptions.rawInput;
					anyPart.preliminary = anyOptions.preliminary;
					if (options.title !== void 0) anyPart.title = options.title;
					if (options.toolMetadata !== void 0) anyPart.toolMetadata = options.toolMetadata;
					anyPart.providerExecuted = (_a26 = anyOptions.providerExecuted) != null ? _a26 : part.providerExecuted;
					const providerMetadata = anyOptions.providerMetadata;
					if (providerMetadata != null) {
						if (options.state === "output-available" || options.state === "output-error") {
							const resultPart = part;
							resultPart.resultProviderMetadata = providerMetadata;
						} else part.callProviderMetadata = providerMetadata;
					}
				} else state.message.parts.push({
					type: `tool-${options.toolName}`,
					toolCallId: options.toolCallId,
					state: options.state,
					title: options.title,
					...options.toolMetadata !== void 0 ? { toolMetadata: options.toolMetadata } : {},
					input: anyOptions.input,
					output: anyOptions.output,
					rawInput: anyOptions.rawInput,
					errorText: anyOptions.errorText,
					providerExecuted: anyOptions.providerExecuted,
					preliminary: anyOptions.preliminary,
					...anyOptions.providerMetadata != null && (options.state === "output-available" || options.state === "output-error") ? { resultProviderMetadata: anyOptions.providerMetadata } : {},
					...anyOptions.providerMetadata != null && !(options.state === "output-available" || options.state === "output-error") ? { callProviderMetadata: anyOptions.providerMetadata } : {}
				});
			}
			function updateDynamicToolPart(options, existingPart) {
				var _a26, _b26;
				const part = existingPart != null ? existingPart : getCurrentStepParts().find((part2) => part2.type === "dynamic-tool" && part2.toolCallId === options.toolCallId);
				const anyOptions = options;
				const anyPart = part;
				if (part != null) {
					part.state = options.state;
					anyPart.toolName = options.toolName;
					anyPart.input = anyOptions.input;
					anyPart.output = anyOptions.output;
					anyPart.errorText = anyOptions.errorText;
					anyPart.rawInput = (_a26 = anyOptions.rawInput) != null ? _a26 : anyPart.rawInput;
					anyPart.preliminary = anyOptions.preliminary;
					if (options.title !== void 0) anyPart.title = options.title;
					if (options.toolMetadata !== void 0) anyPart.toolMetadata = options.toolMetadata;
					anyPart.providerExecuted = (_b26 = anyOptions.providerExecuted) != null ? _b26 : part.providerExecuted;
					const providerMetadata = anyOptions.providerMetadata;
					if (providerMetadata != null) {
						if (options.state === "output-available" || options.state === "output-error") {
							const resultPart = part;
							resultPart.resultProviderMetadata = providerMetadata;
						} else part.callProviderMetadata = providerMetadata;
					}
				} else state.message.parts.push({
					type: "dynamic-tool",
					toolName: options.toolName,
					toolCallId: options.toolCallId,
					state: options.state,
					input: anyOptions.input,
					output: anyOptions.output,
					errorText: anyOptions.errorText,
					preliminary: anyOptions.preliminary,
					providerExecuted: anyOptions.providerExecuted,
					title: options.title,
					...options.toolMetadata !== void 0 ? { toolMetadata: options.toolMetadata } : {},
					...anyOptions.providerMetadata != null && (options.state === "output-available" || options.state === "output-error") ? { resultProviderMetadata: anyOptions.providerMetadata } : {},
					...anyOptions.providerMetadata != null && !(options.state === "output-available" || options.state === "output-error") ? { callProviderMetadata: anyOptions.providerMetadata } : {}
				});
			}
			async function updateMessageMetadata(metadata) {
				if (metadata != null) {
					const mergedMetadata = state.message.metadata != null ? mergeObjects(state.message.metadata, metadata) : metadata;
					if (messageMetadataSchema != null) await validateTypes({
						value: mergedMetadata,
						schema: messageMetadataSchema,
						context: {
							field: "message.metadata",
							entityId: state.message.id
						}
					});
					state.message.metadata = mergedMetadata;
				}
			}
			switch (chunk.type) {
				case "text-start": {
					const textPart = {
						type: "text",
						text: "",
						providerMetadata: chunk.providerMetadata,
						state: "streaming"
					};
					state.activeTextParts[chunk.id] = textPart;
					state.message.parts.push(textPart);
					write();
					break;
				}
				case "text-delta": {
					const textPart = state.activeTextParts[chunk.id];
					if (textPart == null) throw new UIMessageStreamError({
						chunkType: "text-delta",
						chunkId: chunk.id,
						message: `Received text-delta for missing text part with ID "${chunk.id}". Ensure a "text-start" chunk is sent before any "text-delta" chunks.`
					});
					textPart.text += chunk.delta;
					textPart.providerMetadata = (_a25 = chunk.providerMetadata) != null ? _a25 : textPart.providerMetadata;
					write();
					break;
				}
				case "text-end": {
					const textPart = state.activeTextParts[chunk.id];
					if (textPart == null) throw new UIMessageStreamError({
						chunkType: "text-end",
						chunkId: chunk.id,
						message: `Received text-end for missing text part with ID "${chunk.id}". Ensure a "text-start" chunk is sent before any "text-end" chunks.`
					});
					textPart.state = "done";
					textPart.providerMetadata = (_b25 = chunk.providerMetadata) != null ? _b25 : textPart.providerMetadata;
					delete state.activeTextParts[chunk.id];
					write();
					break;
				}
				case "custom": {
					const customPart = {
						type: "custom",
						kind: chunk.kind,
						providerMetadata: chunk.providerMetadata
					};
					state.message.parts.push(customPart);
					write();
					break;
				}
				case "reasoning-start": {
					const reasoningPart = {
						type: "reasoning",
						id: chunk.id,
						text: "",
						providerMetadata: chunk.providerMetadata,
						state: "streaming"
					};
					state.activeReasoningParts[chunk.id] = reasoningPart;
					state.message.parts.push(reasoningPart);
					write();
					break;
				}
				case "reasoning-delta": {
					const reasoningPart = state.activeReasoningParts[chunk.id];
					if (reasoningPart == null) throw new UIMessageStreamError({
						chunkType: "reasoning-delta",
						chunkId: chunk.id,
						message: `Received reasoning-delta for missing reasoning part with ID "${chunk.id}". Ensure a "reasoning-start" chunk is sent before any "reasoning-delta" chunks.`
					});
					reasoningPart.text += chunk.delta;
					reasoningPart.providerMetadata = (_c = chunk.providerMetadata) != null ? _c : reasoningPart.providerMetadata;
					write();
					break;
				}
				case "reasoning-end": {
					const reasoningPart = state.activeReasoningParts[chunk.id];
					if (reasoningPart == null) throw new UIMessageStreamError({
						chunkType: "reasoning-end",
						chunkId: chunk.id,
						message: `Received reasoning-end for missing reasoning part with ID "${chunk.id}". Ensure a "reasoning-start" chunk is sent before any "reasoning-end" chunks.`
					});
					reasoningPart.providerMetadata = (_d = chunk.providerMetadata) != null ? _d : reasoningPart.providerMetadata;
					reasoningPart.state = "done";
					delete state.activeReasoningParts[chunk.id];
					write();
					break;
				}
				case "file":
				case "reasoning-file":
					state.message.parts.push({
						type: chunk.type,
						mediaType: chunk.mediaType,
						url: chunk.url,
						...chunk.providerMetadata != null ? { providerMetadata: chunk.providerMetadata } : {}
					});
					write();
					break;
				case "source-url":
					state.message.parts.push({
						type: "source-url",
						sourceId: chunk.sourceId,
						url: chunk.url,
						title: chunk.title,
						providerMetadata: chunk.providerMetadata
					});
					write();
					break;
				case "source-document":
					state.message.parts.push({
						type: "source-document",
						sourceId: chunk.sourceId,
						mediaType: chunk.mediaType,
						title: chunk.title,
						filename: chunk.filename,
						providerMetadata: chunk.providerMetadata
					});
					write();
					break;
				case "tool-input-start": {
					const toolInvocations = getCurrentStepParts().filter(isStaticToolUIPart);
					state.partialToolCalls[chunk.toolCallId] = {
						text: "",
						toolName: chunk.toolName,
						index: toolInvocations.length,
						dynamic: chunk.dynamic,
						title: chunk.title,
						toolMetadata: chunk.toolMetadata
					};
					if (chunk.dynamic) updateDynamicToolPart({
						toolCallId: chunk.toolCallId,
						toolName: chunk.toolName,
						state: "input-streaming",
						input: void 0,
						providerExecuted: chunk.providerExecuted,
						title: chunk.title,
						toolMetadata: chunk.toolMetadata,
						providerMetadata: chunk.providerMetadata
					});
					else updateToolPart({
						toolCallId: chunk.toolCallId,
						toolName: chunk.toolName,
						state: "input-streaming",
						input: void 0,
						providerExecuted: chunk.providerExecuted,
						title: chunk.title,
						toolMetadata: chunk.toolMetadata,
						providerMetadata: chunk.providerMetadata
					});
					write();
					break;
				}
				case "tool-input-delta": {
					const partialToolCall = state.partialToolCalls[chunk.toolCallId];
					if (partialToolCall == null) throw new UIMessageStreamError({
						chunkType: "tool-input-delta",
						chunkId: chunk.toolCallId,
						message: `Received tool-input-delta for missing tool call with ID "${chunk.toolCallId}". Ensure a "tool-input-start" chunk is sent before any "tool-input-delta" chunks.`
					});
					partialToolCall.text += chunk.inputTextDelta;
					const { value: partialArgs } = await parsePartialJson(partialToolCall.text);
					if (partialToolCall.dynamic) updateDynamicToolPart({
						toolCallId: chunk.toolCallId,
						toolName: partialToolCall.toolName,
						state: "input-streaming",
						input: partialArgs,
						title: partialToolCall.title,
						toolMetadata: partialToolCall.toolMetadata
					});
					else updateToolPart({
						toolCallId: chunk.toolCallId,
						toolName: partialToolCall.toolName,
						state: "input-streaming",
						input: partialArgs,
						title: partialToolCall.title,
						toolMetadata: partialToolCall.toolMetadata
					});
					write();
					break;
				}
				case "tool-input-available":
					if (chunk.dynamic) updateDynamicToolPart({
						toolCallId: chunk.toolCallId,
						toolName: chunk.toolName,
						state: "input-available",
						input: chunk.input,
						providerExecuted: chunk.providerExecuted,
						providerMetadata: chunk.providerMetadata,
						title: chunk.title,
						toolMetadata: chunk.toolMetadata
					});
					else updateToolPart({
						toolCallId: chunk.toolCallId,
						toolName: chunk.toolName,
						state: "input-available",
						input: chunk.input,
						providerExecuted: chunk.providerExecuted,
						providerMetadata: chunk.providerMetadata,
						title: chunk.title,
						toolMetadata: chunk.toolMetadata
					});
					write();
					if (onToolCall && !chunk.providerExecuted) await onToolCall({ toolCall: chunk });
					break;
				case "tool-input-error": {
					const existingPart = getCurrentStepParts().filter(isToolUIPart).find((p) => p.toolCallId === chunk.toolCallId);
					if (existingPart != null ? existingPart.type === "dynamic-tool" : !!chunk.dynamic) updateDynamicToolPart({
						toolCallId: chunk.toolCallId,
						toolName: chunk.toolName,
						state: "output-error",
						input: chunk.input,
						errorText: chunk.errorText,
						providerExecuted: chunk.providerExecuted,
						providerMetadata: chunk.providerMetadata,
						toolMetadata: chunk.toolMetadata
					});
					else {
						updateToolPart({
							toolCallId: chunk.toolCallId,
							toolName: chunk.toolName,
							state: "output-error",
							input: void 0,
							rawInput: chunk.input,
							errorText: chunk.errorText,
							providerExecuted: chunk.providerExecuted,
							providerMetadata: chunk.providerMetadata,
							toolMetadata: chunk.toolMetadata
						});
						warnIfUIMessageHasDeprecatedRawInput([state.message]);
					}
					write();
					break;
				}
				case "tool-approval-request": {
					const toolInvocation = getToolInvocation(chunk.toolCallId);
					toolInvocation.state = "approval-requested";
					toolInvocation.approval = {
						id: chunk.approvalId,
						...chunk.approvalDescriptor != null ? { descriptor: chunk.approvalDescriptor } : {},
						...chunk.reason != null ? { requestReason: chunk.reason } : {},
						...chunk.isAutomatic === true ? { isAutomatic: true } : {},
						...chunk.signature != null ? { signature: chunk.signature } : {}
					};
					write();
					break;
				}
				case "tool-approval-response": {
					const toolInvocation = getToolInvocationByApprovalId(chunk.approvalId);
					const approval = toolInvocation.approval == null ? { id: chunk.approvalId } : toolInvocation.approval;
					toolInvocation.state = "approval-responded";
					toolInvocation.approval = {
						...approval,
						id: chunk.approvalId,
						approved: chunk.approved,
						...chunk.reason != null ? { reason: chunk.reason } : {}
					};
					if (chunk.providerExecuted != null) toolInvocation.providerExecuted = chunk.providerExecuted;
					if (chunk.providerMetadata != null) toolInvocation.callProviderMetadata = chunk.providerMetadata;
					write();
					break;
				}
				case "tool-output-denied": {
					const toolInvocation = getToolInvocation(chunk.toolCallId);
					toolInvocation.state = "output-denied";
					write();
					break;
				}
				case "tool-output-available": {
					const toolInvocation = getToolInvocation(chunk.toolCallId);
					if (toolInvocation.type === "dynamic-tool") updateDynamicToolPart({
						toolCallId: chunk.toolCallId,
						toolName: toolInvocation.toolName,
						state: "output-available",
						input: toolInvocation.input,
						output: chunk.output,
						preliminary: chunk.preliminary,
						providerExecuted: chunk.providerExecuted,
						providerMetadata: chunk.providerMetadata,
						title: toolInvocation.title,
						toolMetadata: toolInvocation.toolMetadata
					}, toolInvocation);
					else updateToolPart({
						toolCallId: chunk.toolCallId,
						toolName: getStaticToolName(toolInvocation),
						state: "output-available",
						input: toolInvocation.input,
						output: chunk.output,
						providerExecuted: chunk.providerExecuted,
						preliminary: chunk.preliminary,
						providerMetadata: chunk.providerMetadata,
						title: toolInvocation.title,
						toolMetadata: toolInvocation.toolMetadata
					}, toolInvocation);
					write();
					break;
				}
				case "tool-output-error": {
					const toolInvocation = getToolInvocation(chunk.toolCallId);
					if (toolInvocation.type === "dynamic-tool") updateDynamicToolPart({
						toolCallId: chunk.toolCallId,
						toolName: toolInvocation.toolName,
						state: "output-error",
						input: toolInvocation.input,
						errorText: chunk.errorText,
						providerExecuted: chunk.providerExecuted,
						providerMetadata: chunk.providerMetadata,
						title: toolInvocation.title,
						toolMetadata: toolInvocation.toolMetadata
					}, toolInvocation);
					else updateToolPart({
						toolCallId: chunk.toolCallId,
						toolName: getStaticToolName(toolInvocation),
						state: "output-error",
						input: toolInvocation.input,
						rawInput: toolInvocation.rawInput,
						errorText: chunk.errorText,
						providerExecuted: chunk.providerExecuted,
						providerMetadata: chunk.providerMetadata,
						title: toolInvocation.title,
						toolMetadata: toolInvocation.toolMetadata
					}, toolInvocation);
					write();
					break;
				}
				case "start-step":
					state.message.parts.push({ type: "step-start" });
					break;
				case "finish-step": break;
				case "reset-step": {
					const currentStepParts = getCurrentStepParts();
					state.activeTextParts = createIdMap();
					state.activeReasoningParts = createIdMap();
					state.partialToolCalls = createIdMap();
					if (currentStepParts.length > 0) {
						state.message.parts.splice(state.message.parts.length - currentStepParts.length, currentStepParts.length);
						write();
					}
					break;
				}
				case "start":
					if (chunk.messageId != null) state.message.id = chunk.messageId;
					await updateMessageMetadata(chunk.messageMetadata);
					if (chunk.messageId != null || chunk.messageMetadata != null) write({ updateStatus: false });
					break;
				case "finish":
					if (chunk.finishReason != null) state.finishReason = chunk.finishReason;
					await updateMessageMetadata(chunk.messageMetadata);
					if (chunk.messageMetadata != null) write();
					break;
				case "message-metadata":
					await updateMessageMetadata(chunk.messageMetadata);
					if (chunk.messageMetadata != null) write();
					break;
				case "error":
					onError?.(new Error(chunk.errorText));
					break;
				default: if (isDataUIMessageChunk(chunk)) {
					if ((dataPartSchemas == null ? void 0 : dataPartSchemas[chunk.type]) != null) {
						const partIdx = state.message.parts.findIndex((p) => "id" in p && "data" in p && p.id === chunk.id && p.type === chunk.type);
						const actualPartIdx = partIdx >= 0 ? partIdx : state.message.parts.length;
						await validateTypes({
							value: chunk.data,
							schema: dataPartSchemas[chunk.type],
							context: {
								field: `message.parts[${actualPartIdx}].data`,
								entityName: chunk.type,
								entityId: chunk.id
							}
						});
					}
					const dataChunk = chunk;
					if (dataChunk.transient) {
						onData?.(dataChunk);
						break;
					}
					const existingUIPart = dataChunk.id != null ? state.message.parts.find((chunkArg) => dataChunk.type === chunkArg.type && dataChunk.id === chunkArg.id) : void 0;
					if (existingUIPart != null) existingUIPart.data = dataChunk.data;
					else state.message.parts.push(dataChunk);
					onData?.(dataChunk);
					write();
				}
			}
			controller.enqueue(chunk);
		});
	} }));
}
async function consumeStream({ stream, onError, abortSignal }) {
	const reader = stream.getReader();
	const cancelOnAbort = () => {
		reader.cancel().catch(() => {});
	};
	if (abortSignal == null ? void 0 : abortSignal.aborted) cancelOnAbort();
	else abortSignal?.addEventListener("abort", cancelOnAbort, { once: true });
	try {
		while (true) {
			const { done } = await reader.read();
			if (done) break;
		}
	} catch (error) {
		onError?.(error);
	} finally {
		abortSignal?.removeEventListener("abort", cancelOnAbort);
		reader.releaseLock();
	}
}
createIdGenerator({
	prefix: "aitxt",
	size: 24
});
createIdGenerator({
	prefix: "call",
	size: 24
});
createIdGenerator({
	prefix: "aitxt",
	size: 24
});
createIdGenerator({
	prefix: "call",
	size: 24
});
z$1.record(z$1.string(), jsonValueSchema.optional());
z$1.record(z$1.string(), z$1.string());
createIdGenerator({
	prefix: "call",
	size: 24
});
createIdGenerator({
	prefix: "call",
	size: 24
});
new TextEncoder();
createIdGenerator({
	prefix: "aiobj",
	size: 24
});
var { atob: atob2 } = globalThis;
var SerialJobExecutor = class {
	constructor() {
		this.queue = [];
		this.isProcessing = false;
	}
	async processQueue() {
		if (this.isProcessing) return;
		this.isProcessing = true;
		while (this.queue.length > 0) {
			await this.queue[0]();
			this.queue.shift();
		}
		this.isProcessing = false;
	}
	async run(job) {
		return new Promise((resolve3, reject) => {
			this.queue.push(async () => {
				try {
					await job();
					resolve3();
				} catch (error) {
					reject(error);
				}
			});
			this.processQueue();
		});
	}
};
createIdGenerator({
	prefix: "aiobj",
	size: 24
});
z$1.object({
	token: z$1.string().refine((value) => value.trim().length > 0),
	url: z$1.string().refine((value) => {
		try {
			const url = new URL(value);
			return (url.protocol === "ws:" || url.protocol === "wss:") && url.hostname !== "";
		} catch (e) {
			return false;
		}
	}),
	expiresAt: z$1.number().positive().max(Number.MAX_SAFE_INTEGER).optional(),
	tools: z$1.array(z$1.object({
		type: z$1.literal("function"),
		name: z$1.string().min(1),
		description: z$1.string().optional(),
		parameters: z$1.record(z$1.string(), z$1.unknown())
	})).optional()
});
createIdGenerator({
	prefix: "call",
	size: 24
});
async function createUIApiCallError({ response, url, fallbackMessage }) {
	const responseBody = await response.text();
	return new APICallError({
		message: responseBody || fallbackMessage,
		url,
		requestBodyValues: void 0,
		statusCode: response.status,
		responseBody
	});
}
async function convertFileListToFileUIParts(files) {
	if (files == null) return [];
	if (!globalThis.FileList || !(files instanceof globalThis.FileList)) throw new UnsupportedFunctionalityError({
		functionality: "FileList",
		message: "FileList is not supported in the current environment"
	});
	return Promise.all(Array.from(files).map(async (file) => {
		const { name: name25, type } = file;
		return {
			type: "file",
			mediaType: type,
			filename: name25,
			url: await new Promise((resolve3, reject) => {
				const reader = new FileReader();
				reader.onload = (readerEvent) => {
					var _a25;
					resolve3((_a25 = readerEvent.target) == null ? void 0 : _a25.result);
				};
				reader.onerror = (error) => reject(error);
				reader.readAsDataURL(file);
			})
		};
	}));
}
function appendPathToUrl(url, path) {
	const queryOrFragmentStart = url.search(/[?#]/);
	return queryOrFragmentStart === -1 ? `${url}${path}` : `${url.slice(0, queryOrFragmentStart)}${path}${url.slice(queryOrFragmentStart)}`;
}
var HttpChatTransport = class {
	constructor({ api = "/api/chat", credentials, headers, body, fetch: fetch2, prepareSendMessagesRequest, prepareReconnectToStreamRequest }) {
		this.api = api;
		this.credentials = credentials;
		this.headers = headers;
		this.body = body;
		this.fetch = fetch2;
		this.prepareSendMessagesRequest = prepareSendMessagesRequest;
		this.prepareReconnectToStreamRequest = prepareReconnectToStreamRequest;
	}
	async sendMessages({ abortSignal, ...options }) {
		var _a25, _b25, _c, _d;
		const resolvedBody = await resolve(this.body);
		const resolvedHeaders = await resolve(this.headers);
		const resolvedCredentials = await resolve(this.credentials);
		const baseHeaders = {
			...normalizeHeaders(resolvedHeaders),
			...normalizeHeaders(options.headers)
		};
		const preparedRequest = await ((_a25 = this.prepareSendMessagesRequest) == null ? void 0 : _a25.call(this, {
			api: this.api,
			id: options.chatId,
			messages: options.messages,
			body: {
				...resolvedBody,
				...options.body
			},
			headers: baseHeaders,
			credentials: resolvedCredentials,
			requestMetadata: options.metadata,
			trigger: options.trigger,
			messageId: options.messageId
		}));
		const api = (_b25 = preparedRequest == null ? void 0 : preparedRequest.api) != null ? _b25 : this.api;
		const headers = (preparedRequest == null ? void 0 : preparedRequest.headers) !== void 0 ? normalizeHeaders(preparedRequest.headers) : baseHeaders;
		const body = (preparedRequest == null ? void 0 : preparedRequest.body) !== void 0 ? preparedRequest.body : {
			...resolvedBody,
			...options.body,
			id: options.chatId,
			messages: options.messages,
			trigger: options.trigger,
			messageId: options.messageId
		};
		const credentials = (_c = preparedRequest == null ? void 0 : preparedRequest.credentials) != null ? _c : resolvedCredentials;
		const response = await ((_d = this.fetch) != null ? _d : globalThis.fetch)(api, {
			method: "POST",
			headers: {
				"content-type": "application/json",
				...headers
			},
			body: JSON.stringify(body),
			credentials,
			signal: abortSignal
		});
		if (!response.ok) throw await createUIApiCallError({
			response,
			url: api,
			fallbackMessage: "Failed to fetch the chat response."
		});
		if (!response.body) throw new EmptyResponseBodyError({ message: "The response body is empty." });
		return this.processResponseStream(response.body);
	}
	async reconnectToStream(options) {
		var _a25, _b25, _c, _d;
		const resolvedBody = await resolve(this.body);
		const resolvedHeaders = await resolve(this.headers);
		const resolvedCredentials = await resolve(this.credentials);
		const baseHeaders = {
			...normalizeHeaders(resolvedHeaders),
			...normalizeHeaders(options.headers)
		};
		const preparedRequest = await ((_a25 = this.prepareReconnectToStreamRequest) == null ? void 0 : _a25.call(this, {
			api: this.api,
			id: options.chatId,
			body: {
				...resolvedBody,
				...options.body
			},
			headers: baseHeaders,
			credentials: resolvedCredentials,
			requestMetadata: options.metadata
		}));
		const api = (_b25 = preparedRequest == null ? void 0 : preparedRequest.api) != null ? _b25 : appendPathToUrl(this.api, `/${options.chatId}/stream`);
		const headers = (preparedRequest == null ? void 0 : preparedRequest.headers) !== void 0 ? normalizeHeaders(preparedRequest.headers) : baseHeaders;
		const credentials = (_c = preparedRequest == null ? void 0 : preparedRequest.credentials) != null ? _c : resolvedCredentials;
		const response = await ((_d = this.fetch) != null ? _d : globalThis.fetch)(api, {
			method: "GET",
			headers,
			credentials,
			signal: options.abortSignal
		});
		if (response.status === 204) return null;
		if (!response.ok) throw await createUIApiCallError({
			response,
			url: api,
			fallbackMessage: "Failed to fetch the chat response."
		});
		if (!response.body) throw new EmptyResponseBodyError({ message: "The response body is empty." });
		return this.processResponseStream(response.body);
	}
};
var DefaultChatTransport = class extends HttpChatTransport {
	constructor(options = {}) {
		super(options);
	}
	processResponseStream(stream) {
		return parseJsonEventStream({
			stream,
			schema: uiMessageChunkSchema
		}).pipeThrough(new TransformStream({ async transform(chunk, controller) {
			if (!chunk.success) throw chunk.error;
			controller.enqueue(chunk.value);
		} }));
	}
};
var AbstractChat = class {
	constructor({ generateId: generateId5 = generateId, id = generateId5(), transport = new DefaultChatTransport(), messageMetadataSchema, dataPartSchemas, state, onError, onToolCall, onFinish, onData, sendAutomaticallyWhen }) {
		this.pendingMessagePreparations = /* @__PURE__ */ new Set();
		this.activeResponse = void 0;
		this.activeResumeRequest = void 0;
		this.jobExecutor = new SerialJobExecutor();
		/**
		* Appends or replaces a user message to the chat list. This triggers the API call to fetch
		* the assistant's response.
		*
		* If a messageId is provided, the message will be replaced.
		*/
		this.sendMessage = async (message, options) => {
			var _a25, _b25, _c, _d;
			if (message == null) {
				await this.makeRequest({
					trigger: "submit-message",
					messageId: (_a25 = this.lastMessage) == null ? void 0 : _a25.id,
					...options
				});
				return;
			}
			let uiMessage;
			if ("text" in message || "files" in message) {
				const abortController = new AbortController();
				this.pendingMessagePreparations.add(abortController);
				let fileParts;
				try {
					fileParts = Array.isArray(message.files) ? message.files : await convertFileListToFileUIParts(message.files);
				} finally {
					this.pendingMessagePreparations.delete(abortController);
				}
				if (abortController.signal.aborted) return;
				uiMessage = { parts: [...fileParts, ..."text" in message && message.text != null ? [{
					type: "text",
					text: message.text
				}] : []] };
			} else uiMessage = message;
			if (message.messageId != null) {
				const messageIndex = this.state.messages.findIndex((m) => m.id === message.messageId);
				if (messageIndex === -1) throw new InvalidArgumentError({
					parameter: "message.messageId",
					value: message.messageId,
					message: `message with id ${message.messageId} not found`
				});
				if (this.state.messages[messageIndex].role !== "user") throw new InvalidArgumentError({
					parameter: "message.messageId",
					value: message.messageId,
					message: `message with id ${message.messageId} is not a user message`
				});
				this.state.messages = this.state.messages.slice(0, messageIndex + 1);
				this.state.replaceMessage(messageIndex, {
					id: message.messageId,
					...uiMessage,
					role: (_b25 = uiMessage.role) != null ? _b25 : "user",
					metadata: message.metadata
				});
			} else this.state.pushMessage({
				...uiMessage,
				id: (_c = uiMessage.id) != null ? _c : this.generateId(),
				role: (_d = uiMessage.role) != null ? _d : "user",
				metadata: message.metadata
			});
			await this.makeRequest({
				trigger: "submit-message",
				messageId: message.messageId,
				...options
			});
		};
		/**
		* Regenerate the assistant message with the provided message id.
		* If no message id is provided, the last assistant message will be regenerated.
		*/
		this.regenerate = async ({ messageId, ...options } = {}) => {
			const messageIndex = messageId == null ? this.state.messages.length - 1 : this.state.messages.findIndex((message) => message.id === messageId);
			if (messageIndex === -1) throw new InvalidArgumentError({
				parameter: "messageId",
				value: messageId,
				message: `message ${messageId} not found`
			});
			this.state.messages = this.state.messages.slice(0, this.messages[messageIndex].role === "assistant" ? messageIndex : messageIndex + 1);
			await this.makeRequest({
				trigger: "regenerate-message",
				messageId,
				...options
			});
		};
		/**
		* Attempt to resume an ongoing streaming response.
		*/
		this.resumeStream = async (options = {}) => {
			await this.makeRequest({
				trigger: "resume-stream",
				...options
			});
		};
		/**
		* Clear the error state and set the status to ready if the chat is in an error state.
		*/
		this.clearError = () => {
			if (this.status === "error") {
				this.state.error = void 0;
				this.setStatus({ status: "ready" });
			}
		};
		this.addToolApprovalResponse = async ({ id, approved, reason, options }) => this.jobExecutor.run(async () => {
			const messages = this.state.messages;
			const lastMessage = messages[messages.length - 1];
			const updatePart = (part) => isToolUIPart(part) && part.state === "approval-requested" && part.approval.id === id ? {
				...part,
				state: "approval-responded",
				approval: {
					...part.approval,
					id,
					approved,
					reason
				}
			} : part;
			this.state.replaceMessage(messages.length - 1, {
				...lastMessage,
				parts: lastMessage.parts.map(updatePart)
			});
			if (this.activeResponse) this.activeResponse.state.message.parts = this.activeResponse.state.message.parts.map(updatePart);
			if (this.status !== "streaming" && this.status !== "submitted" && this.sendAutomaticallyWhen) this.shouldSendAutomatically().then((shouldSend) => {
				var _a25;
				if (shouldSend) this.makeRequest({
					trigger: "submit-message",
					messageId: (_a25 = this.lastMessage) == null ? void 0 : _a25.id,
					...options
				});
			});
		});
		this.addToolOutput = async ({ state = "output-available", toolCallId, output, errorText, options }) => this.jobExecutor.run(async () => {
			const messages = this.state.messages;
			const lastMessage = messages[messages.length - 1];
			const updatePart = (part) => isToolUIPart(part) && part.toolCallId === toolCallId ? {
				...part,
				state,
				output,
				errorText
			} : part;
			this.state.replaceMessage(messages.length - 1, {
				...lastMessage,
				parts: lastMessage.parts.map(updatePart)
			});
			if (this.activeResponse) this.activeResponse.state.message.parts = this.activeResponse.state.message.parts.map(updatePart);
			if (this.status !== "streaming" && this.status !== "submitted" && this.sendAutomaticallyWhen) this.shouldSendAutomatically().then((shouldSend) => {
				var _a25;
				if (shouldSend) this.makeRequest({
					trigger: "submit-message",
					messageId: (_a25 = this.lastMessage) == null ? void 0 : _a25.id,
					...options
				});
			});
		});
		/** @deprecated Use addToolOutput */
		this.addToolResult = this.addToolOutput;
		/**
		* Abort the current request immediately, keep the generated tokens if any.
		*/
		this.stop = async () => {
			var _a25, _b25;
			for (const controller of this.pendingMessagePreparations) controller.abort();
			(_a25 = this.activeResumeRequest) == null || _a25.abortController.abort();
			(_b25 = this.activeResponse) == null || _b25.abortController.abort();
		};
		this.id = id;
		this.transport = transport;
		this.generateId = generateId5;
		this.messageMetadataSchema = messageMetadataSchema;
		this.dataPartSchemas = dataPartSchemas;
		this.state = state;
		this.onError = onError;
		this.onToolCall = onToolCall;
		this.onFinish = onFinish;
		this.onData = onData;
		this.sendAutomaticallyWhen = sendAutomaticallyWhen;
	}
	/**
	* Hook status:
	*
	* - `submitted`: The message has been sent to the API and we're awaiting the start of the response stream.
	* - `streaming`: The response is actively streaming in from the API, receiving chunks of data.
	* - `ready`: The full response has been received and processed; a new user message can be submitted.
	* - `error`: An error occurred during the API request, preventing successful completion.
	*/
	get status() {
		return this.state.status;
	}
	setStatus({ status, error }) {
		if (this.status === status) return;
		this.state.status = status;
		this.state.error = error;
	}
	get error() {
		return this.state.error;
	}
	get messages() {
		return this.state.messages;
	}
	get lastMessage() {
		return this.state.messages[this.state.messages.length - 1];
	}
	set messages(messages) {
		this.state.messages = messages;
	}
	async shouldSendAutomatically() {
		if (!this.sendAutomaticallyWhen) return false;
		const result = this.sendAutomaticallyWhen({ messages: this.state.messages });
		if (result && typeof result === "object" && "then" in result) return await result;
		return result;
	}
	async makeRequest({ trigger, metadata, headers, body, messageId }) {
		var _a25, _b25, _c;
		const abortController = new AbortController();
		const activeResumeRequest = trigger === "resume-stream" ? { abortController } : void 0;
		if (activeResumeRequest) {
			(_a25 = this.activeResumeRequest) == null || _a25.abortController.abort();
			this.activeResumeRequest = activeResumeRequest;
		}
		const isCurrentRequest = () => activeResumeRequest == null || this.activeResumeRequest === activeResumeRequest;
		const clearActiveResumeRequest = () => {
			if (this.activeResumeRequest === activeResumeRequest) this.activeResumeRequest = void 0;
		};
		let resumeStream;
		if (trigger === "resume-stream") try {
			const reconnect = await this.transport.reconnectToStream({
				chatId: this.id,
				abortSignal: abortController.signal,
				metadata,
				headers,
				body
			});
			if (abortController.signal.aborted || !isCurrentRequest()) {
				await (reconnect == null ? void 0 : reconnect.cancel().catch(() => {}));
				if (isCurrentRequest()) this.setStatus({ status: "ready" });
				clearActiveResumeRequest();
				return;
			}
			if (reconnect == null) {
				this.setStatus({ status: "ready" });
				clearActiveResumeRequest();
				return;
			}
			resumeStream = reconnect;
		} catch (err) {
			if (abortController.signal.aborted || err.name === "AbortError") {
				if (isCurrentRequest()) this.setStatus({ status: "ready" });
				clearActiveResumeRequest();
				return;
			}
			if (!isCurrentRequest()) return;
			if (this.onError && err instanceof Error) this.onError(err);
			this.setStatus({
				status: "error",
				error: err
			});
			clearActiveResumeRequest();
			return;
		}
		this.setStatus({
			status: "submitted",
			error: void 0
		});
		const lastMessage = this.lastMessage;
		let isAbort = false;
		let isDisconnect = false;
		let isError2 = false;
		let activeResponse;
		try {
			const response = {
				state: createStreamingUIMessageState({
					lastMessage: trigger === "resume-stream" || trigger === "regenerate-message" ? void 0 : this.state.snapshot(lastMessage),
					messageId: this.generateId()
				}),
				abortController
			};
			activeResponse = response;
			response.abortController.signal.addEventListener("abort", () => {
				isAbort = true;
			});
			this.activeResponse = response;
			let stream;
			if (trigger === "resume-stream") stream = resumeStream;
			else stream = await this.transport.sendMessages({
				chatId: this.id,
				messages: this.state.messages,
				abortSignal: response.abortController.signal,
				metadata,
				headers,
				body,
				trigger,
				messageId
			});
			const runUpdateMessageJob = (job) => this.jobExecutor.run(() => {
				if (response.abortController.signal.aborted) return Promise.resolve();
				return job({
					state: response.state,
					write: ({ updateStatus = true } = {}) => {
						var _a26;
						if (response.abortController.signal.aborted) return;
						if (updateStatus) this.setStatus({ status: "streaming" });
						if (response.state.message.id === ((_a26 = this.lastMessage) == null ? void 0 : _a26.id)) this.state.replaceMessage(this.state.messages.length - 1, response.state.message);
						else this.state.pushMessage(response.state.message);
					}
				});
			});
			await consumeStream({
				stream: processUIMessageStream({
					stream,
					onToolCall: this.onToolCall,
					onData: this.onData,
					messageMetadataSchema: this.messageMetadataSchema,
					dataPartSchemas: this.dataPartSchemas,
					runUpdateMessageJob,
					onError: (error) => {
						throw error;
					}
				}),
				abortSignal: response.abortController.signal,
				onError: (error) => {
					throw error;
				}
			});
			if (isAbort) {
				if (isCurrentRequest()) this.setStatus({ status: "ready" });
				return null;
			}
			if (isCurrentRequest()) this.setStatus({ status: "ready" });
		} catch (err) {
			if (isAbort || err.name === "AbortError") {
				isAbort = true;
				if (isCurrentRequest()) this.setStatus({ status: "ready" });
				return null;
			}
			if (!isCurrentRequest()) return null;
			isError2 = true;
			if (err instanceof TypeError && (err.message.toLowerCase().includes("fetch") || err.message.toLowerCase().includes("network"))) isDisconnect = true;
			if (this.onError && err instanceof Error) this.onError(err);
			this.setStatus({
				status: "error",
				error: err
			});
		} finally {
			try {
				if (activeResponse) (_b25 = this.onFinish) == null || _b25.call(this, {
					message: activeResponse.state.message,
					messages: this.state.messages,
					isAbort,
					isDisconnect,
					isError: isError2,
					finishReason: activeResponse.state.finishReason
				});
			} finally {
				if (this.activeResponse === activeResponse) this.activeResponse = void 0;
				clearActiveResumeRequest();
			}
		}
		if (!isError2 && await this.shouldSendAutomatically()) await this.makeRequest({
			trigger: "submit-message",
			messageId: (_c = this.lastMessage) == null ? void 0 : _c.id,
			metadata,
			headers,
			body
		});
	}
};

export { AbstractChat, DefaultChatTransport };
