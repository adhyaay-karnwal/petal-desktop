// Reconstructed from index-C74mRL57.js — original module: packages/ui/src/components/Sonner.tsx
import { import_jsx_runtime } from "../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../cloud/src/hooks/useSession.js";
import { CheckIcon, InfoIcon$1, SpinnerIcon, WarningIcon$1, XIcon } from "../icons.js";
import { Toaster$1 } from "../../../../vendor/sonner.js";
import { useIsDark } from "../hooks/useIsDark.js";

/** Modal typography and surfaces, with the canvas toast's 8px corners.
* Custom cards can override toast padding through classNames.toast.
*/
var Toaster = (t0) => {
	const $ = (0, import_compiler_runtime.c)(8);
	let props;
	let theme;
	if ($[0] !== t0) {
		({theme, ...props} = t0);
		$[0] = t0;
		$[1] = props;
		$[2] = theme;
	} else {
		props = $[1];
		theme = $[2];
	}
	const isDark = useIsDark();
	const t1 = theme ?? (isDark ? "dark" : "light");
	let t2;
	if ($[3] === Symbol.for("react.memo_cache_sentinel")) {
		t2 = {
			success: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckIcon, { className: "size-4 text-ed-success" }),
			info: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoIcon$1, { className: "size-4 text-ed-muted-foreground" }),
			warning: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WarningIcon$1, { className: "size-4 text-ed-warning" }),
			error: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WarningIcon$1, { className: "size-4 text-ed-destructive" }),
			loading: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpinnerIcon, { className: "size-4 animate-spin text-ed-muted-foreground" }),
			close: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(XIcon, { className: "size-3" })
		};
		$[3] = t2;
	} else t2 = $[3];
	let t3;
	if ($[4] === Symbol.for("react.memo_cache_sentinel")) {
		t3 = {
			unstyled: true,
			classNames: {
				toast: "flex min-h-[52px] w-(--width) items-center rounded-[8px] border border-ed-divider bg-ed-background text-ed-foreground shadow-ed-popover gap-2.5 px-4 py-3 [&[data-expanded=false][data-front=false]>*]:opacity-0",
				icon: "relative flex size-4 shrink-0 items-center justify-center",
				content: "flex min-w-0 flex-1 flex-col gap-0.5",
				title: "text-xs leading-4 font-medium",
				description: "text-[11px] leading-4 text-ed-muted-foreground!",
				actionButton: "h-6.5 shrink-0 rounded-[5px] border border-ed-field-border bg-ed-field px-2 text-ed-ui text-ed-foreground shadow-ed-control focus-visible:outline-2 focus-visible:outline-ed-ring",
				cancelButton: "h-6.5 shrink-0 rounded-[5px] px-2 text-ed-ui text-ed-inspector-value hover:bg-ed-ghost-hover focus-visible:outline-2 focus-visible:outline-ed-ring",
				closeButton: "order-last -mr-1.5 flex size-6.5 shrink-0 items-center justify-center rounded-[5px] bg-transparent! text-ed-muted-foreground! hover:bg-ed-ghost-hover! hover:text-ed-foreground! focus-visible:outline-2 focus-visible:outline-ed-ring"
			}
		};
		$[4] = t3;
	} else t3 = $[4];
	let t4;
	if ($[5] !== props || $[6] !== t1) {
		t4 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster$1, {
			theme: t1,
			className: "toaster group",
			closeButton: true,
			icons: t2,
			toastOptions: t3,
			...props
		});
		$[5] = props;
		$[6] = t1;
		$[7] = t4;
	} else t4 = $[7];
	return t4;
};

export { Toaster };
