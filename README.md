# Bulk Publisher Studio

A working private dashboard for composing/importing articles, managing 20 publishing destinations and deploying article websites to 10 free-plan hosts.

Start with [the simple local and VPS guide](public/guides/QUICKSTART.md) and [what to provide for every platform](public/guides/PLATFORM-GUIDE.md).

```sh
npm ci
npm run setup:local
npm start
```

Open http://127.0.0.1:8787. Initial local login: `admin` / `admin`. Change `.dev.vars` before sharing access.

- DOCX, ODT, Markdown/text import; photo uploads through your Cloudinary unsigned preset.
- Six article APIs: DEV, WordPress.com, Blogger, Tumblr, HackMD and Telegraph. Fourteen destinations use guided editor publishing; see each Requirements panel.
- Ten webpage deployment adapters: GitHub, GitLab, Codeberg, Netlify, Vercel, Neocities, Cloudflare Pages, Firebase Hosting, Render Static Sites and Appwrite Sites. Configure dedicated sites and required credentials first.
- Real live Telegraph test links are in [test-results.json](public/test-results.json). Other providers have mocked contract tests and still need live account-level verification.
- Tokens entered in the GUI stay in browser session storage. Hosted workspace secrets use the Sites environment store.
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
