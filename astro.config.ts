import node from "@astrojs/node";
import { defineConfig } from "astro/config";

// Server-rendered (SSR) output: pages render per-request so they can read the
// database, and `astro build` emits a standalone Node server at
// dist/server/entry.mjs — the thing the Dockerfile runs and the spec boots.
export default defineConfig({
  output: "server",
  adapter: node({ mode: "standalone" }),
});
