"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import CodeRoundedIcon from "@mui/icons-material/CodeRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import TravelExploreRoundedIcon from "@mui/icons-material/TravelExploreRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import { api, mediaUrl } from "@/lib/api";
import { errorMessage } from "@/lib/useResource";
import { SITE_URL } from "@/lib/site";
import {
  BORDER,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  Field,
  ACCENT,
  LoadingState,
  PageHeader,
  Panel,
  SearchBox,
  Toast,
  fmtDateTime,
} from "@/components/admin/ui";
import { ACCENT_HOVER } from "@/theme/brand";

interface MediaItem {
  name: string;
  url: string;
  size: number;
  modified: string;
}
interface MediaPage {
  items: MediaItem[];
  total: number;
}
interface Usage {
  table: string;
  id: number | null;
  label: string;
}

const PAGE_SIZE = 48;
const ACCEPT = "image/png,image/jpeg,image/webp,image/gif";

/** The permanent public link, always on the website's own domain. */
const publicLink = (url: string) => `${SITE_URL}${url}`;

/** "box-truck-dallas-3f9a1c.webp" -> "Box truck dallas" (a starting alt text). */
function altFromName(name: string) {
  const words = name
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/-[0-9a-f]{6}$/, "")
    .replace(/^[0-9a-f]{32}$/, "")
    .replace(/[-_]+/g, " ")
    .trim();
  return words ? words.charAt(0).toUpperCase() + words.slice(1) : "";
}

const fmtSize = (bytes: number) =>
  bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

const TABLE_LABELS: Record<string, string> = {
  blogs: "Blog post",
  site_settings: "Setting",
  pages: "Page",
  page_sections: "Page section",
  content_blocks: "Content block",
  seo: "SEO metadata",
  services: "Service",
  hotshot_cards: "Hot Shot service",
  box_trucks: "Box truck",
  semi_truck_cards: "Semi truck",
  rental_items: "Rental",
  team_members: "Team member",
  newsletter_campaigns: "Newsletter",
};
const tableLabel = (t: string) => TABLE_LABELS[t] ?? t.replace(/_/g, " ").replace(/s$/, "").replace(/^\w/, (m) => m.toUpperCase());

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // Older browsers / non-HTTPS: fall back to a hidden textarea.
    const el = document.createElement("textarea");
    el.value = text;
    el.style.position = "fixed";
    el.style.opacity = "0";
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    el.remove();
  }
}

const smallBtn = {
  color: "rgba(255,255,255,0.7)",
  textTransform: "none",
  fontSize: 12.5,
  fontWeight: 700,
  borderRadius: "9px",
  px: 1.2,
  minWidth: 0,
  "&:hover": { color: ACCENT, bgcolor: "rgba(var(--accent-rgb), 0.08)" },
} as const;

/**
 * Dashboard -> Media library: upload an image and get its permanent link on
 * the website's own domain, ready to paste into the blog editor
 * ("Insert image from URL"), a page, or anywhere else.
 */
