"use client"

import * as React from "react"
import { Tab as HeroUITab, TabList as HeroUITabList, TabPanel as HeroUITabPanel, Tabs as HeroUITabs } from "@heroui/react/tabs"
import { cn } from "cn"

/**
 * Tabs on HeroUI primitives (demo-only usage).
 *
 * The wrapper keeps the previous Radix-style API (`defaultValue` / `value` /
 * `onValueChange`) and maps it onto React Aria selection keys, so the demo
 * call site is untouched. `TabsList` still accepts the legacy `line` variant
 * but HeroUI styles the list itself — it is unused in-product.
 */

interface TabsProps {
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  orientation?: "horizontal" | "vertical"
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  id?: string
}

function Tabs({
  defaultValue,
  value,
  onValueChange,
  orientation = "horizontal",
  children,
  className,
  style,
  id,
}: TabsProps) {
  return (
    <HeroUITabs
      data-orientation={orientation}
      orientation={orientation}
      defaultSelectedKey={defaultValue}
      selectedKey={value}
      onSelectionChange={onValueChange ? (key) => onValueChange(String(key)) : undefined}
      className={className}
      style={style}
      id={id}
    >
      {children}
    </HeroUITabs>
  )
}

interface TabsListProps {
  variant?: "default" | "line"
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  "aria-label"?: string
  "aria-labelledby"?: string
}

function TabsList({
  className,
  variant = "default",
  children,
  style,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
}: TabsListProps) {
  return (
    <HeroUITabList
      data-variant={variant}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledby}
      style={style}
      className={cn(variant === "line" && "bg-transparent", className)}
    >
      {children}
    </HeroUITabList>
  )
}

function TabsTrigger({
  value,
  ...props
}: Omit<React.ComponentProps<typeof HeroUITab>, "id"> & { value: string }) {
  return <HeroUITab id={value} {...props} />
}

function TabsContent({
  value,
  className,
  ...props
}: Omit<React.ComponentProps<typeof HeroUITabPanel>, "id"> & { value: string }) {
  return <HeroUITabPanel id={value} className={cn("flex-1 outline-none", className)} {...props} />
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
