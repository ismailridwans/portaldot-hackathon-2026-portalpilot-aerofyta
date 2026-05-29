# PortalPilot — DoraHacks BUIDL submission

**Tagline:** Talk to Portaldot in plain English — PortalPilot explains, simulates with the real POT fee, and executes only after you confirm.

**Tracks:** AI-Powered Onchain Workflows (primary) · Builder Tools for Portaldot · Native Onchain Apps

---

## Problem
Portaldot is a capable Substrate chain (ink! contracts, 25 pallets, 155 extrinsics) but its UX is bare: **no block explorer**, **no JS/TS SDK** (Python only), **no faucet**, thin docs, and chain-specific traps (POT is **14 decimals**, ss58 prefix 42). Reading a balance or sending POT is hard for newcomers and impossible for non-developers.

## What it does
PortalPilot is a chat copilot + live explorer for Portaldot.
- **Ask (read, no gas):** balances, recent blocks, recent transfers, network status, fee estimates, “what can I do?”.
- **Act (write, POT gas):** send POT, batch/airdrop to many recipients, post an on-chain remark — each turned into a **plan** that is **dry-run simulated** and **fee-previewed in POT**, executed **only after you confirm**, returning a real on-chain receipt (block hash + events).
- **Built-in live explorer:** streaming blocks + account inspector, because Portaldot has none.

## How it's built (and native-deployment proof)
- **TypeScript SDK over `@polkadot/api`**, preconfigured for Portaldot (POT 14 dp, ss58 42) — also the first community JS/TS SDK for the chain.
- **Intent engine:** zero-dependency deterministic parser + optional Claude layer. The AI only *proposes*; the chain *simulates* (`system_dryRun`); the user *authorizes*.
- **Express API** (`/api/ask`, `/api/execute`, …) that also serves the React/Vite UI.
- **Native + POT gas:** PortalPilot composes & submits real Portaldot extrinsics (`balances.transferKeepAlive`, `utility.batchAll`, `system.remarkWithEvent`). Every executed tx emits `treasury.Deposit` + `system.ExtrinsicSuccess` — proof POT gas was paid.
- **Verified end-to-end:** mainnet reads at `wss://mainnet.portaldot.io` (block #2.52M, 25 pallets/155 calls) and POT-gas writes on a Portaldot dev node (e.g. `Transfer 1 POT → Bob`, fee `0.0147 POT`, dry-run OK, included on-chain).

## Why it stands out
- Mandatory criteria nailed: real native extrinsics paying POT gas.
- Honest AI: *simulate-before-sign* is the academically-recommended safety layer for on-chain agents ([arXiv:2601.04583](https://arxiv.org/html/2601.04583v1)) — and the Confirm button is disabled when the dry-run would fail.
- Correct where naïve tools break: 14-decimal POT math and ss58-42 (the local node doesn’t advertise `system.properties`).
- Three surfaces (copilot + explorer + SDK) from one metadata-driven data layer → multi-track value, hard to replicate in a weekend.

## What's next
Wallet-extension signing · copilot-driven ink! deploy/call (`pallet-contracts` is live) · multisig & scheduled actions · spend limits/allowlists · publish `@portalpilot/sdk`.

## Run it
```bash
# (writes) start a Portaldot dev node — see README (WSL on Windows)
npm install && npm install --prefix app
npm run dev            # web http://localhost:5173 , api 8787
# or: npm run build && npm start   → everything on http://127.0.0.1:8787
```

## Links
- Repo: `<add your GitHub URL>`
- Demo video: `<add your video URL>`
- Built on Portaldot mainnet `wss://mainnet.portaldot.io`; open source (MIT).
