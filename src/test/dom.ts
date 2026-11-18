import { Window } from "happy-dom";

/** Parse HTML into a Document in node-environment tests (Astro components render under node). */
export function parseHtml(html: string): Document {
  const window = new Window();
  return new window.DOMParser().parseFromString(html, "text/html") as unknown as Document;
}
