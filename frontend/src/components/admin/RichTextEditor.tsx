"use client";

import { useEffect, useRef, useState } from "react";
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { Color, TextStyle } from "@tiptap/extension-text-style";
import Highlight from "@tiptap/extension-highlight";
import { TableKit } from "@tiptap/extension-table";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import FormControlLabel from "@mui/material/FormControlLabel";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import Popover from "@mui/material/Popover";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import FormatBoldRoundedIcon from "@mui/icons-material/FormatBoldRounded";
import FormatItalicRoundedIcon from "@mui/icons-material/FormatItalicRounded";
import FormatUnderlinedRoundedIcon from "@mui/icons-material/FormatUnderlinedRounded";
import StrikethroughSRoundedIcon from "@mui/icons-material/StrikethroughSRounded";
import FormatListBulletedRoundedIcon from "@mui/icons-material/FormatListBulletedRounded";
import FormatListNumberedRoundedIcon from "@mui/icons-material/FormatListNumberedRounded";
import FormatQuoteRoundedIcon from "@mui/icons-material/FormatQuoteRounded";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import LinkOffRoundedIcon from "@mui/icons-material/LinkOffRounded";
import ImageRoundedIcon from "@mui/icons-material/ImageRounded";
import HorizontalRuleRoundedIcon from "@mui/icons-material/HorizontalRuleRounded";
import FormatClearRoundedIcon from "@mui/icons-material/FormatClearRounded";
import UndoRoundedIcon from "@mui/icons-material/UndoRounded";
import RedoRoundedIcon from "@mui/icons-material/RedoRounded";
import FormatColorTextRoundedIcon from "@mui/icons-material/FormatColorTextRounded";
import BorderColorRoundedIcon from "@mui/icons-material/BorderColorRounded";
import FormatColorResetRoundedIcon from "@mui/icons-material/FormatColorResetRounded";
import ClosedCaptionRoundedIcon from "@mui/icons-material/ClosedCaptionRounded";
import { api, mediaUrl } from "@/lib/api";
import { errorMessage } from "@/lib/useResource";
import { richContentSx } from "@/components/common/richContentSx";
import { BORDER, Field, LIME } from "./ui";
import AltTextField, { ALT_TEXT_MAX } from "./AltTextField";

type BlockType = "paragraph" | "h2" | "h3" | "h4";

const BLOCKS: { value: BlockType; label: string }[] = [
  { value: "paragraph", label: "Paragraph" },
  { value: "h2", label: "Heading 2" },
  { value: "h3", label: "Heading 3" },
  { value: "h4", label: "Heading 4" },
];

/** Accept "example.com" as well as full URLs, site paths, mailto: and tel:. */
function normaliseUrl(raw: string): string {
  const url = raw.trim();
  if (!url) return "";
  if (/^(https?:|mailto:|tel:)/i.test(url) || url.startsWith("/") || url.startsWith("#")) {
    return url;
  }
  return `https://${url}`;
}

function ToolButton({
  title,
  active,
  disabled,
  onClick,
  children,
}: {
  title: string;
  active?: boolean;
  disabled?: boolean;
  onClick: (e: React.MouseEvent<HTMLElement>) => void;
  children: React.ReactNode;
}) {
  return (
    <Tooltip title={title} arrow>
      {/* span keeps the tooltip working while the button is disabled */}
      <span>
        <IconButton
          size="small"
          aria-label={title}
          aria-pressed={active}
          disabled={disabled}
          // mousedown would steal focus from the editor and drop the selection
          onMouseDown={(e) => e.preventDefault()}
          onClick={onClick}
          sx={{
            borderRadius: "8px",
            color: active ? "#0a0a0a" : "rgba(255,255,255,0.7)",
            bgcolor: active ? LIME : "transparent",
            "&:hover": { bgcolor: active ? LIME : "rgba(255,255,255,0.08)" },
            "&.Mui-disabled": { color: "rgba(255,255,255,0.2)" },
            "& svg": { fontSize: 19 },
          }}
        >
          {children}
        </IconButton>
      </span>
    </Tooltip>
  );
}

