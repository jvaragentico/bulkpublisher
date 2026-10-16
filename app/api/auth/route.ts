import { env } from "cloudflare:workers";
import { eq, lt } from "drizzle-orm";
import { adminSessions, loginAttempts } from "@/db/schema";
import { db, fail, readJson } from "@/lib/api";
import { cookie, digest, owner, sessionCookie } from "@/lib/admin";

export async function POST(request: Request) {
  try {
    const input = await readJson(request);
    const user = owner(request.headers);
    if (!user) return fail("Sign in with the Site owner's account first.", 401);
    if (!env.ADMIN_PASSWORD) return fail("Configure ADMIN_PASSWORD on the server before signing in.", 503);
    const database = db();
    const now = Date.now();
    const key = await digest(`${user}:${request.headers.get("cf-connecting-ip") || "local"}:${Math.floor(now / 900000)}`);
    await database.insert(loginAttempts).values({ id: key, count: 1, expiresAt: now + 900000 }).onConflictDoUpdate({ target: loginAttempts.id, set: { count: (await import("drizzle-orm")).sql`${loginAttempts.count} + 1` } });
    const [attempt] = await database.select().from(loginAttempts).where(eq(loginAttempts.id, key));
    if (attempt.count > 10) return fail("Too many login attempts. Try again in 15 minutes.", 429);
    const supplied = await digest(String(input.password || ""));
    const expected = await digest(String(env.ADMIN_PASSWORD));
    let difference = 0;
    for (let i = 0; i < supplied.length; i++) difference |= supplied.charCodeAt(i) ^ expected.charCodeAt(i);
    if (input.username !== "admin" || difference !== 0) return fail("Incorrect username or password.", 401);
    await database.delete(loginAttempts).where(eq(loginAttempts.id, key));
    const token = Array.from(crypto.getRandomValues(new Uint8Array(32)), b => b.toString(16).padStart(2, "0")).join("");
    await database.insert(adminSessions).values({ id: await digest(token), userId: user, expiresAt: now + 28800000 });
    await database.delete(adminSessions).where(lt(adminSessions.expiresAt, now));
    await database.delete(loginAttempts).where(lt(loginAttempts.expiresAt, now));
    return Response.json({ ok: true }, { headers: { "Set-Cookie": cookie(token, new URL(request.url).protocol === "https:"), "Cache-Control": "no-store" } });
  } catch { return fail("Unable to sign in. Check server configuration."); }
}

export async function DELETE(request: Request) {
  try {
    await readJson(request);
    const token = request.headers.get("cookie")?.split(";").map(s => s.trim()).find(s => s.startsWith(`${sessionCookie}=`))?.slice(sessionCookie.length + 1);
    if (token) await db().delete(adminSessions).where(eq(adminSessions.id, await digest(token)));
    return Response.json({ ok: true }, { headers: { "Set-Cookie": cookie("", new URL(request.url).protocol === "https:", 0), "Cache-Control": "no-store" } });
  } catch { return fail("Unable to sign out."); }
}
