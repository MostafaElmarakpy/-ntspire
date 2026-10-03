import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FilterChip } from "@/components/filter-chip";
import { EmptyState, SectionSkeleton } from "@/components/content-states";
import { ErrorState } from "@/components/error-state";

describe("design system components", () => {
  it("selects and removes a filter chip independently", () => {
    const onSelect = vi.fn();
    const onRemove = vi.fn();
    render(<FilterChip label="Editorial" selected={false} removeLabel="Remove Editorial filter" onSelect={onSelect} onRemove={onRemove} />);
    const chip = screen.getByRole("button", { name: "Editorial" });
    expect(chip).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(chip);
    fireEvent.click(screen.getByRole("button", { name: "Remove Editorial filter" }));
    expect(onSelect).toHaveBeenCalledOnce();
    expect(onRemove).toHaveBeenCalledOnce();
  });

  it("renders empty and retryable error states", () => {
    const onRetry = vi.fn();
    render(
      <>
        <EmptyState title="Nothing here yet" description="References will appear here." />
        <ErrorState title="Could not load" description="Try again." retryLabel="Try again" onRetry={onRetry} />
      </>,
    );
    expect(screen.getByRole("heading", { name: "Nothing here yet" })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it("reserves section skeleton space from required dimensions", () => {
    render(<SectionSkeleton width={1440} height={800} label="Section card loading preview" />);
    expect(screen.getByRole("status", { name: "Section card loading preview" })).toBeVisible();
    expect(screen.getByRole("status").firstElementChild).toHaveStyle({ aspectRatio: "1440 / 800" });
  });
});
