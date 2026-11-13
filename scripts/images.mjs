// Turns each original photo in public/img/ into AVIF and WebP copies at a few widths, and writes the
// original sizes to src/content/image-sizes.json so the page can reserve the space before the photo loads.
// The generated files are committed: the Cloudflare Pages build does not run this script.
// Usage: node scripts/images.mjs
import { mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, parse } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const imgDir = join(root, "public", "img");
const sizesFile = join(root, "src", "content", "image-sizes.json");

const MENU_WIDTHS = [200, 400, 800];
const HERO_WIDTHS = [640, 1280, 1920];

const sizes = {};
const originals = readdirSync(imgDir).filter((f) => /\.jpe?g$/i.test(f)).sort();

for (const file of originals) {
  const { name } = parse(file);
  const source = join(imgDir, file);
  const { width, height } = await sharp(source).metadata();
  sizes[name] = { width, height };
  const isHero = name.startsWith("hero-");
  const widths = isHero ? HERO_WIDTHS : MENU_WIDTHS;
  for (const w of widths) {
    // The menu cards show a square crop from the middle (object-cover), so the menu copies are cut the same way
    // and a tall photo is not sent in full just to be cropped by the browser. The hero keeps its shape.
    const resized = () =>
      sharp(source).rotate().resize(isHero ? { width: w, withoutEnlargement: true } : { width: w, height: w, fit: "cover" });
    await resized().avif({ quality: 50, effort: 4 }).toFile(join(imgDir, `${name}-${w}.avif`));
    await resized().webp({ quality: 74 }).toFile(join(imgDir, `${name}-${w}.webp`));
  }
  console.log(`${name}: ${width}x${height} -> ${widths.join(", ")}`);
}

mkdirSync(dirname(sizesFile), { recursive: true });
writeFileSync(sizesFile, `${JSON.stringify(sizes, null, 2)}\n`);
