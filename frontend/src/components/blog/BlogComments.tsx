"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ReplyRoundedIcon from "@mui/icons-material/ReplyRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";

const LIME = "#c8ff00";
const EASE = [0.22, 1, 0.36, 1] as const;

type Comment = {
  id: string;
  name: string;
  date: string;
  text: string;
  replies?: Comment[];
};

// TODO: API — initial comments backend se aayenge (props ya fetch se)
const INITIAL: Comment[] = [
  {
    id: "1",
    name: "Cameron Williamson",
    date: "3 hours ago",
    text: "Great breakdown — the point about consistency over one-off performance really lands. This is exactly what we look for in a carrier.",
    replies: [
      {
        id: "1-1",
        name: "Robert Fox",
        date: "2 hours ago",
        text: "Appreciate that, Cameron. Consistency is everything — one good load means nothing if the next three are late.",
      },
    ],
  },
  {
    id: "2",
    name: "Jons Kihan",
    date: "2 hours ago",
    text: "Real-time tracking has genuinely changed our expectations. Hard to go back once you've had full visibility.",
  },
];

const AVATAR_COLORS = ["#c8ff00", "#00e5ff", "#ff4dd8", "#ffb340", "#a78bfa"];
const colorFor = (name: string) =>
  AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
const initials = (name: string) =>
  name
    .trim()
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
const countAll = (list: Comment[]): number =>
  list.reduce((n, c) => n + 1 + (c.replies ? countAll(c.replies) : 0), 0);

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    color: "#fff",
    borderRadius: "12px",
    bgcolor: "rgba(255,255,255,0.04)",
    fontSize: 14,
    "& fieldset": { borderColor: "rgba(255,255,255,0.14)" },
    "&:hover fieldset": { borderColor: "rgba(255,255,255,0.3)" },
    "&.Mui-focused fieldset": { borderColor: LIME },
  },
  "& input::placeholder, & textarea::placeholder": {
    color: "rgba(255,255,255,0.4)",
    opacity: 1,
  },
} as const;

/* ---------- reusable form (main + reply) ---------- */
function CommentForm({
  compact = false,
  onSubmit,
  onCancel,
}: {
  compact?: boolean;
  onSubmit: (data: { name: string; email: string; text: string }) => void;
  onCancel?: () => void;
}) {
  const [form, setForm] = useState({ name: "", email: "", text: "" });

  const handle = () => {
    if (!form.name.trim() || !form.email.includes("@") || !form.text.trim())
      return;
    onSubmit(form);
    setForm({ name: "", email: "", text: "" });
  };

  return (
    <Box>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          gap: 1.5,
        }}
      >
        <TextField
          fullWidth
          size="small"
          placeholder="Name *"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          sx={fieldSx}
        />
        <TextField
          fullWidth
          size="small"
          type="email"
          placeholder="Email *"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          sx={fieldSx}
        />
        <Box sx={{ gridColumn: { sm: "span 2" } }}>
          <TextField
            fullWidth
            multiline
            minRows={compact ? 2 : 4}
            placeholder="Message *"
            value={form.text}
            onChange={(e) => setForm({ ...form, text: e.target.value })}
            sx={fieldSx}
          />
        </Box>
      </Box>
      <Box sx={{ display: "flex", gap: 1.5, mt: 2 }}>
        <Button
          onClick={handle}
          disableElevation
          sx={{
            bgcolor: LIME,
            color: "#0a0a0a",
            fontWeight: 800,
            borderRadius: "12px",
            px: 3.5,
            py: 1.1,
            textTransform: "none",
            fontSize: 14,
            "&:hover": { bgcolor: "#d4ff33" },
          }}
        >
          {compact ? "Post Reply" : "Post Comment"}
        </Button>
        {onCancel && (
          <Button
            onClick={onCancel}
            startIcon={<CloseRoundedIcon />}
            sx={{
              color: "rgba(255,255,255,0.6)",
              fontWeight: 700,
              borderRadius: "12px",
              px: 2,
              textTransform: "none",
              fontSize: 14,
              "&:hover": { color: "#fff", bgcolor: "rgba(255,255,255,0.06)" },
            }}
          >
            Cancel
          </Button>
        )}
      </Box>
    </Box>
  );
}

