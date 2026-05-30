# PortalPilot — Demo Script (time‑boxed)

**What it is (one line):** PortalPilot is an **AI copilot for Portaldot** — say what you want in plain English; it builds the extrinsic, **simulates it on‑chain with the real POT fee**, and executes **only after you confirm**, returning a real receipt.

> Judges' format (Rule 2): **User action → local Portaldot tx → POT gas/fee shown → on‑chain result → user‑visible result**, in 60–90 seconds. The script below hits exactly that.

---

## ⏱️ Before you record (setup — not on camera)
1. **Local node** (WSL): `cd /root/portaldot/portaldot-testnet-ubuntu && ./portaldot_dev --dev --tmp --rpc-cors all`
2. **App**: `npm run dev`
3. Open **http://localhost:5173** (use `localhost`, *not* `127.0.0.1`) → **Launch App**. It opens on **Local** (Alice is funded). Clean, dark window.

---

## 🎬 THE 90‑SECOND DEMO (one flow, proves everything)

| Time | Say this | Do / show this |
|---|---|---|
| **0:00–0:12** | "Portaldot is a real Substrate chain — but it has no explorer, no JS SDK, and a steep learning curve. PortalPilot lets you just *talk* to the chain — safely." | App on screen. Point at the **Live Explorer** streaming blocks on the right. |
| **0:12–0:25** | "Watch — I'll send POT in plain English." | Type **`send 1 POT to bob`** → Enter. |
| **0:25–0:50** | "It built the exact extrinsic — `balances.transferKeepAlive` — **simulated it on‑chain** with a dry‑run, and shows the **real POT fee: 0.0147 POT**. Nothing is signed yet." | Pause on the **plan card**: extrinsic · recipient · **✓ simulated** · **fee 0.0147 POT**. Point to the **7‑stage workflow tracer**. |
| **0:50–1:05** | "I approve — and only now does it sign and submit." | Click **Confirm & sign**. |
| **1:05–1:25** | "Real transaction, real block, **POT paid as gas** — there's the `treasury.Deposit`. Plain English in → a safe on‑chain transaction out, in one sentence." | Show the **receipt**: ✓ Executed on‑chain · **block hash** · events **`balances.Transfer, treasury.Deposit, system.ExtrinsicSuccess`**. |

> **+15s if you have it (the safety beat):** flip to **Mainnet**, type a transfer → the dry‑run **blocks it** ("insufficient balance") and **Confirm is disabled**. *"The chain catches a doomed transaction before you ever sign — that's the safety pipeline."*

---

## ⚡ 30‑SECOND ELEVATOR (if time is very tight)
> "PortalPilot is an AI copilot for Portaldot. I type `send 1 POT to bob`; it builds the extrinsic, **dry‑runs it on‑chain**, shows the **exact POT fee**, and after I confirm it executes and returns a **real receipt with `treasury.Deposit`** — proving POT was paid as gas. Plain English in, a safe on‑chain transaction out."

---

## 🗣️ Talking points (sprinkle as needed)
- **POT as gas:** "The `treasury.Deposit` in the receipt *is* the POT fee paid as gas."
- **Safety:** "Simulate‑before‑sign — the AI proposes, the chain verifies, the human authorizes."
- **Native, not EVM:** "Substrate via `@polkadot/api` — `balances`, `utility.batchAll`, `system.remark`, `pallet-contracts`."
- **Ecosystem value:** "The first JS/TS SDK + the only live explorer Portaldot had been missing."

## ✅ Why this is Green (no mocks — Rule 3)
Real chain · real extrinsic · real `system.dryRun` · real POT gas · real receipt. **Nothing in this flow is mocked.** (ink! deploy is *wired* to the node's legacy `pallet-contracts` but awaits a compatible artifact — it is **not** part of this demo.)

---

## 🔁 Reproducible proof (one command — for the write‑up / judges)
With the local node running, `npm run smoke` exercises the whole stack against the **real** chain:
```
MAINNET  Portaldot Mainnet | #2,528,336 | POT 14dp | 25 pallets / 155 calls
LOCAL    before Bob 50,002 POT
         PLAN Transfer 3 POT → Bob | fee 0.0148 POT | dryRun ok=true
         EXECUTED ok=true | block 0x1a3927d629… | balances.Transfer, treasury.Deposit, ExtrinsicSuccess
         after  Bob 50,005 POT   ← +3 POT, on-chain
```
- **Live reads (anyone, any time):** https://portalpilot-ruby.vercel.app
- **Repo:** https://github.com/ismailridwans/portaldot-hackathon-2026-portalpilot-aerofyta

### Recording tips
- Keep **AI · rules** mode (no API key) — deterministic & offline‑safe; mention Claude can be toggled on for free‑form phrasing.
- A write takes ~6s (block time) — narrate the dry‑run/fee while it includes.
- Record at 1280×800 or larger, clean window, dark theme. YouTube *unlisted* is fine for the link.
