import { afterEach, describe, expect, test, vi } from "vitest";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
  delete (window as Window & { __zapResizeObserver?: boolean }).__zapResizeObserver;
});

function stubResizeObserver() {
  const instances: { observed: Element[]; callback: ResizeObserverCallback }[] = [];
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observed: Element[] = [];
      constructor(public callback: ResizeObserverCallback) {
        instances.push(this);
      }
      observe(el: Element) {
        this.observed.push(el);
      }
      disconnect() {}
    }
  );
  return instances;
}

describe("lib/gsap", () => {
  test("registers the plugins the site uses", async () => {
    const { default: gsap, ScrollTrigger, SplitText } = await import("@/lib/gsap");
    const registered = Object.values(gsap.plugins ?? {});
    expect(ScrollTrigger).toBeDefined();
    expect(SplitText).toBeDefined();
    // registered plugins are usable through gsap's config
    expect(() => gsap.to({}, { scrollTrigger: { trigger: document.body } }).kill()).not.toThrow();
    expect(registered.length).toBeGreaterThan(0);
  });

  test("refreshes ScrollTrigger when the page height changes", async () => {
    const instances = stubResizeObserver();
    const { ScrollTrigger } = await import("@/lib/gsap");
    // capture the frame callback instead of running it, so gsap's own ticker is untouched
    const frames: FrameRequestCallback[] = [];
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => frames.push(cb));
    vi.stubGlobal("cancelAnimationFrame", () => {});
    const refresh = vi.spyOn(ScrollTrigger, "refresh").mockImplementation(() => {});

    expect(instances).toHaveLength(1);
    expect(instances[0].observed).toEqual([document.body]);

    instances[0].callback([], {} as ResizeObserver);
    expect(refresh).not.toHaveBeenCalled(); // debounced to the next frame
    frames.forEach((frame) => frame(0));
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  test("installs the observer only once even if the module is evaluated again", async () => {
    const instances = stubResizeObserver();
    await import("@/lib/gsap");
    vi.resetModules();
    await import("@/lib/gsap");
    expect(instances).toHaveLength(1);
  });

  test("works where ResizeObserver is unavailable", async () => {
    vi.stubGlobal("ResizeObserver", undefined);
    await expect(import("@/lib/gsap")).resolves.toBeDefined();
  });
});
