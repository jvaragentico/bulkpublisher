import { env } from "cloudflare:workers";
import { and, eq, gt } from "drizzle-orm";
import { getDb } from "@/db";
import { adminSessions } from "@/db/schema";

export const sessionCookie = "bp_admin";
export function owner(headers: Headers) {
  return env.LOCAL_ADMIN === "1" ? "local-admin" : headers.get("oai-authenticated-user-id");
}
export async function digest(value: string) {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(bytes), b => b.toString(16).padStart(2, "0")).join("");
}
export async function adminUser(headers: Headers) {
  const user = owner(headers);
  const token = headers.get("cookie")?.split(";").map(s => s.trim()).find(s => s.startsWith(`${sessionCookie}=`))?.slice(sessionCookie.length + 1);
  if (!user || !token || !/^[a-f0-9]{64}$/.test(token)) return null;
  const rows = await getDb().select().from(adminSessions).where(and(eq(adminSessions.id, await digest(token)), eq(adminSessions.userId, user), gt(adminSessions.expiresAt, Date.now()))).limit(1);
  return rows[0] ? user : null;
}
export function cookie(value: string, secure: boolean, maxAge = 28800) {
  return `${sessionCookie}=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${secure ? "; Secure" : ""}`;
}
