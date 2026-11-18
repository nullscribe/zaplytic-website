import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { blogSchema } from "@/lib/blog-schema";

const valid = {
  slug: "my-post",
  title: "A post",
  description: "What it is about.",
  date: "2026-01-14",
  tags: ["rails"],
  author: "Jahid Hasan"
};

const issuesFor = (data: unknown) => {
  const result = blogSchema.safeParse(data);
  return result.success ? [] : result.error.issues.map((i) => i.path.join("."));
};

describe("blogSchema", () => {
  test("accepts valid frontmatter and defaults featured to false", () => {
    expect(blogSchema.parse(valid)).toEqual({ ...valid, featured: false });
  });

  test("keeps an explicit featured flag", () => {
    expect(blogSchema.parse({ ...valid, featured: true }).featured).toBe(true);
  });

  test.each([
    ["uppercase", "My-Post"],
    ["spaces", "my post"],
    ["underscores", "my_post"],
    ["slashes", "blog/my-post"],
    ["empty", ""]
  ])("rejects a slug with %s", (_, slug) => {
    expect(issuesFor({ ...valid, slug })).toEqual(["slug"]);
  });

  test.each([
    ["not ISO", "14/01/2026"],
    ["with time", "2026-01-14T10:00:00Z"],
    ["impossible", "2026-02-30"]
  ])("rejects a date that is %s", (_, date) => {
    expect(issuesFor({ ...valid, date })).toEqual(["date"]);
  });

  test("rejects posts without tags", () => {
    expect(issuesFor({ ...valid, tags: [] })).toEqual(["tags"]);
  });

  test("enforces title and description lengths", () => {
    expect(issuesFor({ ...valid, title: "" })).toEqual(["title"]);
    expect(issuesFor({ ...valid, title: "x".repeat(201) })).toEqual(["title"]);
    expect(issuesFor({ ...valid, description: "" })).toEqual(["description"]);
    expect(issuesFor({ ...valid, description: "x".repeat(501) })).toEqual(["description"]);
  });

  test.each(["slug", "title", "description", "date", "tags", "author"])("requires %s", (field) => {
    const data: Record<string, unknown> = { ...valid };
    delete data[field];
    expect(issuesFor(data)).toEqual([field]);
  });
});

describe("posts in blogs/", () => {
  const dir = join(process.cwd(), "blogs");
  const files = readdirSync(dir).filter((f) => f.endsWith(".md"));

  /** Tiny frontmatter reader: enough for the flat key/value + [a, b] list format the posts use. */
  function frontmatter(source: string): Record<string, unknown> {
    const block = source.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? "";
    return Object.fromEntries(
      block.split("\n").map((line) => {
        const [, key, raw] = line.match(/^(\w+):\s*(.*)$/)!;
        const value = raw.trim();
        if (value.startsWith("["))
          return [
            key,
            value
              .slice(1, -1)
              .split(",")
              .map((t) => t.trim())
          ];
        if (value === "true" || value === "false") return [key, value === "true"];
        return [key, value.replace(/^"(.*)"$/, "$1")];
      })
    );
  }

  const posts = files.map((file) => ({
    file,
    data: frontmatter(readFileSync(join(dir, file), "utf8"))
  }));

  test("there are posts", () => {
    expect(posts.length).toBeGreaterThan(0);
  });

  test.each(posts.map((p) => [p.file, p.data] as const))("%s has valid frontmatter", (_, data) => {
    expect(issuesFor(data)).toEqual([]);
  });

  test("slugs are unique (they become URLs)", () => {
    const slugs = posts.map((p) => p.data.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  test("descriptions fit in a search result snippet", () => {
    for (const { file, data } of posts) {
      expect((data.description as string).length, file).toBeLessThanOrEqual(300);
    }
  });
});
