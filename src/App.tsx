import { useHashTab, type TabId } from "./hooks";
import { AS_OF } from "./data/learn";
import Learn from "./components/Learn";
import Interview from "./components/Interview";
import Calculators from "./components/Calculators";
import Whiteboard from "./components/Whiteboard";

const TABS: { id: TabId; label: string; short?: string; hint: string }[] = [
  { id: "learn", label: "Learn", hint: "Topics and study plan" },
  { id: "interview", label: "Interview prep", short: "Interview", hint: "Questions with model answers" },
  { id: "calculators", label: "Calculators", hint: "Premium rating, step by step" },
  { id: "whiteboard", label: "Whiteboard", hint: "Draw flows and BPMN swimlanes" },
];

export default function App() {
  const [tab, sub, go] = useHashTab();

  return (
    <div className="app">
      <header className="masthead">
        <div className="wrap masthead-inner">
          <a className="brand" href="#learn" onClick={(e) => (e.preventDefault(), go("learn"))}>
            <svg viewBox="0 0 32 32" aria-hidden="true">
              <rect width="32" height="32" rx="7" />
              <path d="M16 6l9 3.5v6.2c0 5.4-3.7 9.3-9 10.8-5.3-1.5-9-5.4-9-10.8V9.5z" />
              <path d="M12 16l3 3 5-6" />
            </svg>
            <span>
              <strong>Insurance Learning Desk</strong>
              <small>Indian insurance guide, from beginner to pro</small>
            </span>
          </a>
          <span className="asof">
            Rules as of <b>{AS_OF}</b>
          </span>
        </div>
        <nav className="wrap tabs" aria-label="Sections">
          {TABS.map((t) => (
            <a
              key={t.id}
              href={`#${t.id}`}
              className="tab"
              aria-current={tab === t.id ? "page" : undefined}
              onClick={(e) => {
                e.preventDefault();
                go(t.id);
              }}
            >
              <span>
                <span className="tab-long">{t.label}</span>
                <span className="tab-short">{t.short ?? t.label}</span>
              </span>
              <small>{t.hint}</small>
            </a>
          ))}
        </nav>
      </header>

      <main className="wrap main">
        {tab === "learn" && <Learn focus={sub} onOpenCalc={(p) => go("calculators", p)} onOpenInterview={(c) => go("interview", encodeURIComponent(c))} onOpenWhiteboard={() => go("whiteboard", "blank")} />}
        {tab === "interview" && (
          <Interview key={sub} initialCategory={sub} onOpenCalc={(p) => go("calculators", p)} onOpenDiagram={(d) => go("learn", `d-${d}`)} />
        )}
        {tab === "calculators" && <Calculators product={sub} onProduct={(p) => go("calculators", p)} />}
        {tab === "whiteboard" && <Whiteboard start={sub} onStarted={() => window.location.replace("#whiteboard")} />}
      </main>

      <footer className="wrap foot">
        <p>
          Study aid built from insurance training material and public sources, checked on {AS_OF}. Motor TP uses the 2022 Rules; OD uses the
          erstwhile tariff as a base. Health and life calculators are illustrative models, not insurer prices. Not financial or legal advice.
        </p>
      </footer>
    </div>
  );
}
