import { expect, test, type Page } from "@playwright/test";

/**
 * Behaviour of the CSS animations for visitors who allow motion (the screenshot tests run
 * with reduced motion, so they only see resting states).
 */
test.use({ reducedMotion: "no-preference" });

/** Waits for every finite animation on the page to finish (infinite loops are ignored). */
const finishAnimations = (page: Page) =>
  page.evaluate(() =>
    Promise.all(
      document
        .getAnimations()
        .filter((a) => a.effect?.getComputedTiming().iterations !== Infinity)
        .map((a) => a.finished.catch(() => undefined))
    )
  );

const opacityOf = (page: Page, selector: string) =>
  page
    .locator(selector)
    .first()
    .evaluate((el) => Number(getComputedStyle(el).opacity));

test("entrance animations play on load and end fully visible", async ({ page }) => {
  await page.goto("/");
  expect(
    await page.evaluate(() => document.getAnimations().length),
    "animations running on load"
  ).toBeGreaterThan(0);
  await finishAnimations(page);
  for (const selector of ["#hero-title-start .motion", "#hero-subtitle", "#hero-action"]) {
    expect(await opacityOf(page, selector), selector).toBe(1);
  }
});

test("sections below the fold wait until scrolled into view, then reveal once", async ({
  page
}) => {
  await page.goto("/about");
  await finishAnimations(page);

  const contact = page.locator("#contact");
  await expect(contact).not.toHaveClass(/is-revealed/);
  expect(await opacityOf(page, "#contact-title")).toBe(0);

  await contact.scrollIntoViewIfNeeded();
  await expect(contact).toHaveClass(/is-revealed/);
  await finishAnimations(page);
  expect(await opacityOf(page, "#contact-title")).toBe(1);

  // scrolling away and back does not hide it again
  await page.evaluate(() => window.scrollTo(0, 0));
  await contact.scrollIntoViewIfNeeded();
  expect(await opacityOf(page, "#contact-title")).toBe(1);
});

test("scrolling through every page leaves nothing hidden", async ({ page }) => {
  for (const path of ["/", "/products", "/about", "/blog"]) {
    await page.goto(path);
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y <= height; y += 300) {
      await page.evaluate((top) => window.scrollTo(0, top), y);
      await page.waitForTimeout(30);
    }
    await finishAnimations(page);
    const hidden = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>(".motion, .motion-reveal")]
        .filter((el) => Number(getComputedStyle(el).opacity) < 1)
        .map((el) => el.id || el.className.slice(0, 40))
    );
    expect(hidden, path).toEqual([]);
  }
});

test("the hero words rotate on a loop", async ({ page }) => {
  await page.goto("/");
  const words = page.locator(".hero-word");
  await expect(words).toHaveCount(3);
  const infinite = await words.evaluateAll((els) =>
    els.map((el) =>
      el.getAnimations().some((a) => a.effect?.getComputedTiming().iterations === Infinity)
    )
  );
  expect(infinite).toEqual([true, true, true]);
});

test("product scenes loop, and the RailGuard chart scrolls", async ({ page }) => {
  await page.goto("/products");
  for (const selector of [".zr-traveler", ".zm-item", ".rg-scroll", ".ka-float", ".cl-progress"]) {
    const looping = await page
      .locator(selector)
      .first()
      .evaluate((el) =>
        el.getAnimations().some((a) => a.effect?.getComputedTiming().iterations === Infinity)
      );
    expect(looping, selector).toBe(true);
  }
  const shift = () =>
    page.locator(".rg-scroll").evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).m41);
  const before = await shift();
  await page.waitForTimeout(500);
  expect(await shift()).toBeLessThan(before);
});

test("with JavaScript off, nothing waits for a reveal that will never come", async ({
  browser
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    reducedMotion: "no-preference"
  });
  const page = await context.newPage();
  await page.goto("/about");
  await page.locator("#contact").scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);
  expect(await opacityOf(page, "#contact-title")).toBe(1);
  await context.close();
});
