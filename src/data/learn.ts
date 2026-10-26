export interface Point {
  /** The idea to be able to explain */
  t: string;
  /** Plain-language explanation */
  d: string;
  /** Worked or real-world example */
  ex?: string;
}

export interface Topic {
  id: string;
  title: string;
  /** Why this topic matters, shown above the points */
  intro: string;
  points: Point[];
}

export interface Module {
  id: string;
  number: number;
  title: string;
  summary: string;
  /** Background paragraph for learners new to the area */
  context: string;
  topics: Topic[];
  table?: { caption: string; head: string[]; rows: string[][] };
}

export const AS_OF = "26 October 2026";

export const MODULES: Module[] = [
  {
    id: "fundamentals",
    number: 1,
    title: "Insurance fundamentals",
    summary: "Insurance is risk transfer: many people pay a small, certain premium so the insurer can pay the few who suffer a large, uncertain loss.",
    context:
      "Everything else on this site builds on these ideas. A requirement that looks odd, such as depreciation on a claim or a question about medical history, usually traces back to one of the principles below.",
    topics: [
      {
        id: "principles",
        title: "Six core principles",
        intro: "Every policy wording, claim decision and system rule rests on six legal principles. Interviewers often ask you to name them and give an example of each.",
        points: [
          {
            t: "Utmost good faith: both sides disclose all material facts.",
            d: "A material fact is anything that would change the insurer's decision to accept the risk or the price. The customer must answer the proposal form honestly; the insurer must explain the cover and its exclusions clearly.",
            ex: "A proposer with diabetes answers 'No' to the medical history question. If a diabetes-related claim arrives in year two, the insurer can reject it for non-disclosure. After the 5-year moratorium it could do so only by proving fraud.",
          },
          {
            t: "Insurable interest: the proposer must suffer a financial loss if the event happens.",
            d: "This stops insurance becoming a bet. In motor, the owner named on the registration certificate (RC) must be the policyholder. The proposer is the person who signs and pays; the insured is the person or thing covered, and the two can differ.",
            ex: "A car is sold but the policy stays in the seller's name. The seller no longer loses anything if the car is damaged, so the buyer must ask the insurer to transfer the policy (an endorsement) into their own name.",
          },
          {
            t: "Indemnity: restore the insured to the pre-loss position, with no profit.",
            d: "General insurance pays the actual loss, no more. That is why motor claims deduct depreciation on parts, why the IDV falls as a vehicle ages and why deductibles exist. Life and personal accident cover are not indemnity contracts: they pay a fixed sum, because a life cannot be valued.",
            ex: "A 3-year-old car's plastic bumper costing ₹10,000 is replaced. Plastic parts carry 50% depreciation, so without zero-depreciation cover the insurer pays ₹5,000 less the ₹1,000 compulsory deductible: ₹4,000. With zero depreciation it pays ₹9,000.",
          },
          {
            t: "Contribution: two indemnity policies on the same risk share the loss.",
            d: "The customer cannot claim the full loss twice. In health, the customer can choose which policy to claim from first and then claim the balance from the other. The CPA waiver follows the same idea: an owner who already has ₹15 lakh of personal accident cover need not buy CPA again.",
            ex: "Hospital bill ₹6 lakh. The employer's group policy covers ₹3 lakh and the personal floater ₹10 lakh. The customer claims ₹3 lakh from the group policy, then ₹3 lakh from the floater using the first insurer's settlement letter.",
          },
          {
            t: "Subrogation: after paying, the insurer takes over the right to recover.",
            d: "Once the insurer pays its own customer, it steps into the customer's shoes and can recover the money from whoever caused the loss. The customer cannot then recover the same amount again.",
            ex: "A parked car is hit by a truck. The car's insurer pays ₹80,000 under own damage, then recovers it from the truck's third-party insurer. The customer signs a subrogation letter as part of the claim documents.",
          },
          {
            t: "Proximate cause: the dominant, effective cause decides whether a claim is payable.",
            d: "When several events lead to a loss, cover depends on the main cause that set the chain in motion, not the last event in time.",
            ex: "An earthquake breaks a gas pipe and the gas catches fire. Under a policy that excludes earthquake, the fire damage is excluded too, because the earthquake was the proximate cause.",
          },
        ],
      },
      {
        id: "segments",
        title: "Life, general and standalone health",
        intro: "India licenses three kinds of insurer. Each has its own products, pricing logic and regulations, and a BA usually specialises in one.",
        points: [
          {
            t: "Life: death, survival and savings over a long tenure (term, endowment, ULIP, annuity).",
            d: "Life insurers cover dying too soon (term) or living too long (annuity), often combined with savings. Policies run 10 to 40 years, so persistency and long-term promises matter more than claim volumes.",
            ex: "A 30-year-old buys ₹1 crore of term cover for 30 years. The insurer collects premium for three decades and pays only if death happens in that window.",
          },
          {
            t: "General (non-life): motor, fire, marine, engineering, liability, travel, cyber; mostly annual.",
            d: "General insurers cover property, liability and other non-life risks, mostly on indemnity terms. Motor is the largest retail line. Most policies run for a year, but motor TP is sold for 3 years with a new car and 5 years with a new two-wheeler.",
            ex: "A trader buys fire cover for the shop, marine cover for goods in transit and motor cover for the delivery van, all from one general insurer.",
          },
          {
            t: "Standalone health insurers: hospitalisation, critical illness, personal accident.",
            d: "Standalone health insurers (SAHIs) write only health, personal accident and travel business. General insurers also sell health, so a health BA could work at either kind of company.",
            ex: "Star Health, Niva Bupa, Care Health and Aditya Birla Health are standalone health insurers; ICICI Lombard and HDFC ERGO sell health as general insurers.",
          },
          {
            t: "A composite licence (life and non-life in one company) was proposed but dropped from the 2025 Act.",
            d: "Life and non-life business must still sit in separate companies, even when they share a brand. Each has its own licence, systems and regulatory returns.",
            ex: "HDFC Life and HDFC ERGO are separate companies under one group, so a customer buying term and car cover deals with two insurers.",
          },
        ],
      },
      {
        id: "parties",
        title: "Parties in the value chain",
        intro: "Most requirements involve several parties. Getting their roles right avoids data model mistakes, such as treating the payer, the insured person and the nominee as one record.",
        points: [
          {
            t: "Insurer, proposer, insured, nominee and appointee.",
            d: "The proposer signs the proposal and pays. The insured is the person or asset covered. The nominee receives the money on death. If the nominee is under 18, an appointee receives it on their behalf.",
            ex: "A father (proposer) buys a health policy covering himself, his wife and his son (insured members). On his term plan he names his 12-year-old daughter as nominee and his wife as appointee.",
          },
          {
            t: "Underwriter and actuary: accept or price the risk.",
            d: "The actuary designs the product and sets base rates from past claims. The underwriter decides on individual cases within an authority limit: accept, load the premium, add conditions or decline.",
            ex: "The actuary sets health rates by age band. An underwriter sees a 52-year-old proposer with high blood pressure and accepts with a 20% loading.",
          },
          {
            t: "Intermediaries: agent, corporate agent, broker, web aggregator, POSP, Insurance Marketing Firm.",
            d: "Agents sell on behalf of the insurers they are tied to. Corporate agents are mostly banks and can work with several insurers. Brokers act for the customer and can place cover with any insurer. Web aggregators compare prices online. POSPs (point of sales persons) sell simple, pre-underwritten products after short training. Insurance Marketing Firms sell several insurers' products locally.",
            ex: "One customer might buy car cover on a comparison website (web aggregator), health cover at a bank branch (corporate agent) and factory fire cover through a broker.",
          },
          {
            t: "TPA for health claims; surveyor and loss assessor for motor and property claims.",
            d: "A third party administrator (TPA) processes health claims and runs cashless desks for the insurer, but carries no risk. A licensed surveyor inspects larger motor and property losses and reports on the cause and amount.",
            ex: "After a car accident, the insurer appoints a surveyor who inspects the car at the garage, agrees the repair estimate and decides which parts are repaired and which replaced.",
          },
          {
            t: "Reinsurer and the regulator, IRDAI.",
            d: "Insurers pass part of large or volatile risks to reinsurers. GIC Re is India's national reinsurer, and foreign reinsurers run branches here. IRDAI licenses insurers and intermediaries, approves products and issues the circulars that BAs turn into requirements.",
            ex: "An insurer covering a ₹2,000 crore refinery keeps ₹100 crore of the risk and passes the rest to several reinsurers.",
          },
        ],
      },
      {
        id: "metrics",
        title: "Business metrics",
        intro: "Senior stakeholders judge projects against a few numbers. Using them in interviews shows you understand why a change matters.",
        points: [
          {
            t: "GWP (gross written premium) and earned premium.",
            d: "GWP is the premium on policies written in a period. Earned premium is the part for which cover has already been given; the rest sits in an unearned premium reserve.",
            ex: "A ₹12,000 annual policy starts on 1 October. At the financial year end on 31 March, ₹6,000 is earned and ₹6,000 is unearned.",
          },
          {
            t: "Loss ratio = claims incurred ÷ earned premium.",
            d: "Shows how much premium goes on claims. Claims incurred include claims paid plus the change in reserves for open claims and for claims incurred but not yet reported (IBNR).",
            ex: "Earned premium ₹100 crore and claims incurred ₹78 crore give a loss ratio of 78%.",
          },
          {
            t: "Combined ratio = (claims + expenses) ÷ earned premium; under 100% means underwriting profit.",
            d: "Adds commission and operating expenses to claims. Above 100%, the insurer loses money on underwriting and relies on investment income. Many Indian general insurers run above 100%.",
            ex: "Claims 78% + commission 15% + other expenses 17% = 110%: an underwriting loss of 10% of earned premium.",
          },
          {
            t: "Solvency ratio (IRDAI minimum 1.5) and the move to risk-based capital.",
            d: "Solvency ratio = available solvency margin ÷ required margin. It shows whether the insurer holds enough capital to pay claims in a bad year. A risk-based capital regime will link the requirement to the risks each insurer carries.",
            ex: "Available margin ₹3,000 crore against a required ₹1,800 crore gives 1.67, comfortably above the 1.5 minimum.",
          },
          {
            t: "Claim settlement ratio, persistency (life) and renewal retention (general).",
            d: "Claim settlement ratio is claims paid ÷ claims received, by number. Persistency is the share of life policies still paying premium after 13, 25, 37, 49 and 61 months. Renewal retention is renewals ÷ policies due for renewal.",
            ex: "1,000 life policies were sold in March 2025 and 820 paid their March 2026 premium, so 13th-month persistency is 82%.",
          },
        ],
      },
    ],
  },
  {
    id: "value-chain",
    number: 2,
    title: "Value chain and systems",
    summary: "Every insurance project sits somewhere on product → distribution → underwriting → issuance → servicing → claims, supported by reinsurance, finance and compliance.",
    context:
      "Knowing where a requirement sits in the chain tells you who to talk to, which system owns the data and what breaks downstream if it is wrong. A change to rating, for example, also affects invoices, commission and reports.",
    topics: [
      {
        id: "journey",
        title: "Quote to policy journey",
        intro: "This is the backbone of most insurance IT work. Practise drawing it from memory, then add the system and the owner at each step.",
        points: [
          {
            t: "Quote → client creation → data entry → proposal → payment / receipting → underwriting (STP or NSTP) → policy issuance → dispatch.",
            d: "The quote gives an indicative price. Client creation runs KYC and checks for duplicates. Data entry captures the risk (vehicle, family members). The proposal is the signed request for cover with declarations. Under section 64VB of the Insurance Act, cover normally cannot start until premium is received. Underwriting accepts the risk, and the policy is issued and sent to the customer.",
            ex: "Online car renewal: the customer enters the registration number, the portal fetches vehicle details from the VAHAN database, shows a quote, takes a UPI payment, passes the STP rules and emails the policy within a minute.",
          },
          {
            t: "STP: the rules engine issues automatically. NSTP: referral to an underwriter, inspection or medicals first.",
            d: "Straight-through processing (STP) cases pass every rule and need no human touch. Non-STP cases break a rule and go to a work queue. A higher STP rate cuts cost and turnaround time, so BAs spend a lot of time on STP rules.",
            ex: "A family health proposal: the 35-year-old with no medical history would pass STP, but their 58-year-old parent on the same proposal triggers medical tests, so the whole case becomes NSTP.",
          },
          {
            t: "Policy kit: schedule, wording, CIS (customer information sheet), GST invoice.",
            d: "The schedule shows the customer's details, covers, sum insured and premium. The wording is the standard contract. The CIS summarises benefits, exclusions and waiting periods in plain language. The invoice shows GST, or 0% for individual health and life.",
            ex: "A motor schedule lists the IDV, NCB %, add-ons, TP premium, CPA and compulsory deductible, with the GST invoice on the last page.",
          },
        ],
      },
      {
        id: "servicing",
        title: "Servicing: endorsements, renewals, cancellations",
        intro: "After issuance, changes, renewals and cancellations create most of the service volume. Each can change premium, documents and tax.",
        points: [
          {
            t: "Nil endorsement (non-financial) vs premium-bearing endorsement vs cancellation.",
            d: "A nil endorsement corrects or changes details without changing premium. A premium-bearing endorsement charges extra, or refunds, for a change in risk. A cancellation ends the policy and may refund premium for the unused period.",
            ex: "Changing the nominee: nil endorsement. Adding a CNG kit to a car: extra OD premium. Selling the car and cancelling: refund for the remaining period.",
          },
          {
            t: "Negative endorsements and cancellations need a refund and a GST credit note.",
            d: "Every refund must also reverse the GST charged on it through a credit note, claw back commission and adjust reinsurance. Missing one of these is a common defect.",
            ex: "A ₹11,800 policy (₹10,000 + ₹1,800 GST) is cancelled halfway through, with a pro-rata refund: ₹5,000 premium plus ₹900 GST on a credit note, and half the agent's commission is recovered.",
          },
          {
            t: "Renewals: health insurers send notices before expiry; motor renewals check NCB and break-in.",
            d: "Renewal is the cheapest source of business. Systems produce renewal notices, carry forward NCB or bonuses and flag lapsed policies. A gap in motor cover (break-in) needs an inspection; a gap of more than 90 days also loses NCB.",
            ex: "A car policy expires on 1 March. Renewed on 10 April, it needs an inspection but keeps NCB. Renewed after 30 May (more than 90 days later), the NCB drops to zero.",
          },
          {
            t: "Free-look period: 30 days for life and health from receipt of the policy document.",
            d: "A customer who disagrees with the terms of a new policy can return it within 30 days. The refund is the premium less proportionate risk premium for the days covered, medical test costs and stamp duty.",
            ex: "A customer receives a ULIP on 1 May, realises it is not the pension plan they were promised, and returns it on 20 May for a refund less the allowed deductions.",
          },
        ],
      },
      {
        id: "claims",
        title: "Claims lifecycle",
        intro: "Claims are where the customer finds out what the policy is worth. They also carry most of the fraud, complaints and regulatory scrutiny.",
        points: [
          {
            t: "FNOL (first notice of loss) → registration → documents → survey or medical scrutiny → assessment → approval → settlement → recovery or salvage.",
            d: "FNOL records what happened, when and where. Registration creates a claim number and an initial reserve. Documents are collected, a surveyor or medical team assesses the loss, and the claim is approved and paid. Recovery from a third party and sale of salvage reduce the final cost.",
            ex: "A stolen two-wheeler: intimation through the app, FIR and keys collected, investigator appointed, police 'untraced' report received, RC transferred to the insurer, then the IDV is paid less the compulsory deductible.",
          },
          {
            t: "Motor OD: cashless at a network garage or reimbursement; total loss when repair exceeds about 75% of IDV.",
            d: "In a cashless claim the network garage repairs the vehicle and the insurer pays the garage, minus the customer's share (deductible, depreciation). In a reimbursement claim the customer pays and claims back. If repairs would cost more than about 75% of the IDV, the vehicle is treated as a constructive total loss.",
            ex: "IDV ₹5,95,000 and a repair estimate of ₹4,80,000 (81% of IDV): the insurer settles as a total loss, paying the IDV less the deductible and taking the wreck.",
          },
          {
            t: "Motor TP injury and death claims go to the Motor Accident Claims Tribunal (MACT).",
            d: "Third-party liability for injury and death has no upper limit. The tribunal sets compensation from the victim's age, income and dependants, and the TP insurer pays the award. A June 2026 Supreme Court ruling raised compensation for homemakers, which pushes TP claim costs up.",
            ex: "A homemaker dies in a road accident. The tribunal assigns a notional income for her unpaid work, applies a multiplier for her age and awards compensation to the family, paid by the vehicle's TP insurer.",
          },
          {
            t: "Health: cashless (network hospital, pre-authorisation) or reimbursement; TPA or in-house claims team.",
            d: "Cashless needs a network hospital: the hospital asks for pre-authorisation, the insurer or TPA approves an amount, and the final bill is settled directly at discharge. Reimbursement suits non-network hospitals: the customer pays and claims back.",
            ex: "Appendix surgery at a network hospital: ₹1.2 lakh pre-authorised within an hour, final bill ₹1.35 lakh, ₹1.3 lakh approved at discharge and ₹5,000 paid by the patient for non-payable items such as toiletries.",
          },
          {
            t: "Fraud checks, IIB data, and the grievance route: insurer → Bima Bharosa → Insurance Ombudsman.",
            d: "Fraud checks compare a claim with past claims, industry data from the Insurance Information Bureau (IIB) and red-flag rules such as a claim soon after the policy starts. An unhappy customer complains to the insurer first, can escalate on IRDAI's Bima Bharosa portal and can then go to the Insurance Ombudsman free of charge.",
            ex: "A health claim is rejected for a condition the customer says they disclosed. They complain to the insurer, are not satisfied, and file with the Ombudsman with a copy of their proposal form as evidence.",
          },
        ],
      },
      {
        id: "systems",
        title: "Systems you will work on",
        intro: "Job descriptions name these systems. Know what each one does and how data flows between them.",
        points: [
          {
            t: "Policy administration system (Guidewire PolicyCenter, Duck Creek, Majesco, TCS BaNCS, in-house).",
            d: "The policy administration system (PAS) holds products, policies, endorsements and renewals. It is the system of record and usually the centre of any transformation programme.",
            ex: "A PolicyCenter project to launch a new two-wheeler product configures its covers, rating tables, underwriting rules and document templates.",
          },
          {
            t: "Rating engine: calculates premium from rate tables and rules.",
            d: "It may be part of the PAS or a separate service called by portals and partners. A rating specification listing every table, formula, rounding rule and effective date is one of the most important BA documents.",
            ex: "The Calculators tab on this site is a small rating engine: change the city or engine size and the OD rate is looked up again.",
          },
          {
            t: "Claims management, billing and receipting, commission engine.",
            d: "The claims system registers, reserves and settles claims. Billing and receipting matches payments to policies. The commission engine pays intermediaries within IRDAI's expense limits.",
            ex: "A cancelled policy touches all three: a refund in billing, a commission clawback, and a check that no open claim exists on the policy.",
          },
          {
            t: "Distribution portals, customer apps, data warehouse and regulatory reporting.",
            d: "Agents, POSPs, dealers and aggregators connect through portals and APIs. The data warehouse feeds management reports, actuarial analysis and the returns filed with IRDAI.",
            ex: "A car dealer's system calls the insurer's quote API at the point of sale, so the policy is issued before the car leaves the showroom.",
          },
        ],
      },
    ],
  },
  {
    id: "motor",
    number: 3,
    title: "Motor insurance deep dive",
    summary: "Motor is the largest retail general insurance line and the most rule-heavy. Learn it as business rules you can turn into acceptance criteria.",
    context:
      "Every vehicle on a public road must carry at least third-party cover under the Motor Vehicles Act, 1988. The government fixes third-party premiums; each insurer sets its own own-damage premiums. Keep the car calculator open while you read: the examples below use its default quote.",
    topics: [
      {
        id: "contracts",
        title: "Products, contracts and variants",
        intro: "A motor policy is a bundle of up to four contracts, sold in a few fixed combinations.",
        points: [
          {
            t: "Products: private car, two-wheeler, commercial vehicle (GCV, PCV, miscellaneous).",
            d: "Cars and two-wheelers are personal lines. Commercial vehicles split into goods-carrying (GCV: trucks, pick-ups), passenger-carrying (PCV: taxis, buses) and miscellaneous (tractors, cranes, ambulances), each with its own rating class.",
            ex: "A delivery truck is a GCV, an app-based taxi is a PCV in class C1a, and a farm tractor is a miscellaneous vehicle.",
          },
          {
            t: "Four contracts: own damage (OD), third-party liability (TP, mandatory), add-ons, compulsory PA for the owner-driver (₹15 lakh).",
            d: "OD pays for damage to or theft of your own vehicle. TP pays for injury, death or property damage you cause to others. Add-ons widen OD (zero depreciation, engine protection, return to invoice). Compulsory personal accident (CPA) cover pays ₹15 lakh if the owner-driver dies or is permanently disabled.",
            ex: "The default car quote on the Calculators tab: OD ₹6,593, TP ₹3,416, CPA ₹330 and add-ons ₹2,282 (zero depreciation and roadside assistance).",
          },
          {
            t: "Variants: comprehensive 1+1, bundled (new car 1 OD + 3 TP; new two-wheeler 1 OD + 5 TP), standalone OD, TP only, long-term TP.",
            d: "Comprehensive 1+1 gives a year of both OD and TP. New vehicles must buy long-term TP, usually bundled with 1-year OD. Standalone OD is for owners whose long-term TP is still running. TP only meets the legal minimum.",
            ex: "A car bought in October 2024 came with a 1 OD + 3 TP policy. In October 2025 and 2026 the owner needs only standalone OD, because TP runs until October 2027.",
          },
          {
            t: "Business types: new, rollover, renewal, used vehicle. Each allows only some variant and tenure combinations.",
            d: "New business is a new vehicle; rollover is moving from another insurer; renewal is staying with the same insurer; used vehicle is a second-hand purchase. Each needs different checks, such as previous policy details, NCB proof or an inspection.",
            ex: "A used car bought from a friend cannot carry over the friend's NCB, because NCB belongs to the owner, not the vehicle.",
          },
        ],
      },
      {
        id: "premium",
        title: "Premium build-up (in order)",
        intro: "This is the order a rating engine follows. Work through it once by hand, then compare each step with the premium slip in the car calculator.",
        points: [
          {
            t: "Age of vehicle = policy start date − purchase or registration date.",
            d: "Age is counted in months. It drives both the depreciation used for IDV and the age band of the OD rate.",
            ex: "Registered on 26 July 2024, policy starting on 26 October 2026: 27 months old.",
          },
          {
            t: "IDV = ex-showroom price − depreciation; the customer may move IDV ±15%.",
            d: "The insured declared value (IDV) is the most the insurer pays for a total loss or theft. Depreciation by age: up to 6 months 5%, up to 1 year 15%, up to 2 years 20%, up to 3 years 30%, up to 4 years 40%, up to 5 years 50%. Older vehicles are valued by agreement.",
            ex: "Ex-showroom ₹8,50,000 at 27 months: 30% depreciation gives an IDV of ₹5,95,000. The customer can choose anything from ₹5,05,750 to ₹6,84,250 without an underwriter referral.",
          },
          {
            t: "Basic OD = IDV × policy rate; policy rate = tariff rate × (1 − de-tariff discount).",
            d: "The old Indian Motor Tariff gives a rate by zone (A for the eight largest cities, B elsewhere), engine size or power, and age. Since de-tariffing, each insurer offers a discount on that rate.",
            ex: "Mumbai (zone A), 1,197 cc, 27 months: tariff rate 3.283%. With a 55% de-tariff discount the rate is 1.477%, so basic OD = ₹5,95,000 × 1.477% = ₹8,790.",
          },
          {
            t: "Add OD covers (electrical accessories 4%, CNG kit, side car) to reach the subtotal OD.",
            d: "Items not in the ex-showroom price are insured on top at their own rates. An external CNG kit is rated at 4% of its value; a factory-fitted kit adds 5% of basic OD. Loadings and discounts then apply to the subtotal.",
            ex: "Adding a ₹20,000 music system as an electrical accessory at 4% adds ₹800 to the OD premium.",
          },
          {
            t: "Add loadings, then subtract discounts.",
            d: "Loadings raise OD for higher risk: fibre-glass fuel tank, driving-school use (+60%), imported without customs duty (+30%), geographical extension (₹400). Discounts lower it: voluntary deductible, ARAI-approved anti-theft device (2.5%, at most ₹500), automobile association membership (5%, at most ₹200).",
            ex: "Subtotal OD ₹8,790 with an approved anti-theft device: 2.5% is ₹220, below the ₹500 cap, so the discount is ₹220.",
          },
          {
            t: "Apply NCB on OD before NCB: 20, 25, 35, 45, 50%.",
            d: "No claim bonus (NCB) rewards claim-free years and applies to OD only, never TP. It steps up after each claim-free year and goes back to zero after a claim.",
            ex: "OD before NCB ₹8,790 with 25% NCB: discount ₹2,198, leaving an OD premium of ₹6,593.",
          },
          {
            t: "Basic TP from the 2022 Rules slab, plus CNG ₹60, PA for passengers and ₹50 per paid driver.",
            d: "TP base premiums are fixed by engine size or motor power (see the table below). Small extras are added for a CNG or LPG kit, personal accident cover for passengers and legal liability to paid drivers. Restricting third-party property damage cover to ₹6,000 reduces TP (₹100 a year for a car).",
            ex: "A 1,197 cc car pays ₹3,416 TP. Adding legal liability for one paid driver makes it ₹3,466.",
          },
          {
            t: "Add-ons = add-on sum insured × insurer rate. Net premium → GST 18% (goods-carriage TP 5%).",
            d: "Each insurer prices its own add-ons, usually as a % of IDV or a flat fee. Net premium is OD + TP + CPA + add-ons. GST is 18% on all of it, except TP on goods carriages at 5%.",
            ex: "Default car quote: net ₹12,620 + GST 18% ₹2,272 = total ₹14,892.",
          },
        ],
      },
      {
        id: "uw",
        title: "Underwriting and inspection",
        intro: "Underwriting rules decide which quotes issue automatically and which need a person. They are a rich source of user stories and decision tables.",
        points: [
          {
            t: "Referral triggers: IDV outside ±15%, discounts beyond the approved band, certain vehicle classes.",
            d: "The rules engine sends a case to an underwriter when it falls outside the authority given to the channel, for example unusual values, extra discounts or high-risk vehicles.",
            ex: "A customer wants IDV ₹7,50,000 on a car with a system IDV of ₹5,95,000 (26% higher). The quote is referred, and the underwriter asks for the purchase invoice.",
          },
          {
            t: "Inspection for break-in, ownership transfer, new add-ons or a CNG kit not on the previous policy.",
            d: "A pre-inspection proves the vehicle exists and is undamaged before cover starts. Most insurers now accept a self-recorded video through their app.",
            ex: "A policy lapsed 10 days ago. The owner records a walk-around video of the car in the insurer's app, it is approved, and the policy is issued.",
          },
          {
            t: "NCB is lost after a break of more than 90 days; an NCB reserving letter moves NCB to a new vehicle.",
            d: "NCB belongs to the owner. When the owner sells a vehicle, the insurer can issue a letter that lets the NCB be used on their next vehicle.",
            ex: "An owner with 35% NCB sells a hatchback and buys an SUV. With the reserving letter, the SUV's first policy starts at 35% NCB.",
          },
          {
            t: "Compulsory deductible: ₹1,000 (car up to 1,500 cc), ₹2,000 (above 1,500 cc), ₹100 (two-wheeler).",
            d: "The customer bears the first part of every OD claim. Choosing an extra voluntary deductible on top earns a premium discount.",
            ex: "A ₹25,000 repair on a 1,197 cc car: the customer pays ₹1,000 and the insurer ₹24,000, before any depreciation on parts.",
          },
        ],
      },
      {
        id: "motor-trends",
        title: "What is new in motor",
        intro: "Interviewers ask about these to see whether you follow the market.",
        points: [
          {
            t: "Pay As You Drive and Pay How You Drive OD add-ons allowed since July 2022.",
            d: "Pay As You Drive prices OD by the kilometres driven. Pay How You Drive uses driving behaviour from a telematics device or app. Both let careful or occasional drivers pay less.",
            ex: "An owner who drives 5,000 km a year buys a 5,000 km plan for a lower OD premium and tops it up if they drive more.",
          },
          {
            t: "EV TP slabs by kW; hybrid vehicles get 7.5% off TP.",
            d: "Electric vehicles are rated by motor power in kilowatts instead of engine cc, with lower TP premiums than petrol or diesel equivalents.",
            ex: "A 40 kW electric car pays ₹2,904 TP for a year, compared with ₹3,416 for a 1,197 cc petrol car.",
          },
          {
            t: "2026 IRDAI consultation: Bima Sugam, dealer QR codes, lower TP commissions, no cashless denial for policies bought elsewhere.",
            d: "The proposals aim to give new-car buyers real choice instead of the dealer's default insurer, and to stop garages refusing cashless repair because the policy was bought from a different channel.",
            ex: "At the showroom, a buyer scans a QR code to compare policies from several insurers before deciding.",
          },
          {
            t: "A TP premium revision of 10–25% is under review; not gazetted as of October 2026.",
            d: "The Ministry of Road Transport and Highways notifies TP premiums after consulting IRDAI. Until a new notification is published, the 2022 rates apply.",
            ex: "A good system design keeps the 2022 rates with an end date and loads new rates with a start date, so policies starting before the change keep the old price.",
          },
        ],
      },
    ],
    table: {
      caption: "Third-party base premiums (₹), 2022 Rules, in force since 1 June 2022",
      head: ["Vehicle", "Slab", "1 year", "Long term (new)"],
      rows: [
        ["Private car", "Up to 1,000 cc", "2,094", "6,521 (3 yr)"],
        ["Private car", "1,000–1,500 cc", "3,416", "10,640 (3 yr)"],
        ["Private car", "Above 1,500 cc", "7,897", "24,596 (3 yr)"],
        ["Electric car", "≤30 / ≤65 / >65 kW", "1,780 / 2,904 / 6,712", "5,543 / 9,044 / 20,907"],
        ["Two-wheeler", "≤75 / ≤150 / ≤350 / >350 cc", "538 / 714 / 1,366 / 2,804", "2,901 / 3,851 / 7,365 / 15,117 (5 yr)"],
        ["Electric two-wheeler", "≤3 / ≤7 / ≤16 / >16 kW", "457 / 607 / 1,161 / 2,383", "2,466 / 3,273 / 6,260 / 12,849"],
        ["Goods vehicle", "GVW ≤7.5 / 12 / 20 / 40 t / above", "16,049 / 27,186 / 35,313 / 43,950 / 44,242", "–"],
        ["Goods 3-wheeler", "Public / private", "4,492 / 3,922", "–"],
        ["Taxi ≤6 passengers", "≤1,000 / ≤1,500 / >1,500 cc", "6,040 / 7,940 / 10,523 + per passenger", "–"],
        ["Bus", "Other / school", "14,343 + 877 / 12,192 + 745 per passenger", "–"],
      ],
    },
  },
  {
    id: "health",
    number: 4,
    title: "Health insurance deep dive",
    summary: "Retail health is where most 2024–26 regulatory change happened. Know the product rules and the claim timelines.",
    context:
      "Indian health insurance mainly pays hospital bills. IRDAI's 2024 master circular rewrote many rules in the customer's favour, and since 22 September 2025 individual health policies carry no GST. The health calculator lets you see how age, sum insured and zone change the price.",
    topics: [
      {
        id: "products",
        title: "Plans and products",
        intro: "Health products differ mainly in who is covered and how the sum insured (SI) is shared.",
        points: [
          {
            t: "Individual / multi-individual, family floater (one shared SI), senior citizen, group.",
            d: "Individual cover gives each member their own SI. A family floater shares one SI across the family: cheaper, but it can run out. Senior citizen plans are built for people over 60. Group policies are bought by employers for staff.",
            ex: "A family of three with a ₹10 lakh floater: if the father uses ₹7 lakh, only ₹3 lakh is left for the others that year. On the Calculators tab this family (ages 34, 31 and a child) pays ₹15,232 a year.",
          },
          {
            t: "Arogya Sanjeevani, top-up and super top-up, critical illness, hospital cash, PA.",
            d: "Arogya Sanjeevani is a standard product that every insurer offers with the same wording. A top-up pays above a deductible on each claim; a super top-up pays above a deductible on the year's total claims. Critical illness pays a lump sum on diagnosis, and hospital cash pays a fixed daily amount.",
            ex: "₹5 lakh base policy plus a super top-up with a ₹5 lakh deductible. Two claims of ₹4 lakh in one year: the base pays ₹5 lakh, and the super top-up pays the remaining ₹3 lakh.",
          },
          {
            t: "Business types: new, renewal, portability (waiting periods served carry over up to the previous SI).",
            d: "Portability lets a customer move to another insurer at renewal without losing credit for waiting periods already served, but only up to the old SI. Any extra SI starts its waiting periods again.",
            ex: "After 2 years on a ₹5 lakh policy, a customer ports to ₹10 lakh with a 3-year pre-existing disease wait. One year is left on the first ₹5 lakh; the extra ₹5 lakh has the full 3 years.",
          },
        ],
      },
      {
        id: "pricing",
        title: "Premium drivers and underwriting",
        intro: "Premium rises steeply with age, and underwriting decides who gets standard terms.",
        points: [
          {
            t: "Drivers: age, sum insured, zone, medical history, lifestyle, BMI, deductible, co-pay, tenure.",
            d: "Age is the biggest factor, because hospital use rises sharply after middle age. Metro cities (zone 1) cost more because treatment costs more. A deductible or co-pay lowers the premium by making the customer share claims.",
            ex: "In the health calculator, change the eldest adult's age from 34 to 55 and watch the base premium rise.",
          },
          {
            t: "STP when adults are under 45, SI up to ₹10 lakh, no PED and BMI in range; otherwise NSTP with a pre-policy medical check-up.",
            d: "Low-risk proposals issue automatically. Anything outside the rules goes to an underwriter, often with medical tests at a diagnostic centre paid for by the insurer.",
            ex: "A couple aged 40 and 38 with no medical history and ₹10 lakh SI is issued online in minutes. If one declares diabetes, the case moves to medical tests.",
          },
          {
            t: "Underwriter decisions: accept, accept with loading, special conditions, counter-offer, reject.",
            d: "The underwriter can accept at standard rates, add a loading (extra premium), add conditions such as a specific exclusion, offer different terms such as a lower SI, or decline.",
            ex: "A proposer with controlled high blood pressure is accepted with a 15% loading on the premium.",
          },
        ],
      },
      {
        id: "rules",
        title: "Current IRDAI rules",
        intro: "These customer-friendly rules come mainly from IRDAI's 2024 master circular on health insurance. Expect at least one interview question on them.",
        points: [
          {
            t: "No upper entry-age limit for buying health insurance.",
            d: "Insurers can no longer refuse a new customer only because of age, although age can still affect the premium, tests and terms offered.",
            ex: "A 70-year-old applies for a new policy. The insurer may ask for tests or offer a senior plan with a co-pay, but cannot refuse on age alone.",
          },
          {
            t: "Pre-existing disease (PED) waiting period at most 3 years (was 4); specific-disease waiting capped at 3 years.",
            d: "Conditions declared at proposal can be excluded only for a limited time. Named conditions with their own waiting period, such as cataract or hernia, are capped at 3 years too.",
            ex: "Diabetes declared on a policy starting in 2026 is covered from 2029 at the latest.",
          },
          {
            t: "Moratorium 5 years (was 8): after that, no claim rejection for non-disclosure except fraud.",
            d: "After 5 years of continuous cover, the insurer cannot contest a policy or claim because something was not disclosed, unless it can prove fraud.",
            ex: "In year six, the insurer finds the customer had a thyroid condition before buying the policy. It must still pay the claim unless it can prove deliberate fraud.",
          },
          {
            t: "Cashless decision within 1 hour; final discharge authorisation within 3 hours.",
            d: "The clock starts when the hospital sends the request. If discharge authorisation takes longer than 3 hours, extra charges the hospital raises for the delay are paid by the insurer, not the patient.",
            ex: "The hospital requests discharge at 11:00 and the insurer authorises it at 16:00. The extra hospital charges for that delay fall on the insurer.",
          },
          {
            t: "AYUSH covered without sub-limits; senior citizen renewal increases capped at 10% without approval.",
            d: "Inpatient AYUSH treatment (Ayurveda, Yoga, Unani, Siddha, Homeopathy) is covered up to the sum insured like any other treatment. Insurers need IRDAI approval before raising a senior citizen's premium by more than 10% a year.",
            ex: "A 68-year-old's ₹40,000 premium can rise to at most ₹44,000 at renewal without IRDAI approval.",
          },
          {
            t: "Telemedicine coverage and published, updated network hospital lists.",
            d: "Remote consultations are covered on the same basis as in-person ones, and insurers must keep their lists of cashless hospitals current on their websites.",
            ex: "Before planned surgery, a customer checks the insurer's website to confirm the hospital is still in the cashless network.",
          },
        ],
      },
      {
        id: "health-claims",
        title: "Claims and ecosystem",
        intro: "Most health complaints are about claims, so a lot of health BA work is too.",
        points: [
          {
            t: "Cashless: pre-authorisation request → insurer or TPA decision → final bill → discharge authorisation.",
            d: "The hospital insurance desk sends the diagnosis and estimated cost. The insurer or TPA approves an amount, which can be raised later. At discharge, the final bill is checked and settled directly with the hospital.",
            ex: "₹80,000 is pre-authorised at admission, increased to ₹1.1 lakh after an extra procedure, and the final bill is settled with the hospital at discharge.",
          },
          {
            t: "Reimbursement: submit bills, discharge summary and reports within the policy deadline.",
            d: "The customer pays the hospital, then sends the claim form, bills, discharge summary, test reports and prescriptions. Expenses before and after hospitalisation are usually claimed this way too.",
            ex: "Medicines bought in the 60 days after discharge are claimed with the doctor's prescriptions and pharmacy bills.",
          },
          {
            t: "The National Health Claims Exchange (NHCX) carries standard eligibility, pre-auth and claim messages.",
            d: "NHCX, under the Ayushman Bharat Digital Mission, uses FHIR-format messages so hospitals and insurers can exchange claims through one channel. Adoption is advised by IRDAI but not legally mandated.",
            ex: "Instead of logging into a different portal for each insurer and TPA, a hospital sends one standard pre-auth message through NHCX and receives the decision the same way.",
          },
          {
            t: "Common rejection reasons: waiting period, non-disclosure, exclusions, room-rent proportionate deduction.",
            d: "If a policy caps room rent and the patient chooses a dearer room, many room-linked charges such as doctors' fees and nursing are cut in the same proportion. Medicines and implants are not cut this way.",
            ex: "Room rent limit ₹5,000 a day, room taken at ₹10,000. Room-linked charges are paid at 50%, so the customer can face a large shortfall on an otherwise covered bill.",
          },
        ],
      },
    ],
  },
  {
    id: "life",
    number: 5,
    title: "Life insurance basics",
    summary: "Enough life insurance to hold a conversation and avoid being caught out, even in a general insurance BA interview.",
    context:
      "Life policies run for decades, so the work centres on long-term promises: guarantees, bonuses, lapses, revivals and payments to nominees. The term life calculator shows how age, cover and smoking change the premium.",
    topics: [
      {
        id: "life-products",
        title: "Products",
        intro: "Most life products mix protection and savings. The mix decides both the premium and the payout.",
        points: [
          {
            t: "Term: pure protection, the lowest premium per rupee of cover.",
            d: "Term insurance pays the sum assured only if the life assured dies during the term. Nothing is paid on survival unless the customer chose a return-of-premium version.",
            ex: "On the Calculators tab, a 30-year-old non-smoking man pays about ₹12,097 a year for ₹1 crore of cover over 30 years (an illustrative model, not an insurer price).",
          },
          {
            t: "Endowment and money-back: savings plus protection; guaranteed or participating (bonus).",
            d: "These pay on death or at maturity. Money-back plans pay part of the sum assured at set intervals. Non-participating plans give guaranteed benefits; participating plans add bonuses declared each year from the insurer's profits.",
            ex: "A ₹10 lakh, 20-year participating endowment pays ₹10 lakh plus the bonuses added over 20 years at maturity, or the sum assured plus bonuses to date on earlier death.",
          },
          {
            t: "ULIP: market-linked funds, 5-year lock-in, charges disclosed.",
            d: "After charges, the premium buys units in equity or debt funds chosen by the customer, so returns are not guaranteed. Money cannot be withdrawn in the first 5 years.",
            ex: "A customer puts ₹1 lakh a year into an equity fund. Allocation, mortality and fund management charges are deducted before and after units are bought, and the fund value moves with the market.",
          },
          {
            t: "Annuity and pension: regular income after retirement.",
            d: "An immediate annuity turns a lump sum into income for life. A deferred plan builds savings first and starts paying later. Options include joint life cover for a spouse and return of the purchase price on death.",
            ex: "A retiree pays ₹50 lakh for an immediate annuity and receives a fixed monthly income for the rest of their life.",
          },
        ],
      },
      {
        id: "life-ops",
        title: "Operations and terms",
        intro: "These terms come up in any discussion of life insurance systems or processes.",
        points: [
          {
            t: "Mortality tables and medical underwriting; financial underwriting for high cover against income.",
            d: "Mortality tables give the chance of dying at each age and underpin protection premiums; Indian insurers use the IALM tables. Medical underwriting checks health; financial underwriting checks that the cover is reasonable for the person's income.",
            ex: "A ₹5 crore term proposal from someone earning ₹10 lakh a year (50 times income) is referred, and the insurer asks for income proof.",
          },
          {
            t: "Riders: accidental death, critical illness, waiver of premium.",
            d: "Riders are optional extra covers attached to a base policy for an extra premium.",
            ex: "With a waiver of premium rider, if the policyholder becomes permanently disabled, future premiums are waived but the cover continues.",
          },
          {
            t: "Surrender value, paid-up value, revival of lapsed policies, persistency (13th and 61st month).",
            d: "Surrender value is paid if the customer exits early. If premiums stop after a minimum period, the policy can become paid-up with reduced benefits instead of lapsing. A lapsed policy can be revived within the revival period by paying arrears, sometimes with new medical evidence.",
            ex: "A customer stops paying an endowment in year 4. It becomes paid-up at a reduced sum assured, and they later revive it by paying the missed premiums with interest.",
          },
          {
            t: "LIC is the largest insurer; private leaders include SBI Life, HDFC Life and ICICI Prudential.",
            d: "Much private-sector business is sold through bank branches (bancassurance), so bank integrations and sales journeys are a big part of life BA work.",
            ex: "A customer taking a home loan is offered a term or credit life policy by the bank's insurance partner at the same desk.",
          },
        ],
      },
    ],
  },
  {
    id: "commercial",
    number: 6,
    title: "Commercial lines and reinsurance",
    summary: "Short primers so you can follow conversations on corporate and SME insurance.",
    context:
      "Commercial lines protect businesses rather than individuals. Policies are larger, more often underwritten by hand, and almost always reinsured.",
    topics: [
      {
        id: "lines",
        title: "Main commercial lines",
        intro: "Each line has its own wording, rating basis and claims process.",
        points: [
          {
            t: "Fire and property: Bharat Sookshma Udyam (assets up to ₹5 crore), Bharat Laghu Udyam (₹5–50 crore), Bharat Griha Raksha (home).",
            d: "Property policies cover fire, lightning, explosion, storm, flood and similar perils. IRDAI's standard 'Bharat' products fix the wording according to the size of the business, and a standard home product covers houses.",
            ex: "A small textile unit with ₹3 crore of stock and machinery buys Bharat Sookshma Udyam; a factory with ₹30 crore of assets buys Bharat Laghu Udyam.",
          },
          {
            t: "Marine cargo and hull; engineering (contractor's all risk, machinery breakdown).",
            d: "Marine cargo covers goods in transit by sea, air, rail or road; hull covers the ship itself. Contractor's all risk covers a construction project while it is built; machinery breakdown covers sudden mechanical or electrical failure.",
            ex: "An exporter takes an annual open marine cargo policy that covers every shipment from the factory to the buyer's warehouse.",
          },
          {
            t: "Liability: public, product, directors and officers, professional indemnity, cyber.",
            d: "Liability policies pay amounts the business is legally liable to pay others, plus defence costs. Directors and officers (D&O) cover protects directors personally; cyber cover pays for breach response, ransom and data liability.",
            ex: "After a data breach at an online shop, cyber cover pays for forensic investigators, notifying customers and legal defence.",
          },
          {
            t: "Group health and group term as employee benefits (18% GST still applies).",
            d: "Employers buy cover for staff under one master policy. These are not individual policies, so they did not receive the 2025 GST exemption.",
            ex: "An IT company covers 2,000 employees and their families under one group health policy and pays 18% GST on the premium.",
          },
        ],
      },
      {
        id: "re",
        title: "Reinsurance",
        intro: "Insurers buy insurance too. Reinsurance spreads large losses and lets an insurer write more business than its own capital would allow.",
        points: [
          {
            t: "Treaty (automatic, a whole portfolio) vs facultative (one risk at a time).",
            d: "A treaty covers every policy of an agreed type for a year without case-by-case approval. Facultative reinsurance is negotiated for a single large or unusual risk.",
            ex: "Fire policies up to ₹100 crore go into the fire treaty automatically; a ₹2,000 crore refinery is placed facultatively.",
          },
          {
            t: "Proportional (quota share, surplus) vs non-proportional (excess of loss, catastrophe).",
            d: "In proportional reinsurance the reinsurer takes a fixed share of premium and claims. In non-proportional reinsurance it pays only the part of a loss above a retention.",
            ex: "Quota share 30%: on a ₹10 lakh claim the reinsurer pays ₹3 lakh. Excess of loss of ₹5 crore above ₹1 crore: on a ₹4 crore loss the insurer pays ₹1 crore and the reinsurer ₹3 crore.",
          },
          {
            t: "Obligatory cession to GIC Re; the 2025 Act cut the net owned funds requirement for foreign reinsurers to ₹1,000 crore.",
            d: "Indian general insurers must pass a set share of most business to GIC Re, the national reinsurer. Lower capital requirements make it easier for foreign reinsurers to open branches in India.",
            ex: "On each policy covered by the rule, the insurer passes the required share of premium to GIC Re, and GIC Re pays the same share of any claim.",
          },
        ],
      },
    ],
  },
  {
    id: "regulation",
    number: 7,
    title: "Regulation, tax and market (2025–26)",
    summary: "The rules changed a lot in 2025 and 2026. Interviewers expect you to know these.",
    context:
      "Much insurance BA work starts with a new Act, notification or IRDAI circular. For each change, learn what it says and what it means for systems: what has to be rebuilt, re-rated, re-printed or reported.",
    topics: [
      {
        id: "law",
        title: "Law and regulator",
        intro: "The legal and market background behind most other changes.",
        points: [
          {
            t: "Sabka Bima Sabki Raksha (Amendment of Insurance Laws) Act, passed 17 December 2025.",
            d: "It allows 100% foreign direct investment, lets IRDAI cap commissions and order the return of wrongful gains (disgorgement), and creates a fund for policyholder education and protection. The composite licence was dropped.",
            ex: "Before the Act, foreign ownership was capped at 74%; now a foreign insurer can own an Indian insurer outright.",
          },
          {
            t: "IRDAI goal: Insurance for All by 2047, via Bima Sugam, Bima Vistaar and Bima Vahak.",
            d: "Bima Sugam is the digital marketplace. Bima Vistaar is a simple bundled product covering life, health, accident and property. Bima Vahaks are women-led local distributors in rural areas.",
            ex: "A rural family buys Bima Vistaar through a Bima Vahak in their village, covering life, accident, health and their home in one policy.",
          },
          {
            t: "Market: penetration 3.7% of GDP in FY25 (life 2.7%, non-life 1%); IRDAI calls mis-selling a significant concern.",
            d: "Penetration is total premium as a share of the economy. India's is well below the global average, which is why distribution and access reforms dominate policy.",
            ex: "Mis-selling shows up as early surrenders and free-look cancellations, which is why IRDAI watches persistency and complaints closely.",
          },
        ],
      },
      {
        id: "tax",
        title: "GST and income tax",
        intro: "Tax changes need system work across rating, invoices, receipts, refunds and customer letters.",
        points: [
          {
            t: "From 22 September 2025: individual health and individual life GST 0% (was 18%).",
            d: "Individual policies became exempt from GST. Insurers lost input tax credit on related costs as a result, and some adjusted premiums to reflect that.",
            ex: "The ₹15,232 family floater on the Calculators tab would have cost ₹17,974 with 18% GST before the change.",
          },
          {
            t: "Group health and group life stay at 18%; motor stays at 18%.",
            d: "Only individual life and health policies changed. Systems must apply the rate by product and policy type, not by line of business alone.",
            ex: "The default car quote: net ₹12,620 plus GST of ₹2,272.",
          },
          {
            t: "Goods-carriage third-party GST cut from 12% to 5% (with input tax credit).",
            d: "On a goods vehicle policy, the TP part now carries 5% and the OD and add-ons 18%, so invoices show two GST lines.",
            ex: "The default goods vehicle quote: GST 18% ₹1,478 plus GST 5% ₹1,362, for a total of ₹38,290.",
          },
          {
            t: "Income-tax Act 2025, in force from 1 April 2026: the health premium deduction moves to section 126 (was 80D).",
            d: "The deduction is up to ₹25,000 a year for self and family, or ₹50,000 if senior, and is available only under the old tax regime.",
            ex: "A 35-year-old on the old regime paying ₹15,232 for a family floater can deduct the full amount; on the new regime they get no deduction.",
          },
        ],
      },
      {
        id: "digital",
        title: "Digital public infrastructure",
        intro: "India is building shared rails for insurance, in the way UPI did for payments.",
        points: [
          {
            t: "Bima Sugam launched 17 September 2025; phase 1 live, claims and portability in phase 2.",
            d: "Phase 1 covers comparing, buying and renewing policies and a single e-insurance account. Claims and portability follow in phase 2, with full go-live guided for about November 2026.",
            ex: "A customer compares term plans from several insurers, buys one, and sees all their policies in one e-insurance account.",
          },
          {
            t: "Bima Pehchaan: lifelong insurance ID. Bima Bharosa: grievance portal.",
            d: "Bima Pehchaan links all of a person's policies to one ID. Bima Bharosa is IRDAI's system for registering and tracking complaints against any insurer.",
            ex: "After a death, the family can find every policy linked to the person's ID instead of searching through paperwork.",
          },
          {
            t: "NHCX for health claims; CKYC for identity; Account Aggregator for financial data.",
            d: "NHCX standardises claim messages. Central KYC (CKYC) lets an insurer reuse KYC already done elsewhere. Account Aggregators share financial data with the customer's consent.",
            ex: "A term proposal pulls six months of bank statements through an Account Aggregator, with consent, to verify income for financial underwriting.",
          },
        ],
      },
      {
        id: "data",
        title: "Data protection and accounting",
        intro: "Two programmes that reach almost every system an insurer runs.",
        points: [
          {
            t: "DPDP Rules notified 13 November 2025: consent managers from November 2026; core duties, erasure and 72-hour breach reporting from May 2027.",
            d: "The Digital Personal Data Protection Act requires a clear purpose for each use of personal data, valid consent where needed, deletion when the data is no longer needed and prompt breach reporting.",
            ex: "A marketing campaign to people who once asked for a quote needs a recorded consent for marketing, not just the consent given to produce the quote.",
          },
          {
            t: "Ind AS (IFRS 17 based) for insurers from 1 April 2026, with 12-month relief and up to 2 years of parallel reporting.",
            d: "The new standard changes how insurers measure contracts and spreads profit over the life of the contract. It needs data grouped by product, year of issue and expected profitability.",
            ex: "Finance BAs map policy and claims data into 'groups of contracts' so actuaries can calculate the new figures.",
          },
          {
            t: "Risk-based capital framework in preparation.",
            d: "Capital will depend on the actual risks an insurer carries, such as underwriting, market, credit and operational risk, instead of a simple formula.",
            ex: "An insurer with a riskier investment portfolio will need to hold more capital than one with mainly government bonds.",
          },
        ],
      },
    ],
  },
  {
    id: "trends",
    number: 8,
    title: "Technology and trends",
    summary: "Where the industry is investing. Good material for 'what excites you about insurance?'",
    context: "Use this module to connect your own product, data or AI experience to real insurance problems.",
    topics: [
      {
        id: "ai",
        title: "AI across the chain",
        intro: "AI works best where there are many small, similar decisions and plenty of past data.",
        points: [
          {
            t: "Motor claims: photo and video damage assessment, instant settlement of small claims with confidence thresholds.",
            d: "Models estimate damage from photos and decide repair or replace for each part. Small claims with high confidence are settled at once; others go to a surveyor.",
            ex: "A customer uploads photos of a dented door, the model estimates ₹14,000 with high confidence, and the claim is approved in minutes.",
          },
          {
            t: "Health: OCR and coding of bills, pre-auth triage, fraud scoring.",
            d: "Optical character recognition (OCR) reads hospital bills and maps items to standard codes. Models route simple pre-auths for fast approval and flag unusual patterns for review.",
            ex: "A model flags a hospital whose average stay for cataract surgery is three times the norm.",
          },
          {
            t: "GenAI agents for quotes, renewals and claim status; copilots for agents and underwriters.",
            d: "Chat and voice assistants handle routine customer questions. Copilots summarise long documents and suggest next steps for staff.",
            ex: "An underwriting copilot summarises a 40-page medical report into key findings before the underwriter decides.",
          },
          {
            t: "Guardrails: human in the loop, explainability, audit trail, DPDP consent.",
            d: "Insurance decisions affect people's money and health, so adverse decisions need human review, clear reasons, a full record of what the model did and lawful use of personal data.",
            ex: "A model may approve small claims automatically but cannot reject one; every rejection goes to a person.",
          },
        ],
      },
      {
        id: "distribution",
        title: "Distribution and products",
        intro: "New ways to sell, and new risks to cover.",
        points: [
          {
            t: "Embedded insurance at checkout (travel, gadgets, loans, rides).",
            d: "Cover is offered inside another purchase, at the moment the need is obvious, usually through an API.",
            ex: "Cancellation cover offered when booking a flight, or screen damage cover when buying a phone online.",
          },
          {
            t: "Usage-based motor, EV add-ons, parametric covers, SME cyber.",
            d: "Usage-based motor prices by distance or behaviour. EV add-ons cover the battery and charger. Parametric covers pay a fixed amount when an index is triggered, without assessing the loss.",
            ex: "A farmer's parametric policy pays ₹10,000 automatically if rainfall at the local weather station stays below a set level for the season.",
          },
          {
            t: "Core modernisation: cloud PAS, low-code product configurators, API-first integration.",
            d: "Insurers are moving from old on-premise systems to cloud platforms where new products are configured rather than coded, and connected to partners by APIs.",
            ex: "A new motor add-on goes live in weeks by configuring it in the product configurator, instead of a six-month development project.",
          },
        ],
      },
    ],
  },
  {
    id: "ba-craft",
    number: 9,
    title: "The BA's craft in insurance",
    summary: "Rule-heavy work: precision in calculations and edge cases matters more than in most domains.",
    context: "One wrong rounding rule or effective date can misprice thousands of policies, so insurance BA work rewards precision and traceability.",
    topics: [
      {
        id: "artefacts",
        title: "Artefacts",
        intro: "The documents you will write. Prepare a sample of each to talk through in interviews.",
        points: [
          {
            t: "BRD / FRD with requirement IDs and sign-off; product configuration and rating specifications.",
            d: "A business requirements document (BRD) says what the business needs and why; a functional requirements document (FRD) says what the system must do. A rating specification lists every table, formula, rounding rule and effective date.",
            ex: "Requirement MTR-OD-014: 'The system shall apply NCB to OD before NCB, rounded to the nearest rupee, and shall never apply NCB to TP.'",
          },
          {
            t: "Process maps for quote-to-issue, endorsement, renewal and claims.",
            d: "Swimlane diagrams show who does what across customer, intermediary, insurer and third parties, with the systems used and time limits at each step.",
            ex: "A cashless health claim map with lanes for patient, hospital, TPA and insurer, marking the 1-hour and 3-hour deadlines.",
          },
          {
            t: "User stories with Gherkin acceptance criteria; decision tables (eligibility, STP rules).",
            d: "Gherkin writes acceptance criteria as Given, When, Then. Decision tables list every combination of conditions and its outcome, which makes missing cases easy to spot.",
            ex: "Given a health proposal with all adults under 45, SI up to ₹10 lakh and no pre-existing disease, When it is submitted, Then it is issued without underwriter referral.",
          },
          {
            t: "Data mapping for integrations; UAT scenarios with expected premiums; traceability matrix.",
            d: "Data mapping shows each field from source to target with any transformation. UAT scenarios state inputs and the expected premium to the rupee. A traceability matrix links each requirement to its tests and results.",
            ex: "UAT case: the default car quote on 26 October 2026 must give an IDV of ₹5,95,000 and a total of ₹14,892. This site's automated tests check exactly that.",
          },
        ],
      },
      {
        id: "kpis",
        title: "KPIs to talk about",
        intro: "Link every project you describe in an interview to one or two of these numbers.",
        points: [
          {
            t: "Quote-to-bind conversion, STP rate, issuance and claim turnaround time.",
            d: "Conversion shows how many quotes become policies, the STP rate shows how much is automated, and turnaround times show service quality.",
            ex: "How to phrase it: 'Moving inspections to self-video raised our motor STP rate from 62% to 81% and cut issuance time from two days to 20 minutes.'",
          },
          {
            t: "Renewal retention, loss ratio, combined ratio, claim settlement ratio.",
            d: "These show commercial impact: keeping customers, pricing risk correctly and paying valid claims.",
            ex: "How to phrase it: 'A redesigned renewal reminder journey lifted motor retention from 55% to 63% in two quarters.'",
          },
          {
            t: "Fraud detection rate and false positives, grievances per 10,000 policies, digital share of new business.",
            d: "Fraud tools are judged both on fraud caught and on genuine claims wrongly delayed. IRDAI publishes grievances per 10,000 policies, so insurers compare themselves on it.",
            ex: "A fraud rule that delays 5% of genuine claims to catch a few more fraudulent ones can raise complaints more than it saves.",
          },
        ],
      },
      {
        id: "impact",
        title: "Regulatory change impact analysis",
        intro: "Regulatory change is a large share of insurance BA work. Follow the same steps every time.",
        points: [
          {
            t: "Read the circular, then list affected products, journeys, systems, documents and reports.",
            d: "Note the effective date, which products and channels are in scope, and exactly what must change: rates, wordings, screens, letters or regulatory returns.",
            ex: "The September 2025 GST change touched rating, invoices, receipts, credit notes, renewal notices, partner portals and finance reports.",
          },
          {
            t: "Effective-date every rate and rule with start and end dates; never overwrite.",
            d: "Old policies, endorsements and renewals must keep using the rate that applied at the time, so new rates are added alongside old ones, not in their place.",
            ex: "When TP premiums are revised, policies starting the day before the change use the 2022 rate and those starting on or after it use the new rate, even if both were bought on the same day.",
          },
          {
            t: "Plan regression on calculations, communications and regulatory returns; get compliance sign-off.",
            d: "Re-run a saved set of quotes and documents before and after the change, explain every difference, and have compliance confirm the result matches the regulation.",
            ex: "A pack of 200 saved motor quotes is re-rated after the change, and every premium that moves is matched to the rule that caused it.",
          },
        ],
      },
    ],
  },
];

