import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ExploreFilterSheet } from "@/features/explore/explore-filters";
import type { SearchFacets } from "@/types/domain";

const facets: SearchFacets = {
  sectionTypes: { hero: 6, pricing: 3 },
  industries: { saas: 5, fintech: 3, ai: 0 },
  styles: { dark: 4, minimal: 6 },
  typographies: { sans: 8, serif: 2 },
  colors: { blue: 5, neutral: 5 },
  stacks: { react: 6, nextjs: 4 },
  formats: { section: 10, "og-image": 1 },
  languages: { en: 9, ar: 2 },
  devices: { desktop: 11, mobile: 6 },
  directions: { ltr: 9, rtl: 2 },
  themes: { light: 8, dark: 3 },
  sources: { "flowbase-homepage": 4 },
};

const TOTAL = 11;

function renderSheet(state = {}) {
  const onChange = vi.fn();
  render(<ExploreFilterSheet locale="en" state={state} facets={facets} total={TOTAL} onChange={onChange} />);
  return { onChange };
}

function openSheet() {
  fireEvent.click(screen.getByRole("button", { name: "Filters" }));
  return screen.getByRole("dialog", { name: "Filter references" });
}

describe("Explore filter sheet", () => {
  it("opens a drawer named by its title and described by its description", () => {
    renderSheet();
    const dialog = openSheet();
    const description = within(dialog).getByText("Choose the details that matter to your search.");
    expect(dialog.getAttribute("aria-describedby")).toBe(description.getAttribute("id"));
    expect(dialog.getAttribute("id")).not.toBe(description.getAttribute("id"));
    expect(within(dialog).getByRole("button", { name: "Close" })).toBeVisible();
  });

  it("drafts filter changes and applies them only on Apply", () => {
    const { onChange } = renderSheet();
    const dialog = openSheet();
    fireEvent.click(within(dialog).getByRole("button", { name: "SaaS 5" }));
    expect(onChange).not.toHaveBeenCalled();

    fireEvent.click(within(dialog).getByRole("button", { name: "Apply filters" }));
    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledWith({ industryId: "saas" });
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("clears the draft without touching applied state until Apply", () => {
    const { onChange } = renderSheet({ industryId: "saas" });
    const dialog = openSheet();
    fireEvent.click(within(dialog).getByRole("button", { name: "Clear filters" }));
    expect(onChange).not.toHaveBeenCalled();

    fireEvent.click(within(dialog).getByRole("button", { name: "Apply filters" }));
    expect(onChange).toHaveBeenCalledWith({});
  });

  it("closes on Escape and returns focus to the trigger", () => {
    renderSheet();
    const trigger = screen.getByRole("button", { name: "Filters" });
    trigger.focus();
    fireEvent.click(trigger);
    const dialog = screen.getByRole("dialog", { name: "Filter references" });
    expect(dialog).toBeVisible();

    fireEvent.keyDown(dialog, { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(trigger).toHaveFocus();
  });

  it("closes on the dismiss button", () => {
    renderSheet();
    const dialog = openSheet();
    fireEvent.click(within(dialog).getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
