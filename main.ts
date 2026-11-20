// News-image entry (Node 22, standard library only): the image beside this
// file is the entry, and the program copies it to /output/entry.png.
// No network, deterministic: both grader runs write the same bytes.
//
// The output directory is a mount point in the grader, so it is never
// removed itself — only its contents are emptied before the copy.

import { copyFileSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
mkdirSync(outDir, { recursive: true });
for (const name of readdirSync(outDir)) {
  rmSync(join(outDir, name), { recursive: true, force: true });
}
copyFileSync(
  new URL('./entry.png', import.meta.url),
  join(outDir, 'entry.png'),
);
