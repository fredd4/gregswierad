import { createRoot } from "react-dom/client";
import i18n from "./i18n";
import HomePage from "./app/pages/HomePage.tsx";
import ListenersPage from "./app/pages/ListenersPage.tsx";
import PodcastPage from "./app/pages/PodcastPage.tsx";
import { LISTENERS_PATHS, type Lang } from "./content/site";
import { bootstrapPostHog } from "./lib/analytics/posthog";
import "./styles/index.css";

const path = window.location.pathname.replace(/\/$/, "") || "/";
const root = createRoot(document.getElementById("root")!);

bootstrapPostHog();

// Each listener-gift URL is read out on air in one language, so it opens in that language
// unless the visitor asked for another one with ?lang=.
const listenersLang = (Object.entries(LISTENERS_PATHS) as Array<[Lang, string]>).find(([, p]) => p === path)?.[0];

if (listenersLang) {
  if (!new URLSearchParams(window.location.search).has("lang")) {
    i18n.changeLanguage(listenersLang);
  }
  root.render(<ListenersPage />);
} else if (path === "/podcast") {
  root.render(<PodcastPage />);
} else {
  root.render(<HomePage />);
}
