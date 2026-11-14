export type PageId = "acasa" | "meniu" | "rezervare" | "raport" | "raport-en" | "404";

/** `lang` goes on <html>: the site is Romanian, the report also has an English page. */
export type PageMeta = { path: string; title: string; description: string; lang: "ro" | "en" };

/** Where the site is served from. Canonical links and structured data are built on it. */
export const ORIGIN = "https://pizza-mita.pages.dev";

export const pageMeta: Record<PageId, PageMeta> = {
  acasa: {
    path: "/",
    title: "Pizza Mița – pizzerie în Orașul Demo (site demonstrativ)",
    description:
      "Pizza la cuptor și paste pe Strada Exemplului 0, în Orașul Demo. Vezi programul și meniul, apoi rezervă o masă. Site demonstrativ.",
    lang: "ro",
  },
  meniu: {
    path: "/meniu",
    title: "Meniu – Pizza Mița",
    description:
      "Meniul Pizza Mița: șase pizza, două feluri de paste, deserturi și băuturi, cu prețuri în lei. Site demonstrativ, fără comenzi reale.",
    lang: "ro",
  },
  rezervare: {
    path: "/rezervare",
    title: "Rezervă o masă – Pizza Mița",
    description:
      "Rezervă o masă la Pizza Mița: spune-ne numele, ziua, ora și câte persoane sunteți. Site demonstrativ, nu se trimite nimic.",
    lang: "ro",
  },
  raport: {
    path: "/raport",
    title: "Raportul auditului – Pizza Mița",
    description:
      "Ce am găsit pe site-ul Pizza Mița, ce am reparat și cum am măsurat: înainte și după, cu datele brute și fiecare reparație. Site demonstrativ.",
    lang: "ro",
  },
  "raport-en": {
    path: "/raport/en",
    title: "Audit report – Pizza Mița",
    description:
      "What I found on the Pizza Mița site, what I fixed and how I measured it: before and after, with the raw data and every fix. A demo site.",
    lang: "en",
  },
  "404": {
    path: "/404",
    title: "Pagina nu există – Pizza Mița",
    description: "Pagina pe care o cauți nu există. Înapoi la prima pagină sau la meniul Pizza Mița.",
    lang: "ro",
  },
};

/** Which page a URL path shows. Anything that isn't a real page is the 404 page. */
export function pageIdForPath(pathname: string): PageId {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  if (path === "/") return "acasa";
  if (path === "/meniu") return "meniu";
  if (path === "/rezervare") return "rezervare";
  if (path === "/raport") return "raport";
  if (path === "/raport/en") return "raport-en";
  return "404";
}
