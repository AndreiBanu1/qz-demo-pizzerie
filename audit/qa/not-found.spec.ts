import { expect, open, test } from "./helpers";

test("an unknown address returns 404 and offers the way home", async ({ page }) => {
  const response = await open(page, "/nu-exista");
  expect(response!.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1, name: "Pagina nu există" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Înapoi la prima pagină" })).toHaveAttribute("href", "/");
});
