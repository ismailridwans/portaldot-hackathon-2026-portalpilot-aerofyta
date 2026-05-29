import { Intent, resolveName } from "./types";

// base58 substrate address heuristic (32-byte account, ss58 prefix 42)
const ADDR = "[1-9A-HJ-NP-Za-km-z]{45,50}";
const NAME = "alice|bob|charlie|dave|eve|ferdie";
const TARGET = `${ADDR}|${NAME}`;

function clampInt(s: string | undefined, def: number, min: number, max: number): number {
  const n = s ? parseInt(s, 10) : def;
  if (Number.isNaN(n)) return def;
  return Math.max(min, Math.min(max, n));
}

// Fast, deterministic, dependency-free NL → Intent. This is the bulletproof core
// that works with no API key. The optional LLM layer only handles what this misses.
export function parseDeterministic(input: string): Intent {
  const text = (input || "").trim();
  const lower = text.toLowerCase();

  if (/^(help|examples?|commands?)\b/.test(lower) || /what can (you|i)\s+do/.test(lower))
    return { type: "help", engine: "rules" };

  if (/\b(capabilit|pallets?|features)\b/.test(lower) || /what can this chain/.test(lower))
    return { type: "read", op: { kind: "capabilities" }, engine: "rules" };

  if ((/\b(network|chain)\b/.test(lower) && /\b(status|health|info|stats|state)\b/.test(lower)) || /^(status|health)\b/.test(lower))
    return { type: "read", op: { kind: "networkStatus" }, engine: "rules" };

  if ((/\b(recent|latest|last)\b/.test(lower) && /\b(transfers?|transactions?|txs?)\b/.test(lower)) || /\bshow\b.*\btransfers?\b/.test(lower))
    return { type: "read", op: { kind: "recentTransfers" }, engine: "rules" };

  let m = lower.match(/\b(?:recent|latest|last)\s+(\d+)?\s*blocks?\b/);
  if (m) return { type: "read", op: { kind: "recentBlocks", count: clampInt(m[1], 8, 1, 25) }, engine: "rules" };
  if (/\bblocks?\b/.test(lower) && /\b(show|list|get|latest|recent)\b/.test(lower))
    return { type: "read", op: { kind: "recentBlocks", count: 8 }, engine: "rules" };

  // fee / gas estimate
  m = text.match(new RegExp(`(?:fee|cost|gas)\\b[^\\d]*([\\d.]+)\\s*(?:pot)?\\s+to\\s+(${TARGET})`, "i"));
  if (m) return { type: "read", op: { kind: "estimateFee", to: resolveName(m[2]), amountPot: m[1] }, engine: "rules" };

  // transfers — capture one or many "<amount> POT to <target>"
  const transferRe = new RegExp(`([\\d.]+)\\s*(?:pot)?\\s+to\\s+(${TARGET})`, "gi");
  const transfers: { to: string; amountPot: string }[] = [];
  let tm: RegExpExecArray | null;
  while ((tm = transferRe.exec(text)) !== null) transfers.push({ to: resolveName(tm[2]), amountPot: tm[1] });
  if (transfers.length && /\b(send|transfer|pay|airdrop|distribute)\b/.test(lower)) {
    return transfers.length === 1
      ? { type: "write", action: { kind: "transfer", ...transfers[0] }, engine: "rules" }
      : { type: "write", action: { kind: "batchTransfer", transfers }, engine: "rules" };
  }

  // remark / post on-chain message
  m = text.match(/\b(?:remark|post|inscribe|write|note)\b(.+)$/i);
  if (m && /\b(remark|post|inscribe|write|note)\b/i.test(text)) {
    // Strip any chain of leading filler keywords ("on-chain remark:", "message saying", etc.)
    let message = m[1];
    let prev: string;
    do {
      prev = message;
      message = message
        .trim()
        .replace(/^(?:on[- ]?chain|remark|post|inscribe|write|note|message|saying|that)\b[\s:.-]*/i, "")
        .replace(/^[\s:.-]+/, "");
    } while (message !== prev);
    message = message.replace(/^["']|["']$/g, "").trim();
    if (message) return { type: "write", action: { kind: "remark", message }, engine: "rules" };
  }

  // balance
  m = text.match(new RegExp(`balance\\s+(?:of\\s+)?(${TARGET})`, "i")) ||
      text.match(new RegExp(`(?:how much|holdings?|funds?)\\b.*?(${TARGET})`, "i"));
  if (m) return { type: "read", op: { kind: "balance", address: resolveName(m[1]) }, engine: "rules" };

  // explicit account inspection
  m = text.match(new RegExp(`(?:account|inspect|who is|profile|address|lookup)\\s+(${TARGET})`, "i"));
  if (m) return { type: "read", op: { kind: "account", address: resolveName(m[1]) }, engine: "rules" };

  // a bare address pasted alone → inspect it
  const bare = text.match(new RegExp(`^(${ADDR})$`));
  if (bare) return { type: "read", op: { kind: "account", address: bare[1] }, engine: "rules" };

  return {
    type: "unknown",
    reason: "I couldn't map that to a Portaldot action yet.",
    suggestions: [
      "balance of alice",
      "send 1 POT to bob",
      "post on-chain remark: gm Portaldot",
      "show last 5 blocks",
      "network status",
      "what can I do?",
    ],
    engine: "rules",
  };
}
