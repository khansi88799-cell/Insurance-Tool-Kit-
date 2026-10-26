/* Whiteboard data model, shape catalogue and starter templates. Pure data: no React. */

export type Kind =
  | "start"
  | "end"
  | "process"
  | "decision"
  | "document"
  | "database"
  | "text"
  | "bpmn-start"
  | "bpmn-timer"
  | "bpmn-message"
  | "bpmn-end"
  | "bpmn-task"
  | "bpmn-xor"
  | "bpmn-and"
  | "bpmn-data"
  | "pool"
  | "ins-person"
  | "ins-org"
  | "ins-hospital"
  | "ins-car"
  | "ins-money"
  | "ins-shield";

export interface WNode {
  id: string;
  kind: Kind;
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  /** Lane names, top to bottom (pools only) */
  lanes?: string[];
}

export type EdgeKind = "seq" | "msg";

export interface WEdge {
  id: string;
  from: string;
  to: string;
  label: string;
  kind: EdgeKind;
}

export interface Board {
  nodes: WNode[];
  edges: WEdge[];
}

export interface ShapeDef {
  kind: Kind;
  name: string;
  /** What the symbol means */
  meaning: string;
  w: number;
  h: number;
  label: string;
  group: "Insurance" | "Flowchart" | "BPMN";
}

export const SHAPES: ShapeDef[] = [
  { group: "Insurance", kind: "ins-person", name: "Person", meaning: "A person: customer, agent, surveyor, underwriter", w: 44, h: 60, label: "Customer" },
  { group: "Insurance", kind: "ins-org", name: "Organisation", meaning: "A company: insurer, reinsurer, bank, broker, garage, TPA", w: 64, h: 60, label: "Insurer" },
  { group: "Insurance", kind: "ins-hospital", name: "Hospital", meaning: "A hospital or clinic, such as a cashless network hospital", w: 64, h: 60, label: "Hospital" },
  { group: "Insurance", kind: "ins-car", name: "Vehicle", meaning: "The insured vehicle in a motor diagram", w: 76, h: 44, label: "Vehicle" },
  { group: "Insurance", kind: "ins-money", name: "Payment", meaning: "Money moving: premium, commission, claim payment", w: 44, h: 44, label: "Premium" },
  { group: "Insurance", kind: "ins-shield", name: "Cover", meaning: "Insurance cover or a policy", w: 44, h: 50, label: "Policy" },
  { group: "Flowchart", kind: "start", name: "Start / end", meaning: "Where the process begins or finishes", w: 130, h: 44, label: "Start" },
  { group: "Flowchart", kind: "process", name: "Process step", meaning: "An activity someone or something performs", w: 140, h: 60, label: "Process step" },
  { group: "Flowchart", kind: "decision", name: "Decision", meaning: "A yes / no question; label the outgoing arrows", w: 130, h: 84, label: "Decision?" },
  { group: "Flowchart", kind: "document", name: "Document", meaning: "A document produced or used, such as a policy schedule", w: 130, h: 70, label: "Document" },
  { group: "Flowchart", kind: "database", name: "System / data", meaning: "A system or data store, such as the PAS", w: 110, h: 80, label: "System" },
  { group: "Flowchart", kind: "text", name: "Note", meaning: "Free text: assumptions, rules, SLAs", w: 170, h: 50, label: "Note" },
  { group: "BPMN", kind: "pool", name: "Pool with lanes", meaning: "A participant (pool) split into roles (lanes); steps sit in the lane of whoever does them", w: 1000, h: 390, label: "Process", },
  { group: "BPMN", kind: "bpmn-start", name: "Start event", meaning: "Thin circle: what triggers the process", w: 40, h: 40, label: "Start" },
  { group: "BPMN", kind: "bpmn-message", name: "Message event", meaning: "Envelope: a message is received, such as a claim intimation", w: 40, h: 40, label: "Message" },
  { group: "BPMN", kind: "bpmn-timer", name: "Timer event", meaning: "Clock: a wait or a deadline, such as the 3-hour discharge SLA", w: 40, h: 40, label: "Timer" },
  { group: "BPMN", kind: "bpmn-end", name: "End event", meaning: "Thick circle: an outcome of the process", w: 40, h: 40, label: "End" },
  { group: "BPMN", kind: "bpmn-task", name: "Task", meaning: "Rounded box: a unit of work done by the lane's role", w: 130, h: 60, label: "Task" },
  { group: "BPMN", kind: "bpmn-xor", name: "Exclusive gateway", meaning: "Diamond with X: exactly one path is taken", w: 50, h: 50, label: "Decision?" },
  { group: "BPMN", kind: "bpmn-and", name: "Parallel gateway", meaning: "Diamond with +: all paths run at the same time, then join", w: 50, h: 50, label: "" },
  { group: "BPMN", kind: "bpmn-data", name: "Data object", meaning: "A document or data used by a task", w: 40, h: 52, label: "Data" },
];

