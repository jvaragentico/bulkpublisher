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
      const data = await remoteJson("https://public-api.wordpress.com/rest/v1.2/me/sites", bearer);
      const wanted = siteId.toLowerCase();
      if (!data.sites?.some((s: any) => String(s.ID) === wanted || (typeof s.URL === "string" && new URL(s.URL).hostname.toLowerCase() === wanted))) throw new Error("Token accepted, but this site is not in the account's site list. Check the site ID/domain and permissions.");
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
