# Bulk Publisher Studio — simple setup guide

## On your own computer

1. Install Node.js 24 or newer (22.18+ also works), with npm.
2. Extract `bulkpublisher-source.zip`. Open a terminal inside the extracted `bulkpublisher` folder, where `package.json` is.
3. Run these commands, one at a time:

```sh
npm ci
npm run setup:local
npm start
```

4. Open http://127.0.0.1:8787 in your browser.
5. Sign in with username **admin** and password **admin**.

Keep the terminal open while using the dashboard. Stop it with Ctrl+C. Next time, run only `npm start`.

The first setup builds the app, creates the local database and creates a private `.dev.vars` settings file. If a firewall prompt appears, private/local access is enough. No Cloudflare account is needed for this local mode.

## Change the password

Stop the app. Open `.dev.vars` in a text editor. Change the value after `ADMIN_PASSWORD=`. Keep the quotes. Restart with `npm start`.

The login username stays `admin`. Do not commit or share `.dev.vars`. The hosted Sites copy has its own separately configured server password and retains its private Sites sign-in gate.

## On a Linux VPS — private access with an SSH tunnel

Use an ordinary Linux VPS with Node.js 24+, npm, Git and at least 2 GB RAM. The VPS itself may cost money; the project does not rent a server for you.

```sh
git clone https://github.com/jvaragentico/bulkpublisher.git
cd bulkpublisher
npm ci
npm run setup:local
```

Edit `.dev.vars` and replace the default admin password with a strong password. Then run `npm start` in a persistent terminal such as tmux. A systemd example is included below.

On YOUR computer, open an SSH tunnel:

```sh
ssh -N -L 8787:127.0.0.1:8787 YOUR_USER@YOUR_VPS_IP
```

Leave that command running. Open http://127.0.0.1:8787 on your computer. The dashboard stays bound to the VPS loopback interface; do not open port 8787 to the Internet. This is a single-admin deployment using Wrangler's local runtime and a persistent local SQLite database. It is not a distributed production database or a high-availability service.

Optional systemd service (replace USER and PROJECT_PATH with your actual values; use `which node` to find the Node path):

