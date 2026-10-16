import { eq } from "drizzle-orm";
import { zipSync, strToU8 } from "fflate";
import { articles } from "@/db/schema";
import { db, fail, userId } from "@/lib/api";
import { siteFiles } from "@/lib/site-files";
export async function GET(request: Request) {
  const user = await userId(request); if (!user) return fail("Sign in first.", 401);
  const posts = await db().select().from(articles).where(eq(articles.userId, user));
  if (!posts.length) return fail("Save articles first.");
  if (posts.length > 30) return fail("Export currently supports up to 30 articles.");
  const files = siteFiles(posts, crypto.randomUUID());
  return new Response(new Uint8Array(zipSync(Object.fromEntries(Object.entries(files).map(([name, content]) => [name, strToU8(content)])))), { headers: { "Content-Type": "application/zip", "Content-Disposition": 'attachment; filename="article-website.zip"', "Cache-Control": "no-store" } });
}
