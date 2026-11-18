import { describe, expect, test } from "vitest";
import { initMobileNav, isActivePath, normalizePath } from "@/scripts/nav";

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
