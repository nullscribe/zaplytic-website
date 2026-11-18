import { vi } from "vitest";

/** Stubs window.matchMedia so the given media queries match and all others don't. */
export function mockMedia(matching: string[] = []): void {
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: matching.includes(query),
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn()
    }))
  );
}

export const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
export const TOUCH = "(hover: none)";
