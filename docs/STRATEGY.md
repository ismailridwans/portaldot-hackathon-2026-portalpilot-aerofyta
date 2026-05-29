# PortalPilot — Hackathon Strategy & Research Dossier

> Target event: **Portaldot Online Mini Hackathon S1** (DoraHacks) · Deadline **2026-05-31 00:00 UTC** · Prize pool **3,500 USDT**
> Authored: 2026-05-29 · Status: **Concept LOCKED → building MVP**

---

## 1. Executive summary

**PortalPilot** is an **AI-native command center & transaction copilot for Portaldot**: you talk to the chain in plain English, and it **explains what will happen, simulates it on-chain (`system_dryRun`), shows the exact POT gas fee, and only executes after you confirm**. Because Portaldot has **no block explorer**, the same app doubles as a **live explorer** (block feed + account inspector). The engine is **metadata-driven** (reads the runtime metadata live), so it understands every pallet on the chain automatically.

Primary track: **AI-Powered Onchain Workflows**. Strong secondary value for **Builder Tools** and **Native Onchain Apps**.

Why this wins: it nails the **mandatory** native-deployment + POT-gas criterion (it executes real extrinsics), produces a **compelling, narrative-friendly demo video**, fills **real ecosystem gaps**, and is **honest about AI** (simulate-before-execute, deterministic fallback) — directly answering the judges' explicit warning against "AI as a label."

---

## 2. Hackathon snapshot (verified facts)

| Item | Detail |
|---|---|
| Format | Lightweight online "mini" hackathon; MVP-focused, **not** production-grade |
| Prize | 3,500 USDT total; 1st place gets endorsement + resource support + mentor seat next event; top-3 get 1:1 follow-up; winners join Builder channel + eligible for ecosystem grants/bounties |
| Timeline | Pre-reg 04-20 · Submission opens 05-04 · **Deadline 05-31 00:00 UTC** · Demo Day 05-31 |
| Eligibility | Worldwide; Rust/ink!/Substrate **and** Web2/Web3 devs; solo or team |
| Requirements | Built on Portaldot · **use POT as gas** · runnable **MVP** · demo-ready · **core contracts open source** · GitHub repo + README + demo video |
| Tracks | (1) Native Onchain Apps · (2) Builder Tools for Portaldot · (3) Onchain Identity & Coordination · (4) AI-Powered Onchain Workflows |
| Tags | Rust · substrate · ink! · web3 ecosystem · portaldot |
| Docs | https://portaldot-dev.readthedocs.io/en/latest/ · Discord: https://discord.gg/portaldot |
| Node source | GitHub `portaldotVolunteer/Portaldot-node` (community-maintained) |

