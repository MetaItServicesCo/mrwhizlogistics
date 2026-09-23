"use client";

import { useCallback, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { api } from "@/lib/api";
import { useAction, useResource } from "@/lib/useResource";
import type { Faq, FaqCategory } from "@/lib/types";
import DataTable, { type Column } from "@/components/admin/DataTable";
import {
  ConfirmDialog,
  Field,
  FormDialog,
  LIME,
  PageHeader,
  SearchBox,
  SelectField,
  StatusChip,
  Toast,
} from "@/components/admin/ui";

const pickItems = <T,>(raw: unknown): T[] =>
  Array.isArray(raw) ? (raw as T[]) : ((raw as { items?: T[] })?.items ?? []);

export default function FaqsPage() {
  const selectFaq = useCallback((raw: unknown) => pickItems<Faq>(raw), []);
  const selectCat = useCallback(
    (raw: unknown) => pickItems<FaqCategory>(raw),
    [],
  );

  const faqs = useResource<Faq>("/api/faqs", selectFaq);
  const cats = useResource<FaqCategory>("/api/faq-categories", selectCat);
  const { busy, error: actionError, setError, run } = useAction();

  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  // FAQ dialogs
  const [faqForm, setFaqForm] = useState({
    category_id: "",
    question: "",
    answer: "",
    display_order: "0",
    is_active: true,
  });
  const [editingFaq, setEditingFaq] = useState<Faq | null>(null);
  const [creatingFaq, setCreatingFaq] = useState(false);
  const [deletingFaq, setDeletingFaq] = useState<Faq | null>(null);

  // Category dialogs
  const [catForm, setCatForm] = useState({
    name: "",
    icon: "",
    description: "",
    display_order: "0",
    is_active: true,
  });
  const [editingCat, setEditingCat] = useState<FaqCategory | null>(null);
  const [creatingCat, setCreatingCat] = useState(false);
  const [deletingCat, setDeletingCat] = useState<FaqCategory | null>(null);

  const catName = (id: number) =>
    cats.items.find((c) => c.id === id)?.name ?? `#${id}`;

  const catOptions = cats.items.map((c) => ({
    value: String(c.id),
    label: c.name,
  }));

  const faqRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return faqs.items;
    return faqs.items.filter((f) =>
      [f.question, f.answer, catName(f.category_id)].some((v) =>
        String(v).toLowerCase().includes(q),
      ),
    );
  }, [faqs.items, search, cats.items]); // eslint-disable-line react-hooks/exhaustive-deps

  const catRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return cats.items;
    return cats.items.filter((c) =>
      [c.name, c.description].filter(Boolean).some((v) =>
        String(v).toLowerCase().includes(q),
      ),
    );
  }, [cats.items, search]);

  /* ----------------------------- FAQ actions ----------------------------- */

  const openCreateFaq = () => {
    setError(null);
    setFaqForm({
      category_id: cats.items[0] ? String(cats.items[0].id) : "",
      question: "",
      answer: "",
      display_order: "0",
      is_active: true,
    });
    setCreatingFaq(true);
  };

  const openEditFaq = (f: Faq) => {
    setError(null);
    setFaqForm({
      category_id: String(f.category_id),
      question: f.question,
      answer: f.answer,
      display_order: String(f.display_order),
      is_active: f.is_active,
    });
    setEditingFaq(f);
  };

  const faqPayload = () => ({
    category_id: Number(faqForm.category_id),
    question: faqForm.question.trim(),
    answer: faqForm.answer.trim(),
    display_order: Number(faqForm.display_order) || 0,
    is_active: faqForm.is_active,
  });

  const saveFaq = async () => {
    if (!faqForm.category_id) {
      setError("Pick a category first. Create one on the Categories tab.");
      return;
    }
    const ok = await run(() =>
      editingFaq
        ? api.put(`/api/faqs/${editingFaq.id}`, faqPayload())
        : api.post("/api/faqs", faqPayload()),
    );
    if (ok) {
      setEditingFaq(null);
      setCreatingFaq(false);
      setToast(editingFaq ? "FAQ updated." : "FAQ created.");
      void faqs.reload();
      void cats.reload();
    }
  };

  const removeFaq = async () => {
    if (!deletingFaq) return;
    const ok = await run(() => api.del(`/api/faqs/${deletingFaq.id}`));
    if (ok) {
      setDeletingFaq(null);
      setToast("FAQ deleted.");
      void faqs.reload();
      void cats.reload();
    }
  };

  const toggleFaq = async (f: Faq) => {
    const ok = await run(() =>
      api.put(`/api/faqs/${f.id}`, { is_active: !f.is_active }),
    );
    if (ok) {
      setToast(f.is_active ? "FAQ hidden." : "FAQ published.");
      void faqs.reload();
    }
  };

  /* --------------------------- Category actions -------------------------- */

  const openCreateCat = () => {
    setError(null);
    setCatForm({
      name: "",
      icon: "",
      description: "",
      display_order: "0",
      is_active: true,
    });
    setCreatingCat(true);
  };

  const openEditCat = (c: FaqCategory) => {
    setError(null);
    setCatForm({
      name: c.name,
      icon: c.icon || "",
      description: c.description || "",
      display_order: String(c.display_order),
      is_active: c.is_active,
    });
    setEditingCat(c);
  };

  const catPayload = () => ({
    name: catForm.name.trim(),
    icon: catForm.icon.trim() || null,
    description: catForm.description.trim() || null,
    display_order: Number(catForm.display_order) || 0,
    is_active: catForm.is_active,
  });

  const saveCat = async () => {
    const ok = await run(() =>
      editingCat
        ? api.put(`/api/faq-categories/${editingCat.id}`, catPayload())
        : api.post("/api/faq-categories", catPayload()),
    );
    if (ok) {
      setEditingCat(null);
      setCreatingCat(false);
      setToast(editingCat ? "Category updated." : "Category created.");
      void cats.reload();
    }
  };

  const removeCat = async () => {
    if (!deletingCat) return;
    const ok = await run(() =>
      api.del(`/api/faq-categories/${deletingCat.id}`),
    );
    if (ok) {
      setDeletingCat(null);
      setToast("Category deleted.");
      void cats.reload();
      void faqs.reload();
    }
  };

  /* ------------------------------- columns ------------------------------- */

  const faqColumns: Column<Faq>[] = [
    {
      key: "question",
      label: "Question",
      render: (f) => (
        <Box sx={{ maxWidth: 420 }}>
          <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: "#fff" }}>
            {f.question}
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
            {f.answer}
          </Typography>
        </Box>
      ),
    },
    {
      key: "category_id",
      label: "Category",
      hideBelow: "md",
      render: (f) => catName(f.category_id),
    },
    { key: "display_order", label: "Order", hideBelow: "lg", width: 80 },
    {
      key: "is_active",
      label: "Published",
      width: 110,
      render: (f) => (
        <Switch
          checked={f.is_active}
          disabled={busy}
          onChange={() => void toggleFaq(f)}
          size="small"
          sx={{
            "& .Mui-checked": { color: LIME },
            "& .Mui-checked + .MuiSwitch-track": {
              backgroundColor: `${LIME} !important`,
            },
          }}
        />
      ),
    },
  ];

  const catColumns: Column<FaqCategory>[] = [
    {
      key: "name",
      label: "Category",
      render: (c) => (
        <Box>
          <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: "#fff" }}>
            {c.name}
          </Typography>
          {c.description && (
            <Typography sx={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>
              {c.description}
            </Typography>
          )}
        </Box>
      ),
    },
    { key: "icon", label: "Icon", hideBelow: "lg" },
    {
      key: "faq_count",
      label: "FAQs",
      width: 80,
      render: (c) => String(c.faq_count ?? 0),
    },
    { key: "display_order", label: "Order", hideBelow: "md", width: 80 },
    {
      key: "is_active",
      label: "Status",
      render: (c) => <StatusChip status={c.is_active ? "active" : "inactive"} />,
    },
  ];

  const onCategoriesTab = tab === 1;

  return (
    <Box>
      <PageHeader
        title="FAQs"
        subtitle={`${faqs.items.length} question${faqs.items.length === 1 ? "" : "s"} across ${cats.items.length} categor${cats.items.length === 1 ? "y" : "ies"}.`}
        actionLabel={onCategoriesTab ? "Add category" : "Add FAQ"}
        onAction={onCategoriesTab ? openCreateCat : openCreateFaq}
      >
        <SearchBox value={search} onChange={setSearch} />
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
        <Tab label={`Questions (${faqs.items.length})`} />
        <Tab label={`Categories (${cats.items.length})`} />
      </Tabs>

      {onCategoriesTab ? (
        <DataTable
          columns={catColumns}
          rows={catRows}
          loading={cats.loading}
          error={cats.error}
          onRetry={cats.reload}
          emptyTitle="No categories yet"
          emptyHint="Categories group the FAQ tabs shown on the website."
          actions={[
            { icon: "edit", label: "Edit", onClick: openEditCat },
            {
              icon: "delete",
              label: "Delete",
              danger: true,
              onClick: (c) => {
                setError(null);
                setDeletingCat(c);
              },
            },
          ]}
        />
      ) : (
        <DataTable
          columns={faqColumns}
          rows={faqRows}
          loading={faqs.loading}
          error={faqs.error}
          onRetry={faqs.reload}
          emptyTitle={faqs.items.length ? "No matching FAQs" : "No FAQs yet"}
          emptyHint={
            faqs.items.length
              ? "Try a different search."
              : 'Use "Add FAQ" to publish the first question.'
          }
          actions={[
            { icon: "edit", label: "Edit", onClick: openEditFaq },
            {
              icon: "delete",
              label: "Delete",
              danger: true,
              onClick: (f) => {
                setError(null);
                setDeletingFaq(f);
              },
            },
          ]}
        />
      )}

      {/* ----------------------------- FAQ form ---------------------------- */}
      <FormDialog
        open={creatingFaq || !!editingFaq}
        title={editingFaq ? "Edit FAQ" : "New FAQ"}
        busy={busy}
        error={actionError}
        submitLabel={editingFaq ? "Save changes" : "Create FAQ"}
        onSubmit={() => void saveFaq()}
        onClose={() => {
          setCreatingFaq(false);
          setEditingFaq(null);
        }}
        maxWidth="md"
      >
        <SelectField
          label="Category"
          value={faqForm.category_id}
          onChange={(e) =>
            setFaqForm((f) => ({ ...f, category_id: e.target.value }))
          }
          options={
            catOptions.length
              ? catOptions
              : [{ value: "", label: "No categories — create one first" }]
          }
        />
        <Field
          label="Question"
          value={faqForm.question}
          onChange={(e) =>
            setFaqForm((f) => ({ ...f, question: e.target.value }))
          }
          required
        />
        <Field
          label="Answer"
          value={faqForm.answer}
          onChange={(e) => setFaqForm((f) => ({ ...f, answer: e.target.value }))}
          multiline
          minRows={5}
          required
        />
        <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
          <Field
            label="Display order"
            type="number"
            value={faqForm.display_order}
            onChange={(e) =>
              setFaqForm((f) => ({ ...f, display_order: e.target.value }))
            }
            sx={{ maxWidth: 160 }}
          />
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Switch
              checked={faqForm.is_active}
              onChange={(e) =>
                setFaqForm((f) => ({ ...f, is_active: e.target.checked }))
              }
              sx={{
                "& .Mui-checked": { color: LIME },
                "& .Mui-checked + .MuiSwitch-track": {
                  backgroundColor: `${LIME} !important`,
                },
              }}
            />
            <Typography sx={{ fontSize: 13.5, color: "rgba(255,255,255,0.7)" }}>
              Published on website
            </Typography>
          </Box>
        </Box>
      </FormDialog>

      {/* --------------------------- Category form -------------------------- */}
      <FormDialog
        open={creatingCat || !!editingCat}
        title={editingCat ? "Edit category" : "New category"}
        busy={busy}
        error={actionError}
        submitLabel={editingCat ? "Save changes" : "Create category"}
        onSubmit={() => void saveCat()}
        onClose={() => {
          setCreatingCat(false);
          setEditingCat(null);
        }}
      >
        <Field
          label="Name"
          value={catForm.name}
          onChange={(e) => setCatForm((f) => ({ ...f, name: e.target.value }))}
          required
        />
        <Field
          label="Icon"
          value={catForm.icon}
          onChange={(e) => setCatForm((f) => ({ ...f, icon: e.target.value }))}
          helperText="Optional icon key used by the website"
        />
        <Field
          label="Description"
          value={catForm.description}
          onChange={(e) =>
            setCatForm((f) => ({ ...f, description: e.target.value }))
          }
          multiline
          minRows={2}
        />
        <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
          <Field
            label="Display order"
            type="number"
            value={catForm.display_order}
            onChange={(e) =>
              setCatForm((f) => ({ ...f, display_order: e.target.value }))
            }
            sx={{ maxWidth: 160 }}
          />
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Switch
              checked={catForm.is_active}
              onChange={(e) =>
                setCatForm((f) => ({ ...f, is_active: e.target.checked }))
              }
              sx={{
                "& .Mui-checked": { color: LIME },
                "& .Mui-checked + .MuiSwitch-track": {
                  backgroundColor: `${LIME} !important`,
                },
              }}
            />
            <Typography sx={{ fontSize: 13.5, color: "rgba(255,255,255,0.7)" }}>
              Active
            </Typography>
          </Box>
        </Box>
      </FormDialog>

      <ConfirmDialog
        open={!!deletingFaq}
        title="Delete FAQ?"
        message="This permanently removes the question from the website."
        busy={busy}
        onConfirm={() => void removeFaq()}
        onClose={() => setDeletingFaq(null)}
      />

      <ConfirmDialog
        open={!!deletingCat}
        title="Delete category?"
        message={`This removes “${deletingCat?.name ?? ""}”. Questions inside it may be removed too.`}
        busy={busy}
        onConfirm={() => void removeCat()}
        onClose={() => setDeletingCat(null)}
      />

      <Toast message={toast} onClose={() => setToast(null)} />
    </Box>
  );
}
