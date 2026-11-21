// Front-page entry point for the 20 November 2026 news-image round.
//
// The grader runs this file with Node 22 and expects exactly one file
// in the output directory: a copy of the front-page image shipped
// next to this script.
//
// Two properties of the grading sandbox shape the code below:
//  * the output directory is a mount point, so the program may delete
//    what is inside it but must never delete the directory itself;
//  * there is no network, so the image must already be on disk.

import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const IMAGE_FILE = "entry.png";
const OUTPUT_DIR = process.env["MAKEFUN_OUTPUT_DIR"] ?? "/output";
const MAX_EDGE_PX = 1024;
const MAX_IMAGE_BYTES = 1024 * 1024;

// First eight bytes of every PNG; the IHDR chunk tag sits at offset 12
// and width/height follow as big-endian uint32 at offsets 16 and 20.
const SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

function abort(message: string): never {
  throw new Error(message);
}

function readImage(): { bytes: Buffer; width: number; height: number } {
  const location = new URL(`./${IMAGE_FILE}`, import.meta.url);
  let bytes: Buffer;
  try {
    bytes = readFileSync(location);
  } catch (error) {
    abort(`cannot read ${IMAGE_FILE}: ${(error as Error).message}`);
  }
  if (bytes.length > MAX_IMAGE_BYTES) {
    abort(`${IMAGE_FILE} is ${bytes.length} bytes, above the ${MAX_IMAGE_BYTES} byte cap`);
  }
  if (bytes.length < 24 || !bytes.subarray(0, 8).equals(SIGNATURE)) {
    abort(`${IMAGE_FILE} does not start with the PNG signature`);
  }
  if (bytes.toString("ascii", 12, 16) !== "IHDR") {
    abort(`${IMAGE_FILE} has no IHDR chunk at offset 12`);
  }
  const width = bytes.readUInt32BE(16);
  const height = bytes.readUInt32BE(20);
  if (width > MAX_EDGE_PX || height > MAX_EDGE_PX) {
    abort(`${IMAGE_FILE} is ${width}x${height}, above the ${MAX_EDGE_PX}x${MAX_EDGE_PX} cap`);
  }
  // A well-formed PNG ends with a 12-byte IEND chunk (zero length,
  // tag "IEND", CRC). Refuse a file that is truncated mid-stream.
  if (
    bytes.length < 36 ||
    bytes.readUInt32BE(bytes.length - 12) !== 0 ||
    bytes.toString("ascii", bytes.length - 8, bytes.length - 4) !== "IEND"
  ) {
    abort(`${IMAGE_FILE} has no IEND trailer — the file looks truncated`);
  }
  return { bytes, width, height };
}

function emptyDirectory(path: string): void {
  mkdirSync(path, { recursive: true });
  for (const entry of readdirSync(path)) {
    rmSync(join(path, entry), { force: true, recursive: true });
  }
}

function publish(bytes: Buffer): void {
  const destination = join(OUTPUT_DIR, IMAGE_FILE);
  writeFileSync(destination, bytes);
  const back = readFileSync(destination);
  if (back.length !== bytes.length || !back.equals(bytes)) {
    abort(`verification failed: ${destination} differs from ${IMAGE_FILE}`);
  }
}

function main(): void {
  const { bytes, width, height } = readImage();
  emptyDirectory(OUTPUT_DIR);
  publish(bytes);
  console.log(`wrote ${IMAGE_FILE} (${width}x${height}, ${bytes.length} bytes) to ${OUTPUT_DIR}`);
}

try {
  main();
} catch (error) {
  console.error(`main.ts: ${(error as Error).message}`);
  process.exit(1);
}
