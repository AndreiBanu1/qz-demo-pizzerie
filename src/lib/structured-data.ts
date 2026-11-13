import { heroPhoto } from "../content/menu";
import { restaurant, type Day } from "../content/restaurant";

const DAY_NAMES: Record<Day, string> = {
  0: "Sunday",
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
};

/** The Restaurant block for `/` and `/meniu`, built from the same data the pages show. */
export function restaurantJsonLd(origin: string): Record<string, unknown> {
  const days = [1, 2, 3, 4, 5, 6, 0] as Day[];
  return {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: restaurant.name,
    url: `${origin}/`,
    address: {
      "@type": "PostalAddress",
      streetAddress: restaurant.street,
      addressLocality: restaurant.town,
      addressCountry: restaurant.country,
    },
    telephone: restaurant.phoneHref.replace(/^tel:/, ""),
    openingHoursSpecification: days.flatMap((day) => {
      const h = restaurant.hours[day];
      return h
        ? [{ "@type": "OpeningHoursSpecification", dayOfWeek: DAY_NAMES[day], opens: h.open, closes: h.close }]
        : [];
    }),
    servesCuisine: "Pizza",
    priceRange: restaurant.priceRange,
    hasMenu: `${origin}/meniu`,
    image: `${origin}/img/${heroPhoto.file}`,
  };
}
