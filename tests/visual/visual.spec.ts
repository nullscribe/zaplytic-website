import { expect, test, type Page } from "@playwright/test";

const PAGES = [
  ["home", "/"],
  ["products", "/products"],
  ["about", "/about"],
  ["blog", "/blog"],
  ["post", "/blog/rails-8-solid-stack"],
  ["post-with-code", "/blog/typescript-6-runtime-validation"],
  ["not-found", "/this-page-does-not-exist"]
] as const;

const THEMES = ["light", "dark"] as const;

/**
 * Loads a page as a reduced-motion visitor: every CSS animation is off, so each element is
 * in its final, resting state and screenshots are deterministic.
 */
async function open(page: Page, path: string, theme: (typeof THEMES)[number]) {
  await page.addInitScript((t) => localStorage.setItem("theme", t), theme);
  await page.goto(path, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
}

/** Fails if anything that animates in is still hidden (the rotating hero words take turns). */
async function settle(page: Page) {
  const hidden = await page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>(".motion, .motion-reveal")]
      .filter((el) => Number(getComputedStyle(el).opacity) < 1)
      .map((el) => el.id || el.className.slice(0, 40))
  );
  expect(hidden, "animated elements left hidden").toEqual([]);
}

for (const theme of THEMES) {
  test.describe(`${theme} theme`, () => {
    for (const [name, path] of PAGES) {
      test(`${name}`, async ({ page }) => {
        await open(page, path, theme);
        await settle(page);
        await expect(page).toHaveScreenshot(`${name}-${theme}.png`, { fullPage: true });
      });
    }
  });
}

test.describe("interactive states", () => {
  test("mobile menu open", async ({ page, isMobile, hasTouch }) => {
    test.skip(!(isMobile || hasTouch), "menu toggle only shows on small screens");
    await open(page, "/products", "light");
    await settle(page);
    await page.getByRole("button", { name: "Toggle navigation" }).click();
    await expect(page.locator("header")).toHaveScreenshot("mobile-menu-open.png");
  });

  test("theme toggled from light to dark", async ({ page }) => {
    await open(page, "/about", "light");
    await settle(page);
    await page.getByRole("button", { name: "Switch to dark theme" }).click();
    await expect(page.locator("footer")).toHaveScreenshot("footer-after-toggle.png");
    await expect(page).toHaveScreenshot("about-after-toggle.png");
  });
});
