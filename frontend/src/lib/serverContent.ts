import "server-only";

import type { BlogPost, TruckCard } from "@/lib/types";
import type {
  PublicFaqCategory,
  PublicSiteSetting,
  PublicTeamMember,
  PublicTestimonial,
} from "@/lib/contentAdapters";

const API_BASE = (
  process.env.API_INTERNAL_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000"
).replace(/\/$/, "");

async function getPublic<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(`${API_BASE}${path}`, { cache: "no-store" });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export const getHotshotCards = () =>
  getPublic<TruckCard[]>("/api/hotshots/");

export const getBoxTruckCards = () =>
  getPublic<TruckCard[]>("/api/box-trucks/");

export const getSemiTruckCards = () =>
  getPublic<TruckCard[]>("/api/semi-trucks/");

export const getHotshotCard = (slug: string) =>
  getPublic<TruckCard>(`/api/hotshots/${encodeURIComponent(slug)}`);

export const getBoxTruckCard = (slug: string) =>
  getPublic<TruckCard>(`/api/box-trucks/${encodeURIComponent(slug)}`);

export const getSemiTruckCard = (slug: string) =>
  getPublic<TruckCard>(`/api/semi-trucks/${encodeURIComponent(slug)}`);

export const getBlogs = () => getPublic<BlogPost[]>("/api/blogs/");

export const getBlog = (slug: string) =>
  getPublic<BlogPost>(`/api/blogs/${encodeURIComponent(slug)}`);

export const getPublicFaqs = () =>
  getPublic<PublicFaqCategory[]>("/api/public/faqs");

export const getPublicTestimonials = () =>
  getPublic<PublicTestimonial[]>("/api/public/testimonials");

export const getPublicTeam = () =>
  getPublic<PublicTeamMember[]>("/api/team/");

export const getPublicSettings = () =>
  getPublic<PublicSiteSetting[]>("/api/public/settings");
