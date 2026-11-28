import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PostList } from "./post-list";

const post = {
  url: "/blog/a",
  title: "A post",
  description: "What it is about.",
  published: "2026-11-28",
  readingMinutes: 6,
  tags: ["Agents", "Process"],
};

describe("PostList", () => {
  it("says there are no posts yet when the list is empty", () => {
    const html = renderToStaticMarkup(<PostList posts={[]} />);
    expect(html).toContain("No posts yet.");
    expect(html).not.toContain("<ol");
  });

  it("renders one linked row per post, with its date, description and meta", () => {
    const html = renderToStaticMarkup(
      <PostList posts={[post, { ...post, url: "/blog/b", tags: [] }]} />,
    );
    expect(html.match(/<li/g)).toHaveLength(2);
    expect(html).toContain('href="/blog/a"');
    // HTML attribute names are case-insensitive; React writes dateTime.
    expect(html).toMatch(/<time datetime="2026-11-28"/i);
    expect(html).toContain("28 Nov 2026");
    expect(html).toContain("What it is about.");
    expect(html).toContain("6 min · Agents · Process");
  });
});
