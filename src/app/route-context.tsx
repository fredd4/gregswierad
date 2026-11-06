import { createContext, useContext } from "react";
import { NOT_FOUND_ROUTE, type Route } from "@/content/routes";

const RouteContext = createContext<Route>(NOT_FOUND_ROUTE);

export const RouteProvider = RouteContext.Provider;

/** The page being rendered, with its language and its URL in every other language. */
export const useRoute = () => useContext(RouteContext);
