import type { Line, Note, Result, Section, State } from "./types";
import { HEALTH_AGE_BANDS, HEALTH_BASE, HEALTH_SI } from "./tables";
import { flag, inr, num, sel } from "./util";

const siLabel = (v: number) => (v >= 10000000 ? "₹1 crore" : `₹${v / 100000} lakh`);

export function healthSections(): Section[] {
  const notGroup = (s: State) => s.plan !== "grp";
  const second = (s: State) => flag(s, "has2") && s.plan !== "grp";
  return [
    {
      legend: "Plan",
      fields: [
        {
          id: "plan",
          label: "Plan type",
          type: "select",
          def: "flo",
          opts: sel([
            ["ind", "Individual / multi-individual"],
            ["flo", "Family floater"],
            ["sen", "Senior citizen plan"],
            ["grp", "Group (employer)"],
          ]),
        },
        { id: "si", label: "Sum insured", type: "select", def: "1000000", opts: sel(HEALTH_SI.map(([v]): [number, string] => [v, siLabel(v)])) },
        {
          id: "zone",
          label: "Premium zone",
          type: "select",
          def: "1",
          opts: sel([
            ["1", "Zone 1 (metros)"],
            ["2", "Zone 2 (large cities)"],
            ["3", "Zone 3 (rest of India)"],
          ]),
        },
        {
          id: "tenure",
          label: "Policy tenure",
          type: "select",
          def: "1",
          opts: sel([
            [1, "1 year"],
            [2, "2 years"],
            [3, "3 years"],
          ]),
        },
        {
          id: "biz",
          label: "Business type",
          type: "select",
          def: "new",
          opts: sel([
            ["new", "New business"],
            ["renewal", "Renewal"],
            ["port", "Portability (from another insurer)"],
          ]),
        },
      ],
    },
    {
      legend: "Insured members",
      fields: [
        { id: "a1", label: "Eldest adult age", type: "number", def: "34" },
        { id: "s1", label: "Eldest adult smokes / uses tobacco", type: "check", def: false },
        { id: "p1", label: "Eldest adult declares pre-existing disease", type: "check", def: false },
        { id: "ht", label: "Eldest adult height (cm)", type: "number", def: "172" },
        { id: "wt", label: "Eldest adult weight (kg)", type: "number", def: "74" },
        { id: "has2", label: "Add second adult (spouse)", type: "check", def: true, show: notGroup },
        { id: "a2", label: "Second adult age", type: "number", def: "31", show: second },
        { id: "s2", label: "Second adult smokes", type: "check", def: false, show: second },
        { id: "p2", label: "Second adult declares pre-existing disease", type: "check", def: false, show: second },
        { id: "kids", label: "Children (under 18)", type: "number", def: "1", show: (s) => s.plan === "ind" || s.plan === "flo" },
      ],
    },
    {
      legend: "Cost-sharing and add-ons",
      fields: [
        {
          id: "ded",
          label: "Voluntary deductible",
          type: "select",
          def: "0",
          opts: sel([
            [0, "None"],
            [25000, "₹25,000 (−15%)"],
            [50000, "₹50,000 (−25%)"],
            [100000, "₹1 lakh (−35%)"],
          ]),
        },
        {
          id: "copay",
          label: "Co-pay",
          type: "select",
          def: "0",
          opts: sel([
            [0, "None"],
            [10, "10% (−10%)"],
            [20, "20% (−18%)"],
          ]),
        },
        { id: "rrw", label: "Room rent waiver (+8%)", type: "check", def: false },
        { id: "mat", label: "Maternity cover (₹6,000)", type: "check", def: false, show: (s) => s.plan === "flo" || s.plan === "ind" },
        { id: "ci", label: "Critical illness rider (+10%)", type: "check", def: false },
        { id: "hcash", label: "Hospital cash ₹1,000/day (₹1,200)", type: "check", def: false },
        { id: "opd", label: "OPD and teleconsultation (₹3,000)", type: "check", def: false },
        { id: "taxsen", label: "Payer is a senior citizen (for section 126)", type: "check", def: false },
      ],
    },
    {
      legend: "Model assumptions (illustrative)",
      fields: [
        ...HEALTH_AGE_BANDS.map(([, label], i) => ({ id: `hb${i}`, label: `Base rate, age ${label} (₹)`, type: "number" as const, def: String(HEALTH_BASE[i]) })),
        { id: "floA2", label: "Floater: each extra adult (% of own rate)", type: "number", def: "60" },
        { id: "floKid", label: "Floater: each child (% of own rate)", type: "number", def: "30" },
        { id: "z2", label: "Zone 2 factor", type: "number", def: "0.90" },
        { id: "z3", label: "Zone 3 factor", type: "number", def: "0.82" },
      ],
    },
  ];
}

