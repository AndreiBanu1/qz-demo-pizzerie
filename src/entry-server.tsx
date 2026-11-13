// Server entry, used only at build time by scripts/prerender.mjs to write static HTML for each page.
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router";
import AppRoutes from "./routes";
import { ORIGIN, pageMeta, type PageId } from "./lib/page-meta";

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
  return [
    `<title>${escapeText(title)}</title>`,
    `<meta name="description" content="${escapeAttr(description)}" />`,
    `<link rel="canonical" href="${escapeAttr(ORIGIN + path)}" />`,
  ].join("\n    ");
}

export { pageMeta };
