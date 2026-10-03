import type { Device } from "@/types/domain";
import { trackEvent } from "@/lib/analytics";

export function trackExploreFilterApplied(filter: string, value: string): void {
  trackEvent("filter_applied", { filter, value });
}

export function trackExploreDeviceView(device: Device): void {
  trackEvent(device === "mobile" ? "mobile_viewed" : "desktop_viewed", { device });
}
