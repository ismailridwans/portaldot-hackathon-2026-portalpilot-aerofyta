import type { ApiPromise } from "@polkadot/api";
import { Abi, CodePromise, ContractPromise } from "@polkadot/api-contract";
import { BN } from "@polkadot/util";
import fs from "node:fs";
import path from "node:path";
import { getApiWithTimeout } from "./portaldot";
import { getSigner } from "./signer";

// Drop a cargo-contract build here (flipper.contract bundle = metadata + wasm).
const FLIPPER = path.resolve(process.cwd(), "contracts/flipper/flipper.contract");
let lastAddress: string | null = null;

export function flipperAvailable(): boolean {
  try {
    return fs.existsSync(FLIPPER);
  } catch {
    return false;
  }
}
export function flipperAddress(): string | null {
  return lastAddress;
}

function loadAbi() {
  const json = JSON.parse(fs.readFileSync(FLIPPER, "utf8"));
  return { abi: new Abi(json), wasm: json.source?.wasm as string };
}
function gas(api: ApiPromise) {
  return api.registry.createType("WeightV2", { refTime: new BN(8_000_000_000), proofSize: new BN(250_000) }) as any;
}

// Deploy the flipper ink! contract via pallet-contracts (contracts.instantiateWithCode under the hood).
export async function deployFlipper(network?: string): Promise<{ address: string; block: string }> {
  if (!flipperAvailable()) {
    throw new Error(
      "No flipper.contract bundled. Build it on Linux with `cargo contract build` and place the result at contracts/flipper/flipper.contract."
    );
  }
  const api = await getApiWithTimeout(network);
  const signer = await getSigner(api.registry.chainSS58 ?? 42);
  const { abi, wasm } = loadAbi();
  const code = new CodePromise(api, abi, wasm);
  const tx = code.tx.new({ gasLimit: gas(api), storageDepositLimit: null, value: 0 }, true);
  return new Promise((resolve, reject) => {
    tx.signAndSend(signer, (r: any) => {
      if (r.status?.isInBlock || r.status?.isFinalized) {
        if (r.dispatchError) return reject(new Error("contract deploy reverted on-chain"));
        const address = r.contract?.address?.toString() || "";
        lastAddress = address || lastAddress;
        const bh = (r.status.isInBlock ? r.status.asInBlock : r.status.asFinalized).toHex();
        resolve({ address, block: bh });
      }
    }).catch(reject);
  });
}

// Mutating call: flip()
export async function flipFlipper(network?: string): Promise<{ block: string }> {
  if (!lastAddress) throw new Error("Deploy the flipper first — say “deploy flipper”.");
  const api = await getApiWithTimeout(network);
  const signer = await getSigner(api.registry.chainSS58 ?? 42);
  const { abi } = loadAbi();
  const contract = new ContractPromise(api, abi, lastAddress);
  const tx = contract.tx.flip({ gasLimit: gas(api), storageDepositLimit: null });
  return new Promise((resolve, reject) => {
    tx.signAndSend(signer, (r: any) => {
      if (r.status?.isInBlock || r.status?.isFinalized) {
        if (r.dispatchError) return reject(new Error("flip() reverted on-chain"));
        resolve({ block: (r.status.isInBlock ? r.status.asInBlock : r.status.asFinalized).toHex() });
      }
    }).catch(reject);
  });
}

// Read-only query: get() -> bool
export async function readFlipper(network?: string): Promise<boolean> {
  if (!lastAddress) throw new Error("Deploy the flipper first — say “deploy flipper”.");
  const api = await getApiWithTimeout(network);
  const signer = await getSigner(api.registry.chainSS58 ?? 42);
  const { abi } = loadAbi();
  const contract = new ContractPromise(api, abi, lastAddress);
  const { output, result } = await contract.query.get(signer.address, { gasLimit: gas(api), storageDepositLimit: null });
  if (result.isErr) throw new Error("contract query failed");
  const val: any = output?.toPrimitive?.();
  return !!(val && (val.ok !== undefined ? val.ok : val));
}
