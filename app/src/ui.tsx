import { useEffect, useRef, useState } from "react";

/* ───────────────────────── Icons ───────────────────────── */
export function Icon({ name, size = 18 }: { name: string; size?: number }) {
  if (name === "play")
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M7 4.5v15l12-7.5z" />
      </svg>
    );
  const paths: Record<string, any> = {
    portal: (<><circle cx="12" cy="12" r="8" /><path d="M12 5.4 14 12 10 12 Z" fill="currentColor" stroke="none" /><path d="M12 18.6 14 12 10 12 Z" fill="currentColor" stroke="none" opacity="0.5" /><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" /></>),
    sparkle: <path d="M12 3l1.9 5.8a2 2 0 0 0 1.3 1.3L21 12l-5.8 1.9a2 2 0 0 0-1.3 1.3L12 21l-1.9-5.8a2 2 0 0 0-1.3-1.3L3 12l5.8-1.9a2 2 0 0 0 1.3-1.3Z" />,
    coins: (<><circle cx="9" cy="9" r="6" /><path d="M18.5 10.5a6 6 0 1 1-8 8" /><path d="M7 9h1.5" /></>),
    send: (<><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></>),
    layers: (<><path d="m12.8 2.2a2 2 0 0 0-1.6 0L2.6 6.1a1 1 0 0 0 0 1.8l8.6 3.9a2 2 0 0 0 1.6 0l8.6-3.9a1 1 0 0 0 0-1.8Z" /><path d="m22 17.6-9.2 4.2a2 2 0 0 1-1.6 0L2 17.6" /><path d="m22 12.6-9.2 4.2a2 2 0 0 1-1.6 0L2 12.6" /></>),
    edit: (<><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></>),
    blocks: (<><path d="M21 8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" /></>),
    activity: <path d="M22 12h-4l-3 9L9 3l-3 9H2" />,
    check: <path d="M20 6 9 17l-5-5" />,
    arrow: (<><path d="M7 7h10v10" /><path d="M7 17 17 7" /></>),
    shield: (<><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><path d="m9 12 2 2 4-4" /></>),
    bolt: <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z" />,
    chat: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z" />,
    wallet: (<><path d="M19 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0 0 4h16v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5" /><path d="M16 12h.5" /></>),
    search: (<><circle cx="11" cy="11" r="7" /><path d="m21 21-4-4" /></>),
    eye: (<><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></>),
    globe: (<><circle cx="12" cy="12" r="9" /><path d="M3 12h18" /><path d="M12 3c2.5 2.5 2.5 15.5 0 18M12 3c-2.5 2.5-2.5 15.5 0 18" /></>),
    sun: (<><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>),
    moon: <path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z" />,
    terminal: (<><path d="m4 17 6-6-6-6" /><path d="M12 19h8" /></>),
    chevron: <path d="m6 9 6 6 6-6" />,
    lock: (<><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></>),
    grid: (<><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>),
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {paths[name]}
    </svg>
  );
}

export function BrandMark({ size = 40, glyph = 22 }: { size?: number; glyph?: number }) {
  return (
    <div className="brand-mark" style={{ width: size, height: size, borderRadius: size * 0.3 }}>
      <Icon name="portal" size={glyph} />
    </div>
  );
}

/* ───────────────────────── Theme ───────────────────────── */
export function useTheme() {
  const [theme, setTheme] = useState<string>(
    () => (typeof document !== "undefined" && document.documentElement.dataset.theme) || "dark"
  );
  const set = (t: string) => {
    document.documentElement.dataset.theme = t;
    try { localStorage.setItem("pp-theme", t); } catch {}
    setTheme(t);
  };
  useEffect(() => {
    const onChange = () => setTheme(document.documentElement.dataset.theme || "dark");
    window.addEventListener("pp-theme-change", onChange);
    return () => window.removeEventListener("pp-theme-change", onChange);
  }, []);
  return {
    theme,
    toggle: () => {
      // Base the next theme on the live attribute (source of truth) so rapid
      // toggles and multiple toggle instances always flip correctly.
      const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      set(next);
      window.dispatchEvent(new Event("pp-theme-change"));
    },
  };
}

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button className="theme-toggle" onClick={toggle} aria-label="Toggle light or dark mode" title="Toggle theme">
      <span className="tt-track">
        <span className="tt-thumb">
          <Icon name={theme === "dark" ? "moon" : "sun"} size={13} />
        </span>
      </span>
    </button>
  );
}

/* ───────────────────────── Scroll reveal ───────────────────────── */
export function Reveal({ children, delay = 0, className = "" }: { children: any; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } }),
      { threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`reveal ${seen ? "in" : ""} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

/* ───────────────────────── Interactive particle field ───────────────────────── */
export function ParticleField({ theme }: { theme: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    const N = 60;
    const LINK = 132;
    const rgb = theme === "light" ? "47,174,34" : "127,238,100"; // neon green
    let w = 0, h = 0, raf = 0;
    const pts: { x: number; y: number; vx: number; vy: number }[] = [];
    const mouse = { x: -9999, y: -9999 };

    const resize = () => {
      const r = host.getBoundingClientRect();
      w = r.width; h = r.height;
      canvas.width = w * DPR; canvas.height = h * DPR;
      canvas.style.width = w + "px"; canvas.style.height = h + "px";
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };
    const seed = () => {
      pts.length = 0;
      for (let i = 0; i < N; i++)
        pts.push({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - 0.5) * 0.22, vy: (Math.random() - 0.5) * 0.22 });
    };
    const onMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    };
    const onLeave = () => { mouse.x = -9999; mouse.y = -9999; };

    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of pts) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
      }
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const a = pts[i], b = pts[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < LINK) {
            ctx.strokeStyle = `rgba(${rgb},${(1 - d / LINK) * 0.14})`;
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }
      for (const p of pts) {
        const d = Math.hypot(p.x - mouse.x, p.y - mouse.y);
        if (d < 180) {
          ctx.strokeStyle = `rgba(${rgb},${(1 - d / 180) * 0.32})`;
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
        }
      }
      ctx.fillStyle = `rgba(${rgb},0.6)`;
      for (const p of pts) { ctx.beginPath(); ctx.arc(p.x, p.y, 1.5, 0, 7); ctx.fill(); }
      raf = requestAnimationFrame(tick);
    };

    resize(); seed(); tick();
    const ro = new ResizeObserver(() => { resize(); seed(); });
    ro.observe(host);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, [theme]);
  return <canvas ref={ref} className="particles" aria-hidden />;
}
