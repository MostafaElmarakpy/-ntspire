import type { MessageKey } from "@/i18n/messages";
import type { SupportedLocale } from "@/i18n/config";

export type RouteKey = "home" | "explore" | "websites" | "pages" | "sections" | "mobile" | "categories" | "collections" | "profile";
export type NavigationEntry = { id: string; labelKey: MessageKey; route: RouteKey; available: boolean };
export type UserActionEntry = { id: "sign-in"; labelKey: "shell.signIn"; available: boolean };

export const ROUTE_AVAILABILITY: Record<RouteKey, boolean> = {
  home: true,
  explore: true,
  websites: true,
  pages: true,
  sections: true,
  mobile: true,
  categories: true,
  collections: false,
  profile: false,
};

export const PRIMARY_NAV: NavigationEntry[] = [
  { id: "explore", labelKey: "shell.explore", route: "explore", available: ROUTE_AVAILABILITY.explore },
  { id: "websites", labelKey: "shell.websites", route: "websites", available: ROUTE_AVAILABILITY.websites },
  { id: "pages", labelKey: "shell.pages", route: "pages", available: ROUTE_AVAILABILITY.pages },
  { id: "sections", labelKey: "shell.sections", route: "sections", available: ROUTE_AVAILABILITY.sections },
  { id: "mobile", labelKey: "shell.mobile", route: "mobile", available: ROUTE_AVAILABILITY.mobile },
  { id: "categories", labelKey: "shell.categories", route: "categories", available: ROUTE_AVAILABILITY.categories },
  { id: "search", labelKey: "shell.search", route: "explore", available: true },
];

export const USER_NAV: NavigationEntry[] = [
  { id: "collections", labelKey: "shell.collections", route: "collections", available: ROUTE_AVAILABILITY.collections },
  { id: "profile", labelKey: "shell.profile", route: "profile", available: ROUTE_AVAILABILITY.profile },
];

export const USER_ACTIONS: UserActionEntry[] = [
  { id: "sign-in", labelKey: "shell.signIn", available: true },
];

export const FOOTER_NAV: NavigationEntry[] = [
  { id: "home", labelKey: "shell.home", route: "home", available: ROUTE_AVAILABILITY.home },
];

export function routeHref(locale: SupportedLocale, route: RouteKey): string {
  if (route === "home") return `/${locale}`;
  if (route === "mobile") return `/${locale}/explore?device=mobile`;
  if (route === "sections") return `/${locale}/explore`;
  // "Websites" is the source library: the nav label is the reader's word for it,
  // and `/sources` is the route that lists them.
  if (route === "websites") return `/${locale}/sources`;
  return `/${locale}/${route}`;
}

export function availableEntries(entries: NavigationEntry[]) {
  return entries.filter((entry) => entry.available);
}
