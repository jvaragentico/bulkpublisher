import test from "node:test";
import assert from "node:assert/strict";
import { publish, validatePublish, markdownToHtml, UnknownPublishError, publicUrl } from "../lib/publish.ts";
import { deployHost, allowedHostUrl, verifyHost } from "../lib/host-publish.ts";
import { siteFiles } from "../lib/site-files.ts";
const post = { title: "Test title", body: "## Heading\n\n**Bold** and a [link](https://example.com).\n\n![Photo](https://example.com/photo.jpg)", excerpt: "Summary", keywords: '["Web Design","tests","Tests","a","b","c"]', coverUrl: "", videoUrl: "", canonicalUrl: "https://example.com/original" };
const realFetch = globalThis.fetch;
test.afterEach(() => { globalThis.fetch = realFetch; });
const response = data => Response.json(data);
test("unsafe HTML is escaped while HTTPS photos and formatting are preserved", () => { const html = markdownToHtml('<script>alert(1)</script>\n\n![x](https://example.com/a.jpg)\n\n[x](javascript:alert(1))'); assert.ok(!html.includes("<script>")); assert.ok(html.includes('<img src="https://example.com/a.jpg">')); assert.ok(!html.includes('href="javascript:')); });
test("publishing validates credentials and DEV front matter before network writes", () => { assert.throws(() => validatePublish("dev", post, "", ""), /token/); assert.throws(() => validatePublish("wordpress", post, "token", ""), /site/); assert.throws(() => validatePublish("dev", { ...post, body: "---\ntitle: Override\n---" }, "token", ""), /front matter/); });
for (const id of ["dev", "wordpress", "blogger", "telegraph", "telegraph-2", "telegraph-3", "telegraph-4", "tumblr"]) test(`${id} constructs the publishing request and extracts the mocked public URL`, async () => {
  const requests = []; globalThis.fetch = async (url, init) => {
    requests.push({ url: String(url), init });
    assert.equal(init.redirect, "manual", "Cloudflare supports manual redirects; credentials must not follow redirects");
    if (id === "dev") { const data = JSON.parse(init.body).article; assert.equal(data.published, true); assert.equal(data.tags.length, 4); assert.equal(data.tags[0], "webdesign"); return response({ url: "https://dev.to/test/post" }); }
    if (id === "wordpress") { assert.ok(JSON.parse(init.body).content.includes("<img")); return response({ URL: "https://test.wordpress.com/post" }); }
    if (id === "blogger") return response({ url: "https://test.blogspot.com/post" });
    if (id === "telegraph" || id.startsWith("telegraph-")) { assert.equal(JSON.parse(init.body).access_token, "token"); return response({ ok: true, result: { url: "https://telegra.ph/Test-10-16" } }); }
    return response(init.method === "POST" ? { response: { id: "123" } } : { response: { posts: [{ post_url: "https://test.tumblr.com/post/123" }] } });
  };
  const result = await publish(id, post, "token", "test"); assert.ok(result.url.startsWith("https://")); assert.ok(requests.some(r => r.init.method === "POST"));
});
test("network ambiguity does not become a safe-to-retry failure", async () => { globalThis.fetch = async () => { throw new Error("secret-token network error"); }; await assert.rejects(publish("dev", post, "secret-token", ""), UnknownPublishError); });
test("API redirects are not followed or treated as safe retries", async () => { let calls = 0; globalThis.fetch = async (_url, init) => { calls++; assert.equal(init.redirect, "manual"); return new Response(null, { status: 307, headers: { Location: "https://example.com/collect" } }); }; await assert.rejects(publish("telegraph", post, "secret-token", ""), UnknownPublishError); assert.equal(calls, 1); });
test("malformed success URLs require inspection before retrying", () => { assert.throws(() => publicUrl("bad-url"), UnknownPublishError); });
test("Tumblr accepted post stays uncertain if URL lookup fails", async () => { globalThis.fetch = async (url, init) => init.method === "POST" ? response({ response: { id: "123" } }) : Response.json({}, { status: 403 }); await assert.rejects(publish("tumblr", post, "token", "blog"), UnknownPublishError); });
test("authentication errors never echo credential text", async () => { globalThis.fetch = async () => Response.json({ error: "secret-token" }, { status: 401 }); await assert.rejects(publish("dev", post, "secret-token", ""), e => !e.message.includes("secret-token") && e.message.includes("Authentication")); });
test("static export escapes titles and includes separate articles and exact-run marker", () => { const files = siteFiles([{ ...post, id: "abc-123", title: '<script>bad</script>' }], "run-1"); assert.ok(files["abc-123.html"].includes("&lt;script&gt;")); assert.equal(JSON.parse(files["bp-manifest.json"]).runId, "run-1"); assert.ok(files["index.html"].includes("abc-123.html")); });
test("public checks cannot fetch arbitrary hosts or local services", () => { for (const u of ["http://127.0.0.1", "https://example.com", "https://test.github.io.evil.com", "https://user:pass@test.github.io", "https://test.github.io:444"]) assert.throws(() => allowedHostUrl(u)); assert.equal(allowedHostUrl("https://demo.github.io/blog/"), "https://demo.github.io/blog"); });
test("verification accepts only the exact current deployment marker", async () => { globalThis.fetch = async () => response({ runId: "old" }); assert.equal(await verifyHost("https://demo.netlify.app", "new"), false); globalThis.fetch = async () => response({ runId: "new" }); assert.equal(await verifyHost("https://demo.netlify.app", "new"), true); });
for (const id of ["github", "gitlab", "codeberg", "netlify", "vercel", "neocities", "cloudflare", "firebase", "render", "appwrite"]) test(`${id} deployment API contract and result URL`, async () => {
  const seen = []; const files = siteFiles([{ ...post, id: "abc-123" }], "run-test");
  const c = { repo: "owner/pages", branch: "main", site: "site1", project: "project1", account: "account1", region: "fra", url: id === "render" ? "https://demo.onrender.com" : id === "appwrite" ? "https://demo.appwrite.network" : `https://demo.${id === "codeberg" ? "codeberg.page" : id === "gitlab" ? "gitlab.io" : "github.io"}` };
  globalThis.fetch = async (url, init = {}) => {
    url = String(url); seen.push({ url, init });
    assert.equal(init.redirect, "manual");
    if (url.includes("api.github.com")) { if (url.includes("/ref/heads/")) return response({ object: { sha: "old" } }); if (url.endsWith("/commits/old")) return response({ tree: { sha: "base" } }); if (url.endsWith("/trees")) return response({ sha: "tree" }); return response({ sha: "commit" }); }
    if (id === "gitlab") return response(url.includes("/tree?") ? [] : { id: "commit" });
    if (id === "codeberg") return response(init.method === "GET" ? [] : { commit: { sha: "commit" } });
    if (id === "netlify") { assert.ok(init.body instanceof Uint8Array); return response({ ssl_url: "https://demo.netlify.app", id: "deploy" }); }
    if (id === "vercel") { assert.equal(JSON.parse(init.body).target, "production"); return response({ url: "demo.vercel.app", id: "deploy" }); }
    if (id === "neocities") return response(url.endsWith("/info") ? { info: { sitename: "demo" } } : { result: "success" });
    if (id === "cloudflare") return response({ success: true, result: url.endsWith("upload-token") ? { jwt: "jwt" } : url.endsWith("deployments") ? { url: "https://demo.pages.dev", id: "deploy" } : {} });
    if (id === "firebase") { if (url.endsWith("/versions")) return response({ name: "sites/site1/versions/1" }); if (url.includes(":populateFiles")) return response({ uploadRequiredHashes: [], uploadUrl: "https://upload-firebasehosting.googleapis.com/upload/sites/site1/versions/1/files" }); return response({}); }
    if (id === "appwrite") { assert.ok(init.body instanceof FormData); assert.equal(init.body.get("activate"), "true"); return response({ $id: "deploy" }); }
    return response({ id: "deploy" });
  };
  const result = await deployHost(id, c, "token", "github-token", files);
  assert.ok(result.url.startsWith("https://")); assert.ok(seen.some(r => r.init.method === "POST" || r.init.method === "PATCH"));
});
