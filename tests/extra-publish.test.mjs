import test from "node:test";
import assert from "node:assert/strict";
import { publishExtra, validateExtra } from "../lib/extra-publish.ts";
import { deleteRemote } from "../lib/remote-delete.ts";

const post = { title: "A test article", excerpt: "A short summary", body: "A full article with [link](https://example.com).", keywords: "[]", coverUrl: "", videoUrl: "", canonicalUrl: "https://example.com/article" };
function withFetch(handler, work) { const original = globalThis.fetch; globalThis.fetch = handler; return Promise.resolve().then(work).finally(() => { globalThis.fetch = original; }); }
function answer(data, status = 200) { return Response.json(data, { status }); }

test("Mastodon publishes public status to the configured instance with a stable idempotency key", async () => {
  await withFetch(async (url, options) => { assert.equal(url, "https://mastodon.social/api/v1/statuses"); assert.equal(options.headers["Idempotency-Key"], "job-1"); assert.equal(JSON.parse(options.body).visibility, "public"); return answer({ url: "https://mastodon.social/@writer/123" }); }, async () => {
    assert.equal((await publishExtra("mastodon", post, "token", "https://mastodon.social", "job-1")).url, "https://mastodon.social/@writer/123");
  });
});
test("Bluesky creates a record and returns its public post URL", async () => {
  await withFetch(async (url, options) => {
    if (String(url).endsWith("createSession")) { assert.equal(JSON.parse(options.body).identifier, "writer.bsky.social"); return answer({ did: "did:plc:abc", accessJwt: "jwt" }); }
    assert.equal(JSON.parse(options.body).collection, "app.bsky.feed.post"); return answer({ uri: "at://did:plc:abc/app.bsky.feed.post/abc123" });
  }, async () => assert.equal((await publishExtra("bluesky", post, "app-password", "writer.bsky.social", "job-2")).url, "https://bsky.app/profile/did%3Aplc%3Aabc/post/abc123"));
});
test("Telegram and Discord return message permalinks", async () => {
  await withFetch(async (url, options) => {
    if (String(url).includes("telegram")) { assert.equal(JSON.parse(options.body).chat_id, "@mychannel"); return answer({ ok: true, result: { message_id: 51 } }); }
    assert.equal(url, "https://discord.com/api/webhooks/123/abc?wait=true"); return answer({ guild_id: "1", channel_id: "2", id: "3" });
  }, async () => {
    assert.equal((await publishExtra("telegram", post, "bot", "@mychannel", "job-3")).url, "https://t.me/mychannel/51");
    assert.equal((await publishExtra("discord", post, "https://discord.com/api/webhooks/123/abc", "", "job-4")).url, "https://discord.com/channels/1/2/3");
  });
});
test("GitHub, GitLab and Bitbucket create public Markdown documents", async () => {
  await withFetch(async (url, options) => {
    if (String(url).includes("github")) { assert.equal(JSON.parse(options.body).public, true); return answer({ html_url: "https://gist.github.com/abc123" }); }
    if (String(url).includes("gitlab")) { assert.equal(JSON.parse(options.body).visibility, "public"); return answer({ web_url: "https://gitlab.com/-/snippets/123" }); }
    assert.equal(options.body.get("is_private"), "false"); return answer({ links: { html: { href: "https://bitbucket.org/work/workspace/snippets/abc" } } });
  }, async () => {
    assert.equal((await publishExtra("github-gist", post, "token", "", "job-5")).url, "https://gist.github.com/abc123");
    assert.equal((await publishExtra("gitlab-snippet", post, "token", "", "job-6")).url, "https://gitlab.com/-/snippets/123");
    assert.equal((await publishExtra("bitbucket-snippet", post, "token", "work", "job-7")).url, "https://bitbucket.org/work/workspace/snippets/abc");
  });
});
test("Matrix, Misskey and Lemmy return public item links", async () => {
  await withFetch(async (url, options) => {
    if (String(url).includes("_matrix")) { assert.equal(options.method, "PUT"); assert.match(String(url), /job-8$/); return answer({ event_id: "$abc:matrix.org" }); }
    if (String(url).includes("misskey")) { assert.equal(JSON.parse(options.body).visibility, "public"); return answer({ createdNote: { id: "abc123" } }); }
    assert.equal(JSON.parse(options.body).community_id, 25); return answer({ post_view: { post: { id: 42 } } });
  }, async () => {
    assert.match((await publishExtra("matrix", post, "token", "https://matrix.org | !room:matrix.org", "job-8")).url, /matrix\.to/);
    assert.equal((await publishExtra("misskey", post, "token", "https://misskey.io", "job-9")).url, "https://misskey.io/notes/abc123");
    assert.equal((await publishExtra("lemmy", post, "token", "https://lemmy.world | 25", "job-10")).url, "https://lemmy.world/post/42");
  });
});
test("instance validation blocks local targets, and remote delete uses the saved URL ID", async () => {
  assert.throws(() => validateExtra("mastodon", post, "token", "http://localhost"));
  await withFetch(async (url, options) => { assert.equal(url, "https://api.github.com/gists/abc123"); assert.equal(options.method, "DELETE"); return new Response(null, { status: 204 }); }, async () => deleteRemote("github-gist", "https://gist.github.com/abc123", "token", ""));
});
test("full article APIs publish complete content and return public URLs", async () => {
  const ghostKey = "abcdef0123456789abcdef01:" + "a".repeat(64);
  await withFetch(async (url, options) => {
    if (String(url).includes("wp-json")) {
      assert.match(options.headers.Authorization, /^Basic /);
      assert.match(JSON.parse(options.body).content, /A full article/);
      return answer({ link: "https://blog.example.org/my-post/" });
    }
    if (String(url).includes("/api/collections/")) {
      assert.equal(options.headers.Authorization, "Token wf-token");
      assert.match(JSON.parse(options.body).body, /A full article/);
      return answer({ data: { slug: "my-post", collection: { url: "https://write.example.org/myblog/" } } });
    }
    assert.match(options.headers.Authorization, /^Ghost /);
    assert.equal(JSON.parse(options.body).posts[0].status, "published");
    assert.match(JSON.parse(options.body).posts[0].html, /A full article/);
    return answer({ posts: [{ url: "https://ghost.example.org/my-post/" }] });
  }, async () => {
    assert.equal((await publishExtra("wordpress-org", post, "writer:app-password", "https://blog.example.org", "job-11")).url, "https://blog.example.org/my-post/");
    assert.equal((await publishExtra("writefreely", post, "wf-token", "https://write.example.org | myblog", "job-12")).url, "https://write.example.org/myblog/my-post");
    assert.equal((await publishExtra("ghost", post, ghostKey, "https://ghost.example.org", "job-13")).url, "https://ghost.example.org/my-post/");
  });
});
test("Paragraph publishes Markdown without emailing subscribers and returns a public article URL", async () => {
  await withFetch(async (url, options) => {
    if (String(url).endsWith("/posts") && options.method === "POST") {
      const body = JSON.parse(options.body);
      assert.equal(body.status, "published");
      assert.equal(body.sendNewsletter, false);
      assert.match(body.markdown, /A full article/);
      return answer({ id: "post123", status: "published" });
    }
    if (String(url).endsWith("/me")) return answer({ slug: "myblog" });
    if (String(url).endsWith("/posts/post123")) return answer({ slug: "my-post" });
    throw new Error(`Unexpected request: ${url}`);
  }, async () => assert.equal((await publishExtra("paragraph", post, "api-key", "", "job-14")).url, "https://paragraph.com/@myblog/my-post"));
});
test("Paragraph remote delete checks publication ownership before deleting", async () => {
  await withFetch(async (url, options) => {
    if (String(url).endsWith("/me")) return answer({ slug: "myblog" });
    assert.equal(url, "https://public.api.paragraph.com/api/v1/posts/slug/my-post");
    assert.equal(options.method, "DELETE");
    return answer({ success: true });
  }, async () => deleteRemote("paragraph", "https://paragraph.com/@myblog/my-post", "api-key", ""));
});
