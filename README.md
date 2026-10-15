# Bulk Publisher Studio

A private, hosted dashboard for writing articles and managing publication across 20 free blogging destinations. It stores drafts, media URLs, keywords, platform settings, published URLs, and view counts in Cloudflare D1 per signed-in user.

## What works

- **Direct publishing:** DEV Community, WordPress.com, and Blogger, using each platform's documented API. The app records the URL returned by the platform. DEV view counts can be refreshed through its API.
- **Guided publishing:** Medium and 16 other free destinations. Copy the title and article, open that destination's editor, publish there, and record the live URL in the dashboard.
- **Content:** title, description, Markdown body, cover image URL, video URL, canonical URL, and keywords. You can export a Markdown file.
- **Tracking:** one publication record per article and platform, with status, URL, error, and views. Other platforms' views can be entered from their own analytics.

The destination list is curated, not a traffic ranking. Free plan terms and editorial policies can change. Some destinations are designed for specific content types or communities. Review the article before submitting it to each one.

## Connect accounts

Open **Platforms** and select a direct API destination. Paste your token into the connection dialog. Tokens are kept only in the current browser session; they are sent to this private site's server when you publish or refresh DEV views, and are not stored in D1. The site/blog ID is saved in D1 for your account.

| Destination | Credential | Site identifier |
| --- | --- | --- |
| DEV Community | [DEV API key](https://developers.forem.com/api/v0) | None |
| WordPress.com | [OAuth access token](https://developer.wordpress.com/docs/api/getting-started/) | WordPress.com site ID or domain |
| Blogger | [Google OAuth access token](https://developers.google.com/blogger/docs/3.0/reference/posts/insert) with Blogger scope | Blogger blog ID |

Medium [does not issue new API integration tokens](https://help.medium.com/hc/en-us/articles/213480228-API-Importing), so Medium uses the guided flow. Existing Medium tokens are not used by this app.

## Run locally

This project uses the Sites Vinext starter. Node.js 22.13+ is required.

```sh
npm ci
npm run db:generate
npm run build
```

Apply the generated migration to the local D1 database as described in the [Sites starter](https://github.com/cloudflare/vinext), then run `npm run dev`. The local preview uses the starter's mock sign-in route `/signin-with-chatgpt?return_to=/`. Hosted authentication and access are managed by Sites.

## Safety and limits

Publishing is triggered by a button press. The server sends article content only to the chosen platform. The app does not scrape passwords, automate sign-in pages, or claim API support where the destination has no supported integration. Cover and video media must already be hosted at HTTPS URLs; this version does not upload media files. WordPress.com and Blogger do not expose views through this app, so enter those counts manually. A direct publish that fails after reaching a platform may need manual reconciliation before retrying to avoid duplicates.

