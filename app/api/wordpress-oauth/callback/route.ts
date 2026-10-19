import { env } from "cloudflare:workers";

function page(message: string, status = 400, script = "", secure = true) {
  const nonce = crypto.randomUUID().replaceAll("-", "");
  const html = `<!doctype html><html lang="en"><meta charset="utf-8"><title>WordPress connection</title><body><p>${message.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!)}</p>${script ? `<script nonce="${nonce}">${script}</script>` : ""}</body></html>`;
  return new Response(html, { status, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", "Referrer-Policy": "no-referrer", "Content-Security-Policy": `default-src 'none'; script-src 'nonce-${nonce}'; base-uri 'none'`, "Set-Cookie": `bp_wp_state=; Path=/api/wordpress-oauth; HttpOnly; SameSite=Lax; Max-Age=0${secure ? "; Secure" : ""}` } });
}
export async function GET(request: Request) {
  const secure = new URL(request.url).protocol === "https:";
  const query = new URL(request.url).searchParams;
  const state = query.get("state") || "";
  const cookie = request.headers.get("cookie")?.match(/(?:^|;\s*)bp_wp_state=([a-f0-9-]+)/)?.[1] || "";
  if (!state || !cookie || state !== cookie || !/^[a-f0-9-]{36}$/.test(state)) return page("WordPress connection expired. Return to Platforms and try again.", 400, "", secure);
  const code = query.get("code");
  if (!code) return page("WordPress access was not granted. Return to Platforms if you want to connect.", 400, "", secure);
  if (!env.WORDPRESS_CLIENT_ID || !env.WORDPRESS_CLIENT_SECRET) return page("WordPress application is not configured on this server.", 503, "", secure);
  const redirect = env.WORDPRESS_REDIRECT_URI || `${new URL(request.url).origin}/api/wordpress-oauth/callback`;
  try {
    const response = await fetch("https://public-api.wordpress.com/oauth2/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ client_id: env.WORDPRESS_CLIENT_ID, client_secret: env.WORDPRESS_CLIENT_SECRET, redirect_uri: redirect, code, grant_type: "authorization_code" }), redirect: "manual", signal: AbortSignal.timeout(25000) });
    if (!response.ok) return page("WordPress rejected this authorization. Return to Platforms and try again.", 502, "", secure);
    const data = await response.json() as { access_token?: string };
    if (!data.access_token) return page("WordPress returned no access token. Return to Platforms and try again.", 502, "", secure);
    const token = JSON.stringify(data.access_token).replace(/</g, "\\u003c");
    return page("WordPress connected. Returning to your dashboard…", 200, `sessionStorage.setItem("bp-token-wordpress",${token});location.replace("/");`, secure);
  } catch { return page("WordPress connection was interrupted. Return to Platforms and try again.", 502, "", secure); }
}
