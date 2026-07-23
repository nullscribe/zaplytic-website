import { useGSAP } from "@gsap/react";
import BlogCard from "./BlogCard";
import gsap from "gsap";
import { type BlogPost, loadBlogs } from "@/loaders/blog";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

export default function LatestBlogs() {
  // TODO: use react 19's use hook in here
  const [blogs, setBlogs] = useState<BlogPost[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useGSAP(() => {
    if (blogs) {
      gsap.from("#latest-blog-title, .blogcard, #latest-blog-subtitle", {
        opacity: 0,
        yPercent: 100,
        scrollTrigger: {
          trigger: "#latest-blog-title",
          start: "top 80%"
        }
      });
    }
  }, [blogs]);

  const setBlogSlice = async () => {
    try {
      setBlogs(await loadBlogs());
    } catch (error) {
      setError(`Failed to load blogs:${error}`);
    }
  };

  useEffect(() => {
    setBlogSlice();
  }, []);

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (blogs === null) {
    return <div>Loading....</div>;
  }

  return (
    <div className="max-w-7xl px-4 py-10 sm:px-6  lg:py-14 mx-auto">
      <div className="max-w-2xl text-center mx-auto mb-10 lg:mb-14">
        <h2
          className="text-3xl font-bold md:text-4xl md:leading-tight text-fg"
          id="latest-blog-title"
        >
          Read our latest blogs
        </h2>
        <p className="mt-1 text-fg-muted" id="latest-blog-subtitle">
          We've worked tirelessly for the last 2 years, let us share some insight
        </p>
      </div>

      <div className="grid sm:grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6 mb-10 lg:mb-14">
        {blogs.slice(0, 4).map((blog) => (
          <div className="blogcard" key={blog.slug}>
            <BlogCard title={blog.title} slug={blog.slug} tags={blog.tags} />
          </div>
        ))}
      </div>

      <div className="text-center">
        <div className="inline-block border shadow-2xs rounded-full bg-bg-subtle border-border">
          <div className="py-3 px-4 flex items-center gap-x-2">
            <p className="text-fg-muted">Want to read more?</p>
            <Link
              className="inline-flex items-center gap-x-1.5 decoration-2 hover:underline focus:outline-hidden focus:underline font-medium text-blue-500"
              to="/blog"
            >
              Go here
              <svg
                aria-hidden="true"
                className="shrink-0 size-4"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
