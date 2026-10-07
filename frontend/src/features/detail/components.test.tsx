import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getAnalyticsEvents, resetAnalyticsEvents } from "@/lib/analytics";
import { cropRectToPercent, cropRectToPixels } from "@/lib/section-crop";
import { resetSavedStore } from "@/lib/saved-store";
import { DeviceSwitcher } from "./device-switcher";
import { FigmaDialog } from "./figma-dialog";
import { CategoriesIndex, PagesIndex, SourcesIndex } from "./index-views";
import { buildPageDetail, buildPagesIndex, buildSectionDetail, buildSourcesIndex, buildSourceDetail, buildCategoriesIndex, emptyPageDetail, emptySectionDetail, emptySourceDetail } from "./model";
import { PageDetail } from "./page-detail";
import { SaveAsImage } from "./save-as-image";
import { SectionDetail } from "./section-detail";
import { SourceDetail } from "./source-detail";
import { ViewInContext } from "./view-in-context";
import type { SectionDeviceView } from "./types";

/** Nimbus Pay's hero: captured for both devices, and with siblings on its page. */
const SECTION_ID = "section-nimbus-pay-home-2";

const sectionDetail = () => buildSectionDetail(SECTION_ID, "en")!;
const pageDetail = () => buildPageDetail("nimbus-pay-home", "en")!;
const sourceDetail = () => buildSourceDetail("nimbus-pay", "en")!;

const deviceView = (device: "desktop" | "mobile"): SectionDeviceView =>
  sectionDetail().devices.find((view) => view.device === device)!;

/** jsdom implements neither method, so a download test provides them itself. */
function stubDownloadEnvironment() {
  const createObjectURL = vi.fn(() => "blob:ntspire-1");
  const revokeObjectURL = vi.fn();
  Object.defineProperty(URL, "createObjectURL", { value: createObjectURL, configurable: true });
  Object.defineProperty(URL, "revokeObjectURL", { value: revokeObjectURL, configurable: true });

  const clicked: HTMLAnchorElement[] = [];
  vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (this: HTMLAnchorElement) {
    clicked.push(this);
  });
  return { clicked };
}

const events = () => getAnalyticsEvents().map((event) => event.name);
const eventProps = (name: string) => getAnalyticsEvents().find((event) => event.name === name)?.props;

beforeEach(() => {
  resetAnalyticsEvents();
  window.localStorage.clear();
  resetSavedStore();
});

afterEach(() => {
  resetAnalyticsEvents();
  resetSavedStore();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  Reflect.deleteProperty(URL, "createObjectURL");
  Reflect.deleteProperty(URL, "revokeObjectURL");
  window.history.replaceState(null, "", "/");
});

