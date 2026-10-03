import { NextResponse, type NextRequest } from "next/server";
import { EXPLORE_PAGE_SIZE } from "@/features/explore/constants";
import { emptyExplorePageData, toExplorePageData } from "@/features/explore/server-data";
import { isSupportedLocale } from "@/i18n/config";
import { parseExploreParams } from "@/lib/explore-state";
import { mockSearchService } from "@/mocks/services";

const MOCK_MODES = new Set(["slow", "empty", "error"]);
const VALID_CURSOR = /^[A-Za-z0-9_-]{1,32}$/;

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const locale = params.get("locale") ?? "en";
  const cursor = params.get("cursor") ?? undefined;

  if (!isSupportedLocale(locale) || (cursor && !VALID_CURSOR.test(cursor))) {
    return NextResponse.json({ error: true }, { status: 400 });
  }

  const state = parseExploreParams(params);
  const requestedMockMode = params.get("__mock") ?? undefined;
  const mockMode = requestedMockMode && MOCK_MODES.has(requestedMockMode) ? requestedMockMode : undefined;
  const mockQuery = mockMode ? `?__mock=${mockMode}` : undefined;

  try {
    const result = await mockSearchService.search({
      ...state,
      cursor,
      limit: EXPLORE_PAGE_SIZE,
      mockQuery,
    });

    return NextResponse.json({ data: toExplorePageData(result, locale, state.device) });
  } catch {
    return NextResponse.json({ data: emptyExplorePageData(), error: true });
  }
}
