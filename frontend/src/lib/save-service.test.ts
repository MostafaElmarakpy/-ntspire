import { describe, expect, it } from "vitest";
import { createMockSaveService, LOCAL_OWNER_ID, SAVES_STORAGE_KEY, type StorageLike } from "@/lib/save-service";

function createMemoryStorage(initial?: string): StorageLike & { value: string | null } {
  const storage = {
    value: initial ?? null,
    getItem(key: string) {
      return key === SAVES_STORAGE_KEY ? storage.value : null;
    },
    setItem(key: string, value: string) {
      if (key === SAVES_STORAGE_KEY) storage.value = value;
    },
  };
  return storage;
}

function createThrowingStorage(): StorageLike {
  return {
    getItem() {
      throw new Error("storage unavailable");
    },
    setItem() {
      throw new Error("storage unavailable");
    },
  };
}

const fixedClock = () => "2024-05-01T09:00:00.000Z";

describe("MockSaveService", () => {
  it("saves a section with a deterministic id and timestamp", async () => {
    const service = createMockSaveService({ storage: createMemoryStorage(), now: fixedClock });

    const save = await service.save("section-a");

    expect(save).toEqual({ id: "save-section-a", userId: LOCAL_OWNER_ID, sectionId: "section-a", createdAt: "2024-05-01T09:00:00.000Z" });
    expect(await service.isSaved("section-a")).toBe(true);
    expect(await service.list()).toEqual([save]);
  });

  it("is idempotent when saving the same section twice", async () => {
    let clockCalls = 0;
    const service = createMockSaveService({
      storage: createMemoryStorage(),
      now: () => {
        clockCalls += 1;
        return "2024-05-01T09:00:00.000Z";
      },
    });

    const first = await service.save("section-a");
    const second = await service.save("section-a");

    expect(second).toEqual(first);
    expect(clockCalls).toBe(1);
    expect(await service.list()).toHaveLength(1);
  });

  it("is idempotent when unsaving a section that is not saved", async () => {
    const storage = createMemoryStorage();
    const service = createMockSaveService({ storage, now: fixedClock });

    await service.unsave("section-missing");

    expect(await service.list()).toEqual([]);
    expect(storage.value).toBeNull();
  });

  it("removes only the requested section", async () => {
    const service = createMockSaveService({ storage: createMemoryStorage(), now: fixedClock });
    await service.save("section-a");
    await service.save("section-b");

    await service.unsave("section-a");

    expect(await service.list()).toEqual([expect.objectContaining({ sectionId: "section-b" })]);
  });

  it("recovers from corrupt storage", async () => {
    const service = createMockSaveService({ storage: createMemoryStorage("{ not json"), now: fixedClock });

    expect(await service.list()).toEqual([]);
    await service.save("section-a");
    expect(await service.isSaved("section-a")).toBe(true);
  });

  it("ignores a payload that does not match the persisted shape", async () => {
    const service = createMockSaveService({
      storage: createMemoryStorage(JSON.stringify({ version: 2, saves: [{ id: 1 }] })),
      now: fixedClock,
    });

    expect(await service.list()).toEqual([]);
  });

  it("stays usable when storage throws", async () => {
    const service = createMockSaveService({ storage: createThrowingStorage(), now: fixedClock });

    expect(await service.list()).toEqual([]);
    await expect(service.save("section-a")).resolves.toEqual(expect.objectContaining({ sectionId: "section-a" }));
  });

  it("stays usable when no storage is available", async () => {
    const service = createMockSaveService({ storage: null, now: fixedClock });

    expect(await service.list()).toEqual([]);
    await service.save("section-a");
    expect(await service.list()).toEqual([]);
  });

  it("round-trips through the persisted payload", async () => {
    const storage = createMemoryStorage();
    const first = createMockSaveService({ storage, now: fixedClock });
    await first.save("section-a");

    const reloaded = createMockSaveService({ storage, now: fixedClock });

    expect(await reloaded.isSaved("section-a")).toBe(true);
  });
});
