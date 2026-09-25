"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import InputAdornment from "@mui/material/InputAdornment";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import InboxRoundedIcon from "@mui/icons-material/InboxRounded";

export const LIME = "#c8ff00";
export const CARD_BG = "#0f100f";
export const BORDER = "1px solid rgba(255,255,255,0.08)";

/* ------------------------------------------------------------------ */
/* Shared input styling (matches the dark admin shell)                  */
/* ------------------------------------------------------------------ */

export const fieldSx = {
  "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.5)", fontSize: 14 },
  "& .MuiInputLabel-root.Mui-focused": { color: LIME },
  "& .MuiOutlinedInput-root": {
    color: "#fff",
    borderRadius: "12px",
    bgcolor: "rgba(255,255,255,0.03)",
    "& fieldset": { borderColor: "rgba(255,255,255,0.14)" },
    "&:hover fieldset": { borderColor: "rgba(255,255,255,0.3)" },
    "&.Mui-focused fieldset": { borderColor: LIME },
  },
  "& .MuiFormHelperText-root": { color: "rgba(255,255,255,0.4)" },
  "& .MuiSvgIcon-root": { color: "rgba(255,255,255,0.4)" },
  "& textarea": { color: "#fff" },
  // Chrome paints autofilled fields light blue with dark text, which broke the
  // dark design. Paint over it with the field's own colour instead.
  "& input:-webkit-autofill, & input:-webkit-autofill:hover, & input:-webkit-autofill:focus": {
    WebkitBoxShadow: "0 0 0 1000px #151715 inset",
    WebkitTextFillColor: "#fff",
    caretColor: "#fff",
    transition: "background-color 600000s 0s",
  },
} as const;

/* ------------------------------------------------------------------ */
/* Page header                                                          */
/* ------------------------------------------------------------------ */

export function PageHeader({
  title,
  subtitle,
  actionLabel,
  onAction,
  children,
}: {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  children?: React.ReactNode;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: { xs: "flex-start", sm: "center" },
        flexDirection: { xs: "column", sm: "row" },
        gap: 2,
        mb: 3,
      }}
    >
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          sx={{ fontSize: "1.6rem", fontWeight: 800, color: "#fff", mb: 0.5 }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography sx={{ fontSize: 14, color: "rgba(255,255,255,0.5)" }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {children}
      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          startIcon={<AddRoundedIcon />}
          disableElevation
          sx={{
            bgcolor: LIME,
            color: "#0a0a0a",
            fontWeight: 800,
            borderRadius: "12px",
            px: 2.5,
            py: 1.1,
            textTransform: "none",
            whiteSpace: "nowrap",
            "&:hover": { bgcolor: "#d4ff33" },
          }}
        >
          {actionLabel}
        </Button>
      )}
    </Box>
  );
}

/* ------------------------------------------------------------------ */
/* Search box                                                           */
/* ------------------------------------------------------------------ */

export function SearchBox({
  value,
  onChange,
  placeholder = "Search…",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <TextField
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      size="small"
      sx={{ ...fieldSx, width: { xs: "100%", sm: 260 } }}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchRoundedIcon sx={{ fontSize: 19 }} />
            </InputAdornment>
          ),
        },
      }}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Card / table shell                                                   */
/* ------------------------------------------------------------------ */

export function Panel({
  children,
  sx,
}: {
  children: React.ReactNode;
  sx?: object;
}) {
  return (
    <Box
      sx={{
        borderRadius: "16px",
        bgcolor: CARD_BG,
        border: BORDER,
        overflow: "hidden",
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}

export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
        py: 8,
      }}
    >
      <CircularProgress sx={{ color: LIME }} size={30} />
      <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: 14 }}>
        {label}
      </Typography>
    </Box>
  );
}

export function EmptyState({
  title = "Nothing here yet",
  hint,
}: {
  title?: string;
  hint?: string;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 1,
        py: 8,
        px: 3,
        textAlign: "center",
      }}
    >
      <InboxRoundedIcon sx={{ fontSize: 42, color: "rgba(255,255,255,0.18)" }} />
      <Typography
        sx={{ color: "rgba(255,255,255,0.7)", fontSize: 15, fontWeight: 700 }}
      >
        {title}
      </Typography>
      {hint && (
        <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>
          {hint}
        </Typography>
      )}
    </Box>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <Box sx={{ p: 3 }}>
      <Alert
        severity="error"
        variant="outlined"
        sx={{
          color: "#ffb4b4",
          borderColor: "rgba(255,107,107,0.4)",
          borderRadius: "12px",
        }}
        action={
          onRetry ? (
            <Button
              onClick={onRetry}
              size="small"
              sx={{ color: LIME, textTransform: "none" }}
            >
              Retry
            </Button>
          ) : undefined
        }
      >
        {message}
      </Alert>
    </Box>
  );
}

/* ------------------------------------------------------------------ */
/* Status chip                                                          */
/* ------------------------------------------------------------------ */

const STATUS_COLORS: Record<string, { fg: string; bg: string }> = {
  new: { fg: LIME, bg: "rgba(200,255,0,0.12)" },
  contacted: { fg: "#66b2ff", bg: "rgba(102,178,255,0.12)" },
  quoted: { fg: "#ffc46b", bg: "rgba(255,196,107,0.12)" },
  closed: { fg: "rgba(255,255,255,0.55)", bg: "rgba(255,255,255,0.07)" },
  active: { fg: LIME, bg: "rgba(200,255,0,0.12)" },
  inactive: { fg: "rgba(255,255,255,0.55)", bg: "rgba(255,255,255,0.07)" },
};

