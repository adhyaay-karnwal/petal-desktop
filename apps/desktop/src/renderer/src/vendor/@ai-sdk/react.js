// Reconstructed from index-C74mRL57.js — original module: vendor/@ai-sdk/react
import { __commonJSMin, __toESM } from "../../__bundle__/_runtime.js";
import { import_react } from "../@tanstack/react-query.js";
import { AbstractChat, DefaultChatTransport } from "../ai.js";

var import_throttleit = /* @__PURE__ */ __toESM((/* @__PURE__ */ __commonJSMin(((exports, module) => {
	function throttle(function_, wait) {
		if (typeof function_ !== "function") throw new TypeError(`Expected the first argument to be a \`function\`, got \`${typeof function_}\`.`);
		let timeoutId;
		let lastCallTime = 0;
		return function throttled(...arguments_) {
			clearTimeout(timeoutId);
			const now = Date.now();
			const delayForNextCall = wait - (now - lastCallTime);
			if (delayForNextCall <= 0) {
				lastCallTime = now;
				function_.apply(this, arguments_);
			} else timeoutId = setTimeout(() => {
				lastCallTime = Date.now();
				function_.apply(this, arguments_);
			}, delayForNextCall);
		};
	}
	module.exports = throttle;
})))(), 1);
var __accessCheck = (obj, member, msg) => {
	if (!member.has(obj)) throw TypeError("Cannot " + msg);
};
var __privateGet = (obj, member, getter) => {
	__accessCheck(obj, member, "read from private field");
	return getter ? getter.call(obj) : member.get(obj);
};
var __privateAdd = (obj, member, value) => {
	if (member.has(obj)) throw TypeError("Cannot add the same private member more than once");
	member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var __privateSet = (obj, member, value, setter) => {
	__accessCheck(obj, member, "write to private field");
	setter ? setter.call(obj, value) : member.set(obj, value);
	return value;
};
function throttle(fn, waitMs) {
	return waitMs != null ? (0, import_throttleit.default)(fn, waitMs) : fn;
}
function cloneMetadata(metadata) {
	if (Array.isArray(metadata)) return [...metadata];
	if (metadata != null && typeof metadata === "object" && (Object.getPrototypeOf(metadata) === Object.prototype || Object.getPrototypeOf(metadata) === null)) return { ...metadata };
	return metadata;
}
var _messages;
var _status;
var _error;
var _messagesCallbacks;
var _statusCallbacks;
var _errorCallbacks;
var _callMessagesCallbacks;
var _callStatusCallbacks;
var _callErrorCallbacks;
var ReactChatState = class {
	constructor(initialMessages = []) {
		__privateAdd(this, _messages, void 0);
		__privateAdd(this, _status, "ready");
		__privateAdd(this, _error, void 0);
		__privateAdd(this, _messagesCallbacks, /* @__PURE__ */ new Set());
		__privateAdd(this, _statusCallbacks, /* @__PURE__ */ new Set());
		__privateAdd(this, _errorCallbacks, /* @__PURE__ */ new Set());
		this.pushMessage = (message) => {
			__privateSet(this, _messages, __privateGet(this, _messages).concat(message));
			__privateGet(this, _callMessagesCallbacks).call(this);
		};
		this.popMessage = () => {
			__privateSet(this, _messages, __privateGet(this, _messages).slice(0, -1));
			__privateGet(this, _callMessagesCallbacks).call(this);
		};
		this.replaceMessage = (index, message) => {
			__privateSet(this, _messages, [
				...__privateGet(this, _messages).slice(0, index),
				this.snapshot(message),
				...__privateGet(this, _messages).slice(index + 1)
			]);
			__privateGet(this, _callMessagesCallbacks).call(this);
		};
		this.snapshot = (value) => {
			if (value == null || typeof value !== "object" || !("parts" in value) || !Array.isArray(value.parts)) return value;
			const message = value;
			const snapshot = {
				...message,
				parts: message.parts.map((part) => ({ ...part }))
			};
			if ("metadata" in message) snapshot.metadata = cloneMetadata(message.metadata);
			return snapshot;
		};
		this["~registerMessagesCallback"] = (onChange, throttleWaitMs) => {
			const callback = throttleWaitMs ? throttle(onChange, throttleWaitMs) : onChange;
			__privateGet(this, _messagesCallbacks).add(callback);
			return () => {
				__privateGet(this, _messagesCallbacks).delete(callback);
			};
		};
		this["~registerStatusCallback"] = (onChange) => {
			__privateGet(this, _statusCallbacks).add(onChange);
			return () => {
				__privateGet(this, _statusCallbacks).delete(onChange);
			};
		};
		this["~registerErrorCallback"] = (onChange) => {
			__privateGet(this, _errorCallbacks).add(onChange);
			return () => {
				__privateGet(this, _errorCallbacks).delete(onChange);
			};
		};
		__privateAdd(this, _callMessagesCallbacks, () => {
			__privateGet(this, _messagesCallbacks).forEach((callback) => callback());
		});
		__privateAdd(this, _callStatusCallbacks, () => {
			__privateGet(this, _statusCallbacks).forEach((callback) => callback());
		});
		__privateAdd(this, _callErrorCallbacks, () => {
			__privateGet(this, _errorCallbacks).forEach((callback) => callback());
		});
		__privateSet(this, _messages, initialMessages);
	}
	get status() {
		return __privateGet(this, _status);
	}
	set status(newStatus) {
		__privateSet(this, _status, newStatus);
		__privateGet(this, _callStatusCallbacks).call(this);
	}
	get error() {
		return __privateGet(this, _error);
	}
	set error(newError) {
		__privateSet(this, _error, newError);
		__privateGet(this, _callErrorCallbacks).call(this);
	}
	get messages() {
		return __privateGet(this, _messages);
	}
	set messages(newMessages) {
		__privateSet(this, _messages, [...newMessages]);
		__privateGet(this, _callMessagesCallbacks).call(this);
	}
};
_messages = /* @__PURE__ */ new WeakMap();
_status = /* @__PURE__ */ new WeakMap();
_error = /* @__PURE__ */ new WeakMap();
_messagesCallbacks = /* @__PURE__ */ new WeakMap();
_statusCallbacks = /* @__PURE__ */ new WeakMap();
_errorCallbacks = /* @__PURE__ */ new WeakMap();
_callMessagesCallbacks = /* @__PURE__ */ new WeakMap();
_callStatusCallbacks = /* @__PURE__ */ new WeakMap();
_callErrorCallbacks = /* @__PURE__ */ new WeakMap();
var _state;
var Chat = class extends AbstractChat {
	constructor({ messages, ...init }) {
		const state = new ReactChatState(messages);
		super({
			...init,
			state
		});
		__privateAdd(this, _state, void 0);
		this["~registerMessagesCallback"] = (onChange, throttleWaitMs) => __privateGet(this, _state)["~registerMessagesCallback"](onChange, throttleWaitMs);
		this["~registerStatusCallback"] = (onChange) => __privateGet(this, _state)["~registerStatusCallback"](onChange);
		this["~registerErrorCallback"] = (onChange) => __privateGet(this, _state)["~registerErrorCallback"](onChange);
		__privateSet(this, _state, state);
	}
};
_state = /* @__PURE__ */ new WeakMap();
function useChat({ throttle: throttle2, experimental_throttle, resume = false, ...options } = {}) {
	const throttleWaitMs = throttle2 != null ? throttle2 : experimental_throttle;
	const latestRef = (0, import_react.useRef)({});
	if (!("chat" in options)) latestRef.current = {
		onToolCall: options.onToolCall,
		onData: options.onData,
		onFinish: options.onFinish,
		onError: options.onError,
		sendAutomaticallyWhen: options.sendAutomaticallyWhen,
		transport: options.transport
	};
	let defaultTransport;
	const getTransport = () => {
		var _a;
		return (_a = latestRef.current.transport) != null ? _a : defaultTransport != null ? defaultTransport : defaultTransport = new DefaultChatTransport();
	};
	const chatOptions = {
		...options,
		transport: {
			sendMessages: (sendOptions) => getTransport().sendMessages(sendOptions),
			reconnectToStream: (reconnectOptions) => getTransport().reconnectToStream(reconnectOptions)
		},
		onToolCall: (arg) => {
			var _a, _b;
			return (_b = (_a = latestRef.current).onToolCall) == null ? void 0 : _b.call(_a, arg);
		},
		onData: (arg) => {
			var _a, _b;
			return (_b = (_a = latestRef.current).onData) == null ? void 0 : _b.call(_a, arg);
		},
		onFinish: (arg) => {
			var _a, _b;
			return (_b = (_a = latestRef.current).onFinish) == null ? void 0 : _b.call(_a, arg);
		},
		onError: (arg) => {
			var _a, _b;
			return (_b = (_a = latestRef.current).onError) == null ? void 0 : _b.call(_a, arg);
		},
		sendAutomaticallyWhen: (arg) => {
			var _a, _b, _c;
			return (_c = (_b = (_a = latestRef.current).sendAutomaticallyWhen) == null ? void 0 : _b.call(_a, arg)) != null ? _c : false;
		}
	};
	const chatKey = "chat" in options ? options.chat : options.id;
	const { chat, isExternallyManaged } = (0, import_react.useMemo)(() => ({
		chat: "chat" in options ? options.chat : new Chat(chatOptions),
		isExternallyManaged: "chat" in options
	}), [chatKey]);
	(0, import_react.useEffect)(() => {
		if (isExternallyManaged) return;
		return () => {
			chat.stop();
		};
	}, [chat, isExternallyManaged]);
	const messagesSnapshot = (0, import_react.useMemo)(() => ({ messages: chat.messages }), [chat]);
	const subscribeToMessages = (0, import_react.useCallback)((update) => {
		let isSubscribed = true;
		const updateMessages = () => {
			if (!isSubscribed) return;
			messagesSnapshot.messages = chat.messages;
			update();
		};
		const unsubscribe = chat["~registerMessagesCallback"](updateMessages, throttleWaitMs);
		messagesSnapshot.messages = chat.messages;
		return () => {
			isSubscribed = false;
			unsubscribe();
		};
	}, [
		chat,
		messagesSnapshot,
		throttleWaitMs
	]);
	const getMessagesSnapshot = (0, import_react.useCallback)(() => messagesSnapshot.messages, [messagesSnapshot]);
	const messages = (0, import_react.useSyncExternalStore)(subscribeToMessages, getMessagesSnapshot, getMessagesSnapshot);
	const subscribeToStatus = (0, import_react.useCallback)((update) => chat["~registerStatusCallback"](() => {
		if (chat.status === "ready" || chat.status === "error") messagesSnapshot.messages = chat.messages;
		update();
	}), [chat, messagesSnapshot]);
	const getStatusSnapshot = (0, import_react.useCallback)(() => chat.status, [chat]);
	const status = (0, import_react.useSyncExternalStore)(subscribeToStatus, getStatusSnapshot, getStatusSnapshot);
	const error = (0, import_react.useSyncExternalStore)(chat["~registerErrorCallback"], () => chat.error, () => chat.error);
	const setMessages = (0, import_react.useCallback)((messagesParam) => {
		if (typeof messagesParam === "function") messagesParam = messagesParam(chat.messages);
		chat.messages = messagesParam;
	}, [chat]);
	(0, import_react.useEffect)(() => {
		if (resume) chat.resumeStream();
	}, [resume, chat]);
	return {
		id: chat.id,
		messages,
		setMessages,
		sendMessage: chat.sendMessage,
		regenerate: chat.regenerate,
		clearError: chat.clearError,
		stop: chat.stop,
		error,
		resumeStream: chat.resumeStream,
		status,
		/**
		* @deprecated Use `addToolOutput` instead.
		*/
		addToolResult: chat.addToolOutput,
		addToolOutput: chat.addToolOutput,
		addToolApprovalResponse: chat.addToolApprovalResponse
	};
}

export { useChat };
