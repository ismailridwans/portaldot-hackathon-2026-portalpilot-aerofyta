// Vercel serverless entry for PortalPilot's API.
//
// vercel.json rewrites every /api/* request to this function, which simply
// re-exports the Express app from src/server.ts. The app does NOT call
// app.listen() under Vercel (process.env.VERCEL is set) — Vercel invokes it
// per request instead.
//
// What works on Vercel: all reads (balances, blocks, transfers, network
// status), fee preview (payment.queryInfo) and on-chain simulation
// (system.dryRun) against Portaldot mainnet — no node, no tokens needed.
// POT-gas WRITES (`/api/execute`) require a reachable Portaldot node, so they
// run from a local `--dev` node, not from this serverless function.
import app from "../src/server";

export default app;
