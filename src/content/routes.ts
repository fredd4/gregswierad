import { LANGS, LISTENERS_PATHS, type Lang } from "./site";

/**
 * Every page of the site, in every language. The browser app, the prerender script
 * and the sitemap all read this list, so a page added here is built, linked and
 * listed everywhere.
 *
 * English lives at the root ("/", "/podcast"); Polish and Spanish get a prefix
 * ("/pl", "/es/podcast"). The listener-gift pages keep their own spoken-on-air URLs.
 */

export const SITE_URL = "https://gregswierad.com";

/** One slug per podcast topic, in the same order as `topics.items` in the locale files. */
export const TOPIC_SLUGS = [
  "ab-testing",
  "growing-a-subscription-app",
  "building-with-ai-agents",
  "startup-turnaround",
  "paid-ads-that-pay-back",
  "product-design-and-marketing",
] as const;

export type TopicSlug = (typeof TOPIC_SLUGS)[number];

export type PageId = "home" | "podcast" | "listeners" | "topic" | "notFound";

export type Route = {
  path: string;
  lang: Lang;
  page: PageId;
  /** Set on topic pages. */
  topic?: TopicSlug;
  /** The same page in each language (used for hreflang and the language switcher). */
  alternates: Record<Lang, string>;
};

const prefix = (lang: Lang) => (lang === "en" ? "" : `/${lang}`);

export const homePath = (lang: Lang) => prefix(lang) || "/";
export const podcastPath = (lang: Lang) => `${prefix(lang)}/podcast`;
export const listenersPath = (lang: Lang) => LISTENERS_PATHS[lang];
export const topicPath = (lang: Lang, slug: TopicSlug) => `${prefix(lang)}/topics/${slug}`;

const byLang = (build: (lang: Lang) => string) =>
  Object.fromEntries(LANGS.map((lang) => [lang, build(lang)])) as Record<Lang, string>;

function buildRoutes(): Route[] {
  const routes: Route[] = [];
  const add = (page: PageId, build: (lang: Lang) => string, topic?: TopicSlug) => {
    const alternates = byLang(build);
    for (const lang of LANGS) routes.push({ path: alternates[lang], lang, page, topic, alternates });
  };

  add("home", homePath);
  add("podcast", podcastPath);
  for (const slug of TOPIC_SLUGS) add("topic", (lang) => topicPath(lang, slug), slug);
  add("listeners", listenersPath);
  return routes;
}

export const ROUTES: Route[] = buildRoutes();

export const NOT_FOUND_ROUTE: Route = {
  path: "/404",
  lang: "en",
  page: "notFound",
  alternates: { en: "/", pl: "/pl", es: "/es" },
};

const normalise = (path: string) => (path.length > 1 ? path.replace(/\/+$/, "") : path) || "/";

export function matchRoute(pathname: string): Route | null {
  const path = normalise(pathname);
  return ROUTES.find((route) => route.path === path) ?? null;
}

export const absoluteUrl = (path: string) => `${SITE_URL}${path === "/" ? "/" : path}`;
