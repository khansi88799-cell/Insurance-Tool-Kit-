import { useMemo } from "react";
import { GLOSSARY, MODULES, SOURCES, STUDY_PLAN } from "../data/learn";
import { useStoredState } from "../hooks";
import type { ProductId } from "../calc/types";

const CALC_LINK: Record<string, ProductId> = { motor: "car", health: "health", life: "life" };

export default function Learn({ onOpenCalc }: { onOpenCalc: (p: ProductId) => void }) {
  const [done, setDone] = useStoredState<Record<string, boolean>>("ibd-learn-done", {});
  const totalPoints = useMemo(() => MODULES.reduce((n, m) => n + m.topics.reduce((k, t) => k + t.points.length, 0), 0), []);
  const doneCount = Object.values(done).filter(Boolean).length;
  const toggle = (key: string) => setDone((d) => ({ ...d, [key]: !d[key] }));

  return (
    <div className="learn">
      <aside className="toc" aria-label="Modules">
        <div className="progress">
          <div className="progress-top">
            <span>Your progress</span>
            <b>
              {doneCount} / {totalPoints}
            </b>
          </div>
          <div className="bar" role="progressbar" aria-valuemin={0} aria-valuemax={totalPoints} aria-valuenow={doneCount}>
            <span style={{ width: `${(doneCount / totalPoints) * 100}%` }} />
          </div>
          <small>Tick points as you can explain them out loud.</small>
        </div>
        <ol>
          {MODULES.map((m) => {
            const n = m.topics.reduce((k, t) => k + t.points.length, 0);
            const d = m.topics.reduce((k, t) => k + t.points.filter((_, i) => done[`${m.id}.${t.id}.${i}`]).length, 0);
            return (
              <li key={m.id}>
                <a href={`#learn`} onClick={(e) => (e.preventDefault(), document.getElementById(`m-${m.id}`)?.scrollIntoView({ behavior: "smooth" }))}>
                  <span className="dot" aria-hidden="true" />
                  <span className="toc-title">{m.title}</span>
                  <span className="toc-count">
                    {d}/{n}
                  </span>
                </a>
              </li>
            );
          })}
          <li>
            <a href="#learn" onClick={(e) => (e.preventDefault(), document.getElementById("plan")?.scrollIntoView({ behavior: "smooth" }))}>
              <span className="dot plan" aria-hidden="true" />
              <span className="toc-title">8-week study plan</span>
            </a>
          </li>
          <li>
            <a href="#learn" onClick={(e) => (e.preventDefault(), document.getElementById("glossary")?.scrollIntoView({ behavior: "smooth" }))}>
              <span className="dot plan" aria-hidden="true" />
              <span className="toc-title">Glossary and sources</span>
            </a>
          </li>
        </ol>
      </aside>

      <div className="learn-body">
        <section className="intro">
          <h1>What to learn as an insurance BA</h1>
          <p>
            Nine modules covering Indian life, general and health insurance, updated to the rules in force on 26 October 2026. Each point has a plain
            explanation and an example. Read a topic, then tick each point once you can explain it out loud without looking.
          </p>
        </section>

        {MODULES.map((m) => (
          <section key={m.id} id={`m-${m.id}`} className="module">
            <header className="module-head">
              <span className="module-no">Module {m.number}</span>
              <h2>{m.title}</h2>
              <p className="lead">{m.summary}</p>
              <p className="context">{m.context}</p>
              {CALC_LINK[m.id] && (
                <button className="btn ghost" type="button" onClick={() => onOpenCalc(CALC_LINK[m.id])}>
                  Practise in the calculator →
                </button>
              )}
            </header>
            <div className="topics">
              {m.topics.map((t) => (
                <article key={t.id} className="topic">
                  <h3>{t.title}</h3>
                  <p className="topic-intro">{t.intro}</p>
                  <ul className="checks">
                    {t.points.map((p, i) => {
                      const key = `${m.id}.${t.id}.${i}`;
                      return (
                        <li key={key}>
                          <label>
                            <input type="checkbox" checked={!!done[key]} onChange={() => toggle(key)} />
                            <span className="point">{p.t}</span>
                          </label>
                          <div className="point-body">
                            <p>{p.d}</p>
                            {p.ex && (
                              <p className="example">
                                <b>Example</b>
                                {p.ex}
                              </p>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </article>
              ))}
            </div>
            {m.table && (
              <div className="table-wrap">
                <table>
                  <caption>{m.table.caption}</caption>
                  <thead>
                    <tr>
                      {m.table.head.map((h) => (
                        <th key={h}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {m.table.rows.map((r) => (
                      <tr key={r.join("|")}>
                        {r.map((c, i) => (
                          <td key={i}>{c}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        ))}

        <section id="plan" className="module">
          <header className="module-head">
            <span className="module-no">Plan</span>
            <h2>Eight-week study plan</h2>
            <p className="lead">About 6 to 8 hours a week. Each week ends with something you can show in an interview.</p>
          </header>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Week</th>
                  <th>Focus</th>
                  <th>Use</th>
                  <th>Output</th>
                </tr>
              </thead>
              <tbody>
                {STUDY_PLAN.map((w) => (
                  <tr key={w.week}>
                    <td className="num">{w.week}</td>
                    <td>{w.focus}</td>
                    <td>{w.use}</td>
                    <td>{w.output}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="muted">
            Certifications: Insurance Institute of India Licentiate, LOMA (life) or The Institutes AINS (general), IRDAI POSP training, plus IIBA ECBA/CCBA or
            CSPO for the BA side.
          </p>
        </section>

        <section id="glossary" className="module">
          <header className="module-head">
            <span className="module-no">Reference</span>
            <h2>Glossary</h2>
          </header>
          <dl className="glossary">
            {GLOSSARY.map(([term, def]) => (
              <div key={term}>
                <dt>{term}</dt>
                <dd>{def}</dd>
              </div>
            ))}
          </dl>
          <h3 className="sources-h">Sources</h3>
          <ul className="sources">
            {SOURCES.map(([label, url]) => (
              <li key={url}>
                <a href={url} target="_blank" rel="noopener noreferrer">
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
