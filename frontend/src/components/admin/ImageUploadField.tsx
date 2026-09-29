"use client";

import { useRef, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import { api, mediaUrl } from "@/lib/api";
import { errorMessage } from "@/lib/useResource";
import AltTextField from "@/components/admin/AltTextField";
import { LIME } from "@/components/admin/ui";

const ACCEPT = "image/png,image/jpeg,image/webp";
const MAX_BYTES = 10 * 1024 * 1024;

/**
 * An image chosen for page content: upload (stored immediately, applied on
 * the page's Save), preview, reset to the original image, and alt text.
 */
export default function ImageUploadField({
  label,
  value,
  onChange,
  defaultValue,
  altFallback,
}: {
  label: string;
  value: { url: string; alt: string };
  onChange: (value: { url: string; alt: string }) => void;
  /** The original image, for "Use original". */
  defaultValue: { url: string; alt: string };
  /** What an empty alt falls back to, e.g. "the section heading". */
  altFallback: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = async (file: File) => {
    setError(null);
    if (!ACCEPT.split(",").includes(file.type)) return setError("Please choose a PNG, JPG or WebP image.");
    if (file.size > MAX_BYTES) return setError("That image is larger than 10 MB.");
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { url } = await api.post<{ url: string }>("/api/uploads/image", fd);
      // A new picture needs its own description: clear the old one.
      onChange({ url, alt: "" });
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setUploading(false);
    }
  };

  const isDefault = value.url === defaultValue.url;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.2 }}>
      <Typography sx={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>{label}</Typography>
      <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
        <Box
          sx={{
            width: 132,
            height: 88,
            borderRadius: "10px",
            overflow: "hidden",
            bgcolor: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.12)",
            flexShrink: 0,
          }}
        >
          {value.url && (
            <Box component="img" src={mediaUrl(value.url)} alt="" sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          )}
        </Box>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Button
            size="small"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            startIcon={uploading ? <CircularProgress size={14} sx={{ color: "inherit" }} /> : <CloudUploadRoundedIcon />}
            sx={{ color: LIME, border: `1px solid ${LIME}55`, borderRadius: "999px", textTransform: "none", fontWeight: 700, px: 1.6 }}
          >
            {uploading ? "Uploading…" : "Replace image"}
          </Button>
          <Button
            size="small"
            onClick={() => onChange(defaultValue)}
            disabled={uploading || isDefault}
            startIcon={<RestartAltRoundedIcon />}
            sx={{ color: "rgba(255,255,255,0.7)", textTransform: "none", fontWeight: 700 }}
          >
            Use original
          </Button>
        </Box>
        <input
          ref={fileRef}
          type="file"
          accept={ACCEPT}
          hidden
          aria-label={`Upload ${label}`}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void upload(f);
            e.target.value = "";
          }}
        />
      </Box>
      {error && <Typography sx={{ fontSize: 12.5, color: "#ff8a8a" }}>{error}</Typography>}
      <AltTextField
        label={`${label} alt text`}
        value={value.alt}
        onChange={(alt) => onChange({ ...value, alt })}
        fallback={altFallback}
      />
    </Box>
  );
}
