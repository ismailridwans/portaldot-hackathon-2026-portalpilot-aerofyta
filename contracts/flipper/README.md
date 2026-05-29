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

## To go live, add one of:
- `contracts/flipper/flipper.contract` (bundle: wasm + metadata), or
- `contracts/flipper/flipper.wasm` + `contracts/flipper/flipper.json`

Selectors are read from metadata if present; otherwise canonical flipper selectors are used
(`new` `0x9bae9d5e`, `flip` `0x633aa551`, `get` `0x2f865bd9`).

Then on the **Local** network: “deploy flipper” → “flip the contract” → “read the flipper”.

> All read / transfer / batch / remark features already run natively with **POT gas** and need no contract.
