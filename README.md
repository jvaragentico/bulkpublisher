# Bulk Publisher Studio

A private dashboard for composing/importing articles, managing 34 destination slots (22 API, 12 guided) and deploying article websites to 10 free-plan hosts. API destinations require your own account credentials and live account-level testing.

Start with [the simple local and VPS guide](public/guides/QUICKSTART.md), [what to provide for every platform](public/guides/PLATFORM-GUIDE.md), and [example credential formats](public/guides/CREDENTIAL-FORMATS.md).

On Windows, extract the entire ZIP into a new empty folder and double-click **START-WINDOWS.cmd**. The new archive places `package.json` and `package-lock.json` directly in the extracted folder. For an older archive with a nested `bulkpublisher` folder, first run `cd bulkpublisher`. Run the commands below only beside `package.json`.

```sh
npm ci
npm run setup:local
npm start
```

Open http://127.0.0.1:8787. Initial local login: `admin` / `admin`. Change `.dev.vars` before sharing access.

- DOCX, ODT, Markdown/text import; photo uploads through your Cloudinary unsigned preset.
- Twenty-two automatic destination slots, including DEV, WordPress.com, Blogger, Tumblr, four Telegraph accounts, ten public post/document services and four full-article APIs for WordPress, WriteFreely, Ghost and Paragraph. Twelve slots require manual publication in the platform editor. The directory covers 31 services.
- Ten webpage deployment adapters: GitHub, GitLab, Codeberg, Netlify, Vercel, Neocities, Cloudflare Pages, Firebase Hosting, Render Static Sites and Appwrite Sites. Configure dedicated sites and required credentials first.
- Real live Telegraph test links are in [test-results.json](public/test-results.json). Other providers have mocked contract tests and still need live account-level verification.
- Copy `CREDENTIALS.example.json` to `CREDENTIALS.local.json` and fill your own tokens. The private copy is ignored by Git and omitted from ZIPs. The dashboard imports it only when you select the file in Platforms; tokens stay in browser session storage. Hosted workspace secrets use the Sites environment store.
- Local data persists in `.wrangler/state`; the source archive intentionally excludes secrets and runtime data.

Live dashboard: https://bulk-publisher-studio.jvar-agentic.chatgpt.site/

[Usage terms](TERMS.md) · [Verification report](TEST-REPORT.md)

## Checks and packaging

```sh
npm test
npx tsc --noEmit
npm run build
npm run package:source
```

The last command writes `outputs/bulkpublisher-source.zip`. This repository includes the Sites/Vinext runtime integration. Local/VPS operation uses a loopback Wrangler runtime with persistent local D1/SQLite; the hosted version uses managed D1. Both use the same publishing adapters.

For Vercel, the source ZIP includes `vercel.json` and a native Next.js build. Provision a separate Cloudflare D1 database and set the Vercel environment variables in [the Vercel guide](public/guides/VERCEL.md), then run `npm run db:vercel` before deployment. The production build passes; an account-level Vercel deployment still needs your Cloudflare and Vercel credentials.

Plain HTTP/HTTPS addresses become clickable in previews and published article HTML. For an already published Telegraph article, select its accounts and use **Update selected Telegra.ph pages** to apply text/media changes while keeping the saved URLs.
