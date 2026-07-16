import node from "@astrojs/node";
import { defineConfig } from "astro/config";

// Server-rendered (SSR) output: pages render per-request so they can read the
// database, and `astro build` emits a standalone Node server at
// dist/server/entry.mjs — the thing the Dockerfile runs and the spec boots.
export default defineConfig({
  output: "server",
  adapter: node({ mode: "standalone" }),
  security: {
    // Fly terminates TLS at its proxy, so this server only ever sees plain
    // HTTP. Without a domain named here, Astro ignores the proxy's
    // x-forwarded-proto, decides it is serving http://<app>.fly.dev, and
    // then 403s every form POST because the browser's Origin says https —
    // its CSRF check is a strict origin comparison. Naming the deploy domain
    // is what lets it trust the header and agree it is serving https.
    // Nothing matches this pattern locally, so dev and the spec keep using
    // the localhost fallback unchanged.
    allowedDomains: [{ hostname: "**.fly.dev", protocol: "https" }],
  },
});
