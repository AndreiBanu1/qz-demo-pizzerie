import { auditedPages } from "../lib/targets.mjs";
import { expect, open, test } from "./helpers";

for (const { id, path } of auditedPages) {
  test(`${id}: the page does not scroll sideways`, async ({ page }) => {
    await open(page, path);
    const { scrollWidth, clientWidth } = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
  });
}
