// Checks the built site the way a crawler that doesn't run JavaScript sees it.
// Runs at the end of `npm run build`, so a regression fails the deploy.
// The expectations are written out here on purpose, so this check doesn't trust the code it checks.
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const DIST = "dist";
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const ORIGIN = "https://pizza-mita.pages.dev";
const BANNER = "Site demonstrativ realizat de Quality Zone";
const MENU_ITEMS = [
  "Margherita", "Quattro Stagioni", "Diavola", "Țărănească", "Salami", "Pepperoni",
  "Spaghete Bolognese", "Spaghete Pomodoro",
  "Papanași cu smântână", "Tiramisu",
  "Limonadă de casă", "Suc de portocale", "Bere la draft",
];

const RESTAURANT_FIELDS = [
  "name", "url", "address", "telephone", "openingHoursSpecification", "servesCuisine", "priceRange", "hasMenu", "image",
];

const pages = [
  { file: "index.html", path: "/", jsonLd: true, title: "Pizza Mița – pizzerie în Orașul Demo (site demonstrativ)", h1: "Pizza Mița" },
  { file: "meniu.html", path: "/meniu", jsonLd: true, title: "Meniu – Pizza Mița", h1: "Meniu", menu: true },
  { file: "rezervare.html", path: "/rezervare", title: "Rezervă o masă – Pizza Mița", h1: "Rezervă o masă" },
];

// The audit report, in Romanian and English. It keeps every site rule (banner, noindex, one H1) and has no structured data.
const reportPages = [
  { file: "raport.html", path: "/raport", lang: "ro", title: "Raportul auditului – Pizza Mița", h1: "Raportul auditului" },
  { file: "raport/en.html", path: "/raport/en", lang: "en", title: "Audit report – Pizza Mița", h1: "Audit report" },
];

// The after run's Observatory grade, read from its summary.json: the report must show it, which shows its numbers come from the data.
const reportRun = JSON.parse(readFileSync(join(ROOT, "audit", "report-run.json"), "utf8"));
const afterSummary = JSON.parse(readFileSync(join(ROOT, "audit", "runs", reportRun.after, "summary.json"), "utf8"));
const afterGrade = afterSummary.security.observatory.grade;

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

const read = (file) => {
  const full = join(DIST, file);
  if (!existsSync(full)) {
    fail(file, "file missing");
    return null;
  }
  return readFileSync(full, "utf8");
};

// What every built file must have, including the 404 page: language, title, a description of the right length,
// noindex, exactly one H1, the demo banner and no cedilla letters. `page.canonical` is null where there must be none.
function checkCommon(page, html) {
  const { file } = page;
  const root = html.slice(html.indexOf('<div id="root">'));

  const lang = page.lang ?? "ro";
  if (html.match(/<html\b[^>]*\blang="([^"]*)"/)?.[1] !== lang) fail(file, `<html lang> isn't "${lang}"`);

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
  if (page.canonical === null) {
    if (canon.length) fail(file, "has a canonical link");
  } else if (canon.length !== 1) fail(file, `expected 1 canonical, found ${canon.length}`);
  else if (attr(canon[0], "href") !== page.canonical) fail(file, `canonical is "${attr(canon[0], "href")}", want "${page.canonical}"`);

  if (!tagsOf(html, "meta", "name", "robots").some((t) => attr(t, "content").includes("noindex"))) fail(file, "noindex meta missing");

  const h1s = all(root, /<h1\b[^>]*>([\s\S]*?)<\/h1>/gi);
  if (h1s.length !== 1) fail(file, `expected 1 <h1>, found ${h1s.length}`);
  else if (!decode(h1s[0][1].replace(/<[^>]+>/g, "")).includes(page.h1)) fail(file, `<h1> doesn't contain "${page.h1}"`);

  if (!decode(root).includes(BANNER)) fail(file, "demo banner text missing");
  if (/[şţŞŢ]/.test(html)) fail(file, "uses cedilla ş/ţ instead of comma-below ș/ț");

  // A favicon, so browsers and Lighthouse don't log a 404 for /favicon.ico on every page.
  const icons = all(html, /<link\b[^>]*>/gi).map((m) => m[0]).filter((t) => attr(t, "rel") === "icon").map((t) => attr(t, "href"));
  for (const href of ["/favicon.ico", "/favicon.svg"]) {
    if (!icons.includes(href)) fail(file, `no <link rel="icon" href="${href}">`);
    else if (!existsSync(join(DIST, href))) fail(file, `links ${href}, which isn't in ${DIST}`);
  }

  // The strict CSP (public/_headers) blocks style attributes, inline <style> and inline scripts other than JSON-LD.
  if (/<[a-z][^>]*\sstyle=/i.test(html)) fail(file, "has a style attribute, which the CSP blocks");
  if (/<style\b/i.test(html)) fail(file, "has an inline <style>, which the CSP blocks");
  for (const [tag] of all(html, /<script\b[^>]*>/gi)) {
    if (!/\ssrc=/.test(tag) && !/type="application\/ld\+json"/.test(tag)) fail(file, `has an inline script the CSP blocks: ${tag}`);
  }
  return root;
}

