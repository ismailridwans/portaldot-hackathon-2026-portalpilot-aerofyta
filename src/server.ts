import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

import { getChainInfo, getAccount, recentBlocks, recentTransfers, NETWORKS } from "./sdk/index";
import { planAction, executePlan, estimateFee } from "./sdk/tx";
import { shortAddr } from "./sdk/format";
import { understand, hasLLM } from "./intent/index";
import { DEV_ADDRESSES } from "./intent/types";
import { flipperAvailable, deployFlipper, flipFlipper, readFlipper } from "./sdk/contracts";

// Quiet two benign @polkadot/api init warnings so demo logs stay clean.
const _warn = console.warn.bind(console);
console.warn = (...a: any[]) => {
  const s = a.map(String).join(" ");
  if (s.includes("Unable to map [u8; 32]") || s.includes("MetadataApi not available")) return;
  _warn(...a);
};

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(cors());
app.use(express.json());
const PORT = Number(process.env.PORT || 8787);

const errMsg = (e: any) => e?.message || String(e);

const NAME_BY_ADDR: Record<string, string> = Object.fromEntries(
  Object.entries(DEV_ADDRESSES).map(([n, a]) => [a, n[0].toUpperCase() + n.slice(1)])
);
const shortName = (addr: string) => NAME_BY_ADDR[addr] || shortAddr(addr);

const SUGGESTIONS = [
  "balance of alice",
  "send 1 POT to bob",
  "airdrop 1 POT to bob and 2 POT to charlie",
  "post on-chain remark: gm Portaldot",
  "fee to send 5 POT to bob",
  "show last 5 blocks",
  "recent transfers",
  "network status",
  "what can I do?",
];
const HELP_TEXT =
  "I'm PortalPilot — your copilot for Portaldot. Ask me to read the chain (balances, blocks, transfers, status) or to act (send POT, batch transfers, post an on-chain remark). Every action is simulated with a dry-run and shows the exact POT fee before you confirm.";

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    llm: hasLLM(),
    networks: NETWORKS,
    signer: process.env.PORTALDOT_SIGNER_SEED ? "custom" : "//Alice (dev)",
  });
});

app.get("/api/chain", async (req, res) => {
  try {
    res.json(await getChainInfo(req.query.network as string));
  } catch (e) {
    res.status(502).json({ error: errMsg(e) });
  }
});

app.get("/api/account/:address", async (req, res) => {
  try {
    res.json(await getAccount(req.params.address, req.query.network as string));
  } catch (e) {
    res.status(400).json({ error: errMsg(e) });
  }
});

app.get("/api/blocks", async (req, res) => {
  try {
    res.json(await recentBlocks(Number(req.query.count || 8), req.query.network as string));
  } catch (e) {
    res.status(502).json({ error: errMsg(e) });
  }
});

app.get("/api/transfers", async (req, res) => {
  try {
    res.json(await recentTransfers(12, req.query.network as string));
  } catch (e) {
    res.status(502).json({ error: errMsg(e) });
  }
});

async function runRead(op: any, network?: string) {
  switch (op.kind) {
    case "balance": {
      const a = await getAccount(op.address, network);
      return { answer: `${shortName(a.normalized)} holds ${a.free} (free), nonce ${a.nonce}.`, data: a, view: "account" };
    }
    case "account": {
      const a = await getAccount(op.address, network);
      return {
        answer: `${shortName(a.normalized)} — ${a.free} free, ${a.total} total, nonce ${a.nonce}${
          a.identity ? `, identity “${a.identity}”` : ""
        }.`,
        data: a,
        view: "account",
      };
    }
    case "recentBlocks": {
      const b = await recentBlocks(op.count, network);
      return { answer: `Latest ${b.length} blocks (head #${b[0]?.number}).`, data: b, view: "blocks" };
    }
    case "recentTransfers": {
      const t = await recentTransfers(12, network);
      return {
        answer: t.length ? `Found ${t.length} recent POT transfer(s) on-chain.` : "No transfers in the last 12 blocks.",
        data: t,
        view: "transfers",
      };
    }
    case "networkStatus": {
      const c = await getChainInfo(network);
      return {
        answer: `${c.chain} — block #${c.blockNumber}, ${c.specName} v${c.specVersion}, ${c.palletCount} pallets / ${c.callCount} extrinsics, token ${c.symbol} (${c.decimals} dp)${
          c.peers !== undefined ? `, ${c.peers} peers` : ""
        }.`,
        data: c,
        view: "chain",
      };
    }
    case "capabilities": {
      const c = await getChainInfo(network);
      return {
        answer: `Portaldot exposes ${c.callCount} callable extrinsics across ${c.palletCount} pallets. I can read balances, blocks, transfers and status, and — with your confirmation — send POT, batch transfers, and post on-chain remarks. Every action is dry-run simulated and shows the exact POT fee first.`,
        data: c,
        view: "chain",
      };
    }
    case "estimateFee": {
      const f = await estimateFee({ kind: "transfer", to: op.to, amountPot: op.amountPot }, network);
      return { answer: `Estimated fee for ${f.summary}: ${f.feeDisplay}.`, data: f, view: "fee" };
    }
  }
  return { answer: "Unsupported read.", data: null, view: "none" };
}

