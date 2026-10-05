import "server-only";
import { applyMockConfig } from "@/config/mock-config";
import type { SupportedLocale } from "@/i18n/config";
import {
  buildCategoriesIndex,
  buildPageDetail,
  buildPagesIndex,
  buildSectionDetail,
  buildSourceDetail,
  buildSourcesIndex,
  emptyCategoriesIndex,
  emptyPageDetail,
  emptyPagesIndex,
  emptySectionDetail,
  emptySourceDetail,
  emptySourcesIndex,
} from "./model";
import type {
  CategoriesIndexData,
  PageDetailData,
  PagesIndexData,
  SectionDetailData,
  SourceDetailData,
  SourcesIndexData,
} from "./types";

/**
 * The `?__mock=` boundary for the Phase 07 routes.
 *
 * A record that does not exist is *missing* — the route turns that into a real
 * 404, and the check happens before any await so the status is still negotiable.
 * A forced service error is a separate outcome, because an error is not a
 * missing reference and must render an error state rather than a not-found page.
 *
 * `empty` keeps the record and empties its collections, so each route has a real
 * empty branch to render rather than a 404 that hides it.
 */
export type DetailResult<T> =
  | { status: "ok"; data: T }
  | { status: "missing" }
  | { status: "error" };

/**
 * An index route addresses a collection, not a record, so there is nothing for
 * it to miss: its only outcomes are data and failure.
 */
export type IndexResult<T> = { status: "ok"; data: T } | { status: "error" };

/**
 * The `?__mock=` value a route should forward to the service layer. Anything
 * that is not one of the three known modes is ignored, so an arbitrary query
 * string can never change what a visitor sees.
 */
export { mockQueryFrom, requestedDevice, resolveInitialDevice } from "./request";

const serviceCall = async <T>(
  value: T,
  emptyValue: T,
  mockQuery: string | undefined,
): Promise<IndexResult<T>> => {
  try {
    return { status: "ok", data: await applyMockConfig(() => value, mockQuery, emptyValue) };
  } catch {
    return { status: "error" };
  }
};

export async function loadSectionDetail(
  sectionId: string,
  locale: SupportedLocale,
  mockQuery?: string,
): Promise<DetailResult<SectionDetailData>> {
  const detail = buildSectionDetail(sectionId, locale);
  if (!detail) return { status: "missing" };
  return serviceCall(detail, emptySectionDetail(detail), mockQuery);
}

export async function loadPageDetail(
  slug: string,
  locale: SupportedLocale,
  mockQuery?: string,
): Promise<DetailResult<PageDetailData>> {
  const detail = buildPageDetail(slug, locale);
  if (!detail) return { status: "missing" };
  return serviceCall(detail, emptyPageDetail(detail), mockQuery);
}

export async function loadSourceDetail(
  slug: string,
  locale: SupportedLocale,
  mockQuery?: string,
): Promise<DetailResult<SourceDetailData>> {
  const detail = buildSourceDetail(slug, locale);
  if (!detail) return { status: "missing" };
  return serviceCall(detail, emptySourceDetail(detail), mockQuery);
}

export async function loadSourcesIndex(
  locale: SupportedLocale,
  mockQuery?: string,
): Promise<IndexResult<SourcesIndexData>> {
  return serviceCall(buildSourcesIndex(locale), emptySourcesIndex(), mockQuery);
}

export async function loadPagesIndex(
  locale: SupportedLocale,
  mockQuery?: string,
): Promise<IndexResult<PagesIndexData>> {
  return serviceCall(buildPagesIndex(locale), emptyPagesIndex(), mockQuery);
}

export async function loadCategoriesIndex(
  locale: SupportedLocale,
  mockQuery?: string,
): Promise<IndexResult<CategoriesIndexData>> {
  return serviceCall(buildCategoriesIndex(locale), emptyCategoriesIndex(), mockQuery);
}
