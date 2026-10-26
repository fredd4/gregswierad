// Writes dist/<route>.html for each subpage with its own title, description and
// canonical URL, so link previews and crawlers see the right page before JS runs.
// Cloudflare Pages serves dist/podcast.html at /podcast (a folder with index.html would
// force a redirect to /podcast/ instead).
import fs from "node:fs";
import path from "node:path";

const DIST = path.resolve("dist");
const SITE = "https://gregswierad.com";
const base = fs.readFileSync(path.join(DIST, "index.html"), "utf8");

const routes = [
  {
    path: "/podcast",
    lang: "en",
    title: "Greg Swierad | Media kit for podcast hosts",
    description:
      "Bio, photos, topics and sample questions for podcast hosts. Greg Swierad, founder of Subida AI and Mentorist, talks about app growth, A/B testing and building with AI agents.",
  },
  {
    path: "/listeners",
    lang: "en",
    title: "Greg Swierad | A gift for podcast listeners",
    description: "A free month of Naralingo and a Mentorist subscription for listeners of the podcasts Greg Swierad appears on.",
  },
  {
    path: "/dla-sluchaczy",
    lang: "pl",
    title: "Greg Swierad | Prezent dla słuchaczy podcastów",
    description: "Miesiąc Naralingo za darmo i subskrypcja Mentorista dla słuchaczy podcastów, w których występuje Greg Swierad.",
  },
  {
    path: "/oyentes",
    lang: "es",
    title: "Greg Swierad | Un regalo para quienes escuchan el podcast",
    description: "Un mes gratis de Naralingo y una suscripción a Mentorist para quienes escuchan los podcasts en los que participa Greg Swierad.",
  },
];

const escape = (value) => value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

for (const route of routes) {
  const url = `${SITE}${route.path}`;
  const title = escape(route.title);
  const description = escape(route.description);
  const html = base
    .replace(/<html lang="[^"]*">/, `<html lang="${route.lang}">`)
    .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
    .replace(/(<meta name="description" content=")[^"]*/, `$1${description}`)
    .replace(/(<link rel="canonical" href=")[^"]*/, `$1${url}`)
    .replace(/(<meta property="og:url" content=")[^"]*/, `$1${url}`)
    .replace(/(<meta property="og:title" content=")[^"]*/, `$1${title}`)
    .replace(/(<meta name="twitter:title" content=")[^"]*/, `$1${title}`)
    .replace(/(<meta property="og:description" content=")[^"]*/, `$1${description}`)
    .replace(/(<meta name="twitter:description" content=")[^"]*/, `$1${description}`);

  fs.writeFileSync(path.join(DIST, `${route.path.slice(1)}.html`), html);
  console.log(`route page: ${route.path}`);
}
