import type { BlogPost } from "@/loaders/blog";
import { useLoaderData, Link } from "react-router-dom";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

export default function BlogIndex() {
  const posts = useLoaderData<BlogPost[]>();

  useGSAP(() => {
    gsap.from(".blogCard", {
      opacity: 0,
      yPercent: -100,
      duration: 0.2,
      stagger: 0.05,
      delay: 0.2
    });
  }, []);
  return (
    <main data-testid="blogindex" className="container mx-auto px-4 py-12 md:py-24">
      <div className="flex flex-col gap-8 max-w-2xl mx-auto">
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-fg-muted text-lg">No blog posts yet. Check back soon!</p>
          </div>
        ) : (
          posts.map((post) => (
            <Link
              to={`/blog/${post.slug}`}
              key={post.slug}
              className="blogCard group block bg-bg-subtle rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 ease-in-out"
            >
              <div className="p-6">
                <h2 className="text-xl font-bold text-fg group-hover:text-blue-500 transition-colors duration-300">
                  {post.title}
                </h2>
                <p className="text-fg-muted mt-2">{post.description}</p>
                <p className="text-fg-subtle text-sm mt-4">{post.date}</p>
              </div>
            </Link>
          ))
        )}
      </div>
    </main>
  );
}
