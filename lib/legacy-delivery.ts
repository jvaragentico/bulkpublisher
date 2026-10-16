// Releases only requests made before the Cloudflare redirect fix. The old
// redirect:"error" option threw during request construction, before any network
// write. Later timeouts remain uncertain and must never be retried blindly.
export const legacyRedirectCutoff = "2026-10-16T22:28:01.000Z";
export function isLegacyRedirectFailure(delivery: { state: string; error: string; updatedAt: string; platformId: string }) {
  return ["telegraph", "telegraph-2", "telegraph-3", "telegraph-4"].includes(delivery.platformId)
    && delivery.state === "unknown"
    && delivery.error === "Network response interrupted. Check the platform before retrying to avoid duplicates."
    && Number.isFinite(Date.parse(delivery.updatedAt))
    && Date.parse(delivery.updatedAt) <= Date.parse(legacyRedirectCutoff);
}
