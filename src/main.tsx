import { createRoot, hydrateRoot } from "react-dom/client";
import i18n from "./i18n";
import App from "./app/App.tsx";
import { LANGS, type Lang } from "./content/site";
import { NOT_FOUND_ROUTE, matchRoute } from "./content/routes";
import { bootstrapPostHog } from "./lib/analytics/posthog";
import { readLangChoice, saveLangChoice } from "./lib/lang-choice";
import "./styles/index.css";

const isLang = (value: string | null | undefined): value is Lang => LANGS.includes(value as Lang);

const route = matchRoute(window.location.pathname) ?? NOT_FOUND_ROUTE;
const params = new URLSearchParams(window.location.search);
const explicit = params.get("lang");

/**
 * Each language has its own URL, so crawlers and AI assistants can read and cite every
 * version. A visitor still lands in their language:
 * - `?lang=pl` (pitch links) moves to that language's URL and is remembered;
 * - a language picked earlier in the switcher is applied on every page;
 * - otherwise the browser language is applied, but only on the unprefixed English URLs,
 *   so an explicit /pl or /es link is never overridden.
 * The listener-gift URLs are read out on air in one language and only follow `?lang=`.
 */
function preferredLang(): Lang | null {
  if (isLang(explicit)) {
    saveLangChoice(explicit);
    return explicit;
  }
  if (route.page === "listeners" || route.page === "notFound") return null;

  const chosen = readLangChoice();
  if (isLang(chosen)) return chosen;

  if (route.lang === "en") {
    const browser = (navigator.languages?.[0] || navigator.language || "").slice(0, 2);
    if (isLang(browser)) return browser;
  }
  return null;
}

const wanted = preferredLang();
const target = wanted ? route.alternates[wanted] : route.path;

if (route.page !== "notFound" && target !== route.path) {
  params.delete("lang");
  const query = params.toString();
  window.location.replace(`${target}${query ? `?${query}` : ""}${window.location.hash}`);
} else {
  void i18n.changeLanguage(route.lang);
  bootstrapPostHog();

  const container = document.getElementById("root")!;
  const app = <App route={route} />;

  // Prerendered pages hydrate; anything else (e.g. `vite dev`) renders from scratch.
  if (container.hasChildNodes()) {
    hydrateRoot(container, app);
  } else {
    createRoot(container).render(app);
  }
}
