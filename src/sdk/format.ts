// Precise POT <-> planck conversion. Portaldot uses 14 decimals, so float math is unsafe.
// All conversions are string/BigInt based.

export function planckToPot(planck: bigint, decimals: number): string {
  const neg = planck < 0n;
  const abs = neg ? -planck : planck;
  const s = abs.toString().padStart(decimals + 1, "0");
  const intPart = s.slice(0, s.length - decimals);
  const frac = s.slice(s.length - decimals).replace(/0+$/, "");
  const out = frac.length ? `${intPart}.${frac}` : intPart;
  return neg ? `-${out}` : out;
}

export function potToPlanck(amount: string | number, decimals: number): bigint {
  const str = String(amount).trim().replace(/_/g, "");
  if (str === "" || str === "." || !/^\d*\.?\d*$/.test(str)) {
    throw new Error(`Invalid POT amount: "${amount}"`);
  }
  const [intPart, fracPart = ""] = str.split(".");
  if (fracPart.length > decimals) {
    throw new Error(`Too many decimal places (POT supports max ${decimals}).`);
  }
  const frac = fracPart.padEnd(decimals, "0");
  return BigInt(intPart || "0") * 10n ** BigInt(decimals) + BigInt(frac || "0");
}

// Human display with thousands separators and capped fractional digits.
export function formatPot(planck: bigint, decimals: number, symbol = "POT", maxFrac = 4): string {
  const neg = planck < 0n;
  const full = planckToPot(neg ? -planck : planck, decimals);
  const [i, f = ""] = full.split(".");
  const fr = f.slice(0, maxFrac).replace(/0+$/, "");
  const grouped = i.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${neg ? "-" : ""}${grouped}${fr ? "." + fr : ""} ${symbol}`;
}

export function shortAddr(addr: string, head = 6, tail = 6): string {
  if (!addr || addr.length <= head + tail + 1) return addr;
  return `${addr.slice(0, head)}…${addr.slice(-tail)}`;
}
