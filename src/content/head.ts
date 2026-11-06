import i18n from "@/i18n";
import { absoluteUrl, homePath, podcastPath, SITE_URL, TOPIC_SLUGS, topicPath, type Route } from "./routes";
import { LANGS, LINKEDIN_URL, MENTORIST_URL, SUBIDA_URLS, type Lang } from "./site";

/**
 * Per-page <head>: title, description, canonical, hreflang, Open Graph and JSON-LD.
 * Written into each prerendered HTML file (scripts/prerender.mjs), so crawlers and AI
 * assistants read the right facts without running JavaScript.
 */

type Faq = { q: string; a: string };
type Topic = { title: string; hook: string; points: string[] };
type TopicPage = { summary: string; why: string[]; fit: string; questions: string[]; faq: Faq[] };

const OG_IMAGE = `${SITE_URL}/images/og.jpg`;
const PERSON_IMAGE = `${SITE_URL}/media/greg-swierad-ags-barcelona-2024.jpg`;
const PERSON_ID = `${SITE_URL}/#person`;
const WEBSITE_ID = `${SITE_URL}/#website`;
const SUBIDA_ID = "https://subida.ai/#organization";
const MENTORIST_ID = `${SITE_URL}/#mentorist`;

const OG_LOCALE: Record<Lang, string> = { en: "en_US", pl: "pl_PL", es: "es_ES" };

const escapeHtml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** JSON for a <script> block: `<` is escaped so text can never close the tag. */
const jsonLd = (data: unknown) => `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, "\\u003c")}</script>`;

const firstSentence = (text: string) => {
  const match = text.match(/^.+?[.!?](?=\s|$)/);
  return (match ? match[0] : text).trim();
};

function t<T = string>(key: string, lang: Lang): T {
  return i18n.t(key, { lng: lang, returnObjects: true }) as T;
}

function personNode(lang: Lang) {
  return {
    "@type": "Person",
    "@id": PERSON_ID,
    name: "Greg Swierad",
    alternateName: ["Grzegorz Świerad", "Grzegorz Swierad", "Greg Świerad"],
    givenName: "Grzegorz",
    familyName: "Świerad",
    url: `${SITE_URL}/`,
    image: PERSON_IMAGE,
    jobTitle: "Founder of Subida AI",
    description: t("podcast.bio.short", lang),
    nationality: { "@type": "Country", name: "Poland" },
    worksFor: { "@id": SUBIDA_ID },
    knowsAbout: [
      "Mobile app development",
      "Mobile app growth",
      "Subscription apps",
      "A/B testing",
      "Conversion rate optimization",
      "Product design",
      "Performance marketing",
      "Meta (Facebook) Ads",
      "Building products with AI agents",
      "Startup turnaround",
    ],
    knowsLanguage: ["pl", "en"],
    award: ["1st place, HackYeah 2025"],
    sameAs: [LINKEDIN_URL, "https://fractio.pl/eksperci/grzegorz-swierad"],
  };
}

function organizationNodes() {
  return [
    {
      "@type": "Organization",
      "@id": SUBIDA_ID,
      name: "Subida AI",
      url: SUBIDA_URLS.home.en,
      description: "Mobile app studio based in Poland: product design, development and marketing of iOS and Android apps.",
      founder: { "@id": PERSON_ID },
    },
    {
      "@type": "SoftwareApplication",
      "@id": MENTORIST_ID,
      name: "Mentorist",
      url: MENTORIST_URL,
      applicationCategory: "EducationalApplication",
      operatingSystem: "iOS, Android",
      description: "An app that helps people apply what they read in books: one small, doable step a day. 500k+ users.",
      creator: { "@id": PERSON_ID },
    },
  ];
}

function websiteNode() {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: `${SITE_URL}/`,
    name: "Greg Swierad",
    inLanguage: [...LANGS],
    publisher: { "@id": PERSON_ID },
    about: { "@id": PERSON_ID },
  };
}

const faqNode = (url: string, items: Faq[]) => ({
  "@type": "FAQPage",
  "@id": `${url}#faq`,
  mainEntity: items.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
});

const breadcrumbNode = (url: string, items: Array<{ name: string; url: string }>) => ({
  "@type": "BreadcrumbList",
  "@id": `${url}#breadcrumb`,
  itemListElement: items.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.name, item: item.url })),
});