describe("DeviceSwitcher", () => {
  it("offers both devices and disables the one the record was not captured for", () => {
    render(<DeviceSwitcher locale="en" available={["desktop"]} value="desktop" label="Preview device" onChange={() => {}} />);

    const group = screen.getByRole("radiogroup", { name: "Preview device" });
    const desktop = within(group).getByRole("radio", { name: "Desktop" });
    const mobile = within(group).getByRole("radio", { name: "Mobile — Not captured for this device" });

    expect(group).toBeVisible();
    expect(desktop).toBeEnabled();
    expect(desktop).toHaveAttribute("aria-checked", "true");
    // Disabled with the reason in its accessible name, not hidden behind a tooltip.
    expect(mobile).toBeDisabled();
    expect(mobile).toHaveAttribute("data-device", "mobile");
    expect(desktop).toHaveAttribute("data-device", "desktop");
  });

  it("leaves the desktop option disabled for a mobile-only record", () => {
    render(<DeviceSwitcher locale="en" available={["mobile"]} value="mobile" label="Preview device" onChange={() => {}} />);

    expect(screen.getByRole("radio", { name: "Desktop — Not captured for this device" })).toBeDisabled();
    expect(screen.getByRole("radio", { name: "Mobile" })).toBeEnabled();
  });

  it("enables both when the section was captured for both", () => {
    render(<DeviceSwitcher locale="en" available={["desktop", "mobile"]} value="desktop" label="Preview device" onChange={() => {}} />);

    expect(screen.getByRole("radio", { name: "Desktop" })).toBeEnabled();
    expect(screen.getByRole("radio", { name: "Mobile" })).toBeEnabled();
  });

  it("reports the device the reader picked", () => {
    const onChange = vi.fn();
    render(<DeviceSwitcher locale="en" available={["desktop", "mobile"]} value="desktop" label="Preview device" onChange={onChange} />);

    fireEvent.click(screen.getByRole("radio", { name: "Mobile" }));
    expect(onChange).toHaveBeenCalledWith("mobile");
  });

  it("does not report a switch when the current device is pressed again", () => {
    const onChange = vi.fn();
    render(<DeviceSwitcher locale="en" available={["desktop", "mobile"]} value="desktop" label="Preview device" onChange={onChange} />);

    fireEvent.click(screen.getByRole("radio", { name: "Desktop" }));
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe("SaveAsImage", () => {
  it("downloads the shown device's own rendered asset under the spec's filename", async () => {
    const { clicked } = stubDownloadEnvironment();
    const image = deviceView("mobile").image;
    const fetchMock = vi.fn(async () => ({ ok: true, blob: async () => new Blob(["bytes"], { type: "image/svg+xml" }) }) as Response);
    vi.stubGlobal("fetch", fetchMock);

    const onDownloaded = vi.fn();
    render(
      <SaveAsImage
        locale="en"
        sourceName="Nimbus Pay"
        sectionTypeId="hero"
        device="mobile"
        image={image}
        mimeType="image/svg+xml"
        onDownloaded={onDownloaded}
      />,
    );

    fireEvent.click(screen.getByTestId("download-action"));

    await waitFor(() => expect(onDownloaded).toHaveBeenCalledWith("ntspire-nimbus-pay-hero-mobile.svg"));
    expect(fetchMock).toHaveBeenCalledWith(image.src);
    expect(clicked[0].download).toBe("ntspire-nimbus-pay-hero-mobile.svg");
    // The section's crop, never the page screenshot behind it.
    expect(image.src).toContain("crop-");
  });

  it("names a desktop save differently from the mobile one of the same section", async () => {
    stubDownloadEnvironment();
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: true, blob: async () => new Blob(["x"]) }) as Response));

    const onDownloaded = vi.fn();
    const { rerender } = render(
      <SaveAsImage
        locale="en"
        sourceName="Nimbus Pay"
        sectionTypeId="hero"
        device="desktop"
        image={deviceView("desktop").image}
        mimeType="image/svg+xml"
        onDownloaded={onDownloaded}
      />,
    );
    fireEvent.click(screen.getByTestId("download-action"));
    await waitFor(() => expect(onDownloaded).toHaveBeenCalledWith("ntspire-nimbus-pay-hero-desktop.svg"));

    rerender(
      <SaveAsImage
        locale="en"
        sourceName="Nimbus Pay"
        sectionTypeId="hero"
        device="mobile"
        image={deviceView("mobile").image}
        mimeType="image/svg+xml"
        onDownloaded={onDownloaded}
      />,
    );
    fireEvent.click(screen.getByTestId("download-action"));
    await waitFor(() => expect(onDownloaded).toHaveBeenCalledWith("ntspire-nimbus-pay-hero-mobile.svg"));
  });

  it("tells the reader when the download failed instead of claiming success", async () => {
    stubDownloadEnvironment();
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: false, status: 404 }) as Response));
    const onDownloaded = vi.fn();

    render(
      <SaveAsImage
        locale="en"
        sourceName="Nimbus Pay"
        sectionTypeId="hero"
        device="desktop"
        image={deviceView("desktop").image}
        mimeType="image/svg+xml"
        onDownloaded={onDownloaded}
      />,
    );

    fireEvent.click(screen.getByTestId("download-action"));

    expect(await screen.findByRole("alert")).toHaveTextContent("That image could not be downloaded. Try again.");
    expect(onDownloaded).not.toHaveBeenCalled();
  });
});

