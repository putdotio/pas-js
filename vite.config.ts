import { defineConfig } from "vite-plus";

const coverageConfig = {
  exclude: ["src/**/*.spec.*", "dist/**", "coverage/**"],
  include: ["src/**/*.ts"],
  provider: "v8",
  reporter: ["text", "lcov"],
} as const;

export default defineConfig({
  pack: {
    clean: true,
    dts: true,
    entry: ["src/index.ts"],
    format: ["esm", "cjs"],
    outDir: "dist",
    platform: "neutral",
    sourcemap: true,
  },
  test: {
    coverage: coverageConfig,
    environment: "jsdom",
    environmentOptions: {
      jsdom: {
        url: "https://app.put.io/",
      },
    },
    include: ["src/**/*.spec.ts"],
  },
});
