# Review and verification — 17 October 2026

## Passed

- 30 automated tests: DOCX/ODT imports, upload validation, mocked photo upload, HTML escaping, six article API request formats, ten host API request formats, uncertain publishing outcomes, credential redaction and exact-snapshot public verification.
- TypeScript type check: `node node_modules/typescript/bin/tsc --noEmit --pretty false`.
- Production build and documented local setup: `npm run setup:local`. All three database migrations apply to a fresh database; subsequent setup reports no pending migrations.
- Local HTTP end-to-end check: unauthenticated access, wrong password, valid admin login, CSRF rejection, invalid article IDs, save/read/delete, missing publishing credentials, unsafe editor URL rejection, generated HTML ZIP, manual publication records and session revocation after logout.
- Browser check: DOCX selection/import, imported title/body, saving and article preview. The responsive dashboard was inspected at the app's narrow browser width.
- Three real public Telegraph articles were rechecked on 17 October 2026: HTTP 200 and expected article titles. See `public/test-results.json` and Overview → Published links.

## Problems fixed during review

- Removed identity-based greeting/profile text; the app displays Admin.
- Added full clickable publication addresses to Overview, Activity and webpage deployment results.
- Fixed local Worker handling of rejected JSON bodies, which could disrupt the next write request.
- Captured selected photo files before clearing the input, preventing a lost FileList during asynchronous uploads.
- Added account-owned site/blog checks to WordPress and Blogger connection tests.
- Protected article publishing from concurrent duplicate attempts; timeouts and uncertain success URLs require inspection before retrying.
- Kept a successful Tumblr creation uncertain if its follow-up URL lookup fails, preventing an unsafe duplicate retry.
- Added bounded network timeouts, input validation and pagination of GitLab repository files.
- Replaced the closed HubPages destination with HackMD and corrected paid API/free editor distinctions.

## Remaining verification limits

Only Telegraph was tested with real public publishing. The other five article API adapters, all ten webpage host adapters and Cloudinary uploads still need live account-level tests with valid user credentials. Their mocked request tests verify local behavior and request construction, not provider acceptance, account permissions, plan eligibility or quota.

Fourteen article destinations intentionally use a guided editor workflow. They are not automatic API connectors. Browser passwords alone cannot enable automatic publication there. Platform API availability and free tiers may change.

Video URLs are supported; video-file uploads, automatic OAuth token refresh, unattended scheduled runs and automatic deletion/editing of remote posts are not implemented. Imported Office layouts are simplified. Local/VPS operation uses a single-admin loopback Wrangler runtime and local SQLite storage; the supplied VPS guide uses an SSH tunnel. A Linux VPS install was not executed in this Windows environment.

The source ZIP excludes credentials, local database state, node_modules, Git history and build caches. Dependencies are restored using `npm ci` and the included lockfile.
