/** Blog post summary passed to React islands (no rendered HTML, keeps hydration props small). */
export interface BlogSummary {
  slug: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
}
