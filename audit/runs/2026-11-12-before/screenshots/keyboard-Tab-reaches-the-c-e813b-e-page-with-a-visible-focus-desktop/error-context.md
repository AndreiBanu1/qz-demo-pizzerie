# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: keyboard.spec.ts >> Tab reaches the call link on the home page, with a visible focus
- Location: audit/qa/keyboard.spec.ts:30:1

# Error details

```
Error: call link reached

expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - complementary "Despre acest site" [ref=e4]:
    - link "Site demonstrativ realizat de Quality Zone" [ref=e5] [cursor=pointer]:
      - /url: https://qualityzone.netlify.app/ro
  - banner [ref=e6]:
    - generic [ref=e7]:
      - link "Pizza Mița" [ref=e8] [cursor=pointer]:
        - /url: /
      - navigation "Principal" [ref=e11]:
        - list [ref=e12]:
          - listitem [ref=e13]:
            - link "Meniu" [active] [ref=e14] [cursor=pointer]:
              - /url: /meniu
          - listitem [ref=e15]:
            - link "Rezervă" [ref=e16] [cursor=pointer]:
              - /url: /rezervare
  - main [ref=e18]:
    - generic [ref=e20]:
      - paragraph [ref=e21]: Pizzerie de cartier
      - heading "Pizza Mița" [level=1] [ref=e22]
      - paragraph [ref=e23]: Pizza la cuptor și paste, pe Strada Exemplului 0, în Orașul Demo.
      - paragraph [ref=e25]: Închis, deschidem azi la 11:00
      - generic [ref=e27]:
        - generic [ref=e28] [cursor=pointer]: Sună acum
        - link "Vezi meniul" [ref=e31] [cursor=pointer]:
          - /url: /meniu
    - generic [ref=e34]:
      - generic [ref=e35]:
        - heading "Program" [level=2] [ref=e36]
        - paragraph [ref=e37]: Luni ne odihnim. În restul săptămânii te așteptăm la masă.
        - table [ref=e39]:
          - rowgroup [ref=e40]:
            - row [ref=e41]:
              - rowheader "Luni" [ref=e42]
              - cell "Închis" [ref=e43]
            - row [ref=e44]:
              - rowheader "Marți" [ref=e45]
              - cell "11:00–22:00" [ref=e46]
            - row [ref=e47]:
              - rowheader "Miercuri" [ref=e48]
              - cell "11:00–22:00" [ref=e49]
            - row [ref=e50]:
              - rowheader "Joi" [ref=e51]
              - cell "11:00–22:00" [ref=e52]
            - row [ref=e53]:
              - rowheader "Vineri" [ref=e54]
              - cell "11:00–23:00" [ref=e55]
            - row [ref=e56]:
              - rowheader "Sâmbătă" [ref=e57]
              - cell "11:00–23:00" [ref=e58]
            - row [ref=e59]:
              - rowheader "Duminică" [ref=e60]
              - cell "12:00–22:00" [ref=e61]
      - generic [ref=e62]:
        - heading "Unde ne găsești" [level=2] [ref=e63]
        - paragraph [ref=e64]: Strada Exemplului 0, Orașul Demo
        - generic [ref=e66]:
          - 'img "Hartă desenată: Pizza Mița, pe Strada Exemplului 0, la colț cu Bulevardul Demo, în Orașul Demo" [ref=e67]':
            - generic [ref=e80]: Parcul Mic
            - generic [ref=e85]: Strada Exemplului
            - generic [ref=e86]: Bulevardul Demo
            - generic [ref=e91]: Pizza Mița
          - link "Deschide în Maps" [ref=e92] [cursor=pointer]:
            - /url: https://www.google.com/maps/search/?api=1&query=Pizza%20Mi%C8%9Ba
            - text: Deschide în Maps
            - generic [aria-hidden] [ref=e93]: →
    - generic [ref=e95]:
      - generic [ref=e96]:
        - heading "Vii cu prietenii?" [level=2] [ref=e97]
        - paragraph [ref=e98]: Rezervă o masă și o pregătim pentru voi.
      - link "Rezervă o masă" [ref=e99] [cursor=pointer]:
        - /url: /rezervare
  - contentinfo [ref=e100]:
    - generic [ref=e102]:
      - generic [ref=e103]:
        - paragraph [ref=e104]: Pizza Mița
        - paragraph [ref=e105]: Strada Exemplului 0, Orașul Demo
      - generic [ref=e106]:
        - heading "Telefon" [level=2] [ref=e107]
        - link "0000 000 000 (număr demonstrativ)" [ref=e108] [cursor=pointer]:
          - /url: tel:0000000000
        - heading "Program" [level=2] [ref=e109]
        - list [ref=e110]:
          - listitem [ref=e111]: "Luni: închis"
          - listitem [ref=e112]: "Marți–joi: 11:00–22:00"
          - listitem [ref=e113]: "Vineri–sâmbătă: 11:00–23:00"
          - listitem [ref=e114]: "Duminică: 12:00–22:00"
      - generic [ref=e115]:
        - heading "Pe site" [level=2] [ref=e116]
        - list [ref=e117]:
          - listitem [ref=e118]:
            - link "Meniu" [ref=e119] [cursor=pointer]:
              - /url: /menu
          - listitem [ref=e120]:
            - link "Rezervă o masă" [ref=e121] [cursor=pointer]:
              - /url: /rezervare
    - paragraph [ref=e123]: "Fotografii: Pexels"
```

