export type Value = string | boolean;
export type State = Record<string, Value>;

export interface Option {
  v: string;
  t: string;
}

export interface Field {
  id: string;
  label: string;
  type: "number" | "date" | "select" | "check";
  def: Value;
  opts?: Option[];
  optsFn?: (s: State) => Option[];
  show?: (s: State) => boolean;
  help?: string;
}

export interface Section {
  legend: string;
  fields: Field[];
}

/** [id, label, basis, default rate] — basis: % of IDV, % of OD premium, or flat rupees */
export type AddOn = [string, string, "idv" | "odpct" | "flat", number];

export type NoteLevel = "crit" | "warn" | "rule" | "info";
export type Note = [NoteLevel, string, string];

/** [section, label, calculation text, amount, kind] */
export type Line = [string, string, string, number, ("sub" | "rate")?];

export interface Result {
  lines: Line[];
  notes: Note[];
  net: number;
  gst: [string, number][];
  kpis: [string, string][];
  sub: string;
}

export type ProductId = "car" | "tw" | "cv" | "health" | "life";

export interface Product {
  id: ProductId;
  name: string;
  sections: () => Section[];
  addons?: AddOn[];
  model?: boolean;
  compute: (s: State) => Result;
}
