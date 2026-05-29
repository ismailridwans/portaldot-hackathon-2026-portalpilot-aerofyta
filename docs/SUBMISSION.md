# 🌀 PortalDot Hackathon 2026 — Submission

## 2.1 Public Demo Submission

- **Repository name (rename to this per spec):** `portaldot-hackathon-2026-portalpilot-aerofyta`
  - ✅ Named per spec: `https://github.com/ismailridwans/portaldot-hackathon-2026-portalpilot-aerofyta`
- **Root includes:** ✅ `README.md` (template format) · ✅ `LICENSE` (MIT) · ✅ full source & config.

## 2.2 Submission Form

### Basic Info
- **Project Name:** PortalPilot
- **Repository URL:** https://github.com/ismailridwans/portaldot-hackathon-2026-portalpilot-aerofyta
- **Demo Video URL:** `‹add your demo video URL›`

### Demo Scene Description
*(≤200 words — the core flow a reviewer can verify in the video)*

On the **Local** network, the user types **“send 1 POT to bob”** in plain English. PortalPilot parses the intent, builds the `balances.transferKeepAlive` extrinsic from the chain's **live runtime metadata**, **simulates it on‑chain** (`system.dryRun`), and shows a preview card: the exact extrinsic, recipient, amount, signer, the **POT network fee** (e.g. 0.0147 POT), and the dry‑run result. A **7‑stage workflow tracer** (Understand → Compose → Simulate → Price → Confirm → Submit → Finalized) animates live. The user clicks **“Confirm & sign”**; the transaction is submitted and the **receipt** shows the block hash and on‑chain events (`balances.Transfer`, `treasury.Deposit`, `system.ExtrinsicSuccess`) — confirming **POT gas** was paid. The user also runs reads (`balance of alice`, `show last 5 blocks`, `network status`) answered from live data, while the right‑hand **explorer** streams blocks. Flipping the toggle to **Mainnet** shows live mainnet data, fees and dry‑runs. An unfundable action is caught by the dry‑run and **Confirm is disabled**.

### Technical Highlights
*(≤300 words)*

Built entirely on the **Substrate** framework via `@polkadot/api`. PortalPilot is **metadata‑driven**: it loads Portaldot's runtime metadata at connect time, so it understands all **25 pallets / 155 extrinsics** without hardcoding. **Correctness:** it handles Portaldot's POT token at **14 decimals** and **ss58 prefix 42** with BigInt math (the local dev node does not advertise `system.properties`, which breaks naïve tooling). **Safety pipeline:** every state change is signed once, **simulated via `system.dryRun`**, priced via **`payment.queryInfo`**, and the exact signed payload that is simulated is the one submitted — the Confirm button is disabled when the dry‑run would fail. **Capabilities:** `balances.transferKeepAlive`, `utility.batchAll` (airdrops), `system.remarkWithEvent`, plus **ink! contract deploy/call** wired via `pallet-contracts` (`@polkadot/api-contract`). **Architecture:** React + Vite frontend ⇄ Node/Express API ⇄ `@polkadot/api` ⇄ Portaldot (mainnet for reads/fee/dry‑run; local node for POT‑gas writes). The NL layer is a zero‑dependency deterministic parser with an optional **Claude** layer — the AI only proposes intent, the chain verifies, the human authorizes. PortalPilot also ships the **first community JS/TS SDK** for Portaldot (`src/sdk`) and a **built‑in live explorer**, since the chain has none. Verified end‑to‑end: real POT‑gas transactions emit `treasury.Deposit` + `system.ExtrinsicSuccess`.

### Declaration
I/We confirm that:
- All code was **independently developed during this hackathon** or legally modified from official Substrate templates;
- All delivery requirements of this specification have been met;
- I/We agree that the organizing committee may **publicly review and technically reproduce** the code.

---

*Mandatory criteria mapping, run instructions, and architecture detail are in the root [`README.md`](../README.md).*
