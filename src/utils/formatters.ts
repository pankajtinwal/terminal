export function fmtInr(n: number): string {
  return n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function fmtPct(n: number, decimals = 2): string {
  return (n >= 0 ? '+' : '') + n.toFixed(decimals) + '%';
}

export function fmtPts(n: number): string {
  return (n >= 0 ? '+' : '') + n.toFixed(2);
}

export function fmtDate(isoString: string): string {
  const d = new Date(isoString);
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
}
