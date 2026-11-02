#!/usr/bin/env node
/**
 * Build a single ForestX client HTML file from the parts in client/parts/.
 *
 *   node scripts/build-client.mjs
 *
 * The launcher (client.html) does the same assembly in the browser, so this
 * script is only for local testing or a server-side build. The output is
 * gitignored.
 */
import { access, readFile, writeFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import path from 'node:path';

const PARTS = ['forestx3.html', 'forestx4.html', 'forestx2.html', 'forestx1.html'];
const root = process.cwd();
const partsDir = path.join(root, 'client', 'parts');
const outFile = path.join(root, 'client', 'forestx.html');

const missing = [];
for (const file of PARTS) {
  try {
    await access(path.join(partsDir, file), constants.R_OK);
  } catch {
    missing.push(file);
  }
}

if (missing.length) {
  console.error(`Missing client parts: ${missing.join(', ')}`);
  console.error(`Add them to client/parts/ and try again.`);
  process.exit(1);
}

const chunks = [];
let total = 0;
for (const file of PARTS) {
  const buf = await readFile(path.join(partsDir, file));
  chunks.push(buf);
  total += buf.length;
  console.log(`read ${file} (${(buf.length / 1024 / 1024).toFixed(1)} MB)`);
}

await writeFile(outFile, Buffer.concat(chunks));
console.log(`wrote client/forestx.html (${(total / 1024 / 1024).toFixed(1)} MB)`);
