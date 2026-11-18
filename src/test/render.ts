import { experimental_AstroContainer as AstroContainer } from "astro/container";
import type { AstroComponentFactory } from "astro/runtime/server/index.js";
import { parseHtml } from "@/test/dom";

let container: Promise<AstroContainer> | undefined;

interface RenderOptions {
  props?: Record<string, unknown>;
  slots?: Record<string, string>;
  /** Request path, sets Astro.url. */
  path?: string;
}

/** Renders an Astro component to an HTML string. */
export async function renderToString(
  component: AstroComponentFactory,
  { props, slots, path = "/" }: RenderOptions = {}
): Promise<string> {
  container ??= AstroContainer.create();
  return (await container).renderToString(component, {
    props,
    slots,
    request: new Request(`https://zaplytic.dev${path}`)
  });
}

/** Renders an Astro component and parses it. Fragments are wrapped in a <body>. */
export async function render(
  component: AstroComponentFactory,
  options?: RenderOptions
): Promise<Document> {
  const html = await renderToString(component, options);
  return parseHtml(/^\s*<!doctype|^\s*<html/i.test(html) ? html : `<body>${html}</body>`);
}

/** Collapsed, trimmed text content. */
export const text = (el: Element | null | undefined): string =>
  (el?.textContent ?? "").replace(/\s+/g, " ").trim();
