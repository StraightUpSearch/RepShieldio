/**
 * Custom Vercel build script.
 * 1. Vite builds the frontend → dist/public/
 * 2. esbuild bundles server/vercel-handler.ts → api/index.js
 *    Pre-bundling everything into one CJS file so Vercel's ncc has nothing to resolve.
 */
import { execSync } from "child_process";
import { mkdirSync, writeFileSync } from "fs";

const root = process.cwd();

// 1. Build frontend with Vite
console.log("\n=== Building frontend with Vite ===");
execSync("npx vite build", { stdio: "inherit", cwd: root });

// 2. Bundle API with esbuild — fully self-contained, no external requires
console.log("\n=== Bundling API with esbuild ===");
mkdirSync("api", { recursive: true });

// CJS package.json so Node treats api/index.js as CommonJS
// (root package.json has "type": "module")
writeFileSync("api/package.json", JSON.stringify({ type: "commonjs" }, null, 2));

execSync([
  "npx esbuild server/vercel-handler.ts",
  "--bundle",
  "--platform=node",
  "--target=node20",
  "--format=cjs",
  "--outfile=api/index.js",
  "--tsconfig=tsconfig.json",
].join(" "), { stdio: "inherit", cwd: root });

console.log("\n=== Build complete ===");
