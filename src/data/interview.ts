export type Category =
  | "Fundamentals"
  | "Motor"
  | "Health"
  | "Life and commercial"
  | "Regulation 2025–26"
  | "Tax and GST"
  | "BA craft"
  | "Scenarios"
  | "Technology and AI"
  | "Behavioural";

export interface Question {
  id: string;
  cat: Category;
  level: "Core" | "Intermediate" | "Advanced";
  q: string;
  /** Model answer: short points to say out loud */
  a: string[];
  /** Optional link into the calculator to demonstrate the answer */
  try?: string;
}

export const CATEGORIES: Category[] = [
  "Fundamentals",
  "Motor",
  "Health",
  "Life and commercial",
  "Regulation 2025–26",
  "Tax and GST",
  "BA craft",
  "Scenarios",
  "Technology and AI",
  "Behavioural",
];

export const QUESTIONS: Question[] = [
  /* ---------- Fundamentals ---------- */
  { id: "f1", cat: "Fundamentals", level: "Core", q: "What is insurance, and how does an insurer make money?", a: ["Risk transfer: many pay a small certain premium, the few with losses are paid.", "Underwriting profit when the combined ratio is under 100%.", "Investment income on the float (premium held before claims are paid)."] },
  { id: "f2", cat: "Fundamentals", level: "Core", q: "Explain the principles of insurance with a system example for each.", a: ["Utmost good faith → proposal declarations and moratorium rules.", "Insurable interest → RC owner must be the proposer for motor.", "Indemnity → IDV and depreciation cap the payout.", "Contribution → CPA waiver when another PA cover exists.", "Subrogation → insurer recovers from the at-fault party.", "Proximate cause → claim admissibility rules."] },
  { id: "f3", cat: "Fundamentals", level: "Core", q: "Difference between life, general and standalone health insurers?", a: ["Life: long-term protection and savings, mortality-based.", "General: motor, property, liability, mostly annual.", "Standalone health: health only; general insurers also sell health.", "The composite licence idea was dropped from the 2025 amendment, so these stay separate."] },
  { id: "f4", cat: "Fundamentals", level: "Intermediate", q: "What are loss ratio and combined ratio, and why do they matter to a BA?", a: ["Loss ratio = claims incurred ÷ earned premium.", "Combined ratio = (claims + expenses) ÷ earned premium.", "Features that cut leakage (fraud rules, STP) or expenses (digital journeys) show up directly in these numbers, so they make strong success metrics."] },
  { id: "f5", cat: "Fundamentals", level: "Core", q: "Who are the intermediaries in Indian insurance?", a: ["Individual agents and corporate agents (banks as bancassurance).", "Brokers (represent the customer), web aggregators, POSP, Insurance Marketing Firms.", "Motor dealers act as corporate agents or POSPs; IRDAI's 2026 proposal would let qualifying dealers register as distribution entities."] },
  { id: "f6", cat: "Fundamentals", level: "Intermediate", q: "What is reinsurance and why would it affect a system you build?", a: ["Insurance for insurers: treaty or facultative, proportional or excess of loss.", "Systems must capture cession, retention limits and recoveries per policy or claim.", "Obligatory cession to GIC Re applies."] },

  /* ---------- Motor ---------- */
  { id: "m1", cat: "Motor", level: "Core", q: "Explain OD, TP, add-ons and CPA. Which are mandatory?", a: ["OD covers damage to your own vehicle; optional.", "TP covers liability to others; mandatory under the Motor Vehicles Act.", "CPA (₹15 lakh) is mandatory for an individual owner-driver unless they have no licence, another CPA, or a standalone PA of ₹15 lakh+.", "Add-ons extend OD and are optional."] },
  { id: "m2", cat: "Motor", level: "Core", q: "How is IDV calculated for a 26-month-old car with an ex-showroom price of ₹8 lakh?", a: ["26 months falls in the 2–3 year band → 30% depreciation.", "IDV = 8,00,000 × 0.70 = ₹5,60,000.", "Customer can move it ±15%: ₹4,76,000 to ₹6,44,000 without referral."], try: "car" },
  { id: "m3", cat: "Motor", level: "Intermediate", q: "Walk me through the premium calculation from IDV to the final amount.", a: ["Basic OD = IDV × tariff rate × (1 − de-tariff discount).", "Add accessories and CNG → subtotal OD; add loadings, subtract discounts.", "Apply NCB on OD before NCB.", "Add TP slab, CNG ₹60, PA passengers, legal liability, CPA; add add-ons.", "Net premium + 18% GST (goods-carriage TP 5%)."], try: "car" },
  { id: "m4", cat: "Motor", level: "Core", q: "What are the current third-party premiums for cars and two-wheelers?", a: ["2022 Rules, in force since 1 June 2022: car ₹2,094 / ₹3,416 / ₹7,897 for ≤1,000 / ≤1,500 / >1,500 cc.", "Two-wheeler ₹538 / ₹714 / ₹1,366 / ₹2,804.", "A 10–25% hike has been under review but was not gazetted as of October 2026, so rates must be effective-dated in systems."] },
  { id: "m5", cat: "Motor", level: "Core", q: "What happens to NCB on a claim, a break-in, or a change of vehicle?", a: ["Claim → NCB resets to 0 unless NCB protect was bought.", "Break of more than 90 days → NCB lost.", "Selling the vehicle → NCB stays with the owner; an NCB reserving letter transfers it to the new vehicle.", "NCB slabs: 20, 25, 35, 45, 50%."] },
  { id: "m6", cat: "Motor", level: "Intermediate", q: "When is vehicle inspection required?", a: ["Break-in cases.", "Ownership transfer / used vehicle.", "Adding add-ons or a CNG kit not on the previous policy.", "Policy issues only after a Recommended inspection report."] },
  { id: "m7", cat: "Motor", level: "Core", q: "Why must a new car have a 3-year TP and a new two-wheeler a 5-year TP?", a: ["Supreme Court direction in 2018 to raise TP coverage on new vehicles.", "Leads to bundled (1 OD + 3/5 TP) and long-term TP variants, and later SAOD for the OD renewal.", "Systems must check TP validity before selling standalone OD."] },
  { id: "m8", cat: "Motor", level: "Intermediate", q: "How are EVs and hybrids treated in motor rating?", a: ["TP uses kW slabs for EVs (car ≤30 kW ₹1,780).", "Hybrids get 7.5% off TP.", "The old OD tariff has no kW slabs, so insurers file their own EV OD rates; EV add-ons cover battery and charger.", "Goods-carriage EVs have their own GVW TP table."], try: "car" },
  { id: "m9", cat: "Motor", level: "Intermediate", q: "How is a goods carrying vehicle priced differently from a private car?", a: ["Zones A, B, C (C = rest of India).", "TP by gross vehicle weight: ₹16,049 up to 7.5 t to ₹44,242 above 40 t.", "OD adds ₹27 per 100 kg above 12,000 kg.", "GST: 5% on the TP portion, 18% on the rest since 22 Sep 2025."], try: "cv" },
  { id: "m10", cat: "Motor", level: "Advanced", q: "What is Pay As You Drive and what data does it need?", a: ["IRDAI allowed PAYD and Pay How You Drive OD add-ons in July 2022.", "Needs odometer or telematics data, driving behaviour scores, consent under DPDP.", "BA work: new rating factors, data ingestion APIs, renewal re-rating logic."] },
  { id: "m11", cat: "Motor", level: "Intermediate", q: "Describe the motor OD claims process.", a: ["FNOL via app or call centre → claim number.", "Surveyor appointed for larger losses; photo-based assessment for small ones.", "Cashless at network garage or reimbursement.", "Depreciation applied unless zero-dep; compulsory deductible deducted.", "Total loss when repair cost exceeds about 75% of IDV; salvage handled by insurer."] },
  { id: "m12", cat: "Motor", level: "Advanced", q: "How are TP injury and death claims settled, and what changed in 2026?", a: ["Filed at the Motor Accident Claims Tribunal; liability unlimited for bodily injury.", "Insurer pays the award and may recover from the owner if policy conditions were breached.", "A June 2026 Supreme Court ruling recognised the economic value of homemakers' work, raising compensation and TP claim costs without a premium revision."] },

  /* ---------- Health ---------- */
  { id: "h1", cat: "Health", level: "Core", q: "Individual vs family floater: when would you recommend each?", a: ["Floater: one shared SI, cheaper for young families.", "Individual: each member has own SI; better when ages differ widely or a member has PED.", "Floater premium is driven by the eldest member."], try: "health" },
  { id: "h2", cat: "Health", level: "Core", q: "What factors drive a health premium?", a: ["Age, sum insured, zone, medical history, lifestyle, BMI.", "Deductible and co-pay reduce it; multi-year tenure gets a discount.", "Add-ons (room rent waiver, maternity, CI) increase it."], try: "health" },
  { id: "h3", cat: "Health", level: "Core", q: "STP vs NSTP in health. What can the underwriter decide?", a: ["STP: under 45, SI up to ₹10 lakh, no PED, BMI in range.", "NSTP: pre-policy medical check-up and underwriter review.", "Decisions: accept, accept with loading, special conditions, counter offer, reject."] },
  { id: "h4", cat: "Health", level: "Core", q: "What are the current IRDAI timelines for cashless claims?", a: ["Pre-authorisation decided within 1 hour.", "Final discharge authorisation within 3 hours of the request.", "System need: timers, auto-escalation, TAT reporting."] },
  { id: "h5", cat: "Health", level: "Intermediate", q: "What is the moratorium period and why was it cut to 5 years?", a: ["After 5 continuous years, claims cannot be contested for non-disclosure except fraud (was 8).", "Protects long-standing customers; insurers must underwrite properly at entry.", "BA impact: continuous-coverage tracking, including ported years."] },
  { id: "h6", cat: "Health", level: "Intermediate", q: "Explain waiting periods.", a: ["Initial 30 days (accidents excluded).", "Specific illnesses (cataract, hernia, joint replacement) usually 2 years, capped at 3.", "PED at most 3 years (was 4).", "Maternity often 2–4 years. Portability carries served waiting periods."] },
  { id: "h7", cat: "Health", level: "Intermediate", q: "What is NHCX and how would you approach an integration?", a: ["National Health Claims Exchange under ABDM; FHIR-based eligibility, pre-auth, claim and payment messages.", "Advised by IRDAI, not legally mandated.", "Approach: map internal claim fields to FHIR profiles, handle async status, reconcile with TPA systems, test with sandbox."] },
  { id: "h8", cat: "Health", level: "Core", q: "What changed for senior citizens and entry age?", a: ["No upper entry-age limit for buying health insurance.", "Senior renewal increases capped at 10% a year without IRDAI approval.", "Insurers must offer products for seniors."] },
  { id: "h9", cat: "Health", level: "Intermediate", q: "Why are health claims rejected, and how would you reduce wrongful rejections?", a: ["Waiting period, non-disclosure, exclusions, documentation gaps, room-rent proportionate deduction.", "Fixes: clear CIS at sale, rule transparency in claim decisions, checklist-driven document upload, second-level review before rejection."] },

  /* ---------- Life and commercial ---------- */
  { id: "l1", cat: "Life and commercial", level: "Core", q: "Term vs endowment vs ULIP?", a: ["Term: pure protection, cheapest.", "Endowment: savings plus protection, guaranteed or bonus-based.", "ULIP: market-linked, 5-year lock-in, charges disclosed.", "Individual life premiums are GST-free since 22 Sep 2025."], try: "life" },
  { id: "l2", cat: "Life and commercial", level: "Intermediate", q: "What is persistency and why do insurers track it?", a: ["Share of policies still paying at the 13th, 25th, 37th, 49th, 61st month.", "Low persistency signals mis-selling, which IRDAI flagged as a significant concern.", "BA angle: renewal reminders, auto-debit mandates, early-lapse analytics."] },
  { id: "l3", cat: "Life and commercial", level: "Core", q: "Name the main commercial lines.", a: ["Fire and property (Bharat Sookshma and Laghu Udyam), marine, engineering.", "Liability (public, product, D&O, professional indemnity), cyber.", "Group health and group term (still 18% GST)."] },

  /* ---------- Regulation ---------- */
  { id: "r1", cat: "Regulation 2025–26", level: "Core", q: "What did the Insurance Laws Amendment Act 2025 change?", a: ["Passed 17 Dec 2025 as Sabka Bima Sabki Raksha.", "100% FDI in insurers; IRDAI can cap commissions and order disgorgement.", "Lower net owned funds for foreign reinsurers; policyholder education and protection fund.", "Composite licence dropped."] },
  { id: "r2", cat: "Regulation 2025–26", level: "Core", q: "What is Bima Sugam and where is it now?", a: ["IRDAI's digital insurance marketplace, launched 17 Sep 2025.", "Phase 1 live: compare, buy, renew, e-insurance account; phase 2: claims, hospital and TPA integration, portability.", "Full transactional go-live guided for about November 2026.", "Bima Pehchaan gives each person a lifelong insurance ID."] },
  { id: "r3", cat: "Regulation 2025–26", level: "Intermediate", q: "How does the DPDP Act affect insurance journeys?", a: ["Rules notified 13 Nov 2025; consent managers from Nov 2026; core obligations from May 2027.", "Need purpose-specific consent, notices, erasure and correction flows.", "Breach: notify affected people and the Board without delay, detailed report within 72 hours; penalties up to ₹200 crore."] },
  { id: "r4", cat: "Regulation 2025–26", level: "Advanced", q: "What is Ind AS 117 / IFRS 17 and why would a BA care?", a: ["Insurers adopt Ind AS from 1 Apr 2026, with relief and up to 2 years of parallel reporting.", "Profit recognised over the contract's life using groups of contracts.", "Needs granular policy, cash flow and claims data with lineage: big data and reporting projects."] },
  { id: "r5", cat: "Regulation 2025–26", level: "Intermediate", q: "What did IRDAI propose for motor distribution in 2026?", a: ["Motor policies available on Bima Sugam; dealers must show a QR code for the digital option.", "Qualifying dealers register as distribution entities and can sell multiple insurers.", "No denial of cashless repair because the policy was bought elsewhere.", "Lower commissions on TP, which rose from 4.3% (FY23) to 22% (FY25)."] },
  { id: "r6", cat: "Regulation 2025–26", level: "Core", q: "What is 'Insurance for All by 2047'?", a: ["IRDAI's mission to cover every citizen and business.", "Pillars: Bima Sugam, Bima Vistaar (bundled life, health, accident, property), Bima Vahak (women-led rural distribution), state insurance plans.", "Context: penetration stuck at 3.7% of GDP in FY25."] },

  /* ---------- Tax ---------- */
  { id: "t1", cat: "Tax and GST", level: "Core", q: "How did GST on insurance change in September 2025?", a: ["From 22 Sep 2025, individual health (including floater and senior) and individual life went from 18% to 0%.", "Group health and group life stay at 18%.", "Goods-carriage TP cut from 12% to 5%; motor otherwise 18%."] },
  { id: "t2", cat: "Tax and GST", level: "Intermediate", q: "You own a GST module built in 2022. What would you change?", a: ["Add a rate rule by product and cover type before the state rule (CGST + SGST / UTGST vs IGST).", "Split goods-carriage invoices: TP at 5%, OD and add-ons at 18%.", "Zero-rate individual health and life; keep group at 18%.", "Effective-date by premium payment date; regression-test endorsements and credit notes."] },
  { id: "t3", cat: "Tax and GST", level: "Core", q: "How is the health insurance tax deduction claimed now?", a: ["Income-tax Act 2025 from 1 Apr 2026: section 126 replaces 80D.", "₹25,000 for self and family, ₹50,000 if senior; separate limit for parents.", "Old regime only; cash premiums not allowed (except preventive check-ups)."] },
  { id: "t4", cat: "Tax and GST", level: "Intermediate", q: "Explain the GSTIN validation rule.", a: ["15 characters: 2-digit state code, 10-character PAN, entity number, a character, check digit.", "Same state as sourcing branch → CGST + SGST; union territory → CGST + UTGST; different → IGST.", "No GSTIN → use customer postal code against branch."] },

  /* ---------- BA craft ---------- */
  { id: "b1", cat: "BA craft", level: "Core", q: "What artefacts would you produce on an insurance project?", a: ["BRD / FRD, product configuration and rating specs.", "Process maps, user stories with Gherkin criteria, decision tables.", "Data mapping for APIs, UAT scenarios with expected premiums, traceability matrix."] },
  { id: "b2", cat: "BA craft", level: "Core", q: "Write acceptance criteria for an IDV deviation rule.", a: ["Given system IDV ₹5,00,000, when the user enters ₹5,60,000 (+12%), then the quote proceeds.", "When the user enters ₹6,00,000 (+20%), then the proposal is referred to an underwriter and cannot be issued without approval.", "Boundary tests at exactly −15% and +15%."], try: "car" },
  { id: "b3", cat: "BA craft", level: "Intermediate", q: "How do you run impact analysis on a new IRDAI circular?", a: ["Read and summarise obligations with the compliance team.", "Map to products, journeys, systems, documents, communications and regulatory returns.", "Size changes, effective-date rules, plan regression, get sign-off, track to closure."] },
  { id: "b4", cat: "BA craft", level: "Intermediate", q: "Why must rate tables be effective-dated?", a: ["Rates change by notification (TP slabs, GST).", "Quotes, endorsements and renewals must use the rate valid on the relevant date.", "Never overwrite: add a new row with a start date and close the old row."] },
  { id: "b5", cat: "BA craft", level: "Core", q: "What KPIs would you track for a digital motor renewal journey?", a: ["Renewal conversion, drop-off by step, STP rate.", "Time to renew, payment failure rate, NCB carry-forward accuracy.", "Complaints and call-centre deflection."] },
  { id: "b6", cat: "BA craft", level: "Intermediate", q: "How do you validate a rating engine during UAT?", a: ["Build expected-result sheets from the rating spec, for example a spreadsheet that works each quote out step by step.", "Cover every slab boundary, zone, age band, discount cap and NCB slab.", "Compare engine output line by line, not just totals; log differences with the formula."] },

  /* ---------- Scenarios ---------- */
  { id: "s1", cat: "Scenarios", level: "Intermediate", q: "The rating engine shows a premium ₹150 lower than the actuarial sheet. How do you investigate?", a: ["Compare line by line: OD, loadings, discounts, NCB, TP, add-ons, GST.", "Check rounding (per line vs total), effective dates, rate versions, discount caps.", "Reproduce with one test case, document root cause, add a regression test."] },
  { id: "s2", cat: "Scenarios", level: "Advanced", q: "Design an AI-assisted motor claims flow. Where is the human in the loop?", a: ["Customer uploads photos → AI damage detection and repair estimate.", "Auto-approve under a value and confidence threshold; refer otherwise.", "Fraud score and policy checks run in parallel.", "Human surveyor for high value, low confidence, or fraud flags; every decision logged for audit."] },
  { id: "s3", cat: "Scenarios", level: "Advanced", q: "How would you gather requirements for a Bima Sugam integration?", a: ["Study the published API and standard forms; identify insurer-side gaps.", "Workshops with product, IT, compliance, finance.", "Define product catalogue mapping, quote and issuance APIs, payment and policy status callbacks, e-insurance account linkage.", "Plan sandbox testing and reconciliation."] },
  { id: "s4", cat: "Scenarios", level: "Intermediate", q: "A customer's renewal shows 0% NCB but they claim 3 claim-free years. What do you check?", a: ["Gap between expiry and renewal (over 90 days → lost).", "Any claim on the expiring policy, ownership change, previous insurer confirmation.", "Data migration or rollover capture errors; NCB declaration and verification process."], try: "car" },
  { id: "s5", cat: "Scenarios", level: "Intermediate", q: "Business wants straight-through issuance for health up to ₹25 lakh SI. How do you respond?", a: ["Clarify the goal (conversion vs risk).", "Bring loss data: higher SI drives anti-selection.", "Propose tiered STP with digital medical questionnaires, tele-underwriting, data-based risk scores, and monitor claim ratios after launch."] },
  { id: "s6", cat: "Scenarios", level: "Advanced", q: "The TP revision is notified with 15 days' notice. What is your plan?", a: ["Load new slabs as new effective-dated rows; keep old rows for back-dated quotes.", "Check long-term TP and bundled variants, EV and hybrid logic, commission impact.", "Update portals, aggregator APIs and premium tables in communications.", "Regression on all business types; go-live checklist with rollback."] },

  /* ---------- Technology and AI ---------- */
  { id: "a1", cat: "Technology and AI", level: "Intermediate", q: "Where can GenAI add value in insurance today?", a: ["Customer service agents for quotes, renewals, claim status.", "Document extraction for claims and underwriting.", "Copilots for agents and underwriters; summarising medical records.", "Always with guardrails, human review for decisions, and DPDP-compliant data use."] },
  { id: "a2", cat: "Technology and AI", level: "Core", q: "What core systems do insurers run?", a: ["Policy admin (Guidewire, Duck Creek, Majesco, TCS BaNCS), rating engine, claims, billing.", "Distribution portals and APIs, CRM, data warehouse.", "Trend: cloud PAS, low-code product configuration, microservices."] },
  { id: "a3", cat: "Technology and AI", level: "Advanced", q: "How would you control bias and errors in an AI underwriting model?", a: ["Define permitted features; exclude protected attributes and proxies.", "Explainability for every decision; monitoring of approval rates by segment.", "Human override and appeal path; periodic validation with actuarial and compliance teams."] },

  /* ---------- Behavioural ---------- */
  { id: "x1", cat: "Behavioural", level: "Core", q: "Why insurance, coming from your background?", a: ["Insurance is rule-heavy and data-rich, where precise requirements save real money.", "Your AI agent and product work maps to quote bots and claims automation.", "You have already studied motor rating in depth and found defects in calculators."] },
  { id: "x2", cat: "Behavioural", level: "Core", q: "Tell me about a defect you found in a calculation.", a: ["Situation: reviewing an IDV calculator.", "Task: validate IDV rules.", "Action: tested above the ±15% limit; a ₹10.9 lakh IDV passed when the maximum was about ₹98,000.", "Result: proposed min/max validation and boundary test cases; same discipline applies to any rating engine."] },
  { id: "x3", cat: "Behavioural", level: "Intermediate", q: "Describe working with difficult stakeholders on conflicting requirements.", a: ["Use a STAR story from McDelivery or Adaptive UI.", "Show how you made the trade-off visible (impact, cost, risk) and got a decision owner.", "Close with the measurable outcome."] },
];
