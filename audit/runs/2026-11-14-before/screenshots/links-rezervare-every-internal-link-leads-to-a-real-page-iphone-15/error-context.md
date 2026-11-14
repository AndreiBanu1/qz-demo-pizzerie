# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: links.spec.ts >> rezervare: every internal link leads to a real page
- Location: audit/qa/links.spec.ts:5:3

# Error details

```
Error: broken links on /rezervare

expect(received).toEqual(expected) // deep equality

- Expected  - 1
+ Received  + 3

- Array []
+ Array [
+   "https://pizza-mita-inainte.pages.dev/menu (status 200, 404 page)",
+ ]
```

# Page snapshot

```yaml
- generic [ref=f3e3]:
  - complementary "Despre acest site" [ref=f3e4]:
    - link "Site demonstrativ realizat de Quality Zone" [ref=f3e5]:
      - /url: https://qualityzone.netlify.app/ro
  - banner [ref=f3e6]:
    - generic [ref=f3e7]:
      - link "Pizza Mița" [ref=f3e8]:
        - /url: /
      - navigation "Principal" [ref=f3e11]:
        - list [ref=f3e12]:
          - listitem [ref=f3e13]:
            - link "Meniu" [ref=f3e14]:
              - /url: /meniu
          - listitem [ref=f3e15]:
            - link "Rezervă" [ref=f3e16]:
              - /url: /rezervare
  - main [ref=f3e18]:
    - generic [ref=f3e19]:
      - paragraph [aria-hidden] [ref=f3e20]: "404"
      - heading "Pagina nu există" [level=1] [ref=f3e21]
      - paragraph [ref=f3e22]: Poate s-a schimbat adresa sau s-a strecurat o greșeală de scriere. Hai înapoi la ceva bun.
      - generic [ref=f3e23]:
        - link "Înapoi la prima pagină" [ref=f3e24]:
          - /url: /
        - link "Vezi meniul" [ref=f3e25]:
          - /url: /meniu
  - contentinfo [ref=f3e26]:
    - generic [ref=f3e28]:
      - generic [ref=f3e29]:
        - paragraph [ref=f3e30]: Pizza Mița
        - paragraph [ref=f3e31]: Strada Exemplului 0, Orașul Demo
      - generic [ref=f3e32]:
        - heading "Telefon" [level=2] [ref=f3e33]
        - link "0000 000 000 (număr demonstrativ)" [ref=f3e34]:
          - /url: tel:0000000000
        - heading "Program" [level=2] [ref=f3e35]
        - list [ref=f3e36]:
          - listitem [ref=f3e37]: "Luni: închis"
          - listitem [ref=f3e38]: "Marți–joi: 11:00–22:00"
          - listitem [ref=f3e39]: "Vineri–sâmbătă: 11:00–23:00"
          - listitem [ref=f3e40]: "Duminică: 12:00–22:00"
      - generic [ref=f3e41]:
        - heading "Pe site" [level=2] [ref=f3e42]
        - list [ref=f3e43]:
          - listitem [ref=f3e44]:
            - link "Meniu" [ref=f3e45]:
              - /url: /menu
          - listitem [ref=f3e46]:
            - link "Rezervă o masă" [ref=f3e47]:
              - /url: /rezervare
    - paragraph [ref=f3e49]: "Fotografii: Pexels"
```

# Test source

```ts
  1  | import { auditedPages } from "../lib/targets.mjs";
  2  | import { open, expect, test } from "./helpers";
  3  | 
  4  | for (const { id, path } of auditedPages) {
  5  |   test(`${id}: every internal link leads to a real page`, async ({ page }) => {
  6  |     await open(page, path);
  7  |     const here = new URL(page.url());
  8  |     const hrefs = await page.$$eval("a[href]", (as) => as.map((a) => a.getAttribute("href") ?? ""));
  9  | 
  10 |     // Same-host links only: relative, root-relative and absolute same-origin. No tel:, mailto: or fragments on this page.
  11 |     const unique = new Set<string>();
  12 |     for (const href of hrefs) {
  13 |       if (href === "" || href.startsWith("#")) continue;
  14 |       let url: URL;
  15 |       try {
  16 |         url = new URL(href, here);
  17 |       } catch {
  18 |         continue;
  19 |       }
  20 |       if (url.protocol !== "http:" && url.protocol !== "https:") continue;
  21 |       if (url.host !== here.host) continue;
  22 |       url.hash = "";
  23 |       if (url.href === here.href) continue;
  24 |       unique.add(url.href);
  25 |     }
  26 |     expect(unique.size, "internal links found").toBeGreaterThan(0);
  27 | 
  28 |     const broken: string[] = [];
  29 |     for (const href of unique) {
  30 |       const response = await page.goto(href);
  31 |       await page.locator("h1").first().waitFor({ timeout: 5000 }).catch(() => {});
  32 |       const status = response?.status() ?? 0;
  33 |       const is404Page = (await page.getByRole("heading", { level: 1, name: "Pagina nu există" }).count()) > 0;
  34 |       if (status >= 400 || status === 0 || is404Page) broken.push(`${href} (status ${status}${is404Page ? ", 404 page" : ""})`);
  35 |     }
> 36 |     expect(broken, `broken links on ${path}`).toEqual([]);
     |                                               ^ Error: broken links on /rezervare
  37 |   });
  38 | }
  39 | 
```