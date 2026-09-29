import type { SupportedLocale } from "@/i18n/config";

import enMessages from "./en";

const messageCatalog = { en: enMessages } as const;

export type MessageKey = keyof typeof enMessages;

export function getMessages(locale: SupportedLocale) {
  return messageCatalog[locale];
}

export function t(locale: SupportedLocale, key: MessageKey): string {
  return getMessages(locale)[key];
}
