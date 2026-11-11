import { createServer } from "node:http";
import { mkdtempSync, readFileSync } from "node:fs";
import os from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { inspectHtml, restaurantFieldsMissing, run } from "./seo-html.mjs";

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

describe("inspectHtml details", () => {
  it("counts words across touching block elements", () => {
    expect(inspectHtml("<body><p>a</p><p>b</p><div>c</div></body>").words).toBe(3);
  });

  it("accepts full-URL, array and top-level-array JSON-LD types", () => {
    const ld = (o) => `<script type="application/ld+json">${JSON.stringify(o)}</script>`;
    const a = inspectHtml(ld({ "@type": "https://schema.org/Restaurant", name: "A" }));
    expect(a.jsonLd.types).toEqual(["Restaurant"]);
    expect(a.jsonLd.fields).toEqual(["name"]);
    const b = inspectHtml(ld({ "@type": ["http://schema.org/Restaurant", "LocalBusiness"], url: "u" }));
    expect(b.jsonLd.types).toEqual(["Restaurant", "LocalBusiness"]);
    expect(b.jsonLd.fields).toEqual(["url"]);
    const c = inspectHtml(ld([{ "@type": "Restaurant", image: "i" }, { "@type": "WebSite" }]));
    expect(c.jsonLd.types).toEqual(["Restaurant", "WebSite"]);
    expect(c.jsonLd.fields).toEqual(["image"]);
  });
});

describe("run", () => {
  it("rejects when a page returns an error status", async () => {
    const server = createServer((_, res) => { res.statusCode = 500; res.end("<title>x</title>"); });
    await new Promise((r) => server.listen(0, r));
    try {
      const url = `http://127.0.0.1:${server.address().port}`;
      const dir = mkdtempSync(join(os.tmpdir(), "seo-"));
      await expect(run({ url, pages: [{ id: "acasa", path: "/" }], dir })).rejects.toThrow(/acasa.*500/);
    } finally {
      server.close();
    }
  });
});

describe("restaurantFieldsMissing", () => {
  it("lists the missing fields", () => {
    expect(restaurantFieldsMissing(["name", "url"])).toEqual([
      "address", "telephone", "openingHoursSpecification", "servesCuisine", "priceRange", "hasMenu", "image",
    ]);
  });
});
