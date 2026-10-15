import { getDb } from "@/db";

export function userId(request: Request): string | null {
  return request.headers.get("oai-authenticated-user-id");
}

export function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

export function fail(message: string, status = 400) {
  return json({ error: message }, status);
}

export async function readJson(request: Request): Promise<Record<string, unknown>> {
  if (!request.headers.get("content-type")?.includes("application/json")) {
    throw new Error("Send JSON content.");
  }
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    throw new Error("Cross-site writes are not allowed.");
  }
  const data = await request.json();
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
