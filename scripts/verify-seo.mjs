// Checks the built site the way a crawler that doesn't run JavaScript sees it.
// Runs at the end of `npm run build`, so a regression fails the deploy.
// The expectations are written out here on purpose, so this check doesn't trust the code it checks.
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const DIST = "dist";
const ORIGIN = "https://pizza-mita.pages.dev";
const BANNER = "Site demonstrativ realizat de Quality Zone";
const MENU_ITEMS = [
  "Margherita", "Quattro Stagioni", "Diavola", "Țărănească", "Salami", "Pepperoni",
  "Spaghete Bolognese", "Spaghete Pomodoro",
  "Papanași cu smântână", "Tiramisu",
  "Limonadă de casă", "Suc de portocale", "Bere la draft",
];

const pages = [
  { file: "index.html", path: "/", title: "Pizza Mița – pizzerie în Orașul Demo (site demonstrativ)", h1: "Pizza Mița" },
  { file: "meniu.html", path: "/meniu", title: "Meniu – Pizza Mița", h1: "Meniu", menu: true },
  { file: "rezervare.html", path: "/rezervare", title: "Rezervă o masă – Pizza Mița", h1: "Rezervă o masă" },
];

const failures = [];
const fail = (file, message) => failures.push(`${file}: ${message}`);

const decode = (s) =>
  s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
const all = (html, re) => [...html.matchAll(re)];
const attr = (tag, name) => decode(tag.match(new RegExp(`\\s${name}="([^"]*)"`, "i"))?.[1] ?? "");
const tagsOf = (html, name, key, value) =>
  all(html, new RegExp(`<${name}\\b[^>]*>`, "gi")).map((m) => m[0]).filter((t) => attr(t, key) === value);

const titles = [];
const descriptions = [];

for (const page of pages) {
  const full = join(DIST, page.file);
  if (!existsSync(full)) {
    fail(page.file, "file missing");
    continue;
  }
  const html = readFileSync(full, "utf8");
  const { file } = page;

  const titleTags = all(html, /<title>([\s\S]*?)<\/title>/gi);
  if (titleTags.length !== 1) fail(file, `expected 1 <title>, found ${titleTags.length}`);
  const title = decode(titleTags[0]?.[1] ?? "").trim();
  if (title !== page.title) fail(file, `title is "${title}", want "${page.title}"`);
  titles.push(title);

  const desc = tagsOf(html, "meta", "name", "description");
  if (desc.length !== 1) fail(file, `expected 1 meta description, found ${desc.length}`);
  const description = attr(desc[0] ?? "", "content");
  if (description.length < 70 || description.length > 160) fail(file, `meta description is ${description.length} chars, want 70–160`);
  descriptions.push(description);

  const canon = tagsOf(html, "link", "rel", "canonical");
  const wantCanon = ORIGIN + page.path;
  if (canon.length !== 1) fail(file, `expected 1 canonical, found ${canon.length}`);
  else if (attr(canon[0], "href") !== wantCanon) fail(file, `canonical is "${attr(canon[0], "href")}", want "${wantCanon}"`);

  if (!tagsOf(html, "meta", "name", "robots").some((t) => attr(t, "content").includes("noindex"))) fail(file, "noindex meta missing");

  const root = html.slice(html.indexOf('<div id="root">'));
  const h1s = all(root, /<h1\b[^>]*>([\s\S]*?)<\/h1>/gi);
  if (h1s.length !== 1) fail(file, `expected 1 <h1>, found ${h1s.length}`);
  else if (!decode(h1s[0][1].replace(/<[^>]+>/g, "")).includes(page.h1)) fail(file, `<h1> doesn't contain "${page.h1}"`);

  if (!decode(root).includes(BANNER)) fail(file, "demo banner text missing");
  if (/[şţŞŢ]/.test(html)) fail(file, "uses cedilla ş/ţ instead of comma-below ș/ț");

  if (page.menu) for (const name of MENU_ITEMS) if (!decode(root).includes(name)) fail(file, `menu item "${name}" missing from the HTML`);
}

if (new Set(titles).size !== titles.length) failures.push("titles are not unique across pages");
if (new Set(descriptions).size !== descriptions.length) failures.push("meta descriptions are not unique across pages");

if (failures.length) {
  console.error(`SEO checks failed (${failures.length}):\n- ${failures.join("\n- ")}`);
  process.exit(1);
}
console.log(`SEO checks OK (${pages.length} files)`);
