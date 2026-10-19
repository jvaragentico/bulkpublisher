import fs from "node:fs";
import path from "node:path";

const account = process.env.CF_ACCOUNT_ID;
const database = process.env.CF_D1_DATABASE_ID;
const token = process.env.CF_D1_API_TOKEN;
if (!account || !database || !token) {
  console.error("Set CF_ACCOUNT_ID, CF_D1_DATABASE_ID and CF_D1_API_TOKEN before running this command.");
  process.exit(1);
}
if (!/^[a-f0-9]{32}$/i.test(account) || !/^[a-f0-9-]{36}$/i.test(database)) {
  console.error("Check the Cloudflare account ID and D1 database ID.");
  process.exit(1);
}
const endpoint = `https://api.cloudflare.com/client/v4/accounts/${account}/d1/database/${database}/query`;
async function query(body) {
  const response = await fetch(endpoint, { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify(body), signal: AbortSignal.timeout(30000) });
  const data = await response.json();
  if (!response.ok || !data.success || !Array.isArray(data.result) || data.result.some(item => !item.success)) throw new Error(`D1 request failed (${response.status}): ${data.errors?.[0]?.message || "check token permissions and database"}`);
  return data.result;
}
await query({ sql: "CREATE TABLE IF NOT EXISTS bp_source_migrations (name TEXT PRIMARY KEY NOT NULL)" });
const dir = path.join(process.cwd(), "drizzle");
const files = fs.readdirSync(dir).filter(name => /^\d+_.*\.sql$/.test(name)).sort();
for (const file of files) {
  const applied = await query({ sql: "SELECT name FROM bp_source_migrations WHERE name = ?", params: [file] });
  if (applied[0]?.results?.length) { console.log(`Already applied: ${file}`); continue; }
  const statements = fs.readFileSync(path.join(dir, file), "utf8").split(/--> statement-breakpoint\s*/).map(sql => sql.trim()).filter(Boolean).map(sql => ({ sql }));
  statements.push({ sql: "INSERT INTO bp_source_migrations (name) VALUES (?)", params: [file] });
  await query({ batch: statements });
  console.log(`Applied: ${file}`);
}
console.log("D1 setup complete.");
