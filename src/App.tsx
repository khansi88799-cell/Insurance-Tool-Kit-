import { useEffect } from "react";
import { AS_OF } from "./data/learn";
import { Link, useRouter } from "./router";
import { SITE_URL, parseRoute, paths, routeMeta, type TabId } from "./routes";
import Learn from "./components/Learn";
import Interview from "./components/Interview";
import Calculators from "./components/Calculators";
import Whiteboard from "./components/Whiteboard";

const TABS: { id: TabId; to: string; label: string; short?: string; hint: string }[] = [
  { id: "learn", to: paths.home, label: "Learn", hint: "Topics and study plan" },
  { id: "interview", to: paths.interview(), label: "Interview prep", short: "Interview", hint: "Questions with model answers" },
  { id: "calculators", to: paths.calculators, label: "Calculators", hint: "Premium rating, step by step" },
  { id: "whiteboard", to: paths.whiteboard, label: "Whiteboard", hint: "Draw flows and BPMN swimlanes" },
];

/** Keep the title, description and share tags in step with client-side navigation */
function setHead(title: string, description: string, url: string) {
  document.title = title;
  const set = (sel: string, attr: string, value: string) => document.head.querySelector(sel)?.setAttribute(attr, value);
  set('meta[name="description"]', "content", description);
  set('link[rel="canonical"]', "href", url);
  set('meta[property="og:title"]', "content", title);
  set('meta[property="og:description"]', "content", description);
  set('meta[property="og:url"]', "content", url);
}

export default function App() {
  const { loc, navigate } = useRouter();
  const route = parseRoute(loc.pathname);
  const meta = routeMeta(route, loc.pathname);

  useEffect(() => {
    if (typeof document !== "undefined") setHead(meta.title, meta.description, SITE_URL + meta.canonical);
  }, [meta.title, meta.description, meta.canonical]);

  return (
    <div className="app">
      <header className="masthead">
        <div className="wrap masthead-inner">
          <Link className="brand" to={paths.home}>
            <svg viewBox="0 0 32 32" aria-hidden="true">
              <rect width="32" height="32" rx="7" />
              <path d="M16 6l9 3.5v6.2c0 5.4-3.7 9.3-9 10.8-5.3-1.5-9-5.4-9-10.8V9.5z" />
              <path d="M12 16l3 3 5-6" />
            </svg>
            <span>
              <strong>Insurance Learning Desk</strong>
              <small>Indian insurance guide, from beginner to pro</small>
            </span>
          </Link>
          <span className="asof">
            Rules as of <b>{AS_OF}</b>
          </span>
        </div>
        <nav className="wrap tabs" aria-label="Sections">
          {TABS.map((t) => (
            <Link key={t.id} to={t.to} className="tab" aria-current={route.tab === t.id ? "page" : undefined}>
              <span>
                <span className="tab-long">{t.label}</span>
                <span className="tab-short">{t.short ?? t.label}</span>
              </span>
              <small>{t.hint}</small>
            </Link>
          ))}
        </nav>
      </header>

      <main className="wrap main">
        {route.tab === "learn" && <Learn page={route.page} moduleId={route.module} />}
        {route.tab === "interview" && <Interview category={route.category} />}
        {route.tab === "calculators" && <Calculators product={route.product} />}
        {route.tab === "whiteboard" && (
          <Whiteboard start={new URLSearchParams(loc.search).get("start") ?? ""} onStarted={() => navigate(paths.whiteboard, { replace: true, scroll: false })} />
        )}
        {route.tab === "notfound" && (
          <section className="intro not-found">
            <h1>Page not found</h1>
            <p>This page does not exist or has moved. Try one of these instead.</p>
            <p className="not-found-links">
              <Link className="btn primary" to={paths.home}>
                Learn home
              </Link>
              <Link className="btn" to={paths.interview()}>
                Interview questions
              </Link>
              <Link className="btn" to={paths.calculators}>
                Calculators
              </Link>
            </p>
          </section>
        )}
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

