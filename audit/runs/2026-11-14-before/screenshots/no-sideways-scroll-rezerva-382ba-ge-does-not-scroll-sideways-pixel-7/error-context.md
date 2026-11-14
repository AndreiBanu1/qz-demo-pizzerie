# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: no-sideways-scroll.spec.ts >> rezervare: the page does not scroll sideways
- Location: audit/qa/no-sideways-scroll.spec.ts:5:3

# Error details

```
Error: expect(received).toBeLessThanOrEqual(expected)

Expected: <= 412
Received:    616
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
      - heading "Rezervă o masă" [level=1] [ref=e20]
      - paragraph [ref=e21]: Spune-ne cum te cheamă, când vii și câți sunteți.
      - generic [ref=e22]:
        - generic [ref=e24]:
          - textbox "Nume" [ref=e26]
          - textbox "Telefon" [ref=e28]
          - textbox "Data" [ref=e30]
          - textbox "Ora" [ref=e32]
          - spinbutton "Persoane" [ref=e34]
          - paragraph [ref=e35]: Toate câmpurile sunt obligatorii.
          - button "Rezervă masa" [ref=e36] [cursor=pointer]
        - region [ref=e37]:
          - generic [ref=e38]:
            - heading "Preferi să suni?" [level=2] [ref=e39]
            - paragraph [ref=e40]: Îți răspundem în timpul programului.
            - generic [ref=e41] [cursor=pointer]: Sună acum
          - generic [ref=e44]:
            - heading "Program" [level=2] [ref=e45]
            - table [ref=e47]:
              - rowgroup [ref=e48]:
                - row [ref=e49]:
                  - rowheader "Luni" [ref=e50]
                  - cell "Închis" [ref=e51]
                - row [ref=e52]:
                  - rowheader "Marți" [ref=e53]
                  - cell "11:00–22:00" [ref=e54]
                - row [ref=e55]:
                  - rowheader "Miercuri" [ref=e56]
                  - cell "11:00–22:00" [ref=e57]
                - row [ref=e58]:
                  - rowheader "Joi" [ref=e59]
                  - cell "11:00–22:00" [ref=e60]
                - row [ref=e61]:
                  - rowheader "Vineri" [ref=e62]
                  - cell "11:00–23:00" [ref=e63]
                - row [ref=e64]:
                  - rowheader "Sâmbătă" [ref=e65]
                  - cell "11:00–23:00" [ref=e66]
                - row [ref=e67]:
                  - rowheader "Duminică" [ref=e68]
                  - cell "12:00–22:00" [ref=e69]
  - contentinfo [ref=e70]:
    - generic [ref=e72]:
      - generic [ref=e73]:
        - paragraph [ref=e74]: Pizza Mița
        - paragraph [ref=e75]: Strada Exemplului 0, Orașul Demo
      - generic [ref=e76]:
        - heading "Telefon" [level=2] [ref=e77]
        - link "0000 000 000 (număr demonstrativ)" [ref=e78] [cursor=pointer]:
          - /url: tel:0000000000
        - heading "Program" [level=2] [ref=e79]
        - list [ref=e80]:
          - listitem [ref=e81]: "Luni: închis"
          - listitem [ref=e82]: "Marți–joi: 11:00–22:00"
          - listitem [ref=e83]: "Vineri–sâmbătă: 11:00–23:00"
          - listitem [ref=e84]: "Duminică: 12:00–22:00"
      - generic [ref=e85]:
        - heading "Pe site" [level=2] [ref=e86]
        - list [ref=e87]:
          - listitem [ref=e88]:
            - link "Meniu" [ref=e89] [cursor=pointer]:
              - /url: /menu
          - listitem [ref=e90]:
            - link "Rezervă o masă" [ref=e91] [cursor=pointer]:
              - /url: /rezervare
    - paragraph [ref=e93]: "Fotografii: Pexels"
```

# Test source

```ts
  1  | import { auditedPages } from "../lib/targets.mjs";
  2  | import { expect, open, test } from "./helpers";
  3  | 
  4  | for (const { id, path } of auditedPages) {
  5  |   test(`${id}: the page does not scroll sideways`, async ({ page }) => {
  6  |     await open(page, path);
  7  |     const { scrollWidth, clientWidth } = await page.evaluate(() => ({
  8  |       scrollWidth: document.documentElement.scrollWidth,
  9  |       clientWidth: document.documentElement.clientWidth,
  10 |     }));
> 11 |     expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
     |                         ^ Error: expect(received).toBeLessThanOrEqual(expected)
  12 |   });
  13 | }
  14 | 
```