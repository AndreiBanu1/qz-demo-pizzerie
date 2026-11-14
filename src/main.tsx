import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./App";
import { pageIdForPath } from "./lib/page-meta";
import { loadReport } from "./pages/report/ReportRoute";
import "./index.css";

const root = document.getElementById("root")!;
const hydrate = () => hydrateRoot(root, <App />);

// Built pages arrive prerendered (scripts/prerender.mjs), so attach to that HTML; the dev server serves an empty root.
// A report page waits for its own chunk first, so hydration renders the same tree the prerender wrote.
if (root.firstElementChild) {
  if (pageIdForPath(window.location.pathname).startsWith("raport")) void loadReport().then(hydrate);
  else hydrate();
} else createRoot(root).render(<App />);
