import type { AddOn, Line, Note, Result, Section, State } from "./types";
import { CAR_OD, CAR_TP, CV_CLASSES, CV_OD, GVW_TP, TW_OD, TW_TP, ZONE_A_CITIES, depreciation } from "./tables";
import { addMonths, daysBetween, flag, inr, isoDate, monthsBetween, num, parseD, pct, sel } from "./util";

export type MotorKind = "car" | "tw" | "cv";

export const MOTOR_ADDONS: Record<MotorKind, AddOn[]> = {
  car: [
    ["zd", "Zero depreciation", "idv", 0.35],
    ["eng", "Engine protect", "idv", 0.1],
    ["cons", "Consumables", "idv", 0.08],
    ["rti", "Return to invoice", "idv", 0.2],
    ["tyre", "Tyre protect", "idv", 0.08],
    ["ncbp", "NCB protect", "odpct", 10],
    ["key", "Key and lock replacement", "flat", 350],
    ["rsa", "Roadside assistance", "flat", 199],
    ["pb", "Personal belongings", "flat", 250],
  ],
  tw: [
    ["zd", "Zero depreciation", "idv", 0.3],
    ["eng", "Engine protect", "idv", 0.08],
    ["cons", "Consumables", "idv", 0.05],
    ["rti", "Return to invoice", "idv", 0.15],
    ["rsa", "Roadside assistance", "flat", 99],
    ["pil", "Pillion protect", "flat", 150],
  ],
  cv: [
    ["zd", "Zero depreciation", "idv", 0.4],
    ["eng", "Engine protect", "idv", 0.1],
    ["cons", "Consumables", "idv", 0.1],
    ["ncbp", "NCB protect", "odpct", 10],
    ["rsa", "Roadside assistance", "flat", 499],
  ],
};

export function tpTenure(kind: MotorKind, s: State): number {
  if (s.ptype === "saod") return 0;
  if (s.ptype === "bundled" || s.ptype === "tplong") return kind === "car" ? 3 : kind === "tw" ? 5 : 1;
  return 1;
}

const hasODType = (s: State) => s.ptype !== "tp1" && s.ptype !== "tplong";

