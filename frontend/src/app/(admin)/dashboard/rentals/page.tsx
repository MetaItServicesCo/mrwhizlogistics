"use client";

import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { api } from "@/lib/api";
import { useAction, useResource } from "@/lib/useResource";
import type { RentalQuote } from "@/lib/types";
import DataTable, { type Column } from "@/components/admin/DataTable";
import {
  ConfirmDialog,
  FormDialog,
  PageHeader,
  SearchBox,
  StatusChip,
  Toast,
  fmtDate,
  fmtDateTime,
} from "@/components/admin/ui";

function DetailBlock({
  heading,
  rows,
}: {
  heading: string;
  rows: [string, string | null | undefined][];
}) {
  const shown = rows.filter(([, v]) => v !== null && v !== undefined && v !== "");
  if (!shown.length) return null;
  return (
    <Box>
      <Typography
        sx={{
          fontSize: 12,
          fontWeight: 800,
          letterSpacing: 1,
          color: "rgba(255,255,255,0.35)",
          textTransform: "uppercase",
          mb: 1,
        }}
      >
        {heading}
      </Typography>
      <Box
        sx={{
          p: 2,
          borderRadius: "12px",
          bgcolor: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        {shown.map(([k, v]) => (
          <Box key={k} sx={{ display: "flex", gap: 2, py: 0.4 }}>
            <Typography
              sx={{
                fontSize: 12.5,
                color: "rgba(255,255,255,0.45)",
                width: 130,
                flexShrink: 0,
              }}
            >
              {k}
            </Typography>
            <Typography
              sx={{ fontSize: 12.5, color: "#fff", wordBreak: "break-word" }}
            >
              {v}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export default function RentalsPage() {
  const { items, loading, error, reload } =
    useResource<RentalQuote>("/api/rental-quotes");
  const { busy, setError, run } = useAction();

  const [search, setSearch] = useState("");
  const [viewing, setViewing] = useState<RentalQuote | null>(null);
  const [deleting, setDeleting] = useState<RentalQuote | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((r) =>
      [
        r.customer?.fullName,
        r.customer?.email,
        r.customer?.phone,
        r.customer?.companyName,
        r.rental?.name,
        r.rental?.slug,
      ]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q)),
    );
  }, [items, search]);

  const remove = async () => {
    if (!deleting) return;
    const ok = await run(() => api.del(`/api/rental-quotes/${deleting.id}`));
    if (ok) {
      setDeleting(null);
      setToast("Rental quote deleted.");
      void reload();
    }
  };

  const columns: Column<RentalQuote>[] = [
    {
      key: "customer",
      label: "Customer",
      render: (r) => (
        <Box>
          <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: "#fff" }}>
            {r.customer?.fullName || "—"}
          </Typography>
          <Typography sx={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>
            {r.customer?.email}
            {r.customer?.phone ? ` · ${r.customer.phone}` : ""}
          </Typography>
        </Box>
      ),
    },
    {
      key: "rental",
      label: "Equipment",
      hideBelow: "md",
      render: (r) => r.rental?.name || r.rental?.slug || "—",
    },
    {
      key: "dates",
      label: "Dates",
      hideBelow: "lg",
      render: (r) =>
        `${fmtDate(r.rental?.startDate)} → ${fmtDate(r.rental?.endDate)}`,
    },
    {
      key: "submittedAt",
      label: "Submitted",
      hideBelow: "sm",
      render: (r) => fmtDateTime(r.submittedAt),
    },
    {
      key: "status",
      label: "Status",
      render: (r) => <StatusChip status={r.status} />,
    },
  ];

  return (
    <Box>
      <PageHeader
        title="Rentals"
        subtitle={`${items.length} rental quote${items.length === 1 ? "" : "s"} submitted from the website.`}
      >
        <SearchBox
          value={search}
          onChange={setSearch}
          placeholder="Search customer, equipment…"
        />
      </PageHeader>

      <DataTable
        columns={columns}
        rows={rows}
        loading={loading}
        error={error}
        onRetry={reload}
        emptyTitle={items.length ? "No matching quotes" : "No rental quotes yet"}
        emptyHint={
          items.length
            ? "Try a different search."
            : "Submissions from the rental quote form will appear here."
        }
        actions={[
          {
            icon: "view",
            label: "View details",
            onClick: (r) => {
              setError(null);
              setViewing(r);
            },
          },
          {
            icon: "delete",
            label: "Delete",
            danger: true,
            onClick: (r) => {
              setError(null);
              setDeleting(r);
            },
          },
        ]}
      />

      <FormDialog
        open={!!viewing}
        title={
          viewing ? `Rental quote — ${viewing.customer?.fullName ?? ""}` : ""
        }
        submitLabel="Close"
        onSubmit={() => setViewing(null)}
        onClose={() => setViewing(null)}
        maxWidth="md"
      >
        {viewing && (
          <>
            <DetailBlock
              heading="Customer"
              rows={[
                ["Full name", viewing.customer?.fullName],
                ["Company", viewing.customer?.companyName],
                ["Email", viewing.customer?.email],
                ["Phone", viewing.customer?.phone],
                ["Preferred contact", viewing.customer?.preferredContactMethod],
              ]}
            />
            <DetailBlock
              heading="Rental"
              rows={[
                ["Equipment", viewing.rental?.name || viewing.rental?.slug],
                ["Duration", viewing.rental?.duration],
                ["Start date", viewing.rental?.startDate],
                ["End date", viewing.rental?.endDate],
              ]}
            />
            <DetailBlock
              heading="Logistics"
              rows={[
                ["Pickup", viewing.logistics?.pickupLocation],
                ["Return", viewing.logistics?.returnLocation],
                [
                  "Delivery required",
                  viewing.logistics?.deliveryRequired ? "Yes" : "No",
                ],
                ["Delivery address", viewing.logistics?.deliveryAddress],
              ]}
            />
            <DetailBlock
              heading="Load"
              rows={[
                ["Intended use", viewing.load?.intendedUse],
                ["Description", viewing.load?.description],
                ["Cargo type", viewing.load?.cargoType],
                ["Estimated weight", viewing.load?.estimatedWeight],
                ["Estimated mileage", viewing.load?.estimatedMileage],
              ]}
            />
            <DetailBlock
              heading="Requirements"
              rows={[
                ["Special requirements", viewing.requirements?.specialRequirements],
                ["Additional notes", viewing.requirements?.additionalNotes],
              ]}
            />
            <DetailBlock
              heading="Meta"
              rows={[
                ["Status", viewing.status],
                ["Submitted", fmtDateTime(viewing.submittedAt)],
              ]}
            />
          </>
        )}
      </FormDialog>

      <ConfirmDialog
        open={!!deleting}
        title="Delete rental quote?"
        message={`This permanently removes the quote from ${deleting?.customer?.fullName ?? ""}. This cannot be undone.`}
        busy={busy}
        onConfirm={() => void remove()}
        onClose={() => setDeleting(null)}
      />

      <Toast message={toast} onClose={() => setToast(null)} />
    </Box>
  );
}
