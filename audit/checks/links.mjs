import { LinkChecker } from "linkinator";
import { writeRaw } from "../lib/run-dir.mjs";

/** The audit report and its raw data are the audit's output, not part of the audited site. */
const REPORT_PATH = /^\/raport(\/|$)/;

/**
 * True for a link the crawl must not follow: another host (not checked, so dead
 * external links are not covered), or the fixed site's own audit report. The
 * report links to the raw files of the run that is still being made, so crawling
 * it would always find them missing. The weak site has no report, so both runs
 * check the same pages.
 */
export function shouldSkip(link, origin) {
  let parsed;
  try {
    parsed = new URL(link);
  } catch {
    return false;
  }
  return parsed.origin !== origin || REPORT_PATH.test(parsed.pathname);
}

/**
 * Crawls the site from "/" on the same host only. Status 0 means linkinator
 * could not connect; it is recorded as-is (summarize counts it as broken).
 */
export async function run({ url, dir }) {
  const origin = new URL(url).origin;
  const checker = new LinkChecker();
  const result = await checker.check({
    path: new URL("/", url).href,
    recurse: true,
    timeout: 10000,
    linksToSkip: async (link) => shouldSkip(link, origin),
  });
  const links = result.links
    .filter((l) => l.state !== "SKIPPED")
    .map((l) => ({ url: l.url, status: l.status ?? 0, parent: l.parent ?? null }));
  writeRaw(dir, "links", links);
}
