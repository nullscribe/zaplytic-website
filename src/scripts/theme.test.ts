import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import {
  THEME_STORAGE_KEY,
  applyTheme,
  currentTheme,
  initThemeToggle,
  toggleLabel
} from "@/scripts/theme";

const root = document.documentElement;
const flushObservers = () => new Promise((resolve) => setTimeout(resolve, 0));

beforeEach(() => localStorage.clear());
afterEach(() => vi.restoreAllMocks());

describe("currentTheme", () => {
  test("is light without the dark class", () => {
    expect(currentTheme()).toBe("light");
  });

  test("is dark with the dark class", () => {
    root.classList.add("dark");
    expect(currentTheme()).toBe("dark");
  });

  test("reads from the element it is given", () => {
    const el = document.createElement("div");
    el.classList.add("dark");
    expect(currentTheme(el)).toBe("dark");
    expect(currentTheme()).toBe("light");
  });
});

describe("applyTheme", () => {
  test("adds the dark class and stores the choice", () => {
    applyTheme("dark");
    expect(root).toHaveClass("dark");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
  });

  test("removes the dark class and stores light", () => {
    root.classList.add("dark");
    applyTheme("light");
    expect(root).not.toHaveClass("dark");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");
  });

  test("keeps other classes on the root", () => {
    root.classList.add("keep-me");
    applyTheme("dark");
    applyTheme("light");
    expect(root).toHaveClass("keep-me");
  });

  test("still switches the theme when storage throws (private mode, blocked storage)", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });
    expect(() => applyTheme("dark")).not.toThrow();
    expect(root).toHaveClass("dark");
  });
});

describe("toggleLabel", () => {
  test("describes the action, not the current state", () => {
    expect(toggleLabel("light")).toBe("Switch to dark theme");
    expect(toggleLabel("dark")).toBe("Switch to light theme");
  });
});

describe("initThemeToggle", () => {
  function setup() {
    const button = document.createElement("button");
    button.setAttribute("aria-label", "Switch to dark theme");
    document.body.append(button);
    const cleanup = initThemeToggle(button);
    return { button, cleanup };
  }

  test("syncs the label with a theme set before the script ran", () => {
    root.classList.add("dark");
    const { button } = setup();
    expect(button).toHaveAttribute("aria-label", "Switch to light theme");
    expect(button).toHaveAttribute("title", "Switch to light theme");
  });

  test("each click flips the theme, the stored value and the label", () => {
    const { button } = setup();

    button.click();
    expect(root).toHaveClass("dark");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
    expect(button).toHaveAttribute("aria-label", "Switch to light theme");

    button.click();
    expect(root).not.toHaveClass("dark");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");
    expect(button).toHaveAttribute("aria-label", "Switch to dark theme");
  });

  test("follows theme changes made elsewhere", async () => {
    const { button } = setup();
    root.classList.add("dark");
    await flushObservers();
    expect(button).toHaveAttribute("aria-label", "Switch to light theme");
  });

  test("two toggles on one page stay in sync", async () => {
    const first = setup();
    const second = setup();
    first.button.click();
    await flushObservers();
    expect(second.button).toHaveAttribute("aria-label", "Switch to light theme");
  });

  test("cleanup stops reacting to clicks", () => {
    const { button, cleanup } = setup();
    cleanup();
    button.click();
    expect(root).not.toHaveClass("dark");
  });
});
