import { useEffect, useMemo, useState } from "react";
import { GLOSSARY, MODULES, SOURCES, STUDY_PLAN } from "../data/learn";
import { useStoredState } from "../hooks";
import type { ProductId } from "../calc/types";
import type { Category } from "../data/interview";
import { DIAGRAMS, DIAGRAM_TITLE } from "./Diagrams";

const CALC_LINK: Record<string, ProductId> = { motor: "car", health: "health", life: "life" };

const topicKey = (moduleId: string, topicId: string) => `t-${moduleId}-${topicId}`;

/** Scroll to an element and briefly highlight it */
function jumpTo(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
  el.classList.add("flash");
  setTimeout(() => el.classList.remove("flash"), 1600);
}

export default function Learn({
  focus = "",
  onOpenCalc,
  onOpenInterview,
  onOpenWhiteboard,
}: {
  /** Element id to scroll to on arrival, e.g. "d-quote" from #learn/d-quote */
  focus?: string;
  onOpenCalc: (p: ProductId) => void;
  onOpenInterview: (c: Category) => void;
  onOpenWhiteboard: () => void;
}) {
  const [returnTo, setReturnTo] = useState<{ id: string; label: string } | null>(null);

  useEffect(() => {
    if (!focus) return;
    const t = setTimeout(() => jumpTo(focus), 50);
    return () => clearTimeout(t);
  }, [focus]);
  const [done, setDone] = useStoredState<Record<string, boolean>>("ibd-learn-done", {});
  const totalPoints = useMemo(() => MODULES.reduce((n, m) => n + m.topics.reduce((k, t) => k + t.points.length, 0), 0), []);
  const doneCount = Object.values(done).filter(Boolean).length;
  const toggle = (key: string) => setDone((d) => ({ ...d, [key]: !d[key] }));

  const topicProgress = (moduleId: string, topicId: string) => {
    const t = MODULES.find((m) => m.id === moduleId)?.topics.find((x) => x.id === topicId);
    if (!t) return [0, 0];
    return [t.points.filter((_, i) => done[`${moduleId}.${topicId}.${i}`]).length, t.points.length];
  };

  const openTopic = (week: number, moduleId: string, topicId: string) => {
    setReturnTo({ id: `week-${week}`, label: `week ${week}` });
    jumpTo(topicKey(moduleId, topicId));
  };

  const openDiagram = (from: string, label: string, diagramId: string) => {
    setReturnTo({ id: from, label });
    jumpTo(`d-${diagramId}`);
  };

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
            <a href="#learn" onClick={(e) => (e.preventDefault(), document.getElementById("diagrams")?.scrollIntoView({ behavior: "smooth" }))}>
              <span className="dot plan" aria-hidden="true" />
              <span className="toc-title">Reference diagrams</span>
            </a>
          </li>
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
          <button className="btn ghost" type="button" onClick={() => jumpTo("plan")}>
            New to insurance? Follow the 8-week study plan →
          </button>
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
                <article key={t.id} id={topicKey(m.id, t.id)} className="topic">
                  <h3>{t.title}</h3>
                  <p className="topic-intro">{t.intro}</p>
                  {t.diagram && (
                    <button type="button" className="btn ghost diagram-link" onClick={() => openDiagram(topicKey(m.id, t.id), t.title, t.diagram!)}>
                      See the diagram: {DIAGRAM_TITLE[t.diagram]} →
                    </button>
                  )}
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

        <section id="diagrams" className="module">
          <header className="module-head">
            <span className="module-no">Reference</span>
            <h2>Reference diagrams</h2>
            <p className="lead">
              Insurance BAs draw these all the time: in workshops, in requirement documents and on the whiteboard in interviews. Learn to sketch each one from
              memory in two or three minutes.
            </p>
            <button className="btn primary" type="button" onClick={onOpenWhiteboard}>
              Practise on a blank whiteboard →
            </button>
          </header>
          <div className="diagrams">
            {DIAGRAMS.map((d) => (
              <figure key={d.id} id={`d-${d.id}`} className="diagram">
                <figcaption>
                  <h3>{d.title}</h3>
                  <p>
                    <b>When to draw it:</b> {d.when}
                  </p>
                </figcaption>
                <div className="dg-wrap">{d.render()}</div>
                <ul className="dg-tips">
                  {d.tips.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </figure>
            ))}
          </div>
        </section>

        <section id="plan" className="module">
          <header className="module-head">
            <span className="module-no">Plan</span>
            <h2>Eight-week study plan</h2>
            <p className="lead">
              About 6 to 8 hours a week. Each week links to the topics to study, the calculators and interview questions to practise, and ends with
              something you can show in an interview. Tap a topic to jump to it.
            </p>
          </header>
          <ol className="weeks">
            {STUDY_PLAN.map((w) => {
              const prog = w.topics.map(([m, t]) => topicProgress(m, t));
              const d = prog.reduce((n, p) => n + p[0], 0);
              const n = prog.reduce((k, p) => k + p[1], 0);
              return (
                <li key={w.week} id={`week-${w.week}`} className="week">
                  <header className="week-head">
                    <span className="week-no">Week {w.week}</span>
                    <h3>{w.focus}</h3>
                    <span className="toc-count">
                      {d}/{n} points
                    </span>
                  </header>
                  <p className="week-goal">{w.goal}</p>

                  <h4>Study these topics</h4>
                  <ul className="week-topics">
                    {w.topics.map(([mid, tid], i) => {
                      const m = MODULES.find((x) => x.id === mid);
                      const t = m?.topics.find((x) => x.id === tid);
                      if (!m || !t) return null;
                      const [td, tn] = prog[i];
                      return (
                        <li key={`${mid}.${tid}`}>
                          <button type="button" className="topic-link" onClick={() => openTopic(w.week, mid, tid)}>
                            <span className="topic-link-mod">Module {m.number}</span>
                            <span className="topic-link-title">{t.title}</span>
                            <span className={`toc-count${td === tn ? " complete" : ""}`}>
                              {td}/{tn}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>

                  <h4>This week, step by step</h4>
                  <ol className="week-tasks">
                    {w.tasks.map((x) => (
                      <li key={x}>{x}</li>
                    ))}
                  </ol>

                  <h4>Practise</h4>
                  <div className="week-practise">
                    {w.practise.map((p) => (
                      <button
                        key={p.label}
                        type="button"
                        className="btn small"
                        onClick={() => (p.calc ? onOpenCalc(p.calc) : p.interview && onOpenInterview(p.interview))}
                      >
                        {p.label} →
                      </button>
                    ))}
                  </div>

                  <div className="week-output">
                    <b>End-of-week output: {w.output}</b>
                    <p>{w.outputHow}</p>
                  </div>

                  <details className="week-check">
                    <summary>Check yourself before moving on</summary>
                    <ul>
                      {w.check.map((q) => (
                        <li key={q}>{q}</li>
                      ))}
                    </ul>
                  </details>
                </li>
              );
            })}
          </ol>
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

      {returnTo && (
        <button
          type="button"
          className="btn primary back-to-plan"
          onClick={() => {
            jumpTo(returnTo.id);
            setReturnTo(null);
          }}
        >
          ← Back to {returnTo.label}
        </button>
      )}
    </div>
  );
}
