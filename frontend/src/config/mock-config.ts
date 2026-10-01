export type MockMode = "normal" | "slow" | "error" | "empty";

export interface MockConfig {
  mode: MockMode;
  delayMs: number;
}

const DEFAULT_DELAY_MS = 350;
const normalizeMode = (value: string | null | undefined): MockMode => value === "slow" || value === "error" || value === "empty" ? value : "normal";

const isProduction = () => process.env.NODE_ENV === "production";

export const mockConfig = (query?: string): MockConfig => {
  if (isProduction()) return { mode: "normal", delayMs: 0 };
  const envValue = process.env.NEXT_PUBLIC_MOCK_CONFIG ?? "";
  const envModes = envValue.split(",").map((value) => value.trim());
  const queryMode = query ? new URLSearchParams(query.startsWith("?") ? query.slice(1) : query).get("__mock") : null;
  const mode = normalizeMode(queryMode ?? envModes.find((value) => value === "slow" || value === "error" || value === "empty"));
  const configuredDelay = Number.parseInt(process.env.NEXT_PUBLIC_MOCK_DELAY_MS ?? "", 10);
  return { mode, delayMs: mode === "slow" ? (Number.isFinite(configuredDelay) ? configuredDelay : DEFAULT_DELAY_MS) : 0 };
};

export const applyMockConfig = async <T>(operation: () => T | Promise<T>, query: string | undefined, emptyValue: T): Promise<T> => {
  const config = mockConfig(query);
  if (config.delayMs > 0) await new Promise((resolve) => setTimeout(resolve, config.delayMs));
  if (config.mode === "error") throw new Error("Mock service forced error");
  if (config.mode === "empty") return emptyValue;
  return operation();
};
