/**
 * Scroll reveals: once a `[data-reveal]` element's top crosses a line down the viewport, every
 * `.motion-reveal` it owns (itself, and descendants whose nearest `[data-reveal]` is this one)
 * gets `.is-revealed`, which starts its CSS animation. Plays once, like the GSAP
 * ScrollTrigger reveals it replaces.
 *
 * `data-reveal="80"` means "when the element's top reaches 80% of the viewport height"
 * (GSAP's `start: "top 80%"`). Defaults to 80.
 */
const BOUND = "revealBound";

export function revealLine(el: HTMLElement): number {
  const value = Number(el.dataset.reveal);
  return value > 0 && value <= 100 ? value : 80;
}

/** Marks the trigger and the `.motion-reveal` elements it owns as revealed. */
export function reveal(trigger: Element): void {
  trigger.classList.add("is-revealed");
  trigger.querySelectorAll(".motion-reveal:not([data-reveal])").forEach((el) => {
    // Nested triggers own their own elements and reveal on their own line
    if (el.parentElement?.closest("[data-reveal]") === trigger) el.classList.add("is-revealed");
  });
}

export function initReveal(scope: ParentNode = document): void {
  const targets = [...scope.querySelectorAll<HTMLElement>("[data-reveal]")].filter(
    (el) => !el.dataset[BOUND]
  );
  if (targets.length === 0) return;

  if (typeof IntersectionObserver === "undefined") {
    targets.forEach(reveal);
    return;
  }

  // One observer per reveal line (rootMargin is per observer)
  const observers = new Map<number, IntersectionObserver>();
  for (const el of targets) {
    el.dataset[BOUND] = "true";
    const line = revealLine(el);
    let observer = observers.get(line);
    if (!observer) {
      observer = new IntersectionObserver(
        (entries, self) => {
          for (const entry of entries) {
            const bottom = entry.rootBounds?.bottom ?? window.innerHeight;
            // Reveal when it enters, or if it is already above the line (page loaded scrolled)
            if (entry.isIntersecting || entry.boundingClientRect.top < bottom) {
              reveal(entry.target);
              self.unobserve(entry.target);
            }
          }
        },
        { rootMargin: `0px 0px -${100 - line}% 0px` }
      );
      observers.set(line, observer);
    }
    observer.observe(el);
  }
}
