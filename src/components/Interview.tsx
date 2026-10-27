import { useMemo, useState } from "react";
import { CATEGORIES, QUESTIONS, type Category, type Question } from "../data/interview";
import { useStoredState } from "../hooks";
import type { ProductId } from "../calc/types";
import { Link } from "../router";
import { paths } from "../routes";
import { DIAGRAM_TITLE } from "./Diagrams";

type Level = Question["level"] | "All";

export default function Interview({ category: cat }: { category: Category | "All" }) {
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState<Level>("All");
  const [showAll, setShowAll] = useState(false);
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [practised, setPractised] = useStoredState<Record<string, boolean>>("ibd-iq-done", {});
  const [hideDone, setHideDone] = useState(false);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return QUESTIONS.filter(
      (x) =>
        (cat === "All" || x.cat === cat) &&
        (level === "All" || x.level === level) &&
        (!hideDone || !practised[x.id]) &&
        (!q || x.q.toLowerCase().includes(q) || x.a.some((a) => a.toLowerCase().includes(q))),
    );
  }, [query, cat, level, hideDone, practised]);

  const doneCount = QUESTIONS.filter((x) => practised[x.id]).length;
  const counts = useMemo(() => Object.fromEntries(CATEGORIES.map((c) => [c, QUESTIONS.filter((x) => x.cat === c).length])), []);

  const randomQuestion = () => {
    const pool = list.length ? list : QUESTIONS;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    setOpen({});
    setShowAll(false);
    requestAnimationFrame(() => document.getElementById(`q-${pick.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" }));
    document.getElementById(`q-${pick.id}`)?.classList.add("flash");
    setTimeout(() => document.getElementById(`q-${pick.id}`)?.classList.remove("flash"), 1600);
  };

  return (
    <div className="interview">
      <section className="intro">
        <h1>{cat === "All" ? "Insurance interview questions, updated for 2026 rules" : `${cat} interview questions for insurance roles`}</h1>
        <p>
          {QUESTIONS.length} questions from core to advanced: concepts, calculations, whiteboard diagrams, SQL, scenarios and behavioural. Answer out loud first,
          then reveal the model answer and example. Mark each one practised when you can answer it without looking.
        </p>
      </section>

      <div className="iq-tools">
        <input className="search" type="search" placeholder="Search questions and answers" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search" />
        <select value={level} onChange={(e) => setLevel(e.target.value as Level)} aria-label="Level">
          <option value="All">All levels</option>
          <option value="Core">Core</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>
        <label className="chk">
          <input type="checkbox" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} /> Show all answers
        </label>
        <label className="chk">
          <input type="checkbox" checked={hideDone} onChange={(e) => setHideDone(e.target.checked)} /> Hide practised
        </label>
        <button className="btn primary" type="button" onClick={randomQuestion}>
          Random question
        </button>
        <span className="iq-progress">
          Practised <b>{doneCount}</b> of {QUESTIONS.length}
        </span>
      </div>

      <nav className="chips" aria-label="Category">
        <Link to={paths.interview()} className="chip" aria-current={cat === "All" ? "page" : undefined}>
          All <span>{QUESTIONS.length}</span>
        </Link>
        {CATEGORIES.map((c) => (
          <Link key={c} to={paths.interview(c)} className="chip" aria-current={cat === c ? "page" : undefined}>
            {c} <span>{counts[c]}</span>
          </Link>
        ))}
      </nav>

      {list.length === 0 && <p className="muted">No questions match. Clear the search or pick another category.</p>}

      <ol className="qlist">
        {list.map((x) => {
          const isOpen = showAll || open[x.id];
          return (
            <li key={x.id} id={`q-${x.id}`} className={`qcard ${practised[x.id] ? "done" : ""}`}>
              <div className="qmeta">
                <span className="qcat">{x.cat}</span>
                <span className={`qlevel ${x.level.toLowerCase()}`}>{x.level}</span>
              </div>
              <h3>{x.q}</h3>
              <div className="qbody" id={`a-${x.id}`} hidden={!isOpen}>
                <ul className="answer">
                  {x.a.map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ul>
                {x.ex && (
                  <div className={`example${x.cat === "Data and SQL" ? " code" : ""}`}>
                    <b>{x.cat === "Data and SQL" ? "Example query" : "Example"}</b>
                    {x.ex}
                  </div>
                )}
              </div>
              <div className="qactions">
                {!showAll && (
                  <button type="button" className="btn ghost" aria-expanded={!!isOpen} aria-controls={`a-${x.id}`} onClick={() => setOpen((o) => ({ ...o, [x.id]: !o[x.id] }))}>
                    {isOpen ? "Hide answer" : "Reveal answer"}
                  </button>
                )}
                {x.diagram && (
                  <Link className="btn ghost" to={paths.diagram(x.diagram)}>
                    See the diagram: {DIAGRAM_TITLE[x.diagram]} →
                  </Link>
                )}
                {x.try && (
                  <Link className="btn ghost" to={paths.calc(x.try as ProductId)}>
                    Try it in the calculator →
                  </Link>
                )}
                <label className="chk">
                  <input type="checkbox" checked={!!practised[x.id]} onChange={() => setPractised((p) => ({ ...p, [x.id]: !p[x.id] }))} /> Practised
                </label>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
