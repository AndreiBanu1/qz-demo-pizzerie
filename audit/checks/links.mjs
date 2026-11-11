import { LinkChecker } from "linkinator";
import { writeRaw } from "../lib/run-dir.mjs";

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
    linksToSkip: async (link) => {
      try {
        return new URL(link).origin !== origin;
      } catch {
        return false;
      }
    },
  });
  const links = result.links
    .filter((l) => l.state !== "SKIPPED")
    .map((l) => ({ url: l.url, status: l.status ?? 0, parent: l.parent ?? null }));
  writeRaw(dir, "links", links);
}
