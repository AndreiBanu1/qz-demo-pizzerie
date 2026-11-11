import { expect, open, test } from "./helpers";

test("the name, the call control and the menu link are on the first screen", async ({ page }) => {
  await open(page, "/");
  const height = page.viewportSize()!.height;

  const targets = {
    name: page.getByRole("heading", { level: 1, name: "Pizza Mița" }),
    call: page.getByText("Sună acum", { exact: true }),
    menu: page.getByRole("link", { name: "Vezi meniul" }),
  };
  for (const [what, locator] of Object.entries(targets)) {
    await expect(locator, what).toBeVisible();
    const box = await locator.boundingBox();
    expect(box, what).not.toBeNull();
    expect(box!.y, `${what} starts on screen`).toBeGreaterThanOrEqual(0);
    expect(box!.y + box!.height, `${what} ends inside the first ${height}px`).toBeLessThanOrEqual(height);
  }
});
