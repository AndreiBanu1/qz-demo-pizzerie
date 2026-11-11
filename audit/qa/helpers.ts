import { mkdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { test as base, expect, type Page } from "@playwright/test";

export { expect };

export const BANNER_TEXT = "Site demonstrativ realizat de Quality Zone";
export const BANNER_HREF = "https://qualityzone.netlify.app/ro";

/** Where the specs write their raw output; the same place as the JSON report. */
export function runDir(): string {
  const dir = resolve(process.env.RUN_DIR ?? join(import.meta.dirname, "..", "..", "test-results", "qa"));
  mkdirSync(dir, { recursive: true });
  return dir;
}

/**
 * The tests only talk to the target host: every request to another origin is
 * aborted, so nothing leaves for a third party (fonts, analytics, anything).
 */
export const test = base.extend<{ sameHostOnly: void }>({
  sameHostOnly: [
    async ({ page, baseURL }, use) => {
      const host = new URL(baseURL!).host;
      await page.route("**/*", (route) => {
        const url = new URL(route.request().url());
        if (url.host === host || url.protocol === "data:" || url.protocol === "blob:") return route.continue();
        return route.abort();
      });
      await use();
    },
    { auto: true },
  ],
});

/** Opens a path and waits until the app has rendered (an h1 is on the page). */
export async function open(page: Page, path: string) {
  const response = await page.goto(path);
  await page.locator("h1").first().waitFor();
  return response;
}
