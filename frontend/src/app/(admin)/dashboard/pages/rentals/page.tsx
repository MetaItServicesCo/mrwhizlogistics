"use client";

import { useState } from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Switch from "@mui/material/Switch";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import { api } from "@/lib/api";
import { useAction, useResource } from "@/lib/useResource";
import { RENTAL_DEFAULTS, emptyRental, type RentalContentItem, type RentalPageContent } from "@/lib/rentalContent";
import { slugify } from "@/lib/contentPages";
import { ConfirmDialog, ErrorState, Field, FormDialog, LIME, LoadingState, PageHeader, Panel, Toast } from "@/components/admin/ui";
import RichTextEditor from "@/components/admin/RichTextEditor";
import ImageUploadField from "@/components/admin/ImageUploadField";
import RentalContentFields, { type ContentValue } from "@/components/admin/RentalContentFields";

const selectPage = (raw: unknown) => [raw as RentalPageContent];
const sectionNames: Record<keyof RentalPageContent["sections"], string> = {
  RentalsIntro: "Introduction", HotShotRentals: "Equipment listing heading", WhyRentWithUs: "Why rent with us",
  RentalHowItWorks: "How it works", RentalFaq: "Frequently asked questions", RentalFinalCta: "Final call-to-action",
  RentalDetailContent: "Sub-page headings, labels and booking information", RentalCard: "Equipment card label",
};
const fields = [
  ["desc", "Description shown on the card and detail page"], ["priceHint", "Rental rate (for example From $80/hour)"],
  ["pricingIncludes", "Pricing / tax note"], ["category", "Category"], ["size", "Size / dimensions"],
  ["capacity", "Capacity"], ["hitch", "Hitch"], ["location", "Service area / location"],
  ["equipment", "Equipment included"], ["deposit", "Deposit"], ["requirements", "Rental requirements"],
  ["minAge", "Minimum age"], ["meta_title", "SEO meta title"], ["meta_description", "SEO meta description"],
] as const;

