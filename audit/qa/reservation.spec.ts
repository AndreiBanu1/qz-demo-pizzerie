import { expect, open, test } from "./helpers";

// A fixed instant: Tuesday 2026-11-17, 09:30 UTC. The date to type is computed from it.
const NOW = new Date("2026-11-17T09:30:00Z");

/** A zz.ll.aaaa date 7 days after NOW, moved forward a day if it falls on a Monday (closed). */
function validDate(): string {
  const d = new Date(NOW.getTime() + 7 * 24 * 60 * 60 * 1000);
  if (d.getUTCDay() === 1) d.setUTCDate(d.getUTCDate() + 1);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getUTCDate())}.${pad(d.getUTCMonth() + 1)}.${d.getUTCFullYear()}`;
}

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(NOW);
});

test("every field has a label", async ({ page }) => {
  await open(page, "/rezervare");
  for (const name of ["Nume", "Telefon", "Ora", "Persoane"]) {
    await expect(page.getByLabel(name, { exact: true }), name).toHaveCount(1);
  }
  await expect(page.getByLabel(/^Data/)).toHaveCount(1);
});

test("inputs are at least 16 px so iOS does not zoom in", async ({ page }) => {
  await open(page, "/rezervare");
  const sizes = await page.locator("form input, form select").evaluateAll((els) =>
    els.map((el) => ({ name: el.getAttribute("name"), size: parseFloat(getComputedStyle(el).fontSize) })),
  );
  expect(sizes.length).toBeGreaterThan(0);
  for (const { name, size } of sizes) expect(size, `font-size of ${name}`).toBeGreaterThanOrEqual(16);
});

test("a valid reservation shows the demo message and sends nothing", async ({ page }) => {
  const requests: { url: string; body: string }[] = [];
  page.on("request", (r) => requests.push({ url: r.url(), body: r.postData() ?? "" }));

  await open(page, "/rezervare");
  await page.getByLabel("Nume", { exact: true }).fill("Ion");
  await page.getByLabel("Telefon", { exact: true }).fill("+40 712 345 678");
  await page.getByLabel(/^Data/).fill(validDate());

  const time = page.getByLabel("Ora", { exact: true });
  const slots = await time.locator("option").allTextContents();
  await time.selectOption({ label: slots.includes("19:00") ? "19:00" : slots[slots.length > 1 ? 1 : 0] });
  await page.getByLabel("Persoane", { exact: true }).selectOption("2");

  const submit = page.getByRole("button", { name: /rezerv/i });
  await submit.scrollIntoViewIfNeeded();
  const box = await submit.boundingBox();
  const viewport = page.viewportSize()!;
  expect(box, "submit button box").not.toBeNull();
  expect(box!.x, "submit starts inside the viewport").toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width, "submit ends inside the viewport width").toBeLessThanOrEqual(viewport.width);
  expect(box!.y + box!.height, "submit ends inside the viewport height").toBeLessThanOrEqual(viewport.height);
  await submit.click();

  await expect(page.getByText("Site demonstrativ: rezervarea nu a fost trimisă")).toBeVisible();

  for (const r of requests) {
    const haystack = decodeURIComponent(`${r.url} ${r.body}`);
    expect(haystack, `request ${r.url}`).not.toMatch(/Ion|712[ ]?345|\+40|0712/);
  }
});

test("an 11-digit phone number shows the phone error", async ({ page }) => {
  await open(page, "/rezervare");
  await page.getByLabel("Nume", { exact: true }).fill("Ion");
  await page.getByLabel("Telefon", { exact: true }).fill("07123456789");
  await page.getByLabel(/^Data/).fill(validDate());
  const submit = page.getByRole("button", { name: /rezerv/i });
  await submit.scrollIntoViewIfNeeded();
  await submit.click();
  await expect(page.getByText(/Numărul de telefon/)).toBeVisible();
  await expect(page.getByText("Site demonstrativ: rezervarea nu a fost trimisă")).toHaveCount(0);
});
