// Bundles the whole Express server (src/server.ts + the SDK + intent engine +
// @polkadot/api, all of it) into ONE self-contained ESM file at api/index.mjs.
//
// Why: Vercel runs serverless functions on a native-ESM Node runtime. Our
// backend uses extensionless relative imports (great for tsx/bundlers, invalid
// for native ESM), so importing the source directly throws ERR_MODULE_NOT_FOUND.
// Bundling inlines every local import, so there is nothing to resolve at runtime.
import { build } from "esbuild";

await build({
  entryPoints: ["src/server.ts"],
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node20",
  outfile: "api/index.mjs",
  // A few transitive deps reference CommonJS `require` at runtime; provide it.
  banner: {
    js: "import{createRequire as ___cr}from'module';const require=___cr(import.meta.url);",
  },
  logLevel: "info",
});

console.log("✓ bundled api/index.mjs");
