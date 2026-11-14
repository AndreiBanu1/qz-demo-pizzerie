// The one way the report reads a value out of a summary.json. Kept free of imports
// (no node:fs), so the published report can run it in the browser; summarize.mjs re-exports it.

/** @typedef {import("./summary-schema.ts").Summary} Summary */

/**
 * Dot-path lookup ("pages.meniu.lighthouse.lcpMs"). A present null is returned as null;
 * a missing segment, or a segment below a non-object, throws.
 * @param {Summary} summary
 * @param {string} key
 * @returns {unknown}
 */
export function getEvidence(summary, key) {
  let cur = /** @type {unknown} */ (summary);
  for (const seg of key.split(".")) {
    if (cur === null || typeof cur !== "object" || !Object.hasOwn(cur, seg)) {
      throw new Error(`unknown evidence key: ${key}`);
    }
    cur = /** @type {Record<string, unknown>} */ (cur)[seg];
  }
  return cur;
}
