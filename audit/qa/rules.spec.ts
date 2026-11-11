import { auditedPages } from "../lib/targets.mjs";
import { BANNER_HREF, BANNER_TEXT, expect, open, test } from "./helpers";

const paths = [...auditedPages.map((p) => p.path), "/nu-exista"];

for (const path of paths) {
  test(`demo rules hold on ${path}`, async ({ page }) => {
    const response = await open(page, path);

    const banner = page.getByRole("link", { name: BANNER_TEXT, exact: true });
    await expect.soft(banner).toHaveCount(1);
    await expect.soft(banner).toHaveAttribute("href", BANNER_HREF);

    await expect.soft(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex");
    expect.soft(response!.headers()["x-robots-tag"]?.trim()).toBe("noindex");

    const jsonLd = await page.locator('script[type="application/ld+json"]').allTextContents();
    for (const block of jsonLd) {
      expect.soft(block).not.toMatch(/aggregateRating/i);
      expect.soft(block).not.toMatch(/review/i);
    }

    expect.soft(await page.evaluate(() => document.cookie)).toBe("");
  });
}
