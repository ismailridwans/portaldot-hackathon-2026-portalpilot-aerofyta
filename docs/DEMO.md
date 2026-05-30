# PortalPilot — Demo video script (≈ 2:45)

Goal: prove **native Portaldot deployment + POT gas**, a **working MVP**, **application value**, and **presentation quality** — fast.

**Before recording:** local node running (`./portaldot_dev --dev --tmp --rpc-cors all`), `npm run dev` up, browser at the app, window clean. Save a still to `docs/screenshot.png` for the README.

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

---

## Reproducible proof — one command (`npm run smoke`)

With a local dev node running, `npm run smoke` exercises the whole stack against the **real** chain and prints a transcript anyone can reproduce:

```
── MAINNET reads ──
  Portaldot Mainnet | block #2,527,453 | POT 14dp | 25 pallets / 155 calls
── INTENT parsing ──  8 phrases → correct intents; "make me a sandwich" → declined
── LOCAL node: plan → dry-run → execute (real POT gas) ──
  before: Alice 49,975.7978 POT, Bob 50,020 POT
  PLAN:   Transfer 3 POT → Bob | fee=0.0148 POT | dryRun ok=true
  EXECUTED: ok=true block=0xedae57821b… tx=0x4f7a1f3b8d…
           events: balances.Transfer, treasury.Deposit, system.ExtrinsicSuccess
  after:  Bob 50,023 POT                         ← +3 POT, on-chain
  remark: EXECUTED ok=true   events: system.Remarked, treasury.Deposit, system.ExtrinsicSuccess
```

Bob moves **50,020 → 50,023 POT** and the receipt carries `treasury.Deposit` (POT gas paid) — undeniable, repeatable proof of a working native transaction.

## Where each thing runs
- **Hosted demo** (`portalpilot-ruby.vercel.app`) — live **mainnet reads**, real POT **fee preview**, and the **dry-run safety** (writes are blocked because the demo signer is unfunded on mainnet and there is no faucet). Always on; anyone can open it.
- **Local** (`npm run dev` + a dev node) — the **successful POT-gas writes** (Alice is funded). This is what the video shows.

## Optional: live writes on the *hosted* URL (tunnel)
To make the deployed Vercel site execute real writes during a live presentation, expose your funded dev node and point the hosted **Local** network at it:
```bash
# 1) run your dev node (WSL):   ./portaldot_dev --dev --tmp --rpc-cors all
# 2) expose it over a public wss tunnel (no account needed):
cloudflared tunnel --url http://127.0.0.1:9944     # prints https://<id>.trycloudflare.com
# 3) on Vercel set the env var to the wss form, then redeploy:
vercel env add PORTALDOT_LOCAL_WS production       # paste wss://<id>.trycloudflare.com
vercel --prod
```
The hosted **Local** network now signs with the funded Alice on your tunneled node and returns real receipts. Caveat: it only works while your node + tunnel are running, and the free tunnel URL changes each run — use it for a live demo, not as the always-on state.
