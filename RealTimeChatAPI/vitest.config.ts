import { defineConfig } from "vitest/config";

export default defineConfig({
  root: "./",
  test: {
    include: ["**/*/*.test.ts"],
    environment: "node",
    globals: true,
  },
  resolve: {
    alias: {
      "@/": new URL("./src/", import.meta.url).pathname,
    },
  },
});
