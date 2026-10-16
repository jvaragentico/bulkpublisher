import fs from "node:fs";
import path from "node:path";
import { zipSync, strToU8 } from "fflate";
const excluded = new Set(["node_modules", ".git", "dist", ".next", ".vinext", ".wrangler", ".sites-runtime", "outputs", "work", ".agents", ".codex", "coverage"]);
const files = {};
function walk(dir, relative = "") {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const name = entry.name, key = relative ? `${relative}/${name}` : name;
    if (excluded.has(name) || name.startsWith(".env") || name.startsWith(".dev.vars") || /\.(zip|tar|tsbuildinfo|log|pem)$/.test(name) || name === "wrangler.local.json") continue;
    if (entry.isSymbolicLink()) continue;
    if (entry.isDirectory()) walk(path.join(dir, name), key);
    else files[`bulkpublisher/${key}`] = new Uint8Array(fs.readFileSync(path.join(dir, name)));
  }
}
walk(process.cwd());
files["bulkpublisher/ARCHIVE-CONTENTS.txt"] = strToU8("Complete runnable source, lockfile, tests, migrations and guides. Run npm ci to install dependencies. Credentials, local database, git history, build output and caches are intentionally excluded.\n");
fs.mkdirSync("outputs", { recursive: true });
fs.writeFileSync("outputs/bulkpublisher-source.zip", zipSync(files, { level: 6 }));
console.log(`Packaged ${Object.keys(files).length} source files into outputs/bulkpublisher-source.zip`);
