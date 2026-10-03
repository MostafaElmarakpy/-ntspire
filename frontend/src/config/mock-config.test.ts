import { afterEach, describe, expect, it, vi } from "vitest";
import { applyMockConfig, mockConfig } from "@/config/mock-config";

describe("mockConfig", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("reads env controls and query controls, with query taking precedence", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("NEXT_PUBLIC_MOCK_CONFIG", "empty");
    expect(mockConfig().mode).toBe("empty");
    expect(mockConfig("?__mock=slow")).toMatchObject({ mode: "slow", delayMs: 350 });
  });

  it("ignores environment controls but honors explicit mock query modes in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_MOCK_CONFIG", "error");
    expect(mockConfig()).toEqual({ mode: "normal", delayMs: 0 });
    expect(mockConfig("?__mock=error")).toEqual({ mode: "error", delayMs: 0 });
    await expect(applyMockConfig(() => "ok", "?__mock=error", "empty")).rejects.toThrow("forced error");
  });

  it("forces errors and empty values outside production", async () => {
    vi.stubEnv("NODE_ENV", "development");
    await expect(applyMockConfig(() => "ok", "?__mock=error", "empty")).rejects.toThrow("forced error");
    await expect(applyMockConfig(() => "ok", "?__mock=empty", "empty")).resolves.toBe("empty");
  });
});
