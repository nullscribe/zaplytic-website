// @vitest-environment node
import { describe, expect, test } from "vitest";
import Seo from "@/components/Seo.astro";
import { parseHtml } from "@/test/dom";
import { renderToString } from "@/test/render";

async function renderSeo(path: string, props: Record<string, unknown>) {
  const html = await renderToString(Seo, { props, path });
  return parseHtml(`<html><head>${html}</head><body></body></html>`);
}

const attr = (doc: Document, selector: string, name = "content") =>
  doc.querySelector(selector)?.getAttribute(name);

const jsonLd = (doc: Document) =>
  JSON.parse(doc.querySelector('script[type="application/ld+json"]')!.textContent!);

describe("Seo", () => {
  test("page title gets the site name appended", async () => {
    const doc = await renderSeo("/about", { title: "About", description: "Who we are" });
    expect(doc.title).toBe("About | Zaplytic");
    expect(attr(doc, 'meta[property="og:title"]')).toBe("About");
    expect(attr(doc, 'meta[name="twitter:title"]')).toBe("About");
  });

  test("homepage title describes the business when no title is given", async () => {
    const doc = await renderSeo("/", { description: "Home" });
    expect(doc.title).toBe("Zaplytic — Software studio in Bangladesh");
    expect(attr(doc, 'meta[property="og:title"]')).toBe("Zaplytic");
  });

  test("description is used for search, Open Graph and Twitter", async () => {
    const doc = await renderSeo("/", { description: "Who we are" });
    expect(attr(doc, 'meta[name="description"]')).toBe("Who we are");
    expect(attr(doc, 'meta[property="og:description"]')).toBe("Who we are");
    expect(attr(doc, 'meta[name="twitter:description"]')).toBe("Who we are");
  });

  test.each([
    ["/", "https://zaplytic.dev/"],
    ["/index.html", "https://zaplytic.dev/"],
    ["/about", "https://zaplytic.dev/about"],
    ["/about/", "https://zaplytic.dev/about"],
    ["/about.html", "https://zaplytic.dev/about"],
    ["/blog/index.html", "https://zaplytic.dev/blog"],
    ["/blog/a-post.html", "https://zaplytic.dev/blog/a-post"]
  ])("canonical for %s is %s", async (path, canonical) => {
    const doc = await renderSeo(path, { description: "x" });
    expect(attr(doc, 'link[rel="canonical"]', "href")).toBe(canonical);
    expect(attr(doc, 'meta[property="og:url"]')).toBe(canonical);
  });

  test("an explicit path overrides the request URL", async () => {
    const doc = await renderSeo("/whatever.html", { description: "x", path: "/blog/real" });
    expect(attr(doc, 'link[rel="canonical"]', "href")).toBe("https://zaplytic.dev/blog/real");
  });

  test("defaults to a website with site name, locale and twitter card", async () => {
    const doc = await renderSeo("/", { description: "x" });
    expect(attr(doc, 'meta[property="og:type"]')).toBe("website");
    expect(attr(doc, 'meta[property="og:site_name"]')).toBe("Zaplytic");
    expect(attr(doc, 'meta[property="og:locale"]')).toBe("en_US");
    expect(attr(doc, 'meta[name="twitter:card"]')).toBe("summary");
    expect(attr(doc, 'meta[name="twitter:creator"]')).toBe("@nullscribe");
    expect(doc.querySelector('meta[property^="article:"]')).toBeNull();
    expect(doc.querySelector('meta[name="robots"]')).toBeNull();
  });

  test("articles get published time, author, tags and keywords", async () => {
    const doc = await renderSeo("/blog/a-post", {
      title: "A post",
      description: "About things",
      type: "article",
      article: { publishedTime: "2026-01-14", author: "Jahid Hasan", tags: ["rails", "ruby"] }
    });
    expect(attr(doc, 'meta[property="og:type"]')).toBe("article");
    expect(attr(doc, 'meta[property="article:published_time"]')).toBe("2026-01-14");
    expect(attr(doc, 'meta[property="article:author"]')).toBe("Jahid Hasan");
    expect(
      [...doc.querySelectorAll('meta[property="article:tag"]')].map((m) =>
        m.getAttribute("content")
      )
    ).toEqual(["rails", "ruby"]);
    expect(attr(doc, 'meta[name="author"]')).toBe("Jahid Hasan");
    expect(attr(doc, 'meta[name="keywords"]')).toBe("rails, ruby");
  });

  test("site-wide JSON-LD describes the organization and website", async () => {
    const doc = await renderSeo("/", { description: "x" });
    const ld = jsonLd(doc);
    expect(ld["@context"]).toBe("https://schema.org");
    const [org, site] = ld["@graph"];
    expect(org).toMatchObject({
      "@type": "Organization",
      "@id": "https://zaplytic.dev/#organization",
      name: "Zaplytic",
      url: "https://zaplytic.dev",
      logo: "https://zaplytic.dev/favicon.svg",
      email: "zaplytic@gmail.com",
      sameAs: ["https://github.com/zaplytic"]
    });
    expect(site).toMatchObject({
      "@type": "WebSite",
      publisher: { "@id": "https://zaplytic.dev/#organization" }
    });
  });

  test("page JSON-LD nodes are appended to the same graph", async () => {
    const doc = await renderSeo("/blog/a-post", {
      description: "x",
      jsonLd: [{ "@type": "BlogPosting" }, { "@type": "BreadcrumbList" }]
    });
    expect(jsonLd(doc)["@graph"].map((n: { "@type": string }) => n["@type"])).toEqual([
      "Organization",
      "WebSite",
      "BlogPosting",
      "BreadcrumbList"
    ]);
    expect(doc.querySelectorAll('script[type="application/ld+json"]')).toHaveLength(1);
  });

  test("JSON-LD survives content that looks like markup", async () => {
    const doc = await renderSeo("/", {
      description: "x",
      jsonLd: [{ "@type": "Thing", name: `Tom & "Jerry" <b>` }]
    });
    expect(jsonLd(doc)["@graph"][2].name).toBe(`Tom & "Jerry" <b>`);
  });

  test("noindex pages get a robots tag and no canonical", async () => {
    const doc = await renderSeo("/404", { title: "Not found", description: "x", noindex: true });
    expect(attr(doc, 'meta[name="robots"]')).toBe("noindex, follow");
    expect(doc.querySelector('link[rel="canonical"]')).toBeNull();
  });
});
