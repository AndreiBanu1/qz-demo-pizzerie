export type Day = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday
export type DayHours = { open: string; close: string } | null; // "HH:MM"

export type Restaurant = {
  name: string;
  street: string;
  town: string;
  country: "RO";
  phoneDisplay: string;
  phoneHref: string;
  priceRange: string;
  timeZone: "Europe/Bucharest";
  hours: Record<Day, DayHours>;
  /** The public repository: the code, the audit runs and every fix commit. */
  repoUrl: string;
};

export const restaurant: Restaurant = {
  name: "Pizza Mița",
  street: "Strada Exemplului 0",
  town: "Orașul Demo",
  country: "RO",
  phoneDisplay: "0000 000 000 (număr demonstrativ)",
  phoneHref: "tel:0000000000",
  priceRange: "25–55 lei",
  timeZone: "Europe/Bucharest",
  hours: {
    0: { open: "12:00", close: "22:00" },
    1: null,
    2: { open: "11:00", close: "22:00" },
    3: { open: "11:00", close: "22:00" },
    4: { open: "11:00", close: "22:00" },
    5: { open: "11:00", close: "23:00" },
    6: { open: "11:00", close: "23:00" },
  },
  repoUrl: "https://github.com/AndreiBanu1/qz-demo-pizzerie",
};
