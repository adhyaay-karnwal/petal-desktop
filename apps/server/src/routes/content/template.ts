/**
 * shadcn-style starter set for `POST /projects/:id/seed-template`.
 * Only bare imports esm.sh can serve: react, clsx, tailwind-merge,
 * class-variance-authority, lucide-react. Radix primitives are replaced by
 * small local implementations so the set works without extra packages.
 */
import crypto from 'node:crypto';

export const TEMPLATE_DEPENDENCIES: Record<string, string> = {
  'class-variance-authority': '^0.7.1',
  clsx: '^2.1.1',
  'lucide-react': '^0.544.0',
  'tailwind-merge': '^3.3.1',
};
export const BASE_DEPENDENCIES: Record<string, string> = { react: '^19.1.0', 'react-dom': '^19.1.0' };

const utils = `import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
`;

const button = `import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive: "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20",
        outline: "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    /** Render the single child element instead of a <button>, merging props onto it. */
    asChild?: boolean
  }

function Button({ className, variant, size, asChild = false, children, ...props }: ButtonProps) {
  const classes = cn(buttonVariants({ variant, size, className }))
  if (asChild && React.isValidElement<{ className?: string }>(children)) {
    return React.cloneElement(children, {
      ...props,
      "data-slot": "button",
      className: cn(classes, children.props.className),
    } as React.Attributes & { className?: string })
  }
  return (
    <button data-slot="button" className={classes} {...props}>
      {children}
    </button>
  )
}

export { Button, buttonVariants }
`;

const badge = `import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive: "border-transparent bg-destructive text-white",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({ className, variant, ...props }: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
`;

const card = `import * as React from "react"

import { cn } from "@/lib/utils"

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn("bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm", className)}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn("grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6", className)}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-title" className={cn("leading-none font-semibold", className)} {...props} />
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-description" className={cn("text-muted-foreground text-sm", className)} {...props} />
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn("col-start-2 row-span-2 row-start-1 self-start justify-self-end", className)}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-content" className={cn("px-6", className)} {...props} />
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-footer" className={cn("flex items-center px-6", className)} {...props} />
}

export { Card, CardHeader, CardFooter, CardTitle, CardAction, CardDescription, CardContent }
`;

const input = `import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Input }
`;

const label = `import * as React from "react"

import { cn } from "@/lib/utils"

function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Label }
`;

const textarea = `import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 aria-invalid:border-destructive flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
`;

const separator = `import * as React from "react"

import { cn } from "@/lib/utils"

type SeparatorProps = React.ComponentProps<"div"> & {
  orientation?: "horizontal" | "vertical"
  decorative?: boolean
}

function Separator({ className, orientation = "horizontal", decorative = true, ...props }: SeparatorProps) {
  return (
    <div
      data-slot="separator"
      data-orientation={orientation}
      role={decorative ? "none" : "separator"}
      aria-orientation={decorative ? undefined : orientation}
      className={cn(
        "bg-border shrink-0",
        orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
        className
      )}
      {...props}
    />
  )
}

export { Separator }
`;

const checkbox = `"use client"

import * as React from "react"
import { CheckIcon } from "lucide-react"

import { cn } from "@/lib/utils"

type CheckboxProps = Omit<React.ComponentProps<"button">, "onChange"> & {
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

function Checkbox({ className, checked, defaultChecked = false, onCheckedChange, onClick, ...props }: CheckboxProps) {
  const [internal, setInternal] = React.useState(defaultChecked)
  const isChecked = checked ?? internal
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={isChecked}
      data-slot="checkbox"
      data-state={isChecked ? "checked" : "unchecked"}
      className={cn(
        "peer border-input data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=checked]:border-primary focus-visible:border-ring focus-visible:ring-ring/50 inline-flex size-4 shrink-0 items-center justify-center rounded-[4px] border shadow-xs transition-shadow outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      onClick={(event) => {
        onClick?.(event)
        if (event.defaultPrevented) return
        if (checked === undefined) setInternal(!isChecked)
        onCheckedChange?.(!isChecked)
      }}
      {...props}
    >
      {isChecked ? <CheckIcon className="size-3.5" /> : null}
    </button>
  )
}

export { Checkbox }
`;

