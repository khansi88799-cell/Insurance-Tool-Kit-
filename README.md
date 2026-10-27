# Insurance Tool Kit

**Live site: [insurance-tool-kit.pages.dev](https://insurance-tool-kit.pages.dev)**

Learn Indian insurance from the basics to expert level, practise for interviews, and work out premiums step by step, all in one free study website.

It is written for anyone new to the domain, and especially for **Business Analysts** moving into insurance. Rules and rates are as of **26 October 2026**.

## What's inside

### Learn
Nine modules with 117 points to tick off as you master them. Every point has a plain-English explanation and a worked or real-world example.

| # | Module | What you learn |
|---|---|---|
| 1 | Insurance fundamentals | The six principles, life vs general vs health insurers, who's who in the value chain, loss and combined ratios |
| 2 | Value chain and systems | Quote-to-policy journey, STP vs NSTP, endorsements, renewals, the claims lifecycle, core systems |
| 3 | Motor insurance | OD, TP, add-ons and CPA, IDV and depreciation, the full premium build-up, NCB, underwriting, TP rate table |
| 4 | Health insurance | Floater vs individual, top-ups, portability, underwriting, current IRDAI rules, cashless and reimbursement claims |
| 5 | Life insurance | Term, endowment, ULIP, annuity, riders, surrender and revival, persistency |
| 6 | Commercial lines and reinsurance | Fire, marine, engineering, liability, group benefits, treaty and facultative reinsurance |
| 7 | Regulation, tax and market | The 2025 Insurance Laws Amendment Act, GST changes from Sept 2025, section 126, Bima Sugam, DPDP, Ind AS |
| 8 | Technology and trends | AI in claims and underwriting, embedded insurance, usage-based and parametric covers |
| 9 | The BA's craft | BRDs, user stories, decision tables, UAT, KPIs and regulatory impact analysis |

There are also **9 reference diagrams** (quote-to-policy flow, parties and money flows, premium waterfall, policy lifecycle, motor and health claim swimlanes, reinsurance layers, system context and data model), an **8-week study plan** whose topics link straight to the lessons, a **glossary** and a list of **sources**.

### Interview prep
89 questions from core to advanced, in 13 categories including calculations, whiteboard diagrams, SQL, scenarios and behavioural questions. Many have worked examples or sample answers, and the diagram questions link to the reference diagrams. You can filter by category and level, search, pick one at random, and mark the ones you've practised.

### Calculators
Premium calculators for **private car, two-wheeler, commercial vehicle (goods, passenger, miscellaneous), health and term life**. Each one:

- shows every step of the calculation with its formula (IDV, OD rate, loadings, discounts, NCB, TP slab, add-ons, GST)
- flags rules that apply, such as underwriter referral, NCB loss, break-in or STP eligibility
- lets you save scenarios and compare them side by side

Example: the default private car quote (Mumbai, 1,197 cc, 27 months old, 25% NCB) comes to **₹14,892**:

| Step | Amount |
|---|---|
| IDV (ex-showroom ₹8,50,000 less 30%) | ₹5,95,000 |
| Own damage after 25% NCB | ₹6,593 |
| Third party (2022 Rules, 1,000–1,500 cc) | ₹3,416 |
| Compulsory PA for owner-driver | ₹330 |
| Add-ons (zero depreciation, roadside assistance) | ₹2,282 |
| Net premium | ₹12,620 |
| GST 18% | ₹2,272 |
| **Total** | **₹14,892** |

Each line is rounded to the nearest rupee, so the lines may not add up exactly to the totals.

### Whiteboard
A drawing canvas for practising the diagrams interviewers ask for:

- **Open a blank whiteboard** button: a full-screen, empty canvas (Esc or "Exit full screen" to leave; Undo brings back your previous drawing)
- **Insurance shapes:** person, organisation, hospital, vehicle, payment, cover
- **Flowchart shapes:** start / end, process step, decision, document, system / data, note
- **BPMN shapes:** pool with swimlanes, start / message / timer / end events, task, exclusive and parallel gateways, data object
- **Connectors:** sequence flow and message flow, with labels such as Yes / No
- **Templates:** insurance parties and money flows, BPMN swimlanes for a cashless health claim and a motor own damage claim, a health STP flowchart, a blank swimlane and a blank canvas
- Drag to move, resize, duplicate, undo and redo, zoom, and download as PNG or SVG
- A "BPMN in five minutes" guide explaining each symbol, with tips for drawing in interviews

Your progress, calculator inputs, saved scenarios and whiteboard drawing stay in your own browser (localStorage). There is no sign-up and no server.

## Pages and search

Every section has its own address, and each one is built as a ready-made HTML page so search engines and link previews (WhatsApp, LinkedIn, X) can read it:

| Page | Address |
|---|---|
| Learn home | `/` |
| Modules | `/learn/fundamentals`, `/learn/motor`, `/learn/health` … |
| Diagrams, study plan, glossary | `/learn/diagrams`, `/learn/study-plan`, `/learn/glossary` |
| Interview questions | `/interview`, `/interview/motor`, `/interview/data-and-sql` … |
| Calculators | `/calculators/car-insurance`, `/calculators/two-wheeler-insurance`, `/calculators/commercial-vehicle-insurance`, `/calculators/health-insurance`, `/calculators/term-life-insurance` |
| Whiteboard | `/whiteboard` (`/whiteboard?start=blank` opens a blank board) |

Each page has its own title, description, canonical link and share preview (`public/og-image.png`). The build also writes `sitemap.xml`, `robots.txt` and a `404.html`. Old `#calculators/car`-style links redirect to the new addresses.

## Run it locally

You need **Node.js 22 or newer** ([download](https://nodejs.org)).

```bash
git clone https://github.com/khansi88799-cell/Insurance-Tool-Kit-.git
cd Insurance-Tool-Kit-
npm install
npm run dev        # http://localhost:5173
```

| Command | What it does |
|---|---|
| `npm run dev` | Start the development server |
| `npm test` | Run the calculator regression tests (Vitest) |
| `npm run test:watch` | Re-run tests as you edit |
| `npm run build` | Type-check, build the site and prerender every page, the sitemap and robots.txt into `dist/` |
| `npm run preview` | Serve the built site at http://localhost:4173 |

## Tests

`src/routes.test.ts` checks that every page address works, has its own title and a description short enough for search results, and that old `#` links redirect. `src/calc/totals.test.ts` checks every calculator against known totals, so a change to a rate table cannot silently change a premium:

| Product (default inputs) | Expected total |
|---|---|
| Private car | ₹14,892 |
| Two-wheeler | ₹1,955 |
| Goods vehicle (GST 18% + 5%) | ₹38,290 |
| Taxi (PCV C1a) | ₹32,494 |
| Health family floater (GST 0%) | ₹15,232 |
| Term life, per year | ₹12,097 |

## Tech stack

- [Vite 8](https://vite.dev), [React 19](https://react.dev) and [TypeScript 7](https://www.typescriptlang.org) (strict)
- Plain CSS with light and dark themes, no UI library, no backend
- [Vitest](https://vitest.dev) for tests
- Prerendered with React's own `renderToString` at build time (no extra libraries), so every page is static HTML
- Static output in `dist/`, hosted on Cloudflare Pages

## Project structure

```
scripts/
  prerender.mjs           writes every page, sitemap.xml, robots.txt and 404.html into dist/
src/
  App.tsx                 masthead, tabs and page head (title, description, share tags)
  main.tsx                browser entry
  entry-server.tsx        build-time renderer used by scripts/prerender.mjs
  routes.ts               page addresses, titles, descriptions, SITE_URL
  router.tsx              History API router and <Link>
  components/
    Learn.tsx             modules, diagrams, study plan, glossary
    Diagrams.tsx          reference diagrams (inline SVG)
    Interview.tsx         question bank
    Calculators.tsx       forms, premium slip, scenarios
    Whiteboard.tsx        drawing canvas, palette, export
  data/
    learn.ts              all learning content and sources
    interview.ts          all interview questions
  calc/
    tables.ts             rate tables (TP 2022 Rules, OD tariff, CV rates, health model)
    motor.ts              car, two-wheeler and commercial vehicle rating
    health.ts             health model
    life.ts               term life model
    products.ts           product registry and default inputs
    totals.test.ts        regression tests
  whiteboard/
    model.ts              shapes, BPMN symbols and templates
```

## Deploy

The site is hosted on **Cloudflare Pages** at [insurance-tool-kit.pages.dev](https://insurance-tool-kit.pages.dev). Every push to `main` rebuilds and publishes it automatically.

Cloudflare Pages settings:

| Setting | Value |
|---|---|
| Framework preset | None |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Environment variable | `NODE_VERSION` = `22` |

**Analytics:** turn on Cloudflare Web Analytics in the Pages project (Metrics → Web Analytics → Enable). Cloudflare then adds its script when serving the site, so there is nothing in the code, no cookies and no consent banner needed.

**Custom domain:** add it under the Pages project's Custom domains, then change `SITE_URL` in `src/routes.ts` so canonical links, share previews and the sitemap use it.

`netlify.toml` is also kept in the repo, so the site can be deployed to Netlify with no extra setup if needed.

## Keeping it up to date

- **Third-party premiums revised?** Update `CAR_TP`, `TW_TP`, `GVW_TP` and the PCV values in `src/calc/tables.ts` and `src/calc/motor.ts`, the related learning and interview content, and `AS_OF` in `src/data/learn.ts`. Then update the expected totals in the tests.
- **GST change?** Search for `GST` in `src/calc/motor.ts`, `health.ts` and `life.ts`.
- **New learning point?** Add `{ t, d, ex }` (idea, explanation, example) to a topic in `src/data/learn.ts`. Add new points at the end of a topic, because saved progress is keyed by position.
- **New interview question?** Add an object to `QUESTIONS` in `src/data/interview.ts`.
- **New page?** Add its address to `parseRoute`, `routeMeta` and `allPaths` in `src/routes.ts`; it is then prerendered and listed in the sitemap.

## Accuracy notes

- Motor third-party premiums follow the Motor Vehicles (Third Party Insurance Base Premium and Liability) Rules, 2022, in force from 1 June 2022. A revision was under review but not gazetted as of October 2026.
- Motor own damage uses the erstwhile Indian Motor Tariff rates as a base, with an editable insurer discount. Add-on rates are editable examples.
- **Health and term life calculators are illustrative models, not insurer prices.** Each insurer files its own rates.
- GST: motor 18%, goods-carriage TP 5%, individual health and life 0%, group policies 18% (from 22 September 2025).
- This is a study aid, not financial, tax or legal advice. Check current rules with IRDAI and your insurer.
