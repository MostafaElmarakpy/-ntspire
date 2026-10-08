import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MobileNavMenu } from "@/components/mobile-nav-menu";

const { push } = vi.hoisted(() => ({ push: vi.fn() }));

vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

function stubFetch() {
  const fetchMock = vi.fn(async () =>
    ({
      ok: true,
      json: async () => ({
        data: {
          facets: {
            sectionTypes: { hero: 6 },
            industries: {},
            styles: {},
            languages: { en: 9 },
            devices: {},
            directions: {},
            themes: {},
            sources: {},
          },
          total: 6,
        },
      }),
    }) as Response,
  );
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Mobile nav menu", () => {
  it("opens the drawer and closes it from the dismiss button with focus return", () => {
    stubFetch();
    render(<MobileNavMenu locale="en" />);
    const trigger = screen.getByRole("button", { name: "Open navigation menu" });
    trigger.focus();
    fireEvent.click(trigger);

    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByRole("navigation", { name: "Primary navigation" })).toBeVisible();

    fireEvent.click(within(dialog).getByRole("button", { name: "Close navigation menu" }));
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(trigger).toHaveFocus();
  });

  it("hands off to the search overlay after the drawer closes", async () => {
    stubFetch();
    render(<MobileNavMenu locale="en" />);
    fireEvent.click(screen.getByRole("button", { name: "Open navigation menu" }));
    const dialog = screen.getByRole("dialog");

    fireEvent.click(within(dialog).getByRole("button", { name: "Search" }));
    expect(screen.queryByRole("dialog")).toBeNull();

    // The overlay opens once the drawer's exit has cleared its focus scope.
    const input = await waitFor(() => screen.getByRole("combobox"), { timeout: 2000 });
    expect(input).toBeVisible();
  });
});
