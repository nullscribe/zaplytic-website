import { beforeEach, describe, expect, test, vi } from "vitest";

const getCollection = vi.fn();
vi.mock("astro:content", () => ({ getCollection }));

const { getSortedPosts, sortPosts, toSummary } = await import("@/lib/blog");

const post = (id: string, date: string, extra: Record<string, unknown> = {}) => ({
  id,
  data: {
    slug: id,
    title: `Title ${id}`,
    description: `About ${id}`,
    date,
    tags: ["a", "b"],
    author: "Jahid Hasan",
    featured: false,
    ...extra
  }
});

beforeEach(() => getCollection.mockReset());

describe("sortPosts", () => {
  test("orders newest first", () => {
    const sorted = sortPosts([
      post("old", "2025-01-01"),
      post("new", "2026-03-01"),
      post("mid", "2025-06-15")
    ]);
    expect(sorted.map((p) => p.id)).toEqual(["new", "mid", "old"]);
  });

  test("breaks same-day ties by slug so the order is stable between builds", () => {
    const sorted = sortPosts([
      post("b", "2026-01-01"),
      post("a", "2026-01-01"),
      post("c", "2026-01-01")
    ]);
    expect(sorted.map((p) => p.id)).toEqual(["a", "b", "c"]);
  });

  test("does not mutate its input", () => {
    const input = [post("old", "2025-01-01"), post("new", "2026-01-01")];
    sortPosts(input);
    expect(input.map((p) => p.id)).toEqual(["old", "new"]);
  });

  test("handles an empty list", () => {
    expect(sortPosts([])).toEqual([]);
  });
});

describe("getSortedPosts", () => {
  test("reads the blog collection and sorts it", async () => {
    getCollection.mockResolvedValue([post("old", "2025-01-01"), post("new", "2026-01-01")]);
    const posts = await getSortedPosts();
    expect(getCollection).toHaveBeenCalledWith("blog");
    expect(posts.map((p) => p.id)).toEqual(["new", "old"]);
  });
});

describe("toSummary", () => {
  test("keeps only what the cards need (no author, featured or body)", () => {
    const summary = toSummary(post("x", "2026-01-01", { body: "<p>long</p>" }) as never);
    expect(summary).toEqual({
      slug: "x",
      title: "Title x",
      description: "About x",
      date: "2026-01-01",
      tags: ["a", "b"]
    });
  });
});