# Test source

```ts
  1  | import { expect, focusIsVisible, open, test } from "./helpers";
  2  | 
  3  | type Focused = { tag: string; text: string; href: string | null; type: string | null; visibleFocus: boolean };
  4  | 
  5  | /** Presses Tab up to `max` times and describes each element that gets focus. */
  6  | async function tabThrough(page: import("@playwright/test").Page, max: number): Promise<Focused[]> {
  7  |   const seen: Focused[] = [];
  8  |   await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
  9  |   for (let i = 0; i < max; i++) {
  10 |     await page.keyboard.press("Tab");
  11 |     const f = await page.evaluate(() => {
  12 |       const el = document.activeElement as HTMLElement | null;
  13 |       if (!el || el === document.body) return null;
  14 |       return {
  15 |         tag: el.tagName.toLowerCase(),
  16 |         text: (el.textContent ?? "").trim().slice(0, 40),
  17 |         href: el.getAttribute("href"),
  18 |         type: el.getAttribute("type"),
  19 |         visibleFocus: false,
  20 |       };
  21 |     });
  22 |     if (f) {
  23 |       f.visibleFocus = await focusIsVisible(page);
  24 |       seen.push(f);
  25 |     }
  26 |   }
  27 |   return seen;
  28 | }
  29 | 
  30 | test("Tab reaches the call link on the home page, with a visible focus", async ({ page }) => {
  31 |   await open(page, "/");
  32 |   const seen = await tabThrough(page, 25);
> 33 |   expect(seen.some((f) => f.tag === "a" && f.href === "tel:0000000000" && f.text.includes("Sună acum")), "call link reached").toBe(true);
     |                                                                                                                               ^ Error: call link reached
  34 |   for (const f of seen) expect(f.visibleFocus, `focus ring on ${f.tag} "${f.text}"`).toBe(true);
  35 | });
  36 | 
  37 | test("Tab reaches the submit button on the reservation page, with a visible focus", async ({ page }) => {
  38 |   await open(page, "/rezervare");
  39 |   const seen = await tabThrough(page, 30);
  40 |   expect(seen.some((f) => f.tag === "button" && f.type === "submit"), "submit button reached").toBe(true);
  41 |   for (const f of seen) expect(f.visibleFocus, `focus ring on ${f.tag} "${f.text}"`).toBe(true);
  42 | });
  43 | 
  44 | test("the focus check tells a real focus ring from a resting shadow", async ({ page }) => {
  45 |   await page.setContent(`
  46 |     <style>
  47 |       button { box-shadow: 0 3px 0 #7a2410; }
  48 |       #fake:focus { outline: 2px solid transparent; }
  49 |       #real:focus { outline: 3px solid #1a56db; }
  50 |     </style>
  51 |     <button id="fake">fake</button><button id="real">real</button>`);
  52 |   await page.locator("#fake").focus();
  53 |   expect(await focusIsVisible(page), "resting shadow + transparent outline").toBe(false);
  54 |   await page.locator("#real").focus();
  55 |   expect(await focusIsVisible(page), "real outline").toBe(true);
  56 | });
  57 | 
```