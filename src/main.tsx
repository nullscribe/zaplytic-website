import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import gsap from "gsap";
import { ScrollTrigger, SplitText, MotionPathPlugin } from "gsap/all";
import { RouterProvider } from "react-router-dom";
import router from "./Router.tsx";
import "./index.css";

gsap.registerPlugin(ScrollTrigger, SplitText, MotionPathPlugin);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
