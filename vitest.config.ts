/// <reference types="vitest/config" />
import { getViteConfig } from "astro/config";

export default getViteConfig({
  test: {
    coverage: {
      include: ["src/**/*.{ts,astro}"],
      exclude: ["src/test/**", "src/**/*.test.ts", "src/env.d.ts"]
    },
    projects: [
      {
        // Scripts, data and Astro components. Files that render .astro components opt into
        // the node environment with a `// @vitest-environment node` comment.
        extends: true,
        test: {
          name: "unit",
          include: ["src/**/*.test.ts"],
          environment: "happy-dom",
          setupFiles: ["test-setup.ts"]
        }
      },
      {
        // Builds the real site once and checks the generated HTML, sitemap and robots.txt.
        extends: true,
        test: {
          name: "site",
          include: ["tests/site/**/*.test.ts"],
          environment: "node",
          globalSetup: ["tests/site/build.ts"]
        }
      }
    ]
  }
});
