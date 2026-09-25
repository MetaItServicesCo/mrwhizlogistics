import type { Metadata } from "next";
import NotFoundContent from "@/components/common/NotFoundContent";

export const metadata: Metadata = {
  title: "Page Not Found",
};

/**
 * notFound() from a public page (e.g. an unknown service slug). This renders
 * inside the (public) layout, which already provides the header and footer;
 * app/not-found.tsx handles URLs that match no route at all.
 */
export default function PublicNotFound() {
  return <NotFoundContent />;
}
