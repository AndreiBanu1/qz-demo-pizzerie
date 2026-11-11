import { writeFileSync } from "node:fs";
import { join } from "node:path";
import AxeBuilder from "@axe-core/playwright";
import { auditedPages } from "../lib/targets.mjs";
import { expect, open, runDir, test } from "./helpers";

for (const { id, path } of auditedPages) {
  test(`${id}: no accessibility violations`, async ({ page }, testInfo) => {
    await open(page, path);
    await page.waitForLoadState("networkidle");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    writeFileSync(join(runDir(), `axe-${id}-${testInfo.project.name}.json`), JSON.stringify(results));
    expect(
      results.violations.map((v) => `${v.id} (${v.nodes.length}): ${v.help}`),
    ).toEqual([]);
  });
}
