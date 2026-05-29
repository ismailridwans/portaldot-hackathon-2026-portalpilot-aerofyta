import { getApiWithTimeout, chainMeta } from "./portaldot";
import { formatPot } from "./format";
import { decodeAddress, encodeAddress } from "@polkadot/util-crypto";

export function isValidAddress(addr: string, ss58 = 42): { valid: boolean; normalized?: string; error?: string } {
  try {
    const decoded = decodeAddress(addr);
    if (decoded.length !== 32) return { valid: false, error: "not a 32-byte account id" };
    return { valid: true, normalized: encodeAddress(decoded, ss58) };
  } catch (e: any) {
    return { valid: false, error: e?.message || "invalid address" };
  }
}

export interface AccountInfo {
  address: string;
  normalized: string;
  nonce: number;
  freePlanck: string;
  reservedPlanck: string;
  totalPlanck: string;
  free: string;
  total: string;
  identity?: string | null;
  exists: boolean;
}

export async function getAccount(address: string, network?: string): Promise<AccountInfo> {
  const api = await getApiWithTimeout(network);
  const { decimals, symbol, ss58 } = chainMeta(api);
  const v = isValidAddress(address, ss58);
  if (!v.valid) throw new Error(`Invalid address: ${v.error}`);
  const acc: any = await api.query.system.account(v.normalized);
  const free = acc.data.free.toBigInt();
  const reserved = acc.data.reserved.toBigInt();
  const nonce = acc.nonce.toNumber();
  return {
    address,
    normalized: v.normalized!,
    nonce,
    freePlanck: free.toString(),
    reservedPlanck: reserved.toString(),
    totalPlanck: (free + reserved).toString(),
    free: formatPot(free, decimals, symbol),
    total: formatPot(free + reserved, decimals, symbol),
    identity: await getIdentity(api, v.normalized!),
    exists: free + reserved > 0n || nonce > 0,
  };
}

async function getIdentity(api: any, address: string): Promise<string | null> {
  try {
    if (!api.query.identity?.identityOf) return null;
    const id: any = await api.query.identity.identityOf(address);
    if (id?.isSome) {
      const reg = id.unwrap();
      const info = reg.info ?? (Array.isArray(reg) ? reg[0]?.info : undefined);
      const disp = info?.display;
      if (disp?.isRaw) return disp.asRaw.toUtf8();
    }
  } catch {
    /* identity is best-effort */
  }
  return null;
}
