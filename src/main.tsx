import { createRoot } from "react-dom/client";
import { I18nextProvider, initReactI18next } from "react-i18next";
import App from "./App.tsx";
import "./index.css";
import { registerServiceWorker } from "./registerServiceWorker";
import i18n from "./i18n/config";

// Initialize i18n with React AFTER React is imported in this file
i18n.use(initReactI18next);

// Initialize theme from localStorage
const savedTheme = localStorage.getItem("theme");
if (savedTheme === "dark" || !savedTheme) {
  // Default to dark theme if no preference is saved
  document.documentElement.classList.add("dark");
  if (!savedTheme) {
    localStorage.setItem("theme", "dark");
  }
} else {
  localStorage.setItem("theme", "light");
}

// Register service worker for PWA and offline support
registerServiceWorker();

createRoot(document.getElementById("root")!).render(
  <I18nextProvider i18n={i18n}>
    <App />
  </I18nextProvider>
);
