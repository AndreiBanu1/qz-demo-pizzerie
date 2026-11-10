import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import DemoBanner from "./components/DemoBanner";
import Footer from "./components/Footer";
import Header from "./components/Header";
import Home from "./pages/Home";
import Menu from "./pages/Menu";
import NotFound from "./pages/NotFound";
import Reservation from "./pages/Reservation";

/** The page shell (banner, header, footer) around the routes. The router itself is supplied by the caller. */
export default function AppRoutes() {
  const { pathname, hash } = useLocation();

  // A new page starts at the top, unless the link points at a section on it.
  useEffect(() => {
    if (!hash) window.scrollTo(0, 0);
  }, [pathname, hash]);

  return (
    <div className="flex min-h-screen flex-col">
      <DemoBanner />
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/meniu" element={<Menu />} />
          <Route path="/rezervare" element={<Reservation />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
