import { parse } from "node-html-parser";
import { writeRaw } from "../lib/run-dir.mjs";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** True only for a real leak: 200, not the SPA index.html fallback, and a .map must be JSON. */
export function isExposed({ path, status, body }) {
  if (status !== 200) return false;
  if (body.includes('id="root"')) return false;
  if (path.endsWith(".map")) {
    try {
      JSON.parse(body);
    } catch {
      return false;
    }
  }
  return true;
}

export async function run({ url, dir, delayMs = 1000 }) {
  const home = await fetch(new URL("/", url));
  if (!home.ok) throw new Error(`exposure: home page returned HTTP ${home.status}`);
  const html = await home.text();
  const origin = new URL(url).origin;
  const scripts = parse(html)
    .querySelectorAll("script[src]")
    .map((s) => new URL(s.getAttribute("src"), new URL("/", url)))
    .filter((u) => u.origin === origin && u.pathname.endsWith(".js"));
  const maps = [...new Set(scripts.map((u) => `${u.pathname}.map`))];
  const paths = [...maps, "/.git/config", "/.env"];
  const out = [];
  for (const [i, path] of paths.entries()) {
    if (i > 0) await sleep(delayMs);
    const res = await fetch(new URL(path, url));
    const body = await res.text();
    out.push({
      path,
      status: res.status,
      contentType: res.headers.get("content-type"),
      bytes: Buffer.byteLength(body),
      exposed: isExposed({ path, status: res.status, body }),
    });
  }
  writeRaw(dir, "exposure", out);
  return out;
}
