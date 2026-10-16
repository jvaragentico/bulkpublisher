import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL("../", import.meta.url)); process.chdir(root);
const mode = process.argv[2] || "serve";
function run(args) { const p = spawnSync(process.execPath, args, { cwd: root, stdio: "inherit" }); if (p.error) throw p.error; if (p.status) process.exit(p.status); }
if (!fs.existsSync("node_modules/wrangler/bin/wrangler.js")) throw new Error("Run npm ci first.");
if (!fs.existsSync(".dev.vars")) {
  fs.writeFileSync(".dev.vars", `LOCAL_ADMIN="1"\nADMIN_PASSWORD=${JSON.stringify(process.env.ADMIN_PASSWORD || "admin")}\n`, { mode: 0o600 });
  console.log("Created private .dev.vars settings. Change ADMIN_PASSWORD before sharing access.");
}
if (mode === "setup") run(["scripts/run-framework.mjs", "build"]);
if (!fs.existsSync("dist/server/wrangler.json")) throw new Error("Run npm run setup:local first.");
const config = JSON.parse(fs.readFileSync("dist/server/wrangler.json", "utf8"));
config.main = "dist/server/index.js"; config.assets.directory = "dist/client";
config.build = { watch_dir: "dist/server" }; config.d1_databases.forEach(db => { db.migrations_dir = "drizzle"; });
fs.writeFileSync("wrangler.local.json", JSON.stringify(config, null, 2));
const base = ["--import", "./scripts/sites-env.mjs", "./node_modules/wrangler/bin/wrangler.js"];
if (mode === "setup") {
  run([...base, "d1", "migrations", "apply", "DB", "--local", "--config", "wrangler.local.json", "--persist-to", ".wrangler/state"]);
  console.log("Ready. Run npm start, open http://127.0.0.1:8787 and sign in as admin.");
} else run([...base, "dev", "--config", "wrangler.local.json", "--local", "--persist-to", ".wrangler/state", "--ip", "127.0.0.1", "--port", "8787", "--inspector-port", "0"]);
