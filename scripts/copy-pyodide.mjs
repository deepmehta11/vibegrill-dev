// Copies the Pyodide runtime + the pytest wheel set from node_modules/pyodide
// into public/pyodide so the browser worker can load Python fully same-origin
// (no CDN, no CORS, works offline and identically on Cloudflare). Regenerated
// by predev/prebuild; public/pyodide is gitignored.

import { readdirSync, mkdirSync, copyFileSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";

const SRC = join(process.cwd(), "node_modules", "pyodide");
const DEST = join(process.cwd(), "public", "pyodide");

const CORE = [
  "pyodide.js",
  "pyodide.mjs",
  "pyodide.asm.mjs",
  "pyodide.asm.wasm",
  "python_stdlib.zip",
  "pyodide-lock.json",
];

function main() {
  if (!existsSync(SRC)) {
    throw new Error("node_modules/pyodide not found — run npm install");
  }
  mkdirSync(DEST, { recursive: true });

  const wheels = readdirSync(SRC).filter((f) => f.endsWith(".whl"));
  const files = [...CORE, ...wheels];

  let copied = 0;
  let bytes = 0;
  for (const name of files) {
    const from = join(SRC, name);
    if (!existsSync(from)) {
      if (CORE.includes(name)) throw new Error(`Missing required pyodide file: ${name}`);
      continue;
    }
    copyFileSync(from, join(DEST, name));
    bytes += statSync(from).size;
    copied++;
  }
  console.log(
    `Copied ${copied} pyodide files (${(bytes / 1e6).toFixed(1)} MB) to public/pyodide`
  );
}

main();
