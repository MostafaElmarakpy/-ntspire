import "server-only";
import { applyMockConfig } from "@/config/mock-config";
import { DIRECTIONS, LANGUAGES, getTaxonomyEntry } from "@/config/taxonomy";
import { MOCK_ASSETS, MOCK_PAGES, MOCK_SECTION_CROPS, MOCK_SECTIONS, MOCK_SOURCES } from "@/mocks/fixtures";
import { t } from "@/i18n/messages";
import type { SupportedLocale } from "@/i18n/config";
import type { Device, Page, Section } from "@/types/domain";
import type { CardImage, GalleryData, PageCardData, SectionCardData, SourceCardData } from "./types";

const findAsset = (id: string | undefined) => (id ? MOCK_ASSETS.find((asset) => asset.id === id) : undefined);
const findSource = (id: string) => MOCK_SOURCES.find((source) => source.id === id);

/** P4-04: the desktop crop is the default, the mobile crop the fallback. */
function pickSectionCrop(sectionId: string, preferred: Device = "desktop") {
  const crops = MOCK_SECTION_CROPS.filter((crop) => crop.sectionId === sectionId);
  return crops.find((crop) => crop.device === preferred) ?? crops[0];
}

function deviceAvailabilityLabel(locale: SupportedLocale, devices: Device[]): string {
  const hasDesktop = devices.includes("desktop");
  const hasMobile = devices.includes("mobile");
  if (hasDesktop && hasMobile) return t(locale, "gallery.deviceBoth");
  if (hasDesktop) return t(locale, "gallery.deviceDesktop");
  return t(locale, "gallery.deviceMobile");
}

function pageImage(page: Page): CardImage | undefined {
  const device: Device = page.devices.includes("desktop") ? "desktop" : "mobile";
  const asset = findAsset(`page-${page.id}-${device}`);
  if (!asset) return undefined;
  const source = findSource(page.sourceId);
  return { src: asset.url, width: asset.width, height: asset.height, alt: `${source?.name ?? page.sourceId}: ${page.title}` };
}

function toSectionCard(section: Section, locale: SupportedLocale): SectionCardData | undefined {
  const crop = pickSectionCrop(section.id);
  const asset = findAsset(crop?.renderedAssetId);
  const source = findSource(section.sourceId);
  const sectionType = getTaxonomyEntry("sectionType", section.sectionTypeId);
  if (!crop || !asset || !source || !sectionType) return undefined;

  const devices = MOCK_SECTION_CROPS
    .filter((entry) => entry.sectionId === section.id)
    .map((entry) => entry.device);

  return {
    id: section.id,
    title: section.title,
    sectionType: t(locale, sectionType.labelKey),
    sourceName: source.name,
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

function toPageCard(page: Page, locale: SupportedLocale): PageCardData | undefined {
  const image = pageImage(page);
  const source = findSource(page.sourceId);
  if (!image || !source) return undefined;

  const sectionCount = MOCK_SECTIONS.filter((section) => section.pageId === page.id).length;

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

function toSourceCard(sourceId: string, locale: SupportedLocale): SourceCardData | undefined {
  const source = findSource(sourceId);
  const pages = MOCK_PAGES.filter((page) => page.sourceId === sourceId);
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

/** Mirrors the service-layer `?__mock=` contract so the dev route is testable. */
export async function loadGalleryData(locale: SupportedLocale, mockQuery?: string): Promise<GalleryData> {
  return applyMockConfig(() => buildGalleryData(locale), mockQuery, emptyGalleryData());
}
