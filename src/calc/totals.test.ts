import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import type { ProductId, Result, State } from "./types";
import { PRODUCTS, defaultState } from "./products";

// Motor date defaults are relative to today, so pin the clock to the rules date.
beforeAll(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-10-26T12:00:00Z"));
});
afterAll(() => {
  vi.useRealTimers();
});

const gstTotal = (r: Result) => r.gst.reduce((a, g) => a + g[1], 0);
const total = (r: Result) => r.net + gstTotal(r);

function run(id: ProductId, overrides: State = {}): Result {
  return PRODUCTS[id].compute({ ...defaultState(id), ...overrides });
}

const line = (r: Result, label: string) => r.lines.find((l) => l[1] === label)?.[3];

// Expected totals from HANDOVER.md section 7 (defaults match the earlier Rating Desk).
describe("expected totals (HANDOVER.md section 7)", () => {
  it("private car defaults: ₹14,892", () => {
    const r = run("car");
    expect(Math.round(r.net)).toBe(12620);
    expect(Math.round(gstTotal(r))).toBe(2272);
    expect(Math.round(total(r))).toBe(14892);
  });

  it("two-wheeler defaults: ₹1,955", () => {
    expect(Math.round(total(run("tw")))).toBe(1955);
  });

  it("goods vehicle defaults: ₹38,290 with split GST", () => {
    const r = run("cv");
    expect(r.gst).toHaveLength(2);
    const [g18, g5] = r.gst.map((g) => Math.round(g[1]));
    expect(g18).toBe(1478);
    expect(g5).toBe(1362);
    expect(Math.round(total(r))).toBe(38290);
  });

  it("taxi (PCV C1a, 1,197 cc, 4 passengers): ₹32,494", () => {
    const r = run("cv", { sub: "pcv", cls: "C1a", cc: "1197", pax: "4" });
    expect(Math.round(total(r))).toBe(32494);
  });

  it("health floater defaults: ₹15,232 with 0% GST", () => {
    const r = run("health");
    expect(gstTotal(r)).toBe(0);
    expect(Math.round(total(r))).toBe(15232);
  });

  it("term life defaults: ₹12,097 a year", () => {
    expect(Math.round(total(run("life")))).toBe(12097);
  });
});

describe("car breakdown", () => {
  it("gives IDV ₹5,95,000, OD ₹6,593 and TP ₹3,416", () => {
    const r = run("car");
    expect(JSON.stringify(r.kpis)).toContain("5,95,000");
    expect(Math.round(line(r, "Own damage premium") ?? NaN)).toBe(6593);
    expect(Math.round(line(r, "Third-party premium") ?? NaN)).toBe(3416);
  });
});
