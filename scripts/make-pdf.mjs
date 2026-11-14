// Writes the two report PDFs (A4) to public/raport/. Serves the built site with `vite preview` on a free port,
// opens /raport and /raport/en in Chromium, prints them and stops the server.
// Run `npm run build` first. The PDFs are committed, so the dates inside them are fixed to keep reruns from producing a diff.
import { mkdirSync, writeFileSync } from "node:fs";
import { createServer } from "node:net";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";
import { preview } from "vite";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "public", "raport");
// The address the report lives at. Links inside the PDF point here, not at the local preview server.
const ORIGIN = "https://pizza-mita.pages.dev";

const freePort = () =>
  new Promise((resolve, reject) => {
    const s = createServer();
    s.once("error", reject);
    s.listen(0, "127.0.0.1", () => {
      const { port } = s.address();
      s.close(() => resolve(port));
    });
  });

// Chromium stamps the current time into the PDF (Info dictionary and XMP), in fixed-width fields. Overwriting them with the
// same number of bytes keeps every offset in the file valid.
const FIXED_DATE = "20260101000000";
function pinDates(buf) {
  let text = buf.toString("latin1");
  text = text.replace(/D:\d{14}[+\-Z](?:\d\d'\d\d')?/g, (m) => `D:${FIXED_DATE}${m.slice(16)}`);
  text = text.replace(/\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d[+\-Z](?:\d\d:\d\d)?/g, (m) => `2026-01-01T00:00:00${m.slice(19)}`);
  return Buffer.from(text, "latin1");
}

const port = await freePort();
let server;
let browser;
try {
  server = await preview({ root: ROOT, logLevel: "error", preview: { port, strictPort: true, host: "127.0.0.1" } });
  browser = await chromium.launch();
  mkdirSync(OUT, { recursive: true });
  for (const [path, file] of [
    ["/raport", "pizza-mita-audit-ro.pdf"],
    ["/raport/en", "pizza-mita-audit-en.pdf"],
  ]) {
    const page = await browser.newPage();
    await page.goto(`http://127.0.0.1:${port}${path}`, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    // Links like /raport/date/… become full addresses on the live site, so they work from a downloaded PDF (and don't carry the preview port).
    await page.evaluate((origin) => {
      for (const a of document.querySelectorAll("a[href^='/']")) a.setAttribute("href", origin + a.getAttribute("href"));
    }, ORIGIN);
    const pdf = await page.pdf({ format: "A4", printBackground: true, preferCSSPageSize: true });
    writeFileSync(join(OUT, file), pinDates(pdf));
    console.log(`wrote public/raport/${file}`);
    await page.close();
  }
} finally {
  await browser?.close();
  await server?.close();
}
