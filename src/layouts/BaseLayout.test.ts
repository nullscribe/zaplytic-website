// @vitest-environment node
import { describe, expect, test } from "vitest";
import BaseLayout from "@/layouts/BaseLayout.astro";
import { render } from "@/test/render";

const props = { title: "About", description: "Who we are" };

describe("BaseLayout", () => {
  test("is a complete English HTML document", async () => {
    const doc = await render(BaseLayout, { props, path: "/about" });
    expect(doc.documentElement.getAttribute("lang")).toBe("en");
    expect(doc.querySelector("meta[charset]")!.getAttribute("charset")).toBe("UTF-8");
    expect(doc.querySelector('meta[name="viewport"]')!.getAttribute("content")).toBe(
      "width=device-width, initial-scale=1.0"
    );
    expect(doc.querySelector('link[rel="icon"]')!.getAttribute("href")).toBe("/favicon.svg");
    expect(doc.querySelector('link[rel="sitemap"]')!.getAttribute("href")).toBe(
      "/sitemap-index.xml"
    );
  });

  test("passes SEO props through to the head", async () => {
    const doc = await render(BaseLayout, { props, path: "/about" });
    expect(doc.title).toBe("About | Zaplytic");
    expect(doc.querySelector('link[rel="canonical"]')!.getAttribute("href")).toBe(
      "https://zaplytic.dev/about"
    );
  });

  test("renders header, page content and footer in order", async () => {
    const doc = await render(BaseLayout, {
      props,
      slots: { default: '<main id="page">Hello</main>' }
    });
    const app = doc.querySelector("[data-testid=app]")!;
    expect([...app.children].map((el) => el.tagName).filter((tag) => tag !== "SCRIPT")).toEqual([
      "HEADER",
      "MAIN",
      "FOOTER"
    ]);
    expect(doc.getElementById("page")!.textContent).toBe("Hello");
  });

  test("applies the stored or preferred theme before first paint", async () => {
    const doc = await render(BaseLayout, { props });
    const inline = [
      ...doc.head.querySelectorAll('script:not([type]), script[type="text/javascript"]')
    ]
      .map((s) => s.textContent ?? "")
      .find((s) => s.includes("localStorage"));
    expect(inline).toBeDefined();
    expect(inline).toContain('localStorage.getItem("theme")');
    expect(inline).toContain("prefers-color-scheme: dark");
    expect(inline).toContain('classList.add("dark")');
    expect(inline).toContain('classList.add("js")');
  });
});
