import { notFound } from "next/navigation";
import BlogDetailHero from "@/components/blog/BlogDetailHero";
import BlogDetail from "@/components/blog/BlogDetail";
import { BLOG_POSTS, getBlogPost } from "@/data/blogPosts";
import { apiBlogToView } from "@/lib/contentAdapters";
import { getBlog, getBlogs } from "@/lib/serverContent";

export function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const apiPost = await getBlog(slug);
  const post = apiPost ? apiBlogToView(apiPost) : getBlogPost(slug);
  if (!post) return { title: "Blog" };
  return {
    title: `${post.title} | Blog`,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `/blog/${post.slug}`,
      type: "article",
      images: post.image ? [{ url: post.image }] : undefined,
    },
  };
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [apiPost, apiPosts] = await Promise.all([getBlog(slug), getBlogs()]);
  const post = apiPost ? apiBlogToView(apiPost) : getBlogPost(slug);
  if (!post) notFound();

  const allPosts = apiPosts ? apiPosts.map(apiBlogToView) : BLOG_POSTS;

  return (
    <main>
      <BlogDetailHero post={post} />
      <BlogDetail post={post} allPosts={allPosts} />
    </main>
  );
}
