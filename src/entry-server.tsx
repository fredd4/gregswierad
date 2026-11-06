import { renderToString } from "react-dom/server";
import App from "./app/App.tsx";
import { headFor } from "./content/head";
import i18n from "./i18n";
import type { Route } from "./content/routes";

/**
 * Renders one route to HTML for scripts/prerender.mjs. The language is switched
 * synchronously first, so the markup holds the real translated copy.
 */
export function render(route: Route): { html: string; head: string } {
  void i18n.changeLanguage(route.lang);
  return { html: renderToString(<App route={route} />), head: headFor(route) };
}

// Re-exported so Node scripts read the same route list as the app.
export { ROUTES, NOT_FOUND_ROUTE, SITE_URL, absoluteUrl } from "./content/routes";
