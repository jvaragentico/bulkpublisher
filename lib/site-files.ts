import { escapeHtml, postHtml, type Post } from "./publish.ts";
export type WebArticle = Post & { id: string };
export function siteFiles(articles: WebArticle[], runId: string): Record<string, string> {
  const shell = (title: string, body: string, description = "", canonical = "") => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)}</title><meta name="description" content="${escapeHtml(description)}">${canonical ? `<link rel="canonical" href="${escapeHtml(canonical)}">` : ""}<style>body{font:18px/1.75 system-ui,sans-serif;color:#182238;background:#faf9f6;max-width:800px;margin:60px auto;padding:0 24px}h1{font-size:clamp(30px,6vw,48px);line-height:1.2}a{color:#275caa}img{max-width:100%;height:auto;border-radius:12px}pre{overflow:auto;background:#eef0f5;padding:20px}article{padding:20px 0;border-bottom:1px solid #ddd}nav,footer{font-size:14px;color:#687080}footer{margin-top:60px}</style></head><body><nav><a href="./index.html">Article library</a></nav>${body}<footer>Published with Bulk Publisher Studio</footer></body></html>`;
  const files: Record<string, string> = { "bp-manifest.json": JSON.stringify({ runId }), ".nojekyll": "" };
  for (const article of articles) {
    const path = article.id.replace(/[^a-zA-Z0-9-]/g, "") + ".html";
    files[path] = shell(article.title, `<h1>${escapeHtml(article.title)}</h1>${article.excerpt ? `<p>${escapeHtml(article.excerpt)}</p>` : ""}${postHtml(article)}`, article.excerpt, article.canonicalUrl);
  }
  files["index.html"] = shell("Article library", `<h1>Article library</h1>${articles.map(a => `<article><h2><a href="./${a.id.replace(/[^a-zA-Z0-9-]/g, "")}.html">${escapeHtml(a.title)}</a></h2><p>${escapeHtml(a.excerpt)}</p></article>`).join("")}`);
  return files;
}
