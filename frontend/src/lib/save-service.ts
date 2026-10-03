import type { ID, Save } from "@/types/domain";

export interface SaveService {
  list(): Promise<Save[]>;
  isSaved(sectionId: ID): Promise<boolean>;
  save(sectionId: ID): Promise<Save>;
  unsave(sectionId: ID): Promise<void>;
}

export const SAVES_STORAGE_KEY = "ntspire:saves:v1";

/** Anonymous local owner until real authentication exists (see NEXT_STEPS.md). */
export const LOCAL_OWNER_ID = "owner-local";

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

interface PersistedSaves {
  version: 1;
  saves: Save[];
}

export interface SaveServiceOptions {
  /** `undefined` resolves the browser's localStorage; `null` forces "unavailable". */
  storage?: StorageLike | null;
  now?: () => string;
  createId?: (sectionId: ID) => string;
}

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null;

const isSave = (value: unknown): value is Save => isRecord(value)
  && typeof value.id === "string"
  && typeof value.userId === "string"
  && typeof value.sectionId === "string"
  && typeof value.createdAt === "string";

const isPersistedSaves = (value: unknown): value is PersistedSaves => isRecord(value)
  && value.version === 1
  && Array.isArray(value.saves)
  && value.saves.every(isSave);

function resolveStorage(storage?: StorageLike | null): StorageLike | null {
  if (storage !== undefined) return storage;
  try {
    if (typeof window === "undefined") return null;
    return window.localStorage ?? null;
  } catch {
    // Accessing localStorage throws in some privacy modes.
    return null;
  }
}

export function createMockSaveService(options: SaveServiceOptions = {}): SaveService {
  const storage = resolveStorage(options.storage);
  const now = options.now ?? (() => new Date().toISOString());
  const createId = options.createId ?? ((sectionId: ID) => `save-${sectionId}`);

  const read = (): Save[] => {
    if (!storage) return [];
    try {
      const raw = storage.getItem(SAVES_STORAGE_KEY);
      if (!raw) return [];
      const parsed: unknown = JSON.parse(raw);
      return isPersistedSaves(parsed) ? parsed.saves : [];
    } catch {
      // Corrupt or unreadable payload: recover with an empty collection.
      return [];
    }
  };

  const write = (saves: Save[]): void => {
    if (!storage) return;
    try {
      storage.setItem(SAVES_STORAGE_KEY, JSON.stringify({ version: 1, saves } satisfies PersistedSaves));
    } catch {
      // Storage full or blocked: the caller still gets the authoritative result.
    }
  };

  return {
    async list() {
      return read();
    },

    async isSaved(sectionId) {
      return read().some((save) => save.sectionId === sectionId);
    },

    async save(sectionId) {
      const saves = read();
      const existing = saves.find((save) => save.sectionId === sectionId);
      if (existing) return existing;

      const createdAt = now();
      const save: Save = { id: createId(sectionId), userId: LOCAL_OWNER_ID, sectionId, createdAt };
      write([save, ...saves]);
      return save;
    },

    async unsave(sectionId) {
      const saves = read();
      const remaining = saves.filter((save) => save.sectionId !== sectionId);
      if (remaining.length !== saves.length) write(remaining);
    },
  };
}

export const mockSaveService = createMockSaveService();
