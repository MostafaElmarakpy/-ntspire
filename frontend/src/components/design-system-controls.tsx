"use client";

import { useState } from "react";
import { ChevronDown, CircleHelp, Sparkles } from "lucide-react";
import { FilterChip } from "@/components/filter-chip";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { t } from "@/i18n/messages";
import type { SupportedLocale } from "@/i18n/config";
import { toast } from "sonner";

export function DesignSystemControls({ locale }: { locale: SupportedLocale }) {
  const [selected, setSelected] = useState(false);
  const [chipVisible, setChipVisible] = useState(true);
  return (
    <div className="grid gap-10">
      <section aria-labelledby="controls-heading" className="grid gap-6">
        <h2 id="controls-heading" className="font-serif text-2xl">{t(locale, "design.sectionControls")}</h2>
        <div className="flex flex-wrap items-center gap-3">
          <Button className="min-h-11">{t(locale, "design.primaryAction")}</Button>
          <Button variant="outline" className="min-h-11">{t(locale, "design.secondaryAction")}</Button>
          <Button variant="secondary" className="min-h-11"><Sparkles aria-hidden="true" />{t(locale, "design.badgeLabel")}</Button>
          <Button variant="outline" size="icon" className="size-11" aria-label={t(locale, "design.dropdownAction")}>
            <CircleHelp aria-hidden="true" />
          </Button>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="size-11" aria-label={t(locale, "design.dropdownAction")}><CircleHelp aria-hidden="true" /></Button>
            </TooltipTrigger>
            <TooltipContent>{t(locale, "design.description")}</TooltipContent>
          </Tooltip>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="min-h-11">{t(locale, "design.dropdownAction")}<ChevronDown aria-hidden="true" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem>{t(locale, "design.dropdownItem")}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Dialog>
            <DialogTrigger asChild><Button variant="outline" className="min-h-11">{t(locale, "design.dialogAction")}</Button></DialogTrigger>
            <DialogContent closeLabel={t(locale, "shell.close")}>
              <DialogHeader>
                <DialogTitle className="font-serif">{t(locale, "design.dialogTitle")}</DialogTitle>
                <DialogDescription>{t(locale, "design.dialogDescription")}</DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
          <Button variant="outline" className="min-h-11" onClick={() => toast.success(t(locale, "design.toastMessage"))}>{t(locale, "design.toastAction")}</Button>
        </div>
        <label className="grid max-w-xl gap-2 text-sm font-medium" htmlFor="design-search">
          {t(locale, "design.inputLabel")}
          <Input id="design-search" placeholder={t(locale, "design.inputPlaceholder")} className="h-11 bg-card" />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium">
            {t(locale, "design.selectLabel")}
            <Select defaultValue="comfortable">
              <SelectTrigger className="h-11 w-full bg-card"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="comfortable">{t(locale, "design.densityComfortable")}</SelectItem>
                <SelectItem value="compact">{t(locale, "design.densityCompact")}</SelectItem>
              </SelectContent>
            </Select>
          </label>
          <div className="grid gap-2 text-sm font-medium">
            <span>{t(locale, "design.toggleLabel")}</span>
            <ToggleGroup type="single" defaultValue="desktop" aria-label={t(locale, "design.toggleLabel")} className="min-h-11 rounded-md border border-border bg-card p-1">
              <ToggleGroupItem value="desktop" className="min-h-9">{t(locale, "design.desktop")}</ToggleGroupItem>
              <ToggleGroupItem value="mobile" className="min-h-9">{t(locale, "design.mobile")}</ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      </section>
      <section aria-labelledby="feedback-heading" className="grid gap-6">
        <h2 id="feedback-heading" className="font-serif text-2xl">{t(locale, "design.sectionFeedback")}</h2>
        <Tabs defaultValue="overview">
          <TabsList aria-label={t(locale, "design.sectionFeedback")}>
            <TabsTrigger value="overview">{t(locale, "design.tabsOverview")}</TabsTrigger>
            <TabsTrigger value="details">{t(locale, "design.tabsDetails")}</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="pt-2 text-sm text-muted-foreground">{t(locale, "design.tabsOverviewContent")}</TabsContent>
          <TabsContent value="details" className="pt-2 text-sm text-muted-foreground">{t(locale, "design.tabsDetailsContent")}</TabsContent>
        </Tabs>
        {chipVisible ? (
          <div className="flex flex-wrap items-center gap-3">
            <FilterChip label={t(locale, "design.filterLabel")} selected={selected} removeLabel={t(locale, "design.removeFilter")} onSelect={() => setSelected((value) => !value)} onRemove={() => setChipVisible(false)} />
            <span className="text-sm text-muted-foreground">{t(locale, "design.actionState")}: {selected ? t(locale, "design.filterLabel") : t(locale, "design.tabsOverview")}</span>
          </div>
        ) : null}
      </section>
    </div>
  );
}