const dialogPaperSx = {
  bgcolor: "#121312",
  color: "#fff",
  borderRadius: "16px",
  border: BORDER,
  backgroundImage: "none",
};

/**
 * Text colours picked to stay readable on the site's dark article background;
 * highlight colours are light, and highlighted text is drawn dark (see
 * .rich-content mark in globals.css).
 */
const TEXT_COLORS = [
  { name: "Lime", value: "#c8ff00" },
  { name: "White", value: "#ffffff" },
  { name: "Grey", value: "#a3a3a3" },
  { name: "Sky", value: "#4dd9ff" },
  { name: "Green", value: "#4ade80" },
  { name: "Yellow", value: "#facc15" },
  { name: "Orange", value: "#fb923c" },
  { name: "Red", value: "#f87171" },
  { name: "Pink", value: "#f472b6" },
  { name: "Violet", value: "#a78bfa" },
];

const HIGHLIGHT_COLORS = [
  { name: "Yellow", value: "#fde047" },
  { name: "Lime", value: "#c8ff00" },
  { name: "Green", value: "#86efac" },
  { name: "Sky", value: "#67e8f9" },
  { name: "Pink", value: "#f9a8d4" },
  { name: "Orange", value: "#fdba74" },
];

function ColorMenu({
  anchor,
  onClose,
  title,
  colors,
  current,
  onPick,
  onClear,
  clearLabel,
}: {
  anchor: HTMLElement | null;
  onClose: () => void;
  title: string;
  colors: { name: string; value: string }[];
  current: string | null;
  onPick: (value: string) => void;
  onClear: () => void;
  clearLabel: string;
}) {
  return (
    <Popover
      open={!!anchor}
      anchorEl={anchor}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      slotProps={{ paper: { sx: { mt: 0.5, p: 1.5, bgcolor: "#141514", color: "#fff", border: BORDER, borderRadius: "12px", width: 232 } } }}
    >
      <Typography sx={{ fontSize: 11.5, fontWeight: 800, letterSpacing: 0.6, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", mb: 1 }}>
        {title}
      </Typography>
      <Box role="listbox" aria-label={title} sx={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 0.75 }}>
        {colors.map((c) => {
          const selected = (current || "").toLowerCase() === c.value;
          return (
            <Tooltip key={c.value} title={c.name}>
              <Box
                component="button"
                type="button"
                role="option"
                aria-selected={selected}
                aria-label={c.name}
                onMouseDown={(e: React.MouseEvent) => e.preventDefault()}
                onClick={() => onPick(c.value)}
                sx={{
                  width: 34,
                  height: 34,
                  borderRadius: "8px",
                  bgcolor: c.value,
                  cursor: "pointer",
                  border: selected ? "2px solid #fff" : "1px solid rgba(255,255,255,0.18)",
                  outline: selected ? `2px solid ${c.value}` : "none",
                  outlineOffset: 1,
                  "&:hover": { transform: "scale(1.08)" },
                  transition: "transform .15s",
                }}
              />
            </Tooltip>
          );
        })}
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1.5 }}>
        <Box
          component="label"
          sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1, fontSize: 12.5, color: "rgba(255,255,255,0.7)", cursor: "pointer" }}
        >
          <Box
            component="input"
            type="color"
            aria-label={`Custom ${title.toLowerCase()}`}
            value={current && /^#[0-9a-f]{6}$/i.test(current) ? current : colors[0].value}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onPick(e.target.value)}
            sx={{ width: 28, height: 28, p: 0, border: "none", bgcolor: "transparent", cursor: "pointer" }}
          />
          Custom
        </Box>
        <Button
          size="small"
          onMouseDown={(e) => e.preventDefault()}
          onClick={onClear}
          startIcon={<FormatColorResetRoundedIcon sx={{ fontSize: 16 }} />}
          sx={{ color: "rgba(255,255,255,0.7)", textTransform: "none", fontSize: 12.5 }}
        >
          {clearLabel}
        </Button>
      </Box>
    </Popover>
  );
}

