import { pointerEffectsDisabled } from "@/scripts/motion";

/** Pointer position inside `el` as percentages (not clamped; can fall outside 0–100). */
export function pointerPercent(el: Element, e: Pick<PointerEvent, "clientX" | "clientY">) {
  const r = el.getBoundingClientRect();
  return {
    x: ((e.clientX - r.left) / r.width) * 100,
    y: ((e.clientY - r.top) / r.height) * 100
  };
}

/** Radial glow that follows the pointer (service cards). Sets --mx / --my on `wrap`. */
export function initPointerGlow(wrap: HTMLElement): () => void {
  if (pointerEffectsDisabled()) return () => {};

  const onMove = (e: PointerEvent) => {
    const { x, y } = pointerPercent(wrap, e);
    wrap.style.setProperty("--mx", `${x}%`);
    wrap.style.setProperty("--my", `${y}%`);
  };

  wrap.addEventListener("pointermove", onMove);
  return () => wrap.removeEventListener("pointermove", onMove);
}

/** CSS transform for a card tilted `x` degrees around the X axis and `y` around the Y axis. */
export function tiltTransform(x: number, y: number): string {
  return `rotateY(${round(y)}deg) rotateX(${round(x)}deg)`;
}

const round = (n: number) => Math.round(n * 100) / 100 || 0;

/** 3D tilt plus pointer glow (product cards). Glow vars are set on `card`. */
export function initCardTilt(wrap: HTMLElement, card: HTMLElement): () => void {
  if (pointerEffectsDisabled()) return () => {};

  // The card's own transition (300ms, from its Tailwind classes) eases between tilts
  card.style.transitionProperty = "box-shadow, transform";
  const tilt = (x: number, y: number) => {
    card.style.transform = tiltTransform(x, y);
  };

  const onMove = (e: PointerEvent) => {
    const { x, y } = pointerPercent(wrap, e);
    card.style.setProperty("--mx", `${x}%`);
    card.style.setProperty("--my", `${y}%`);
    tilt(-(y / 100 - 0.5) * 16, (x / 100 - 0.5) * 16);
  };
  const onLeave = () => tilt(0, 0);

  wrap.addEventListener("pointermove", onMove);
  wrap.addEventListener("pointerleave", onLeave);
  return () => {
    wrap.removeEventListener("pointermove", onMove);
    wrap.removeEventListener("pointerleave", onLeave);
  };
}