describe("FigmaDialog", () => {
  it("says the integration does not exist rather than pretending it worked", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const onOpen = vi.fn();

    render(<FigmaDialog locale="en" sectionTitle="Your money, made simple" onOpen={onOpen} />);
    expect(screen.queryByTestId("figma-dialog")).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("figma-action"));
    const dialog = await screen.findByTestId("figma-dialog");

    expect(within(dialog).getByText("Figma export is not connected yet")).toBeVisible();
    expect(within(dialog).getByText(/ntspire has no Figma integration yet, so nothing was sent/)).toBeVisible();
    expect(within(dialog).getByText("Your money, made simple")).toBeVisible();
    // The dialog offers a close affordance and nothing else to do.
    expect(within(dialog).getAllByRole("button", { name: "Close" }).length).toBeGreaterThan(0);
  });

  it("makes no request and links nowhere external", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);

    render(<FigmaDialog locale="en" sectionTitle="Your money, made simple" onOpen={() => {}} />);
    fireEvent.click(screen.getByTestId("figma-action"));
    const dialog = await screen.findByTestId("figma-dialog");

    expect(fetchMock).not.toHaveBeenCalled();
    expect(openSpy).not.toHaveBeenCalled();
    expect(within(dialog).queryByRole("link")).not.toBeInTheDocument();
    expect(dialog.textContent).not.toMatch(/figma\.com/i);
  });

  it("counts the click once, on open", async () => {
    const onOpen = vi.fn();
    render(<FigmaDialog locale="en" sectionTitle="Your money, made simple" onOpen={onOpen} />);

    fireEvent.click(screen.getByTestId("figma-action"));
    await screen.findByTestId("figma-dialog");
    expect(onOpen).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getAllByRole("button", { name: "Close" }).at(-1)!);
    await waitFor(() => expect(screen.queryByTestId("figma-dialog")).not.toBeInTheDocument());
    expect(onOpen).toHaveBeenCalledTimes(1);
  });
});

