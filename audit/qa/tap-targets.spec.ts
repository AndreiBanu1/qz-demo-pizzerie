import { auditedPages } from "../lib/targets.mjs";
import { expect, open, test } from "./helpers";

for (const { id, path } of auditedPages) {
  test(`${id}: every tap target is at least 24x24 px`, async ({ page }) => {
    await open(page, path);
    const tooSmall = await page.evaluate(() => {
      const MIN = 24;
      const small: string[] = [];
      for (const el of document.querySelectorAll<HTMLElement>("a, button, input, select, textarea")) {
        if (el instanceof HTMLInputElement && el.type === "hidden") continue;
        const style = getComputedStyle(el);
        const box = el.getBoundingClientRect();
        if (style.display === "none" || style.visibility === "hidden" || box.width === 0 || box.height === 0) continue;

        // WCAG 2.5.8 inline exception: a link inside running text is exempt.
        if (el instanceof HTMLAnchorElement && el.parentElement) {
          const hasOtherText = [...el.parentElement.childNodes].some(
            (n) => n.nodeType === Node.TEXT_NODE && (n.textContent ?? "").trim() !== "",
          );
          if (hasOtherText) continue;
        }

        if (box.width < MIN || box.height < MIN) {
          const label = (el.textContent ?? "").trim() || el.getAttribute("name") || el.getAttribute("placeholder") || "";
          small.push(`${el.tagName.toLowerCase()} "${label.slice(0, 40)}" ${Math.round(box.width)}x${Math.round(box.height)}`);
        }
      }
      return small;
    });
    expect(tooSmall).toEqual([]);
  });
}
