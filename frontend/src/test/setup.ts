import "@testing-library/jest-dom/vitest";

/**
 * jsdom implements no layout, so `window.matchMedia` is absent. Components that
 * adapt to the viewport (the masonry grid's column count) subscribe to it, and
 * without it they would throw instead of rendering. This is the narrowest
 * stand-in that lets them mount: queries always report "no match", which is the
 * same answer the server render gives, so unit tests stay deterministic while
 * the real breakpoints are exercised in the browser suite.
 */
if (typeof window !== "undefined" && typeof window.matchMedia !== "function") {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: (query: string): MediaQueryList => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}
