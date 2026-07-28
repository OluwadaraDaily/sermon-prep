import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app/App";
import { initializeCloudflareAnalytics } from "./analytics/cloudflare";
import "./styles.css";

initializeCloudflareAnalytics();

const root = document.querySelector<HTMLDivElement>("#app");

if (!root) {
  throw new Error("App root element was not found.");
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