```ini
[Unit]
Description=Bulk Publisher Studio
After=network.target

[Service]
Type=simple
User=USER
WorkingDirectory=PROJECT_PATH
ExecStart=/usr/bin/node scripts/local.mjs serve
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Save as `/etc/systemd/system/bulkpublisher.service`, then run `sudo systemctl daemon-reload` and `sudo systemctl enable --now bulkpublisher`. Use `journalctl -u bulkpublisher` to read errors. Keep using the SSH tunnel to open the GUI.

## First article

1. Open **Compose**. Type an article or import DOCX (Word), ODT (LibreOffice), Markdown or text. Old `.doc` files must be saved as `.docx` first.
2. Review the import. Headings, paragraphs, links, Word bold/italic and raster images are supported; complex layouts/tables are simplified. Documents are limited to 10 MB compressed / 30 MB expanded and 100,000 text characters.
3. For photo uploads, open **Photo settings**. Create a free Cloudinary account, copy your cloud name, and create an **unsigned upload preset** restricted to raster photos and a 5 MB size limit. Paste the cloud name and preset. Photos are public once uploaded. You can also paste existing public HTTPS image URLs.
4. Add title, description, tags, optional canonical URL and video link. Preview, then Save article.
5. Open **Platforms**. Each destination lists its exact account and permission requirements. Add tokens only for API destinations. Never paste an account password into a token field.
6. Back in Compose, choose destinations and Publish. This sends real public posts. Keep the tab open until the queue finishes.
7. Open **Activity** and inspect the returned links. A network timeout is uncertain: inspect the destination before retrying. Record the result URL if it was published.

## Which article platforms publish automatically?

Eight automatic API destination slots: **DEV, WordPress.com, Blogger, Tumblr and four separate Telegra.ph accounts**. There are 20 article slots across 17 services.

Twelve use their own editor: Medium, Hashnode, Substack, LinkedIn Articles, beehiiv, Wix, Square Online/Weebly, Vocal, LiveJournal, Bear Blog, Quora Spaces and Notion Sites. The app prepares the content and records your published URL. Entering a password will not turn these guided workflows into API publishing. GitHub/GitLab also have automatic HTML deployment in **Page hosts**.

Medium does not issue new API tokens. Hashnode and beehiiv publishing APIs require paid access. The app keeps their free editor workflows. HubPages is no longer offered. HackMD and the GitHub/GitLab article entries were replaced by three additional Telegra.ph account slots. Vocal requires account setup, Stripe connection and editorial approval.

The hosted app has a workspace Telegraph account configured. For a local copy, open Platforms → Telegra.ph — Account 1 → Connect → Create a free Telegraph account → Save connection. Repeat separately for Accounts 2, 3 and 4 with different account tokens. Keep the generated token privately if you want to reuse that account. You can optionally add `TELEGRAPH_TOKEN="your-token"` to `.dev.vars` and restart to use it as the local workspace account.

API tokens entered in the GUI stay in browser session storage. They are not written to the article database. OAuth refresh is not automatic: replace expired Google/Tumblr/WordPress tokens. This is an interactive bulk publisher; it does not run an unattended schedule after the browser closes.

## Publish a website to the 10 free-plan hosts

Open **Page hosts**. Supported deployment code is included for GitHub Pages, GitLab Pages, Codeberg Pages, Netlify, Vercel, Neocities, Cloudflare Pages, Firebase Hosting, Render Static Sites and Appwrite Sites.

Create a dedicated site first and follow the provider setup link in the dashboard. Paste the required token and IDs. Repository hosts need an initialized publishing branch and working Pages/CI setup. Vercel Hobby is restricted to personal/non-commercial use. Free quotas and account approval still apply.

Choose 1–30 saved articles and destination hosts. Confirm the dedicated-site checkbox, then Publish. **Full-snapshot hosts replace all deployed files with the selected article website.** Use an empty/dedicated site, never an unrelated production site. Repository hosts overwrite the generated index and matching article files while preserving other repository files.

Wait for the provider to finish, then press **Verify live pages**. The app checks a unique public deployment marker. It only marks the result published when that marker matches. View the website and individual article links in Deployment results. Custom domains are not supported for verification; use the provider's free subdomain.

You can also use **Download HTML website ZIP** to export your articles without credentials and upload them yourself.

## Backups, updates and troubleshooting

- Your local articles and deployment records live in `.wrangler/state`. Stop the server and back up that directory along with `.dev.vars` privately. Hosted and local databases are separate.
- The source ZIP excludes credentials, local databases, Git history, node_modules and build caches. `npm ci` restores dependencies from the lockfile. Your public sample links are included.
- After a source update: stop the app, run `npm ci`, then `npm run setup:local`, then `npm start`. Migrations preserve existing records; do not delete the database folder.
- If port 8787 is busy, stop the other app using it. If a token fails, use its platform's official setup documentation and confirm scopes, ownership, expiry and free-plan limits.
- Deleting a draft or record does not remove external posts. Remove those on the destination platform.
- Run `npm test` for local automated checks. They mock credentialed provider responses; they are not proof that your external accounts are authorized.

## Live test results

Three real, labeled Telegraph pages were created and checked on 16 October 2026. See **Guide & tests** in the dashboard or `public/test-results.json` for the links. No preexisting user credentials were supplied; Telegraph generated an account token through its API. Other providers require a live test with your credentials before claiming full account-level readiness.

## Telegra.ph keys across browser tabs

The hosted dashboard has four separate Telegra.ph keys configured as server secrets. You can publish from any signed-in tab without pasting them again. Local/VPS copies can keep each key privately in `.dev.vars`: `TELEGRAPH_TOKEN`, `TELEGRAPH_TOKEN_2`, `TELEGRAPH_TOKEN_3`, `TELEGRAPH_TOKEN_4`. Restart after changing these values. Never put actual keys in GitHub or the source ZIP. Manually entered overrides still last only in their current tab.

If Activity shows earlier connection failures from before the runtime fix, use **Repair old connection errors**. Only the known requests blocked before transmission are unlocked. Later uncertain requests remain protected against duplicates.
