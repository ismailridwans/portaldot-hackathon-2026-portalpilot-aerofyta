// One-off: rasterize the SVG logo to PNGs for places that need a raster image
// (e.g. DoraHacks BUIDL logo upload). Run: node scripts/svg2png.mjs
import sharp from "sharp";
import { readFileSync } from "node:fs";

const svg = readFileSync("docs/logo.svg");
for (const size of [512, 1024]) {
  await sharp(svg, { density: 512 }).resize(size, size).png().toFile(`docs/logo-${size}.png`);
  console.log(`wrote docs/logo-${size}.png`);
}
