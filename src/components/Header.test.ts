// @vitest-environment node
import { describe, expect, test } from "vitest";
import Header from "@/components/Header.astro";
import { navLinks } from "@/lib/site";
import { render, text } from "@/test/render";

async function renderAt(path: string) {
  const doc = await render(Header, { path });
  const link = (label: string) =>
    [...doc.querySelectorAll<HTMLAnchorElement>("#nav-links a")].find((a) => text(a) === label);
  return { doc, link };
}

describe("Header", () => {
  test("is a labelled landmark with the logo linking home", async () => {
    const { doc } = await renderAt("/");
    expect(doc.querySelector("header nav[aria-label=Main]")).not.toBeNull();
    const logo = doc.querySelector('a[aria-label="Zaplytic"]')!;
    expect(logo.getAttribute("href")).toBe("/");
    const img = logo.querySelector("img")!;
    expect(img.getAttribute("alt")).toBe("Zaplytic logo");
    // explicit dimensions prevent layout shift
    expect(img.getAttribute("width")).toBe("24");
    expect(img.getAttribute("height")).toBe("24");
  });

  test("renders every nav link in order, as plain crawlable links", async () => {
    const { doc } = await renderAt("/");
    const links = [...doc.querySelectorAll("#nav-links a")].map((a) => [
      a.getAttribute("href"),
      text(a)
    ]);
    expect(links).toEqual(navLinks.map((l) => [l.href, l.label]));
  });

  test.each([
    ["/", "Home"],
    ["/index.html", "Home"],
    ["/products", "Products"],
    ["/products.html", "Products"],
    ["/about", "About"],
    ["/blog", "Blog"],
    ["/blog/some-post", "Blog"],
    ["/blog/some-post.html", "Blog"]
  ])("on %s only %s is active", async (path, label) => {
    const { doc, link } = await renderAt(path);
    expect(doc.querySelectorAll("#nav-links .activeNav")).toHaveLength(1);
    expect(doc.querySelectorAll("#nav-links [aria-current]")).toHaveLength(1);
    expect(link(label)!.classList.contains("activeNav")).toBe(true);
    expect(link(label)!.getAttribute("aria-current")).toBe("page");
  });

  test("no link is active on an unknown page", async () => {
    const { doc } = await renderAt("/does-not-exist");
    expect(doc.querySelectorAll("#nav-links .activeNav")).toHaveLength(0);
    expect(doc.querySelectorAll("#nav-links .inActiveNav")).toHaveLength(navLinks.length);
  });

  test("has a 'Get in touch' call to action pointing at the contact section", async () => {
    const { doc } = await renderAt("/");
    const cta = [...doc.querySelectorAll("a")].find((a) => text(a) === "Get in touch")!;
    expect(cta.getAttribute("href")).toBe("/about#contact");
  });

  test("mobile toggle starts closed and controls the menu", async () => {
    const { doc } = await renderAt("/");
    const toggle = doc.getElementById("nav-toggle")!;
    expect(toggle.getAttribute("type")).toBe("button");
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    expect(toggle.getAttribute("aria-label")).toBe("Toggle navigation");
    expect(toggle.getAttribute("aria-controls")).toBe("nav-menu");
    expect(doc.getElementById("nav-menu")!.classList.contains("hidden")).toBe(true);
    expect(toggle.querySelector("[data-icon=open]")!.classList.contains("hidden")).toBe(false);
    expect(toggle.querySelector("[data-icon=close]")!.classList.contains("hidden")).toBe(true);
  });

  test("includes the underline element the nav script positions", async () => {
    const { doc } = await renderAt("/");
    expect(doc.querySelector("#nav-links #nav-underline")).not.toBeNull();
  });
});
