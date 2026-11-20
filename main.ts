// News-image entry (Node 22, standard library only): the image beside this
// file is the entry, and the program copies it to /output/entry.png.
// No network, deterministic: both grader runs write the same bytes.
//
// The output directory is a mount point in the grader, so it is never
// removed itself — only its contents are emptied before the copy.

import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

// PNG signature: the first 8 bytes of every valid PNG file.
const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

// Read the entry image first and validate it is a real, non-empty PNG
// before anything is written to /output — a corrupt or truncated file
// must fail loudly instead of being submitted as the entry.
const entryPath = new URL('./entry.png', import.meta.url);
let image;
try {
  image = readFileSync(entryPath);
} catch (err) {
  console.error(`entry.png could not be read: ${(err as Error).message}`);
  process.exit(1);
}
if (image.length === 0 || !image.subarray(0, 8).equals(PNG_MAGIC)) {
  console.error(
    `entry.png is not a valid PNG (size ${image.length} bytes, bad or missing PNG magic)`,
  );
  process.exit(1);
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
mkdirSync(outDir, { recursive: true });
for (const name of readdirSync(outDir)) {
  rmSync(join(outDir, name), { recursive: true, force: true });
}
writeFileSync(join(outDir, 'entry.png'), image);
console.log(`entry.png copied to ${outDir} (${image.length} bytes, valid PNG)`);
