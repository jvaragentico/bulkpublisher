# Credential formats: what goes in each box

These are **fake examples** showing the shape of a value. They will not authenticate. Get real keys from the platform account you control, then open **Platforms → Connect → Test connection → Save connection**. Do not paste your normal account password, except a dedicated Bluesky app password. Most publishing tokens stay in the current browser tab; closing it may require importing your private file again.

In `CREDENTIALS.local.json`, `token` means the value in the **API key / OAuth access token** box, and `siteId` means the value in the **site / account / target** box. Leave unused entries empty. The dashboard never loads this file automatically.

If importing reports **zero publishing tokens**, the `connections` entries in your selected file have blank `token` values. A site address by itself is not a publishing credential. The hosted dashboard's server-side Telegra.ph/DEV connections and WordPress OAuth app settings are separate and are not exported into this file. The WordPress app's Client ID and Client Secret are **not** a WordPress publishing access token; use **Connect with WordPress.com** and approve access for your site.

```json
{
  "format": "bulkpublisher-credentials-v1",
  "connections": {
    "wordpress-org": { "token": "writer:xxxx xxxx xxxx xxxx xxxx xxxx", "siteId": "https://blog.example.org" },
    "telegram": { "token": "123456789:AAExampleBotToken", "siteId": "@my_public_channel" },
    "paragraph": { "token": "YOUR_PARAGRAPH_API_KEY", "siteId": "" }
  }
}
```

The real file may have more entries. Never commit or share a filled copy. `CREDENTIALS.example.json` has all supported connection names. Its `serverSettings` block is a reminder only; values there are **not** imported into the app. Set server secrets in your local `.env.local`, VPS, Sites, or Vercel environment settings.

## Article and public post destinations

| Platform | Token box example | Site / target box example |
| --- | --- | --- |
| WordPress.com | OAuth **access token**, such as `ACCESS_TOKEN_FROM_CONNECT_FLOW` | `myblog.wordpress.com` or numeric site ID |
| Blogger | Google OAuth **access token**, such as `ya29.EXAMPLE` | Numeric blog ID, such as `1234567890123456789` |
| DEV | DEV API key, such as `YOUR_DEV_API_KEY` | Leave empty |
| Tumblr | OAuth2 **access token**, such as `YOUR_TUMBLR_ACCESS_TOKEN` | `myblog.tumblr.com` |
| Telegra.ph Accounts 1–4 | Each account's own Telegraph `access_token`; never reuse one token in another slot | Leave empty |
| Mastodon | User access token with `write:statuses` | `https://mastodon.social` (replace with your instance) |
| Bluesky | Dedicated **app password** generated in Bluesky settings | `writer.bsky.social` without `@` |
| Telegram channel | BotFather bot token, shaped like `123456789:AAExampleBotToken` | Public channel username, such as `@my_public_channel` |
| Discord webhook | Complete webhook URL, shaped like `https://discord.com/api/webhooks/123456789/EXAMPLE_TOKEN` | Leave empty |
| GitHub Gist | Fine-grained token with Gists write permission | Leave empty |
| GitLab snippet | Personal access token with `api` scope | Leave empty |
| Bitbucket snippet | API/OAuth token with snippet write permission | Workspace slug, such as `my-workspace` |
| Matrix public room | Matrix account access token | `https://matrix.org | !example:matrix.org` |
| Misskey | Token with note write permission | `https://misskey.io` or your instance URL |
| Lemmy | Account bearer token | `https://lemmy.world | 12345` (numeric community ID) |
| WordPress (self-hosted) | `username:application-password`, such as `writer:xxxx xxxx xxxx xxxx xxxx xxxx` | `https://blog.example.org` |
| WriteFreely | WriteFreely API token | `https://write.example.org | my-collection` |
| Ghost (self-hosted) | Admin API integration key: **24 hex characters**, colon, **64 hex characters** | `https://ghost.example.org` |
| Paragraph | API key from publication **Settings → API keys** | Leave empty; the key identifies the publication |

**Guided editors** (Medium, Hashnode, Substack, LinkedIn Articles, beehiiv, Wix, Square Online/Weebly, Vocal, LiveJournal, Bear Blog, Quora Spaces, Notion Sites) need no token in this dashboard. Sign in on each platform, finish the post there, then record its public URL in Activity. A token cannot make these guided destinations automatic in this app.

## Ten webpage hosts

Open **Page hosts → Configure** for each host. These settings use a separate form; they are not imported by `CREDENTIALS.local.json`. The examples below show syntax, not real accounts.

| Host | API / access token box | Other fields |
| --- | --- | --- |
| GitHub Pages | Token with repository Contents write | `owner/repository`, branch `main`, public URL `https://owner.github.io/repository/` |
| GitLab Pages | Token with `api` scope | Project ID or `group/project`, branch `main`, public URL `https://group.gitlab.io/project/` |
| Codeberg Pages | Token with repository write | `owner/repository`, branch `pages`, public URL `https://owner.codeberg.page/repository/` |
| Netlify | Personal access token | Site ID (UUID from Site configuration), such as `00000000-0000-4000-8000-000000000000` |
| Vercel | Vercel API token | Dedicated static project name or ID, optional team ID |
| Neocities | Site API key from Neocities settings | No other fields |
| Cloudflare Pages | API token with Pages Edit | Cloudflare account ID, Pages project name, branch `main` |
| Firebase Hosting | Short-lived Google OAuth access token with Hosting permission | Hosting site ID, such as `my-firebase-site` |
| Render Static Sites | Render API token; separate GitHub Contents-write token in second box | Render service ID, `owner/repository`, branch, public URL |
| Appwrite Sites | Server API key with `sites.write` | Region such as `fra`, project ID, site ID, public production URL |

For click-by-click instructions and platform limitations, use the [platform guide](./PLATFORM-GUIDE.md). Test each account before bulk publishing. A successful local mock test does not prove that a live account token has the right permissions.
