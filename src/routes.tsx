import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import DemoBanner from "./components/DemoBanner";
import Footer from "./components/Footer";
import Header from "./components/Header";
import Home from "./pages/Home";
import Menu from "./pages/Menu";
import NotFound from "./pages/NotFound";
import Reservation from "./pages/Reservation";
import ReportRoute from "./pages/report/ReportRoute";
import { ORIGIN, pageIdForPath, pageMeta } from "./lib/page-meta";

/** The page shell (banner, header, footer) around the routes. The router itself is supplied by the caller. */
export default function AppRoutes() {
  const { pathname, hash } = useLocation();
  // The English report page is the only page not in Romanian; its banner, header and footer stay Romanian.
  const shellLang = pageMeta[pageIdForPath(pathname)].lang === "ro" ? undefined : "ro";

  // A new page starts at the top, unless the link points at a section on it.
  useEffect(() => {
    if (!hash) window.scrollTo(0, 0);
  }, [pathname, hash]);

  // The prerendered HTML already carries each page's title, description and canonical link; this keeps them right when you move between pages.
  useEffect(() => {
    const id = pageIdForPath(pathname);
    const { title, description, path, lang } = pageMeta[id];
    document.documentElement.lang = lang;
    document.title = title;
    document.querySelector('meta[name="description"]')?.setAttribute("content", description);
    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (id === "404") {
      canonical?.remove(); // the 404 page has no address of its own
    } else {
      if (!canonical) {
        canonical = document.createElement("link");
        canonical.rel = "canonical";
        document.head.appendChild(canonical);
      }
      canonical.href = ORIGIN + path;
    }
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col">
      <DemoBanner lang={shellLang} />
      <Header lang={shellLang} />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/meniu" element={<Menu />} />
          <Route path="/rezervare" element={<Reservation />} />
          <Route path="/raport" element={<ReportRoute lang="ro" />} />
          <Route path="/raport/en" element={<ReportRoute lang="en" />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer lang={shellLang} />
    </div>
  );
}