describe("ViewInContext", () => {
  it("highlights the current device's crop on the current device's page capture", async () => {
    const view = deviceView("desktop");
    const expected = cropRectToPercent(view.crop, view.pageImage);

    render(<ViewInContext locale="en" sectionTitle={sectionDetail().title} view={view} onOpen={() => {}} />);
    fireEvent.click(screen.getByTestId("context-action"));
    const dialog = await screen.findByTestId("context-dialog");

    const highlight = within(dialog).getByTestId("context-highlight");
    expect(highlight).toHaveAttribute("data-device", "desktop");
    expect(parseFloat(highlight.style.left)).toBeCloseTo(expected.left, 6);
    expect(parseFloat(highlight.style.top)).toBeCloseTo(expected.top, 6);
    expect(parseFloat(highlight.style.width)).toBeCloseTo(expected.width, 6);
    expect(parseFloat(highlight.style.height)).toBeCloseTo(expected.height, 6);
    expect(highlight).toHaveAttribute("aria-hidden", "true");

    const image = within(dialog).getByRole("img");
    expect(decodeURIComponent(image.getAttribute("src") ?? "")).toContain(view.pageImage.src);
  });

  it("places the mobile band from the mobile crop, never the desktop rectangle", async () => {
    const desktop = deviceView("desktop");
    const mobile = deviceView("mobile");

    // The two devices are measured on different screenshots at different scales,
    // so their crop coordinates are not the same numbers and the captures differ.
    expect(mobile.crop.cropY).not.toBe(desktop.crop.cropY);
    expect(mobile.crop.cropHeight).not.toBe(desktop.crop.cropHeight);
    expect(mobile.pageImage.src).not.toBe(desktop.pageImage.src);

    // Rendered at one width, each page keeps its own aspect ratio, so the band
    // lands at a different height — which is what the scroll-into-view uses.
    const renderedFor = (image: { width: number; height: number }) => ({ width: 400, height: (400 * image.height) / image.width });
    const desktopPixels = cropRectToPixels(desktop.crop, desktop.pageImage, renderedFor(desktop.pageImage));
    const mobilePixels = cropRectToPixels(mobile.crop, mobile.pageImage, renderedFor(mobile.pageImage));
    expect(mobilePixels.top).not.toBeCloseTo(desktopPixels.top, 1);

    render(<ViewInContext locale="en" sectionTitle={sectionDetail().title} view={mobile} onOpen={() => {}} />);
    fireEvent.click(screen.getByTestId("context-action"));
    const dialog = await screen.findByTestId("context-dialog");

    const highlight = within(dialog).getByTestId("context-highlight");
    expect(highlight).toHaveAttribute("data-device", "mobile");
    const expected = cropRectToPercent(mobile.crop, mobile.pageImage);
    expect(parseFloat(highlight.style.top)).toBeCloseTo(expected.top, 6);
    expect(parseFloat(highlight.style.height)).toBeCloseTo(expected.height, 6);

    const image = within(dialog).getByRole("img");
    expect(decodeURIComponent(image.getAttribute("src") ?? "")).toContain(mobile.pageImage.src);
    expect(decodeURIComponent(image.getAttribute("src") ?? "")).not.toContain(desktop.pageImage.src);
  });

  it("keeps the other sections on the page one click away", async () => {
    const view = deviceView("desktop");
    render(<ViewInContext locale="en" sectionTitle={sectionDetail().title} view={view} onOpen={() => {}} />);
    fireEvent.click(screen.getByTestId("context-action"));
    const dialog = await screen.findByTestId("context-dialog");

    const links = within(dialog).getAllByRole("link");
    expect(links.map((link) => link.getAttribute("href"))).toEqual(
      view.siblings.map((sibling) => `/en/sections/${sibling.id}`),
    );
    expect(links.map((link) => link.textContent)).toEqual(view.siblings.map((sibling) => sibling.title));
  });

  it("reports the open once and makes no request", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const onOpen = vi.fn();

    render(<ViewInContext locale="en" sectionTitle={sectionDetail().title} view={deviceView("desktop")} onOpen={onOpen} />);
    fireEvent.click(screen.getByTestId("context-action"));
    const dialog = await screen.findByTestId("context-dialog");

    expect(onOpen).toHaveBeenCalledTimes(1);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(within(dialog).getByTestId("context-close")).toBeVisible();
  });

  it("makes the scrolling frame itself a named keyboard tab stop", async () => {
    render(<ViewInContext locale="en" sectionTitle={sectionDetail().title} view={deviceView("desktop")} onOpen={() => {}} />);
    fireEvent.click(screen.getByTestId("context-action"));
    const dialog = await screen.findByTestId("context-dialog");

    // A scrollable region that cannot be reached with the keyboard traps its
    // content off-screen for anyone not using a pointer, so the frame — not the
    // decorative band inside it — is the tab stop.
    const frame = within(dialog).getByRole("group", { name: "Page context" });
    expect(frame).toHaveAttribute("tabindex", "0");
    expect(within(frame).getByTestId("context-highlight")).not.toHaveAttribute("tabindex");
  });
});

