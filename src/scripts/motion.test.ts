import { afterEach, describe, expect, test, vi } from "vitest";
import { isTouch, pointerEffectsDisabled, reduceMotion } from "@/scripts/motion";
import { REDUCED_MOTION, TOUCH, mockMedia } from "@/test/media";

afterEach(() => vi.unstubAllGlobals());

describe("motion preferences", () => {
  test("default desktop: motion allowed, pointer effects on", () => {
    mockMedia();
    expect(reduceMotion()).toBe(false);
    expect(isTouch()).toBe(false);
    expect(pointerEffectsDisabled()).toBe(false);
  });

  test("reduced motion disables pointer effects", () => {
    mockMedia([REDUCED_MOTION]);
    expect(reduceMotion()).toBe(true);
    expect(pointerEffectsDisabled()).toBe(true);
  });

  test("touch devices disable pointer effects", () => {
    mockMedia([TOUCH]);
    expect(isTouch()).toBe(true);
    expect(reduceMotion()).toBe(false);
    expect(pointerEffectsDisabled()).toBe(true);
  });
});