interface Member {
  who: string;
  age: number;
  smk?: boolean;
  ped?: boolean;
  kid?: boolean;
}

function baseRate(st: State, age: number): number {
  const i = HEALTH_AGE_BANDS.findIndex(([lim]) => age <= lim);
  return num(st[`hb${i < 0 ? HEALTH_AGE_BANDS.length - 1 : i}`]);
}

export function computeHealth(st: State): Result {
  const L: Line[] = [];
  const N: Note[] = [];
  const si = num(st.si);
  const siF = HEALTH_SI.find(([v]) => v === si)?.[1] ?? 1;
  const zf = st.zone === "1" ? 1 : st.zone === "2" ? num(st.z2) : num(st.z3);
  const members: Member[] = [{ who: "Eldest adult", age: num(st.a1), smk: flag(st, "s1"), ped: flag(st, "p1") }];
  if (flag(st, "has2") && st.plan !== "grp") members.push({ who: "Second adult", age: num(st.a2), smk: flag(st, "s2"), ped: flag(st, "p2") });
  const kids = st.plan === "ind" || st.plan === "flo" ? Math.max(0, Math.round(num(st.kids))) : 0;
  for (let i = 0; i < kids; i++) members.push({ who: `Child ${i + 1}`, age: 10, kid: true });

  if (st.plan === "sen" && members.some((m) => !m.kid && m.age < 60)) N.push(["warn", "Eligibility", "Senior citizen plans are for members aged 60+ (some insurers 61+)."]);
  members.sort((a, b) => b.age - a.age);

  let base = 0;
  members.forEach((m, i) => {
    const r = baseRate(st, m.age) * siF * zf;
    let share = 100;
    if (st.plan === "flo" && i > 0) share = m.kid ? num(st.floKid) : num(st.floA2);
    const x = (r * share) / 100;
    L.push(["BASE", `${m.who} (age ${m.age})`, `${inr(baseRate(st, m.age))} × SI ${siF} × zone ${zf}${share !== 100 ? ` × ${share}%` : ""}`, x]);
    base += x;
    if (m.smk) {
      L.push(["LOAD", `Tobacco loading, ${m.who.toLowerCase()}`, "Member premium × 10%", x * 0.1]);
      base += x * 0.1;
    }
    if (m.ped) {
      L.push(["LOAD", `PED loading, ${m.who.toLowerCase()}`, "Member premium × 15% (underwriter)", x * 0.15]);
      base += x * 0.15;
    }
  });
  L.push(["BASE", "Base premium", "", base, "sub"]);

  let adds = 0;
  if (flag(st, "rrw")) {
    L.push(["ADD", "Room rent waiver", "Base × 8%", base * 0.08]);
    adds += base * 0.08;
  }
  if (flag(st, "ci")) {
    L.push(["ADD", "Critical illness rider", "Base × 10%", base * 0.1]);
    adds += base * 0.1;
  }
  if (flag(st, "mat") && (st.plan === "flo" || st.plan === "ind")) {
    L.push(["ADD", "Maternity cover", "Flat", 6000]);
    adds += 6000;
    if (!members.some((m) => !m.kid && m.age >= 18 && m.age <= 45)) N.push(["warn", "Add-on", "Maternity cover normally needs a member aged 18–45."]);
    N.push(["info", "Waiting", "Maternity usually has a 2–4 year waiting period."]);
  }
  if (flag(st, "hcash")) {
    L.push(["ADD", "Hospital cash", "Flat", 1200]);
    adds += 1200;
  }
  if (flag(st, "opd")) {
    L.push(["ADD", "OPD and teleconsultation", "Flat", 3000]);
    adds += 3000;
  }

  let annual = base + adds;
  const dd = ({ 25000: 15, 50000: 25, 100000: 35 } as Record<number, number>)[num(st.ded)] ?? 0;
  if (dd) {
    L.push(["DISC", `Deductible ₹${num(st.ded).toLocaleString("en-IN")}`, `× ${dd}%`, (-annual * dd) / 100]);
    annual -= (annual * dd) / 100;
  }
  const cp = ({ 10: 10, 20: 18 } as Record<number, number>)[num(st.copay)] ?? 0;
  if (cp) {
    L.push(["DISC", `Co-pay ${num(st.copay)}%`, `× ${cp}%`, (-annual * cp) / 100]);
    annual -= (annual * cp) / 100;
  }
  if (st.plan === "grp") {
    L.push(["DISC", "Group rating", "× 20% (risk pooled)", -annual * 0.2]);
    annual *= 0.8;
  }
  L.push(["DISC", "Annual premium", "", annual, "sub"]);

  const t = num(st.tenure) || 1;
  const td = t === 2 ? 7.5 : t === 3 ? 10 : 0;
  let total = annual * t;
  if (t > 1) {
    L.push(["TEN", `Premium for ${t} years`, `${inr(annual)} × ${t}`, total]);
    L.push(["TEN", `Multi-year discount ${td}%`, `× ${td}%`, (-total * td) / 100]);
    total -= (total * td) / 100;
    L.push(["TEN", "Premium for policy term", "", total, "sub"]);
  }

  const bmi = num(st.wt) / Math.pow(num(st.ht) / 100, 2);
  const reasons: string[] = [];
  for (const m of members.filter((x) => !x.kid)) {
    if (m.age > 45) reasons.push(`${m.who.toLowerCase()} over 45`);
    if (m.ped) reasons.push(`${m.who.toLowerCase()} has PED`);
    if (m.smk) reasons.push(`${m.who.toLowerCase()} uses tobacco`);
  }
  if (si > 1000000) reasons.push("sum insured above ₹10 lakh");
  if (Number.isFinite(bmi) && bmi > 0 && (bmi < 18.5 || bmi > 32)) reasons.push(`BMI ${bmi.toFixed(1)} outside 18.5–32`);
  if (reasons.length)
    N.push(["warn", "NSTP", `Referred to underwriter: ${reasons.join(", ")}. Pre-policy medical check-up may be required. Decisions: accept, accept with loading, special conditions, counter offer, reject.`]);
  else N.push(["rule", "STP", `Straight-through: adults under 45, no PED or tobacco, BMI ${Number.isFinite(bmi) ? bmi.toFixed(1) : "–"}, SI up to ₹10 lakh.`]);
  if (members.some((m) => m.ped)) N.push(["rule", "Waiting", "PED covered after a waiting period of at most 3 years; specific illnesses (cataract, hernia, joint replacement) usually 2 years, capped at 3."]);
  N.push(["rule", "Moratorium", "After 5 continuous years, claims cannot be contested for non-disclosure except proven fraud."]);
  if (st.biz === "port") N.push(["info", "Portability", "Waiting periods already served with the old insurer carry over up to the previous sum insured."]);
  if (members.some((m) => m.age >= 60)) N.push(["info", "Seniors", "Renewal premium increases for senior citizens are capped at 10% a year without IRDAI approval."]);
  N.push(["rule", "Claims", "Cashless pre-authorisation decided within 1 hour; final discharge authorisation within 3 hours."]);

  const gst: [string, number][] = st.plan === "grp" ? [["GST 18% (group policy)", total * 0.18]] : [["GST 0% (individual health, since 22 Sep 2025)", 0]];
  if (st.plan !== "grp") {
    const cap = flag(st, "taxsen") ? 50000 : 25000;
    N.push(["info", "Tax", `Section 126 (old regime): up to ${inr(cap)} a year for self and family; this policy gives about ${inr(Math.min(total / t, cap))} a year. No deduction under the new regime.`]);
  }
  const planName = ({ ind: "Individual", flo: "Family floater", sen: "Senior citizen", grp: "Group" } as Record<string, string>)[String(st.plan)];
  return {
    lines: L,
    notes: N,
    net: total,
    gst,
    kpis: [
      ["Members", `${members.length}${kids ? ` (${kids} child${kids > 1 ? "ren" : ""})` : ""}`],
      ["Annual premium", inr(annual)],
      ["UW route", reasons.length ? "NSTP" : "STP"],
    ],
    sub: `Health · ${planName} · ${t} yr`,
  };
}
