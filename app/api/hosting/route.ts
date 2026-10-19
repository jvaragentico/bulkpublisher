import { and, eq, inArray } from "drizzle-orm";
import { articles, hostJobs } from "@/db/schema";
import { db, fail, json, readJson, userId } from "@/lib/api";
import { deployHost, validateHost, verifyHost } from "@/lib/host-publish";
import { siteFiles } from "@/lib/site-files";
import { hostById } from "@/lib/hosts";
export async function POST(request: Request) {
  const user = await userId(request); if (!user) return fail("Sign in first.", 401);
  let claimedId = "";
  try {
    const input = await readJson(request); const provider = String(input.provider || "");
    if (!hostById[provider]) return fail("Unknown host.");
    const database = db(), id = `${user}:${provider}`;
    const [existing] = await database.select().from(hostJobs).where(eq(hostJobs.id, id));
    if (input.action === "check") {
      if (!existing?.url) return fail("No deployment URL to check yet. Inspect the host dashboard.");
      const live = await verifyHost(existing.url, existing.runId);
      if (live) await database.update(hostJobs).set({ state: "published", error: "", updatedAt: new Date().toISOString() }).where(and(eq(hostJobs.id, id), eq(hostJobs.runId, existing.runId)));
      return json({ live, url: existing.url, message: live ? "The exact uploaded snapshot is publicly accessible." : "The current snapshot is not public yet. Check deployment logs, access settings and the publishing branch." });
    }
    if (input.overwriteApproved !== true) return fail("Confirm that this is a dedicated site whose content can be replaced.");
    if (existing && ["uploading", "pending", "unknown"].includes(existing.state)) return fail("A deployment is pending or uncertain. Check it before deploying again.", 409);
    const config = input.config && typeof input.config === "object" && !Array.isArray(input.config) ? Object.fromEntries(Object.entries(input.config).map(([k,v]) => [k, String(v).trim()])) : {};
    const token = String(input.token || ""), second = String(input.secondaryToken || "");
    validateHost(provider, config, token, second);
    const ids = Array.isArray(input.articleIds) ? [...new Set(input.articleIds.map(String))] : [];
    if (!ids.length || ids.length > 30) return fail("Choose between 1 and 30 saved articles.");
    const posts = await database.select().from(articles).where(and(eq(articles.userId, user), inArray(articles.id, ids)));
    if (posts.length !== ids.length || posts.some(p => !p.body.trim())) return fail("All selected articles must exist and contain text.");
    const runId = crypto.randomUUID(), now = new Date().toISOString();
    const values = { userId: user, provider, runId, state: "uploading", url: "", remoteId: "", error: "", articleIds: JSON.stringify(ids), updatedAt: now };
    const claim = existing
      ? await database.update(hostJobs).set(values).where(and(eq(hostJobs.id, id), inArray(hostJobs.state, ["failed", "published"]))).returning({ id: hostJobs.id })
      : await database.insert(hostJobs).values({ id, ...values }).onConflictDoNothing().returning({ id: hostJobs.id });
    if (!claim.length) return fail("Another request is deploying to this host.", 409);
    claimedId = id;
    const result = await deployHost(provider, config, token, second, siteFiles(posts, runId));
    await database.update(hostJobs).set({ ...result, state: "pending", updatedAt: new Date().toISOString() }).where(and(eq(hostJobs.id, id), eq(hostJobs.runId, runId)));
    return json({ ok: true, ...result, message: "Upload accepted. Check the public deployment after the host finishes building." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Deployment failed.";
    if (claimedId) await db().update(hostJobs).set({ state: "unknown", error: message.slice(0, 400) }).where(eq(hostJobs.id, claimedId));
    return fail(message, 400);
  }
}

export async function DELETE(request: Request) {
  const user = await userId(request); if (!user) return fail("Sign in first.", 401);
  try {
    const input = await readJson(request);
    const provider = String(input.provider || "");
    if (!hostById[provider]) return fail("Unknown host.");
    if (input.inspected !== true) return fail("Inspect the host dashboard first. Removing this local record will not delete the hosted website.");
    await db().delete(hostJobs).where(and(eq(hostJobs.id, `${user}:${provider}`), eq(hostJobs.userId, user)));
    return json({ ok: true, message: "Deployment record removed. The hosted website remains online until you delete it at the host." });
  } catch (error) { return fail(error instanceof Error ? error.message : "Could not remove deployment record."); }
}
