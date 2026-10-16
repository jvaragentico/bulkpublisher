// Explicit live smoke test. Creates three public, labeled pages once; state prevents accidental duplicates.
import fs from "node:fs/promises";
import { publish, remoteJson } from "../lib/publish.ts";
await fs.mkdir("work", { recursive: true });
const path = "work/telegraph-test.json";
let state;
try { state = JSON.parse(await fs.readFile(path, "utf8")); } catch { state = { token: "", results: [] }; }
if (!state.token) {
  const account = await remoteJson("https://api.telegra.ph/createAccount", {}, { short_name: "BulkPublisherTests", author_name: "Bulk Publisher Studio" });
  state.token = account.result.access_token;
  await fs.writeFile(path, JSON.stringify(state));
}
const samples = [
  { title: "Bulk Publisher Studio: a live publishing test", body: "## A real public page\n\nThis page is a labeled test of Bulk Publisher Studio's Telegra.ph publishing connector. It was created through the public Telegraph API.\n\n## What this proves\n\n- A title and article body were submitted.\n- The platform returned a public article address.\n- The published content can be read without the dashboard login.\n\nThis test does not establish that other platforms are connected. Those accounts still need their own permissions and credentials." },
  { title: "Bulk Publisher Studio: media and formatting test", body: "## A small formatting check\n\nThis is the second labeled publishing test. It includes **bold text**, *emphasis*, a list, and a public sample image.\n\n- Write a clear title.\n- Add photos you have permission to use.\n- Review the published result.\n\nThe sample image below is Wikimedia's Example image. Uploading your own photos in the dashboard requires your configured image-host account.\n\n![Wikimedia sample image](https://upload.wikimedia.org/wikipedia/commons/a/a9/Example.jpg)\n\n[Image source](https://commons.wikimedia.org/wiki/File:Example.jpg)" },
  { title: "Bulk Publisher Studio: document-to-article workflow test", body: "## Prepare a document\n\nSave your Word document as DOCX or your LibreOffice document as ODT. Use headings and short paragraphs for a clean article.\n\n## Review before publishing\n\nAfter importing, review the title, text and images. Office page layout is simplified for web articles. Add your keywords and choose destinations.\n\n## Check the result\n\nThis third page is a labeled test publication. It demonstrates the publishing connector; it is not a claim that every provider accepts credential-free publishing. Account-based destinations require authentication and their own publishing permissions." },
];
for (let i = state.results.length; i < samples.length; i++) {
  const post = { ...samples[i], excerpt: "Labeled live publishing verification", keywords: '["publishing","test"]', coverUrl: "", videoUrl: "", canonicalUrl: "" };
  const result = await publish("telegraph", post, state.token, "");
  state.results.push({ title: post.title, url: result.url, checkedAt: new Date().toISOString() });
  await fs.writeFile(path, JSON.stringify(state));
}
for (const result of state.results) {
  const page = await remoteJson("https://api.telegra.ph/getPage/" + new URL(result.url).pathname.slice(1) + "?return_content=true", {});
  if (page.result.title !== result.title || !page.result.content?.length) throw new Error("Published content verification failed.");
  const response = await fetch(result.url);
  if (!response.ok) throw new Error("Public article did not return HTTP 200.");
}
await fs.mkdir("public", { recursive: true });
await fs.writeFile("public/test-results.json", JSON.stringify({ provider: "Telegra.ph", results: state.results }, null, 2));
process.stdout.write(JSON.stringify({ accountTokenSavedPrivately: true, results: state.results }));
