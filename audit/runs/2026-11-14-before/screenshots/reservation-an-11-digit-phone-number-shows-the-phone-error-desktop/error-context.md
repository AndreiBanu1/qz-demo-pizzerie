# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: reservation.spec.ts >> an 11-digit phone number shows the phone error
- Location: audit/qa/reservation.spec.ts:67:1

# Error details

```
TimeoutError: locator.fill: Timeout 10000ms exceeded.
Call log:
  - waiting for getByLabel('Nume', { exact: true })

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
  1  | import { expect, open, test } from "./helpers";
  2  | 
  3  | // A fixed instant: Tuesday 2026-11-17, 09:30 UTC. The date to type is computed from it.
  4  | const NOW = new Date("2026-11-17T09:30:00Z");
  5  | 
  6  | /** A zz.ll.aaaa date 7 days after NOW, moved forward a day if it falls on a Monday (closed). */
  7  | function validDate(): string {
  8  |   const d = new Date(NOW.getTime() + 7 * 24 * 60 * 60 * 1000);
  9  |   if (d.getUTCDay() === 1) d.setUTCDate(d.getUTCDate() + 1);
  10 |   const pad = (n: number) => String(n).padStart(2, "0");
  11 |   return `${pad(d.getUTCDate())}.${pad(d.getUTCMonth() + 1)}.${d.getUTCFullYear()}`;
  12 | }
  13 | 
  14 | test.beforeEach(async ({ page }) => {
  15 |   await page.clock.setFixedTime(NOW);
  16 | });
  17 | 
  18 | test("every field has a label", async ({ page }) => {
  19 |   await open(page, "/rezervare");
  20 |   for (const name of ["Nume", "Telefon", "Ora", "Persoane"]) {
  21 |     await expect(page.getByLabel(name, { exact: true }), name).toHaveCount(1);
  22 |   }
  23 |   await expect(page.getByLabel(/^Data/)).toHaveCount(1);
  24 | });
  25 | 
  26 | test("inputs are at least 16 px so iOS does not zoom in", async ({ page }) => {
  27 |   await open(page, "/rezervare");
  28 |   const sizes = await page.locator("form input, form select").evaluateAll((els) =>
  29 |     els.map((el) => ({ name: el.getAttribute("name"), size: parseFloat(getComputedStyle(el).fontSize) })),
  30 |   );
  31 |   expect(sizes.length).toBeGreaterThan(0);
  32 |   for (const { name, size } of sizes) expect(size, `font-size of ${name}`).toBeGreaterThanOrEqual(16);
  33 | });
  34 | 
  35 | test("a valid reservation shows the demo message and sends nothing", async ({ page }) => {
  36 |   const requests: { url: string; body: string }[] = [];
  37 |   page.on("request", (r) => requests.push({ url: r.url(), body: r.postData() ?? "" }));
  38 | 
  39 |   await open(page, "/rezervare");
  40 |   await page.getByLabel("Nume", { exact: true }).fill("Ion");
  41 |   await page.getByLabel("Telefon", { exact: true }).fill("+40 712 345 678");
  42 |   await page.getByLabel(/^Data/).fill(validDate());
  43 | 
  44 |   const time = page.getByLabel("Ora", { exact: true });
  45 |   const slots = await time.locator("option").allTextContents();
  46 |   await time.selectOption({ label: slots.includes("19:00") ? "19:00" : slots[slots.length > 1 ? 1 : 0] });
  47 |   await page.getByLabel("Persoane", { exact: true }).selectOption("2");
  48 | 
  49 |   const submit = page.getByRole("button", { name: /rezerv/i });
  50 |   await submit.scrollIntoViewIfNeeded();
  51 |   const box = await submit.boundingBox();
  52 |   const viewport = page.viewportSize()!;
  53 |   expect(box, "submit button box").not.toBeNull();
  54 |   expect(box!.x, "submit starts inside the viewport").toBeGreaterThanOrEqual(0);
  55 |   expect(box!.x + box!.width, "submit ends inside the viewport width").toBeLessThanOrEqual(viewport.width);
  56 |   expect(box!.y + box!.height, "submit ends inside the viewport height").toBeLessThanOrEqual(viewport.height);
  57 |   await submit.click();
  58 | 
  59 |   await expect(page.getByText("Site demonstrativ: rezervarea nu a fost trimisă")).toBeVisible();
  60 | 
  61 |   for (const r of requests) {
  62 |     const haystack = decodeURIComponent(`${r.url} ${r.body}`);
  63 |     expect(haystack, `request ${r.url}`).not.toMatch(/Ion|712[ ]?345|\+40|0712/);
  64 |   }
  65 | });
  66 | 
  67 | test("an 11-digit phone number shows the phone error", async ({ page }) => {
  68 |   await open(page, "/rezervare");
> 69 |   await page.getByLabel("Nume", { exact: true }).fill("Ion");
     |                                                  ^ TimeoutError: locator.fill: Timeout 10000ms exceeded.
  70 |   await page.getByLabel("Telefon", { exact: true }).fill("07123456789");
  71 |   await page.getByLabel(/^Data/).fill(validDate());
  72 |   const submit = page.getByRole("button", { name: /rezerv/i });
  73 |   await submit.scrollIntoViewIfNeeded();
  74 |   await submit.click();
  75 |   await expect(page.getByText(/Numărul de telefon/)).toBeVisible();
  76 |   await expect(page.getByText("Site demonstrativ: rezervarea nu a fost trimisă")).toHaveCount(0);
  77 | });
  78 | 
```