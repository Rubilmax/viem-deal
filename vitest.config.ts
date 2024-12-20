import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      reporter: process.env.CI ? ["lcov"] : ["text", "json", "html"],
      include: ["src"],
      exclude: ["test"],
    },
    sequence: {
      concurrent: true,
    },
    globalSetup: "vitest.setup.ts",
    testTimeout: 30_000,
  },
});
