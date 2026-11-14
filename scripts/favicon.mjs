// Writes public/favicon.ico from public/favicon.svg (the cat logo): PNG images at 16, 32 and 48 px
// inside an ICO container, for browsers and tools that ask for /favicon.ico by name.
// The output is committed: the Cloudflare Pages build does not run this script.
// Usage: node scripts/favicon.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const svg = readFileSync(join(root, "public", "favicon.svg"));
const SIZES = [16, 32, 48];

const pngs = await Promise.all(SIZES.map((s) => sharp(svg, { density: 384 }).resize(s, s).png().toBuffer()));

// ICONDIR (6 bytes), one ICONDIRENTRY (16 bytes) per image, then the PNG data. PNG-in-ICO is valid since Windows Vista.
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type: icon
header.writeUInt16LE(SIZES.length, 4);
let offset = 6 + 16 * SIZES.length;
const entries = SIZES.map((size, i) => {
  const e = Buffer.alloc(16);
  e.writeUInt8(size, 0); // width
  e.writeUInt8(size, 1); // height
  e.writeUInt8(0, 2); // no palette
  e.writeUInt8(0, 3); // reserved
  e.writeUInt16LE(1, 4); // colour planes
  e.writeUInt16LE(32, 6); // bits per pixel
  e.writeUInt32LE(pngs[i].length, 8);
  e.writeUInt32LE(offset, 12);
  offset += pngs[i].length;
  return e;
});
writeFileSync(join(root, "public", "favicon.ico"), Buffer.concat([header, ...entries, ...pngs]));
console.log(`wrote public/favicon.ico (${SIZES.join(", ")} px)`);
