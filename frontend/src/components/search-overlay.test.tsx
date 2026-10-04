import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SearchOverlay } from "@/components/search-overlay";
import { getAnalyticsEvents, resetAnalyticsEvents } from "@/lib/analytics";
import { saveRecentSearches } from "@/lib/recent-searches";
import type { SearchSuggestion } from "@/types/services";

const { push } = vi.hoisted(() => ({ push: vi.fn() }));

vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

/**
 * The overlay is the discovery half of search: it parses what is typed, offers
 * the taxonomy's own vocabulary, and hands the result to Explore through the
 * same URL state Explore itself uses. These tests drive it the way a person
 * does — through the trigger, the input and the keyboard.
 */

const FACETS = {
  sectionTypes: { hero: 6, pricing: 3 },
  industries: { saas: 5, fintech: 3 },
  styles: { dark: 4, minimal: 0 },
  languages: { en: 9, ar: 2 },
  devices: { desktop: 11, mobile: 6 },
  directions: { ltr: 9, rtl: 2 },
  themes: { light: 8, dark: 3 },
  sources: {},
};

const suggestionsPayload = (suggestions: SearchSuggestion[]) => ({ data: { suggestions } });

/** Answers both routes the overlay reads, so the panel reaches its settled state. */
function stubFetch(suggestions: SearchSuggestion[] = [{ kind: "sectionType", id: "hero" }, { kind: "source", id: "src-barstow", label: "Barstow" }]) {
  const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input);
    const payload = url.startsWith("/api/search/suggest")
      ? suggestionsPayload(suggestions)
      : { data: { facets: FACETS, total: 11 } };
    return { ok: true, json: async () => payload } as Response;
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

async function openOverlay() {
  render(<SearchOverlay locale="en" triggerLabel="Search" />);
  fireEvent.click(screen.getByRole("button", { name: "Search" }));
  const input = await screen.findByRole("combobox");
  // The counts arrive from the Explore route; waiting keeps those state updates inside act().
  await waitFor(() => expect(screen.getByText("11 references")).toBeVisible());
  return input;
}

const type = (input: HTMLElement, value: string) => fireEvent.change(input, { target: { value } });

