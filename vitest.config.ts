import { defineConfig } from "vitest/config";

// The spec needs a running app (spec/global-setup.ts finds it); the scripts'
// own tests don't, so they run without one.
export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: "spec",
          include: ["spec/**/*.test.ts"],
          globalSetup: ["./spec/global-setup.ts"],
        },
      },
      { test: { name: "scripts", include: ["scripts/**/*.test.ts"] } },
    ],
  },
});
