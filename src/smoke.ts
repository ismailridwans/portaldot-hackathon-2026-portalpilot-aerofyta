import "dotenv/config";
import { getChainInfo, getAccount, recentBlocks } from "./sdk/index";
import { planAction, executePlan, estimateFee } from "./sdk/tx";
import { understand } from "./intent/index";
import { DEV_ADDRESSES } from "./intent/types";
import { disconnectAll } from "./sdk/portaldot";

// Quiet the two benign @polkadot init warnings so the proof transcript is clean.
const _warn = console.warn.bind(console);
console.warn = (...a: any[]) => {
  const s = a.map(String).join(" ");
  if (s.includes("Unable to map [u8; 32]") || s.includes("MetadataApi not available")) return;
  _warn(...a);
};

const ALICE = DEV_ADDRESSES.alice;
const BOB = DEV_ADDRESSES.bob;

async function main() {
  console.log("════════ PortalPilot end-to-end smoke ════════\n");

  console.log("── MAINNET reads ──");
  try {
    const mc = await getChainInfo("mainnet");
    console.log(`  ${mc.chain} | block #${mc.blockNumber} | ${mc.symbol} ${mc.decimals}dp | ${mc.palletCount} pallets / ${mc.callCount} calls`);
    const blks = await recentBlocks(3, "mainnet");
    console.log(`  recent blocks: ${blks.map((b) => "#" + b.number).join(", ")}`);
  } catch (e: any) {
    console.log("  mainnet read FAILED:", e?.message || e);
  }

  console.log("\n── INTENT parsing ──");
  for (const t of [
    "balance of alice",
    "send 2 POT to bob",
    "airdrop 1 POT to bob and 0.5 POT to charlie",
    "post on-chain remark: gm Portaldot",
    "fee to send 5 POT to bob",
    "show last 5 blocks",
    "network status",
    "make me a sandwich",
  ]) {
    const i = await understand(t);
    console.log(`  "${t}"  →  ${JSON.stringify(i)}`);
  }

  console.log("\n── LOCAL node: plan → dry-run → execute (real POT gas) ──");
  try {
    const lc = await getChainInfo("local");
    console.log(`  ${lc.chain} | block #${lc.blockNumber} | signer Alice`);
    const aliBefore = await getAccount(ALICE, "local");
    const bobBefore = await getAccount(BOB, "local");
    console.log(`  before: Alice ${aliBefore.free}, Bob ${bobBefore.free}`);

    const fee = await estimateFee({ kind: "transfer", to: BOB, amountPot: "3" }, "local");
    console.log(`  fee estimate (3 POT → Bob): ${fee.feeDisplay}`);

    const plan = await planAction({ kind: "transfer", to: BOB, amountPot: "3" }, "local");
    console.log(`  PLAN: ${plan.summary}`);
    console.log(`        fee=${plan.feeDisplay} | dryRun.ran=${plan.dryRun.ran} ok=${plan.dryRun.ok} :: ${plan.dryRun.detail}`);
    if (plan.warnings.length) console.log(`        warnings: ${plan.warnings.join(" | ")}`);

    const rc = await executePlan(plan.id);
    console.log(`  EXECUTED: ok=${rc.ok} block=${rc.blockHash.slice(0, 12)}… tx=${rc.txHash.slice(0, 12)}…`);
    console.log(`        events: ${rc.events.join(", ")}`);

    const bobAfter = await getAccount(BOB, "local");
    console.log(`  after: Bob ${bobAfter.free}`);

    // remark — always-succeeds on-chain write with POT gas
    const plan2 = await planAction({ kind: "remark", message: "PortalPilot ✦ gm Portaldot" }, "local");
    console.log(`  PLAN2: ${plan2.summary} | fee=${plan2.feeDisplay} | dryRun :: ${plan2.dryRun.detail}`);
    const rc2 = await executePlan(plan2.id);
    console.log(`  EXECUTED2: ok=${rc2.ok} events: ${rc2.events.join(", ")}`);
  } catch (e: any) {
    console.log("  local execute FAILED:", e?.message || e);
  }

  console.log("\n════════ done ════════");
  await disconnectAll();
  setTimeout(() => process.exit(0), 300);
}

main().catch((e) => {
  console.error("smoke crashed:", e);
  process.exit(1);
});
