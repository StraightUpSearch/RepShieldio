import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(async () => {
  const plugins = [react()];

  // Only load Replit plugins in development or Replit environment
  if (process.env.NODE_ENV !== "production" || process.env.REPL_ID !== undefined) {
    try {
      // Conditionally import runtime error overlay
      const { default: runtimeErrorOverlay } = await import("@replit/vite-plugin-runtime-error-modal");
      plugins.push(runtimeErrorOverlay());
    } catch (error) {
      console.warn("Replit runtime error overlay plugin not available, skipping...");
    }

    // Conditionally import cartographer
    if (process.env.REPL_ID !== undefined) {
      try {
        const { cartographer } = await import("@replit/vite-plugin-cartographer");
        plugins.push(cartographer());
      } catch (error) {
        console.warn("Replit cartographer plugin not available, skipping...");
      }
    }
  }

  return {
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "client", "src"),
        "@shared": path.resolve(import.meta.dirname, "shared"),
        "@assets": path.resolve(import.meta.dirname, "attached_assets"),
      },
    },
    root: path.resolve(import.meta.dirname, "client"),
    build: {
      outDir: path.resolve(import.meta.dirname, "dist/public"),
      emptyOutDir: true,
    },
  };
});
