# What to provide for each platform

Start with [the local/VPS setup guide](QUICKSTART.md). Your dashboard login is admin; the initial password is admin. Change it in .dev.vars before sharing access.

## Two kinds of article destinations

**Automatic API** means the app can send the article after you provide a valid platform-issued token and the listed IDs. **Guided editor** means a manual final step: you copy the article, sign in on the platform, paste/format it and press Publish there yourself, then record the public URL here.

There are four separate Telegra.ph account slots: Account 1 plus the three replacements for HackMD and the former GitHub/GitLab article entries. This is one service with four account connections, not four different websites. Only Account 1 may use the workspace token; create or provide a separate token for each other slot.

Do not send account passwords to us or paste them into token fields. Sign in directly on each platform. Paste only API keys/access tokens issued for your own account.

## Private credentials file

Copy `CREDENTIALS.example.json` to `CREDENTIALS.local.json` in your extracted folder. Fill only the `token` and `siteId` values you have. Keep that file on your own computer. It is ignored by Git and omitted from every source ZIP. In the dashboard, open **Platforms → Import credentials** and select it. The app reads the selected file in your browser and keeps its nonempty tokens and targets in that tab's session only. Nothing loads from the file at startup. If you close the tab, import it again. Server secrets configured in the hosted environment are separate and cannot be exported back from the dashboard.

See [fake examples showing the exact format for every token and target box](CREDENTIAL-FORMATS.md). Never substitute the example strings for real keys.

## The 31 article destination slots (31 services)

