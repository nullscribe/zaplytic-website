import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { SITE, fileFor, htmlFiles, jsonLd, meta, page, read, sitemapUrls, urlFor } from "./site";

const blogDir = join(process.cwd(), "blogs");
const blogSlugs = readdirSync(blogDir)
  .filter((f) => f.endsWith(".md"))
  .map((f) => readFileSync(join(blogDir, f), "utf8").match(/^slug:\s*(\S+)/m)![1]);

const indexable = () => htmlFiles().filter((f) => f !== "404.html");

describe("sitemap and robots", () => {
  test("the sitemap lists exactly the indexable pages", () => {
    expect(sitemapUrls()).toEqual(indexable().map(urlFor).sort());
  });

  test("sitemap URLs are canonical: https, no .html, no trailing slash", () => {
    for (const url of sitemapUrls()) {
      const { protocol, host, pathname } = new URL(url);
      expect(protocol).toBe("https:");
      expect(host).toBe("zaplytic.dev");
      expect(pathname).not.toMatch(/\.html$/);
      if (pathname !== "/") expect(pathname).not.toMatch(/\/$/);
    }
  });

  test("every sitemap URL is served by a built page", () => {
    for (const url of sitemapUrls()) expect(fileFor(new URL(url).pathname), url).toBeDefined();
  });

  test("every blog post is built and in the sitemap", () => {
    expect(blogSlugs.length).toBeGreaterThan(0);
    for (const slug of blogSlugs) {
      expect(fileFor(`/blog/${slug}`), slug).toBe(`blog/${slug}.html`);
      expect(sitemapUrls()).toContain(`${SITE}/blog/${slug}`);
    }
  });

  test("robots.txt allows crawling and points to the sitemap", () => {
    const robots = read("robots.txt");
    expect(robots).toMatch(/^User-agent: \*$/m);
    expect(robots).toMatch(/^Allow: \/$/m);
    expect(robots).not.toMatch(/^Disallow: \/\s*$/m);
    expect(robots).toContain(`Sitemap: ${SITE}/sitemap-index.xml`);
    expect(fileFor("/sitemap-index.xml")).toBeDefined();
  });

  test("the 404 page is noindex and has no canonical", () => {
    const doc = page("404.html");
    expect(meta(doc, "robots")).toBe("noindex, follow");
    expect(doc.querySelector('link[rel="canonical"]')).toBeNull();
    expect(doc.querySelector("h1")!.textContent).toBe("Page not found");
  });
});

describe.each(indexable())("%s", (file) => {
  const doc = () => page(file);

  test("is fully rendered HTML in English with real content", () => {
    expect(doc().documentElement.getAttribute("lang")).toBe("en");
    expect(doc().querySelector("main")).not.toBeNull();
    expect(
      doc().querySelector("main")!.textContent!.replace(/\s+/g, " ").trim().length
    ).toBeGreaterThan(100);
  });

  test("has exactly one h1", () => {
    expect(doc().querySelectorAll("h1")).toHaveLength(1);
    expect(doc().querySelector("h1")!.textContent!.trim()).not.toBe("");
  });

  test("has a title and a description sized for search results", () => {
    const title = doc().title;
    const description = meta(doc(), "description")!;
    expect(title).toMatch(/\| Zaplytic$|^Zaplytic/);
    expect(title.length).toBeLessThanOrEqual(110);
    expect(description.length).toBeGreaterThanOrEqual(50);
    expect(description.length).toBeLessThanOrEqual(300);
  });

  test("canonical and og:url match the page's own sitemap URL", () => {
    const canonical = doc().querySelector('link[rel="canonical"]')!.getAttribute("href");
    expect(canonical).toBe(urlFor(file));
    expect(meta(doc(), "og:url")).toBe(canonical);
    expect(sitemapUrls()).toContain(canonical);
  });

  test("has Open Graph and Twitter card metadata", () => {
    for (const key of [
      "og:title",
      "og:description",
      "og:type",
      "og:site_name",
      "twitter:card",
      "twitter:title"
    ]) {
      expect(meta(doc(), key), key).toBeTruthy();
    }
  });

  test("has valid JSON-LD with the organization", () => {
    const nodes = jsonLd(doc());
    expect(nodes.map((n) => n["@type"])).toEqual(
      expect.arrayContaining(["Organization", "WebSite"])
    );
    expect(doc().querySelectorAll('script[type="application/ld+json"]')).toHaveLength(1);
  });

  test("every image has alt text", () => {
    for (const img of doc().querySelectorAll("img"))
      expect(img.hasAttribute("alt"), img.outerHTML).toBe(true);
  });

  test("decorative SVGs are hidden from assistive tech", () => {
    for (const svg of doc().querySelectorAll("svg")) {
      const labelled = svg.hasAttribute("aria-label") || svg.querySelector("title");
      if (!labelled)
        expect(svg.getAttribute("aria-hidden"), svg.outerHTML.slice(0, 80)).toBe("true");
    }
  });

  test("internal links all resolve, including #anchors", () => {
    for (const a of doc().querySelectorAll("a[href^='/']")) {
      const href = a.getAttribute("href")!;
      const [path, hash] = href.split("#");
      const target = fileFor(path);
      expect(target, href).toBeDefined();
      if (hash && target!.endsWith(".html")) {
        expect(page(target!).getElementById(hash), href).not.toBeNull();
      }
    }
  });

  test("internal links use canonical form (no .html, no trailing slash)", () => {
    for (const a of doc().querySelectorAll("a[href^='/']")) {
      const path = a.getAttribute("href")!.split("#")[0];
      expect(path).not.toMatch(/\.html$/);
      if (path !== "/") expect(path).not.toMatch(/\/$/);
    }
  });

  test("links opening a new tab use rel=noopener", () => {
    for (const a of doc().querySelectorAll("a[target=_blank]")) {
      expect(a.getAttribute("rel"), a.getAttribute("href")!).toContain("noopener");
    }
  });

  test("header nav marks the current section", () => {
    const active = [...doc().querySelectorAll("#nav-links [aria-current=page]")].map((a) =>
      a.getAttribute("href")
    );
    const section = "/" + (urlFor(file).replace(SITE, "").split("/")[1] ?? "");
    expect(active).toEqual([section === "/" ? "/" : section]);
  });
});
