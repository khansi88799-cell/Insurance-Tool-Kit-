import { useMemo, useState } from "react";
import { PRODUCTS, PRODUCT_ORDER, defaultState } from "../calc/products";
import type { Field, ProductId, Result, Section, State } from "../calc/types";
import { inr, inr2 } from "../calc/util";
import { useStoredState } from "../hooks";
import { Link } from "../router";
import { paths } from "../routes";

const CALC_H1: Record<ProductId, string> = {
  car: "Car insurance premium calculator",
  tw: "Two-wheeler insurance premium calculator",
  cv: "Commercial vehicle insurance premium calculator",
  health: "Health insurance premium calculator",
  life: "Term life insurance premium calculator",
};

const SECTION_NAMES: Record<string, string> = {
  OD: "Own damage",
  TP: "Third-party liability",
  PA: "Personal accident",
  ADD: "Add-ons and riders",
  BASE: "Base premium",
  LOAD: "Loadings",
  DISC: "Cost-sharing and discounts",
  TEN: "Tenure",
};
const UNIT = { idv: "% of IDV", odpct: "% of OD", flat: "₹ flat" } as const;
const NOTE_ORDER = { crit: 0, warn: 1, rule: 2, info: 3 } as const;

interface Scenario {
  name: string;
  product: string;
  sub: string;
  net: number;
  gst: number;
  total: number;
}

/** Keep every select value inside its current option list (options can depend on other fields). */
function normalise(st: State, sections: Section[]): State {
  const next = { ...st };
  for (const sec of sections)
    for (const f of sec.fields) {
      if (f.type !== "select") continue;
      const opts = f.optsFn ? f.optsFn(next) : (f.opts ?? []);
      if (opts.length && !opts.some((o) => o.v === String(next[f.id]))) next[f.id] = opts[0].v;
    }
  return next;
}

