import { env } from "cloudflare:workers";
import { userId } from "@/lib/api";

export async function GET(request: Request) {
  if (!await userId(request)) return Response.json({ error: "Sign in first." }, { status: 401 });
  if (!env.WORDPRESS_CLIENT_ID || !env.WORDPRESS_CLIENT_SECRET) return Response.json({ error: "WordPress OAuth application is not configured on this server." }, { status: 503 });
  const target = new URL(request.url).searchParams.get("site")?.trim() || "";
  if (!/^(?:[a-z0-9-]+\.)+wordpress\.com$/i.test(target)) return Response.json({ error: "Enter a WordPress.com site domain before connecting." }, { status: 400 });
  const redirect = env.WORDPRESS_REDIRECT_URI || `${new URL(request.url).origin}/api/wordpress-oauth/callback`;
  if (!redirect.startsWith("https://") && !redirect.startsWith("http://127.0.0.1:")) return Response.json({ error: "WordPress callback must use HTTPS." }, { status: 503 });
  const state = crypto.randomUUID();
  const url = new URL("https://public-api.wordpress.com/oauth2/authorize");
  url.search = new URLSearchParams({ client_id: env.WORDPRESS_CLIENT_ID, redirect_uri: redirect, response_type: "code", blog: target, scope: "posts sites", state }).toString();
  return new Response(null, { status: 302, headers: { Location: url.toString(), "Set-Cookie": `bp_wp_state=${state}; Path=/api/wordpress-oauth; HttpOnly; SameSite=Lax; Max-Age=600${redirect.startsWith("https:") ? "; Secure" : ""}`, "Cache-Control": "no-store" } });
}
