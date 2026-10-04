import type { SearchFacets } from "@/types/domain";

export interface ExploreCardData {
  id: string;
  title: string;
  sectionType: string;
  sourceName: string;
  tagsLabel: string;
  tags: string[];
  language: string;
  /** Derived from the domain `language` id. Feeds the dev-only Arabic marker; no fixture data involved. */
  isArabic: boolean;
  direction: string;
  devices: string[];
  image: {
    src: string;
    width: number;
    height: number;
    alt: string;
  };
}

export interface ExplorePageData {
  items: ExploreCardData[];
  total: number;
  facets: SearchFacets;
  nextCursor?: string;
}
