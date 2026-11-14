# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: opening-status.spec.ts >> at 2026-11-17T09:30:00Z the home page says: Deschis acum, până la 22:00
- Location: audit/qa/opening-status.spec.ts:14:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Deschis acum, până la 22:00')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByText('Deschis acum, până la 22:00') with timeout 5000ms
  - waiting for getByText('Deschis acum, până la 22:00')

```

```yaml
- complementary "Despre acest site":
  - link "Site demonstrativ realizat de Quality Zone":
    - /url: https://qualityzone.netlify.app/ro
- banner:
  - link "Pizza Mița":
    - /url: /
    - img
    - text: Pizza Mița
  - navigation "Principal":
    - list:
      - listitem:
        - link "Meniu":
          - /url: /meniu
      - listitem:
        - link "Rezervă":
          - /url: /rezervare
- main:
  - paragraph: Pizzerie de cartier
  - heading "Pizza Mița" [level=1]
  - paragraph: Pizza la cuptor și paste, pe Strada Exemplului 0, în Orașul Demo.
  - paragraph: Închis, deschidem azi la 11:00
  - text: Sună acum
  - link "Vezi meniul":
    - /url: /meniu
  - img
  - heading "Program" [level=2]
  - paragraph: Luni ne odihnim. În restul săptămânii te așteptăm la masă.
  - table:
    - rowgroup:
      - row "Luni Închis":
        - rowheader "Luni"
        - cell "Închis"
      - row "Marți 11:00–22:00":
        - rowheader "Marți"
        - cell "11:00–22:00"
      - row "Miercuri 11:00–22:00":
        - rowheader "Miercuri"
        - cell "11:00–22:00"
      - row "Joi 11:00–22:00":
        - rowheader "Joi"
        - cell "11:00–22:00"
      - row "Vineri 11:00–23:00":
        - rowheader "Vineri"
        - cell "11:00–23:00"
      - row "Sâmbătă 11:00–23:00":
        - rowheader "Sâmbătă"
        - cell "11:00–23:00"
      - row "Duminică 12:00–22:00":
        - rowheader "Duminică"
        - cell "12:00–22:00"
  - heading "Unde ne găsești" [level=2]
  - paragraph: Strada Exemplului 0, Orașul Demo
  - 'img "Hartă desenată: Pizza Mița, pe Strada Exemplului 0, la colț cu Bulevardul Demo, în Orașul Demo"': Parcul Mic Strada Exemplului Bulevardul Demo Pizza Mița
  - link "Deschide în Maps":
    - /url: https://www.google.com/maps/search/?api=1&query=Pizza%20Mi%C8%9Ba
  - heading "Vii cu prietenii?" [level=2]
  - paragraph: Rezervă o masă și o pregătim pentru voi.
  - link "Rezervă o masă":
    - /url: /rezervare
- contentinfo:
  - paragraph: Pizza Mița
  - paragraph: Strada Exemplului 0, Orașul Demo
  - heading "Telefon" [level=2]
  - link "0000 000 000 (număr demonstrativ)":
    - /url: tel:0000000000
  - heading "Program" [level=2]
  - list:
    - listitem: "Luni: închis"
    - listitem: "Marți–joi: 11:00–22:00"
    - listitem: "Vineri–sâmbătă: 11:00–23:00"
    - listitem: "Duminică: 12:00–22:00"
  - heading "Pe site" [level=2]
  - list:
    - listitem:
      - link "Meniu":
        - /url: /menu
    - listitem:
      - link "Rezervă o masă":
        - /url: /rezervare
  - paragraph: "Fotografii: Pexels"
```

# Test source

```ts
  1  | import { expect, open, test } from "./helpers";
  2  | 
  3  | // The visitor's phone is in New York; the status must still follow Bucharest time.
  4  | test.use({ timezoneId: "America/New_York" });
  5  | 
  6  | const cases = [
  7  |   // Tuesday 11:30 in Bucharest, 09:30 in UTC
  8  |   { at: "2026-11-17T09:30:00Z", text: "Deschis acum, până la 22:00" },
  9  |   // Friday 23:30 in Bucharest, 21:30 in UTC
  10 |   { at: "2026-11-13T21:30:00Z", text: "Închis, deschidem mâine la 11:00" },
  11 | ];
  12 | 
  13 | for (const { at, text } of cases) {
  14 |   test(`at ${at} the home page says: ${text}`, async ({ page }) => {
  15 |     await page.clock.setFixedTime(new Date(at));
  16 |     await open(page, "/");
> 17 |     await expect(page.getByText(text)).toBeVisible();
     |                                        ^ Error: expect(locator).toBeVisible() failed
  18 |   });
  19 | }
  20 | 
```