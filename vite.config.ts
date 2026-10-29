import { defineConfig } from "vite";

// Relative asset paths so the build loads as an unpacked Chrome extension.
export default defineConfig({
  base: "./",
  build: { outDir: "extension", emptyOutDir: true },
});
