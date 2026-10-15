import { and, eq } from "drizzle-orm";
import { articles, deliveries } from "@/db/schema";
import { db, fail, json, readJson, safeUrl, userId } from "@/lib/api";

export async function POST(request: Request) {
  const user = userId(request);
  if (!user) return fail("Sign in to save articles.", 401);
  try {
    const input = await readJson(request);
    const id = typeof input.id === "string" && input.id ? input.id : crypto.randomUUID();
    const title = String(input.title ?? "").trim().slice(0, 220);
    if (!title) return fail("Add a title before saving.");
    const body = String(input.body ?? "").slice(0, 100_000);
    const excerpt = String(input.excerpt ?? "").trim().slice(0, 500);
    const keywords = Array.isArray(input.keywords) ? [...new Set(input.keywords.map((value: unknown) => String(value).trim().replace(/^#/, "").slice(0, 40)).filter(Boolean))].slice(0, 20) : [];
    const coverUrl = safeUrl(input.coverUrl);
    const videoUrl = safeUrl(input.videoUrl);
    const canonicalUrl = safeUrl(input.canonicalUrl);
    const database = db();
    const existing = await database.select().from(articles).where(eq(articles.id, id)).limit(1);
    if (existing[0] && existing[0].userId !== user) return fail("Article not found.", 404);
    const now = new Date().toISOString();
    if (existing[0]) {
      await database.update(articles).set({ title, body, excerpt, keywords: JSON.stringify(keywords), coverUrl, videoUrl, canonicalUrl, updatedAt: now }).where(and(eq(articles.id, id), eq(articles.userId, user)));
    } else {
      await database.insert(articles).values({ id, userId: user, title, body, excerpt, keywords: JSON.stringify(keywords), coverUrl, videoUrl, canonicalUrl, createdAt: now, updatedAt: now });
    }
    return json({ id });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not save article.");
  }
}

export async function DELETE(request: Request) {
  const user = userId(request);
  if (!user) return fail("Sign in to delete articles.", 401);
  try {
    const input = await readJson(request);
    const id = String(input.id ?? "");
    if (!id) return fail("Choose an article.");
    const database = db();
    await database.delete(deliveries).where(and(eq(deliveries.userId, user), eq(deliveries.articleId, id)));
    await database.delete(articles).where(and(eq(articles.userId, user), eq(articles.id, id)));
    return json({ ok: true });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not delete article.");
  }
}
