import type { Metadata } from "next";
import BlogGrid from "@/components/blog/BlogGrid";
import { BLOG_POSTS } from "@/data/blogPosts";
import BlogHero from "@/components/blog/BlogHero";

export const metadata: Metadata = {
  title: "Blog | Logistics News, Freight Tips & Industry Insights",
  description:
    "Read the latest logistics news, freight strategies and supply-chain insights from our transportation experts.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Blog | Logistics Insights",
    description: "Latest logistics news, freight tips and industry insights.",
    url: "/blog",
    type: "website",
  },
};

export default function BlogPage() {
  return (
    <main>
      <BlogHero
        title="Trucking Insights"
        crumb="Blog"
        badge="TRUCKING INSIGHTS"
      />
      <BlogGrid posts={BLOG_POSTS} />
    </main>
  );
}
