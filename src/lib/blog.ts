import { getCollection, type CollectionEntry } from "astro:content";
import type { BlogSummary } from "@/lib/blog-types";

export type BlogEntry = CollectionEntry<"blog">;
export type { BlogSummary };

/** Newest first. Posts with the same date keep a stable, alphabetical-by-slug order. */
export function sortPosts<T extends { id: string; data: { date: string } }>(posts: T[]): T[] {
  return [...posts].sort(
    (a, b) =>
      new Date(b.data.date).getTime() - new Date(a.data.date).getTime() || a.id.localeCompare(b.id)
  );
}

export async function getSortedPosts(): Promise<BlogEntry[]> {
  return sortPosts(await getCollection("blog"));
}

export function toSummary(post: Pick<BlogEntry, "data">): BlogSummary {
  const { slug, title, description, date, tags } = post.data;
  return { slug, title, description, date, tags };
}
