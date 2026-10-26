/**
 * Rate tables. Rules and rates as of 26 Oct 2026.
 *
 * - Third-party (TP): Motor Vehicles (Third Party Insurance Base Premium and Liability) Rules, 2022,
 *   G.S.R. 394(E), in force from 1 June 2022. No later revision gazetted as of Oct 2026.
 * - Own damage (OD): erstwhile Indian Motor Tariff base rates (de-tariffed in 2007; insurers discount from them).
 *   Car and two-wheeler from the training documents, CV from the CV Algorithm workbooks ("Erstwhile Tariff" column).
 */

/** IDV depreciation by vehicle age in completed months: [upper limit in months, % depreciation] */
export const DEPRECIATION: [number, number][] = [
  [6, 5],
  [12, 15],
  [24, 20],
  [36, 30],
  [48, 40],
  [60, 50],
];

export function depreciation(months: number): number {
  for (const [lim, p] of DEPRECIATION) if (months <= lim) return p;
  const n = Math.ceil((months - 60) / 12);
  return 100 * (1 - 0.5 * Math.pow(0.9, n));
}

type Zone2 = Record<"A" | "B", number[][]>;

/** Private car OD % of IDV: [zone][cc band ≤1000, ≤1500, >1500][age ≤5, ≤10, >10 yrs] */
export const CAR_OD: Zone2 = {
  A: [
    [3.127, 3.283, 3.362],
    [3.283, 3.447, 3.529],
    [3.44, 3.612, 3.698],
  ],
  B: [
    [3.039, 3.191, 3.267],
    [3.191, 3.351, 3.43],
    [3.343, 3.51, 3.594],
  ],
};

/** Two-wheeler OD % of IDV: [zone][cc band ≤150, ≤350, >350][age ≤5, ≤10, >10 yrs] */
export const TW_OD: Zone2 = {
  A: [
    [1.708, 1.793, 1.836],
    [1.793, 1.883, 1.928],
    [1.879, 1.973, 2.02],
  ],
  B: [
    [1.676, 1.76, 1.802],
    [1.76, 1.848, 1.892],
    [1.844, 1.936, 1.982],
  ],
};

/** Car TP [1 yr, 3 yr long-term]: ICE by cc ≤1000/≤1500/>1500; EV by kW ≤30/≤65/>65 */
export const CAR_TP = {
  ice: [
    [2094, 6521],
    [3416, 10640],
    [7897, 24596],
  ],
  ev: [
    [1780, 5543],
    [2904, 9044],
    [6712, 20907],
  ],
};

/** Two-wheeler TP [1 yr, 5 yr]: ICE by cc ≤75/≤150/≤350/>350; EV by kW ≤3/≤7/≤16/>16 */
export const TW_TP = {
  ice: [
    [538, 2901],
    [714, 3851],
    [1366, 7365],
    [2804, 15117],
  ],
  ev: [
    [457, 2466],
    [607, 3273],
    [1161, 6260],
    [2383, 12849],
  ],
};

/** CV OD % of IDV by class → zone → age band [0–60, 61–84, 85+ months] */
export const CV_OD: Record<string, Partial<Record<"A" | "B" | "C", number[]>>> = {
  A1: { A: [1.751, 1.795, 1.839], B: [1.743, 1.787, 1.83], C: [1.726, 1.77, 1.812] },
  A2: { A: [1.226, 1.257, 1.287], B: [1.22, 1.251, 1.281], C: [1.208, 1.239, 1.268] },
  A3: { A: [1.664, 1.706, 1.747], B: [1.656, 1.697, 1.739], C: [1.64, 1.681, 1.722] },
  A4: { A: [1.165, 1.194, 1.223], B: [1.159, 1.188, 1.217], C: [1.148, 1.177, 1.205] },
  C1a_0: { A: [3.284, 3.366, 3.448], B: [3.191, 3.271, 3.351] },
  C1a_1: { A: [3.448, 3.534, 3.62], B: [3.351, 3.435, 3.519] },
  C1a_2: { A: [3.612, 3.703, 3.793], B: [3.51, 3.598, 3.686] },
  C1b: { A: [1.278, 1.31, 1.342], B: [1.272, 1.304, 1.336], C: [1.26, 1.292, 1.323] },
  C2: { A: [1.68, 1.722, 1.764], B: [1.672, 1.714, 1.756], C: [1.656, 1.697, 1.739] },
  C3: { A: [1.785, 1.83, 1.874], B: [1.777, 1.821, 1.866], C: [1.759, 1.803, 1.847] },
  C4_0: { A: [1.794, 1.839, 1.884], B: [1.743, 1.787, 1.83] },
  C4_1: { A: [1.884, 1.931, 1.978], B: [1.83, 1.876, 1.922] },
  C4_2: { A: [1.973, 2.023, 2.072], B: [1.917, 1.965, 2.013] },
  MISC: { A: [1.208, 1.238, 1.268], B: [1.202, 1.232, 1.262], C: [1.19, 1.22, 1.25] },
};

/** Goods vehicles other than 3-wheelers, TP by GVW ≤7.5t/≤12t/≤20t/≤40t/>40t */
export const GVW_TP = {
  ice: [16049, 27186, 35313, 43950, 44242],
  ev: [13642, 23108, 30016, 37357, 37606],
};

export const CV_CLASSES: Record<string, [string, string][]> = {
  gcv: [
    ["A1", "A1 Goods carrier, public (other than 3-wheeler)"],
    ["A2", "A2 Goods carrier, private (other than 3-wheeler)"],
    ["A3", "A3 Goods 3-wheeler, public carrier"],
    ["A4", "A4 Goods 3-wheeler, private carrier"],
  ],
  pcv: [
    ["C1a", "C1a Taxi / cab, up to 6 passengers"],
    ["C1b", "C1b Auto-rickshaw / e-rickshaw, up to 6 passengers"],
    ["C2", "C2 Bus, more than 6 passengers"],
    ["C2e", "C2 School / college bus"],
    ["C3", "C3 3-wheeler, 7 to 17 passengers"],
    ["C2t", "C2 3-wheeler, more than 17 passengers"],
    ["C4", "C4 Two-wheeler taxi"],
  ],
  misc: [
    ["M1", "Tractor up to 6 HP, hearse, plane loader"],
    ["M2", "Other special vehicles (ambulance, crane, excavator, tractor above 6 HP)"],
  ],
};

export const ZONE_A_CITIES = ["Ahmedabad", "Bengaluru", "Chennai", "Hyderabad", "Kolkata", "Mumbai", "New Delhi", "Pune"];

/* ---------- Health model (illustrative, editable) ---------- */
export const HEALTH_AGE_BANDS: [number, string][] = [
  [17, "0–17"],
  [25, "18–25"],
  [30, "26–30"],
  [35, "31–35"],
  [40, "36–40"],
  [45, "41–45"],
  [50, "46–50"],
  [55, "51–55"],
  [60, "56–60"],
  [65, "61–65"],
  [70, "66–70"],
  [75, "71–75"],
  [200, "76+"],
];
/** Annual base premium for ₹5 lakh, Zone 1, one person, before GST */
export const HEALTH_BASE = [3200, 4800, 5400, 6200, 7400, 9200, 12000, 15600, 20000, 26500, 33500, 41000, 49000];
/** Sum insured → multiplier against ₹5 lakh */
export const HEALTH_SI: [number, number][] = [
  [300000, 0.78],
  [500000, 1],
  [750000, 1.22],
  [1000000, 1.4],
  [1500000, 1.66],
  [2000000, 1.88],
  [2500000, 2.05],
  [5000000, 2.6],
  [10000000, 3.2],
];
