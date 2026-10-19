/* Native Next.js on Vercel: bridge the existing SQLite/Drizzle queries to D1's HTTPS API. */
type Row = Record<string, unknown>;
type QueryResult = { results?: Row[]; meta?: Record<string, unknown>; success?: boolean };
function config() {
  const account = process.env.CF_ACCOUNT_ID, database = process.env.CF_D1_DATABASE_ID, token = process.env.CF_D1_API_TOKEN;
  if (!account || !database || !token) throw new Error("Configure CF_ACCOUNT_ID, CF_D1_DATABASE_ID and CF_D1_API_TOKEN on Vercel.");
  if (!/^[a-f0-9]{32}$/i.test(account) || !/^[a-f0-9-]{36}$/i.test(database)) throw new Error("Invalid D1 account or database ID.");
  return { url: `https://api.cloudflare.com/client/v4/accounts/${account}/d1/database/${database}/query`, token };
}
async function query(payload: { sql: string; params: unknown[] } | { batch: { sql: string; params: unknown[] }[] }): Promise<QueryResult[]> {
  const { url, token } = config();
  const response = await fetch(url, { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify(payload), cache: "no-store", signal: AbortSignal.timeout(25000) });
  if (!response.ok) throw new Error(`D1 query failed (${response.status}). Check the Vercel database settings.`);
  const data = await response.json() as { success?: boolean; result?: QueryResult[]; errors?: { message?: string }[] };
  if (!data.success || !Array.isArray(data.result) || data.result.some(x => !x.success)) throw new Error(`D1 query failed: ${data.errors?.[0]?.message || "database rejected request"}`);
  return data.result;
}
class Statement {
  constructor(readonly sql: string, readonly params: unknown[] = []) {}
  bind(...params: unknown[]) { return new Statement(this.sql, params); }
  async all() { return (await query({ sql: this.sql, params: this.params }))[0]; }
  async run() { return (await query({ sql: this.sql, params: this.params }))[0]; }
  async raw() { const result = await this.all(); return (result.results || []).map(row => Object.values(row)); }
  async first() { const result = await this.all(); return result.results?.[0] || null; }
}
const remoteD1 = {
  prepare(sql: string) { return new Statement(sql); },
  async batch(statements: Statement[]) { return query({ batch: statements.map(({ sql, params }) => ({ sql, params })) }); },
};
export const env = new Proxy({} as Record<string, unknown>, {
  get(_target, key) { return key === "DB" ? remoteD1 : process.env[String(key)]; },
});
