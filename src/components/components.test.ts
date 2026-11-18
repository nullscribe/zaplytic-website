// @vitest-environment node
import { describe, expect, test } from "vitest";
import AnimatedBackground from "@/components/AnimatedBackground.astro";
import BlogCard from "@/components/BlogCard.astro";
import Footer from "@/components/Footer.astro";
import Hero from "@/components/Hero.astro";
import LatestBlogs from "@/components/LatestBlogs.astro";
import ProductAnimation from "@/components/ProductAnimation.astro";
import ProductCard from "@/components/ProductCard.astro";
import ServiceCard from "@/components/ServiceCard.astro";
import Services from "@/components/Services.astro";
import SocialIcon from "@/components/SocialIcon.astro";
import TeamCard from "@/components/TeamCard.astro";
import TeaserCard from "@/components/TeaserCard.astro";
import ThemeToggle from "@/components/ThemeToggle.astro";
import Values from "@/components/Values.astro";
import { SERVICE_ICONS, SOCIAL_ICONS, VALUE_ICONS } from "@/components/icons";
import { GITHUB_ORG_URL, products, type Product } from "@/loaders/product";
import { services } from "@/loaders/services";
import { socials, team, values } from "@/loaders/team";
import { render, renderToString, text } from "@/test/render";

const all = (doc: Document, selector: string) => [...doc.querySelectorAll(selector)];

describe("ThemeToggle", () => {
  test("is a labelled button with both icons; CSS picks one per theme", async () => {
    const doc = await render(ThemeToggle);
    const button = doc.querySelector("button[data-theme-toggle]")!;
    expect(button.getAttribute("type")).toBe("button");
    expect(button.getAttribute("aria-label")).toBe("Switch to dark theme");
    const [sun, moon] = all(doc, "button svg");
    expect(sun.getAttribute("class")).toContain("hidden dark:block");
    expect(moon.getAttribute("class")).toContain("dark:hidden");
    expect(all(doc, "button svg[aria-hidden=true]")).toHaveLength(2);
  });
});

describe("SocialIcon", () => {
  test.each(Object.keys(SOCIAL_ICONS))("renders the %s icon", async (label) => {
    const doc = await render(SocialIcon, { props: { label } });
    const svg = doc.querySelector("svg")!;
    expect(svg.getAttribute("aria-hidden")).toBe("true");
    expect(svg.querySelector("path")!.getAttribute("d")).toBe(SOCIAL_ICONS[label]);
  });

  test("accepts a custom size class", async () => {
    const doc = await render(SocialIcon, { props: { label: "GitHub", class: "size-3.5" } });
    expect(doc.querySelector("svg")!.getAttribute("class")).toBe("size-3.5");
  });

  test("renders nothing for an unknown label", async () => {
    expect((await renderToString(SocialIcon, { props: { label: "MySpace" } })).trim()).toBe("");
  });
});

describe("Footer", () => {
  test("is the contentinfo landmark with brand, theme toggle and social links", async () => {
    const doc = await render(Footer);
    expect(doc.querySelector("footer")).not.toBeNull();
    expect(doc.querySelector('footer a[href="/"]')!.textContent).toBe("Zaplytic");
    expect(doc.querySelector("footer [data-theme-toggle]")).not.toBeNull();
  });

  test("social links are labelled; external ones open safely in a new tab", async () => {
    const doc = await render(Footer);
    for (const social of socials) {
      const link = doc.querySelector(`footer a[aria-label="${social.label}"]`)!;
      expect(link.getAttribute("href")).toBe(social.href);
      if (social.href.startsWith("mailto:")) {
        expect(link.hasAttribute("target")).toBe(false);
      } else {
        expect(link.getAttribute("target")).toBe("_blank");
        expect(link.getAttribute("rel")).toBe("noopener noreferrer");
      }
      expect(link.querySelector("svg")).not.toBeNull();
    }
  });
});

