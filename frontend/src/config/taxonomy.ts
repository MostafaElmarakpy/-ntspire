import { Locale, Direction, Device, Theme } from "@/types/domain";

export interface TaxonomyEntry {
  id: string;
  labelKey: string; // Key for i18n
  aliases: {
    en: string[];
    ar: string[];
  };
}

export const SECTION_TYPES: TaxonomyEntry[] = [
  { id: "navbar", labelKey: "taxonomy.sectionType.navbar", aliases: { en: ["Navbar", "Navigation", "Header"], ar: [] } },
  { id: "hero", labelKey: "taxonomy.sectionType.hero", aliases: { en: ["Hero", "Above the fold", "Intro"], ar: [] } },
  { id: "value_proposition", labelKey: "taxonomy.sectionType.value_proposition", aliases: { en: ["Value Proposition", "Benefits"], ar: [] } },
  { id: "features", labelKey: "taxonomy.sectionType.features", aliases: { en: ["Features", "Product features"], ar: [] } },
  { id: "logo_cloud", labelKey: "taxonomy.sectionType.logo_cloud", aliases: { en: ["Logo Cloud", "Trusted by", "Partners"], ar: [] } },
  { id: "stats", labelKey: "taxonomy.sectionType.stats", aliases: { en: ["Stats", "Numbers", "Metrics"], ar: [] } },
  { id: "testimonials", labelKey: "taxonomy.sectionType.testimonials", aliases: { en: ["Testimonials", "Reviews", "Social proof"], ar: [] } },
  { id: "pricing", labelKey: "taxonomy.sectionType.pricing", aliases: { en: ["Pricing", "Plans", "Subscriptions"], ar: [] } },
  { id: "cta", labelKey: "taxonomy.sectionType.cta", aliases: { en: ["CTA", "Call to Action"], ar: [] } },
  { id: "faq", labelKey: "taxonomy.sectionType.faq", aliases: { en: ["FAQ", "Frequently Asked Questions"], ar: [] } },
  { id: "contact", labelKey: "taxonomy.sectionType.contact", aliases: { en: ["Contact", "Get in touch"], ar: [] } },
  { id: "team", labelKey: "taxonomy.sectionType.team", aliases: { en: ["Team", "About us", "People"], ar: [] } },
  { id: "gallery", labelKey: "taxonomy.sectionType.gallery", aliases: { en: ["Gallery", "Showcase", "Images"], ar: [] } },
  { id: "blog", labelKey: "taxonomy.sectionType.blog", aliases: { en: ["Blog", "Articles", "News"], ar: [] } },
  { id: "login", labelKey: "taxonomy.sectionType.login", aliases: { en: ["Login", "Sign in"], ar: [] } },
  { id: "signup", labelKey: "taxonomy.sectionType.signup", aliases: { en: ["Signup", "Sign up", "Register"], ar: [] } },
  { id: "dashboard", labelKey: "taxonomy.sectionType.dashboard", aliases: { en: ["Dashboard", "App UI"], ar: [] } },
  { id: "checkout", labelKey: "taxonomy.sectionType.checkout", aliases: { en: ["Checkout", "Payment"], ar: [] } },
  { id: "profile", labelKey: "taxonomy.sectionType.profile", aliases: { en: ["Profile", "User account"], ar: [] } },
  { id: "settings", labelKey: "taxonomy.sectionType.settings", aliases: { en: ["Settings", "Preferences"], ar: [] } },
  { id: "footer", labelKey: "taxonomy.sectionType.footer", aliases: { en: ["Footer", "Sitemap"], ar: [] } },
];

export const INDUSTRIES: TaxonomyEntry[] = [
  { id: "saas", labelKey: "taxonomy.industry.saas", aliases: { en: ["SaaS", "Software as a Service"], ar: [] } },
  { id: "fintech", labelKey: "taxonomy.industry.fintech", aliases: { en: ["Fintech", "Finance"], ar: [] } },
  { id: "ai", labelKey: "taxonomy.industry.ai", aliases: { en: ["AI", "Artificial Intelligence"], ar: [] } },
  { id: "ecommerce", labelKey: "taxonomy.industry.ecommerce", aliases: { en: ["ecommerce", "E-commerce", "Online Store", "Retail"], ar: [] } },
  { id: "agency", labelKey: "taxonomy.industry.agency", aliases: { en: ["Agency", "Studio", "Creative"], ar: [] } },
  { id: "portfolio", labelKey: "taxonomy.industry.portfolio", aliases: { en: ["Portfolio", "Personal website"], ar: [] } },
  { id: "finance", labelKey: "taxonomy.industry.finance", aliases: { en: ["Finance", "Banking"], ar: [] } },
  { id: "healthcare", labelKey: "taxonomy.industry.healthcare", aliases: { en: ["Healthcare", "Medical"], ar: [] } },
  { id: "education", labelKey: "taxonomy.industry.education", aliases: { en: ["Education", "Learning", "EdTech"], ar: [] } },
  { id: "marketing", labelKey: "taxonomy.industry.marketing", aliases: { en: ["Marketing", "Advertising"], ar: [] } },
  { id: "travel", labelKey: "taxonomy.industry.travel", aliases: { en: ["Travel", "Tourism"], ar: [] } },
  { id: "food", labelKey: "taxonomy.industry.food", aliases: { en: ["Food", "Restaurant", "Delivery"], ar: [] } },
];

