import type { Option, State } from "./types";

export const num = (v: unknown): number => {
  const x = parseFloat(String(v));
  return Number.isFinite(x) ? x : 0;
};

export const inr = (n: number): string =>
  (n < 0 ? "−" : "") + "₹" + Math.abs(Math.round(n)).toLocaleString("en-IN");

export const inr2 = (n: number): string =>
  "₹" + (Math.round(n * 100) / 100).toLocaleString("en-IN", { maximumFractionDigits: 2 });

export const pct = (n: number): string => `${Math.round(n * 1000) / 1000}%`;

export const sel = (opts: (string | [string | number, string])[]): Option[] =>
  opts.map((o) => (Array.isArray(o) ? { v: String(o[0]), t: o[1] } : { v: o, t: o }));

export interface SimpleDate {
  y: number;
  m: number;
  d: number;
  t: number;
}

export const parseD = (s: unknown): SimpleDate | null => {
  if (!s || typeof s !== "string") return null;
  const [y, m, d] = s.split("-").map(Number);
  if (!y || !m || !d) return null;
  return { y, m, d, t: Date.UTC(y, m - 1, d) };
};

/** Completed months between two dates, like Excel DATEDIF(..., "M"). */
export function monthsBetween(a: SimpleDate | null, b: SimpleDate | null): number {
  if (!a || !b) return 0;
  let m = (b.y - a.y) * 12 + (b.m - a.m);
  if (b.d < a.d) m--;
  return Math.max(0, m);
}

export const daysBetween = (a: SimpleDate, b: SimpleDate): number => Math.round((b.t - a.t) / 864e5);

export const isoDate = (d: Date): string => d.toISOString().slice(0, 10);

export const addMonths = (d: Date, m: number): Date => {
  const x = new Date(d);
  x.setMonth(x.getMonth() + m);
  return x;
};

export const flag = (s: State, k: string): boolean => s[k] === true;
