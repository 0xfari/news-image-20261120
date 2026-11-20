// news-image-20261120 v3 entry (Node 22+, standard library only).
//
// Reads the entry.png next to this file, checks it really is a PNG,
// and writes the identical bytes to $MAKEFUN_OUTPUT_DIR/entry.png
// (default /output).
//
// Pelajaran 37: the grader's /output is a MOUNTED directory. Removing
// the directory itself throws EBUSY and fails the run, so this program
// only ever deletes what is INSIDE the output directory, never the
// directory. It also never uses copyFileSync: the PNG is validated
// first, then written from the buffer that passed validation.

import { mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// The 8-byte PNG signature: 137 'P' 'N' 'G' CR LF SUB LF.
const SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const PNG_PATH = join(SCRIPT_DIR, "entry.png");
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const OUTPUT_PATH = join(OUTPUT_DIR, "entry.png");

function die(reason: string): never {
  console.error(`main.ts: ${reason}`);
  process.exit(1);
}

// Byte-by-byte signature check; names the first mismatching index.
function checkPngSignature(bytes: Buffer): void {
  if (bytes.length < SIGNATURE.length) {
    die(`entry.png is only ${bytes.length} bytes, shorter than the 8-byte PNG signature`);
  }
  for (let index = 0; index < SIGNATURE.length; index++) {
    if (bytes[index] !== SIGNATURE[index]) {
      die(
        `entry.png is not a PNG: byte ${index} is 0x${bytes[index].toString(16).padStart(2, "0")}, ` +
          `expected 0x${SIGNATURE[index].toString(16).padStart(2, "0")}`,
      );
    }
  }
}

function loadPng(): Buffer {
  let bytes: Buffer;
  try {
    bytes = readFileSync(PNG_PATH);
  } catch (error) {
    return die(`cannot read ${PNG_PATH}: ${(error as Error).message}`);
  }
  checkPngSignature(bytes);
  return bytes;
}

// Creates the output dir if missing, then deletes only its CONTENTS.
// The directory itself is never removed: in the grader it is a mount
// point, and removing a mount point throws EBUSY.
function prepareOutputDir(dir: string): void {
  mkdirSync(dir, { recursive: true });
  for (const name of readdirSync(dir)) {
    rmSync(join(dir, name), { recursive: true, force: true });
  }
}

const png = loadPng();
prepareOutputDir(OUTPUT_DIR);
writeFileSync(OUTPUT_PATH, png);
const outSize = statSync(OUTPUT_PATH).size;
if (outSize !== png.length) {
  die(`wrote ${outSize} bytes but entry.png is ${png.length} bytes`);
}
console.log(`entry.png OK (${png.length} bytes) -> ${OUTPUT_PATH}`);
