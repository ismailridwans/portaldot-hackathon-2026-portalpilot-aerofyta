import type { ApiPromise } from "@polkadot/api";
import { u8aConcat, hexToU8a, u8aToHex, BN } from "@polkadot/util";
import { randomAsU8a } from "@polkadot/util-crypto";
import fs from "node:fs";
import path from "node:path";
import { getApiWithTimeout, sendRaw } from "./portaldot";
import { getSigner } from "./signer";

/*
 * Portaldot runs a LEGACY pallet-contracts (rent-based, weights-v1):
 *   contracts.instantiateWithCode(endowment, gasLimit: Compact<u64>, code, data, salt)
 *   contracts.call(dest, value, gasLimit: Compact<u64>, data)
 * So we build the extrinsics by hand (modern @polkadot/api-contract assumes WeightV2 and
 * would NOT match this node). Selectors come from the contract metadata when present, else
 * the canonical flipper defaults. Provide a build at contracts/flipper/ (ink! ~3.0-compatible).
 */

const DIR = path.resolve(process.cwd(), "contracts/flipper");
let lastAddress: string | null = null;

interface Loaded {
  wasm: Uint8Array;
  sel: Record<string, string>; // new / flip / get -> 0x… selector
}

/**
 * Read a constructor/message name out of ink! metadata.
 *
 * ink! 3.1+ calls the field `label` and stores a string. The ~3.0-rc metadata
 * this node needs (metadataVersion 0.1.0) calls it `name` and stores a path
 * array: `"name": ["flip"]`. Reading only `label` finds nothing, silently
 * falls back to the canonical selectors below, and happens to be right for the
 * flipper — but would be wrong for any other contract, without saying so.
 */
function labelOf(x: any): string | null {
  const n = x?.label ?? x?.name;
  const s = Array.isArray(n) ? n[n.length - 1] : n;
  return typeof s === "string" ? s : null;
}

function loadFlipper(): Loaded | null {
  try {
    const bundle = path.join(DIR, "flipper.contract");
    const wasmFile = path.join(DIR, "flipper.wasm");
    const metaFile = path.join(DIR, "flipper.json");
    let wasmHex: string | undefined;
    let spec: any;
    if (fs.existsSync(bundle)) {
      const j = JSON.parse(fs.readFileSync(bundle, "utf8"));
      wasmHex = j.source?.wasm;
      spec = j.spec;
    } else {
      if (fs.existsSync(wasmFile)) wasmHex = u8aToHex(new Uint8Array(fs.readFileSync(wasmFile)));
      if (fs.existsSync(metaFile)) spec = JSON.parse(fs.readFileSync(metaFile, "utf8")).spec;
    }
    if (!wasmHex) return null;
    // canonical flipper selectors (blake2 of the label); overridden by metadata if available
    const sel: Record<string, string> = { new: "0x9bae9d5e", flip: "0x633aa551", get: "0x2f865bd9" };
    if (spec) {
      for (const c of spec.constructors || []) if (labelOf(c) === "new" && c.selector) sel.new = c.selector;
      for (const m of spec.messages || []) {
        const l = labelOf(m);
        if (l && sel[l] !== undefined && m.selector) sel[l] = m.selector;
      }
    }
    return { wasm: hexToU8a(wasmHex), sel };
  } catch {
    return null;
  }
}

export function flipperAvailable(): boolean {
  return !!loadFlipper();
}
export function flipperAddress(): string | null {
  return lastAddress;
}

// The legacy pallet rejects anything at or below its subsistence threshold,
// Balances.ExistentialDeposit (1 POT) + Contracts.TombstoneDeposit (7.35 POT)
// = 8.35 POT exactly, with:
//
//   Module { index: 13, error: 9, message: "NewContractNotFunded" }
//
// Measured against the runtime: 8.35 POT is refused, 8.36 POT instantiates.
// That error is worth recognising, because the wasm never runs when it fires —
// it reads like a broken module and is not one. 30 POT also keeps the contract
// clear of its own rent deposit (DepositPerContract is 7.35 POT), so it will
// not be evicted while you are demoing it.
const ENDOWMENT = new BN(30).mul(new BN(10).pow(new BN(14))); // 30 POT
const GAS = new BN("500000000000"); // legacy Compact<u64> gas budget

