import test from "node:test";
import assert from "node:assert/strict";
import { platforms } from "../lib/catalog.ts";
import { setup } from "../lib/platform-setup.ts";
import { telegraphAccountIds, isTelegraphAccount, resolvePublishingToken } from "../lib/telegraph-accounts.ts";
import { isLegacyRedirectFailure, legacyRedirectCutoff } from "../lib/legacy-delivery.ts";

test("each workspace account resolves only its own server secret", () => {
  const secrets = { TELEGRAPH_TOKEN: "one", TELEGRAPH_TOKEN_2: "two", TELEGRAPH_TOKEN_3: "three", TELEGRAPH_TOKEN_4: "four" };
  telegraphAccountIds.forEach((id, i) => assert.equal(resolvePublishingToken(id, "", secrets), ["one", "two", "three", "four"][i]));
  assert.equal(resolvePublishingToken("telegraph-3", "override", secrets), "override");
  assert.equal(resolvePublishingToken("dev", "", secrets), "");
  assert.equal(resolvePublishingToken("telegraph-4", "", { TELEGRAPH_TOKEN: "one" }), "");
});
test("only the known pre-fix runtime failure can be released for retry", () => {
  const row = { platformId: "telegraph-2", state: "unknown", error: "Network response interrupted. Check the platform before retrying to avoid duplicates.", updatedAt: legacyRedirectCutoff };
  assert.equal(isLegacyRedirectFailure(row), true);
  for (const change of [{ updatedAt: "2026-10-17T00:00:00Z" }, { updatedAt: "invalid" }, { platformId: "dev" }, { state: "publishing" }, { error: "Platform error 502." }]) assert.equal(isLegacyRedirectFailure({ ...row, ...change }), false);
});
test("article directory has the requested replacements and accurate slot counts", () => {
  assert.equal(platforms.length, 20);
  assert.equal(new Set(platforms.map(p => p.id)).size, 20);
  assert.equal(new Set(platforms.map(p => p.url)).size, 17);
  assert.equal(platforms.filter(p => p.method === "api").length, 8);
  assert.equal(platforms.filter(p => p.method === "guided").length, 12);
  assert.ok(!platforms.some(p => ["hackmd", "github", "gitlab"].includes(p.id)));
  assert.deepEqual(platforms.filter(p => isTelegraphAccount(p.id)).map(p => p.id).sort(), [...telegraphAccountIds].sort());
});
test("additional Telegraph accounts never silently inherit the workspace token", () => {
  assert.equal(resolvePublishingToken("telegraph", "", "workspace-token"), "workspace-token");
  for (const id of telegraphAccountIds.slice(1)) {
    assert.equal(resolvePublishingToken(id, "", "workspace-token"), "");
    assert.equal(resolvePublishingToken(id, id + "-own-token", "workspace-token"), id + "-own-token");
  }
  assert.equal(isTelegraphAccount("telegraph-99"), false);
});
test("every destination explains its inputs and concrete setup steps", () => {
  for (const p of platforms) {
    assert.ok(setup[p.id]?.provide, p.id);
    assert.ok(setup[p.id].needs.length >= 4, p.id);
    if (p.method === "guided") assert.match(setup[p.id].provide, /No (API )?token/, p.id);
  }
});