beforeEach(() => {
  window.localStorage.clear();
  push.mockReset();
  resetAnalyticsEvents();
  stubFetch();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Search overlay", () => {
  it("opens from its trigger and focuses the query field", async () => {
    const input = await openOverlay();
    expect(input).toHaveFocus();
    expect(input).toHaveAttribute("placeholder", "Sites, Categories, Sections or Styles…");
  });

  it("shows the taxonomy's own vocabulary with live counts before anything is typed", async () => {
    await openOverlay();
    const trending = screen.getByRole("listbox", { name: "Search filters" });
    expect(within(trending).getByRole("option", { name: "Hero 6" })).toBeVisible();
    expect(within(trending).getByRole("option", { name: "SaaS 5" })).toBeVisible();
  });

  it("switches the left tab list, keeping every tab and its counts reachable", async () => {
    await openOverlay();
    fireEvent.click(screen.getByRole("tab", { name: "Categories" }));
    const panel = screen.getByRole("tabpanel");
    expect(within(panel).getByRole("option", { name: "SaaS 5" })).toBeVisible();
    expect(within(panel).getByRole("option", { name: "Fintech 3" })).toBeVisible();
    expect(screen.getByRole("tab", { name: "Styles" })).toBeEnabled();
  });

  it("toggles a quick filter, including the permanent Arabic Websites chip", async () => {
    await openOverlay();
    const arabic = screen.getByRole("button", { name: "Arabic websites" });
    expect(arabic).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(arabic);
    expect(arabic).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(arabic);
    expect(arabic).toHaveAttribute("aria-pressed", "false");
  });

  it("reveals colour, direction and theme behind More filters", async () => {
    await openOverlay();
    expect(screen.queryByTestId("more-filters")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "More filters" }));
    const more = screen.getByTestId("more-filters");
    expect(within(more).getByRole("button", { name: "Right to left" })).toBeVisible();
    expect(within(more).getByRole("button", { name: "Dark" })).toBeVisible();
  });

  it("detects filters from free text and leaves the remaining words alone", async () => {
    const input = await openOverlay();
    type(input, "Arabic SaaS Hero landing page");

    const detected = screen.getByTestId("detected-filters");
    expect(within(detected).getByRole("button", { name: "Remove detected filter: Arabic" })).toBeVisible();
    expect(within(detected).getByRole("button", { name: "Remove detected filter: SaaS" })).toBeVisible();
    expect(within(detected).getByRole("button", { name: "Remove detected filter: Hero" })).toBeVisible();
  });

  it("removes one detected filter without rewriting what the user typed", async () => {
    const input = await openOverlay();
    type(input, "Arabic SaaS Hero landing page");

    fireEvent.click(screen.getByRole("button", { name: "Remove detected filter: SaaS" }));

    const detected = screen.getByTestId("detected-filters");
    expect(within(detected).queryByRole("button", { name: "Remove detected filter: SaaS" })).toBeNull();
    expect(within(detected).getByRole("button", { name: "Remove detected filter: Hero" })).toBeVisible();
    expect(input).toHaveValue("Arabic SaaS Hero landing page");
  });

  it("keeps the typed text even after every detected filter is removed", async () => {
    const input = await openOverlay();
    type(input, "Arabic SaaS Hero");
    for (const label of ["Arabic", "SaaS", "Hero"]) {
      fireEvent.click(screen.getByRole("button", { name: `Remove detected filter: ${label}` }));
    }
    expect(screen.queryByTestId("detected-filters")).toBeNull();
    expect(input).toHaveValue("Arabic SaaS Hero");
  });

  it("offers debounced suggestions from the search service", async () => {
    const fetchMock = stubFetch();
    const input = await openOverlay();
    type(input, "her");

    const suggestions = await screen.findByRole("listbox", { name: "Search suggestions" });
    await waitFor(() => expect(within(suggestions).getByRole("option", { name: "Hero" })).toBeVisible());
    expect(within(suggestions).getByRole("option", { name: "Barstow" })).toBeVisible();
    expect(fetchMock.mock.calls.some(([url]) => String(url).startsWith("/api/search/suggest?q=her"))).toBe(true);
  });

  it("says so when a term matches nothing", async () => {
    stubFetch([]);
    const input = await openOverlay();
    type(input, "zzzzz");
    expect(await screen.findByText("No matches for that term.")).toBeVisible();
  });

  it("applies the highlighted suggestion on Enter instead of submitting", async () => {
    const input = await openOverlay();
    type(input, "her");
    await screen.findByRole("listbox", { name: "Search suggestions" });

    expect(input).not.toHaveAttribute("aria-activedescendant");
    fireEvent.keyDown(input, { key: "ArrowDown" });

    const option = screen.getByRole("option", { name: "Hero" });
    expect(option).toHaveAttribute("aria-selected", "true");
    expect(input).toHaveAttribute("aria-activedescendant", option.id);

    fireEvent.keyDown(input, { key: "Enter" });
    expect(push).not.toHaveBeenCalled();
    // Applying a taxonomy suggestion turns it into a filter, so its chip is now pressed.
    await waitFor(() => expect(screen.getByRole("button", { name: "Hero" })).toHaveAttribute("aria-pressed", "true"));
  });

  it("submits the typed query on Enter when nothing is highlighted", async () => {
    const input = await openOverlay();
    type(input, "Arabic SaaS Hero");
    fireEvent.keyDown(input, { key: "Enter" });
    expect(push).toHaveBeenCalledWith("/en/explore?sectionType=hero&industry=saas&language=ar");
  });

  it("sends the query, the detected filters and the device context to Explore", async () => {
    const input = await openOverlay();
    type(input, "Arabic SaaS Hero landing page");
    fireEvent.click(screen.getByRole("button", { name: "Mobile" }));
    fireEvent.click(screen.getByRole("button", { name: "View all results" }));

    expect(push).toHaveBeenCalledWith("/en/explore?q=landing+page&sectionType=hero&industry=saas&language=ar&device=mobile");
  });

  it("sends only the device context when nothing else is chosen", async () => {
    await openOverlay();
    fireEvent.click(screen.getByRole("button", { name: "Desktop" }));
    fireEvent.click(screen.getByRole("button", { name: "View all results" }));
    expect(push).toHaveBeenCalledWith("/en/explore?device=desktop");
  });

  it("records the search that was run, with the filters and device it carried", async () => {
    const input = await openOverlay();
    type(input, "Arabic SaaS Hero landing page");
    fireEvent.click(screen.getByRole("button", { name: "Mobile" }));
    fireEvent.click(screen.getByRole("button", { name: "View all results" }));

    expect(getAnalyticsEvents()).toEqual([
      { name: "search_performed", props: { hasQuery: true, filterCount: 4, device: "mobile" } },
    ]);
  });

  it("records nothing while a query is only being typed", async () => {
    const input = await openOverlay();
    type(input, "Arabic SaaS Hero");
    fireEvent.click(screen.getByRole("button", { name: "Remove detected filter: SaaS" }));

    expect(getAnalyticsEvents()).toEqual([]);
  });

  it("records a submitted query as a recent search for the next visit", async () => {
    const first = render(<SearchOverlay locale="en" triggerLabel="Search" />);
    fireEvent.click(screen.getByRole("button", { name: "Search" }));
    const input = await screen.findByRole("combobox");
    type(input, "dark ecommerce navbar");
    fireEvent.click(screen.getByRole("button", { name: "View all results" }));
    await waitFor(() => expect(push).toHaveBeenCalled());
    first.unmount();

    render(<SearchOverlay locale="en" triggerLabel="Search" />);
    fireEvent.click(screen.getByRole("button", { name: "Search" }));
    expect(await screen.findByText("Recent searches")).toBeVisible();
    expect(screen.getByRole("button", { name: "dark ecommerce navbar" })).toBeVisible();
  });

  it("offers the searches made in an earlier visit", async () => {
    saveRecentSearches(["arabic pricing mobile"]);
    await openOverlay();
    expect(screen.getByRole("button", { name: "arabic pricing mobile" })).toBeVisible();
  });

  it("reads a failed suggestion lookup as nothing found rather than crashing", async () => {
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => {
      if (String(input).startsWith("/api/search/suggest")) throw new Error("offline");
      return { ok: true, json: async () => ({ data: { facets: FACETS, total: 11 } }) } as Response;
    }));

    const input = await openOverlay();
    type(input, "her");
    await waitFor(() => expect(screen.getByText("No matches for that term.")).toBeVisible());
  });
});
