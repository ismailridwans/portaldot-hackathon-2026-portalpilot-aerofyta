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

## 🎙️ WORD‑FOR‑WORD NARRATION (expressive — ~95s)

> **[0:00 — app on screen, blocks streaming on the right]**
> "Portaldot is a powerful chain — but using it today is *brutal*. No explorer. No JavaScript SDK. No faucet. Every action means hand‑building raw extrinsics, and one wrong byte is gone forever. Developers lose hours; everyone else is locked out. So we built **PortalPilot** — the AI copilot that turns this entire chain into a conversation."
>
> **[0:18 — gesture to the explorer]**
> "First, the thing Portaldot never had: a **live explorer**, streaming real blocks. And right here — you just *talk* to it."
>
> **[0:28 — type the command]**
> "Watch. I'll move tokens the way I'd *say* it: **send 1 POT to Bob.** No code. No Rust. No docs."
>
> **[0:40 — plan card appears]**
> "Instantly, PortalPilot reads my intent and builds the *exact* extrinsic from the chain's live metadata. But here's what makes it safe — before anything is signed, it **simulates the transaction on the real chain** and shows me the **exact POT fee: 0.0147.** The AI proposes, the chain verifies, and **I** decide."
>
> **[1:02 — click Confirm & sign]**
> "It checks out — so I authorize. One click: **Confirm and sign.**"
>
> **[1:12 — receipt appears, point at the events]**
> "Done — for real. A live transaction, in a real block. And *this* is the proof that **POT was paid as gas**: the **`treasury.Deposit`** event. One English sentence → a finalized, safe, on‑chain transaction — in seconds."
>
> **[1:30 — close, with conviction]**
> "That's PortalPilot — the **first JavaScript SDK** and the **only live explorer** Portaldot was missing, wrapped in an AI copilot that makes the costly mistake impossible to make. We don't just make Portaldot *easier* — we make it usable by **anyone.** Thank you."

*(~210 words ≈ ~95s. Trim the opening pain‑list to hit a strict 90s. For technical depth, name the extrinsic aloud: "balances transferKeepAlive.")*

## ⚡ 60‑SECOND CUT (punchy)
> "Portaldot is powerful — but brutal to use: no explorer, no JS SDK, raw extrinsics, irreversible mistakes. **PortalPilot turns it into a conversation.** I just type **send 1 POT to Bob** — no code. It builds the exact extrinsic, **simulates it on the real chain**, and shows the **exact POT fee, 0.0147.** The AI proposes; *I* authorize. One click — and it's a real transaction in a real block, with the **`treasury.Deposit`** event proving POT paid as gas. The first JS SDK, the only live explorer, an AI copilot that makes mistakes impossible. **That's PortalPilot.**"

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
