import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import OfferPage from "./app/pages/OfferPage.tsx";
import "./i18n";
import "./styles/index.css";

const path = window.location.pathname.replace(/\/$/, "") || "/";
const root = document.getElementById("root")!;

if (path === "/offer") {
  createRoot(root).render(<OfferPage />);
} else {
  createRoot(root).render(<App />);
}
