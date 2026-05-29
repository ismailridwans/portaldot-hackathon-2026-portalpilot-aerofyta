# PortalPilot — Demo video script (≈ 2:45)

Goal: prove **native Portaldot deployment + POT gas**, a **working MVP**, **application value**, and **presentation quality** — fast.

**Before recording:** local node running (`./portaldot_dev --dev --rpc-cors all`), `npm run dev` up, browser at the app, window clean. Save a still to `docs/screenshot.png` for the README.

---

**0:00 – 0:20 · Hook (problem)**
> “Portaldot is a real Substrate chain — but it has no block explorer, no JS SDK, no faucet, and a steep Rust learning curve. So I built PortalPilot: you just talk to the chain — and it keeps you safe.”
- Show the app. Point at the **Live Explorer** streaming blocks on the right.

**0:20 – 0:45 · It’s the real chain (reads)**
- Click **Mainnet** in the toggle. Header updates to “Portaldot Mainnet · #2,5xx,xxx · POT · 25p/155x”.
- Type: `network status` → read it back.
- Type: `balance of 5GrwvaEF…GKutQY` (or any address) → real on-chain balance.
> “That’s live mainnet data — 25 pallets, 155 extrinsics, POT at 14 decimals.”

**0:45 – 1:45 · The hero: natural language → safe POT transaction**
- Click **Local** (explain: no public faucet yet, so we execute on a Portaldot dev node — same runtime, real POT gas).
- Type: `send 1 POT to bob`.
- **Pause on the preview card:** extrinsic `balances.transferKeepAlive`, recipient, amount, **dry-run ✓ simulated**, **Network fee 0.0147 POT**, call data.
> “Before anything is signed, PortalPilot simulates it on-chain and shows the exact POT fee. Nothing happens until I confirm.”
- Click **Confirm & sign** → receipt: **✓ Executed on-chain — POT gas paid**, block hash, `balances.Transfer, treasury.Deposit, system.ExtrinsicSuccess`.
> “Real transaction, real block, POT paid as gas — see the treasury deposit.”

**1:45 – 2:10 · Safety is real, not a label**
- Type: `send 1 POT to 5xxinvalidxx` → rejected / dry-run would-fail, **Confirm disabled**.
- Type: `make me a sandwich` → politely declined with suggestions.
> “The AI only proposes; the chain simulates; I authorize. Simulate-before-sign is the recommended safety pattern for on-chain agents.”

**2:10 – 2:35 · Range + ecosystem value**
- Quickfire: `airdrop 1 POT to bob and 2 POT to charlie` (batch preview), `post on-chain remark: gm Portaldot` (confirm → `system.Remarked`), `recent transfers`.
> “Batches, remarks, and a built-in explorer — plus the first JS/TS SDK Portaldot was missing.”

**2:35 – 2:45 · Close**
> “PortalPilot makes Portaldot usable by anyone — safely. Copilot, explorer, and SDK in one. Thanks!”

---

### Tips
- Keep **AI · rules** mode (no API key) so it’s deterministic and offline-safe; mention Claude can be enabled for free-form phrasing.
- If a write ever lags, it’s block time (~6s) — narrate the dry-run/fee while it includes.
