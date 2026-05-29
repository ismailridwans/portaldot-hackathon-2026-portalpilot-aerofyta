import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "./api";

type Network = "mainnet" | "local";
type Msg = {
  id: number;
  role: "user" | "assistant";
  text?: string;
  resp?: any;
  receipt?: any;
  executing?: boolean;
  error?: string;
};

const SUGGESTIONS = [
  "balance of alice",
  "send 1 POT to bob",
  "airdrop 1 POT to bob and 2 POT to charlie",
  "post on-chain remark: gm Portaldot",
  "fee to send 5 POT to bob",
  "show last 5 blocks",
  "recent transfers",
  "network status",
];

const GREETING =
  "I'm PortalPilot — your AI copilot for Portaldot. Ask me to read the chain or to act. Every state-changing action is dry-run simulated and shows the exact POT fee before you confirm. Try one of these:";

let idc = 1;

export default function App() {
  const [network, setNetwork] = useState<Network>("local");
  const [chain, setChain] = useState<any>(null);
  const [chainErr, setChainErr] = useState("");
  const [blocks, setBlocks] = useState<any[]>([]);
  const [messages, setMessages] = useState<Msg[]>(() => [
    { id: idc++, role: "assistant", resp: { kind: "help", answer: GREETING, suggestions: SUGGESTIONS } },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [llm, setLlm] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.health().then((h: any) => setLlm(!!h.llm)).catch(() => {});
  }, []);

  const refresh = useCallback(async () => {
    try {
      const c = await api.chain(network);
      setChain(c);
      setChainErr("");
    } catch (e: any) {
      setChainErr(e?.message || "offline");
      setChain(null);
    }
    try {
      setBlocks(await api.blocks(network, 8));
    } catch {
      setBlocks([]);
    }
  }, [network]);

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 6000);
    return () => clearInterval(t);
  }, [refresh]);

  useEffect(() => {
    scroller.current?.scrollTo({ top: 1e9, behavior: "smooth" });
  }, [messages]);

  async function send(text: string) {
    const t = text.trim();
    if (!t || busy) return;
    setInput("");
    setMessages((m) => [...m, { id: idc++, role: "user", text: t }]);
    setBusy(true);
    try {
      const resp = await api.ask(t, network);
      setMessages((m) => [...m, { id: idc++, role: "assistant", resp }]);
    } catch (e: any) {
      setMessages((m) => [...m, { id: idc++, role: "assistant", error: e?.message || "request failed" }]);
    } finally {
      setBusy(false);
    }
  }

  async function confirmPlan(msgId: number, planId: string) {
    setMessages((m) => m.map((x) => (x.id === msgId ? { ...x, executing: true } : x)));
    try {
      const receipt = await api.execute(planId);
      setMessages((m) => m.map((x) => (x.id === msgId ? { ...x, executing: false, receipt } : x)));
      refresh();
    } catch (e: any) {
      setMessages((m) =>
        m.map((x) => (x.id === msgId ? { ...x, executing: false, receipt: { ok: false, error: e?.message } } : x))
      );
    }
  }

  function cancelPlan(msgId: number) {
    setMessages((m) => m.map((x) => (x.id === msgId ? { ...x, receipt: { cancelled: true } } : x)));
  }

  return (
    <div className="app">
      <Header network={network} setNetwork={setNetwork} chain={chain} chainErr={chainErr} llm={llm} />
      <div className="body">
        <main className="chat">
          <div className="messages" ref={scroller}>
            {messages.map((msg) => (
              <MessageView key={msg.id} msg={msg} onConfirm={confirmPlan} onCancel={cancelPlan} onChip={send} />
            ))}
            {busy && (
              <div className="msg assistant">
                <div className="avatar">✦</div>
                <div className="bubble typing">
                  <span /><span /><span />
                </div>
              </div>
            )}
          </div>
          <Composer input={input} setInput={setInput} onSend={() => send(input)} busy={busy} network={network} />
        </main>
        <Explorer network={network} chain={chain} blocks={blocks} chainErr={chainErr} />
      </div>
    </div>
  );
}

function Header({ network, setNetwork, chain, chainErr, llm }: any) {
  return (
    <header className="header">
      <div className="brand">
        <div className="logo">◉</div>
        <div>
          <div className="title">PortalPilot</div>
          <div className="tag">AI copilot &amp; command center for Portaldot</div>
        </div>
      </div>
      <div className="head-right">
        <div className={"chain-pill " + (chainErr ? "off" : "on")}>
          <span className="dot" />
          {chain ? (
            <span>
              {chain.chain} · #{Number(chain.blockNumber).toLocaleString()} · {chain.symbol} · {chain.palletCount}p/
              {chain.callCount}x
            </span>
          ) : (
            <span>{chainErr ? (network === "local" ? "local node offline" : "offline") : "connecting…"}</span>
          )}
        </div>
        <div className="net-toggle">
          <button className={network === "mainnet" ? "active" : ""} onClick={() => setNetwork("mainnet")}>
            Mainnet
          </button>
          <button className={network === "local" ? "active" : ""} onClick={() => setNetwork("local")}>
            Local
          </button>
        </div>
        <div className={"ai-badge " + (llm ? "on" : "")} title={llm ? "Claude NL understanding enabled" : "Deterministic parser (no API key needed)"}>
          {llm ? "AI · Claude" : "AI · rules"}
        </div>
      </div>
    </header>
  );
}

