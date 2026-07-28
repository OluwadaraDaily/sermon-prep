const CLOUDFLARE_BEACON_ID = "cloudflare-web-analytics-beacon";
const CLOUDFLARE_BEACON_URL = "https://static.cloudflareinsights.com/beacon.min.js";

export function initializeCloudflareAnalytics(): void {
  const token = import.meta.env.VITE_CLOUDFLARE_WEB_ANALYTICS_TOKEN;

  if (!import.meta.env.PROD || !token || document.getElementById(CLOUDFLARE_BEACON_ID)) {
    return;
  }

  const script = document.createElement("script");
  script.id = CLOUDFLARE_BEACON_ID;
  script.type = "module";
  script.defer = true;
  script.src = CLOUDFLARE_BEACON_URL;
  script.dataset.cfBeacon = JSON.stringify({ token });

  document.head.appendChild(script);
}
