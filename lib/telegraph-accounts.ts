export const telegraphAccountIds = ["telegraph", "telegraph-2", "telegraph-3", "telegraph-4"] as const;
export function isTelegraphAccount(id: string) { return (telegraphAccountIds as readonly string[]).includes(id); }
type TelegraphSecrets = { TELEGRAPH_TOKEN?: string; TELEGRAPH_TOKEN_2?: string; TELEGRAPH_TOKEN_3?: string; TELEGRAPH_TOKEN_4?: string };
export function workspaceAccountToken(id: string, secrets: TelegraphSecrets): string {
  const tokens: Record<string, string | undefined> = { telegraph: secrets.TELEGRAPH_TOKEN, "telegraph-2": secrets.TELEGRAPH_TOKEN_2, "telegraph-3": secrets.TELEGRAPH_TOKEN_3, "telegraph-4": secrets.TELEGRAPH_TOKEN_4 };
  return tokens[id]?.trim() || "";
}
export function resolvePublishingToken(id: string, supplied: unknown, workspaceToken: string | TelegraphSecrets = "") {
  const saved = typeof workspaceToken === "string" ? (id === "telegraph" ? workspaceToken : "") : workspaceAccountToken(id, workspaceToken);
  return String(supplied || saved).trim();
}
