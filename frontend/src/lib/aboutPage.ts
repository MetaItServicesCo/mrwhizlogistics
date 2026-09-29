/**
 * Content of the About page, edited in Dashboard -> Pages -> About Us.
 * Stored as one site setting (ABOUT_PAGE_KEY, JSON) holding only what was
 * changed; everything else falls back to the original text below.
 */

export const ABOUT_PAGE_KEY = "about_page";

export interface ImageField {
  url: string;
  alt: string;
}

export interface AboutContent {
  hero: { title: string; badge: string };
  intro: {
    visible: boolean;
    eyebrow: string;
    heading: string;
    highlight: string;
    text: string;
    /** Exactly two, matching the two icons in the design. */
    features: { title: string; desc: string }[];
    badge: string;
    backImage: ImageField;
    frontImage: ImageField;
  };
  fleet: {
    visible: boolean;
    fleetHeading: string;
    cards: { tag: string; title: string; desc: string }[];
    expertiseHeading: string;
    experienceHighlight: string;
    experienceText: string;
    skills: { name: string; progress: number }[];
  };
  team: { visible: boolean; eyebrow: string; heading: string };
  cta: { visible: boolean; eyebrow: string; heading: string; text: string };
  seo: { metaTitle: string; metaDescription: string };
}

export const DEFAULT_ABOUT: AboutContent = {
  hero: { title: "About Us", badge: "WHO WE ARE" },
  intro: {
    visible: true,
    eyebrow: "Our Company",
    heading: "Our expertise stands in",
    highlight: "logistics solutions",
    text: "As a trucking and logistics company, we play a pivotal role in the supply chain — efficiently managing the movement of freight from origin to final destination with speed, visibility and care.",
    features: [
      {
        title: "Nationwide Service",
        desc: "From hot shot to full truckload, we move freight across all 50 states — reliably, on time.",
      },
      {
        title: "24/7 Dispatch",
        desc: "Our team is on call day and night, so your load keeps moving whenever you need it.",
      },
    ],
    badge: "WELCOME · TO OUR COMPANY · SINCE 2015 ·",
    backImage: {
      url: "/images/blog/ab1.jpg",
      alt: "Cargo plane, container ship and freight train at a busy logistics hub at sunset",
    },
    frontImage: {
      url: "/images/blog/ab2.jpg",
      alt: "Dispatcher in a safety vest on the phone giving a thumbs up in front of trucks",
    },
  },
  fleet: {
    visible: true,
    fleetHeading: "Our Fleet Overview",
    cards: [
      {
        tag: "01 // EXPEDITED",
        title: "Hot Shot Trailers",
        desc: "Ideal for urgent, medium-to-heavy loads, equipment, and time-sensitive commercial freight requiring fast transit.",
      },
      {
        tag: "02 // NATIONWIDE",
        title: "Box Trucks & Semi Vans",
        desc: "Secure, weather-proof transportation perfect for palletized goods, retail distribution, and heavy long-haul logistics.",
      },
    ],
    expertiseHeading: "Our Expertise",
    experienceHighlight: "25 years",
    experienceText: "of experience in Logistics services",
    skills: [
      { name: "GROUND TRANSPORT", progress: 85 },
      { name: "CARGO & HOT SHOT", progress: 78 },
      { name: "LOGISTICS SERVICES", progress: 65 },
      { name: "WAREHOUSING & STORAGE", progress: 40 },
    ],
  },
  team: { visible: true, eyebrow: "Our Team", heading: "Meet the people behind the wheel" },
  cta: {
    visible: true,
    eyebrow: "Ready To Move Your Freight?",
    heading: "Experience Stress-Free Logistics With Our Dedicated Fleet",
    text: "Get instant quotes or speak directly with our 24/7 dispatch team to handle your hot shot or heavy freight today.",
  },
  seo: {
    metaTitle: "",
    metaDescription:
      "Learn about our trucking company — hot shot, box truck and semi truck freight across all 50 states, with 24/7 dispatch and reliable, on-time delivery.",
  },
};

type Json = Record<string, unknown>;

