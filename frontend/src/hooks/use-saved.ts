"use client";

import { useCallback, useSyncExternalStore } from "react";
import { getSavedIds, getServerSavedIds, subscribeSaved, toggleSaved } from "@/lib/saved-store";
import type { ID } from "@/types/domain";

/**
 * Reads and toggles the saved state for one section.
 *
 * The saved set lives in localStorage, so the server snapshot is always empty and
 * the real value arrives right after hydration. Every component that calls this
 * hook shares one store, which keeps the card overlay and the section detail page
 * in step without a second source of truth.
 */
export function useSaved(sectionId: ID) {
  const savedIds = useSyncExternalStore(subscribeSaved, getSavedIds, getServerSavedIds);
  const toggle = useCallback(() => toggleSaved(sectionId), [sectionId]);

  return { saved: savedIds.has(sectionId), toggle };
}
