import { writeRaw } from "../lib/run-dir.mjs";

export const SECURITY_HEADERS = [
  "content-security-policy",
  "strict-transport-security",
  "x-content-type-options",
  "x-frame-options",
  "referrer-policy",
  "permissions-policy",
];

const EXTRA_HEADERS = ["x-robots-tag", "access-control-allow-origin"];

/** Security-relevant response headers (value or null), plus whether the CSP has frame-ancestors. */
export function headerReport(headers) {
  const report = {};
  for (const name of [...SECURITY_HEADERS, ...EXTRA_HEADERS]) report[name] = headers.get(name);
  report.frameAncestors = /frame-ancestors/i.test(report["content-security-policy"] ?? "");
  return report;
}

export async function run({ url, pages, dir }) {
  const out = {};
  for (const page of pages) {
    const res = await fetch(new URL(page.path, url));
    if (!res.ok) throw new Error(`headers: ${page.id} returned HTTP ${res.status}`);
    out[page.id] = headerReport(res.headers);
  }
  writeRaw(dir, "headers", out);
  return out;
}
