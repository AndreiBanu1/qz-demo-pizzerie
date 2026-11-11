import { createRequire } from "node:module";
import { launch } from "chrome-launcher";
import lighthouse from "lighthouse";
import { writeRaw } from "../lib/run-dir.mjs";
import { auditedPages } from "../lib/targets.mjs";

const require = createRequire(import.meta.url);
const RUNS = 3;
const CATEGORIES = ["performance", "accessibility", "seo", "best-practices"];

/** Chrome that chrome-launcher finds; falls back to Playwright's Chromium. */
async function startChrome() {
  const flags = ["--headless=new", "--no-sandbox"];
  try {
    return await launch({ chromeFlags: flags });
  } catch {
    const chromePath = require("@playwright/test").chromium.executablePath();
    return launch({ chromeFlags: flags, chromePath });
  }
}

async function runOnce(pageUrl) {
  const chrome = await startChrome();
  try {
    const result = await lighthouse(pageUrl, { port: chrome.port, output: "json", logLevel: "error", onlyCategories: CATEGORIES });
    const lhr = result.lhr;
    if (lhr.runtimeError) throw new Error(`Lighthouse runtime error for ${pageUrl}: ${lhr.runtimeError.code}: ${lhr.runtimeError.message}`);
    for (const c of CATEGORIES) {
      if (lhr.categories?.[c]?.score == null) throw new Error(`Lighthouse category "${c}" has a null score for ${pageUrl}`);
    }
    return lhr;
  } finally {
    await chrome.kill();
  }
}

/** 3 sequential runs per page (never parallel: parallel runs skew the numbers). */
export async function run({ url, pages = auditedPages, dir }) {
  for (const page of pages) {
    const pageUrl = new URL(page.path, url).href;
    for (let n = 1; n <= RUNS; n += 1) {
      writeRaw(dir, `lighthouse-${page.id}-${n}`, await runOnce(pageUrl));
    }
  }
}