function Composer({ input, setInput, onSend, busy, network }: any) {
  return (
    <div className="composer">
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onSend();
        }}
        placeholder={`Ask PortalPilot on ${network}…  e.g. "send 1 POT to bob"`}
        disabled={busy}
        autoFocus
      />
      <button className="btn primary" onClick={onSend} disabled={busy || !input.trim()}>
        Send
      </button>
    </div>
  );
}

function MessageView({ msg, onConfirm, onCancel, onChip }: any) {
  if (msg.role === "user")
    return (
      <div className="msg user">
        <div className="bubble">{msg.text}</div>
      </div>
    );
  if (msg.error)
    return (
      <div className="msg assistant">
        <div className="avatar err">!</div>
        <div className="bubble error">{msg.error}</div>
      </div>
    );
  const r = msg.resp;
  return (
    <div className="msg assistant">
      <div className="avatar">✦</div>
      <div className="bubble">
        {r.answer && <div className="answer">{r.answer}</div>}
        {r.kind === "read" && <ReadView view={r.view} data={r.data} />}
        {r.kind === "plan" && <PlanCard msg={msg} plan={r.plan} onConfirm={onConfirm} onCancel={onCancel} />}
        {(r.kind === "help" || r.kind === "unknown") && r.suggestions && <Chips items={r.suggestions} onChip={onChip} />}
        {r.intent?.engine && <div className="engine">parsed by {r.intent.engine}</div>}
      </div>
    </div>
  );
}

function PlanCard({ msg, plan, onConfirm, onCancel }: any) {
  if (msg.receipt) return <ReceiptCard receipt={msg.receipt} />;
  const dry = plan.dryRun;
  const blocked = dry.ran && !dry.ok;
  return (
    <div className="plan">
      <div className="plan-head">
        <span className="plan-title">{plan.summary}</span>
        <span className={"pill " + (dry.ran ? (dry.ok ? "ok" : "bad") : "neutral")}>
          {dry.ran ? (dry.ok ? "✓ simulated" : "✗ would fail") : "structure ✓"}
        </span>
      </div>
      <div className="kv">
        <Row k="Extrinsic" v={<code>{actionLabel(plan.action)}</code>} />
        {plan.action.to && <Row k="Recipient" v={<Mono s={plan.action.to} />} />}
        {plan.action.amountPot && <Row k="Amount" v={<b>{plan.action.amountPot} POT</b>} />}
        {plan.action.transfers && <Row k="Recipients" v={`${plan.action.transfers.length} accounts`} />}
        {plan.action.message && <Row k="Message" v={`“${plan.action.message}”`} />}
        <Row k="Signer" v={<Mono s={plan.signer} />} />
        <Row k="Network fee" v={<b className="fee">{plan.feeDisplay}</b>} />
        <Row k="Dry-run" v={dry.detail} />
        <Row k="Call data" v={<code className="hex">{plan.callHex.slice(0, 24)}…</code>} />
      </div>
      {plan.warnings?.length > 0 && (
        <div className="warn">
          {plan.warnings.map((w: string, i: number) => (
            <div key={i}>⚠ {w}</div>
          ))}
        </div>
      )}
      <div className="plan-actions">
        <button className="btn ghost" disabled={msg.executing} onClick={() => onCancel(msg.id)}>
          Cancel
        </button>
        <button
          className="btn primary"
          disabled={msg.executing || blocked}
          onClick={() => onConfirm(msg.id, plan.id)}
          title={blocked ? "Dry-run failed — execution is blocked for your safety" : ""}
        >
          {msg.executing ? "Signing & submitting…" : "Confirm & sign"}
        </button>
      </div>
    </div>
  );
}

function ReceiptCard({ receipt }: any) {
  if (receipt.cancelled) return <div className="receipt cancelled">Cancelled — nothing was submitted.</div>;
  if (!receipt.ok)
    return (
      <div className="receipt bad">
        <b>✗ Failed.</b> {receipt.error}
      </div>
    );
  return (
    <div className="receipt ok">
      <div className="receipt-top">✓ Executed on-chain — POT gas paid</div>
      <div className="kv">
        <Row k="Block" v={<Mono s={receipt.blockHash} />} />
        <Row k="Tx hash" v={<Mono s={receipt.txHash} />} />
        <Row k="Events" v={<span className="events">{receipt.events.join(", ")}</span>} />
      </div>
    </div>
  );
}

