import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DevArabicMarker } from "./dev-arabic-marker";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("DevArabicMarker", () => {
  it("marks Arabic content outside a production build", () => {
    render(<DevArabicMarker isArabic locale="en" />);

    const marker = screen.getByText("AR");
    expect(marker).toBeVisible();
    expect(marker).toHaveAttribute("aria-hidden", "true");
  });

  it("is positioned out of flow, so it can never change a card's height", () => {
    render(<DevArabicMarker isArabic locale="en" />);

    // The Phase 04 rule: overlay annotations are absolutely positioned. A marker
    // in normal flow would add to the card's measured height and shift the
    // masonry columns.
    expect(screen.getByText("AR")).toHaveClass("absolute");
  });

  it("never renders inside a production build", () => {
    vi.stubEnv("NODE_ENV", "production");
    render(<DevArabicMarker isArabic locale="en" />);

    expect(screen.queryByText("AR")).not.toBeInTheDocument();
    expect(screen.queryByText("AR", { exact: true })).toBeNull();
  });

  it("renders nothing for content that is not Arabic", () => {
    render(<DevArabicMarker isArabic={false} locale="en" />);

    expect(screen.queryByText("AR")).not.toBeInTheDocument();
  });
});
