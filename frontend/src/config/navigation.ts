import type { MessageKey } from "@/i18n/messages";
import type { SupportedLocale } from "@/i18n/config";

export type RouteKey = "home" | "explore" | "websites" | "pages" | "sections" | "mobile" | "categories" | "collections" | "profile" | "ogImages";
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
  ogImages: false,
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

/**
 * Header grouping in the recent.design spirit: Browse holds the reference-type
 * destinations, Resources the library indexes. Both list only real, available
 * routes — future destinations (Tools, Skills, Jobs) join once their routes
 * exist. The `search` entry is intentionally in neither: the header search pill
 * (desktop) and the compact icon (mobile) are its triggers.
 */
const BROWSE_IDS = new Set(["explore", "websites", "sections", "mobile"]);
const RESOURCE_IDS = new Set(["pages", "categories"]);

export const BROWSE_NAV: NavigationEntry[] = availableEntries(PRIMARY_NAV).filter(
  (entry) => BROWSE_IDS.has(entry.id),
);

export const RESOURCE_NAV: NavigationEntry[] = availableEntries(PRIMARY_NAV).filter(
  (entry) => RESOURCE_IDS.has(entry.id),
);

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
  if (route === "ogImages") return `/${locale}/og-images`;
  return `/${locale}/${route}`;
}

export function availableEntries(entries: NavigationEntry[]) {
  return entries.filter((entry) => entry.available);
}

/**
 * Whether a header entry is the current location, in the recent.design
 * spirit: the active destination renders in ink while the rest stay muted.
 *
 * Matching is by destination, so detail pages keep their index highlighted
 * (`/en/sources/acme` still marks Websites). Explore, Sections and Mobile
 * share the `/explore` destination, so the most specific view wins and
 * Explore is the fallback home for the remaining `/explore` views (such as
 * the Discover OG Images view, which has no header entry of its own).
 */
export function isNavEntryActive(
  entry: NavigationEntry,
  locale: SupportedLocale,
  pathname: string,
  search: URLSearchParams,
): boolean {
  const base = routeHref(locale, entry.route).split("?")[0];
  if (pathname !== base && !pathname.startsWith(`${base}/`)) return false;

  if (base !== routeHref(locale, "explore").split("?")[0]) return true;

  const device = search.get("device");
  const format = search.get("formatId");
  if (entry.id === "mobile") return device === "mobile";
  if (entry.id === "sections") return device !== "mobile" && format !== "og-image";
  return device !== "mobile" && format === "og-image";
}
