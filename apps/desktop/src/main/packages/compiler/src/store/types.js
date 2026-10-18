// Reconstructed from index.js — original module: packages/compiler/src/store/types.ts
import { require_rolldown_runtime } from "../../../../__bundle__/_preamble.js";
import { require_lib$9 } from "../../../../vendor/fs-extra.js";
import { require_AppImageUpdater, require_AppUpdater, require_BaseUpdater, require_DebUpdater, require_MacUpdater, require_NsisUpdater, require_PacmanUpdater, require_Provider, require_RpmUpdater, require_types$2 } from "../../../../vendor/electron-updater.js";

var import_main = (/* @__PURE__ */ require_rolldown_runtime.__commonJSMin(((exports) => {
	var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		var desc = Object.getOwnPropertyDescriptor(m, k);
		if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) desc = {
			enumerable: true,
			get: function() {
				return m[k];
			}
		};
		Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		o[k2] = m[k];
	}));
	var __exportStar = exports && exports.__exportStar || function(m, exports$5) {
		for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports$5, p)) __createBinding(exports$5, m, p);
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.NsisUpdater = exports.MacUpdater = exports.RpmUpdater = exports.PacmanUpdater = exports.DebUpdater = exports.AppImageUpdater = exports.Provider = exports.NoOpLogger = exports.AppUpdater = exports.BaseUpdater = void 0;
	var fs_extra_1 = require_lib$9();
	var path$10 = require("path");
	var BaseUpdater_1 = require_BaseUpdater();
	Object.defineProperty(exports, "BaseUpdater", {
		enumerable: true,
		get: function() {
			return BaseUpdater_1.BaseUpdater;
		}
	});
	var AppUpdater_1 = require_AppUpdater();
	Object.defineProperty(exports, "AppUpdater", {
		enumerable: true,
		get: function() {
			return AppUpdater_1.AppUpdater;
		}
	});
	Object.defineProperty(exports, "NoOpLogger", {
		enumerable: true,
		get: function() {
			return AppUpdater_1.NoOpLogger;
		}
	});
	var Provider_1 = require_Provider();
	Object.defineProperty(exports, "Provider", {
		enumerable: true,
		get: function() {
			return Provider_1.Provider;
		}
	});
	var AppImageUpdater_1 = require_AppImageUpdater();
	Object.defineProperty(exports, "AppImageUpdater", {
		enumerable: true,
		get: function() {
			return AppImageUpdater_1.AppImageUpdater;
		}
	});
	var DebUpdater_1 = require_DebUpdater();
	Object.defineProperty(exports, "DebUpdater", {
		enumerable: true,
		get: function() {
			return DebUpdater_1.DebUpdater;
		}
	});
	var PacmanUpdater_1 = require_PacmanUpdater();
	Object.defineProperty(exports, "PacmanUpdater", {
		enumerable: true,
		get: function() {
			return PacmanUpdater_1.PacmanUpdater;
		}
	});
	var RpmUpdater_1 = require_RpmUpdater();
	Object.defineProperty(exports, "RpmUpdater", {
		enumerable: true,
		get: function() {
			return RpmUpdater_1.RpmUpdater;
		}
	});
	var MacUpdater_1 = require_MacUpdater();
	Object.defineProperty(exports, "MacUpdater", {
		enumerable: true,
		get: function() {
			return MacUpdater_1.MacUpdater;
		}
	});
	var NsisUpdater_1 = require_NsisUpdater();
	Object.defineProperty(exports, "NsisUpdater", {
		enumerable: true,
		get: function() {
			return NsisUpdater_1.NsisUpdater;
		}
	});
	__exportStar(require_types$2(), exports);
	var _autoUpdater;
	function doLoadAutoUpdater() {
		if (process.platform === "win32") _autoUpdater = new (require_NsisUpdater()).NsisUpdater();
		else if (process.platform === "darwin") _autoUpdater = new (require_MacUpdater()).MacUpdater();
		else {
			_autoUpdater = new (require_AppImageUpdater()).AppImageUpdater();
			try {
				const identity = path$10.join(process.resourcesPath, "package-type");
				if (!(0, fs_extra_1.existsSync)(identity)) return _autoUpdater;
				console.info("Checking for beta autoupdate feature for deb/rpm distributions");
				const fileType = (0, fs_extra_1.readFileSync)(identity).toString().trim();
				console.info("Found package-type:", fileType);
				switch (fileType) {
					case "deb":
						_autoUpdater = new (require_DebUpdater()).DebUpdater();
						break;
					case "rpm":
						_autoUpdater = new (require_RpmUpdater()).RpmUpdater();
						break;
					case "pacman": _autoUpdater = new (require_PacmanUpdater()).PacmanUpdater();
				}
			} catch (error) {
				console.warn("Unable to detect 'package-type' for autoUpdater (rpm/deb/pacman support). If you'd like to expand support, please consider contributing to electron-builder", error.message);
			}
		}
		return _autoUpdater;
	}
	Object.defineProperty(exports, "autoUpdater", {
		enumerable: true,
		get: () => {
			return _autoUpdater || doLoadAutoUpdater();
		}
	});
})))();
var ROOT = "ROOT";
var LEAF_TYPES = /* @__PURE__ */ new Set([
	"text",
	"icon",
	"webview"
]);
var VOID_HTML_TAGS = /* @__PURE__ */ new Set([
	"area",
	"base",
	"br",
	"col",
	"embed",
	"hr",
	"img",
	"input",
	"link",
	"meta",
	"param",
	"source",
	"track",
	"wbr"
]);
var VOID_SVG_TAGS = /* @__PURE__ */ new Set([
	"circle",
	"ellipse",
	"image",
	"line",
	"path",
	"polygon",
	"polyline",
	"rect",
	"stop",
	"use",
	"feBlend",
	"feColorMatrix",
	"feComposite",
	"feConvolveMatrix",
	"feDisplacementMap",
	"feDropShadow",
	"feFlood",
	"feGaussianBlur",
	"feImage",
	"feMorphology",
	"feOffset",
	"feTile",
	"feTurbulence",
	"feMergeNode",
	"feFuncR",
	"feFuncG",
	"feFuncB",
	"feFuncA",
	"feDistantLight",
	"fePointLight",
	"feSpotLight"
]);
function hasChildren(el) {
	if (LEAF_TYPES.has(el.type)) return false;
	if (el.type === "html" && (VOID_HTML_TAGS.has(el.tag) || VOID_SVG_TAGS.has(el.tag))) return false;
	return true;
}
[.../* @__PURE__ */ new Set([
	"svg",
	"g",
	"defs",
	"symbol",
	"marker",
	"mask",
	"pattern",
	"switch",
	"clipPath",
	"linearGradient",
	"radialGradient",
	"text",
	"tspan",
	"textPath",
	"filter",
	"feMerge",
	"feComponentTransfer",
	"feDiffuseLighting",
	"feSpecularLighting"
]), ...VOID_SVG_TAGS];

export { ROOT, hasChildren, import_main };
