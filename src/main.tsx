import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import gsap from "gsap";
import { ScrollTrigger, SplitText, MotionPathPlugin } from "gsap/all";
import { RouterProvider } from "react-router-dom";
import router from "./Router.tsx";
import "./index.css";

gsap.registerPlugin(ScrollTrigger, SplitText, MotionPathPlugin);

// ScrollTrigger only re-measures on load/resize; also re-measure when page height changes
// (async content, fonts) so triggers further down don't keep stale start positions
if (typeof ResizeObserver !== "undefined") {
  let frame = 0;
  new ResizeObserver(() => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => ScrollTrigger.refresh());
  }).observe(document.body);
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
