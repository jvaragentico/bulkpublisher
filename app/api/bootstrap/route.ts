import { and, desc, eq } from "drizzle-orm";
import { env } from "cloudflare:workers";
import { articles, deliveries, platformSettings, hostJobs } from "@/db/schema";
import { db, fail, json, userId } from "@/lib/api";
import { telegraphAccountIds, workspaceAccountToken } from "@/lib/telegraph-accounts";

export async function GET(request: Request) {
  const user = await userId(request);
  if (!user) return fail("Sign in to view your workspace.", 401);
  const database = db();
  const [posts, publicationResults, settings, hosting] = await Promise.all([
    database.select().from(articles).where(eq(articles.userId, user)).orderBy(desc(articles.updatedAt)),
    database.select().from(deliveries).where(eq(deliveries.userId, user)).orderBy(desc(deliveries.updatedAt)),
    database.select().from(platformSettings).where(eq(platformSettings.userId, user)),
    database.select().from(hostJobs).where(eq(hostJobs.userId, user)),
  ]);
  return json({ articles: posts.map((post) => ({ ...post, keywords: JSON.parse(post.keywords) })), deliveries: publicationResults, settings, hosting, workspaceTelegraph: !!env.TELEGRAPH_TOKEN, workspacePlatforms: telegraphAccountIds.filter(id => !!workspaceAccountToken(id, env)) });
}
