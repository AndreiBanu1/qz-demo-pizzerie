import { parse } from "node-html-parser";
import { writeRaw } from "../lib/run-dir.mjs";

export const RESTAURANT_FIELDS = [
  "name", "url", "address", "telephone", "openingHoursSpecification", "servesCuisine", "priceRange", "hasMenu", "image",
];

const attr = (el, name) => (el ? (el.getAttribute(name) ?? null) : null);

function walk(node, types, fields) {
  if (Array.isArray(node)) {
    for (const n of node) walk(n, types, fields);
    return;
  }
  if (!node || typeof node !== "object") return;
  const t = node["@type"];
  const list = Array.isArray(t) ? t : t ? [t] : [];
  for (const x of list) types.push(String(x));
  if (list.includes("Restaurant")) {
    for (const k of Object.keys(node)) if (k !== "@context" && k !== "@type") fields.add(k);
  }
  if (node["@graph"]) walk(node["@graph"], types, fields);
}

/** Inspects raw (no-JS) HTML for the SEO signals the audit reports. */
export function inspectHtml(html) {
  const root = parse(html);
  const types = [];
  const fields = new Set();
  let parseErrors = 0;
  for (const s of root.querySelectorAll('script[type="application/ld+json"]')) {
    try {
      walk(JSON.parse(s.textContent), types, fields);
    } catch {
      parseErrors += 1;
    }
  }
  const body = root.querySelector("body");
  let words = 0;
  if (body) {
    for (const el of body.querySelectorAll("script, style, noscript")) el.remove();
    words = body.textContent.split(/\s+/).filter(Boolean).length;
  }
  const title = root.querySelector("title");
  return {
    title: title ? title.textContent.trim() : null,
    description: attr(root.querySelector('meta[name="description"]'), "content"),
    h1Count: root.querySelectorAll("h1").length,
    lang: attr(root.querySelector("html"), "lang"),
    canonical: attr(root.querySelector('link[rel="canonical"]'), "href"),
    robots: attr(root.querySelector('meta[name="robots"]'), "content"),
    jsonLd: { types, fields: [...fields], parseErrors },
    words,
  };
}

export function restaurantFieldsMissing(fields) {
  return RESTAURANT_FIELDS.filter((f) => !fields.includes(f));
}

export async function run({ url, pages, dir }) {
  const out = {};
  for (const page of pages) {
    const res = await fetch(new URL(page.path, url));
    out[page.id] = inspectHtml(await res.text());
  }
  writeRaw(dir, "seo-html", out);
}
