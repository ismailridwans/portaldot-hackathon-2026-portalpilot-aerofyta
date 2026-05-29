import { useEffect, useState } from "react";
import { Icon, BrandMark, ThemeToggle, Reveal, ParticleField, useTheme } from "./ui";

const STATS = [
  { n: "155", l: "extrinsics understood" },
  { n: "25", l: "native pallets" },
  { n: "14", l: "POT decimals, exact" },
  { n: "<60s", l: "to your first tx" },
];

const PAINS = [
  "No public block explorer to see anything",
  "No JS/TS SDK — Python-only tooling",
  "You hand-craft raw extrinsics by hand",
  "14-decimal math traps (off by 100×)",
  "A steep Rust / Substrate learning curve",
  "One wrong byte = irreversible loss",
];
const GAINS = [
  "Plain-English commands — no Rust",
  "Dry-run + exact POT fee, every time",
  "Explicit confirm before anything signs",
  "A live block & account explorer, built in",
  "Runs in your browser, zero toolchain",
  "Mistakes caught before they hit the chain",
];

const FEATURES = [
  { icon: "chat", tone: "teal", span: "big", title: "Natural language → action", body: "Say “send 1 POT to bob” or “show recent transfers.” PortalPilot maps it to the exact Portaldot extrinsic — no Rust, no raw calls, no guesswork." },
  { icon: "shield", tone: "emerald", span: "tall", title: "Dry-run + real POT fee", body: "Every state change is simulated on-chain with system.dryRun and priced in POT before you sign. If it would fail, the button stays disabled." },
  { icon: "eye", tone: "cyan", span: "", title: "Built-in live explorer", body: "Portaldot ships no public explorer — so PortalPilot streams blocks, accounts & transfers beside the chat." },
  { icon: "layers", tone: "blue", span: "", title: "Batch & airdrop", body: "“airdrop 1 POT to bob and 2 to charlie” becomes one atomic utility.batchAll." },
  { icon: "edit", tone: "teal", span: "", title: "On-chain remarks", body: "Inscribe a message on Portaldot in a sentence — great for proofs & attestations." },
  { icon: "globe", tone: "cyan", span: "", title: "Mainnet + Local", body: "Read live mainnet, execute on a funded node — switch with one toggle." },
];

const STEPS = [
  { n: "01", title: "Say it", body: "Type what you want in plain English.", icon: "chat" },
  { n: "02", title: "Simulate", body: "We dry-run it on Portaldot and show the exact POT fee + outcome.", icon: "bolt" },
  { n: "03", title: "Confirm", body: "You approve. It signs, submits and returns the on-chain receipt.", icon: "check" },
];

const ORBIT_INNER = ["coins", "send", "layers", "edit"];
const ORBIT_OUTER = ["blocks", "shield", "activity", "wallet", "chat", "search"];

const FAQ = [
  { q: "Do I need to know Rust or Substrate?", a: "No. PortalPilot reads Portaldot’s runtime metadata and builds the right extrinsic for you. You just describe what you want." },
  { q: "Can the AI move funds on its own?", a: "Never. The model only proposes an intent; the chain simulates it; and nothing is signed until you press Confirm. Bad addresses and would-fail transactions are blocked first." },
  { q: "Does it work without an API key?", a: "Yes — a deterministic parser handles every supported command offline. An optional Claude layer only adds free-form phrasing." },
  { q: "Is it really on Portaldot?", a: "Yes. Reads, fee preview and dry-run run against wss://mainnet.portaldot.io; POT-gas writes execute on a Portaldot node and return a real block hash + events." },
];

function tileStyle(i: number, total: number, radius: number) {
  const angle = (i / total) * 360;
  return { transform: `rotate(${angle}deg) translate(${radius}px) rotate(-${angle}deg)` } as React.CSSProperties;
}

