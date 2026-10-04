import { NextResponse, type NextRequest } from "next/server";
import { SUGGESTION_LIMIT } from "@/lib/search-suggestions";
import { mockSearchService } from "@/mocks/services";

/** Long enough for any real query, short enough that ranking stays cheap. */
const MAX_QUERY_LENGTH = 120;

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const q = (params.get("q") ?? "").slice(0, MAX_QUERY_LENGTH);
  const requestedLimit = Number.parseInt(params.get("limit") ?? "", 10);
  const limit = Number.isFinite(requestedLimit)
    ? Math.min(Math.max(requestedLimit, 1), SUGGESTION_LIMIT)
    : SUGGESTION_LIMIT;

  try {
    const suggestions = (await mockSearchService.suggest?.({ q, limit })) ?? [];
    return NextResponse.json({ data: { suggestions } });
  } catch {
    return NextResponse.json({ data: { suggestions: [] }, error: true });
  }
}
