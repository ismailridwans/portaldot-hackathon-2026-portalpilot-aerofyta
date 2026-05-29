import { Keyring } from "@polkadot/keyring";
import { cryptoWaitReady } from "@polkadot/util-crypto";
import type { KeyringPair } from "@polkadot/keyring/types";

let ready: Promise<boolean> | null = null;
export async function ensureCrypto(): Promise<void> {
  if (!ready) ready = cryptoWaitReady();
  await ready;
}

// Server-side demo signer. Defaults to //Alice (funded on a local --dev node).
// Override with PORTALDOT_SIGNER_SEED (a //dev path or a 12/24-word mnemonic).
export async function getSigner(ss58 = 42): Promise<KeyringPair> {
  await ensureCrypto();
  const keyring = new Keyring({ type: "sr25519", ss58Format: ss58 });
  const seed = process.env.PORTALDOT_SIGNER_SEED || "//Alice";
  return keyring.addFromUri(seed);
}

// Well-known dev accounts (only valid/funded on a local --dev chain).
export async function devAccount(name: string, ss58 = 42): Promise<KeyringPair> {
  await ensureCrypto();
  const keyring = new Keyring({ type: "sr25519", ss58Format: ss58 });
  return keyring.addFromUri(`//${name}`);
}
