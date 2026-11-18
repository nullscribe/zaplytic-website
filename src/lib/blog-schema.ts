import { z } from "astro/zod";

/** Frontmatter every Markdown file in blogs/ must have. Validated at build time. */
export const blogSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens only"),
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(500),
  date: z.iso.date("Date must be ISO(YYYY-MM-DD) format"),
  tags: z.array(z.string()).min(1, "At least one tag required"),
  author: z.string().min(1),
  featured: z.boolean().default(false)
});

export type BlogFrontmatter = z.infer<typeof blogSchema>;
