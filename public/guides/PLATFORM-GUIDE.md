# What to provide for each platform

Start with [the local/VPS setup guide](QUICKSTART.md). Your dashboard login is admin; the initial password is admin. Change it in .dev.vars before sharing access.

## Two kinds of article destinations

**Automatic API** means the app can send the article after you provide a valid platform-issued token and the listed IDs. **Guided editor** means the app prepares the article and opens that platform's editor; you sign in and press Publish there, then paste the resulting URL into the dashboard.

Do not send account passwords to us or paste them into token fields. Sign in directly on each platform. Paste only API keys/access tokens issued for your own account.

## The 20 article destinations

| Platform | What you need to provide or set up | Publishing mode / limits |
| --- | --- | --- |
| [Medium](https://help.medium.com/hc/en-us/articles/213480228-API-Importing) | Free Medium account; sign in in the platform editor; Profile or publication editor URL; Publication contributor rights if publishing to a publication | **Guided editor**. New API tokens are unavailable. Final publishing uses Medium's editor. |
| [WordPress.com](https://developer.wordpress.com/docs/api/getting-started/) | WordPress.com site on a free plan; OAuth bearer token with posting permission; Site ID or domain; author/editor rights | **Automatic API**. A WordPress.org application password is not a WordPress.com OAuth token. |
| [Blogger](https://developers.google.com/blogger/docs/3.0/reference/posts/insert) | Google account and an existing Blogger blog; OAuth access token with https://www.googleapis.com/auth/blogger scope; Blog ID and author permissions | **Automatic API**. Google access tokens expire. Refresh outside this app and replace the token. |
| [DEV Community](https://developers.forem.com/api/v0#tag/articles/operation/createArticle) | DEV account; API key from Settings → Extensions | **Automatic API**. Four normalized tags maximum. Review DEV community relevance; YAML front matter is rejected. |
| [Hashnode](https://hashnode.com) | Free Hashnode account and publication; Publication dashboard URL | **Guided editor**. API access requires Pro as of May 2026. The free workflow uses its editor. |
| [Tumblr](https://www.tumblr.com/docs/en/api/v2) | Tumblr blog; OAuth2 bearer token with basic and write scopes; Blog name or hostname | **Automatic API**. Text, photos and tags supported. Markdown punctuation in text blocks may need review. Daily platform limits apply. |
| [Substack](https://substack.com) | Substack account and publication; Publication dashboard URL; Choose web-only or email distribution in Substack | **Guided editor**. Final publication uses the editor. Check email delivery before submitting. |
| [LinkedIn Articles](https://www.linkedin.com) | LinkedIn profile or Page with author access; Browser login to the Articles editor | **Guided editor**. Native long-form Articles are guided. The Posts API link preview is a different format. |
| [beehiiv](https://www.beehiiv.com) | Free beehiiv publication; Publication dashboard URL | **Guided editor**. Create Post API is paid-only; free publishing uses the editor. |
| [Wix Blog](https://www.wix.com) | Published free Wix site; Wix Blog installed and editor access; Site dashboard URL | **Guided editor**. This app provides guided publishing. Wix's API is not integrated here. |
| [Square Online / Weebly](https://squareup.com/us/en/online-store) | Square Online free site with Stories, or existing Weebly blog; Site dashboard URL and editor access | **Guided editor**. Uses the platform editor. New users should choose Square Online. |
| [HackMD](https://hackmd.io/@docs/hackmd-api) | HackMD account; Personal API token from Settings → API | **Automatic API**. Notes are publicly readable by link. Discovery is not guaranteed; 400 API calls/month on the free plan. |
| [Vocal Media](https://vocal.media) | Vocal account and connected Stripe account in Wallet; Title, subtitle, featured media, story and community; Usually at least 600 words (100 for poems) | **Guided editor**. Moderation is required. Record a URL only after the story is public. |
| [LiveJournal](https://www.livejournal.com) | LiveJournal account and journal/community posting rights; Editor URL | **Guided editor**. Uses the editor. The legacy XML-RPC API is not integrated. |
| [Bear Blog](https://bearblog.dev) | Free Bear Blog account; Blog dashboard URL; Public external image URLs for photos | **Guided editor**. Built-in image uploads require an upgrade; external photo URLs work. |
| [Telegra.ph](https://telegra.ph/api) | Workspace Telegraph token, your own token, or create a free account here; Public HTTPS image URLs; article content under 64 KB | **Automatic API**. Pages are public. Keep a backup of your own token to retain editing access. |
| [Quora Spaces](https://www.quora.com) | Quora account and Space URL; Contributor, moderator or admin posting rights | **Guided editor**. Followers may only submit for approval. Final publishing uses Quora. |
| [GitHub Pages](https://pages.github.com) | Free public repository; Pages enabled, build workflow, branch and content path; Repository access; use Page hosts for automatic HTML deployment | **Guided editor**. This article workflow exports Markdown for your existing site. |
| [GitLab Pages](https://docs.gitlab.com/user/project/pages/) | GitLab project with working Pages CI; Branch, content path and Pages URL; Repository access; use Page hosts for automatic HTML deployment | **Guided editor**. This article workflow exports Markdown for your existing site. |
| [Notion Sites](https://www.notion.com) | Free Notion workspace; Page editing permission; Publish the page to web using Share → Publish | **Guided editor**. Final publishing is manual. A workspace URL alone does not make a page public. |

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
