import { writeRaw } from "../lib/run-dir.mjs";
import { targets } from "../lib/targets.mjs";

const API = "https://observatory-api.mdn.mozilla.net/api/v2/scan";

/** Scans only our own two pages.dev hosts; `fetchFn` is injectable for tests. */
export async function run({ url, dir, fetchFn = fetch }) {
  const host = new URL(url).host;
  const ours = Object.values(targets).map((t) => new URL(t).host);
  if (!ours.includes(host)) {
    throw new Error(`observatory: ${host} is not one of our hosts (${ours.join(", ")}); refusing to scan`);
  }
  const res = await fetchFn(`${API}?host=${encodeURIComponent(host)}`, { method: "POST" });
  if (res.status !== 200) throw new Error(`observatory: HTTP ${res.status} for ${host}`);
  const json = await res.json();
  if (!json || json.grade == null) throw new Error(`observatory: response for ${host} has no grade`);
  writeRaw(dir, "observatory", json);
  return json;
}