/** "Describe this image": asked after an upload and from the toolbar for an existing image. */
function ImageAltDialog({
  open,
  src,
  initial,
  title,
  confirmLabel,
  onConfirm,
  onClose,
}: {
  open: boolean;
  src: string | null;
  initial: string;
  title: string;
  confirmLabel: string;
  onConfirm: (alt: string) => void;
  onClose: () => void;
}) {
  const [alt, setAlt] = useState(initial);
  // Reset to the new image's value each time the dialog opens.
  const [openedFor, setOpenedFor] = useState<string | null>(null);
  const key = open ? `${src}|${initial}` : null;
  if (key !== openedFor) {
    setOpenedFor(key);
    if (open) setAlt(initial);
  }
  const tooLong = alt.trim().length > ALT_TEXT_MAX;
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs" slotProps={{ paper: { sx: dialogPaperSx } }}>
      <DialogTitle sx={{ fontWeight: 800, fontSize: 17 }}>{title}</DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "8px !important" }}>
        {src && (
          <Box
            component="img"
            src={mediaUrl(src)}
            alt=""
            sx={{ width: "100%", maxHeight: 180, objectFit: "contain", borderRadius: "10px", bgcolor: "rgba(0,0,0,0.3)" }}
          />
        )}
        <AltTextField label="Alt text" value={alt} onChange={setAlt} fallback="no description (not recommended)" />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} sx={{ color: "rgba(255,255,255,0.6)", textTransform: "none" }}>
          Cancel
        </Button>
        <Button
          onClick={() => onConfirm(alt.trim())}
          disabled={tooLong}
          disableElevation
          sx={{ bgcolor: LIME, color: "#0a0a0a", fontWeight: 800, textTransform: "none", borderRadius: "10px", px: 2.5, "&:hover": { bgcolor: "#d4ff33" } }}
        >
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function Toolbar({
  editor,
  onUploadImage,
  uploading,
}: {
  editor: Editor;
  onUploadImage: () => void;
  uploading: boolean;
}) {
  // TipTap v3 no longer re-renders on every keystroke, so read the active
  // marks through useEditorState to keep the toolbar highlighting in sync.
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      block: (e.isActive("heading", { level: 2 })
        ? "h2"
        : e.isActive("heading", { level: 3 })
          ? "h3"
          : e.isActive("heading", { level: 4 })
            ? "h4"
            : "paragraph") as BlockType,
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      underline: e.isActive("underline"),
      strike: e.isActive("strike"),
      bullet: e.isActive("bulletList"),
      ordered: e.isActive("orderedList"),
      quote: e.isActive("blockquote"),
      link: e.isActive("link"),
      image: e.isActive("image"),
      imageSrc: e.isActive("image") ? ((e.getAttributes("image").src as string | undefined) ?? null) : null,
      imageAlt: e.isActive("image") ? ((e.getAttributes("image").alt as string | undefined) ?? "") : "",
      color: (e.getAttributes("textStyle").color as string | undefined) ?? null,
      highlight: e.isActive("highlight")
        ? ((e.getAttributes("highlight").color as string | undefined) ?? HIGHLIGHT_COLORS[0].value)
        : null,
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
    }),
  });

  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkNewTab, setLinkNewTab] = useState(false);
  const [imageMenu, setImageMenu] = useState<null | HTMLElement>(null);
  const [imageUrlOpen, setImageUrlOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [colorMenu, setColorMenu] = useState<null | HTMLElement>(null);
  const [altOpen, setAltOpen] = useState(false);
  const [highlightMenu, setHighlightMenu] = useState<null | HTMLElement>(null);

  const setBlock = (value: BlockType) => {
    const chain = editor.chain().focus();
    if (value === "paragraph") chain.setParagraph().run();
    else chain.toggleHeading({ level: Number(value.slice(1)) as 2 | 3 | 4 }).run();
  };

  const openLinkDialog = () => {
    const attrs = editor.getAttributes("link") as { href?: string; target?: string };
    setLinkUrl(attrs.href ?? "");
    setLinkNewTab(attrs.target === "_blank");
    setLinkOpen(true);
  };

  const applyLink = () => {
    const href = normaliseUrl(linkUrl);
    if (!href) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href, target: linkNewTab ? "_blank" : null })
        .run();
      // Put the cursor after the link. Left selected, the next keystroke would
      // replace the link text. And because autolink makes links "inclusive",
      // also drop the pending link mark so continued typing isn't linked too.
      const { to } = editor.state.selection;
      editor.chain().focus().setTextSelection(to).unsetMark("link").run();
    }
    setLinkOpen(false);
  };

  const insertImageFromUrl = () => {
    const src = normaliseUrl(imageUrl);
    if (src) {
      editor.chain().focus().setImage({ src, alt: imageAlt.trim() || undefined }).run();
    }
    setImageUrlOpen(false);
    setImageUrl("");
    setImageAlt("");
  };

  return (
    <>
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 2,
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 0.4,
          p: 1,
          bgcolor: "#161716",
          borderBottom: BORDER,
          borderTopLeftRadius: "12px",
          borderTopRightRadius: "12px",
        }}
      >
        <Select
          size="small"
          value={state.block}
          onChange={(e) => setBlock(e.target.value as BlockType)}
          aria-label="Text style"
          sx={{
            minWidth: 128,
            height: 32,
            mr: 0.5,
            color: "#fff",
            fontSize: 13,
            borderRadius: "8px",
            bgcolor: "rgba(255,255,255,0.04)",
            "& fieldset": { borderColor: "rgba(255,255,255,0.14)" },
            "& .MuiSvgIcon-root": { color: "rgba(255,255,255,0.5)" },
          }}
          MenuProps={{
            slotProps: {
              paper: { sx: { bgcolor: "#141514", color: "#fff", border: BORDER } },
            },
          }}
        >
          {BLOCKS.map((b) => (
            <MenuItem key={b.value} value={b.value} sx={{ fontSize: 13 }}>
              {b.label}
            </MenuItem>
          ))}
        </Select>

        <ToolButton title="Bold (Ctrl+B)" active={state.bold} onClick={() => editor.chain().focus().toggleBold().run()}>
          <FormatBoldRoundedIcon />
        </ToolButton>
        <ToolButton title="Italic (Ctrl+I)" active={state.italic} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <FormatItalicRoundedIcon />
        </ToolButton>
        <ToolButton title="Underline (Ctrl+U)" active={state.underline} onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <FormatUnderlinedRoundedIcon />
        </ToolButton>
        <ToolButton title="Strikethrough" active={state.strike} onClick={() => editor.chain().focus().toggleStrike().run()}>
          <StrikethroughSRoundedIcon />
        </ToolButton>
        <ToolButton title="Text colour" active={!!state.color} onClick={(e) => setColorMenu(e.currentTarget)}>
          <Box sx={{ position: "relative", display: "flex" }}>
            <FormatColorTextRoundedIcon />
            <Box sx={{ position: "absolute", left: 2, right: 2, bottom: -1, height: 3, borderRadius: 2, bgcolor: state.color || "rgba(255,255,255,0.35)" }} />
          </Box>
        </ToolButton>
        <ToolButton title="Highlight" active={!!state.highlight} onClick={(e) => setHighlightMenu(e.currentTarget)}>
          <Box sx={{ position: "relative", display: "flex" }}>
            <BorderColorRoundedIcon />
            <Box sx={{ position: "absolute", left: 2, right: 2, bottom: -1, height: 3, borderRadius: 2, bgcolor: state.highlight || "rgba(255,255,255,0.35)" }} />
          </Box>
        </ToolButton>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5, borderColor: "rgba(255,255,255,0.1)" }} />

        <ToolButton title="Bullet list" active={state.bullet} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <FormatListBulletedRoundedIcon />
        </ToolButton>
        <ToolButton title="Numbered list" active={state.ordered} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <FormatListNumberedRoundedIcon />
        </ToolButton>
        <ToolButton title="Quote" active={state.quote} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          <FormatQuoteRoundedIcon />
        </ToolButton>
        <ToolButton title="Divider line" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          <HorizontalRuleRoundedIcon />
        </ToolButton>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5, borderColor: "rgba(255,255,255,0.1)" }} />

        <ToolButton title={state.link ? "Edit link" : "Add link"} active={state.link} onClick={openLinkDialog}>
          <LinkRoundedIcon />
        </ToolButton>
        <ToolButton
          title="Remove link"
          disabled={!state.link}
          onClick={() => editor.chain().focus().extendMarkRange("link").unsetLink().run()}
        >
          <LinkOffRoundedIcon />
        </ToolButton>
        <ToolButton
          title="Insert image"
          disabled={uploading}
          onClick={(e) => setImageMenu(e.currentTarget)}
        >
          {uploading ? <CircularProgress size={16} sx={{ color: LIME }} /> : <ImageRoundedIcon />}
        </ToolButton>
        <ToolButton
          title={state.image ? "Image alt text" : "Image alt text (select an image first)"}
          active={state.image}
          disabled={!state.image}
          onClick={() => setAltOpen(true)}
        >
          <ClosedCaptionRoundedIcon />
        </ToolButton>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5, borderColor: "rgba(255,255,255,0.1)" }} />

        <ToolButton
          title="Clear formatting"
          onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
        >
          <FormatClearRoundedIcon />
        </ToolButton>
        <ToolButton title="Undo (Ctrl+Z)" disabled={!state.canUndo} onClick={() => editor.chain().focus().undo().run()}>
          <UndoRoundedIcon />
        </ToolButton>
        <ToolButton title="Redo (Ctrl+Shift+Z)" disabled={!state.canRedo} onClick={() => editor.chain().focus().redo().run()}>
          <RedoRoundedIcon />
        </ToolButton>
      </Box>

      <ColorMenu
        anchor={colorMenu}
        onClose={() => setColorMenu(null)}
        title="Text colour"
        colors={TEXT_COLORS}
        current={state.color}
        onPick={(value) => {
          editor.chain().focus().setColor(value).run();
          setColorMenu(null);
        }}
        onClear={() => {
          editor.chain().focus().unsetColor().run();
          setColorMenu(null);
        }}
        clearLabel="Default"
      />
      <ColorMenu
        anchor={highlightMenu}
        onClose={() => setHighlightMenu(null)}
        title="Highlight"
        colors={HIGHLIGHT_COLORS}
        current={state.highlight}
        onPick={(value) => {
          editor.chain().focus().setHighlight({ color: value }).run();
          setHighlightMenu(null);
        }}
        onClear={() => {
          editor.chain().focus().unsetHighlight().run();
          setHighlightMenu(null);
        }}
        clearLabel="None"
      />

      <Menu
        anchorEl={imageMenu}
        open={!!imageMenu}
        onClose={() => setImageMenu(null)}
        slotProps={{ paper: { sx: { bgcolor: "#141514", color: "#fff", border: BORDER } } }}
      >
        <MenuItem
          sx={{ fontSize: 13.5 }}
          onClick={() => {
            setImageMenu(null);
            onUploadImage();
          }}
        >
          Upload from computer
        </MenuItem>
        <MenuItem
          sx={{ fontSize: 13.5 }}
          onClick={() => {
            setImageMenu(null);
            setImageUrlOpen(true);
          }}
        >
          Insert from URL
        </MenuItem>
      </Menu>

      {/* ---- link dialog ---- */}
      <Dialog open={linkOpen} onClose={() => setLinkOpen(false)} fullWidth maxWidth="xs" slotProps={{ paper: { sx: dialogPaperSx } }}>
        <DialogTitle sx={{ fontWeight: 800, fontSize: 17 }}>
          {state.link ? "Edit link" : "Add link"}
        </DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 1.5, pt: "8px !important" }}>
          <Field
            autoFocus
            label="URL"
            placeholder="https://example.com or /contact"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                applyLink();
              }
            }}
            helperText="Leave empty to remove the link"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={linkNewTab}
                onChange={(e) => setLinkNewTab(e.target.checked)}
                sx={{ color: "rgba(255,255,255,0.4)", "&.Mui-checked": { color: LIME } }}
              />
            }
            label={<Typography sx={{ fontSize: 13.5 }}>Open in a new tab</Typography>}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setLinkOpen(false)} sx={{ color: "rgba(255,255,255,0.6)", textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            onClick={applyLink}
            disableElevation
            sx={{ bgcolor: LIME, color: "#0a0a0a", fontWeight: 800, textTransform: "none", borderRadius: "10px", px: 2.5, "&:hover": { bgcolor: "#d4ff33" } }}
          >
            Apply
          </Button>
        </DialogActions>
      </Dialog>

      {/* ---- image-from-URL dialog ---- */}
      <Dialog open={imageUrlOpen} onClose={() => setImageUrlOpen(false)} fullWidth maxWidth="xs" slotProps={{ paper: { sx: dialogPaperSx } }}>
        <DialogTitle sx={{ fontWeight: 800, fontSize: 17 }}>Insert image from URL</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "8px !important" }}>
          <Field
            autoFocus
            label="Image URL"
            placeholder="https://… or /images/…"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
          <AltTextField label="Alt text" value={imageAlt} onChange={setImageAlt} fallback="no description (not recommended)" />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setImageUrlOpen(false)} sx={{ color: "rgba(255,255,255,0.6)", textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            onClick={insertImageFromUrl}
            disabled={!imageUrl.trim() || imageAlt.trim().length > ALT_TEXT_MAX}
            disableElevation
            sx={{ bgcolor: LIME, color: "#0a0a0a", fontWeight: 800, textTransform: "none", borderRadius: "10px", px: 2.5, "&:hover": { bgcolor: "#d4ff33" } }}
          >
            Insert
          </Button>
        </DialogActions>
      </Dialog>

      {/* ---- alt text for the selected image ---- */}
      <ImageAltDialog
        open={altOpen}
        src={state.imageSrc}
        initial={state.imageAlt}
        title="Image alt text"
        confirmLabel="Save"
        onClose={() => setAltOpen(false)}
        onConfirm={(alt) => {
          editor.chain().focus().updateAttributes("image", { alt: alt || null }).run();
          setAltOpen(false);
        }}
      />
    </>
  );
}

