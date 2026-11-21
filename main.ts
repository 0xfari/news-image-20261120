// news-image-20261120 v4 entry (Node 22+, standard library only).
//
// Copies the entry.png beside this file to $MAKEFUN_OUTPUT_DIR/entry.png
// (default /output) after checking it really is a PNG.
//
// Pelajaran 37: the grader's /output is a MOUNTED directory. Removing the
// directory itself throws EBUSY and fails the run, so this program only
// ever deletes what is INSIDE the output directory, never the directory.

import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

const HERE = dirname(fileURLToPath(import.meta.url));
const SOURCE = join(HERE, "entry.png");
const OUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const TARGET = join(OUT_DIR, "entry.png");

function fail(msg: string): never {
  console.error(`main.ts: ${msg}`);
  process.exit(1);
}

function readEntry(): Buffer {
  let data: Buffer;
  try {
    data = readFileSync(SOURCE);
  } catch (err) {
    fail(`cannot read ${SOURCE}: ${(err as Error).message}`);
  }
  if (data.length < PNG_MAGIC.length) {
    fail(`entry.png is ${data.length} bytes, shorter than the PNG signature`);
  }
  for (let i = 0; i < PNG_MAGIC.length; i++) {
    if (data[i] !== PNG_MAGIC[i]) {
      fail(`entry.png byte ${i} is 0x${data[i].toString(16)}, not a PNG`);
    }
  }
  // IHDR chunk: width and height are big-endian uint32 at bytes 16..24.
  // The competition caps the image at 1024x1024, so refuse anything bigger.
  if (data.length < 24 || data.toString("ascii", 12, 16) !== "IHDR") {
    fail("entry.png has no IHDR chunk where one is expected");
  }
  const width = data.readUInt32BE(16);
  const height = data.readUInt32BE(20);
  if (width > 1024 || height > 1024) {
    fail(`entry.png is ${width}x${height}, over the 1024x1024 cap`);
  }
  return data;
}

function emptyDirContents(dir: string): void {
  mkdirSync(dir, { recursive: true });
  for (const name of readdirSync(dir)) {
    rmSync(join(dir, name), { recursive: true, force: true });
  }
}

const png = readEntry();
emptyDirContents(OUT_DIR);
writeFileSync(TARGET, png);
const written = readFileSync(TARGET);
if (!written.equals(png)) {
  fail(`wrote ${written.length} bytes but entry.png is ${png.length} bytes`);
}
console.log(`entry.png OK (${png.length} bytes) -> ${TARGET}`);