export const STYLES: TaxonomyEntry[] = [
  { id: "minimal", labelKey: "taxonomy.style.minimal", aliases: { en: ["Minimal", "Clean"], ar: [] } },
  { id: "modern", labelKey: "taxonomy.style.modern", aliases: { en: ["Modern"], ar: [] } },
  { id: "dark", labelKey: "taxonomy.style.dark", aliases: { en: ["Dark mode", "Dark UI"], ar: [] } },
  { id: "light", labelKey: "taxonomy.style.light", aliases: { en: ["Light mode", "Light UI"], ar: [] } },
  { id: "editorial", labelKey: "taxonomy.style.editorial", aliases: { en: ["Editorial", "Newspaper", "Magazine"], ar: [] } },
  { id: "brutalist", labelKey: "taxonomy.style.brutalist", aliases: { en: ["Brutalist"], ar: [] } },
  { id: "gradient", labelKey: "taxonomy.style.gradient", aliases: { en: ["Gradient"], ar: [] } },
  { id: "colorful", labelKey: "taxonomy.style.colorful", aliases: { en: ["Colorful", "Vibrant"], ar: [] } },
  { id: "monochrome", labelKey: "taxonomy.style.monochrome", aliases: { en: ["Monochrome", "Black and White"], ar: [] } },
  { id: "illustration", labelKey: "taxonomy.style.illustration", aliases: { en: ["Illustration", "Illustrated"], ar: [] } },
  { id: "typography", labelKey: "taxonomy.style.typography", aliases: { en: ["Typography-focused", "Type-first"], ar: [] } },
];

export const LANGUAGES: { id: Locale; labelKey: string }[] = [
  { id: "en", labelKey: "taxonomy.language.en" },
  { id: "ar", labelKey: "taxonomy.language.ar" },
];

export const DIRECTIONS: { id: Direction; labelKey: string }[] = [
  { id: "ltr", labelKey: "taxonomy.direction.ltr" },
  { id: "rtl", labelKey: "taxonomy.direction.rtl" },
];

export const DEVICES: { id: Device; labelKey: string }[] = [
  { id: "desktop", labelKey: "taxonomy.device.desktop" },
  { id: "mobile", labelKey: "taxonomy.device.mobile" },
];

export const THEMES: { id: Theme; labelKey: string }[] = [
  { id: "light", labelKey: "taxonomy.theme.light" },
  { id: "dark", labelKey: "taxonomy.theme.dark" },
];

export interface QuickFilterChip {
  id: string;
  labelKey: string;
  type: "sectionType" | "industry" | "style" | "language";
  value: string;
}

export const QUICK_FILTER_CHIPS: QuickFilterChip[] = [
  { id: "hero", labelKey: "taxonomy.sectionType.hero", type: "sectionType", value: "hero" },
  { id: "pricing", labelKey: "taxonomy.sectionType.pricing", type: "sectionType", value: "pricing" },
  { id: "saas", labelKey: "taxonomy.industry.saas", type: "industry", value: "saas" },
  { id: "ecommerce", labelKey: "taxonomy.industry.ecommerce", type: "industry", value: "ecommerce" },
  { id: "minimal", labelKey: "taxonomy.style.minimal", type: "style", value: "minimal" },
  { id: "dark", labelKey: "taxonomy.style.dark", type: "style", value: "dark" },
  { id: "arabic-websites", labelKey: "taxonomy.quickFilter.arabicWebsites", type: "language", value: "ar" },
];

export const CATEGORY_IDS: Record<string, string> = Object.fromEntries(
  INDUSTRIES.map((industry) => [industry.id, `category-${industry.id}`]),
);

export const getTaxonomyEntry = (
  group: "sectionType" | "industry" | "style",
  id: string,
): TaxonomyEntry | undefined => {
  const entries = group === "sectionType" ? SECTION_TYPES : group === "industry" ? INDUSTRIES : STYLES;
  return entries.find((entry) => entry.id === id);
};