describe("AnimatedBackground", () => {
  test("is a decorative fixed canvas behind the content", async () => {
    const doc = await render(AnimatedBackground);
    const canvas = doc.querySelector("canvas[data-animated-background]")!;
    expect(canvas.getAttribute("aria-hidden")).toBe("true");
    expect(canvas.getAttribute("class")).toContain("fixed");
    expect(canvas.getAttribute("class")).toContain("pointer-events-none");
  });
});

describe("Hero", () => {
  test("has the page's h1 with all rotating words in the HTML", async () => {
    const doc = await render(Hero);
    const h1 = doc.querySelector("h1")!;
    expect(text(h1).replace(/\s+/g, "")).toBe(
      "EmpoweringDevelopersBusinessesFounderswithHigh-QualitySoftwares"
    );
    expect(all(doc, "#hero-words span").map(text)).toEqual([
      "Developers",
      "Businesses",
      "Founders"
    ]);
  });

  test("has the elements the hero animation targets", async () => {
    const doc = await render(Hero);
    for (const id of [
      "hero-title-start",
      "hero-title-end",
      "hero-words",
      "hero-subtitle",
      "hero-action"
    ]) {
      expect(doc.getElementById(id), id).not.toBeNull();
    }
  });

  test("calls to action link to products", async () => {
    const doc = await render(Hero);
    const cta = doc.querySelector("#hero-action a")!;
    expect(cta.getAttribute("href")).toBe("/products");
    expect(text(cta)).toBe("Explore our Products");
  });
});

describe("ServiceCard", () => {
  const feature = services.find((s) => s.feature)!;
  const regular = services.find((s) => !s.feature)!;

  test("renders title, description and the service icon", async () => {
    const doc = await render(ServiceCard, { props: { service: regular } });
    expect(text(doc.querySelector("h3"))).toBe(regular.title);
    expect(text(doc.querySelector("p"))).toBe(regular.description);
    expect(doc.querySelector("svg path")!.getAttribute("d")).toBe(SERVICE_ICONS[regular.iconName]);
  });

  test("the featured card is larger and lists its highlights", async () => {
    const doc = await render(ServiceCard, { props: { service: feature } });
    expect(all(doc, "li").map(text)).toEqual(feature.highlights);
    expect(doc.querySelector("h3")!.getAttribute("class")).toContain("md:text-3xl");
  });

  test("regular cards have no highlight list", async () => {
    const doc = await render(ServiceCard, { props: { service: regular } });
    expect(doc.querySelector("ul")).toBeNull();
  });

  test("has a centred glow by default so it looks right before any pointer move", async () => {
    const doc = await render(ServiceCard, { props: { service: regular } });
    const wrap = doc.querySelector("[data-pointer-glow]")!;
    expect(wrap.getAttribute("style")).toContain("--mx: 50%");
  });
});

describe("Services", () => {
  test("renders the featured service first, then the rest, each in an animated cell", async () => {
    const doc = await render(Services);
    expect(doc.querySelector("section#services-section")).not.toBeNull();
    expect(text(doc.querySelector("h2#services-title"))).toBe("What we can do for you");
    const titles = all(doc, ".service-card h3").map(text);
    expect(titles[0]).toBe(services.find((s) => s.feature)!.title);
    expect([...titles].sort()).toEqual(services.map((s) => s.title).sort());
  });
});

describe("BlogCard", () => {
  test("links to the post and lists its tags", async () => {
    const doc = await render(BlogCard, {
      props: { slug: "my-post", title: "My post", tags: ["rails", "ruby"] }
    });
    const link = doc.querySelector("a")!;
    expect(link.getAttribute("href")).toBe("/blog/my-post");
    expect(text(link.querySelector("h3"))).toBe("My post");
    expect(all(doc, "span").map(text)).toEqual(["rails", "ruby"]);
  });

  test("omits the tag row when there are no tags", async () => {
    const doc = await render(BlogCard, { props: { slug: "x", title: "X", tags: [] } });
    expect(doc.querySelector("span")).toBeNull();
  });
});

