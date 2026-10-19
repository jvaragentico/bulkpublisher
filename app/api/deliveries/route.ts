import { and, eq } from "drizzle-orm";
import { articles, deliveries } from "@/db/schema";
import { db, fail, json, readJson, safeUrl, userId } from "@/lib/api";
import { platformById } from "@/lib/catalog";
import { env } from "cloudflare:workers";
import { resolveApiToken, workspaceSiteId } from "@/lib/workspace-connections";
import { canDeleteRemote, deleteRemote } from "@/lib/remote-delete";
import { UnknownPublishError } from "@/lib/publish";

export async function DELETE(request: Request) {
  const user = await userId(request);
  if (!user) return fail("Sign in first.", 401);
  try {
    const input = await readJson(request);
    const id = String(input.id || "");
    const database = db();
    const [record] = await database.select().from(deliveries).where(and(eq(deliveries.id, id), eq(deliveries.userId, user)));
    if (!record) return fail("Publication record not found.", 404);
    if (input.remote === true) {
      if (record.state !== "published" || !record.url || !canDeleteRemote(record.platformId)) return fail("Remote deletion is unavailable for this publication. You can remove only the dashboard record.");
      const token = resolveApiToken(record.platformId, input.token, env);
      const siteId = String(input.siteId || workspaceSiteId(record.platformId, env));
      const claim = await database.update(deliveries).set({ state: "deleting", updatedAt: new Date().toISOString() }).where(and(eq(deliveries.id, id), eq(deliveries.state, "published"))).returning({ id: deliveries.id });
      if (!claim.length) return fail("Another action is already in progress.", 409);
      try {
        await deleteRemote(record.platformId, record.url, token, siteId);
        await database.delete(deliveries).where(and(eq(deliveries.id, id), eq(deliveries.state, "deleting")));
        return json({ ok: true, message: "Public post deleted and dashboard record removed." });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Remote deletion failed.";
        await database.update(deliveries).set({ state: error instanceof UnknownPublishError ? "delete-unknown" : "published", error: message.slice(0, 500), updatedAt: new Date().toISOString() }).where(eq(deliveries.id, id));
        return fail(message, 502);
      }
    }
    if (input.inspected !== true) return fail("Confirm that you inspected the destination. Removing this record does not delete the public post.");
    await database.delete(deliveries).where(and(eq(deliveries.id, id), eq(deliveries.userId, user)));
    return json({ ok: true, message: "Dashboard record removed. Any public post is unchanged." });
  } catch (error) { return fail(error instanceof Error ? error.message : "Could not delete publication record."); }
}

export async function POST(request: Request) {
  const user = await userId(request);
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