export interface Week {
  week: number;
  focus: string;
  use: string;
  output: string;
}

export const STUDY_PLAN: Week[] = [
  { week: 1, focus: "Fundamentals, principles, segments, parties", use: "Module 1; glossary", output: "One-page glossary in your own words" },
  { week: 2, focus: "Private car and two-wheeler rating", use: "Module 3; car and two-wheeler calculators", output: "Hand-calculated quote matching the calculator" },
  { week: 3, focus: "Commercial vehicle rating and underwriting", use: "Module 3; commercial vehicle calculator", output: "Decision table for one vehicle class" },
  { week: 4, focus: "Motor claims, endorsements, renewals", use: "Module 2; insurers' claim pages", output: "End-to-end motor claims process map" },
  { week: 5, focus: "Health products, underwriting, claims", use: "Module 4; health calculator", output: "STP/NSTP decision table and cashless flow with SLA timers" },
  { week: 6, focus: "Regulation, GST, tax, DPDP, Bima Sugam", use: "Module 7", output: "Impact analysis of the September 2025 GST change" },
  { week: 7, focus: "Life insurance and commercial lines", use: "Modules 5 and 6; term life calculator", output: "Comparison table of term, endowment and ULIP" },
  { week: 8, focus: "Trends, KPIs, mock interviews", use: "Modules 8–9; Interview tab", output: "Five STAR stories and one case study for your CV" },
];