describe("LatestBlogs", () => {
  const blogs = [1, 2, 3, 4].map((n) => ({
    slug: `post-${n}`,
    title: `Post ${n}`,
    description: `Description ${n}`,
    date: `2026-01-0${n}`,
    tags: ["test"]
  }));

  test("renders a card per post, in order, plus a link to the blog", async () => {
    const doc = await render(LatestBlogs, { props: { blogs } });
    expect(text(doc.querySelector("#latest-blog-title"))).toBe("Read our latest blogs");
    expect(all(doc, ".blogcard a").map((a) => a.getAttribute("href"))).toEqual(
      blogs.map((b) => `/blog/${b.slug}`)
    );
    const more = all(doc, "a").find((a) => text(a) === "Go here")!;
    expect(more.getAttribute("href")).toBe("/blog");
  });

  test("renders nothing when there are no posts", async () => {
    const html = await renderToString(LatestBlogs, { props: { blogs: [] } });
    expect(html).not.toContain("Read our latest blogs");
  });
});

describe("ProductAnimation", () => {
  test.each(products.map((p) => p.name))("renders the %s scene", async (name) => {
    const doc = await render(ProductAnimation, { props: { name } });
    const root = doc.querySelector("[data-product-animation]")!;
    expect(root.getAttribute("data-product-animation")).toBe(name);
    const svgs = root.querySelectorAll("svg");
    expect(svgs).toHaveLength(1);
    expect(svgs[0].getAttribute("viewBox")).toBe("0 0 400 200");
    expect(svgs[0].getAttribute("aria-hidden")).toBe("true");
  });

  test.each([
    ["ZapRoute", ["#zr-path", "#zr-traveler", ".zr-pulse"]],
    ["ZapMemo", [".zm-item", ".zm-print"]],
    ["RailGuard", ["#rg-line", "#rg-area", ".rg-node"]],
    ["Kanon Academy", [".ka-book"]],
    ["AMC-Booster", ["#cl-progress", ".cl-cross"]]
  ])("%s has the elements its animation targets", async (name, selectors) => {
    const doc = await render(ProductAnimation, { props: { name } });
    for (const selector of selectors) expect(doc.querySelector(selector), selector).not.toBeNull();
  });

  test("SVG attributes are written in their real (kebab-case) form", async () => {
    const html = await renderToString(ProductAnimation, { props: { name: "ZapRoute" } });
    expect(html).toContain("stroke-width=");
    expect(html).toContain("stop-color=");
    expect(html).not.toMatch(/strokeWidth|stopColor|className/);
  });
});

describe("ProductCard", () => {
  const withBoth: Product = {
    name: "ZapRoute",
    category: "saas",
    description: "A travel ERP.",
    technologies: ["Rails", "Hotwire"],
    liveLink: "https://example.com",
    githubLink: "https://github.com/zaplytic/x"
  };

  test("renders name, description, technologies and the scene", async () => {
    const doc = await render(ProductCard, { props: { product: withBoth } });
    expect(text(doc.querySelector("h3"))).toBe("ZapRoute");
    expect(text(doc.querySelector("article > div.relative.mt-5 p"))).toBe("A travel ERP.");
    expect(all(doc, ".mt-4 span").map(text)).toEqual(["Rails", "Hotwire"]);
    expect(doc.querySelector('[data-product-animation="ZapRoute"]')).not.toBeNull();
  });

  test("links open in a new tab with noopener", async () => {
    const doc = await render(ProductCard, { props: { product: withBoth } });
    const links = all(doc, "a");
    expect(links.map(text)).toEqual(["Live Demo", "GitHub"]);
    for (const a of links) {
      expect(a.getAttribute("target")).toBe("_blank");
      expect(a.getAttribute("rel")).toBe("noopener noreferrer");
    }
  });

  test("omits links the product doesn't have", async () => {
    const doc = await render(ProductCard, {
      props: { product: { ...withBoth, liveLink: undefined, githubLink: undefined } }
    });
    expect(doc.querySelectorAll("a")).toHaveLength(0);
  });

  test("has the hooks the tilt script needs", async () => {
    const doc = await render(ProductCard, { props: { product: withBoth } });
    expect(doc.querySelector("[data-tilt] > article[data-tilt-card].product")).not.toBeNull();
  });
});

