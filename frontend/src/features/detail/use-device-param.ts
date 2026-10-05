"use client";

import { useCallback, useState } from "react";
import type { Device } from "@/types/domain";

/**
 * The shown device, mirrored into `?device=` so the choice survives a copy, a
 * share and a reload.
 *
 * The update is a shallow `history.replaceState` rather than a navigation: the
 * server already sent every device's crop, so switching is a client-side change
 * of which one is displayed. A replace (not a push) keeps the browser's Back
 * button pointing at the page the reader arrived from instead of stepping
 * through their own device switches.
 */
export function useDeviceParam(initialDevice: Device): readonly [Device, (next: Device) => void] {
  const [device, setDeviceState] = useState<Device>(initialDevice);

  const setDevice = useCallback((next: Device) => {
    setDeviceState(next);
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (url.searchParams.get("device") === next) return;
    url.searchParams.set("device", next);
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }, []);

  return [device, setDevice] as const;
}
