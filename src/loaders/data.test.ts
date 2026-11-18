import { describe, expect, test } from "vitest";
import { SERVICE_ICONS, SOCIAL_ICONS, VALUE_ICONS } from "@/components/icons";
import { GITHUB_ORG_URL, products } from "@/loaders/product";
import { services } from "@/loaders/services";
import { CONTACT_EMAIL, socials, team, values } from "@/loaders/team";
import { SITE_URL, navLinks } from "@/lib/site";
import { animations } from "@/scripts/product-animations";

const unique = <T>(items: T[]) => new Set(items).size === items.length;
const isHttps = (url: string) => new URL(url).protocol === "https:";

describe("products", () => {
  test("names are unique", () => {
    expect(unique(products.map((p) => p.name))).toBe(true);
  });

  test("every product has a scene animation", () => {
    for (const p of products) expect(Object.keys(animations), p.name).toContain(p.name);
  });

  test("every category shown on the products page has at least one product", () => {
    for (const category of ["saas", "client", "oss"]) {
      expect(
        products.some((p) => p.category === category),
        category
      ).toBe(true);
    }
  });

  test("descriptions and technologies are filled in", () => {
    for (const p of products) {
      expect(p.description.length, p.name).toBeGreaterThan(10);
      expect(p.technologies.length, p.name).toBeGreaterThan(0);
    }
  });

  test("links are absolute https URLs", () => {
    for (const p of products) {
      for (const link of [p.liveLink, p.githubLink].filter(Boolean) as string[]) {
        expect(isHttps(link), `${p.name}: ${link}`).toBe(true);
      }
    }
    expect(isHttps(GITHUB_ORG_URL)).toBe(true);
  });

  test("open-source products link to their repository", () => {
    for (const p of products.filter((p) => p.category === "oss")) {
      expect(p.githubLink, p.name).toMatch(/^https:\/\/github\.com\//);
    }
  });
});

describe("services", () => {
  test("exactly one service is featured, and it has highlights", () => {
    const featured = services.filter((s) => s.feature);
    expect(featured).toHaveLength(1);
    expect(featured[0].highlights?.length).toBeGreaterThan(0);
  });

  test("ids are unique and URL-safe", () => {
    expect(unique(services.map((s) => s.id))).toBe(true);
    for (const s of services) expect(s.id).toMatch(/^[a-z0-9-]+$/);
  });

  test("every service has an icon", () => {
    for (const s of services) expect(SERVICE_ICONS[s.iconName], s.id).toBeTruthy();
  });

  test("fills the bento grid: one feature plus four smaller cards", () => {
    expect(services).toHaveLength(5);
  });
});

describe("team and values", () => {
  test("team members are unique and have a bio", () => {
    expect(unique(team.map((m) => m.name))).toBe(true);
    for (const m of team) expect(m.bio.length, m.name).toBeGreaterThan(10);
  });

  test("the About copy's 'team of four' is still true", () => {
    expect(team).toHaveLength(4);
  });

  test("every value has an icon and a unique title", () => {
    expect(unique(values.map((v) => v.title))).toBe(true);
    for (const v of values) expect(VALUE_ICONS[v.icon], v.title).toBeTruthy();
  });
});

describe("contact and socials", () => {
  test("contact email is a valid address", () => {
    expect(CONTACT_EMAIL).toMatch(/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/);
  });

  test("the email social link uses the contact email", () => {
    expect(socials.find((s) => s.label === "Email")?.href).toBe(`mailto:${CONTACT_EMAIL}`);
  });

  test("every social link has an icon and a secure URL", () => {
    for (const s of socials) {
      expect(SOCIAL_ICONS[s.label], s.label).toBeTruthy();
      if (!s.href.startsWith("mailto:")) expect(isHttps(s.href), s.href).toBe(true);
    }
  });
});

describe("site config", () => {
  test("site URL is https with no trailing slash (canonicals are built from it)", () => {
    expect(isHttps(SITE_URL)).toBe(true);
    expect(SITE_URL.endsWith("/")).toBe(false);
  });

  test("nav links are root-relative, unique and start with Home", () => {
    expect(navLinks[0]).toEqual({ href: "/", label: "Home" });
    expect(unique(navLinks.map((l) => l.href))).toBe(true);
    for (const l of navLinks) expect(l.href).toMatch(/^\/[a-z]*$/);
  });
});

describe("icons", () => {
  test.each([
    ["service", SERVICE_ICONS],
    ["value", VALUE_ICONS],
    ["social", SOCIAL_ICONS]
  ] as const)("%s icon paths are valid SVG path data", (_, icons) => {
    for (const [name, d] of Object.entries(icons)) {
      expect(d, name).toMatch(/^[Mm][\d\s.,\-a-zA-Z]+$/);
    }
  });
});
