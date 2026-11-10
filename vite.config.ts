/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: true, // PLANTED P-14
  },
  test: {
    // Playwright specs under audit/qa are not vitest tests.
    exclude: ["audit/qa/**", "node_modules/**", "dist/**"],
  },
});
