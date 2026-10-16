"use client";
import { useEffect, useState } from "react";
type Draft = { title: string; body: string; coverUrl: string };
export default function Uploads({ draft, change, notify }: { draft: Draft; change: (value: Partial<Draft>) => void; notify: (message: string) => void }) {
  const [cloud, setCloud] = useState(""); const [preset, setPreset] = useState(""); const [settings, setSettings] = useState(false); const [working, setWorking] = useState(false);
  useEffect(() => { try { const config = JSON.parse(localStorage.getItem("bp-media") || "{}"); setCloud(config.cloud || ""); setPreset(config.preset || ""); } catch {} }, []);
  async function importFile(file: File) {
    if (draft.body.trim() && !confirm("Replace the current title and article text with this document? Save the current article first if you want to keep it.")) return;
    setWorking(true);
    try {
      const { importDocument, uploadPhoto } = await import("@/lib/import-document");
      const result = await importDocument(file); let body = result.body;
      if (result.images.length && (!cloud || !preset)) throw new Error("This document contains photos. Configure Photo settings first, or remove its photos and import text only.");
      for (const image of result.images) body = body.replace(image.marker, await uploadPhoto(image.file, cloud, preset));
      if (body.length > 100000) throw new Error("Imported article exceeds 100,000 characters. Split it into smaller documents.");
      change({ title: result.title.slice(0, 220), body }); notify(`Imported ${file.name}. ${result.warnings.join(" ")}`);
    } catch (e) { notify(e instanceof Error ? e.message : "Import failed."); } finally { setWorking(false); }
  }
  async function photos(files: File[], cover: boolean) {
    setWorking(true);
    try {
      const { uploadPhoto } = await import("@/lib/import-document");
      if (files.length > 12) throw new Error("Upload up to 12 photos at once.");
      const urls: string[] = [];
      for (const file of files) urls.push(await uploadPhoto(file, cloud, preset));
      change(cover ? { coverUrl: urls[0] } : { body: draft.body + "\n\n" + urls.map(url => `![Photo](${url})`).join("\n\n") }); notify("Photos uploaded. Review the article before publishing.");
    } catch (e) { notify(e instanceof Error ? e.message : "Upload failed."); } finally { setWorking(false); }
  }
  return <section className="upload-panel"><div className="upload-actions"><label className="button-outline small">Import Word / LibreOffice<input aria-label="Import Word or LibreOffice document" type="file" accept=".docx,.odt,.md,.txt" disabled={working} onChange={e => { if (e.target.files?.[0]) void importFile(e.target.files[0]); e.target.value = ""; }} /></label><label className="button-outline small">Upload cover<input aria-label="Upload cover photo" type="file" accept="image/png,image/jpeg,image/webp,image/gif" disabled={working} onChange={e => { if (e.target.files?.length) void photos(Array.from(e.target.files), true); e.target.value = ""; }} /></label><label className="button-outline small">Add photos<input aria-label="Add article photos" type="file" accept="image/png,image/jpeg,image/webp,image/gif" multiple disabled={working} onChange={e => { if (e.target.files?.length) void photos(Array.from(e.target.files), false); e.target.value = ""; }} /></label><button className="text-button" onClick={() => setSettings(!settings)}>Photo settings</button></div><p>{working ? "Importing / uploading…" : "DOCX, ODT, Markdown or text · documents up to 10 MB · photos up to 5 MB each"}</p>{settings && <div className="media-settings"><p>Photos need public URLs to appear on other websites. Use your free Cloudinary account: Settings → Upload → Add upload preset → Unsigned. Restrict the preset to raster images and 5 MB. Uploaded photos become public.</p><div className="form-grid"><label>Cloud name<input value={cloud} onChange={e => setCloud(e.target.value)} /></label><label>Unsigned upload preset<input value={preset} onChange={e => setPreset(e.target.value)} /></label></div><button className="button-primary small" onClick={() => { localStorage.setItem("bp-media", JSON.stringify({ cloud: cloud.trim(), preset: preset.trim() })); setSettings(false); notify("Photo settings saved on this device."); }}>Save photo settings</button><a href="https://cloudinary.com/documentation/upload_presets" target="_blank" rel="noreferrer">Setup guide</a></div>}</section>;
}
