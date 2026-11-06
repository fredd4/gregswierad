/**
 * Fails the build if any prerendered page would reach a crawler without its content:
 * too little visible text, a missing or duplicate <title>, a wrong canonical, missing
 * hreflang, or JSON-LD that doesn't parse. Run with `npm run verify` (also part of build).
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIST = path.join(ROOT, "dist");
const { ROUTES, absoluteUrl } = await import(pathToFileURL(path.join(ROOT, "dist-ssr", "entry-server.js")).href);

// The listener-gift page is a short form by design; every other page must carry real copy.
const minWords = (route) => (route.page === "listeners" ? 80 : 150);
const errors = [];
const titles = new Map();

const visibleText = (html) =>
  html
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z#0-9]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

for (const route of ROUTES) {
  const file = path.join(DIST, route.path === "/" ? "index.html" : `${route.path.slice(1)}.html`);
  const html = await fs.readFile(file, "utf8").catch(() => null);
  const where = `${route.path} (${path.relative(ROOT, file)})`;
  if (!html) {
    errors.push(`${where}: file missing`);
    continue;
  }

  const body = html.slice(html.indexOf("<body"));
  const words = visibleText(body).split(" ").length;
  if (words < minWords(route)) errors.push(`${where}: only ${words} visible words in <body>`);
  if (!body.includes("Greg Swierad") && !body.includes("Greg Świerad")) errors.push(`${where}: body never names Greg`);

  const title = html.match(/<title>([^<]*)<\/title>/)?.[1];
  if (!title) errors.push(`${where}: no <title>`);
  else if (titles.has(title)) errors.push(`${where}: same <title> as ${titles.get(title)}`);
  else titles.set(title, route.path);

  if ((html.match(/<title>/g) ?? []).length !== 1) errors.push(`${where}: expected exactly one <title>`);
  if (!html.includes(`<html lang="${route.lang}">`)) errors.push(`${where}: <html lang> is not ${route.lang}`);
  if (!html.includes(`<link rel="canonical" href="${absoluteUrl(route.path)}" />`)) errors.push(`${where}: wrong or missing canonical`);
  for (const lang of Object.keys(route.alternates)) {
    if (!html.includes(`hreflang="${lang}"`)) errors.push(`${where}: no hreflang="${lang}"`);
  }

  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  if (blocks.length === 0) errors.push(`${where}: no JSON-LD`);
  for (const [, json] of blocks) {
    try {
      JSON.parse(json);
    } catch (error) {
      errors.push(`${where}: JSON-LD does not parse (${error.message})`);
    }
  }
}

for (const file of ["404.html", "sitemap.xml", "robots.txt", "llms.txt"]) {
  await fs.access(path.join(DIST, file)).catch(() => errors.push(`dist/${file} is missing`));
}

if (errors.length) {
  console.error(`verify-prerender: ${errors.length} problem(s)\n- ${errors.join("\n- ")}`);
  process.exit(1);
}
console.log(`verify-prerender: ${ROUTES.length} pages OK (text, title, canonical, hreflang, JSON-LD), plus 404, sitemap, robots and llms.txt`);
