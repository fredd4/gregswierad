import posthog from "posthog-js";

let bootstrapped = false;

/**
 * Loads PostHog once. The project is shared with subida.ai, so every event carries
 * `site: "gregswierad.com"` to keep the two sites apart in queries.
 */
export const bootstrapPostHog = () => {
  if (typeof window === "undefined" || bootstrapped) return;

  const key = import.meta.env.VITE_POSTHOG_KEY;
  if (!key) return;

  bootstrapped = true;
  posthog.init(key, {
    api_host: import.meta.env.VITE_POSTHOG_HOST || "https://us.i.posthog.com",
    capture_pageview: true,
    capture_pageleave: true,
    persistence: "localStorage+cookie",
  });
  posthog.register({ site: "gregswierad.com" });
};

export const track = (event: string, properties?: Record<string, unknown>) => {
  if (!bootstrapped) return;
  posthog.capture(event, properties);
};
