import type { WriteAction } from "../sdk/tx";
export type { WriteAction };

export type ReadOp =
  | { kind: "balance"; address: string }
  | { kind: "account"; address: string }
  | { kind: "recentBlocks"; count: number }
  | { kind: "recentTransfers" }
  | { kind: "networkStatus" }
  | { kind: "capabilities" }
  | { kind: "estimateFee"; to: string; amountPot: string };

export type Intent =
  | { type: "read"; op: ReadOp; engine?: string }
  | { type: "write"; action: WriteAction; engine?: string }
  | { type: "help"; engine?: string }
  | { type: "unknown"; reason: string; suggestions?: string[]; engine?: string };

// Canonical sr25519 dev addresses (ss58 prefix 42). Funded on a local --dev node.
export const DEV_ADDRESSES: Record<string, string> = {
  alice: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
  bob: "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty",
  charlie: "5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y",
  dave: "5DAAnrj7VHTznn2AWBemMuyBwZWs6FNFjdyVXUeYum3PTXFy",
  eve: "5HGjWAeFDfFCWPsjFQdVV2Msvz2XtMktvgocEZcCj68kUMaw",
  ferdie: "5CiPPseXPECbkjWCa6MnjNokrgYjMqmKndv2rSnekmSK2DjL",
};

export function resolveName(token: string): string {
  const t = (token || "").trim().replace(/[.,!?;]$/, "");
  const hit = DEV_ADDRESSES[t.toLowerCase()];
  return hit || t;
}
