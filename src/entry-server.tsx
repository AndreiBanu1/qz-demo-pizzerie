// Server entry, used only at build time by scripts/prerender.mjs to write static HTML for each page.
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router";
import AppRoutes from "./routes";
import { ORIGIN, pageMeta, type PageId } from "./lib/page-meta";
import { restaurantJsonLd } from "./lib/structured-data";

export const render = (url: string): string =>
  renderToString(
    <StaticRouter location={url}>
      <AppRoutes />
    </StaticRouter>,
  );

const escapeAttr = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
const escapeText = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

/** The part of <head> that differs from page to page. */
export function renderHead(id: PageId): string {
  const { title, description, path } = pageMeta[id];
  const lines = [
    `<title>${escapeText(title)}</title>`,
    `<meta name="description" content="${escapeAttr(description)}" />`,
  ];
  // The 404 page has no address of its own, so it gets no canonical link.
  if (id !== "404") lines.push(`<link rel="canonical" href="${escapeAttr(ORIGIN + path)}" />`);
  // The restaurant data goes on the home page and the menu. "<" is escaped so the data can't close the script tag.
  if (id === "acasa" || id === "meniu") {
    const json = JSON.stringify(restaurantJsonLd(ORIGIN)).replace(/</g, "\\u003c");
    lines.push(`<script type="application/ld+json">${json}</script>`);
  }
  return lines.join("\n    ");
}

export { pageMeta };