export default function RentalPagesEditor() {
  const pages = useResource<RentalPageContent>("/api/rental-content/page", selectPage);
  const rentals = useResource<RentalContentItem>("/api/rental-content/items/all");
  const saved = pages.items[0];
  const savedKey = JSON.stringify(saved);
  const [base, setBase] = useState(savedKey);
  const [page, setPage] = useState<RentalPageContent>(saved ?? structuredClone(RENTAL_DEFAULTS.page));
  if (base !== savedKey) { setBase(savedKey); if (saved) setPage(structuredClone(saved)); }
  const [tab, setTab] = useState(0);
  const [draft, setDraft] = useState<RentalContentItem | null>(null);
  const [deleting, setDeleting] = useState<RentalContentItem | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const {busy, error, setError, run} = useAction();

  const savePage = async () => {
    if (await run(() => api.put("/api/rental-content/page", page))) {
      await pages.reload(); setToast("Rental page content saved. Changes are live.");
    }
  };
  const saveItem = async () => {
    if (!draft) return;
    if (!draft.title.trim() || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(draft.slug)) {
      setError("Enter a title and a valid lowercase address with letters, numbers and hyphens."); return;
    }
    const body = Object.fromEntries(Object.entries(draft).filter(([key]) => !["id", "updated_at"].includes(key)));
    const ok = await run(() => draft.id ? api.put(`/api/rental-content/items/${draft.id}`, body) : api.post("/api/rental-content/items", body));
    if (ok) { setDraft(null); await rentals.reload(); setToast(draft.is_active ? "Equipment saved and published." : "Draft saved. It is not public."); }
  };
  const set = (patch: Partial<RentalContentItem>) => setDraft(old => old ? {...old, ...patch} : old);
  const remove = async () => {
    if (deleting && await run(() => api.del(`/api/rental-content/items/${deleting.id}`))) {
      setDeleting(null); await rentals.reload(); setToast("Equipment deleted. Existing rental requests were retained.");
    }
  };
  if (!saved && pages.loading) return <LoadingState label="Loading rental content…" />;
  if (!saved && pages.error) return <ErrorState message={pages.error} onRetry={pages.reload} />;
  const dirty = JSON.stringify(page) !== savedKey;

  return <Box sx={{display: "grid", gap: 3}}>
    <PageHeader title="Rental pages" subtitle="Edit /rentals and its equipment sub-pages. Existing quote requests and button behavior are unchanged.">
      <Button href="/rentals" target="_blank" rel="noopener" sx={{color: LIME}}>View rental page</Button>
    </PageHeader>
    <Alert severity="info">Rental requests remain in Rentals. Button labels, links and visibility remain in <Link href="/dashboard/settings?tab=buttons">Settings → Buttons</Link>.</Alert>
    <Tabs value={tab} onChange={(_, value) => {setTab(value); setError(null);}}>
      <Tab label="Page content" /><Tab label="Equipment & sub-pages" />
    </Tabs>
    {error && !draft && !deleting && <Alert severity="error">{error}</Alert>}
    {tab === 0 ? <>
      <Panel sx={{p: 3, display: "grid", gap: 3}}>
        <Typography variant="h6">Banner and SEO</Typography>
        <RentalContentFields value={page.hero} template={RENTAL_DEFAULTS.page.hero}
          onChange={v => setPage({...page, hero: v as RentalPageContent["hero"]})} />
        <RentalContentFields value={page.seo} template={RENTAL_DEFAULTS.page.seo}
          onChange={v => setPage({...page, seo: v as RentalPageContent["seo"]})} />
        <Typography variant="h6">Sub-page banner labels</Typography>
        <RentalContentFields value={page.detailHero} template={RENTAL_DEFAULTS.page.detailHero}
          onChange={v => setPage({...page, detailHero: v as RentalPageContent["detailHero"]})} />
      </Panel>
      {(Object.keys(sectionNames) as Array<keyof typeof sectionNames>).map(key => <Panel key={key} sx={{p: 3, display: "grid", gap: 2}}>
        <Typography variant="h6">{sectionNames[key]}</Typography>
        <RentalContentFields value={page.sections[key] as ContentValue} template={RENTAL_DEFAULTS.page.sections[key] as ContentValue}
          onChange={v => setPage({...page, sections: {...page.sections, [key]: v}} as RentalPageContent)} />
      </Panel>)}
      <Box sx={{position: "sticky", bottom: 12, p: 2, bgcolor: "#141414", borderRadius: 2, zIndex: 10}}>
        <Button variant="contained" disabled={busy || !dirty} onClick={() => void savePage()}>{busy ? "Saving…" : "Save rental page"}</Button>
        <Typography component="span" sx={{ml: 2}}>{dirty ? "Unsaved changes" : "All changes saved"}</Typography>
      </Box>
    </> : <>
      <Button variant="contained" sx={{justifySelf: "start"}} onClick={() => {setError(null); setDraft(emptyRental());}}>Add rental equipment</Button>
      {rentals.loading && !rentals.items.length ? <LoadingState /> : rentals.error ? <ErrorState message={rentals.error} onRetry={rentals.reload} /> :
        rentals.items.map(item => <Panel key={item.id} sx={{p: 2, display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap"}}>
          <Box sx={{flex: 1}}><Typography sx={{fontWeight: 800}}>{item.title}</Typography>
            <Typography variant="body2">/rentals/{item.slug} · {item.is_active ? "Published" : "Draft"} · Order {item.sort_order}</Typography></Box>
          {item.is_active && <Button href={`/rentals/${item.slug}`} target="_blank" rel="noopener">View</Button>}
          <Button onClick={() => {setError(null); setDraft({...emptyRental(), ...structuredClone(item),
            imageAlts: item.images.map((_, i) => item.imageAlts?.[i] ?? "")});}}>Edit</Button>
          <Button color="error" onClick={() => {setError(null); setDeleting(item);}}>Delete</Button>
        </Panel>)}
      {!rentals.loading && !rentals.error && !rentals.items.length && <Typography>No rental equipment yet. Add one to get started.</Typography>}
    </>}
    <FormDialog open={Boolean(draft)} title={draft?.id ? `Edit ${draft.title}` : "New rental equipment"}
      busy={busy} error={error} onClose={() => setDraft(null)} onSubmit={() => void saveItem()} maxWidth="md"
      submitLabel={draft?.is_active ? "Save and publish" : "Save draft"}>
      {draft && <>
        <Box component="label"><Switch checked={draft.is_active} onChange={e => set({is_active: e.target.checked})} />Published</Box>
        <Field label="Title" value={draft.title} onChange={e => set({title: e.target.value,
          ...(!draft.slug || draft.slug === slugify(draft.title) ? {slug: slugify(e.target.value)} : {})})} />
        <Field label="Address after /rentals/" value={draft.slug} onChange={e => set({slug: e.target.value})}
          helperText="Changing an existing address breaks old bookmarks. Use lowercase letters, numbers and single hyphens." />
        <Field type="number" label="Display order (lowest first)" value={draft.sort_order} onChange={e => set({sort_order: Number(e.target.value)})} />
        <Field select label="Availability" value={draft.availability} onChange={e => set({availability: e.target.value as RentalContentItem["availability"]})}>
          {["Available", "Limited", "On Request"].map(value => <MenuItem key={value} value={value}>{value}</MenuItem>)}
        </Field>
        {fields.map(([key, label]) => <Field key={key} label={label} value={draft[key] ?? ""} multiline
          minRows={key === "desc" ? 3 : 1} onChange={e => set({[key]: e.target.value})} />)}
        <Field label="Highlights (one per line)" value={(draft.specs ?? []).join("\n")}
          multiline minRows={3} onChange={e => set({specs: e.target.value.split("\n")})} />
        <RichTextEditor label="Additional detail content" value={draft.content_html ?? ""}
          onChange={content_html => set({content_html})} helperText="Optional formatted content on this equipment's detail page. The card description stays unchanged." />
        <Typography variant="h6">Image gallery — first image is the card image</Typography>
        {draft.images.map((url, index) => <Box key={index} sx={{p: 2, border: "1px solid #ffffff22", borderRadius: 2}}>
          <ImageUploadField label={`Image ${index + 1}`} value={{url, alt: draft.imageAlts?.[index] ?? ""}}
            defaultValue={{url: "", alt: ""}} altFallback={draft.title}
            onChange={image => {const images = [...draft.images], imageAlts = [...(draft.imageAlts ?? [])];
              images[index] = image.url; imageAlts[index] = image.alt; set({images, imageAlts});}} />
          <Field label="Image URL" value={url} onChange={e => set({images: draft.images.map((v, i) => i === index ? e.target.value : v)})} />
          <Button disabled={index === 0} onClick={() => {const images = [...draft.images], imageAlts = [...(draft.imageAlts ?? [])];
            [images[index - 1], images[index]] = [images[index], images[index - 1]];
            [imageAlts[index - 1], imageAlts[index]] = [imageAlts[index] ?? "", imageAlts[index - 1] ?? ""];
            set({images, imageAlts});}}>Move up</Button>
          <Button color="error" onClick={() => set({images: draft.images.filter((_, i) => i !== index),
            imageAlts: (draft.imageAlts ?? []).filter((_, i) => i !== index)})}>Remove image</Button>
        </Box>)}
        <Button disabled={draft.images.length >= 30} onClick={() => set({images: [...draft.images, ""], imageAlts: [...(draft.imageAlts ?? []), ""]})}>Add image</Button>
        <ImageUploadField label="Detail banner image" value={{url: draft.hero_image ?? "/images/breadcumb.jpg", alt: ""}}
          defaultValue={{url: "/images/breadcumb.jpg", alt: ""}} altFallback="Decorative banner" onChange={image => set({hero_image: image.url})} />
      </>}
    </FormDialog>
    <ConfirmDialog open={Boolean(deleting)} title="Delete rental equipment?" busy={busy}
      message={`This removes ${deleting?.title ?? "this rental"} from the website. Existing rental requests are kept.${error ? ` ${error}` : ""}`}
      onClose={() => setDeleting(null)} onConfirm={() => void remove()} />
    <Toast message={toast} onClose={() => setToast(null)} />
  </Box>;
}
