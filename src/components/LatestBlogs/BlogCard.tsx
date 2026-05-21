import type { BlogPost } from "@/loaders/blog";
import { Link } from "react-router-dom";

type BlogCardProps = Pick<BlogPost, "slug" | "title" | "tags">;

export default function BlogCard({ title, tags, slug }: BlogCardProps) {
  return (
    <Link
      className="group flex flex-col border shadow-2xs rounded-xl hover:shadow-md focus:outline-hidden focus:shadow-md transition bg-neutral-900 border-neutral-800 h-full"
      to={`/blog/${slug}`}
    >
      <div className="p-4 md:p-5 flex flex-col grow justify-between">
        <div>
          <h3 className="text-xl font-semibold text-neutral-300 group-hover:text-white">{title}</h3>
        </div>
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center py-0.5 px-2 rounded-full text-xs font-medium text-gray-800 bg-neutral-800 dark:text-neutral-300"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