describe("SectionDetail", () => {
  it("breadcrumbs Source, Page and Section, with the section as the current page", () => {
    const detail = sectionDetail();
    render(<SectionDetail locale="en" detail={detail} initialDevice="desktop" />);

    const breadcrumb = screen.getByRole("navigation", { name: "Breadcrumb" });
    const links = within(breadcrumb).getAllByRole("link");
    expect(links.map((link) => link.getAttribute("href"))).toEqual([
      "/en/sources",
      `/en/sources/${detail.sourceSlug}`,
      `/en/pages/${detail.pageSlug}`,
      null,
    ]);
    expect(within(breadcrumb).getByRole("link", { name: detail.title })).toHaveAttribute("aria-current", "page");
  });

  it("shows the section's metadata, tags and the way back up to its page and source", () => {
    const detail = sectionDetail();
    render(<SectionDetail locale="en" detail={detail} initialDevice="desktop" />);

    expect(screen.getByRole("heading", { level: 1, name: detail.title })).toBeVisible();

    // Scoped to the metadata column: the same facts and tag list also appear on
    // every related card below, and the attribution repeats in the breadcrumb.
    const aside = screen.getByRole("complementary");
    const facts = within(aside).getAllByRole("definition")[0].closest("dl")!;
    for (const fact of detail.facts) {
      const row = within(facts).getByText(fact.label).closest("div")!;
      expect(within(row).getByText(fact.value)).toBeVisible();
    }

    const tags = within(aside).getByRole("list", { name: "Reference tags" });
    expect(within(tags).getAllByRole("listitem")).toHaveLength(detail.tags.length);
    for (const tag of detail.tags) expect(within(tags).getByText(tag)).toBeVisible();

    expect(screen.getByRole("link", { name: "View source" })).toHaveAttribute("href", `/en/sources/${detail.sourceSlug}`);
    expect(screen.getByRole("link", { name: "View page" })).toHaveAttribute("href", `/en/pages/${detail.pageSlug}`);
  });

  it("records the arrival view, and the reader's own switch separately", () => {
    const detail = sectionDetail();
    render(<SectionDetail locale="en" detail={detail} initialDevice="desktop" />);

    expect(events()).toContain("section_viewed");
    expect(eventProps("section_viewed")).toMatchObject({ sectionId: detail.id, device: "desktop" });
    expect(events()).not.toContain("desktop_viewed");

    fireEvent.click(screen.getByRole("radio", { name: "Mobile" }));
    expect(events()).toContain("mobile_viewed");
    expect(eventProps("mobile_viewed")).toMatchObject({ device: "mobile" });
  });

  it("swaps the preview to the mobile crop and everything downstream with it", () => {
    const detail = sectionDetail();
    render(<SectionDetail locale="en" detail={detail} initialDevice="desktop" />);

    const before = screen.getByRole("img", { name: detail.devices[0].image.alt });
    expect(decodeURIComponent(before.getAttribute("src") ?? "")).toContain(deviceView("desktop").image.src);

    fireEvent.click(screen.getByRole("radio", { name: "Mobile" }));

    const after = screen.getByRole("img", { name: detail.devices[1].image.alt });
    expect(decodeURIComponent(after.getAttribute("src") ?? "")).toContain(deviceView("mobile").image.src);
    expect(decodeURIComponent(after.getAttribute("src") ?? "")).not.toContain(deviceView("desktop").image.src);
    expect(window.location.search).toBe("?device=mobile");
  });

  it("keeps the requested device out of a URL the record cannot honour", () => {
    const desktopOnly = buildSectionDetail("section-flowbase-pricing-1", "en")!;
    render(<SectionDetail locale="en" detail={desktopOnly} initialDevice="desktop" />);

    expect(screen.getByRole("radio", { name: "Mobile — Not captured for this device" })).toBeDisabled();
    // Pressing a disabled device must not reach the hook.
    fireEvent.click(screen.getByRole("radio", { name: "Mobile — Not captured for this device" }));
    expect(window.location.search).toBe("");
  });

  it("counts a download, a Figma click and a context view", async () => {
    stubDownloadEnvironment();
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: true, blob: async () => new Blob(["x"]) }) as Response));

    render(<SectionDetail locale="en" detail={sectionDetail()} initialDevice="desktop" />);

    fireEvent.click(screen.getByTestId("download-action"));
    await waitFor(() => expect(events()).toContain("image_downloaded"));
    expect(eventProps("image_downloaded")).toMatchObject({
      sectionId: SECTION_ID,
      device: "desktop",
      filename: "ntspire-nimbus-pay-hero-desktop.svg",
    });

    fireEvent.click(screen.getByTestId("figma-action"));
    await screen.findByTestId("figma-dialog");
    expect(eventProps("figma_clicked")).toMatchObject({ sectionId: SECTION_ID });

    fireEvent.click(screen.getByTestId("context-action"));
    await screen.findByTestId("context-dialog");
    expect(eventProps("view_context")).toMatchObject({ sectionId: SECTION_ID, device: "desktop" });
  });

  it("renders the related sections as openable cards, and an empty state when there are none", () => {
    const detail = sectionDetail();
    render(<SectionDetail locale="en" detail={detail} initialDevice="desktop" />);
    expect(screen.getByRole("heading", { name: "Similar sections" })).toBeVisible();
    for (const card of detail.related) {
      expect(screen.getByRole("link", { name: `Open reference: ${card.title}` })).toHaveAttribute("href", `/en/sections/${card.id}`);
    }

    render(<SectionDetail locale="en" detail={emptySectionDetail(detail)} initialDevice="desktop" />);
    expect(screen.getByText("No similar sections yet")).toBeVisible();
  });

  it("renders the empty variant as a real page, not a missing one", () => {
    const detail = emptySectionDetail(sectionDetail());
    render(<SectionDetail locale="en" detail={detail} initialDevice="desktop" />);

    expect(screen.getByRole("heading", { level: 1, name: detail.title })).toBeVisible();
    expect(screen.getByTestId("download-action")).toBeEnabled();
  });
});

