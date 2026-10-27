# CLAUDE.md — Insurance Tool Kit

Project context for Claude Code. `HANDOVER.md` (kept local, git-ignored) has the full history and decisions, if present.

## What this is

A static study website for learning **Indian insurance**, aimed at Business Analysts. Four tabs:

1. **Learn** (`/`, `/learn/<module-id>`, `/learn/diagrams`, `/learn/study-plan`, `/learn/glossary`): 9 modules of points to tick off, 8-week plan, glossary, sources.
2. **Interview prep** (`/interview`, `/interview/<category-slug>`): 89 questions with model answers, worked examples, diagram links, filters, practised tracker.
3. **Calculators** (`/calculators/<car|two-wheeler|commercial-vehicle|health|term-life>-insurance`): step-by-step premium rating with formulas, rule flags and scenario comparison.
4. **Whiteboard** (`/whiteboard`, `?start=blank`): SVG drawing canvas with flowchart and BPMN shapes, swimlane pools, connectors, templates, undo, PNG/SVG export. Board saved in localStorage key `ibd-whiteboard`; shapes and templates in `src/whiteboard/model.ts`.

Rules and rates are **as of 26 October 2026** (`AS_OF` in `src/data/learn.ts`).

## Stack and commands

- Vite 8, React 19, TypeScript 7 (strict), plain CSS. No backend, no router library, no UI kit.
- Node 22+. `npm install`, `npm run dev` (port 5173), `npm run build` (runs `tsc --noEmit`, `vite build`, an SSR build of `src/entry-server.tsx` into `dist-ssr/`, then `scripts/prerender.mjs`, which writes every route as `dist/<path>.html` plus `404.html`, `sitemap.xml`, `robots.txt` and deletes `dist-ssr/`), `npm run preview` (port 4173), `npm test` (Vitest: `src/calc/totals.test.ts`, `src/routes.test.ts`).
- Live on Cloudflare Pages: https://insurance-tool-kit.pages.dev (build `npm run build`, output `dist`, env `NODE_VERSION=22`); every push to `main` redeploys. Cloudflare Web Analytics is switched on in the Pages dashboard, not in code (Cloudflare injects the beacon at the edge). `SITE_URL` in `src/routes.ts` drives canonical, Open Graph and sitemap URLs. `netlify.toml` is kept as a fallback for Netlify.

## Layout

```
src/App.tsx              masthead + tabs, renders the page for parseRoute(path), keeps <head> tags in sync
src/routes.ts            URL scheme (paths.*), parseRoute, routeMeta (titles/descriptions/canonical), allPaths, legacyHashPath, SITE_URL
src/router.tsx           RouterProvider (History API), useRouter, <Link>, jumpTo
src/main.tsx             client entry: redirects old #tab links, then createRoot (renders over the prerendered HTML, no hydration, because localStorage and today's date differ from the build)
src/entry-server.tsx     buildFiles(): renderToString for every route + head tags, sitemap, robots, 404
scripts/prerender.mjs    writes buildFiles() output into dist/
src/hooks.ts             useStoredState (localStorage with try/catch, skipped on the server)
src/components/          Learn.tsx (page prop: home | module | diagrams | plan | glossary), Interview.tsx, Calculators.tsx, Diagrams.tsx (inline SVG reference diagrams; /learn/diagrams#d-<id> scrolls to one)
src/data/learn.ts        MODULES, STUDY_PLAN, GLOSSARY, SOURCES, AS_OF  ← content lives here
src/data/interview.ts    QUESTIONS, CATEGORIES                        ← content lives here
src/calc/types.ts        State, Field, Section, Result, Product types
src/calc/tables.ts       all rate tables (TP 2022 Rules, OD tariff, CV OD, health model)
src/calc/motor.ts        motorSections(kind) form config + computeMotor(kind, state)
src/calc/health.ts       healthSections() + computeHealth()
src/calc/life.ts         lifeSections() + computeLife()
src/calc/products.ts     PRODUCTS registry, PRODUCT_ORDER, defaultState()
src/styles.css           design tokens (light + dark), all component styles
```

