import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { inspectHtml, restaurantFieldsMissing } from "./seo-html.mjs";

const fixture = (name) => readFileSync(new URL(`../fixtures/${name}`, import.meta.url), "utf8");

describe("inspectHtml", () => {
  it("reads the weak empty-root shell", () => {
    const r = inspectHtml(fixture("empty-root.html"));
    expect(r.title).toBe("Home");
    expect(r.description).toBeNull();
    expect(r.h1Count).toBe(0);
    expect(r.lang).toBe("en");
    expect(r.robots).toBe("noindex");
    expect(r.canonical).toBeNull();
    expect(r.words).toBeLessThanOrEqual(15);
    expect(r.jsonLd.types).toEqual([]);
  });

  it("reads a good page with complete Restaurant JSON-LD", () => {
    const r = inspectHtml(fixture("good.html"));
    expect(r.lang).toBe("ro");
    expect(r.h1Count).toBe(1);
    expect(r.canonical).toBe("https://pizza-mita.netlify.app/");
    expect(r.jsonLd.types).toContain("Restaurant");
    expect(restaurantFieldsMissing(r.jsonLd.fields)).toEqual([]);
    expect(r.words).toBeGreaterThan(5);
  });

  it("counts a broken JSON-LD block", () => {
    const html = `<html><body><script type="application/ld+json">{ not json</script></body></html>`;
    expect(inspectHtml(html).jsonLd.parseErrors).toBe(1);
  });

  it("collects types from @graph", () => {
    const html = `<script type="application/ld+json">{"@graph":[{"@type":"Restaurant","name":"A"},{"@type":"WebSite"}]}</script>`;
    const r = inspectHtml(html);
    expect(r.jsonLd.types).toEqual(["Restaurant", "WebSite"]);
    expect(r.jsonLd.fields).toEqual(["name"]);
  });
});

describe("restaurantFieldsMissing", () => {
  it("lists the missing fields", () => {
    expect(restaurantFieldsMissing(["name", "url"])).toEqual([
      "address", "telephone", "openingHoursSpecification", "servesCuisine", "priceRange", "hasMenu", "image",
    ]);
  });
});
