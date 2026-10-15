type Post = {
  title: string;
  excerpt: string;
  body: string;
  keywords: string;
  coverUrl: string;
  videoUrl: string;
  canonicalUrl: string;
};

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char] ?? char);
}

function inline(value: string) {
  return escapeHtml(value)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code>$1</code>")
    .replace(/\[([^\]]+)\]\((https:\/\/[^\s)]+)\)/g, '<a href="$2" rel="noopener noreferrer">$1</a>');
}

export function markdownToHtml(markdown: string) {
  return markdown.split(/\n{2,}/).map((block) => {
    const text = block.trim();
    if (!text) return "";
    const h = text.match(/^(#{1,3})\s+(.+)$/);
    if (h) return `<h${h[1].length}>${inline(h[2])}</h${h[1].length}>`;
    if (text.startsWith("- ")) return `<ul>${text.split("\n").map((line) => `<li>${inline(line.replace(/^-\s*/, ""))}</li>`).join("")}</ul>`;
    return `<p>${inline(text).replace(/\n/g, "<br>")}</p>`;
  }).join("\n");
}

export function postHtml(post: Post) {
  const cover = post.coverUrl ? `<p><img src="${escapeHtml(post.coverUrl)}" alt="${escapeHtml(post.title)}"></p>` : "";
  const video = post.videoUrl ? `<p><a href="${escapeHtml(post.videoUrl)}">Watch the accompanying video</a></p>` : "";
  return cover + markdownToHtml(post.body) + video;
}

async function remoteJson(url: string, headers: Record<string, string>, body: unknown) {
  const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json", ...headers }, body: JSON.stringify(body) });
  const text = await response.text();
  let data: Record<string, unknown> = {};
  try { data = JSON.parse(text); } catch { /* remote errors can be plain text */ }
  if (!response.ok) {
    const detail = typeof data.message === "string" ? data.message : typeof data.error === "string" ? data.error : text.slice(0, 180);
    throw new Error(`${response.status}: ${detail || "The platform rejected this post."}`);
  }
  return data;
}

export async function publish(platformId: string, post: Post, token: string, siteId: string) {
  if (!token.trim()) throw new Error("Add an access token or API key for this platform.");
  const tags = JSON.parse(post.keywords || "[]") as string[];
  if (platformId === "dev") {
    const data = await remoteJson("https://dev.to/api/articles", {
      "api-key": token,
      "accept": "application/vnd.forem.api-v1+json",
      "user-agent": "BulkPublisherStudio/1.0",
    }, { article: {
      title: post.title,
      body_markdown: `${post.body}${post.videoUrl ? `\n\n[Watch the video](${post.videoUrl})` : ""}`,
      published: true,
      description: post.excerpt || undefined,
      tags: tags.slice(0, 4),
      main_image: post.coverUrl || undefined,
      canonical_url: post.canonicalUrl || undefined,
    } });
    if (typeof data.url !== "string") throw new Error("DEV did not return an article URL. Check your account before retrying.");
    return { url: data.url, views: Number(data.page_views_count) || 0 };
  }
  if (!siteId.trim()) throw new Error("Add the target site or blog ID.");
  if (platformId === "wordpress") {
    const data = await remoteJson(`https://public-api.wordpress.com/wp/v2/sites/${encodeURIComponent(siteId)}/posts`, {
      Authorization: `Bearer ${token}`,
    }, { title: post.title, content: postHtml(post), excerpt: post.excerpt, status: "publish" });
    if (typeof data.link !== "string") throw new Error("WordPress did not return a post URL. Check your site before retrying.");
    return { url: data.link, views: 0 };
  }
  if (platformId === "blogger") {
    const data = await remoteJson(`https://www.googleapis.com/blogger/v3/blogs/${encodeURIComponent(siteId)}/posts`, {
      Authorization: `Bearer ${token}`,
    }, { kind: "blogger#post", title: post.title, content: postHtml(post), labels: tags });
    if (typeof data.url !== "string") throw new Error("Blogger did not return a post URL. Check your blog before retrying.");
    return { url: data.url, views: 0 };
  }
  throw new Error("This platform uses guided publishing.");
}