describe("PageDetail", () => {
  it("draws a region for every section, on the current device's capture", () => {
    const detail = pageDetail();
    render(<PageDetail locale="en" detail={detail} initialDevice="desktop" />);

    const regions = screen.getAllByTestId("page-region");
    expect(regions).toHaveLength(detail.devices[0].sections.length);
    expect(regions.map((region) => region.getAttribute("data-section-id"))).toEqual(
      detail.devices[0].sections.map((section) => section.id),
    );

    const first = detail.devices[0].sections[0];
    const expected = cropRectToPercent(first.crop, detail.devices[0].image);
    expect(parseFloat(regions[0].style.top)).toBeCloseTo(expected.top, 6);
    expect(parseFloat(regions[0].style.height)).toBeCloseTo(expected.height, 6);
    expect(regions[0]).toHaveAttribute("aria-hidden", "true");
  });

  it("re-measures the regions from the mobile crops when the device changes", () => {
    const detail = pageDetail();
    render(<PageDetail locale="en" detail={detail} initialDevice="desktop" />);

    fireEvent.click(screen.getByRole("radio", { name: "Mobile" }));

    const regions = screen.getAllByTestId("page-region");
    const mobileView = detail.devices.find((view) => view.device === "mobile")!;
    const expected = cropRectToPercent(mobileView.sections[0].crop, mobileView.image);
    expect(parseFloat(regions[0].style.top)).toBeCloseTo(expected.top, 6);

    const image = screen.getAllByRole("img")[0];
    expect(decodeURIComponent(image.getAttribute("src") ?? "")).toContain(mobileView.image.src);
  });

  it("lists every section as a link a reader can open", () => {
    const detail = pageDetail();
    render(<PageDetail locale="en" detail={detail} initialDevice="desktop" />);

    for (const section of detail.devices[0].sections) {
      const link = screen.getByRole("link", { name: new RegExp(section.title) });
      expect(link).toHaveAttribute("href", `/en/sections/${section.id}`);
    }
    expect(screen.getByRole("link", { name: "View source" })).toHaveAttribute("href", `/en/sources/${detail.sourceSlug}`);
  });

  it("offers only the devices the page was captured for", () => {
    const desktopOnly = buildPageDetail("flowbase-pricing", "en")!;
    render(<PageDetail locale="en" detail={desktopOnly} initialDevice="desktop" />);

    expect(screen.getByRole("radio", { name: "Mobile — Not captured for this device" })).toBeDisabled();
  });

  it("shows an empty state when the page has no catalogued sections", () => {
    const detail = emptyPageDetail(pageDetail());
    render(<PageDetail locale="en" detail={detail} initialDevice="desktop" />);

    expect(screen.getByText("No sections catalogued")).toBeVisible();
    expect(screen.queryAllByTestId("page-region")).toHaveLength(0);
  });

  it("breadcrumbs back to the source", () => {
    const detail = pageDetail();
    render(<PageDetail locale="en" detail={detail} initialDevice="desktop" />);

    const breadcrumb = screen.getByRole("navigation", { name: "Breadcrumb" });
    const links = within(breadcrumb).getAllByRole("link");
    expect(links.map((link) => link.getAttribute("href"))).toEqual([
      "/en/sources",
      `/en/sources/${detail.sourceSlug}`,
      null,
    ]);
    expect(within(breadcrumb).getByRole("link", { name: detail.title })).toHaveAttribute("aria-current", "page");
  });
});

