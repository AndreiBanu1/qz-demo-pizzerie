# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: axe.spec.ts >> acasa: no accessibility violations
- Location: audit/qa/axe.spec.ts:8:3

# Error details

```
Error: expect(received).toEqual(expected) // deep equality

- Expected  - 1
+ Received  + 3

- Array []
+ Array [
+   "image-alt (2): Images must have alternative text",
+ ]
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
            - link "Meniu" [ref=e14] [cursor=pointer]:
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
  1  | import { writeFileSync } from "node:fs";
  2  | import { join } from "node:path";
  3  | import AxeBuilder from "@axe-core/playwright";
  4  | import { auditedPages } from "../lib/targets.mjs";
  5  | import { expect, open, runDir, test } from "./helpers";
  6  | 
  7  | for (const { id, path } of auditedPages) {
  8  |   test(`${id}: no accessibility violations`, async ({ page }, testInfo) => {
  9  |     await open(page, path);
  10 |     await page.waitForLoadState("networkidle");
  11 |     const results = await new AxeBuilder({ page })
  12 |       .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
  13 |       .analyze();
  14 |     writeFileSync(join(runDir(), `axe-${id}-${testInfo.project.name}.json`), JSON.stringify(results));
  15 |     expect(
  16 |       results.violations.map((v) => `${v.id} (${v.nodes.length}): ${v.help}`),
> 17 |     ).toEqual([]);
     |       ^ Error: expect(received).toEqual(expected) // deep equality
  18 |   });
  19 | }
  20 | 
```