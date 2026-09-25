import type { Metadata } from "next";
import NotFoundContent from "@/components/common/NotFoundContent";
import PublicLayout from "./(public)/layout";

// Next.js marks this page noindex and sends HTTP 404 automatically.
export const metadata: Metadata = {
  title: "Page Not Found",
};

/**
 * Branded 404 for any unknown URL (and for notFound() in a page), inside the
 * normal site header and footer so visitors can carry on browsing.
 */
export default function NotFound() {
  return (
    <PublicLayout>
      <NotFoundContent />
    </PublicLayout>
  );
}
