"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";
import { api } from "@/lib/api";
import { errorMessage } from "@/lib/useResource";
import type { ContactInquiry, DashboardStats, Quote } from "@/lib/types";
import {
  BORDER,
  CARD_BG,
  ErrorState,
  LIME,
  Panel,
  StatusChip,
  fmtDateTime,
} from "@/components/admin/ui";

type Recent = {
  quotes: Quote[];
  contacts: ContactInquiry[];
};

function StatCard({
  label,
  value,
  hint,
  href,
  loading,
}: {
  label: string;
  value: number | string;
  hint: string;
  href: string;
  loading: boolean;
}) {
  return (
    <Box
      component={Link}
      href={href}
      sx={{
        p: 3,
        borderRadius: "16px",
        bgcolor: CARD_BG,
        border: BORDER,
        textDecoration: "none",
        display: "block",
        transition: "border-color .2s, transform .2s",
        "&:hover": { borderColor: `${LIME}55`, transform: "translateY(-2px)" },
      }}
    >
      <Typography sx={{ fontSize: 12.5, color: "rgba(255,255,255,0.5)", mb: 1 }}>
        {label}
      </Typography>
      {loading ? (
        <Skeleton
          variant="text"
          width={60}
          height={42}
          sx={{ bgcolor: "rgba(255,255,255,0.07)" }}
        />
      ) : (
        <Typography
          sx={{
            fontSize: "2rem",
            fontWeight: 800,
            color: LIME,
            lineHeight: 1,
          }}
        >
          {value}
        </Typography>
      )}
      <Typography sx={{ fontSize: 12, color: "rgba(255,255,255,0.4)", mt: 1 }}>
        {hint}
      </Typography>
    </Box>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recent, setRecent] = useState<Recent>({ quotes: [], contacts: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      // Recent lists are best-effort: a failure there should not blank the page.
      const [s, q, c] = await Promise.all([
        api.get<DashboardStats>("/api/dashboard/stats"),
        api.get<Quote[]>("/api/quotes").catch(() => [] as Quote[]),
        api
          .get<ContactInquiry[]>("/api/contact-us")
          .catch(() => [] as ContactInquiry[]),
      ]);
      setStats(s);
      setRecent({
        quotes: (Array.isArray(q) ? q : []).slice(0, 5),
        contacts: (Array.isArray(c) ? c : []).slice(0, 5),
      });
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const cards = [
    {
      label: "Quote Requests",
      value: stats?.quotes.total ?? 0,
      hint: `${stats?.quotes.new ?? 0} new`,
      href: "/dashboard/leads/quotes",
    },
    {
      label: "Contact Messages",
      value: stats?.contacts.total ?? 0,
      hint: `${stats?.contacts.new ?? 0} new`,
      href: "/dashboard/leads/contact",
    },
    {
      label: "Newsletter Subs",
      value: stats?.subscribers ?? 0,
      hint: "Total subscribers",
      href: "/dashboard/leads/newsletter",
    },
    {
      label: "Testimonials",
      value: stats?.testimonials ?? 0,
      hint: `${stats?.faqs ?? 0} FAQs published`,
      href: "/dashboard/testimonials",
    },
  ];

  return (
    <Box>
      <Typography
        sx={{ fontSize: "1.6rem", fontWeight: 800, color: "#fff", mb: 0.5 }}
      >
        Dashboard
      </Typography>
      <Typography sx={{ fontSize: 14, color: "rgba(255,255,255,0.5)", mb: 4 }}>
        Overview of your leads, messages and activity.
      </Typography>

      {error ? (
        <Panel>
          <ErrorState message={error} onRetry={() => void load()} />
        </Panel>
      ) : (
        <>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "1fr 1fr",
                lg: "repeat(4, 1fr)",
              },
              gap: 2.5,
            }}
          >
            {cards.map((c) => (
              <StatCard key={c.label} {...c} loading={loading} />
            ))}
          </Box>

          <Box
            sx={{
              mt: 3,
              display: "grid",
              gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
              gap: 2.5,
            }}
          >
            <RecentPanel
              title="Latest quote requests"
              href="/dashboard/leads/quotes"
              loading={loading}
              empty="No quote requests yet."
              rows={recent.quotes.map((q) => ({
                id: q.id,
                primary: q.name,
                secondary: q.selected_service,
                status: q.status,
                date: q.created_at,
              }))}
            />
            <RecentPanel
              title="Latest contact messages"
              href="/dashboard/leads/contact"
              loading={loading}
              empty="No contact messages yet."
              rows={recent.contacts.map((c) => ({
                id: c.id,
                primary: c.full_name,
                secondary: c.service_needed || c.email,
                status: c.status,
                date: c.created_at,
              }))}
            />
          </Box>
        </>
      )}
    </Box>
  );
}

function RecentPanel({
  title,
  href,
  rows,
  loading,
  empty,
}: {
  title: string;
  href: string;
  rows: {
    id: number;
    primary: string;
    secondary: string | null;
    status: string | null;
    date: string;
  }[];
  loading: boolean;
  empty: string;
}) {
  return (
    <Panel>
      <Box
        sx={{
          px: 3,
          py: 2,
          borderBottom: BORDER,
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Typography
          sx={{ flex: 1, fontSize: 14.5, fontWeight: 800, color: "#fff" }}
        >
          {title}
        </Typography>
        <Box
          component={Link}
          href={href}
          sx={{
            fontSize: 12.5,
            fontWeight: 700,
            color: LIME,
            textDecoration: "none",
            "&:hover": { color: "#d4ff33" },
          }}
        >
          View all
        </Box>
      </Box>

      <Box sx={{ minHeight: 220 }}>
        {loading ? (
          <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 1.5 }}>
            {[0, 1, 2, 3].map((i) => (
              <Skeleton
                key={i}
                variant="rounded"
                height={38}
                sx={{ bgcolor: "rgba(255,255,255,0.05)" }}
              />
            ))}
          </Box>
        ) : rows.length === 0 ? (
          <Box
            sx={{
              height: 220,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography
              sx={{ color: "rgba(255,255,255,0.35)", fontSize: 13.5 }}
            >
              {empty}
            </Typography>
          </Box>
        ) : (
          rows.map((r) => (
            <Box
              key={r.id}
              sx={{
                px: 3,
                py: 1.8,
                display: "flex",
                alignItems: "center",
                gap: 2,
                borderBottom: "1px solid rgba(255,255,255,0.05)",
                "&:last-child": { borderBottom: "none" },
              }}
            >
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  sx={{
                    fontSize: 13.5,
                    fontWeight: 700,
                    color: "#fff",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {r.primary}
                </Typography>
                <Typography
                  sx={{
                    fontSize: 12,
                    color: "rgba(255,255,255,0.45)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {r.secondary || "—"} · {fmtDateTime(r.date)}
                </Typography>
              </Box>
              <StatusChip status={r.status} />
            </Box>
          ))
        )}
      </Box>
    </Panel>
  );
}