export const SHAPE_BY_KIND = Object.fromEntries(SHAPES.map((s) => [s.kind, s])) as Record<Kind, ShapeDef>;
SHAPE_BY_KIND.end = { ...SHAPE_BY_KIND.start, kind: "end", name: "End" };

/** Shapes drawn as a small symbol with the label underneath */
export const LABEL_BELOW: Kind[] = ["bpmn-start", "bpmn-timer", "bpmn-message", "bpmn-end", "bpmn-xor", "bpmn-and", "bpmn-data", "ins-person", "ins-org", "ins-hospital", "ins-car", "ins-money", "ins-shield"];

export const CANVAS_W = 1800;
export const CANVAS_H = 1100;
export const GRID = 10;
export const POOL_HEADER = 30;
export const LANE_HEADER = 30;

export const newId = (p: string) => `${p}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

const n = (id: string, kind: Kind, x: number, y: number, label: string, extra: Partial<WNode> = {}): WNode => {
  const s = SHAPE_BY_KIND[kind];
  return { id, kind, x, y, w: s.w, h: s.h, label, ...extra };
};
const e = (from: string, to: string, label = "", kind: EdgeKind = "seq"): WEdge => ({ id: `e-${from}-${to}`, from, to, label, kind });

export interface Template {
  id: string;
  name: string;
  board: Board;
}

export const TEMPLATES: Template[] = [
  {
    id: "parties",
    name: "Insurance: parties and money flows",
    board: {
      nodes: [
        n("cust", "ins-person", 90, 190, "Customer"),
        n("agent", "ins-person", 320, 190, "Agent / broker"),
        n("ins", "ins-org", 560, 190, "Insurer"),
        n("re", "ins-org", 840, 190, "Reinsurer"),
        n("reg", "ins-org", 560, 30, "IRDAI"),
        n("car", "ins-car", 74, 400, "Insured vehicle"),
        n("pol", "ins-shield", 330, 400, "Policy"),
        n("hosp", "ins-hospital", 560, 400, "Network hospital"),
        n("gar", "ins-org", 760, 400, "Garage"),
        n("note", "text", 840, 40, "Money flows down the chain as premium and back as claim payments"),
      ],
      edges: [
        e("cust", "agent", "premium"),
        e("agent", "ins", "proposal"),
        e("ins", "agent", "commission"),
        e("ins", "re", "ceded premium"),
        e("re", "ins", "recoveries", "msg"),
        e("reg", "ins", "rules", "msg"),
        e("ins", "pol", "issues"),
        e("pol", "car", "covers"),
        e("ins", "hosp", "cashless payment"),
        e("ins", "gar", "repair payment"),
      ],
    },
  },
  {
    id: "cashless",
    name: "BPMN swimlane: cashless health claim",
    board: {
      nodes: [
        n("pool", "pool", 40, 40, "Cashless health claim", { w: 1140, h: 420, lanes: ["Patient", "Hospital", "Insurer / TPA"] }),
        n("s", "bpmn-start", 120, 90, "Patient admitted"),
        n("t1", "bpmn-task", 180, 220, "Send pre-auth request"),
        n("t2", "bpmn-task", 330, 360, "Review pre-auth (within 1 hour)"),
        n("g", "bpmn-xor", 510, 365, "Approved?"),
        n("tn", "bpmn-task", 430, 80, "Pay bill and claim reimbursement"),
        n("e2", "bpmn-end", 640, 90, "Self-funded"),
        n("t3", "bpmn-task", 600, 220, "Treat patient"),
        n("t4", "bpmn-task", 770, 220, "Final bill and discharge request"),
        n("t5", "bpmn-task", 770, 360, "Authorise discharge (within 3 hours)"),
        n("t6", "bpmn-task", 940, 220, "Discharge patient"),
        n("e", "bpmn-end", 1110, 90, "Discharged"),
      ],
      edges: [e("s", "t1"), e("t1", "t2"), e("t2", "g"), e("g", "t3", "Yes"), e("g", "tn", "No"), e("tn", "e2"), e("t3", "t4"), e("t4", "t5"), e("t5", "t6"), e("t6", "e")],
    },
  },
  {
    id: "motor",
    name: "BPMN swimlane: motor own damage claim",
    board: {
      nodes: [
        n("pool", "pool", 40, 40, "Motor OD claim (cashless)", { w: 1200, h: 520, lanes: ["Customer", "Insurer", "Surveyor", "Garage"] }),
        n("s", "bpmn-message", 120, 85, "Accident reported"),
        n("t1", "bpmn-task", 180, 205, "Register claim, check cover"),
        n("g1", "bpmn-xor", 360, 210, "Covered?"),
        n("e0", "bpmn-end", 480, 85, "Claim declined"),
        n("t2", "bpmn-task", 450, 465, "Prepare repair estimate"),
        n("t3", "bpmn-task", 610, 335, "Inspect and assess loss"),
        n("g2", "bpmn-xor", 790, 210, "Repair over 75% of IDV?"),
        n("t4", "bpmn-task", 880, 205, "Settle as total loss"),
        n("t5", "bpmn-task", 880, 465, "Repair vehicle"),
        n("t6", "bpmn-task", 1040, 205, "Pay garage"),
        n("t7", "bpmn-task", 1010, 75, "Pay deductible, collect car"),
        n("e", "bpmn-end", 1180, 85, "Closed"),
      ],
      edges: [
        e("s", "t1"),
        e("t1", "g1"),
        e("g1", "e0", "No"),
        e("g1", "t2", "Yes"),
        e("t2", "t3"),
        e("t3", "g2"),
        e("g2", "t4", "Yes"),
        e("g2", "t5", "No"),
        e("t4", "e"),
        e("t5", "t6"),
        e("t6", "t7"),
        e("t7", "e"),
      ],
    },
  },
  {
    id: "stp",
    name: "Flowchart: health STP decision",
    board: {
      nodes: [
        n("s", "start", 40, 200, "Proposal submitted"),
        n("d1", "decision", 210, 180, "All adults under 45?"),
        n("d2", "decision", 400, 180, "Sum insured up to ₹10 lakh?"),
        n("d3", "decision", 590, 180, "Any pre-existing disease?"),
        n("p1", "process", 780, 192, "Issue policy (STP)"),
        n("e1", "end", 970, 200, "Policy issued"),
        n("p2", "process", 400, 380, "Refer: medical tests and underwriter"),
        n("e2", "end", 620, 388, "Underwriter decides"),
        n("db", "database", 780, 340, "Policy admin system"),
        n("note", "text", 40, 330, "STP rules from the product's underwriting guidelines"),
      ],
      edges: [
        e("s", "d1"),
        e("d1", "d2", "Yes"),
        e("d2", "d3", "Yes"),
        e("d3", "p1", "No"),
        e("p1", "e1"),
        e("d1", "p2", "No"),
        e("d2", "p2", "No"),
        e("d3", "p2", "Yes"),
        e("p2", "e2"),
        e("p1", "db", "", "msg"),
      ],
    },
  },
  {
    id: "lanes",
    name: "Blank swimlane (3 lanes)",
    board: { nodes: [n("pool", "pool", 40, 40, "Process", { w: 1000, h: 390, lanes: ["Customer", "Insurer", "Partner"] })], edges: [] },
  },
  { id: "blank", name: "Blank canvas", board: { nodes: [], edges: [] } },
];
