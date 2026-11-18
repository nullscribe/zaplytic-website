import { describe, expect, test, vi } from "vitest";
import {
  initMobileNav,
  initNavUnderline,
  isActivePath,
  normalizePath,
  positionUnderline
} from "@/scripts/nav";

describe("normalizePath", () => {
  test.each([
    ["/", "/"],
    ["", "/"],
    ["/index.html", "/"],
    ["/about", "/about"],
    ["/about/", "/about"],
    ["/about.html", "/about"],
    ["/blog/index.html", "/blog"],
    ["/blog/my-post.html", "/blog/my-post"],
    ["/blog/my-post/", "/blog/my-post"],
    ["/blog//", "/blog"]
  ])("%j -> %j", (input, expected) => {
    expect(normalizePath(input)).toBe(expected);
  });
});

describe("isActivePath", () => {
  test("home is active only on the root", () => {
    expect(isActivePath("/", "/")).toBe(true);
    expect(isActivePath("/", "/index.html")).toBe(true);
    expect(isActivePath("/", "/about")).toBe(false);
    expect(isActivePath("/", "/blog/post")).toBe(false);
  });

  test("a section is active on itself and anything below it", () => {
    expect(isActivePath("/blog", "/blog")).toBe(true);
    expect(isActivePath("/blog", "/blog.html")).toBe(true);
    expect(isActivePath("/blog", "/blog/")).toBe(true);
    expect(isActivePath("/blog", "/blog/rails-8-solid-stack")).toBe(true);
    expect(isActivePath("/blog", "/blog/rails-8-solid-stack.html")).toBe(true);
  });

  test("prefix matches must end at a path boundary", () => {
    expect(isActivePath("/blog", "/blogroll")).toBe(false);
    expect(isActivePath("/about", "/about-us")).toBe(false);
    expect(isActivePath("/products", "/product")).toBe(false);
  });
});

function mobileNavFixture() {
  document.body.innerHTML = `
    <button id="toggle" aria-expanded="false">
      <svg data-icon="open"></svg>
      <svg data-icon="close" class="hidden"></svg>
    </button>
    <div id="menu" class="hidden"></div>`;
  const toggle = document.getElementById("toggle")!;
  const menu = document.getElementById("menu")!;
  initMobileNav(toggle, menu);
  return {
    toggle,
    menu,
    openIcon: toggle.querySelector("[data-icon=open]")!,
    closeIcon: toggle.querySelector("[data-icon=close]")!
  };
}

describe("initMobileNav", () => {
  test("first click opens the menu", () => {
    const { toggle, menu } = mobileNavFixture();
    toggle.click();
    expect(menu).not.toHaveClass("hidden");
    expect(toggle).toHaveAttribute("aria-expanded", "true");
  });

  test("second click closes it again", () => {
    const { toggle, menu } = mobileNavFixture();
    toggle.click();
    toggle.click();
    expect(menu).toHaveClass("hidden");
    expect(toggle).toHaveAttribute("aria-expanded", "false");
  });

  test("keeps the hamburger icon whether open or closed (original design)", () => {
    const { toggle, openIcon, closeIcon } = mobileNavFixture();
    toggle.click();
    expect(openIcon).not.toHaveClass("hidden");
    expect(closeIcon).toHaveClass("hidden");
  });

  test("works without icons", () => {
    document.body.innerHTML = `<button id="t"></button><div id="m" class="hidden"></div>`;
    const toggle = document.getElementById("t")!;
    initMobileNav(toggle, document.getElementById("m")!);
    expect(() => toggle.click()).not.toThrow();
    expect(toggle).toHaveAttribute("aria-expanded", "true");
  });
});

function underlineFixture(activeIndex: number | null) {
  document.body.innerHTML = `<div id="row">${["Home", "Products", "About"]
    .map((label, i) => `<a class="${i === activeIndex ? "activeNav" : "inActiveNav"}">${label}</a>`)
    .join("")}<span id="bar"></span></div>`;
  const row = document.getElementById("row")!;
  const bar = document.getElementById("bar")!;
  // happy-dom has no layout engine, so give the links measurable boxes
  row.querySelectorAll("a").forEach((a, i) => {
    Object.defineProperties(a, {
      offsetLeft: { value: i * 100, configurable: true },
      offsetTop: { value: 4, configurable: true },
      offsetWidth: { value: 60 + i, configurable: true },
      offsetHeight: { value: 40, configurable: true }
    });
  });
  return { row, bar };
}

describe("positionUnderline", () => {
  test("sits under the active link", () => {
    const { row, bar } = underlineFixture(1);
    positionUnderline(row, bar);
    expect(bar.style.opacity).toBe("1");
    expect(bar.style.left).toBe("100px");
    expect(bar.style.width).toBe("61px");
    expect(bar.style.top).toBe("42px");
  });

  test("hides when no link is active (e.g. the 404 page)", () => {
    const { row, bar } = underlineFixture(null);
    positionUnderline(row, bar);
    expect(bar.style.opacity).toBe("0");
  });
});

describe("initNavUnderline", () => {
  test("positions immediately and re-measures on resize", () => {
    const callbacks: ResizeObserverCallback[] = [];
    const observed: Element[] = [];
    vi.stubGlobal(
      "ResizeObserver",
      class {
        constructor(cb: ResizeObserverCallback) {
          callbacks.push(cb);
        }
        observe(el: Element) {
          observed.push(el);
        }
        disconnect() {}
      }
    );

    const { row, bar } = underlineFixture(2);
    const cleanup = initNavUnderline(row, bar);
    expect(bar.style.left).toBe("200px");
    // the row and each of the three links are observed
    expect(observed).toHaveLength(4);

    Object.defineProperty(row.querySelectorAll("a")[2], "offsetLeft", { value: 260 });
    callbacks[0]([], {} as ResizeObserver);
    expect(bar.style.left).toBe("260px");

    cleanup();
    vi.unstubAllGlobals();
  });

  test("works where ResizeObserver is unavailable", () => {
    vi.stubGlobal("ResizeObserver", undefined);
    const { row, bar } = underlineFixture(0);
    expect(() => initNavUnderline(row, bar)()).not.toThrow();
    expect(bar.style.left).toBe("0px");
    vi.unstubAllGlobals();
  });
});
