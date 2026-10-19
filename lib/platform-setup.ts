export const setup: Record<string, { needs: string[]; provide: string; limitation: string; target?: string }> = {
  medium: {
    provide: "No token. Optional personal/publication editor URL.",
    needs: ["Sign in at medium.com, then open your profile menu → Write a story, or use medium.com/new-story.", "In this dashboard choose Medium in Compose and press Publish to open the guided dialog. Copy the title/article, then Open editor.", "Paste the content in Medium. Use Medium's toolbar for headings and images; review → Publish in Medium.", "Copy the public story address and paste it into Published article URL in this dashboard → Record publication."],
    limitation: "Guided editor = you do the final publishing in Medium. No API key or account password belongs in this dashboard."
  },
  wordpress: {
    provide: "WordPress.com site domain. Use Connect with WordPress.com, or paste an existing OAuth access token.",
    needs: ["Sign in to WordPress.com and create/select the free site you control.", "In this dashboard enter its full site domain, for example bulkpublisherarticles.wordpress.com.", "Click Connect with WordPress.com. Review the WordPress permission page and approve access to posts for that site.", "You return here automatically; reopen WordPress.com, click Test connection, then Publish from Compose. If you use your own deployment, configure its OAuth client ID, client secret and exact callback URL first."],
    target: "WordPress.com site ID or domain",
    limitation: "OAuth token stays in this browser tab and can expire. The hosted dashboard has its own OAuth app; local/Vercel copies need their own app and callback. A WordPress password is never entered here."
  },
  blogger: {
    provide: "Google OAuth access token with Blogger scope + numeric blog ID.",
    needs: ["Sign in at blogger.com and create/select your blog. Copy the numeric blog ID from the address bar in its dashboard (the number following /blog/).", "Open developers.google.com/oauthplayground/. In Step 1 enter the scope https://www.googleapis.com/auth/blogger → Authorize APIs → sign in with the Google account that owns the blog and approve access.", "In Step 2 press Exchange authorization code for tokens. Copy Access token, not Refresh token.", "In this dashboard: Platforms → Blogger → Connect → paste Access token and the numeric Blogger blog ID → Test connection → Save connection.", "For your own Google OAuth app, enable Blogger API in Google Cloud Console → APIs & Services → Library; configure OAuth consent/client credentials and the Playground callback if using its gear menu → Use your own OAuth credentials."],
    target: "Blogger blog ID",
    limitation: "A Google API key cannot publish posts. Access tokens are short lived; replace them when they expire. The app does not refresh Google tokens automatically."
  },
  dev: {
    provide: "DEV API key only. No site ID.",
    needs: ["Sign in at dev.to → profile picture → Settings → Extensions (direct address: dev.to/settings/extensions).", "Find DEV Community API Keys. Enter a description such as Bulk Publisher Studio → Generate API Key.", "Copy the generated key. In this dashboard: Platforms → DEV Community → Connect → paste it into API key / OAuth access token.", "Press Test connection → Save connection. Return to Compose, select DEV Community and Publish."],
    limitation: "Up to four normalized tags. Publish relevant content and follow DEV's rules. The key is sensitive."
  },
  hashnode: {
    provide: "No token. Optional publication dashboard URL.",
    needs: ["Sign in at hashnode.com and create/select your blog/publication.", "Open its dashboard → Write / New article. Copy that editor or dashboard URL into this destination's optional URL field if you want a shortcut.", "Use this app's guided dialog to copy the title/article, open Hashnode, format and add media.", "Press Publish in Hashnode, then copy the public article URL back to this dashboard → Record publication."],
    limitation: "The free workflow uses Hashnode's browser editor. Its paid API access is not used by this app."
  },
  tumblr: {
    provide: "OAuth2 access_token with basic + write scopes, plus blog name/hostname.",
    needs: ["Sign in to Tumblr and select your blog. Copy its blog name (for example, myblog) or hostname (myblog.tumblr.com).", "Open tumblr.com/oauth/apps → Register application. Record the app's OAuth client credentials privately and configure an authorized callback URL you control.", "Use Tumblr's documented OAuth2 authorization-code flow with basic and write scopes; exchange the authorization code at https://api.tumblr.com/v2/oauth2/token.", "Copy the OAuth2 access_token, not the Consumer Key or Consumer Secret. In this dashboard: Platforms → Tumblr → Connect → paste the token and blog name/hostname.", "Press Test connection → Save connection. This app accepts a bearer token; obtaining/refreshing it currently requires the external OAuth flow."],
    target: "Blog name or hostname",
    limitation: "OAuth developer setup is required. Text, public image URLs and tags are supported; review Markdown punctuation and platform limits."
  },
  substack: {
    provide: "No token. Optional publication dashboard URL.",
    needs: ["Sign in at substack.com and open your publication's Dashboard.", "Choose New post / Text post and copy that publication dashboard URL for the optional editor shortcut in this app.", "In the guided dialog, copy title/article → Open editor. Paste and review formatting/media in Substack.", "Choose whether to publish only on the web or also send email/app notifications. Publish in Substack, then record the public article URL here."],
    limitation: "You must press the final publish/send button in Substack. Check email delivery settings before publishing."
  },
  linkedin: {
    provide: "No token. A LinkedIn profile or Page with author access.",
    needs: ["Sign in at linkedin.com. From the home feed choose Write article (for a Page, choose the correct publishing identity).", "Use the guided dialog to copy title/article → Open editor (linkedin.com/article/new/).", "Paste text, add a cover image and format with LinkedIn's editor → Next / Publish.", "Copy the public article address and record it in this dashboard."],
    limitation: "Native long-form Articles require manual completion here. No LinkedIn password or token is requested by this destination."
  },
  beehiiv: {
    provide: "No token. Optional publication dashboard URL.",
    needs: ["Sign in at app.beehiiv.com and select your publication.", "Open the post editor using Start writing / Write → Posts → Create post (the label may vary by account).", "Copy the content from the guided dialog, paste it in beehiiv, add media and choose web/email distribution.", "Publish in beehiiv, then paste the public web-post URL into this dashboard → Record publication."],
    limitation: "Free-plan publishing uses the browser editor. The paid Create Post API is not connected."
  },
  wix: {
    provide: "No token. Wix site editor/dashboard URL.",
    needs: ["Sign in at manage.wix.com and select your site. Add Wix Blog from the site editor's Add Apps if the site has no blog.", "In the site dashboard open Blog → Posts → Create New Post.", "Use this app's guided dialog to copy the article, then paste/format it in Wix and add photos with Wix's media controls.", "Publish the post and make sure the Wix site is published. Record the public post URL here."],
    limitation: "The app does not automate Wix's API. The free Wix-branded site and its editor are used."
  },
  weebly: {
    provide: "No token. Your Square Online/Weebly editor URL.",
    needs: ["For Square, sign in to squareup.com/dashboard and open your Online site editor. For an existing Weebly site, sign in to its own dashboard.", "For Square Stories, open the website editor and add/select a Stories page; create a story. Existing Weebly users add/select their Blog page and create a post.", "Copy the article from this app, paste and format it in the site editor, add media, then Publish the story/site.", "Open the public post in a reader tab and record that URL in this app."],
    limitation: "Manual editor workflow. Use an account/site that actually provides Stories or Blog editing."
  },
  vocal: {
    provide: "No API token. Vocal account, Wallet/Stripe setup and story details.",
    needs: ["Sign in at vocal.media. Open your account's Wallet and complete the Stripe connection required by Vocal; do this on Vocal, not in this app.", "Choose Create story. Prepare title, subtitle, featured image, article text, tags and the correct community.", "Copy content from this app's guided dialog into Vocal's editor, review its word-count and content rules, then submit for review.", "Wait for editorial approval. Only after the story is publicly accessible, copy its URL into this app → Record publication."],
    limitation: "Submitting for moderation is not immediate publication. A private editor URL is not a live story URL."
  },
  livejournal: {
    provide: "No token. Journal/community posting access and optional editor URL.",
    needs: ["Sign in at livejournal.com and open livejournal.com/update.bml (Post / New entry).", "Choose your journal or a community where you have posting permission.", "Copy the guided article into the editor, add media, choose Public visibility and submit the entry.", "Open the public entry and record its URL in this dashboard."],
    limitation: "Uses LiveJournal's own editor; its legacy XML-RPC API is not integrated."
  },
  bear: {
    provide: "No token. Bear Blog dashboard URL and public image URLs.",
    needs: ["Sign in at bearblog.dev → Dashboard and create/select your blog.", "Open Posts → New post (or the dashboard's new-post action).", "Copy the Markdown article from the guided dialog. Use external HTTPS image URLs for photos on the free plan.", "Publish the post in Bear Blog, then copy its public URL back to this dashboard."],
    limitation: "Free workflow uses external images; Bear's built-in image uploads may require an upgrade."
  },
  quora: {
    provide: "No token. Space URL and contributor/moderator/admin posting rights.",
    needs: ["Sign in at quora.com and open a Space you manage or can contribute to.", "Use its Create post action. Confirm your role can publish directly; followers may only submit for approval.", "Copy title/article from this app's guided dialog, paste and format it in the Space, then Post/Submit.", "If moderation is required, wait for approval. Record the resulting public post URL here."],
    limitation: "Final publication takes place in Quora. Do not record a private draft or unapproved submission as published."
  },
  notion: {
    provide: "No token. A page you can edit and permission to publish it.",
    needs: ["Sign in to Notion, choose a workspace and create/open the page for your article.", "Copy the guided article into the page. Format headings and add image blocks as needed.", "At the top of the page choose Share → Publish → Publish to web. Review the public-sharing settings yourself.", "Copy the published web URL (not the private workspace/editor URL) and record it in this dashboard."],
    limitation: "Public sharing must be completed in Notion. A workspace page address alone does not make a page public."
  }
};

