import gsap from "@/lib/gsap";
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

/** 3D tilt plus pointer glow (product cards). Glow vars are set on `card`. */
export function initCardTilt(wrap: HTMLElement, card: HTMLElement): () => void {
  if (pointerEffectsDisabled()) return () => {};

  const rotX = gsap.quickTo(card, "rotationX", { duration: 0.3, ease: "power2.out" });
  const rotY = gsap.quickTo(card, "rotationY", { duration: 0.3, ease: "power2.out" });

  const onMove = (e: PointerEvent) => {
    const { x, y } = pointerPercent(wrap, e);
    card.style.setProperty("--mx", `${x}%`);
    card.style.setProperty("--my", `${y}%`);
    rotY((x / 100 - 0.5) * 16);
    rotX(-(y / 100 - 0.5) * 16);
  };
  const onLeave = () => {
    rotX(0);
    rotY(0);
  };

  wrap.addEventListener("pointermove", onMove);
  wrap.addEventListener("pointerleave", onLeave);
  return () => {
    wrap.removeEventListener("pointermove", onMove);
    wrap.removeEventListener("pointerleave", onLeave);
  };
}
