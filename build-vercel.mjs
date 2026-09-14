/**
 * Vercel Build Output API (v3) build script.
 *
 * Creates .vercel/output/ with:
 *   static/         — Vite frontend
 *   functions/api/index.func/ — esbuild-bundled Express API
 *   config.json     — routing rules
 *
 * This gives us full control: no ncc, no auto-detection surprises.
 */
import { execSync } from "child_process";
import { mkdirSync, writeFileSync, cpSync } from "fs";
import { join } from "path";

const root = process.cwd();
const output = join(root, ".vercel", "output");

// Clean previous output
execSync(`rm -rf "${output}"`, { stdio: "inherit" });

// 1. Build frontend with Vite
console.log("\n=== Building frontend with Vite ===");
execSync("npx vite build", { stdio: "inherit", cwd: root });

// 2. Copy frontend to .vercel/output/static/
const staticDir = join(output, "static");
mkdirSync(staticDir, { recursive: true });
cpSync(join(root, "dist", "public"), staticDir, { recursive: true });
console.log("Frontend copied to .vercel/output/static/");

// 3. Bundle API with esbuild — fully self-contained CJS
console.log("\n=== Bundling API with esbuild ===");
const funcDir = join(output, "functions", "api", "index.func");
mkdirSync(funcDir, { recursive: true });

execSync([
  "npx esbuild server/vercel-handler.ts",
  "--bundle",
  "--platform=node",
  "--target=node20",
  "--format=cjs",
  `--outfile=${join(funcDir, "index.js")}`,
  "--tsconfig=tsconfig.json",
].join(" "), { stdio: "inherit", cwd: root });

// CJS package.json (root has "type": "module")
writeFileSync(
  join(funcDir, "package.json"),
  JSON.stringify({ type: "commonjs" }, null, 2)
);

// Function runtime config — no ncc, runs our pre-bundled file directly
writeFileSync(
  join(funcDir, ".vc-config.json"),
  JSON.stringify({
    runtime: "nodejs20.x",
    handler: "index.js",
    launcherType: "Nodejs",
    maxDuration: 30,
  }, null, 2)
);
console.log("API function bundled to .vercel/output/functions/api/index.func/");

// 4. Routing config
writeFileSync(
  join(output, "config.json"),
  JSON.stringify({
    version: 3,
    routes: [
      // Serve static files and direct function matches first
      { handle: "filesystem" },
      // API routes → serverless function
      { src: "/api/(.*)", dest: "/api/index" },
      // Server-rendered routes that must hit Express, not the SPA
      { src: "/sitemap.xml", dest: "/api/index" },
      { src: "/robots.txt", dest: "/api/index" },
      // SPA fallback for client-side routing
      { src: "/(.*)", dest: "/index.html" },
    ],
  }, null, 2)
);

console.log("\n=== Build complete ===");
console.log("Output: .vercel/output/");
