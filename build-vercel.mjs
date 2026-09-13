/**
 * Custom Vercel build script using the Build Output API.
 * Bypasses Vercel's default ncc bundler (which crashes on this project)
 * by pre-bundling the API with esbuild into a self-contained function.
 *
 * 1. Builds the React frontend with Vite → .vercel/output/static/
 * 2. Bundles the Express API with esbuild → .vercel/output/functions/api/index.func/
 * 3. Writes config.json for routing
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

// 3. Bundle API function with esbuild
// --bundle inlines all npm packages (self-contained, no node_modules at runtime)
// SQLite packages are external — they're only used in dev, never reached in production
console.log("\n=== Bundling API function with esbuild ===");
const funcDir = join(output, "functions", "api", "index.func");
mkdirSync(funcDir, { recursive: true });

execSync(
  [
    "npx esbuild api/index.ts",
    "--bundle",
    "--platform=node",
    "--target=node20",
    "--format=esm",
    "--outfile=.vercel/output/functions/api/index.func/index.mjs",
    "--external:better-sqlite3",
    "--external:connect-sqlite3",
    "--external:@libsql/client",
    "--external:drizzle-orm/libsql",
    '--alias:@shared=./shared',
    '--alias:@=./client/src',
  ].join(" "),
  { stdio: "inherit", cwd: root }
);

// Write .vc-config.json for the function
writeFileSync(
  join(funcDir, ".vc-config.json"),
  JSON.stringify({
    runtime: "nodejs20.x",
    handler: "index.mjs",
    launcherType: "Nodejs",
    maxDuration: 30,
  }, null, 2)
);
console.log("API function bundled to .vercel/output/functions/api/index.func/");

// 4. Write config.json with routing rules
writeFileSync(
  join(output, "config.json"),
  JSON.stringify({
    version: 3,
    routes: [
      // API routes → serverless function
      { src: "/api/(.*)", dest: "/api/index" },
      // Static assets (with hashed filenames) — immutable cache
      { src: "/assets/(.*)", headers: { "Cache-Control": "public, max-age=31536000, immutable" } },
      // SPA fallback — all other routes serve index.html
      { handle: "filesystem" },
      { src: "/(.*)", dest: "/index.html" },
    ],
  }, null, 2)
);

console.log("\n=== Build complete ===");
console.log("Output: .vercel/output/");