app.post("/api/ask", async (req, res) => {
  try {
    const text = String(req.body?.text || "");
    const network = req.body?.network as string | undefined;
    if (!text.trim()) return res.status(400).json({ error: "empty message" });

    // ── ink! smart-contract path (pallet-contracts) — contained; only triggers on contract phrasing ──
    const lc0 = text.toLowerCase();
    if (/\b(flipper|ink!?|smart\s?contract)\b/.test(lc0)) {
      const say = (a: string, data: any = null) =>
        res.json({ kind: "read", intent: { type: "read", engine: "rules" }, answer: a, view: "none", data });
      try {
        if (/\b(deploy|instantiate|launch|create|new)\b/.test(lc0)) {
          if (!flipperAvailable())
            return say(
              "ink! deployment is wired up here via pallet-contracts — but no compiled flipper.contract is bundled for this node yet. Build one on Linux with `cargo contract build` and drop it at contracts/flipper/flipper.contract, then say “deploy flipper” again."
            );
          const d = await deployFlipper(network);
          return say(`Deployed the flipper ink! contract on Portaldot at ${d.address} (block ${d.block.slice(0, 12)}…). Now try “flip the contract” or “read the flipper”.`, d);
        }
        if (/\bflip\b/.test(lc0)) {
          const f = await flipFlipper(network);
          return say(`Flipped the contract — block ${f.block.slice(0, 12)}…. Say “read the flipper” to see the new value.`, f);
        }
        if (/\b(read|get|value|state|current|show)\b/.test(lc0)) {
          const v = await readFlipper(network);
          return say(`The flipper's current value is ${v}.`, { value: v });
        }
      } catch (e) {
        return say("Contract op failed: " + errMsg(e));
      }
    }

    const intent = await understand(text);

    if (intent.type === "read") {
      const r = await runRead(intent.op, network);
      return res.json({ kind: "read", intent, ...r });
    }
    if (intent.type === "write") {
      const plan = await planAction(intent.action, network);
      return res.json({ kind: "plan", intent, plan });
    }
    if (intent.type === "help") {
      return res.json({ kind: "help", intent, answer: HELP_TEXT, suggestions: SUGGESTIONS });
    }
    return res.json({
      kind: "unknown",
      intent,
      answer: (intent as any).reason || "I couldn't understand that.",
      suggestions: (intent as any).suggestions || SUGGESTIONS,
    });
  } catch (e) {
    res.status(400).json({ error: errMsg(e) });
  }
});

app.post("/api/execute", async (req, res) => {
  try {
    const planId = String(req.body?.planId || "");
    if (!planId) return res.status(400).json({ error: "missing planId" });
    res.json(await executePlan(planId));
  } catch (e) {
    res.status(400).json({ error: errMsg(e) });
  }
});

// Serve the built frontend if present (single-command production demo).
const dist = path.resolve(__dirname, "../app/dist");
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.use((_req, res) => res.sendFile(path.join(dist, "index.html")));
}

app.listen(PORT, () => {
  console.log(`PortalPilot backend → http://127.0.0.1:${PORT}  (LLM: ${hasLLM() ? "on" : "off/deterministic"})`);
});
