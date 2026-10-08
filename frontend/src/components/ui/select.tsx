"use client"

import * as React from "react"
import { CheckIcon, ChevronDownIcon } from "lucide-react"
import { ListBox as HeroUIListBox } from "@heroui/react/list-box"
import { ListBoxItem as HeroUIListBoxItem } from "@heroui/react/list-box-item"
import {
  Select as HeroUISelect,
  SelectPopover as HeroUISelectPopover,
  SelectTrigger as HeroUISelectTrigger,
  SelectValue as HeroUISelectValue,
} from "@heroui/react/select"
import { cn } from "cn"

/**
 * Select on HeroUI primitives (demo-only usage).
 *
 * Keeps the previous Radix-style API (`defaultValue` / `value` /
 * `onValueChange`, `SelectContent`, `SelectItem value=`) and maps it onto
 * React Aria selection keys, so the demo call site is untouched:
 * `SelectContent` becomes the popover + listbox, `SelectItem` becomes a
 * listbox item keyed by `value`. Caller classes win over HeroUI slot styles,
 * so the rendered control keeps its exact look.
 *
 * Unused Radix parts (`Group`, `Label`, `Separator`, scroll buttons) are
 * dropped — the HeroUI/ListBox exports cover them when needed.
 */

function Select({
  defaultValue,
  value,
  onValueChange,
  disabled,
  ...props
}: Omit<React.ComponentProps<typeof HeroUISelect>, "defaultSelectedKey" | "selectedKey" | "onSelectionChange" | "isDisabled"> & {
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  disabled?: boolean
}) {
  return (
    <HeroUISelect
      data-slot="select"
      defaultSelectedKey={defaultValue}
      selectedKey={value}
      onSelectionChange={onValueChange ? (key) => onValueChange(String(key)) : undefined}
      isDisabled={disabled}
      {...props}
    />
  )
}

function SelectValue(props: React.ComponentProps<typeof HeroUISelectValue>) {
  return <HeroUISelectValue data-slot="select-value" {...props} />
}

function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}: Omit<React.ComponentProps<typeof HeroUISelectTrigger>, "children"> & {
  size?: "sm" | "default"
  children: React.ReactNode
  className?: string
}) {
  return (
    <HeroUISelectTrigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        "flex w-fit items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-[placeholder]:text-muted-foreground data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDownIcon className="size-4 opacity-50" aria-hidden="true" />
    </HeroUISelectTrigger>
  )
}

function SelectContent({
  className,
  children,
  position = "item-aligned",
  align = "center",
  ...props
}: Omit<React.ComponentProps<typeof HeroUISelectPopover>, "children" | "placement"> & {
  children: React.ReactNode
  className?: string
  position?: "item-aligned" | "popper"
  align?: "start" | "center" | "end"
}) {
  return (
    <HeroUISelectPopover
      data-slot="select-content"
      placement={position === "popper" ? (align === "center" ? "bottom" : (`bottom ${align}` as const)) : undefined}
      className={cn(
        "min-w-[8rem] overflow-x-hidden overflow-y-auto rounded-md border bg-popover text-popover-foreground shadow-soft",
        className
      )}
      {...props}
    >
      <HeroUIListBox className="p-1">
        {children}
      </HeroUIListBox>
    </HeroUISelectPopover>
  )
}

function SelectItem({
  className,
  children,
  value,
  disabled,
  textValue,
  ...props
}: Omit<React.ComponentProps<typeof HeroUIListBoxItem>, "id" | "isDisabled" | "children" | "textValue"> & {
  value: string
  disabled?: boolean
  children: React.ReactNode
  textValue?: string
}) {
  return (
    <HeroUIListBoxItem
      data-slot="select-item"
      id={value}
      isDisabled={disabled}
      textValue={textValue ?? (typeof children === "string" ? children : undefined)}
      className={cn(
        "relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pe-8 ps-2 text-sm outline-hidden select-none focus:bg-secondary focus:text-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
        className
      )}
      {...props}
    >
      {(renderProps) => (
        <>
          {children}
          {renderProps.isSelected ? (
            <span data-slot="select-item-indicator" className="absolute end-2 flex size-3.5 items-center justify-center">
              <CheckIcon className="size-4" aria-hidden="true" />
            </span>
          ) : null}
        </>
      )}
    </HeroUIListBoxItem>
  )
}

export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue }
