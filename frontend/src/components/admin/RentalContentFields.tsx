"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";
import { Field, LIME } from "@/components/admin/ui";
import ImageUploadField from "@/components/admin/ImageUploadField";

export type ContentValue = string | boolean | ContentValue[] | { [key: string]: ContentValue };
const labelFor = (key: string) => key.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, c => c.toUpperCase());

/** Structured controls, never a raw JSON editor. Templates keep empty lists editable. */
export default function RentalContentFields({ value, template, onChange, label = "" }: {
  value: ContentValue; template: ContentValue; onChange: (value: ContentValue) => void; label?: string;
}) {
  if (typeof value === "boolean") return (
    <Box component="label" sx={{ display: "flex", alignItems: "center", color: "#fff" }}>
      <Switch checked={value} onChange={e => onChange(e.target.checked)} />{label === "Enabled" ? "Show this section" : label}
    </Box>
  );
  if (typeof value === "string") {
    if (label === "Image") return <Box sx={{ display: "grid", gap: 2 }}>
      <ImageUploadField label="Banner image" value={{url: value, alt: ""}}
        defaultValue={{url: template as string, alt: ""}} altFallback="Decorative banner"
        onChange={image => onChange(image.url)} />
      <Field label="Image URL" value={value} onChange={e => onChange(e.target.value)} />
    </Box>;
    return <Field label={label} value={value} onChange={e => onChange(e.target.value)}
      multiline minRows={value.length > 120 ? 3 : 1} slotProps={{inputLabel: {shrink: true}}} />;
  }
  if (Array.isArray(value)) {
    const sample = Array.isArray(template) ? template[0] : "";
    const move = (index: number, delta: number) => {
      const next = [...value];
      [next[index], next[index + delta]] = [next[index + delta], next[index]];
      onChange(next);
    };
    return <Box sx={{ display: "grid", gap: 2 }}>
      <Typography sx={{color: "#fff", fontWeight: 700}}>{label}</Typography>
      {value.map((entry, index) => <Box key={index} sx={{border: "1px solid #ffffff22", borderRadius: 2, p: 2, display: "grid", gap: 2}}>
        <RentalContentFields value={entry} template={sample} label={`${label} ${index + 1}`}
          onChange={changed => onChange(value.map((old, i) => i === index ? changed : old))} />
        <Box>
          <Button disabled={index === 0} onClick={() => move(index, -1)}>Move up</Button>
          <Button disabled={index === value.length - 1} onClick={() => move(index, 1)}>Move down</Button>
          <Button color="error" onClick={() => onChange(value.filter((_, i) => i !== index))}>Remove</Button>
        </Box>
      </Box>)}
      <Button disabled={value.length >= 30} sx={{color: LIME, justifySelf: "start"}}
        onClick={() => onChange([...value, structuredClone(sample)])}>Add {label.toLowerCase()}</Button>
    </Box>;
  }
  const source = template as Record<string, ContentValue>;
  return <Box sx={{display: "grid", gap: 2}}>
    {Object.entries(value).map(([key, entry]) => <RentalContentFields key={key} label={labelFor(key)}
      value={entry} template={source[key]} onChange={changed => onChange({...value, [key]: changed})} />)}
  </Box>;
}
