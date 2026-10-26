import type { ReactNode } from "react";

/* Reference diagrams drawn as inline SVG. Colours come from CSS classes (dg-*) that use the design tokens, so they follow light and dark themes. */

export type DiagramId = "quote" | "parties" | "premium" | "lifecycle" | "motor-claim" | "cashless" | "reinsurance" | "systems" | "data-model";

type Tone = "plain" | "accent" | "warn" | "muted";

function Box({ x, y, w, h, title, sub, tone = "plain" }: { x: number; y: number; w: number; h: number; title: string; sub?: string; tone?: Tone }) {
  const lines = title.split("\n");
  const subLines = sub ? sub.split("\n") : [];
  const total = lines.length * 14 + subLines.length * 12;
  let ty = y + h / 2 - total / 2 + 11;
  return (
    <g>
      <rect className={`dg-box ${tone}`} x={x} y={y} width={w} height={h} rx={7} />
      {lines.map((l, i) => (
        <text key={`t${i}`} className="dg-title" x={x + w / 2} y={ty + i * 14} textAnchor="middle">
          {l}
        </text>
      ))}
      {(() => {
        ty += lines.length * 14;
        return subLines.map((l, i) => (
          <text key={`s${i}`} className="dg-sub" x={x + w / 2} y={ty + i * 12} textAnchor="middle">
            {l}
          </text>
        ));
      })()}
    </g>
  );
}

function Arrow({ d, id, label, lx, ly, anchor = "middle", plain }: { d: string; id: string; label?: string; lx?: number; ly?: number; anchor?: "start" | "middle" | "end"; plain?: boolean }) {
  return (
    <g>
      <path className="dg-line" d={d} markerEnd={plain ? undefined : `url(#ah-${id})`} />
      {label && (
        <text className="dg-label" x={lx} y={ly} textAnchor={anchor}>
          {label}
        </text>
      )}
    </g>
  );
}

