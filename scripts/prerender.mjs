// Writes a static HTML page for every route, plus sitemap.xml, robots.txt and 404.html, into dist/.
// Runs after `vite build` (client) and `vite build --ssr` (renderer into dist-ssr/), then removes dist-ssr/.
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const dist = new URL("../dist/", import.meta.url);
const ssr = new URL("../dist-ssr/", import.meta.url);

const { buildFiles } = await import(new URL("entry-server.js", ssr).href);
const template = await readFile(new URL("index.html", dist), "utf8");
const files = buildFiles(template, new Date().toISOString().slice(0, 10));

for (const { file, content } of files) {
  const out = fileURLToPath(new URL(file, dist));
  await mkdir(dirname(out), { recursive: true });
  await writeFile(out, content);
}
await rm(ssr, { recursive: true, force: true });
console.log(`Prerendered ${files.length} files into dist/`);
