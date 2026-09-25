import type { Metadata } from "next";
import BlogGrid from "@/components/blog/BlogGrid";
import { BLOG_POSTS } from "@/data/blogPosts";
import BlogHero from "@/components/blog/BlogHero";
import { apiBlogToView } from "@/lib/contentAdapters";
import { getBlogs } from "@/lib/serverContent";
import { pageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = pageMetadata({
  title: "Blog: Logistics News & Freight Tips",
  description:
    "Read the latest logistics news, freight strategies and supply-chain insights from our transportation experts.",
  path: "/blog",
});

export default async function BlogPage() {
  const apiPosts = await getBlogs();
  const posts = apiPosts ? apiPosts.map(apiBlogToView) : BLOG_POSTS;

  return (
    <main>
      <BlogHero
        title="Trucking Insights"
        crumb="Blog"
        badge="TRUCKING INSIGHTS"
      />
      <BlogGrid posts={posts} />
    </main>
  );
}