function ReadView({ view, data }: any) {
  if (!data) return null;
  if (view === "account") return <AccountCard a={data} />;
  if (view === "blocks") return <BlocksTable blocks={data} />;
  if (view === "transfers") return <TransfersTable t={data} />;
  if (view === "chain") return <ChainCard c={data} />;
  if (view === "fee")
    return (
      <div className="kv">
        <Row k="Fee" v={<b className="fee">{data.feeDisplay}</b>} />
        <Row k="Weight" v={data.weight} />
      </div>
    );
  return null;
}

function AccountCard({ a }: any) {
  return (
    <div className="kv card">
      <Row k="Address" v={<Mono s={a.normalized} />} />
      <Row k="Free" v={<b className="fee">{a.free}</b>} />
      <Row k="Total" v={a.total} />
      <Row k="Nonce" v={a.nonce} />
      {a.identity && <Row k="Identity" v={a.identity} />}
    </div>
  );
}

function ChainCard({ c }: any) {
  return (
    <div className="kv card">
      <Row k="Chain" v={c.chain} />
      <Row k="Block" v={`#${Number(c.blockNumber).toLocaleString()}`} />
      <Row k="Runtime" v={`${c.specName} v${c.specVersion}`} />
      <Row k="Token" v={`${c.symbol} · ${c.decimals} dp`} />
      <Row k="Surface" v={`${c.palletCount} pallets · ${c.callCount} extrinsics`} />
      {c.peers !== undefined && <Row k="Peers" v={c.peers} />}
    </div>
  );
}

function BlocksTable({ blocks }: any) {
  return (
    <div className="mini-table">
      {blocks.map((b: any) => (
        <div className="mt-row" key={b.hash}>
          <span className="bn">#{b.number}</span>
          <span className="bx">{b.extrinsics} ext</span>
          <code className="bh">{b.hash.slice(0, 14)}…</code>
        </div>
      ))}
    </div>
  );
}

function TransfersTable({ t }: any) {
  if (!t.length) return <div className="muted">No transfers found in the recent window.</div>;
  return (
    <div className="mini-table">
      {t.map((x: any, i: number) => (
        <div className="mt-row" key={i}>
          <span className="bn">#{x.block}</span>
          <Mono s={x.from} />
          <span>→</span>
          <Mono s={x.to} />
          <b className="fee">{x.amount}</b>
        </div>
      ))}
    </div>
  );
}

function Explorer({ network, chain, blocks, chainErr }: any) {
  return (
    <aside className="explorer">
      <div className="ex-head">
        Live Explorer <span className="ex-sub">{network}</span>
      </div>
      {chain ? (
        <div className="kv ex-chain">
          <Row k="Chain" v={chain.chain} />
          <Row k="Runtime" v={`${chain.specName} v${chain.specVersion}`} />
          <Row k="Token" v={`${chain.symbol} · ${chain.decimals} dp`} />
          <Row k="Surface" v={`${chain.palletCount}p · ${chain.callCount}x`} />
          {chain.peers !== undefined && <Row k="Peers" v={chain.peers} />}
        </div>
      ) : (
        <div className="muted">{chainErr ? `· ${network} unreachable` : "connecting…"}</div>
      )}
      <div className="ex-blocks-title">Recent blocks</div>
      <div className="ex-blocks">
        {blocks.map((b: any) => (
          <div className="ex-block" key={b.hash}>
            <span className="bn">#{b.number}</span>
            <span className="bx">{b.extrinsics} ext</span>
            <code className="bh">{b.hash.slice(0, 10)}…</code>
          </div>
        ))}
        {!blocks.length && <div className="muted">no data</div>}
      </div>
      <div className="ex-foot">Portaldot ships no public explorer — so PortalPilot includes one.</div>
    </aside>
  );
}

const Row = ({ k, v }: { k: string; v: any }) => (
  <div className="row">
    <span className="rk">{k}</span>
    <span className="rv">{v}</span>
  </div>
);

const Chips = ({ items, onChip }: { items: string[]; onChip: (s: string) => void }) => (
  <div className="chips">
    {items.map((s, i) => (
      <button key={i} className="chip" onClick={() => onChip(s)}>
        {s}
      </button>
    ))}
  </div>
);

const Mono = ({ s }: { s: string }) => (
  <code className="addr" title={s}>
    {s.length > 16 ? s.slice(0, 8) + "…" + s.slice(-6) : s}
  </code>
);

function actionLabel(a: any) {
  return a.kind === "transfer"
    ? "balances.transferKeepAlive"
    : a.kind === "batchTransfer"
    ? "utility.batchAll"
    : a.kind === "remark"
    ? "system.remarkWithEvent"
    : a.kind;
}
