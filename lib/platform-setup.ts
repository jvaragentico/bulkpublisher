export const setup: Record<string, { needs: string[]; provide: string; limitation: string; target?: string }> = {
  medium: {
    provide: "No token. Optional personal/publication editor URL.",
    needs: ["Sign in at medium.com, then open your profile menu → Write a story, or use medium.com/new-story.", "In this dashboard choose Medium in Compose and press Publish to open the guided dialog. Copy the title/article, then Open editor.", "Paste the content in Medium. Use Medium's toolbar for headings and images; review → Publish in Medium.", "Copy the public story address and paste it into Published article URL in this dashboard → Record publication."],
    limitation: "Guided editor = you do the final publishing in Medium. No API key or account password belongs in this dashboard."
  },
  wordpress: {
    provide: "WordPress.com OAuth access_token + site ID or site domain.",
    needs: ["Sign in to WordPress.com and create/select the free site you control. You can enter its domain (for example, yoursite.wordpress.com), so finding a numeric ID is optional.", "Open developer.wordpress.com/apps/ → Create New Application. Register an app with a callback URL you control; keep Client Secret private.", "Complete WordPress.com's documented OAuth authorization flow for your site, then exchange the returned authorization code at https://public-api.wordpress.com/oauth2/token.", "Copy the response's access_token. In this dashboard: Platforms → WordPress.com → Connect → paste it in API key / OAuth access token; enter the site domain in WordPress.com site ID or domain.", "Press Test connection, then Save connection. This app accepts a token; it does not currently run the WordPress OAuth authorization flow for you."],
    target: "WordPress.com site ID or domain",
    limitation: "Developer setup is required to obtain the OAuth token. A Client ID, Client Secret, WordPress password or application password is not the access_token required by this connector."
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
