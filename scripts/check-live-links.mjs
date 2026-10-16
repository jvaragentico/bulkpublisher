import fs from "node:fs/promises";
const { results } = JSON.parse(await fs.readFile("public/test-results.json", "utf8"));
for (const result of results) {
  const page = await fetch(result.url, { signal: AbortSignal.timeout(20000) });
  if (!page.ok) throw new Error(`Public page failed: ${result.url} (${page.status})`);
  const html = await page.text();
  if (!html.includes(result.title)) throw new Error(`Expected title missing: ${result.url}`);
  console.log(`HTTP ${page.status}: ${result.url}`);
}
