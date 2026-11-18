import { afterEach, describe, expect, test } from "vitest";
import { ScrollTrigger } from "@/lib/gsap";
import {
  animateAbout,
  animateBlogIndex,
  animateHero,
  animateLatestBlogs,
  animateProducts,
  animateServices,
  animateValues
} from "@/scripts/animations";
import { activeAnimations, resetGsap, tweensOf } from "@/test/gsap";

afterEach(resetGsap);

const scrollTriggersFor = (selector: string) => {
  const el = document.querySelector(selector);
  return ScrollTrigger.getAll().filter((t) => t.trigger === el);
};

/** Markup with the ids/classes each section's animation targets. */
const SECTIONS = {
  hero: `
    <h1><span id="hero-title-start">Empowering </span>
      <span id="hero-words"><span>Developers</span><span>Businesses</span><span>Founders</span></span>
      <span id="hero-title-end">with High-Quality Softwares</span></h1>
    <p id="hero-subtitle">An independent product studio.</p>
    <div id="hero-action"><a href="/products">Explore</a></div>`,
  services: `
    <section id="services-section"><h2 id="services-title">What we can do</h2>
      <div class="service-card"></div><div class="service-card"></div></section>`,
  latestBlogs: `
    <h2 id="latest-blog-title">Read our latest blogs</h2><p id="latest-blog-subtitle">x</p>
    <div class="blogcard"></div><div class="blogcard"></div>`,
  values: `<section id="values-section"><h3>What we value</h3><button class="valuecard"></button></section>`,
  about: `
    <p id="about-eyebrow">About</p><h1 id="about-title">We build tools</h1><p id="about-lead">Lead</p>
    <div id="about-story-body"><p>One</p><p>Two</p></div>
    <section id="values-section"><h3>What we value</h3></section>
    <section id="team-section"><h3>Team</h3><div class="hairline"></div><article class="teamcard"></article></section>
    <section id="contact"><p id="contact-eyebrow">x</p><h3 id="contact-title">x</h3><p id="contact-copy">x</p>
      <div id="contact-actions"><a>mail</a><div>socials</div></div></section>`,
  products: `
    <div data-testid="productspage"><h1 class="title">Our Products</h1><p class="subtitle">x</p>
      <section><h3>In-House SaaS</h3><article class="product"></article></section></div>`,
  blogIndex: `<a class="blogCard"></a><a class="blogCard"></a>`
};

const cases = [
  ["animateHero", animateHero, SECTIONS.hero],
  ["animateServices", animateServices, SECTIONS.services],
  ["animateLatestBlogs", animateLatestBlogs, SECTIONS.latestBlogs],
  ["animateValues", animateValues, SECTIONS.values],
  ["animateAbout", animateAbout, SECTIONS.about],
  ["animateProducts", animateProducts, SECTIONS.products],
  ["animateBlogIndex", animateBlogIndex, SECTIONS.blogIndex]
] as const;

describe.each(cases)("%s", (_, animate, markup) => {
  test("is a no-op on pages without its section", () => {
    document.body.innerHTML = "<main><p>Some other page</p></main>";
    const before = activeAnimations();
    expect(() => animate()).not.toThrow();
    expect(activeAnimations()).toBe(before);
  });

  test("animates its section", () => {
    document.body.innerHTML = markup;
    const before = activeAnimations();
    animate();
    expect(activeAnimations()).toBeGreaterThan(before);
  });

  // SplitText wraps words/chars in elements, which moves whitespace around; the words must stay
  test("keeps every word of the text that search engines and screen readers see", () => {
    document.body.innerHTML = markup;
    const words = () => document.body.textContent!.replace(/\s+/g, "");
    const before = words();
    animate();
    expect(words()).toBe(before);
  });
});

describe("section specifics", () => {
  test("hero rotates through all three words on an endless timeline", () => {
    document.body.innerHTML = SECTIONS.hero;
    animateHero();
    const words = document.querySelectorAll("#hero-words span");
    words.forEach((word) => expect(tweensOf(word)).toHaveLength(2)); // in + out
    const timeline = tweensOf(words[0])[0].parent!;
    expect(timeline.repeat()).toBe(-1);
  });

  test("hero splits the title into words", () => {
    document.body.innerHTML = SECTIONS.hero;
    animateHero();
    expect(document.querySelectorAll("#hero-title-end div").length).toBeGreaterThan(1);
  });

  test("services reveal on scroll", () => {
    document.body.innerHTML = SECTIONS.services;
    animateServices();
    expect(scrollTriggersFor("#services-section")).toHaveLength(1);
    expect(scrollTriggersFor("#services-title")).toHaveLength(1);
  });

  test("latest blogs reveal on scroll", () => {
    document.body.innerHTML = SECTIONS.latestBlogs;
    animateLatestBlogs();
    expect(scrollTriggersFor("#latest-blog-title")).toHaveLength(1);
  });

  test("value cards reveal on scroll and clear their inline styles afterwards", () => {
    document.body.innerHTML = SECTIONS.values;
    animateValues();
    expect(scrollTriggersFor("#values-section")).toHaveLength(1);
    const tween = tweensOf(document.querySelector(".valuecard")!)[0];
    expect(tween.vars.clearProps).toBe("all");
  });

  test("about splits the title into characters and wires every scroll section", () => {
    document.body.innerHTML = SECTIONS.about;
    animateAbout();
    expect(document.querySelectorAll("#about-title div").length).toBeGreaterThan(5);
    for (const trigger of ["#about-story-body", "#team-section", "#values-section", "#contact"]) {
      expect(scrollTriggersFor(trigger).length, trigger).toBeGreaterThan(0);
    }
  });
});
