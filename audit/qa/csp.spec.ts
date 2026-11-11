import { auditedPages } from "../lib/targets.mjs";
import { expect, open, test } from "./helpers";

for (const { id, path } of auditedPages) {
  test(`${id}: the page triggers no CSP violation`, async ({ page }) => {
    await page.addInitScript(() => {
      const w = window as unknown as { __csp: string[] };
      w.__csp = [];
      document.addEventListener("securitypolicyviolation", (e) => {
        w.__csp.push(`${e.violatedDirective} blocked ${e.blockedURI || "inline"}`);
      });
    });
    await open(page, path);
    await page.waitForLoadState("networkidle");
    const violations = await page.evaluate(() => (window as unknown as { __csp: string[] }).__csp);
    expect(violations).toEqual([]);
  });
}
