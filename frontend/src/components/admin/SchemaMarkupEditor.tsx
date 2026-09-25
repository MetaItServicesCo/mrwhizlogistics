"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import AutoFixHighRoundedIcon from "@mui/icons-material/AutoFixHighRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";
import {
  DEFAULT_PUBLISHER,
  SCHEMA_TYPES,
  absoluteUrl,
  buildBlogSchema,
  type BlogSchemaInput,
} from "@/lib/blogSchema";
import { BORDER, Field, LIME, SelectField, fieldSx } from "./ui";

type Obj = Record<string, unknown>;

/** The properties exposed as form fields. Anything else in the JSON is kept as-is. */
type Fields = {
  type: string;
  headline: string;
  description: string;
  image: string;
  datePublished: string;
  dateModified: string;
  authorName: string;
  authorUrl: string;
  publisherName: string;
  publisherLogo: string;
  keywords: string;
};

const asObj = (v: unknown): Obj => (v && typeof v === "object" && !Array.isArray(v) ? (v as Obj) : {});
const asStr = (v: unknown): string => (typeof v === "string" ? v : "");

function readFields(schema: Obj): Fields {
  const author = asObj(Array.isArray(schema.author) ? schema.author[0] : schema.author);
  const publisher = asObj(schema.publisher);
  const image = Array.isArray(schema.image) ? schema.image[0] : schema.image;
  return {
    type: asStr(schema["@type"]) || "BlogPosting",
    headline: asStr(schema.headline),
    description: asStr(schema.description),
    image: asStr(typeof image === "object" ? asObj(image).url : image),
    datePublished: asStr(schema.datePublished),
    dateModified: asStr(schema.dateModified),
    authorName: asStr(author.name),
    authorUrl: asStr(author.url),
    publisherName: asStr(publisher.name),
    publisherLogo: asStr(asObj(publisher.logo).url),
    keywords: Array.isArray(schema.keywords) ? schema.keywords.join(", ") : asStr(schema.keywords),
  };
}

/** Write the form fields back into the schema, preserving unknown properties. */
function writeFields(base: Obj, f: Fields): Obj {
  const next: Obj = { "@context": "https://schema.org", ...base, "@type": f.type };
  const set = (key: string, value: unknown) => {
    if (value === "" || value === undefined) delete next[key];
    else next[key] = value;
  };

  set("headline", f.headline);
  set("description", f.description);
  set("image", f.image ? [f.image] : "");
  set("datePublished", f.datePublished);
  set("dateModified", f.dateModified);
  set("keywords", f.keywords);

  if (f.authorName || f.authorUrl) {
    next.author = {
      ...asObj(next.author),
      "@type": asStr(asObj(next.author)["@type"]) || "Person",
      name: f.authorName || undefined,
      url: f.authorUrl || undefined,
    };
  } else delete next.author;

  if (f.publisherName || f.publisherLogo) {
    const pub = asObj(next.publisher);
    next.publisher = {
      ...pub,
      "@type": "Organization",
      name: f.publisherName || undefined,
      logo: f.publisherLogo ? { "@type": "ImageObject", url: f.publisherLogo } : undefined,
    };
  } else delete next.publisher;

  return JSON.parse(JSON.stringify(next)) as Obj;
}

type Parsed =
  | { state: "empty" }
  | { state: "invalid"; message: string }
  | { state: "object"; value: Obj }
  | { state: "complex" }; // array / @graph: valid, but not editable as fields

function parse(text: string): Parsed {
  if (!text.trim()) return { state: "empty" };
  try {
    const value = JSON.parse(text) as unknown;
    if (Array.isArray(value) || (value && typeof value === "object" && "@graph" in value)) {
      return { state: "complex" };
    }
    if (value && typeof value === "object") return { state: "object", value: value as Obj };
    return { state: "invalid", message: "Must be a JSON object or an array of objects." };
  } catch (e) {
    return { state: "invalid", message: (e as Error).message };
  }
}

