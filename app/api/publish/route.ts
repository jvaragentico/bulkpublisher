import { and, eq } from "drizzle-orm";
import { env } from "cloudflare:workers";
import { articles, deliveries } from "@/db/schema";
import { db, fail, json, readJson, userId } from "@/lib/api";
import { platformById } from "@/lib/catalog";
import { publish, validatePublish, UnknownPublishError, updateTelegraph } from "@/lib/publish";
import { resolvePublishingToken, isTelegraphAccount } from "@/lib/telegraph-accounts";
import { isLegacyRedirectFailure } from "@/lib/legacy-delivery";

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
    const token = resolvePublishingToken(platformId, input.token, env);
    const siteId = String(input.siteId ?? "").trim();
    const database = db();
    const post = await database.select().from(articles).where(and(eq(articles.id, articleId), eq(articles.userId, user))).limit(1);
    if (!post[0]) return fail("Article not found.", 404);
    validatePublish(platformId, post[0], token, siteId);
    const existing = await database.select().from(deliveries).where(and(eq(deliveries.userId, user), eq(deliveries.articleId, articleId), eq(deliveries.platformId, platformId))).limit(1);
    if (input.update === true) {
      const previous = existing[0];
      if (!isTelegraphAccount(platformId) || !previous || previous.state !== "published" || !previous.url) return fail("Select an already published Telegra.ph page to update.", 409);
      const claimed = await database.update(deliveries).set({ state: "updating", updatedAt: new Date().toISOString() }).where(and(eq(deliveries.id, previous.id), eq(deliveries.state, "published"))).returning({ id: deliveries.id });
      if (!claimed.length) return fail("Another request is updating this page.", 409);
      try {
        const result = await updateTelegraph(post[0], token, previous.url);
        await database.update(deliveries).set({ state: "published", error: "", updatedAt: new Date().toISOString() }).where(eq(deliveries.id, previous.id));
        return json({ ok: true, url: result.url, updated: true });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Update failed.";
        await database.update(deliveries).set({ state: error instanceof UnknownPublishError ? "update-unknown" : "published", error: message.slice(0, 500), updatedAt: new Date().toISOString() }).where(eq(deliveries.id, previous.id));
        return fail(message, 502);
      }
    }
    if (existing[0]?.state === "published") return fail("Already published here. Open the saved URL to review it.", 409);
    if (existing[0] && isLegacyRedirectFailure(existing[0])) {
      const repaired = await database.update(deliveries).set({ state: "failed", error: "Earlier request was blocked before transmission by the runtime redirect setting." }).where(and(eq(deliveries.id, existing[0].id), eq(deliveries.state, "unknown"), eq(deliveries.error, existing[0].error))).returning({ id: deliveries.id });
      if (!repaired.length) return fail("Another request already updated this publication. Refresh Activity.", 409);
      existing[0].state = "failed";
    }
    if (["publishing", "unknown", "updating", "update-unknown"].includes(existing[0]?.state)) return fail("A prior request is pending or uncertain. Inspect the platform and record its URL in Activity before retrying.", 409);
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
