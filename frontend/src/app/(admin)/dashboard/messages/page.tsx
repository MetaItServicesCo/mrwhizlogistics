"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { api } from "@/lib/api";
import { errorMessage } from "@/lib/useResource";
import type { ContactInquiry, Quote, RentalQuote } from "@/lib/types";
import DataTable, { type Column } from "@/components/admin/DataTable";
import {
  FormDialog,
  LIME,
  PageHeader,
  SearchBox,
  StatusChip,
  fmtDateTime,
} from "@/components/admin/ui";

type Source = "Quote" | "Contact" | "Rental";

type InboxItem = {
  id: string;
  sourceId: number;
  source: Source;
  from: string;
  contact: string;
  subject: string;
  body: string;
  status: string | null;
  date: string;
  manageHref: string;
};

const SOURCE_COLORS: Record<Source, string> = {
  Quote: LIME,
  Contact: "#66b2ff",
  Rental: "#ffc46b",
};

function SourceTag({ source }: { source: Source }) {
  const c = SOURCE_COLORS[source];
  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        px: 1.1,
        py: 0.35,
        borderRadius: "999px",
        fontSize: 11,
        fontWeight: 800,
        color: c,
        bgcolor: `${c}1f`,
        border: `1px solid ${c}44`,
        whiteSpace: "nowrap",
      }}
    >
      {source}
    </Box>
  );
}

