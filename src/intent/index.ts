import { Intent } from "./types";
import { parseDeterministic } from "./parser";
import { parseWithLLM, hasLLM } from "./llm";

export * from "./types";
export { hasLLM, parseDeterministic };

// Deterministic-first for reliability and zero-dependency operation; Claude handles
// the long tail of free-form phrasing only when ANTHROPIC_API_KEY is set.
// Execution ALWAYS flows through dry-run + explicit confirmation regardless of engine.
export async function understand(text: string): Promise<Intent> {
  const rules = parseDeterministic(text);
  if (rules.type !== "unknown") return rules;
  if (hasLLM()) {
    const llm = await parseWithLLM(text);
    if (llm) return llm;
  }
  return rules;
}
