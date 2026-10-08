"use client";

import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { t } from "@/i18n/messages";
import type { SupportedLocale } from "@/i18n/config";

export function SignInDialog({ locale, presentation = "button" }: { locale: SupportedLocale; presentation?: "button" | "icon" }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {presentation === "icon" ? (
          <Button type="button" variant="overlay" size="icon-overlay" aria-label={t(locale, "shell.signIn")}>
            <User aria-hidden="true" />
          </Button>
        ) : (
          <Button variant="outline" className="min-h-11 px-4">{t(locale, "shell.signIn")}</Button>
        )}
      </DialogTrigger>
      <DialogContent closeLabel={t(locale, "shell.close")}>
        <DialogHeader>
          <DialogTitle className="font-medium tracking-[-0.01em]">{t(locale, "shell.signInTitle")}</DialogTitle>
          <DialogDescription>{t(locale, "shell.signInDescription")}</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
