export type PageId = "acasa" | "meniu" | "rezervare" | "404";

export type PageMeta = { path: string; title: string; description: string };

/** Where the site is served from. Canonical links and structured data are built on it. */
export const ORIGIN = "https://pizza-mita.pages.dev";

export const pageMeta: Record<PageId, PageMeta> = {
  acasa: {
    path: "/",
    title: "Pizza Mița – pizzerie în Orașul Demo (site demonstrativ)",
    description:
      "Pizza la cuptor și paste pe Strada Exemplului 0, în Orașul Demo. Vezi programul și meniul, apoi rezervă o masă. Site demonstrativ.",
  },
  meniu: {
    path: "/meniu",
    title: "Meniu – Pizza Mița",
    description:
      "Meniul Pizza Mița: șase pizza, două feluri de paste, deserturi și băuturi, cu prețuri în lei. Site demonstrativ, fără comenzi reale.",
  },
  rezervare: {
    path: "/rezervare",
    title: "Rezervă o masă – Pizza Mița",
    description:
      "Rezervă o masă la Pizza Mița: spune-ne numele, ziua, ora și câte persoane sunteți. Site demonstrativ, nu se trimite nimic.",
  },
  "404": {
    path: "/404",
    title: "Pagina nu există – Pizza Mița",
    description: "Pagina pe care o cauți nu există. Înapoi la prima pagină sau la meniul Pizza Mița.",
  },
};

/** Which page a URL path shows. Anything that isn't a real page is the 404 page. */
export function pageIdForPath(pathname: string): PageId {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  if (path === "/") return "acasa";
  if (path === "/meniu") return "meniu";
  if (path === "/rezervare") return "rezervare";
  return "404";
}
