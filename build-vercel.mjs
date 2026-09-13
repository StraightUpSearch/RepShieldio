/**
 * Custom Vercel build script using the Build Output API (v2).
 * Bypasses Vercel's default ncc bundler (which crashes on this project)
 * by pre-bundling the API with esbuild into a self-contained function.
 */
console.log("build-vercel.mjs starting...");
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

// 3. Create a DIAGNOSTIC handler first to verify Build Output API works
console.log("\n=== Creating diagnostic API function ===");
const funcDir = join(output, "functions", "api", "index.func");
mkdirSync(funcDir, { recursive: true });

// Minimal handler to test Build Output API setup
const diagnosticHandler = `
module.exports = function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({
    ok: true,
    path: req.url,
    method: req.method,
    env: {
      NODE_ENV: process.env.NODE_ENV || 'not set',
      HAS_DB_URL: !!process.env.PROD_DATABASE_URL,
      HAS_SESSION_SECRET: !!process.env.SESSION_SECRET,
    },
    timestamp: new Date().toISOString()
  }));
};
`;

writeFileSync(join(funcDir, "index.js"), diagnosticHandler);

// Write package.json for the function (CJS mode)
writeFileSync(
  join(funcDir, "package.json"),
  JSON.stringify({ type: "commonjs" }, null, 2)
);

// Write .vc-config.json for the function
writeFileSync(
  join(funcDir, ".vc-config.json"),
  JSON.stringify({
    runtime: "nodejs20.x",
    handler: "index.js",
    launcherType: "Nodejs",
    maxDuration: 30,
  }, null, 2)
);
console.log("Diagnostic API function created");

// 4. Write config.json with routing rules
writeFileSync(
  join(output, "config.json"),
  JSON.stringify({
    version: 3,
    routes: [
      { src: "/api/(.*)", dest: "/api/index" },
      { src: "/assets/(.*)", headers: { "Cache-Control": "public, max-age=31536000, immutable" } },
      { handle: "filesystem" },
      { src: "/(.*)", dest: "/index.html" },
    ],
  }, null, 2)
);

console.log("\n=== Build complete (diagnostic mode) ===");
console.log("Output: .vercel/output/");
