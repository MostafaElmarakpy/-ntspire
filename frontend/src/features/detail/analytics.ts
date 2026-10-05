import type { Device } from "@/types/domain";
import { trackEvent } from "@/lib/analytics";

/**
 * The detail flow's analytics, named once so the routes and their tests agree on
 * the event vocabulary in spec §48.
 */
export function trackSectionViewed(sectionId: string, device: Device): void {
  trackEvent("section_viewed", { sectionId, device });
}

export function trackSourceOpened(sourceId: string): void {
  trackEvent("source_opened", { sourceId });
}

export function trackDeviceViewed(device: Device): void {
  trackEvent(device === "mobile" ? "mobile_viewed" : "desktop_viewed", { device });
}

export function trackViewContext(sectionId: string, device: Device): void {
  trackEvent("view_context", { sectionId, device });
}

export function trackImageDownloaded(sectionId: string, device: Device, filename: string): void {
  trackEvent("image_downloaded", { sectionId, device, filename });
}

export function trackFigmaClicked(sectionId: string): void {
  trackEvent("figma_clicked", { sectionId });
}
