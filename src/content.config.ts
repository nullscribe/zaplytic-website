import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { blogSchema } from "@/lib/blog-schema";

const blog = defineCollection({
  loader: glob({
    pattern: "**/*.md",
    base: "./blogs",
    generateId: ({ data, entry }) => (typeof data.slug === "string" ? data.slug : entry)
  }),
  schema: blogSchema
});

export const collections = { blog };
