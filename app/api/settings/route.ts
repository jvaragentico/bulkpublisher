import { and, eq } from "drizzle-orm";
import { platformSettings } from "@/db/schema";
import { db, fail, json, readJson, userId, safeUrl } from "@/lib/api";
import { platformById } from "@/lib/catalog";

export async function POST(request: Request) {
  const user = await userId(request);
  if (!user) return fail("Sign in to save platform settings.", 401);
  try {
    const input = await readJson(request);
    const platformId = String(input.platformId ?? "");
    if (!platformById[platformId]) return fail("Unknown platform.");
    const siteId = platformById[platformId].method === "guided" ? safeUrl(input.siteId) : String(input.siteId ?? "").trim().slice(0, 200);
    const enabled = input.enabled !== false;
    const database = db();
    const existing = await database.select().from(platformSettings).where(and(eq(platformSettings.userId, user), eq(platformSettings.platformId, platformId))).limit(1);
    const now = new Date().toISOString();
    if (existing[0]) {
      await database.update(platformSettings).set({ siteId, enabled, updatedAt: now }).where(eq(platformSettings.id, existing[0].id));
    } else {
      await database.insert(platformSettings).values({ id: crypto.randomUUID(), userId: user, platformId, siteId, enabled, updatedAt: now });
    }
    return json({ ok: true });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not save platform settings.");
  }
}
