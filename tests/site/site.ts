import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { gzipSync } from "node:zlib";
import { inject } from "vitest";
import { parseHtml } from "@/test/dom";

export const SITE = "https://zaplytic.dev";
export const siteDir = (): string => inject("siteDir");

export function read(path: string): string {
  return readFileSync(join(siteDir(), path), "utf8");
}

/** All built HTML files, relative to the output dir (e.g. "about.html", "blog/foo.html"). */
export function htmlFiles(): string[] {
  const walk = (dir: string): string[] =>
    readdirSync(dir).flatMap((name) => {
      const full = join(dir, name);
      if (statSync(full).isDirectory()) return name === "_astro" ? [] : walk(full);
      return name.endsWith(".html") ? [relative(siteDir(), full)] : [];
    });
  return walk(siteDir()).sort();
}

/** The public URL a built file is served at (build.format "file" + trailingSlash "never"). */
export function urlFor(file: string): string {
  const path = file.replace(/(^|\/)index\.html$/, "").replace(/\.html$/, "");
  return path ? `${SITE}/${path}` : `${SITE}/`;
}

/** The built file that serves a root-relative path, or undefined. */
export function fileFor(pathname: string): string | undefined {
  const clean = pathname.replace(/\/$/, "") || "/";
  const candidates =
    clean === "/"
      ? ["index.html"]
      : [`${clean.slice(1)}.html`, `${clean.slice(1)}/index.html`, clean.slice(1)];
  return candidates.find(
    (c) => existsSync(join(siteDir(), c)) && statSync(join(siteDir(), c)).isFile()
  );
}

const cache = new Map<string, Document>();
export function page(file: string): Document {
  if (!cache.has(file)) cache.set(file, parseHtml(read(file)));
  return cache.get(file)!;
}

export function sitemapUrls(): string[] {
  const index = read("sitemap-index.xml");
  const maps = [...index.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) =>
    new URL(m[1]).pathname.slice(1)
  );
  return maps.flatMap((m) => [...read(m).matchAll(/<loc>([^<]+)<\/loc>/g)].map((x) => x[1])).sort();
}

export function jsonLd(doc: Document): { "@type": string; [key: string]: unknown }[] {
  return [...doc.querySelectorAll('script[type="application/ld+json"]')].flatMap((s) => {
    const data = JSON.parse(s.textContent!);
    return data["@graph"] ?? [data];
  });
}

export const meta = (doc: Document, key: string): string | null =>
  doc.querySelector(`meta[name="${key}"], meta[property="${key}"]`)?.getAttribute("content") ??
  null;

/** Gzipped size of all JS a page loads, following static imports between chunks. */
export function pageJsBytes(file: string): number {
  const html = read(file);
  const seen = new Set<string>();
  const queue = [...html.matchAll(/["'](\/_astro\/[\w.-]+\.js)["']/g)].map((m) => m[1]);
  const inline = [...html.matchAll(/<script type="module"[^>]*>([\s\S]*?)<\/script>/g)]
    .map((m) => m[1])
    .join("\n");
  while (queue.length) {
    const f = queue.pop()!;
    if (seen.has(f)) continue;
    seen.add(f);
    const src = read(f.slice(1));
    for (const m of src.matchAll(/(?:from|import)\s*\(?["']\.\/([\w.-]+\.js)["']/g))
      queue.push(`/_astro/${m[1]}`);
  }
  let total = gzipSync(inline).length;
  for (const f of seen) total += gzipSync(read(f.slice(1))).length;
  return total;
}
