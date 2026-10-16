export type Platform = {
  id: string;
  name: string;
  url: string;
  editorUrl: string;
  category: string;
  method: "api" | "guided";
  note: string;
  color: string;
  docs?: string;
};

// This is a curated directory of free publishing options, not a traffic ranking.
// Availability and each platform's editorial rules can change.
export const platforms: Platform[] = [
  { id: "medium", name: "Medium", url: "https://medium.com", editorUrl: "https://medium.com/new-story", category: "General", method: "guided", note: "Use Medium's editor or import an existing URL.", color: "#111827", docs: "https://help.medium.com/hc/en-us/articles/213480228-API-Importing" },
  { id: "wordpress", name: "WordPress.com", url: "https://wordpress.com", editorUrl: "https://wordpress.com/posts", category: "General", method: "api", note: "Publish with a WordPress.com OAuth access token and site ID.", color: "#2875a7", docs: "https://developer.wordpress.com/docs/api/getting-started/" },
  { id: "blogger", name: "Blogger", url: "https://www.blogger.com", editorUrl: "https://www.blogger.com", category: "General", method: "api", note: "Publish with a Google OAuth token and Blogger blog ID.", color: "#fb8c00", docs: "https://developers.google.com/blogger/docs/3.0/reference/posts/insert" },
  { id: "dev", name: "DEV Community", url: "https://dev.to", editorUrl: "https://dev.to/new", category: "Developer", method: "api", note: "Publish with a DEV API key; up to four article tags.", color: "#171717", docs: "https://developers.forem.com/api/v0#tag/articles/operation/createArticle" },
  { id: "hashnode", name: "Hashnode", url: "https://hashnode.com", editorUrl: "https://hashnode.com/draft", category: "Developer", method: "guided", note: "Developer-focused articles and newsletters.", color: "#2962ff" },
  { id: "tumblr", name: "Tumblr", url: "https://www.tumblr.com", editorUrl: "https://www.tumblr.com/new", category: "Social blog", method: "api", note: "OAuth2 token with basic + write scopes, plus your blog name.", color: "#33465c", docs: "https://www.tumblr.com/docs/en/api/v2" },
  { id: "substack", name: "Substack", url: "https://substack.com", editorUrl: "https://substack.com/publish", category: "Newsletter", method: "guided", note: "Publish a web article and optional email edition.", color: "#ff6719" },
  { id: "linkedin", name: "LinkedIn Articles", url: "https://www.linkedin.com", editorUrl: "https://www.linkedin.com/article/new/", category: "Professional", method: "guided", note: "Long-form posts for your professional network.", color: "#0a66c2" },
  { id: "beehiiv", name: "beehiiv", url: "https://www.beehiiv.com", editorUrl: "https://app.beehiiv.com", category: "Newsletter", method: "guided", note: "A free tier for a publication and web posts.", color: "#f2c84b" },
  { id: "wix", name: "Wix Blog", url: "https://www.wix.com", editorUrl: "https://manage.wix.com", category: "Site builder", method: "guided", note: "Blogging on a free Wix-branded site.", color: "#8a5cf6" },
  { id: "weebly", name: "Square Online / Weebly", url: "https://squareup.com/us/en/online-store", editorUrl: "https://squareup.com/dashboard", category: "Site builder", method: "guided", note: "Free Square Stories or an existing Weebly blog. Sign in to its editor.", color: "#2990ea" },
  { id: "telegraph-2", name: "Telegra.ph — Account 2", url: "https://telegra.ph", editorUrl: "https://telegra.ph", category: "Minimal blog", method: "api", note: "Separate automatic connection. Click Connect → Create a free Telegraph account → Save connection. Uses its own token.", color: "#288bb8", docs: "https://telegra.ph/api" },
  { id: "vocal", name: "Vocal Media", url: "https://vocal.media", editorUrl: "https://vocal.media", category: "Community", method: "guided", note: "Stories submitted to themed communities.", color: "#f05165" },
  { id: "livejournal", name: "LiveJournal", url: "https://www.livejournal.com", editorUrl: "https://www.livejournal.com/update.bml", category: "Social blog", method: "guided", note: "Personal journal posts and communities.", color: "#44739f" },
  { id: "bear", name: "Bear Blog", url: "https://bearblog.dev", editorUrl: "https://bearblog.dev/dashboard/", category: "Minimal blog", method: "guided", note: "Lightweight personal blogging on a free site.", color: "#945b34" },
  { id: "telegraph", name: "Telegra.ph — Account 1", url: "https://telegra.ph", editorUrl: "https://telegra.ph", category: "Minimal blog", method: "api", note: "Automatic API publishing. Uses the configured workspace account or a token you save for this slot.", color: "#45a6d6", docs: "https://telegra.ph/api" },
  { id: "quora", name: "Quora Spaces", url: "https://www.quora.com", editorUrl: "https://www.quora.com/spaces", category: "Community", method: "guided", note: "Publish within a Space you manage.", color: "#b92b27" },
  { id: "telegraph-3", name: "Telegra.ph — Account 3", url: "https://telegra.ph", editorUrl: "https://telegra.ph", category: "Minimal blog", method: "api", note: "Separate automatic connection. Create an account here or paste this account's own Telegraph token.", color: "#357aa7", docs: "https://telegra.ph/api" },
  { id: "telegraph-4", name: "Telegra.ph — Account 4", url: "https://telegra.ph", editorUrl: "https://telegra.ph", category: "Minimal blog", method: "api", note: "Separate automatic connection. Its token and publication history are independent of the other Telegraph slots.", color: "#24678d", docs: "https://telegra.ph/api" },
  { id: "notion", name: "Notion Sites", url: "https://www.notion.com", editorUrl: "https://www.notion.so", category: "Site builder", method: "guided", note: "Publish a public page from a free workspace.", color: "#18181b" },
];

export const platformById = Object.fromEntries(platforms.map((p) => [p.id, p])) as Record<string, Platform>;
