/** Middle of exactly 3 runs, so the reported number is one a real run produced. */
export function median3(values) {
  if (!Array.isArray(values) || values.length !== 3) throw new Error("need exactly 3 runs");
  return [...values].sort((a, b) => a - b)[1];
}
