export const reduceMotion = (): boolean =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const isTouch = (): boolean =>
  typeof window !== "undefined" && window.matchMedia("(hover: none)").matches;

/** Pointer-driven effects are skipped for reduced-motion users and on touch devices. */
export const pointerEffectsDisabled = (): boolean => reduceMotion() || isTouch();