describe("TeaserCard", () => {
  test("'more coming' is not a link", async () => {
    const doc = await render(TeaserCard, { props: { variant: "more-coming" } });
    const card = doc.querySelector("[data-teaser]")!;
    expect(card.tagName).toBe("DIV");
    expect(card.getAttribute("aria-label")).toBe("More coming");
    expect([...card.querySelectorAll("p")].map(text)).toEqual([
      "More coming",
      "We're building new ideas"
    ]);
  });

  test("'discuss' is an internal link without target", async () => {
    const doc = await render(TeaserCard, { props: { variant: "discuss", href: "/about#contact" } });
    const card = doc.querySelector("a[data-teaser]")!;
    expect(card.getAttribute("href")).toBe("/about#contact");
    expect(card.hasAttribute("target")).toBe(false);
    expect(card.getAttribute("aria-label")).toBe("Want to discuss?");
  });

  test("'see GitHub' always links to the GitHub org in a new tab", async () => {
    const doc = await render(TeaserCard, { props: { variant: "see-github", href: "/ignored" } });
    const card = doc.querySelector("a[data-teaser]")!;
    expect(card.getAttribute("href")).toBe(GITHUB_ORG_URL);
    expect(card.getAttribute("target")).toBe("_blank");
    expect(card.getAttribute("rel")).toBe("noopener noreferrer");
  });

  test.each(["more-coming", "discuss", "see-github"])(
    "%s has a decorative icon",
    async (variant) => {
      const doc = await render(TeaserCard, { props: { variant } });
      expect(all(doc, "svg[aria-hidden=true]")).toHaveLength(1);
    }
  );
});

describe("TeamCard", () => {
  test.each(team)("renders $name", async (member) => {
    const doc = await render(TeamCard, { props: { member } });
    expect(text(doc.querySelector("h3"))).toBe(member.name);
    expect(text(doc.body)).toContain(member.role);
    expect(text(doc.body)).toContain(member.bio);
    expect(doc.querySelector("span[aria-hidden=true]")!.getAttribute("class")).toMatch(
      /bg-\w+-400/
    );
  });
});

describe("Values", () => {
  test("renders a numbered card per value with its icon and copy", async () => {
    const doc = await render(Values, { props: { values } });
    const cards = all(doc, "button.valuecard");
    expect(cards).toHaveLength(values.length);
    cards.forEach((card, i) => {
      const value = values[i];
      expect(card.getAttribute("type")).toBe("button");
      expect(card.getAttribute("aria-label")).toBe(value.title);
      expect(text(card.querySelector("h4"))).toBe(value.title);
      expect(text(card)).toContain(String(i + 1).padStart(2, "0"));
      expect(text(card)).toContain(value.principle);
      expect(card.querySelector("path")!.getAttribute("d")).toBe(VALUE_ICONS[value.icon]);
    });
  });
});

