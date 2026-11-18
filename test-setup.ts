import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";

afterEach(() => {
  // Astro component tests run in the node environment, where there is no document
  if (typeof document === "undefined") return;
  document.body.innerHTML = "";
  document.documentElement.className = "";
});