describe("SourceDetail", () => {
  it("records the source as opened", () => {
    render(<SourceDetail locale="en" detail={sourceDetail()} />);
    expect(eventProps("source_opened")).toMatchObject({ sourceId: sourceDetail().id });
  });

  it("links every page and every section it lists", () => {
    const detail = sourceDetail();
    render(<SourceDetail locale="en" detail={detail} />);

    for (const page of detail.pages) {
      expect(screen.getByRole("link", { name: new RegExp(page.title) })).toHaveAttribute("href", `/en/pages/${page.slug}`);
    }
    for (const card of detail.sections) {
      expect(screen.getByRole("link", { name: `Open reference: ${card.title}` })).toHaveAttribute("href", `/en/sections/${card.id}`);
    }
  });

  it("shows an empty state for each collection that is empty", () => {
    render(<SourceDetail locale="en" detail={emptySourceDetail(sourceDetail())} />);

    expect(screen.getByText("No pages catalogued")).toBeVisible();
    expect(screen.getByText("No sections catalogued")).toBeVisible();
  });
});

describe("index views", () => {
  it("links every source card to its own detail route", () => {
    const data = buildSourcesIndex("en");
    render(<SourcesIndex locale="en" data={data} />);

    const card = data.sources.find((entry) => entry.id === "source-nimbus-pay")!;
    expect(screen.getByRole("link", { name: `Open reference: ${card.name}` })).toHaveAttribute("href", "/en/sources/nimbus-pay");
    expect(screen.getAllByRole("link")).toHaveLength(data.sources.length);
  });

  it("links every page card to its own detail route", () => {
    const data = buildPagesIndex("en");
    render(<PagesIndex locale="en" data={data} />);

    const card = data.pages.find((entry) => entry.id === "flowbase-home")!;
    expect(screen.getByRole("link", { name: `Open reference: ${card.title}` })).toHaveAttribute("href", "/en/pages/flowbase-home");
    expect(screen.getAllByRole("link")).toHaveLength(data.pages.length);
  });

  it("shows each category with its count and the Explore URL a reader can follow", () => {
    const data = buildCategoriesIndex("en");
    render(<CategoriesIndex locale="en" data={data} />);

    const industries = data.groups.find((group) => group.id === "industries")!;
    expect(screen.getByRole("region", { name: industries.title })).toBeVisible();

    // Located by href rather than by name: several labels are substrings of each
    // other, so a href is the unambiguous thing to match on.
    const links = screen.getAllByRole("link");
    for (const group of data.groups) {
      for (const entry of group.entries) {
        const link = links.find((candidate) => candidate.getAttribute("href") === entry.href)!;
        expect(link, entry.href).toBeDefined();
        expect(link.textContent).toContain(entry.label);
        expect(link.textContent).toContain(String(entry.count));
      }
    }
    expect(links.filter((link) => link.getAttribute("href")?.startsWith("/en/explore?"))).toHaveLength(
      data.groups.reduce((total, group) => total + group.entries.length, 0),
    );

    const saas = links.find((link) => link.getAttribute("href") === "/en/explore?industry=saas")!;
    expect(saas.textContent).toContain("SaaS");
    expect(saas.textContent).toContain(String(industries.entries.find((entry) => entry.id === "saas")!.count));
  });

  it("falls back to an empty state rather than an empty grid", () => {
    render(<SourcesIndex locale="en" data={{ sources: [] }} />);
    expect(screen.getByText("No sources to show")).toBeVisible();

    render(<PagesIndex locale="en" data={{ pages: [] }} />);
    expect(screen.getByText("No pages to show")).toBeVisible();

    render(<CategoriesIndex locale="en" data={{ groups: [] }} />);
    expect(screen.getByText("No categories to show")).toBeVisible();
  });
});
