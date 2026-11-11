import { auditedPages } from "../lib/targets.mjs";
import { open, expect, test } from "./helpers";

for (const { id, path } of auditedPages) {
  test(`${id}: every internal link leads to a real page`, async ({ page }) => {
    await open(page, path);
    const here = new URL(page.url());
    const hrefs = await page.$$eval("a[href]", (as) => as.map((a) => a.getAttribute("href") ?? ""));

    // Same-host links only: relative, root-relative and absolute same-origin. No tel:, mailto: or fragments on this page.
    const unique = new Set<string>();
    for (const href of hrefs) {
      if (href === "" || href.startsWith("#")) continue;
      let url: URL;
      try {
        url = new URL(href, here);
      } catch {
        continue;
      }
      if (url.protocol !== "http:" && url.protocol !== "https:") continue;
      if (url.host !== here.host) continue;
      url.hash = "";
      if (url.href === here.href) continue;
      unique.add(url.href);
    }
    expect(unique.size, "internal links found").toBeGreaterThan(0);

    const broken: string[] = [];
    for (const href of unique) {
      const response = await page.goto(href);
      await page.locator("h1").first().waitFor({ timeout: 5000 }).catch(() => {});
      const status = response?.status() ?? 0;
      const is404Page = (await page.getByRole("heading", { level: 1, name: "Pagina nu există" }).count()) > 0;
      if (status >= 400 || status === 0 || is404Page) broken.push(`${href} (status ${status}${is404Page ? ", 404 page" : ""})`);
    }
    expect(broken, `broken links on ${path}`).toEqual([]);
  });
}
