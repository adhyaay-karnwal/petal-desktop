const require_rolldown_runtime = require("./rolldown-runtime-ch10HqoO.js");
const require_dist = require("./dist-DssDLCRv.js");
const require_index = require("./index.js");
let path = require("path");
path = require_rolldown_runtime.__toESM(path, 1);
let fs = require("fs");
let child_process = require("child_process");
let events = require("events");
let crypto = require("crypto");
let os = require("os");
let http = require("http");
let readline = require("readline");
readline = require_rolldown_runtime.__toESM(readline, 1);
let module$1 = require("module");
//#region ../../node_modules/.pnpm/ai-sdk-provider-codex-cli@2.3.0_zod@4.3.6/node_modules/ai-sdk-provider-codex-cli/dist/index.js
var defaultLogger = {
	debug: (message) => console.debug(`[DEBUG] ${message}`),
	info: (message) => console.info(`[INFO] ${message}`),
	warn: (message) => console.warn(`[WARN] ${message}`),
	error: (message) => console.error(`[ERROR] ${message}`)
};
var noopLogger = {
	debug: () => {},
	info: () => {},
	warn: () => {},
	error: () => {}
};
function getLogger(logger) {
	if (logger === false) return noopLogger;
	if (logger === void 0) return defaultLogger;
	return logger;
}
function createVerboseLogger(logger, verbose = false) {
	if (verbose) return logger;
	return {
		debug: () => {},
		info: () => {},
		warn: logger.warn.bind(logger),
		error: logger.error.bind(logger)
	};
}
var MCP_SERVER_NAME_PATTERN = /^[A-Za-z0-9_-]+$/;
var CONFIG_OVERRIDE_KEY_PATTERN = /^[A-Za-z0-9_-]+(?:\.[A-Za-z0-9_-]+)*$/;
function isValidMcpServerName(name) {
	return MCP_SERVER_NAME_PATTERN.test(name);
}
function isValidConfigOverrideKey(key) {
	return CONFIG_OVERRIDE_KEY_PATTERN.test(key);
}
function assertValidMcpServerName(name) {
	if (!isValidMcpServerName(name)) throw new Error(`Invalid MCP server name '${name}'. Names must match /^[A-Za-z0-9_-]+$/.`);
	return name;
}
function assertValidConfigOverrideKey(key) {
	if (!isValidConfigOverrideKey(key)) throw new Error(`Invalid config override key '${key}'. Keys must match /^[A-Za-z0-9_-]+(?:\\.[A-Za-z0-9_-]+)*$/.`);
	return key;
}
function createEmptyCodexUsage() {
	return {
		inputTokens: {
			total: void 0,
			noCache: void 0,
			cacheRead: void 0,
			cacheWrite: void 0
		},
		outputTokens: {
			total: void 0,
			text: void 0,
			reasoning: void 0
		},
		raw: void 0
	};
}
function addOptionalTokens(a, b) {
	if (a === void 0 && b === void 0) return void 0;
	return (a ?? 0) + (b ?? 0);
}
function isRawUsageObject(value) {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}
function addRawUsage(a, b) {
	if (!isRawUsageObject(a)) return b;
	if (!isRawUsageObject(b)) return a;
	const sum = { ...a };
	for (const [key, value] of Object.entries(b)) {
		const previous = sum[key];
		sum[key] = typeof value === "number" && typeof previous === "number" ? previous + value : value;
	}
	return sum;
}
function addCodexUsage(a, b) {
	return {
		inputTokens: {
			total: addOptionalTokens(a.inputTokens.total, b.inputTokens.total),
			noCache: addOptionalTokens(a.inputTokens.noCache, b.inputTokens.noCache),
			cacheRead: addOptionalTokens(a.inputTokens.cacheRead, b.inputTokens.cacheRead),
			cacheWrite: addOptionalTokens(a.inputTokens.cacheWrite, b.inputTokens.cacheWrite)
		},
		outputTokens: {
			total: addOptionalTokens(a.outputTokens.total, b.outputTokens.total),
			text: addOptionalTokens(a.outputTokens.text, b.outputTokens.text),
			reasoning: addOptionalTokens(a.outputTokens.reasoning, b.outputTokens.reasoning)
		},
		raw: addRawUsage(a.raw, b.raw)
	};
}
function mapCodexCliFinishReason(reason) {
	switch (reason) {
		case "stop":
		case "end_turn":
		case void 0: return {
			unified: "stop",
			raw: reason
		};
		case "length":
		case "max_tokens": return {
			unified: "length",
			raw: reason
		};
		case "content_filter": return {
			unified: "content-filter",
			raw: reason
		};
		case "tool_calls": return {
			unified: "tool-calls",
			raw: reason
		};
		case "error": return {
			unified: "error",
			raw: reason
		};
		default: return {
			unified: "other",
			raw: reason
		};
	}
}
var DEPRECATED_APPROVAL_POLICY_ALIASES = Object.freeze({ "on-failure": "on-request" });
function normalizeApprovalPolicyAlias(value) {
	if (typeof value !== "string") return value;
	const normalized = DEPRECATED_APPROVAL_POLICY_ALIASES[value];
	return normalized === void 0 ? value : normalized;
}
function isDeprecatedApprovalPolicyAlias(value) {
	return typeof value === "string" && Object.hasOwn(DEPRECATED_APPROVAL_POLICY_ALIASES, value);
}
function isPlainObject(value) {
	return typeof value === "object" && value !== null && !Array.isArray(value) && Object.prototype.toString.call(value) === "[object Object]";
}
function sanitizeJsonSchema(value) {
	if (typeof value !== "object" || value === null) return value;
	if (Array.isArray(value)) return value.map((item) => sanitizeJsonSchema(item));
	const obj = value;
	const result = {};
	for (const [key, val] of Object.entries(obj)) {
		if (key === "properties" && typeof val === "object" && val !== null && !Array.isArray(val)) {
			const props = val;
			const sanitizedProps = {};
			for (const [propName, propSchema] of Object.entries(props)) sanitizedProps[propName] = sanitizeJsonSchema(propSchema);
			result[key] = sanitizedProps;
			continue;
		}
		if (key === "$schema" || key === "$id" || key === "$ref" || key === "$defs" || key === "definitions" || key === "title" || key === "examples" || key === "default" || key === "format" || key === "pattern") continue;
		result[key] = sanitizeJsonSchema(val);
	}
	return result;
}
function safeStringify(value) {
	if (typeof value === "string") return value;
	try {
		return JSON.stringify(value);
	} catch {
		return String(value);
	}
}
function mergeStringRecord(base, override) {
	if (override !== void 0) {
		if (Object.keys(override).length === 0) return {};
		return {
			...base ?? {},
			...override
		};
	}
	if (base) return { ...base };
}
function omitAuthorizationHeader(headers) {
	if (headers === void 0) return void 0;
	return Object.fromEntries(Object.entries(headers).filter(([key]) => key.toLowerCase() !== "authorization"));
}
function mcpHttpHeadersWithBearerToken(server) {
	const headers = server.httpHeaders ? { ...server.httpHeaders } : void 0;
	if (server.bearerToken === void 0) return headers;
	const hasAuthorizationHeader = Object.keys(headers ?? {}).some((key) => key.toLowerCase() === "authorization");
	return {
		...headers ?? {},
		...hasAuthorizationHeader ? {} : { Authorization: `Bearer ${server.bearerToken}` }
	};
}
function mergeSingleMcpServer(existing, incoming) {
	if (!existing || existing.transport !== incoming.transport) return { ...incoming };
	if (incoming.transport === "stdio") {
		const baseStdio = existing;
		return {
			transport: "stdio",
			command: incoming.command,
			args: incoming.args ?? baseStdio.args,
			env: mergeStringRecord(baseStdio.env, incoming.env),
			cwd: incoming.cwd ?? baseStdio.cwd,
			enabled: incoming.enabled ?? existing.enabled,
			startupTimeoutSec: incoming.startupTimeoutSec ?? existing.startupTimeoutSec,
			toolTimeoutSec: incoming.toolTimeoutSec ?? existing.toolTimeoutSec,
			enabledTools: incoming.enabledTools ?? existing.enabledTools,
			disabledTools: incoming.disabledTools ?? existing.disabledTools
		};
	}
	const baseHttp = existing;
	const hasIncomingAuth = incoming.bearerToken !== void 0 || incoming.bearerTokenEnvVar !== void 0;
	const bearerToken = hasIncomingAuth ? incoming.bearerToken : baseHttp.bearerToken;
	const bearerTokenEnvVar = hasIncomingAuth ? incoming.bearerTokenEnvVar : baseHttp.bearerTokenEnvVar;
	const baseHttpHeaders = hasIncomingAuth ? omitAuthorizationHeader(baseHttp.httpHeaders) : baseHttp.httpHeaders;
	return {
		transport: "http",
		url: incoming.url,
		bearerToken,
		bearerTokenEnvVar,
		httpHeaders: mergeStringRecord(baseHttpHeaders, incoming.httpHeaders),
		envHttpHeaders: mergeStringRecord(baseHttp.envHttpHeaders, incoming.envHttpHeaders),
		enabled: incoming.enabled ?? existing.enabled,
		startupTimeoutSec: incoming.startupTimeoutSec ?? existing.startupTimeoutSec,
		toolTimeoutSec: incoming.toolTimeoutSec ?? existing.toolTimeoutSec,
		enabledTools: incoming.enabledTools ?? existing.enabledTools,
		disabledTools: incoming.disabledTools ?? existing.disabledTools
	};
}
function mergeMcpServers(base, override) {
	if (!base && !override) return void 0;
	const normalizedBase = {};
	for (const [rawName, server] of Object.entries(base ?? {})) {
		const name = assertValidMcpServerName(rawName);
		normalizedBase[name] = server;
	}
	if (!override) return normalizedBase;
	const merged = { ...normalizedBase };
	for (const [rawName, incoming] of Object.entries(override)) {
		const name = assertValidMcpServerName(rawName);
		const existing = merged[name];
		merged[name] = mergeSingleMcpServer(existing, incoming);
	}
	return merged;
}
function mapUnsupportedSettingsWarnings(options) {
	const unsupported = [];
	const add = (setting, name) => {
		if (setting !== void 0) unsupported.push({
			type: "unsupported",
			feature: name,
			details: `Codex CLI does not support ${name}; it will be ignored.`
		});
	};
	add(options.temperature, "temperature");
	add(options.topP, "topP");
	add(options.topK, "topK");
	add(options.maxOutputTokens, "maxOutputTokens");
	add(options.presencePenalty, "presencePenalty");
	add(options.frequencyPenalty, "frequencyPenalty");
	add(options.stopSequences?.length ? options.stopSequences : void 0, "stopSequences");
	add(options.seed, "seed");
	add(options.tools, "tools");
	const toolChoice = options.toolChoice;
	add(toolChoice !== void 0 && toolChoice.type === "auto" ? void 0 : toolChoice, "toolChoice");
	return unsupported;
}
function mcpServersToConfigOverrides(mcpServers, rmcpClient) {
	const overrides = {};
	const setOverride = (key, value) => {
		assertValidConfigOverrideKey(key);
		overrides[key] = value;
	};
	if (rmcpClient !== void 0) setOverride("features.rmcp_client", rmcpClient);
	if (!mcpServers) return overrides;
	for (const [rawName, server] of Object.entries(mcpServers)) {
		const prefix = `mcp_servers.${assertValidMcpServerName(rawName)}`;
		if (server.enabled !== void 0) setOverride(`${prefix}.enabled`, server.enabled);
		if (server.startupTimeoutSec !== void 0) setOverride(`${prefix}.startup_timeout_sec`, server.startupTimeoutSec);
		if (server.toolTimeoutSec !== void 0) setOverride(`${prefix}.tool_timeout_sec`, server.toolTimeoutSec);
		if (server.enabledTools !== void 0) setOverride(`${prefix}.enabled_tools`, server.enabledTools);
		if (server.disabledTools !== void 0) setOverride(`${prefix}.disabled_tools`, server.disabledTools);
		if (server.transport === "stdio") {
			setOverride(`${prefix}.command`, server.command);
			if (server.args !== void 0) setOverride(`${prefix}.args`, server.args);
			if (server.env !== void 0) setOverride(`${prefix}.env`, server.env);
			if (server.cwd) setOverride(`${prefix}.cwd`, server.cwd);
		} else {
			setOverride(`${prefix}.url`, server.url);
			if (server.bearerTokenEnvVar !== void 0) setOverride(`${prefix}.bearer_token_env_var`, server.bearerTokenEnvVar);
			const httpHeaders = mcpHttpHeadersWithBearerToken(server);
			if (httpHeaders !== void 0) setOverride(`${prefix}.http_headers`, httpHeaders);
			if (server.envHttpHeaders !== void 0) setOverride(`${prefix}.env_http_headers`, server.envHttpHeaders);
		}
	}
	return overrides;
}
var CODEX_REASONING_EFFORTS = [
	"none",
	"minimal",
	"low",
	"medium",
	"high",
	"xhigh",
	"max",
	"ultra"
];
var loggerFunctionSchema = require_dist.object({
	debug: require_dist.any().refine((val) => typeof val === "function", { message: "debug must be a function" }),
	info: require_dist.any().refine((val) => typeof val === "function", { message: "info must be a function" }),
	warn: require_dist.any().refine((val) => typeof val === "function", { message: "warn must be a function" }),
	error: require_dist.any().refine((val) => typeof val === "function", { message: "error must be a function" })
});
var mcpServerBaseSchema = require_dist.object({
	enabled: require_dist.boolean().optional(),
	startupTimeoutSec: require_dist.number().int().positive().optional(),
	toolTimeoutSec: require_dist.number().int().positive().optional(),
	enabledTools: require_dist.array(require_dist.string()).optional(),
	disabledTools: require_dist.array(require_dist.string()).optional()
});
var mcpServerStdioSchema = mcpServerBaseSchema.extend({
	transport: require_dist.literal("stdio"),
	command: require_dist.string().min(1),
	args: require_dist.array(require_dist.string()).optional(),
	env: require_dist.record(require_dist.string(), require_dist.string()).optional(),
	cwd: require_dist.string().optional()
});
var mcpServerHttpSchema = mcpServerBaseSchema.extend({
	transport: require_dist.literal("http"),
	url: require_dist.string().min(1),
	bearerToken: require_dist.string().optional(),
	bearerTokenEnvVar: require_dist.string().optional(),
	httpHeaders: require_dist.record(require_dist.string(), require_dist.string()).optional(),
	envHttpHeaders: require_dist.record(require_dist.string(), require_dist.string()).optional()
});
var mcpServerSchema = require_dist.discriminatedUnion("transport", [mcpServerStdioSchema, mcpServerHttpSchema]);
var mcpServerNameSchema = require_dist.string().min(1).refine((value) => isValidMcpServerName(value), { message: "MCP server names must match /^[A-Za-z0-9_-]+$/." });
var mcpServersSchema = require_dist.record(mcpServerNameSchema, mcpServerSchema);
var sdkMcpServerSchema = require_dist.object({
	name: mcpServerNameSchema,
	_start: require_dist.any().refine((val) => typeof val === "function", { message: "_start must be a function" }),
	_stop: require_dist.any().refine((val) => typeof val === "function", { message: "_stop must be a function" })
}).passthrough();
var appServerMcpServersSchema = require_dist.record(mcpServerNameSchema, require_dist.union([mcpServerSchema, sdkMcpServerSchema]));
var configOverrideKeySchema = require_dist.string().min(1).refine((value) => isValidConfigOverrideKey(value), { message: "configOverrides keys must match /^[A-Za-z0-9_-]+(?:\\.[A-Za-z0-9_-]+)*$/." });
var reasoningEffortSchema = require_dist._enum(CODEX_REASONING_EFFORTS);
var configOverridesSchema = require_dist.record(configOverrideKeySchema, require_dist.union([
	require_dist.string(),
	require_dist.number(),
	require_dist.boolean(),
	require_dist.object({}).passthrough(),
	require_dist.array(require_dist.any())
])).optional();
var execSettingsSchema = require_dist.object({
	cwd: require_dist.string().optional(),
	approvalMode: require_dist._enum([
		"untrusted",
		"on-failure",
		"on-request",
		"never"
	]).optional(),
	sandboxMode: require_dist._enum([
		"read-only",
		"workspace-write",
		"danger-full-access"
	]).optional(),
	env: require_dist.record(require_dist.string(), require_dist.string()).optional(),
	verbose: require_dist.boolean().optional(),
	logger: require_dist.union([require_dist.literal(false), loggerFunctionSchema]).optional(),
	reasoningEffort: reasoningEffortSchema.optional(),
	reasoningSummary: require_dist._enum(["auto", "detailed"]).optional(),
	reasoningSummaryFormat: require_dist._enum(["none", "experimental"]).optional(),
	modelVerbosity: require_dist._enum([
		"low",
		"medium",
		"high"
	]).optional(),
	mcpServers: mcpServersSchema.optional(),
	rmcpClient: require_dist.boolean().optional(),
	configOverrides: configOverridesSchema
}).strict().extend({
	codexPath: require_dist.string().optional(),
	addDirs: require_dist.array(require_dist.string().min(1)).optional(),
	fullAuto: require_dist.boolean().optional(),
	dangerouslyBypassApprovalsAndSandbox: require_dist.boolean().optional(),
	skipGitRepoCheck: require_dist.boolean().optional(),
	color: require_dist._enum([
		"always",
		"never",
		"auto"
	]).optional(),
	allowNpx: require_dist.boolean().optional(),
	outputLastMessageFile: require_dist.string().optional(),
	profile: require_dist.string().optional(),
	oss: require_dist.boolean().optional(),
	webSearch: require_dist.boolean().optional()
}).strict();
var approvalRejectSchema = require_dist.object({ reject: require_dist.object({
	sandbox_approval: require_dist.boolean(),
	rules: require_dist.boolean(),
	mcp_elicitations: require_dist.boolean()
}) });
var approvalGranularSchema = require_dist.object({ granular: require_dist.object({
	sandbox_approval: require_dist.boolean(),
	rules: require_dist.boolean(),
	mcp_elicitations: require_dist.boolean(),
	skill_approval: require_dist.boolean().optional(),
	request_permissions: require_dist.boolean().optional()
}) });
var appServerApprovalPolicySchema = require_dist.union([
	require_dist._enum([
		"untrusted",
		"on-failure",
		"on-request",
		"never"
	]),
	approvalGranularSchema,
	approvalRejectSchema
]);
var sandboxPolicySchema = require_dist.union([require_dist._enum([
	"read-only",
	"workspace-write",
	"danger-full-access"
]), require_dist.object({ type: require_dist.string() }).passthrough()]);
var serverRequestsSchema = require_dist.object({
	onCommandExecutionApproval: require_dist.any().refine((val) => val === void 0 || typeof val === "function", { message: "onCommandExecutionApproval must be a function" }).optional(),
	onFileChangeApproval: require_dist.any().refine((val) => val === void 0 || typeof val === "function", { message: "onFileChangeApproval must be a function" }).optional(),
	onSkillApproval: require_dist.any().refine((val) => val === void 0 || typeof val === "function", { message: "onSkillApproval must be a function" }).optional(),
	onMcpElicitation: require_dist.any().refine((val) => val === void 0 || typeof val === "function", { message: "onMcpElicitation must be a function" }).optional(),
	onToolRequestUserInput: require_dist.any().refine((val) => val === void 0 || typeof val === "function", { message: "onToolRequestUserInput must be a function" }).optional(),
	onDynamicToolCall: require_dist.any().refine((val) => val === void 0 || typeof val === "function", { message: "onDynamicToolCall must be a function" }).optional(),
	onAuthRefresh: require_dist.any().refine((val) => val === void 0 || typeof val === "function", { message: "onAuthRefresh must be a function" }).optional(),
	onUnhandled: require_dist.any().refine((val) => val === void 0 || typeof val === "function", { message: "onUnhandled must be a function" }).optional()
}).strict().optional();
var appServerSettingsSchema = require_dist.object({
	codexPath: require_dist.string().optional(),
	cwd: require_dist.string().optional(),
	env: require_dist.record(require_dist.string(), require_dist.string()).optional(),
	verbose: require_dist.boolean().optional(),
	logger: require_dist.union([require_dist.literal(false), loggerFunctionSchema]).optional(),
	personality: require_dist._enum([
		"none",
		"friendly",
		"pragmatic"
	]).optional(),
	effort: reasoningEffortSchema.optional(),
	summary: require_dist._enum([
		"auto",
		"concise",
		"detailed",
		"none"
	]).optional(),
	approvalPolicy: appServerApprovalPolicySchema.optional(),
	sandboxPolicy: sandboxPolicySchema.optional(),
	baseInstructions: require_dist.string().optional(),
	developerInstructions: require_dist.string().optional(),
	mcpServers: appServerMcpServersSchema.optional(),
	rmcpClient: require_dist.boolean().optional(),
	configOverrides: configOverridesSchema,
	autoApprove: require_dist.boolean().optional(),
	persistExtendedHistory: require_dist.boolean().optional(),
	connectionTimeoutMs: require_dist.number().int().positive().optional(),
	requestTimeoutMs: require_dist.number().int().positive().optional(),
	idleTimeoutMs: require_dist.number().int().positive().optional(),
	minCodexVersion: require_dist.string().regex(/^\d+\.\d+\.\d+(-[A-Za-z0-9.-]+)?$/, "minCodexVersion must be a semver string").optional(),
	threadMode: require_dist._enum(["stateless", "persistent"]).optional(),
	resume: require_dist.string().optional(),
	includeRawChunks: require_dist.boolean().optional(),
	serverRequests: serverRequestsSchema,
	onSessionCreated: require_dist.any().refine((val) => val === void 0 || typeof val === "function", { message: "onSessionCreated must be a function" }).optional()
}).strict();
var appServerProviderOptionsSchema = require_dist.object({
	threadId: require_dist.string().optional(),
	resume: require_dist.string().optional(),
	threadMode: require_dist._enum(["stateless", "persistent"]).optional(),
	includeRawChunks: require_dist.boolean().optional(),
	personality: require_dist._enum([
		"none",
		"friendly",
		"pragmatic"
	]).optional(),
	effort: reasoningEffortSchema.optional(),
	summary: require_dist._enum([
		"auto",
		"concise",
		"detailed",
		"none"
	]).optional(),
	approvalPolicy: appServerApprovalPolicySchema.optional(),
	sandboxPolicy: sandboxPolicySchema.optional(),
	baseInstructions: require_dist.string().optional(),
	developerInstructions: require_dist.string().optional(),
	mcpServers: appServerMcpServersSchema.optional(),
	rmcpClient: require_dist.boolean().optional(),
	configOverrides: configOverridesSchema,
	autoApprove: require_dist.boolean().optional(),
	persistExtendedHistory: require_dist.boolean().optional(),
	serverRequests: serverRequestsSchema,
	onSessionCreated: require_dist.any().refine((val) => val === void 0 || typeof val === "function", { message: "onSessionCreated must be a function" }).optional()
}).strict();
function parseValidationIssues(error) {
	let issues = [];
	if (error && typeof error === "object") {
		const v4 = error.issues;
		const v3 = error.errors;
		if (Array.isArray(v4)) issues = v4;
		else if (Array.isArray(v3)) issues = v3;
	}
	return issues.map((i) => {
		const path2 = Array.isArray(i?.path) ? i.path.join(".") : "";
		const message = i?.message || "Invalid value";
		return `${path2 ? path2 + ": " : ""}${message}`;
	});
}
function makeValidationResult(parsed, warnings) {
	if (!parsed.success) return {
		valid: false,
		warnings,
		errors: parseValidationIssues(parsed.error)
	};
	return {
		valid: true,
		warnings,
		errors: []
	};
}
function validateExecSettings(settings) {
	const warnings = [];
	const parsed = execSettingsSchema.safeParse(settings);
	if (!parsed.success) return makeValidationResult(parsed, warnings);
	const s = parsed.data;
	if (s.fullAuto && s.dangerouslyBypassApprovalsAndSandbox) warnings.push("Both fullAuto and dangerouslyBypassApprovalsAndSandbox specified; fullAuto takes precedence.");
	if (s.fullAuto && s.sandboxMode !== void 0 && s.sandboxMode !== "workspace-write") warnings.push(`fullAuto is deprecated (Codex CLI 0.147 removed --full-auto); its sandbox mapping is ignored because sandboxMode '${s.sandboxMode}' is set explicitly (its approvalMode 'never' default and its precedence over dangerouslyBypassApprovalsAndSandbox still apply).`);
	else if (s.fullAuto) warnings.push("fullAuto is deprecated (Codex CLI 0.147 removed --full-auto); it now defaults sandboxMode to 'workspace-write' and approvalMode to 'never' unless those are set explicitly.");
	if (isDeprecatedApprovalPolicyAlias(s.approvalMode)) warnings.push(`approvalMode '${s.approvalMode}' is deprecated (retired by Codex CLI 0.143); it is sent as 'on-request'.`);
	return {
		valid: true,
		warnings,
		errors: []
	};
}
function validateAppServerSettings(settings) {
	const warnings = [];
	const parsed = appServerSettingsSchema.safeParse(settings);
	if (!parsed.success) return {
		valid: false,
		warnings,
		errors: parseValidationIssues(parsed.error)
	};
	const s = parsed.data;
	if (s.autoApprove && s.approvalPolicy !== void 0) warnings.push("autoApprove overrides approvalPolicy for server-initiated approval requests.");
	if (isDeprecatedApprovalPolicyAlias(s.approvalPolicy)) warnings.push(`approvalPolicy '${s.approvalPolicy}' is deprecated (retired by Codex CLI 0.143 and rejected by app-server >= 0.144); it is sent as 'on-request'.`);
	else if (typeof s.approvalPolicy === "object" && s.approvalPolicy !== null && "reject" in s.approvalPolicy) warnings.push("approvalPolicy { reject } is deprecated (removed from the Codex app-server protocol); it is translated to the equivalent { granular } policy.");
	if (s.threadMode === "persistent" && s.resume) warnings.push("threadMode=persistent ignores resume when an explicit thread is already active.");
	return {
		valid: true,
		warnings,
		errors: []
	};
}
function validateModelId(modelId) {
	if (!modelId || modelId.trim() === "") return "Model ID cannot be empty";
}
function isTaggedFileData(value) {
	if (typeof value !== "object" || value === null || !("type" in value)) return false;
	return value.type === "data" || value.type === "url" || value.type === "reference" || value.type === "text";
}
function resolveImageMimeType(declaredType, data) {
	if (require_dist.isFullMediaType(declaredType)) return declaredType;
	const bytes = typeof data === "string" || data instanceof Uint8Array ? data : data instanceof ArrayBuffer ? new Uint8Array(data) : void 0;
	if (bytes !== void 0) {
		const detected = require_dist.detectMediaType({
			data: bytes,
			topLevelType: require_dist.getTopLevelMediaType(declaredType)
		});
		if (detected) return detected;
	}
	return "image/png";
}
function extractImageData(part) {
	if (typeof part !== "object" || part === null) return null;
	const p = part;
	const isFilePart2 = p.type === "file";
	const declaredType = isFilePart2 ? p.mediaType || "image/png" : p.mimeType || "image/png";
	if (isFilePart2 && require_dist.getTopLevelMediaType(declaredType).toLowerCase() !== "image") return null;
	let primaryInput = isFilePart2 ? p.data : p.image;
	if (isTaggedFileData(primaryInput)) {
		if (primaryInput.type === "data") primaryInput = primaryInput.data;
		else if (primaryInput.type === "url") primaryInput = primaryInput.url;
		else return null;
	}
	const mimeType = resolveImageMimeType(declaredType, primaryInput);
	if (typeof primaryInput === "string") return extractFromString(primaryInput, mimeType);
	if (typeof primaryInput === "object" && primaryInput !== null && primaryInput instanceof URL) {
		if (primaryInput.protocol === "data:") return extractFromString(primaryInput.toString(), mimeType);
		return null;
	}
	if (Buffer.isBuffer(primaryInput)) return {
		data: `data:${mimeType};base64,${primaryInput.toString("base64")}`,
		mimeType
	};
	if (isBinaryInput(primaryInput)) return {
		data: `data:${mimeType};base64,${Buffer.from(primaryInput).toString("base64")}`,
		mimeType
	};
	if (isFilePart2 && typeof p.url === "string") return extractFromString(p.url, mimeType);
	if (!isFilePart2 && typeof p.data === "string") return extractFromString(p.data, mimeType);
	if (!isFilePart2 && typeof p.url === "string") return extractFromString(p.url, mimeType);
	return null;
}
function extractFromString(value, fallbackMimeType) {
	const trimmed = value.trim();
	if (/^file:\/\//i.test(trimmed)) return null;
	if (/^https?:\/\//i.test(trimmed)) return null;
	if (trimmed.startsWith("data:")) {
		const match = trimmed.match(/^data:([^;,]+);base64,([^,]+)$/);
		if (!match) return null;
		const payload2 = normalizeBase64Payload(match[2] ?? "");
		if (!payload2) return null;
		const mimeType = match[1] || fallbackMimeType;
		return {
			data: `data:${mimeType};base64,${payload2}`,
			mimeType
		};
	}
	const payload = normalizeBase64Payload(trimmed);
	if (!payload) return null;
	return {
		data: `data:${fallbackMimeType};base64,${payload}`,
		mimeType: fallbackMimeType
	};
}
function isBinaryInput(value) {
	if (value instanceof ArrayBuffer) return true;
	return value instanceof Uint8Array;
}
function writeImageToTempFile(imageData) {
	const dir = (0, fs.mkdtempSync)((0, path.join)((0, os.tmpdir)(), "codex-img-"));
	const ext = getExtensionFromMimeType(imageData.mimeType);
	const filePath = (0, path.join)(dir, `image.${ext}`);
	const base64Match = imageData.data.match(/^data:[^;]+;base64,(.+)$/);
	if (!base64Match) throw new Error("Invalid data URL format: expected data:[type];base64,[data]");
	const payload = normalizeBase64Payload(base64Match[1] ?? "");
	if (!payload) throw new Error("Invalid base64 image payload");
	const buffer = Buffer.from(payload, "base64");
	(0, fs.writeFileSync)(filePath, buffer);
	return filePath;
}
function cleanupTempImages(paths) {
	for (const filePath of paths) try {
		(0, fs.rmSync)(filePath, { force: true });
		const dir = filePath.replace(/[/\\][^/\\]+$/, "");
		if (dir.includes("codex-img-")) (0, fs.rmSync)(dir, {
			force: true,
			recursive: true
		});
	} catch {}
}
function getExtensionFromMimeType(mimeType) {
	if (!mimeType) return "png";
	return {
		"image/png": "png",
		"image/jpeg": "jpg",
		"image/jpg": "jpg",
		"image/gif": "gif",
		"image/webp": "webp",
		"image/bmp": "bmp",
		"image/svg+xml": "svg"
	}[mimeType.toLowerCase()] || mimeType.split("/")[1] || "png";
}
function normalizeBase64Payload(value) {
	const compact = value.replace(/\s+/g, "");
	if (!compact) return null;
	if (!/^[A-Za-z0-9+/]*={0,2}$/.test(compact)) return null;
	if (compact.length % 4 === 1) return null;
	const padded = compact.padEnd(Math.ceil(compact.length / 4) * 4, "=");
	try {
		if (Buffer.from(padded, "base64").toString("base64") !== padded) return null;
		return padded;
	} catch {
		return null;
	}
}
function isHttpUrl(value) {
	return /^https?:\/\//i.test(value.trim());
}
function isFileUrlValue(value) {
	if (value instanceof URL) return value.protocol === "file:";
	if (typeof value === "string") return /^file:\/\//i.test(value.trim());
	return false;
}
function asRemoteUrl(value) {
	if (value instanceof URL) {
		const asString = value.toString();
		return isHttpUrl(asString) ? asString : void 0;
	}
	if (typeof value === "string") return isHttpUrl(value) ? value.trim() : void 0;
}
function isImageMediaType(mediaType) {
	return require_dist.getTopLevelMediaType(mediaType).toLowerCase() === "image";
}
function isFilePart(part) {
	return part.type === "file" && "mediaType" in part && typeof part.mediaType === "string";
}
function isCompatImagePart(part) {
	return part.type === "image";
}
function isTaggedFileData2(value) {
	if (typeof value !== "object" || value === null || !("type" in value)) return false;
	return value.type === "data" || value.type === "url" || value.type === "reference" || value.type === "text";
}
function toImageReference(part) {
	if (isFilePart(part)) {
		if (!isImageMediaType(part.mediaType)) return {
			kind: "unsupported",
			warning: `Unsupported file mediaType "${part.mediaType}"; only image/* is supported.`
		};
		const data = part.data;
		if (isTaggedFileData2(data)) {
			if (data.type === "reference") return {
				kind: "unsupported",
				warning: "File reference data is not supported for images."
			};
			if (data.type === "text") return {
				kind: "unsupported",
				warning: "Inline text file data is not supported for images."
			};
			if (data.type === "url") {
				const remote2 = asRemoteUrl(data.url);
				if (remote2) return {
					kind: "remote",
					url: remote2
				};
				if (isFileUrlValue(data.url)) return {
					kind: "unsupported",
					warning: "file:// image URLs are not supported."
				};
			}
			const image2 = extractImageData(part);
			if (image2) return {
				kind: "local",
				image: image2
			};
			return {
				kind: "unsupported",
				warning: "Unsupported image format in message."
			};
		}
		const remote = asRemoteUrl(data);
		if (remote) return {
			kind: "remote",
			url: remote
		};
		const image = extractImageData(part);
		if (image) return {
			kind: "local",
			image
		};
		if (isFileUrlValue(data) || "url" in part && isFileUrlValue(part.url)) return {
			kind: "unsupported",
			warning: "file:// image URLs are not supported."
		};
		return {
			kind: "unsupported",
			warning: "Unsupported image format in message."
		};
	}
	if (isCompatImagePart(part)) {
		const remote = asRemoteUrl(part.image) ?? asRemoteUrl(part.url);
		if (remote) return {
			kind: "remote",
			url: remote
		};
		const image = extractImageData(part);
		if (image) return {
			kind: "local",
			image
		};
		if (isFileUrlValue(part.image) || isFileUrlValue(part.url) || isFileUrlValue(part.data)) return {
			kind: "unsupported",
			warning: "file:// image URLs are not supported."
		};
		return {
			kind: "unsupported",
			warning: "Unsupported image format in message."
		};
	}
}
function safeJsonStringify(value) {
	if (value === void 0) return "";
	if (typeof value === "string") return value;
	try {
		return JSON.stringify(value);
	} catch {
		return "[unserializable]";
	}
}
function describeTypeTag(value) {
	if (typeof value === "object" && value !== null && "type" in value) return String(value.type);
	return "unknown";
}
function formatToolResultOutput(output) {
	switch (output.type) {
		case "text": return {
			text: output.value,
			warnings: []
		};
		case "json": return {
			text: safeJsonStringify(output.value),
			warnings: []
		};
		case "execution-denied": return {
			text: output.reason ? `Execution denied: ${output.reason}` : "Execution denied",
			warnings: []
		};
		case "error-text": return {
			text: `Tool error: ${output.value}`,
			warnings: []
		};
		case "error-json": return {
			text: `Tool error: ${safeJsonStringify(output.value)}`,
			warnings: []
		};
		case "content": {
			const warnings = [];
			return {
				text: output.value.map((part) => {
					if (part.type === "text") return part.text;
					if (part.type === "file") {
						const prefix = isImageMediaType(part.mediaType) ? "image" : "file";
						const data = part.data;
						if (data.type === "data") return prefix === "image" ? `[image-data: ${part.mediaType}]` : `[file-data: ${part.mediaType}${part.filename ? `, ${part.filename}` : ""}]`;
						if (data.type === "url") return `[${prefix}-url: ${data.url}]`;
						if (data.type === "reference") return prefix === "image" ? "[image-file-id]" : "[file-id]";
						if (data.type === "text") return data.text;
						warnings.push({
							type: "unsupported",
							feature: "tool-result.content.file",
							details: `Unsupported tool file content data type "${describeTypeTag(data)}".`
						});
						return "[unsupported-tool-content-part]";
					}
					if (part.type === "custom") {
						warnings.push({
							type: "unsupported",
							feature: "tool-result.content.custom",
							details: "Custom tool content parts are not supported."
						});
						return "";
					}
					warnings.push({
						type: "unsupported",
						feature: `tool-result.content.${describeTypeTag(part)}`,
						details: `Unsupported tool content part "${describeTypeTag(part)}".`
					});
					return "[unsupported-tool-content-part]";
				}).filter((part) => part.length > 0).join("\n"),
				warnings
			};
		}
		default: return {
			text: "[unsupported-tool-result-output]",
			warnings: [{
				type: "unsupported",
				feature: `tool-result.output.${describeTypeTag(output)}`,
				details: `Unsupported tool result output type "${describeTypeTag(output)}".`
			}]
		};
	}
}
function isTextPart(part) {
	return part.type === "text" && typeof part.text === "string";
}
function isReasoningPart(part) {
	return part.type === "reasoning" && typeof part.text === "string";
}
function isToolCallPart(part) {
	const typed = part;
	return part.type === "tool-call" && typeof typed.toolName === "string" && typeof typed.toolCallId === "string" && "input" in typed;
}
function isToolResultPart(part) {
	const typed = part;
	return part.type === "tool-result" && typeof typed.toolName === "string" && typed.output !== void 0;
}
function isToolApprovalResponsePart(part) {
	const typed = part;
	return part.type === "tool-approval-response" && typeof typed.approvalId === "string" && typeof typed.approved === "boolean" && (typed.reason === void 0 || typeof typed.reason === "string");
}
function collectSystemInstruction(prompt) {
	const parts = [];
	for (const message of prompt) {
		if (message.role !== "system") continue;
		if (typeof message.content === "string") {
			const text = message.content.trim();
			if (text.length > 0) parts.push(text);
			continue;
		}
		for (const part of message.content) {
			if (!isTextPart(part)) continue;
			const text = part.text.trim();
			if (text.length > 0) parts.push(text);
		}
	}
	if (parts.length === 0) return void 0;
	return parts.join("\n\n");
}
function normalizeUserInputFromMessages(messages) {
	const warnings = [];
	const localImages = [];
	const remoteImageUrls = [];
	const userTextParts = [];
	let sawImages = false;
	for (const message of messages) {
		if (message.role !== "user") continue;
		if (typeof message.content === "string") {
			const text = message.content.trim();
			if (text.length > 0) userTextParts.push(text);
			continue;
		}
		const inlineTextParts = [];
		for (const part of message.content) {
			if (isTextPart(part)) {
				const text = part.text.trim();
				if (text.length > 0) inlineTextParts.push(text);
				continue;
			}
			if (isFilePart(part) || isCompatImagePart(part)) {
				const image = toImageReference(part);
				if (!image) continue;
				sawImages = true;
				if (image.kind === "local") localImages.push(image.image);
				else if (image.kind === "remote") remoteImageUrls.push(image.url);
				else warnings.push({
					type: "unsupported",
					feature: `prompt.user.${part.type}`,
					details: image.warning
				});
				continue;
			}
			warnings.push({
				type: "unsupported",
				feature: `prompt.user.${part.type}`,
				details: `Unsupported user content part "${part.type}".`
			});
		}
		const joined = inlineTextParts.join("\n").trim();
		if (joined.length > 0) userTextParts.push(joined);
	}
	return {
		text: userTextParts.join("\n").trim(),
		localImages,
		remoteImageUrls,
		warnings,
		sawImages
	};
}
function formatAssistantParts(parts) {
	const warnings = [];
	const lines = [];
	const textParts = [];
	for (const part of parts) {
		if (isTextPart(part)) {
			const text2 = part.text.trim();
			if (text2.length > 0) textParts.push(text2);
			continue;
		}
		if (isReasoningPart(part)) {
			const text2 = part.text.trim();
			if (text2.length > 0) lines.push(`Assistant Reasoning: ${text2}`);
			continue;
		}
		if (part.type === "tool-call") {
			if (isToolCallPart(part)) lines.push(`Tool Call (${part.toolName}): ${safeJsonStringify(part.input)}`);
			else warnings.push({
				type: "unsupported",
				feature: "prompt.assistant.tool-call.malformed",
				details: "Malformed assistant tool-call part; expected toolName, toolCallId, and input."
			});
			continue;
		}
		if (isToolResultPart(part)) {
			const formatted = formatToolResultOutput(part.output);
			lines.push(`Tool Result (${part.toolName}): ${formatted.text}`);
			warnings.push(...formatted.warnings);
			continue;
		}
		if (isFilePart(part)) {
			lines.push(`[assistant-file: ${part.mediaType}]`);
			continue;
		}
		if (part.type === "custom") {
			const kind = "kind" in part && typeof part.kind === "string" ? part.kind : void 0;
			warnings.push({
				type: "unsupported",
				feature: "prompt.assistant.custom",
				details: `Custom content parts are not supported${kind ? ` (kind "${kind}")` : ""}.`
			});
			continue;
		}
		if (part.type === "reasoning-file") {
			warnings.push({
				type: "unsupported",
				feature: "prompt.assistant.reasoning-file",
				details: "Reasoning file parts are not supported."
			});
			continue;
		}
		warnings.push({
			type: "unsupported",
			feature: `prompt.assistant.${part.type}`,
			details: `Unsupported assistant content part "${part.type}".`
		});
	}
	const text = textParts.join("\n").trim();
	if (text.length > 0) lines.unshift(`Assistant: ${text}`);
	return {
		lines,
		warnings
	};
}
function formatToolRoleParts(parts) {
	const warnings = [];
	const lines = [];
	for (const part of parts) {
		if (isToolResultPart(part)) {
			const formatted = formatToolResultOutput(part.output);
			lines.push(`Tool Result (${part.toolName}): ${formatted.text}`);
			warnings.push(...formatted.warnings);
			continue;
		}
		if (isToolApprovalResponsePart(part)) {
			const decision = part.approved ? "approved" : "denied";
			const reason = part.reason ? ` (${part.reason})` : "";
			lines.push(`Tool Approval (${part.approvalId}): ${decision}${reason}`);
			continue;
		}
		warnings.push({
			type: "unsupported",
			feature: `prompt.tool.${part.type}`,
			details: `Unsupported tool message content part "${part.type}".`
		});
	}
	return {
		lines,
		warnings
	};
}
function formatStatelessTranscript(prompt, options) {
	const warnings = [];
	const lines = [];
	const localImages = [];
	const remoteImageUrls = [];
	const includeRemoteImagesInMarkers = options?.includeRemoteImagesInMarkers ?? true;
	for (const message of prompt) {
		if (message.role === "system") continue;
		if (message.role === "user") {
			const normalized = normalizeUserInputFromMessages([message]);
			warnings.push(...normalized.warnings);
			localImages.push(...normalized.localImages);
			remoteImageUrls.push(...normalized.remoteImageUrls);
			const markerImageCount = normalized.localImages.length + (includeRemoteImagesInMarkers ? normalized.remoteImageUrls.length : 0);
			const marker = normalized.sawImages && markerImageCount > 0 ? `[${markerImageCount} image${markerImageCount === 1 ? "" : "s"} attached]` : "";
			const text = [normalized.text, marker].filter((part) => part.length > 0).join("\n").trim();
			if (text.length > 0) lines.push(`User: ${text}`);
			continue;
		}
		if (message.role === "assistant") {
			const formatted = formatAssistantParts(Array.isArray(message.content) ? message.content : [{
				type: "text",
				text: String(message.content)
			}]);
			lines.push(...formatted.lines);
			warnings.push(...formatted.warnings);
			continue;
		}
		if (message.role === "tool") {
			const formatted = formatToolRoleParts(Array.isArray(message.content) ? message.content : [{
				type: "text",
				text: String(message.content)
			}]);
			lines.push(...formatted.lines);
			warnings.push(...formatted.warnings);
			continue;
		}
	}
	return {
		text: lines.join("\n\n").trim(),
		localImages,
		remoteImageUrls,
		warnings
	};
}
function selectLatestUserTurn(prompt) {
	const selected = [];
	let collecting = false;
	for (let i = prompt.length - 1; i >= 0; i -= 1) {
		const message = prompt[i];
		if (!message) continue;
		if (message.role === "system") continue;
		if (message.role === "user") {
			selected.push(message);
			collecting = true;
			continue;
		}
		if (collecting) break;
	}
	if (selected.length > 0) return selected.reverse();
	for (let i = prompt.length - 1; i >= 0; i -= 1) {
		const message = prompt[i];
		if (!message) continue;
		if (message.role === "user") return [message];
	}
	return [];
}
function formatPersistentInput(prompt) {
	const selectedUserTurn = selectLatestUserTurn(prompt);
	const normalized = normalizeUserInputFromMessages(selectedUserTurn);
	const nonSystemCount = prompt.filter((message) => message.role !== "system").length;
	const selectedCount = selectedUserTurn.length;
	const warnings = [...normalized.warnings];
	if (nonSystemCount > selectedCount) warnings.push({
		type: "other",
		message: "Stateful mode ignores earlier prompt messages and only sends the latest user turn."
	});
	return {
		text: normalized.text,
		localImages: normalized.localImages,
		remoteImageUrls: normalized.remoteImageUrls,
		warnings
	};
}
function convertPromptToCodexInput(args) {
	const systemInstruction = collectSystemInstruction(args.prompt);
	const converted = args.mode === "persistent" ? formatPersistentInput(args.prompt) : formatStatelessTranscript(args.prompt, { includeRemoteImagesInMarkers: args.includeRemoteImagesInMarkers });
	return {
		systemInstruction,
		text: converted.text,
		localImages: converted.localImages,
		remoteImageUrls: converted.remoteImageUrls,
		warnings: converted.warnings
	};
}
function mapMessagesToPrompt(prompt) {
	const converted = convertPromptToCodexInput({
		prompt,
		mode: "stateless",
		includeRemoteImagesInMarkers: false
	});
	const warnings = converted.warnings.map((warning) => warning.type === "unsupported" ? {
		type: "unsupported",
		feature: warning.feature,
		details: warning.details
	} : {
		type: "other",
		message: warning.message
	});
	if (converted.remoteImageUrls.length > 0) warnings.push({
		type: "unsupported",
		feature: "prompt.user.image.remote-url.exec",
		details: "Unsupported image format in message (HTTP URLs not supported)"
	});
	const promptParts = [];
	if (converted.systemInstruction) promptParts.push(converted.systemInstruction);
	if (converted.text) promptParts.push(converted.text);
	return {
		promptText: promptParts.join("\n\n"),
		images: converted.localImages,
		...warnings.length > 0 ? { warnings } : {}
	};
}
var UnsupportedFeatureError = class extends require_dist.UnsupportedFunctionalityError {
	feature;
	minCodexVersion;
	serverVersion;
	constructor({ feature, minCodexVersion, serverVersion, message }) {
		const resolvedMessage = message ?? `Feature '${feature}' is not supported by this codex app-server` + (serverVersion ? ` (detected ${serverVersion})` : "") + (minCodexVersion ? `. Requires codex CLI >= ${minCodexVersion}.` : ".");
		super({
			functionality: feature,
			message: resolvedMessage
		});
		this.name = "UnsupportedFeatureError";
		this.feature = feature;
		this.minCodexVersion = minCodexVersion;
		this.serverVersion = serverVersion;
	}
};
function createAPICallError({ message, code, exitCode, stderr, promptExcerpt, provider = "exec", isRetryable = false }) {
	return new require_dist.APICallError({
		message,
		isRetryable,
		url: provider === "app-server" ? "codex-cli://app-server" : "codex-cli://exec",
		requestBodyValues: promptExcerpt ? { prompt: promptExcerpt } : void 0,
		data: {
			code,
			exitCode,
			stderr,
			promptExcerpt
		}
	});
}
function createAuthenticationError(message) {
	return new require_dist.LoadAPIKeyError({ message: message || "Authentication failed. Ensure Codex CLI is logged in (codex login)." });
}
function isAuthenticationError(err) {
	if (err instanceof require_dist.LoadAPIKeyError) return true;
	if (err instanceof require_dist.APICallError) {
		const data = err.data;
		if (data?.code !== void 0) {
			const normalized = String(data.code).trim().toLowerCase();
			if (normalized === "401" || normalized === "unauthorized" || normalized === "auth") return true;
		}
	}
	return false;
}
function isUnsupportedFeatureError(err) {
	return err instanceof UnsupportedFeatureError;
}
function isAgentMessageItemType(itemType) {
	return itemType === "agent_message" || itemType === "assistant_message";
}
var codexReasoningEfforts = {
	none: true,
	minimal: true,
	low: true,
	medium: true,
	high: true,
	xhigh: true,
	max: true,
	ultra: true
};
var codexCliProviderOptionsSchema = require_dist.object({
	reasoningEffort: reasoningEffortSchema.optional(),
	reasoningSummary: require_dist._enum(["auto", "detailed"]).optional(),
	reasoningSummaryFormat: require_dist._enum(["none", "experimental"]).optional(),
	textVerbosity: require_dist._enum([
		"low",
		"medium",
		"high"
	]).optional(),
	addDirs: require_dist.array(require_dist.string().min(1)).optional(),
	configOverrides: require_dist.record(require_dist.string().refine((key) => isValidConfigOverrideKey(key), { message: "configOverrides keys must match /^[A-Za-z0-9_-]+(?:\\.[A-Za-z0-9_-]+)*$/." }), require_dist.union([
		require_dist.string(),
		require_dist.number(),
		require_dist.boolean(),
		require_dist.object({}).passthrough(),
		require_dist.array(require_dist.any())
	])).optional(),
	mcpServers: mcpServersSchema.optional(),
	rmcpClient: require_dist.boolean().optional()
}).strict();
function resolveCodexPath(explicitPath, allowNpx) {
	if (explicitPath) {
		const lower = explicitPath.toLowerCase();
		if (lower.endsWith(".js") || lower.endsWith(".mjs") || lower.endsWith(".cjs")) return {
			cmd: "node",
			args: [explicitPath]
		};
		return {
			cmd: explicitPath,
			args: []
		};
	}
	try {
		return {
			cmd: "node",
			args: [(0, module$1.createRequire)(require("url").pathToFileURL(__filename).href).resolve("@openai/codex/package.json").replace(/package\.json$/, "") + "bin/codex.js"]
		};
	} catch {
		if (allowNpx) return {
			cmd: "npx",
			args: ["-y", "@openai/codex"]
		};
		return {
			cmd: "codex",
			args: []
		};
	}
}
var ExecLanguageModel = class {
	specificationVersion = "v4";
	provider = "codex-cli";
	supportedUrls = {};
	modelId;
	settings;
	logger;
	sessionId;
	deprecationWarningsEmitted = /* @__PURE__ */ new Set();
	constructor(options) {
		this.modelId = options.id;
		this.settings = options.settings ?? {};
		const baseLogger = getLogger(this.settings.logger);
		this.logger = createVerboseLogger(baseLogger, this.settings.verbose ?? false);
		if (!this.modelId || this.modelId.trim() === "") throw new require_dist.NoSuchModelError({
			modelId: this.modelId,
			modelType: "languageModel"
		});
		const warn = validateModelId(this.modelId);
		if (warn) this.logger.warn(`Codex CLI model: ${warn}`);
	}
	warnDeprecatedOnce(key, message) {
		if (this.deprecationWarningsEmitted.has(key)) return;
		this.deprecationWarningsEmitted.add(key);
		this.logger.warn(`[codex-cli] ${message}`);
	}
	mergeSettings(providerOptions) {
		if (!providerOptions) return this.settings;
		const mergedConfigOverrides = providerOptions.configOverrides || this.settings.configOverrides ? {
			...this.settings.configOverrides ?? {},
			...providerOptions.configOverrides ?? {}
		} : void 0;
		const mergedAddDirs = providerOptions.addDirs || this.settings.addDirs ? [...this.settings.addDirs ?? [], ...providerOptions.addDirs ?? []] : void 0;
		const mergedMcpServers = mergeMcpServers(this.settings.mcpServers, providerOptions.mcpServers);
		return {
			...this.settings,
			reasoningEffort: providerOptions.reasoningEffort ?? this.settings.reasoningEffort,
			reasoningSummary: providerOptions.reasoningSummary ?? this.settings.reasoningSummary,
			reasoningSummaryFormat: providerOptions.reasoningSummaryFormat ?? this.settings.reasoningSummaryFormat,
			modelVerbosity: providerOptions.textVerbosity ?? this.settings.modelVerbosity,
			configOverrides: mergedConfigOverrides,
			addDirs: mergedAddDirs,
			mcpServers: mergedMcpServers,
			rmcpClient: providerOptions.rmcpClient ?? this.settings.rmcpClient
		};
	}
	getItemType(item) {
		if (!item) return void 0;
		const data = item;
		const legacy = typeof data.item_type === "string" ? data.item_type : void 0;
		const current = typeof data.type === "string" ? data.type : void 0;
		return legacy ?? current;
	}
	buildArgs(images = [], responseFormat, settings = this.settings) {
		const base = resolveCodexPath(settings.codexPath, settings.allowNpx);
		const args = [
			...base.args,
			"exec",
			"--experimental-json"
		];
		if (settings.dangerouslyBypassApprovalsAndSandbox && !settings.fullAuto) args.push("--dangerously-bypass-approvals-and-sandbox");
		else {
			const requestedApproval = settings.approvalMode ?? (settings.fullAuto ? "never" : "on-request");
			if (isDeprecatedApprovalPolicyAlias(requestedApproval)) this.warnDeprecatedOnce(`approvalMode:${requestedApproval}`, `approvalMode '${requestedApproval}' is deprecated (retired by Codex CLI 0.143); sending 'on-request' instead.`);
			const approval = normalizeApprovalPolicyAlias(requestedApproval);
			args.push("-c", `approval_policy=${approval}`);
			const sandbox = settings.sandboxMode ?? "workspace-write";
			args.push("-c", `sandbox_mode=${sandbox}`);
		}
		if (settings.skipGitRepoCheck !== false) args.push("--skip-git-repo-check");
		if (settings.reasoningEffort) args.push("-c", `model_reasoning_effort=${settings.reasoningEffort}`);
		if (settings.reasoningSummary) args.push("-c", `model_reasoning_summary=${settings.reasoningSummary}`);
		if (settings.reasoningSummaryFormat) args.push("-c", `model_reasoning_summary_format=${settings.reasoningSummaryFormat}`);
		if (settings.modelVerbosity) args.push("-c", `model_verbosity=${settings.modelVerbosity}`);
		if (settings.profile) args.push("--profile", settings.profile);
		if (settings.oss) args.push("--oss");
		if (settings.webSearch) args.push("-c", "tools.web_search=true");
		const mcpSecretEnv = this.applyMcpSettings(args, settings);
		if (settings.color) args.push("--color", settings.color);
		if (this.modelId) args.push("-m", this.modelId);
		if (settings.addDirs?.length) {
			for (const dir of settings.addDirs) if (typeof dir === "string" && dir.trim().length > 0) args.push("--add-dir", dir);
		}
		if (settings.configOverrides) for (const [key, value] of Object.entries(settings.configOverrides)) this.addConfigOverride(args, key, value);
		let schemaPath;
		if (responseFormat?.type === "json" && responseFormat.schema) {
			const sanitizedSchema = sanitizeJsonSchema(typeof responseFormat.schema === "object" ? responseFormat.schema : {});
			if (Object.keys(sanitizedSchema).length > 0) {
				const dir = (0, fs.mkdtempSync)((0, path.join)((0, os.tmpdir)(), "codex-schema-"));
				schemaPath = (0, path.join)(dir, "schema.json");
				const schemaWithAdditional = {
					...sanitizedSchema,
					additionalProperties: false
				};
				(0, fs.writeFileSync)(schemaPath, JSON.stringify(schemaWithAdditional, null, 2));
				args.push("--output-schema", schemaPath);
			}
		}
		const tempImagePaths = [];
		for (const img of images) try {
			const tempPath = writeImageToTempFile(img);
			tempImagePaths.push(tempPath);
			args.push("--image", tempPath);
		} catch (e) {
			this.logger.warn(`[codex-cli] Failed to write image to temp file: ${String(e)}`);
		}
		const env = {
			...process.env,
			...settings.env || {},
			...mcpSecretEnv,
			RUST_LOG: process.env.RUST_LOG || "error"
		};
		let lastMessagePath = settings.outputLastMessageFile;
		let lastMessageIsTemp = false;
		if (!lastMessagePath) {
			const dir = (0, fs.mkdtempSync)((0, path.join)((0, os.tmpdir)(), "codex-cli-"));
			lastMessagePath = (0, path.join)(dir, "last-message.txt");
			lastMessageIsTemp = true;
		}
		args.push("--output-last-message", lastMessagePath);
		if (tempImagePaths.length > 0) args.push("--");
		args.push("-");
		return {
			cmd: base.cmd,
			args,
			env,
			cwd: settings.cwd,
			lastMessagePath,
			lastMessageIsTemp,
			schemaPath,
			tempImagePaths: tempImagePaths.length > 0 ? tempImagePaths : void 0
		};
	}
	/**
	* Apply MCP server settings as `-c` config overrides.
	*
	* Returns environment variables that must be set on the spawned codex
	* process. Inline HTTP `bearerToken` secrets are routed through the child
	* environment (via `bearer_token_env_var`) instead of argv, because command
	* lines are readable by any local process (`ps`, /proc/<pid>/cmdline).
	*/
	applyMcpSettings(args, settings) {
		if (settings.rmcpClient) this.addConfigOverride(args, "features.rmcp_client", true);
		if (!settings.mcpServers) return void 0;
		const secretEnv = {};
		for (const [rawName, server] of Object.entries(settings.mcpServers)) {
			const name = assertValidMcpServerName(rawName);
			const prefix = `mcp_servers.${name}`;
			if (server.enabled !== void 0) this.addConfigOverride(args, `${prefix}.enabled`, server.enabled);
			if (server.startupTimeoutSec !== void 0) this.addConfigOverride(args, `${prefix}.startup_timeout_sec`, server.startupTimeoutSec);
			if (server.toolTimeoutSec !== void 0) this.addConfigOverride(args, `${prefix}.tool_timeout_sec`, server.toolTimeoutSec);
			if (server.enabledTools !== void 0) this.addConfigOverride(args, `${prefix}.enabled_tools`, server.enabledTools);
			if (server.disabledTools !== void 0) this.addConfigOverride(args, `${prefix}.disabled_tools`, server.disabledTools);
			if (server.transport === "stdio") {
				this.addConfigOverride(args, `${prefix}.command`, server.command);
				if (server.args !== void 0) this.addConfigOverride(args, `${prefix}.args`, server.args);
				if (server.env !== void 0) this.addConfigOverride(args, `${prefix}.env`, server.env);
				if (server.cwd) this.addConfigOverride(args, `${prefix}.cwd`, server.cwd);
			} else {
				this.addConfigOverride(args, `${prefix}.url`, server.url);
				const hasExplicitAuthorizationHeader = Object.keys(server.httpHeaders ?? {}).some((key) => key.toLowerCase() === "authorization");
				if (server.bearerTokenEnvVar) {
					this.addConfigOverride(args, `${prefix}.bearer_token_env_var`, server.bearerTokenEnvVar);
					if (server.bearerToken !== void 0) this.logger.warn(`[codex-cli] MCP server '${name}': both bearerToken and bearerTokenEnvVar are set; using bearerTokenEnvVar and ignoring the inline token.`);
				} else if (server.bearerToken !== void 0 && !hasExplicitAuthorizationHeader) {
					const envVarName = this.allocateBearerTokenEnvVar(name, secretEnv);
					secretEnv[envVarName] = server.bearerToken;
					this.addConfigOverride(args, `${prefix}.bearer_token_env_var`, envVarName);
				}
				if (server.httpHeaders !== void 0) this.addConfigOverride(args, `${prefix}.http_headers`, server.httpHeaders);
				if (server.envHttpHeaders !== void 0) this.addConfigOverride(args, `${prefix}.env_http_headers`, server.envHttpHeaders);
			}
		}
		return Object.keys(secretEnv).length > 0 ? secretEnv : void 0;
	}
	/**
	* Pick a child-env variable name to carry an inline MCP bearer token,
	* avoiding collisions between server names that normalize identically
	* (e.g. 'foo-bar' and 'foo_bar').
	*/
	allocateBearerTokenEnvVar(serverName, secretEnv) {
		const base = `CODEX_MCP_${serverName.toUpperCase().replace(/-/g, "_")}_BEARER_TOKEN`;
		let candidate = base;
		let suffix = 2;
		while (candidate in secretEnv) {
			candidate = `${base}_${suffix}`;
			suffix += 1;
		}
		return candidate;
	}
	addConfigOverride(args, key, value) {
		assertValidConfigOverrideKey(key);
		if (isPlainObject(value)) {
			const entries = Object.entries(value);
			if (entries.length === 0) {
				args.push("-c", `${key}={}`);
				return;
			}
			for (const [childKey, childValue] of entries) this.addConfigOverride(args, `${key}.${childKey}`, childValue);
			return;
		}
		const serialized = this.serializeConfigValue(value);
		args.push("-c", `${key}=${serialized}`);
	}
	/**
	* Serialize a config override value into a CLI-safe string.
	*/
	serializeConfigValue(value) {
		if (typeof value === "string") return value;
		if (typeof value === "number" || typeof value === "boolean") return String(value);
		if (Array.isArray(value)) try {
			return JSON.stringify(value);
		} catch {
			return String(value);
		}
		if (value && typeof value === "object") try {
			return JSON.stringify(value);
		} catch {
			return String(value);
		}
		return String(value);
	}
	parseExperimentalJsonEvent(line) {
		try {
			return JSON.parse(line);
		} catch {
			return;
		}
	}
	extractUsage(evt) {
		const reported = evt.usage;
		if (!reported) return void 0;
		const inputTotal = reported.input_tokens ?? 0;
		const outputTotal = reported.output_tokens ?? 0;
		const cachedInputTokens = reported.cached_input_tokens ?? 0;
		const cacheWrite = typeof reported.cache_write_input_tokens === "number" ? reported.cache_write_input_tokens : void 0;
		const reasoning = typeof reported.reasoning_output_tokens === "number" ? reported.reasoning_output_tokens : void 0;
		return {
			inputTokens: {
				total: inputTotal,
				noCache: Math.max(0, inputTotal - cachedInputTokens - (cacheWrite ?? 0)),
				cacheRead: cachedInputTokens,
				cacheWrite
			},
			outputTokens: {
				total: outputTotal,
				text: void 0,
				reasoning
			},
			raw: reported
		};
	}
	getToolName(item) {
		if (!item) return void 0;
		switch (this.getItemType(item)) {
			case "command_execution": return "exec";
			case "file_change": return "patch";
			case "mcp_tool_call": {
				const tool2 = item.tool;
				if (typeof tool2 === "string" && tool2.length > 0) return tool2;
				return "mcp_tool";
			}
			case "web_search": return "web_search";
			default: return;
		}
	}
	buildToolInputPayload(item) {
		if (!item) return void 0;
		const data = item;
		switch (this.getItemType(item)) {
			case "command_execution": {
				const payload = {};
				if (typeof data.command === "string") payload.command = data.command;
				if (typeof data.status === "string") payload.status = data.status;
				if (typeof data.cwd === "string") payload.cwd = data.cwd;
				return Object.keys(payload).length ? payload : void 0;
			}
			case "file_change": {
				const payload = {};
				if (Array.isArray(data.changes)) payload.changes = data.changes;
				if (typeof data.status === "string") payload.status = data.status;
				return Object.keys(payload).length ? payload : void 0;
			}
			case "mcp_tool_call": {
				const payload = {};
				if (typeof data.server === "string") payload.server = data.server;
				if (typeof data.tool === "string") payload.tool = data.tool;
				if (typeof data.status === "string") payload.status = data.status;
				if (data.arguments !== void 0) payload.arguments = data.arguments;
				return Object.keys(payload).length ? payload : void 0;
			}
			case "web_search": {
				const payload = {};
				if (typeof data.query === "string") payload.query = data.query;
				return Object.keys(payload).length ? payload : void 0;
			}
			default: return;
		}
	}
	buildToolResultPayload(item) {
		if (!item) return { result: {} };
		const data = item;
		const metadata = {};
		const itemType = this.getItemType(item);
		if (typeof itemType === "string") metadata.itemType = itemType;
		if (typeof item.id === "string") metadata.itemId = item.id;
		if (typeof data.status === "string") metadata.status = data.status;
		const buildResult = (result) => ({
			result,
			metadata: Object.keys(metadata).length ? metadata : void 0
		});
		switch (itemType) {
			case "command_execution": {
				const result = {};
				if (typeof data.command === "string") result.command = data.command;
				if (typeof data.aggregated_output === "string") result.aggregatedOutput = data.aggregated_output;
				if (typeof data.exit_code === "number") result.exitCode = data.exit_code;
				if (typeof data.status === "string") result.status = data.status;
				return buildResult(result);
			}
			case "file_change": {
				const result = {};
				if (Array.isArray(data.changes)) result.changes = data.changes;
				if (typeof data.status === "string") result.status = data.status;
				return buildResult(result);
			}
			case "mcp_tool_call": {
				const result = {};
				if (typeof data.server === "string") {
					result.server = data.server;
					metadata.server = data.server;
				}
				if (typeof data.tool === "string") result.tool = data.tool;
				if (typeof data.status === "string") result.status = data.status;
				if (data.result !== void 0) result.result = data.result;
				if (data.error !== void 0) result.error = data.error;
				return buildResult(result);
			}
			case "web_search": {
				const result = {};
				if (typeof data.query === "string") result.query = data.query;
				if (typeof data.status === "string") result.status = data.status;
				return buildResult(result);
			}
			default: return buildResult({ ...data });
		}
	}
	emitToolInvocation(controller, toolCallId, toolName, inputPayload) {
		const inputString = safeStringify(inputPayload);
		controller.enqueue({
			type: "tool-input-start",
			id: toolCallId,
			toolName,
			providerExecuted: true,
			dynamic: true
		});
		if (inputString) controller.enqueue({
			type: "tool-input-delta",
			id: toolCallId,
			delta: inputString
		});
		controller.enqueue({
			type: "tool-input-end",
			id: toolCallId
		});
		controller.enqueue({
			type: "tool-call",
			toolCallId,
			toolName,
			input: inputString,
			providerExecuted: true,
			dynamic: true
		});
	}
	emitToolResult(controller, toolCallId, toolName, item, resultPayload, metadata) {
		const providerMetadataEntries = { ...metadata ?? {} };
		const itemType = this.getItemType(item);
		if (itemType && providerMetadataEntries.itemType === void 0) providerMetadataEntries.itemType = itemType;
		if (item.id && providerMetadataEntries.itemId === void 0) providerMetadataEntries.itemId = item.id;
		let isError;
		if (itemType === "command_execution") {
			const data = item;
			const exitCode = typeof data.exit_code === "number" ? data.exit_code : void 0;
			const status = typeof data.status === "string" ? data.status : void 0;
			if (exitCode !== void 0 && exitCode !== 0 || status === "failed") isError = true;
		}
		controller.enqueue({
			type: "tool-result",
			toolCallId,
			toolName,
			result: resultPayload ?? {},
			dynamic: true,
			...isError ? { isError: true } : {},
			...Object.keys(providerMetadataEntries).length ? { providerMetadata: { "codex-cli": providerMetadataEntries } } : {}
		});
	}
	handleSpawnError(err, promptExcerpt) {
		const e = err && typeof err === "object" ? err : void 0;
		const message = String((e?.message ?? err) || "Failed to run Codex CLI");
		if (/login|auth|unauthorized|not\s+logged/i.test(message)) return createAuthenticationError(message);
		return createAPICallError({
			message,
			code: typeof e?.code === "string" ? e.code : void 0,
			exitCode: typeof e?.exitCode === "number" ? e.exitCode : void 0,
			stderr: typeof e?.stderr === "string" ? e.stderr : void 0,
			promptExcerpt
		});
	}
	async doGenerate(options) {
		this.logger.debug(`[codex-cli] Starting doGenerate request with model: ${this.modelId}`);
		const { stream, request } = await this.doStream(options);
		const content = [];
		const textPartsById = /* @__PURE__ */ new Map();
		const reasoningPartsById = /* @__PURE__ */ new Map();
		let activeTextBlockId;
		let activeReasoningBlockId;
		let responseMetadata = {
			id: require_dist.generateId(),
			timestamp: /* @__PURE__ */ new Date(),
			modelId: this.modelId
		};
		let usage = createEmptyCodexUsage();
		let finishReason = {
			unified: "other",
			raw: void 0
		};
		let warnings = [];
		let providerMetadata;
		const ensureTextPart = (id, metadata) => {
			const existing = textPartsById.get(id);
			if (existing) {
				if (metadata) existing.providerMetadata = metadata;
				return existing;
			}
			const part = {
				type: "text",
				text: "",
				...metadata ? { providerMetadata: metadata } : {}
			};
			textPartsById.set(id, part);
			content.push(part);
			return part;
		};
		const ensureReasoningPart = (id, metadata) => {
			const existing = reasoningPartsById.get(id);
			if (existing) {
				if (metadata) existing.providerMetadata = metadata;
				return existing;
			}
			const part = {
				type: "reasoning",
				text: "",
				...metadata ? { providerMetadata: metadata } : {}
			};
			reasoningPartsById.set(id, part);
			content.push(part);
			return part;
		};
		const pushContentPart = (part) => {
			content.push(part);
		};
		for await (const part of stream) {
			if (part.type === "stream-start") {
				warnings = part.warnings;
				continue;
			}
			if (part.type === "response-metadata") {
				responseMetadata = {
					id: part.id,
					timestamp: part.timestamp,
					modelId: part.modelId
				};
				continue;
			}
			if (part.type === "text-start") {
				activeTextBlockId = part.id;
				ensureTextPart(part.id, part.providerMetadata);
				continue;
			}
			if (part.type === "text-delta") {
				const blockId = typeof part.id === "string" ? part.id : activeTextBlockId ?? "__default_text_block__";
				activeTextBlockId = blockId;
				const textPart = ensureTextPart(blockId, part.providerMetadata);
				textPart.text = `${textPart.text}${part.delta}`;
				continue;
			}
			if (part.type === "text-end") {
				const blockId = typeof part.id === "string" ? part.id : activeTextBlockId;
				if (blockId) {
					const textPart = ensureTextPart(blockId, part.providerMetadata);
					if (part.providerMetadata) textPart.providerMetadata = part.providerMetadata;
				}
				if (activeTextBlockId === blockId) activeTextBlockId = void 0;
				continue;
			}
			if (part.type === "reasoning-start") {
				activeReasoningBlockId = part.id;
				ensureReasoningPart(part.id, part.providerMetadata);
				continue;
			}
			if (part.type === "reasoning-delta") {
				const blockId = typeof part.id === "string" ? part.id : activeReasoningBlockId ?? "__default_reasoning_block__";
				activeReasoningBlockId = blockId;
				const reasoningPart = ensureReasoningPart(blockId, part.providerMetadata);
				reasoningPart.text = `${reasoningPart.text}${part.delta}`;
				continue;
			}
			if (part.type === "reasoning-end") {
				const blockId = typeof part.id === "string" ? part.id : activeReasoningBlockId;
				if (blockId) {
					const reasoningPart = ensureReasoningPart(blockId, part.providerMetadata);
					if (part.providerMetadata) reasoningPart.providerMetadata = part.providerMetadata;
				}
				if (activeReasoningBlockId === blockId) activeReasoningBlockId = void 0;
				continue;
			}
			if (part.type === "file") {
				pushContentPart(part);
				continue;
			}
			if (part.type === "source") {
				pushContentPart(part);
				continue;
			}
			if (part.type === "tool-approval-request") {
				pushContentPart(part);
				continue;
			}
			if (part.type === "tool-call") {
				pushContentPart(part);
				continue;
			}
			if (part.type === "tool-result") {
				pushContentPart(part);
				continue;
			}
			if (part.type === "finish") {
				usage = part.usage;
				finishReason = part.finishReason;
				providerMetadata = part.providerMetadata;
			}
		}
		const normalizedContent = content.filter((part) => {
			if (part.type === "text") return part.text.trim().length > 0;
			if (part.type === "reasoning") return part.text.trim().length > 0;
			return true;
		});
		const codexProviderMetadata = providerMetadata && typeof providerMetadata === "object" ? { ...providerMetadata } : {};
		if (this.sessionId) {
			const existing = codexProviderMetadata["codex-cli"];
			codexProviderMetadata["codex-cli"] = {
				...existing && typeof existing === "object" && !Array.isArray(existing) ? existing : {},
				sessionId: this.sessionId
			};
		}
		return {
			content: normalizedContent,
			usage,
			finishReason,
			warnings,
			response: responseMetadata,
			request,
			...Object.keys(codexProviderMetadata).length > 0 ? { providerMetadata: codexProviderMetadata } : {}
		};
	}
	async doStream(options) {
		this.logger.debug(`[codex-cli] Starting doStream request with model: ${this.modelId}`);
		const { promptText, images, warnings: mappingWarnings } = mapMessagesToPrompt(options.prompt);
		const promptExcerpt = promptText.slice(0, 200);
		const warnings = [...mapUnsupportedSettingsWarnings({
			temperature: options.temperature,
			topP: options.topP,
			topK: options.topK,
			maxOutputTokens: options.maxOutputTokens,
			presencePenalty: options.presencePenalty,
			frequencyPenalty: options.frequencyPenalty,
			stopSequences: options.stopSequences,
			seed: options.seed,
			tools: options.tools,
			toolChoice: options.toolChoice
		}), ...mappingWarnings ?? []];
		this.logger.debug(`[codex-cli] Converted ${options.prompt.length} messages (${images.length} images) for streaming, response format: ${options.responseFormat?.type ?? "none"}`);
		const providerOptions = await require_dist.parseProviderOptions({
			provider: this.provider,
			providerOptions: options.providerOptions,
			schema: codexCliProviderOptionsSchema
		});
		let effectiveSettings = this.mergeSettings(providerOptions);
		const topLevelReasoning = options.reasoning;
		if (topLevelReasoning !== void 0 && topLevelReasoning !== "provider-default" && providerOptions?.reasoningEffort === void 0) {
			if (Object.hasOwn(codexReasoningEfforts, topLevelReasoning)) effectiveSettings = {
				...effectiveSettings,
				reasoningEffort: topLevelReasoning
			};
			else warnings.push({
				type: "unsupported",
				feature: "reasoning",
				details: `Codex CLI does not support reasoning effort '${topLevelReasoning}'; it will be ignored.`
			});
		}
		const responseFormat = options.responseFormat?.type === "json" ? {
			type: "json",
			schema: options.responseFormat.schema
		} : void 0;
		const { cmd, args, env, cwd, lastMessagePath, lastMessageIsTemp, schemaPath, tempImagePaths } = this.buildArgs(images, responseFormat, effectiveSettings);
		this.logger.debug(`[codex-cli] Executing Codex CLI for streaming: ${cmd} with ${args.length} arguments`);
		return {
			stream: new ReadableStream({
				start: (controller) => {
					const startTime = Date.now();
					const child = (0, child_process.spawn)(cmd, args, {
						env,
						cwd,
						stdio: [
							"pipe",
							"pipe",
							"pipe"
						]
					});
					child.stdin.write(promptText);
					child.stdin.end();
					controller.enqueue({
						type: "stream-start",
						warnings
					});
					let stderr = "";
					let accumulatedText = "";
					let stdoutBuffer = "";
					const activeTools = /* @__PURE__ */ new Map();
					let responseMetadataSent = false;
					let lastUsage;
					let turnFailureMessage;
					const cleanupOwnedLastMessage = () => {
						if (!lastMessageIsTemp || !lastMessagePath) return;
						try {
							(0, fs.rmSync)(lastMessagePath, { force: true });
						} catch {}
						try {
							(0, fs.rmSync)((0, path.dirname)(lastMessagePath), {
								recursive: true,
								force: true
							});
						} catch {}
					};
					const cleanupTempFiles = () => {
						if (schemaPath) try {
							const schemaDir = (0, path.dirname)(schemaPath);
							(0, fs.rmSync)(schemaDir, {
								recursive: true,
								force: true
							});
						} catch {}
						if (tempImagePaths?.length) cleanupTempImages(tempImagePaths);
					};
					const sendMetadata = (meta = {}) => {
						controller.enqueue({
							type: "response-metadata",
							id: (0, crypto.randomUUID)(),
							timestamp: /* @__PURE__ */ new Date(),
							modelId: this.modelId,
							...Object.keys(meta).length ? { providerMetadata: { "codex-cli": meta } } : {}
						});
					};
					const handleItemEvent = (event) => {
						const item = event.item;
						if (!item) return;
						if (event.type === "item.completed" && isAgentMessageItemType(this.getItemType(item)) && typeof item.text === "string") {
							accumulatedText = item.text;
							this.logger.debug(`[codex-cli] Received assistant message, length: ${item.text.length}`);
							return;
						}
						const toolName = this.getToolName(item);
						if (!toolName) return;
						this.logger.debug(`[codex-cli] Tool detected: ${toolName}, item type: ${this.getItemType(item)}`);
						const mapKey = typeof item.id === "string" && item.id.length > 0 ? item.id : (0, crypto.randomUUID)();
						let toolState = activeTools.get(mapKey);
						const latestInput = this.buildToolInputPayload(item);
						if (!toolState) {
							toolState = {
								toolCallId: mapKey,
								toolName,
								inputPayload: latestInput,
								hasEmittedCall: false
							};
							activeTools.set(mapKey, toolState);
						} else {
							toolState.toolName = toolName;
							if (latestInput !== void 0) toolState.inputPayload = latestInput;
						}
						if (!toolState.hasEmittedCall) {
							this.logger.debug(`[codex-cli] Emitting tool invocation: ${toolState.toolName}`);
							this.emitToolInvocation(controller, toolState.toolCallId, toolState.toolName, toolState.inputPayload);
							toolState.hasEmittedCall = true;
						}
						if (event.type === "item.completed") {
							const { result, metadata } = this.buildToolResultPayload(item);
							this.logger.debug(`[codex-cli] Tool completed: ${toolState.toolName}`);
							this.emitToolResult(controller, toolState.toolCallId, toolState.toolName, item, result, metadata);
							activeTools.delete(mapKey);
						}
					};
					const onAbort = () => {
						child.kill("SIGTERM");
					};
					if (options.abortSignal) {
						if (options.abortSignal.aborted) {
							child.on("close", cleanupOwnedLastMessage);
							child.on("error", cleanupOwnedLastMessage);
							child.kill("SIGTERM");
							cleanupTempFiles();
							cleanupOwnedLastMessage();
							controller.error(options.abortSignal.reason ?? /* @__PURE__ */ new Error("Request aborted"));
							return;
						}
						options.abortSignal.addEventListener("abort", onAbort, { once: true });
					}
					const finishStream = (code) => {
						const duration = Date.now() - startTime;
						if (code !== 0) {
							this.logger.error(`[codex-cli] Stream process exited with code ${code} after ${duration}ms`);
							controller.error(createAPICallError({
								message: `Codex CLI exited with code ${code}`,
								exitCode: code ?? void 0,
								stderr,
								promptExcerpt
							}));
							return;
						}
						if (turnFailureMessage) {
							this.logger.error(`[codex-cli] Stream failed: ${turnFailureMessage}`);
							controller.error(createAPICallError({
								message: turnFailureMessage,
								stderr,
								promptExcerpt
							}));
							return;
						}
						let finalText = accumulatedText;
						if (!finalText && lastMessagePath) try {
							const fileText = (0, fs.readFileSync)(lastMessagePath, "utf8");
							if (fileText) finalText = fileText.trim();
						} catch {}
						if (finalText) {
							const textId = (0, crypto.randomUUID)();
							controller.enqueue({
								type: "text-start",
								id: textId
							});
							controller.enqueue({
								type: "text-delta",
								id: textId,
								delta: finalText
							});
							controller.enqueue({
								type: "text-end",
								id: textId
							});
						}
						const usageSummary = lastUsage ?? createEmptyCodexUsage();
						const totalTokens = (usageSummary.inputTokens.total ?? 0) + (usageSummary.outputTokens.total ?? 0);
						this.logger.info(`[codex-cli] Stream completed - Session: ${this.sessionId ?? "N/A"}, Duration: ${duration}ms, Tokens: ${totalTokens}`);
						this.logger.debug(`[codex-cli] Token usage - Input: ${usageSummary.inputTokens.total ?? 0}, Output: ${usageSummary.outputTokens.total ?? 0}, Total: ${totalTokens}`);
						controller.enqueue({
							type: "finish",
							finishReason: mapCodexCliFinishReason(void 0),
							usage: usageSummary
						});
						controller.close();
					};
					const processLine = (line) => {
						const event = this.parseExperimentalJsonEvent(line);
						if (!event) return;
						this.logger.debug(`[codex-cli] Stream event: ${event.type ?? "unknown"}`);
						if (event.type === "thread.started" && typeof event.thread_id === "string") {
							this.sessionId = event.thread_id;
							this.logger.debug(`[codex-cli] Stream session started: ${this.sessionId}`);
							if (!responseMetadataSent) {
								responseMetadataSent = true;
								sendMetadata();
							}
							return;
						}
						if (event.type === "session.created" && typeof event.session_id === "string") {
							this.sessionId = event.session_id;
							this.logger.debug(`[codex-cli] Stream session created: ${this.sessionId}`);
							if (!responseMetadataSent) {
								responseMetadataSent = true;
								sendMetadata();
							}
							return;
						}
						if (event.type === "turn.completed") {
							const usageEvent = this.extractUsage(event);
							if (usageEvent) lastUsage = usageEvent;
							return;
						}
						if (event.type === "turn.failed") {
							turnFailureMessage = (event.error && typeof event.error.message === "string" && event.error.message || (typeof event.message === "string" ? event.message : void 0)) ?? turnFailureMessage ?? "Codex turn failed";
							this.logger.error(`[codex-cli] Stream turn failed: ${turnFailureMessage}`);
							sendMetadata({ error: turnFailureMessage });
							return;
						}
						if (event.type === "error") {
							const effective = (typeof event.message === "string" ? event.message : void 0) ?? "Codex error";
							turnFailureMessage = turnFailureMessage ?? effective;
							this.logger.error(`[codex-cli] Stream error event: ${effective}`);
							sendMetadata({ error: effective });
							return;
						}
						if (event.type && event.type.startsWith("item.")) handleItemEvent(event);
					};
					child.stderr.on("data", (d) => stderr += String(d));
					child.stdout.setEncoding("utf8");
					child.stdout.on("data", (chunk) => {
						const pieces = (stdoutBuffer + chunk).split(/\r?\n/);
						stdoutBuffer = pieces.pop() ?? "";
						for (const line of pieces) {
							if (!line) continue;
							processLine(line);
						}
					});
					child.on("error", (e) => {
						this.logger.error(`[codex-cli] Stream spawn error: ${String(e)}`);
						if (options.abortSignal) options.abortSignal.removeEventListener("abort", onAbort);
						cleanupTempFiles();
						cleanupOwnedLastMessage();
						controller.error(this.handleSpawnError(e, promptExcerpt));
					});
					child.on("close", (code) => {
						if (options.abortSignal) options.abortSignal.removeEventListener("abort", onAbort);
						cleanupTempFiles();
						setImmediate(() => {
							try {
								if (stdoutBuffer) {
									processLine(stdoutBuffer);
									stdoutBuffer = "";
								}
								finishStream(code);
							} finally {
								cleanupOwnedLastMessage();
							}
						});
					});
				},
				cancel: () => {}
			}),
			request: { body: promptText }
		};
	}
};
function createCodexExec(options = {}) {
	const logger = getLogger(options.defaultSettings?.logger);
	if (options.defaultSettings) {
		const v = validateExecSettings(options.defaultSettings);
		if (!v.valid) throw new Error(`Invalid default settings: ${v.errors.join(", ")}`);
		for (const w of v.warnings) logger.warn(`Codex CLI Provider: ${w}`);
	}
	const createModel = (modelId, settings = {}) => {
		const merged = {
			...options.defaultSettings,
			...settings
		};
		const v = validateExecSettings(merged);
		if (!v.valid) throw new Error(`Invalid settings: ${v.errors.join(", ")}`);
		for (const w of v.warnings) logger.warn(`Codex CLI: ${w}`);
		return new ExecLanguageModel({
			id: modelId,
			settings: merged
		});
	};
	const provider = Object.assign(function(modelId, settings) {
		if (new.target) throw new Error("The Codex CLI provider function cannot be called with new.");
		return createModel(modelId, settings);
	}, { specificationVersion: "v4" });
	provider.languageModel = createModel;
	provider.chat = createModel;
	provider.embeddingModel = ((modelId) => {
		throw new require_dist.NoSuchModelError({
			modelId,
			modelType: "embeddingModel"
		});
	});
	provider.imageModel = ((modelId) => {
		throw new require_dist.NoSuchModelError({
			modelId,
			modelType: "imageModel"
		});
	});
	return provider;
}
var codexExec = createCodexExec();
function toProtocolInput(input) {
	switch (input.type) {
		case "text": return {
			type: "text",
			text: input.text,
			text_elements: []
		};
		case "image": return {
			type: "image",
			url: input.imageUrl,
			imageUrl: input.imageUrl
		};
		case "localImage": return {
			type: "localImage",
			path: input.path
		};
		default: throw new Error(`Unsupported input type: ${String(input)}`);
	}
}
var AppServerSession = class {
	threadId;
	modelId;
	client;
	defaultTurnParams;
	requestHandlers;
	autoApprove;
	currentTurnId = null;
	active = false;
	constructor(options) {
		this.threadId = options.threadId;
		this.modelId = options.modelId;
		this.client = options.client;
		this.defaultTurnParams = options.defaultTurnParams ?? {};
		this.requestHandlers = options.requestHandlers ?? {};
		this.autoApprove = options.autoApprove;
	}
	get turnId() {
		return this.currentTurnId;
	}
	isTurnCompleted(turnId) {
		return this.client.hasTurnCompleted?.(turnId) ?? false;
	}
	refreshActiveState() {
		if (!this.active || !this.currentTurnId) return;
		if (this.isTurnCompleted(this.currentTurnId)) this.active = false;
	}
	isActive() {
		this.refreshActiveState();
		return this.active;
	}
	setTurnId(turnId) {
		this.currentTurnId = turnId;
		this.active = !this.isTurnCompleted(turnId);
	}
	setInactive(completedTurnId) {
		if (completedTurnId && this.currentTurnId && completedTurnId !== this.currentTurnId) return;
		this.active = false;
	}
	async injectMessage(content) {
		const inputs = typeof content === "string" ? [{
			type: "text",
			text: content
		}] : content;
		if (inputs.length === 0) return;
		const protocolInputs = inputs.map(toProtocolInput);
		const result = await this.client.withThreadLock(this.threadId, async () => {
			const contextId = this.client.registerRequestContext(this.threadId, {
				handlers: this.requestHandlers,
				autoApprove: this.autoApprove
			});
			try {
				const turnStartResult = await this.client.turnStart({
					threadId: this.threadId,
					input: protocolInputs,
					model: this.modelId,
					...this.defaultTurnParams
				});
				this.client.bindRequestContext(contextId, String(turnStartResult.turn.id));
				return turnStartResult;
			} catch (error) {
				this.client.clearRequestContext(contextId);
				throw error;
			}
		});
		const nextTurnId = String(result.turn.id);
		const alreadyCompleted = this.isTurnCompleted(nextTurnId);
		this.currentTurnId = nextTurnId;
		this.active = !alreadyCompleted;
	}
	async interrupt() {
		this.refreshActiveState();
		if (!this.active || !this.currentTurnId) return;
		const interruptedTurnId = this.currentTurnId;
		await this.client.turnInterrupt({
			threadId: this.threadId,
			turnId: interruptedTurnId
		});
		if (this.currentTurnId === interruptedTurnId) this.active = false;
	}
};
var ToolTracker = class {
	activeToolNames = /* @__PURE__ */ new Map();
	activeToolStarts = /* @__PURE__ */ new Map();
	stats = {
		totalCalls: 0,
		totalDurationMs: 0,
		byType: {
			exec: 0,
			patch: 0,
			mcp: 0,
			web_search: 0,
			other: 0
		}
	};
	start(toolCallId, tool2) {
		this.activeToolNames.set(toolCallId, tool2);
		this.activeToolStarts.set(toolCallId, Date.now());
	}
	get(toolCallId) {
		return this.activeToolNames.get(toolCallId);
	}
	resolve(toolCallId, fallback) {
		return this.activeToolNames.get(toolCallId) ?? fallback;
	}
	complete(toolCallId, fallback, durationMs) {
		const resolved = this.resolve(toolCallId, fallback);
		const startedAt = this.activeToolStarts.get(toolCallId);
		const fallbackDurationMs = startedAt !== void 0 ? Math.max(0, Date.now() - startedAt) : void 0;
		this.recordCompletion(resolved.toolName, durationMs ?? fallbackDurationMs);
		this.activeToolNames.delete(toolCallId);
		this.activeToolStarts.delete(toolCallId);
		return resolved;
	}
	getStats() {
		return {
			totalCalls: this.stats.totalCalls,
			totalDurationMs: this.stats.totalDurationMs,
			byType: { ...this.stats.byType }
		};
	}
	toolTypeFromName(toolName) {
		if (toolName === "exec") return "exec";
		if (toolName === "patch") return "patch";
		if (toolName === "web_search") return "web_search";
		if (toolName.startsWith("mcp__")) return "mcp";
		return "other";
	}
	recordCompletion(toolName, durationMs) {
		this.stats.totalCalls += 1;
		this.stats.byType[this.toolTypeFromName(toolName)] += 1;
		if (typeof durationMs === "number" && Number.isFinite(durationMs) && durationMs >= 0) this.stats.totalDurationMs += durationMs;
	}
};
function normalizeItemType(type) {
	return type.toLowerCase();
}
function mapTool(item) {
	const type = normalizeItemType(item.type);
	if (type === "commandexecution") return {
		toolName: "exec",
		dynamic: true
	};
	if (type === "filechange") return {
		toolName: "patch",
		dynamic: true
	};
	if (type === "mcptoolcall") return {
		toolName: `mcp__${typeof item.server === "string" ? item.server || "server" : "server"}__${typeof item.tool === "string" ? item.tool || "tool" : "tool"}`,
		dynamic: true
	};
	if (type === "dynamictoolcall") {
		const tool2 = "tool" in item && typeof item.tool === "string" && item.tool ? item.tool : "tool";
		const namespace = "namespace" in item && typeof item.namespace === "string" && item.namespace ? item.namespace : void 0;
		return {
			toolName: namespace ? `${namespace}__${tool2}` : tool2,
			dynamic: true
		};
	}
	if (type === "websearch") return {
		toolName: "web_search",
		dynamic: true
	};
}
function hasModelTokens(usage) {
	return usage.inputTokens > 0 || usage.outputTokens > 0;
}
function resolveTokenUsageIncrement(last, total, previousTotal) {
	if (!total || !previousTotal) return hasModelTokens(last) ? last : void 0;
	const delta = (current, previous) => Math.max(0, current - (previous ?? 0));
	const increment = {
		totalTokens: delta(total.totalTokens, previousTotal.totalTokens),
		inputTokens: delta(total.inputTokens, previousTotal.inputTokens),
		cachedInputTokens: delta(total.cachedInputTokens, previousTotal.cachedInputTokens),
		outputTokens: delta(total.outputTokens, previousTotal.outputTokens),
		reasoningOutputTokens: delta(total.reasoningOutputTokens, previousTotal.reasoningOutputTokens)
	};
	if (typeof total.cacheWriteInputTokens === "number") increment.cacheWriteInputTokens = delta(total.cacheWriteInputTokens, previousTotal.cacheWriteInputTokens);
	return hasModelTokens(increment) ? increment : void 0;
}
function createNotificationHandlers(context) {
	let previousTokenUsageTotal;
	let tokenUsageBaselineResolved = false;
	const handleReasoningDelta = (isSummary) => (params) => {
		if (!context.isSameTurn(params) || typeof params.delta !== "string") return;
		const itemId = typeof params.itemId === "string" ? params.itemId : require_dist.generateId();
		context.reasoningItemIdsWithDelta.add(itemId);
		context.emitter.emitReasoningDelta(params.delta, isSummary, itemId);
	};
	const handleItemCompleted = (params) => {
		if (!context.isSameTurn(params)) return;
		if (!params.item || typeof params.item !== "object") return;
		const item = params.item;
		const type = normalizeItemType(item.type);
		if (type === "agentmessage") {
			const itemId = typeof item.id === "string" ? item.id : require_dist.generateId();
			const text = item.text;
			if (!context.textItemIdsWithDelta.has(itemId) && typeof text === "string" && text.length > 0) context.emitter.emitTextDelta(text, itemId);
			return;
		}
		if (type === "reasoning") {
			const itemId = typeof item.id === "string" ? item.id : require_dist.generateId();
			if (!context.reasoningItemIdsWithDelta.has(itemId)) {
				const summary = item.summary;
				const content = item.content;
				if (Array.isArray(summary) && summary.length > 0) context.emitter.emitReasoningDelta(summary.join("\n"), true, itemId);
				if (typeof summary === "string" && summary.length > 0) context.emitter.emitReasoningDelta(summary, true, itemId);
				if (Array.isArray(content) && content.length > 0) context.emitter.emitReasoningDelta(content.join("\n"), false, itemId);
				if (typeof content === "string" && content.length > 0) context.emitter.emitReasoningDelta(content, false, itemId);
			}
			return;
		}
		const tool2 = mapTool(item);
		if (!tool2) return;
		const toolCallId = typeof item.id === "string" ? item.id : require_dist.generateId();
		const resolved = context.toolTracker.complete(toolCallId, tool2, typeof item.durationMs === "number" ? item.durationMs : void 0);
		context.emitter.emitToolResult(toolCallId, resolved.toolName, item, resolved.dynamic, item.status === "failed");
	};
	const handleOutputDelta = (defaultToolName) => (params) => {
		if (!context.isSameTurn(params) || typeof params.delta !== "string") return;
		const itemId = typeof params.itemId === "string" ? params.itemId : require_dist.generateId();
		const tracked = context.toolTracker.get(itemId);
		context.emitter.emitToolOutputDelta(itemId, tracked?.toolName ?? defaultToolName, params.delta, tracked?.dynamic ?? true);
	};
	return {
		"item/agentMessage/delta": (params) => {
			if (!context.isSameTurn(params) || typeof params.delta !== "string") return;
			const itemId = typeof params.itemId === "string" ? params.itemId : require_dist.generateId();
			context.textItemIdsWithDelta.add(itemId);
			context.emitter.emitTextDelta(params.delta, itemId);
		},
		reasoningTextDelta: handleReasoningDelta(false),
		"item/reasoning/textDelta": handleReasoningDelta(false),
		reasoningSummaryTextDelta: handleReasoningDelta(true),
		"item/reasoning/summaryTextDelta": handleReasoningDelta(true),
		"item/started": (params) => {
			if (!context.isSameTurn(params)) return;
			if (!params.item || typeof params.item !== "object") return;
			const item = params.item;
			const tool2 = mapTool(item);
			if (!tool2) return;
			const toolCallId = typeof item.id === "string" ? item.id : require_dist.generateId();
			context.toolTracker.start(toolCallId, tool2);
			context.emitter.emitToolCall(toolCallId, tool2.toolName, safeStringify(item), tool2.dynamic);
		},
		"item/completed": handleItemCompleted,
		"item/commandExecution/outputDelta": handleOutputDelta("exec"),
		"item/fileChange/outputDelta": handleOutputDelta("patch"),
		"thread/tokenUsage/updated": (params) => {
			if (!context.isSameTurn(params)) return;
			const event = params;
			const last = event.tokenUsage?.last;
			if (!last) return;
			const total = event.tokenUsage?.total;
			if (!tokenUsageBaselineResolved) {
				tokenUsageBaselineResolved = true;
				const turnId = context.getBoundTurnId() ?? event.turnId;
				previousTokenUsageTotal = typeof turnId === "string" ? context.getTokenUsageTotalBeforeTurn(turnId) : void 0;
			}
			const increment = resolveTokenUsageIncrement(last, total, previousTokenUsageTotal);
			if (total) previousTokenUsageTotal = total;
			if (!increment) return;
			const cacheWrite = typeof increment.cacheWriteInputTokens === "number" ? increment.cacheWriteInputTokens : void 0;
			context.onUsage({
				inputTokens: {
					total: increment.inputTokens,
					noCache: Math.max(0, increment.inputTokens - increment.cachedInputTokens - (cacheWrite ?? 0)),
					cacheRead: increment.cachedInputTokens,
					cacheWrite
				},
				outputTokens: {
					total: increment.outputTokens,
					text: void 0,
					reasoning: increment.reasoningOutputTokens
				},
				raw: { ...increment }
			});
		},
		"turn/completed": (params) => {
			if (!params.turn || typeof params.turn !== "object") return;
			const turn = params.turn;
			const boundTurnId = context.getBoundTurnId();
			if (boundTurnId && turn.id !== boundTurnId) return;
			context.onTurnCompleted(turn);
		},
		error: (params) => {
			if (!context.isSameTurn(params)) return;
			if (params.willRetry === true) return;
			const nested = params.error;
			if (nested && typeof nested === "object" && typeof nested.message === "string") context.onError(new Error(nested.message));
		}
	};
}
function createServerRequestHandlers(context) {
	return {
		"item/commandExecution/requestApproval": (params) => {
			if (!context.isSameTurn(params)) return;
			const itemId = typeof params.itemId === "string" ? params.itemId : require_dist.generateId();
			context.emitter.emitApprovalRequest(itemId);
		},
		"item/fileChange/requestApproval": (params) => {
			if (!context.isSameTurn(params)) return;
			const itemId = typeof params.itemId === "string" ? params.itemId : require_dist.generateId();
			context.emitter.emitApprovalRequest(itemId);
		}
	};
}
var AppServerNotificationRouter = class {
	client;
	emitter;
	threadId;
	onUsage;
	onThreadTurnCompleted;
	onTurnCompleted;
	onError;
	turnId;
	bufferedTurnScopedEvents = [];
	toolTracker = new ToolTracker();
	textItemIdsWithDelta = /* @__PURE__ */ new Set();
	reasoningItemIdsWithDelta = /* @__PURE__ */ new Set();
	notificationHandlers;
	serverRequestHandlers;
	notificationListener;
	serverRequestListener;
	constructor(options) {
		this.client = options.client;
		this.emitter = options.emitter;
		this.threadId = options.threadId;
		this.onUsage = options.onUsage;
		this.onThreadTurnCompleted = options.onThreadTurnCompleted;
		this.onTurnCompleted = options.onTurnCompleted;
		this.onError = options.onError;
		this.notificationHandlers = createNotificationHandlers({
			emitter: this.emitter,
			toolTracker: this.toolTracker,
			textItemIdsWithDelta: this.textItemIdsWithDelta,
			reasoningItemIdsWithDelta: this.reasoningItemIdsWithDelta,
			onUsage: this.onUsage,
			onTurnCompleted: this.onTurnCompleted,
			onError: this.onError,
			isSameTurn: (params) => this.isSameTurn(params),
			getBoundTurnId: () => this.turnId,
			getTokenUsageTotalBeforeTurn: (turnId) => this.client.getTokenUsageTotalBeforeTurn?.(this.threadId, turnId)
		});
		this.serverRequestHandlers = createServerRequestHandlers({
			emitter: this.emitter,
			isSameTurn: (params) => this.isSameTurn(params)
		});
	}
	setTurnId(turnId) {
		this.turnId = turnId;
		this.flushBufferedTurnScopedEvents();
	}
	getToolExecutionStats() {
		return this.toolTracker.getStats();
	}
	subscribe() {
		this.notificationListener = (method, params) => {
			if (!this.isSameThread(params)) return;
			if (method === "turn/completed" && params.turn && typeof params.turn === "object") this.onThreadTurnCompleted?.(params.turn);
			if (this.bufferTurnScopedEventBeforeBinding({
				kind: "notification",
				method,
				params
			})) return;
			this.emitter.emitRaw(method, params);
			this.handleNotification(method, params);
		};
		this.client.on("notification", this.notificationListener);
		this.serverRequestListener = (method, params, id) => {
			if (!this.isSameThread(params)) return;
			if (this.bufferTurnScopedEventBeforeBinding({
				kind: "server-request",
				method,
				params,
				id
			})) return;
			this.emitter.emitRaw(method, params, id);
			this.handleServerRequest(method, params);
		};
		this.client.on("server-request", this.serverRequestListener);
		return () => this.unsubscribe();
	}
	unsubscribe() {
		if (this.notificationListener) {
			this.client.off("notification", this.notificationListener);
			this.notificationListener = void 0;
		}
		if (this.serverRequestListener) {
			this.client.off("server-request", this.serverRequestListener);
			this.serverRequestListener = void 0;
		}
		this.bufferedTurnScopedEvents = [];
	}
	isSameThread(params) {
		return (typeof params.threadId === "string" ? params.threadId : void 0) === this.threadId;
	}
	getTurnIdFromParams(params) {
		const turnObject = params.turn && typeof params.turn === "object" ? params.turn : void 0;
		return typeof params.turnId === "string" ? params.turnId : typeof turnObject?.id === "string" ? turnObject.id : void 0;
	}
	bufferTurnScopedEventBeforeBinding(event) {
		if (this.turnId) return false;
		if (this.getTurnIdFromParams(event.params) === void 0) return false;
		this.bufferedTurnScopedEvents.push(event);
		return true;
	}
	flushBufferedTurnScopedEvents() {
		if (!this.turnId || this.bufferedTurnScopedEvents.length === 0) return;
		const buffered = this.bufferedTurnScopedEvents;
		this.bufferedTurnScopedEvents = [];
		for (const event of buffered) {
			if (!this.isSameThread(event.params)) continue;
			if (this.getTurnIdFromParams(event.params) !== this.turnId) continue;
			if (event.kind === "notification") {
				this.emitter.emitRaw(event.method, event.params);
				this.handleNotification(event.method, event.params);
			} else {
				this.emitter.emitRaw(event.method, event.params, event.id);
				this.handleServerRequest(event.method, event.params);
			}
		}
	}
	isSameTurn(params) {
		const turnIdInParams = this.getTurnIdFromParams(params);
		if (!this.turnId) return turnIdInParams === void 0;
		return turnIdInParams === void 0 || turnIdInParams === this.turnId;
	}
	handleNotification(method, params) {
		if (!this.isSameThread(params)) return;
		const handler = this.notificationHandlers[method];
		if (!handler) return;
		handler(params);
	}
	handleServerRequest(method, params) {
		if (!this.isSameThread(params)) return;
		const handler = this.serverRequestHandlers[method];
		if (!handler) return;
		handler(params);
	}
};
var AppServerStreamEmitter = class {
	constructor(controller, options) {
		this.controller = controller;
		this.options = options;
		this.jsonModeLastTextBlockOnly = Boolean(options.jsonModeLastTextBlockOnly);
	}
	controller;
	options;
	textId;
	reasoningId;
	jsonModeLastTextBlockOnly;
	bufferedCurrentJsonText = "";
	lastCompletedJsonTextId;
	lastCompletedJsonText = "";
	closed = false;
	safeEnqueue(part) {
		if (this.closed) return;
		try {
			this.controller.enqueue(part);
		} catch {
			this.closed = true;
		}
	}
	emitStreamStart(warnings) {
		this.safeEnqueue({
			type: "stream-start",
			warnings
		});
	}
	emitResponseMetadata() {
		this.safeEnqueue({
			type: "response-metadata",
			id: require_dist.generateId(),
			timestamp: /* @__PURE__ */ new Date(),
			modelId: this.options.modelId
		});
	}
	emitRaw(method, params, id) {
		if (!this.options.includeRawChunks) return;
		this.safeEnqueue({
			type: "raw",
			rawValue: {
				method,
				params,
				id
			}
		});
	}
	emitTextDelta(delta, itemId) {
		if (this.jsonModeLastTextBlockOnly) {
			const nextTextId2 = itemId ?? this.textId ?? require_dist.generateId();
			if (this.textId && this.textId !== nextTextId2) {
				this.lastCompletedJsonTextId = this.textId;
				this.lastCompletedJsonText = this.bufferedCurrentJsonText;
				this.textId = void 0;
				this.bufferedCurrentJsonText = "";
			}
			if (!this.textId) {
				this.textId = nextTextId2;
				this.bufferedCurrentJsonText = "";
			}
			this.bufferedCurrentJsonText = `${this.bufferedCurrentJsonText}${delta}`;
			return;
		}
		const nextTextId = itemId ?? this.textId ?? require_dist.generateId();
		if (this.textId && this.textId !== nextTextId) {
			this.safeEnqueue({
				type: "text-end",
				id: this.textId
			});
			this.textId = void 0;
		}
		if (!this.textId) {
			this.textId = nextTextId;
			this.safeEnqueue({
				type: "text-start",
				id: this.textId
			});
		}
		this.safeEnqueue({
			type: "text-delta",
			id: this.textId,
			delta
		});
	}
	emitReasoningDelta(delta, isSummary = false, itemId) {
		const nextReasoningId = itemId ?? this.reasoningId ?? require_dist.generateId();
		if (this.reasoningId && this.reasoningId !== nextReasoningId) {
			this.safeEnqueue({
				type: "reasoning-end",
				id: this.reasoningId
			});
			this.reasoningId = void 0;
		}
		if (!this.reasoningId) {
			this.reasoningId = nextReasoningId;
			this.safeEnqueue({
				type: "reasoning-start",
				id: this.reasoningId
			});
		}
		this.safeEnqueue({
			type: "reasoning-delta",
			id: this.reasoningId,
			delta,
			...isSummary ? { providerMetadata: { "codex-app-server": { isSummary: true } } } : {}
		});
	}
	emitToolCall(toolCallId, toolName, input, dynamic) {
		this.safeEnqueue({
			type: "tool-input-start",
			id: toolCallId,
			toolName,
			providerExecuted: true,
			...dynamic ? { dynamic: true } : {}
		});
		if (input) this.safeEnqueue({
			type: "tool-input-delta",
			id: toolCallId,
			delta: input
		});
		this.safeEnqueue({
			type: "tool-input-end",
			id: toolCallId
		});
		this.safeEnqueue({
			type: "tool-call",
			toolCallId,
			toolName,
			input,
			providerExecuted: true,
			...dynamic ? { dynamic: true } : {}
		});
	}
	emitToolOutputDelta(toolCallId, toolName, delta, dynamic) {
		this.safeEnqueue({
			type: "tool-result",
			toolCallId,
			toolName,
			preliminary: true,
			result: {
				type: "output-delta",
				delta
			},
			...dynamic ? { dynamic: true } : {}
		});
	}
	emitToolResult(toolCallId, toolName, result, dynamic, isError) {
		this.safeEnqueue({
			type: "tool-result",
			toolCallId,
			toolName,
			result: result ?? {},
			...dynamic ? { dynamic: true } : {},
			...isError ? { isError: true } : {}
		});
	}
	emitApprovalRequest(approvalId) {
		this.safeEnqueue({
			type: "tool-approval-request",
			approvalId,
			toolCallId: approvalId
		});
	}
	emitFinish(finishReason, usage, providerMetadata) {
		if (this.jsonModeLastTextBlockOnly) {
			if (this.textId) {
				this.lastCompletedJsonTextId = this.textId;
				this.lastCompletedJsonText = this.bufferedCurrentJsonText;
				this.textId = void 0;
				this.bufferedCurrentJsonText = "";
			}
			const finalBlockId = this.lastCompletedJsonTextId;
			if (finalBlockId) {
				const finalText = this.lastCompletedJsonText;
				this.safeEnqueue({
					type: "text-start",
					id: finalBlockId
				});
				if (finalText.length > 0) this.safeEnqueue({
					type: "text-delta",
					id: finalBlockId,
					delta: finalText
				});
				this.safeEnqueue({
					type: "text-end",
					id: finalBlockId
				});
			}
			this.lastCompletedJsonTextId = void 0;
			this.lastCompletedJsonText = "";
		} else if (this.textId) this.safeEnqueue({
			type: "text-end",
			id: this.textId
		});
		if (this.reasoningId) this.safeEnqueue({
			type: "reasoning-end",
			id: this.reasoningId
		});
		this.safeEnqueue({
			type: "finish",
			finishReason,
			usage,
			...providerMetadata ? { providerMetadata } : {}
		});
	}
	close() {
		if (this.closed) return;
		this.closed = true;
		try {
			this.controller.close();
		} catch {}
	}
	error(error) {
		if (this.closed) return;
		this.closed = true;
		try {
			this.controller.error(error);
		} catch {}
	}
};
var INTERRUPT_COMPLETION_TIMEOUT_MS = 5e3;
function waitForPromiseOrTimeout(promise, timeoutMs) {
	return new Promise((resolve) => {
		let settled = false;
		const timer = setTimeout(() => {
			if (settled) return;
			settled = true;
			resolve(void 0);
		}, timeoutMs);
		promise.then((value) => {
			if (settled) return;
			settled = true;
			clearTimeout(timer);
			resolve(value);
		}).catch(() => {
			if (settled) return;
			settled = true;
			clearTimeout(timer);
			resolve(void 0);
		});
	});
}
function isThreadNotFoundError(error) {
	const message = String(error?.message ?? error);
	return /thread.*not found/i.test(message);
}
function createStaleThreadError(threadId) {
	return /* @__PURE__ */ new Error(`Thread '${threadId}' not found after server restart. Create a new thread by omitting threadId.`);
}
function mapTurnStatusToFinishReason(turn) {
	switch (turn.status) {
		case "completed": return {
			unified: "stop",
			raw: "completed"
		};
		case "interrupted": return {
			unified: "stop",
			raw: "interrupted"
		};
		case "failed": {
			const errorInfo = turn.error?.codexErrorInfo;
			if (errorInfo === "contextWindowExceeded") return {
				unified: "length",
				raw: "context_window_exceeded"
			};
			if (errorInfo === "usageLimitExceeded") return {
				unified: "length",
				raw: "usage_limit_exceeded"
			};
			return {
				unified: "error",
				raw: turn.error?.message ?? "failed"
			};
		}
		default: return {
			unified: "other",
			raw: turn.status
		};
	}
}
var TurnStreamController = class {
	constructor(options) {
		this.options = options;
	}
	options;
	state = "created";
	usage = createEmptyCodexUsage();
	turnId;
	requestContextId;
	cleanedUp = false;
	pendingCancelReason;
	cancelBeforeTurnId = false;
	pendingAbortReason;
	interruptWaitPromise;
	cancelWaitPromise;
	settleTurn;
	turnCompletionPromise = new Promise(() => void 0);
	emitter;
	router;
	unsubscribeRouter;
	onAbort;
	isTerminalState() {
		return this.state === "closed" || this.state === "errored" || this.state === "finishing";
	}
	isClosedState() {
		return this.state === "closed";
	}
	async start(controller) {
		if (this.state !== "created") return;
		this.state = "starting";
		this.turnCompletionPromise = new Promise((resolve, reject) => {
			this.settleTurn = {
				resolve,
				reject
			};
		});
		this.emitter = new AppServerStreamEmitter(controller, {
			modelId: this.options.modelId,
			threadId: this.options.threadId,
			includeRawChunks: this.options.includeRawChunks,
			jsonModeLastTextBlockOnly: this.options.jsonModeLastTextBlockOnly
		});
		this.emitter.emitStreamStart(this.options.warnings);
		this.emitter.emitResponseMetadata();
		this.router = new AppServerNotificationRouter({
			client: this.options.client,
			emitter: this.emitter,
			threadId: this.options.threadId,
			onUsage: (nextUsage) => {
				this.usage = addCodexUsage(this.usage, nextUsage);
			},
			onThreadTurnCompleted: (turn) => {
				this.options.session?.setInactive(turn.id);
			},
			onTurnCompleted: (turn) => {
				this.settleTurn?.resolve(turn);
			},
			onError: (error) => {
				this.settleTurn?.reject(error);
			}
		});
		this.unsubscribeRouter = this.router.subscribe();
		this.attachAbortSignal();
		if (this.pendingCancelReason !== void 0) {
			await this.requestCancel(this.pendingCancelReason);
			if (this.isClosedState()) return;
		}
		if (this.pendingAbortReason !== void 0) {
			await this.failWithError(this.pendingAbortReason);
			return;
		}
		try {
			this.state = "awaiting_turn_id";
			const turnResponse = this.options.shouldSerializeTurnStart ? await this.options.client.withThreadLock(this.options.threadId, async () => await this.startTurnWithContext()) : await this.startTurnWithContext();
			this.turnId = turnResponse.turn.id;
			this.router.setTurnId(this.turnId);
			this.options.session?.setTurnId(this.turnId);
			if (this.isClosedState()) {
				if (this.pendingCancelReason !== void 0 && this.cancelBeforeTurnId) await this.requestCancel(this.pendingCancelReason);
				return;
			}
			this.state = "running";
			if (this.pendingCancelReason !== void 0) {
				await this.requestCancel(this.pendingCancelReason);
				return;
			}
			if (this.pendingAbortReason !== void 0) {
				await this.interruptAndAwaitCompletion();
				throw this.pendingAbortReason;
			}
			const turn = await this.turnCompletionPromise;
			if (this.pendingCancelReason !== void 0) {
				this.finishSilently();
				return;
			}
			if (this.pendingAbortReason !== void 0) throw this.pendingAbortReason;
			if (this.isTerminalState()) return;
			this.state = "finishing";
			const toolExecutionStats = this.router.getToolExecutionStats();
			this.emitter.emitFinish(mapTurnStatusToFinishReason(turn), this.usage, { "codex-app-server": {
				threadId: this.options.threadId,
				...this.turnId ? { turnId: this.turnId } : {},
				toolExecutionStats
			} });
			this.emitter.close();
			this.cleanup();
			this.state = "closed";
		} catch (error) {
			if (this.pendingCancelReason !== void 0) {
				if (this.turnId) await this.requestCancel(this.pendingCancelReason);
				else this.finishSilently();
				return;
			}
			if (this.options.hadInitialThreadId && isThreadNotFoundError(error)) {
				if (this.options.threadResolution.persistent && !this.options.threadResolution.explicit) this.options.clearPersistentThreadState(this.options.threadId);
				await this.failWithError(createStaleThreadError(this.options.threadId));
				return;
			}
			if (this.pendingAbortReason !== void 0 && this.turnId) await this.interruptAndAwaitCompletion();
			await this.failWithError(error);
		}
	}
	async cancel(reason) {
		this.pendingCancelReason = reason ?? this.pendingCancelReason ?? /* @__PURE__ */ new Error("Stream canceled");
		switch (this.state) {
			case "closed":
			case "errored":
			case "finishing": return;
			case "interrupting":
				await this.cancelWaitPromise;
				return;
			default: await this.requestCancel(reason);
		}
	}
	async startTurnWithContext() {
		this.requestContextId = this.options.client.registerRequestContext(this.options.threadId, {
			handlers: this.options.requestHandlers ?? {},
			autoApprove: this.options.autoApprove
		});
		try {
			const turnResponse = await this.options.client.turnStart(this.options.turnStartParams);
			this.options.client.bindRequestContext(this.requestContextId, turnResponse.turn.id);
			return turnResponse;
		} catch (error) {
			if (this.requestContextId) {
				this.options.client.clearRequestContext(this.requestContextId);
				this.requestContextId = void 0;
			}
			throw error;
		}
	}
	attachAbortSignal() {
		const signal = this.options.abortSignal;
		if (!signal) return;
		if (signal.aborted) {
			this.pendingAbortReason = signal.reason ?? /* @__PURE__ */ new Error("Request aborted");
			return;
		}
		this.onAbort = () => {
			this.pendingAbortReason = signal.reason ?? /* @__PURE__ */ new Error("Request aborted");
			if (!this.turnId) return;
			(async () => {
				await this.interruptAndAwaitCompletion();
				await this.failWithError(this.pendingAbortReason);
			})();
		};
		signal.addEventListener("abort", this.onAbort, { once: true });
	}
	async requestCancel(reason) {
		this.pendingCancelReason = reason ?? this.pendingCancelReason ?? /* @__PURE__ */ new Error("Stream canceled");
		if (!this.turnId) {
			this.cancelBeforeTurnId = this.state === "starting" || this.state === "awaiting_turn_id";
			this.finishSilently();
			return;
		}
		if (this.isTerminalState() && !this.cancelBeforeTurnId) return;
		if (!this.cancelWaitPromise) this.cancelWaitPromise = (async () => {
			this.state = "interrupting";
			if (this.cancelBeforeTurnId) {
				await this.options.client.turnInterrupt({
					threadId: this.options.threadId,
					turnId: this.turnId
				}).catch(() => void 0);
				this.cancelBeforeTurnId = false;
			} else await this.interruptAndAwaitCompletion();
			this.finishSilently();
		})();
		await this.cancelWaitPromise;
	}
	async interruptAndAwaitCompletion() {
		if (!this.turnId) return;
		if (!this.interruptWaitPromise) this.interruptWaitPromise = (async () => {
			await this.options.client.turnInterrupt({
				threadId: this.options.threadId,
				turnId: this.turnId
			}).catch(() => void 0);
			await waitForPromiseOrTimeout(this.turnCompletionPromise.then(() => void 0), INTERRUPT_COMPLETION_TIMEOUT_MS);
		})();
		await this.interruptWaitPromise;
	}
	async failWithError(error) {
		if (this.isTerminalState()) return;
		this.state = "errored";
		this.emitter?.error(error);
		this.cleanup();
	}
	finishSilently() {
		if (this.isTerminalState()) return;
		this.cleanup();
		this.state = "closed";
	}
	cleanup() {
		if (this.cleanedUp) return;
		this.cleanedUp = true;
		this.unsubscribeRouter?.();
		this.unsubscribeRouter = void 0;
		if (this.turnId) this.options.client.clearRequestContextForTurn(this.turnId);
		if (this.requestContextId) {
			this.options.client.clearRequestContext(this.requestContextId);
			this.requestContextId = void 0;
		}
		if (this.options.abortSignal && this.onAbort) this.options.abortSignal.removeEventListener("abort", this.onAbort);
		this.onAbort = void 0;
		this.options.releaseResources();
	}
};
function buildTurnStartParams(args) {
	return {
		threadId: args.threadId,
		input: args.input,
		cwd: args.settings.cwd,
		approvalPolicy: args.settings.approvalPolicy,
		sandboxPolicy: args.settings.sandboxPolicy,
		model: args.modelId,
		effort: args.settings.effort,
		summary: args.settings.summary,
		personality: args.settings.personality,
		...args.responseFormat?.type === "json" && args.responseFormat.schema ? { outputSchema: sanitizeJsonSchema(args.responseFormat.schema) } : {}
	};
}
var MAX_REQUEST_BODY_BYTES = 1048576;
function normalizeHost(host) {
	const trimmed = host.trim();
	return (trimmed.startsWith("[") && trimmed.endsWith("]") ? trimmed.slice(1, -1) : trimmed).toLowerCase();
}
function isLoopbackHost(host) {
	const normalized = normalizeHost(host);
	return normalized === "localhost" || normalized === "::1" || normalized === "0:0:0:0:0:0:0:1" || normalized.startsWith("127.");
}
function formatHttpUrlHost(host) {
	const normalized = normalizeHost(host);
	return normalized.includes(":") ? `[${normalized}]` : normalized;
}
function serializeToolResultToText(result) {
	if (typeof result === "string") return result;
	const json = JSON.stringify(result);
	if (json !== void 0) return json;
	return String(result);
}
async function createLocalMcpServer(options) {
	const { name, tools, port = 0, host = "127.0.0.1", allowNonLoopbackHost = false } = options;
	if (!isLoopbackHost(host) && !allowNonLoopbackHost) throw new Error(`Refusing to bind local MCP server to non-loopback host '${host}'. Set allowNonLoopbackHost: true to override.`);
	const toolMap = new Map(tools.map((tool2) => [tool2.name, tool2]));
	const bearerToken = (0, crypto.randomBytes)(32).toString("hex");
	const expectedAuthorizationHeader = `Bearer ${bearerToken}`;
	const handleRpcRequest = async (request) => {
		const id = request.id;
		if (request.method === "initialize") return {
			jsonrpc: "2.0",
			id,
			result: {
				protocolVersion: "2024-11-05",
				capabilities: { tools: {} },
				serverInfo: {
					name,
					version: "1.0.0"
				}
			}
		};
		if (request.method === "tools/list") return {
			jsonrpc: "2.0",
			id,
			result: { tools: tools.map((tool2) => ({
				name: tool2.name,
				description: tool2.description,
				inputSchema: tool2.inputSchema
			})) }
		};
		if (request.method === "tools/call") {
			const toolName = typeof request.params?.name === "string" ? request.params.name : void 0;
			const toolArgs = request.params?.arguments;
			if (!toolName || !toolMap.has(toolName)) return {
				jsonrpc: "2.0",
				id,
				error: {
					code: -32602,
					message: `Unknown tool: ${String(toolName)}`
				}
			};
			const tool2 = toolMap.get(toolName);
			try {
				return {
					jsonrpc: "2.0",
					id,
					result: { content: [{
						type: "text",
						text: serializeToolResultToText(await tool2.execute(toolArgs))
					}] }
				};
			} catch (error) {
				return {
					jsonrpc: "2.0",
					id,
					error: {
						code: -32603,
						message: error instanceof Error ? error.message : String(error)
					}
				};
			}
		}
		if (request.method === "notifications/initialized") return {
			jsonrpc: "2.0",
			id,
			result: {}
		};
		return {
			jsonrpc: "2.0",
			id,
			error: {
				code: -32601,
				message: `Method not found: ${request.method}`
			}
		};
	};
	const httpHandler = (req, res) => {
		(async () => {
			if (req.method !== "POST") {
				res.writeHead(405, { "Content-Type": "application/json" });
				res.end(JSON.stringify({ error: "Method not allowed" }));
				return;
			}
			const contentType = req.headers["content-type"];
			if (typeof contentType !== "string" || !contentType.includes("application/json")) {
				res.writeHead(415, { "Content-Type": "application/json" });
				res.end(JSON.stringify({ error: "Unsupported media type" }));
				return;
			}
			if (req.headers.authorization !== expectedAuthorizationHeader) {
				res.writeHead(401, {
					"Content-Type": "application/json",
					"WWW-Authenticate": "Bearer"
				});
				res.end(JSON.stringify({ error: "Unauthorized" }));
				return;
			}
			const chunks = [];
			let bodyBytes = 0;
			for await (const chunk of req) {
				const buffer = chunk;
				bodyBytes += buffer.length;
				if (bodyBytes > MAX_REQUEST_BODY_BYTES) {
					res.writeHead(413, { "Content-Type": "application/json" });
					res.end(JSON.stringify({ error: "Request body too large" }));
					return;
				}
				chunks.push(buffer);
			}
			let payload;
			try {
				payload = JSON.parse(Buffer.concat(chunks).toString("utf8"));
			} catch {
				res.writeHead(400, { "Content-Type": "application/json" });
				res.end(JSON.stringify({
					jsonrpc: "2.0",
					error: {
						code: -32700,
						message: "Parse error"
					}
				}));
				return;
			}
			if (payload.id === void 0) {
				res.writeHead(202, { "Content-Type": "application/json" });
				res.end();
				return;
			}
			const rpcResponse = await handleRpcRequest(payload);
			res.writeHead(200, { "Content-Type": "application/json" });
			res.end(JSON.stringify(rpcResponse));
		})();
	};
	const server = (0, http.createServer)(httpHandler);
	await new Promise((resolve, reject) => {
		server.once("error", reject);
		server.listen(port, host, () => {
			server.off("error", reject);
			resolve();
		});
	});
	const address = server.address();
	if (!address || typeof address === "string") throw new Error("Failed to resolve local MCP server address");
	const actualPort = address.port;
	const url = `http://${formatHttpUrlHost(host)}:${actualPort}`;
	return {
		config: {
			transport: "http",
			url,
			bearerToken
		},
		url,
		port: actualPort,
		stop: async () => {
			await new Promise((resolve, reject) => {
				server.close((error) => {
					if (error) {
						reject(error);
						return;
					}
					resolve();
				});
			});
		}
	};
}
var SDK_MCP_SERVER_MARKER = /* @__PURE__ */ Symbol.for("ai-sdk-provider-codex-cli.sdkMcpServer");
function createSdkMcpServer(options) {
	const { name, cacheKey, tools } = options;
	let server;
	let startPromise;
	let stopPromise;
	return {
		[SDK_MCP_SERVER_MARKER]: true,
		name,
		cacheKey: cacheKey?.trim() || void 0,
		tools,
		get _server() {
			return server;
		},
		set _server(nextServer) {
			server = nextServer;
		},
		async _start() {
			while (true) {
				if (server) return server.config;
				if (startPromise) return (await startPromise).config;
				if (stopPromise) {
					await stopPromise;
					continue;
				}
				const startup = (async () => {
					const created = await createLocalMcpServer({
						name,
						tools
					});
					server = created;
					return created;
				})();
				startPromise = startup;
				try {
					return (await startup).config;
				} finally {
					if (startPromise === startup) startPromise = void 0;
				}
			}
		},
		async _stop() {
			if (stopPromise) {
				await stopPromise;
				return;
			}
			const stopping = (async () => {
				if (startPromise) await startPromise.catch(() => void 0);
				const serverToStop = server;
				server = void 0;
				if (serverToStop) await serverToStop.stop();
			})();
			stopPromise = stopping;
			try {
				await stopping;
			} finally {
				if (stopPromise === stopping) stopPromise = void 0;
				startPromise = void 0;
			}
		}
	};
}
function isSdkMcpServer(value) {
	const marker = typeof value === "object" && value !== null ? value[SDK_MCP_SERVER_MARKER] : void 0;
	return typeof value === "object" && value !== null && marker === true && typeof value._start === "function" && typeof value._stop === "function";
}
var CODEX_REASONING_EFFORTS2 = {
	none: true,
	minimal: true,
	low: true,
	medium: true,
	high: true,
	xhigh: true,
	max: true,
	ultra: true
};
function resolveReasoningEffort(args) {
	if (args.providerEffort !== void 0) return { effort: args.providerEffort };
	const { reasoning } = args;
	if (reasoning === void 0 || reasoning === "provider-default") return { effort: args.defaultEffort };
	if (Object.hasOwn(CODEX_REASONING_EFFORTS2, reasoning)) return { effort: reasoning };
	return {
		effort: args.defaultEffort,
		warning: {
			type: "unsupported",
			feature: "reasoning",
			details: `Codex app-server does not support reasoning effort '${reasoning}'; it will be ignored.`
		}
	};
}
function isThreadNotFoundError2(error) {
	const message = String(error?.message ?? error);
	return /thread.*not found/i.test(message);
}
function createStaleThreadError2(threadId) {
	return /* @__PURE__ */ new Error(`Thread '${threadId}' not found after server restart. Create a new thread by omitting threadId.`);
}
function mapSandboxToThreadSandboxMode(settings) {
	const policy = settings.sandboxPolicy;
	if (!policy) return void 0;
	if (typeof policy === "string") return policy;
	if (policy.type === "readOnly") return "read-only";
	if (policy.type === "workspaceWrite") return "workspace-write";
	if (policy.type === "dangerFullAccess") return "danger-full-access";
}
function mapSandboxToTurnSandboxPolicy(settings) {
	const policy = settings.sandboxPolicy;
	if (!policy) return void 0;
	if (typeof policy !== "string") return policy;
	if (policy === "read-only") return { type: "readOnly" };
	if (policy === "workspace-write") return { type: "workspaceWrite" };
	if (policy === "danger-full-access") return { type: "dangerFullAccess" };
}
function mapApprovalPolicy(policy, warnDeprecated) {
	if (policy === void 0) return void 0;
	if (isDeprecatedApprovalPolicyAlias(policy)) {
		const normalized = normalizeApprovalPolicyAlias(policy);
		warnDeprecated?.(`approvalPolicy:${policy}`, `approvalPolicy '${policy}' is deprecated (retired by Codex CLI 0.143 and rejected by app-server >= 0.144); sending '${normalized}' instead.`);
		return normalized;
	}
	if (typeof policy === "object" && policy !== null && "reject" in policy) {
		const { reject } = policy;
		warnDeprecated?.("approvalPolicy:reject", "approvalPolicy { reject } is deprecated (removed from the Codex app-server protocol); sending the equivalent { granular } policy instead.");
		return { granular: {
			sandbox_approval: !reject.sandbox_approval,
			rules: !reject.rules,
			mcp_elicitations: !reject.mcp_elicitations,
			skill_approval: true,
			request_permissions: true
		} };
	}
	return policy;
}
function mergeServerRequests(base, override) {
	if (!base && !override) return void 0;
	return {
		...base ?? {},
		...override ?? {}
	};
}
function mergeAppServerMcpServers(base, override) {
	if (!base && !override) return void 0;
	const merged = {};
	for (const [rawName, server] of Object.entries(base ?? {})) {
		const name = assertValidMcpServerName(rawName);
		merged[name] = server;
	}
	if (!override) return merged;
	for (const [rawName, incoming] of Object.entries(override)) {
		const name = assertValidMcpServerName(rawName);
		const existing = merged[name];
		if (!existing || isSdkMcpServer(existing) || isSdkMcpServer(incoming)) {
			merged[name] = incoming;
			continue;
		}
		if (existing.transport === incoming.transport) merged[name] = mergeSingleMcpServer(existing, incoming);
		else merged[name] = incoming;
	}
	return merged;
}
var AppServerLanguageModel = class {
	specificationVersion = "v4";
	provider = "codex-app-server";
	supportedUrls = {};
	modelId;
	settings;
	client;
	logger;
	onSdkMcpServerUsed;
	onSdkMcpServerReleased;
	persistentThreadId;
	persistentThreadRawEventsEnabled;
	rawEventsByThreadId = /* @__PURE__ */ new Map();
	persistentSession;
	persistentBootstrapLock = Promise.resolve();
	deprecationWarningsEmitted = /* @__PURE__ */ new Set();
	constructor(options) {
		this.modelId = options.id;
		this.settings = options.settings ?? {};
		this.client = options.client;
		this.onSdkMcpServerUsed = options.onSdkMcpServerUsed;
		this.onSdkMcpServerReleased = options.onSdkMcpServerReleased;
		const baseLogger = getLogger(this.settings.logger);
		this.logger = createVerboseLogger(baseLogger, this.settings.verbose ?? false);
		if (!this.modelId || this.modelId.trim() === "") throw new require_dist.NoSuchModelError({
			modelId: this.modelId,
			modelType: "languageModel"
		});
	}
	warnDeprecatedOnce(key, message) {
		if (this.deprecationWarningsEmitted.has(key)) return;
		this.deprecationWarningsEmitted.add(key);
		this.logger.warn(`[codex-app-server] ${message}`);
	}
	mapApprovalPolicy(settings) {
		return mapApprovalPolicy(settings.approvalPolicy, (key, message) => this.warnDeprecatedOnce(key, message));
	}
	mergeSettings(providerOptions) {
		if (!providerOptions) return this.settings;
		const merged = {
			...this.settings,
			personality: providerOptions.personality ?? this.settings.personality,
			effort: providerOptions.effort ?? this.settings.effort,
			summary: providerOptions.summary ?? this.settings.summary,
			approvalPolicy: providerOptions.approvalPolicy ?? this.settings.approvalPolicy,
			sandboxPolicy: providerOptions.sandboxPolicy ?? this.settings.sandboxPolicy,
			baseInstructions: providerOptions.baseInstructions ?? this.settings.baseInstructions,
			developerInstructions: providerOptions.developerInstructions ?? this.settings.developerInstructions,
			autoApprove: providerOptions.autoApprove ?? this.settings.autoApprove,
			persistExtendedHistory: providerOptions.persistExtendedHistory ?? this.settings.persistExtendedHistory,
			threadMode: providerOptions.threadMode ?? this.settings.threadMode,
			resume: providerOptions.resume ?? this.settings.resume,
			includeRawChunks: providerOptions.includeRawChunks ?? this.settings.includeRawChunks,
			rmcpClient: providerOptions.rmcpClient ?? this.settings.rmcpClient,
			configOverrides: {
				...this.settings.configOverrides ?? {},
				...providerOptions.configOverrides ?? {}
			},
			serverRequests: mergeServerRequests(this.settings.serverRequests, providerOptions.serverRequests),
			onSessionCreated: providerOptions.onSessionCreated ?? this.settings.onSessionCreated
		};
		merged.mcpServers = mergeAppServerMcpServers(this.settings.mcpServers, providerOptions.mcpServers);
		return merged;
	}
	resolveThreadMode(settings, providerOptions) {
		return providerOptions?.threadMode ?? settings.threadMode ?? "stateless";
	}
	resolveTargetThreadId(settings, providerOptions) {
		const mode = this.resolveThreadMode(settings, providerOptions);
		const explicit = providerOptions?.threadId ?? providerOptions?.resume ?? settings.resume;
		if (explicit) return {
			threadId: explicit,
			explicit: true,
			persistent: mode === "persistent"
		};
		if (mode === "persistent" && this.persistentThreadId) return {
			threadId: this.persistentThreadId,
			explicit: false,
			persistent: true
		};
		return {
			threadId: void 0,
			explicit: false,
			persistent: mode === "persistent"
		};
	}
	resolveIncludeRawChunks(optionsIncludeRawChunks, settings, providerOptions) {
		return (optionsIncludeRawChunks ?? providerOptions?.includeRawChunks ?? settings.includeRawChunks) === true;
	}
	async resolveConfig(settings, sdkServerLifecycle) {
		const resolvedMcpServers = {};
		const usedSdkMcpServers = [];
		try {
			for (const [name, server] of Object.entries(settings.mcpServers ?? {})) {
				if (isSdkMcpServer(server)) {
					const started = await server._start();
					this.onSdkMcpServerUsed?.(server, sdkServerLifecycle);
					usedSdkMcpServers.push(server);
					resolvedMcpServers[name] = started;
					continue;
				}
				resolvedMcpServers[name] = server;
			}
		} catch (error) {
			if (sdkServerLifecycle === "request") for (const server of usedSdkMcpServers) this.onSdkMcpServerReleased?.(server);
			throw error;
		}
		const configOverrides = {
			...mcpServersToConfigOverrides(Object.keys(resolvedMcpServers).length > 0 ? resolvedMcpServers : void 0, settings.rmcpClient),
			...settings.configOverrides ?? {}
		};
		return {
			configOverrides: Object.keys(configOverrides).length > 0 ? configOverrides : void 0,
			usedSdkMcpServers
		};
	}
	async buildUserInput(text, images) {
		const input = [];
		const tempImagePaths = [];
		if (text.trim().length > 0) input.push({
			type: "text",
			text,
			text_elements: []
		});
		for (const image of images) {
			if (image.type === "remote") {
				input.push({
					type: "image",
					url: image.url,
					imageUrl: image.url
				});
				continue;
			}
			try {
				const tempPath = writeImageToTempFile(image.data);
				tempImagePaths.push(tempPath);
				input.push({
					type: "localImage",
					path: tempPath
				});
			} catch (error) {
				this.logger.warn(`[codex-app-server] Failed to write image to temp file: ${String(error)}`);
			}
		}
		return {
			input,
			tempImagePaths
		};
	}
	async startOrResumeThread(args) {
		const { settings, providerOptions, configOverrides, developerInstructionsOverride, systemInstruction, includeRawChunks } = args;
		const threadState = this.resolveTargetThreadId(settings, providerOptions);
		const startThread = async (ephemeral) => {
			return (await this.client.threadStart({
				model: this.modelId,
				cwd: settings.cwd,
				approvalPolicy: this.mapApprovalPolicy(settings),
				sandbox: mapSandboxToThreadSandboxMode(settings),
				config: configOverrides,
				baseInstructions: settings.baseInstructions,
				developerInstructions: developerInstructionsOverride ?? systemInstruction,
				personality: settings.personality,
				ephemeral,
				experimentalRawEvents: includeRawChunks,
				persistExtendedHistory: settings.persistExtendedHistory ?? false
			})).thread.id;
		};
		const resolveThread = async () => {
			const resumeThread = async (target) => {
				try {
					await this.client.threadResume({
						threadId: target.threadId,
						model: this.modelId,
						cwd: settings.cwd,
						approvalPolicy: this.mapApprovalPolicy(settings),
						sandbox: mapSandboxToThreadSandboxMode(settings),
						config: configOverrides,
						baseInstructions: settings.baseInstructions,
						developerInstructions: developerInstructionsOverride ?? systemInstruction,
						personality: settings.personality,
						persistExtendedHistory: settings.persistExtendedHistory ?? false
					});
					const cachedRawEvents = this.rawEventsByThreadId.get(target.threadId);
					const knownRawEvents = cachedRawEvents ?? (target.persistent && this.persistentThreadId === target.threadId ? this.persistentThreadRawEventsEnabled : void 0);
					if (cachedRawEvents !== void 0) this.rememberThreadRawEvents(target.threadId, cachedRawEvents);
					if (target.persistent) {
						this.persistentThreadId = target.threadId;
						this.persistentThreadRawEventsEnabled = knownRawEvents;
					}
					return {
						threadId: target.threadId,
						persistent: target.persistent,
						explicit: target.explicit,
						resumed: true,
						rawEventsNegotiated: knownRawEvents
					};
				} catch (error) {
					if (!isThreadNotFoundError2(error)) throw error;
					if (target.persistent && !target.explicit) this.clearPersistentThreadState(target.threadId);
					throw createStaleThreadError2(target.threadId);
				}
			};
			if (!threadState.threadId && threadState.persistent) {
				if (this.persistentThreadId) return await resumeThread({
					threadId: this.persistentThreadId,
					persistent: true,
					explicit: false
				});
				const newThreadId = await startThread(false);
				this.rememberThreadRawEvents(newThreadId, includeRawChunks);
				this.persistentThreadId = newThreadId;
				this.persistentThreadRawEventsEnabled = includeRawChunks;
				return {
					threadId: newThreadId,
					persistent: true,
					explicit: false,
					resumed: false,
					rawEventsNegotiated: includeRawChunks
				};
			}
			if (!threadState.threadId) {
				const newThreadId = await startThread(!threadState.persistent);
				this.rememberThreadRawEvents(newThreadId, includeRawChunks);
				if (threadState.persistent) {
					this.persistentThreadId = newThreadId;
					this.persistentThreadRawEventsEnabled = includeRawChunks;
				}
				return {
					threadId: newThreadId,
					persistent: threadState.persistent,
					explicit: false,
					resumed: false,
					rawEventsNegotiated: includeRawChunks
				};
			}
			return await resumeThread({
				threadId: threadState.threadId,
				persistent: threadState.persistent,
				explicit: threadState.explicit
			});
		};
		if (threadState.persistent && !threadState.explicit) return await this.withPersistentBootstrapLock(resolveThread);
		return await resolveThread();
	}
	async withPersistentBootstrapLock(fn) {
		const previous = this.persistentBootstrapLock;
		let release;
		const gate = new Promise((resolve) => {
			release = resolve;
		});
		const chained = previous.then(() => gate);
		this.persistentBootstrapLock = chained;
		await previous;
		try {
			return await fn();
		} finally {
			release?.();
			if (this.persistentBootstrapLock === chained) this.persistentBootstrapLock = Promise.resolve();
		}
	}
	rememberThreadRawEvents(threadId, enabled) {
		this.rawEventsByThreadId.delete(threadId);
		this.rawEventsByThreadId.set(threadId, enabled);
		if (this.rawEventsByThreadId.size <= 256) return;
		const oldestThreadId = this.rawEventsByThreadId.keys().next().value;
		if (typeof oldestThreadId === "string") this.rawEventsByThreadId.delete(oldestThreadId);
	}
	clearPersistentThreadState(threadId) {
		if (threadId && this.persistentThreadId && this.persistentThreadId !== threadId) return;
		this.persistentThreadId = void 0;
		this.persistentThreadRawEventsEnabled = void 0;
		if (threadId) this.rawEventsByThreadId.delete(threadId);
		if (!threadId || this.persistentSession?.threadId === threadId) this.persistentSession = void 0;
	}
	async createOrReuseSession(args) {
		const { threadId, settings, providerOptions } = args;
		const onSessionCreated = providerOptions?.onSessionCreated ?? settings.onSessionCreated;
		if (!onSessionCreated) return;
		const persistent = this.resolveThreadMode(settings, providerOptions) === "persistent";
		if (persistent && this.persistentSession && this.persistentSession.threadId === threadId) return this.persistentSession;
		const session = new AppServerSession({
			threadId,
			modelId: this.modelId,
			client: this.client,
			defaultTurnParams: {
				cwd: settings.cwd,
				approvalPolicy: this.mapApprovalPolicy(settings),
				sandboxPolicy: mapSandboxToTurnSandboxPolicy(settings),
				effort: settings.effort,
				summary: settings.summary,
				personality: settings.personality
			},
			requestHandlers: settings.serverRequests ?? {},
			autoApprove: settings.autoApprove
		});
		await onSessionCreated(session);
		if (persistent) this.persistentSession = session;
		return session;
	}
	preparePrompt(prompt, hasExistingThreadContext) {
		const converted = convertPromptToCodexInput({
			prompt,
			mode: hasExistingThreadContext ? "persistent" : "stateless"
		});
		return {
			promptText: converted.text,
			images: [...converted.localImages.map((image) => ({
				type: "local",
				data: image
			})), ...converted.remoteImageUrls.map((url) => ({
				type: "remote",
				url
			}))],
			warnings: converted.warnings.map((warning) => warning.type === "unsupported" ? {
				type: "unsupported",
				feature: warning.feature,
				details: warning.details
			} : {
				type: "other",
				message: warning.message
			}),
			systemInstruction: converted.systemInstruction
		};
	}
	async doGenerate(options) {
		const { stream, request } = await this.doStream(options);
		const content = [];
		const textPartsById = /* @__PURE__ */ new Map();
		const reasoningPartsById = /* @__PURE__ */ new Map();
		let activeTextBlockId;
		let activeReasoningBlockId;
		let responseMetadata = {
			id: require_dist.generateId(),
			timestamp: /* @__PURE__ */ new Date(),
			modelId: this.modelId
		};
		let usage = createEmptyCodexUsage();
		let finishReason = {
			unified: "other",
			raw: void 0
		};
		let warnings = [];
		let providerMetadata;
		const ensureTextPart = (id, metadata) => {
			const existing = textPartsById.get(id);
			if (existing) {
				if (metadata) existing.providerMetadata = metadata;
				return existing;
			}
			const part = {
				type: "text",
				text: "",
				...metadata ? { providerMetadata: metadata } : {}
			};
			textPartsById.set(id, part);
			content.push(part);
			return part;
		};
		const ensureReasoningPart = (id, metadata) => {
			const existing = reasoningPartsById.get(id);
			if (existing) {
				if (metadata) existing.providerMetadata = metadata;
				return existing;
			}
			const part = {
				type: "reasoning",
				text: "",
				...metadata ? { providerMetadata: metadata } : {}
			};
			reasoningPartsById.set(id, part);
			content.push(part);
			return part;
		};
		const pushContentPart = (part) => {
			content.push(part);
		};
		for await (const part of stream) {
			if (part.type === "stream-start") {
				warnings = part.warnings;
				continue;
			}
			if (part.type === "response-metadata") {
				responseMetadata = {
					id: part.id,
					timestamp: part.timestamp,
					modelId: part.modelId
				};
				continue;
			}
			if (part.type === "text-start") {
				activeTextBlockId = part.id;
				ensureTextPart(part.id, part.providerMetadata);
				continue;
			}
			if (part.type === "text-delta") {
				const blockId = typeof part.id === "string" ? part.id : activeTextBlockId ?? "__default_text_block__";
				activeTextBlockId = blockId;
				const textPart = ensureTextPart(blockId, part.providerMetadata);
				textPart.text = `${textPart.text}${part.delta}`;
				continue;
			}
			if (part.type === "text-end") {
				const blockId = typeof part.id === "string" ? part.id : activeTextBlockId;
				if (blockId) {
					const textPart = ensureTextPart(blockId, part.providerMetadata);
					if (part.providerMetadata) textPart.providerMetadata = part.providerMetadata;
				}
				if (activeTextBlockId === blockId) activeTextBlockId = void 0;
				continue;
			}
			if (part.type === "reasoning-start") {
				activeReasoningBlockId = part.id;
				ensureReasoningPart(part.id, part.providerMetadata);
				continue;
			}
			if (part.type === "reasoning-delta") {
				const blockId = typeof part.id === "string" ? part.id : activeReasoningBlockId ?? "__default_reasoning_block__";
				activeReasoningBlockId = blockId;
				const reasoningPart = ensureReasoningPart(blockId, part.providerMetadata);
				reasoningPart.text = `${reasoningPart.text}${part.delta}`;
				continue;
			}
			if (part.type === "reasoning-end") {
				const blockId = typeof part.id === "string" ? part.id : activeReasoningBlockId;
				if (blockId) {
					const reasoningPart = ensureReasoningPart(blockId, part.providerMetadata);
					if (part.providerMetadata) reasoningPart.providerMetadata = part.providerMetadata;
				}
				if (activeReasoningBlockId === blockId) activeReasoningBlockId = void 0;
				continue;
			}
			if (part.type === "file") {
				pushContentPart(part);
				continue;
			}
			if (part.type === "source") {
				pushContentPart(part);
				continue;
			}
			if (part.type === "tool-approval-request") {
				pushContentPart(part);
				continue;
			}
			if (part.type === "tool-call") {
				pushContentPart(part);
				continue;
			}
			if (part.type === "tool-result") {
				pushContentPart(part);
				continue;
			}
			if (part.type === "finish") {
				usage = part.usage;
				finishReason = part.finishReason;
				providerMetadata = part.providerMetadata;
			}
		}
		return {
			content: content.filter((part) => {
				if (part.type === "text") return part.text.trim().length > 0;
				if (part.type === "reasoning") return part.text.trim().length > 0;
				return true;
			}),
			usage,
			finishReason,
			warnings,
			response: responseMetadata,
			request,
			...providerMetadata ? { providerMetadata } : {}
		};
	}
	async doStream(options) {
		const providerOptions = await require_dist.parseProviderOptions({
			provider: this.provider,
			providerOptions: options.providerOptions,
			schema: appServerProviderOptionsSchema
		});
		const mergedSettings = this.mergeSettings(providerOptions);
		const resolvedReasoning = resolveReasoningEffort({
			reasoning: options.reasoning,
			providerEffort: providerOptions?.effort,
			defaultEffort: mergedSettings.effort
		});
		const settings = resolvedReasoning.effort === mergedSettings.effort ? mergedSettings : {
			...mergedSettings,
			effort: resolvedReasoning.effort
		};
		const sdkServerLifecycle = this.resolveThreadMode(settings, providerOptions) === "persistent" ? "provider" : "request";
		const includeRawChunks = this.resolveIncludeRawChunks(options.includeRawChunks, settings, providerOptions);
		const warnings = [...mapUnsupportedSettingsWarnings({
			temperature: options.temperature,
			topP: options.topP,
			topK: options.topK,
			maxOutputTokens: options.maxOutputTokens,
			presencePenalty: options.presencePenalty,
			frequencyPenalty: options.frequencyPenalty,
			stopSequences: options.stopSequences,
			seed: options.seed,
			tools: options.tools,
			toolChoice: options.toolChoice
		})];
		if (resolvedReasoning.warning) warnings.push(resolvedReasoning.warning);
		const developerInstructionsOverride = providerOptions?.developerInstructions ?? settings.developerInstructions;
		const systemInstruction = collectSystemInstruction(options.prompt);
		const resolvedConfig = await this.resolveConfig(settings, sdkServerLifecycle);
		let releasedSdkServers = false;
		const releaseUsedSdkMcpServers = () => {
			if (releasedSdkServers || sdkServerLifecycle !== "request") return;
			releasedSdkServers = true;
			for (const server of resolvedConfig.usedSdkMcpServers) this.onSdkMcpServerReleased?.(server);
		};
		let threadResolution;
		try {
			threadResolution = await this.startOrResumeThread({
				settings,
				providerOptions,
				configOverrides: resolvedConfig.configOverrides,
				developerInstructionsOverride,
				systemInstruction,
				includeRawChunks
			});
		} catch (error) {
			releaseUsedSdkMcpServers();
			throw error;
		}
		const threadId = threadResolution.threadId;
		if (includeRawChunks && threadResolution.resumed && threadResolution.rawEventsNegotiated !== true) warnings.push({
			type: "other",
			message: "includeRawChunks was requested while resuming an existing thread that may not emit raw events. Start a new thread to guarantee raw chunk events."
		});
		const prompt = this.preparePrompt(options.prompt, threadResolution.resumed);
		warnings.push(...prompt.warnings);
		let input = [];
		let tempImagePaths = [];
		let session;
		try {
			const builtInput = await this.buildUserInput(prompt.promptText, prompt.images);
			input = builtInput.input;
			tempImagePaths = builtInput.tempImagePaths;
			session = await this.createOrReuseSession({
				threadId,
				settings,
				providerOptions
			});
		} catch (error) {
			cleanupTempImages(tempImagePaths);
			releaseUsedSdkMcpServers();
			throw error;
		}
		const turnStartParams = buildTurnStartParams({
			threadId,
			modelId: this.modelId,
			input,
			settings: {
				cwd: settings.cwd,
				approvalPolicy: this.mapApprovalPolicy(settings),
				sandboxPolicy: mapSandboxToTurnSandboxPolicy(settings),
				effort: settings.effort,
				summary: settings.summary,
				personality: settings.personality
			},
			responseFormat: options.responseFormat
		});
		const turnStreamController = new TurnStreamController({
			client: this.client,
			modelId: this.modelId,
			threadId,
			warnings,
			includeRawChunks,
			jsonModeLastTextBlockOnly: options.responseFormat?.type === "json",
			turnStartParams,
			requestHandlers: settings.serverRequests,
			autoApprove: settings.autoApprove,
			session,
			abortSignal: options.abortSignal,
			shouldSerializeTurnStart: threadResolution.persistent || threadResolution.explicit,
			hadInitialThreadId: threadResolution.resumed,
			threadResolution: {
				persistent: threadResolution.persistent,
				explicit: threadResolution.explicit
			},
			releaseResources: () => {
				cleanupTempImages(tempImagePaths);
				releaseUsedSdkMcpServers();
			},
			clearPersistentThreadState: (staleThreadId) => {
				this.clearPersistentThreadState(staleThreadId);
			}
		});
		return {
			stream: new ReadableStream({
				start: async (controller) => {
					await turnStreamController.start(controller);
				},
				cancel: async (reason) => {
					await turnStreamController.cancel(reason);
				}
			}),
			request: { body: prompt.promptText }
		};
	}
};
var jsonRpcIdSchema = require_dist.union([require_dist.number(), require_dist.string()]);
var jsonRpcRequestSchema = require_dist.object({
	id: jsonRpcIdSchema,
	method: require_dist.string().min(1),
	params: require_dist.record(require_dist.string(), require_dist.unknown()).optional()
}).passthrough();
var jsonRpcResponseSchema = require_dist.object({
	id: jsonRpcIdSchema,
	result: require_dist.unknown()
}).refine((value) => Object.prototype.hasOwnProperty.call(value, "result"), { message: "result field is required" }).passthrough();
var jsonRpcErrorResponseSchema = require_dist.object({
	id: require_dist.union([jsonRpcIdSchema, require_dist._null()]),
	error: require_dist.object({
		code: require_dist.number(),
		message: require_dist.string(),
		data: require_dist.unknown().optional()
	}).passthrough()
}).passthrough();
var jsonRpcNotificationSchema = require_dist.object({
	method: require_dist.string().min(1),
	params: require_dist.record(require_dist.string(), require_dist.unknown()).optional()
}).passthrough();
var userInputTextSchema = require_dist.object({
	type: require_dist.literal("text"),
	text: require_dist.string(),
	text_elements: require_dist.array(require_dist.unknown())
}).passthrough();
var userInputImageSchema = require_dist.object({
	type: require_dist.literal("image"),
	url: require_dist.string().optional(),
	imageUrl: require_dist.string().optional()
}).refine((value) => typeof value.url === "string" || typeof value.imageUrl === "string", { message: "image input must provide url or imageUrl" }).passthrough();
var userInputLocalImageSchema = require_dist.object({
	type: require_dist.literal("localImage"),
	path: require_dist.string()
}).passthrough();
var userInputSkillSchema = require_dist.object({
	type: require_dist.literal("skill"),
	name: require_dist.string(),
	path: require_dist.string()
}).passthrough();
var userInputMentionSchema = require_dist.object({
	type: require_dist.literal("mention"),
	name: require_dist.string(),
	path: require_dist.string()
}).passthrough();
var userInputSchema = require_dist.discriminatedUnion("type", [
	userInputTextSchema,
	userInputImageSchema,
	userInputLocalImageSchema,
	userInputSkillSchema,
	userInputMentionSchema
]);
var userMessageItemSchema = require_dist.object({
	type: require_dist.literal("userMessage"),
	id: require_dist.string(),
	content: require_dist.array(userInputSchema)
}).passthrough();
var agentMessageItemSchema = require_dist.object({
	type: require_dist.literal("agentMessage"),
	id: require_dist.string(),
	text: require_dist.string(),
	phase: require_dist.string().nullable()
}).passthrough();
var planItemSchema = require_dist.object({
	type: require_dist.literal("plan"),
	id: require_dist.string(),
	text: require_dist.string()
}).passthrough();
var reasoningItemSchema = require_dist.object({
	type: require_dist.literal("reasoning"),
	id: require_dist.string(),
	summary: require_dist.array(require_dist.string()),
	content: require_dist.array(require_dist.string())
}).passthrough();
var commandExecutionItemSchema = require_dist.object({
	type: require_dist.literal("commandExecution"),
	id: require_dist.string(),
	command: require_dist.string(),
	cwd: require_dist.string(),
	processId: require_dist.string().nullable(),
	status: require_dist.string(),
	commandActions: require_dist.array(require_dist.unknown()),
	aggregatedOutput: require_dist.string().nullable(),
	exitCode: require_dist.number().nullable(),
	durationMs: require_dist.number().nullable()
}).passthrough();
var fileChangeItemSchema = require_dist.object({
	type: require_dist.literal("fileChange"),
	id: require_dist.string(),
	changes: require_dist.array(require_dist.unknown()),
	status: require_dist.string()
}).passthrough();
var mcpToolCallItemSchema = require_dist.object({
	type: require_dist.literal("mcpToolCall"),
	id: require_dist.string(),
	server: require_dist.string(),
	tool: require_dist.string(),
	status: require_dist.string(),
	arguments: require_dist.unknown(),
	result: require_dist.unknown().nullable(),
	error: require_dist.unknown().nullable(),
	durationMs: require_dist.number().nullable()
}).passthrough();
var collabAgentToolCallItemSchema = require_dist.object({
	type: require_dist.literal("collabAgentToolCall"),
	id: require_dist.string(),
	tool: require_dist.string(),
	status: require_dist.string(),
	senderThreadId: require_dist.string(),
	receiverThreadIds: require_dist.array(require_dist.string()),
	prompt: require_dist.string().nullable(),
	agentsStates: require_dist.record(require_dist.string(), require_dist.unknown())
}).passthrough();
var webSearchItemSchema = require_dist.object({
	type: require_dist.literal("webSearch"),
	id: require_dist.string(),
	query: require_dist.string(),
	action: require_dist.unknown().nullable()
}).passthrough();
var imageViewItemSchema = require_dist.object({
	type: require_dist.literal("imageView"),
	id: require_dist.string(),
	path: require_dist.string()
}).passthrough();
var enteredReviewModeItemSchema = require_dist.object({
	type: require_dist.literal("enteredReviewMode"),
	id: require_dist.string(),
	review: require_dist.string()
}).passthrough();
var exitedReviewModeItemSchema = require_dist.object({
	type: require_dist.literal("exitedReviewMode"),
	id: require_dist.string(),
	review: require_dist.string()
}).passthrough();
var contextCompactionItemSchema = require_dist.object({
	type: require_dist.literal("contextCompaction"),
	id: require_dist.string()
}).passthrough();
var hookPromptItemSchema = require_dist.object({
	type: require_dist.literal("hookPrompt"),
	id: require_dist.string(),
	fragments: require_dist.array(require_dist.unknown())
}).passthrough();
var dynamicToolCallItemSchema = require_dist.object({
	type: require_dist.literal("dynamicToolCall"),
	id: require_dist.string(),
	namespace: require_dist.string().nullable(),
	tool: require_dist.string(),
	arguments: require_dist.unknown(),
	status: require_dist.string(),
	contentItems: require_dist.array(require_dist.unknown()).nullable(),
	success: require_dist.boolean().nullable(),
	durationMs: require_dist.number().nullable()
}).passthrough();
var subAgentActivityItemSchema = require_dist.object({
	type: require_dist.literal("subAgentActivity"),
	id: require_dist.string(),
	kind: require_dist.string(),
	agentThreadId: require_dist.string(),
	agentPath: require_dist.string()
}).passthrough();
var sleepItemSchema = require_dist.object({
	type: require_dist.literal("sleep"),
	id: require_dist.string(),
	durationMs: require_dist.number()
}).passthrough();
var imageGenerationItemSchema = require_dist.object({
	type: require_dist.literal("imageGeneration"),
	id: require_dist.string(),
	status: require_dist.string(),
	revisedPrompt: require_dist.string().nullable(),
	result: require_dist.string(),
	savedPath: require_dist.string().optional()
}).passthrough();
var unknownThreadItemSchema = require_dist.object({ type: require_dist.string() }).passthrough();
var threadItemSchema = require_dist.discriminatedUnion("type", [
	userMessageItemSchema,
	agentMessageItemSchema,
	planItemSchema,
	reasoningItemSchema,
	commandExecutionItemSchema,
	fileChangeItemSchema,
	mcpToolCallItemSchema,
	dynamicToolCallItemSchema,
	collabAgentToolCallItemSchema,
	hookPromptItemSchema,
	subAgentActivityItemSchema,
	sleepItemSchema,
	imageGenerationItemSchema,
	webSearchItemSchema,
	imageViewItemSchema,
	enteredReviewModeItemSchema,
	exitedReviewModeItemSchema,
	contextCompactionItemSchema
]).or(unknownThreadItemSchema);
var codexHttpStatusCodeSchema = require_dist.object({ httpStatusCode: require_dist.number().nullable() }).passthrough();
var codexErrorInfoSchema = require_dist.union([
	require_dist._enum([
		"contextWindowExceeded",
		"usageLimitExceeded",
		"rateLimitExceeded",
		"sessionBudgetExceeded",
		"misalignmentPolicyViolation",
		"serverOverloaded",
		"cyberPolicy",
		"internalServerError",
		"unauthorized",
		"badRequest",
		"threadRollbackFailed",
		"sandboxError",
		"other"
	]),
	require_dist.object({ httpConnectionFailed: codexHttpStatusCodeSchema }).passthrough(),
	require_dist.object({ responseStreamConnectionFailed: codexHttpStatusCodeSchema }).passthrough(),
	require_dist.object({ responseStreamDisconnected: codexHttpStatusCodeSchema }).passthrough(),
	require_dist.object({ responseTooManyFailedAttempts: codexHttpStatusCodeSchema }).passthrough(),
	require_dist.object({ activeTurnNotSteerable: require_dist.object({ turnKind: require_dist.string() }).passthrough() }).passthrough(),
	require_dist.string(),
	require_dist.record(require_dist.string(), require_dist.unknown())
]);
var turnSchema = require_dist.object({
	id: require_dist.string(),
	items: require_dist.array(threadItemSchema),
	status: require_dist.string(),
	error: require_dist.object({
		message: require_dist.string(),
		codexErrorInfo: codexErrorInfoSchema.nullish(),
		additionalDetails: require_dist.string().nullish()
	}).nullish()
}).passthrough();
var threadStartedNotificationSchema = require_dist.object({ thread: require_dist.object({ id: require_dist.string() }).passthrough() }).passthrough();
var turnStartedNotificationSchema = require_dist.object({
	threadId: require_dist.string(),
	turn: turnSchema
}).passthrough();
var turnCompletedNotificationSchema = require_dist.object({
	threadId: require_dist.string(),
	turn: turnSchema
}).passthrough();
var itemStartedNotificationSchema = require_dist.object({
	item: threadItemSchema,
	threadId: require_dist.string(),
	turnId: require_dist.string()
}).passthrough();
var itemCompletedNotificationSchema = require_dist.object({
	item: threadItemSchema,
	threadId: require_dist.string(),
	turnId: require_dist.string()
}).passthrough();
var agentMessageDeltaNotificationSchema = require_dist.object({
	threadId: require_dist.string(),
	turnId: require_dist.string(),
	itemId: require_dist.string(),
	delta: require_dist.string()
}).passthrough();
var reasoningTextDeltaNotificationSchema = require_dist.object({
	threadId: require_dist.string(),
	turnId: require_dist.string(),
	itemId: require_dist.string(),
	delta: require_dist.string()
}).passthrough();
var reasoningSummaryTextDeltaNotificationSchema = require_dist.object({
	threadId: require_dist.string(),
	turnId: require_dist.string(),
	itemId: require_dist.string(),
	delta: require_dist.string()
}).passthrough();
var commandExecutionOutputDeltaNotificationSchema = require_dist.object({
	threadId: require_dist.string(),
	turnId: require_dist.string(),
	itemId: require_dist.string(),
	delta: require_dist.string()
}).passthrough();
var fileChangeOutputDeltaNotificationSchema = require_dist.object({
	threadId: require_dist.string(),
	turnId: require_dist.string(),
	itemId: require_dist.string(),
	delta: require_dist.string()
}).passthrough();
var tokenUsageBreakdownSchema = require_dist.object({
	totalTokens: require_dist.number(),
	inputTokens: require_dist.number(),
	cachedInputTokens: require_dist.number(),
	cacheWriteInputTokens: require_dist.number().optional(),
	outputTokens: require_dist.number(),
	reasoningOutputTokens: require_dist.number()
}).passthrough();
var threadTokenUsageUpdatedNotificationSchema = require_dist.object({
	threadId: require_dist.string(),
	turnId: require_dist.string(),
	tokenUsage: require_dist.object({
		total: tokenUsageBreakdownSchema,
		last: tokenUsageBreakdownSchema,
		modelContextWindow: require_dist.number().nullable()
	}).passthrough()
}).passthrough();
var errorNotificationSchema = require_dist.object({
	error: require_dist.object({
		message: require_dist.string(),
		codexErrorInfo: codexErrorInfoSchema.nullable(),
		additionalDetails: require_dist.string().nullable()
	}).passthrough(),
	willRetry: require_dist.boolean(),
	threadId: require_dist.string(),
	turnId: require_dist.string()
}).passthrough();
var commandExecutionRequestApprovalParamsSchema = require_dist.object({
	threadId: require_dist.string(),
	turnId: require_dist.string(),
	itemId: require_dist.string(),
	approvalId: require_dist.string().nullable().optional(),
	reason: require_dist.string().nullable().optional(),
	networkApprovalContext: require_dist.unknown().nullable().optional(),
	command: require_dist.string().nullable().optional(),
	cwd: require_dist.string().nullable().optional(),
	commandActions: require_dist.array(require_dist.unknown()).nullable().optional(),
	proposedExecpolicyAmendment: require_dist.unknown().nullable().optional()
}).passthrough();
var fileChangeRequestApprovalParamsSchema = require_dist.object({
	threadId: require_dist.string(),
	turnId: require_dist.string(),
	itemId: require_dist.string(),
	reason: require_dist.string().nullable().optional(),
	grantRoot: require_dist.string().nullable().optional()
}).passthrough();
var toolRequestUserInputParamsSchema = require_dist.object({
	threadId: require_dist.string(),
	turnId: require_dist.string(),
	itemId: require_dist.string(),
	questions: require_dist.array(require_dist.unknown())
}).passthrough();
var skillRequestApprovalParamsSchema = require_dist.object({
	itemId: require_dist.string(),
	skillName: require_dist.string()
}).passthrough();
var mcpServerElicitationRequestParamsSchema = require_dist.object({
	threadId: require_dist.string(),
	turnId: require_dist.string().nullable().optional(),
	serverName: require_dist.string(),
	mode: require_dist.string().optional(),
	message: require_dist.string().optional(),
	requestedSchema: require_dist.unknown().optional(),
	url: require_dist.string().optional(),
	elicitationId: require_dist.string().optional(),
	_meta: require_dist.record(require_dist.string(), require_dist.unknown()).nullable().optional()
}).passthrough();
var dynamicToolCallParamsSchema = require_dist.object({
	threadId: require_dist.string(),
	turnId: require_dist.string(),
	callId: require_dist.string(),
	tool: require_dist.string(),
	arguments: require_dist.unknown()
}).passthrough();
var chatgptAuthTokensRefreshParamsSchema = require_dist.object({
	reason: require_dist.string(),
	previousAccountId: require_dist.string().nullable().optional()
}).passthrough();
var serverRequestParamSchemas = {
	"item/commandExecution/requestApproval": commandExecutionRequestApprovalParamsSchema,
	"item/fileChange/requestApproval": fileChangeRequestApprovalParamsSchema,
	"item/tool/requestUserInput": toolRequestUserInputParamsSchema,
	"mcpServer/elicitation/request": mcpServerElicitationRequestParamsSchema,
	"skill/requestApproval": skillRequestApprovalParamsSchema,
	"item/tool/call": dynamicToolCallParamsSchema,
	"account/chatgptAuthTokens/refresh": chatgptAuthTokensRefreshParamsSchema
};
require_dist._enum(Object.keys(serverRequestParamSchemas));
var serverRequestSchema = require_dist.discriminatedUnion("method", [
	require_dist.object({
		id: jsonRpcIdSchema,
		method: require_dist.literal("item/commandExecution/requestApproval"),
		params: commandExecutionRequestApprovalParamsSchema
	}).passthrough(),
	require_dist.object({
		id: jsonRpcIdSchema,
		method: require_dist.literal("item/fileChange/requestApproval"),
		params: fileChangeRequestApprovalParamsSchema
	}).passthrough(),
	require_dist.object({
		id: jsonRpcIdSchema,
		method: require_dist.literal("item/tool/requestUserInput"),
		params: toolRequestUserInputParamsSchema
	}).passthrough(),
	require_dist.object({
		id: jsonRpcIdSchema,
		method: require_dist.literal("mcpServer/elicitation/request"),
		params: mcpServerElicitationRequestParamsSchema
	}).passthrough(),
	require_dist.object({
		id: jsonRpcIdSchema,
		method: require_dist.literal("skill/requestApproval"),
		params: skillRequestApprovalParamsSchema
	}).passthrough(),
	require_dist.object({
		id: jsonRpcIdSchema,
		method: require_dist.literal("item/tool/call"),
		params: dynamicToolCallParamsSchema
	}).passthrough(),
	require_dist.object({
		id: jsonRpcIdSchema,
		method: require_dist.literal("account/chatgptAuthTokens/refresh"),
		params: chatgptAuthTokensRefreshParamsSchema
	}).passthrough()
]);
var incomingNotificationSchemas = {
	"thread/started": threadStartedNotificationSchema,
	"turn/started": turnStartedNotificationSchema,
	"turn/completed": turnCompletedNotificationSchema,
	"item/started": itemStartedNotificationSchema,
	"item/completed": itemCompletedNotificationSchema,
	"item/agentMessage/delta": agentMessageDeltaNotificationSchema,
	reasoningTextDelta: reasoningTextDeltaNotificationSchema,
	reasoningSummaryTextDelta: reasoningSummaryTextDeltaNotificationSchema,
	"item/reasoning/textDelta": reasoningTextDeltaNotificationSchema,
	"item/reasoning/summaryTextDelta": reasoningSummaryTextDeltaNotificationSchema,
	"item/commandExecution/outputDelta": commandExecutionOutputDeltaNotificationSchema,
	"item/fileChange/outputDelta": fileChangeOutputDeltaNotificationSchema,
	"thread/tokenUsage/updated": threadTokenUsageUpdatedNotificationSchema,
	error: errorNotificationSchema
};
var DEFAULT_REQUEST_TIMEOUT_MS = 3e4;
var MAX_COMPLETED_TURN_IDS = 1024;
var MAX_TOKEN_USAGE_THREADS = 256;
var MAX_TOKEN_USAGE_TURNS_PER_THREAD = 4;
var DEFAULT_MIN_CODEX_VERSION = "0.156.0";
function resolveCodexPath2(explicitPath) {
	if (explicitPath) {
		const lower = explicitPath.toLowerCase();
		if (lower.endsWith(".js") || lower.endsWith(".mjs") || lower.endsWith(".cjs")) return {
			cmd: "node",
			args: [explicitPath]
		};
		return {
			cmd: explicitPath,
			args: []
		};
	}
	try {
		const pkgPath = (0, module$1.createRequire)(require("url").pathToFileURL(__filename).href).resolve("@openai/codex/package.json");
		const root = path.default.dirname(pkgPath);
		return {
			cmd: "node",
			args: [path.default.join(root, "bin", "codex.js")]
		};
	} catch {
		return {
			cmd: "codex",
			args: []
		};
	}
}
function parseVersionFromUserAgent(userAgent) {
	return userAgent.match(/(\d+\.\d+\.\d+(?:-[A-Za-z0-9.-]+)?)/)?.[1];
}
function parseSemver(input) {
	const match = input.match(/^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?$/);
	if (!match) return void 0;
	return {
		major: Number(match[1]),
		minor: Number(match[2]),
		patch: Number(match[3]),
		prerelease: match[4] ? match[4].split(".") : []
	};
}
function compareIdentifiers(a, b) {
	const aNum = /^\d+$/.test(a);
	const bNum = /^\d+$/.test(b);
	if (aNum && bNum) {
		const av = Number(a);
		const bv = Number(b);
		if (av > bv) return 1;
		if (av < bv) return -1;
		return 0;
	}
	if (aNum && !bNum) return -1;
	if (!aNum && bNum) return 1;
	return a.localeCompare(b);
}
function compareSemver(a, b) {
	const left = parseSemver(a);
	const right = parseSemver(b);
	if (!left || !right) return void 0;
	if (left.major !== right.major) return left.major > right.major ? 1 : -1;
	if (left.minor !== right.minor) return left.minor > right.minor ? 1 : -1;
	if (left.patch !== right.patch) return left.patch > right.patch ? 1 : -1;
	const aPre = left.prerelease;
	const bPre = right.prerelease;
	if (aPre.length === 0 && bPre.length === 0) return 0;
	if (aPre.length === 0) return 1;
	if (bPre.length === 0) return -1;
	const maxLen = Math.max(aPre.length, bPre.length);
	for (let i = 0; i < maxLen; i++) {
		const av = aPre[i];
		const bv = bPre[i];
		if (av === void 0) return -1;
		if (bv === void 0) return 1;
		const cmp = compareIdentifiers(av, bv);
		if (cmp !== 0) return cmp;
	}
	return 0;
}
var JsonRpcRequestError = class extends Error {
	code;
	constructor(code, message) {
		super(`JSON-RPC error ${code}: ${message}`);
		this.name = "JsonRpcRequestError";
		this.code = code;
	}
};
var AppServerRpcClient = class extends events.EventEmitter {
	settings;
	logger;
	requestTimeoutMs;
	clientVersion;
	child;
	stdoutReader;
	state = "idle";
	initPromise;
	nextId = 1;
	nextRequestContextId = 1;
	pending = /* @__PURE__ */ new Map();
	threadLocks = /* @__PURE__ */ new Map();
	pendingRequestContexts = /* @__PURE__ */ new Map();
	pendingRequestContextIdsByThread = /* @__PURE__ */ new Map();
	activeRequestContextsByTurn = /* @__PURE__ */ new Map();
	completedTurnIds = /* @__PURE__ */ new Set();
	/**
	* Latest cumulative `tokenUsage.total` per thread, keyed by the turn that
	* reported it (most recent last). Lets a turn measure its own usage against
	* the snapshot that preceded it, including the restored snapshot Codex
	* replays when a thread is resumed.
	*/
	tokenUsageTotalsByThread = /* @__PURE__ */ new Map();
	lastStderr = "";
	lastCrashHadStderr = false;
	idleTimer;
	serverCapabilities;
	expectedExitSignal;
	writeQueue = Promise.resolve();
	serverVersion;
	constructor(options = {}) {
		super();
		this.settings = options.settings ?? {};
		this.logger = getLogger(options.logger ?? this.settings.logger);
		this.requestTimeoutMs = options.requestTimeoutMs ?? this.settings.requestTimeoutMs ?? DEFAULT_REQUEST_TIMEOUT_MS;
		this.clientVersion = options.clientVersion ?? "0.0.0";
	}
	async ensureReady() {
		if (this.state === "ready") return;
		if (this.state === "closed") throw new Error("AppServerRpcClient is closed");
		if (this.initPromise) {
			await this.initPromise;
			return;
		}
		const shouldEmitReconnected = this.state === "error";
		this.state = "starting";
		this.initPromise = this.startAndInitialize().then(() => {
			this.state = "ready";
			if (shouldEmitReconnected) this.emit("reconnected");
		}).catch((error) => {
			this.cleanupAfterInitializationFailure(error);
			throw error;
		}).finally(() => {
			this.initPromise = void 0;
		});
		await this.initPromise;
		this.touchActivity();
	}
	async request(method, params, timeoutMs) {
		await this.ensureReady();
		this.touchActivity();
		return await this.requestInternal(method, params, timeoutMs);
	}
	async requestInternal(method, params, timeoutMs) {
		const id = this.nextId++;
		const request = {
			id,
			method,
			...params ? { params } : {}
		};
		return await new Promise((resolve, reject) => {
			const timer = setTimeout(() => {
				this.pending.delete(id);
				reject(/* @__PURE__ */ new Error(`Request timed out for method '${method}'`));
			}, timeoutMs ?? this.requestTimeoutMs);
			this.pending.set(id, {
				resolve: (value) => resolve(value),
				reject,
				timer
			});
			this.writeMessage(request).catch((error) => {
				const pending = this.pending.get(id);
				if (!pending) return;
				clearTimeout(pending.timer);
				this.pending.delete(id);
				pending.reject(error);
			});
		});
	}
	notify(method, params) {
		if (this.state !== "ready") throw new Error(`Cannot send notification '${method}' while client is not ready`);
		this.writeMessage({
			method,
			...params ? { params } : {}
		}).catch((error) => {
			this.logger.warn(`[codex-app-server] Failed to send notification '${method}': ${String(error)}`);
		});
	}
	async threadStart(params) {
		return await this.request("thread/start", params);
	}
	async threadResume(params) {
		return await this.request("thread/resume", params);
	}
	async turnStart(params) {
		return await this.request("turn/start", params);
	}
	async turnInterrupt(params) {
		return await this.request("turn/interrupt", params);
	}
	async modelList(params) {
		await this.ensureReady();
		this.touchActivity();
		if (this.serverCapabilities?.modelList === false) throw new UnsupportedFeatureError({
			feature: "model/list",
			minCodexVersion: this.settings.minCodexVersion ?? "0.156.0",
			serverVersion: this.serverVersion
		});
		try {
			return await this.requestInternal("model/list", params);
		} catch (error) {
			if (error instanceof JsonRpcRequestError && error.code === -32601) throw new UnsupportedFeatureError({
				feature: "model/list",
				minCodexVersion: this.settings.minCodexVersion ?? "0.156.0",
				serverVersion: this.serverVersion
			});
			throw error;
		}
	}
	registerRequestContext(threadId, context) {
		const contextId = `ctx_${this.nextRequestContextId++}`;
		this.pendingRequestContexts.set(contextId, {
			threadId,
			context: {
				handlers: context.handlers,
				autoApprove: context.autoApprove
			}
		});
		const ids = this.pendingRequestContextIdsByThread.get(threadId) ?? /* @__PURE__ */ new Set();
		ids.add(contextId);
		this.pendingRequestContextIdsByThread.set(threadId, ids);
		return contextId;
	}
	bindRequestContext(contextId, turnId) {
		const pending = this.pendingRequestContexts.get(contextId);
		if (!pending) return;
		if (this.completedTurnIds.has(turnId)) {
			this.clearRequestContext(contextId);
			return;
		}
		this.activeRequestContextsByTurn.set(turnId, {
			handlers: pending.context.handlers,
			autoApprove: pending.context.autoApprove
		});
		this.clearRequestContext(contextId);
	}
	clearRequestContext(contextId) {
		const pending = this.pendingRequestContexts.get(contextId);
		if (!pending) return;
		this.pendingRequestContexts.delete(contextId);
		const ids = this.pendingRequestContextIdsByThread.get(pending.threadId);
		if (!ids) return;
		ids.delete(contextId);
		if (ids.size === 0) this.pendingRequestContextIdsByThread.delete(pending.threadId);
	}
	clearRequestContextForTurn(turnId) {
		this.activeRequestContextsByTurn.delete(turnId);
	}
	hasTurnCompleted(turnId) {
		return this.completedTurnIds.has(turnId);
	}
	async withThreadLock(threadId, fn) {
		const previous = this.threadLocks.get(threadId) ?? Promise.resolve();
		let release;
		const current = new Promise((resolve) => {
			release = resolve;
		});
		const chained = previous.then(() => current);
		this.threadLocks.set(threadId, chained);
		await previous;
		try {
			return await fn();
		} finally {
			release?.();
			if (this.threadLocks.get(threadId) === chained) this.threadLocks.delete(threadId);
		}
	}
	async close() {
		this.state = "closed";
		this.clearIdleTimer();
		this.stdoutReader?.close();
		this.stdoutReader = void 0;
		for (const [id, pending] of this.pending.entries()) {
			clearTimeout(pending.timer);
			pending.reject(/* @__PURE__ */ new Error(`Client closed while request ${String(id)} was in flight`));
		}
		this.pending.clear();
		this.threadLocks.clear();
		this.pendingRequestContexts.clear();
		this.pendingRequestContextIdsByThread.clear();
		this.activeRequestContextsByTurn.clear();
		this.completedTurnIds.clear();
		this.tokenUsageTotalsByThread.clear();
		this.serverCapabilities = void 0;
		if (this.child) {
			this.expectedExitSignal = "SIGTERM";
			this.child.kill("SIGTERM");
			this.child = void 0;
		}
		this.writeQueue = Promise.resolve();
	}
	async dispose() {
		await this.close();
	}
	async startAndInitialize() {
		const base = resolveCodexPath2(this.settings.codexPath);
		const args = [
			...base.args,
			"app-server",
			"--listen",
			"stdio://"
		];
		this.lastStderr = "";
		this.lastCrashHadStderr = false;
		this.expectedExitSignal = void 0;
		this.child = (0, child_process.spawn)(base.cmd, args, {
			stdio: [
				"pipe",
				"pipe",
				"pipe"
			],
			env: {
				...process.env,
				...this.settings.env ?? {},
				RUST_LOG: process.env.RUST_LOG || "error"
			},
			cwd: this.settings.cwd
		});
		const child = this.child;
		let stderrBuf = "";
		child.stderr.setEncoding("utf8");
		child.stderr.on("data", (chunk) => {
			stderrBuf = (stderrBuf + String(chunk)).slice(-4e3);
			if (this.child === child) this.lastStderr = stderrBuf;
		});
		child.on("error", (error) => {
			this.logger.error(`[codex-app-server] process error: ${String(error)}`);
			const base2 = String(error);
			const message = this.withStderrTail(base2, stderrBuf);
			this.lastCrashHadStderr = message !== base2;
			this.handleCrash(new Error(message));
		});
		child.on("exit", (code, signal) => {
			const message = `codex app-server exited (code=${String(code)}, signal=${String(signal)})`;
			const expected = this.state === "closed" || signal !== null && signal === this.expectedExitSignal;
			this.expectedExitSignal = void 0;
			if (expected) {
				this.logger.info(`[codex-app-server] ${message}`);
				return;
			}
			const crashedPending = this.markCrashed();
			if (!crashedPending) return;
			let settled = false;
			const finish = () => {
				if (settled) return;
				settled = true;
				child.off("close", finish);
				clearTimeout(timer);
				const base2 = `codex app-server exited (code=${String(code)}, signal=${String(signal)})`;
				const crashMessage = this.withStderrTail(base2, stderrBuf);
				if (this.child === void 0) {
					this.lastStderr = stderrBuf;
					this.lastCrashHadStderr = crashMessage !== base2;
				}
				this.logger.warn(`[codex-app-server] ${crashMessage}`);
				this.rejectCrashedPending(crashedPending, new Error(crashMessage));
			};
			child.once("close", finish);
			const timer = setTimeout(finish, 120);
			timer.unref?.();
		});
		this.stdoutReader = readline.default.createInterface({
			input: child.stdout,
			crlfDelay: Infinity
		});
		this.stdoutReader.on("line", (line) => this.handleLine(line));
		const initializeParams = {
			clientInfo: {
				name: "ai-sdk-provider-codex-cli",
				version: this.clientVersion
			},
			capabilities: {
				experimentalApi: true,
				optOutNotificationMethods: null
			}
		};
		let initializeResult;
		try {
			initializeResult = await this.requestInternal("initialize", initializeParams, this.settings.connectionTimeoutMs ?? this.requestTimeoutMs);
		} catch (error) {
			const raw = String(error?.message ?? error);
			if (raw.includes("unknown subcommand") || this.lastStderr.includes("unknown subcommand")) throw new Error(this.withStderrTail(`codex app-server requires codex CLI >= ${this.settings.minCodexVersion ?? "0.156.0"}. Run 'codex --version' to check.`));
			if (raw.includes("ENOENT") || this.lastStderr.includes("ENOENT")) throw new Error(this.withStderrTail("codex app-server failed to start: codex executable not found (ENOENT). Check that the codex CLI is installed and its native binary is intact — a corrupted @openai/codex npm install can cause this. Run 'codex --version' to verify."));
			throw createAPICallError({
				message: `Failed to initialize codex app-server: ${this.lastCrashHadStderr ? raw : this.withStderrTail(raw)}`,
				stderr: this.lastStderr,
				provider: "app-server"
			});
		}
		await this.writeMessage({ method: "initialized" });
		this.checkVersion(initializeResult.userAgent);
		this.serverCapabilities = initializeResult.capabilities ?? null;
	}
	checkVersion(userAgent) {
		const detected = parseVersionFromUserAgent(userAgent);
		if (!detected) {
			this.logger.warn(`[codex-app-server] Could not parse server version from userAgent: ${userAgent}`);
			return;
		}
		this.serverVersion = detected;
		const minVersion = this.settings.minCodexVersion ?? "0.156.0";
		const compared = compareSemver(detected, minVersion);
		if (compared === void 0) {
			this.logger.warn(`[codex-app-server] Could not semver-compare '${detected}' against '${minVersion}'.`);
			return;
		}
		if (compared < 0) throw new Error(`codex app-server version '${detected}' is below required minimum '${minVersion}'.`);
	}
	cleanupAfterInitializationFailure(error) {
		if (this.state === "closed") return;
		this.state = "error";
		this.clearIdleTimer();
		this.stdoutReader?.close();
		this.stdoutReader = void 0;
		for (const [id, pending] of this.pending.entries()) {
			clearTimeout(pending.timer);
			pending.reject(/* @__PURE__ */ new Error(`Request ${String(id)} failed during app-server initialization: ${String(error)}`));
		}
		this.pending.clear();
		this.threadLocks.clear();
		this.pendingRequestContexts.clear();
		this.pendingRequestContextIdsByThread.clear();
		this.activeRequestContextsByTurn.clear();
		this.completedTurnIds.clear();
		this.serverCapabilities = void 0;
		if (this.child) {
			this.expectedExitSignal = "SIGTERM";
			this.child.kill("SIGTERM");
			this.child = void 0;
		}
		this.writeQueue = Promise.resolve();
	}
	markCrashed() {
		if (this.state === "closed" || this.state === "error") return void 0;
		this.state = "error";
		this.clearIdleTimer();
		this.stdoutReader?.close();
		this.stdoutReader = void 0;
		if (this.child) {
			this.expectedExitSignal = "SIGTERM";
			this.child.kill("SIGTERM");
			this.child = void 0;
		}
		const pending = new Map(this.pending);
		for (const [, entry] of pending) clearTimeout(entry.timer);
		this.pending.clear();
		this.threadLocks.clear();
		this.pendingRequestContexts.clear();
		this.pendingRequestContextIdsByThread.clear();
		this.activeRequestContextsByTurn.clear();
		this.completedTurnIds.clear();
		this.serverCapabilities = void 0;
		this.writeQueue = Promise.resolve();
		return pending;
	}
	rejectCrashedPending(pending, error) {
		for (const [id, entry] of pending) entry.reject(/* @__PURE__ */ new Error(`Request ${String(id)} failed after app-server crash: ${String(error)}`));
	}
	handleCrash(error) {
		const pending = this.markCrashed();
		if (!pending) return;
		this.rejectCrashedPending(pending, error);
	}
	stderrExcerpt(raw) {
		if (!raw) return "";
		const escape = String.fromCharCode(27);
		const ansiEscapeSequence = new RegExp(`${escape}(?:\\[[0-?]*[ -/]*[@-~]|\\][^\\u0007]*(?:\\u0007|${escape}\\\\))`, "g");
		const withoutAnsi = raw.replace(ansiEscapeSequence, "");
		const excerpt = Array.from(withoutAnsi).filter((character) => {
			const code = character.charCodeAt(0);
			return character === "\n" || code >= 32 && (code < 127 || code > 159);
		}).join("").split(/\r?\n/).map((line) => line.trim()).filter(Boolean).slice(-5).join("; ");
		if (excerpt.length > 600) return `\u2026${excerpt.slice(-600)}`;
		return excerpt;
	}
	withStderrTail(message, raw = this.lastStderr) {
		const excerpt = this.stderrExcerpt(raw);
		return excerpt ? `${message} | stderr (tail): ${excerpt}` : message;
	}
	handleLine(line) {
		const trimmed = line.trim();
		if (!trimmed) return;
		this.touchActivity();
		let parsed;
		try {
			parsed = JSON.parse(trimmed);
		} catch {
			this.logger.warn(`[codex-app-server] Ignoring non-JSON line: ${trimmed.slice(0, 200)}`);
			return;
		}
		const response = jsonRpcResponseSchema.safeParse(parsed);
		if (response.success) {
			this.handleResponse(response.data);
			return;
		}
		const errorResponse = jsonRpcErrorResponseSchema.safeParse(parsed);
		if (errorResponse.success) {
			this.handleErrorResponse(errorResponse.data.id, errorResponse.data.error);
			return;
		}
		const request = jsonRpcRequestSchema.safeParse(parsed);
		if (request.success) {
			const data = request.data;
			this.handleServerRequest(data.id, data.method, data.params ?? {}).catch((error) => {
				this.logger.warn(`[codex-app-server] Failed to handle server request '${data.method}': ${String(error)}`);
			});
			return;
		}
		const notification = jsonRpcNotificationSchema.safeParse(parsed);
		if (notification.success) {
			const data = notification.data;
			const schema = incomingNotificationSchemas[data.method];
			if (schema) {
				if (!schema.safeParse(data.params ?? {}).success) {
					this.logger.warn(`[codex-app-server] Notification '${data.method}' failed schema validation; dropping.`);
					return;
				}
			}
			if (data.method === "turn/completed") {
				const params = data.params;
				const turnId = typeof params?.turn?.id === "string" ? params.turn.id : void 0;
				if (turnId) {
					this.clearRequestContextForTurn(turnId);
					this.rememberCompletedTurn(turnId);
				}
			}
			if (data.method === "thread/tokenUsage/updated") this.recordThreadTokenUsage(data.params);
			this.emit("notification", data.method, data.params ?? {});
			return;
		}
		this.logger.warn("[codex-app-server] Received unrecognized JSON-RPC message");
	}
	handleResponse(response) {
		this.touchActivity();
		const pending = this.pending.get(response.id);
		if (!pending) return;
		clearTimeout(pending.timer);
		this.pending.delete(response.id);
		pending.resolve(response.result);
	}
	handleErrorResponse(id, error) {
		this.touchActivity();
		if (id === null) {
			this.logger.error(`[codex-app-server] JSON-RPC error: ${error.message}`);
			return;
		}
		const pending = this.pending.get(id);
		if (!pending) return;
		clearTimeout(pending.timer);
		this.pending.delete(id);
		pending.reject(new JsonRpcRequestError(error.code, error.message));
	}
	getThreadIdFromServerRequest(params) {
		return typeof params.threadId === "string" ? params.threadId : void 0;
	}
	getTurnIdFromServerRequest(params) {
		return typeof params.turnId === "string" ? params.turnId : void 0;
	}
	getPendingContextsForThread(threadId) {
		const ids = this.pendingRequestContextIdsByThread.get(threadId);
		if (!ids || ids.size === 0) return [];
		const contexts = [];
		for (const id of ids) {
			const pending = this.pendingRequestContexts.get(id);
			if (pending) contexts.push(pending.context);
		}
		return contexts;
	}
	getContextForRequest(params) {
		const turnId = this.getTurnIdFromServerRequest(params);
		if (turnId) {
			const active = this.activeRequestContextsByTurn.get(turnId);
			if (active) return active;
		}
		const threadId = this.getThreadIdFromServerRequest(params);
		if (threadId) {
			const pending = this.getPendingContextsForThread(threadId);
			if (pending.length === 1) return pending[0];
			if (pending.length > 1) this.logger.debug(`[codex-app-server] Received server request for thread '${threadId}' before turn binding with multiple pending contexts; using settings-level handlers.`);
			return;
		}
		const totalActive = this.activeRequestContextsByTurn.size;
		const totalPending = this.pendingRequestContexts.size;
		if (totalActive + totalPending === 1) {
			if (totalActive === 1) return this.activeRequestContextsByTurn.values().next().value;
			return this.pendingRequestContexts.values().next().value?.context;
		}
		if (totalActive + totalPending > 1) this.logger.debug("[codex-app-server] Received threadless server request while multiple request contexts are active; using settings-level handlers.");
	}
	async handleServerRequest(id, method, params) {
		const parsed = serverRequestSchema.safeParse({
			id,
			method,
			params
		});
		const normalized = parsed.success ? parsed.data : {
			id,
			method,
			params
		};
		const sendResult = async (result) => {
			try {
				await this.writeMessage({
					id: normalized.id,
					result
				});
			} catch (error) {
				this.logger.warn(`[codex-app-server] Failed to send server request result for '${normalized.method}': ${String(error)}`);
			}
		};
		const sendError = async (code, message) => {
			try {
				await this.writeMessage({
					id: normalized.id,
					error: {
						code,
						message
					}
				});
			} catch (error) {
				this.logger.warn(`[codex-app-server] Failed to send server request error for '${normalized.method}': ${String(error)}`);
			}
		};
		const activeContext = this.getContextForRequest(normalized.params);
		const handlers = activeContext?.handlers ?? this.settings.serverRequests ?? {};
		const autoApprove = activeContext?.autoApprove ?? this.settings.autoApprove ?? false;
		this.emit("server-request", normalized.method, normalized.params, normalized.id);
		const runHandler = async (handlerCall) => {
			if (!handlerCall) return void 0;
			try {
				const pending = handlerCall();
				if (!pending) return void 0;
				return await pending;
			} catch (error) {
				this.logger.warn(`[codex-app-server] request handler failed for '${normalized.method}': ${String(error)}`);
				return;
			}
		};
		switch (normalized.method) {
			case "item/commandExecution/requestApproval": {
				const handled = await runHandler(() => handlers.onCommandExecutionApproval?.(normalized));
				if (handled !== void 0) {
					await sendResult(handled);
					return;
				}
				await sendResult({ decision: autoApprove ? "accept" : "decline" });
				return;
			}
			case "item/fileChange/requestApproval": {
				const handled = await runHandler(() => handlers.onFileChangeApproval?.(normalized));
				if (handled !== void 0) {
					await sendResult(handled);
					return;
				}
				await sendResult({ decision: autoApprove ? "accept" : "decline" });
				return;
			}
			case "skill/requestApproval": {
				const handled = await runHandler(() => handlers.onSkillApproval?.(normalized));
				if (handled !== void 0) {
					await sendResult(handled);
					return;
				}
				await sendResult({ decision: autoApprove ? "approve" : "decline" });
				return;
			}
			case "mcpServer/elicitation/request": {
				const handled = await runHandler(() => handlers.onMcpElicitation?.(normalized));
				if (handled !== void 0) {
					await sendResult(handled);
					return;
				}
				const fallback = await runHandler(() => handlers.onUnhandled?.(normalized));
				if (fallback !== void 0) {
					await sendResult(fallback);
					return;
				}
				if (normalized.params._meta?.codex_approval_kind === "mcp_tool_call" && autoApprove) await sendResult({
					action: "accept",
					content: {}
				});
				else await sendResult({
					action: "decline",
					content: null
				});
				return;
			}
			case "item/tool/requestUserInput": {
				const handled = await runHandler(() => handlers.onToolRequestUserInput?.(normalized));
				if (handled !== void 0) {
					await sendResult(handled);
					return;
				}
				await sendResult({ answers: {} });
				return;
			}
			case "item/tool/call": {
				const handled = await runHandler(() => handlers.onDynamicToolCall?.(normalized));
				if (handled !== void 0) {
					await sendResult(handled);
					return;
				}
				await sendResult({
					contentItems: [],
					success: false
				});
				return;
			}
			case "account/chatgptAuthTokens/refresh": {
				const handled = await runHandler(() => handlers.onAuthRefresh?.(normalized));
				if (handled !== void 0) {
					await sendResult(handled);
					return;
				}
				await sendError(-32603, "Auth token refresh not supported by this client");
				return;
			}
			default:
				{
					const handled = await runHandler(() => handlers.onUnhandled?.(normalized));
					if (handled !== void 0) {
						await sendResult(handled);
						return;
					}
				}
				await sendError(-32601, "Method not supported");
		}
	}
	async writeMessage(message) {
		const payload = `${JSON.stringify(message)}
`;
		const writeOperation = async () => {
			if (!this.child?.stdin.writable) throw new Error("codex app-server stdin is not writable");
			const stdin = this.child.stdin;
			if (!stdin.write(payload)) await new Promise((resolve, reject) => {
				const onDrain = () => {
					cleanup();
					resolve();
				};
				const onError = (error) => {
					cleanup();
					reject(error);
				};
				const onClose = () => {
					cleanup();
					reject(/* @__PURE__ */ new Error("codex app-server stdin closed before drain"));
				};
				const cleanup = () => {
					stdin.off("drain", onDrain);
					stdin.off("error", onError);
					stdin.off("close", onClose);
				};
				stdin.once("drain", onDrain);
				stdin.once("error", onError);
				stdin.once("close", onClose);
			});
			this.touchActivity();
		};
		const queued = this.writeQueue.then(writeOperation, writeOperation);
		this.writeQueue = queued.catch(() => void 0);
		await queued;
	}
	/**
	* Returns the most recent cumulative token usage snapshot recorded for
	* `threadId` by a turn other than `turnId`, i.e. the thread's total before
	* `turnId` started, when known.
	*/
	getTokenUsageTotalBeforeTurn(threadId, turnId) {
		const entries = this.tokenUsageTotalsByThread.get(threadId);
		if (!entries) return void 0;
		for (let index = entries.length - 1; index >= 0; index -= 1) {
			const entry = entries[index];
			if (entry && entry.turnId !== turnId) return entry.total;
		}
	}
	recordThreadTokenUsage(params) {
		if (!params || typeof params !== "object") return;
		const { threadId, turnId, tokenUsage } = params;
		const total = tokenUsage?.total;
		if (typeof threadId !== "string" || !total || typeof total !== "object") return;
		const turnKey = typeof turnId === "string" ? turnId : void 0;
		const entries = (this.tokenUsageTotalsByThread.get(threadId) ?? []).filter((entry) => entry.turnId !== turnKey);
		entries.push({
			turnId: turnKey,
			total
		});
		if (entries.length > MAX_TOKEN_USAGE_TURNS_PER_THREAD) entries.shift();
		this.tokenUsageTotalsByThread.delete(threadId);
		this.tokenUsageTotalsByThread.set(threadId, entries);
		if (this.tokenUsageTotalsByThread.size > MAX_TOKEN_USAGE_THREADS) {
			const oldest = this.tokenUsageTotalsByThread.keys().next().value;
			if (typeof oldest === "string") this.tokenUsageTotalsByThread.delete(oldest);
		}
	}
	rememberCompletedTurn(turnId) {
		this.completedTurnIds.add(turnId);
		if (this.completedTurnIds.size <= MAX_COMPLETED_TURN_IDS) return;
		const oldest = this.completedTurnIds.values().next().value;
		if (typeof oldest === "string") this.completedTurnIds.delete(oldest);
	}
	clearIdleTimer() {
		if (this.idleTimer) {
			clearTimeout(this.idleTimer);
			this.idleTimer = void 0;
		}
	}
	touchActivity() {
		const idleTimeoutMs = this.settings.idleTimeoutMs;
		if (!idleTimeoutMs || idleTimeoutMs <= 0 || this.state !== "ready") return;
		this.clearIdleTimer();
		this.idleTimer = setTimeout(() => {
			if (this.state !== "ready") return;
			if (this.pending.size > 0 || this.activeRequestContextsByTurn.size > 0 || this.pendingRequestContexts.size > 0) {
				this.touchActivity();
				return;
			}
			if (this.child) {
				this.logger.info(`[codex-app-server] Closing idle app-server process after ${idleTimeoutMs}ms inactivity.`);
				this.expectedExitSignal = "SIGTERM";
				this.child.kill("SIGTERM");
				this.child = void 0;
			}
			this.stdoutReader?.close();
			this.stdoutReader = void 0;
			this.state = "idle";
			this.threadLocks.clear();
			this.pendingRequestContexts.clear();
			this.pendingRequestContextIdsByThread.clear();
			this.activeRequestContextsByTurn.clear();
			this.completedTurnIds.clear();
			this.serverCapabilities = void 0;
			this.writeQueue = Promise.resolve();
			this.emit("idle-timeout");
		}, idleTimeoutMs);
	}
};
function pickClientScopedSettings(settings) {
	return {
		codexPath: settings.codexPath,
		cwd: settings.cwd,
		env: settings.env,
		logger: settings.logger,
		connectionTimeoutMs: settings.connectionTimeoutMs,
		requestTimeoutMs: settings.requestTimeoutMs,
		idleTimeoutMs: settings.idleTimeoutMs,
		minCodexVersion: settings.minCodexVersion
	};
}
function createClientKey(settings, identityRegistry) {
	const envEntries = settings.env && Object.keys(settings.env).length > 0 ? Object.entries(settings.env).sort(([a], [b]) => a.localeCompare(b)) : void 0;
	return JSON.stringify({
		codexPath: settings.codexPath ?? null,
		cwd: settings.cwd ?? null,
		connectionTimeoutMs: settings.connectionTimeoutMs ?? null,
		requestTimeoutMs: settings.requestTimeoutMs ?? null,
		idleTimeoutMs: settings.idleTimeoutMs ?? null,
		minCodexVersion: settings.minCodexVersion ?? null,
		env: envEntries ?? null,
		logger: identityRegistry.loggerIdentity(settings.logger)
	});
}
function createAppServerClientPool(identityRegistry) {
	const sharedClients = /* @__PURE__ */ new Map();
	return {
		getOrCreate(settings) {
			const clientSettings = pickClientScopedSettings(settings);
			const key = createClientKey(clientSettings, identityRegistry);
			const existing = sharedClients.get(key);
			if (existing) return existing;
			const created = new AppServerRpcClient({
				settings: clientSettings,
				logger: clientSettings.logger
			});
			sharedClients.set(key, created);
			return created;
		},
		async closeAll() {
			await Promise.allSettled(Array.from(sharedClients.values()).map(async (client) => {
				await client.close();
			}));
			sharedClients.clear();
		}
	};
}
function isPlainObject2(value) {
	const prototype = Object.getPrototypeOf(value);
	return prototype === Object.prototype || prototype === null;
}
function createModelKeyFactory(identityRegistry) {
	const normalizeForModelKey = (value, seen = /* @__PURE__ */ new WeakSet()) => {
		if (value === null || value === void 0 || typeof value === "string" || typeof value === "number" || typeof value === "boolean") return value;
		if (typeof value === "bigint") return { __bigint: value.toString() };
		if (typeof value === "symbol") return { __symbol: String(value) };
		if (typeof value === "function") return { __functionIdentity: identityRegistry.functionIdentity(value) };
		if (Array.isArray(value)) return value.map((item) => normalizeForModelKey(item, seen));
		if (typeof value === "object") {
			if (seen.has(value)) return { __objectRef: identityRegistry.objectIdentity(value) };
			seen.add(value);
			if (isSdkMcpServer(value)) {
				if (value.cacheKey) return { __sdkMcpServerCacheKey: value.cacheKey };
				const tools = value.tools.map((tool2) => ({
					name: tool2.name,
					description: tool2.description,
					inputSchema: normalizeForModelKey(tool2.inputSchema, seen),
					execute: normalizeForModelKey(tool2.execute, seen)
				})).sort((left, right) => left.name.localeCompare(right.name));
				return { __sdkMcpServer: {
					name: value.name,
					tools
				} };
			}
			if (!isPlainObject2(value)) return { __objectIdentity: identityRegistry.objectIdentity(value) };
			const normalized = {};
			for (const key of Object.keys(value).sort((a, b) => a.localeCompare(b))) normalized[key] = normalizeForModelKey(value[key], seen);
			return normalized;
		}
		return String(value);
	};
	return { createPersistentModelKey(modelId, settings) {
		const settingsForKey = {
			...settings,
			logger: settings.logger === false ? false : settings.logger ? { __loggerIdentity: identityRegistry.loggerIdentity(settings.logger) } : void 0
		};
		return JSON.stringify({
			modelId,
			settings: normalizeForModelKey(settingsForKey)
		});
	} };
}
function createPersistentModelCache() {
	const cache = /* @__PURE__ */ new Map();
	return {
		get(key) {
			return cache.get(key);
		},
		set(key, model) {
			cache.set(key, model);
		},
		clear() {
			cache.clear();
		}
	};
}
function createSdkMcpLifecycleManager(logger) {
	const managedSdkServers = /* @__PURE__ */ new Set();
	const providerScopedSdkServers = /* @__PURE__ */ new Set();
	const requestScopedSdkServerRefCounts = /* @__PURE__ */ new Map();
	return {
		markUsed(server, lifecycle) {
			managedSdkServers.add(server);
			if (lifecycle === "provider") {
				providerScopedSdkServers.add(server);
				return;
			}
			const current = requestScopedSdkServerRefCounts.get(server) ?? 0;
			requestScopedSdkServerRefCounts.set(server, current + 1);
		},
		releaseRequestScoped(server) {
			const current = requestScopedSdkServerRefCounts.get(server);
			if (current === void 0) return;
			if (current > 1) {
				requestScopedSdkServerRefCounts.set(server, current - 1);
				return;
			}
			requestScopedSdkServerRefCounts.delete(server);
			if (providerScopedSdkServers.has(server)) return;
			server._stop().then(() => {
				if (!providerScopedSdkServers.has(server) && !requestScopedSdkServerRefCounts.has(server)) managedSdkServers.delete(server);
			}).catch((error) => {
				logger.warn(`[codex-app-server] Failed to stop request-scoped SDK MCP server: ${String(error)}`);
			});
		},
		async closeAll() {
			await Promise.allSettled(Array.from(managedSdkServers).map(async (server) => {
				await server._stop();
			}));
			managedSdkServers.clear();
			providerScopedSdkServers.clear();
			requestScopedSdkServerRefCounts.clear();
		}
	};
}
function createValueIdentityRegistry() {
	const loggerIdentityIds = /* @__PURE__ */ new WeakMap();
	const functionIdentityIds = /* @__PURE__ */ new WeakMap();
	const objectIdentityIds = /* @__PURE__ */ new WeakMap();
	let nextLoggerIdentityId = 1;
	let nextValueIdentityId = 1;
	return {
		loggerIdentity(value) {
			if (value === false) return "logger:false";
			if (!value) return "logger:default";
			const existing = loggerIdentityIds.get(value);
			if (existing !== void 0) return `logger:${existing}`;
			const id = nextLoggerIdentityId++;
			loggerIdentityIds.set(value, id);
			return `logger:${id}`;
		},
		functionIdentity(value) {
			const existing = functionIdentityIds.get(value);
			if (existing !== void 0) return `fn:${existing}`;
			const id = nextValueIdentityId++;
			functionIdentityIds.set(value, id);
			return `fn:${id}`;
		},
		objectIdentity(value) {
			const existing = objectIdentityIds.get(value);
			if (existing !== void 0) return `obj:${existing}`;
			const id = nextValueIdentityId++;
			objectIdentityIds.set(value, id);
			return `obj:${id}`;
		}
	};
}
function createCodexAppServer(options = {}) {
	const logger = getLogger(options.defaultSettings?.logger);
	if (options.defaultSettings) {
		const validated = validateAppServerSettings(options.defaultSettings);
		if (!validated.valid) throw new Error(`Invalid default settings: ${validated.errors.join(", ")}`);
		for (const warning of validated.warnings) logger.warn(`Codex App Server Provider: ${warning}`);
	}
	const identityRegistry = createValueIdentityRegistry();
	const modelKeyFactory = createModelKeyFactory(identityRegistry);
	const clientPool = createAppServerClientPool(identityRegistry);
	const persistentModelCache = createPersistentModelCache();
	const sdkMcpLifecycle = createSdkMcpLifecycleManager(logger);
	const createModel = (modelId, settings = {}) => {
		const merged = {
			...options.defaultSettings,
			...settings,
			configOverrides: {
				...options.defaultSettings?.configOverrides ?? {},
				...settings.configOverrides ?? {}
			}
		};
		const validated = validateAppServerSettings(merged);
		if (!validated.valid) throw new Error(`Invalid settings: ${validated.errors.join(", ")}`);
		for (const warning of validated.warnings) logger.warn(`Codex App Server: ${warning}`);
		const buildModel = () => new AppServerLanguageModel({
			id: modelId,
			settings: merged,
			client: clientPool.getOrCreate(merged),
			onSdkMcpServerUsed: (server, lifecycle) => {
				sdkMcpLifecycle.markUsed(server, lifecycle);
			},
			onSdkMcpServerReleased: (server) => {
				sdkMcpLifecycle.releaseRequestScoped(server);
			}
		});
		if ((merged.threadMode ?? "stateless") !== "persistent") return buildModel();
		const persistentModelKey = modelKeyFactory.createPersistentModelKey(modelId, merged);
		const existingPersistentModel = persistentModelCache.get(persistentModelKey);
		if (existingPersistentModel) return existingPersistentModel;
		const createdPersistentModel = buildModel();
		persistentModelCache.set(persistentModelKey, createdPersistentModel);
		return createdPersistentModel;
	};
	const provider = Object.assign(function(modelId, settings) {
		if (new.target) throw new Error("The Codex app-server provider function cannot be called with new.");
		return createModel(modelId, settings);
	}, { specificationVersion: "v4" });
	provider.languageModel = createModel;
	provider.chat = createModel;
	provider.embeddingModel = ((modelId) => {
		throw new require_dist.NoSuchModelError({
			modelId,
			modelType: "embeddingModel"
		});
	});
	provider.imageModel = ((modelId) => {
		throw new require_dist.NoSuchModelError({
			modelId,
			modelType: "imageModel"
		});
	});
	provider.close = async () => {
		await sdkMcpLifecycle.closeAll();
		await clientPool.closeAll();
		persistentModelCache.clear();
	};
	provider.dispose = provider.close;
	provider.listModels = async (modelProviders) => {
		const response = await clientPool.getOrCreate(options.defaultSettings ?? {}).modelList({ modelProviders: modelProviders ?? null });
		const models = response.data ?? [];
		return {
			models,
			defaultModel: models.find((model) => model.isDefault === true),
			nextCursor: response.nextCursor
		};
	};
	return provider;
}
var codexAppServer = createCodexAppServer();
async function listModels(options = {}) {
	const client = new AppServerRpcClient({ settings: {
		codexPath: options.codexPath,
		env: options.env,
		cwd: options.cwd,
		minCodexVersion: options.minCodexVersion,
		connectionTimeoutMs: options.connectionTimeoutMs,
		requestTimeoutMs: options.requestTimeoutMs,
		logger: false
	} });
	try {
		const result = await client.modelList({ modelProviders: options.modelProviders ?? null });
		const models = result.data ?? [];
		return {
			models,
			defaultModel: models.find((model) => model.isDefault === true),
			nextCursor: result.nextCursor
		};
	} finally {
		await client.dispose();
	}
}
function fromSchemaMethod(schema) {
	const withToJSON = schema;
	if (typeof withToJSON.toJSON !== "function") return;
	try {
		return withToJSON.toJSON();
	} catch {
		return;
	}
}
function fromZodToJsonSchema(schema) {
	const zodWithConverter = require_index.external_exports;
	if (typeof zodWithConverter.toJSONSchema !== "function") return;
	try {
		const converted = zodWithConverter.toJSONSchema(schema, {
			io: "input",
			target: "jsonSchema7"
		});
		if (converted && typeof converted === "object") return converted;
	} catch {
		return;
	}
}
function getDef(schema) {
	return schema._def ?? {};
}
function getTypeName(def) {
	const typeName = def.typeName;
	if (typeof typeName === "string") return typeName;
	const type = def.type;
	if (typeof type === "string") return `Zod${type.charAt(0).toUpperCase()}${type.slice(1)}`;
}
function toJsonSchemaFallback(schema) {
	const def = getDef(schema);
	const typeName = getTypeName(def);
	if (typeName === "ZodString") return { type: "string" };
	if (typeName === "ZodNumber") return { type: "number" };
	if (typeName === "ZodBoolean") return { type: "boolean" };
	if (typeName === "ZodNull") return { type: "null" };
	if (typeName === "ZodAny" || typeName === "ZodUnknown") return {};
	if (typeName === "ZodLiteral") {
		const value = def.value;
		if (value === null) return {
			type: "null",
			const: value
		};
		return {
			type: typeof value,
			const: value
		};
	}
	if (typeName === "ZodEnum") {
		const values = def.values;
		if (Array.isArray(values)) return {
			type: "string",
			enum: values
		};
	}
	if (typeName === "ZodObject") {
		const rawShape = def.shape;
		const shape = typeof rawShape === "function" ? rawShape() : rawShape;
		const properties = {};
		const required = [];
		if (shape && typeof shape === "object") for (const [key, value] of Object.entries(shape)) {
			if (!(value instanceof require_dist.ZodType)) continue;
			properties[key] = toJsonSchema(value);
			const valueTypeName = getTypeName(getDef(value));
			if (valueTypeName !== "ZodOptional" && valueTypeName !== "ZodDefault") required.push(key);
		}
		const schemaObject = {
			type: "object",
			properties
		};
		if (required.length > 0) schemaObject.required = required;
		return schemaObject;
	}
	if (typeName === "ZodArray") {
		const itemType = def.type;
		if (itemType instanceof require_dist.ZodType) return {
			type: "array",
			items: toJsonSchema(itemType)
		};
		return {
			type: "array",
			items: {}
		};
	}
	if (typeName === "ZodTuple") {
		const tupleItems = def.items;
		if (Array.isArray(tupleItems)) {
			const prefixItems = tupleItems.filter((item) => item instanceof require_dist.ZodType).map((item) => toJsonSchema(item));
			return {
				type: "array",
				prefixItems,
				minItems: prefixItems.length,
				maxItems: prefixItems.length
			};
		}
		return { type: "array" };
	}
	if (typeName === "ZodRecord") {
		const valueType = def.valueType;
		if (valueType instanceof require_dist.ZodType) return {
			type: "object",
			additionalProperties: toJsonSchema(valueType)
		};
		return {
			type: "object",
			additionalProperties: {}
		};
	}
	if (typeName === "ZodOptional" || typeName === "ZodDefault") {
		const inner = def.innerType;
		if (inner instanceof require_dist.ZodType) return toJsonSchema(inner);
		return {};
	}
	if (typeName === "ZodNullable") {
		const innerType = def.innerType;
		if (innerType instanceof require_dist.ZodType) return { anyOf: [toJsonSchema(innerType), { type: "null" }] };
		return { anyOf: [{}, { type: "null" }] };
	}
	if (typeName === "ZodUnion") {
		const options = def.options;
		if (Array.isArray(options)) return { anyOf: options.filter((option) => option instanceof require_dist.ZodType).map((option) => toJsonSchema(option)) };
	}
	if (typeName === "ZodDiscriminatedUnion") {
		const options = def.options;
		if (options && typeof options === "object") return { anyOf: Array.from(options.values()).filter((option) => option instanceof require_dist.ZodType).map((option) => toJsonSchema(option)) };
	}
	if (typeName === "ZodEffects" || typeName === "ZodPipeline") {
		const inner = def.schema ?? def.in ?? def.out;
		if (inner instanceof require_dist.ZodType) return toJsonSchema(inner);
	}
	return { type: "object" };
}
function toJsonSchema(schema) {
	return fromSchemaMethod(schema) ?? fromZodToJsonSchema(schema) ?? toJsonSchemaFallback(schema);
}
function tool(definition) {
	const { name, description, parameters, execute } = definition;
	return {
		name,
		description,
		inputSchema: toJsonSchema(parameters),
		execute: async (params) => {
			const parsed = parameters.parse(params);
			return await execute(parsed);
		}
	};
}
//#endregion
exports.CODEX_REASONING_EFFORTS = CODEX_REASONING_EFFORTS;
exports.CodexCliLanguageModel = ExecLanguageModel;
exports.ExecLanguageModel = ExecLanguageModel;
exports.DEFAULT_MIN_CODEX_VERSION = DEFAULT_MIN_CODEX_VERSION;
exports.UnsupportedFeatureError = UnsupportedFeatureError;
exports.codexAppServer = codexAppServer;
exports.codexCli = codexExec;
exports.codexExec = codexExec;
exports.createCodexAppServer = createCodexAppServer;
exports.createCodexCli = createCodexExec;
exports.createCodexExec = createCodexExec;
exports.createLocalMcpServer = createLocalMcpServer;
exports.createSdkMcpServer = createSdkMcpServer;
exports.isAuthenticationError = isAuthenticationError;
exports.isUnsupportedFeatureError = isUnsupportedFeatureError;
exports.listModels = listModels;
exports.tool = tool;
