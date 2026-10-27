import { useMemo, useState } from "react";
import { GLOSSARY, MODULES, SOURCES, STUDY_PLAN, type Module } from "../data/learn";
import { useStoredState } from "../hooks";
import type { ProductId } from "../calc/types";
import { Link, useRouter } from "../router";
import { paths, type LearnPage } from "../routes";
import { DIAGRAMS, DIAGRAM_TITLE } from "./Diagrams";

const CALC_LINK: Record<string, ProductId> = { motor: "car", health: "health", life: "life" };

const topicKey = (moduleId: string, topicId: string) => `t-${moduleId}-${topicId}`;

export default function Learn({ page, moduleId }: { page: LearnPage; moduleId?: string }) {
  const { navigate } = useRouter();
  /** Where the floating "Back to …" button returns to after following a study-plan or diagram link */
  const [returnTo, setReturnTo] = useState<{ to: string; label: string } | null>(null);
  const [done, setDone] = useStoredState<Record<string, boolean>>("ibd-learn-done", {});
  const totalPoints = useMemo(() => MODULES.reduce((n, m) => n + m.topics.reduce((k, t) => k + t.points.length, 0), 0), []);
  const doneCount = Object.values(done).filter(Boolean).length;
  const toggle = (key: string) => setDone((d) => ({ ...d, [key]: !d[key] }));

  const moduleProgress = (m: Module) => [
    m.topics.reduce((k, t) => k + t.points.filter((_, i) => done[`${m.id}.${t.id}.${i}`]).length, 0),
    m.topics.reduce((k, t) => k + t.points.length, 0),
  ];

  const topicProgress = (moduleId: string, topicId: string) => {
    const t = MODULES.find((m) => m.id === moduleId)?.topics.find((x) => x.id === topicId);
    if (!t) return [0, 0];
    return [t.points.filter((_, i) => done[`${moduleId}.${topicId}.${i}`]).length, t.points.length];
  };

  const mi = MODULES.findIndex((m) => m.id === moduleId);
  const extraPages: [LearnPage, string, string][] = [
    ["diagrams", paths.diagrams, "Reference diagrams"],
    ["plan", paths.plan, "8-week study plan"],
    ["glossary", paths.glossary, "Glossary and sources"],
  ];

  return (
    <div className={`learn ${page}`}>
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
            const [d, n] = moduleProgress(m);
            return (
              <li key={m.id}>
                <Link to={paths.module(m.id)} aria-current={page === "module" && m.id === moduleId ? "page" : undefined}>
                  <span className="dot" aria-hidden="true" />
                  <span className="toc-title">{m.title}</span>
                  <span className="toc-count">
                    {d}/{n}
                  </span>
                </Link>
              </li>
            );
          })}
          {extraPages.map(([id, to, label]) => (
            <li key={id}>
              <Link to={to} aria-current={page === id ? "page" : undefined}>
                <span className="dot plan" aria-hidden="true" />
                <span className="toc-title">{label}</span>
              </Link>
            </li>
          ))}
        </ol>
      </aside>

      <div className="learn-body">
        {page !== "home" && (
          <nav className="crumbs" aria-label="Breadcrumb">
            <Link to={paths.home}>Learn</Link>
            <span aria-hidden="true">/</span>
            <span>{page === "module" ? `Module ${MODULES[mi].number}` : extraPages.find(([id]) => id === page)?.[2]}</span>
          </nav>
        )}

        {page === "home" && (
          <>
            <section className="intro">
              <h1>Learn Indian insurance, from beginner to pro</h1>
              <p>
                Nine modules covering Indian life, general and health insurance, updated to the rules in force on 26 October 2026. Each point has a plain
                explanation and an example. Read a topic, then tick each point once you can explain it out loud without looking.
              </p>
              <Link className="btn primary" to={paths.plan}>
                New to insurance? Follow the 8-week study plan →
              </Link>
            </section>
            <ol className="module-cards">
              {MODULES.map((m) => {
                const [d, n] = moduleProgress(m);
                return (
                  <li key={m.id} className="module-card">
                    <span className="module-no">Module {m.number}</span>
                    <h2>
                      <Link to={paths.module(m.id)}>{m.title}</Link>
                    </h2>
                    <p>{m.summary}</p>
                    <span className="module-card-foot">
                      <span className={`toc-count${d === n ? " complete" : ""}`}>
                        {d}/{n} points
                      </span>
                      <span>{m.topics.length} topics →</span>
                    </span>
                  </li>
                );
              })}
            </ol>
            <ul className="extra-cards">
              <li>
                <Link to={paths.diagrams}>
                  <b>Reference diagrams</b>
                  <span>Nine process, swimlane and data diagrams to learn to sketch from memory.</span>
                </Link>
              </li>
              <li>
                <Link to={paths.plan}>
                  <b>8-week study plan</b>
                  <span>What to read and practise each week, with an output to show in interviews.</span>
                </Link>
              </li>
              <li>
                <Link to={paths.glossary}>
                  <b>Glossary and sources</b>
                  <span>{GLOSSARY.length} key terms in plain English, and where the rules come from.</span>
                </Link>
              </li>
            </ul>
          </>
        )}

        {page === "module" &&
          [MODULES[mi]].map((m) => (
            <section key={m.id} id={`m-${m.id}`} className="module">
              <header className="module-head">
                <span className="module-no">Module {m.number}</span>
                <h1>{m.title}</h1>
                <p className="lead">{m.summary}</p>
                <p className="context">{m.context}</p>
                {CALC_LINK[m.id] && (
                  <Link className="btn ghost" to={paths.calc(CALC_LINK[m.id])}>
                    Practise in the calculator →
                  </Link>
                )}
              </header>
              <div className="topics">
                {m.topics.map((t) => (
                  <article key={t.id} id={topicKey(m.id, t.id)} className="topic">
                    <h2>{t.title}</h2>
                    <p className="topic-intro">{t.intro}</p>
                    {t.diagram && (
                      <Link
                        className="btn ghost diagram-link"
                        to={paths.diagram(t.diagram)}
                        onClick={() => setReturnTo({ to: paths.topic(m.id, t.id), label: t.title })}
                      >
                        See the diagram: {DIAGRAM_TITLE[t.diagram]} →
                      </Link>
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
              <nav className="pager" aria-label="Modules">
                {mi > 0 ? (
                  <Link to={paths.module(MODULES[mi - 1].id)}>
                    <small>← Previous</small>
                    {MODULES[mi - 1].title}
                  </Link>
                ) : (
                  <Link to={paths.home}>
                    <small>← Back to</small>
                    All modules
                  </Link>
                )}
                {mi < MODULES.length - 1 ? (
                  <Link className="next" to={paths.module(MODULES[mi + 1].id)}>
                    <small>Next →</small>
                    {MODULES[mi + 1].title}
                  </Link>
                ) : (
                  <Link className="next" to={paths.diagrams}>
                    <small>Next →</small>
                    Reference diagrams
                  </Link>
                )}
              </nav>
            </section>
          ))}

        {page === "diagrams" && (
          <section id="diagrams" className="module">
            <header className="module-head">
              <span className="module-no">Reference</span>
              <h1>Insurance process diagrams</h1>
              <p className="lead">
                Insurance BAs draw these all the time: in workshops, in requirement documents and on the whiteboard in interviews. Learn to sketch each one from
                memory in two or three minutes.
              </p>
              <Link className="btn primary" to={paths.blankWhiteboard}>
                Practise on a blank whiteboard →
              </Link>
            </header>
            <div className="diagrams">
              {DIAGRAMS.map((d) => (
                <figure key={d.id} id={`d-${d.id}`} className="diagram">
                  <figcaption>
                    <h2>{d.title}</h2>
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
        )}

        {page === "plan" && (
          <section id="plan" className="module">
            <header className="module-head">
              <span className="module-no">Plan</span>
              <h1>Eight-week study plan</h1>
              <p className="lead">
                About 6 to 8 hours a week. Each week links to the topics to study, the calculators and interview questions to practise, and ends with
                something you can show in an interview. Tap a topic to open it.
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
                      <h2>{w.focus}</h2>
                      <span className="toc-count">
                        {d}/{n} points
                      </span>
                    </header>
                    <p className="week-goal">{w.goal}</p>

                    <h3>Study these topics</h3>
                    <ul className="week-topics">
                      {w.topics.map(([mid, tid], i) => {
                        const m = MODULES.find((x) => x.id === mid);
                        const t = m?.topics.find((x) => x.id === tid);
                        if (!m || !t) return null;
                        const [td, tn] = prog[i];
                        return (
                          <li key={`${mid}.${tid}`}>
                            <Link className="topic-link" to={paths.topic(mid, tid)} onClick={() => setReturnTo({ to: paths.week(w.week), label: `week ${w.week}` })}>
                              <span className="topic-link-mod">Module {m.number}</span>
                              <span className="topic-link-title">{t.title}</span>
                              <span className={`toc-count${td === tn ? " complete" : ""}`}>
                                {td}/{tn}
                              </span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>

                    <h3>This week, step by step</h3>
                    <ol className="week-tasks">
                      {w.tasks.map((x) => (
                        <li key={x}>{x}</li>
                      ))}
                    </ol>

                    <h3>Practise</h3>
                    <div className="week-practise">
                      {w.practise.map((p) => (
                        <Link key={p.label} className="btn small" to={p.calc ? paths.calc(p.calc) : paths.interview(p.interview)}>
                          {p.label} →
                        </Link>
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
        )}

        {page === "glossary" && (
          <section id="glossary" className="module">
            <header className="module-head">
              <span className="module-no">Reference</span>
              <h1>Insurance glossary</h1>
              <p className="lead">Key Indian insurance terms in plain English.</p>
            </header>
            <dl className="glossary">
              {GLOSSARY.map(([term, def]) => (
                <div key={term}>
                  <dt>{term}</dt>
                  <dd>{def}</dd>
                </div>
              ))}
            </dl>
            <h2 className="sources-h">Sources</h2>
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
        )}
      </div>

      {returnTo && (
        <button
          type="button"
          className="btn primary back-to-plan"
          onClick={() => {
            navigate(returnTo.to);
            setReturnTo(null);
          }}
        >
          ← Back to {returnTo.label}
        </button>
      )}
    </div>
  );
}
