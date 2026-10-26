import type { Product, ProductId, State } from "./types";
import { MOTOR_ADDONS, computeMotor, motorSections } from "./motor";
import { computeHealth, healthSections } from "./health";
import { computeLife, lifeSections } from "./life";

export const PRODUCTS: Record<ProductId, Product> = {
  car: { id: "car", name: "Private car", sections: () => motorSections("car"), addons: MOTOR_ADDONS.car, compute: (s) => computeMotor("car", s) },
  tw: { id: "tw", name: "Two-wheeler", sections: () => motorSections("tw"), addons: MOTOR_ADDONS.tw, compute: (s) => computeMotor("tw", s) },
  cv: { id: "cv", name: "Commercial vehicle", sections: () => motorSections("cv"), addons: MOTOR_ADDONS.cv, compute: (s) => computeMotor("cv", s) },
  health: { id: "health", name: "Health", sections: healthSections, model: true, compute: computeHealth },
  life: { id: "life", name: "Term life", sections: lifeSections, model: true, compute: computeLife },
};

export const PRODUCT_ORDER: ProductId[] = ["car", "tw", "cv", "health", "life"];

export function defaultState(id: ProductId): State {
  const p = PRODUCTS[id];
  const st: State = {};
  for (const sec of p.sections()) for (const f of sec.fields) st[f.id] = f.def;
  for (const [aid, , , rate] of p.addons ?? []) {
    st[`ao_${aid}`] = false;
    st[`ar_${aid}`] = String(rate);
  }
  if (id === "car") {
    st.ao_zd = true;
    st.ao_rsa = true;
  }
  if (id === "tw") st.ao_zd = true;
  return st;
}
