import { describe, expect, it } from "vitest";
import { pageIdForPath, pageMeta } from "./page-meta";

describe("pageMeta", () => {
  const entries = Object.entries(pageMeta);

  it("gives each page its own title", () => {
    expect(pageMeta.acasa.title).toBe("Pizza Mița – pizzerie în Orașul Demo (site demonstrativ)");
    expect(pageMeta.meniu.title).toBe("Meniu – Pizza Mița");
    expect(pageMeta.rezervare.title).toBe("Rezervă o masă – Pizza Mița");
    expect(pageMeta["404"].title).toBe("Pagina nu există – Pizza Mița");
    const titles = entries.map(([, m]) => m.title);
    expect(new Set(titles).size).toBe(titles.length);
  });

  it("keeps every description between 70 and 160 characters, and unique", () => {
    for (const [id, m] of entries) {
      expect(m.description.length, id).toBeGreaterThanOrEqual(70);
      expect(m.description.length, id).toBeLessThanOrEqual(160);
    }
    const descriptions = entries.map(([, m]) => m.description);
    expect(new Set(descriptions).size).toBe(descriptions.length);
  });

  it("uses comma-below letters, never the cedilla forms", () => {
    for (const [, m] of entries) expect(`${m.title}${m.description}`).not.toMatch(/[şţŞŢ]/);
  });
});

describe("pageIdForPath", () => {
  it("maps the real pages and sends everything else to the 404 page", () => {
    expect(pageIdForPath("/")).toBe("acasa");
    expect(pageIdForPath("/meniu")).toBe("meniu");
    expect(pageIdForPath("/meniu/")).toBe("meniu");
    expect(pageIdForPath("/rezervare")).toBe("rezervare");
    expect(pageIdForPath("/nu-exista")).toBe("404");
    expect(pageIdForPath("/menu")).toBe("404");
  });
});
