"use client";

import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import { EmptyState, ErrorState, LoadingState, Panel, LIME } from "./ui";

export type Column<T> = {
  key: string;
  label: string;
  /** Cell renderer. Falls back to String(row[key]) when omitted. */
  render?: (row: T) => React.ReactNode;
  width?: number | string;
  hideBelow?: "sm" | "md" | "lg";
};

export type RowAction<T> = {
  icon: "edit" | "delete" | "view" | "approve";
  label: string | ((row: T) => string);
  onClick: (row: T) => void;
  danger?: boolean;
};

const ICONS = {
  edit: EditRoundedIcon,
  delete: DeleteOutlineRoundedIcon,
  view: VisibilityRoundedIcon,
  approve: CheckCircleOutlineRoundedIcon,
};

const headSx = {
  color: "rgba(255,255,255,0.45)",
  fontSize: 11.5,
  fontWeight: 800,
  letterSpacing: 0.8,
  textTransform: "uppercase" as const,
  borderBottom: "1px solid rgba(255,255,255,0.08)",
  bgcolor: "rgba(255,255,255,0.02)",
  whiteSpace: "nowrap" as const,
  py: 1.6,
};

const cellSx = {
  color: "rgba(255,255,255,0.85)",
  fontSize: 13.5,
  borderBottom: "1px solid rgba(255,255,255,0.05)",
  py: 1.6,
};

function hideSx(hideBelow?: "sm" | "md" | "lg") {
  if (!hideBelow) return {};
  return { display: { xs: "none", [hideBelow]: "table-cell" } };
}

export default function DataTable<T extends { id: number | string }>({
  columns,
  rows,
  loading,
  error,
  onRetry,
  actions,
  emptyTitle,
  emptyHint,
}: {
  columns: Column<T>[];
  rows: T[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  actions?: RowAction<T>[];
  emptyTitle?: string;
  emptyHint?: string;
}) {
  if (loading) {
    return (
      <Panel>
        <LoadingState />
      </Panel>
    );
  }
  if (error) {
    return (
      <Panel>
        <ErrorState message={error} onRetry={onRetry} />
      </Panel>
    );
  }
  if (!rows.length) {
    return (
      <Panel>
        <EmptyState title={emptyTitle} hint={emptyHint} />
      </Panel>
    );
  }

  return (
    <Panel>
      <TableContainer>
        <Table sx={{ minWidth: 560 }}>
          <TableHead>
            <TableRow>
              {columns.map((c) => (
                <TableCell
                  key={c.key}
                  sx={{ ...headSx, ...hideSx(c.hideBelow), width: c.width }}
                >
                  {c.label}
                </TableCell>
              ))}
              {actions?.length ? (
                <TableCell sx={{ ...headSx, textAlign: "right", width: 120 }}>
                  Actions
                </TableCell>
              ) : null}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow
                key={row.id}
                sx={{
                  transition: "background .15s",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.025)" },
                  "&:last-child td": { borderBottom: "none" },
                }}
              >
                {columns.map((c) => (
                  <TableCell
                    key={c.key}
                    sx={{ ...cellSx, ...hideSx(c.hideBelow) }}
                  >
                    {c.render
                      ? c.render(row)
                      : String((row as Record<string, unknown>)[c.key] ?? "—")}
                  </TableCell>
                ))}
                {actions?.length ? (
                  <TableCell sx={{ ...cellSx, textAlign: "right" }}>
                    <Box
                      sx={{
                        display: "inline-flex",
                        gap: 0.5,
                        justifyContent: "flex-end",
                      }}
                    >
                      {actions.map((a, idx) => {
                        const Icon = ICONS[a.icon];
                        const labelStr = typeof a.label === "function" ? a.label(row) : a.label;
                        return (
                          <Tooltip key={idx} title={labelStr} arrow>
                            <IconButton
                              size="small"
                              aria-label={labelStr}
                              onClick={() => a.onClick(row)}
                              sx={{
                                color: a.danger
                                  ? "rgba(255,107,107,0.75)"
                                  : "rgba(255,255,255,0.5)",
                                "&:hover": {
                                  color: a.danger ? "#ff6b6b" : LIME,
                                  bgcolor: "rgba(255,255,255,0.06)",
                                },
                              }}
                            >
                              <Icon sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Tooltip>
                        );
                      })}
                    </Box>
                  </TableCell>
                ) : null}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Panel>
  );
}
