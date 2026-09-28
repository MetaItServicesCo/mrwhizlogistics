"use client";

import { Field } from "@/components/admin/ui";

/** Matches the backend limit (app/core/alt_text.py). */
export const ALT_TEXT_MAX = 300;

/**
 * Alternative text for an uploaded image: read aloud by screen readers and
 * used by search engines. Shown under every image picker in the dashboard.
 */
export default function AltTextField({
  value,
  onChange,
  fallback,
  label = "Alt text",
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  /** What is used when left empty, e.g. "the post title". */
  fallback: string;
  label?: string;
  disabled?: boolean;
}) {
  const length = value.trim().length;
  const tooLong = length > ALT_TEXT_MAX;
  return (
    <Field
      size="small"
      label={label}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      placeholder="e.g. White 26 ft box truck loading at a warehouse dock"
      error={tooLong}
      slotProps={{ inputLabel: { shrink: true }, htmlInput: { maxLength: ALT_TEXT_MAX + 50 } }}
      helperText={
        tooLong
          ? `Too long (${length}/${ALT_TEXT_MAX}). Keep it to a short description.`
          : `Describe what the image shows (for screen readers and Google). Empty = uses ${fallback}. ${length}/${ALT_TEXT_MAX}`
      }
    />
  );
}
