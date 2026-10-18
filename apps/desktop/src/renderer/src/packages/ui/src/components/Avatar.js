// Reconstructed from index-C74mRL57.js — original module: packages/ui/src/components/Avatar.tsx
import { import_jsx_runtime } from "../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../cloud/src/hooks/useSession.js";
import { cn$2 } from "../lib/utils.js";
import { Fallback, Image$1, Root$6 } from "../../../../vendor/@radix-ui/react-avatar.js";

function Avatar(t0) {
	const $ = (0, import_compiler_runtime.c)(10);
	let className;
	let props;
	let t1;
	if ($[0] !== t0) {
		({className, size: t1, ...props} = t0);
		$[0] = t0;
		$[1] = className;
		$[2] = props;
		$[3] = t1;
	} else {
		className = $[1];
		props = $[2];
		t1 = $[3];
	}
	const size = t1 === void 0 ? "default" : t1;
	let t2;
	if ($[4] !== className) {
		t2 = cn$2("group/avatar relative flex size-8 shrink-0 overflow-hidden rounded-full select-none data-[size=lg]:size-10 data-[size=sm]:size-6", className);
		$[4] = className;
		$[5] = t2;
	} else t2 = $[5];
	let t3;
	if ($[6] !== props || $[7] !== size || $[8] !== t2) {
		t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Root$6, {
			"data-slot": "avatar",
			"data-size": size,
			className: t2,
			...props
		});
		$[6] = props;
		$[7] = size;
		$[8] = t2;
		$[9] = t3;
	} else t3 = $[9];
	return t3;
}
function AvatarImage(t0) {
	const $ = (0, import_compiler_runtime.c)(8);
	let className;
	let props;
	if ($[0] !== t0) {
		({className, ...props} = t0);
		$[0] = t0;
		$[1] = className;
		$[2] = props;
	} else {
		className = $[1];
		props = $[2];
	}
	let t1;
	if ($[3] !== className) {
		t1 = cn$2("aspect-square size-full", className);
		$[3] = className;
		$[4] = t1;
	} else t1 = $[4];
	let t2;
	if ($[5] !== props || $[6] !== t1) {
		t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Image$1, {
			"data-slot": "avatar-image",
			className: t1,
			...props
		});
		$[5] = props;
		$[6] = t1;
		$[7] = t2;
	} else t2 = $[7];
	return t2;
}
function AvatarFallback(t0) {
	const $ = (0, import_compiler_runtime.c)(8);
	let className;
	let props;
	if ($[0] !== t0) {
		({className, ...props} = t0);
		$[0] = t0;
		$[1] = className;
		$[2] = props;
	} else {
		className = $[1];
		props = $[2];
	}
	let t1;
	if ($[3] !== className) {
		t1 = cn$2("flex size-full items-center justify-center rounded-full bg-ed-muted text-sm text-ed-muted-foreground group-data-[size=sm]/avatar:text-xs", className);
		$[3] = className;
		$[4] = t1;
	} else t1 = $[4];
	let t2;
	if ($[5] !== props || $[6] !== t1) {
		t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fallback, {
			"data-slot": "avatar-fallback",
			className: t1,
			...props
		});
		$[5] = props;
		$[6] = t1;
		$[7] = t2;
	} else t2 = $[7];
	return t2;
}

export { Avatar, AvatarFallback, AvatarImage };
