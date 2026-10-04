import { t } from "@/i18n/messages";
import type { SupportedLocale } from "@/i18n/config";

/**
 * TEMPORARY QA AID — NOT A PRODUCT FEATURE.
 *
 * Remove this component once the Arabic content review is finished, or when
 * Phase 11 ships the real Arabic UI and locale — whichever comes first. See the
 * "Phase 06 handoff" section of `NEXT_STEPS.md`.
 *
 * Arabic reference content has existed as mock data since Phase 02, but the UI
 * stays English/LTR until Phase 11, so an Arabic reference is visually
 * indistinguishable from an English one while reviewing Explore and the gallery
 * by eye. This chip only exists to make those references findable during that
 * review.
 *
 * It deliberately carries no behaviour and no data of its own:
 * - it renders only when `NODE_ENV !== "production"`, using the same
 *   environment check as the `/dev/*` route guards, so a production build
 *   cannot contain it;
 * - it is absolutely positioned, so it can never change a card's measured
 *   height (the Phase 04 overlay rule);
 * - it is `aria-hidden`, so it adds nothing to the accessibility tree and
 *   cannot change what a screen reader announces about a card;
 * - it reads no fixture, taxonomy, or filter state — the caller passes a
 *   boolean derived from the card's own language.
 */
export function DevArabicMarker({ isArabic, locale }: { isArabic: boolean; locale: SupportedLocale }) {
  if (process.env.NODE_ENV === "production" || !isArabic) return null;

  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute top-2 start-2 z-10 rounded-sm bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground"
    >
      {t(locale, "dev.arabicMarker")}
    </span>
  );
}
