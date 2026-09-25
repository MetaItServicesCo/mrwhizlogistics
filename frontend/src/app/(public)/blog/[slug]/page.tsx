import { notFound } from "next/navigation";
import { headers } from "next/headers";
import BlogDetailHero from "@/components/blog/BlogDetailHero";
import BlogDetail from "@/components/blog/BlogDetail";
import { BLOG_POSTS, getBlogPost } from "@/data/blogPosts";
import { apiBlogToView } from "@/lib/contentAdapters";
import {
  getBlog,
  getBlogs,
  loadDetail,
  loadDetailForMetadata,
} from "@/lib/serverContent";
import { buildBlogSchema, serializeJsonLd } from "@/lib/blogSchema";
import { detailMetadata, usableCanonical } from "@/lib/seo";
import type { BlogPost } from "@/data/blogPosts";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Public origin for absolute URLs in the JSON-LD. NEXT_PUBLIC_SITE_URL wins
 * when set; otherwise use the host nginx forwarded, which is correct in every
 * environment without extra configuration.
 */
async function requestOrigin(): Promise<string> {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) return configured.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") || h.get("host") || "localhost";
  const proto = h.get("x-forwarded-proto") || (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

/** Stored markup when the post has its own, otherwise a generated BlogPosting. */
function jsonLdFor(post: BlogPost, origin: string): unknown {
  if (post.schemaMarkup) {
    try {
      return JSON.parse(post.schemaMarkup);
    } catch {
      // The API validates on save, so this only guards hand-edited rows.
    }
  }
  return buildBlogSchema(
    {
      title: post.title,
      slug: post.slug,
      // Same description the page's <meta> uses.
      excerpt: post.metaDescription || post.excerpt,
      image: post.image,
      author: post.author,
      datePublished: post.date,
      keywords: post.keywords,
    },
    origin,
  );
}

export function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const apiPost = await loadDetailForMetadata(() => getBlog(slug));
  const post = apiPost ? apiBlogToView(apiPost) : getBlogPost(slug);
  if (!post) return { title: "Blog" };

  const siblings = await getBlogs();
  return detailMetadata({
    seo: {
      ...post,
      metaKeywords: post.keywords,
      canonicalUrl: usableCanonical(post.canonicalUrl, "blog", siblings?.map((b) => b.slug)),
    },
    name: post.title,
    fallbackTitle: post.title,
    fallbackDescription: post.excerpt,
    path: `/blog/${post.slug}`,
    image: post.image,
    imageAlt: post.title,
    type: "article",
  });
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const bundled = getBlogPost(slug);
  const [apiPost, apiPosts] = await Promise.all([
    loadDetail(() => getBlog(slug), Boolean(bundled)),
    getBlogs(),
  ]);
  // Bundled copy only while the API is down; otherwise an unknown slug 404s.
  const post = apiPost.live ? apiBlogToView(apiPost.live) : apiPost.outage ? bundled : undefined;
  if (!post) notFound();

  const allPosts = apiPosts ? apiPosts.map(apiBlogToView) : BLOG_POSTS;
  const jsonLd = jsonLdFor(post, await requestOrigin());

  return (
    <main>
      <script
        type="application/ld+json"
        // serializeJsonLd escapes "<" so no value can close this tag early.
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
      <BlogDetailHero post={post} />
      <BlogDetail post={post} allPosts={allPosts} />
    </main>
  );
}
