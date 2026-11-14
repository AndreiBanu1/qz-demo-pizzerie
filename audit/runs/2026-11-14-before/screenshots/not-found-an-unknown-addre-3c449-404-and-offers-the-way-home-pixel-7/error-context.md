# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: not-found.spec.ts >> an unknown address returns 404 and offers the way home
- Location: audit/qa/not-found.spec.ts:3:1

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 404
Received: 200
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
      - paragraph [aria-hidden] [ref=e20]: "404"
      - heading "Pagina nu există" [level=1] [ref=e21]
      - paragraph [ref=e22]: Poate s-a schimbat adresa sau s-a strecurat o greșeală de scriere. Hai înapoi la ceva bun.
      - generic [ref=e23]:
        - link "Înapoi la prima pagină" [ref=e24] [cursor=pointer]:
          - /url: /
        - link "Vezi meniul" [ref=e25] [cursor=pointer]:
          - /url: /meniu
  - contentinfo [ref=e26]:
    - generic [ref=e28]:
      - generic [ref=e29]:
        - paragraph [ref=e30]: Pizza Mița
        - paragraph [ref=e31]: Strada Exemplului 0, Orașul Demo
      - generic [ref=e32]:
        - heading "Telefon" [level=2] [ref=e33]
        - link "0000 000 000 (număr demonstrativ)" [ref=e34] [cursor=pointer]:
          - /url: tel:0000000000
        - heading "Program" [level=2] [ref=e35]
        - list [ref=e36]:
          - listitem [ref=e37]: "Luni: închis"
          - listitem [ref=e38]: "Marți–joi: 11:00–22:00"
          - listitem [ref=e39]: "Vineri–sâmbătă: 11:00–23:00"
          - listitem [ref=e40]: "Duminică: 12:00–22:00"
      - generic [ref=e41]:
        - heading "Pe site" [level=2] [ref=e42]
        - list [ref=e43]:
          - listitem [ref=e44]:
            - link "Meniu" [ref=e45] [cursor=pointer]:
              - /url: /menu
          - listitem [ref=e46]:
            - link "Rezervă o masă" [ref=e47] [cursor=pointer]:
              - /url: /rezervare
    - paragraph [ref=e49]: "Fotografii: Pexels"
```

# Test source

```ts
  1 | import { expect, open, test } from "./helpers";
  2 | 
  3 | test("an unknown address returns 404 and offers the way home", async ({ page }) => {
  4 |   const response = await open(page, "/nu-exista");
> 5 |   expect(response!.status()).toBe(404);
    |                              ^ Error: expect(received).toBe(expected) // Object.is equality
  6 |   await expect(page.getByRole("heading", { level: 1, name: "Pagina nu există" })).toBeVisible();
  7 |   await expect(page.getByRole("link", { name: "Înapoi la prima pagină" })).toHaveAttribute("href", "/");
  8 | });
  9 | 
```