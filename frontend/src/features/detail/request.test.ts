import { describe, expect, it } from "vitest";
import { mockQueryFrom, requestedDevice, resolveInitialDevice } from "./request";

describe("mockQueryFrom", () => {
  it("forwards the three known mock modes", () => {
    expect(mockQueryFrom("slow")).toBe("?__mock=slow");
    expect(mockQueryFrom("empty")).toBe("?__mock=empty");
    expect(mockQueryFrom("error")).toBe("?__mock=error");
  });

  it("takes the first value when the mode is repeated, as a query string allows", () => {
    expect(mockQueryFrom(["slow", "error"])).toBe("?__mock=slow");
  });

  it("ignores anything that is not a known mode, so a stray query cannot change the page", () => {
    expect(mockQueryFrom(undefined)).toBeUndefined();
    expect(mockQueryFrom("")).toBeUndefined();
    expect(mockQueryFrom("normal")).toBeUndefined();
    expect(mockQueryFrom("SLOW")).toBeUndefined();
    expect(mockQueryFrom("slow ")).toBeUndefined();
    expect(mockQueryFrom(["error", "slow"])).toBe("?__mock=error");
  });

  it("ignores array values that hold nothing usable", () => {
    expect(mockQueryFrom([])).toBeUndefined();
    expect(mockQueryFrom(["nonsense"])).toBeUndefined();
  });
});

describe("requestedDevice", () => {
  it("reads a device the taxonomy knows", () => {
    expect(requestedDevice({ device: "desktop" })).toBe("desktop");
    expect(requestedDevice({ device: "mobile" })).toBe("mobile");
  });

  it("reads the first usable value from a repeated parameter", () => {
    expect(requestedDevice({ device: ["mobile", "desktop"] })).toBe("mobile");
  });

  it("rejects a device that is not in the taxonomy", () => {
    expect(requestedDevice({ device: "tablet" })).toBeUndefined();
    expect(requestedDevice({ device: "DESKTOP" })).toBeUndefined();
    expect(requestedDevice({ device: "" })).toBeUndefined();
  });

  it("is undefined when the request asked for no device", () => {
    expect(requestedDevice({})).toBeUndefined();
    expect(requestedDevice({ device: undefined })).toBeUndefined();
    expect(requestedDevice({ q: "hero", industry: "saas" })).toBeUndefined();
  });

  it("reads the device out of a fuller query without being confused by the others", () => {
    expect(requestedDevice({ q: "hero", industry: "saas", device: "mobile", sort: "latest" })).toBe("mobile");
  });
});

describe("resolveInitialDevice", () => {
  const both = [{ device: "desktop" as const }, { device: "mobile" as const }];
  const desktopOnly = [{ device: "desktop" as const }];
  const mobileOnly = [{ device: "mobile" as const }];

  it("honours a requested device the record actually has", () => {
    expect(resolveInitialDevice(both, "mobile")).toBe("mobile");
    expect(resolveInitialDevice(both, "desktop")).toBe("desktop");
    expect(resolveInitialDevice(desktopOnly, "desktop")).toBe("desktop");
    expect(resolveInitialDevice(mobileOnly, "mobile")).toBe("mobile");
  });

  it("never honours a device the record has no crop for", () => {
    expect(resolveInitialDevice(desktopOnly, "mobile")).toBe("desktop");
    expect(resolveInitialDevice(mobileOnly, "desktop")).toBe("mobile");
  });

  it("falls back to the first view when nothing was requested", () => {
    expect(resolveInitialDevice(both)).toBe("desktop");
    expect(resolveInitialDevice(desktopOnly)).toBe("desktop");
    expect(resolveInitialDevice(mobileOnly)).toBe("mobile");
  });

  it("leads with the order the views came in, not a hardcoded preference", () => {
    expect(resolveInitialDevice([{ device: "mobile" as const }, { device: "desktop" as const }])).toBe("mobile");
  });
});
