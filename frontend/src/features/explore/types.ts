import type { SearchFacets } from "@/types/domain";
import type { SectionCardData } from "@/features/gallery/types";

/**
 * Explore's results are Phase 04 section cards — the same view model the gallery
 * and the detail pages render — so the card type is not redefined here.
 */
export interface ExplorePageData {
  items: SectionCardData[];
  total: number;
  facets: SearchFacets;
  nextCursor?: string;
}