export default function SchemaMarkupEditor({
  value,
  onChange,
  post,
}: {
  /** Stored JSON-LD string; "" means "auto-generate on the public page". */
  value: string;
  onChange: (value: string) => void;
  /** Current post fields, used for "Fill from post" and the auto preview. */
  post: BlogSchemaInput;
}) {
  const [text, setText] = useState(value);
  const lastEmitted = useRef(value);

  // Switching to another post in the same dialog replaces the value.
  useEffect(() => {
    if (value !== lastEmitted.current) {
      setText(value);
      lastEmitted.current = value;
    }
  }, [value]);

  const emit = (next: string) => {
    setText(next);
    lastEmitted.current = next;
    onChange(next);
  };

  const parsed = useMemo(() => parse(text), [text]);
  const fields = parsed.state === "object" ? readFields(parsed.value) : null;

  const updateField = (key: keyof Fields, v: string) => {
    if (parsed.state !== "object") return;
    const next = writeFields(parsed.value, { ...readFields(parsed.value), [key]: v });
    emit(JSON.stringify(next, null, 2));
  };

  const fillFromPost = () => {
    const generated = buildBlogSchema(post);
    // Keep anything already customised; fill the rest from the post.
    const merged = parsed.state === "object" ? { ...generated, ...parsed.value } : generated;
    emit(JSON.stringify(merged, null, 2));
  };

  const autoPreview = useMemo(() => JSON.stringify(buildBlogSchema(post), null, 2), [post]);

  const row = { display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 } as const;

  return (
    <Box
      sx={{
        p: 2.5,
        borderRadius: "14px",
        border: BORDER,
        bgcolor: "rgba(255,255,255,0.02)",
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, flexWrap: "wrap" }}>
        <Box sx={{ flex: 1, minWidth: 220 }}>
          <Typography sx={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>
            Schema Markup (JSON-LD)
          </Typography>
          <Typography sx={{ fontSize: 12.5, color: "rgba(255,255,255,0.5)", mt: 0.5 }}>
            Structured data search engines read to show rich results. Leave empty and the site
            generates a standard BlogPosting schema from this post automatically.
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            size="small"
            startIcon={<AutoFixHighRoundedIcon />}
            onClick={fillFromPost}
            sx={{
              color: LIME,
              border: `1px solid ${LIME}55`,
              borderRadius: "10px",
              textTransform: "none",
              fontWeight: 700,
              "&:hover": { bgcolor: "rgba(200,255,0,0.08)" },
            }}
          >
            {parsed.state === "empty" ? "Customise" : "Fill from post"}
          </Button>
          {parsed.state !== "empty" && (
            <Button
              size="small"
              onClick={() => emit("")}
              sx={{ color: "rgba(255,255,255,0.6)", textTransform: "none", borderRadius: "10px" }}
            >
              Reset to automatic
            </Button>
          )}
        </Box>
      </Box>

      {parsed.state === "empty" ? (
        <Box>
          <Typography sx={{ fontSize: 12, fontWeight: 800, letterSpacing: 0.8, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", mb: 1 }}>
            Automatic markup that will be published
          </Typography>
          <Box
            component="pre"
            sx={{
              m: 0,
              p: 2,
              maxHeight: 220,
              overflow: "auto",
              borderRadius: "10px",
              bgcolor: "rgba(0,0,0,0.35)",
              color: "rgba(255,255,255,0.6)",
              fontSize: 12,
              fontFamily: "monospace",
            }}
          >
            {autoPreview}
          </Box>
        </Box>
      ) : (
        <>
          {fields ? (
            <>
              <Box sx={row}>
                <SelectField
                  label="Schema type"
                  value={SCHEMA_TYPES.includes(fields.type as (typeof SCHEMA_TYPES)[number]) ? fields.type : "BlogPosting"}
                  onChange={(e) => updateField("type", e.target.value)}
                  options={SCHEMA_TYPES.map((t) => ({ value: t, label: t }))}
                />
                <Field label="Headline" value={fields.headline} onChange={(e) => updateField("headline", e.target.value)} helperText="Max ~110 characters" />
              </Box>
              <Field label="Description" value={fields.description} onChange={(e) => updateField("description", e.target.value)} multiline minRows={2} />
              <Field
                label="Image URL"
                value={fields.image}
                onChange={(e) => updateField("image", e.target.value)}
                onBlur={(e) => e.target.value && updateField("image", absoluteUrl(e.target.value))}
                helperText="Absolute URL; relative paths are expanded when you leave the field"
              />
              <Box sx={row}>
                <Field label="Date published" value={fields.datePublished} onChange={(e) => updateField("datePublished", e.target.value)} helperText="ISO format, e.g. 2026-09-25" />
                <Field label="Date modified" value={fields.dateModified} onChange={(e) => updateField("dateModified", e.target.value)} helperText="ISO format" />
              </Box>
              <Box sx={row}>
                <Field label="Author name" value={fields.authorName} onChange={(e) => updateField("authorName", e.target.value)} />
                <Field label="Author URL" value={fields.authorUrl} onChange={(e) => updateField("authorUrl", e.target.value)} />
              </Box>
              <Box sx={row}>
                <Field label="Publisher name" value={fields.publisherName} placeholder={DEFAULT_PUBLISHER} onChange={(e) => updateField("publisherName", e.target.value)} />
                <Field label="Publisher logo URL" value={fields.publisherLogo} onChange={(e) => updateField("publisherLogo", e.target.value)} />
              </Box>
              <Field label="Keywords" value={fields.keywords} onChange={(e) => updateField("keywords", e.target.value)} helperText="Comma separated" />
            </>
          ) : parsed.state === "complex" ? (
            <Typography sx={{ fontSize: 12.5, color: "rgba(255,255,255,0.55)" }}>
              This markup contains multiple entities (an array or @graph), so it is edited as JSON only.
            </Typography>
          ) : null}

          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <Typography sx={{ fontSize: 12, fontWeight: 800, letterSpacing: 0.8, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", flex: 1 }}>
                JSON-LD
              </Typography>
              {parsed.state === "invalid" ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "#ff8a8a", fontSize: 12 }}>
                  <ErrorRoundedIcon sx={{ fontSize: 16 }} /> Invalid JSON
                </Box>
              ) : (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: LIME, fontSize: 12 }}>
                  <CheckCircleRoundedIcon sx={{ fontSize: 16 }} /> Valid JSON
                </Box>
              )}
            </Box>
            <Box
              component="textarea"
              value={text}
              spellCheck={false}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => emit(e.target.value)}
              aria-label="JSON-LD schema markup"
              sx={{
                ...fieldSx,
                width: "100%",
                minHeight: 220,
                p: 1.5,
                resize: "vertical",
                boxSizing: "border-box",
                borderRadius: "12px",
                border: `1px solid ${parsed.state === "invalid" ? "rgba(255,107,107,0.6)" : "rgba(255,255,255,0.14)"}`,
                bgcolor: "rgba(0,0,0,0.35)",
                color: "#fff",
                fontFamily: "monospace",
                fontSize: 12.5,
                lineHeight: 1.6,
                outline: "none",
                "&:focus": { borderColor: parsed.state === "invalid" ? "#ff6b6b" : LIME },
              }}
            />
            {parsed.state === "invalid" && (
              <Typography sx={{ fontSize: 12, color: "#ff8a8a", mt: 0.5 }}>{parsed.message}</Typography>
            )}
          </Box>
        </>
      )}
    </Box>
  );
}

/** Lets the blog form refuse to save markup the server would reject anyway. */
export function schemaMarkupError(value: string): string | null {
  const p = parse(value);
  return p.state === "invalid" ? `Schema markup is not valid JSON: ${p.message}` : null;
}
