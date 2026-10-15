import { and, eq } from "drizzle-orm";
import { articles, deliveries } from "@/db/schema";
import { db, fail, json, readJson, safeUrl, userId } from "@/lib/api";
import { platformById } from "@/lib/catalog";

export async function POST(request: Request) {
  const user = userId(request);
  if (!user) return fail("Sign in to record publications.", 401);
  try {
    const input = await readJson(request);
    const articleId = String(input.articleId ?? "");
    const platformId = String(input.platformId ?? "");
    if (!platformById[platformId]) return fail("Unknown platform.");
    const url = safeUrl(input.url, false);
    const views = Math.max(0, Math.min(1_000_000_000, Math.floor(Number(input.views) || 0)));
    const database = db();
    const post = await database.select().from(articles).where(and(eq(articles.id, articleId), eq(articles.userId, user))).limit(1);
    if (!post[0]) return fail("Article not found.", 404);
    const existing = await database.select().from(deliveries).where(and(eq(deliveries.userId, user), eq(deliveries.articleId, articleId), eq(deliveries.platformId, platformId))).limit(1);
    const now = new Date().toISOString();
    if (existing[0]) {
      await database.update(deliveries).set({ state: "published", url, views, error: "", publishedAt: existing[0].publishedAt ?? now, updatedAt: now }).where(eq(deliveries.id, existing[0].id));
    } else {
      await database.insert(deliveries).values({ id: crypto.randomUUID(), userId: user, articleId, platformId, state: "published", url, views, error: "", publishedAt: now, updatedAt: now });
    }
    return json({ ok: true });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not record publication.");
  }
}
