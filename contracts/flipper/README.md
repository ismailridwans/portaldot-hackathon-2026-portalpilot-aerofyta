# Flipper ink! contract — optional native-deployment booster

PortalPilot's copilot can **deploy and call an ink! smart contract** on Portaldot via
`pallet-contracts`. The integration lives in [`src/sdk/contracts.ts`](../../src/sdk/contracts.ts)
and the copilot understands **“deploy flipper” → “flip the contract” → “read the flipper”**.

It's wired to read a compiled bundle from this folder. To go live, add one:

```bash
# On Linux/macOS with the ink! toolchain:
rustup target add wasm32-unknown-unknown
rustup component add rust-src
cargo install cargo-contract --locked
cargo contract new flipper && cd flipper && cargo contract build --release
# then copy the bundle here:
cp target/ink/flipper.contract  <repo>/contracts/flipper/flipper.contract
```

Then in the app (Local network): **“deploy flipper”**, **“flip the contract”**, **“read the flipper”**.

> ⚠️ Compatibility: the contract's ink!/metadata version must match the target node's
> `pallet-contracts`. PortalPilot's bundled local dev node reports an older substrate build, so
> deploy against a node whose `pallet-contracts` matches your `cargo-contract` / ink! version.
> Reads, transfers, batches and remarks already run natively with **POT gas** and need no contract.
