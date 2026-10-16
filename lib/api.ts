import { getDb } from "@/db";
import { adminUser } from "@/lib/admin";

export async function userId(request: Request): Promise<string | null> {
  return adminUser(request.headers);
}

export function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

export function fail(message: string, status = 400) {
  return json({ error: message }, status);
}

export async function readJson(request: Request): Promise<Record<string, unknown>> {
  // Consume bounded input before rejecting it so keep-alive requests remain usable
  // in the local Worker runtime as well as production.
  if (Number(request.headers.get("content-length") || 0) > 1_000_000) throw new Error("Request exceeds 1 MB.");
  const text = await request.text();
  if (new TextEncoder().encode(text).length > 1_000_000) throw new Error("Request exceeds 1 MB.");
  if (!request.headers.get("content-type")?.includes("application/json")) {
    throw new Error("Send JSON content.");
  }
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    throw new Error("Cross-site writes are not allowed.");
  }
  const data = JSON.parse(text);
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("Send a JSON object.");
  }
  return data as Record<string, unknown>;
}

export function db() {
  return getDb();
}

export function safeUrl(value: unknown, optional = true): string {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw && optional) return "";
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:") throw new Error();
    return url.toString();
  } catch {
    throw new Error("Use a valid https:// URL.");
  }
}
