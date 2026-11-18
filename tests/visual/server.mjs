// Minimal static server for a built site, matching how the host serves it:
// "/about" -> about.html, "/" -> index.html, unknown paths -> 404.html with status 404.
// Usage: node tests/visual/server.mjs <siteDir> <port> [--spa]
// --spa serves index.html for unknown paths (for comparing against a single-page-app build).
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, resolve } from "node:path";

const root = resolve(process.argv[2] ?? "dist");
const port = Number(process.argv[3] ?? 4322);
const spa = process.argv.includes("--spa");

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".xml": "application/xml",
  ".txt": "text/plain; charset=utf-8",
  ".json": "application/json",
  ".png": "image/png",
  ".woff2": "font/woff2"
};

const isFile = (path) =>
  stat(path).then(
    (s) => s.isFile(),
    () => false
  );

async function resolveFile(pathname) {
  const clean = normalize(decodeURIComponent(pathname)).replace(/^(\.\.[/\\])+/, "");
  const base = join(root, clean);
  if (!base.startsWith(root)) return null;
  for (const candidate of [base, `${base.replace(/\/$/, "")}.html`, join(base, "index.html")]) {
    if (await isFile(candidate)) return candidate;
  }
  return null;
}

createServer(async (req, res) => {
  const { pathname } = new URL(req.url ?? "/", "http://localhost");
  const file = await resolveFile(pathname);
  const fallback = spa ? "index.html" : "404.html";
  const target = file ?? join(root, fallback);
  res.writeHead(file || spa ? 200 : 404, {
    "Content-Type": TYPES[extname(target)] ?? "application/octet-stream"
  });
  res.end(await readFile(target));
}).listen(port, () => console.log(`serving ${root} on http://localhost:${port}`));
