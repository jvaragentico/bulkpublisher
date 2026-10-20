import { env } from "cloudflare:workers";
import { fail, json, readJson, userId } from "@/lib/api";
import { remoteJson } from "@/lib/publish";
import { isTelegraphAccount } from "@/lib/telegraph-accounts";
import { resolveApiToken, workspaceSiteId } from "@/lib/workspace-connections";
import { platformById } from "@/lib/catalog";
import { isExtraApi, testExtra } from "@/lib/extra-publish";
export async function POST(request: Request) {
  if (!await userId(request)) return fail("Sign in first.", 401);
  try {
    const input = await readJson(request); const id = String(input.platformId);
    if (!platformById[id]) return fail("Unknown destination.");
    if (input.action === "create" && isTelegraphAccount(id)) {
      const data = await remoteJson("https://api.telegra.ph/createAccount", {}, { short_name: `BulkPublisher-${id === "telegraph" ? "1" : id.split("-")[1]}`, author_name: "Bulk Publisher Studio" });
      return json({ token: data.result.access_token });
    }
    const token = resolveApiToken(id, input.token, env);
    if (!token) return fail("Add a token before testing.");
    const siteId = String(input.siteId || workspaceSiteId(id, env));
    const bearer = { Authorization: `Bearer ${token}` };
    if (isExtraApi(id)) await testExtra(id, token, siteId);
    else if (id === "dev") await remoteJson("https://dev.to/api/users/me", { "api-key": token });
    else if (id === "wordpress") {
      if (!siteId.trim()) return fail("Add your WordPress.com site domain or numeric site ID.");
      const data = await remoteJson("https://public-api.wordpress.com/rest/v1.1/sites/" + encodeURIComponent(siteId), bearer);
      const wanted = siteId.toLowerCase();
      if (String(data.ID) !== wanted && (typeof data.URL !== "string" || new URL(data.URL).hostname.toLowerCase() !== wanted)) throw new Error("The token did not resolve to the selected WordPress.com site.");
      if (env.WORDPRESS_CLIENT_ID) {
        const tokenInfoUrl = new URL("https://public-api.wordpress.com/oauth2/token-info");
        tokenInfoUrl.searchParams.set("client_id", env.WORDPRESS_CLIENT_ID);
        tokenInfoUrl.searchParams.set("token", token);
        const account = await remoteJson(tokenInfoUrl.toString(), {});
        if (String(account.blog_id) !== String(data.ID)) throw new Error("This token belongs to a different WordPress.com site.");
        if (!String(account.scope || "").split(/[\s,]+/).some((scope) => scope === "posts" || scope === "global")) throw new Error("This WordPress.com token is missing posts access.");
      } else {
        await remoteJson("https://public-api.wordpress.com/rest/v1.1/sites/" + encodeURIComponent(siteId) + "/posts?context=edit&number=1", bearer);
      }
      if (data.is_coming_soon) return json({ ok: true, message: "Credential accepted by WordPress.com. This site is still Coming Soon; launch it in WordPress.com before expecting public article links." });
    }
    else if (id === "blogger") {
      const data = await remoteJson("https://www.googleapis.com/blogger/v3/users/self/blogs", bearer);
      if (!data.items?.some((blog: any) => String(blog.id) === siteId)) throw new Error("Token accepted, but this blog is not in the account's blog list.");
    }
    else if (isTelegraphAccount(id)) await remoteJson("https://api.telegra.ph/getAccountInfo", {}, { access_token: token });
    else if (id === "tumblr") {
      const result = await remoteJson("https://api.tumblr.com/v2/user/info", bearer);
      const wanted = siteId.replace(/\.tumblr\.com$/, "");
      if (!result.response?.user?.blogs?.some((b: any) => b.name === wanted || b.uuid === wanted)) throw new Error("Token is valid, but this blog is not in your account.");
    } else return fail("This destination uses its own browser login.");
    return json({ ok: true, message: "Credential accepted by the platform. Publishing permissions and content limits are checked when you publish." });
  } catch (error) { return fail(error instanceof Error ? error.message : "Connection test failed.", 400); }
}
