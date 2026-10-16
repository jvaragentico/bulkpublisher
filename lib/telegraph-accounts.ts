export const telegraphAccountIds = ["telegraph", "telegraph-2", "telegraph-3", "telegraph-4"] as const;
export function isTelegraphAccount(id: string) { return (telegraphAccountIds as readonly string[]).includes(id); }
export function resolvePublishingToken(id: string, supplied: unknown, workspaceToken = "") {
  return String(supplied || (id === "telegraph" ? workspaceToken : "")).trim();
}