export const GLOSSARY: [string, string][] = [
  ["Break-in", "Policy expired before renewal, leaving a gap in cover; motor needs an inspection before cover restarts"],
  ["Combined ratio", "(Claims + expenses) ÷ earned premium; under 100% means an underwriting profit"],
  ["Co-pay", "Share of each health claim paid by the insured, for example 20%"],
  ["CPA", "Compulsory personal accident cover for the owner-driver, ₹15 lakh"],
  ["Deductible", "The first part of a claim that the customer pays before the insurer pays anything"],
  ["Earned premium", "The part of written premium for which cover has already been given"],
  ["Endorsement", "Mid-term change to a policy, with or without a change in premium"],
  ["FNOL", "First notice of loss: the moment a claim is first reported"],
  ["Free-look period", "30 days to return a new life or health policy and get a refund less allowed deductions"],
  ["IBNR", "Reserve for claims incurred but not reported"],
  ["IDV", "Insured declared value: the motor sum insured, ex-showroom price less depreciation"],
  ["Loss ratio", "Claims incurred ÷ earned premium"],
  ["MACT", "Motor Accident Claims Tribunal, which decides TP injury and death claims"],
  ["Moratorium", "After 5 continuous years, health claims cannot be contested for non-disclosure except fraud"],
  ["NCB", "No claim bonus: OD discount of 20–50% for claim-free years"],
  ["NSTP", "Non-straight-through processing: needs an underwriter, inspection or medicals"],
  ["PED", "Pre-existing disease: a condition the person had before the policy started"],
  ["Persistency", "Share of life policies still paying premium after a set number of months"],
  ["POSP", "Point of sales person, licensed to sell simple products"],
  ["Proposer", "The person who signs the proposal and pays; may differ from the insured"],
  ["SAOD", "Standalone own damage policy"],
  ["Sum insured", "The most the insurer will pay under a policy or cover"],
  ["Subrogation", "Insurer recovers its payout from the party at fault"],
  ["TPA", "Third party administrator that handles health claims for insurers"],
  ["TPPD", "Third-party property damage"],
  ["Waiting period", "Time from the policy start before certain health claims are covered"],
  ["Zero depreciation", "Motor add-on that pays for replaced parts without deducting depreciation"],
];

