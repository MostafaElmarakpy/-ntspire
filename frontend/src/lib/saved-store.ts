import { trackEvent } from "@/lib/analytics";
import { mockSaveService, type SaveService } from "@/lib/save-service";
import type { ID } from "@/types/domain";

const EMPTY_SAVED_IDS: ReadonlySet<ID> = new Set();

type Listener = () => void;

let service: SaveService = mockSaveService;
let savedIds: ReadonlySet<ID> = EMPTY_SAVED_IDS;
let loaded = false;
const listeners = new Set<Listener>();

function emit(): void {
  for (const listener of [...listeners]) listener();
}

function publish(next: ReadonlySet<ID>): void {
  savedIds = next;
  emit();
}

function withSaved(current: ReadonlySet<ID>, sectionId: ID, saved: boolean): ReadonlySet<ID> {
  const next = new Set(current);
  if (saved) next.add(sectionId);
  else next.delete(sectionId);
  return next;
}

/**
 * Snapshot for the hydration render. Saved sections live in localStorage, which
 * the server cannot read, so hydration always starts from "nothing saved" and
 * the real set arrives in the store update that follows.
 */
export function getServerSavedIds(): ReadonlySet<ID> {
  return EMPTY_SAVED_IDS;
}

export function getSavedIds(): ReadonlySet<ID> {
  return savedIds;
}

async function ensureLoaded(): Promise<void> {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const saves = await service.list();
    publish(new Set(saves.map((save) => save.sectionId)));
  } catch {
    loaded = false;
  }
}

export function subscribeSaved(listener: Listener): () => void {
  listeners.add(listener);
  void ensureLoaded();
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Optimistic toggle. The local snapshot flips immediately, then the service is
 * treated as authoritative: whatever it reports is what the snapshot ends up
 * holding, and a failure rolls the snapshot back to its previous value.
 */
export async function toggleSaved(sectionId: ID): Promise<boolean> {
  const wasSaved = savedIds.has(sectionId);
  publish(withSaved(savedIds, sectionId, !wasSaved));

  try {
    if (wasSaved) await service.unsave(sectionId);
    else await service.save(sectionId);

    const authoritative = await service.isSaved(sectionId);
    publish(withSaved(savedIds, sectionId, authoritative));
    trackEvent(authoritative ? "saved" : "unsaved", { sectionId });
    return authoritative;
  } catch (error) {
    publish(withSaved(savedIds, sectionId, wasSaved));
    throw error;
  }
}

/** Test seam: swap the service and/or the starting snapshot. */
export function configureSavedStore(next: { service?: SaveService; savedIds?: ReadonlySet<ID>; loaded?: boolean } = {}): void {
  if (next.service) service = next.service;
  if (next.savedIds) savedIds = next.savedIds;
  if (next.loaded !== undefined) loaded = next.loaded;
  emit();
}

export function resetSavedStore(): void {
  service = mockSaveService;
  savedIds = EMPTY_SAVED_IDS;
  loaded = false;
  listeners.clear();
}
