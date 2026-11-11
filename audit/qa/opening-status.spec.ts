import { expect, open, test } from "./helpers";

// The visitor's phone is in New York; the status must still follow Bucharest time.
test.use({ timezoneId: "America/New_York" });

const cases = [
  // Tuesday 11:30 in Bucharest, 09:30 in UTC
  { at: "2026-11-17T09:30:00Z", text: "Deschis acum, până la 22:00" },
  // Friday 23:30 in Bucharest, 21:30 in UTC
  { at: "2026-11-13T21:30:00Z", text: "Închis, deschidem mâine la 11:00" },
];

for (const { at, text } of cases) {
  test(`at ${at} the home page says: ${text}`, async ({ page }) => {
    await page.clock.setFixedTime(new Date(at));
    await open(page, "/");
    await expect(page.getByText(text)).toBeVisible();
  });
}
