# Run Bulk Publisher Studio on Vercel

This source ZIP contains a native Next.js build for Vercel. It needs a separate Cloudflare D1 database for articles, publication history and admin sessions. Your existing hosted Sites dashboard and a new Vercel installation do **not** share data automatically.

## Before you start

1. Make a free Cloudflare account. In **Workers & Pages → D1**, create an empty database named `bulkpublisher-vercel`. Copy its **Database ID** and your Cloudflare **Account ID**.
2. In Cloudflare **My Profile → API Tokens**, create a custom token scoped to this account with **D1 Edit**. Keep it private. The server uses it to query D1; never put it in a browser field or source file.
3. Extract the ZIP. Open a terminal in the folder containing `package.json`. Run `npm ci`.
4. Set three temporary terminal environment variables for the migration command. In PowerShell:

```powershell
$env:CF_ACCOUNT_ID="your-32-character-account-id"
$env:CF_D1_DATABASE_ID="your-database-uuid"
$env:CF_D1_API_TOKEN="your-private-d1-api-token"
npm run db:vercel
```

The migration command creates the app tables in the new database. Run it again after future updates; already applied migration files are skipped. Do not use the ID of an unrelated or production database.

## Connect Vercel

1. Sign in at [Vercel](https://vercel.com/), create a new project from your private repository or upload this source, and set **Framework Preset: Next.js**. Keep `vercel.json` in the root; it runs `npm run build:vercel`.
2. In the Vercel project open **Settings → Environment Variables**. Add these server variables for Production and Preview:

| Name | Value |
| --- | --- |
| `LOCAL_ADMIN` | `1` |
| `ADMIN_PASSWORD` | A new strong password you choose, never `admin` on a public deployment |
| `CF_ACCOUNT_ID` | Your Cloudflare account ID |
| `CF_D1_DATABASE_ID` | Your new D1 database UUID |
| `CF_D1_API_TOKEN` | Your private token with D1 Edit |

3. Deploy. Open the resulting Vercel URL and sign in as `admin` with your chosen `ADMIN_PASSWORD`. If the login fails, check the deployment's Function logs, database ID, token permissions and migration result. The database must already contain the tables.
4. To upload photos, set `CLOUDINARY_CLOUD_NAME` and `CLOUDINARY_UNSIGNED_PRESET` in Vercel settings, or enter them in Photo settings. Uploads are public.
5. To use WordPress.com OAuth on this installation, create your own WordPress.com developer app. Set its redirect to `https://YOUR-VERCEL-DOMAIN/api/wordpress-oauth/callback`. Add `WORDPRESS_CLIENT_ID`, `WORDPRESS_CLIENT_SECRET` and `WORDPRESS_REDIRECT_URI` as Vercel server variables, then redeploy. A WordPress.com developer app alone does not grant publishing access; press **Connect with WordPress.com** in the dashboard and approve the site access request.

## Publishing credentials

The ZIP includes a blank `CREDENTIALS.example.json`. Copy it to `CREDENTIALS.local.json` on your own computer and fill the provider tokens and target IDs you have. That private file is excluded from Git and source ZIPs. In **Platforms**, press **Import credentials** and choose the file when you need it. It is never read automatically or uploaded as a file; token values are held in that browser tab and sent only to the provider connection test or publishing API when you use those actions. Closing the tab clears them. You can also place tokens in Vercel server variables if you deliberately want persistent workspace connections; see the platform guide for names.

## Limits and checks

Run `npm run build:vercel` locally to check the production build. The build has passed in the project workspace. A live Vercel account deployment and D1 migration need your accounts and credentials and have not been verified by the source build. The D1 REST bridge sends each database query through Cloudflare's HTTPS API; provider and Cloudflare quotas still apply. The ten new automatic services were request-format tested with mocks and need account-level tests with your tokens before a live bulk publish.

Use the [local/VPS guide](QUICKSTART.md) for a one-computer installation without Cloudflare D1.
