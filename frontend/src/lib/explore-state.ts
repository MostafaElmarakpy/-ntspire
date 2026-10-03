import type { Device, Direction, Locale, Theme } from "@/types/domain";
import { DEVICES, DIRECTIONS, INDUSTRIES, LANGUAGES, SECTION_TYPES, STYLES, THEMES } from "@/config/taxonomy";
import type { SearchRequest } from "@/types/services";

export type ExploreState = Partial<Pick<SearchRequest, "q" | "sectionTypeId" | "industryId" | "styleId" | "language" | "direction" | "device" | "theme" | "sortBy">>;

const validSectionIds = new Set(SECTION_TYPES.map((entry) => entry.id));
const validIndustryIds = new Set(INDUSTRIES.map((entry) => entry.id));
const validStyleIds = new Set(STYLES.map((entry) => entry.id));
const validLanguageIds = new Set(LANGUAGES.map((entry) => entry.id));
const validDirectionIds = new Set(DIRECTIONS.map((entry) => entry.id));
const validDeviceIds = new Set(DEVICES.map((entry) => entry.id));
const validThemeIds = new Set(THEMES.map((entry) => entry.id));
const validSorts = new Set(["latest", "featured"]);

type ExploreParamsInput = URLSearchParams | Record<string, string | string[] | undefined>;

const readValues = (input: ExploreParamsInput, key: string): string[] => {
  if (input instanceof URLSearchParams) return input.getAll(key).map((value) => value.trim()).filter(Boolean);
  const value = input[key];
  return (Array.isArray(value) ? value : [value]).filter((entry): entry is string => typeof entry === "string").map((entry) => entry.trim()).filter(Boolean);
};

const readFirstValue = (input: ExploreParamsInput, keys: string[]) => {
  for (const key of keys) {
    const [value] = readValues(input, key);
    if (value) return value;
  }
  return undefined;
};

const readFirstValidValue = <T extends string>(input: ExploreParamsInput, keys: string[], validValues: Set<string>): T | undefined => {
  for (const key of keys) {
    const value = readValues(input, key).find((entry) => validValues.has(entry));
    if (value) return value as T;
  }
  return undefined;
};

export function parseExploreParams(input: URLSearchParams | string | Record<string, string | string[] | undefined> | undefined): ExploreState {
  const params = typeof input === "string" ? new URLSearchParams(input.startsWith("?") ? input.slice(1) : input) : input ?? {};
  const q = readFirstValue(params, ["q", "query"]);
  const sectionTypeId = readFirstValidValue<string>(params, ["sectionType", "sectionTypeId"], validSectionIds);
  const industryId = readFirstValidValue<string>(params, ["industry", "industryId"], validIndustryIds);
  const styleId = readFirstValidValue<string>(params, ["style", "styleId"], validStyleIds);
  const language = readFirstValidValue<Locale>(params, ["language", "lang"], validLanguageIds);
  const direction = readFirstValidValue<Direction>(params, ["direction", "dir"], validDirectionIds);
  const device = readFirstValidValue<Device>(params, ["device"], validDeviceIds);
  const theme = readFirstValidValue<Theme>(params, ["theme"], validThemeIds);
  const sortBy = readFirstValidValue<NonNullable<SearchRequest["sortBy"]>>(params, ["sort", "sortBy"], validSorts);

  const state: ExploreState = {};
  if (q && q.length > 0) state.q = q;
  if (sectionTypeId) state.sectionTypeId = sectionTypeId;
  if (industryId) state.industryId = industryId;
  if (styleId) state.styleId = styleId;
  if (language) state.language = language;
  if (direction) state.direction = direction;
  if (device) state.device = device;
  if (theme) state.theme = theme;
  if (sortBy) state.sortBy = sortBy;
  return state;
}

export function serializeExploreParams(state: ExploreState): string {
  const validatedState = parseExploreParams(state);
  const entries: Array<[string, string | undefined]> = [
    ["q", validatedState.q],
    ["sectionType", validatedState.sectionTypeId],
    ["industry", validatedState.industryId],
    ["style", validatedState.styleId],
    ["language", validatedState.language],
    ["direction", validatedState.direction],
    ["device", validatedState.device],
    ["theme", validatedState.theme],
    ["sort", validatedState.sortBy],
  ];

  const params = new URLSearchParams();
  for (const [key, value] of entries) {
    if (value && value.trim().length > 0) params.set(key, value);
  }

  return params.toString();
}