### Judging criteria (and how PortalPilot maps)
1. **Portaldot Native Deployment** *(mandatory, can't be copied)* → executes real extrinsics on a Portaldot node, paying **POT** gas. ✅
2. **Demo Completion** (working MVP) → end-to-end NL → dry-run → confirm → on-chain receipt. ✅
3. **Application Value** (market potential) → makes a Rust/Substrate chain usable by non-Rust users + fills explorer gap. ✅
4. **Presentation Quality** → chat UI is the most demo-friendly, narrative format. ✅
5. **Community Voting** → Community Favorite only (not main score); nice-to-have via a clean public UI.

---

## 3. Decisive intelligence (why the field is winnable)

- 🟢 **Zero submissions exist** ("No BUIDLs") against **199 registered hackers**, with ~2 days left. The field is wide open; a polished, genuinely-integrated MVP can realistically place top-3 / 1st.
- 🟢 **Live mainnet, probed directly** (2026-05-29): `wss://mainnet.portaldot.io` → *"Portaldot Mainnet"*, node v2.0.0, `specName=portaldot`, `specVersion=1002`, **healthy** (13 peers, not syncing, head ≈ block **2,526,728**). Confirmed **POT / 14 decimals / ss58 42**.
- 🟢 **Full RPC surface available** including `contracts_instantiate/call` (ink! live), **`system_dryRun`** (safe simulation), **`payment_queryInfo`** (exact fee preview), `state_getMetadata` (full introspection), and live subscriptions. These unlock a safe, generic, real-time copilot.
- 🔴 **Ecosystem gaps (opportunity):** thin, typo-ridden docs ("Geting Started"); **no block explorer linked**; **no faucet documented**; **only a Python SDK** (no JS/TS); minimal ink! guidance. The "Builder Tools" track exists *because the organizer knows DX is weak*.

---

## 4. Portaldot technical reality (dev-level, not marketing)

The whitepaper-style intro claims "Layer0 / 256 shards / 10,000 TPS / quantum-resistant / AI self-evolving contracts." The **developer docs + live probe** show the practical truth: a **standard Substrate node** (`implName=substrate-node`) with `pallet-contracts` (ink! WASM). What actually matters for building:

- **Connect:** `SubstrateInterface(url="wss://mainnet.portaldot.io", ss58_format=42)` (Python) — the official "SDK" is literally `pip install substrate-interface`. **@polkadot/api (JS/TS) connects to the same node** (we standardize on this — it's the missing JS path).
- **Token:** POT, **14 decimals** (unusual; many tools assume 10/12 — a correctness trap others will hit, we won't).
- **Pallets available:** Balances, Utility (batch), Multisig, Identity, Proxy, Assets, Contracts, Scheduler, Staking, Treasury, Bounties, Vesting, Lottery, etc.
- **Local dev node:** `portaldot_dev --dev --alice` (Linux binary; WSL on Windows) → funded Alice at `ws://127.0.0.1:9944`. This is our **POT-gas execution target** for the demo.
- **ink! path** exists (flipper example in docs) but **requires the Rust + cargo-contract toolchain** (not installed here) → treated as optional stretch, not the critical path.

---

## 5. Parallel expert analysis (each lens, then the challenge)

- **Hackathon Strategy Agent:** Highest EV = something the organizer will *keep and fund* (ecosystem leverage), demos flawlessly, is hard to fake, and tells a story. AI + onchain is the trendiest "wow," but risks shallowness → mitigate with genuine dry-run/fee integration. *Challenge:* don't let it become a toy tx-bot; the safety/explainability layer is the moat.
- **Web3 Research Agent:** Biggest gap = **no JS/TS SDK** + brutal onboarding. A copilot that lets non-Rust users operate the chain, plus a JS SDK gift, attacks the largest dev population. *Challenge:* must handle 14-decimal math and ss58-42 correctly or it loses credibility instantly.
- **Blockchain Architect Agent:** Reliable in 2 days on this machine = **TS/Python over native pallets**, no Rust. `system_dryRun` + `payment_queryInfo` make "preview before sign" real. *Challenge:* writes need funds → use a **local dev node** (Alice) for the executed-tx demo; mainnet for reads/dry-run.
- **Product Manager Agent:** The job-to-be-done: "I heard about Portaldot — how do I *use* it without learning Substrate?" The customer is effectively the **organizer** (grants funnel). *Challenge:* one crisp hero loop beats five half-features.
- **Market Research Agent:** "create-X-app", Foundry, Scaffold-ETH, and wallet copilots prove demand for onboarding + NL tooling. No equivalent exists for Portaldot. *Challenge:* differentiate from generic create-app clones via the AI + safety + explorer fusion.
- **Startup Validation Agent (SMART):** Specific/measurable/achievable/relevant/time-bound all pass (see §9). *Challenge:* scope creep is the #1 risk → freeze MVP.
- **Innovation Agent:** Pure scaffolder feels unoriginal; pure tx-bot feels gimmicky. **Fusion** (metadata-driven copilot + dry-run safety + live explorer + JS SDK) is novel, defensible, and on-trend. *Challenge:* keep the AI honest and the core dependency-free.

**Convergence:** a **metadata-driven, dry-run-safe AI copilot + live explorer**, built in TS over native pallets, executing real POT-gas transactions.

---

## 6. Idea exploration & scoring

Scored 1–5 on: Native-fit · Demo wow · App value · Hard-to-replicate · 2-day feasibility (no Rust).

| Idea | Track | Native | Wow | Value | Moat | Feasible | Notes |
|---|---|---|---|---|---|---|---|
| **PortalPilot (AI copilot + explorer)** | AI | 5 | 5 | 5 | 4 | 4 | **Chosen.** Fusion play; honest AI; fills explorer gap |
| TS SDK + `create-portaldot-dapp` scaffolder | Tools | 4 | 3 | 5 | 3 | 5 | Great org value; more replicable; lower video wow |
| Live block explorer | Tools | 4 | 4 | 4 | 3 | 4 | High value but others may build it; folded in as a surface |
| POAP-style attendance badges (ink!) | Identity | 5 | 3 | 3 | 3 | 2 | Needs Rust toolchain → risky |
| Group savings / ROSCA app | Native | 5 | 3 | 3 | 3 | 4 | Solid but generic |
| AI ink! contract auditor | AI | 3 | 4 | 3 | 3 | 2 | Hard to make reliable in 2 days |

**Decision:** PortalPilot, with the explorer and a packaged TS SDK as built-in secondary surfaces (shared data layer = low marginal cost, multi-track value).

---

## 7. The product: PortalPilot

**Tagline:** *Talk to Portaldot. It explains, simulates with real POT fees, and executes safely.*

### Hero loop (must work flawlessly)
`Natural language` → `intent + extrinsic plan` → `system.dryRun simulation` → `exact POT fee preview` → `user Confirm` → `signed submit` → `on-chain receipt (block hash + events)`.

### Capabilities (MVP)
- **Ask (read, live mainnet):** balance of an address · latest blocks · network status/health · which pallets/calls exist · estimate a fee · inspect an account (nonce, identity, balance breakdown).
- **Act (write, local Portaldot node, POT gas):** send POT · batch-transfer to many · (stretch) create a 2-of-3 multisig & propose a transfer.
- **Safety core:** deterministic intent parser (no API key needed) + optional Anthropic LLM for free phrasing; **every** state change is dry-run + fee-previewed + explicitly confirmed; ss58/address + amount validation; existential-deposit warnings. Never auto-signs.
- **Explorer surface:** live block/extrinsic feed + account inspector (because none exists).

### Architecture
`React (Vite, TS) UI` ⇄ `Node/Express API` ⇄ `@polkadot/api` ⇄ Portaldot (mainnet reads/dry-run · local node executes). Reusable SDK modules in `src/sdk` = **the first community JS/TS SDK for Portaldot** (ecosystem gift). Signer seed stays server-side.

---

## 8. Feasibility & risk register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| @polkadot/api can't decode metadata | Low | High | **Spike first** (gate). Fallback: Python substrate-interface backend |
| No mainnet POT / no faucet for write demo | High | Med | Execute on **local dev node** (Alice funded); mainnet for dry-run/fee. Honest framing |
| Local node binary won't run in WSL | Med | Med | Fallback: demo full pipeline to dry-run+fee on mainnet; still proves POT-gas accounting |
| No LLM API key at demo time | Med | Low | **Deterministic parser** is the core; LLM is optional enhancement |
| 14-decimal / ss58-42 math bugs | Med | High | Centralize formatting in SDK; unit-check against live balances |
| Scope creep | High | High | Freeze MVP (§7); multisig/ink!/LLM are stretch only |

---

## 9. SMART validation
- **Specific:** AI copilot + explorer that turns English into safe, fee-previewed POT transactions on Portaldot.
- **Measurable:** zero→first on-chain action in <60s; 100% of writes dry-run+confirmed; N supported intents; live data from real mainnet.
- **Achievable:** TS over native pallets, no Rust; deps install + spike validated up front.
- **Relevant:** hits mandatory native+POT criterion; fills explorer/JS-SDK gaps = organizer's #1 need (grant funnel).
- **Time-bound:** vertical slice by deadline; stretch only if core is flawless.

## 10. Moat (hard for senior teams to replicate in 2 days)
1. **Metadata-driven generality** (works across pallets, not one hardcoded tx).
2. **Dry-run + fee + confirm safety pipeline** (real engineering, not a prompt).
3. **Dual mainnet/local wiring** with correct 14-decimal/ss58-42 handling.
4. **Three surfaces from one data layer** (copilot + explorer + JS SDK) → multi-track value.
5. **Polish + honest-AI narrative** that directly answers the judges' stated criteria.

---

## 11. Demo video plan (≤3 min)
1. *Hook (15s):* "Portaldot has no explorer and a steep Rust learning curve. PortalPilot lets anyone use it in plain English — safely."
2. *Read (30s):* live mainnet — balance, latest blocks, network status, "what can I do on this chain?"
3. *Act (60s):* type "send 5 POT to <addr>" → preview card (plain-English summary, **dry-run = will succeed**, **fee = X POT**) → Confirm → **on-chain receipt + block hash**.
4. *Safety (20s):* show a rejected/garbage command and an amount/address validation catch.
5. *Ecosystem (20s):* "Also ships the first JS/TS SDK + a live explorer for Portaldot."
6. *Close (15s):* roadmap + ask.
