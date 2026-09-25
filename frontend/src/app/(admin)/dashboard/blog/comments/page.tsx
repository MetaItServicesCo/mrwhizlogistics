"use client";

import { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { api } from "@/lib/api";
import { errorMessage, useAction, useResource } from "@/lib/useResource";
import type { BlogComment, BlogPost } from "@/lib/types";
import DataTable, { type Column } from "@/components/admin/DataTable";
import {
  ConfirmDialog,
  Field,
  FormDialog,
  PageHeader,
  SearchBox,
  Toast,
  fmtDateTime,
} from "@/components/admin/ui";

export default function BlogCommentsPage() {
  const { items, loading, error, reload } = useResource<BlogComment>(
    "/api/blogs/comments/all",
  );

  // Posts are loaded separately so each comment can show which article it is on.
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [postsError, setPostsError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<BlogPost[]>("/api/blogs/")
      .then((p) => setPosts(Array.isArray(p) ? p : []))
      .catch((e) => setPostsError(errorMessage(e)));
  }, []);

  const { busy, error: actionError, setError, run } = useAction();
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<BlogComment | null>(null);
  const [replyTo, setReplyTo] = useState<BlogComment | null>(null);
  const [reply, setReply] = useState({ name: "Admin", email: "", message: "" });
  const [toast, setToast] = useState<string | null>(null);

  const postById = useMemo(() => {
    const m = new Map<number, BlogPost>();
    posts.forEach((p) => m.set(p.id, p));
    return m;
  }, [posts]);

  const postTitle = (blogId: number) => postById.get(blogId)?.title ?? `#${blogId}`;

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((c) =>
      [c.name, c.message, postTitle(c.blog_id)].some((v) =>
        String(v).toLowerCase().includes(q),
      ),
    );
  }, [items, search, postById]); // eslint-disable-line react-hooks/exhaustive-deps

  const remove = async () => {
    if (!deleting) return;
    const ok = await run(() => api.del(`/api/blogs/comments/${deleting.id}`));
    if (ok) {
      setDeleting(null);
      setToast("Comment deleted.");
      void reload();
    }
  };

  const sendReply = async () => {
    if (!replyTo) return;
    const post = postById.get(replyTo.blog_id);
    if (!post) {
      setError("Could not resolve the post this comment belongs to.");
      return;
    }
    if (!reply.message.trim() || !reply.email.trim()) {
      setError("Email and reply message are required.");
      return;
    }
    const ok = await run(() =>
      api.post(`/api/blogs/${post.card_id}/comments`, {
        name: reply.name.trim() || "Admin",
        email: reply.email.trim(),
        message: reply.message.trim(),
        parent_id: replyTo.id,
      }),
    );
    if (ok) {
      setReplyTo(null);
      setReply({ name: "Admin", email: "", message: "" });
      setToast("Reply posted.");
      void reload();
    }
  };

  const toggleApprove = async (c: BlogComment) => {
    const ok = await run(() =>
      api.put(`/api/blogs/comments/${c.id}/approve`, {}),
    );
    if (ok) {
      setToast(c.is_approved ? "Comment unapproved." : "Comment approved.");
      void reload();
    }
  };

  const columns: Column<BlogComment>[] = [
    {
      key: "name",
      label: "Comment",
      render: (c) => (
        <Box sx={{ maxWidth: 440 }}>
          <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: "#fff" }}>
            {c.name}
            {c.parent_id ? (
              <Box
                component="span"
                sx={{
                  ml: 1,
                  fontSize: 11,
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.4)",
                }}
              >
                (reply)
              </Box>
            ) : null}
          </Typography>
          <Typography
            sx={{
              fontSize: 12.5,
              color: "rgba(255,255,255,0.6)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {c.message}
          </Typography>
        </Box>
      ),
    },
    {
      key: "blog_id",
      label: "On post",
      hideBelow: "md",
      render: (c) => (
        <Typography
          sx={{
            fontSize: 13,
            color: "rgba(255,255,255,0.7)",
            maxWidth: 220,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {postTitle(c.blog_id)}
        </Typography>
      ),
    },
    {
      key: "is_approved",
      label: "Status",
      render: (c) => (
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            px: 1.2,
            py: 0.4,
            borderRadius: "999px",
            fontSize: 11.5,
            fontWeight: 800,
            color: c.is_approved ? "#c8ff00" : "#ffb74d",
            bgcolor: c.is_approved ? "rgba(200,255,0,0.12)" : "rgba(255,183,77,0.12)",
            border: `1px solid ${c.is_approved ? "rgba(200,255,0,0.3)" : "rgba(255,183,77,0.3)"}`,
          }}
        >
          {c.is_approved ? "Approved" : "Pending"}
        </Box>
      ),
    },
    {
      key: "created_at",
      label: "Posted",
      hideBelow: "sm",
      render: (c) => fmtDateTime(c.created_at),
    },
  ];

  return (
    <Box>
      <PageHeader
        title="Comments"
        subtitle={`${items.length} comment${items.length === 1 ? "" : "s"} across all blog posts.`}
      >
        <SearchBox
          value={search}
          onChange={setSearch}
          placeholder="Search author, text…"
        />
      </PageHeader>

      {postsError && (
        <Typography
          sx={{ fontSize: 12.5, color: "rgba(255,180,180,0.8)", mb: 2 }}
        >
          Post titles unavailable: {postsError}
        </Typography>
      )}

      <DataTable
        columns={columns}
        rows={rows}
        loading={loading}
        error={error}
        onRetry={reload}
        emptyTitle={items.length ? "No matching comments" : "No comments yet"}
        emptyHint={
          items.length
            ? "Try a different search."
            : "Reader comments on blog posts will appear here for moderation."
        }
        actions={[
          {
            icon: "approve",
            label: (c: BlogComment) => (c.is_approved ? "Unapprove" : "Approve"),
            onClick: (c: BlogComment) => void toggleApprove(c),
          },
          {
            icon: "view",
            label: "Reply",
            onClick: (c) => {
              setError(null);
              setReply({ name: "Admin", email: "", message: "" });
              setReplyTo(c);
            },
          },
          {
            icon: "delete",
            label: "Delete",
            danger: true,
            onClick: (c) => {
              setError(null);
              setDeleting(c);
            },
          },
        ]}
      />

      <FormDialog
        open={!!replyTo}
        title={replyTo ? `Reply to ${replyTo.name}` : ""}
        busy={busy}
        error={actionError}
        submitLabel="Post reply"
        onSubmit={() => void sendReply()}
        onClose={() => setReplyTo(null)}
      >
        {replyTo && (
          <Box
            sx={{
              p: 2,
              borderRadius: "12px",
              bgcolor: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <Typography
              sx={{ fontSize: 12, color: "rgba(255,255,255,0.45)", mb: 0.5 }}
            >
              {postTitle(replyTo.blog_id)} · {fmtDateTime(replyTo.created_at)}
            </Typography>
            <Typography sx={{ fontSize: 13, color: "#fff" }}>
              {replyTo.message}
            </Typography>
          </Box>
        )}
        <Field
          label="Your name"
          value={reply.name}
          onChange={(e) => setReply((r) => ({ ...r, name: e.target.value }))}
        />
        <Field
          label="Your email"
          type="email"
          value={reply.email}
          onChange={(e) => setReply((r) => ({ ...r, email: e.target.value }))}
          required
        />
        <Field
          label="Reply"
          value={reply.message}
          onChange={(e) => setReply((r) => ({ ...r, message: e.target.value }))}
          multiline
          minRows={4}
          required
        />
      </FormDialog>

      <ConfirmDialog
        open={!!deleting}
        title="Delete comment?"
        message={`This permanently removes the comment from ${deleting?.name ?? ""} and any replies to it.`}
        busy={busy}
        onConfirm={() => void remove()}
        onClose={() => setDeleting(null)}
      />

      <Toast message={toast} onClose={() => setToast(null)} />
    </Box>
  );
}
