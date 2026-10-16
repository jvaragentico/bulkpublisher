import { and, eq } from "drizzle-orm";
import { deliveries } from "@/db/schema";
import { db, fail, json, readJson, userId } from "@/lib/api";
import { isLegacyRedirectFailure } from "@/lib/legacy-delivery";

export async function POST(request: Request) {
  const user = await userId(request);
  if (!user) return fail("Sign in first.", 401);
  try {
    await readJson(request);
    const database = db();
    const rows = await database.select().from(deliveries).where(and(eq(deliveries.userId, user), eq(deliveries.state, "unknown")));
    let repaired = 0;
    for (const row of rows.filter(isLegacyRedirectFailure)) {
      const changed = await database.update(deliveries).set({ state: "failed", error: "Connection issue repaired. This earlier request never left the server; ready to retry.", updatedAt: new Date().toISOString() }).where(and(eq(deliveries.id, row.id), eq(deliveries.userId, user), eq(deliveries.state, "unknown"), eq(deliveries.updatedAt, row.updatedAt))).returning({ id: deliveries.id });
      repaired += changed.length;
    }
    return json({ ok: true, repaired });
  } catch (error) { return fail(error instanceof Error ? error.message : "Could not repair earlier connection errors."); }
}