export default function MediaLibraryPage() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");

  const [seoName, setSeoName] = useState("");
  const [uploading, setUploading] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [fresh, setFresh] = useState<string[]>([]);
  const fileInput = useRef<HTMLInputElement>(null);

  const [usage, setUsage] = useState<Record<string, Usage[] | "loading">>({});
  const [toDelete, setToDelete] = useState<{ item: MediaItem; used: Usage[] } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<{ msg: string; sev: "success" | "error" | "info" } | null>(null);

  // Debounce the search box.
  useEffect(() => {
    const t = setTimeout(() => {
      const next = search.trim();
      if (next !== query) {
        setLoading(true);
        setQuery(next);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [search, query]);

  const [reloadKey, setReloadKey] = useState(0);
  const fetchPage = useCallback((p: number) => {
    const params = new URLSearchParams({ page: String(p), size: String(PAGE_SIZE) });
    if (query) params.set("q", query);
    return api.get<MediaPage>(`/api/uploads?${params}`);
  }, [query]);

  // First page: whenever the search changes or a reload is asked for.
  useEffect(() => {
    let current = true;
    fetchPage(1)
      .then((res) => {
        if (!current) return;
        setItems(res.items);
        setTotal(res.total);
        setPage(1);
        setError(null);
      })
      .catch((e) => current && setError(errorMessage(e)))
      .finally(() => current && setLoading(false));
    return () => {
      current = false;
    };
  }, [fetchPage, reloadKey]);

  const reload = () => {
    setLoading(true);
    setReloadKey((k) => k + 1);
  };

  const loadMore = async () => {
    setLoading(true);
    try {
      const res = await fetchPage(page + 1);
      setItems((prev) => [...prev, ...res.items.filter((i) => !prev.some((x) => x.name === i.name))]);
      setTotal(res.total);
      setPage(page + 1);
    } catch (e) {
      setToast({ msg: errorMessage(e), sev: "error" });
    } finally {
      setLoading(false);
    }
  };

  const upload = async (files: FileList | File[]) => {
    const list = Array.from(files);
    if (!list.length) return;
    setUploading(list.length);
    const done: string[] = [];
    const failed: string[] = [];
    for (const file of list) {
      const form = new FormData();
      form.append("file", file);
      if (seoName.trim()) form.append("name", seoName.trim());
      try {
        const res = await api.post<{ url: string; name: string }>("/api/uploads/image", form);
        done.push(res.name);
      } catch (e) {
        failed.push(`${file.name}: ${errorMessage(e)}`);
      }
      setUploading((n) => n - 1);
    }
    setUploading(0);
    if (fileInput.current) fileInput.current.value = "";
    if (done.length) {
      setSeoName("");
      setFresh(done);
      setSearch("");
      setQuery("");
      reload();
      if (done.length === 1 && !failed.length) {
        await copyText(publicLink(`/uploads/${done[0]}`));
        setToast({ msg: "Uploaded — link copied. Paste it in the editor with “Insert image from URL”.", sev: "success" });
      } else {
        setToast({
          msg: `${done.length} uploaded${failed.length ? `, ${failed.length} failed: ${failed.join("; ")}` : ""}.`,
          sev: failed.length ? "error" : "success",
        });
      }
    } else if (failed.length) {
      setToast({ msg: failed.join("; "), sev: "error" });
    }
  };

  const checkUsage = async (item: MediaItem): Promise<Usage[] | null> => {
    setUsage((u) => ({ ...u, [item.name]: "loading" }));
    try {
      const res = await api.get<{ used_in: Usage[] }>(`/api/uploads/${encodeURIComponent(item.name)}/usage`);
      setUsage((u) => ({ ...u, [item.name]: res.used_in }));
      return res.used_in;
    } catch (e) {
      setUsage((u) => {
        const next = { ...u };
        delete next[item.name];
        return next;
      });
      setToast({ msg: errorMessage(e), sev: "error" });
      return null;
    }
  };

  const askDelete = async (item: MediaItem) => {
    // Always re-check: it may have been put on a page since the last check.
    const used = await checkUsage(item);
    if (used) setToDelete({ item, used });
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      const force = toDelete.used.length ? "?force=true" : "";
      await api.del(`/api/uploads/${encodeURIComponent(toDelete.item.name)}${force}`);
      setItems((list) => list.filter((i) => i.name !== toDelete.item.name));
      setTotal((t) => t - 1);
      setToast({ msg: "Image deleted.", sev: "success" });
      setToDelete(null);
    } catch (e) {
      setToast({ msg: errorMessage(e), sev: "error" });
    } finally {
      setDeleting(false);
    }
  };

  const copy = async (text: string, what: string) => {
    await copyText(text);
    setToast({ msg: `${what} copied.`, sev: "success" });
  };

  return (
    <Box>
      <PageHeader
        title="Media library"
        subtitle="Upload an image to get its permanent link on your website's domain. Paste the link in the blog editor (Insert image from URL), on a page, or anywhere you need it."
      />

      {/* Upload */}
      <Panel sx={{ p: { xs: 2, md: 2.5 }, mb: 3 }}>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "minmax(0,1fr) minmax(0,1.3fr)" }, gap: 2.5 }}>
          <Box>
            <Field
              label="SEO file name (optional)"
              placeholder="e.g. Hot shot trucking Dallas"
              value={seoName}
              onChange={(e) => setSeoName(e.target.value)}
              helperText="Describe the image in a few words — it becomes the file name in the link (good for Google Images). Leave empty to use the original file name."
              size="small"
            />
          </Box>
          <Box
            role="button"
            tabIndex={0}
            aria-label="Upload images"
            onClick={() => !uploading && fileInput.current?.click()}
            onKeyDown={(e) => {
              if ((e.key === "Enter" || e.key === " ") && !uploading) {
                e.preventDefault();
                fileInput.current?.click();
              }
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              if (!uploading) void upload(e.dataTransfer.files);
            }}
            sx={{
              minHeight: 120,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 0.8,
              textAlign: "center",
              px: 2,
              borderRadius: "14px",
              border: `1.5px dashed ${dragOver ? ACCENT : "rgba(255,255,255,0.18)"}`,
              bgcolor: dragOver ? "rgba(var(--accent-rgb), 0.06)" : "rgba(255,255,255,0.02)",
              cursor: uploading ? "progress" : "pointer",
              transition: "border-color .2s, background-color .2s",
              "&:hover, &:focus-visible": { borderColor: ACCENT, outline: "none" },
            }}
          >
            {uploading ? (
              <>
                <CircularProgress size={26} sx={{ color: ACCENT }} />
                <Typography sx={{ color: "rgba(255,255,255,0.7)", fontSize: 13.5 }}>
                  Uploading… {uploading} left
                </Typography>
              </>
            ) : (
              <>
                <CloudUploadRoundedIcon sx={{ fontSize: 34, color: ACCENT }} />
                <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: 14.5 }}>
                  Click to choose images, or drop them here
                </Typography>
                <Typography sx={{ color: "rgba(255,255,255,0.45)", fontSize: 12.5 }}>
                  PNG, JPEG, WebP or GIF · up to 10 MB each · WebP loads fastest
                </Typography>
              </>
            )}
            <input
              ref={fileInput}
              type="file"
              accept={ACCEPT}
              multiple
              hidden
              data-testid="media-file-input"
              onChange={(e) => e.target.files && void upload(e.target.files)}
            />
          </Box>
        </Box>
      </Panel>

      {/* Library */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2, flexWrap: "wrap" }}>
        <Typography sx={{ color: "rgba(255,255,255,0.6)", fontSize: 14, flex: 1 }}>
          {loading && page === 1 ? "Loading…" : `${total} image${total === 1 ? "" : "s"}${query ? ` matching “${query}”` : ""}`}
        </Typography>
        <SearchBox value={search} onChange={setSearch} placeholder="Search by file name…" />
      </Box>

      {error ? (
        <Panel>
          <ErrorState
            message={error}
            onRetry={reload}
          />
        </Panel>
      ) : loading && page === 1 && !items.length ? (
        <Panel>
          <LoadingState label="Loading images…" />
        </Panel>
      ) : !items.length ? (
        <Panel>
          <EmptyState
            title={query ? "No images match your search" : "No images uploaded yet"}
            hint={query ? "Try another word from the file name." : "Upload an image above to get its link."}
          />
        </Panel>
      ) : (
        <>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0,1fr))", lg: "repeat(3, minmax(0,1fr))", xl: "repeat(4, minmax(0,1fr))" },
              gap: 2,
            }}
          >
            {items.map((item) => {
              const link = publicLink(item.url);
              const alt = altFromName(item.name);
              const used = usage[item.name];
              const isNew = fresh.includes(item.name);
              return (
                <Panel
                  key={item.name}
                  sx={{ display: "flex", flexDirection: "column", ...(isNew ? { borderColor: ACCENT, boxShadow: `0 0 0 1px ${ACCENT}` } : {}) }}
                >
                  <Box
                    component="a"
                    href={mediaUrl(item.url)}
                    target="_blank"
                    rel="noreferrer"
                    sx={{
                      display: "block",
                      position: "relative",
                      overflow: "hidden",
                      aspectRatio: "16 / 10",
                      bgcolor: "#081c31",
                      backgroundImage:
                        "linear-gradient(45deg,#0d2439 25%,transparent 25%),linear-gradient(-45deg,#0d2439 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#0d2439 75%),linear-gradient(-45deg,transparent 75%,#0d2439 75%)",
                      backgroundSize: "16px 16px",
                      backgroundPosition: "0 0,0 8px,8px -8px,-8px 0",
                      borderBottom: BORDER,
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={mediaUrl(item.url)}
                      alt={alt || item.name}
                      loading="lazy"
                      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain" }}
                    />
                  </Box>
                  <Box sx={{ p: 1.5, display: "flex", flexDirection: "column", gap: 1, flex: 1 }}>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        title={item.name}
                        sx={{ color: "#fff", fontSize: 13.5, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                      >
                        {item.name}
                      </Typography>
                      <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>
                        {fmtSize(item.size)} · {fmtDateTime(item.modified)}
                        {isNew && <Box component="span" sx={{ color: ACCENT, fontWeight: 800 }}> · New</Box>}
                      </Typography>
                    </Box>

                    {/* The link itself: click to select, button to copy. */}
                    <Box
                      component="input"
                      readOnly
                      value={link}
                      aria-label={`Link for ${item.name}`}
                      onFocus={(e: React.FocusEvent<HTMLInputElement>) => e.target.select()}
                      sx={{
                        width: "100%",
                        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                        fontSize: 11.5,
                        color: ACCENT,
                        bgcolor: "rgba(255,255,255,0.03)",
                        border: BORDER,
                        borderRadius: "8px",
                        px: 1,
                        py: 0.8,
                        outline: "none",
                        "&:focus": { borderColor: ACCENT },
                      }}
                    />

                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, alignItems: "center" }}>
                      <Button
                        size="small"
                        startIcon={<ContentCopyRoundedIcon sx={{ fontSize: "16px !important" }} />}
                        onClick={() => void copy(link, "Link")}
                        sx={{ ...smallBtn, color: "#081c31", bgcolor: ACCENT, "&:hover": { bgcolor: ACCENT_HOVER, color: "#081c31" } }}
                      >
                        Copy link
                      </Button>
                      <Tooltip title="Copy as an HTML <img> tag with alt text" describeChild>
                        <Button
                          size="small"
                          startIcon={<CodeRoundedIcon sx={{ fontSize: "16px !important" }} />}
                          onClick={() => void copy(`<img src="${link}" alt="${alt.replace(/"/g, "&quot;")}" />`, "HTML")}
                          sx={smallBtn}
                        >
                          Copy HTML
                        </Button>
                      </Tooltip>
                      <Box sx={{ flex: 1 }} />
                      <Tooltip title="Where is this image used?">
                        <IconButton
                          size="small"
                          aria-label={`Where is ${item.name} used`}
                          onClick={() => void checkUsage(item)}
                          sx={{ color: "rgba(255,255,255,0.55)", "&:hover": { color: ACCENT } }}
                        >
                          <TravelExploreRoundedIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Open image">
                        <IconButton
                          size="small"
                          component="a"
                          href={mediaUrl(item.url)}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`Open ${item.name}`}
                          sx={{ color: "rgba(255,255,255,0.55)", "&:hover": { color: ACCENT } }}
                        >
                          <OpenInNewRoundedIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          aria-label={`Delete ${item.name}`}
                          onClick={() => void askDelete(item)}
                          sx={{ color: "rgba(255,255,255,0.55)", "&:hover": { color: "#ff6b6b" } }}
                        >
                          <DeleteOutlineRoundedIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>

                    {used !== undefined && (
                      <Box sx={{ fontSize: 12, color: "rgba(255,255,255,0.55)", borderTop: BORDER, pt: 1 }}>
                        {used === "loading" ? (
                          "Checking where it's used…"
                        ) : used.length ? (
                          <>
                            <Box component="span" sx={{ color: "#fff", fontWeight: 700 }}>
                              Used in {used.length} place{used.length === 1 ? "" : "s"}:
                            </Box>{" "}
                            {used.map((u) => `${tableLabel(u.table)} “${u.label}”`).join(", ")}
                          </>
                        ) : (
                          "Not used anywhere on the site yet."
                        )}
                      </Box>
                    )}
                  </Box>
                </Panel>
              );
            })}
          </Box>
          {items.length < total && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
              <Button
                onClick={() => void loadMore()}
                disabled={loading}
                sx={{ color: ACCENT, border: `1px solid ${ACCENT}55`, borderRadius: "999px", px: 3, textTransform: "none", fontWeight: 700 }}
              >
                {loading ? <CircularProgress size={18} sx={{ color: ACCENT }} /> : `Load more (${total - items.length} left)`}
              </Button>
            </Box>
          )}
        </>
      )}

      <ConfirmDialog
        open={!!toDelete}
        title={toDelete?.used.length ? "This image is in use" : "Delete this image?"}
        message={
          toDelete
            ? toDelete.used.length
              ? `It is used in: ${toDelete.used.map((u) => `${tableLabel(u.table)} “${u.label}”`).join(", ")}. Deleting it will show a broken image there. Delete anyway?`
              : `${toDelete.item.name} isn't used anywhere on the site. Its link will stop working. This can't be undone.`
            : ""
        }
        confirmLabel={toDelete?.used.length ? "Delete anyway" : "Delete"}
        busy={deleting}
        onConfirm={() => void confirmDelete()}
        onClose={() => setToDelete(null)}
      />
      <Toast message={toast?.msg ?? null} severity={toast?.sev} onClose={() => setToast(null)} />
    </Box>
  );
}
