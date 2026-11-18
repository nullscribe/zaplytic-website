import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { initCardTilt, initPointerGlow, pointerPercent, tiltTransform } from "@/scripts/pointer";
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

describe("tiltTransform", () => {
  test("rotates around Y then X, in degrees", () => {
    expect(tiltTransform(8, -8)).toBe("rotateY(-8deg) rotateX(8deg)");
  });

  test("rounds to 2 decimals and never prints -0", () => {
    expect(tiltTransform(1 / 3, -0)).toBe("rotateY(0deg) rotateX(0.33deg)");
  });
});

describe("initCardTilt", () => {
  beforeEach(() => mockMedia());

  function setup() {
    const wrap = box();
    const card = document.createElement("article");
    wrap.append(card);
    const cleanup = initCardTilt(wrap, card);
    return { wrap, card, cleanup };
  }

  test("lets the card's transition ease the tilt", () => {
    const { card } = setup();
    expect(card.style.transitionProperty).toBe("box-shadow, transform");
  });

  test("tilts toward the pointer (up to 8 degrees) and moves the glow", () => {
    const { wrap, card } = setup();
    // top-left corner: maximum tilt
    move(wrap, 100, 50);
    expect(card.style.transform).toBe("rotateY(-8deg) rotateX(8deg)");
    expect(card.style.getPropertyValue("--mx")).toBe("0%");

    // centre: flat
    move(wrap, 200, 100);
    expect(card.style.transform).toBe("rotateY(0deg) rotateX(0deg)");
    expect(card.style.getPropertyValue("--my")).toBe("50%");

    // bottom-right corner: the opposite tilt
    move(wrap, 300, 150);
    expect(card.style.transform).toBe("rotateY(8deg) rotateX(-8deg)");
  });

  test("resets the tilt when the pointer leaves", () => {
    const { wrap, card } = setup();
    move(wrap, 300, 150);
    wrap.dispatchEvent(new PointerEvent("pointerleave"));
    expect(card.style.transform).toBe("rotateY(0deg) rotateX(0deg)");
  });

  test("cleanup removes both listeners", () => {
    const { wrap, card, cleanup } = setup();
    cleanup();
    move(wrap, 300, 150);
    expect(card.style.transform).toBe("");
  });

  test.each([
    ["reduced motion", REDUCED_MOTION],
    ["touch", TOUCH]
  ])("does nothing with %s", (_, query) => {
    mockMedia([query]);
    const wrap = box();
    const card = document.createElement("article");
    initCardTilt(wrap, card);
    move(wrap, 300, 150);
    expect(card.style.transform).toBe("");
    expect(card.style.transitionProperty).toBe("");
  });
});
