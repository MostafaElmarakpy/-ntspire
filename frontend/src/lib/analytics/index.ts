export const analyticsEventNames = [
  "search_performed", "filter_applied", "section_viewed", "view_context",
  "saved", "unsaved", "collection_created", "image_downloaded", "figma_clicked",
  "source_opened", "mobile_viewed", "desktop_viewed",
] as const;

export type AnalyticsEventName = (typeof analyticsEventNames)[number];
export type AnalyticsProperties = Readonly<Record<string, boolean | number | string>>;
export type AnalyticsEvent = Readonly<{ name: AnalyticsEventName; props?: AnalyticsProperties }>;

let eventBuffer: AnalyticsEvent[] = [];

export function trackEvent(name: AnalyticsEventName, props?: AnalyticsProperties): void {
  const event = props === undefined ? { name } : { name, props };
  eventBuffer = [...eventBuffer, event];

  if (process.env.NODE_ENV === "development") {
    console.info("[analytics]", event);
  }
}

export function getAnalyticsEvents(): readonly AnalyticsEvent[] {
  return eventBuffer;
}

export function resetAnalyticsEvents(): void {
  eventBuffer = [];
}
