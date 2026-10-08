import * as React from "react"
import { Badge as HeroUIBadge } from "@heroui/react/badge"
import { cn } from "cn"

type BadgeVariant = "default" | "secondary" | "destructive" | "outline" | "ghost" | "link"

/**
 * Pill badge on the HeroUI Badge primitive (which already renders
 * `data-slot="badge"`). Brand tokens stay authoritative: the HeroUI
 * variant/color picks the closest structure and our classes carry the palette.
 *
 * HeroUI Badge has no `asChild` — verified zero `asChild` call sites, so the
 * prop was dropped instead of faked.
 */
const badgeSkin: Record<
  BadgeVariant,
  {
    variant: "primary" | "secondary" | "soft"
    color?: "default" | "accent" | "danger" | "success" | "warning"
    className: string
  }
> = {
  default: { variant: "primary", color: undefined, className: "bg-primary text-primary-foreground" },
  secondary: { variant: "secondary", color: undefined, className: "bg-secondary text-secondary-foreground" },
  destructive: { variant: "primary", color: "danger", className: "bg-destructive text-white" },
  outline: { variant: "secondary", color: undefined, className: "border-border text-foreground" },
  ghost: { variant: "secondary", color: undefined, className: "text-foreground" },
  link: { variant: "secondary", color: undefined, className: "text-primary underline-offset-4" },
}

function Badge({
  className,
  variant = "default",
  ...props
}: Omit<React.ComponentProps<"span">, "color"> & { variant?: BadgeVariant }) {
  const skin = badgeSkin[variant]

  return (
    <HeroUIBadge
      data-variant={variant}
      variant={skin.variant}
      color={skin.color}
      className={cn(
        // Our badges are inline text pills, never anchored dots: neutralize
        // HeroUI's default absolute corner placement (no static option exists).
        "static w-fit rounded-full border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap [transform:none]",
        skin.className,
        className
      )}
      {...props}
    />
  )
}

export { Badge }