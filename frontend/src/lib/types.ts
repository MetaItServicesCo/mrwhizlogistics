// TypeScript mirrors of the FastAPI response schemas (backend/app/schemas/*).

export type InquiryStatus = "new" | "contacted" | "quoted" | "closed";

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export interface DashboardStats {
  quotes: { total: number; new: number };
  contacts: { total: number; new: number };
  subscribers: number;
  services: number;
  faqs: number;
  testimonials: number;
  pages: number;
}

export interface Quote {
  id: number;
  name: string;
  phone: string | null;
  email: string;
  pickup: string | null;
  drop: string | null;
  selected_service: string;
  details: string | null;
  status: string;
  created_at: string;
}

export interface ContactInquiry {
  id: number;
  full_name: string;
  email: string;
  phone_number: string | null;
  service_needed: string | null;
  company_name: string | null;
  message: string | null;
  status: string | null;
  created_at: string;
}

export interface Subscriber {
  id: number;
  email: string;
  is_active: boolean;
  created_at: string;
}

export interface Testimonial {
  id: number;
  quote: string;
  name: string;
  role: string | null;
  rating: number;
  initials: string | null;
  accent: string | null;
  image: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface TeamMember {
  id: number;
  name: string;
  role: string;
  image: string | null;
  socials: Record<string, string>;
}

export interface Faq {
  id: number;
  category_id: number;
  question: string;
  answer: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FaqCategory {
  id: number;
  name: string;
  icon: string | null;
  description: string | null;
  display_order: number;
  is_active: boolean;
  faq_count: number;
  created_at: string;
  updated_at: string;
}

/** Shared shape of hotshot / box-truck / semi-truck cards. */
export interface TruckCard {
  id: number;
  page_heading: string | null;
  page_subheading: string | null;
  card_number: string;
  category_tag: string;
  title: string;
  short_description: string;
  card_image: string;
  features: string[];
  detail_heading: string;
  detail_image: string | null;
  detail_paragraphs: string[];
  /** Sanitised rich-text body; overrides detail_paragraphs when set. */
  content_html?: string | null;
  slug: string;
  // semi-truck only
  trailer_length?: string | null;
  max_payload?: string | null;
  cargo_type?: string | null;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
  canonical_url: string | null;
}

export interface BlogComment {
  id: number;
  blog_id: number;
  parent_id: number | null;
  name: string;
  message: string;
  created_at: string;
  replies: BlogComment[];
}

export interface BlogPost {
  id: number;
  card_id: string;
  title: string;
  slug: string;
  author_name: string;
  publish_date: string;
  read_time: string;
  category_tag: string;
  card_image: string;
  detail_image: string | null;
  short_description: string;
  content_paragraphs: string[];
  /** Sanitised rich-text body; overrides content_paragraphs when set. */
  content_html?: string | null;
  tags: string[];
  comments_count: number;
  comments: BlogComment[];
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
  canonical_url: string | null;
  /** JSON-LD string; empty means auto-generate on the public page. */
  schema_markup?: string | null;
}

export interface RentalQuote {
  id: number;
  customer: {
    fullName: string;
    companyName: string | null;
    email: string;
    phone: string;
    preferredContactMethod: string | null;
  };
  rental: {
    slug: string;
    name: string;
    duration: string | null;
    startDate: string | null;
    endDate: string | null;
  };
  logistics: {
    pickupLocation: string | null;
    returnLocation: string | null;
    deliveryRequired: boolean | null;
    deliveryAddress: string | null;
  };
  load: {
    intendedUse: string | null;
    description: string | null;
    cargoType: string | null;
    estimatedWeight: string | null;
    estimatedMileage: string | null;
  };
  requirements: {
    specialRequirements: string | null;
    additionalNotes: string | null;
  };
  status: string;
  submittedAt: string;
}

export interface SiteSetting {
  id: number;
  key: string;
  value: string | null;
  label: string | null;
}

/** Envelope returned by the paginated admin list endpoints. */
export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
}
