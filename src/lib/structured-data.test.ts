import { describe, expect, it } from "vitest";
import { restaurantFieldsMissing } from "../../audit/checks/seo-html.mjs";
import { restaurantJsonLd } from "./structured-data";

const data = restaurantJsonLd("https://pizza-mita.pages.dev") as Record<string, any>;

describe("restaurantJsonLd", () => {
  it("has every field the spec asks for", () => {
    expect(restaurantFieldsMissing(Object.keys(data))).toEqual([]);
    expect(data["@type"]).toBe("Restaurant");
  });

  it("never claims a location, rating or review", () => {
    for (const key of ["geo", "aggregateRating", "review"]) expect(data).not.toHaveProperty(key);
  });

  it("lists six opening days, because Monday is closed", () => {
    const spec = data.openingHoursSpecification as { dayOfWeek: string }[];
    expect(spec).toHaveLength(6);
    expect(spec.map((s) => s.dayOfWeek)).not.toContain("Monday");
  });

  it("points the menu, url and image at the given origin", () => {
    expect(data.url).toBe("https://pizza-mita.pages.dev/");
    expect(data.hasMenu).toBe("https://pizza-mita.pages.dev/meniu");
    expect(data.image).toMatch(/^https:\/\/pizza-mita\.pages\.dev\/img\//);
    expect(data.address.addressCountry).toBe("RO");
  });
});