const switchFile = `"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

type SwitchProps = Omit<React.ComponentProps<"button">, "onChange"> & {
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

function Switch({ className, checked, defaultChecked = false, onCheckedChange, onClick, ...props }: SwitchProps) {
  const [internal, setInternal] = React.useState(defaultChecked)
  const isChecked = checked ?? internal
  return (
    <button
      type="button"
      role="switch"
      aria-checked={isChecked}
      data-slot="switch"
      data-state={isChecked ? "checked" : "unchecked"}
      className={cn(
        "peer data-[state=checked]:bg-primary data-[state=unchecked]:bg-input focus-visible:border-ring focus-visible:ring-ring/50 inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      onClick={(event) => {
        onClick?.(event)
        if (event.defaultPrevented) return
        if (checked === undefined) setInternal(!isChecked)
        onCheckedChange?.(!isChecked)
      }}
      {...props}
    >
      <span
        data-slot="switch-thumb"
        data-state={isChecked ? "checked" : "unchecked"}
        className="bg-background pointer-events-none block size-4 rounded-full ring-0 transition-transform data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0"
      />
    </button>
  )
}

export { Switch }
`;

const avatar = `"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

const AvatarContext = React.createContext<{ loaded: boolean; setLoaded: (v: boolean) => void }>({
  loaded: false,
  setLoaded: () => {},
})

function Avatar({ className, ...props }: React.ComponentProps<"span">) {
  const [loaded, setLoaded] = React.useState(false)
  return (
    <AvatarContext.Provider value={{ loaded, setLoaded }}>
      <span data-slot="avatar" className={cn("relative flex size-8 shrink-0 overflow-hidden rounded-full", className)} {...props} />
    </AvatarContext.Provider>
  )
}

function AvatarImage({ className, onLoad, onError, ...props }: React.ComponentProps<"img">) {
  const { loaded, setLoaded } = React.useContext(AvatarContext)
  return (
    <img
      data-slot="avatar-image"
      className={cn("aspect-square size-full", !loaded && "hidden", className)}
      onLoad={(e) => { setLoaded(true); onLoad?.(e) }}
      onError={(e) => { setLoaded(false); onError?.(e) }}
      {...props}
    />
  )
}

function AvatarFallback({ className, ...props }: React.ComponentProps<"span">) {
  const { loaded } = React.useContext(AvatarContext)
  if (loaded) return null
  return (
    <span
      data-slot="avatar-fallback"
      className={cn("bg-muted flex size-full items-center justify-center rounded-full text-sm", className)}
      {...props}
    />
  )
}

export { Avatar, AvatarImage, AvatarFallback }
`;

const alert = `import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-0.5 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground",
        destructive: "text-destructive bg-card [&>svg]:text-current *:data-[slot=alert-description]:text-destructive/90",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Alert({ className, variant, ...props }: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return <div data-slot="alert" role="alert" className={cn(alertVariants({ variant }), className)} {...props} />
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="alert-title" className={cn("col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight", className)} {...props} />
}

function AlertDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn("text-muted-foreground col-start-2 grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed", className)}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription }
`;

const skeleton = `import * as React from "react"

import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="skeleton" className={cn("bg-accent animate-pulse rounded-md", className)} {...props} />
}

export { Skeleton }
`;

const progress = `import * as React from "react"

import { cn } from "@/lib/utils"

function Progress({ className, value = 0, ...props }: React.ComponentProps<"div"> & { value?: number }) {
  const pct = Math.max(0, Math.min(100, value ?? 0))
  return (
    <div
      data-slot="progress"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      className={cn("bg-primary/20 relative h-2 w-full overflow-hidden rounded-full", className)}
      {...props}
    >
      <div
        data-slot="progress-indicator"
        className="bg-primary h-full w-full flex-1 transition-all"
        style={{ transform: \`translateX(-\${100 - pct}%)\` }}
      />
    </div>
  )
}

export { Progress }
`;

