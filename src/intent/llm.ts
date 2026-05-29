import { Intent, resolveName } from "./types";

export function hasLLM(): boolean {
  return !!process.env.ANTHROPIC_API_KEY;
}

const SYSTEM = `You translate a user's message into ONE JSON "intent" for PortalPilot, an assistant for the Portaldot blockchain (Substrate-based; native token POT with 14 decimals; ss58 prefix 42; pallets include balances, utility, multisig, identity, contracts).
Return ONLY minified JSON (no prose, no markdown). Pick exactly one shape:
{"type":"read","op":{"kind":"balance","address":"<addr-or-name>"}}
{"type":"read","op":{"kind":"account","address":"<addr-or-name>"}}
{"type":"read","op":{"kind":"recentBlocks","count":<int 1-25>}}
{"type":"read","op":{"kind":"recentTransfers"}}
{"type":"read","op":{"kind":"networkStatus"}}
{"type":"read","op":{"kind":"capabilities"}}
{"type":"read","op":{"kind":"estimateFee","to":"<addr-or-name>","amountPot":"<decimal>"}}
{"type":"write","action":{"kind":"transfer","to":"<addr-or-name>","amountPot":"<decimal>"}}
{"type":"write","action":{"kind":"batchTransfer","transfers":[{"to":"<addr-or-name>","amountPot":"<decimal>"}]}}
{"type":"write","action":{"kind":"remark","message":"<text>"}}
{"type":"help"}
{"type":"unknown","reason":"<short why>"}
Rules: Names alice/bob/charlie/dave/eve/ferdie are valid for <addr-or-name>. NEVER invent or guess an address — if no valid address or known name is given for a transfer/balance, return unknown. Amounts are in POT (human units, not planck). If the request is unsupported, return unknown with a brief reason.`;

export async function parseWithLLM(text: string): Promise<Intent | null> {
  if (!hasLLM()) return null;
  try {
    // Lazy import so the dependency is only touched when a key is present.
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    const client = new Anthropic();
    const model = process.env.ANTHROPIC_MODEL || "claude-haiku-4-5-20251001";
    const msg = await client.messages.create({
      model,
      max_tokens: 400,
      temperature: 0,
      system: [{ type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } } as any],
      messages: [{ role: "user", content: text }],
    });
    const out = (msg.content as any[])
      .map((c) => (c.type === "text" ? c.text : ""))
      .join("")
      .trim();
    const start = out.indexOf("{");
    const end = out.lastIndexOf("}");
    if (start < 0 || end < 0) return null;
    const parsed = JSON.parse(out.slice(start, end + 1)) as Intent;
    normalizeAddresses(parsed);
    (parsed as any).engine = `claude:${model}`;
    return parsed;
  } catch {
    return null;
  }
}

function normalizeAddresses(intent: any): void {
  if (intent?.op?.address) intent.op.address = resolveName(intent.op.address);
  if (intent?.op?.to) intent.op.to = resolveName(intent.op.to);
  if (intent?.action?.to) intent.action.to = resolveName(intent.action.to);
  if (Array.isArray(intent?.action?.transfers))
    intent.action.transfers.forEach((t: any) => (t.to = resolveName(t.to)));
}
