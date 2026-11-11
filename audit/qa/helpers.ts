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

/**
 * Is the focused element visibly marked? Reads the outline and box-shadow while
 * it has focus, blurs it and reads them again, then gives focus back. Visible means a
 * real outline (not none, not zero width, not transparent), or a box-shadow that
 * changes on focus and is not fully transparent.
 */
export async function focusIsVisible(page: Page): Promise<boolean> {
  return page.evaluate(() => {
    const el = document.activeElement as HTMLElement | null;
    if (!el || el === document.body) return false;
    const read = () => {
      const s = getComputedStyle(el);
      return { style: s.outlineStyle, color: s.outlineColor, width: parseFloat(s.outlineWidth), shadow: s.boxShadow };
    };
    const transparent = (c: string) => {
      if (c === "transparent") return true;
      const m = c.match(/rgba?\(([^)]*)\)/);
      if (!m) return false;
      const parts = m[1].split(/[,/ ]+/).filter(Boolean);
      return parts.length === 4 && parseFloat(parts[3]) === 0;
    };
    const shadowVisible = (v: string) => {
      if (!v || v === "none") return false;
      const colors = v.match(/rgba?\([^)]*\)|transparent/g) ?? [];
      return colors.some((c) => !transparent(c));
    };
    const focused = read();
    el.blur();
    const resting = read();
    el.focus();
    const outline = focused.style !== "none" && focused.width > 0 && !transparent(focused.color);
    const shadow = focused.shadow !== resting.shadow && shadowVisible(focused.shadow);
    return outline || shadow;
  });
}
