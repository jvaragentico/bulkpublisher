import { telegraphAccountIds, resolvePublishingToken } from "./telegraph-accounts.ts";
export const articleApiIds = ["dev", "wordpress", "blogger", "tumblr", ...telegraphAccountIds];
type Secrets = {
  DEV_TOKEN?: string; WORDPRESS_TOKEN?: string; WORDPRESS_SITE_ID?: string;
  BLOGGER_TOKEN?: string; BLOGGER_BLOG_ID?: string; TUMBLR_TOKEN?: string; TUMBLR_BLOG_NAME?: string;
  TELEGRAPH_TOKEN?: string; TELEGRAPH_TOKEN_2?: string; TELEGRAPH_TOKEN_3?: string; TELEGRAPH_TOKEN_4?: string;
};
export function workspaceApiToken(id: string, secrets: Secrets) {
  const tokens: Record<string, string | undefined> = { dev: secrets.DEV_TOKEN, wordpress: secrets.WORDPRESS_TOKEN, blogger: secrets.BLOGGER_TOKEN, tumblr: secrets.TUMBLR_TOKEN };
  return tokens[id]?.trim() || resolvePublishingToken(id, "", secrets);
}
export function resolveApiToken(id: string, supplied: unknown, secrets: Secrets) {
  return String(supplied ?? "").trim() || workspaceApiToken(id, secrets);
}
export function workspaceSiteId(id: string, secrets: Secrets) {
  const targets: Record<string, string | undefined> = { wordpress: secrets.WORDPRESS_SITE_ID, blogger: secrets.BLOGGER_BLOG_ID, tumblr: secrets.TUMBLR_BLOG_NAME };
  return targets[id]?.trim() || "";
}
