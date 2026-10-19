import { remoteJson, UnknownPublishError } from "./publish.ts";

export const remoteDeleteIds = ["mastodon", "bluesky", "telegram", "discord", "github-gist", "gitlab-snippet", "bitbucket-snippet", "matrix", "misskey", "lemmy", "paragraph"];
export function canDeleteRemote(id: string) { return remoteDeleteIds.includes(id); }
function expected(raw: string, host: string, pattern: RegExp) {
  const url = new URL(raw);
  if (url.protocol !== "https:" || url.hostname !== host || url.username || url.password) throw new Error("Saved URL does not belong to this platform.");
  const match = url.pathname.match(pattern);
  if (!match) throw new Error("Saved URL does not contain a valid remote post ID.");
  return match;
}
async function remove(url: string, headers: Record<string, string>, method = "DELETE", body?: unknown) {
  let response: Response;
  try { response = await fetch(url, { method, headers: { ...headers, ...(body ? { "Content-Type": "application/json" } : {}) }, body: body ? JSON.stringify(body) : undefined, redirect: "manual", signal: AbortSignal.timeout(25000) }); }
  catch { throw new UnknownPublishError("Delete response interrupted. Inspect the platform before retrying."); }
  if (response.status >= 500 || response.status >= 300 && response.status < 400) throw new UnknownPublishError("Delete result is uncertain. Inspect the platform before retrying.");
  if (!response.ok) throw new Error(`Remote delete was rejected (${response.status}). Check ownership and permissions.`);
}
function domain(value: string) {
  const url = new URL(value.startsWith("https://") ? value : `https://${value}`);
  if (url.protocol !== "https:" || url.username || url.password || url.port || url.pathname !== "/" || url.search || url.hash || !url.hostname.includes(".") || /^(\d+\.){3}\d+$/.test(url.hostname) || /(^|\.)(localhost|local|internal|test)$/.test(url.hostname)) throw new Error("Invalid instance URL.");
  return url.origin;
}

export async function deleteRemote(id: string, savedUrl: string, token: string, siteId: string) {
  if (!token) throw new Error("Add this platform's token in Platforms first.");
  if (id === "mastodon") {
    const base = domain(siteId); const url = new URL(savedUrl);
    if (url.origin !== base || !/\/\d+$/.test(url.pathname)) throw new Error("Saved Mastodon URL and instance do not match.");
    await remove(`${base}/api/v1/statuses/${url.pathname.split("/").at(-1)}`, { Authorization: `Bearer ${token}` });
  } else if (id === "bluesky") {
    const [, encodedDid, rkey] = expected(savedUrl, "bsky.app", /^\/profile\/([^/]+)\/post\/([a-zA-Z0-9]+)$/);
    const did = decodeURIComponent(encodedDid);
    if (!/^did:[a-z0-9:]+$/.test(did)) throw new Error("Saved Bluesky URL has an invalid account ID.");
    const session = await remoteJson("https://bsky.social/xrpc/com.atproto.server.createSession", {}, { identifier: siteId, password: token });
    if (session.did !== did) throw new Error("Saved post belongs to a different Bluesky account.");
    await remove("https://bsky.social/xrpc/com.atproto.repo.deleteRecord", { Authorization: `Bearer ${session.accessJwt}` }, "POST", { repo: did, collection: "app.bsky.feed.post", rkey });
  } else if (id === "telegram") {
    const [, channel, mid] = expected(savedUrl, "t.me", /^\/([A-Za-z0-9_]+)\/(\d+)$/);
    if (siteId !== `@${channel}`) throw new Error("Saved post belongs to a different channel.");
    await remoteJson(`https://api.telegram.org/bot${encodeURIComponent(token)}/deleteMessage`, {}, { chat_id: siteId, message_id: Number(mid) });
  } else if (id === "discord") {
    const [, , , mid] = expected(savedUrl, "discord.com", /^\/channels\/(\d+)\/(\d+)\/(\d+)$/);
    if (!/^https:\/\/discord(?:app)?\.com\/api\/webhooks\/\d+\/[A-Za-z0-9_-]+$/.test(token)) throw new Error("Invalid webhook URL.");
    await remove(`${token}/messages/${mid}`, {});
  } else if (id === "github-gist") {
    const [, gid] = expected(savedUrl, "gist.github.com", /^\/(?:[^/]+\/)?([a-f0-9]+)$/);
    await remove(`https://api.github.com/gists/${gid}`, { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" });
  } else if (id === "gitlab-snippet") {
    const [, sid] = expected(savedUrl, "gitlab.com", /^\/(?:-\/)?snippets\/(\d+)$/);
    await remove(`https://gitlab.com/api/v4/snippets/${sid}`, { "PRIVATE-TOKEN": token });
  } else if (id === "bitbucket-snippet") {
    const [, workspace, sid] = expected(savedUrl, "bitbucket.org", /^\/([^/]+)\/workspace\/snippets\/([^/]+)(?:\/.*)?$/);
    if (workspace !== siteId) throw new Error("Saved snippet belongs to a different workspace.");
    await remove(`https://api.bitbucket.org/2.0/snippets/${encodeURIComponent(workspace)}/${encodeURIComponent(sid)}`, { Authorization: `Bearer ${token}` });
  } else if (id === "matrix") {
    const [instance, room] = siteId.split("|").map(x => x.trim()); const base = domain(instance);
    const url = new URL(savedUrl);
    if (url.hostname !== "matrix.to") throw new Error("Saved URL is not a Matrix event link.");
    const parts = url.hash.replace(/^#\//, "").split("/").map(decodeURIComponent);
    if (parts.length !== 2 || parts[0] !== room || !parts[1].startsWith("$")) throw new Error("Saved Matrix room and event do not match.");
    await remoteJson(`${base}/_matrix/client/v3/rooms/${encodeURIComponent(room)}/redact/${encodeURIComponent(parts[1])}/${crypto.randomUUID()}`, { Authorization: `Bearer ${token}` }, {}, "PUT");
  } else if (id === "misskey") {
    const base = domain(siteId); const url = new URL(savedUrl);
    if (url.origin !== base || !/^\/notes\/[A-Za-z0-9]+$/.test(url.pathname)) throw new Error("Saved note and instance do not match.");
    await remoteJson(`${base}/api/notes/delete`, {}, { i: token, noteId: url.pathname.split("/").at(-1) });
  } else if (id === "lemmy") {
    const [instance] = siteId.split("|").map(x => x.trim()); const base = domain(instance); const url = new URL(savedUrl);
    if (url.origin !== base || !/^\/post\/\d+$/.test(url.pathname)) throw new Error("Saved post and instance do not match.");
    await remoteJson(`${base}/api/v3/post/delete`, { Authorization: `Bearer ${token}` }, { post_id: Number(url.pathname.split("/").at(-1)), deleted: true });
  } else if (id === "paragraph") {
    const [, publication, slug] = expected(savedUrl, "paragraph.com", /^\/@([a-zA-Z0-9_-]+)\/([a-zA-Z0-9_-]+)$/);
    const me = await remoteJson("https://public.api.paragraph.com/api/v1/me", { Authorization: `Bearer ${token}` });
    if (me.slug !== publication) throw new Error("Saved post belongs to another Paragraph publication.");
    await remove(`https://public.api.paragraph.com/api/v1/posts/slug/${encodeURIComponent(slug)}`, { Authorization: `Bearer ${token}` });
  } else throw new Error("This platform does not offer a supported remote delete in this dashboard. Remove the dashboard record separately.");
}
