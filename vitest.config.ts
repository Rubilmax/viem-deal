import { defineConfig } from "vitest/config";

console.log(process.env.CI);

export default defineConfig({
  test: {
    coverage: {
      reporter: process.env.CI ? ["lcov"] : ["text", "json", "html"],
      include: ["src"],
      exclude: ["test"],
    },
    sequence: {
      concurrent: !process.env.CI,
    },
    testTimeout: 30_000,
  },
});