for (const page of pages) {
  const html = read(page.file);
  if (html === null) continue;
  const { file } = page;
  const root = checkCommon({ ...page, canonical: ORIGIN + page.path }, html);

  const blocks = all(html, /<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi).map((m) => m[1]);
  if (!page.jsonLd) {
    if (blocks.length) fail(file, "has structured data, want none on this page");
  } else if (blocks.length !== 1) {
    fail(file, `expected 1 JSON-LD block, found ${blocks.length}`);
  } else {
    try {
      const data = JSON.parse(blocks[0]);
      if (data["@type"] !== "Restaurant") fail(file, `JSON-LD @type is "${data["@type"]}", want Restaurant`);
      const missing = RESTAURANT_FIELDS.filter((f) => !data[f] || (Array.isArray(data[f]) && !data[f].length));
      if (missing.length) fail(file, `JSON-LD is missing: ${missing.join(", ")}`);
      for (const banned of ["geo", "aggregateRating", "review"]) if (banned in data) fail(file, `JSON-LD has "${banned}"`);
      if (data.openingHoursSpecification?.length !== 6) fail(file, "JSON-LD should list 6 opening days");
      if (data.url !== ORIGIN + "/" || data.hasMenu !== ORIGIN + "/meniu") fail(file, "JSON-LD url or hasMenu is wrong");
      const address = data.address ?? {};
      if (
        address["@type"] !== "PostalAddress" ||
        address.streetAddress !== "Strada Exemplului 0" ||
        address.addressLocality !== "Orașul Demo" ||
        address.addressCountry !== "RO"
      )
        fail(file, `JSON-LD address is ${JSON.stringify(address)}, want Strada Exemplului 0, Orașul Demo, RO`);
      if (data.telephone !== "0000000000") fail(file, `JSON-LD telephone is "${data.telephone}", want "0000000000"`);
      if (data.servesCuisine !== "Pizza" || data.priceRange !== "25–55 lei") fail(file, "JSON-LD servesCuisine or priceRange is wrong");
    } catch (e) {
      fail(file, `invalid JSON-LD: ${e.message}`);
    }
  }

  if (page.menu) for (const name of MENU_ITEMS) if (!decode(root).includes(name)) fail(file, `menu item "${name}" missing from the HTML`);
}

for (const page of reportPages) {
  const html = read(page.file);
  if (html === null) continue;
  const root = checkCommon({ ...page, canonical: ORIGIN + page.path }, html);
  if (/application\/ld\+json/.test(html)) fail(page.file, "has structured data, want none on the report");
  // As the whole text of an element (a table cell, a figure), not just somewhere in a sentence.
  const shown = new RegExp(`>\\s*${afterGrade.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*<`);
  if (!shown.test(decode(root))) fail(page.file, `doesn't show the after run's Observatory grade "${afterGrade}" from ${reportRun.after}/summary.json`);
}

// The page Cloudflare Pages serves, with a 404 status, for any path that has no file.
{
  const html = read("404.html");
  if (html !== null) {
    const root = checkCommon({ file: "404.html", title: "Pagina nu există – Pizza Mița", h1: "Pagina nu există", canonical: null }, html);
    if (/application\/ld\+json/.test(html)) fail("404.html", "has structured data");
    if (!/<a\b[^>]*\shref="\/"/.test(root.slice(root.indexOf("<main")))) fail("404.html", "no link back to the home page");
  }
}

if (new Set(titles).size !== titles.length) failures.push("titles are not unique across pages");
if (new Set(descriptions).size !== descriptions.length) failures.push("meta descriptions are not unique across pages");

if (failures.length) {
  console.error(`SEO checks failed (${failures.length}):\n- ${failures.join("\n- ")}`);
  process.exit(1);
}
console.log(`SEO checks OK (${pages.length + reportPages.length + 1} files)`);