describe("CSS motion markup", () => {
  const styleOf = (el: Element | null) => el?.getAttribute("style") ?? "";

  test("hero title words are split into inline-block spans that fly in from ±1000px", async () => {
    const doc = await render(Hero);
    const words = all(doc, "#hero-title-start .motion, #hero-title-end .motion");
    expect(words.map(text)).toEqual(["Empowering", "with", "High-Quality", "Softwares"]);
    for (const word of words) {
      expect(word.getAttribute("class")).toContain("inline-block");
      expect(styleOf(word)).toMatch(/--from-x: -?1000px; --from-y: -?1000px; --duration: 0\.7s/);
    }
  });

  test("hero keeps a space between every word of the title", async () => {
    const doc = await render(Hero);
    // The rotating words share one grid cell (no spaces between them) and the gap before "with"
    // is the grid's margin, exactly as in the original markup.
    expect(text(doc.querySelector("h1"))).toBe(
      "Empowering DevelopersBusinessesFounderswith High-Quality Softwares"
    );
  });

  test("rotating hero words take turns via their index", async () => {
    const doc = await render(Hero);
    expect(all(doc, ".hero-word").map(styleOf)).toEqual(["--i: 0", "--i: 1", "--i: 2"]);
  });

  test("hyphenated subtitle words never break mid-word", async () => {
    const doc = await render(Hero);
    expect(all(doc, "#hero-subtitle .whitespace-nowrap").map(text)).toEqual([
      "high-performance",
      "open-source"
    ]);
    expect(text(doc.querySelector("#hero-subtitle"))).toContain(
      "SaaS systems, high-performance client solutions, and intuitive open-source tools."
    );
  });

  test("services reveal at 80% with cards staggered in order", async () => {
    const doc = await render(Services);
    expect(doc.querySelector("#services-section")!.getAttribute("data-reveal")).toBe("80");
    const cards = all(doc, ".service-card");
    cards.forEach((card, i) => {
      expect(card.classList.contains("motion-reveal")).toBe(true);
      expect(styleOf(card)).toContain(`--i: ${i};`);
    });
  });

  test("value cards wipe in with a clip-path reveal", async () => {
    const doc = await render(Values, { props: { values } });
    expect(doc.querySelector("[data-reveal]")).not.toBeNull();
    all(doc, ".valuecard").forEach((card, i) => {
      expect(card.classList.contains("motion-reveal")).toBe(true);
      expect(styleOf(card)).toContain(`--i: ${i};`);
      expect(styleOf(card)).toContain("--from-clip: inset(0 0 100% 0)");
    });
  });

  test("team cards take their stagger index from props", async () => {
    const doc = await render(TeamCard, { props: { member: team[2], index: 2 } });
    expect(styleOf(doc.querySelector(".teamcard"))).toContain("--i: 2;");
  });

  test("product and teaser cards pop in at their page position", async () => {
    const product = products[0];
    const card = await render(ProductCard, { props: { product, index: 4 } });
    expect(styleOf(card.querySelector("article.product"))).toContain("--i: 4;");
    const teaser = await render(TeaserCard, { props: { variant: "more-coming", index: 5 } });
    expect(styleOf(teaser.querySelector("[data-teaser]"))).toContain("--i: 5;");
  });

  describe("product scenes", () => {
    const scene = (name: string) => render(ProductAnimation, { props: { name } });

    test("ZapRoute's traveller follows the drawn route", async () => {
      const doc = await scene("ZapRoute");
      const route = doc.querySelector("#zr-path")!.getAttribute("d")!;
      expect(styleOf(doc.querySelector("#zr-traveler"))).toBe(`offset-path: path("${route}")`);
    });

    test("ZapMemo lines are visible without animation (no opacity=0 start)", async () => {
      const doc = await scene("ZapMemo");
      const items = all(doc, ".zm-item");
      expect(items).toHaveLength(5);
      for (const item of items) expect(item.hasAttribute("opacity")).toBe(false);
    });

    test("RailGuard draws its chart at build time, two periods wide, clipped to the frame", async () => {
      const doc = await scene("RailGuard");
      const points = doc.querySelector("#rg-line")!.getAttribute("points")!.split(" ");
      expect(points).toHaveLength(80);
      const area = doc.querySelector("#rg-area")!.getAttribute("points")!.split(" ");
      expect(area[0]).toBe("0,140");
      expect(area.at(-1)).toMatch(/,140$/);
      expect(styleOf(doc.querySelector(".rg-scroll"))).toMatch(/^--period: [\d.]+px$/);
      expect(doc.querySelector("[clip-path='url(#rg-clip)'] .rg-scroll")).not.toBeNull();
    });

    test("Kanon Academy books float inside their positioned groups", async () => {
      const doc = await scene("Kanon Academy");
      const books = all(doc, ".ka-book");
      expect(books).toHaveLength(3);
      books.forEach((book, i) => {
        expect(book.getAttribute("transform")).toMatch(/^translate\(/);
        expect(styleOf(book.querySelector(".ka-float"))).toBe(`--i: ${i}`);
      });
    });

    test("AMC-Booster's progress bar is full width (scaled by CSS)", async () => {
      const doc = await scene("AMC-Booster");
      expect(doc.querySelector("#cl-progress")!.getAttribute("width")).toBe("240");
      expect(doc.querySelector(".cl-cross > .cl-pulse")).not.toBeNull();
    });
  });
});
