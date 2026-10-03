import { describe, expect, it } from "vitest";
import { getMissingResponseErrors } from "@/lib/clean-run-expectations";

describe("clean-run expected responses", () => {
  it("returns no errors when an exact expected response occurred", () => {
    expect(getMissingResponseErrors([{ path: "/en", status: 200, received: true }])).toEqual([]);
  });

  it("fails the clean-run check when a declared exact response did not occur", () => {
    expect(getMissingResponseErrors([{ path: "/en", status: 404, received: false }])).toEqual([
      'expected response { path: "/en", status: 404 } did not occur',
    ]);
  });
});
