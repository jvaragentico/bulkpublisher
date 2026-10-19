import fs from "node:fs";
import path from "node:path";
import { zipSync, strToU8 } from "fflate";
const excluded = new Set(["node_modules", ".git", "dist", ".next", ".vinext", ".wrangler", ".sites-runtime", "outputs", "work", ".agents", ".codex", "coverage"]);
const files = {};
function walk(dir, relative = "") {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const name = entry.name, key = relative ? `${relative}/${name}` : name;
    if (excluded.has(name) || name === "CREDENTIALS.local.json" || name.startsWith(".env") || name.startsWith(".dev.vars") || /\.(zip|tar|tsbuildinfo|log|pem)$/.test(name) || name === "wrangler.local.json") continue;
    if (entry.isSymbolicLink()) continue;
    if (entry.isDirectory()) walk(path.join(dir, name), key);
    else files[key] = new Uint8Array(fs.readFileSync(path.join(dir, name)));
  }
}
walk(process.cwd());
files["ARCHIVE-CONTENTS.txt"] = strToU8("Extract this ZIP into a new empty folder. package.json, package-lock.json and START-WINDOWS.cmd are directly inside that folder. Double-click START-WINDOWS.cmd, or run npm ci, npm run setup:local and npm start one at a time. Copy CREDENTIALS.example.json to CREDENTIALS.local.json and fill it on your own computer. The dashboard imports this file only when you select it. Your local credential file, database, git history, dependencies and build output are excluded.\n");
fs.mkdirSync("outputs", { recursive: true });
fs.writeFileSync("outputs/bulkpublisher-source.zip", zipSync(files, { level: 6 }));
console.log(`Packaged ${Object.keys(files).length} source files into outputs/bulkpublisher-source.zip`);