| Platform | What you need to provide or set up | Publishing mode / limits |
| --- | --- | --- |
| [Medium](https://help.medium.com/hc/en-us/articles/213480228-API-Importing) | No token. Optional personal/publication editor URL. | **Guided editor — manual final step**. Guided editor = you do the final publishing in Medium. No API key or account password belongs in this dashboard. |
| [WordPress.com](https://developer.wordpress.com/docs/api/getting-started/) | WordPress.com OAuth access_token + site ID or site domain. | **Automatic API**. Developer setup is required to obtain the OAuth token. A Client ID, Client Secret, WordPress password or application password is not the access_token required by this connector. |
| [Blogger](https://developers.google.com/blogger/docs/3.0/reference/posts/insert) | Google OAuth access token with Blogger scope + numeric blog ID. | **Automatic API**. A Google API key cannot publish posts. Access tokens are short lived; replace them when they expire. The app does not refresh Google tokens automatically. |
| [DEV Community](https://developers.forem.com/api/v0#tag/articles/operation/createArticle) | DEV API key only. No site ID. | **Automatic API**. Up to four normalized tags. Publish relevant content and follow DEV's rules. The key is sensitive. |
| [Hashnode](https://hashnode.com) | No token. Optional publication dashboard URL. | **Guided editor — manual final step**. The free workflow uses Hashnode's browser editor. Its paid API access is not used by this app. |
| [Tumblr](https://www.tumblr.com/docs/en/api/v2) | OAuth2 access_token with basic + write scopes, plus blog name/hostname. | **Automatic API**. OAuth developer setup is required. Text, public image URLs and tags are supported; review Markdown punctuation and platform limits. |
| [Substack](https://substack.com) | No token. Optional publication dashboard URL. | **Guided editor — manual final step**. You must press the final publish/send button in Substack. Check email delivery settings before publishing. |
| [LinkedIn Articles](https://www.linkedin.com) | No token. A LinkedIn profile or Page with author access. | **Guided editor — manual final step**. Native long-form Articles require manual completion here. No LinkedIn password or token is requested by this destination. |
| [beehiiv](https://www.beehiiv.com) | No token. Optional publication dashboard URL. | **Guided editor — manual final step**. Free-plan publishing uses the browser editor. The paid Create Post API is not connected. |
| [Wix Blog](https://www.wix.com) | No token. Wix site editor/dashboard URL. | **Guided editor — manual final step**. The app does not automate Wix's API. The free Wix-branded site and its editor are used. |
| [Square Online / Weebly](https://squareup.com/us/en/online-store) | No token. Your Square Online/Weebly editor URL. | **Guided editor — manual final step**. Manual editor workflow. Use an account/site that actually provides Stories or Blog editing. |
| [Telegra.ph — Account 2](https://telegra.ph/api) | This slot's own Telegraph access token. No username/password or site ID. | **Automatic API**. This is a separate account connection on the same Telegra.ph service. Keep different account tokens in different slots. Pages are public; content must fit Telegraph's 64 KB limit. |
| [Vocal Media](https://vocal.media) | No API token. Vocal account, Wallet/Stripe setup and story details. | **Guided editor — manual final step**. Submitting for moderation is not immediate publication. A private editor URL is not a live story URL. |
| [LiveJournal](https://www.livejournal.com) | No token. Journal/community posting access and optional editor URL. | **Guided editor — manual final step**. Uses LiveJournal's own editor; its legacy XML-RPC API is not integrated. |
| [Bear Blog](https://bearblog.dev) | No token. Bear Blog dashboard URL and public image URLs. | **Guided editor — manual final step**. Free workflow uses external images; Bear's built-in image uploads may require an upgrade. |
| [Telegra.ph — Account 1](https://telegra.ph/api) | Workspace token, or a token saved for Account 1. No username/password or site ID. | **Automatic API**. This is a separate account connection on the same Telegra.ph service. Keep different account tokens in different slots. Pages are public; content must fit Telegraph's 64 KB limit. |
| [Quora Spaces](https://www.quora.com) | No token. Space URL and contributor/moderator/admin posting rights. | **Guided editor — manual final step**. Final publication takes place in Quora. Do not record a private draft or unapproved submission as published. |
| [Telegra.ph — Account 3](https://telegra.ph/api) | This slot's own Telegraph access token. No username/password or site ID. | **Automatic API**. This is a separate account connection on the same Telegra.ph service. Keep different account tokens in different slots. Pages are public; content must fit Telegraph's 64 KB limit. |
| [Telegra.ph — Account 4](https://telegra.ph/api) | This slot's own Telegraph access token. No username/password or site ID. | **Automatic API**. This is a separate account connection on the same Telegra.ph service. Keep different account tokens in different slots. Pages are public; content must fit Telegraph's 64 KB limit. |
| [Notion Sites](https://www.notion.com) | No token. A page you can edit and permission to publish it. | **Guided editor — manual final step**. Public sharing must be completed in Notion. A workspace page address alone does not make a page public. |
| [Mastodon](https://docs.joinmastodon.org/methods/statuses/) | Instance domain and access token with `write:statuses`. | **Automatic API**. Public short status; add a canonical link for the article. |
| [Bluesky](https://docs.bsky.app/docs/tutorials/creating-a-post) | Your handle and an app password. | **Automatic API**. Public 300-character post; add a canonical link. |
| [Telegram channel](https://core.telegram.org/bots/api#sendmessage) | Bot token and public `@channel` username; make the bot channel administrator with post access. | **Automatic API**. Public channel message. |
| [Discord webhook](https://discord.com/developers/docs/resources/webhook#execute-webhook) | Full webhook URL from your chosen channel. | **Automatic API**. Message link may require readers to join the server. |
| [GitHub Gist](https://docs.github.com/en/rest/gists/gists#create-a-gist) | GitHub fine-grained token with Gists write permission. | **Automatic API**. Public Markdown document. |
| [GitLab snippet](https://docs.gitlab.com/api/snippets/) | GitLab personal access token with API scope. | **Automatic API**. Public personal Markdown snippet. |
| [Bitbucket snippet](https://developer.atlassian.com/cloud/bitbucket/rest/api-group-snippets/) | Workspace slug and Bitbucket API token with snippet write permission. | **Automatic API**. Public Markdown snippet. |
| [Matrix public room](https://spec.matrix.org/latest/client-server-api/#put_matrixclientv3roomsroomidsendeventtypetxnid) | Homeserver domain, room ID, and access token for a joined account. Enter target as `https://server.example | !roomid:server.example`. | **Automatic API**. Public room event; Matrix redaction is used for remote delete. |
| [Misskey](https://misskey-hub.net/en/docs/for-developers/api/) | Instance domain and token with note create/delete access. | **Automatic API**. Public note; add a canonical link. |
| [Lemmy](https://join-lemmy.org/docs/contributors/04-api.html) | Instance domain, numeric community ID and account JWT. Enter target as `https://instance.example | 123`. | **Automatic API**. Community post; API version and moderation rules depend on the instance. |
| [WordPress (self-hosted)](https://developer.wordpress.org/rest-api/reference/posts/) | HTTPS site URL and `username:application-password` generated in Users → Profile. | **Automatic API**. Full HTML article on your own WordPress site. Free software; hosting may cost money. |
| [WriteFreely](https://developers.write.as/docs/api/) | Instance URL, collection alias and API token. | **Automatic API**. Full Markdown article in your collection. Community or self-hosted instance required. |
| [Ghost (self-hosted)](https://ghost.org/docs/admin-api/) | HTTPS site URL and Ghost Admin API integration key. | **Automatic API**. Full HTML article. Free software; hosting may cost money. |
| [Paragraph](https://docs.paragraph.com/developers) | Publication API key from Settings → API keys; no site ID. | **Automatic API**. Full Markdown article. Free plan has limited API access; the API is in alpha. This connector does not email subscribers. |

The ten added destinations are public social posts, channel messages, room events or document pages. They are different services and count as automatic publishing, but they are not ten full-length blogs. Short formats use your description or a clipped extract plus canonical link. Check the preview and each platform's rules before publishing.

Of the extra names you suggested, **Paragraph** is now an automatic full-article destination. Its [official API](https://docs.paragraph.com/developers/api-reference/posts/create-a-new-post) accepts Markdown and the [current free plan](https://paragraph.com/pricing) lists API access. Hashnode, Mirror, Fountain, Fileverse, Zora, Sigle, Ecency, Cent, Nuance, Readl, directories, guest-post sites and cross-posting apps are not marked automatic here without a verified direct publishing API and a working connector. X and Reddit publish social/community posts, while LinkedIn's post API is separate from its long-form Articles editor; none of those three is connected yet. Do not paste their passwords or keys into another platform's token field.

## Guided editor: exactly what you do

Guided editor is **not automatic publishing**. You must finish on the destination website. The app does not log in or press its Publish button for you. No API token is needed for these editor destinations.

1. In this dashboard, save the article in Compose, select a guided destination and press Publish.
2. In the guided dialog click Copy title / Copy article, then Open editor.
3. Sign in directly on that platform, create a post and paste the content. The copied article is Markdown: if that editor does not render Markdown, use its formatting toolbar and add images with its media tools.
4. Review visibility, formatting and any email-send options. Press Publish / Submit **on that platform**. If approval is required, wait until the post is public.
5. Copy the public article address. Return to the dashboard, paste it into Published article URL and click Record publication.

Example: for Medium you still press Publish inside Medium. The dashboard records its link after you paste it back.

## Setup steps for every article destination

Menu labels can vary by account. Use the direct editor/settings links below where available. OAuth providers do not have a simple API-key button: WordPress.com and Tumblr require app authorization outside this dashboard.

### Medium

**What to enter here:** No token. Optional personal/publication editor URL.

1. Sign in at medium.com, then open your profile menu → Write a story, or use medium.com/new-story.
2. In this dashboard choose Medium in Compose and press Publish to open the guided dialog. Copy the title/article, then Open editor.
3. Paste the content in Medium. Use Medium's toolbar for headings and images; review → Publish in Medium.
4. Copy the public story address and paste it into Published article URL in this dashboard → Record publication.

Guided editor = you do the final publishing in Medium. No API key or account password belongs in this dashboard.

[Official platform / setup documentation](https://help.medium.com/hc/en-us/articles/213480228-API-Importing)

### WordPress.com

**What to enter here:** WordPress.com OAuth access_token + site ID or site domain.

1. Sign in to WordPress.com and create/select the free site you control. Enter its domain (for example, `yoursite.wordpress.com`) in Platforms → WordPress.com → Connect.
2. The developer OAuth application **Bulk Publisher Studio** was created on WordPress.com. Creating it gives a Client ID and Client Secret, but does not grant your site access or publish anything. Its redirect must match this installation's `/api/wordpress-oauth/callback` address, and `WORDPRESS_CLIENT_ID`, `WORDPRESS_CLIENT_SECRET` and `WORDPRESS_REDIRECT_URI` must be server settings.
3. Press **Connect with WordPress.com**. Review WordPress.com's access request for your site and approve it if you want this dashboard to post. The callback places the access token in this browser tab only.
4. Reopen Connect and press **Test connection**. You can also paste an existing OAuth access token manually. A developer Client ID, Client Secret, WordPress password or application password is not the publishing access token.

If you install a separate local or Vercel copy, create your own OAuth app with that installation's callback URL. Tokens expire; reconnect when WordPress rejects an expired token. Publishing to the site remains a separate action in Compose.

[Official platform / setup documentation](https://developer.wordpress.com/docs/api/getting-started/)

### Blogger

**What to enter here:** Google OAuth access token with Blogger scope + numeric blog ID.

1. Sign in at blogger.com and create/select your blog. Copy the numeric blog ID from the address bar in its dashboard (the number following /blog/).
2. Open developers.google.com/oauthplayground/. In Step 1 enter the scope https://www.googleapis.com/auth/blogger → Authorize APIs → sign in with the Google account that owns the blog and approve access.
3. In Step 2 press Exchange authorization code for tokens. Copy Access token, not Refresh token.
4. In this dashboard: Platforms → Blogger → Connect → paste Access token and the numeric Blogger blog ID → Test connection → Save connection.
5. For your own Google OAuth app, enable Blogger API in Google Cloud Console → APIs & Services → Library; configure OAuth consent/client credentials and the Playground callback if using its gear menu → Use your own OAuth credentials.

A Google API key cannot publish posts. Access tokens are short lived; replace them when they expire. The app does not refresh Google tokens automatically.

[Official platform / setup documentation](https://developers.google.com/blogger/docs/3.0/reference/posts/insert)

### DEV Community

**What to enter here:** DEV API key only. No site ID.

1. Sign in at dev.to → profile picture → Settings → Extensions (direct address: dev.to/settings/extensions).
2. Find DEV Community API Keys. Enter a description such as Bulk Publisher Studio → Generate API Key.
3. Copy the generated key. In this dashboard: Platforms → DEV Community → Connect → paste it into API key / OAuth access token.
4. Press Test connection → Save connection. Return to Compose, select DEV Community and Publish.

Up to four normalized tags. Publish relevant content and follow DEV's rules. The key is sensitive.

[Official platform / setup documentation](https://developers.forem.com/api/v0#tag/articles/operation/createArticle)

### Hashnode

**What to enter here:** No token. Optional publication dashboard URL.

1. Sign in at hashnode.com and create/select your blog/publication.
2. Open its dashboard → Write / New article. Copy that editor or dashboard URL into this destination's optional URL field if you want a shortcut.
3. Use this app's guided dialog to copy the title/article, open Hashnode, format and add media.
4. Press Publish in Hashnode, then copy the public article URL back to this dashboard → Record publication.

The free workflow uses Hashnode's browser editor. Its paid API access is not used by this app.

[Official platform / setup documentation](https://hashnode.com)

### Tumblr

**What to enter here:** OAuth2 access_token with basic + write scopes, plus blog name/hostname.

1. Sign in to Tumblr and select your blog. Copy its blog name (for example, myblog) or hostname (myblog.tumblr.com).
2. Open tumblr.com/oauth/apps → Register application. Record the app's OAuth client credentials privately and configure an authorized callback URL you control.
3. Use Tumblr's documented OAuth2 authorization-code flow with basic and write scopes; exchange the authorization code at https://api.tumblr.com/v2/oauth2/token.
4. Copy the OAuth2 access_token, not the Consumer Key or Consumer Secret. In this dashboard: Platforms → Tumblr → Connect → paste the token and blog name/hostname.
5. Press Test connection → Save connection. This app accepts a bearer token; obtaining/refreshing it currently requires the external OAuth flow.

OAuth developer setup is required. Text, public image URLs and tags are supported; review Markdown punctuation and platform limits.

[Official platform / setup documentation](https://www.tumblr.com/docs/en/api/v2)

### Substack

**What to enter here:** No token. Optional publication dashboard URL.

1. Sign in at substack.com and open your publication's Dashboard.
2. Choose New post / Text post and copy that publication dashboard URL for the optional editor shortcut in this app.
3. In the guided dialog, copy title/article → Open editor. Paste and review formatting/media in Substack.
4. Choose whether to publish only on the web or also send email/app notifications. Publish in Substack, then record the public article URL here.

You must press the final publish/send button in Substack. Check email delivery settings before publishing.

[Official platform / setup documentation](https://substack.com)

### LinkedIn Articles

**What to enter here:** No token. A LinkedIn profile or Page with author access.

1. Sign in at linkedin.com. From the home feed choose Write article (for a Page, choose the correct publishing identity).
2. Use the guided dialog to copy title/article → Open editor (linkedin.com/article/new/).
3. Paste text, add a cover image and format with LinkedIn's editor → Next / Publish.
4. Copy the public article address and record it in this dashboard.

Native long-form Articles require manual completion here. No LinkedIn password or token is requested by this destination.

[Official platform / setup documentation](https://www.linkedin.com)

### beehiiv

**What to enter here:** No token. Optional publication dashboard URL.

1. Sign in at app.beehiiv.com and select your publication.
2. Open the post editor using Start writing / Write → Posts → Create post (the label may vary by account).
3. Copy the content from the guided dialog, paste it in beehiiv, add media and choose web/email distribution.
4. Publish in beehiiv, then paste the public web-post URL into this dashboard → Record publication.

Free-plan publishing uses the browser editor. The paid Create Post API is not connected.

[Official platform / setup documentation](https://www.beehiiv.com)

### Wix Blog

**What to enter here:** No token. Wix site editor/dashboard URL.

1. Sign in at manage.wix.com and select your site. Add Wix Blog from the site editor's Add Apps if the site has no blog.
2. In the site dashboard open Blog → Posts → Create New Post.
3. Use this app's guided dialog to copy the article, then paste/format it in Wix and add photos with Wix's media controls.
4. Publish the post and make sure the Wix site is published. Record the public post URL here.

The app does not automate Wix's API. The free Wix-branded site and its editor are used.

[Official platform / setup documentation](https://www.wix.com)

### Square Online / Weebly

**What to enter here:** No token. Your Square Online/Weebly editor URL.

1. For Square, sign in to squareup.com/dashboard and open your Online site editor. For an existing Weebly site, sign in to its own dashboard.
2. For Square Stories, open the website editor and add/select a Stories page; create a story. Existing Weebly users add/select their Blog page and create a post.
3. Copy the article from this app, paste and format it in the site editor, add media, then Publish the story/site.
4. Open the public post in a reader tab and record that URL in this app.

Manual editor workflow. Use an account/site that actually provides Stories or Blog editing.

[Official platform / setup documentation](https://squareup.com/us/en/online-store)

### Telegra.ph — Account 2

**What to enter here:** This slot's own Telegraph access token. No username/password or site ID.

1. In this dashboard open Platforms → Telegra.ph — Account 2 → Connect.
2. Click Create a free Telegraph account. The app requests a new account from Telegraph and fills this slot's token field; no existing login is needed.
3. Click Test connection → Save connection. If you want to retain editing access, copy the token into your private password manager before the browser session ends.
4. Return to Compose, select Telegra.ph — Account 2 and Publish. Open the returned public URL in Overview → Published links or Activity.

This is a separate account connection on the same Telegra.ph service. Keep different account tokens in different slots. Pages are public; content must fit Telegraph's 64 KB limit.

[Official platform / setup documentation](https://telegra.ph/api)

### Vocal Media

**What to enter here:** No API token. Vocal account, Wallet/Stripe setup and story details.

1. Sign in at vocal.media. Open your account's Wallet and complete the Stripe connection required by Vocal; do this on Vocal, not in this app.
2. Choose Create story. Prepare title, subtitle, featured image, article text, tags and the correct community.
3. Copy content from this app's guided dialog into Vocal's editor, review its word-count and content rules, then submit for review.
4. Wait for editorial approval. Only after the story is publicly accessible, copy its URL into this app → Record publication.

Submitting for moderation is not immediate publication. A private editor URL is not a live story URL.

[Official platform / setup documentation](https://vocal.media)

### LiveJournal

**What to enter here:** No token. Journal/community posting access and optional editor URL.

1. Sign in at livejournal.com and open livejournal.com/update.bml (Post / New entry).
2. Choose your journal or a community where you have posting permission.
3. Copy the guided article into the editor, add media, choose Public visibility and submit the entry.
4. Open the public entry and record its URL in this dashboard.

Uses LiveJournal's own editor; its legacy XML-RPC API is not integrated.

[Official platform / setup documentation](https://www.livejournal.com)

### Bear Blog

**What to enter here:** No token. Bear Blog dashboard URL and public image URLs.

1. Sign in at bearblog.dev → Dashboard and create/select your blog.
2. Open Posts → New post (or the dashboard's new-post action).
3. Copy the Markdown article from the guided dialog. Use external HTTPS image URLs for photos on the free plan.
4. Publish the post in Bear Blog, then copy its public URL back to this dashboard.

Free workflow uses external images; Bear's built-in image uploads may require an upgrade.

[Official platform / setup documentation](https://bearblog.dev)

### Telegra.ph — Account 1

**What to enter here:** Workspace token, or a token saved for Account 1. No username/password or site ID.

1. In this dashboard open Platforms → Telegra.ph — Account 1 → Connect.
2. If the hosted workspace token is already configured you can use it. Otherwise click Create a free Telegraph account, or paste your existing token.
3. Click Test connection → Save connection. If you want to retain editing access, copy the token into your private password manager before the browser session ends.
4. Return to Compose, select Telegra.ph — Account 1 and Publish. Open the returned public URL in Overview → Published links or Activity.

This is a separate account connection on the same Telegra.ph service. Keep different account tokens in different slots. Pages are public; content must fit Telegraph's 64 KB limit.

[Official platform / setup documentation](https://telegra.ph/api)

### Quora Spaces

**What to enter here:** No token. Space URL and contributor/moderator/admin posting rights.

1. Sign in at quora.com and open a Space you manage or can contribute to.
2. Use its Create post action. Confirm your role can publish directly; followers may only submit for approval.
3. Copy title/article from this app's guided dialog, paste and format it in the Space, then Post/Submit.
4. If moderation is required, wait for approval. Record the resulting public post URL here.

Final publication takes place in Quora. Do not record a private draft or unapproved submission as published.

[Official platform / setup documentation](https://www.quora.com)

### Telegra.ph — Account 3

**What to enter here:** This slot's own Telegraph access token. No username/password or site ID.

1. In this dashboard open Platforms → Telegra.ph — Account 3 → Connect.
2. Click Create a free Telegraph account. The app requests a new account from Telegraph and fills this slot's token field; no existing login is needed.
3. Click Test connection → Save connection. If you want to retain editing access, copy the token into your private password manager before the browser session ends.
4. Return to Compose, select Telegra.ph — Account 3 and Publish. Open the returned public URL in Overview → Published links or Activity.

This is a separate account connection on the same Telegra.ph service. Keep different account tokens in different slots. Pages are public; content must fit Telegraph's 64 KB limit.

[Official platform / setup documentation](https://telegra.ph/api)

### Telegra.ph — Account 4

**What to enter here:** This slot's own Telegraph access token. No username/password or site ID.

1. In this dashboard open Platforms → Telegra.ph — Account 4 → Connect.
2. Click Create a free Telegraph account. The app requests a new account from Telegraph and fills this slot's token field; no existing login is needed.
3. Click Test connection → Save connection. If you want to retain editing access, copy the token into your private password manager before the browser session ends.
4. Return to Compose, select Telegra.ph — Account 4 and Publish. Open the returned public URL in Overview → Published links or Activity.

This is a separate account connection on the same Telegra.ph service. Keep different account tokens in different slots. Pages are public; content must fit Telegraph's 64 KB limit.

[Official platform / setup documentation](https://telegra.ph/api)

### Notion Sites

**What to enter here:** No token. A page you can edit and permission to publish it.

1. Sign in to Notion, choose a workspace and create/open the page for your article.
2. Copy the guided article into the page. Format headings and add image blocks as needed.
3. At the top of the page choose Share → Publish → Publish to web. Review the public-sharing settings yourself.
4. Copy the published web URL (not the private workspace/editor URL) and record it in this dashboard.

Public sharing must be completed in Notion. A workspace page address alone does not make a page public.

[Official platform / setup documentation](https://www.notion.com)

## The 10 webpage hosts

First create an empty, dedicated site or repository on the selected host's free plan. These adapters publish an HTML website containing your selected saved articles. They do not host the admin dashboard itself.

| Host | Token and fields to enter | Setup needed first |
| --- | --- | --- |
| [GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site) | API/access token; Public repository (owner/name); Publishing branch; Public site URL | Public repository, Pages from branch root, token with Contents write. Existing initialized branch required. |
| [GitLab Pages](https://docs.gitlab.com/user/project/pages/) | API/access token; Project ID or namespace/project; Publishing branch; Public site URL | Public project, Pages CI publishing the repository root, token with api scope. Pipeline runs after commit. |
| [Codeberg Pages](https://docs.codeberg.org/codeberg-pages/) | API/access token; Public repository (owner/name); Publishing branch; Public site URL | Public repository, pages branch, git-pages webhook configured, token with repository write. Follow Codeberg's hosting rules. |
| [Netlify](https://docs.netlify.com/api-and-cli-guides/api-guides/get-started-with-api/) | API/access token; Site ID | Personal access token and an already-public dedicated site. Each deployment replaces its entire snapshot. Free credits apply. |
| [Vercel](https://vercel.com/docs/rest-api/deployments/create-a-new-deployment) | API/access token; Project name or ID; Team ID (optional) | Token and dedicated project configured as Other (static). Hobby is personal/non-commercial. Disable deployment protection for public pages. |
| [Neocities](https://neocities.org/api) | API/access token | Free site and API key from site settings. Uploads HTML directly. Respect site rules and avoid repeated unchanged deployments. |
| [Cloudflare Pages](https://developers.cloudflare.com/pages/get-started/direct-upload/) | API/access token; Account ID; Pages project name; Production branch | Dedicated Direct Upload project, account ID, and scoped API token with Account → Cloudflare Pages → Edit. |
| [Firebase Hosting](https://firebase.google.com/docs/hosting/api-deploy) | API/access token; Hosting site ID | Existing Hosting site on Spark, short-lived Google OAuth access token with Firebase Hosting permissions. Do not paste a service-account JSON file. |
| [Render Static Sites](https://api-docs.render.com/reference/create-deploy) | Render API token + GitHub token; Render service ID; Public repository (owner/name); Publishing branch; Public site URL | Dedicated free static site linked to this GitHub repo/branch; publish directory is repository root. Requires Render token plus GitHub Contents-write token. |
| [Appwrite Sites](https://appwrite.io/docs/products/sites/deploy-manually) | API/access token; Cloud region; Project ID; Site ID; Public production URL (*.appwrite.network) | Dedicated static site on a free project. Server API key with sites.write; public production domain, no install/build command, root output. |

For GitLab, create a working Pages pipeline that publishes the repository root (the generated HTML files are written there). For Codeberg, configure the Pages webhook and publishing branch before using this app. Render's static site must use the same GitHub repository/branch you enter and publish the repository root.

For Cloudflare, create a **Direct Upload** Pages project and scope the token to the account's Cloudflare Pages Edit permission. For Firebase, use a short-lived Google OAuth access token with Firebase Hosting permissions for an existing Spark site. For Appwrite, use a server key with sites.write, a static site, blank install/build commands and root output directory.

Full-snapshot hosts replace the entire deployed website with the selected articles. Git repository hosts overwrite the generated index and matching managed files. The app asks you to acknowledge the dedicated site before uploading.

After an upload, press **Verify live pages**. The app marks the result published only when its unique public marker matches. Use the provider's HTTPS subdomain, not a custom domain, for this check. A queued build is not yet a verified publication.

## Photos and Word/LibreOffice imports

- Import .docx, .odt, .md or .txt. Save old Word .doc files as .docx first. Review the imported formatting.
- To upload photos (including images inside documents), provide a **Cloudinary cloud name** and an **unsigned upload preset** in Compose → Photo settings. Restrict the preset to raster images and 5 MB. Uploaded images are public. No Cloudinary API secret belongs in the browser.
- You may instead paste public HTTPS photo URLs. Videos currently use public links; video-file upload is not implemented.

## Where the published links appear

- **Overview → Published links** shows full clickable URLs, including the three verified test pages.
- **Activity** shows the full URL for every recorded article publication.
- **Page hosts → Deployment results** shows the website URL and, after verification, a link for each selected article.

## Simple usage terms

Use accounts/sites you control. Publish only content and media you have permission to use. Review before publishing; posts and uploaded photos may become public. Follow each site's rules and quotas. Free plans and editorial policies can change. Views, indexing and editorial approval are not guaranteed. Deleting a local draft does not delete an external post. Keep your credentials and backups private.

## What has actually been verified

Three real Telegraph test pages were published and checked publicly on 16 October 2026. Their URLs are in the dashboard and [test-results.json](../test-results.json). Word/LibreOffice import and core app functions have automated checks; DOCX import/save/preview was also tested in the browser. Other credentialed providers have request-format tests with mocked responses and still require a live account test after you supply tokens. API token refresh and unattended scheduling are not implemented.
