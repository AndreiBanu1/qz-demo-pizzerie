# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: axe.spec.ts >> meniu: no accessibility violations
- Location: audit/qa/axe.spec.ts:8:3

# Error details

```
Error: expect(received).toEqual(expected) // deep equality

- Expected  - 1
+ Received  + 4

- Array []
+ Array [
+   "color-contrast (13): Elements must meet minimum color contrast ratio thresholds",
+   "image-alt (9): Images must have alternative text",
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
    - generic [ref=e19]:
      - generic [ref=e20]:
        - heading "Meniu" [level=1] [ref=e21]
        - paragraph [ref=e22]: Pizza la cuptor, paste, deserturi și ceva de băut. Prețurile sunt în lei.
      - navigation "Categorii" [ref=e23]:
        - list [ref=e24]:
          - listitem [ref=e25]:
            - link "Pizza" [ref=e26] [cursor=pointer]:
              - /url: "#pizza"
          - listitem [ref=e27]:
            - link "Paste" [ref=e28] [cursor=pointer]:
              - /url: "#paste"
          - listitem [ref=e29]:
            - link "Desert" [ref=e30] [cursor=pointer]:
              - /url: "#desert"
          - listitem [ref=e31]:
            - link "Băuturi" [ref=e32] [cursor=pointer]:
              - /url: "#bauturi"
      - region [ref=e33]:
        - heading "Pizza" [level=2] [ref=e34]
        - list [ref=e35]:
          - listitem [ref=e36]:
            - generic [ref=e38]:
              - generic [ref=e39]:
                - heading "Margherita" [level=3] [ref=e40]
                - paragraph [ref=e41]: 32 lei
              - paragraph [ref=e42]: sos de roșii, mozzarella, busuioc proaspăt
          - listitem [ref=e43]:
            - generic [ref=e45]:
              - generic [ref=e46]:
                - heading "Quattro Stagioni" [level=3] [ref=e47]
                - paragraph [ref=e48]: 46 lei
              - paragraph [ref=e49]: sos de roșii, mozzarella, ciuperci, salam, ardei iute murat, măsline
          - listitem [ref=e50]:
            - generic [ref=e52]:
              - generic [ref=e53]:
                - heading "Diavola" [level=3] [ref=e54]
                - paragraph [ref=e55]: 42 lei
              - paragraph [ref=e56]: sos de roșii, mozzarella, salam picant, măsline negre, rucola
          - listitem [ref=e57]:
            - generic [ref=e59]:
              - generic [ref=e60]:
                - heading "Țărănească" [level=3] [ref=e61]
                - paragraph [ref=e62]: 38 lei
              - paragraph [ref=e63]: sos de roșii, mozzarella, ciuperci, ardei gras, ceapă, roșii proaspete
          - listitem [ref=e64]:
            - generic [ref=e66]:
              - generic [ref=e67]:
                - heading "Salami" [level=3] [ref=e68]
                - paragraph [ref=e69]: 36 lei
              - paragraph [ref=e70]: sos de roșii, mozzarella, salam, oregano
          - listitem [ref=e71]:
            - generic [ref=e73]:
              - generic [ref=e74]:
                - heading "Pepperoni" [level=3] [ref=e75]
                - paragraph [ref=e76]: 34 lei
              - paragraph [ref=e77]: sos de roșii, mozzarella, pepperoni
      - region [ref=e78]:
        - heading "Paste" [level=2] [ref=e79]
        - list [ref=e80]:
          - listitem [ref=e81]:
            - generic [ref=e83]:
              - generic [ref=e84]:
                - heading "Spaghete Bolognese" [level=3] [ref=e85]
                - paragraph [ref=e86]: 39 lei
              - paragraph [ref=e87]: spaghete, sos de carne de vită cu roșii, parmezan
          - listitem [ref=e88]:
            - generic [ref=e90]:
              - generic [ref=e91]:
                - heading "Spaghete Pomodoro" [level=3] [ref=e92]
                - paragraph [ref=e93]: 33 lei
              - paragraph [ref=e94]: spaghete, sos de roșii cu busuioc, parmezan
      - region [ref=e95]:
        - heading "Desert" [level=2] [ref=e96]
        - list [ref=e97]:
          - listitem [ref=e98]:
            - generic [ref=e99]:
              - generic [ref=e100]:
                - heading "Papanași cu smântână" [level=3] [ref=e101]
                - paragraph [ref=e102]: 29 lei
              - paragraph [ref=e103]: papanași prăjiți, smântână, dulceață de afine
          - listitem [ref=e104]:
            - generic [ref=e105]:
              - generic [ref=e106]:
                - heading "Tiramisu" [level=3] [ref=e107]
                - paragraph [ref=e108]: 27 lei
              - paragraph [ref=e109]: mascarpone, cafea, pișcoturi, cacao
      - region [ref=e110]:
        - heading "Băuturi" [level=2] [ref=e111]
        - list [ref=e112]:
          - listitem [ref=e113]:
            - generic [ref=e114]:
              - generic [ref=e115]:
                - heading "Limonadă de casă" [level=3] [ref=e116]
                - paragraph [ref=e117]: 25 lei
              - paragraph [ref=e118]: lămâie, mentă, zahăr, 0,4 l
          - listitem [ref=e119]:
            - generic [ref=e120]:
              - generic [ref=e121]:
                - heading "Suc de portocale" [level=3] [ref=e122]
                - paragraph [ref=e123]: 26 lei
              - paragraph [ref=e124]: portocale presate la comandă, 0,3 l
          - listitem [ref=e125]:
            - generic [ref=e126]:
              - generic [ref=e127]:
                - heading "Bere la draft" [level=3] [ref=e128]
                - paragraph [ref=e129]: 25 lei
              - paragraph [ref=e130]: bere blondă, 0,5 l
      - region [ref=e131]:
        - heading "Ți-e deja foame?" [level=2] [ref=e132]
        - paragraph [ref=e133]: Sună-ne sau rezervă o masă.
        - generic [ref=e134]:
          - generic [ref=e135] [cursor=pointer]: Sună acum
          - link "Rezervă o masă" [ref=e138] [cursor=pointer]:
            - /url: /rezervare
  - contentinfo [ref=e139]:
    - generic [ref=e141]:
      - generic [ref=e142]:
        - paragraph [ref=e143]: Pizza Mița
        - paragraph [ref=e144]: Strada Exemplului 0, Orașul Demo
      - generic [ref=e145]:
        - heading "Telefon" [level=2] [ref=e146]
        - link "0000 000 000 (număr demonstrativ)" [ref=e147] [cursor=pointer]:
          - /url: tel:0000000000
        - heading "Program" [level=2] [ref=e148]
        - list [ref=e149]:
          - listitem [ref=e150]: "Luni: închis"
          - listitem [ref=e151]: "Marți–joi: 11:00–22:00"
          - listitem [ref=e152]: "Vineri–sâmbătă: 11:00–23:00"
          - listitem [ref=e153]: "Duminică: 12:00–22:00"
      - generic [ref=e154]:
        - heading "Pe site" [level=2] [ref=e155]
        - list [ref=e156]:
          - listitem [ref=e157]:
            - link "Meniu" [ref=e158] [cursor=pointer]:
              - /url: /menu
          - listitem [ref=e159]:
            - link "Rezervă o masă" [ref=e160] [cursor=pointer]:
              - /url: /rezervare
    - paragraph [ref=e162]: "Fotografii: Pexels"
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