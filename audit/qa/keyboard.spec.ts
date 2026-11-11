import { expect, focusIsVisible, open, test } from "./helpers";

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
      return {
        tag: el.tagName.toLowerCase(),
        text: (el.textContent ?? "").trim().slice(0, 40),
        href: el.getAttribute("href"),
        type: el.getAttribute("type"),
        visibleFocus: false,
      };
    });
    if (f) {
      f.visibleFocus = await focusIsVisible(page);
      seen.push(f);
    }
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

test("the focus check tells a real focus ring from a resting shadow", async ({ page }) => {
  await page.setContent(`
    <style>
      button { box-shadow: 0 3px 0 #7a2410; }
      #fake:focus { outline: 2px solid transparent; }
      #real:focus { outline: 3px solid #1a56db; }
    </style>
    <button id="fake">fake</button><button id="real">real</button>`);
  await page.locator("#fake").focus();
  expect(await focusIsVisible(page), "resting shadow + transparent outline").toBe(false);
  await page.locator("#real").focus();
  expect(await focusIsVisible(page), "real outline").toBe(true);
});
