import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import gsap from "@/lib/gsap";
import { initCardTilt, initPointerGlow, pointerPercent } from "@/scripts/pointer";
import { REDUCED_MOTION, TOUCH, mockMedia } from "@/test/media";

function box(left = 100, top = 50, width = 200, height = 100) {
  const el = document.createElement("div");
  el.getBoundingClientRect = () =>
    ({ left, top, width, height, right: left + width, bottom: top + height }) as DOMRect;
  document.body.append(el);
  return el;
}

const move = (el: Element, clientX: number, clientY: number) =>
  el.dispatchEvent(new PointerEvent("pointermove", { clientX, clientY }));

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("pointerPercent", () => {
  test("maps the pointer to percentages of the element box", () => {
    const el = box();
    expect(pointerPercent(el, { clientX: 100, clientY: 50 })).toEqual({ x: 0, y: 0 });
    expect(pointerPercent(el, { clientX: 200, clientY: 100 })).toEqual({ x: 50, y: 50 });
    expect(pointerPercent(el, { clientX: 300, clientY: 150 })).toEqual({ x: 100, y: 100 });
  });

  test("is not clamped outside the box", () => {
    expect(pointerPercent(box(), { clientX: 0, clientY: 0 })).toEqual({ x: -50, y: -50 });
  });
});

describe("initPointerGlow", () => {
  beforeEach(() => mockMedia());

  test("tracks the pointer in --mx / --my", () => {
    const wrap = box();
    initPointerGlow(wrap);
    move(wrap, 150, 75);
    expect(wrap.style.getPropertyValue("--mx")).toBe("25%");
    expect(wrap.style.getPropertyValue("--my")).toBe("25%");
  });

  test("cleanup removes the listener", () => {
    const wrap = box();
    initPointerGlow(wrap)();
    move(wrap, 150, 75);
    expect(wrap.style.getPropertyValue("--mx")).toBe("");
  });

  test.each([
    ["reduced motion", REDUCED_MOTION],
    ["touch", TOUCH]
  ])("does nothing with %s", (_, query) => {
    mockMedia([query]);
    const wrap = box();
    initPointerGlow(wrap);
    move(wrap, 150, 75);
    expect(wrap.style.getPropertyValue("--mx")).toBe("");
  });
});

describe("initCardTilt", () => {
  beforeEach(() => mockMedia());

  function setup() {
    const rotations: Record<string, number[]> = { rotationX: [], rotationY: [] };
    vi.spyOn(gsap, "quickTo").mockImplementation(((_: unknown, prop: string) => {
      const fn = (value: number) => {
        rotations[prop].push(value);
        return {} as gsap.core.Tween;
      };
      return fn;
    }) as unknown as typeof gsap.quickTo);
    const wrap = box();
    const card = document.createElement("article");
    wrap.append(card);
    const cleanup = initCardTilt(wrap, card);
    return { wrap, card, rotations, cleanup };
  }

  test("tilts toward the pointer and moves the glow", () => {
    const { wrap, card, rotations } = setup();
    // top-left corner: max tilt
    move(wrap, 100, 50);
    expect(rotations.rotationY.at(-1)).toBe(-8);
    expect(rotations.rotationX.at(-1)).toBe(8);
    expect(card.style.getPropertyValue("--mx")).toBe("0%");

    // centre: flat
    move(wrap, 200, 100);
    expect(rotations.rotationY.at(-1)).toBe(0);
    expect(rotations.rotationX.at(-1)).toBe(-0);
    expect(card.style.getPropertyValue("--my")).toBe("50%");
  });

  test("resets the tilt when the pointer leaves", () => {
    const { wrap, rotations } = setup();
    move(wrap, 300, 150);
    wrap.dispatchEvent(new PointerEvent("pointerleave"));
    expect(rotations.rotationX.at(-1)).toBe(0);
    expect(rotations.rotationY.at(-1)).toBe(0);
  });

  test("cleanup removes both listeners", () => {
    const { wrap, rotations, cleanup } = setup();
    cleanup();
    move(wrap, 300, 150);
    wrap.dispatchEvent(new PointerEvent("pointerleave"));
    expect(rotations.rotationX).toHaveLength(0);
  });

  test("is disabled for reduced motion without creating tweens", () => {
    mockMedia([REDUCED_MOTION]);
    const quickTo = vi.spyOn(gsap, "quickTo");
    const wrap = box();
    initCardTilt(wrap, document.createElement("article"));
    expect(quickTo).not.toHaveBeenCalled();
  });
});
