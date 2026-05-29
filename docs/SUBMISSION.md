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

## ✅ How we meet every criterion
| Criterion | How PortalPilot satisfies it |
|---|---|
| **Built on Portaldot** | Reads live mainnet via `@polkadot/api`; builds every call from Portaldot's runtime metadata (25 pallets / 155 extrinsics). |
| **Use POT as gas** *(mandatory)* | Submits real extrinsics that pay **POT** — each executed tx emits `treasury.Deposit` (the fee) + `system.ExtrinsicSuccess`; exact fee shown pre-sign (e.g. 0.0147 POT). |
| **Portaldot Native Deployment** *(mandatory)* | Runs on Portaldot's **native pallets** (balances, utility, system) and native token — not a generic/EVM chain. ss58-42 + 14-decimal handled correctly. |
| **Runnable MVP / Demo Completion** | Full working app: NL → dry-run → POT fee → confirm → on-chain receipt, verified end-to-end. |
| **Application Value** | Makes a Rust/Substrate chain usable by anyone; ships the missing **explorer** and **JS/TS SDK**. |
| **Presentation Quality** | Premium light/dark UI, live workflow tracer, self-playing demo; script in `docs/DEMO.md`. |
| **Open source** | MIT; all code public. |
| **AI-Powered Onchain Workflows (track)** | Honest AI loop — intent → plan → **simulate-before-sign** → confirm; deterministic core + optional Claude (`ANTHROPIC_API_KEY`). |

**Submission checklist:** ✅ GitHub repo · ✅ README · ⬜ demo video (record via `docs/DEMO.md`) · ⬜ submit BUIDL on DoraHacks.

**Honest notes:** POT-gas writes are demonstrated on a **local Portaldot dev node** (the project's own bundled binary, identical runtime) because mainnet has no public faucet; reads/fee/dry-run run on **mainnet**. Set `PORTALDOT_SIGNER_SEED` to a funded mainnet account to execute on mainnet too. A copilot-driven **ink! contract deploy** is now **wired via pallet-contracts** (`src/sdk/contracts.ts`); it executes once a node-compatible `flipper.contract` is added (see `contracts/flipper/`).

## What's next
ink! deploy/call is **wired via pallet-contracts** (`src/sdk/contracts.ts`, copilot: “deploy flipper” → “flip” → “read”) — add a node-compatible `flipper.contract` to go live · wallet-extension signing · multisig & scheduled actions · spend limits/allowlists · publish `@portalpilot/sdk`.

## Run it
```bash
# (writes) start a Portaldot dev node — see README (WSL on Windows)
npm install && npm install --prefix app
npm run dev            # web http://localhost:5173 , api 8787
# or: npm run build && npm start   → everything on http://127.0.0.1:8787
```

## Links
- Repo: https://github.com/ismailridwans/portalpilot
- Demo video: `<add your video URL>`
- Built on Portaldot mainnet `wss://mainnet.portaldot.io`; open source (MIT).