const tabs = `"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

const TabsContext = React.createContext<{ value: string; setValue: (v: string) => void }>({
  value: "",
  setValue: () => {},
})

type TabsProps = Omit<React.ComponentProps<"div">, "onChange"> & {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
}

function Tabs({ className, value, defaultValue = "", onValueChange, ...props }: TabsProps) {
  const [internal, setInternal] = React.useState(defaultValue)
  const current = value ?? internal
  const setValue = React.useCallback(
    (v: string) => {
      if (value === undefined) setInternal(v)
      onValueChange?.(v)
    },
    [value, onValueChange]
  )
  return (
    <TabsContext.Provider value={{ value: current, setValue }}>
      <div data-slot="tabs" className={cn("flex flex-col gap-2", className)} {...props} />
    </TabsContext.Provider>
  )
}

function TabsList({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="tabs-list"
      role="tablist"
      className={cn("bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px]", className)}
      {...props}
    />
  )
}

function TabsTrigger({ className, value, onClick, ...props }: React.ComponentProps<"button"> & { value: string }) {
  const ctx = React.useContext(TabsContext)
  const active = ctx.value === value
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      data-slot="tabs-trigger"
      data-state={active ? "active" : "inactive"}
      className={cn(
        "data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm text-foreground/70 inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      onClick={(event) => {
        onClick?.(event)
        if (!event.defaultPrevented) ctx.setValue(value)
      }}
      {...props}
    />
  )
}

function TabsContent({ className, value, ...props }: React.ComponentProps<"div"> & { value: string }) {
  const ctx = React.useContext(TabsContext)
  if (ctx.value !== value) return null
  return <div data-slot="tabs-content" role="tabpanel" className={cn("flex-1 outline-none", className)} {...props} />
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
`;

const componentsJson = `{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"
}
`;

export const TEMPLATE_FILES: { path: string; content: string }[] = [
  { path: 'lib/utils.ts', content: utils },
  { path: 'components.json', content: componentsJson },
  { path: 'components/ui/button.tsx', content: button },
  { path: 'components/ui/badge.tsx', content: badge },
  { path: 'components/ui/card.tsx', content: card },
  { path: 'components/ui/input.tsx', content: input },
  { path: 'components/ui/label.tsx', content: label },
  { path: 'components/ui/textarea.tsx', content: textarea },
  { path: 'components/ui/separator.tsx', content: separator },
  { path: 'components/ui/checkbox.tsx', content: checkbox },
  { path: 'components/ui/switch.tsx', content: switchFile },
  { path: 'components/ui/avatar.tsx', content: avatar },
  { path: 'components/ui/alert.tsx', content: alert },
  { path: 'components/ui/skeleton.tsx', content: skeleton },
  { path: 'components/ui/progress.tsx', content: progress },
  { path: 'components/ui/tabs.tsx', content: tabs },
];

/** shadcn neutral theme tokens (Tailwind v4, everything after the tailwind import). */
export const THEME_CSS = `@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
}

:root {
  --radius: 0.625rem;
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.97 0 0);
  --secondary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);
  --chart-1: oklch(0.646 0.222 41.116);
  --chart-2: oklch(0.6 0.118 184.704);
  --chart-3: oklch(0.398 0.07 227.392);
  --chart-4: oklch(0.828 0.189 84.429);
  --chart-5: oklch(0.769 0.188 70.08);
  --sidebar: oklch(0.985 0 0);
  --sidebar-foreground: oklch(0.145 0 0);
  --sidebar-primary: oklch(0.205 0 0);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.97 0 0);
  --sidebar-accent-foreground: oklch(0.205 0 0);
  --sidebar-border: oklch(0.922 0 0);
  --sidebar-ring: oklch(0.708 0 0);
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.205 0 0);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.205 0 0);
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.922 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --secondary: oklch(0.269 0 0);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --accent: oklch(0.269 0 0);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.556 0 0);
  --chart-1: oklch(0.488 0.243 264.376);
  --chart-2: oklch(0.696 0.17 162.48);
  --chart-3: oklch(0.769 0.188 70.08);
  --chart-4: oklch(0.627 0.265 303.9);
  --chart-5: oklch(0.645 0.246 16.439);
  --sidebar: oklch(0.205 0 0);
  --sidebar-foreground: oklch(0.985 0 0);
  --sidebar-primary: oklch(0.488 0.243 264.376);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.269 0 0);
  --sidebar-accent-foreground: oklch(0.985 0 0);
  --sidebar-border: oklch(1 0 0 / 10%);
  --sidebar-ring: oklch(0.556 0 0);
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
}
`;

