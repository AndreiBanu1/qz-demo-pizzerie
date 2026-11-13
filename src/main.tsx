import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const root = document.getElementById("root")!;

// Built pages arrive prerendered (scripts/prerender.mjs), so attach to that HTML; the dev server serves an empty root.
if (root.firstElementChild) hydrateRoot(root, <App />);
else createRoot(root).render(<App />);
