import { execFileSync } from "node:child_process";
import { rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type { TestProject } from "vitest/node";

const root = fileURLToPath(new URL("../..", import.meta.url));
export const SITE_OUT_DIR = fileURLToPath(
  new URL("../../node_modules/.site-test/", import.meta.url)
);

declare module "vitest" {
  export interface ProvidedContext {
    siteDir: string;
  }
}

/** Builds the site once into a scratch directory for the "site" test project. */
export default function setup(project: TestProject) {
  rmSync(SITE_OUT_DIR, { recursive: true, force: true });
  execFileSync(
    fileURLToPath(new URL("../../node_modules/.bin/astro", import.meta.url)),
    ["build", "--outDir", SITE_OUT_DIR, "--silent"],
    { cwd: root, stdio: ["ignore", "ignore", "inherit"] }
  );
  project.provide("siteDir", SITE_OUT_DIR);
}
