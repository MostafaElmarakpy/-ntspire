"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { t } from "@/i18n/messages";
import type { SupportedLocale } from "@/i18n/config";

export function SignInDialog({ locale }: { locale: SupportedLocale }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="min-h-11 px-4">{t(locale, "shell.signIn")}</Button>
      </DialogTrigger>
      <DialogContent closeLabel={t(locale, "shell.close")}>
        <DialogHeader>
          <DialogTitle className="font-serif">{t(locale, "shell.signInTitle")}</DialogTitle>
          <DialogDescription>{t(locale, "shell.signInDescription")}</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