function FieldControl({ f, st, pid, set }: { f: Field; st: State; pid: string; set: (k: string, v: string | boolean) => void }) {
  const id = `${pid}-${f.id}`;
  if (f.show && !f.show(st)) return null;
  if (f.type === "check")
    return (
      <div className="f">
        <label className="chk" htmlFor={id}>
          <input id={id} type="checkbox" checked={st[f.id] === true} onChange={(e) => set(f.id, e.target.checked)} />
          <span>{f.label}</span>
        </label>
        {f.help && <span className="help">{f.help}</span>}
      </div>
    );
  const opts = f.type === "select" ? (f.optsFn ? f.optsFn(st) : (f.opts ?? [])) : [];
  return (
    <div className="f">
      <label htmlFor={id}>{f.label}</label>
      {f.type === "select" ? (
        <select id={id} value={String(st[f.id])} onChange={(e) => set(f.id, e.target.value)}>
          {opts.map((o) => (
            <option key={o.v} value={o.v}>
              {o.t}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={id}
          type={f.type}
          inputMode={f.type === "number" ? "decimal" : undefined}
          step={f.type === "number" ? "any" : undefined}
          value={String(st[f.id] ?? "")}
          onChange={(e) => set(f.id, e.target.value)}
        />
      )}
      {f.help && <span className="help">{f.help}</span>}
    </div>
  );
}

export default function Calculators({ product: pid }: { product: ProductId }) {
  const P = PRODUCTS[pid];
  const sections = useMemo(() => P.sections(), [P]);
  const [allStates, setAllStates] = useStoredState<Partial<Record<ProductId, State>>>("ibd-calc-state", {});
  const [scenarios, setScenarios] = useStoredState<Scenario[]>("ibd-scenarios", []);
  const [scnName, setScnName] = useState("");

  const st: State = useMemo(() => normalise({ ...defaultState(pid), ...(allStates[pid] ?? {}) }, sections), [allStates, pid, sections]);
  const set = (k: string, v: string | boolean) => setAllStates((all) => ({ ...all, [pid]: normalise({ ...st, [k]: v }, sections) }));
  const reset = () => setAllStates((all) => ({ ...all, [pid]: defaultState(pid) }));

  const r: Result & { gstTotal: number; total: number } = useMemo(() => {
    const res = P.compute(st);
    const gstTotal = res.gst.reduce((a, g) => a + g[1], 0);
    return { ...res, gstTotal, total: res.net + gstTotal };
  }, [P, st]);

  const save = () => {
    const name = scnName.trim() || `${P.name} ${scenarios.length + 1}`;
    setScenarios((s) => [...s, { name, product: P.name, sub: r.sub.split(" · ").slice(1).join(" · "), net: r.net, gst: r.gstTotal, total: r.total }]);
    setScnName("");
  };

  let lastSec = "";
  const notes = [...r.notes].sort((a, b) => NOTE_ORDER[a[0]] - NOTE_ORDER[b[0]]);

  return (
    <div className="calcs">
      <section className="intro">
        <h1>{CALC_H1[pid]}</h1>
        <p>
          Change any condition and the premium slip updates with every formula and rule flag. Motor uses the 2022 TP Rules and the erstwhile Indian Motor
          Tariff for OD; health and term life use editable illustrative models.
        </p>
      </section>

      <nav className="subtabs" aria-label="Product">
        {PRODUCT_ORDER.map((id) => (
          <Link key={id} to={paths.calc(id)} aria-current={pid === id ? "page" : undefined}>
            {PRODUCTS[id].name}
            <span className={`tag ${PRODUCTS[id].model ? "model" : "tariff"}`}>{PRODUCTS[id].model ? "model" : "tariff"}</span>
          </Link>
        ))}
      </nav>

      <div className="calc-grid">
        <form className="form" onSubmit={(e) => e.preventDefault()} autoComplete="off">
          {sections.map((sec) => {
            const body = (
              <div className="fields">
                {sec.fields.map((f) => (
                  <FieldControl key={f.id} f={f} st={st} pid={pid} set={set} />
                ))}
              </div>
            );
            if (sec.legend.startsWith("Model assumptions"))
              return (
                <fieldset key={sec.legend}>
                  <legend>
                    {sec.legend} <span className="tag model">editable</span>
                  </legend>
                  <p className="help">Annual base premium for ₹5 lakh, Zone 1, one person, before GST. Replace with an insurer's rate card to mirror a real product.</p>
                  <details className="assume">
                    <summary>Edit base rates, floater and zone factors</summary>
                    {body}
                  </details>
                </fieldset>
              );
            return (
              <fieldset key={sec.legend}>
                <legend>{sec.legend}</legend>
                {body}
              </fieldset>
            );
          })}
          {P.addons && (
            <fieldset>
              <legend>
                Add-on covers <span className="tag model">insurer rates, editable</span>
              </legend>
              <div className="addons">
                {P.addons.map(([id, label, basis]) => (
                  <div className="addon" key={id}>
                    <label className="chk" htmlFor={`${pid}-ao-${id}`}>
                      <input id={`${pid}-ao-${id}`} type="checkbox" checked={st[`ao_${id}`] === true} onChange={(e) => set(`ao_${id}`, e.target.checked)} />
                      <span>{label}</span>
                    </label>
                    <input
                      id={`${pid}-ar-${id}`}
                      type="number"
                      step="any"
                      inputMode="decimal"
                      aria-label={`${label} rate`}
                      value={String(st[`ar_${id}`])}
                      onChange={(e) => set(`ar_${id}`, e.target.value)}
                    />
                    <span className="unit">{UNIT[basis]}</span>
                  </div>
                ))}
              </div>
            </fieldset>
          )}
        </form>

        <aside className="slip" aria-live="polite">
          <div className="slip-head">
            <span className="k">Total payable</span>
            <div className="total">
              {inr(r.total)}
              <small>{pid === "life" ? "per year, incl. GST" : "incl. GST"}</small>
            </div>
            <span className="slip-sub">{r.sub}</span>
          </div>
          <div className="kpis">
            {r.kpis.map(([k, v]) => (
              <div className="kpi" key={k}>
                <div className="k">{k}</div>
                <div className="v">{v}</div>
              </div>
            ))}
          </div>
          <div className="lines">
            <table>
              <tbody>
                {r.lines.flatMap((l, i) => {
                  const rows = [];
                  if (l[0] !== lastSec) {
                    lastSec = l[0];
                    rows.push(
                      <tr key={`h${i}`}>
                        <th colSpan={2}>{SECTION_NAMES[l[0]] ?? l[0]}</th>
                      </tr>,
                    );
                  }
                  rows.push(
                    <tr key={i} className={l[4] === "sub" ? "sub" : l[3] < 0 ? "neg" : ""}>
                      <td>
                        {l[1]}
                        {l[2] && <span className="calc">{l[2]}</span>}
                      </td>
                      <td className="amt">{l[4] === "rate" ? inr2(l[3]) : inr(l[3])}</td>
                    </tr>,
                  );
                  return rows;
                })}
                <tr>
                  <th colSpan={2}>Premium and tax</th>
                </tr>
                <tr className="sub">
                  <td>Net premium</td>
                  <td className="amt">{inr(r.net)}</td>
                </tr>
                {r.gst.map(([label, amt]) => (
                  <tr key={label}>
                    <td>{label}</td>
                    <td className="amt">{inr(amt)}</td>
                  </tr>
                ))}
                <tr className="grand">
                  <td>Total payable</td>
                  <td className="amt">{inr(r.total)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="notes">
            {notes.length ? (
              notes.map(([lvl, badge, text], i) => (
                <div className={`note ${lvl}`} key={i}>
                  <span className="b">{badge}</span>
                  <span>{text}</span>
                </div>
              ))
            ) : (
              <span className="muted">No rule flags for this case.</span>
            )}
          </div>
          <div className="slip-actions">
            <input className="name" type="text" placeholder="Scenario name" aria-label="Scenario name" value={scnName} onChange={(e) => setScnName(e.target.value)} />
            <button className="btn primary" type="button" onClick={save}>
              Save scenario
            </button>
            <button className="btn" type="button" onClick={reset}>
              Reset inputs
            </button>
          </div>
        </aside>
      </div>

      <section className="panel">
        <h2>Compare scenarios</h2>
        {scenarios.length === 0 ? (
          <p className="muted">
            Save a scenario from the premium slip to compare conditions side by side, for example the same car with and without zero depreciation, or a 1-year
            vs 3-year health policy.
          </p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Scenario</th>
                  <th>Product</th>
                  <th>Cover</th>
                  <th className="r">Net premium</th>
                  <th className="r">GST</th>
                  <th className="r">Total</th>
                  <th className="r">vs first</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {scenarios.map((s, i) => {
                  const diff = s.total - scenarios[0].total;
                  return (
                    <tr key={i}>
                      <td>{s.name}</td>
                      <td>{s.product}</td>
                      <td>{s.sub}</td>
                      <td className="r num">{inr(s.net)}</td>
                      <td className="r num">{inr(s.gst)}</td>
                      <td className="r num">
                        <b>{inr(s.total)}</b>
                      </td>
                      <td className="r num">{i === 0 ? "–" : `${diff >= 0 ? "+" : ""}${inr(diff)}`}</td>
                      <td>
                        <button className="btn small" type="button" onClick={() => setScenarios((all) => all.filter((_, j) => j !== i))}>
                          Remove
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
