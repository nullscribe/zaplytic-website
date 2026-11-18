import { Window } from "happy-dom";
import { describe, expect, test } from "vitest";
import { products } from "@/loaders/product";
import { services } from "@/loaders/services";
import { team, values } from "@/loaders/team";
import { readdirSync } from "node:fs";
import { join } from "node:path";
import { SITE, htmlFiles, jsonLd, meta, page, pageJsBytes, read, siteDir } from "./site";

const text = (el: Element | null) => (el?.textContent ?? "").replace(/\s+/g, " ").trim();
const all = (doc: Document, selector: string) => [...doc.querySelectorAll(selector)];
const postFiles = () => htmlFiles().filter((f) => f.startsWith("blog/"));

describe("home page", () => {
  const doc = () => page("index.html");

  test("shows the hero, every service and the four newest posts", () => {
    expect(text(doc().querySelector("h1"))).toContain("Empowering");
    const serviceTitles = all(doc(), "#services-section h3").map(text);
    expect(serviceTitles.sort()).toEqual(services.map((s) => s.title).sort());

    const latest = all(doc(), ".blogcard a").map((a) => a.getAttribute("href"));
    const newest = all(page("blog.html"), "a.blogCard")
      .slice(0, 4)
      .map((a) => a.getAttribute("href"));
    expect(latest).toEqual(newest);
  });

  test("uses the site description", () => {
    expect(meta(doc(), "description")).toMatch(/product studio in Bangladesh/);
  });
});

describe("products page", () => {
  const doc = () => page("products.html");

  test("shows every product in its category section with a teaser card", () => {
    for (const category of ["saas", "client", "oss"]) {
      const section = doc().querySelector(`section[data-category=${category}]`)!;
      const names = all(section as unknown as Document, "article h3").map(text);
      expect(names).toEqual(products.filter((p) => p.category === category).map((p) => p.name));
      expect(section.querySelector("[data-teaser]")).not.toBeNull();
    }
  });

  test("describes the products as an ItemList of software applications", () => {
    const list = jsonLd(doc()).find((n) => n["@type"] === "ItemList")!;
    const items = list.itemListElement as {
      position: number;
      item: { name: string; "@type": string };
    }[];
    expect(items.map((i) => i.item.name)).toEqual(products.map((p) => p.name));
    expect(items.map((i) => i.position)).toEqual(products.map((_, i) => i + 1));
    expect(items.every((i) => i.item["@type"] === "SoftwareApplication")).toBe(true);
  });
});

describe("about page", () => {
  const doc = () => page("about.html");

  test("shows every value, every team member and the contact section", () => {
    expect(all(doc(), ".valuecard h4").map(text)).toEqual(values.map((v) => v.title));
    expect(all(doc(), ".teamcard h3").map(text)).toEqual(team.map((m) => m.name));
    expect(doc().getElementById("contact")).not.toBeNull();
    expect(doc().querySelector('#contact a[href^="mailto:"]')).not.toBeNull();
  });

  test("is marked up as an AboutPage about the organization", () => {
    const node = jsonLd(doc()).find((n) => n["@type"] === "AboutPage")!;
    expect(node.about).toEqual({ "@id": `${SITE}/#organization` });
  });
});

describe("blog index", () => {
  const doc = () => page("blog.html");

  test("lists every post, newest first, with a machine-readable date", () => {
    const cards = all(doc(), "a.blogCard");
    expect(cards).toHaveLength(postFiles().length);
    const dates = cards.map((c) => c.querySelector("time")!.getAttribute("datetime")!);
    expect(dates).toEqual([...dates].sort().reverse());
  });

  test("is marked up as a Blog listing every post", () => {
    const blog = jsonLd(doc()).find((n) => n["@type"] === "Blog")!;
    expect((blog.blogPost as unknown[]).length).toBe(postFiles().length);
  });
});

