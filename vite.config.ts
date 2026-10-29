import { defineConfig } from "vite";

// Relative asset paths so the build loads as an unpacked Chrome extension.
// Unminified: it's loaded from disk, so size doesn't matter and the output stays readable.
export default defineConfig({
  base: "./",
  build: { outDir: "extension", emptyOutDir: true, minify: false, cssMinify: false },
});
