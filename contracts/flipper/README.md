# Flipper ink! contract — wired for Portaldot's (legacy) pallet-contracts

PortalPilot's copilot can deploy & call an ink! contract on Portaldot via `pallet-contracts`.
Integration: [`../../src/sdk/contracts.ts`](../../src/sdk/contracts.ts).
Copilot: **“deploy flipper” → “flip the contract” → “read the flipper”.**

## ⚠️ This node runs an OLD pallet-contracts
Probing Portaldot's live runtime shows a pre‑2021, rent‑based, **weights‑v1** contracts pallet:

```
instantiateWithCode(endowment, gasLimit: Compact<u64>, code, data, salt)
call(dest, value, gasLimit: Compact<u64>, data)
+ claimSurcharge        # the old "rent" mechanism
```

So `src/sdk/contracts.ts` builds those **legacy extrinsics by hand** (modern `@polkadot/api-contract`
assumes `WeightV2` + `storageDepositLimit` and would not match this node).

**A modern ink! 5 / cargo‑contract 4.x build will be rejected.** You need an **ink! ~3.0‑rc‑compatible**
build whose wasm matches this pallet's `seal` host ABI.

## The artifact is here now

`flipper.contract` in this directory is an **ink! 3.0.0-rc4** build — wasm plus
metadata, 1,712 bytes of code. Its selectors are exactly the canonical ones this
README already predicted:

| | `new` | `default` | `flip` | `get` |
|---|---|---|---|---|
| selector | `0x9bae9d5e` | `0xed4b9d1b` | `0x633aa551` | `0x2f865bd9` |

On the **Local** network: “deploy flipper” → “flip the contract” → “read the flipper”.

### Why rc4 and not an ink! 3.x final

This diagnosis above is right, and the reason is narrower than "old": Portaldot's
pallet still has **rent**, which Substrate removed in December 2021. Every ink! 3.x
*final* shipped after that, so they target a pallet this chain is not. rc4
(2021-07-22) lands a month after this chain's genesis.

That is testable rather than a guess. ink! 3.4.0 compiles, and the module passes
the chain's own validation rules, but instantiating it returns `ContractTrapped`
with **identical gas consumed for every input, including a deliberately invalid
selector** — so it traps before it ever reads the input. Not a dispatch problem;
the startup path itself does not run here.

### Rebuilding it

The README at the repo root suggests `cargo install cargo-contract --locked` and
`cargo contract new flipper`. Those give you a current cargo-contract and ink! 5,
which this node rejects — as this file already warns. The build that works pins
its whole era together:

| | | |
|---|---|---|
| `pallet-contracts` | 3.0.0 | what the chain runs |
| ink! | `3.0.0-rc4` | last line built for a rent-era pallet |
| `cargo-contract` | `0.13.0` | shipped the same day as rc4 |
| `scale-info` | `0.6` | what rc4 declares |
| toolchain | `nightly-2025-03-01` | new enough Cargo, old enough rustc |

Two things bite that are not obvious:

- Every ink! internal crate and SCALE derive crate has to be pinned explicitly.
  Pinning only the parent lets the resolver mix eras, and you get
  `could not find 'InkTrait' in ink_lang_ir`.
- Modern LLVM emits post-MVP wasm (`bulk-memory`, `sign-ext`, and three more)
  that the chain's `wasmi-validation 0.4` cannot parse. `-C target-feature=-...`
  does not reach the precompiled `core`. `-C target-cpu=mvp` does — and it has to
  go through `RUSTC_WRAPPER`, because cargo-contract overwrites `RUSTFLAGS`.

A reproducible Docker build, plus a validator that checks a module against this
pallet's rules before you spend anything, is here:
**https://github.com/jonathan-moore58/portaldot-contract-zero**

Rebuilding from a clean tree reproduces this exact artifact — code hash
`0x25d48e55c672fadcdc3b613f8b3b5c8312efa8619a8349801998cb6721f6da2b`.

### Endowment

`instantiateWithCode` needs **more than 8.35 POT** — `ExistentialDeposit` (1) +
`TombstoneDeposit` (7.35). At or below it the call fails with
`NewContractNotFunded` and the wasm never runs, which reads like a broken module
and is not one. Measured against the runtime: 8.35 refused, 8.36 accepted.
`src/sdk/contracts.ts` sends 30 POT, which also keeps the contract above its own
rent deposit.

> All read / transfer / batch / remark features already run natively with **POT gas** and need no contract.
