/**
 * Static prerender. Runs after the client build (dist/) and the SSR build (dist-ssr/).
 *
 * For every route in src/content/routes.ts it renders the React page to HTML and writes
 * it, with that page's own <head>, into a copy of dist/index.html. Crawlers and AI
 * assistants that don't run JavaScript (OAI-SearchBot, GPTBot, PerplexityBot, ClaudeBot)
 * then read the full page text; in the browser React hydrates the same markup.
 *
 * Also writes dist/404.html (Cloudflare Pages serves it for unknown paths, with a 404
 * status) and dist/sitemap.xml with hreflang alternates.
 *
 * Files are `<route>.html`, not `<route>/index.html`: Cloudflare Pages serves
 * dist/podcast.html at /podcast, while a folder index would force /podcast/.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIST = path.join(ROOT, "dist");
const HEAD_START = "<!--app-head-start-->";
const HEAD_END = "<!--app-head-end-->";
const ROOT_DIV = '<div id="root"></div>';

const { render, ROUTES, NOT_FOUND_ROUTE, absoluteUrl } = await import(pathToFileURL(path.join(ROOT, "dist-ssr", "entry-server.js")).href);

// dist/index.html is both the template and the output for "/", so empty it first to keep re-runs idempotent.
const template = (await fs.readFile(path.join(DIST, "index.html"), "utf8")).replace(
  /<div id="root">[\s\S]*?<\/div>(?=\s*<\/body>)/,
  ROOT_DIV,
);
if (!template.includes(ROOT_DIV) || !template.includes(HEAD_START) || !template.includes(HEAD_END)) {
  throw new Error("dist/index.html is missing the root div or the app-head markers.");
}

function documentFor(route) {
  const { html, head } = render(route);
  if (!html.trim()) throw new Error(`Empty markup for ${route.path}`);
  const start = template.indexOf(HEAD_START) + HEAD_START.length;
  const end = template.indexOf(HEAD_END);
  return (template.slice(0, start) + `\n${head}\n    ` + template.slice(end))
    .replace(/<html lang="[^"]*">/, `<html lang="${route.lang}">`)
    // A function replacer, so "$" in page copy is never read as a replacement pattern.
    .replace(ROOT_DIV, () => `<div id="root">${html}</div>`);
}

const fileFor = (routePath) => (routePath === "/" ? "index.html" : `${routePath.slice(1)}.html`);

async function write(relative, contents) {
  const file = path.join(DIST, relative);
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, contents, "utf8");
}

for (const route of ROUTES) {
  const html = documentFor(route);
  await write(fileFor(route.path), html);
  console.log(`prerendered ${route.path.padEnd(42)} [${route.lang}] ${(html.length / 1024).toFixed(1)} KB`);
}
await write("404.html", documentFor(NOT_FOUND_ROUTE));
console.log("prerendered 404.html");

const today = new Date().toISOString().slice(0, 10);
const priority = { home: "1.0", podcast: "0.9", topic: "0.8", listeners: "0.5" };
const urls = ROUTES.map((route) => {
  const alternates = Object.entries(route.alternates)
    .map(([lang, href]) => `    <xhtml:link rel="alternate" hreflang="${lang}" href="${absoluteUrl(href)}" />`)
    .concat(`    <xhtml:link rel="alternate" hreflang="x-default" href="${absoluteUrl(route.alternates.en)}" />`)
    .join("\n");
  return `  <url>\n    <loc>${absoluteUrl(route.path)}</loc>\n    <lastmod>${today}</lastmod>\n    <priority>${priority[route.page]}</priority>\n${alternates}\n  </url>`;
});
await write(
  "sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join("\n")}\n</urlset>\n`,
);
console.log(`sitemap.xml: ${ROUTES.length} URLs`);
