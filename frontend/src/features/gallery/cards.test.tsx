import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SaveButton } from "@/components/save-button";
import { configureSavedStore, resetSavedStore } from "@/lib/saved-store";
import { createMockSaveService, type SaveService } from "@/lib/save-service";
import type { Device } from "@/types/domain";
import { PageCard } from "./page-card";
import { SectionCard } from "./section-card";
import { SourceCard } from "./source-card";
import type { CardImage, PageCardData, SectionCardData, SourceCardData } from "./types";

const image: CardImage = {
  src: "/mock-assets/crop-section-1-desktop.svg",
  width: 1440,
  height: 640,
  alt: "Northwind Ledger: Editorial hero",
};

const sectionCard = (overrides: Partial<SectionCardData> = {}): SectionCardData => ({
  id: "section-1",
  title: "Editorial hero with an oversized serif headline",
  sectionType: "Hero",
  sourceName: "Northwind Ledger",
  tags: ["editorial", "serif", "high-contrast", "full-bleed", "minimal"],
  tagsLabel: "Reference tags",
  language: "English",
  isArabic: false,
  devices: ["desktop", "mobile"],
  devicesLabel: "Desktop and mobile",
  image,
  ...overrides,
});

const pageCard = (overrides: Partial<PageCardData> = {}): PageCardData => ({
  id: "page-1",
  title: "Northwind Ledger — Home",
  sourceName: "Northwind Ledger",
  language: "English",
  isArabic: false,
  direction: "Left to right",
  devicesLabel: "Desktop and mobile",
  sectionCount: 6,
  sectionCountLabel: "sections",
  image,
  ...overrides,
});

const sourceCard = (overrides: Partial<SourceCardData> = {}): SourceCardData => ({
  id: "source-1",
  name: "Northwind Ledger",
  description: "A business daily with a dense editorial grid.",
  industry: "News",
  isArabic: false,
  pageCount: 3,
  pageCountLabel: "pages",
  image,
  ...overrides,
});

beforeEach(() => {
  window.localStorage.clear();
  resetSavedStore();
});

afterEach(() => {
  resetSavedStore();
  vi.restoreAllMocks();
});

describe("SectionCard", () => {
  it("renders at most three tags even when a section has more", () => {
    render(<SectionCard card={sectionCard()} locale="en" openHref="#card-section-1" />);

    const tags = screen.getAllByRole("listitem").map((item) => item.textContent);
    expect(tags).toEqual(["editorial", "serif", "high-contrast"]);
    expect(screen.queryByText("full-bleed")).not.toBeInTheDocument();
  });

  it("keeps a long title on one line so the card cannot outgrow its column", () => {
    const title = "A very long editorial headline that would otherwise wrap across several lines";
    render(<SectionCard card={sectionCard({ title })} locale="en" openHref="#card-section-1" />);

    const heading = screen.getByRole("heading", { name: title });
    expect(heading).toHaveClass("truncate");
  });

  it.each<{ devices: Device[]; devicesLabel: string }>([
    { devices: ["desktop", "mobile"], devicesLabel: "Desktop and mobile" },
    { devices: ["desktop"], devicesLabel: "Desktop only" },
    { devices: ["mobile"], devicesLabel: "Mobile only" },
  ])("shows device availability as $devicesLabel", ({ devices, devicesLabel }) => {
    render(<SectionCard card={sectionCard({ devices, devicesLabel })} locale="en" openHref="#card-section-1" />);
    expect(screen.getByText(new RegExp(devicesLabel))).toBeVisible();
  });

  it("renders an uncropped, naturally sized image", () => {
    render(<SectionCard card={sectionCard()} locale="en" openHref="#card-section-1" />);

    const cardImage = screen.getByRole("img", { name: image.alt });
    expect(cardImage).toHaveClass("h-auto", "w-full");
    expect(cardImage.className).not.toMatch(/object-cover/);
    expect(cardImage.className).not.toMatch(/(?:^|\s)h-\d/);
    expect(cardImage).toHaveAttribute("width", String(image.width));
    expect(cardImage).toHaveAttribute("height", String(image.height));
  });

  it("exposes Save and Open actions with accessible names", () => {
    render(<SectionCard card={sectionCard()} locale="en" openHref="#card-section-1" />);

    expect(screen.getByRole("group", { name: "Reference actions" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save reference" })).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("link", { name: "Open reference: Editorial hero with an oversized serif headline" })).toHaveAttribute("href", "#card-section-1");
  });

  it("marks an Arabic reference with the dev-only Arabic chip", () => {
    render(<SectionCard card={sectionCard({ isArabic: true })} locale="en" openHref="#card-section-1" />);

    expect(screen.getByText("AR")).toBeVisible();
  });

  it("leaves a reference that is not Arabic unmarked", () => {
    render(<SectionCard card={sectionCard()} locale="en" openHref="#card-section-1" />);

    expect(screen.queryByText("AR")).not.toBeInTheDocument();
  });
});

describe("PageCard and SourceCard", () => {
  it("renders a page reference with its source, language, direction and device availability", () => {
    render(<PageCard card={pageCard()} locale="en" />);

    expect(screen.getByRole("heading", { name: "Northwind Ledger — Home" })).toBeVisible();
    expect(screen.getByText("Northwind Ledger")).toBeVisible();
    expect(screen.getByText(/Left to right/)).toBeVisible();
    expect(screen.getByText(/6 sections/)).toBeVisible();
    expect(screen.getByRole("img", { name: image.alt }).className).not.toMatch(/object-cover/);
  });

  it("renders a website reference card without save or open actions", () => {
    render(<SourceCard card={sourceCard()} locale="en" />);

    expect(screen.getByRole("heading", { name: "Northwind Ledger" })).toBeVisible();
    expect(screen.getByText("News")).toBeVisible();
    expect(screen.getByText("A business daily with a dense editorial grid.")).toBeVisible();
    expect(screen.getByText(/3 pages/)).toBeVisible();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});

describe("SaveButton", () => {
  function renderWithService(service: SaveService) {
    configureSavedStore({ service, savedIds: new Set(), loaded: true });
    render(<SaveButton sectionId="section-1" locale="en" presentation="inline" />);
    return service;
  }

  it("toggles the accessible pressed state and persists the save", async () => {
    renderWithService(createMockSaveService());
    const button = screen.getByRole("button", { name: "Save reference" });

    expect(button).toHaveAttribute("aria-pressed", "false");
    expect(button).toHaveTextContent("Save");

    fireEvent.click(button);
    await waitFor(() => expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "true"));
    await waitFor(() => expect(screen.getByRole("button")).not.toBeDisabled());
    expect(screen.getByRole("button", { name: "Remove reference from saved" })).toHaveTextContent("Saved");

    fireEvent.click(screen.getByRole("button"));
    await waitFor(() => expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "false"));
    await waitFor(() => expect(JSON.parse(window.localStorage.getItem("ntspire:saves:v1") ?? "{}").saves).toEqual([]));
    expect(screen.getByRole("button", { name: "Save reference" })).toBeVisible();
  });

  it("rolls the pressed state back when the save fails", async () => {
    const service = createMockSaveService();
    vi.spyOn(service, "save").mockRejectedValue(new Error("storage unavailable"));
    renderWithService(service);

    fireEvent.click(screen.getByRole("button", { name: "Save reference" }));
    await waitFor(() => expect(screen.getByRole("button")).not.toBeDisabled());
    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "false");
  });
});
