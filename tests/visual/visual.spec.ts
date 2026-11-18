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

const START = new Date("2026-01-01T00:00:00Z").getTime();

/**
 * Loads a page with time frozen, so every GSAP animation sits at exactly the same point
 * on every run: the clock only moves when we tell it to.
 */
async function open(page: Page, path: string, theme: (typeof THEMES)[number]) {
  await page.addInitScript((t) => localStorage.setItem("theme", t), theme);
  await page.clock.install({ time: START });
  // Pausing slightly ahead (rather than at START) avoids "cannot fast-forward to the past"
  await page.clock.pauseAt(START + 1_000);
  await page.goto(path, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  // Framework islands (older builds) attach their animations on hydration; wait for that
  await page.waitForFunction(() => !document.querySelector("astro-island[ssr]"));
}

/** The hero's word loop: 0.3s delay, then 2.5s per word (0.5s in, 1.5s hold, 0.5s out). */
const HERO_DELAY = 300;
const HERO_CYCLE = 3 * 2_500;
const HERO_FIRST_WORD_VISIBLE = HERO_DELAY + 1_250; // middle of the first word's hold

/** Lets entrance animations finish and scrolls through the page to fire every scroll reveal. */
async function settle(page: Page) {
  let elapsed = 0;
  const run = async (ms: number) => {
    await page.clock.runFor(ms);
    elapsed += ms;
  };

  await run(2_000);
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  const step = await page.evaluate(() => Math.floor(window.innerHeight / 2));
  for (let y = 0; y <= height + step; y += step) {
    await page.evaluate((top) => window.scrollTo(0, top), y);
    await run(500);
  }
  // A reveal can miss the sweep when its trigger was measured before layout settled.
  // Make ScrollTrigger re-measure (it refreshes on resize), bring anything still hidden
  // into view, and repeat until every reveal has played.
  let hidden: string[] = [];
  for (let attempt = 0; attempt < 10; attempt++) {
    hidden = await page.evaluate(() => {
      const stillHidden = [...document.querySelectorAll<HTMLElement>("[style*='opacity']")].filter(
        (el) =>
          // rotating hero words and the nav underline are hidden on purpose, not reveals
          !el.closest("#hero-words, #nav-underline") && Number(getComputedStyle(el).opacity) < 1
      );
      stillHidden[0]?.scrollIntoView({ block: "center" });
      window.dispatchEvent(new Event("resize"));
      return stillHidden.map((el) => el.id || el.className.toString().slice(0, 40));
    });
    if (hidden.length === 0) break;
    await run(1_000);
  }
  expect(hidden, "elements GSAP never revealed").toEqual([]);
  await page.evaluate(() => window.scrollTo(0, 0));
  await run(2_000);

  // Finish on a moment where the first hero word is fully shown, whatever the page height
  const phase = elapsed % HERO_CYCLE;
  await run(((HERO_FIRST_WORD_VISIBLE - phase + HERO_CYCLE) % HERO_CYCLE) + HERO_CYCLE);
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
    await page.clock.runFor(1_000);
    await expect(page.locator("header")).toHaveScreenshot("mobile-menu-open.png");
  });

  test("theme toggled from light to dark", async ({ page }) => {
    await open(page, "/about", "light");
    await settle(page);
    await page.getByRole("button", { name: "Switch to dark theme" }).click();
    await page.clock.runFor(1_000);
    await expect(page.locator("footer")).toHaveScreenshot("footer-after-toggle.png");
    await expect(page).toHaveScreenshot("about-after-toggle.png");
  });
});
