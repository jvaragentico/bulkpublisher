import { eq } from "drizzle-orm";
import { deliveries, hostJobs } from "@/db/schema";
import { db, fail, json, readJson, userId } from "@/lib/api";

export async function DELETE(request: Request) {
  const user = await userId(request);
  if (!user) return fail("Sign in first.", 401);
  try {
    const input = await readJson(request);
    if (input.confirm !== "DELETE HISTORY" || input.inspected !== true) return fail("Inspect your destinations, then confirm DELETE HISTORY.", 400);
    const database = db();
    await database.delete(deliveries).where(eq(deliveries.userId, user));
    await database.delete(hostJobs).where(eq(hostJobs.userId, user));
    return json({ ok: true, message: "Publication and deployment history cleared. External posts and websites remain online; saved articles remain in your library." });
  } catch (error) { return fail(error instanceof Error ? error.message : "Could not clear history."); }
}