export default function MessagesPage() {
  const [items, setItems] = useState<InboxItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState("");
  const [viewing, setViewing] = useState<InboxItem | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Each source is independent — one failing endpoint should not empty the inbox.
      const [quotes, contacts, rentals] = await Promise.all([
        api.get<Quote[]>("/api/quotes").catch(() => [] as Quote[]),
        api.get<ContactInquiry[]>("/api/contact-us").catch(() => []),
        api.get<RentalQuote[]>("/api/rental-quotes").catch(() => []),
      ]);

      const merged: InboxItem[] = [
        ...(Array.isArray(quotes) ? quotes : []).map((q) => ({
          id: `q-${q.id}`,
          sourceId: q.id,
          source: "Quote" as const,
          from: q.name,
          contact: [q.email, q.phone].filter(Boolean).join(" · "),
          subject: `Quote request — ${q.selected_service}`,
          body:
            [
              q.pickup || q.drop
                ? `Route: ${q.pickup || "—"} → ${q.drop || "—"}`
                : "",
              q.details || "",
            ]
              .filter(Boolean)
              .join("\n\n") || "(no details)",
          status: q.status,
          date: q.created_at,
          manageHref: "/dashboard/leads/quotes",
        })),
        ...(Array.isArray(contacts) ? contacts : []).map((c) => ({
          id: `c-${c.id}`,
          sourceId: c.id,
          source: "Contact" as const,
          from: c.full_name,
          contact: [c.email, c.phone_number].filter(Boolean).join(" · "),
          subject: c.service_needed
            ? `Contact — ${c.service_needed}`
            : "Contact message",
          body: c.message || "(no message)",
          status: c.status,
          date: c.created_at,
          manageHref: "/dashboard/leads/contact",
        })),
        ...(Array.isArray(rentals) ? rentals : []).map((r) => ({
          id: `r-${r.id}`,
          sourceId: r.id,
          source: "Rental" as const,
          from: r.customer?.fullName || "—",
          contact: [r.customer?.email, r.customer?.phone]
            .filter(Boolean)
            .join(" · "),
          subject: `Rental — ${r.rental?.name || r.rental?.slug || "equipment"}`,
          body:
            [
              r.load?.description,
              r.requirements?.specialRequirements,
              r.requirements?.additionalNotes,
            ]
              .filter(Boolean)
              .join("\n\n") || "(no notes)",
          status: r.status,
          date: r.submittedAt,
          manageHref: "/dashboard/rentals",
        })),
      ];

      merged.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );
      setItems(merged);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const TABS: (Source | "All")[] = ["All", "Quote", "Contact", "Rental"];
  const activeSource = TABS[tab];

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((m) => {
      if (activeSource !== "All" && m.source !== activeSource) return false;
      if (!q) return true;
      return [m.from, m.contact, m.subject, m.body].some((v) =>
        String(v).toLowerCase().includes(q),
      );
    });
  }, [items, search, activeSource]);

  const countFor = (s: Source | "All") =>
    s === "All" ? items.length : items.filter((m) => m.source === s).length;

  const columns: Column<InboxItem>[] = [
    {
      key: "source",
      label: "Type",
      width: 100,
      render: (m) => <SourceTag source={m.source} />,
    },
    {
      key: "from",
      label: "From",
      render: (m) => (
        <Box>
          <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: "#fff" }}>
            {m.from}
          </Typography>
          <Typography sx={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>
            {m.contact || "—"}
          </Typography>
        </Box>
      ),
    },
    {
      key: "subject",
      label: "Subject",
      hideBelow: "md",
      render: (m) => (
        <Typography
          sx={{
            fontSize: 13,
            color: "rgba(255,255,255,0.75)",
            maxWidth: 300,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {m.subject}
        </Typography>
      ),
    },
    {
      key: "date",
      label: "Received",
      hideBelow: "sm",
      render: (m) => fmtDateTime(m.date),
    },
    {
      key: "status",
      label: "Status",
      render: (m) => <StatusChip status={m.status} />,
    },
  ];

  return (
    <Box>
      <PageHeader
        title="Messages"
        subtitle="Every inbound enquiry — quote requests, contact forms and rental quotes — in one inbox."
      >
        <SearchBox
          value={search}
          onChange={setSearch}
          placeholder="Search everything…"
        />
      </PageHeader>

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{
          mb: 2.5,
          minHeight: 40,
          "& .MuiTab-root": {
            color: "rgba(255,255,255,0.5)",
            textTransform: "none",
            fontWeight: 700,
            fontSize: 14,
            minHeight: 40,
          },
          "& .Mui-selected": { color: `${LIME} !important` },
          "& .MuiTabs-indicator": { backgroundColor: LIME },
        }}
      >
        {TABS.map((t) => (
          <Tab key={t} label={`${t} (${countFor(t)})`} />
        ))}
      </Tabs>

      <DataTable
        columns={columns}
        rows={rows}
        loading={loading}
        error={error}
        onRetry={load}
        emptyTitle={items.length ? "No matching messages" : "Inbox is empty"}
        emptyHint={
          items.length
            ? "Try a different search or tab."
            : "Enquiries submitted from the website will collect here."
        }
        actions={[
          { icon: "view", label: "Open", onClick: (m) => setViewing(m) },
        ]}
      />

      <FormDialog
        open={!!viewing}
        title={viewing ? viewing.subject : ""}
        submitLabel="Close"
        onSubmit={() => setViewing(null)}
        onClose={() => setViewing(null)}
        maxWidth="md"
      >
        {viewing && (
          <>
            <Box
              sx={{
                p: 2,
                borderRadius: "12px",
                bgcolor: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              {[
                ["From", viewing.from],
                ["Contact", viewing.contact || "—"],
                ["Type", viewing.source],
                ["Status", viewing.status || "new"],
                ["Received", fmtDateTime(viewing.date)],
              ].map(([k, v]) => (
                <Box key={k} sx={{ display: "flex", gap: 2, py: 0.4 }}>
                  <Typography
                    sx={{
                      fontSize: 12.5,
                      color: "rgba(255,255,255,0.45)",
                      width: 80,
                      flexShrink: 0,
                    }}
                  >
                    {k}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: 12.5,
                      color: "#fff",
                      wordBreak: "break-word",
                    }}
                  >
                    {v}
                  </Typography>
                </Box>
              ))}
            </Box>

            <Typography
              sx={{
                fontSize: 13.5,
                color: "rgba(255,255,255,0.8)",
                whiteSpace: "pre-wrap",
                p: 2,
                borderRadius: "12px",
                bgcolor: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              {viewing.body}
            </Typography>

            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <Box
                component="a"
                href={`mailto:${viewing.contact.split(" · ")[0]}`}
                sx={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: LIME,
                  textDecoration: "none",
                  "&:hover": { color: "#d4ff33" },
                }}
              >
                Reply by email →
              </Box>
              <Box
                component={Link}
                href={viewing.manageHref}
                sx={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.6)",
                  textDecoration: "none",
                  "&:hover": { color: "#fff" },
                }}
              >
                Manage in {viewing.source} list →
              </Box>
            </Box>
          </>
        )}
      </FormDialog>
    </Box>
  );
}
