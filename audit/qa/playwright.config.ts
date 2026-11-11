import { join, resolve } from "node:path";
import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.BASE_URL;
if (!baseURL) throw new Error("BASE_URL is required, e.g. BASE_URL=http://localhost:4173");

const runDir = resolve(process.env.RUN_DIR ?? join(import.meta.dirname, "..", "..", "test-results", "qa"));

const phoneOnly = ["**/first-screen.spec.ts", "**/no-sideways-scroll.spec.ts", "**/tap-targets.spec.ts"];

export default defineConfig({
  testDir: import.meta.dirname,
  testMatch: "**/*.spec.ts",
  outputDir: join(runDir, "screenshots"),
  fullyParallel: true,
  retries: 0,
  reporter: [["list"], ["json", { outputFile: join(runDir, "playwright.json") }]],
  use: {
    baseURL,
    screenshot: "only-on-failure",
    locale: "ro-RO",
  },
  projects: [
    { name: "iphone-15", use: { ...devices["iPhone 15"] }, testIgnore: ["**/keyboard.spec.ts"] },
    { name: "pixel-7", use: { ...devices["Pixel 7"] }, testIgnore: ["**/keyboard.spec.ts"] },
    { name: "desktop", use: { ...devices["Desktop Chrome"] }, testIgnore: phoneOnly },
  ],
});
