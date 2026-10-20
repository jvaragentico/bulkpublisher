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
  { id: "vocal", name: "Vocal Media", url: "https://vocal.media", editorUrl: "https://vocal.media", category: "Community", method: "guided", note: "Stories submitted to themed communities.", color: "#f05165" },
  { id: "livejournal", name: "LiveJournal", url: "https://www.livejournal.com", editorUrl: "https://www.livejournal.com/update.bml", category: "Social blog", method: "guided", note: "Personal journal posts and communities.", color: "#44739f" },
  { id: "bear", name: "Bear Blog", url: "https://bearblog.dev", editorUrl: "https://bearblog.dev/dashboard/", category: "Minimal blog", method: "guided", note: "Lightweight personal blogging on a free site.", color: "#945b34" },
  { id: "telegraph", name: "Telegra.ph", url: "https://telegra.ph", editorUrl: "https://telegra.ph", category: "Minimal blog", method: "api", note: "Automatic API publishing. Uses the configured workspace account or a token you save for this slot.", color: "#45a6d6", docs: "https://telegra.ph/api" },
  { id: "quora", name: "Quora Spaces", url: "https://www.quora.com", editorUrl: "https://www.quora.com/spaces", category: "Community", method: "guided", note: "Publish within a Space you manage.", color: "#b92b27" },
  { id: "notion", name: "Notion Sites", url: "https://www.notion.com", editorUrl: "https://www.notion.so", category: "Site builder", method: "guided", note: "Publish a public page from a free workspace.", color: "#18181b" },
  { id: "mastodon", name: "Mastodon", url: "https://joinmastodon.org", editorUrl: "https://mastodon.social", category: "Public social post", method: "api", note: "Automatic public status on your chosen instance. Short text and a link to the full article.", color: "#6364ff", docs: "https://docs.joinmastodon.org/methods/statuses/" },
  { id: "bluesky", name: "Bluesky", url: "https://bsky.app", editorUrl: "https://bsky.app", category: "Public social post", method: "api", note: "Automatic short post using your handle and an app password; add a link for long articles.", color: "#1688fa", docs: "https://docs.bsky.app/docs/tutorials/creating-a-post" },
  { id: "telegram", name: "Telegram channel", url: "https://telegram.org", editorUrl: "https://web.telegram.org", category: "Public channel", method: "api", note: "Automatic message to a public channel where your bot is an administrator.", color: "#229ed9", docs: "https://core.telegram.org/bots/api#sendmessage" },
  { id: "discord", name: "Discord webhook", url: "https://discord.com", editorUrl: "https://discord.com/app", category: "Channel post", method: "api", note: "Automatic message in a chosen server channel. Readers may need to join that server.", color: "#5865f2", docs: "https://discord.com/developers/docs/resources/webhook#execute-webhook" },
  { id: "github-gist", name: "GitHub Gist", url: "https://gist.github.com", editorUrl: "https://gist.github.com", category: "Public document", method: "api", note: "Automatic public Markdown document; useful for technical articles.", color: "#24292f", docs: "https://docs.github.com/en/rest/gists/gists#create-a-gist" },
  { id: "gitlab-snippet", name: "GitLab snippet", url: "https://gitlab.com/-/snippets", editorUrl: "https://gitlab.com/-/snippets", category: "Public document", method: "api", note: "Automatic public personal Markdown snippet.", color: "#fc6d26", docs: "https://docs.gitlab.com/api/snippets/" },
  { id: "bitbucket-snippet", name: "Bitbucket snippet", url: "https://bitbucket.org", editorUrl: "https://bitbucket.org", category: "Public document", method: "api", note: "Automatic public Markdown snippet in your workspace.", color: "#0052cc", docs: "https://developer.atlassian.com/cloud/bitbucket/rest/api-group-snippets/" },
  { id: "matrix", name: "Matrix public room", url: "https://matrix.org", editorUrl: "https://app.element.io", category: "Public room", method: "api", note: "Automatic event in a public Matrix room; URL points to the room event.", color: "#0dbd8b", docs: "https://spec.matrix.org/latest/client-server-api/#put_matrixclientv3roomsroomidsendeventtypetxnid" },
  { id: "misskey", name: "Misskey", url: "https://misskey.io", editorUrl: "https://misskey.io", category: "Public social post", method: "api", note: "Automatic public note on your Misskey instance.", color: "#86b300", docs: "https://misskey-hub.net/en/docs/for-developers/api/" },
  { id: "lemmy", name: "Lemmy", url: "https://join-lemmy.org", editorUrl: "https://lemmy.world", category: "Community post", method: "api", note: "Automatic post to a community you belong to. Community rules apply.", color: "#00a584", docs: "https://join-lemmy.org/docs/contributors/04-api.html" },
  { id: "wordpress-org", name: "WordPress (self-hosted)", url: "https://wordpress.org", editorUrl: "https://wordpress.org", category: "Full article site", method: "api", note: "Publish full HTML articles to a WordPress site you host, using an application password.", color: "#21759b", docs: "https://developer.wordpress.org/rest-api/reference/posts/" },
  { id: "writefreely", name: "WriteFreely", url: "https://writefreely.org", editorUrl: "https://writefreely.org", category: "Full article site", method: "api", note: "Publish full Markdown articles to a WriteFreely collection you control.", color: "#1f2937", docs: "https://developers.write.as/docs/api/" },
  { id: "ghost", name: "Ghost (self-hosted)", url: "https://ghost.org", editorUrl: "https://ghost.org", category: "Full article site", method: "api", note: "Publish full HTML articles to a Ghost site you host, using an Admin API integration key.", color: "#121212", docs: "https://ghost.org/docs/admin-api/" },
  { id: "paragraph", name: "Paragraph", url: "https://paragraph.com", editorUrl: "https://app.paragraph.com", category: "Full article site", method: "api", note: "Publish full Markdown articles to your Paragraph publication with its API key.", color: "#5546ff", docs: "https://docs.paragraph.com/developers" },
];

export const platformById = Object.fromEntries(platforms.map((p) => [p.id, p])) as Record<string, Platform>;
