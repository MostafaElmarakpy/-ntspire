import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { HeaderNav } from "@/components/site-header-nav";

const { pathname, query } = vi.hoisted(() => ({ pathname: "/en/explore", query: "" }));

vi.mock("next/navigation", () => ({
  usePathname: () => pathname,
  useSearchParams: () => new URLSearchParams(query),
}));

describe("HeaderNav", () => {
  it("marks the current destination with aria-current and leaves the rest muted", () => {
    render(<HeaderNav locale="en" />);

    const sections = screen.getByRole("link", { name: "Sections" });
    expect(sections).toHaveAttribute("aria-current", "page");
    expect(sections.className).toContain("text-foreground");

    const explore = screen.getByRole("link", { name: "Explore" });
    expect(explore).not.toHaveAttribute("aria-current");
    expect(explore.className).toContain("text-muted-foreground");
  });
});