export function pageMeta(route: Route): { title: string; description: string } {
  const lang = route.lang;
  if (route.page === "topic" && route.topic) {
    const index = TOPIC_SLUGS.indexOf(route.topic);
    const topic = t<Topic[]>("topics.items", lang)[index];
    const page = t<TopicPage[]>("topicPages.items", lang)[index];
    return { title: `${topic.title} | Greg Swierad`, description: firstSentence(page.summary) };
  }
  const key = route.page === "notFound" ? "notFound" : route.page;
  return { title: t(`meta.${key}.title`, lang), description: t(`meta.${key}.description`, lang) };
}

function structuredData(route: Route, title: string, description: string) {
  const lang = route.lang;
  const url = absoluteUrl(route.path);
  const homeUrl = absoluteUrl(homePath(lang));
  const graph: unknown[] = [personNode(lang), ...organizationNodes(), websiteNode()];

  const webPage = (type: string, extra: Record<string, unknown> = {}) => ({
    "@type": type,
    "@id": `${url}#webpage`,
    url,
    name: title,
    description,
    inLanguage: lang,
    isPartOf: { "@id": WEBSITE_ID },
    about: { "@id": PERSON_ID },
    primaryImageOfPage: PERSON_IMAGE,
    ...extra,
  });

  if (route.page === "home") {
    graph.push(webPage("ProfilePage", { mainEntity: { "@id": PERSON_ID } }));
    graph.push(faqNode(url, t<Faq[]>("faq.items", lang)));
  } else if (route.page === "podcast") {
    const topics = t<Topic[]>("topics.items", lang);
    graph.push(
      webPage("WebPage", {
        mainEntity: {
          "@type": "ItemList",
          name: t("podcast.topicsTitle", lang),
          itemListElement: topics.map((topic, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: topic.title,
            url: absoluteUrl(topicPath(lang, TOPIC_SLUGS[index])),
          })),
        },
      }),
    );
    graph.push(breadcrumbNode(url, [{ name: "Greg Swierad", url: homeUrl }, { name: t("nav.podcast", lang), url }]));
  } else if (route.page === "topic" && route.topic) {
    const index = TOPIC_SLUGS.indexOf(route.topic);
    const page = t<TopicPage[]>("topicPages.items", lang)[index];
    const topic = t<Topic[]>("topics.items", lang)[index];
    graph.push(webPage("WebPage", { keywords: topic.points.join(", ") }));
    graph.push(faqNode(url, page.faq));
    graph.push(
      breadcrumbNode(url, [
        { name: "Greg Swierad", url: homeUrl },
        { name: t("nav.podcast", lang), url: absoluteUrl(podcastPath(lang)) },
        { name: topic.title, url },
      ]),
    );
  } else {
    graph.push(webPage("WebPage"));
  }

  return { "@context": "https://schema.org", "@graph": graph };
}

/** The markup that goes between <!--app-head-start--> and <!--app-head-end--> in index.html. */
export function headFor(route: Route): string {
  const { title, description } = pageMeta(route);
  const url = absoluteUrl(route.path);
  const indexable = route.page !== "notFound";
  const e = escapeHtml;

  const lines = [
    `<title>${e(title)}</title>`,
    `<meta name="description" content="${e(description)}" />`,
    `<meta name="robots" content="${indexable ? "index,follow,max-image-preview:large" : "noindex,follow"}" />`,
  ];

  if (indexable) {
    lines.push(`<link rel="canonical" href="${url}" />`);
    for (const lang of LANGS) lines.push(`<link rel="alternate" hreflang="${lang}" href="${absoluteUrl(route.alternates[lang])}" />`);
    lines.push(`<link rel="alternate" hreflang="x-default" href="${absoluteUrl(route.alternates.en)}" />`);
  }

  lines.push(
    `<meta property="og:site_name" content="Greg Swierad" />`,
    `<meta property="og:type" content="${route.page === "home" ? "profile" : "website"}" />`,
    `<meta property="og:locale" content="${OG_LOCALE[route.lang]}" />`,
    `<meta property="og:title" content="${e(title)}" />`,
    `<meta property="og:description" content="${e(description)}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:image" content="${OG_IMAGE}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="Greg Swierad" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${e(title)}" />`,
    `<meta name="twitter:description" content="${e(description)}" />`,
    `<meta name="twitter:image" content="${OG_IMAGE}" />`,
    jsonLd(structuredData(route, title, description)),
  );

  return lines.map((line) => `    ${line}`).join("\n");
}