export function StatusChip({ status }: { status: string | null | undefined }) {
  const key = (status || "new").toLowerCase();
  const c = STATUS_COLORS[key] ?? STATUS_COLORS.closed;
  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        px: 1.2,
        py: 0.4,
        borderRadius: "999px",
        fontSize: 11.5,
        fontWeight: 800,
        textTransform: "capitalize",
        color: c.fg,
        bgcolor: c.bg,
        border: `1px solid ${c.fg}33`,
        whiteSpace: "nowrap",
      }}
    >
      {key}
    </Box>
  );
}

/* ------------------------------------------------------------------ */
/* Dialogs                                                              */
/* ------------------------------------------------------------------ */

const dialogPaperSx = {
  bgcolor: "#121312",
  color: "#fff",
  borderRadius: "18px",
  border: BORDER,
  backgroundImage: "none",
};

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Delete",
  busy,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  busy?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Dialog
      open={open}
      onClose={busy ? undefined : onClose}
      slotProps={{ paper: { sx: dialogPaperSx } }}
    >
      <DialogTitle sx={{ fontWeight: 800, fontSize: 18 }}>{title}</DialogTitle>
      <DialogContent>
        <Typography sx={{ color: "rgba(255,255,255,0.65)", fontSize: 14 }}>
          {message}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button
          onClick={onClose}
          disabled={busy}
          sx={{ color: "rgba(255,255,255,0.6)", textTransform: "none" }}
        >
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          disabled={busy}
          disableElevation
          sx={{
            bgcolor: "#ff6b6b",
            color: "#170808",
            fontWeight: 800,
            textTransform: "none",
            borderRadius: "10px",
            px: 2.5,
            "&:hover": { bgcolor: "#ff8585" },
          }}
        >
          {busy ? (
            <CircularProgress size={19} sx={{ color: "#170808" }} />
          ) : (
            confirmLabel
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function FormDialog({
  open,
  title,
  busy,
  error,
  submitLabel = "Save",
  onSubmit,
  onClose,
  children,
  maxWidth = "sm",
}: {
  open: boolean;
  title: string;
  busy?: boolean;
  error?: string | null;
  submitLabel?: string;
  onSubmit: () => void;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: "xs" | "sm" | "md" | "lg";
}) {
  return (
    <Dialog
      open={open}
      onClose={busy ? undefined : onClose}
      fullWidth
      maxWidth={maxWidth}
      slotProps={{ paper: { sx: dialogPaperSx } }}
    >
      <DialogTitle sx={{ fontWeight: 800, fontSize: 18 }}>{title}</DialogTitle>
      <DialogContent>
        {error && (
          <Alert
            severity="error"
            variant="outlined"
            sx={{
              mb: 2,
              color: "#ffb4b4",
              borderColor: "rgba(255,107,107,0.4)",
              borderRadius: "12px",
            }}
          >
            {error}
          </Alert>
        )}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.2, pt: 1 }}>
          {children}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button
          onClick={onClose}
          disabled={busy}
          sx={{ color: "rgba(255,255,255,0.6)", textTransform: "none" }}
        >
          Cancel
        </Button>
        <Button
          onClick={onSubmit}
          disabled={busy}
          disableElevation
          sx={{
            bgcolor: LIME,
            color: "#0a0a0a",
            fontWeight: 800,
            textTransform: "none",
            borderRadius: "10px",
            px: 3,
            "&:hover": { bgcolor: "#d4ff33" },
            "&.Mui-disabled": { bgcolor: LIME, opacity: 0.6, color: "#0a0a0a" },
          }}
        >
          {busy ? (
            <CircularProgress size={19} sx={{ color: "#0a0a0a" }} />
          ) : (
            submitLabel
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/* Toast                                                                */
/* ------------------------------------------------------------------ */

export function Toast({
  message,
  severity = "success",
  onClose,
}: {
  message: string | null;
  severity?: "success" | "error" | "info";
  onClose: () => void;
}) {
  return (
    <Snackbar
      open={!!message}
      autoHideDuration={4000}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
    >
      <Alert
        severity={severity}
        variant="filled"
        onClose={onClose}
        sx={{ borderRadius: "12px" }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
}

/* ------------------------------------------------------------------ */
/* Small helpers                                                        */
/* ------------------------------------------------------------------ */

export function Field(props: React.ComponentProps<typeof TextField>) {
  return <TextField fullWidth sx={fieldSx} {...props} />;
}

export function SelectField({
  options,
  ...props
}: React.ComponentProps<typeof TextField> & {
  options: { value: string; label: string }[];
}) {
  return (
    <TextField
      select
      fullWidth
      sx={fieldSx}
      slotProps={{
        select: {
          MenuProps: {
            slotProps: {
              paper: {
                sx: {
                  bgcolor: "#141514",
                  color: "#fff",
                  border: BORDER,
                  "& .MuiMenuItem-root:hover": {
                    bgcolor: "rgba(200,255,0,0.08)",
                  },
                },
              },
            },
          },
        },
      }}
      {...props}
    >
      {options.map((o) => (
        <MenuItem key={o.value} value={o.value}>
          {o.label}
        </MenuItem>
      ))}
    </TextField>
  );
}

export function fmtDate(value?: string | null): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function fmtDateTime(value?: string | null): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