function withArgBool(sel: string, v: boolean): string {
  return u8aToHex(u8aConcat(hexToU8a(sel), new Uint8Array([v ? 1 : 0])));
}

export async function deployFlipper(network?: string): Promise<{ address: string; block: string }> {
  const f = loadFlipper();
  if (!f) throw new Error("No flipper build in contracts/flipper/ — add flipper.contract (or flipper.wasm + flipper.json) compiled for this node's legacy pallet-contracts.");
  const api = await getApiWithTimeout(network);
  const signer = await getSigner(api.registry.chainSS58 ?? 42);
  const data = withArgBool(f.sel.new, true);
  const salt = u8aToHex(randomAsU8a(4));
  // legacy signature: instantiateWithCode(endowment, gasLimit, code, data, salt)
  const tx = (api.tx.contracts as any).instantiateWithCode(ENDOWMENT, GAS, u8aToHex(f.wasm), data, salt);
  return new Promise((resolve, reject) => {
    tx.signAndSend(signer, ({ status, events, dispatchError }: any) => {
      if (status.isInBlock || status.isFinalized) {
        if (dispatchError) return reject(new Error("instantiate reverted on-chain"));
        let address = "";
        for (const { event } of events) {
          if (event.section === "contracts" && event.method === "Instantiated") {
            const d = event.data;
            address = d[d.length - 1].toString();
          }
        }
        lastAddress = address || lastAddress;
        resolve({ address, block: (status.isInBlock ? status.asInBlock : status.asFinalized).toHex() });
      }
    }).catch(reject);
  });
}

export async function flipFlipper(network?: string): Promise<{ block: string }> {
  if (!lastAddress) throw new Error("Deploy the flipper first — say “deploy flipper”.");
  const f = loadFlipper();
  if (!f) throw new Error("No flipper build available.");
  const api = await getApiWithTimeout(network);
  const signer = await getSigner(api.registry.chainSS58 ?? 42);
  // legacy signature: call(dest, value, gasLimit, data)
  const tx = (api.tx.contracts as any).call(lastAddress, 0, GAS, f.sel.flip);
  return new Promise((resolve, reject) => {
    tx.signAndSend(signer, ({ status, dispatchError }: any) => {
      if (status.isInBlock || status.isFinalized) {
        if (dispatchError) return reject(new Error("flip() reverted on-chain"));
        resolve({ block: (status.isInBlock ? status.asInBlock : status.asFinalized).toHex() });
      }
    }).catch(reject);
  });
}

export async function readFlipper(network?: string): Promise<boolean | null> {
  if (!lastAddress) throw new Error("Deploy the flipper first — say “deploy flipper”.");
  const f = loadFlipper();
  if (!f) throw new Error("No flipper build available.");
  const api = await getApiWithTimeout(network);
  const signer = await getSigner(api.registry.chainSS58 ?? 42);
  try {
    // The runtime API is the modern one as far as @polkadot/api is concerned —
    // api.call.contractsApi.call() throws "Expected 6 arguments, found 5",
    // because it wants a storageDepositLimit this pallet does not take. The
    // contracts_call RPC takes the 2021 shape, so go straight at it.
    const res: any = await sendRaw(network, "contracts_call", [
      { origin: signer.address, dest: lastAddress, value: 0, gasLimit: GAS.toNumber(), inputData: f.sel.get },
    ]);
    // { debugMessage, gasConsumed, result: { Ok: { data: "0x01", flags: 0 } } }
    const data: string | undefined = res?.result?.Ok?.data;
    if (typeof data !== "string") return null;
    return data.slice(-2) === "01";
  } catch {
    return null; // flip events still prove the state change
  }
}
