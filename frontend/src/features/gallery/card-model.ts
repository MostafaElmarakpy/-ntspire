import { DIRECTIONS, LANGUAGES, getTaxonomyEntry } from "@/config/taxonomy";
import { MOCK_ASSETS, MOCK_PAGES, MOCK_SECTION_CROPS, MOCK_SECTIONS, MOCK_SOURCES } from "@/mocks/fixtures";
import { t } from "@/i18n/messages";
import type { SupportedLocale } from "@/i18n/config";
import { sourceSlug } from "@/lib/slugs";
import type { Device, Page, Section } from "@/types/domain";
import type { CardImage, GalleryData, PageCardData, SectionCardData, SourceCardData } from "./types";

/**
 * The view-model builders below are the single place a domain record becomes
 * card data, so the gallery, Explore, and the Phase 07 index and detail pages
 * all render the same fields from the same rules.
 *
 * This module is deliberately free of `server-only`: the rules are pure, and
 * keeping them here is what lets the detail-page view models and their tests
 * run without a server context.
 */

const findAsset = (id: string | undefined) => (id ? MOCK_ASSETS.find((asset) => asset.id === id) : undefined);
const findSource = (id: string) => MOCK_SOURCES.find((source) => source.id === id);

export function sourceSections(sourceId: string): Section[] {
  return MOCK_SECTIONS.filter((section) => section.sourceId === sourceId);
}

export function pageSections(pageId: string): Section[] {
  return MOCK_SECTIONS.filter((section) => section.pageId === pageId);
}

export function sourcePages(sourceId: string): Page[] {
  return MOCK_PAGES.filter((page) => page.sourceId === sourceId);
}

export function sectionCrops(sectionId: string) {
  return MOCK_SECTION_CROPS.filter((crop) => crop.sectionId === sectionId);
}

export function assetById(id: string | undefined) {
  return findAsset(id);
}

export function sourceById(id: string) {
  return findSource(id);
}

export function pageById(id: string) {
  return MOCK_PAGES.find((page) => page.id === id);
}

export function sectionById(id: string) {
  return MOCK_SECTIONS.find((section) => section.id === id);
}

/** P4-04: the desktop crop is the default, the mobile crop the fallback. */
export function pickSectionCrop(sectionId: string, preferred: Device = "desktop") {
  const crops = sectionCrops(sectionId);
  return crops.find((crop) => crop.device === preferred) ?? crops[0];
}

export function deviceAvailabilityLabel(locale: SupportedLocale, devices: Device[]): string {
  const hasDesktop = devices.includes("desktop");
  const hasMobile = devices.includes("mobile");
  if (hasDesktop && hasMobile) return t(locale, "gallery.deviceBoth");
  if (hasDesktop) return t(locale, "gallery.deviceDesktop");
  return t(locale, "gallery.deviceMobile");
}

export function pageImage(page: Page): CardImage | undefined {
  const device: Device = page.devices.includes("desktop") ? "desktop" : "mobile";
  const asset = findAsset(`page-${page.id}-${device}`);
  if (!asset) return undefined;
  const source = findSource(page.sourceId);
  return { src: asset.url, width: asset.width, height: asset.height, alt: `${source?.name ?? page.sourceId}: ${page.title}` };
}

/**
 * A section's card. `preferredDevice` only chooses which of the section's own
 * crops the card shows — Explore uses it so a mobile-filtered result shows the
 * mobile crop, and a section without that crop falls back to the one it has
 * rather than borrowing the other device's coordinates.
 */
export function toSectionCard(section: Section, locale: SupportedLocale, preferredDevice?: Device): SectionCardData | undefined {
  const crop = pickSectionCrop(section.id, preferredDevice);
  const asset = findAsset(crop?.renderedAssetId);
  const source = findSource(section.sourceId);
  const sectionType = getTaxonomyEntry("sectionType", section.sectionTypeId);
  if (!crop || !asset || !source || !sectionType) return undefined;

  const devices = sectionCrops(section.id).map((entry) => entry.device);

  return {
    id: section.id,
    title: section.title,
    sectionType: t(locale, sectionType.labelKey),
    sourceName: source.name,
    sourceSlug: sourceSlug(source.id),
    sourceInitial: Array.from(source.name)[0]?.toLocaleUpperCase(locale) ?? "?",
    tags: section.tags,
    tagsLabel: t(locale, "gallery.tagsLabel"),
    language: t(locale, LANGUAGES.find((entry) => entry.id === section.language)!.labelKey),
    isArabic: section.language === "ar",
    devices,
    devicesLabel: deviceAvailabilityLabel(locale, devices),
    image: {
      src: asset.url,
      width: asset.width,
      height: asset.height,
      alt: `${source.name}: ${section.title}`,
    },
  };
}

export function toPageCard(page: Page, locale: SupportedLocale): PageCardData | undefined {
  const image = pageImage(page);
  const source = findSource(page.sourceId);
  if (!image || !source) return undefined;

  const sectionCount = pageSections(page.id).length;

  return {
    id: page.id,
    title: page.title,
    sourceName: source.name,
    language: t(locale, LANGUAGES.find((entry) => entry.id === page.language)!.labelKey),
    isArabic: page.language === "ar",
    direction: t(locale, DIRECTIONS.find((entry) => entry.id === page.direction)!.labelKey),
    devicesLabel: deviceAvailabilityLabel(locale, page.devices),
    sectionCount,
    sectionCountLabel: t(locale, "gallery.sectionCount"),
    image,
  };
}

export function toSourceCard(sourceId: string, locale: SupportedLocale): SourceCardData | undefined {
  const source = findSource(sourceId);
  const pages = sourcePages(sourceId);
  const image = pages[0] ? pageImage(pages[0]) : undefined;
  const industry = source ? getTaxonomyEntry("industry", source.industryId) : undefined;
  if (!source || !image || !industry) return undefined;

  return {
    id: source.id,
    name: source.name,
    description: source.description,
    industry: t(locale, industry.labelKey),
    isArabic: pages.some((page) => page.language === "ar"),
    pageCount: pages.length,
    pageCountLabel: t(locale, "gallery.pageCount"),
    image,
  };
}

export function buildGalleryData(locale: SupportedLocale): GalleryData {
  return {
    sections: MOCK_SECTIONS.map((section) => toSectionCard(section, locale)).filter((card): card is SectionCardData => Boolean(card)),
    pages: MOCK_PAGES.map((page) => toPageCard(page, locale)).filter((card): card is PageCardData => Boolean(card)),
    sources: MOCK_SOURCES.map((source) => toSourceCard(source.id, locale)).filter((card): card is SourceCardData => Boolean(card)),
  };
}

export function emptyGalleryData(): GalleryData {
  return { sections: [], pages: [], sources: [] };
}