export function motorSections(kind: MotorKind): Section[] {
  const car = kind === "car";
  const tw = kind === "tw";
  const cv = kind === "cv";
  const today = new Date();
  const od = hasODType;
  const tp = (s: State) => s.ptype !== "saod";
  const prevBiz = (s: State) => s.biz === "rollover" || s.biz === "renewal";

  const policy: Section = {
    legend: "Policy",
    fields: [
      {
        id: "biz",
        label: "Business type",
        type: "select",
        def: "rollover",
        opts: sel([
          ["new", "New vehicle"],
          ["rollover", "Rollover (switching insurer)"],
          ["renewal", "Renewal (same insurer)"],
          ["used", "Used vehicle (new owner)"],
        ]),
      },
      {
        id: "ptype",
        label: "Policy type",
        type: "select",
        def: "comp",
        opts: cv
          ? sel([
              ["comp", "Package: OD + TP, 1 year"],
              ["tp1", "Liability only, 1 year"],
            ])
          : sel([
              ["comp", "Comprehensive: 1 yr OD + 1 yr TP"],
              ["bundled", car ? "Bundled: 1 yr OD + 3 yr TP (new only)" : "Bundled: 1 yr OD + 5 yr TP (new only)"],
              ["saod", "Standalone OD, 1 year"],
              ["tp1", "Third-party only, 1 year"],
              ["tplong", car ? "Long-term TP only, 3 years (new only)" : "Long-term TP only, 5 years (new only)"],
            ]),
      },
      { id: "start", label: "Policy start date", type: "date", def: isoDate(today) },
      { id: "reg", label: "Purchase / registration date", type: "date", def: isoDate(addMonths(today, -27)) },
      {
        id: "prev",
        label: "Previous policy end date",
        type: "date",
        def: isoDate(new Date(today.getTime() - 864e5)),
        show: prevBiz,
        help: "Any gap is a break-in; over 90 days removes NCB",
      },
      { id: "claim", label: "Claim in expiring policy?", type: "check", def: false, show: prevBiz },
      {
        id: "ncb",
        label: "NCB earned (claim-free years)",
        type: "select",
        def: "25",
        show: (s) => s.biz !== "new",
        opts: sel([
          [0, "0 years: 0%"],
          [20, "1 year: 20%"],
          [25, "2 years: 25%"],
          [35, "3 years: 35%"],
          [45, "4 years: 45%"],
          [50, "5+ years: 50%"],
        ]),
      },
      {
        id: "ncbletter",
        label: "Has NCB reserving letter",
        type: "check",
        def: false,
        show: (s) => s.biz === "used",
        help: "Lets NCB from a sold vehicle move to this one",
      },
    ],
  };

  const vehicle: Section = { legend: "Vehicle and IDV", fields: [] };
  const v = vehicle.fields;
  if (cv) {
    v.push(
      {
        id: "sub",
        label: "Sub-product",
        type: "select",
        def: "gcv",
        opts: sel([
          ["gcv", "Goods carrying (GCV)"],
          ["pcv", "Passenger carrying (PCV)"],
          ["misc", "Miscellaneous and special"],
        ]),
      },
      { id: "cls", label: "Vehicle class", type: "select", def: "A1", optsFn: (s) => sel(CV_CLASSES[String(s.sub)] ?? CV_CLASSES.gcv) },
      {
        id: "power",
        label: "Fuel",
        type: "select",
        def: "ice",
        opts: sel([
          ["ice", "Petrol / diesel / CNG"],
          ["ev", "Electric"],
        ]),
      },
      { id: "gvw", label: "Gross vehicle weight (kg)", type: "number", def: "10500", show: (s) => s.sub === "gcv" && (s.cls === "A1" || s.cls === "A2") },
      { id: "cc", label: "Engine (cc)", type: "number", def: "1197", show: (s) => s.sub === "pcv" && (s.cls === "C1a" || s.cls === "C4") && s.power !== "ev" },
      { id: "kw", label: "Motor power (kW)", type: "number", def: "30", show: (s) => s.sub === "pcv" && (s.cls === "C1a" || s.cls === "C4") && s.power === "ev" },
      { id: "pax", label: "Licensed passengers (excl. driver)", type: "number", def: "4", show: (s) => s.sub === "pcv" },
      {
        id: "city",
        label: "RTO location",
        type: "select",
        def: "roi",
        opts: sel([
          ...ZONE_A_CITIES.map((c): [string, string] => [c, `${c} (Zone A)`]),
          ["cap", "Other state capital (Zone B)"],
          ["roi", "Rest of India (Zone C)"],
        ]),
      },
    );
  } else {
    v.push(
      {
        id: "power",
        label: "Powertrain",
        type: "select",
        def: "ice",
        opts: sel([
          ["ice", "Petrol / diesel"],
          ["hybrid", "Hybrid"],
          ["ev", "Electric"],
        ]),
      },
      { id: "cc", label: "Engine (cc)", type: "number", def: car ? "1197" : "125", show: (s) => s.power !== "ev" },
      { id: "kw", label: "Motor power (kW)", type: "number", def: car ? "45" : "3", show: (s) => s.power === "ev" },
      {
        id: "city",
        label: "RTO location",
        type: "select",
        def: "Mumbai",
        opts: sel([...ZONE_A_CITIES.map((c): [string, string] => [c, `${c} (Zone A)`]), ["roi", "Rest of India (Zone B)"]]),
      },
    );
  }
  v.push(
    { id: "exs", label: "Ex-showroom price (₹)", type: "number", def: car ? "850000" : tw ? "95000" : "1450000", show: od },
    { id: "dev", label: "IDV change by customer (%)", type: "number", def: "0", help: "Allowed ±15% of system IDV without referral", show: od },
    {
      id: "det",
      label: "De-tariff discount on OD rate (%)",
      type: "number",
      def: car ? "55" : tw ? "45" : "40",
      help: "Insurer's discount off the erstwhile tariff rate. Negative = loading",
      show: od,
    },
  );

  const accessories: Section = {
    legend: "Accessories",
    fields: [
      { id: "elec", label: "Electrical accessories (₹)", type: "number", def: "0", show: od },
      { id: "nonelec", label: "Non-electrical accessories (₹)", type: "number", def: "0", show: od },
      {
        id: "cng",
        label: "CNG / LPG kit",
        type: "select",
        def: "none",
        show: (s) => s.power !== "ev",
        opts: sel([
          ["none", "None"],
          ["ext", "Fitted later (external)"],
          ["mfg", "Factory fitted"],
        ]),
      },
      { id: "cngv", label: "Kit value (₹)", type: "number", def: "25000", show: (s) => s.cng === "ext" && od(s) },
      ...(tw ? [{ id: "side", label: "Side car value (₹)", type: "number" as const, def: "0", show: od }] : []),
    ],
  };

  const loadings: Section = {
    legend: "Loadings",
    fields: [
      { id: "fibre", label: "Fibre-glass fuel tank", type: "check", def: false, show: od },
      { id: "tuition", label: "Used for driving tuition (+60%)", type: "check", def: false, show: od },
      { id: "imported", label: "Imported without customs duty (+30%)", type: "check", def: false, show: od },
      { id: "geo", label: "Geographical extension (SAARC)", type: "check", def: false },
      ...(cv ? [{ id: "privuse", label: "Commercial vehicle used privately (+25%)", type: "check" as const, def: false, show: od }] : []),
    ],
  };

  const discounts: Section = { legend: "Discounts", fields: [] };
  if (!cv)
    discounts.fields.push({
      id: "vd",
      label: "Voluntary deductible",
      type: "select",
      def: "0",
      show: od,
      opts: car
        ? sel([
            [0, "None"],
            [2500, "₹2,500 → 20%, max ₹750"],
            [5000, "₹5,000 → 25%, max ₹1,500"],
            [7500, "₹7,500 → 30%, max ₹2,000"],
            [15000, "₹15,000 → 35%, max ₹2,500"],
          ])
        : sel([
            [0, "None"],
            [500, "₹500 → 5%, max ₹50"],
            [750, "₹750 → 10%, max ₹75"],
            [1000, "₹1,000 → 15%, max ₹125"],
            [1500, "₹1,500 → 20%, max ₹200"],
            [3000, "₹3,000 → 25%, max ₹250"],
          ]),
    });
  discounts.fields.push({ id: "theft", label: "ARAI anti-theft device (2.5%, max ₹500)", type: "check", def: false, show: od });
  if (!cv) discounts.fields.push({ id: "aa", label: "Automobile Association member (5%, max ₹200)", type: "check", def: false, show: od });
  discounts.fields.push({ id: "handi", label: "Specially designed for disabled (50%)", type: "check", def: false, show: od });
  if (car) discounts.fields.push({ id: "vintage", label: "Certified vintage car (OD −25%, TP −50%)", type: "check", def: false });
  discounts.fields.push({ id: "premises", label: "Used only within own premises (−33⅓%)", type: "check", def: false });

  const tpSec: Section = {
    legend: "Third-party and personal accident",
    fields: [
      { id: "tppd", label: `Restrict TPPD to ₹6,000 (−₹${car ? 100 : tw ? 50 : 150}/yr)`, type: "check", def: false, show: tp },
      {
        id: "cpa",
        label: "Compulsory PA for owner-driver (₹15 lakh)",
        type: "check",
        def: true,
        show: tp,
        help: "Waived if no licence, another CPA, or a standalone PA of ₹15 lakh+",
      },
      { id: "cpap", label: "CPA premium per year (₹)", type: "number", def: tw ? "275" : "330", show: (s) => tp(s) && flag(s, "cpa"), help: "Insurer-set, usually ₹220–450" },
      {
        id: "cpat",
        label: "CPA tenure",
        type: "select",
        def: "1",
        show: (s) => tp(s) && flag(s, "cpa"),
        optsFn: (s) => {
          const t = tpTenure(kind, s);
          return sel(t > 1 ? [[1, "1 year"], [t, `${t} years`]] : [[1, "1 year"]]);
        },
      },
      {
        id: "pasi",
        label: "PA for unnamed passengers, SI per person",
        type: "select",
        def: "0",
        show: tp,
        opts: sel([
          [0, "None"],
          [50000, "₹50,000"],
          [100000, "₹1 lakh"],
          [200000, "₹2 lakh"],
        ]),
      },
      { id: "paseats", label: "Number of passengers covered", type: "number", def: car ? "5" : tw ? "1" : "2", show: (s) => tp(s) && num(s.pasi) > 0 },
      { id: "lld", label: cv ? "Legal liability: paid driver, cleaner, conductor (count)" : "Legal liability to paid driver (count)", type: "number", def: cv ? "1" : "0", show: tp },
    ],
  };

  return [policy, vehicle, accessories, loadings, discounts, tpSec];
}

