import fs from "node:fs";
import { zipSync, strToU8 } from "fflate";
fs.mkdirSync("work", { recursive: true });
fs.writeFileSync("work/import-check.docx", zipSync({ "word/document.xml": strToU8('<w:document xmlns:w="w"><w:body><w:p><w:pPr><w:pStyle w:val="Heading1"/></w:pPr><w:r><w:t>Office upload test</w:t></w:r></w:p><w:p><w:r><w:t>This text came from a Word document.</w:t></w:r></w:p></w:body></w:document>') }));