Object.assign(setup, {
  mastodon: { provide: "User access token with write:statuses; your instance domain.", target: "Instance URL (for example https://mastodon.social)", needs: ["Create a free account on a Mastodon instance.", "In that instance open Preferences → Development → New application. Enable write:statuses and save it.", "Copy the user access token into the token field here and enter the same instance URL below. Test, then Save."], limitation: "Publishes a short public status. For a long article, add its public URL in the Canonical URL field first. Each instance sets its own limits." },
  bluesky: { provide: "Bluesky app password and your handle.", target: "Handle (for example alice.bsky.social)", needs: ["Sign in at bsky.app and open Settings → Privacy and security → App passwords.", "Create an app password named Bulk Publisher; copy it once. Paste that app password here, not your main password.", "Enter your handle without @. Test, then Save."], limitation: "Bluesky posts are short. This publishes a summary and optional Canonical URL, not the whole article." },
  telegram: { provide: "Bot token from @BotFather; public channel @username.", target: "Public channel username (for example @mychannel)", needs: ["In Telegram, message @BotFather and use /newbot. Copy the bot token.", "Create or choose a public channel with a username. Add the bot as an administrator with permission to post messages.", "Paste the bot token here; enter @channelusername below. Test, then Save."], limitation: "Messages are limited to 4096 characters. Telegram only lets a bot delete many messages within 48 hours." },
  discord: { provide: "The complete Discord webhook URL.", needs: ["Open your server → channel settings → Integrations → Webhooks → New Webhook.", "Choose the channel and copy its webhook URL. Paste that complete URL into the token field here.", "Test, then Save. Publishing uses the selected channel."], limitation: "Messages are limited to 2000 characters. A Discord link may require readers to join your server; this is a channel post, not an open web article." },
  "github-gist": { provide: "Fine-grained GitHub token with user Gists: Read and write.", needs: ["In GitHub open Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token.", "Give it a name and user Gists read/write permission; copy the token.", "Paste it here, Test, then Save."], limitation: "Creates a public Markdown Gist. It displays source Markdown, not a rendered blog layout." },
  "gitlab-snippet": { provide: "GitLab personal access token with api scope.", needs: ["In GitLab open your avatar → Edit profile → Access tokens.", "Create a personal access token with api scope and copy it.", "Paste it here, Test, then Save. The dashboard creates public personal snippets."], limitation: "Creates a public Markdown snippet; this is a document page, not a full blog." },
  "bitbucket-snippet": { provide: "Bitbucket API/OAuth token with snippet write access; workspace slug.", target: "Workspace slug", needs: ["In Bitbucket open Personal settings → API tokens (or the supported OAuth app page for your account).", "Create a token with snippet read/write permissions and copy it.", "Enter your workspace slug from the Bitbucket URL, paste the token here, then Test and Save."], limitation: "Creates a public Markdown snippet. Token type and scopes depend on your Atlassian account configuration." },
  matrix: { provide: "Matrix access token; homeserver URL and public room ID.", target: "Homeserver URL | room ID", needs: ["Create or join a public Matrix room and copy its room ID, which starts with !.", "In your Matrix client locate an access token for the account that can send to this room; treat it like a password.", "Enter your homeserver and room ID in this form, for example https://matrix.org | !room:matrix.org. Paste token, Test, then Save."], limitation: "The public Matrix event link works only if the room permits public access. Events can be redacted, but copies may persist on federated servers." },
  misskey: { provide: "Misskey token with write:notes and instance URL.", target: "Instance URL (for example https://misskey.io)", needs: ["Sign in on your Misskey instance and open Settings → API or the integrations/token area.", "Create a token with write:notes permission and copy it.", "Enter that instance URL and token here. Test, then Save."], limitation: "Publishes a public note containing a summary and optional article URL. Instance rules and length limits vary." },
  lemmy: { provide: "Lemmy account bearer token; instance URL and numeric community ID.", target: "Instance URL | numeric community ID", needs: ["Create a free Lemmy account and join a community that allows your content.", "Find the community ID in your instance's API or supported client; obtain a bearer token for your account.", "Enter, for example, https://lemmy.world | 12345 and paste the token. Test, then Save."], limitation: "Lemmy instances may run different API versions. This connector targets the widely used v3 post endpoint; verify compatibility and community rules before publishing." },
  "wordpress-org": { provide: "Your WordPress site URL and username:application password. Do not use your normal login password.", target: "WordPress site URL", needs: ["Install WordPress on a site you control with HTTPS; free WordPress software still needs hosting.", "In WordPress open Users → Profile → Application Passwords, create one named Bulk Publisher, and copy it once.", "Enter your site URL and paste username:application-password in the token field. Test and Save."], limitation: "Publishes a full HTML post. The site must allow WordPress REST API requests. A WordPress.com site uses the separate WordPress.com connector." },
  writefreely: { provide: "WriteFreely access token, instance URL and your collection alias.", target: "Instance URL | collection alias", needs: ["Join a WriteFreely instance that permits your posts or host the free software yourself.", "Create a collection/blog and obtain an API token through the instance's supported login flow.", "Enter https://your-instance.example | your-collection-alias, paste the token, then Test and Save."], limitation: "Publishes a full Markdown article. Community instances may restrict API use and posting; self-hosting needs a server." },
  ghost: { provide: "Ghost Admin API integration key and your Ghost site URL.", target: "Ghost site URL", needs: ["Install Ghost on a site you control with HTTPS; free Ghost software still needs hosting.", "In Ghost Admin open Settings → Integrations → Add custom integration and copy the Admin API key in id:secret form.", "Enter your Ghost site URL and integration key here, then Test and Save."], limitation: "Publishes a full HTML post. Ghost converts HTML to its editor format; review complex formatting after posting." },
  paragraph: { provide: "Paragraph publication API key. No site ID is needed.", needs: ["Create a publication at app.paragraph.com.", "Open its Settings → API keys and create a key for that publication. Copy it into the token field here.", "Press Test connection and Save. In Compose, choose Paragraph and Publish; the returned public article link appears in Activity."], limitation: "Paragraph's API is in alpha and the free plan has limited API access. Publishing does not send a newsletter to subscribers. Public image URLs in Markdown and a cover image are supported." },
});
for (const id of ["mastodon", "bluesky", "telegram", "discord", "github-gist", "gitlab-snippet", "bitbucket-snippet", "matrix", "misskey", "lemmy", "wordpress-org", "writefreely", "ghost", "paragraph"]) {
  setup[id].needs.push("In Compose, select this destination and press Publish. Open its saved result URL in Activity. Check the service before retrying an uncertain request.");
}
for (let account = 1; account <= 4; account++) {
  const id = account === 1 ? "telegraph" : "telegraph-" + account;
  setup[id] = {
    provide: account === 1 ? "Workspace token, or a token saved for Account 1. No username/password or site ID." : "This slot's own Telegraph access token. No username/password or site ID.",
    needs: [
      "In this dashboard open Platforms → Telegra.ph — Account " + account + " → Connect.",
      "If this slot shows Token available, its workspace key is already configured: click Test connection. Otherwise click Create a free Telegraph account, or paste this account's token.",
      "Click Test connection → Save connection. If you want to retain editing access, copy the token into your private password manager before the browser session ends.",
      "Return to Compose, select Telegra.ph — Account " + account + " and Publish. Open the returned public URL in Overview → Published links or Activity."
    ],
    limitation: "This is a separate account connection on the same Telegra.ph service. Keep different account tokens in different slots. Pages are public; content must fit Telegraph's 64 KB limit."
  };
}
