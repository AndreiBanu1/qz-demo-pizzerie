// Fails the build if any `PLANTED P-xx` marker is left in the shipped source.
// The weak version keeps the markers; `main` must have none once the fixes are done.
import { fileURLToPath } from "node:url";
import { SCAN, collect, findMarkers } from "./verify-planted.mjs";

/** Returns the `[id, paths]` pairs for every marker still present. */
export function leftoverMarkers(files) {
  return [...findMarkers(files)];
}

function main() {
  const left = leftoverMarkers(SCAN.flatMap(collect));
  if (left.length > 0) {
    for (const [id, paths] of left) console.error(`${id} still marked in ${paths.join(", ")}`);
    process.exit(1);
  }
  console.log("No PLANTED markers left");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
