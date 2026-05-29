// Keystone spike: can @polkadot/api connect to and fully decode Portaldot mainnet?
import { ApiPromise, WsProvider } from "@polkadot/api";
import { Keyring } from "@polkadot/keyring";
import { formatBalance } from "@polkadot/util";

const WS = process.env.PORTALDOT_WS || "wss://mainnet.portaldot.io";
const SAMPLE = "5E9oDs9PjpsBbxXxRE9uMaZZhnBAV38n2ouLB28oecBDdeQo";

const die = (code) => { setTimeout(() => process.exit(code), 250); };

try {
  console.log("Connecting to", WS, "...");
  const provider = new WsProvider(WS);
  const api = await ApiPromise.create({ provider });
  await api.isReady;

  const [chain, name, version, health, props] = await Promise.all([
    api.rpc.system.chain(),
    api.rpc.system.name(),
    api.rpc.system.version(),
    api.rpc.system.health(),
    api.rpc.system.properties(),
  ]);
  console.log("\n=== CHAIN ===");
  console.log("chain:", chain.toString(), "| node:", name.toString(), version.toString());
  console.log("health:", health.toHuman());
  console.log("props:", props.toHuman());

  // Metadata decode: list pallets + count of callable extrinsics
  const txSections = Object.keys(api.tx);
  let callCount = 0;
  for (const s of txSections) callCount += Object.keys(api.tx[s]).length;
  console.log("\n=== METADATA DECODE (the keystone) ===");
  console.log("pallets with extrinsics:", txSections.length);
  console.log("total callable extrinsics:", callCount);
  console.log("pallets:", txSections.join(", "));
  console.log("has Contracts pallet (ink!):", !!api.tx.contracts);
  console.log("has Identity pallet:", !!api.tx.identity);
  console.log("has Multisig pallet:", !!api.tx.multisig);
  console.log("has Utility(batch):", !!api.tx.utility);
  console.log("has Assets pallet:", !!api.tx.assets);

  // Live read: account balance
  const acct = await api.query.system.account(SAMPLE);
  const free = acct.data.free.toBigInt();
  const decimals = props.tokenDecimals.unwrapOr([14])[0]?.toNumber?.() ?? 14;
  const symbol = props.tokenSymbol.unwrapOr(["POT"])[0]?.toString?.() ?? "POT";
  formatBalance.setDefaults({ decimals, unit: symbol });
  console.log("\n=== LIVE READ ===");
  console.log(`balance of ${SAMPLE}: ${formatBalance(free)} (raw ${free})`);

  // Build a transfer + fee estimate (no signing/submitting)
  const keyring = new Keyring({ type: "sr25519", ss58Format: 42 });
  const alice = keyring.addFromUri("//Alice");
  const tx = api.tx.balances.transferKeepAlive(SAMPLE, 1n * 10n ** BigInt(decimals));
  const info = await tx.paymentInfo(alice);
  console.log("\n=== FEE PREVIEW (payment_queryInfo) ===");
  console.log("transfer 1 POT -> partialFee:", formatBalance(info.partialFee.toBigInt()), "| weight:", info.weight.toHuman());

  // Latest block
  const head = await api.rpc.chain.getHeader();
  console.log("\n=== HEAD ===");
  console.log("block #", head.number.toNumber(), head.hash.toHex());

  console.log("\n✅ SPIKE PASSED: @polkadot/api fully decodes Portaldot mainnet.");
  await api.disconnect();
  die(0);
} catch (e) {
  console.error("\n❌ SPIKE FAILED:", e?.message || e);
  die(3);
}
