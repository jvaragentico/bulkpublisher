import test from "node:test";
import assert from "node:assert/strict";
import { DOMParser } from "@xmldom/xmldom";
import { zipSync, strToU8 } from "fflate";
import { importDocument, uploadPhoto } from "../lib/import-document.ts";
globalThis.DOMParser = DOMParser;
function office(name, files) { return new File([zipSync(Object.fromEntries(Object.entries(files).map(([p,s]) => [p, strToU8(s)])))], name); }
test("Word DOCX imports heading, bold text and hyperlinks", async () => {
  const file = office("test.docx", { "word/document.xml": '<w:document xmlns:w="w" xmlns:r="r"><w:body><w:p><w:pPr><w:pStyle w:val="Heading1"/></w:pPr><w:r><w:t>My title</w:t></w:r></w:p><w:p><w:r><w:rPr><w:b/></w:rPr><w:t>Bold paragraph</w:t></w:r></w:p><w:p><w:hyperlink r:id="r1"><w:r><w:t>Read more</w:t></w:r></w:hyperlink></w:p></w:body></w:document>', "word/_rels/document.xml.rels": '<Relationships><Relationship Id="r1" Target="https://example.com"/></Relationships>' });
  const result = await importDocument(file); assert.equal(result.title, "My title"); assert.ok(result.body.includes("**Bold paragraph**")); assert.ok(result.body.includes("[Read more](https://example.com)"));
});
test("LibreOffice ODT imports headings and paragraphs", async () => { const result = await importDocument(office("sample.odt", { "content.xml": '<office:document xmlns:office="o" xmlns:text="t"><text:h text:outline-level="1">LibreOffice title</text:h><text:p>A useful paragraph.</text:p></office:document>' })); assert.equal(result.title, "LibreOffice title"); assert.equal(result.body, "A useful paragraph."); });
test("legacy DOC and oversized uploads are rejected with useful errors", async () => { await assert.rejects(importDocument(new File(["legacy"], "old.doc")), /docx first/); await assert.rejects(uploadPhoto(new File(["x"], "x.svg", { type: "image/svg+xml" }), "cloud", "preset"), /JPG/); await assert.rejects(uploadPhoto(new File(["x"], "x.jpg", { type: "image/jpeg" }), "", ""), /Photo settings/); });
test("photo upload sends multipart data and returns the hosted image", async () => { const previous = globalThis.fetch; try { globalThis.fetch = async (url, init) => { assert.equal(url, "https://api.cloudinary.com/v1_1/demo/image/upload"); assert.equal(init.body.get("upload_preset"), "preset"); return Response.json({ secure_url: "https://res.cloudinary.com/demo/image/upload/photo.jpg" }); }; assert.match(await uploadPhoto(new File(["x"], "photo.jpg", { type: "image/jpeg" }), "demo", "preset"), /^https:\/\/res.cloudinary/); } finally { globalThis.fetch = previous; } });
test("office XML external entity declarations are rejected", async () => { await assert.rejects(importDocument(office("bad.odt", { "content.xml": '<!DOCTYPE x [<!ENTITY y SYSTEM "file:///secret">]><x/>' })), /unsupported XML/); });
