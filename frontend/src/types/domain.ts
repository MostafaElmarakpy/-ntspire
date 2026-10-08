export type ID = string;

export type Locale = "en" | "ar";
export type Direction = "ltr" | "rtl";
export type Device = "desktop" | "mobile";
export type Theme = "light" | "dark";

export interface Asset {
  id: ID;
  url: string;
  width: number;
  height: number;
  mimeType: string;
}

export interface Source {
  id: ID;
  name: string;
  url: string;
  description: string;
  logoAssetId?: ID;
  industryId: string;
  createdAt: string;
  attribution: string;
  capturedAt: string;
}

export interface Page {
  id: ID;
  sourceId: ID;
  title: string;
  path: string;
  language: Locale;
  direction: Direction;
  createdAt: string;
  devices: Device[];
}

export interface Section {
  id: ID;
  pageId: ID;
  sourceId: ID;
  title: string;
  sectionTypeId: string;
  order: number;
  language: Locale;
  direction: Direction;
  industryId: string;
  styleId: string;
  typographyId: string;
  colorId: string;
  stackId: string;
  formatId: string;
  themeId: Theme;
  categoryId: string;
  tags: string[];
  createdAt: string;
  publishedAt: string;
  attribution: string;
  capturedAt: string;
}

export interface SectionCrop {
  id: ID;
  sectionId: ID;
  device: Device;
  assetId: ID; // The full page screenshot asset
  cropX: number;
  cropY: number;
  cropWidth: number;
  cropHeight: number;
  renderedAssetId: ID; // The actual cropped image asset
  width: number; // Required dimensions per spec
  height: number;
}

export interface Category {
  id: ID;
  nameKey: string;
  industryId?: string;
}

export interface Tag {
  id: string;
  name: string;
}

// Phase 8 / 4 entities (stubs for now as they are out of scope for Phase 2)
export interface Collection {
  id: ID;
  ownerId: ID;
  name: string;
  description?: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CollectionItem {
  id: ID;
  collectionId: ID;
  sectionId: ID;
  createdAt: string;
}

export interface Save {
  id: ID;
  userId: ID;
  sectionId: ID;
  createdAt: string;
}

export interface SearchResult<T> {
  items: T[];
  total: number;
  facets?: SearchFacets;
  nextCursor?: string;
}

export interface SearchFacets {
  sectionTypes: Record<string, number>;
  industries: Record<string, number>;
  styles: Record<string, number>;
  typographies: Record<string, number>;
  colors: Record<string, number>;
  stacks: Record<string, number>;
  formats: Record<string, number>;
  languages: Record<string, number>;
  devices: Record<string, number>;
  directions: Record<string, number>;
  themes: Record<string, number>;
  sources: Record<string, number>;
}
