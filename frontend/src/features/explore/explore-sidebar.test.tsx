import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ExploreSidebar } from "@/features/explore/explore-sidebar";
import type { ExploreState } from "@/lib/explore-state";
import type { SearchFacets } from "@/types/domain";

/**
 * These tests cover the sidebar that replaced Explore's horizontal dropdown bar.
 * They assert the same behaviours the bar's tests did — a filter applies, the
 * rest of the state survives, an applied filter can be cleared — plus the one
 * guarantee the replacement must not break: every filter the bar exposed is
 * still reachable.
 */

const facets: SearchFacets = {
  sectionTypes: { hero: 6, pricing: 3 },
  industries: { saas: 5, fintech: 3, ai: 0 },
  styles: { dark: 4, minimal: 6 },
  languages: { en: 9, ar: 2 },
  devices: { desktop: 11, mobile: 6 },
  directions: { ltr: 9, rtl: 2 },
  themes: { light: 8, dark: 3 },
  sources: { "flowbase-homepage": 4 },
};

const TOTAL = 11;

function renderSidebar(overrides: { state?: ExploreState; onChange?: (state: ExploreState) => void } = {}) {
  const onChange = overrides.onChange ?? vi.fn();
  render(
    <ExploreSidebar
      locale="en"
      state={overrides.state ?? {}}
      facets={facets}
      total={TOTAL}
      onChange={onChange}
    />,
  );
  return { onChange };
}

const industriesRegion = () => screen.getByRole("region", { name: "Industries" });
const discoverNav = () => screen.getByRole("navigation", { name: "Discover" });

describe("Explore sidebar", () => {
  it("keeps every filter the removed dropdown bar exposed", () => {
    renderSidebar();
    for (const label of ["Section type", "Style", "Language", "Direction", "Device", "Theme"]) {
      expect(screen.getByRole("button", { name: label })).toBeVisible();
    }
    expect(industriesRegion()).toBeVisible();
    expect(discoverNav()).toBeVisible();
  });

  it("lists the Discover reference types, with the Sources index disabled until its route exists", () => {
    renderSidebar();
    expect(within(discoverNav()).getByRole("button", { name: /^Website/ })).toBeDisabled();
    expect(within(discoverNav()).getByRole("button", { name: "Sections" })).toBeEnabled();
    expect(within(discoverNav()).getByRole("button", { name: "Mobile" })).toBeEnabled();
  });

  it("marks the unavailable Sources index with a visible Soon badge, not just a disabled button", () => {
    renderSidebar();
    const website = within(discoverNav()).getByRole("button", { name: /^Website/ });
    expect(website).toBeDisabled();
    expect(within(website).getByText("Soon")).toBeVisible();
    expect(website).toHaveAccessibleName(/Not available yet/);
  });

  it("lists every Industry with its live facet count, and the total on All", () => {
    renderSidebar();
    const industries = within(industriesRegion());
    expect(industries.getByRole("button", { name: `All ${TOTAL}` })).toBeVisible();
    expect(industries.getByRole("button", { name: "SaaS 5" })).toBeVisible();
    expect(industries.getByRole("button", { name: "Fintech 3" })).toBeVisible();
    expect(industries.getByRole("button", { name: "AI 0" })).toBeVisible();
  });

  it("applies an Industry filter without dropping the rest of the state", () => {
    const { onChange } = renderSidebar({ state: { language: "ar", sortBy: "featured" } });
    fireEvent.click(within(industriesRegion()).getByRole("button", { name: "SaaS 5" }));
    expect(onChange).toHaveBeenCalledWith({ language: "ar", sortBy: "featured", industryId: "saas" });
  });

  it("clears the Industry filter when the applied entry is chosen again or All is used", () => {
    const first = vi.fn();
    const { unmount } = render(
      <ExploreSidebar locale="en" state={{ industryId: "saas" }} facets={facets} total={TOTAL} onChange={first} />,
    );
    fireEvent.click(within(industriesRegion()).getByRole("button", { name: "SaaS 5" }));
    expect(first).toHaveBeenCalledWith({});
    unmount();

    const second = vi.fn();
    render(<ExploreSidebar locale="en" state={{ industryId: "saas" }} facets={facets} total={TOTAL} onChange={second} />);
    fireEvent.click(within(industriesRegion()).getByRole("button", { name: `All ${TOTAL}` }));
    expect(second).toHaveBeenCalledWith({});
  });

  it("marks the applied Industry entry as pressed", () => {
    renderSidebar({ state: { industryId: "fintech" } });
    expect(within(industriesRegion()).getByRole("button", { name: "Fintech 3" })).toHaveAttribute("aria-pressed", "true");
    expect(within(industriesRegion()).getByRole("button", { name: "SaaS 5" })).toHaveAttribute("aria-pressed", "false");
  });

  it("drives the device filter from the Discover entries", () => {
    const toMobile = vi.fn();
    const { unmount } = render(
      <ExploreSidebar locale="en" state={{ industryId: "saas" }} facets={facets} total={TOTAL} onChange={toMobile} />,
    );
    expect(within(discoverNav()).getByRole("button", { name: "Sections" })).toHaveAttribute("aria-current", "true");
    fireEvent.click(within(discoverNav()).getByRole("button", { name: "Mobile" }));
    expect(toMobile).toHaveBeenCalledWith({ industryId: "saas", device: "mobile" });
    unmount();

    const toSections = vi.fn();
    render(
      <ExploreSidebar locale="en" state={{ device: "mobile" }} facets={facets} total={TOTAL} onChange={toSections} />,
    );
    expect(within(discoverNav()).getByRole("button", { name: "Mobile" })).toHaveAttribute("aria-current", "true");
    fireEvent.click(within(discoverNav()).getByRole("button", { name: "Sections" }));
    expect(toSections).toHaveBeenCalledWith({});
  });

  it("reveals a collapsed group's options and applies the chosen value", () => {
    const { onChange } = renderSidebar();
    const toggle = screen.getByRole("button", { name: "Style" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("button", { name: "Dark 4" })).toBeNull();

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");

    fireEvent.click(screen.getByRole("button", { name: "Dark 4" }));
    expect(onChange).toHaveBeenCalledWith({ styleId: "dark" });
  });

  it("starts a group that carries an applied value already expanded", () => {
    renderSidebar({ state: { sectionTypeId: "hero" } });
    expect(screen.getByRole("button", { name: "Section type" })).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("button", { name: "Hero 6" })).toBeVisible();
  });
});
