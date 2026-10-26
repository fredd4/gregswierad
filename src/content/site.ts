export type Lang = "pl" | "en" | "es";

export const LANGS: Lang[] = ["pl", "en", "es"];

export const LINKEDIN_URL = "https://linkedin.com/in/gregswierad";
export const MENTORIST_URL = "https://www.mentorist.app/";
export const NARALINGO_URL = "https://naralingo.com/";

/** subida.ai URLs per language (the agency site publishes PL at the root, EN/ES under a prefix). */
export const SUBIDA_URLS: Record<"home" | "caseStudies" | "salesPages", Record<Lang, string>> = {
  home: {
    pl: "https://subida.ai/",
    en: "https://subida.ai/en",
    es: "https://subida.ai/es",
  },
  caseStudies: {
    pl: "https://subida.ai/case-studies",
    en: "https://subida.ai/en/case-studies",
    es: "https://subida.ai/es/casos-de-exito",
  },
  salesPages: {
    pl: "https://subida.ai/strony-sprzedazowe",
    en: "https://subida.ai/en/sales-pages",
    es: "https://subida.ai/es/paginas-de-venta",
  },
};

/** The listener-gift page has one URL per language, so a host can read the right one on air. */
export const LISTENERS_PATHS: Record<Lang, string> = {
  pl: "/dla-sluchaczy",
  en: "/listeners",
  es: "/oyentes",
};

export const HERO_PORTRAIT = "/images/portraits/greg-swierad-1.webp";

/** Photos offered to podcast hosts on /podcast. */
export const SPEAKING_PHOTOS = [
  { id: "speaking", web: "/images/gregspeaking.webp", download: "/images/gregspeaking.webp" },
  { id: "ags", web: "/images/ags-barcelona-2024.webp", download: "/media/greg-swierad-ags-barcelona-2024.jpg" },
] as const;

export type ProjectId =
  | "mentorist"
  | "iqelite"
  | "englishSeries"
  | "lighthouse"
  | "silneDziecko"
  | "neurony"
  | "hackyeah";

export const PROJECTS: Array<{ id: ProjectId; logo: string | null; url: string | Record<Lang, string> | null }> = [
  { id: "mentorist", logo: "/images/products/mentorist.webp", url: MENTORIST_URL },
  { id: "iqelite", logo: "/images/products/iqelite.webp", url: null },
  { id: "englishSeries", logo: "/images/products/english-series.webp", url: SUBIDA_URLS.caseStudies },
  { id: "lighthouse", logo: "/images/products/lighthouse.webp", url: "https://www.joinlighthouse.app/" },
  { id: "silneDziecko", logo: null, url: SUBIDA_URLS.salesPages },
  { id: "neurony", logo: "/images/products/neurony-szaleja.webp", url: "https://neuronyszaleja.pl/" },
  { id: "hackyeah", logo: "/images/products/hackyeah.webp", url: "https://www.instagram.com/p/DQBkuY0Ddq2/" },
];

/**
 * Podcast and media appearances, newest first. Add one entry per published episode;
 * the home page and /podcast list them automatically.
 */
export type Appearance = {
  show: string;
  title: string;
  date: string; // YYYY-MM-DD
  lang: Lang;
  url: string;
};

export const APPEARANCES: Appearance[] = [];
