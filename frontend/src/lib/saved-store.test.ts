import { afterEach, describe, expect, it, vi } from "vitest";
import { trackEvent } from "@/lib/analytics";
import type { Save } from "@/types/domain";
import { SAVES_STORAGE_KEY, createMockSaveService, type SaveService } from "@/lib/save-service";
import { configureSavedStore, getSavedIds, getServerSavedIds, resetSavedStore, subscribeSaved, toggleSaved } from "@/lib/saved-store";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));

const SECTION_ID = "section-northwind-1";

const save = (sectionId: string): Save => ({
  id: `save-${sectionId}`,
  userId: "owner-local",
  sectionId,
  createdAt: "2026-01-01T00:00:00.000Z",
});

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((onResolve, onReject) => {
    resolve = onResolve;
    reject = onReject;
  });
  return { promise, resolve, reject };
}

function stubService(overrides: Partial<SaveService> = {}): SaveService {
  return {
    list: vi.fn(async () => []),
    isSaved: vi.fn(async () => false),
    save: vi.fn(async (sectionId: string) => save(sectionId)),
    unsave: vi.fn(async () => undefined),
    ...overrides,
  };
}

afterEach(() => {
  vi.clearAllMocks();
  window.localStorage.clear();
  resetSavedStore();
});

describe("saved store", () => {
  it("hydrates from an empty snapshot so the server render matches", () => {
    configureSavedStore({ savedIds: new Set([SECTION_ID]), loaded: true });
    expect(getSavedIds().has(SECTION_ID)).toBe(true);
    expect(getServerSavedIds().size).toBe(0);
  });

  it("flips the snapshot optimistically before the service settles", async () => {
    const pending = deferred<Save>();
    const service = stubService({
      save: vi.fn(() => pending.promise),
      isSaved: vi.fn(async () => true),
    });
    configureSavedStore({ service, savedIds: new Set(), loaded: true });

    const toggling = toggleSaved(SECTION_ID);
    expect(getSavedIds().has(SECTION_ID)).toBe(true);

    pending.resolve(save(SECTION_ID));
    await expect(toggling).resolves.toBe(true);
    expect(getSavedIds().has(SECTION_ID)).toBe(true);
  });

  it("lets the service's authoritative answer win over the optimistic guess", async () => {
    const service = stubService({ isSaved: vi.fn(async () => false) });
    configureSavedStore({ service, savedIds: new Set(), loaded: true });

    await expect(toggleSaved(SECTION_ID)).resolves.toBe(false);
    expect(getSavedIds().has(SECTION_ID)).toBe(false);
    expect(service.save).toHaveBeenCalledWith(SECTION_ID);
    expect(trackEvent).toHaveBeenCalledWith("unsaved", { sectionId: SECTION_ID });
  });

  it("rolls the snapshot back and rethrows when the service fails", async () => {
    const service = stubService({ save: vi.fn(async () => { throw new Error("storage unavailable"); }) });
    configureSavedStore({ service, savedIds: new Set(), loaded: true });

    await expect(toggleSaved(SECTION_ID)).rejects.toThrow("storage unavailable");
    expect(getSavedIds().has(SECTION_ID)).toBe(false);
    expect(trackEvent).not.toHaveBeenCalled();
  });

  it("unsaves what was already saved", async () => {
    const service = stubService({ isSaved: vi.fn(async () => false) });
    configureSavedStore({ service, savedIds: new Set([SECTION_ID]), loaded: true });

    await expect(toggleSaved(SECTION_ID)).resolves.toBe(false);
    expect(service.unsave).toHaveBeenCalledWith(SECTION_ID);
    expect(service.save).not.toHaveBeenCalled();
    expect(trackEvent).toHaveBeenCalledWith("unsaved", { sectionId: SECTION_ID });
  });

  it("loads persisted saves the first time a subscriber arrives", async () => {
    window.localStorage.setItem(SAVES_STORAGE_KEY, JSON.stringify({ version: 1, saves: [save(SECTION_ID)] }));
    const listener = vi.fn();
    configureSavedStore({ service: createMockSaveService() });

    const unsubscribe = subscribeSaved(listener);
    await vi.waitFor(() => expect(getSavedIds().has(SECTION_ID)).toBe(true));
    expect(listener).toHaveBeenCalled();
    unsubscribe();
  });

  it("notifies subscribers on every published change", async () => {
    const listener = vi.fn();
    configureSavedStore({ service: stubService(), savedIds: new Set(), loaded: true });
    const unsubscribe = subscribeSaved(listener);

    await toggleSaved(SECTION_ID);
    await toggleSaved(SECTION_ID);

    expect(listener.mock.calls.length).toBeGreaterThanOrEqual(4);
    unsubscribe();
  });
});