## How the calculators work

- Each product exposes `sections()` (form config: fields with `type`, `def`, `opts` or `optsFn`, optional `show(state)`) and `compute(state) → Result`.
- `Result.lines` are `[section, label, calcText, amount, "sub" | "rate"?]`; sections: OD, TP, PA, ADD, BASE, LOAD, DISC, TEN.
- `Result.notes` are `[level, badge, text]`, level ∈ crit | warn | rule | info.
- `Result.gst` is a list of `[label, amount]` so mixed rates (GCV: TP 5%, rest 18%) can show separately.
- `Calculators.tsx` renders forms from config, normalises selects whose options depend on other fields, stores state per product in localStorage key `ibd-calc-state`, scenarios in `ibd-scenarios`.
- Compute functions are pure: keep them that way so they can be unit-tested.

## Domain rules encoded (do not change without a source)

- **Motor TP**: Motor Vehicles (Third Party Insurance Base Premium and Liability) Rules, 2022, G.S.R. 394(E), in force 1 June 2022. A 10–25% revision was under review but **not gazetted as of Oct 2026**. Hybrid −7.5% TP; vintage car pays 50%.
- **Motor OD**: erstwhile Indian Motor Tariff rates × (1 − insurer de-tariff discount). Car and 2W rates from the user's training documents; CV rates from the user's CV Algorithm workbooks ("Erstwhile Tariff" column).
- **IDV**: depreciation 5/15/20/30/40/50% up to 60 months, then 10% a year on the previous value; ±15% customer deviation, beyond that = underwriter referral.
- **NCB**: 20/25/35/45/50%; lost after >90-day break or a claim; used vehicle needs reserving letter.
- **Discount caps**: voluntary deductible tables (car and 2W differ), anti-theft 2.5% max ₹500, AA 5% max ₹200.
- **GST from 22 Sep 2025**: motor 18%; goods-carriage TP 5% (was 12%); individual health and individual life 0%; group health and group life 18%.
- **Tax**: Income-tax Act 2025 in force 1 Apr 2026; health deduction is section 126 (was 80D), old regime only.
- **Health rules**: PED waiting ≤3 years, moratorium 5 years, no entry-age cap, cashless decision 1 hour, discharge 3 hours, senior renewal increase cap 10%.
- **Health and term life premiums are illustrative models**, not insurer prices. Keep that labelled in the UI.

## Conventions

- British English in all copy, no em dashes in user-facing text where avoidable, plain professional tone.
- Money: `inr()` / `inr2()` from `src/calc/util.ts` (en-IN grouping).
- Learn content: each module has `summary` and `context`; each topic has `intro`; each point is `{ t, d, ex? }` (idea, explanation, example). Progress ticks are keyed by point index, so append new points rather than reordering. Examples that quote premiums should match the calculator defaults.
- Colours only via CSS tokens on `:root` with dark overrides; no hard-coded colours in components.
- Keep the site static and dependency-light; ask before adding libraries.
- Navigation uses `<Link to>` (real hrefs, crawlable) rather than buttons with callbacks. Components must render without `window`/`document`/`localStorage` during render (they run in Node at build time); browser APIs go in effects or handlers.
- Interview answers stay in the DOM with `hidden` until revealed, so the prerendered pages contain them.

## Known gaps / good next tasks

- Done: Vitest regression tests for the HANDOVER.md section 7 totals. Add more cases (NCB loss, IDV limits, discount caps) as rules change.
- Optional: effective-dated rate tables (start/end dates) so a TP revision can be added without deleting old rates.
- Optional: export scenario comparison to CSV; print stylesheet.
- When the TP revision is gazetted: update `CAR_TP`, `TW_TP`, `GVW_TP`, PCV values in `motor.ts`, interview answers mentioning "not gazetted", learn content, and `AS_OF`.
