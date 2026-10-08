import * as React from "react"
import { Input as HeroUIInput } from "@heroui/react/input"
import { cn } from "cn"

/**
 * Text input on HeroUI's input primitive (which already renders
 * `data-slot="input"`).
 *
 * HeroUI's input extends the native input props, so `onChange` stays a
 * `ChangeEvent` — the search-overlay combobox keeps reading
 * `event.target.value`, and `role`, `aria-*`, `placeholder`, `value`,
 * `onKeyDown` and `ref` all land on the underlying `<input>` untouched.
 */
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <HeroUIInput
      type={type}
      data-slot="input"
      className={cn(
        "h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30",
        "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  )
}

export { Input }
