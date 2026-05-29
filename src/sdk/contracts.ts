import type { ApiPromise } from "@polkadot/api";
import { u8aConcat, hexToU8a, u8aToHex, BN } from "@polkadot/util";
import { randomAsU8a } from "@polkadot/util-crypto";
import fs from "node:fs";
import path from "node:path";
import { getApiWithTimeout } from "./portaldot";
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
      for (const c of spec.constructors || []) if (c.label === "new" && c.selector) sel.new = c.selector;
      for (const m of spec.messages || []) if (sel[m.label] !== undefined && m.selector) sel[m.label] = m.selector;
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

const ENDOWMENT = new BN(10).pow(new BN(14)); // 1 POT — legacy instantiate requires an endowment
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
    const res: any = await (api.call as any).contractsApi.call(signer.address, lastAddress, 0, GAS, f.sel.get);
    const hex: string = (res?.result?.isOk ? res.result.asOk.data?.toHex?.() : res?.toHex?.()) || "0x00";
    return hex.slice(-2) === "01";
  } catch {
    return null; // legacy ContractsApi shape may differ; flip events still prove state change
  }
}
