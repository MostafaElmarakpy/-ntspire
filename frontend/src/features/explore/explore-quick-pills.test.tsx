import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ExploreQuickPills } from "@/features/explore/explore-quick-pills";
import type { ExploreState } from "@/lib/explore-state";
import type { SearchFacets } from "@/types/domain";

const facets: SearchFacets = {
  sectionTypes: { hero: 6, pricing: 3 },
  industries: { saas: 5, ecommerce: 2 },
  styles: { dark: 4, minimal: 6 },
  typographies: { sans: 8, serif: 2 },
  colors: { blue: 5, neutral: 5 },
  stacks: { react: 6, nextjs: 4 },
  formats: { section: 10, "og-image": 1 },
  languages: { en: 9, ar: 2 },
  devices: { desktop: 11, mobile: 6 },
  directions: { ltr: 9, rtl: 2 },
  themes: { light: 8, dark: 3 },
  sources: {},
};

function renderPills(state: ExploreState = {}) {
  const onChange = vi.fn();
  render(<ExploreQuickPills locale="en" state={state} facets={facets} onChange={onChange} />);
  return { onChange };
}

describe("ExploreQuickPills", () => {
  it("renders one pill per backed value in the shared filter state", () => {
    renderPills();
    const group = screen.getByRole("group", { name: "Quick filters" });
    expect(group).toBeVisible();
    for (const name of ["Hero", "Pricing", "SaaS", "E-commerce", "Minimal", "Dark", "Serif", "React", "OG Image", "Arabic websites"]) {
      expect(group).toHaveTextContent(name);
    }
  });

  it("applies a pill without dropping the rest of the state", () => {
    const { onChange } = renderPills({ language: "ar" });
    fireEvent.click(screen.getByRole("button", { name: "React" }));
    expect(onChange).toHaveBeenCalledWith({ language: "ar", stackId: "react" });
  });

  it("clears the applied pill when chosen again", () => {
    const { onChange } = renderPills({ stackId: "react" });
    expect(screen.getByRole("button", { name: "React" })).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(screen.getByRole("button", { name: "React" }));
    expect(onChange).toHaveBeenCalledWith({});
  });

  it("marks the applied pill as pressed", () => {
    renderPills({ formatId: "og-image" });
    expect(screen.getByRole("button", { name: "OG Image" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Hero" })).toHaveAttribute("aria-pressed", "false");
  });

  it("hides pills whose facets report no data", () => {
    render(
      <ExploreQuickPills
        locale="en"
        state={{}}
        facets={{ ...facets, stacks: {}, formats: { section: 10 } }}
        onChange={vi.fn()}
      />,
    );
    expect(screen.queryByRole("button", { name: "React" })).toBeNull();
    expect(screen.queryByRole("button", { name: "OG Image" })).toBeNull();
    expect(screen.getByRole("button", { name: "Hero" })).toBeVisible();
  });
});
