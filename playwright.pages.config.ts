import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/pages",
  use: {
    baseURL:
      process.env.PAGES_TEST_URL || "http://127.0.0.1:4173/pharma-lexicon/",
    headless: true,
  },
  reporter: "list",
});
