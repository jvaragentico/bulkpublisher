import { unzipSync, strFromU8 } from "fflate";

export type ImportedDocument = { title: string; body: string; images: { marker: string; file: File }[]; warnings: string[] };
const mime: Record<string, string> = { png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", gif: "image/gif", webp: "image/webp" };

// Only office ZIP XML and raster images are read. Macros and external resources are never executed.
export async function importDocument(file: File): Promise<ImportedDocument> {
  if (file.size > 10 * 1024 * 1024) throw new Error("Documents must be 10 MB or smaller.");
  const ext = file.name.split(".").pop()?.toLowerCase();
  const result: ImportedDocument = { title: file.name.replace(/\.[^.]+$/, "").replace(/[_-]/g, " "), body: "", images: [], warnings: [] };
  if (ext === "txt" || ext === "md") { result.body = await file.text(); return result; }
  if (ext !== "docx" && ext !== "odt") throw new Error("Use .docx, .odt, .md or .txt. In Word/LibreOffice, save old .doc files as .docx first.");
  let total = 0;
  const zip = unzipSync(new Uint8Array(await file.arrayBuffer()), { filter(entry) {
    total += entry.originalSize;
    if (total > 30 * 1024 * 1024) throw new Error("Expanded document exceeds 30 MB.");
    return !entry.name.includes("..") && /^(word\/|Pictures\/|content\.xml)/.test(entry.name);
  } });
  const xml = (name: string) => {
    if (!zip[name]) throw new Error(`Document is missing ${name}.`);
    const source = strFromU8(zip[name]);
    if (/<!DOCTYPE|<!ENTITY/i.test(source)) throw new Error("Document contains unsupported XML declarations.");
    const doc = new DOMParser().parseFromString(source, "application/xml");
    if (doc.getElementsByTagName("parsererror").length) throw new Error("Document XML is damaged.");
    return doc;
  };
  function addImage(path: string) {
    path = path.replace(/^\.\//, "");
    const bytes = zip[path]; const type = mime[path.split(".").pop()?.toLowerCase() || ""];
    if (!bytes || !type || result.images.length >= 12 || bytes.length > 5 * 1024 * 1024) { result.warnings.push("An unsupported or oversized embedded image was skipped."); return ""; }
    const marker = `BP_IMAGE_${result.images.length + 1}`;
    result.images.push({ marker, file: new File([new Uint8Array(bytes)], path.split("/").pop() || "photo.png", { type }) });
    return `\n\n![Document photo](${marker})\n\n`;
  }
  const relationships: Record<string, string> = {};
  if (ext === "docx" && zip["word/_rels/document.xml.rels"]) {
    for (const node of Array.from(xml("word/_rels/document.xml.rels").getElementsByTagName("Relationship"))) relationships[node.getAttribute("Id") || ""] = node.getAttribute("Target") || "";
  }
  const doc = xml(ext === "docx" ? "word/document.xml" : "content.xml");
  function content(node: Node): string {
    if (node.nodeType === 3) return node.textContent || "";
    if (node.nodeType !== 1) return "";
    const el = node as Element;
    if (el.tagName === "w:pPr" || el.tagName === "w:rPr") return "";
    if (el.tagName === "a:blip") return addImage("word/" + (relationships[el.getAttribute("r:embed") || ""] || ""));
    if (el.tagName === "draw:image") return addImage(el.getAttribute("xlink:href") || "");
    if (["w:br", "text:line-break"].includes(el.tagName)) return "\n";
    if (["w:tab", "text:tab"].includes(el.tagName)) return "  ";
    if (el.tagName === "text:s") return " ".repeat(Math.min(100, Number(el.getAttribute("text:c")) || 1));
    let value = Array.from(el.childNodes).map(content).join("");
    const href = el.tagName === "w:hyperlink" ? relationships[el.getAttribute("r:id") || ""] : el.tagName === "text:a" ? el.getAttribute("xlink:href") : null;
    if (href && /^https:\/\//.test(href)) value = `[${value}](${href.replace(/[\s)]/g, encodeURIComponent)})`;
    if (el.tagName === "w:r" && value.trim()) {
      if (el.getElementsByTagName("w:b").length) value = `**${value}**`;
      if (el.getElementsByTagName("w:i").length) value = `*${value}*`;
    }
    return value;
  }
  const paragraphs = Array.from(doc.getElementsByTagName("*" )).filter(el => ext === "docx" ? el.tagName === "w:p" : ["text:p", "text:h"].includes(el.tagName));
  const blocks = paragraphs.map(el => {
    const value = content(el).trim();
    const style = el.getElementsByTagName("w:pStyle")[0]?.getAttribute("w:val") || "";
    const level = ext === "odt" && el.tagName === "text:h" ? Number(el.getAttribute("text:outline-level")) || 1 : /Heading([1-6])/i.exec(style)?.[1];
    if (level) return `${"#".repeat(Math.min(6, Number(level)))} ${value}`;
    if (el.getElementsByTagName("w:numPr").length || el.parentElement?.tagName === "text:list-item") return `- ${value}`;
    return value;
  }).filter(Boolean);
  if (blocks[0]?.startsWith("# ")) result.title = blocks.shift()!.slice(2);
  result.body = blocks.join("\n\n");
  if (!result.body.trim()) throw new Error("No readable article text was found in this document.");
  result.warnings.push("Review imported formatting. Tables, footnotes and page layout are simplified.");
  return result;
}

export async function uploadPhoto(file: File, cloud: string, preset: string): Promise<string> {
  if (!cloud || !preset) throw new Error("Open Photo settings and add your Cloudinary cloud name and unsigned upload preset first.");
  if (!/^[a-zA-Z0-9_-]+$/.test(cloud)) throw new Error("Invalid Cloudinary cloud name.");
  if (!["image/jpeg", "image/png", "image/gif", "image/webp"].includes(file.type)) throw new Error("Use JPG, PNG, GIF or WebP photos.");
  if (file.size > 5 * 1024 * 1024) throw new Error("Each photo must be 5 MB or smaller.");
  const form = new FormData(); form.append("file", file); form.append("upload_preset", preset);
  const response = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(cloud)}/image/upload`, { method: "POST", body: form, signal: AbortSignal.timeout(60000) });
  const data = await response.json() as Record<string, any>;
  if (!response.ok || !data.secure_url?.startsWith("https://res.cloudinary.com/")) throw new Error(data.error?.message || "Image upload failed.");
  return data.secure_url;
}