export const TAILWIND_IMPORT = '@import "tailwindcss";';

/** Returns the new globals.css content, or null when it already has the import + tokens. */
export function mergeGlobalsCss(existing: string | null): string | null {
  if (existing == null) return `${TAILWIND_IMPORT}\n\n${THEME_CSS}`;
  let next = existing;
  if (!/@import\s+(?:url\()?["']tailwindcss["']/.test(next)) next = `${TAILWIND_IMPORT}\n${next}`;
  if (!/--primary\s*:/.test(next)) next = `${next.replace(/\s*$/, '')}\n\n${THEME_CSS}`;
  return next === existing ? null : next;
}

/** Returns new package.json content (deps merged, never overwritten), or null when nothing to add. */
export function mergePackageJson(existing: string | null, projectName: string): string | null {
  if (existing == null) {
    const pkg = { name: slug(projectName), private: true, dependencies: sortKeys({ ...BASE_DEPENDENCIES, ...TEMPLATE_DEPENDENCIES }) };
    return `${JSON.stringify(pkg, null, 2)}\n`;
  }
  let pkg: Record<string, unknown>;
  try {
    pkg = JSON.parse(existing);
    if (!pkg || typeof pkg !== 'object' || Array.isArray(pkg)) return null;
  } catch {
    return null; // leave a malformed package.json alone
  }
  const deps = { ...((pkg.dependencies as Record<string, string>) ?? {}) };
  const dev = (pkg.devDependencies as Record<string, string>) ?? {};
  let changed = false;
  for (const [name, version] of Object.entries(TEMPLATE_DEPENDENCIES)) {
    if (!(name in deps) && !(name in dev)) { deps[name] = version; changed = true; }
  }
  if (!changed) return null;
  pkg.dependencies = sortKeys(deps);
  return `${JSON.stringify(pkg, null, 2)}\n`;
}

function sortKeys(o: Record<string, string>) {
  return Object.fromEntries(Object.entries(o).sort(([a], [b]) => a.localeCompare(b)));
}
function slug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'petal-project';
}

// ------------------------------------------------------------ design page

type El = Record<string, unknown> & { id: string; type: string };
const ALPHABET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-';
const nanoid = () => Array.from(crypto.randomBytes(21), (b) => ALPHABET[b & 63]).join('');

/** Builds a StoreWireV2 canvas showcasing the starter components. */
export function buildDesignCanvas() {
  const byId: Record<string, El> = {};
  const childrenByParent: Record<string, string[]> = { ROOT: [] };
  const add = (parent: string, el: Omit<El, 'id'> & { id?: string }, children: ((id: string) => void)[] = []) => {
    const id = el.id ?? `${el.type === 'text' ? 'text' : el.type}-${nanoid()}`;
    byId[id] = { ...el, id } as El;
    (childrenByParent[parent] ??= []).push(id);
    if (el.type !== 'text') childrenByParent[id] ??= [];
    for (const child of children) child(id);
    return id;
  };
  const text = (t: string) => (parent: string) => void add(parent, { type: 'text', text: t });
  const html = (tag: string, className: string, children: ((id: string) => void)[] = [], extra: Record<string, unknown> = {}) => (parent: string) =>
    void add(parent, { type: 'html', tag, props: { className, ...extra }, styles: {} }, children);
  const comp = (componentName: string, props: Record<string, unknown> = {}, children: ((id: string) => void)[] = []) => (parent: string) =>
    void add(parent, { type: 'component', componentName, props, styles: {} }, children);
  const heading = (t: string) => html('h2', 'text-sm font-medium text-muted-foreground', [text(t)]);
  const section = (title: string, rowClass: string, items: ((id: string) => void)[]) =>
    html('section', 'flex flex-col gap-3', [heading(title), html('div', rowClass, items)]);

  add(
    'ROOT',
    {
      type: 'html',
      tag: 'div',
      name: 'shadcn components',
      props: { className: 'flex flex-col gap-10 bg-background p-10 text-foreground' },
      styles: { width: 1040 },
      canvasPosition: { x: 0, y: 0 },
    },
    [
      html('div', 'flex flex-col gap-1', [
        html('h1', 'text-2xl font-semibold tracking-tight', [text('Components')]),
        html('p', 'text-sm text-muted-foreground', [text('Starter shadcn/ui components. Drag them from the Assets panel or edit them in code.')]),
      ]),
      section('Button', 'flex flex-wrap items-center gap-3', [
        comp('Button', {}, [text('Button')]),
        comp('Button', { variant: 'secondary' }, [text('Secondary')]),
        comp('Button', { variant: 'outline' }, [text('Outline')]),
        comp('Button', { variant: 'ghost' }, [text('Ghost')]),
        comp('Button', { variant: 'destructive' }, [text('Destructive')]),
        comp('Button', { variant: 'link' }, [text('Link')]),
      ]),
      section('Badge', 'flex flex-wrap items-center gap-2', [
        comp('Badge', {}, [text('Badge')]),
        comp('Badge', { variant: 'secondary' }, [text('Secondary')]),
        comp('Badge', { variant: 'outline' }, [text('Outline')]),
        comp('Badge', { variant: 'destructive' }, [text('Destructive')]),
      ]),
      section('Card', 'flex flex-wrap items-start gap-6', [
        comp('Card', { className: 'w-[360px]' }, [
          comp('CardHeader', {}, [comp('CardTitle', {}, [text('Create project')]), comp('CardDescription', {}, [text('Deploy your new project in one click.')])]),
          comp('CardContent', { className: 'flex flex-col gap-4' }, [
            html('div', 'flex flex-col gap-2', [comp('Label', {}, [text('Name')]), comp('Input', { placeholder: 'Name of your project' })]),
            html('div', 'flex flex-col gap-2', [comp('Label', {}, [text('Description')]), comp('Textarea', { placeholder: 'What are you building?' })]),
          ]),
          comp('CardFooter', { className: 'flex justify-between' }, [comp('Button', { variant: 'outline' }, [text('Cancel')]), comp('Button', {}, [text('Deploy')])]),
        ]),
        comp('Alert', { className: 'w-[360px]' }, [comp('AlertTitle', {}, [text('Heads up!')]), comp('AlertDescription', {}, [text('You can add components to your app using the Assets panel.')])]),
      ]),
      section('Form controls', 'flex flex-wrap items-center gap-6', [
        html('div', 'flex items-center gap-2', [comp('Checkbox', { defaultChecked: true }), comp('Label', {}, [text('Accept terms')])]),
        html('div', 'flex items-center gap-2', [comp('Switch', { defaultChecked: true }), comp('Label', {}, [text('Airplane mode')])]),
        comp('Input', { className: 'w-64', placeholder: 'Email' }),
      ]),
      section('Tabs', 'flex', [
        comp('Tabs', { defaultValue: 'account', className: 'w-[400px]' }, [
          comp('TabsList', {}, [comp('TabsTrigger', { value: 'account' }, [text('Account')]), comp('TabsTrigger', { value: 'password' }, [text('Password')])]),
          comp('TabsContent', { value: 'account', className: 'text-sm text-muted-foreground' }, [text('Make changes to your account here.')]),
          comp('TabsContent', { value: 'password', className: 'text-sm text-muted-foreground' }, [text('Change your password here.')]),
        ]),
      ]),
      section('Display', 'flex flex-wrap items-center gap-6', [
        comp('Avatar', {}, [comp('AvatarFallback', {}, [text('CN')])]),
        comp('Progress', { value: 60, className: 'w-48' }),
        html('div', 'flex flex-col gap-2', [comp('Skeleton', { className: 'h-4 w-[200px]' }), comp('Skeleton', { className: 'h-4 w-[160px]' })]),
      ]),
      comp('Separator'),
      html('p', 'text-xs text-muted-foreground', [text('Built with Tailwind CSS v4, class-variance-authority and lucide-react.')]),
    ],
  );
  return {
    elements: { schemaVersion: 2, byId, childrenByParent },
    zoom: 0.75,
    pan: { x: 40, y: 40 },
  };
}

export const DESIGN_PAGE_NAME = 'Components';
