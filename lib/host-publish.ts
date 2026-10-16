import { Buffer } from "node:buffer";
import { gzipSync, zipSync, strToU8 } from "fflate";
import { blake3 } from "@noble/hashes/blake3.js";
import { hostById } from "./hosts.ts";
type Config = Record<string, string>;
const encode = encodeURIComponent;
const base64 = (s: string) => Buffer.from(s, "utf8").toString("base64");
async function call(url: string, headers: Record<string, string>, method = "GET", body?: unknown, raw = false): Promise<any> {
  const response = await fetch(url, { method, headers: { "User-Agent": "BulkPublisherStudio/2.0", ...(!raw && body !== undefined ? { "Content-Type": "application/json" } : {}), ...headers }, body: body === undefined ? undefined : raw ? body as BodyInit : JSON.stringify(body), signal: AbortSignal.timeout(30000), redirect: "manual" });
  if (!response.ok) throw new Error(`Host rejected request (${response.status}). Check token permissions, site setup and quota. Inspect the host before retrying.`);
  const text = await response.text();
  if (!text) return {};
  const data = JSON.parse(text);
  if (data.success === false || data.result === "error") throw new Error("The host rejected the deployment. Check its dashboard for details.");
  return data;
}
export function allowedHostUrl(value: string): string {
  const u = new URL(value);
  const suffixes = ["github.io", "gitlab.io", "codeberg.page", "netlify.app", "vercel.app", "neocities.org", "pages.dev", "web.app", "firebaseapp.com", "onrender.com", "appwrite.network"];
  if (u.protocol !== "https:" || u.username || u.password || u.port || !suffixes.some(s => u.hostname.endsWith("." + s))) throw new Error("Use the provider's public HTTPS subdomain. Custom domains are not supported for verification.");
  u.hash = ""; u.search = ""; return u.toString().replace(/\/$/, "");
}
export function validateHost(id: string, config: Config, token: string, second = "") {
  const host = hostById[id]; if (!host) throw new Error("Unknown host.");
  if (!token.trim()) throw new Error("Add the host's API token.");
  for (const field of host.fields) if (!field.optional && !config[field.key]?.trim()) throw new Error(`Add ${field.label}.`);
  if (config.url) allowedHostUrl(config.url);
  if (config.repo && !/^[\w.-]+\/[\w.-]+$/.test(config.repo)) throw new Error("Repository must be owner/name.");
  if (id === "render" && !second) throw new Error("Add the GitHub token as well as the Render token.");
  if (id === "appwrite" && !/^[a-z0-9-]+$/.test(config.region)) throw new Error("Invalid Appwrite region.");
}
async function githubCommit(c: Config, token: string, files: Record<string, string>) {
  const headers = { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" };
  const base = `https://api.github.com/repos/${c.repo}/git`;
  const ref = await call(`${base}/ref/heads/${encode(c.branch)}`, headers);
  const parent = await call(`${base}/commits/${ref.object.sha}`, headers);
  const tree = await call(`${base}/trees`, headers, "POST", { base_tree: parent.tree.sha, tree: Object.entries(files).map(([path, content]) => ({ path, content, mode: "100644", type: "blob" })) });
  const commit = await call(`${base}/commits`, headers, "POST", { message: "Publish article library", tree: tree.sha, parents: [ref.object.sha] });
  await call(`${base}/refs/heads/${encode(c.branch)}`, headers, "PATCH", { sha: commit.sha, force: false });
  return commit.sha;
}
function tar(files: Record<string, string>) {
  const parts: Uint8Array[] = [];
  for (const [name, value] of Object.entries(files)) {
    const bytes = strToU8(value), header = new Uint8Array(512);
    const put = (offset: number, text: string) => header.set(strToU8(text), offset);
    put(0, name); put(100, "0000644\0"); put(108, "0000000\0"); put(116, "0000000\0"); put(124, bytes.length.toString(8).padStart(11, "0") + "\0"); put(136, "00000000000\0"); put(148, "        "); put(156, "0"); put(257, "ustar\0"); put(263, "00");
    put(148, header.reduce((a, b) => a + b, 0).toString(8).padStart(6, "0") + "\0 ");
    parts.push(header, bytes, new Uint8Array((512 - bytes.length % 512) % 512));
  }
  parts.push(new Uint8Array(1024)); const result = new Uint8Array(parts.reduce((n, b) => n + b.length, 0)); let offset = 0;
  for (const part of parts) { result.set(part, offset); offset += part.length; } return gzipSync(result);
}
export async function deployHost(id: string, c: Config, token: string, second: string, files: Record<string, string>): Promise<{ url: string; remoteId: string }> {
  validateHost(id, c, token, second);
  const auth = { Authorization: `Bearer ${token}` }; let url = c.url || "", remoteId = "";
  if (id === "github" || id === "render") {
    remoteId = await githubCommit(c, id === "render" ? second : token, files);
    if (id === "render") { const d = await call(`https://api.render.com/v1/services/${encode(c.site)}/deploys`, auth, "POST", { commitId: remoteId }); remoteId = d.id; }
  } else if (id === "gitlab") {
    const base = `https://gitlab.com/api/v4/projects/${encode(c.project)}/repository`;
    const existing = new Set<string>();
    for (let page = 1; page <= 20; page++) {
      const listing = await call(`${base}/tree?ref=${encode(c.branch)}&per_page=100&page=${page}`, auth);
      for (const entry of listing) existing.add(entry.path);
      if (listing.length < 100) break;
      if (page === 20) throw new Error("This repository has too many root files. Use a dedicated article repository.");
    }
    const d = await call(`${base}/commits`, auth, "POST", { branch: c.branch, commit_message: "Publish article library", actions: Object.entries(files).map(([file_path, content]) => ({ action: existing.has(file_path) ? "update" : "create", file_path, content })) }); remoteId = d.id;
  } else if (id === "codeberg") {
    const base = `https://codeberg.org/api/v1/repos/${c.repo}`;
    const headers = { Authorization: `token ${token}` };
    const listing = await call(`${base}/contents?ref=${encode(c.branch)}`, headers);
    const existing = new Map(listing.map((e: any) => [e.path, e.sha]));
    const d = await call(`${base}/contents`, headers, "POST", { branch: c.branch, message: "Publish article library", files: Object.entries(files).map(([path, content]) => ({ operation: existing.has(path) ? "update" : "create", path, content: base64(content), sha: existing.get(path) })) }); remoteId = d.commit?.sha || "";
  } else if (id === "netlify") {
    const zipped = zipSync(Object.fromEntries(Object.entries(files).map(([p, s]) => [p, strToU8(s)])));
    const d = await call(`https://api.netlify.com/api/v1/sites/${encode(c.site)}/deploys`, { ...auth, "Content-Type": "application/zip" }, "POST", zipped, true);
    url = d.deploy_ssl_url || d.ssl_url; remoteId = d.id;
  } else if (id === "vercel") {
    const d = await call(`https://api.vercel.com/v13/deployments${c.team ? `?teamId=${encode(c.team)}` : ""}`, auth, "POST", { name: "bulk-publisher-pages", project: c.project, target: "production", files: Object.entries(files).map(([file, data]) => ({ file, data, encoding: "utf-8" })), projectSettings: { framework: null, buildCommand: "", outputDirectory: ".", installCommand: "" } });
    url = `https://${d.url}`; remoteId = d.id;
  } else if (id === "neocities") {
    const info = await call("https://neocities.org/api/info", auth);
    const form = new FormData(); for (const [path, content] of Object.entries(files)) if (path !== ".nojekyll") form.append(path, new Blob([content]), path);
    await call("https://neocities.org/api/upload", auth, "POST", form, true);
    url = `https://${info.info.sitename}.neocities.org`;
  } else if (id === "cloudflare") {
    const base = `https://api.cloudflare.com/client/v4/accounts/${encode(c.account)}/pages/projects/${encode(c.project)}`;
    const jwt = (await call(`${base}/upload-token`, auth)).result.jwt;
    const assets = Object.entries(files).map(([path, value]) => { const b64 = base64(value); const ext = path.includes(".") ? path.split(".").pop()! : ""; const key = Buffer.from(blake3(strToU8(b64 + ext))).toString("hex").slice(0, 32); return { path, key, value: b64, metadata: { contentType: path.endsWith(".html") ? "text/html; charset=utf-8" : "application/json" }, base64: true }; });
    await call("https://api.cloudflare.com/client/v4/pages/assets/upload", { Authorization: `Bearer ${jwt}` }, "POST", assets.map(({ path, ...a }) => a));
    await call("https://api.cloudflare.com/client/v4/pages/assets/upsert-hashes", { Authorization: `Bearer ${jwt}` }, "POST", { hashes: assets.map(a => a.key) });
    const form = new FormData(); form.set("manifest", JSON.stringify(Object.fromEntries(assets.map(a => ["/" + a.path, a.key])))); form.set("branch", c.branch);
    const d = await call(`${base}/deployments`, auth, "POST", form, true); url = d.result.url; remoteId = d.result.id;
  } else if (id === "firebase") {
    const base = "https://firebasehosting.googleapis.com/v1beta1";
    const d = await call(`${base}/sites/${encode(c.site)}/versions`, auth, "POST", {});
    if (!/^sites\/[^/]+\/versions\/[^/]+$/.test(d.name)) throw new Error("Unexpected Firebase version.");
    const compressed = await Promise.all(Object.entries(files).map(async ([path, data]) => { const bytes = gzipSync(strToU8(data)); const hash = Buffer.from(await crypto.subtle.digest("SHA-256", new Uint8Array(bytes))).toString("hex"); return { path, bytes, hash }; }));
    const needed = await call(`${base}/${d.name}:populateFiles`, auth, "POST", { files: Object.fromEntries(compressed.map(f => ["/" + f.path, f.hash])) });
    const upload = new URL(needed.uploadUrl); if (upload.origin !== "https://upload-firebasehosting.googleapis.com") throw new Error("Unexpected Firebase upload host.");
    for (const f of compressed) if (needed.uploadRequiredHashes?.includes(f.hash)) await call(`${upload}/${f.hash}`, { ...auth, "Content-Type": "application/octet-stream" }, "POST", f.bytes, true);
    await call(`${base}/${d.name}?update_mask=status`, auth, "PATCH", { status: "FINALIZED" });
    await call(`${base}/sites/${encode(c.site)}/releases?versionName=${encode(d.name)}`, auth, "POST");
    url = `https://${c.site}.web.app`; remoteId = d.name;
  } else if (id === "appwrite") {
    const form = new FormData(); form.set("code", new Blob([new Uint8Array(tar(files))], { type: "application/gzip" }), "site.tar.gz"); form.set("activate", "true"); form.set("installCommand", ""); form.set("buildCommand", ""); form.set("outputDirectory", ".");
    const d = await call(`https://${c.region}.cloud.appwrite.io/v1/sites/${encode(c.site)}/deployments`, { "X-Appwrite-Project": c.project, "X-Appwrite-Key": token }, "POST", form, true); remoteId = d.$id;
  }
  return { url: allowedHostUrl(url), remoteId };
}
export async function verifyHost(url: string, runId: string) {
  try { const response = await fetch(`${allowedHostUrl(url)}/bp-manifest.json?check=${encode(runId)}`, { cache: "no-store", redirect: "manual", signal: AbortSignal.timeout(10000) }); if (!response.ok) return false; const text = await response.text(); return text.length < 10000 && JSON.parse(text).runId === runId; } catch { return false; }
}
