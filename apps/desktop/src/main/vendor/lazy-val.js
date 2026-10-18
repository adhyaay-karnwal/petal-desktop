// Reconstructed from index.js — original module: vendor/lazy-val
import { require_rolldown_runtime } from "../__bundle__/_preamble.js";

var require_main$1 = /* @__PURE__ */ require_rolldown_runtime.__commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.Lazy = void 0;
	var Lazy = class {
		constructor(creator) {
			this._value = null;
			this.creator = creator;
		}
		get hasValue() {
			return this.creator == null;
		}
		get value() {
			if (this.creator == null) return this._value;
			const result = this.creator();
			this.value = result;
			return result;
		}
		set value(value) {
			this._value = value;
			this.creator = null;
		}
	};
	exports.Lazy = Lazy;
}));

export { require_main$1 };
