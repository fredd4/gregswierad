import type { Route } from "@/content/routes";
import HomePage from "@/app/pages/HomePage";
import ListenersPage from "@/app/pages/ListenersPage";
import NotFoundPage from "@/app/pages/NotFoundPage";
import PodcastPage from "@/app/pages/PodcastPage";
import TopicPage from "@/app/pages/TopicPage";
import { RouteProvider } from "@/app/route-context";

/** Renders one route. Shared by the browser entry (src/main.tsx) and the prerender (src/entry-server.tsx). */
export default function App({ route }: { route: Route }) {
  return (
    <RouteProvider value={route}>
      {route.page === "home" && <HomePage />}
      {route.page === "podcast" && <PodcastPage />}
      {route.page === "listeners" && <ListenersPage />}
      {route.page === "topic" && route.topic && <TopicPage slug={route.topic} />}
      {route.page === "notFound" && <NotFoundPage />}
    </RouteProvider>
  );
}