function Svg({ id, w, h, title, children }: { id: string; w: number; h: number; title: string; children: ReactNode }) {
  return (
    <svg className="dg" viewBox={`0 0 ${w} ${h}`} role="img" aria-label={title} style={{ minWidth: Math.min(w, 640) }}>
      <defs>
        <marker id={`ah-${id}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path className="dg-head" d="M0,0 L10,5 L0,10 z" />
        </marker>
      </defs>
      {children}
    </svg>
  );
}

function Lanes({ names, top, laneH, width }: { names: string[]; top: number; laneH: number; width: number }) {
  return (
    <g>
      {names.map((n, i) => (
        <g key={n}>
          <rect className="dg-lane" x={0} y={top + i * laneH} width={width} height={laneH} />
          <text className="dg-lane-name" x={10} y={top + i * laneH + laneH / 2 + 4}>
            {n}
          </text>
        </g>
      ))}
    </g>
  );
}

/** Steps in swimlanes, linked in order by elbow arrows */
function SwimSteps({ id, steps, top, laneH, x0, step, w, h }: { id: string; steps: [number, string, Tone?][]; top: number; laneH: number; x0: number; step: number; w: number; h: number }) {
  const pos = steps.map(([lane], i) => ({ x: x0 + i * step, y: top + lane * laneH + (laneH - h) / 2 }));
  return (
    <g>
      {pos.slice(1).map((p, i) => {
        const a = pos[i];
        const ay = a.y + h / 2;
        const by = p.y + h / 2;
        const mx = a.x + w + (p.x - a.x - w) / 2;
        const d = ay === by ? `M${a.x + w},${ay} L${p.x},${by}` : `M${a.x + w},${ay} L${mx},${ay} L${mx},${by} L${p.x},${by}`;
        return <Arrow key={i} id={id} d={d} />;
      })}
      {steps.map(([, t, tone], i) => (
        <Box key={i} x={pos[i].x} y={pos[i].y} w={w} h={h} title={t} tone={tone} />
      ))}
    </g>
  );
}

const fmt = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

function PremiumWaterfall() {
  // Default private car quote from the calculator (see src/calc/totals.test.ts)
  const bars: [string, number, number, Tone][] = [
    ["Basic OD", 0, 8790, "accent"],
    ["NCB 25%", 8790, 6592, "warn"],
    ["Third party", 6592, 10008, "accent"],
    ["CPA", 10008, 10338, "accent"],
    ["Add-ons", 10338, 12620, "accent"],
    ["Net premium", 0, 12620, "muted"],
    ["GST 18%", 12620, 14892, "accent"],
    ["Total", 0, 14892, "muted"],
  ];
  const base = 270;
  const k = 220 / 14892;
  return (
    <Svg id="premium" w={760} h={320} title="Premium build-up for the default car quote">
      <line className="dg-axis" x1={20} y1={base} x2={745} y2={base} />
      {bars.map(([label, from, to, tone], i) => {
        const x = 30 + i * 90;
        const top = base - Math.max(from, to) * k;
        const hgt = Math.max(Math.abs(to - from) * k, 2);
        const delta = to - from;
        return (
          <g key={label}>
            <rect className={`dg-bar ${tone}`} x={x} y={top} width={70} height={hgt} rx={3} />
            <text className="dg-title" x={x + 35} y={top - 6} textAnchor="middle">
              {from === 0 || delta > 0 ? fmt(Math.abs(delta)) : `−${fmt(Math.abs(delta))}`}
            </text>
            <text className="dg-sub" x={x + 35} y={base + 18} textAnchor="middle">
              {label}
            </text>
            {i < bars.length - 1 && from !== 0 && bars[i + 1][1] !== 0 && (
              <line className="dg-guide" x1={x + 70} y1={base - to * k} x2={x + 90} y2={base - to * k} />
            )}
            {i === 0 && <line className="dg-guide" x1={x + 70} y1={base - to * k} x2={x + 90} y2={base - to * k} />}
          </g>
        );
      })}
    </Svg>
  );
}

export interface Diagram {
  id: DiagramId;
  title: string;
  /** When you would draw this at work or in an interview */
  when: string;
  /** How to read or draw it */
  tips: string[];
  render: () => ReactNode;
}

export const DIAGRAMS: Diagram[] = [
  {
    id: "quote",
    title: "Quote to policy (process flow)",
    when: "The most common whiteboard question: 'Walk me through how a policy is sold.' Also the starting point of almost every requirements workshop.",
    tips: [
      "Draw left to right, one box per step, then add the STP / NSTP decision.",
      "Name the system at each step (portal, CKYC, rating engine, payment gateway, PAS) to show you think like a BA.",
      "Cover normally starts only after premium is received (section 64VB), so payment sits before issuance.",
    ],
    render: () => (
      <Svg id="quote" w={740} h={340} title="Quote to policy flow">
        <Arrow id="quote" d="M134,60 L158,60" />
        <Arrow id="quote" d="M282,60 L306,60" />
        <Arrow id="quote" d="M430,60 L454,60" />
        <Arrow id="quote" d="M578,60 L602,60" />
        <Arrow id="quote" d="M664,90 L664,150" />
        <Arrow id="quote" d="M602,180 L430,180" label="STP: every rule passes" lx={516} ly={172} />
        <Arrow id="quote" d="M664,210 L664,260" label="NSTP" lx={672} ly={240} anchor="start" />
        <Arrow id="quote" d="M530,290 L368,290 L368,210" label="accept / load / decline" lx={450} ly={282} />
        <Arrow id="quote" d="M306,180 L134,180" />
        <Box x={10} y={30} w={124} h={60} title="Quote" sub={"indicative price"} />
        <Box x={158} y={30} w={124} h={60} title={"Client creation"} sub={"KYC, dedupe"} />
        <Box x={306} y={30} w={124} h={60} title="Risk details" sub={"vehicle / members"} />
        <Box x={454} y={30} w={124} h={60} title="Proposal" sub={"declarations"} />
        <Box x={602} y={30} w={124} h={60} title="Payment" sub={"receipt"} />
        <Box x={602} y={150} w={124} h={60} title={"Underwriting\nrules"} tone="warn" />
        <Box x={306} y={150} w={124} h={60} title="Issue policy" sub={"policy number"} tone="accent" />
        <Box x={10} y={150} w={124} h={60} title="Dispatch" sub={"schedule, CIS, invoice"} />
        <Box x={530} y={260} w={196} h={60} title="Underwriter review" sub={"inspection or medicals"} />
      </Svg>
    ),
  },
  {
    id: "parties",
    title: "Parties and money flows",
    when: "Use it to explain the industry to a new stakeholder, or when an interviewer asks who the parties in insurance are.",
    tips: [
      "Put the insurer in the centre; arrows show who pays or serves whom.",
      "Brokers act for the customer; agents and banks act for the insurer.",
      "TPAs and surveyors serve claims but carry no risk; reinsurers carry risk but never meet the customer.",
    ],
    render: () => (
      <Svg id="parties" w={760} h={360} title="Parties and money flows">
        <Arrow id="parties" d="M465,66 L465,148" label="licenses, rules" lx={473} ly={112} anchor="start" />
        <Arrow id="parties" d="M140,166 L200,166" label="proposal, premium" lx={170} ly={140} />
        <Arrow id="parties" d="M330,166 L390,166" label="business" lx={360} ly={140} />
        <Arrow id="parties" d="M540,166 L600,166" label="ceded premium" lx={570} ly={140} />
        <Arrow id="parties" d="M390,196 L330,196" label="commission" lx={360} ly={230} />
        <Arrow id="parties" d="M600,196 L540,196" label="claim recoveries" lx={604} ly={230} anchor="start" />
        <Arrow id="parties" d="M415,212 L415,256 L75,256 L75,212" label="policy, claim payment" lx={245} ly={250} />
        <Arrow id="parties" d="M480,212 L505,290" label="health claims" lx={488} ly={272} anchor="end" />
        <Arrow id="parties" d="M520,212 L675,290" label="surveys" lx={632} ly={250} anchor="start" />
        <Box x={390} y={14} w={150} h={52} title="IRDAI" sub="regulator" tone="muted" />
        <Box x={10} y={148} w={130} h={64} title="Customer" sub={"proposer, insured,\nnominee"} />
        <Box x={200} y={148} w={130} h={64} title="Intermediary" sub={"agent, bank,\nbroker, POSP"} />
        <Box x={390} y={148} w={150} h={64} title="Insurer" sub={"underwriter, actuary,\nclaims"} tone="accent" />
        <Box x={600} y={148} w={150} h={64} title="Reinsurer" sub={"GIC Re, foreign\nbranches"} />
        <Box x={430} y={290} w={150} h={52} title="TPA" sub="health claims service" />
        <Box x={600} y={290} w={150} h={52} title="Surveyor" sub="motor and property loss" />
      </Svg>
    ),
  },
  {
    id: "premium",
    title: "Motor premium build-up (waterfall)",
    when: "Explaining a rating specification, or answering 'walk me through a motor premium'. Also a good UAT artefact: each bar is a line to check.",
    tips: [
      "Read left to right: each bar starts where the previous one ended.",
      "NCB reduces only own damage, so it sits before third party is added.",
      "Figures are the default car quote on the Calculators tab: Mumbai, 1,197 cc, 27 months, 25% NCB.",
    ],
    render: () => <PremiumWaterfall />,
  },
  {
    id: "lifecycle",
    title: "Policy lifecycle (state diagram)",
    when: "Designing statuses in a policy admin system, or explaining endorsements, renewals and cancellations.",
    tips: [
      "Boxes are states; arrows are events that move a policy between them.",
      "Endorsements and claims happen while the policy stays in force.",
      "Every state change needs rules: who can trigger it, what it costs, which documents and refunds follow.",
    ],
    render: () => (
      <Svg id="lifecycle" w={760} h={300} title="Policy lifecycle">
        <Arrow id="lifecycle" d="M130,138 L160,138" />
        <Arrow id="lifecycle" d="M280,138 L310,138" />
        <Arrow id="lifecycle" d="M430,138 L470,138" label="accepted" lx={450} ly={100} />
        <Arrow id="lifecycle" d="M370,166 L370,226" label="declined" lx={378} ly={200} anchor="start" />
        <Arrow id="lifecycle" d="M515,110 L515,66" label="change" lx={507} ly={92} anchor="end" />
        <Arrow id="lifecycle" d="M555,66 L555,110" />
        <Arrow id="lifecycle" d="M515,166 L515,226" label="loss" lx={507} ly={200} anchor="end" />
        <Arrow id="lifecycle" d="M555,226 L555,166" />
        <Arrow id="lifecycle" d="M600,124 L640,58" label="cancel" lx={630} ly={98} anchor="start" />
        <Arrow id="lifecycle" d="M600,138 L640,138" />
        <Arrow id="lifecycle" d="M680,166 L680,226" label="not renewed" lx={688} ly={200} anchor="start" />
        <Arrow id="lifecycle" d="M640,152 L600,152" label="new term" lx={620} ly={186} />
        <Box x={10} y={110} w={120} h={56} title="Quote" />
        <Box x={160} y={110} w={120} h={56} title="Proposal" sub="paid" />
        <Box x={310} y={110} w={120} h={56} title="Underwriting" tone="warn" />
        <Box x={310} y={226} w={120} h={50} title="Declined" sub="refund" tone="muted" />
        <Box x={470} y={110} w={130} h={56} title="In force" tone="accent" />
        <Box x={470} y={16} w={130} h={50} title="Endorsement" sub="nil / extra / refund" />
        <Box x={470} y={226} w={130} h={50} title="Claim" sub="open → settled" />
        <Box x={640} y={110} w={110} h={56} title="Renewal" sub="NCB, bonus" />
        <Box x={640} y={16} w={110} h={50} title="Cancelled" sub="refund, credit note" tone="muted" />
        <Box x={640} y={226} w={110} h={50} title="Expired / lapsed" tone="muted" />
      </Svg>
    ),
  },
  {
    id: "motor-claim",
    title: "Motor own damage claim (swimlane)",
    when: "Asked to map a claims process, or to find where delays and leakage happen in it.",
    tips: [
      "One lane per party; time runs left to right.",
      "Mark decisions an interviewer will probe: cashless or reimbursement, repair or total loss (about 75% of IDV).",
      "The customer pays the compulsory deductible and depreciation on parts unless they have zero depreciation cover.",
    ],
    render: () => (
      <Svg id="motor-claim" w={770} h={300} title="Motor own damage claim swimlane">
        <Lanes names={["Customer", "Insurer", "Surveyor", "Garage"]} top={10} laneH={70} width={770} />
        <SwimSteps
          id="motor-claim"
          top={10}
          laneH={70}
          x0={86}
          step={85}
          w={76}
          h={52}
          steps={[
            [0, "Report\nclaim\n(FNOL)"],
            [1, "Register,\ncheck\ncover"],
            [3, "Repair\nestimate"],
            [2, "Inspect,\nassess\nloss"],
            [1, "Approve\namount", "warn"],
            [3, "Repair\nvehicle"],
            [1, "Pay\ngarage", "accent"],
            [0, "Pay own\nshare,\ncollect car"],
          ]}
        />
      </Svg>
    ),
  },
  {
    id: "cashless",
    title: "Cashless health claim with time limits",
    when: "Any health claims question, and a favourite for 'where would you put system timers and alerts?'",
    tips: [
      "Highlight the two IRDAI clocks: 1 hour for pre-authorisation, 3 hours for discharge.",
      "Show enhancement requests when treatment costs more than first approved.",
      "If discharge authorisation is late, extra hospital charges fall on the insurer.",
    ],
    render: () => (
      <Svg id="cashless" w={770} h={260} title="Cashless health claim flow">
        <Lanes names={["Patient", "Hospital", "Insurer / TPA"]} top={10} laneH={80} width={770} />
        <SwimSteps
          id="cashless"
          top={10}
          laneH={80}
          x0={110}
          step={93}
          w={84}
          h={56}
          steps={[
            [0, "Admitted,\nshows\nhealth card"],
            [1, "Sends\npre-auth\nrequest"],
            [2, "Decide in\n1 hour", "accent"],
            [1, "Treat;\nask more\nif needed"],
            [1, "Final bill,\ndischarge\nrequest"],
            [2, "Authorise\nin 3 hours", "accent"],
            [0, "Pays non-\npayables,\ndischarged"],
          ]}
        />
      </Svg>
    ),
  },
  {
    id: "reinsurance",
    title: "Reinsurance: quota share and excess of loss",
    when: "Explaining how an insurer limits its exposure, or answering a reinsurance calculation question.",
    tips: [
      "Quota share splits every claim in a fixed ratio.",
      "Excess of loss pays only the slice of a loss above the retention, up to the layer's limit.",
      "Both examples match the reinsurance questions in the Interview tab.",
    ],
    render: () => {
      const L = 40;
      const top = 40;
      const H = 220;
      // Excess of loss scale: ₹0 to ₹30 crore
      const ky = H / 30;
      const y = (cr: number) => top + H - cr * ky;
      return (
        <Svg id="reinsurance" w={760} h={300} title="Quota share and excess of loss">
          <text className="dg-title" x={L} y={24}>
            Quota share 40%: ₹10 lakh claim
          </text>
          <rect className="dg-bar accent" x={L} y={top} width={200} height={H * 0.6} rx={3} />
          <rect className="dg-bar warn" x={L} y={top + H * 0.6} width={200} height={H * 0.4} rx={3} />
          <text className="dg-title" x={L + 100} y={top + H * 0.3 + 4} textAnchor="middle">
            Insurer keeps 60%: ₹6 lakh
          </text>
          <text className="dg-title" x={L + 100} y={top + H * 0.8 + 4} textAnchor="middle">
            Reinsurer pays 40%: ₹4 lakh
          </text>

          <text className="dg-title" x={400} y={24}>
            Excess of loss ₹20 cr xs ₹5 cr: ₹18 cr loss
          </text>
          <rect className="dg-bar muted" x={400} y={y(30)} width={200} height={y(25) - y(30)} rx={3} />
          <rect className="dg-bar warn" x={400} y={y(25)} width={200} height={y(5) - y(25)} rx={3} />
          <rect className="dg-bar accent" x={400} y={y(5)} width={200} height={y(0) - y(5)} rx={3} />
          <text className="dg-sub" x={500} y={(y(30) + y(25)) / 2 + 4} textAnchor="middle">
            above ₹25 cr: back to insurer
          </text>
          <text className="dg-title" x={500} y={(y(25) + y(5)) / 2 + 4} textAnchor="middle">
            Layer: reinsurer pays ₹13 cr
          </text>
          <text className="dg-title" x={500} y={(y(5) + y(0)) / 2 + 4} textAnchor="middle">
            Retention: insurer ₹5 cr
          </text>
          <line className="dg-loss" x1={390} y1={y(18)} x2={620} y2={y(18)} />
          <text className="dg-label" x={626} y={y(18) + 4}>
            loss ₹18 cr
          </text>
          {[0, 5, 25, 30].map((v) => (
            <text key={v} className="dg-sub" x={392} y={y(v) + 4} textAnchor="end">
              ₹{v} cr
            </text>
          ))}
        </Svg>
      );
    },
  },
  {
    id: "systems",
    title: "System context: policy administration",
    when: "Asked which systems an insurer runs, or to scope the integrations for a new product or channel.",
    tips: [
      "Put the system you are changing in the middle and the systems it talks to around it.",
      "Label each line with the data that flows, for example 'quote request' or 'receipt'.",
      "External systems (VAHAN, CKYC, IIB, Bima Sugam) are often the riskiest integrations.",
    ],
    render: () => {
      const sats: [number, number, string, string][] = [
        [20, 20, "Distribution portals", "agent, POSP, customer app"],
        [305, 20, "Rating engine", "rates, rules"],
        [590, 20, "Bima Sugam and", "aggregator APIs"],
        [20, 165, "Payment gateway", "UPI, cards, mandates"],
        [590, 165, "External data", "VAHAN, CKYC, IIB"],
        [20, 310, "Billing, receipting", "and commission"],
        [305, 310, "Claims system", "and reinsurance"],
        [590, 310, "Data warehouse", "MIS, IRDAI returns"],
      ];
      return (
        <Svg id="systems" w={760} h={380} title="System context diagram">
          {sats.map(([x, y]) => (
            <line key={`${x}-${y}`} className="dg-line" x1={x + 75} y1={y + 26} x2={380} y2={190} />
          ))}
          {sats.map(([x, y, t, s]) => (
            <Box key={t} x={x} y={y} w={150} h={52} title={t} sub={s} />
          ))}
          <Box x={290} y={150} w={180} h={80} title={"Policy administration\nsystem (PAS)"} sub="products, policies, endorsements" tone="accent" />
        </Svg>
      );
    },
  },
  {
    id: "data-model",
    title: "Core data model (entity relationship)",
    when: "Data mapping, migrations, reporting and API design. Interviewers ask you to sketch the main entities for a motor or health policy.",
    tips: [
      "1 and N show 'one to many': one customer can hold many policies.",
      "Keep the insured risk (vehicle or member) separate from the cover, because one risk carries several covers.",
      "Endorsements, payments and claims all hang off the policy and need effective dates.",
    ],
    render: () => {
      const ents: [number, number, string, string[]][] = [
        [20, 20, "Customer", ["customer ID", "name, DOB, KYC", "contact, address"]],
        [290, 20, "Policy", ["policy number", "product, start, end", "status, premium"]],
        [560, 20, "Intermediary", ["code, type", "licence", "commission rate"]],
        [20, 190, "Payment", ["receipt number", "amount, mode", "date"]],
        [290, 190, "Insured risk", ["vehicle or member", "IDV or sum insured", "risk details"]],
        [560, 190, "Endorsement", ["type", "effective date", "premium change"]],
        [290, 360, "Cover", ["OD, TP, add-on", "sum insured", "premium line"]],
        [560, 360, "Claim", ["claim number", "date of loss", "reserve, paid"]],
      ];
      const rel: [number, number, number, number, number, number, number, number][] = [
        // x1, y1, x2, y2, label "1" at (x,y), label "N" at (x,y)
        [200, 65, 290, 65, 206, 58, 276, 58],
        [560, 65, 470, 65, 552, 58, 478, 58],
        [300, 120, 200, 235, 294, 136, 210, 228],
        [380, 120, 380, 190, 388, 136, 388, 184],
        [460, 120, 560, 235, 466, 136, 548, 228],
        [380, 290, 380, 360, 388, 306, 388, 354],
        [470, 260, 560, 400, 478, 276, 548, 392],
      ];
      return (
        <Svg id="data-model" w={760} h={480} title="Core insurance data model">
          {rel.map(([x1, y1, x2, y2, ax, ay, bx, by], i) => (
            <g key={i}>
              <line className="dg-line" x1={x1} y1={y1} x2={x2} y2={y2} />
              <text className="dg-label" x={ax} y={ay}>
                1
              </text>
              <text className="dg-label" x={bx} y={by}>
                N
              </text>
            </g>
          ))}
          {ents.map(([x, y, name, fields]) => (
            <g key={name}>
              <rect className="dg-box plain" x={x} y={y} width={180} height={100} rx={7} />
              <rect className="dg-box accent" x={x} y={y} width={180} height={26} rx={7} />
              <text className="dg-title" x={x + 90} y={y + 17} textAnchor="middle">
                {name}
              </text>
              {fields.map((f, i) => (
                <text key={f} className="dg-sub" x={x + 12} y={y + 46 + i * 17}>
                  {f}
                </text>
              ))}
            </g>
          ))}
        </Svg>
      );
    },
  },
];

export const DIAGRAM_TITLE: Record<DiagramId, string> = Object.fromEntries(DIAGRAMS.map((d) => [d.id, d.title])) as Record<DiagramId, string>;