/** Images in the HTML with no (or an empty) alt attribute. */
function imagesMissingAlt(html: string): number {
  return (html.match(/<img\b[^>]*>/gi) || []).filter((tag) => !/\balt="[^"]*\S[^"]*"/i.test(tag)).length;
}

export default function RichTextEditor({
  label,
  value,
  onChange,
  placeholder = "Start writing…",
  helperText,
  minHeight = 280,
}: {
  label?: string;
  /** HTML. An empty string means an empty document. */
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  helperText?: string;
  minHeight?: number;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  // The last HTML this editor emitted, so external `value` changes (switching
  // to another record) can be told apart from the editor's own keystrokes.
  const lastEmitted = useRef(value);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  // An uploaded image waiting for its description before being inserted.
  const [pending, setPending] = useState<{ src: string; alt: string } | null>(null);

  const editor = useEditor({
    // Render on the client only: server-rendering the editor produces markup
    // that does not match the hydrated DOM and Next reports a mismatch.
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        link: {
          openOnClick: false,
          autolink: true,
          HTMLAttributes: { rel: "noopener noreferrer" },
        },
      }),
      // Base64 images would bloat the database row; the backend also strips
      // data: URLs. Images go through the upload endpoint instead.
      Image.configure({ allowBase64: false }),
      // Text colour (<span style="color: ...">) and multi-colour highlight
      // (<mark style="background-color: ...">). The backend keeps exactly
      // these two style properties and drops any other inline style.
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      // Tables pasted from Word, Excel, Google Docs/Sheets or web pages keep
      // their rows and columns (without this they collapse into plain text).
      TableKit.configure({ table: { resizable: false } }),
      Placeholder.configure({ placeholder }),
    ],
    content: value || "",
    onUpdate: ({ editor: e }) => {
      const html = e.isEmpty ? "" : e.getHTML();
      lastEmitted.current = html;
      onChange(html);
    },
  });

  useEffect(() => {
    if (!editor || value === lastEmitted.current) return;
    editor.commands.setContent(value || "", { emitUpdate: false });
    lastEmitted.current = value;
  }, [value, editor]);

  const uploadImage = async (file: File) => {
    setUploadError(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { url } = await api.post<{ url: string }>("/api/uploads/image", fd);
      // Suggest a description from the file name; the admin confirms or edits it.
      const suggested = file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();
      setPending({ src: url, alt: /^(img|image|dsc|photo|screenshot)?\s*\d*$/i.test(suggested) ? "" : suggested });
    } catch (e) {
      setUploadError(errorMessage(e));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <Box>
      {label && (
        <Typography sx={{ fontSize: 13, color: "rgba(255,255,255,0.6)", mb: 1 }}>{label}</Typography>
      )}

      <Box
        sx={{
          borderRadius: "12px",
          border: "1px solid rgba(255,255,255,0.14)",
          bgcolor: "rgba(255,255,255,0.03)",
          transition: "border-color .2s",
          "&:focus-within": { borderColor: LIME },
        }}
      >
        {editor ? (
          <Toolbar editor={editor} uploading={uploading} onUploadImage={() => fileRef.current?.click()} />
        ) : (
          <Box sx={{ height: 49, borderBottom: BORDER }} />
        )}

        <Box
          className="rich-content"
          sx={{
            ...richContentSx("blog"),
            "& .ProseMirror": {
              minHeight,
              px: 2.5,
              py: 2,
              outline: "none",
              color: "rgba(255,255,255,0.85)",
            },
            "& .ProseMirror p.is-editor-empty:first-of-type::before": {
              content: "attr(data-placeholder)",
              float: "left",
              height: 0,
              pointerEvents: "none",
              color: "rgba(255,255,255,0.3)",
            },
            // Images without a description stand out until one is added.
            "& .ProseMirror img:not([alt]), & .ProseMirror img[alt='']": {
              outline: "2px dashed #fb923c",
              outlineOffset: 3,
            },
            "& .ProseMirror img.ProseMirror-selectednode": {
              outline: `2px solid ${LIME}`,
              outlineOffset: 2,
            },
          }}
        >
          <EditorContent editor={editor} />
        </Box>
      </Box>

      {imagesMissingAlt(value) > 0 && (
        <Typography role="status" sx={{ fontSize: 12.5, color: "#fb923c", mt: 0.75 }}>
          {imagesMissingAlt(value) === 1 ? "1 image has" : `${imagesMissingAlt(value)} images have`} no alt text
          (outlined in orange). Click the image, then use the Image alt text button in the toolbar.
        </Typography>
      )}

      <ImageAltDialog
        open={!!pending}
        src={pending?.src ?? null}
        initial={pending?.alt ?? ""}
        title="Describe this image"
        confirmLabel="Insert image"
        onClose={() => setPending(null)}
        onConfirm={(alt) => {
          if (pending) editor?.chain().focus().setImage({ src: pending.src, alt: alt || undefined }).run();
          setPending(null);
        }}
      />

      {uploadError && (
        <Typography sx={{ fontSize: 12.5, color: "#ff8a8a", mt: 0.75 }}>
          Image upload failed: {uploadError}
        </Typography>
      )}
      {helperText && !uploadError && (
        <Typography sx={{ fontSize: 12, color: "rgba(255,255,255,0.4)", mt: 0.75 }}>{helperText}</Typography>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void uploadImage(f);
        }}
      />
    </Box>
  );
}
