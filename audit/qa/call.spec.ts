import { expect, open, test } from "./helpers";

test("the call control is a tel: link", async ({ page }) => {
  await open(page, "/");
  const call = page.locator("a", { hasText: "Sună acum" });
  await expect(call).toHaveCount(1);
  await expect(call).toHaveAttribute("href", "tel:0000000000");
});
