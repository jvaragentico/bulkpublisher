import { and, eq } from "drizzle-orm";
import { deliveries } from "@/db/schema";
import { db, fail, json, readJson, userId } from "@/lib/api";

export async function POST(request: Request) {
  const user = await userId(request);
  if (!user) return fail("Sign in to refresh views.", 401);
  try {
    const input = await readJson(request);
    const token = String(input.token ?? "").trim();
    if (!token) return fail("Enter your DEV API key to refresh views.");
    const database = db();
    const own = await database.select().from(deliveries).where(and(eq(deliveries.userId, user), eq(deliveries.platformId, "dev")));
    if (!own.length) return json({ updated: 0 });
    let updated = 0;
    for (let page = 1; page <= 3; page++) {
      const response = await fetch(`https://dev.to/api/articles/me/published?per_page=100&page=${page}`, { headers: { "api-key": token, accept: "application/vnd.forem.api-v1+json", "user-agent": "BulkPublisherStudio/1.0" }, signal: AbortSignal.timeout(25000) });
      if (!response.ok) return fail(`DEV returned ${response.status}. Check your API key.`, 502);
      const remote = await response.json() as Array<{ url?: string; page_views_count?: number }>;
      for (const item of remote) {
        const match = own.find((delivery) => delivery.url === item.url);
        if (match && Number.isFinite(item.page_views_count)) {
          await database.update(deliveries).set({ views: Math.max(0, Number(item.page_views_count)), updatedAt: new Date().toISOString() }).where(eq(deliveries.id, match.id));
          updated++;
        }
      }
      if (remote.length < 100) break;
    }
    return json({ updated });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not refresh views.");
  }
}