const isObj = (v: unknown): v is Json => !!v && typeof v === "object" && !Array.isArray(v);

/** Recursively take stored values over defaults, keeping each default's type. */
function merge<T>(base: T, stored: unknown): T {
  if (Array.isArray(base)) {
    if (!Array.isArray(stored)) return base;
    const template = base[0];
    const items = stored.map((item) => merge(template, item)).filter((item) => !isEmptyItem(item));
    return (items.length ? items : base) as T;
  }
  if (isObj(base)) {
    if (!isObj(stored)) return base;
    const out: Json = { ...base };
    for (const key of Object.keys(base)) out[key] = merge((base as Json)[key], stored[key]);
    return out as T;
  }
  if (typeof base === "string") return (typeof stored === "string" && stored.trim() ? stored.trim() : base) as T;
  if (typeof base === "number") {
    const n = typeof stored === "number" ? stored : Number.NaN;
    return (Number.isFinite(n) ? Math.max(0, Math.min(100, Math.round(n))) : base) as T;
  }
  if (typeof base === "boolean") return (typeof stored === "boolean" ? stored : base) as T;
  return base;
}

function isEmptyItem(item: unknown): boolean {
  if (!isObj(item)) return false;
  return Object.values(item).every((v) => typeof v !== "string" || !v.trim());
}

function readStored(raw: string | null | undefined): unknown {
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Stored content merged over the defaults, exactly as entered (used by the
 * dashboard editor). The public page uses parseAboutContent.
 */
export function aboutDraftFrom(raw: string | null | undefined): AboutContent {
  const content = merge(DEFAULT_ABOUT, readStored(raw));
  // The design has exactly two feature boxes (one icon each).
  const f = content.intro.features;
  content.intro.features = [f[0] ?? DEFAULT_ABOUT.intro.features[0], f[1] ?? DEFAULT_ABOUT.intro.features[1]];
  // A replaced image keeps its own (possibly empty) alt, never the default's.
  const stored = readStored(raw);
  const storedIntro = isObj(stored) && isObj(stored.intro) ? stored.intro : {};
  for (const key of ["backImage", "frontImage"] as const) {
    const own = isObj(storedIntro[key]) ? (storedIntro[key] as Json) : {};
    if (content.intro[key].url !== DEFAULT_ABOUT.intro[key].url) {
      content.intro[key] = { url: content.intro[key].url, alt: typeof own.alt === "string" ? own.alt.trim() : "" };
    }
  }
  return content;
}

/** Content for the public page: the editor's values plus alt-text fallbacks. */
export function parseAboutContent(raw: string | null | undefined): AboutContent {
  const content = aboutDraftFrom(raw);
  // A replaced photo with no alt of its own falls back to the section heading.
  for (const key of ["backImage", "frontImage"] as const) {
    const img = content.intro[key];
    if (!img.alt.trim()) img.alt = `${content.intro.heading} ${content.intro.highlight}`.trim();
  }
  return content;
}

/**
 * What to store: only the values that differ from the original text, so
 * untouched fields keep following the defaults in code.
 */
export function aboutOverrides(content: AboutContent): Json {
  const diff = (value: unknown, base: unknown): unknown => {
    if (Array.isArray(base)) return JSON.stringify(value) === JSON.stringify(base) ? undefined : value;
    if (isObj(base) && isObj(value)) {
      const out: Json = {};
      for (const key of Object.keys(base)) {
        const d = diff(value[key], base[key]);
        if (d !== undefined) out[key] = d;
      }
      return Object.keys(out).length ? out : undefined;
    }
    if (typeof value === "string") return value.trim() === base ? undefined : value.trim();
    return value === base ? undefined : value;
  };
  const out = (diff(content, DEFAULT_ABOUT) as Json | undefined) ?? {};
  // An image is stored whole (url + its own alt) once anything about it changes.
  const intro = isObj(out.intro) ? out.intro : null;
  if (intro) {
    for (const key of ["backImage", "frontImage"] as const) {
      if (intro[key]) intro[key] = { url: content.intro[key].url, alt: content.intro[key].alt.trim() };
    }
  }
  return out;
}
