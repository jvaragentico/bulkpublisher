import { and, eq } from "drizzle-orm";
import { env } from "cloudflare:workers";
import { articles, deliveries } from "@/db/schema";
import { db, fail, json, readJson, userId } from "@/lib/api";
import { platformById } from "@/lib/catalog";
import { publish, validatePublish, UnknownPublishError } from "@/lib/publish";
import { resolvePublishingToken } from "@/lib/telegraph-accounts";

export async function POST(request: Request) {
  const user = await userId(request);
  if (!user) return fail("Sign in to publish.", 401);
  let articleId = "";
  let platformId = "";
  try {
    const input = await readJson(request);
    articleId = String(input.articleId ?? "");
    platformId = String(input.platformId ?? "");
    const platform = platformById[platformId];
    if (!platform || platform.method !== "api") return fail("This destination uses guided publishing.");
    const token = resolvePublishingToken(platformId, input.token, env.TELEGRAPH_TOKEN);
    const siteId = String(input.siteId ?? "").trim();
    const database = db();
    const post = await database.select().from(articles).where(and(eq(articles.id, articleId), eq(articles.userId, user))).limit(1);
    if (!post[0]) return fail("Article not found.", 404);
    validatePublish(platformId, post[0], token, siteId);
    const existing = await database.select().from(deliveries).where(and(eq(deliveries.userId, user), eq(deliveries.articleId, articleId), eq(deliveries.platformId, platformId))).limit(1);
    if (existing[0]?.state === "published") return fail("Already published here. Open the saved URL to review it.", 409);
    if (["publishing", "unknown"].includes(existing[0]?.state)) return fail("A prior request is pending or uncertain. Inspect the platform and record its URL in Activity before retrying.", 409);
    const now = new Date().toISOString();
    const deliveryId = existing[0]?.id ?? crypto.randomUUID();
    if (existing[0]) {
      const claimed = await database.update(deliveries).set({ state: "publishing", error: "", updatedAt: now }).where(and(eq(deliveries.id, deliveryId), eq(deliveries.state, "failed"))).returning({ id: deliveries.id });
      if (!claimed.length) return fail("Another request already claimed this publication.", 409);
    } else {
      const claimed = await database.insert(deliveries).values({ id: deliveryId, userId: user, articleId, platformId, state: "publishing", url: "", error: "", views: 0, updatedAt: now }).onConflictDoNothing().returning({ id: deliveries.id });
      if (!claimed.length) return fail("Another request already claimed this publication.", 409);
    }
    try {
      const result = await publish(platformId, post[0], token, siteId);
      try { await database.update(deliveries).set({ state: "published", url: result.url, views: result.views, publishedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }).where(eq(deliveries.id, deliveryId)); }
      catch { return json({ ok: true, url: result.url, warning: "Published, but the database update failed. Save this URL and record it in Activity. Do not publish again." }); }
      return json({ ok: true, url: result.url });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Publishing failed.";
      await database.update(deliveries).set({ state: error instanceof UnknownPublishError ? "unknown" : "failed", error: message.slice(0, 500), updatedAt: new Date().toISOString() }).where(eq(deliveries.id, deliveryId));
      return fail(message, 502);
    }
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not publish.");
  }
}
