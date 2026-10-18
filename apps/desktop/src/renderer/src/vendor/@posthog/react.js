// Reconstructed from index-C74mRL57.js — original module: vendor/@posthog/react
import { import_react } from "../@tanstack/react-query.js";
import { lf } from "../posthog-js.js";

var defaultPostHogInstance;
function setDefaultPostHogInstance(instance) {
	defaultPostHogInstance = instance;
}
function getDefaultPostHogInstance() {
	return defaultPostHogInstance;
}
var PostHogContext = (0, import_react.createContext)({
	get client() {
		return getDefaultPostHogInstance();
	},
	bootstrap: void 0
});
function isDeepEqual(obj1, obj2, visited) {
	if (visited === void 0) visited = /* @__PURE__ */ new WeakMap();
	if (obj1 === obj2) return true;
	if (typeof obj1 !== "object" || obj1 === null || typeof obj2 !== "object" || obj2 === null) return false;
	if (visited.has(obj1) && visited.get(obj1) === obj2) return true;
	visited.set(obj1, obj2);
	var keys1 = Object.keys(obj1);
	var keys2 = Object.keys(obj2);
	if (keys1.length !== keys2.length) return false;
	for (var _i = 0, keys1_1 = keys1; _i < keys1_1.length; _i++) {
		var key = keys1_1[_i];
		if (!keys2.includes(key)) return false;
		if (!isDeepEqual(obj1[key], obj2[key], visited)) return false;
	}
	return true;
}
function PostHogProvider(_a) {
	var _b, _c;
	var children = _a.children, client = _a.client, apiKey = _a.apiKey, options = _a.options;
	var previousInitializationRef = (0, import_react.useRef)(null);
	var posthog = (0, import_react.useMemo)(function() {
		if (client) {
			if (apiKey) console.warn("[PostHog.js] You have provided both `client` and `apiKey` to `PostHogProvider`. `apiKey` will be ignored in favour of `client`.");
			if (options) console.warn("[PostHog.js] You have provided both `client` and `options` to `PostHogProvider`. `options` will be ignored in favour of `client`.");
			return client;
		}
		var defaultInstance = getDefaultPostHogInstance();
		if (apiKey) return defaultInstance;
		console.warn("[PostHog.js] No `apiKey` or `client` were provided to `PostHogProvider`. Using default global `window.posthog` instance. You must initialize it manually. This is not recommended behavior.");
		return defaultInstance;
	}, [
		client,
		apiKey,
		JSON.stringify(options)
	]);
	(0, import_react.useEffect)(function() {
		if (client) return;
		var defaultInstance = getDefaultPostHogInstance();
		var previousInitialization = previousInitializationRef.current;
		if (!previousInitialization) {
			if (defaultInstance.__loaded) console.warn("[PostHog.js] `posthog` was already loaded elsewhere. This may cause issues.");
			defaultInstance.init(apiKey, options);
			previousInitializationRef.current = {
				apiKey,
				options: options !== null && options !== void 0 ? options : {}
			};
		} else {
			if (apiKey !== previousInitialization.apiKey) console.warn("[PostHog.js] You have provided a different `apiKey` to `PostHogProvider` than the one that was already initialized. This is not supported by our provider and we'll keep using the previous key. If you need to toggle between API Keys you need to control the `client` yourself and pass it in as a prop rather than an `apiKey` prop.");
			if (options && !isDeepEqual(options, previousInitialization.options)) defaultInstance.set_config(options);
			previousInitializationRef.current = {
				apiKey,
				options: options !== null && options !== void 0 ? options : {}
			};
		}
	}, [
		client,
		apiKey,
		JSON.stringify(options)
	]);
	return import_react.createElement(PostHogContext.Provider, { value: {
		client: posthog,
		bootstrap: (_b = options === null || options === void 0 ? void 0 : options.bootstrap) !== null && _b !== void 0 ? _b : (_c = client === null || client === void 0 ? void 0 : client.config) === null || _c === void 0 ? void 0 : _c.bootstrap
	} }, children);
}
var isFunction = function(f) {
	return typeof f === "function";
};
var isUndefined = function(x) {
	return x === void 0;
};
function useFeatureFlagEnabled(flag) {
	var _a, _b;
	var _c = (0, import_react.useContext)(PostHogContext), client = _c.client, bootstrap = _c.bootstrap;
	var _d = (0, import_react.useState)(function() {
		return client.isFeatureEnabled(flag);
	}), featureEnabled = _d[0], setFeatureEnabled = _d[1];
	(0, import_react.useEffect)(function() {
		return client.onFeatureFlags(function() {
			setFeatureEnabled(client.isFeatureEnabled(flag));
		});
	}, [client, flag]);
	var bootstrapped = (_a = bootstrap === null || bootstrap === void 0 ? void 0 : bootstrap.featureFlags) === null || _a === void 0 ? void 0 : _a[flag];
	if (!((_b = client === null || client === void 0 ? void 0 : client.featureFlags) === null || _b === void 0 ? void 0 : _b.hasLoadedFlags) && (bootstrap === null || bootstrap === void 0 ? void 0 : bootstrap.featureFlags)) return isUndefined(bootstrapped) ? void 0 : !!bootstrapped;
	return featureEnabled;
}
var usePostHog = function() {
	return (0, import_react.useContext)(PostHogContext).client;
};
/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
var extendStatics = function(d, b) {
	extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d, b) {
		d.__proto__ = b;
	} || function(d, b) {
		for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
	};
	return extendStatics(d, b);
};
function __extends(d, b) {
	if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
	extendStatics(d, b);
	function __() {
		this.constructor = d;
	}
	d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}
var INITIAL_STATE = {
	componentStack: null,
	exceptionEvent: null,
	error: null
};
var __POSTHOG_ERROR_MESSAGES = { INVALID_FALLBACK: "[PostHog.js][PostHogErrorBoundary] Invalid fallback prop, provide a valid React element or a function that returns a valid React element." };
(function(_super) {
	__extends(PostHogErrorBoundary, _super);
	function PostHogErrorBoundary(props) {
		var _this = _super.call(this, props) || this;
		_this.state = INITIAL_STATE;
		return _this;
	}
	PostHogErrorBoundary.prototype.componentDidCatch = function(error, errorInfo) {
		var additionalProperties = this.props.additionalProperties;
		var currentProperties;
		if (isFunction(additionalProperties)) currentProperties = additionalProperties(error);
		else if (typeof additionalProperties === "object") currentProperties = additionalProperties;
		var exceptionEvent = this.context.client.captureException(error, currentProperties);
		var componentStack = errorInfo.componentStack;
		this.setState({
			error,
			componentStack: componentStack !== null && componentStack !== void 0 ? componentStack : null,
			exceptionEvent
		});
	};
	PostHogErrorBoundary.prototype.render = function() {
		var _a = this.props, children = _a.children, fallback = _a.fallback;
		var state = this.state;
		if (state.componentStack == null) return isFunction(children) ? children() : children;
		var element = isFunction(fallback) ? import_react.createElement(fallback, {
			error: state.error,
			componentStack: state.componentStack,
			exceptionEvent: state.exceptionEvent
		}) : fallback;
		if (import_react.isValidElement(element)) return element;
		console.warn(__POSTHOG_ERROR_MESSAGES.INVALID_FALLBACK);
		return import_react.createElement(import_react.Fragment, null);
	};
	PostHogErrorBoundary.contextType = PostHogContext;
	return PostHogErrorBoundary;
})(import_react.Component);
setDefaultPostHogInstance(lf);

export { PostHogProvider, useFeatureFlagEnabled, usePostHog };
