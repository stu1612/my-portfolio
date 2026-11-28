import type { Metadata } from "next";
import Link from "next/link";
import { ArticleHeader } from "@/components/ui/article-header";
import { listKicker } from "@/features/blog/format";
import { PostList } from "@/features/blog/post-list";
import { getPosts } from "@/lib/content";

// Placeholder copy for Stu to rewrite.
const DECK =
  "Notes from building for the web: the decisions, the mistakes and what I'd do again.";

export const metadata: Metadata = {
  title: "Blog · Stu Bolderson",
  description: DECK,
};

export default function BlogPage() {
  const posts = getPosts();
  return (
    <div className="px-4 min-[720px]:px-8">
      <ArticleHeader
        kicker={listKicker(posts.length)}
        title="Blog"
        deck={DECK}
      />
      <PostList posts={posts} />
      <p className="max-w-measure mx-auto py-16">
        <Link
          href="/"
          className="type-meta focus-ring hover:text-accent focus-visible:text-accent inline-flex items-center gap-2"
        >
          <span aria-hidden="true">←</span> Index
        </Link>
      </p>
    </div>
  );
}
