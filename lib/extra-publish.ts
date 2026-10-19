import { postHtml, postMarkdown, publicUrl, remoteJson, UnknownPublishError, type Post } from "./publish.ts";

export const extraApiIds = ["mastodon", "bluesky", "telegram", "discord", "github-gist", "gitlab-snippet", "bitbucket-snippet", "matrix", "misskey", "lemmy", "wordpress-org", "writefreely", "ghost", "paragraph"] as const;
export function isExtraApi(id: string) { return (extraApiIds as readonly string[]).includes(id); }

function origin(value: string) {
  const url = new URL(value.startsWith("https://") ? value : `https://${value}`);
  if (url.protocol !== "https:" || url.username || url.password || url.port || url.pathname !== "/" || url.search || url.hash || !/^[a-z0-9.-]+$/i.test(url.hostname) || !url.hostname.includes(".") || /(^|\.)(localhost|local|internal|test)$/.test(url.hostname) || /^(\d+\.){3}\d+$/.test(url.hostname)) throw new Error("Enter a public https:// instance domain without a path.");
  return url.origin;
}
function summary(post: Post, limit: number) {
  const body = post.excerpt.trim() || post.body.replace(/!\[[^\]]*\]\([^)]*\)/g, "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/[#*`>]/g, "").trim();
  const link = post.canonicalUrl || "";
  const suffix = link ? `\n\n${link}` : "";
  const heading = `${post.title.trim()}\n\n`;
  if (heading.length + suffix.length >= limit) throw new Error(`Title and link exceed this service's ${limit}-character post limit.`);
  const available = limit - heading.length - suffix.length;
  const clipped = body.length > available ? body.slice(0, Math.max(0, available - 1)).trimEnd() + "…" : body;
  return heading + clipped + suffix;
}
function splitSite(value: string) { const [domain, detail] = value.split("|").map(x => x.trim()); if (!domain || !detail) throw new Error("Enter instance URL | destination ID."); return { base: origin(domain), detail }; }
function requireId(value: unknown, label: string) { if (typeof value !== "string" && typeof value !== "number") throw new UnknownPublishError(`${label} was not returned. Inspect the platform before retrying.`); return String(value); }
function bearer(token: string) { return { Authorization: `Bearer ${token}` }; }
function basic(value: string) { return { Authorization: `Basic ${btoa(String.fromCharCode(...new TextEncoder().encode(value)))}` }; }
function base64url(bytes: Uint8Array) { return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); }
async function ghostJwt(key: string) {
  const [id, secret] = key.split(":");
  if (!/^[a-f0-9]{24}$/i.test(id || "") || !/^[a-f0-9]{64}$/i.test(secret || "")) throw new Error("Enter a Ghost Admin API key in id:secret form.");
  const now = Math.floor(Date.now() / 1000);
  const input = `${base64url(new TextEncoder().encode(JSON.stringify({ alg: "HS256", typ: "JWT", kid: id })))}.${base64url(new TextEncoder().encode(JSON.stringify({ iat: now, exp: now + 300, aud: "/admin/" })))}`;
  const raw = new Uint8Array(secret.match(/../g)!.map(part => parseInt(part, 16)));
  const cryptoKey = await crypto.subtle.importKey("raw", raw, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = new Uint8Array(await crypto.subtle.sign("HMAC", cryptoKey, new TextEncoder().encode(input)));
  return `${input}.${base64url(signature)}`;
}

export function validateExtra(id: string, post: Post, token: string, siteId: string) {
  if (!isExtraApi(id)) throw new Error("Unknown automatic destination.");
  if (!token.trim()) throw new Error("Add this service's token in Platforms.");
  if (!post.title.trim() || !post.body.trim()) throw new Error("Add title and article text first.");
  if (["mastodon", "bluesky", "telegram", "matrix", "misskey", "lemmy", "bitbucket-snippet", "wordpress-org", "writefreely", "ghost"].includes(id) && !siteId.trim()) throw new Error("Add the account, instance or target in Platforms.");
  if (["mastodon", "misskey", "wordpress-org", "ghost"].includes(id)) origin(siteId);
  if (["matrix", "lemmy", "writefreely"].includes(id)) splitSite(siteId);
  if (id === "bluesky" && !/^[a-z0-9.-]+$/i.test(siteId)) throw new Error("Enter your Bluesky handle without @.");
  if (id === "telegram" && !/^@[a-zA-Z0-9_]{5,}$/.test(siteId)) throw new Error("Enter your public channel username starting with @.");
  if (id === "discord" && !/^https:\/\/(discord\.com|discordapp\.com)\/api\/webhooks\/\d+\/[A-Za-z0-9_-]+$/.test(token)) throw new Error("Paste the complete Discord webhook URL in the token field.");
  if (id === "bitbucket-snippet" && !/^[a-zA-Z0-9_-]+$/.test(siteId)) throw new Error("Enter your Bitbucket workspace slug.");
  if (id === "wordpress-org" && !/^[^:]+:.+$/.test(token)) throw new Error("Enter username:application-password, not your normal login password.");
  if (id === "writefreely" && !/^[a-z0-9_-]+$/i.test(splitSite(siteId).detail)) throw new Error("Enter a valid WriteFreely collection alias.");
  if (id === "ghost" && !/^[a-f0-9]{24}:[a-f0-9]{64}$/i.test(token)) throw new Error("Enter a Ghost Admin API key in id:secret form.");
}

async function blueskySession(handle: string, password: string) {
  const data = await remoteJson("https://bsky.social/xrpc/com.atproto.server.createSession", {}, { identifier: handle, password });
  if (!data.accessJwt || !data.did) throw new Error("Bluesky did not accept that handle and app password.");
  return data;
}
async function bitbucketJson(url: string, token: string, body: FormData) {
  let response: Response;
  try { response = await fetch(url, { method: "POST", headers: bearer(token), body, redirect: "manual", signal: AbortSignal.timeout(25000) }); }
  catch { throw new UnknownPublishError("Bitbucket response interrupted. Inspect your snippets before retrying."); }
  if (response.status >= 500 || response.status >= 300 && response.status < 400) throw new UnknownPublishError("Bitbucket response uncertain. Inspect your snippets before retrying.");
  if (!response.ok) throw new Error(`Bitbucket rejected the request (${response.status}). Check token permissions and workspace.`);
  try { return await response.json(); } catch { throw new UnknownPublishError("Bitbucket response unreadable. Inspect your snippets before retrying."); }
}

export async function testExtra(id: string, token: string, siteId: string) {
  if (id === "mastodon") await remoteJson(`${origin(siteId)}/api/v1/accounts/verify_credentials`, bearer(token));
  else if (id === "bluesky") await blueskySession(siteId, token);
  else if (id === "telegram") await remoteJson(`https://api.telegram.org/bot${encodeURIComponent(token)}/getMe`, {});
  else if (id === "discord") await remoteJson(token, {});
  else if (id === "github-gist") await remoteJson("https://api.github.com/user", { ...bearer(token), Accept: "application/vnd.github+json" });
  else if (id === "gitlab-snippet") await remoteJson("https://gitlab.com/api/v4/user", { "PRIVATE-TOKEN": token });
  else if (id === "bitbucket-snippet") await remoteJson("https://api.bitbucket.org/2.0/user", bearer(token));
  else if (id === "matrix") { const { base } = splitSite(siteId); await remoteJson(`${base}/_matrix/client/v3/account/whoami`, bearer(token)); }
  else if (id === "misskey") await remoteJson(`${origin(siteId)}/api/i`, {}, { i: token });
  else if (id === "lemmy") { const { base } = splitSite(siteId); const data = await remoteJson(`${base}/api/v3/site`, bearer(token)); if (!data.my_user) throw new Error("Lemmy did not accept this account token."); }
  else if (id === "wordpress-org") await remoteJson(`${origin(siteId)}/wp-json/wp/v2/users/me?context=edit`, basic(token));
  else if (id === "writefreely") { const { base } = splitSite(siteId); await remoteJson(`${base}/api/me`, { Authorization: `Token ${token}` }); }
  else if (id === "ghost") await remoteJson(`${origin(siteId)}/ghost/api/admin/posts/?limit=1`, { Authorization: `Ghost ${await ghostJwt(token)}` });
  else if (id === "paragraph") { const me = await remoteJson("https://public.api.paragraph.com/api/v1/me", bearer(token)); if (!me.slug) throw new Error("Paragraph did not return a publication for this API key."); }
  else throw new Error("Unknown destination.");
}

export async function publishExtra(id: string, post: Post, token: string, siteId: string, requestId: string) {
  validateExtra(id, post, token, siteId);
  if (id === "mastodon") {
    const data = await remoteJson(`${origin(siteId)}/api/v1/statuses`, { ...bearer(token), "Idempotency-Key": requestId }, { status: summary(post, 500), visibility: "public" });
    return { url: publicUrl(data.url), views: 0 };
  }
  if (id === "bluesky") {
    const session = await blueskySession(siteId, token);
    const data = await remoteJson("https://bsky.social/xrpc/com.atproto.repo.createRecord", bearer(session.accessJwt), { repo: session.did, collection: "app.bsky.feed.post", record: { $type: "app.bsky.feed.post", text: summary(post, 300), createdAt: new Date().toISOString() } });
    const rkey = String(data.uri || "").split("/").at(-1);
    if (!/^[a-zA-Z0-9]+$/.test(rkey || "")) throw new UnknownPublishError("Bluesky accepted the post but returned no record ID. Inspect your profile.");
    return { url: `https://bsky.app/profile/${encodeURIComponent(session.did)}/post/${rkey}`, views: 0 };
  }
  if (id === "telegram") {
    const data = await remoteJson(`https://api.telegram.org/bot${encodeURIComponent(token)}/sendMessage`, {}, { chat_id: siteId, text: summary(post, 4096), disable_web_page_preview: false });
    const mid = requireId(data.result?.message_id, "Telegram message ID");
    return { url: `https://t.me/${siteId.slice(1)}/${mid}`, views: 0 };
  }
  if (id === "discord") {
    const data = await remoteJson(`${token}?wait=true`, {}, { content: summary(post, 2000), allowed_mentions: { parse: [] } });
    const guild = requireId(data.guild_id, "Discord server ID"), channel = requireId(data.channel_id, "Discord channel ID"), mid = requireId(data.id, "Discord message ID");
    return { url: `https://discord.com/channels/${guild}/${channel}/${mid}`, views: 0 };
  }
  if (id === "github-gist") {
    const data = await remoteJson("https://api.github.com/gists", { ...bearer(token), Accept: "application/vnd.github+json" }, { description: post.title, public: true, files: { "article.md": { content: `# ${post.title}\n\n${postMarkdown(post)}` } } });
    return { url: publicUrl(data.html_url), views: 0 };
  }
  if (id === "gitlab-snippet") {
    const data = await remoteJson("https://gitlab.com/api/v4/snippets", { "PRIVATE-TOKEN": token }, { title: post.title, visibility: "public", files: [{ file_path: "article.md", content: `# ${post.title}\n\n${postMarkdown(post)}` }] });
    return { url: publicUrl(data.web_url), views: 0 };
  }
  if (id === "bitbucket-snippet") {
    const body = new FormData(); body.set("title", post.title); body.set("is_private", "false"); body.set("article.md", `# ${post.title}\n\n${postMarkdown(post)}`);
    const data: any = await bitbucketJson(`https://api.bitbucket.org/2.0/snippets/${encodeURIComponent(siteId)}`, token, body);
    return { url: publicUrl(data.links?.html?.href), views: 0 };
  }
  if (id === "matrix") {
    const { base, detail: room } = splitSite(siteId);
    const data = await remoteJson(`${base}/_matrix/client/v3/rooms/${encodeURIComponent(room)}/send/m.room.message/${encodeURIComponent(requestId)}`, bearer(token), { msgtype: "m.text", body: summary(post, 10000) }, "PUT");
    const eid = requireId(data.event_id, "Matrix event ID");
    return { url: `https://matrix.to/#/${encodeURIComponent(room)}/${encodeURIComponent(eid)}`, views: 0 };
  }
  if (id === "misskey") {
    const base = origin(siteId); const data = await remoteJson(`${base}/api/notes/create`, {}, { i: token, text: summary(post, 3000), visibility: "public" });
    const nid = requireId(data.createdNote?.id, "Misskey note ID");
    return { url: `${base}/notes/${encodeURIComponent(nid)}`, views: 0 };
  }
  if (id === "wordpress-org") {
    const data = await remoteJson(`${origin(siteId)}/wp-json/wp/v2/posts`, basic(token), { title: post.title, content: postHtml(post), excerpt: post.excerpt, status: "publish" });
    return { url: publicUrl(data.link), views: 0 };
  }
  if (id === "writefreely") {
    const { base, detail } = splitSite(siteId);
    const data = await remoteJson(`${base}/api/collections/${encodeURIComponent(detail)}/posts`, { Authorization: `Token ${token}` }, { title: post.title, body: postMarkdown(post) });
    const returned = data.data;
    if (!returned?.slug || !returned?.collection?.url) throw new UnknownPublishError("WriteFreely returned no public collection link. Inspect your collection before retrying.");
    return { url: publicUrl(new URL(encodeURIComponent(String(returned.slug)), returned.collection.url).toString()), views: 0 };
  }
  if (id === "ghost") {
    const data = await remoteJson(`${origin(siteId)}/ghost/api/admin/posts/?source=html`, { Authorization: `Ghost ${await ghostJwt(token)}` }, { posts: [{ title: post.title, html: postHtml(post), status: "published", custom_excerpt: post.excerpt || undefined, feature_image: post.coverUrl || undefined }] });
    return { url: publicUrl(data.posts?.[0]?.url), views: 0 };
  }
  if (id === "paragraph") {
    const base = "https://public.api.paragraph.com/api/v1";
    const headers = bearer(token);
    const data = await remoteJson(`${base}/posts`, headers, { title: post.title.slice(0, 200), markdown: postMarkdown(post), subtitle: post.excerpt.slice(0, 300) || undefined, imageUrl: post.coverUrl || undefined, canonicalUrl: post.canonicalUrl || undefined, status: "published", sendNewsletter: false });
    const postId = requireId(data.id, "Paragraph post ID");
    if (data.status !== "published") throw new UnknownPublishError(`Paragraph returned ${String(data.status)} for post ${postId}. Inspect your publication before retrying.`);
    try {
      const [me, created] = await Promise.all([remoteJson(`${base}/me`, headers), remoteJson(`${base}/posts/${encodeURIComponent(postId)}`, headers)]);
      if (!/^[a-zA-Z0-9_-]+$/.test(me.slug || "") || !/^[a-zA-Z0-9_-]+$/.test(created.slug || "")) throw new Error("Missing publication or post slug.");
      return { url: `https://paragraph.com/@${me.slug}/${created.slug}`, views: 0 };
    } catch { throw new UnknownPublishError(`Paragraph published post ${postId}, but its public URL could not be retrieved. Inspect Paragraph before retrying.`); }
  }
  const { base, detail } = splitSite(siteId);
  if (!/^\d+$/.test(detail)) throw new Error("Enter instance URL | numeric community ID.");
  const data = await remoteJson(`${base}/api/v3/post`, bearer(token), { name: post.title, body: postMarkdown(post), community_id: Number(detail), url: post.canonicalUrl || undefined });
  const pid = requireId(data.post_view?.post?.id, "Lemmy post ID");
  return { url: `${base}/post/${encodeURIComponent(pid)}`, views: 0 };
}