export const SOURCES: [string, string][] = [
  ["TP Base Premium Rules 2022 (G.S.R. 394(E))", "https://taxguru.in/corporate-law/motor-vehicles-third-party-insurance-base-premium-liability-rules-2022.html"],
  ["TP revision not gazetted (Aug 2026)", "https://dailyfinancial.in/motor-insurance-premiums-are-up-14-in-2026-so-why-is-your-renewal-quote-barely-moving/"],
  ["Motor TP market and SC ruling (Oct 2026)", "https://www.whalesbook.com/news/English/bankingfinance/Motor-Third-Party-Insurance-Growth-Slows-to-9percent-Post-Court-Ruling/6ad8aa6679a16deaeaf8e209"],
  ["56th GST Council decisions", "https://www.alvarezandmarsal.com/thought-leadership/56th-gst-council-meeting-alert"],
  ["DFS: GST exemption for individual life and health", "https://financialservices.gov.in/exemption-gst-all-individual-life-insurance-and-health-insurance-policies"],
  ["Section 126, Income-tax Act 2025", "https://cleartax.in/s/section-126-income-tax-act-2025"],
  ["IRDAI health reforms", "https://www.outlookmoney.com/personal-finance/irdais-health-insurance-reforms-put-consumers-first-with-faster-claims-and-wider-access"],
  ["IRDAI 2026 health rules summary", "https://www.nivabupa.com/health-insurance-articles/new-irdai-rules-what-has-changed-for-policyholders.html"],
  ["Insurance Laws Amendment Act 2025", "https://uk.marketscreener.com/news/india-s-parliament-approves-bill-to-raise-foreign-direct-investment-in-insurance-to-100-ce7d50dfdc8cf325"],
  ["Bima Sugam status (Sep 2026)", "https://www.ipomarket.in/news/bima-sugam-upi-moment-insurance-irdai-not-ipo"],
  ["IRDAI motor distribution proposal", "https://www.outlookmoney.com/amp/story/personal-finance/irdai-proposes-new-motor-insurance-rules-what-could-change-for-new-car-buyers"],
  ["DPDP Rules 2025 timeline", "https://www.taxmann.com/post/blog/analysis-indias-dpdp-act-and-rules/"],
  ["Ind AS for insurers", "https://oga-prod.angelone.in/news/market-updates/irdai-allows-12-month-relief-for-ind-as-implementation-with-parallel-reporting-for-2-years"],
  ["NHCX status", "https://nirmitee.io/blog/is-nhcx-mandatory-hospitals-hmis-2026/"],
  ["IRDAI annual report coverage (FY25)", "https://www.business-standard.com/amp/finance/insurance/mis-selling-indian-insurance-sector-significant-concern-irdai-125123001092_1.html"],
];
