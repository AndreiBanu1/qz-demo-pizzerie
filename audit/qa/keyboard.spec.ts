import { expect, open, test } from "./helpers";

type Focused = { tag: string; text: string; href: string | null; type: string | null; visibleFocus: boolean };

/** Presses Tab up to `max` times and describes each element that gets focus. */
async function tabThrough(page: import("@playwright/test").Page, max: number): Promise<Focused[]> {
  const seen: Focused[] = [];
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
  for (let i = 0; i < max; i++) {
    await page.keyboard.press("Tab");
    const f = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      if (!el || el === document.body) return null;
      const s = getComputedStyle(el);
      const outline = s.outlineStyle !== "none" && parseFloat(s.outlineWidth) > 0;
      const shadow = s.boxShadow !== "" && s.boxShadow !== "none";
      return {
        tag: el.tagName.toLowerCase(),
        text: (el.textContent ?? "").trim().slice(0, 40),
        href: el.getAttribute("href"),
        type: el.getAttribute("type"),
        visibleFocus: outline || shadow,
      };
    });
    if (f) seen.push(f);
  }
  return seen;
}

test("Tab reaches the call link on the home page, with a visible focus", async ({ page }) => {
  await open(page, "/");
  const seen = await tabThrough(page, 25);
  expect(seen.some((f) => f.tag === "a" && f.href === "tel:0000000000" && f.text.includes("Sună acum")), "call link reached").toBe(true);
  for (const f of seen) expect(f.visibleFocus, `focus ring on ${f.tag} "${f.text}"`).toBe(true);
});

test("Tab reaches the submit button on the reservation page, with a visible focus", async ({ page }) => {
  await open(page, "/rezervare");
  const seen = await tabThrough(page, 30);
  expect(seen.some((f) => f.tag === "button" && f.type === "submit"), "submit button reached").toBe(true);
  for (const f of seen) expect(f.visibleFocus, `focus ring on ${f.tag} "${f.text}"`).toBe(true);
});
