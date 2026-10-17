import { and, desc, eq } from "drizzle-orm";
import { env } from "cloudflare:workers";
import { articles, deliveries, platformSettings, hostJobs } from "@/db/schema";
import { db, fail, json, userId } from "@/lib/api";
import { articleApiIds, workspaceApiToken, workspaceSiteId } from "@/lib/workspace-connections";

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
  const effectiveSettings = settings.map(row => ({ platformId: row.platformId, siteId: row.siteId || workspaceSiteId(row.platformId, env), enabled: row.enabled }));
  for (const id of articleApiIds) if (workspaceSiteId(id, env) && !effectiveSettings.some(row => row.platformId === id)) effectiveSettings.push({ platformId: id, siteId: workspaceSiteId(id, env), enabled: true });
  return json({ articles: posts.map((post) => ({ ...post, keywords: JSON.parse(post.keywords) })), deliveries: publicationResults, settings: effectiveSettings, hosting, workspaceTelegraph: !!env.TELEGRAPH_TOKEN, workspacePlatforms: articleApiIds.filter(id => !!workspaceApiToken(id, env)), media: { cloud: env.CLOUDINARY_CLOUD_NAME || "", preset: env.CLOUDINARY_UNSIGNED_PRESET || "" } });
}
