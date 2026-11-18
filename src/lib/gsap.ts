import gsap from "gsap";
import { ScrollTrigger, SplitText, MotionPathPlugin } from "gsap/all";

// Every island imports gsap from here so the plugins are registered exactly once,
// before any island's animation code runs.
gsap.registerPlugin(ScrollTrigger, SplitText, MotionPathPlugin);

// ScrollTrigger only re-measures on load/resize; also re-measure when page height changes
// (fonts, late layout) so triggers further down don't keep stale start positions
if (typeof window !== "undefined" && typeof ResizeObserver !== "undefined") {
  const w = window as Window & { __zapResizeObserver?: boolean };
  if (!w.__zapResizeObserver) {
    w.__zapResizeObserver = true;
    let frame = 0;
    new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => ScrollTrigger.refresh());
    }).observe(document.body);
  }
}

export { gsap, ScrollTrigger, SplitText };
export default gsap;
