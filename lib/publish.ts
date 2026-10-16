import { isTelegraphAccount } from "./telegraph-accounts.ts";
export type Post = { title: string; excerpt: string; body: string; keywords: string; coverUrl: string; videoUrl: string; canonicalUrl: string };
export type ContentNode = string | { tag: string; attrs?: Record<string, string>; children?: ContentNode[] };
export class UnknownPublishError extends Error {}
export function escapeHtml(value: string) { return value.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!); }
export function publicUrl(value: unknown) {
  if (typeof value !== "string") throw new UnknownPublishError("No public URL returned. Check the destination before retrying.");
  let url: URL;
  try { url = new URL(value); } catch { throw new UnknownPublishError("The platform returned an invalid URL. Inspect the destination before retrying."); }
  if (url.protocol !== "https:") throw new UnknownPublishError("Unexpected destination URL. Check its dashboard.");
  return url.toString();
}
function inline(text: string): ContentNode[] {
  const nodes: ContentNode[] = []; let cursor = 0;
  const pattern = /!\[([^\]]*)\]\((https:\/\/[^\s)]+)\)|\[([^\]]+)\]\((https:\/\/[^\s)]+)\)|\*\*(.+?)\*\*|\*([^*]+)\*|\x60([^\x60]+)\x60/g;
  for (const match of text.matchAll(pattern)) {
    nodes.push(text.slice(cursor, match.index));
    if (match[2]) nodes.push({ tag: "img", attrs: { src: match[2] } });
    else if (match[4]) nodes.push({ tag: "a", attrs: { href: match[4] }, children: [match[3]] });
    else nodes.push({ tag: match[5] ? "strong" : match[6] ? "em" : "code", children: [match[5] || match[6] || match[7]] });
    cursor = match.index! + match[0].length;
  }
  nodes.push(text.slice(cursor)); return nodes.filter(n => n !== "");
}
export function markdownNodes(markdown: string): ContentNode[] {
  const nodes: ContentNode[] = [];
  for (const block of markdown.replace(/\r/g, "").split(/\n\s*\n/)) {
    if (block.startsWith("\x60\x60\x60")) { nodes.push({ tag: "pre", children: [{ tag: "code", children: [block.replace(/^\x60{3}[^\n]*\n?/, "").replace(/\n?\x60{3}$/, "")] }] }); continue; }
    for (const line of block.split("\n")) {
      if (!line.trim()) continue;
      if (/^#{1,6}\s/.test(line)) nodes.push({ tag: line.startsWith("# ") || line.startsWith("## ") ? "h3" : "h4", children: inline(line.replace(/^#+\s/, "")) });
      else if (/^[-*]\s/.test(line)) {
        const previous = nodes.at(-1); const child = { tag: "li", children: inline(line.slice(2)) };
        if (typeof previous === "object" && previous.tag === "ul") previous.children!.push(child); else nodes.push({ tag: "ul", children: [child] });
      } else if (/^>\s/.test(line)) nodes.push({ tag: "blockquote", children: inline(line.slice(2)) });
      else nodes.push({ tag: "p", children: inline(line) });
    }
  }
  return nodes;
}
function render(node: ContentNode): string {
  if (typeof node === "string") return escapeHtml(node);
  const attrs = Object.entries(node.attrs || {}).map(([key, value]) => " " + key + '="' + escapeHtml(value) + '"').join("");
  return "<" + node.tag + attrs + ">" + (["img", "br"].includes(node.tag) ? "" : (node.children || []).map(render).join("") + "</" + node.tag + ">");
}
export function markdownToHtml(markdown: string) { return markdownNodes(markdown).map(render).join("\n"); }
export function postNodes(post: Post): ContentNode[] {
  return [...(post.coverUrl ? [{ tag: "figure", children: [{ tag: "img", attrs: { src: post.coverUrl } }] }] : []), ...markdownNodes(post.body), ...(post.videoUrl ? [{ tag: "p", children: [{ tag: "a", attrs: { href: post.videoUrl }, children: ["Watch the video"] }] }] : []), ...(post.canonicalUrl ? [{ tag: "p", children: [{ tag: "a", attrs: { href: post.canonicalUrl }, children: ["Originally published here"] }] }] : [])];
}
export function postHtml(post: Post) { return postNodes(post).map(render).join("\n"); }
export function postMarkdown(post: Post) { return (post.coverUrl ? "![Cover](" + post.coverUrl + ")\n\n" : "") + post.body + (post.videoUrl ? "\n\n[Watch the video](" + post.videoUrl + ")" : "") + (post.canonicalUrl ? "\n\n[Original article](" + post.canonicalUrl + ")" : ""); }
export async function remoteJson(url: string, headers: Record<string, string>, body?: unknown, method = body ? "POST" : "GET"): Promise<any> {
  let response: Response;
  try { response = await fetch(url, { method, headers: { "Content-Type": "application/json", "User-Agent": "BulkPublisherStudio/2.0", ...headers }, body: body ? JSON.stringify(body) : undefined, signal: AbortSignal.timeout(25000), redirect: "error" }); }
  catch { throw new UnknownPublishError("Network response interrupted. Check the platform before retrying to avoid duplicates."); }
  if (response.status >= 500) throw new UnknownPublishError("Platform error " + response.status + ". Check the destination before retrying.");
  let data: any;
  try { data = await response.json(); } catch { throw new UnknownPublishError("Unreadable platform response. Check its dashboard."); }
  if (!response.ok) throw new Error([401,403].includes(response.status) ? "Authentication or permission rejected (" + response.status + "). Check token, scope and ownership." : response.status === 429 ? "Rate limit reached. Wait before retrying." : "Platform rejected the request (" + response.status + "). Check content limits and destination settings.");
  if (data.ok === false) throw new Error("Telegraph rejected the request: " + String(data.error).replace(/[^A-Z0-9_ -]/gi, "").slice(0, 80));
  return data;
}
export function validatePublish(id: string, post: Post, token: string, siteId: string) {
  if (!["dev", "wordpress", "blogger", "tumblr"].includes(id) && !isTelegraphAccount(id)) throw new Error("Use this destination's guided editor workflow.");
  if (!token.trim()) throw new Error("Add an access token or API key in Platforms.");
  if (["wordpress", "blogger", "tumblr"].includes(id) && !siteId.trim()) throw new Error("Add the target site or blog ID.");
  if (!post.body.trim()) throw new Error("Add article text first.");
  if (id === "dev" && /^\s*---\s*\n/.test(post.body)) throw new Error("Remove YAML front matter; use the title, tags and media fields.");
  if (isTelegraphAccount(id) && new TextEncoder().encode(JSON.stringify(postNodes(post))).length > 64000) throw new Error("Telegraph content exceeds 64 KB. Shorten the article.");
}
export async function publish(id: string, post: Post, token: string, siteId: string) {
  validatePublish(id, post, token, siteId);
  const tags = JSON.parse(post.keywords || "[]") as string[];
  const auth = { Authorization: "Bearer " + token };
  if (id === "dev") {
    const data = await remoteJson("https://dev.to/api/articles", { "api-key": token, accept: "application/vnd.forem.api-v1+json" }, { article: { title: post.title, body_markdown: postMarkdown({ ...post, coverUrl: "" }), published: true, description: post.excerpt || undefined, tags: [...new Set(tags.map(t => t.toLowerCase().replace(/[^a-z0-9]/g, "")).filter(Boolean))].slice(0, 4), main_image: post.coverUrl || undefined, canonical_url: post.canonicalUrl || undefined } });
    return { url: publicUrl(data.url), views: Number(data.page_views_count) || 0 };
  }
  if (id === "wordpress") {
    const data = await remoteJson("https://public-api.wordpress.com/rest/v1.2/sites/" + encodeURIComponent(siteId) + "/posts/new", auth, { title: post.title, content: postHtml(post), excerpt: post.excerpt, status: "publish", tags: tags.join(",") });
    return { url: publicUrl(data.URL), views: 0 };
  }
  if (id === "blogger") {
    const data = await remoteJson("https://www.googleapis.com/blogger/v3/blogs/" + encodeURIComponent(siteId) + "/posts", auth, { kind: "blogger#post", title: post.title, content: postHtml(post), labels: tags });
    return { url: publicUrl(data.url), views: 0 };
  }
  if (isTelegraphAccount(id)) {
    const data = await remoteJson("https://api.telegra.ph/createPage", {}, { access_token: token, title: post.title, author_name: "Bulk Publisher Studio", content: postNodes(post), return_content: true });
    return { url: publicUrl(data.result?.url), views: Number(data.result?.views) || 0 };
  }
  const content: any[] = [{ type: "text", subtype: "heading1", text: post.title }];
  if (post.coverUrl) content.push({ type: "image", media: [{ url: post.coverUrl }] });
  for (const block of postMarkdown({ ...post, coverUrl: "" }).split(/\n{2,}/)) {
    const picture = block.trim().match(/^!\[[^\]]*\]\((https:\/\/[^\s)]+)\)$/);
    if (!picture && block.length > 4096) throw new Error("Tumblr paragraphs must be under 4096 characters. Split this paragraph.");
    content.push(picture ? { type: "image", media: [{ url: picture[1] }] } : { type: "text", text: block.replace(/^#{1,6}\s/, "") });
  }
  const data = await remoteJson("https://api.tumblr.com/v2/blog/" + encodeURIComponent(siteId) + "/posts", auth, { content, state: "published", tags: tags.join(",") });
  const postId = data.response?.id;
  if (!postId) throw new UnknownPublishError("Tumblr did not return a post ID. Check the blog.");
  try {
    const lookup = await remoteJson("https://api.tumblr.com/v2/blog/" + encodeURIComponent(siteId) + "/posts?id=" + encodeURIComponent(String(postId)), auth);
    return { url: publicUrl(lookup.response?.posts?.[0]?.post_url), views: 0 };
  } catch { throw new UnknownPublishError("Tumblr accepted post " + String(postId) + ", but its public URL could not be retrieved. Inspect the blog and record the URL; do not republish."); }
}
