import { useEffect } from "react";
import type { BlogPost } from "@/loaders/blog";
import { useLoaderData } from "react-router-dom";

export default function BlogPost() {
  const post = useLoaderData<BlogPost>();

  if (!post) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl text-fg">Post not found</h1>
      </div>
    );
  }

  return (
    <main data-testid="blogpost" className="py-12 md:py-24 text-fg">
      <PostMetaData post={post} />
      <div className="container mx-auto px-4">
        <article className="max-w-3xl mx-auto">
          <header className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl lg:text-5xl  font-extrabold tracking-tight text-fg mb-4">
              {post.title}
            </h1>
            <div className="text-fg-muted">
              <span>By {post.author}</span>
              <span className="mx-2">&middot;</span>
              <span>{post.date}</span>
            </div>
          </header>

          <div
            className="prose lg:prose-xl mx-auto"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>
      </div>
    </main>
  );
}

export function PostMetaData({ post }: { post: BlogPost }) {
  const siteUrl = "https://zaplytic.dev";
  const postUrl = `${siteUrl}/blog/${post.slug}`;

  useEffect(() => {
    document.title = `${post.title} | Zaplytic`;
  }, [post.title]);

  return (
    <>
      <title>{post.title} | Zaplytic</title>
      <meta name="description" content={post.description} />
      <meta name="keywords" content={post.tags.join(", ")} />
      <meta name="author" content={post.author} />
      <link rel="canonical" href={postUrl} />
      {/* Open Graph */}
      <meta property="og:type" content="article" />
      <meta property="og:title" content={post.title} />
      <meta property="og:description" content={post.description} />
      <meta property="og:url" content={postUrl} />
      <meta property="og:site_name" content="Zaplytic" />
      <meta property="article:published_time" content={post.date} />
      <meta property="article:author" content={post.author} />
      {post.tags.map((tag) => (
        <meta key={tag} property="article:tag" content={tag} />
      ))}
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={post.title} />
      <meta name="twitter:description" content={post.description} />
      <meta name="twitter:creator" content="@nullscribe" /> {/* Your Twitter handle */}
    </>
  );
}
