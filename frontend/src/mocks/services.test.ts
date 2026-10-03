import { describe, expect, it, vi } from "vitest";
import { mockSearchService, mockSectionService } from "@/mocks/services";

describe("mock services", () => {
  it("expose async search and similarity contracts", async () => {
    const search = mockSearchService.search({ limit: 3 });
    expect(search).toBeInstanceOf(Promise);
    await expect(search).resolves.toMatchObject({ total: 42, items: expect.any(Array), facets: expect.any(Object) });
    const similar = await mockSectionService.getSimilar("section-papercrane-collaboration-1");
    expect(similar).toHaveLength(1);
    expect(similar[0].id).toBe("section-subul-mobility-1");
    expect(similar[0].sectionTypeId).toBe("hero");
  });

  it("passes query mock controls through search", async () => {
    vi.stubEnv("NODE_ENV", "development");
    await expect(mockSearchService.search({ mockQuery: "?__mock=empty" })).resolves.toMatchObject({ total: 0, items: [] });
    await expect(mockSearchService.search({ mockQuery: "?__mock=error" })).rejects.toThrow("forced error");
    vi.unstubAllEnvs();
  });
});
