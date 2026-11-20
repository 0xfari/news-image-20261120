// News-image entry (Node 22, standard library only).
//
// The deliverable is the PNG sitting next to this file. This program
// checks it really is a PNG (non-empty, correct 8-byte signature) and
// then writes it to <out>/entry.png, where <out> comes from
// MAKEFUN_OUTPUT_DIR and defaults to the grader's /output.
//
// The output directory can be a mount point in the grader, so it is
// never deleted itself. Only whatever is already inside it is removed
// before the fresh copy is written.

import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// The PNG signature: 137 'P' 'N' 'G' CR LF SUB LF.
const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

const ENTRY_PATH = join(dirname(fileURLToPath(import.meta.url)), "entry.png");
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const OUTPUT_PATH = join(OUTPUT_DIR, "entry.png");

function die(reason: string): never {
  console.error(`main.ts: ${reason}`);
  process.exit(1);
}

function loadEntryPng(): Buffer {
  let bytes: Buffer;
  try {
    bytes = readFileSync(ENTRY_PATH);
  } catch (error) {
    die(`cannot read entry.png: ${(error as Error).message}`);
  }

  if (bytes.length === 0) {
    die("entry.png is empty");
  }

  const badByte = PNG_SIGNATURE.findIndex((expected, i) => bytes[i] !== expected);
  if (badByte !== -1) {
    die(
      `entry.png is not a PNG: byte ${badByte} is 0x${bytes[badByte].toString(16)} ` +
        `but the PNG signature needs 0x${PNG_SIGNATURE[badByte].toString(16)}`,
    );
  }

  return bytes;
}

function emptyOutputDir(dir: string): void {
  mkdirSync(dir, { recursive: true });
  for (const child of readdirSync(dir)) {
    rmSync(join(dir, child), { recursive: true, force: true });
  }
}

const png = loadEntryPng();
emptyOutputDir(OUTPUT_DIR);
writeFileSync(OUTPUT_PATH, png);
console.log(`entry.png validated (${png.length} bytes) and written to ${OUTPUT_PATH}`);
