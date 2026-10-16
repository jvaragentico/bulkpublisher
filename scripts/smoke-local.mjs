import assert from "node:assert/strict";
import { unzipSync, strFromU8 } from "fflate";
const base = "http://127.0.0.1:8787"; let cookie = "";
async function req(path, method = "GET", body, extra = {}) {
  const response = await fetch(base + path, { method, headers: { ...(cookie ? { Cookie: cookie } : {}), ...(body ? { "Content-Type": "application/json", Origin: base } : {}), ...extra }, body: body ? JSON.stringify(body) : undefined });
  return new Response(await response.arrayBuffer(), { status: response.status, headers: response.headers });
}
assert.equal((await req("/api/bootstrap")).status, 401);
assert.equal((await req("/api/auth", "POST", { username: "admin", password: "wrong" })).status, 401);
const login = await req("/api/auth", "POST", { username: "admin", password: process.env.ADMIN_PASSWORD || "admin" });
assert.equal(login.status, 200); const setCookie = login.headers.get("set-cookie"); assert.match(setCookie, /HttpOnly/); assert.match(setCookie, /SameSite=Strict/); cookie = setCookie.split(";")[0];
assert.equal((await req("/api/articles", "POST", { title: "Cross-site" }, { Origin: "https://example.org" })).status, 400);
const invalid = await req("/api/articles", "POST", { id: "../invalid", title: "Invalid" }); assert.equal(invalid.status, 400, await invalid.text());
const article = { title: "Local end-to-end test", body: "## Testing\n\nA **real** saved draft.\n\n![Photo](https://example.com/photo.jpg)", excerpt: "Local test only", keywords: ["test"], coverUrl: "", videoUrl: "", canonicalUrl: "" };
const saved = await req("/api/articles", "POST", article); assert.equal(saved.status, 200); const { id } = await saved.json();
try {
  const boot = await (await req("/api/bootstrap")).json(); assert.ok(boot.articles.some(a => a.id === id));
  assert.equal((await req("/api/publish", "POST", { articleId: id, platformId: "dev", token: "" })).status, 400);
  assert.equal((await req("/api/hosting", "POST", { provider: "netlify", config: { site: "test" }, articleIds: [id], token: "", overwriteApproved: true })).status, 400);
  assert.equal((await req("/api/settings", "POST", { platformId: "medium", siteId: "javascript:alert(1)" })).status, 400);
  const zip = await req("/api/export"); assert.equal(zip.status, 200); const files = unzipSync(new Uint8Array(await zip.arrayBuffer())); assert.ok(strFromU8(files[`${id}.html`]).includes("<strong>real</strong>"));
  assert.equal((await req("/api/deliveries", "POST", { articleId: id, platformId: "medium", url: "https://medium.com/test-only", views: 3 })).status, 200);
  const after = await (await req("/api/bootstrap")).json(); assert.ok(after.deliveries.some(d => d.articleId === id && d.views === 3));
} finally { assert.equal((await req("/api/articles", "DELETE", { id })).status, 200); }
assert.equal((await req("/api/auth", "DELETE", {})).status, 200);
assert.equal((await req("/api/bootstrap")).status, 401);
console.log("PASS: authentication, wrong-password rejection, CSRF, article validation, save/read/delete, missing credentials, unsafe URL rejection, HTML ZIP export, manual records, logout revocation.");