describe.each(postFiles())("%s", (file) => {
  const doc = () => page(file);
  const url = `${SITE}/${file.replace(/\.html$/, "")}`;

  test("the article is in the HTML (title, byline, body)", () => {
    const article = doc().querySelector("main article")!;
    expect(article.querySelector("h1")).not.toBeNull();
    expect(text(article)).toMatch(/^.*By \S+/);
    expect(article.querySelectorAll(".prose p").length).toBeGreaterThan(2);
  });

  test("BlogPosting JSON-LD matches the visible article", () => {
    const posting = jsonLd(doc()).find((n) => n["@type"] === "BlogPosting")!;
    expect(posting.headline).toBe(text(doc().querySelector("h1")));
    expect(posting.url).toBe(url);
    expect(posting.mainEntityOfPage).toBe(url);
    expect(posting.datePublished).toBe(
      doc().querySelector("header time")!.getAttribute("datetime")
    );
    expect(posting.description).toBe(meta(doc(), "description"));
    expect((posting.author as { name: string }).name).toBe(meta(doc(), "article:author"));
  });

  test("has a breadcrumb trail Home > Blog > post", () => {
    const crumbs = jsonLd(doc()).find((n) => n["@type"] === "BreadcrumbList")!;
    const items = crumbs.itemListElement as { position: number; item: string }[];
    expect(items.map((i) => i.item)).toEqual([SITE, `${SITE}/blog`, url]);
  });

  test("is an article with publish date and tags for link previews", () => {
    expect(meta(doc(), "og:type")).toBe("article");
    expect(meta(doc(), "article:published_time")).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(doc().querySelectorAll('meta[property="article:tag"]').length).toBeGreaterThan(0);
  });

  test("code blocks are plain <pre><code> styled by the typography plugin (original design)", () => {
    for (const pre of doc().querySelectorAll(".prose pre")) {
      expect(pre.querySelector("code"), file).not.toBeNull();
      expect(pre.getAttribute("style"), file).toBeNull();
    }
  });
});

describe("JavaScript budget", () => {
  test("no page ships React or framework islands", () => {
    for (const file of htmlFiles()) {
      expect(read(file), file).not.toContain("astro-island");
    }
  });

  test("no page ships an animation library (animations are CSS)", () => {
    const js = readdirSync(join(siteDir(), "_astro")).filter((f) => f.endsWith(".js"));
    for (const file of js) {
      const src = read(`_astro/${file}`);
      expect(src, file).not.toMatch(/gsap|ScrollTrigger|SplitText/i);
    }
    for (const file of htmlFiles()) expect(read(file), file).not.toMatch(/gsap/i);
  });

  test("every page ships under 5 KB of gzipped JS", () => {
    for (const file of htmlFiles()) {
      expect(pageJsBytes(file), file).toBeLessThan(5 * 1024);
    }
  });

  test("blog posts and the 404 page ship under 2 KB (theme toggle and menu only)", () => {
    for (const file of [...postFiles(), "404.html"]) {
      expect(pageJsBytes(file), file).toBeLessThan(2 * 1024);
    }
  });
});

describe("theme bootstrap script", () => {
  const script = () =>
    [...page("index.html").head.querySelectorAll("script:not([type])")]
      .map((s) => s.textContent!)
      .find((s) => s.includes("localStorage"))!;

  function run({
    stored,
    prefersDark,
    storageThrows = false
  }: {
    stored: string | null;
    prefersDark: boolean;
    storageThrows?: boolean;
  }) {
    const window = new Window();
    const store = new Map<string, string>(stored ? [["theme", stored]] : []);
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: (k: string) => {
          if (storageThrows) throw new Error("blocked");
          return store.get(k) ?? null;
        },
        setItem: (k: string, v: string) => store.set(k, v)
      }
    });
    window.matchMedia = ((query: string) => ({
      matches: prefersDark && query.includes("dark")
    })) as never;
    window.eval(script());
    return {
      dark: window.document.documentElement.classList.contains("dark"),
      stored: store.get("theme") ?? null
    };
  }

  test("it is the first executable script in the head, so the theme applies before paint", () => {
    const first = page("index.html").head.querySelector(
      'script:not([type="application/ld+json"])'
    )!;
    expect(first.textContent).toContain("localStorage");
    expect(first.hasAttribute("src")).toBe(false);
    expect(first.getAttribute("type")).toBeNull(); // classic, blocking script
  });

  test.each([
    [
      { stored: "dark", prefersDark: false },
      { dark: true, stored: "dark" }
    ],
    [
      { stored: "light", prefersDark: true },
      { dark: false, stored: "light" }
    ],
    [
      { stored: null, prefersDark: true },
      { dark: true, stored: "dark" }
    ],
    [
      { stored: null, prefersDark: false },
      { dark: false, stored: "light" }
    ]
  ])("%o -> %o", (input, expected) => {
    expect(run(input)).toEqual(expected);
  });

  test("marks the page as scripted (.js), so sections can wait to be revealed", () => {
    const window = new Window();
    window.eval(script());
    expect(window.document.documentElement.classList.contains("js")).toBe(true);
  });

  test("falls back to light without crashing when storage is blocked", () => {
    expect(run({ stored: null, prefersDark: true, storageThrows: true }).dark).toBe(false);
  });
});
