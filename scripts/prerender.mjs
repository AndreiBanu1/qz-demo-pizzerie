// Writes a static HTML file per page, so a crawler that doesn't run JavaScript sees the full page
// with its own title, description and canonical link. Runs after both Vite builds.
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const ssrDir = join(root, "dist-ssr");

const { render, renderHead, pageMeta, prepare } = await import(pathToFileURL(join(ssrDir, "entry-server.js")).href);

// Loads the report and stops the build if its findings don't validate against the report runs.
await prepare();

const template = readFileSync(join(dist, "index.html"), "utf8");
const HEAD = /<!--seo-head-->[\s\S]*?<!--\/seo-head-->/;
const APP = "<!--app-->";
if (!HEAD.test(template)) throw new Error("index.html is missing the <!--seo-head--> … <!--/seo-head--> block");
if (!template.includes(APP)) throw new Error("index.html is missing <!--app--> inside #root");
const HTML_LANG = '<html lang="ro">';
if (!template.includes(HTML_LANG)) throw new Error(`index.html is missing ${HTML_LANG}`);

// Each page gets its own <html lang>: Romanian everywhere except the English report page.
const pageHtml = (id, url) =>
  template
    .replace(HTML_LANG, () => `<html lang="${pageMeta[id].lang}">`)
    .replace(HEAD, () => renderHead(id))
    .replace(APP, () => render(url));

const write = (file, content) => {
  mkdirSync(dirname(join(dist, file)), { recursive: true });
  writeFileSync(join(dist, file), content);
  console.log(`prerendered ${file}`);
};

for (const id of ["acasa", "meniu", "rezervare", "raport", "raport-en"]) {
  const { path } = pageMeta[id];
  write(path === "/" ? "index.html" : `${path.slice(1)}.html`, pageHtml(id, path));
}

// Cloudflare Pages answers any path that has no file with 404.html and a 404 status.
write("404.html", pageHtml("404", "/nu-exista"));

rmSync(ssrDir, { recursive: true, force: true });