export function computeMotor(kind: MotorKind, st: State): Result {
  const L: Line[] = [];
  const N: Note[] = [];
  const car = kind === "car";
  const tw = kind === "tw";
  const cv = kind === "cv";
  const name = car ? "Private car" : tw ? "Two-wheeler" : "Commercial vehicle";
  const start = parseD(st.start);
  const reg = parseD(st.reg);
  let ptype = String(st.ptype);

  if (!cv && (ptype === "bundled" || ptype === "tplong") && st.biz !== "new") {
    N.push(["crit", "Rule", `${ptype === "bundled" ? "Bundled" : "Long-term TP"} policies are only for new vehicles. Calculated as ${ptype === "bundled" ? "Comprehensive 1+1." : "TP only, 1 year."}`]);
    ptype = ptype === "bundled" ? "comp" : "tp1";
  }
  if (!cv && st.biz === "new" && (ptype === "comp" || ptype === "tp1"))
    N.push(["crit", "Rule", car ? "A new private car must carry 3-year TP (bundled or long-term). Calculated as selected for practice." : "A new two-wheeler must carry 5-year TP (bundled or long-term). Calculated as selected for practice."]);
  if (ptype === "saod" && st.biz === "new") N.push(["crit", "Rule", "Standalone OD needs an active TP policy, so it is not sold on a new vehicle."]);
  if (ptype === "saod") N.push(["rule", "Rule", "Standalone OD: capture the active TP policy number and insurer, and check the TP end date covers this OD period."]);

  const hasOD = ptype === "comp" || ptype === "bundled" || ptype === "saod";
  const tpT = tpTenure(kind, { ...st, ptype });
  const months = monthsBetween(reg, start);
  const city = String(st.city);
  const zone: "A" | "B" | "C" = cv ? (ZONE_A_CITIES.includes(city) ? "A" : city === "cap" ? "B" : "C") : ZONE_A_CITIES.includes(city) ? "A" : "B";

  /* Break-in and NCB */
  let ncb = st.biz === "new" ? 0 : num(st.ncb);
  let inspection = false;
  if (st.biz === "rollover" || st.biz === "renewal") {
    const prev = parseD(st.prev);
    if (prev && start) {
      const gap = daysBetween(prev, start) - 1;
      if (gap > 0) {
        inspection = hasOD;
        N.push(["warn", "Break-in", `${gap} day gap since the previous policy ended.${hasOD ? " Vehicle inspection required before OD cover starts." : ""}`]);
      }
      if (gap > 90 && ncb > 0) {
        N.push(["crit", "NCB", `Break of more than 90 days: earned NCB of ${ncb}% is lost.`]);
        ncb = 0;
      }
    }
    if (flag(st, "claim") && ncb > 0) {
      N.push(["warn", "NCB", "A claim in the expiring policy resets NCB to 0% (unless NCB protect was bought last year)."]);
      ncb = 0;
    }
  }
  if (st.biz === "used") {
    inspection = hasOD;
    N.push(["warn", "Inspection", "Used vehicle: ownership transfer needs inspection and the RC in the new owner's name."]);
    if (!flag(st, "ncbletter") && ncb > 0) {
      N.push(["info", "NCB", "NCB belongs to the previous owner; without a reserving letter it is set to 0%."]);
      ncb = 0;
    }
  }
  if (st.biz === "new" && months > 0) N.push(["info", "New", `New business with registration ${months} month(s) before start: many insurers treat a gap over 15 days as break-in.`]);
  if (!hasOD) ncb = 0;

  /* IDV and OD rate */
  let idv = 0;
  let sysIdv = 0;
  let dep = 0;
  let policyRate = 0;
  let tariffRate = 0;
  if (hasOD) {
    dep = depreciation(months);
    sysIdv = num(st.exs) * (1 - dep / 100);
    const dev = num(st.dev);
    idv = sysIdv * (1 + dev / 100);
    if (Math.abs(dev) > 15) N.push(["crit", "Referral", `IDV changed by ${dev}%, outside the ±15% band. Underwriter approval needed.`]);
    if (months > 60) N.push(["info", "IDV", "Vehicle over 5 years old: IDV here falls 10% a year on the previous value; in practice it is agreed with the customer or surveyor."]);
    if (car || tw) {
      const ai = months <= 60 ? 0 : months <= 120 ? 1 : 2;
      let band: number;
      if (st.power === "ev") {
        const k = num(st.kw);
        band = car ? (k <= 30 ? 0 : k <= 65 ? 1 : 2) : k <= 7 ? 0 : k <= 16 ? 1 : 2;
        N.push(["info", "EV", "The old OD tariff has no kW slabs: EV is mapped to the matching cc band. Insurers file their own EV rates."]);
      } else {
        const c = num(st.cc);
        band = car ? (c <= 1000 ? 0 : c <= 1500 ? 1 : 2) : c <= 150 ? 0 : c <= 350 ? 1 : 2;
      }
      tariffRate = (car ? CAR_OD : TW_OD)[zone === "A" ? "A" : "B"][band][ai];
    } else {
      const ai = months <= 60 ? 0 : months <= 84 ? 1 : 2;
      let key = String(st.cls);
      if (st.sub === "misc") key = "MISC";
      else if (key === "C1a") {
        const b = st.power === "ev" ? (num(st.kw) <= 30 ? 0 : num(st.kw) <= 65 ? 1 : 2) : num(st.cc) <= 1000 ? 0 : num(st.cc) <= 1500 ? 1 : 2;
        key = `C1a_${b}`;
      } else if (key === "C4") {
        const b = st.power === "ev" ? (num(st.kw) <= 16 ? 0 : 2) : num(st.cc) <= 150 ? 0 : num(st.cc) <= 350 ? 1 : 2;
        key = `C4_${b}`;
      } else if (key === "C2e" || key === "C2t") key = "C2";
      const tbl = CV_OD[key] ?? CV_OD.MISC;
      const rates = tbl[zone] ?? tbl.B ?? [0, 0, 0];
      tariffRate = rates[ai];
    }
    policyRate = tariffRate * (1 - num(st.det) / 100);
  }

  /* OD section */
  let odNet = 0;
  if (hasOD) {
    let subOD = 0;
    const basicOD = (idv * policyRate) / 100;
    L.push(["OD", "Basic own damage", `${inr(idv)} IDV × ${pct(policyRate)} (tariff ${pct(tariffRate)} − ${num(st.det)}%)`, basicOD]);
    subOD += basicOD;
    if (cv && st.sub === "gcv" && (st.cls === "A1" || st.cls === "A2") && num(st.gvw) > 12000) {
      const x = ((num(st.gvw) - 12000) / 100) * 27;
      L.push(["OD", "Extra GVW above 12,000 kg", `(${num(st.gvw)} − 12,000) ÷ 100 × ₹27`, x]);
      subOD += x;
    }
    if (cv && st.sub === "pcv" && (st.cls === "C2" || st.cls === "C2e" || st.cls === "C2t")) {
      const seats = num(st.pax) + 1;
      const x = seats <= 6 ? 0 : seats <= 18 ? 350 : seats <= 36 ? 450 : seats <= 60 ? 550 : 680;
      if (x) {
        L.push(["OD", `Additional OD for seating ${seats}`, "Flat by seating band (IMT)", x]);
        subOD += x;
      }
    }
    const ne = num(st.nonelec);
    if (ne > 0) {
      const x = (ne * policyRate) / 100;
      L.push(["OD", "Non-electrical accessories", `${inr(ne)} × ${pct(policyRate)}`, x]);
      subOD += x;
    }
    const el = num(st.elec);
    if (el > 0) {
      L.push(["OD", "Electrical accessories", `${inr(el)} × 4%`, el * 0.04]);
      subOD += el * 0.04;
    }
    if (st.cng === "ext" && st.power !== "ev") {
      const x = num(st.cngv) * 0.04;
      L.push(["OD", "CNG / LPG kit (external)", `${inr(num(st.cngv))} × 4%`, x]);
      subOD += x;
    }
    if (st.cng === "mfg" && st.power !== "ev") {
      L.push(["OD", "CNG / LPG kit (factory)", "Basic OD × 5%", basicOD * 0.05]);
      subOD += basicOD * 0.05;
    }
    if (tw && num(st.side) > 0) {
      const x = (num(st.side) * policyRate) / 100;
      L.push(["OD", "Side car", `${inr(num(st.side))} × ${pct(policyRate)}`, x]);
      subOD += x;
    }
    L.push(["OD", "Subtotal OD", "", subOD, "sub"]);

    let load = 0;
    if (flag(st, "fibre")) {
      const x = cv ? 100 : 50;
      L.push(["OD", "Loading: fibre-glass tank", `Flat ₹${x}`, x]);
      load += x;
    }
    if (flag(st, "tuition")) {
      L.push(["OD", "Loading: driving tuition", "Subtotal OD × 60%", subOD * 0.6]);
      load += subOD * 0.6;
    }
    if (flag(st, "imported")) {
      L.push(["OD", "Loading: imported, no customs duty", "Subtotal OD × 30%", subOD * 0.3]);
      load += subOD * 0.3;
    }
    if (flag(st, "geo")) {
      L.push(["OD", "Loading: geographical extension", "Flat ₹400", 400]);
      load += 400;
    }

    let disc = 0;
    const vd = num(st.vd);
    if (!cv && vd > 0) {
      const tbl: Record<number, [number, number]> = car
        ? { 2500: [20, 750], 5000: [25, 1500], 7500: [30, 2000], 15000: [35, 2500] }
        : { 500: [5, 50], 750: [10, 75], 1000: [15, 125], 1500: [20, 200], 3000: [25, 250] };
      const row = tbl[vd];
      if (row) {
        const x = Math.min((subOD * row[0]) / 100, row[1]);
        L.push(["OD", `Discount: voluntary deductible ₹${vd.toLocaleString("en-IN")}`, `min(Subtotal × ${row[0]}%, ₹${row[1]})`, -x]);
        disc += x;
      }
    }
    if (!cv && flag(st, "aa")) {
      const x = Math.min(subOD * 0.05, 200);
      L.push(["OD", "Discount: automobile association", "min(Subtotal × 5%, ₹200)", -x]);
      disc += x;
    }
    if (flag(st, "theft")) {
      const x = Math.min(subOD * 0.025, 500);
      L.push(["OD", "Discount: anti-theft device", "min(Subtotal × 2.5%, ₹500)", -x]);
      disc += x;
    }
    if (flag(st, "handi")) {
      L.push(["OD", "Discount: vehicle for disabled", "Subtotal × 50%", -subOD * 0.5]);
      disc += subOD * 0.5;
    }
    if (car && flag(st, "vintage")) {
      L.push(["OD", "Discount: vintage car", "Subtotal × 25%", -subOD * 0.25]);
      disc += subOD * 0.25;
    }
    if (!cv && flag(st, "premises")) {
      L.push(["OD", "Discount: own premises only", "Subtotal × 33⅓%", -subOD / 3]);
      disc += subOD / 3;
    }
    const beforeNCB = subOD + load - disc;
    odNet = beforeNCB;
    if (load || disc) L.push(["OD", "OD before NCB", "Subtotal + loadings − discounts", beforeNCB, "sub"]);
    if (ncb > 0) {
      const x = (beforeNCB * ncb) / 100;
      L.push(["OD", `No claim bonus ${ncb}%`, `OD before NCB × ${ncb}%`, -x]);
      odNet -= x;
    }
    if (cv && flag(st, "privuse")) {
      L.push(["OD", "Loading: used as private vehicle", "OD after NCB × 25%", odNet * 0.25]);
      odNet *= 1.25;
    }
    if (cv && flag(st, "premises")) {
      L.push(["OD", "Discount: own premises only", "OD after NCB × 33⅓%", -odNet / 3]);
      odNet -= odNet / 3;
    }
    L.push(["OD", "Own damage premium", "", odNet, "sub"]);
    if (flag(st, "ao_zd") && months > 60) N.push(["warn", "Add-on", "Zero depreciation is usually offered only up to 5 years of vehicle age (some insurers go to 7)."]);
    if (flag(st, "ao_rti") && months > 36) N.push(["warn", "Add-on", "Return to invoice is normally limited to vehicles up to 3 years old."]);
  }

  /* TP section */
  let tpTotal = 0;
  if (tpT > 0) {
    const ev = st.power === "ev";
    if (car || tw) {
      const col = tpT > 1 ? 1 : 0;
      let idx: number;
      if (ev) {
        const k = num(st.kw);
        idx = car ? (k <= 30 ? 0 : k <= 65 ? 1 : 2) : k <= 3 ? 0 : k <= 7 ? 1 : k <= 16 ? 2 : 3;
      } else {
        const c = num(st.cc);
        idx = car ? (c <= 1000 ? 0 : c <= 1500 ? 1 : 2) : c <= 75 ? 0 : c <= 150 ? 1 : c <= 350 ? 2 : 3;
      }
      let base = (car ? CAR_TP : TW_TP)[ev ? "ev" : "ice"][idx][col];
      L.push(["TP", "Basic third-party", `${ev ? `${num(st.kw)} kW` : `${num(st.cc)} cc`}, ${tpT}-year TP slab (2022 Rules)`, base]);
      if (st.power === "hybrid") {
        const x = Math.round(base * 0.075);
        L.push(["TP", "Hybrid discount 7.5%", "Basic TP × 7.5%", -x]);
        base -= x;
      }
      if (car && flag(st, "vintage")) {
        L.push(["TP", "Vintage car 50%", "Basic TP × 50%", -base * 0.5]);
        base *= 0.5;
      }
      if (flag(st, "premises")) {
        L.push(["TP", "Own premises only", "Basic TP × 33⅓%", -base / 3]);
        base -= base / 3;
      }
      tpTotal += base;
    } else {
      if (st.sub === "gcv") {
        let base: number;
        let basis: string;
        if (st.cls === "A1" || st.cls === "A2") {
          const g = num(st.gvw);
          const i = g <= 7500 ? 0 : g <= 12000 ? 1 : g <= 20000 ? 2 : g <= 40000 ? 3 : 4;
          base = GVW_TP[ev ? "ev" : "ice"][i];
          basis = `${g.toLocaleString("en-IN")} kg GVW slab${ev ? " (electric)" : ""}`;
        } else if (st.cls === "A3") {
          base = ev ? 3139 : 4492;
          basis = `Goods 3-wheeler, public${ev ? " e-cart" : ""}`;
        } else {
          base = ev ? 3211 : 3922;
          basis = `Goods 3-wheeler, private${ev ? " e-cart" : ""}`;
        }
        L.push(["TP", "Basic third-party", basis, base]);
        tpTotal += base;
      } else if (st.sub === "pcv") {
        const pax = Math.max(0, num(st.pax));
        const c = num(st.cc);
        const k = num(st.kw);
        let b = 0;
        let per = 0;
        switch (st.cls) {
          case "C1a":
            [b, per] = ev ? (k <= 30 ? [5134, 988] : k <= 65 ? [6749, 831] : [8945, 949]) : c <= 1000 ? [6040, 1162] : c <= 1500 ? [7940, 978] : [10523, 1117];
            break;
          case "C1b":
            [b, per] = ev ? [1648, 789] : [2539, 1214];
            break;
          case "C2":
            [b, per] = ev ? [12192, 745] : [14343, 877];
            break;
          case "C2e":
            [b, per] = ev ? [10363, 633] : [12192, 745];
            break;
          case "C3":
            [b, per] = ev ? [5749, 1147] : [6763, 1349];
            break;
          case "C2t":
            [b, per] = ev ? [13177, 806] : [15502, 948];
            break;
          case "C4":
            [b, per] = ev ? (k <= 16 ? [732, 493] : [1916, 493]) : c <= 350 ? [861, 580] : [2254, 580];
            break;
        }
        L.push(["TP", "Basic third-party", `Class ${String(st.cls).replace(/[et]$/, "")}${ev ? " electric" : ""}`, b]);
        L.push(["TP", "Passenger premium", `${pax} passengers × ₹${per}`, pax * per]);
        tpTotal += b + pax * per;
      } else {
        const base = st.cls === "M1" ? 1645 : 7267;
        L.push(["TP", "Basic third-party", st.cls === "M1" ? "Small tractor / hearse / plane loader" : "Other misc and special types", base]);
        tpTotal += base;
      }
      if (flag(st, "premises")) {
        L.push(["TP", "Own premises only", "Basic TP × 33⅓%", -tpTotal / 3]);
        tpTotal -= tpTotal / 3;
      }
    }
    if (flag(st, "tppd")) {
      const r = car ? 100 : tw ? 50 : 150;
      L.push(["TP", "TPPD restricted to ₹6,000", `₹${r} × ${tpT} yr`, -r * tpT]);
      tpTotal -= r * tpT;
    }
    if (st.cng !== "none" && st.cng !== undefined && st.power !== "ev") {
      L.push(["TP", "CNG / LPG kit liability", `₹60 × ${tpT} yr`, 60 * tpT]);
      tpTotal += 60 * tpT;
    }
    if (flag(st, "geo")) {
      L.push(["TP", "Geographical extension", `₹100 × ${tpT} yr`, 100 * tpT]);
      tpTotal += 100 * tpT;
    }
    const lld = num(st.lld);
    if (lld > 0) {
      L.push(["TP", "Legal liability to paid driver / staff", `₹50 × ${lld} × ${tpT} yr`, 50 * lld * tpT]);
      tpTotal += 50 * lld * tpT;
    }
    const pasi = num(st.pasi);
    if (pasi > 0) {
      const seats = num(st.paseats);
      const x = (pasi * 5 * seats * tpT) / 10000;
      L.push(["TP", "PA for unnamed passengers", `${inr(pasi)} × ₹5 per ₹10,000 × ${seats} × ${tpT} yr`, x]);
      tpTotal += x;
    }
    L.push(["TP", "Third-party premium", "", tpTotal, "sub"]);
  }

  /* CPA */
  let cpa = 0;
  if (tpT > 0 && flag(st, "cpa")) {
    const t = Math.min(num(st.cpat) || 1, tpT);
    cpa = num(st.cpap) * t;
    L.push(["PA", "Compulsory PA, owner-driver", `₹${num(st.cpap)} × ${t} yr (₹15 lakh SI)`, cpa]);
  } else if (tpT > 0) N.push(["info", "CPA", "CPA opted out: record the reason (no licence, other CPA, or standalone PA of ₹15 lakh+)."]);

  /* Add-ons */
  let ao = 0;
  if (hasOD) {
    for (const [id, label, basis] of MOTOR_ADDONS[kind]) {
      if (!flag(st, `ao_${id}`)) continue;
      const r = num(st[`ar_${id}`]);
      let x = r;
      let calc = "Flat";
      if (basis === "idv") {
        x = (idv * r) / 100;
        calc = `${inr(idv)} × ${r}%`;
      } else if (basis === "odpct") {
        x = (odNet * r) / 100;
        calc = `OD premium × ${r}%`;
      }
      L.push(["ADD", label, calc, x]);
      ao += x;
    }
    if (ao) L.push(["ADD", "Add-on premium", "", ao, "sub"]);
  }

  const net = odNet + tpTotal + cpa + ao;
  const gst: [string, number][] = [];
  if (cv && st.sub === "gcv") {
    const at18 = odNet + ao + cpa;
    if (at18) gst.push(["GST 18% on OD, add-ons, CPA", at18 * 0.18]);
    if (tpTotal) gst.push(["GST 5% on goods-carriage TP", tpTotal * 0.05]);
    N.push(["rule", "GST", "Goods-carriage third-party is taxed at 5% since 22 Sep 2025; the rest of the premium stays at 18%."]);
  } else gst.push(["GST 18%", net * 0.18]);

  if (inspection) N.push(["rule", "NSTP", "Case goes NSTP: policy is issued only after an inspection report marked Recommended."]);
  if (hasOD)
    N.push(["info", "Deductible", car ? `Compulsory deductible per claim: ₹${num(st.cc) > 1500 ? "2,000" : "1,000"}.` : tw ? "Compulsory deductible per claim: ₹100." : "Compulsory deductible applies per claim as per the policy wording."]);
  if (hasOD) N.unshift(["info", "IDV", `Allowed IDV range: ${inr(sysIdv * 0.85)} to ${inr(sysIdv * 1.15)}. Zone ${zone}, age ${months} months.`]);

  const kpis: [string, string][] = hasOD
    ? [
        ["System IDV", inr(sysIdv)],
        ["Depreciation", `${Math.round(dep * 10) / 10}% at ${months} mo`],
        ["Final IDV", inr(idv)],
      ]
    : [
        ["Vehicle age", `${months} months`],
        ["Zone", zone],
        ["TP tenure", `${tpT} yr`],
      ];
  return { lines: L, notes: N, net, gst, kpis, sub: `${name} · ${hasOD ? (tpT ? `OD 1 yr + TP ${tpT} yr` : "OD only") : `TP ${tpT} yr`}` };
}
