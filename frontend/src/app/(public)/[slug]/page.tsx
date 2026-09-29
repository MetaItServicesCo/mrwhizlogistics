import ContentPage, { contentPageMetadata } from "@/components/common/ContentPage";

/**
 * Pages written in Dashboard -> Pages -> Site pages (Privacy Policy, Terms,
 * Disclaimer and any page an admin adds). Every other top-level route (about,
 * blog, contact, ...) is its own folder and always takes precedence; an
 * unknown or unpublished slug is the branded 404.
 */
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  return contentPageMetadata((await params).slug);
}

export default async function Page({ params }: Props) {
  return <ContentPage slug={(await params).slug} />;
}
