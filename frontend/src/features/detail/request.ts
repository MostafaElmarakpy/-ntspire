import { parseExploreParams } from "@/lib/explore-state";
import type { Device } from "@/types/domain";

/**
 * The request-scoped inputs the detail routes read off their query string.
 *
 * These are pure so they can be tested directly: the routes only ever pass the
 * result through, and nothing here reaches for a server-only API.
 */

/**
 * The `?__mock=` value a route should forward to the service layer. Anything
 * that is not one of the three known modes is ignored, so an arbitrary query
 * string can never change what a visitor sees.
 */
export function mockQueryFrom(value: string | string[] | undefined): string | undefined {
  const candidate = Array.isArray(value) ? value[0] : value;
  return candidate === "slow" || candidate === "empty" || candidate === "error"
    ? `?__mock=${candidate}`
    : undefined;
}

/**
 * The `?device=` a request asked for, validated against the taxonomy by the same
 * parser Explore uses. It is only a *request*: a route still has to check the
 * record actually has that crop before honouring it.
 */
export function requestedDevice(rawParams: Record<string, string | string[] | undefined>): Device | undefined {
  return parseExploreParams(rawParams).device;
}

/** The device to show: the requested one when the record has it, otherwise the first. */
export function resolveInitialDevice<T extends { device: Device }>(views: readonly T[], requested?: Device): Device {
  if (requested && views.some((view) => view.device === requested)) return requested;
  return views[0].device;
}
