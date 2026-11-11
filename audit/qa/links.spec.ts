import { auditedPages } from "../lib/targets.mjs";
import { open, expect, test } from "./helpers";

for (const { id, path } of auditedPages) {
  test(`${id}: every internal link leads to a real page`, async ({ page, baseURL }) => {
    await open(page, path);
    const hrefs = await page.$$eval('a[href^="/"]', (as) => as.map((a) => a.getAttribute("href") ?? ""));
    const unique = [...new Set(hrefs.filter((h) => !h.startsWith("//")).map((h) => h.split("#")[0] || "/"))];
    expect(unique.length, "internal links found").toBeGreaterThan(0);

    const broken: string[] = [];
    for (const href of unique) {
      const response = await page.goto(new URL(href, baseURL!).href);
      await page.locator("h1").first().waitFor().catch(() => {});
      const status = response?.status() ?? 0;
      const is404Page = (await page.getByRole("heading", { level: 1, name: "Pagina nu există" }).count()) > 0;
      if (status >= 400 || status === 0 || is404Page) broken.push(`${href} (status ${status}${is404Page ? ", 404 page" : ""})`);
    }
    expect(broken, `broken links on ${path}`).toEqual([]);
  });
}
