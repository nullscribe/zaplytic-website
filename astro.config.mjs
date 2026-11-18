// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { satteri } from "@astrojs/markdown-satteri";
import { SITE_URL } from "./src/lib/site.ts";

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  site: SITE_URL,
  trailingSlash: "never",
  build: {
    // /about.html instead of /about/index.html so URLs match the canonical (no trailing slash)
    format: "file"
  },
  integrations: [sitemap()],
  markdown: {
    // Plain <pre><code> blocks, styled by the typography plugin (matches the original design)
    syntaxHighlight: false,
    // Keep quotes and apostrophes exactly as written (the original renderer did not curl them)
    processor: satteri({ features: { smartPunctuation: false } })
  },
  vite: {
    plugins: [tailwindcss()]
  }
});
