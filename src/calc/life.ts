import type { Line, Note, Result, Section, State } from "./types";
import { flag, inr, inr2, num, sel } from "./util";

export function lifeSections(): Section[] {
  return [
    {
      legend: "Life assured",
      fields: [
        { id: "age", label: "Age next birthday", type: "number", def: "30" },
        {
          id: "gender",
          label: "Gender",
          type: "select",
          def: "m",
          opts: sel([
            ["m", "Male"],
            ["f", "Female"],
          ]),
        },
        { id: "smk", label: "Smoker / tobacco user", type: "check", def: false },
        { id: "inc", label: "Annual income (₹)", type: "number", def: "1200000", help: "Used for the cover-to-income check" },
      ],
    },
    {
      legend: "Cover",
      fields: [
        {
          id: "si",
          label: "Sum assured",
          type: "select",
          def: "10000000",
          opts: sel([
            [5000000, "₹50 lakh"],
            [10000000, "₹1 crore"],
            [15000000, "₹1.5 crore"],
            [20000000, "₹2 crore"],
            [30000000, "₹3 crore"],
            [50000000, "₹5 crore"],
          ]),
        },
        { id: "term", label: "Policy term (years)", type: "number", def: "30" },
        {
          id: "mode",
          label: "Payment mode",
          type: "select",
          def: "a",
          opts: sel([
            ["a", "Annual"],
            ["m", "Monthly (+5%)"],
          ]),
        },
        {
          id: "adb",
          label: "Accidental death rider, SI",
          type: "select",
          def: "0",
          opts: sel([
            [0, "None"],
            [2500000, "₹25 lakh"],
            [5000000, "₹50 lakh"],
            [10000000, "₹1 crore"],
          ]),
        },
        { id: "wop", label: "Waiver of premium on disability (+3%)", type: "check", def: false },
        { id: "group", label: "Group term (employer) policy", type: "check", def: false, help: "Group policies still carry 18% GST" },
      ],
    },
  ];
}

export function computeLife(st: State): Result {
  const L: Line[] = [];
  const N: Note[] = [];
  const age = num(st.age);
  const term = num(st.term);
  const si = num(st.si);
  if (age < 18 || age > 65) N.push(["crit", "Eligibility", "Entry age for most term plans is 18–65."]);
  if (age + term > 85) N.push(["warn", "Eligibility", `Cover would run to age ${age + term}; most plans end at 75–85.`]);

  const termF = 0.8 + 0.012 * term;
  const rate = 0.55 * Math.pow(1.075, age - 20) * termF * (flag(st, "smk") ? 1.65 : 1) * (st.gender === "f" ? 0.85 : 1);
  let prem = (si / 1000) * rate;
  L.push(["BASE", "Mortality rate per ₹1,000", `0.55 × 1.075^(age − 20) × term factor ${termF.toFixed(2)}${flag(st, "smk") ? " × smoker 1.65" : ""}${st.gender === "f" ? " × female 0.85" : ""}`, rate, "rate"]);
  L.push(["BASE", "Base premium", `${inr(si)} ÷ 1,000 × ${inr2(rate)}`, prem]);
  const hsd = si >= 20000000 ? 12 : si >= 10000000 ? 8 : 0;
  if (hsd) {
    L.push(["BASE", "High sum assured discount", `× ${hsd}%`, (-prem * hsd) / 100]);
    prem -= (prem * hsd) / 100;
  }
  let riders = 0;
  if (num(st.adb) > 0) {
    const x = (num(st.adb) / 1000) * 0.5;
    L.push(["ADD", "Accidental death rider", `${inr(num(st.adb))} ÷ 1,000 × ₹0.50`, x]);
    riders += x;
  }
  if (flag(st, "wop")) {
    L.push(["ADD", "Waiver of premium", "Base × 3%", prem * 0.03]);
    riders += prem * 0.03;
  }
  let annual = prem + riders;
  if (flag(st, "group")) {
    L.push(["DISC", "Group rating", "× 25%", -annual * 0.25]);
    annual *= 0.75;
  }
  if (st.mode === "m") {
    L.push(["DISC", "Monthly mode loading", "× 5%", annual * 0.05]);
    annual *= 1.05;
  }
  L.push(["DISC", "Annual premium", "", annual, "sub"]);

  const inc = num(st.inc);
  if (inc > 0) {
    const mult = si / inc;
    N.push([mult > 25 ? "warn" : "rule", "Underwriting", `Cover is ${mult.toFixed(1)}× income. Insurers usually allow 10–25× by age; higher needs financial underwriting.`]);
  }
  if (si >= 10000000) N.push(["rule", "Medicals", "Sum assured of ₹1 crore+ usually needs tele-medical or physical medical tests."]);
  N.push(["info", "Model", "Illustrative mortality curve for practice. Real rates come from each insurer's filed premium table."]);

  return {
    lines: L,
    notes: N,
    net: annual,
    gst: flag(st, "group") ? [["GST 18% (group term)", annual * 0.18]] : [["GST 0% (individual life, since 22 Sep 2025)", 0]],
    kpis: [
      ["Monthly", inr(annual / 12)],
      ["Cover ends at age", String(age + term)],
      ["Rate / ₹1,000", inr2(rate)],
    ],
    sub: `Term life · ${term} yr term · ${st.mode === "m" ? "monthly" : "annual"} premium`,
  };
}