/* ---------- single comment (recursive for replies) ---------- */
function CommentItem({
  comment,
  depth,
  replyingTo,
  setReplyingTo,
  onReply,
}: {
  comment: Comment;
  depth: number;
  replyingTo: string | null;
  setReplyingTo: (id: string | null) => void;
  onReply: (
    parentId: string,
    data: { name: string; email: string; text: string },
  ) => void;
}) {
  const isReplying = replyingTo === comment.id;

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: EASE }}
      sx={{
        ...(depth > 0 && {
          ml: { xs: 2.5, md: 5 },
          pl: { xs: 2, md: 3 },
          borderLeft: `2px solid ${LIME}22`,
        }),
      }}
    >
      <Box
        sx={{
          p: { xs: 2.5, md: 3 },
          borderRadius: "16px",
          bgcolor: depth > 0 ? "#0d0d0d" : "#101010",
          border: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          gap: 2,
        }}
      >
        {/* avatar */}
        <Box
          sx={{
            width: 46,
            height: 46,
            borderRadius: "50%",
            flexShrink: 0,
            bgcolor: `${colorFor(comment.name)}22`,
            color: colorFor(comment.name),
            border: `1px solid ${colorFor(comment.name)}44`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 800,
            fontSize: 15,
          }}
        >
          {initials(comment.name)}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1,
              mb: 0.6,
              flexWrap: "wrap",
            }}
          >
            <Typography sx={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>
              {comment.name}
            </Typography>
            <Typography sx={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
              {comment.date}
            </Typography>
          </Box>
          <Typography
            sx={{
              fontSize: 14,
              color: "rgba(255,255,255,0.65)",
              lineHeight: 1.7,
              mb: 1,
            }}
          >
            {comment.text}
          </Typography>

          {/* reply button (nesting sirf 1 level tak — thread saaf rehta hai) */}
          {depth < 1 && (
            <Button
              onClick={() => setReplyingTo(isReplying ? null : comment.id)}
              startIcon={<ReplyRoundedIcon sx={{ fontSize: 16 }} />}
              sx={{
                color: isReplying ? LIME : "rgba(255,255,255,0.55)",
                fontWeight: 700,
                fontSize: 12.5,
                textTransform: "none",
                p: 0,
                minWidth: 0,
                "&:hover": { color: LIME, bgcolor: "transparent" },
              }}
            >
              {isReplying ? "Cancel" : "Reply"}
            </Button>
          )}
        </Box>
      </Box>

      {/* inline reply form */}
      <AnimatePresence>
        {isReplying && (
          <Box
            component={motion.div}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            sx={{ overflow: "hidden", ml: { xs: 2.5, md: 5 }, mt: 1.5 }}
          >
            <Box
              sx={{
                p: { xs: 2, md: 2.5 },
                borderRadius: "14px",
                bgcolor: "#0d0d0d",
                border: `1px solid ${LIME}22`,
              }}
            >
              <Typography
                sx={{ fontSize: 12.5, color: "rgba(255,255,255,0.5)", mb: 1.5 }}
              >
                Replying to{" "}
                <Box component="span" sx={{ color: LIME, fontWeight: 700 }}>
                  {comment.name}
                </Box>
              </Typography>
              <CommentForm
                compact
                onSubmit={(data) => onReply(comment.id, data)}
                onCancel={() => setReplyingTo(null)}
              />
            </Box>
          </Box>
        )}
      </AnimatePresence>

      {/* nested replies */}
      {comment.replies && comment.replies.length > 0 && (
        <Box
          sx={{ mt: 1.5, display: "flex", flexDirection: "column", gap: 1.5 }}
        >
          {comment.replies.map((r) => (
            <CommentItem
              key={r.id}
              comment={r}
              depth={depth + 1}
              replyingTo={replyingTo}
              setReplyingTo={setReplyingTo}
              onReply={onReply}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}

/* ---------- main ---------- */
export default function BlogComments({ postSlug }: { postSlug: string }) {
  const [comments, setComments] = useState<Comment[]>(INITIAL);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const [sent, setSent] = useState(false);

  const flash = () => {
    setSent(true);
    setTimeout(() => setSent(false), 3500);
  };

  // top-level comment add
  const addComment = (data: { name: string; email: string; text: string }) => {
    // TODO: API — POST /api/blog/${postSlug}/comments  { ...data }
    const newC: Comment = {
      id: String(Date.now()),
      name: data.name,
      date: "Just now",
      text: data.text,
      replies: [],
    };
    setComments((c) => [...c, newC]);
    flash();
  };

  // reply add (nested under parentId)
  const addReply = (
    parentId: string,
    data: { name: string; email: string; text: string },
  ) => {
    // TODO: API — POST /api/blog/${postSlug}/comments  { ...data, parentId }
    const reply: Comment = {
      id: `${parentId}-${Date.now()}`,
      name: data.name,
      date: "Just now",
      text: data.text,
    };
    setComments((list) =>
      list.map((c) =>
        c.id === parentId
          ? { ...c, replies: [...(c.replies || []), reply] }
          : c,
      ),
    );
    setReplyingTo(null);
    flash();
  };

  const ordered = sort === "newest" ? [...comments].reverse() : comments;
  const total = countAll(comments);

  return (
    <Box sx={{ mt: 6 }}>
      {/* header + sort */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          mb: 3,
          flexWrap: "wrap",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
          <ChatBubbleOutlineRoundedIcon sx={{ color: LIME, fontSize: 22 }} />
          <Typography
            component="h2"
            sx={{
              fontSize: { xs: "1.4rem", md: "1.7rem" },
              fontWeight: 800,
              color: "#fff",
            }}
          >
            {total} Comment{total !== 1 ? "s" : ""}
          </Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            gap: 0.5,
            p: 0.5,
            borderRadius: "999px",
            bgcolor: "#101010",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {(["newest", "oldest"] as const).map((s) => (
            <Box
              key={s}
              component="button"
              onClick={() => setSort(s)}
              sx={{
                px: 1.8,
                py: 0.6,
                borderRadius: "999px",
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: 12,
                fontWeight: 700,
                textTransform: "capitalize",
                transition: "all .2s",
                bgcolor: sort === s ? LIME : "transparent",
                color: sort === s ? "#0a0a0a" : "rgba(255,255,255,0.6)",
              }}
            >
              {s}
            </Box>
          ))}
        </Box>
      </Box>

      {/* list */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 6 }}>
        <AnimatePresence initial={false}>
          {ordered.map((c) => (
            <CommentItem
              key={c.id}
              comment={c}
              depth={0}
              replyingTo={replyingTo}
              setReplyingTo={setReplyingTo}
              onReply={addReply}
            />
          ))}
        </AnimatePresence>
      </Box>

      {/* leave a reply */}
      <Typography
        component="h2"
        sx={{
          fontSize: { xs: "1.4rem", md: "1.7rem" },
          fontWeight: 800,
          color: "#fff",
          mb: 1,
        }}
      >
        Leave a Reply
      </Typography>
      <Typography sx={{ fontSize: 13, color: "rgba(255,255,255,0.5)", mb: 3 }}>
        Your email address will not be published. Required fields are marked *
      </Typography>

      <AnimatePresence>
        {sent && (
          <Box
            component={motion.div}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.2,
              mb: 2.5,
              p: 2,
              borderRadius: "12px",
              bgcolor: "rgba(200,255,0,0.08)",
              border: `1px solid ${LIME}44`,
            }}
          >
            <CheckCircleRoundedIcon sx={{ color: LIME, fontSize: 20 }} />
            <Typography sx={{ fontSize: 14, color: "rgba(255,255,255,0.85)" }}>
              Thanks! Your comment has been posted.
            </Typography>
          </Box>
        )}
      </AnimatePresence>

      <CommentForm onSubmit={addComment} />
    </Box>
  );
}
