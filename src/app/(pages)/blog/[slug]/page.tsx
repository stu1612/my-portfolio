import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleEnd } from "@/components/ui/article-end";
import { formatDate } from "@/features/blog/format";
import { PostHeader } from "@/features/blog/post-header";
import {
  EMPTY_SLUG,
  getPost,
  getPosts,
  olderPost,
  staticSlugs,
} from "@/lib/content";
import { Mdx } from "@/lib/content/mdx/mdx";

// Never empty: with nothing published this is the reserved EMPTY_SLUG, whose
// page is notFound(), so the route still builds when every post is a draft.
// Unlisted slugs render at request time: they show the not-found page with
// noindex, but keep HTTP 200 (Cache Components sends the shell first).
export function generateStaticParams() {
  return staticSlugs(getPosts());
}

const find = (slug: string) =>
  slug === EMPTY_SLUG ? undefined : getPost(slug);

export async function generateMetadata({
  params,
}: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const post = find((await params).slug);
  if (!post) return {};
  return {
    title: `${post.title} · Stu Bolderson`,
    description: post.description,
  };
}

export default async function PostPage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const post = find(slug);
  if (!post) notFound();
  const older = olderPost(getPosts(), slug);

  return (
    <div className="px-4 min-[720px]:px-8">
      <PostHeader {...post} />
      <article className="article-flow">
        <Mdx code={post.code} />
      </article>
      <ArticleEnd
        label="More posts"
        next={
          older && {
            href: older.url,
            kicker: (
              <>
                Older post ·{" "}
                <time dateTime={older.published}>
                  {formatDate(older.published)}
                </time>
              </>
            ),
            title: older.title,
          }
        }
        back={{ href: "/blog", label: "All posts" }}
      />
    </div>
  );
}
