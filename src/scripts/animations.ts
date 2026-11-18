/**
 * Entrance and scroll animations for each page section. Each function animates
 * elements already in the server-rendered HTML; a missing element is a no-op.
 */
import gsap, { SplitText } from "@/lib/gsap";

const exists = (selector: string) => document.querySelector(selector) !== null;

export function animateHero(): void {
  if (!exists("#hero-title-start")) return;

  const titleSplit = SplitText.create("#hero-title-start, #hero-title-end", { type: "words" });
  const subtitleSplit = SplitText.create("#hero-subtitle", { type: "lines" });

  gsap.from(titleSplit.words, {
    x: "random([-1000, 1000])",
    y: "random([-1000, 1000])",
    opacity: 0,
    ease: "power3.inOut",
    duration: 0.7
  });

  gsap.from(subtitleSplit.lines, {
    yPercent: 100,
    opacity: 0,
    stagger: 0.05,
    ease: "expo.inOut",
    duration: 1
  });

  const wordsTimeline = gsap.timeline({ repeat: -1, delay: 0.3 });
  const words: HTMLSpanElement[] = gsap.utils.toArray("#hero-words span");
  words.forEach((word) => {
    wordsTimeline
      .from(word, { y: 80, opacity: 0, duration: 0.5, ease: "power4.inOut" })
      .to(word, { y: -80, opacity: 0, duration: 0.5, ease: "power4.inOut" }, "+=1.5");
  });

  gsap.from("#hero-action", { opacity: 0, yPercent: 100, duration: 1, ease: "power4.inOut" });
}

export function animateServices(): void {
  if (!exists("#services-section")) return;

  gsap.from(".service-card", {
    opacity: 0,
    y: 24,
    duration: 0.5,
    ease: "power2.out",
    stagger: 0.1,
    scrollTrigger: { trigger: "#services-section", start: "top 80%" }
  });

  gsap.from("#services-title", {
    opacity: 0,
    yPercent: 100,
    duration: 0.6,
    ease: "power3.out",
    scrollTrigger: { trigger: "#services-title", start: "top 85%" }
  });
}

export function animateLatestBlogs(): void {
  if (!exists("#latest-blog-title")) return;

  gsap.from("#latest-blog-title, .blogcard, #latest-blog-subtitle", {
    opacity: 0,
    yPercent: 100,
    scrollTrigger: { trigger: "#latest-blog-title", start: "top 80%" }
  });
}

export function animateValues(): void {
  if (!exists(".valuecard")) return;

  gsap.from(".valuecard", {
    opacity: 0,
    clipPath: "inset(0 0 100% 0)",
    duration: 0.6,
    stagger: 0.1,
    ease: "power3.out",
    scrollTrigger: { trigger: "#values-section", start: "top 80%" },
    clearProps: "all"
  });
}

export function animateAbout(): void {
  if (!exists("#about-title")) return;

  const titleSplit = SplitText.create("#about-title", { type: "chars,words" });
  gsap.from(titleSplit.chars, {
    yPercent: 120,
    opacity: 0,
    rotate: 4,
    duration: 0.6,
    ease: "power3.out",
    stagger: { each: 0.02, from: "start" }
  });

  gsap.from("#about-eyebrow", { opacity: 0, y: 12, duration: 0.5, delay: 0.1 });
  gsap.from("#about-lead", { opacity: 0, y: 24, duration: 0.6, delay: 0.2 });

  gsap.from("#about-story-body p", {
    opacity: 0,
    y: 24,
    duration: 0.5,
    stagger: 0.15,
    scrollTrigger: { trigger: "#about-story-body", start: "top 80%" }
  });

  gsap.from("#team-section h3", {
    opacity: 0,
    x: -20,
    duration: 0.5,
    scrollTrigger: { trigger: "#team-section", start: "top 85%" }
  });

  gsap.from(".teamcard", {
    opacity: 0,
    y: 32,
    duration: 0.4,
    stagger: 0.1,
    ease: "power2.out",
    scrollTrigger: { trigger: "#team-section", start: "top 75%" }
  });

  gsap.from("#team-section .hairline", {
    scaleX: 0,
    transformOrigin: "left",
    duration: 0.5,
    stagger: 0.08,
    scrollTrigger: { trigger: "#team-section", start: "top 75%" }
  });

  gsap.from("#values-section h3", {
    opacity: 0,
    x: -20,
    duration: 0.5,
    scrollTrigger: { trigger: "#values-section", start: "top 85%" }
  });

  gsap.from("#contact-eyebrow, #contact-title, #contact-copy", {
    opacity: 0,
    x: -32,
    duration: 0.5,
    stagger: 0.1,
    scrollTrigger: { trigger: "#contact", start: "top 80%" }
  });

  gsap.from("#contact-actions > *", {
    opacity: 0,
    x: 32,
    duration: 0.5,
    stagger: 0.1,
    scrollTrigger: { trigger: "#contact", start: "top 80%" }
  });
}

export function animateProducts(): void {
  if (!exists("[data-testid=productspage]")) return;

  gsap.from(".product", { scale: 0.6, opacity: 0, duration: 0.25, stagger: 0.05 });
  gsap.from(".title,.subtitle", { yPercent: 100, opacity: 0, duration: 0.3 });
  gsap.from("section h3", { opacity: 0, x: -16, duration: 0.3, stagger: 0.1, delay: 0.1 });
}

export function animateBlogIndex(): void {
  if (!exists(".blogCard")) return;

  gsap.from(".blogCard", { opacity: 0, yPercent: -100, duration: 0.2, stagger: 0.05, delay: 0.2 });
}