export default function Landing({ onLaunch }: { onLaunch: () => void }) {
  const { theme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [block, setBlock] = useState<number | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 14);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Live mainnet linking — prove "live on mainnet" with the real block height.
  useEffect(() => {
    let alive = true;
    const load = () =>
      fetch("/api/chain?network=mainnet")
        .then((r) => r.json())
        .then((d) => { if (alive && d && typeof d.blockNumber === "number") setBlock(d.blockNumber); })
        .catch(() => {});
    load();
    const id = setInterval(load, 12000);
    return () => { alive = false; clearInterval(id); };
  }, []);

  return (
    <div className="lp">
      <div className="lp-aurora" aria-hidden>
        <span className="a a-teal" />
        <span className="a a-cyan" />
        <span className="a a-emerald" />
      </div>

      {/* ── liquid-glass nav ── */}
      <nav className={"lp-nav glass " + (scrolled ? "scrolled" : "")}>
        <a className="lp-brand" href="#top" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
          <BrandMark size={34} glyph={19} />
          <span>PortalPilot</span>
        </a>
        <div className="lp-links">
          <a href="#why">Why</a>
          <a href="#features">Features</a>
          <a href="#how">How it works</a>
          <a href="#faq">FAQ</a>
        </div>
        <div className="lp-nav-cta">
          <ThemeToggle />
          <a className="pill ghost hide-sm" href="https://portaldot-dev.readthedocs.io/en/latest/" target="_blank" rel="noreferrer">
            Docs <Icon name="arrow" size={14} />
          </a>
          <button className="pill solid" onClick={onLaunch}>Launch App <Icon name="arrow" size={14} /></button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <header className="lp-hero" id="top">
        <ParticleField theme={theme} />
        <div className="hero-inner">
          <div className="lp-eyebrow">
            <span className="dot" /> Live on Portaldot mainnet{block ? <> · block <b className="eyebrow-num">#{block.toLocaleString()}</b></> : " · block streaming"}
          </div>
          <h1 className="lp-title">One sentence to <span className="grad-text">on-chain.</span></h1>
          <p className="lp-sub">
            PortalPilot is the AI copilot &amp; command center for Portaldot. Say what you want — it explains,
            simulates with the real POT fee, and executes only after you confirm.
          </p>
          <div className="lp-cta">
            <button className="cta-combo" onClick={onLaunch}>
              <span className="cta-label">Launch App</span>
              <span className="cta-circle"><Icon name="arrow" size={18} /></span>
            </button>
            <button className="pill ghost lg" onClick={onLaunch}><Icon name="play" size={15} /> See it live</button>
          </div>

          <Reveal delay={320}><LiveDemo onLaunch={onLaunch} /></Reveal>
          <div className="lp-scroll"><Icon name="chevron" size={16} /> scroll to explore</div>
        </div>
      </header>

      {/* ── STATS ── */}
      <section className="lp-stats">
        {STATS.map((s, i) => (
          <Reveal key={s.l} delay={i * 70} className="stat">
            <div className="stat-n">{s.n}</div>
            <div className="stat-l">{s.l}</div>
          </Reveal>
        ))}
      </section>

      {/* ── WHY (redesigned: why this is needed) ── */}
      <section className="lp-section" id="why">
        <div className="lp-head center">
          <Reveal><div className="lp-kicker">Why PortalPilot</div></Reveal>
          <Reveal delay={70}><h2>Portaldot is powerful. Using it shouldn’t require a Substrate PhD.</h2></Reveal>
          <Reveal delay={120}><p className="lp-lead">Today, doing anything on Portaldot means raw extrinsics, no explorer, and zero room for error. PortalPilot turns all of it into a safe conversation.</p></Reveal>
        </div>
        <Reveal delay={120}>
          <div className="why-grid">
            <div className="why-card pain">
              <span className="why-tag bad">Portaldot today</span>
              <ul>{PAINS.map((p) => <li key={p}><span className="x">✕</span>{p}</li>)}</ul>
            </div>
            <div className="why-arrow"><Icon name="arrow" size={22} /></div>
            <div className="why-card gain">
              <span className="why-tag good">With PortalPilot</span>
              <ul>{GAINS.map((g) => <li key={g}><span className="c"><Icon name="check" size={12} /></span>{g}</li>)}</ul>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── BENTO FEATURES ── */}
      <section className="lp-section" id="features">
        <div className="lp-head">
          <Reveal><div className="lp-kicker">What you get</div></Reveal>
          <Reveal delay={70}><h2>The friendliest — and safest — way to use Portaldot.</h2></Reveal>
        </div>
        <div className="bento">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={i * 60} className={"bento-cell " + (f.span || "")}>
              <div className={"feat " + f.tone}>
                <div className="feat-ic"><Icon name={f.icon} size={22} /></div>
                <h3>{f.title}</h3>
                <p>{f.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── ORBIT ── */}
      <section className="lp-section lp-orbit-wrap">
        <div className="lp-head center">
          <Reveal><div className="lp-kicker">One copilot, the whole chain</div></Reveal>
          <Reveal delay={70}><h2>25 pallets. 155 extrinsics. One conversation.</h2></Reveal>
          <Reveal delay={120}><p className="lp-lead">PortalPilot reads Portaldot’s live runtime metadata, so it understands every pallet — not one hard-coded transaction.</p></Reveal>
        </div>
        <div className="orbit">
          <div className="orbit-ring r1" />
          <div className="orbit-ring r2" />
          <div className="orbit-ring r3" />
          <div className="orbit-spin s-inner">
            {ORBIT_INNER.map((ic, i) => (
              <span className="orb-tile" key={ic} style={tileStyle(i, ORBIT_INNER.length, 120)}>
                <span className="orb-spin-rev"><Icon name={ic} size={18} /></span>
              </span>
            ))}
          </div>
          <div className="orbit-spin s-outer">
            {ORBIT_OUTER.map((ic, i) => (
              <span className="orb-tile alt" key={ic} style={tileStyle(i, ORBIT_OUTER.length, 210)}>
                <span className="orb-spin-rev slow"><Icon name={ic} size={18} /></span>
              </span>
            ))}
          </div>
          <div className="orbit-core">
            <div className="oc-num">155</div>
            <div className="oc-sub">extrinsics</div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="lp-section" id="how">
        <div className="lp-head"><Reveal><div className="lp-kicker">How it works</div></Reveal><Reveal delay={70}><h2>Say it. Simulate. Confirm.</h2></Reveal></div>
        <Reveal delay={90}>
          <div className="flow">
            {["Understand", "Compose", "Simulate", "Price", "Confirm", "Submit", "Finalized"].map((s, i, arr) => (
              <span className="flow-step" key={s}>
                <span className="flow-pill"><span className="flow-n">{i + 1}</span>{s}</span>
                {i < arr.length - 1 && <span className="flow-sep">→</span>}
              </span>
            ))}
          </div>
        </Reveal>
        <div className="steps">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 80} className="step-wrap">
              <div className="step">
                <div className="step-top"><span className="step-n">{s.n}</span><span className="step-ic"><Icon name={s.icon} size={18} /></span></div>
                <h3>{s.title}</h3><p>{s.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── SAFETY ── */}
      <section className="lp-section lp-safety" id="safety">
        <Reveal>
          <div className="safety-card glass">
            <div className="safety-left">
              <div className="lp-kicker emerald">Honest AI, not a label</div>
              <h2>The AI proposes. The chain simulates. You authorize.</h2>
              <p className="lp-lead">
                PortalPilot follows the recommended defense-in-depth pattern for on-chain agents: the model drafts an intent,
                Portaldot dry-runs the exact extrinsic, and nothing is signed without your explicit confirmation.
              </p>
              <button className="pill solid lg shine" onClick={onLaunch}>Try it now <Icon name="arrow" size={16} /></button>
            </div>
            <div className="safety-right">
              <div className="mini-plan">
                <div className="mp-strip" />
                <div className="mp-row"><span>Transfer 1 POT → Bob</span><span className="mp-badge">✓ simulated</span></div>
                <div className="mp-kv"><span>Network fee</span><b>0.0147 POT</b></div>
                <div className="mp-kv"><span>Dry-run</span><span className="mp-ok">would apply cleanly</span></div>
                <div className="mp-actions"><span className="mp-ghost">Cancel</span><span className="mp-go">Confirm &amp; sign</span></div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── FAQ ── */}
      <section className="lp-section lp-faq" id="faq">
        <div className="lp-head center"><Reveal><div className="lp-kicker">FAQ</div></Reveal><Reveal delay={70}><h2>Good questions.</h2></Reveal></div>
        <div className="faq">
          {FAQ.map((f, i) => (
            <Reveal key={i} delay={i * 50}>
              <details className="faq-item">
                <summary>{f.q}<span className="faq-x"><Icon name="chevron" size={16} /></span></summary>
                <p>{f.a}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="lp-final">
        <div className="final-glow" />
        <Reveal><h2>Talk to Portaldot.</h2></Reveal>
        <Reveal delay={70}><p>Reads are free. Writes are simulated &amp; confirmed. No Rust required.</p></Reveal>
        <Reveal delay={130}><button className="pill solid xl shine" onClick={onLaunch}>Launch PortalPilot <Icon name="arrow" size={18} /></button></Reveal>
      </section>

      <div className="lp-wordmark" aria-hidden>PortalPilot</div>

      <footer className="lp-foot">
        <div className="foot-brand"><BrandMark size={30} glyph={17} /> <span>PortalPilot</span></div>
        <div className="foot-note">AI copilot &amp; live explorer for Portaldot · MIT · built on @polkadot/api</div>
      </footer>
    </div>
  );
}

/* ── auto-playing demo of the core loop (now the hero centerpiece) ── */
function LiveDemo({ onLaunch }: { onLaunch: () => void }) {
  const [step, setStep] = useState(0); // 0 typing · 1 plan · 2 signing · 3 receipt
  const cmd = "send 1 POT to bob";
  const [typed, setTyped] = useState("");

  useEffect(() => {
    if (step !== 0) return;
    setTyped("");
    let i = 0;
    const id = setInterval(() => {
      i++;
      setTyped(cmd.slice(0, i));
      if (i >= cmd.length) clearInterval(id);
    }, 70);
    return () => clearInterval(id);
  }, [step]);

  useEffect(() => {
    const dur = [2400, 2200, 1500, 3200][step];
    const id = setTimeout(() => setStep((s) => (s + 1) % 4), dur);
    return () => clearTimeout(id);
  }, [step]);

  return (
    <div className="demo-frame glass" onClick={onLaunch} role="button" title="Open the app">
      <div className="demo-bar">
        <span className="dd r" /><span className="dd y" /><span className="dd g" />
        <span className="demo-url"><Icon name="lock" size={11} /> portalpilot · local node</span>
        <span className="demo-open">open app <Icon name="arrow" size={12} /></span>
      </div>
      <div className="demo-screen">
        <div className="msg user"><div className="bubble">{typed || "…"}{step === 0 && <i className="caret" />}</div></div>
        {step >= 1 && (
          <div className="msg assistant">
            <div className="avatar"><Icon name="sparkle" size={15} /></div>
            <div className="bubble">
              {step < 3 ? (
                <div className="plan demo-plan">
                  <div className="plan-strip" />
                  <div className="plan-head"><span className="plan-title">Transfer 1 POT → bob</span><span className="badge ok">✓ simulated</span></div>
                  <div className="kv">
                    <div className="row"><span className="rk">Extrinsic</span><span className="rv"><code>balances.transferKeepAlive</code></span></div>
                    <div className="row"><span className="rk">Network fee</span><span className="rv"><span className="fee">0.0147 POT</span></span></div>
                    <div className="row"><span className="rk">Dry-run</span><span className="rv">would apply cleanly</span></div>
                  </div>
                  <div className="plan-actions">
                    <span className="btn ghost">Cancel</span>
                    <span className={"btn primary " + (step === 2 ? "loading" : "")}>{step === 2 ? "Signing & submitting…" : "Confirm & sign"}</span>
                  </div>
                </div>
              ) : (
                <div className="receipt ok">
                  <div className="receipt-top"><span className="ck"><Icon name="check" size={13} /></span> Executed on-chain — POT gas paid</div>
                  <div className="kv">
                    <div className="row"><span className="rk">Block</span><span className="rv"><code className="addr">0x7fd88c…ab97be</code></span></div>
                    <div className="row"><span className="rk">Events</span><span className="rv"><span className="events">balances.Transfer, treasury.Deposit</span></span></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
