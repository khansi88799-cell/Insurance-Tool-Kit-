import { useCallback, useEffect, useRef, useState, type PointerEvent as RPointerEvent, type ReactNode } from "react";
import { useStoredState } from "../hooks";
import {
  CANVAS_H,
  CANVAS_W,
  GRID,
  LABEL_BELOW,
  LANE_HEADER,
  POOL_HEADER,
  SHAPES,
  SHAPE_BY_KIND,
  TEMPLATES,
  newId,
  type Board,
  type EdgeKind,
  type Kind,
  type WEdge,
  type WNode,
} from "../whiteboard/model";

const snap = (v: number) => Math.round(v / GRID) * GRID;
const clone = (b: Board): Board => JSON.parse(JSON.stringify(b)) as Board;

/** Split a label into lines that fit roughly within a width */
function wrap(text: string, width: number): string[] {
  const max = Math.max(4, Math.floor(width / 6.6));
  const out: string[] = [];
  for (const para of text.split("\n")) {
    let line = "";
    for (const word of para.split(" ")) {
      if (!line) line = word;
      else if ((line + " " + word).length <= max) line += " " + word;
      else {
        out.push(line);
        line = word;
      }
    }
    out.push(line);
  }
  return out;
}

function Label({ x, y, w, text, className = "wb-text" }: { x: number; y: number; w: number; text: string; className?: string }) {
  const lines = wrap(text, w);
  const top = y - ((lines.length - 1) * 14) / 2;
  return (
    <text className={className} textAnchor="middle">
      {lines.map((l, i) => (
        <tspan key={i} x={x} y={top + i * 14 + 4}>
          {l}
        </tspan>
      ))}
    </text>
  );
}

/** The symbol for a node, drawn at its position */
function Shape({ n }: { n: WNode }): ReactNode {
  const { x, y, w, h } = n;
  const cx = x + w / 2;
  const cy = y + h / 2;
  const below = LABEL_BELOW.includes(n.kind);
  let body: ReactNode = null;
  switch (n.kind) {
    case "start":
    case "end":
      body = <rect className="wb-shape terminal" x={x} y={y} width={w} height={h} rx={h / 2} />;
      break;
    case "process":
      body = <rect className="wb-shape" x={x} y={y} width={w} height={h} rx={4} />;
      break;
    case "bpmn-task":
      body = <rect className="wb-shape task" x={x} y={y} width={w} height={h} rx={12} />;
      break;
    case "decision":
      body = <polygon className="wb-shape decision" points={`${cx},${y} ${x + w},${cy} ${cx},${y + h} ${x},${cy}`} />;
      break;
    case "document":
      body = <path className="wb-shape" d={`M${x},${y} H${x + w} V${y + h - 10} Q${x + (w * 3) / 4},${y + h - 22} ${cx},${y + h - 10} T${x},${y + h - 10} Z`} />;
      break;
    case "database":
      body = (
        <g>
          <path className="wb-shape" d={`M${x},${y + 10} V${y + h - 10} A${w / 2},10 0 0 0 ${x + w},${y + h - 10} V${y + 10}`} />
          <ellipse className="wb-shape" cx={cx} cy={y + 10} rx={w / 2} ry={10} />
        </g>
      );
      break;
    case "text":
      body = <rect className="wb-shape note" x={x} y={y} width={w} height={h} rx={2} />;
      break;
    case "bpmn-start":
      body = <circle className="wb-shape event" cx={cx} cy={cy} r={w / 2} />;
      break;
    case "bpmn-end":
      body = <circle className="wb-shape event end" cx={cx} cy={cy} r={w / 2 - 1.5} />;
      break;
    case "bpmn-timer":
      body = (
        <g>
          <circle className="wb-shape event" cx={cx} cy={cy} r={w / 2} />
          <circle className="wb-shape event" cx={cx} cy={cy} r={w / 2 - 4} />
          <path className="wb-mark" d={`M${cx},${cy - 10} V${cy} H${cx + 7}`} />
        </g>
      );
      break;
    case "bpmn-message":
      body = (
        <g>
          <circle className="wb-shape event" cx={cx} cy={cy} r={w / 2} />
          <rect className="wb-mark-box" x={cx - 10} y={cy - 7} width={20} height={14} />
          <path className="wb-mark" d={`M${cx - 10},${cy - 7} L${cx},${cy + 1} L${cx + 10},${cy - 7}`} />
        </g>
      );
      break;
    case "bpmn-xor":
    case "bpmn-and":
      body = (
        <g>
          <polygon className="wb-shape gateway" points={`${cx},${y} ${x + w},${cy} ${cx},${y + h} ${x},${cy}`} />
          {n.kind === "bpmn-xor" ? (
            <path className="wb-mark thick" d={`M${cx - 8},${cy - 8} L${cx + 8},${cy + 8} M${cx + 8},${cy - 8} L${cx - 8},${cy + 8}`} />
          ) : (
            <path className="wb-mark thick" d={`M${cx},${cy - 11} V${cy + 11} M${cx - 11},${cy} H${cx + 11}`} />
          )}
        </g>
      );
      break;
    case "ins-person":
      body = (
        <g>
          <rect className="wb-hit" x={x} y={y} width={w} height={h} />
          <circle className="wb-shape icon" cx={cx} cy={y + h * 0.2} r={h * 0.17} />
          <path className="wb-shape icon" d={`M${x + w * 0.08},${y + h} V${y + h * 0.62} Q${x + w * 0.08},${y + h * 0.42} ${cx},${y + h * 0.42} Q${x + w * 0.92},${y + h * 0.42} ${x + w * 0.92},${y + h * 0.62} V${y + h} Z`} />
        </g>
      );
      break;
    case "ins-org":
    case "ins-hospital":
      body = (
        <g>
          <path className="wb-shape icon" d={`M${x},${y + h * 0.3} L${cx},${y} L${x + w},${y + h * 0.3} V${y + h} H${x} Z`} />
          {n.kind === "ins-org" ? (
            <path className="wb-mark" d={`M${x + w * 0.22},${y + h * 0.45} V${y + h * 0.88} M${x + w * 0.41},${y + h * 0.45} V${y + h * 0.88} M${x + w * 0.59},${y + h * 0.45} V${y + h * 0.88} M${x + w * 0.78},${y + h * 0.45} V${y + h * 0.88}`} />
          ) : (
            <path className="wb-mark thick cross" d={`M${cx},${y + h * 0.42} V${y + h * 0.86} M${cx - h * 0.22},${y + h * 0.64} H${cx + h * 0.22}`} />
          )}
        </g>
      );
      break;
    case "ins-car":
      body = (
        <g>
          <path
            className="wb-shape icon"
            d={`M${x + 2},${y + h * 0.78} V${y + h * 0.5} L${x + w * 0.2},${y + h * 0.45} L${x + w * 0.33},${y + h * 0.1} H${x + w * 0.7} L${x + w * 0.84},${y + h * 0.45} L${x + w - 2},${y + h * 0.52} V${y + h * 0.78} Z`}
          />
          <circle className="wb-shape wheel" cx={x + w * 0.25} cy={y + h * 0.8} r={h * 0.17} />
          <circle className="wb-shape wheel" cx={x + w * 0.75} cy={y + h * 0.8} r={h * 0.17} />
        </g>
      );
      break;
    case "ins-money":
      body = (
        <g>
          <circle className="wb-shape money" cx={cx} cy={cy} r={w / 2} />
          <text className="wb-symbol" x={cx} y={cy + 7} textAnchor="middle">
            ₹
          </text>
        </g>
      );
      break;
    case "ins-shield":
      body = (
        <g>
          <path className="wb-shape icon" d={`M${cx},${y} L${x + w},${y + h * 0.18} V${y + h * 0.5} Q${x + w},${y + h * 0.85} ${cx},${y + h} Q${x},${y + h * 0.85} ${x},${y + h * 0.5} V${y + h * 0.18} Z`} />
          <path className="wb-mark thick" d={`M${cx - 9},${cy + 1} L${cx - 2},${cy + 8} L${cx + 10},${cy - 7}`} />
        </g>
      );
      break;
    case "bpmn-data":
      body = <path className="wb-shape" d={`M${x},${y} H${x + w - 12} L${x + w},${y + 12} V${y + h} H${x} Z M${x + w - 12},${y} V${y + 12} H${x + w}`} />;
      break;
    default:
      return null;
  }
  return (
    <g>
      {body}
      {n.label &&
        (below ? (
          <Label x={cx} y={y + h + 14 + (wrap(n.label, 120).length - 1) * 7} w={120} text={n.label} className="wb-text small halo" />
        ) : (
          <Label x={cx} y={n.kind === "document" ? cy - 5 : cy} w={n.kind === "decision" ? w * 0.62 : w - 12} text={n.label} />
        ))}
    </g>
  );
}

function Pool({ n }: { n: WNode }) {
  const lanes = n.lanes?.length ? n.lanes : [""];
  const lh = n.h / lanes.length;
  return (
    <g>
      <rect className="wb-pool" x={n.x} y={n.y} width={n.w} height={n.h} />
      <rect className="wb-pool-head" x={n.x} y={n.y} width={POOL_HEADER} height={n.h} />
      <text className="wb-text" textAnchor="middle" transform={`translate(${n.x + POOL_HEADER / 2 + 4},${n.y + n.h / 2}) rotate(-90)`}>
        {n.label}
      </text>
      {lanes.map((name, i) => (
        <g key={i}>
          {i > 0 && <line className="wb-lane-line" x1={n.x + POOL_HEADER} y1={n.y + i * lh} x2={n.x + n.w} y2={n.y + i * lh} />}
          <line className="wb-lane-line" x1={n.x + POOL_HEADER + LANE_HEADER} y1={n.y + i * lh} x2={n.x + POOL_HEADER + LANE_HEADER} y2={n.y + (i + 1) * lh} />
          <text className="wb-text small" textAnchor="middle" transform={`translate(${n.x + POOL_HEADER + LANE_HEADER / 2 + 4},${n.y + i * lh + lh / 2}) rotate(-90)`}>
            {name}
          </text>
        </g>
      ))}
    </g>
  );
}

const ROUND: Kind[] = ["bpmn-start", "bpmn-timer", "bpmn-message", "bpmn-end"];
const DIAMOND: Kind[] = ["decision", "bpmn-xor", "bpmn-and"];

/** Point where the line from a node's centre towards (tx, ty) leaves its outline */
function boxExit(n: WNode, tx: number, ty: number): [number, number] {
  const cx = n.x + n.w / 2;
  const cy = n.y + n.h / 2;
  const dx = tx - cx;
  const dy = ty - cy;
  if (dx === 0 && dy === 0) return [cx, cy];
  let s: number;
  if (ROUND.includes(n.kind)) s = n.w / 2 / Math.hypot(dx, dy);
  else if (DIAMOND.includes(n.kind)) s = 1 / (Math.abs(dx) / (n.w / 2) + Math.abs(dy) / (n.h / 2));
  else s = Math.min(dx !== 0 ? n.w / 2 / Math.abs(dx) : Infinity, dy !== 0 ? n.h / 2 / Math.abs(dy) : Infinity);
  return [cx + dx * s, cy + dy * s];
}

function edgePoints(a: WNode, b: WNode): [number, number, number, number] {
  const [x1, y1] = boxExit(a, b.x + b.w / 2, b.y + b.h / 2);
  const [x2, y2] = boxExit(b, a.x + a.w / 2, a.y + a.h / 2);
  return [x1, y1, x2, y2];
}

type Drag =
  | { type: "move"; ids: string[]; startX: number; startY: number; orig: Record<string, [number, number]> }
  | { type: "resize"; id: string; startX: number; startY: number; w: number; h: number }
  | { type: "connect"; from: string; x: number; y: number }
  | { type: "pan"; startX: number; startY: number; left: number; top: number };

type Selection = { type: "node"; id: string } | { type: "edge"; id: string } | null;

const STORAGE_KEY = "ibd-whiteboard";

export default function Whiteboard({ start = "", onStarted }: { start?: string; onStarted?: () => void }) {
  const [board, setBoard] = useStoredState<Board>(STORAGE_KEY, () => clone(TEMPLATES[0].board));
  const [sel, setSel] = useState<Selection>(null);
  const [zoom, setZoom] = useState(0.8);
  const [drag, setDrag] = useState<Drag | null>(null);
  const [edgeKind, setEdgeKind] = useState<EdgeKind>("seq");
  const past = useRef<Board[]>([]);
  const future = useRef<Board[]>([]);
  const svgRef = useRef<SVGSVGElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const dragStartBoard = useRef<Board | null>(null);
  const [focus, setFocus] = useState(false);

  /** Apply a change and record it for undo */
  const commit = useCallback(
    (next: Board, before: Board = board) => {
      past.current.push(clone(before));
      if (past.current.length > 80) past.current.shift();
      future.current = [];
      setBoard(next);
    },
    [board, setBoard],
  );

  const undo = useCallback(() => {
    const prev = past.current.pop();
    if (!prev) return;
    future.current.push(clone(board));
    setBoard(prev);
    setSel(null);
  }, [board, setBoard]);

  const redo = useCallback(() => {
    const next = future.current.pop();
    if (!next) return;
    past.current.push(clone(board));
    setBoard(next);
    setSel(null);
  }, [board, setBoard]);

  const node = (id: string) => board.nodes.find((x) => x.id === id);
  const selNode = sel?.type === "node" ? node(sel.id) : undefined;
  const selEdge = sel?.type === "edge" ? board.edges.find((x) => x.id === sel.id) : undefined;

  const toCanvas = (clientX: number, clientY: number): [number, number] => {
    const svg = svgRef.current;
    if (!svg) return [0, 0];
    const r = svg.getBoundingClientRect();
    return [((clientX - r.left) / r.width) * CANVAS_W, ((clientY - r.top) / r.height) * CANVAS_H];
  };

  const updateNode = (id: string, patch: Partial<WNode>) => commit({ ...board, nodes: board.nodes.map((x) => (x.id === id ? { ...x, ...patch } : x)) });
  const updateEdge = (id: string, patch: Partial<WEdge>) => commit({ ...board, edges: board.edges.map((x) => (x.id === id ? { ...x, ...patch } : x)) });

  const removeSelected = useCallback(() => {
    if (!sel) return;
    if (sel.type === "node") commit({ nodes: board.nodes.filter((x) => x.id !== sel.id), edges: board.edges.filter((x) => x.from !== sel.id && x.to !== sel.id) });
    else commit({ ...board, edges: board.edges.filter((x) => x.id !== sel.id) });
    setSel(null);
  }, [sel, board, commit]);

  const duplicateSelected = useCallback(() => {
    if (sel?.type !== "node") return;
    const src = board.nodes.find((x) => x.id === sel.id);
    if (!src) return;
    const copy: WNode = { ...src, id: newId("n"), x: src.x + 30, y: src.y + 30, lanes: src.lanes ? [...src.lanes] : undefined };
    commit({ ...board, nodes: [...board.nodes, copy] });
    setSel({ type: "node", id: copy.id });
  }, [sel, board, commit]);

  const addShape = (kind: Kind) => {
    const s = SHAPE_BY_KIND[kind];
    const el = scrollRef.current;
    // Place new shapes in the middle of what is currently visible
    let cx = 200;
    let cy = 200;
    if (el) {
      cx = (el.scrollLeft + el.clientWidth / 2) / zoom;
      cy = (el.scrollTop + el.clientHeight / 2) / zoom;
    }
    const w = kind === "pool" ? 1000 : s.w;
    const h = kind === "pool" ? 390 : s.h;
    const nd: WNode = {
      id: newId("n"),
      kind,
      x: snap(Math.min(Math.max(cx - w / 2, 10), CANVAS_W - w - 10)),
      y: snap(Math.min(Math.max(cy - h / 2, 10), CANVAS_H - h - 10)),
      w,
      h,
      label: s.label,
      lanes: kind === "pool" ? ["Customer", "Insurer", "Partner"] : undefined,
    };
    // Pools go to the back so other shapes stay clickable
    commit({ ...board, nodes: kind === "pool" ? [nd, ...board.nodes] : [...board.nodes, nd] });
    setSel({ type: "node", id: nd.id });
  };

  const loadTemplate = (id: string) => {
    const t = TEMPLATES.find((x) => x.id === id);
    if (!t) return;
    commit(clone(t.board));
    setSel(null);
  };

  /** Start a fresh, empty board in full screen. The previous drawing stays one Undo away. */
  const openBlank = useCallback(() => {
    if (board.nodes.length || board.edges.length) commit({ nodes: [], edges: [] });
    setSel(null);
    setZoom(1);
    setFocus(true);
    requestAnimationFrame(() => scrollRef.current?.scrollTo({ left: 0, top: 0 }));
  }, [board, commit]);

  // #whiteboard/blank opens a blank board straight away
  const started = useRef(false);
  useEffect(() => {
    if (start !== "blank" || started.current) return;
    started.current = true;
    openBlank();
    onStarted?.();
  }, [start, openBlank, onStarted]);

  useEffect(() => {
    if (!focus) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [focus]);

  /* ---------- Pointer handling ---------- */

  const startMove = (e: RPointerEvent, n: WNode) => {
    e.stopPropagation();
    setSel({ type: "node", id: n.id });
    const [px, py] = toCanvas(e.clientX, e.clientY);
    // Moving a pool carries the shapes inside it
    const ids =
      n.kind === "pool"
        ? [n.id, ...board.nodes.filter((o) => o.kind !== "pool" && o.x + o.w / 2 > n.x && o.x + o.w / 2 < n.x + n.w && o.y + o.h / 2 > n.y && o.y + o.h / 2 < n.y + n.h).map((o) => o.id)]
        : [n.id];
    const orig: Record<string, [number, number]> = {};
    for (const id of ids) {
      const o = node(id);
      if (o) orig[id] = [o.x, o.y];
    }
    dragStartBoard.current = clone(board);
    setDrag({ type: "move", ids, startX: px, startY: py, orig });
    svgRef.current?.setPointerCapture(e.pointerId);
  };

  const startResize = (e: RPointerEvent, n: WNode) => {
    e.stopPropagation();
    const [px, py] = toCanvas(e.clientX, e.clientY);
    dragStartBoard.current = clone(board);
    setDrag({ type: "resize", id: n.id, startX: px, startY: py, w: n.w, h: n.h });
    svgRef.current?.setPointerCapture(e.pointerId);
  };

  const startConnect = (e: RPointerEvent, n: WNode) => {
    e.stopPropagation();
    const [px, py] = toCanvas(e.clientX, e.clientY);
    setDrag({ type: "connect", from: n.id, x: px, y: py });
    svgRef.current?.setPointerCapture(e.pointerId);
  };

  const startPan = (e: RPointerEvent) => {
    setSel(null);
    const el = scrollRef.current;
    if (!el) return;
    setDrag({ type: "pan", startX: e.clientX, startY: e.clientY, left: el.scrollLeft, top: el.scrollTop });
    svgRef.current?.setPointerCapture(e.pointerId);
  };

  const onMove = (e: RPointerEvent) => {
    if (!drag) return;
    if (drag.type === "pan") {
      const el = scrollRef.current;
      if (el) {
        el.scrollLeft = drag.left - (e.clientX - drag.startX);
        el.scrollTop = drag.top - (e.clientY - drag.startY);
      }
      return;
    }
    const [px, py] = toCanvas(e.clientX, e.clientY);
    if (drag.type === "move") {
      const dx = px - drag.startX;
      const dy = py - drag.startY;
      setBoard((b) => ({
        ...b,
        nodes: b.nodes.map((o) => (drag.orig[o.id] ? { ...o, x: snap(Math.max(0, drag.orig[o.id][0] + dx)), y: snap(Math.max(0, drag.orig[o.id][1] + dy)) } : o)),
      }));
    } else if (drag.type === "resize") {
      setBoard((b) => ({
        ...b,
        nodes: b.nodes.map((o) => (o.id === drag.id ? { ...o, w: snap(Math.max(30, drag.w + px - drag.startX)), h: snap(Math.max(30, drag.h + py - drag.startY)) } : o)),
      }));
    } else {
      setDrag({ ...drag, x: px, y: py });
    }
  };

  const onUp = (e: RPointerEvent) => {
    if (!drag) return;
    if (drag.type === "move" || drag.type === "resize") {
      const before = dragStartBoard.current;
      if (before && JSON.stringify(before.nodes) !== JSON.stringify(board.nodes)) {
        past.current.push(before);
        future.current = [];
      }
    } else if (drag.type === "connect") {
      // Find the shape under the pointer, ignoring pools
      const hit = document.elementsFromPoint(e.clientX, e.clientY).map((el) => el.closest("[data-node]")?.getAttribute("data-node")).find((id) => id && node(id)?.kind !== "pool");
      if (hit && hit !== drag.from && !board.edges.some((x) => x.from === drag.from && x.to === hit)) {
        const ed: WEdge = { id: newId("e"), from: drag.from, to: hit, label: "", kind: edgeKind };
        commit({ ...board, edges: [...board.edges, ed] });
        setSel({ type: "edge", id: ed.id });
      }
    }
    dragStartBoard.current = null;
    setDrag(null);
  };

  /* ---------- Keyboard shortcuts ---------- */

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest("input, textarea, select")) return;
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      } else if (mod && e.key.toLowerCase() === "y") {
        e.preventDefault();
        redo();
      } else if (mod && e.key.toLowerCase() === "d") {
        e.preventDefault();
        duplicateSelected();
      } else if ((e.key === "Delete" || e.key === "Backspace") && sel) {
        e.preventDefault();
        removeSelected();
      } else if (e.key === "Escape") {
        if (sel) setSel(null);
        else setFocus(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo, duplicateSelected, removeSelected, sel]);

  /* ---------- Export ---------- */

  const exportSvgText = (): string | null => {
    const svg = svgRef.current;
    if (!svg) return null;
    const copy = svg.cloneNode(true) as SVGSVGElement;
    // Inline computed colours so the file looks the same outside the site
    const src = svg.querySelectorAll<SVGElement>("*");
    const dst = copy.querySelectorAll<SVGElement>("*");
    src.forEach((el, i) => {
      const cs = getComputedStyle(el);
      const props = ["fill", "stroke", "stroke-width", "stroke-dasharray", "font-size", "font-family", "font-weight", "font-style"];
      dst[i].setAttribute("style", props.map((p) => `${p}:${cs.getPropertyValue(p)}`).join(";"));
    });
    copy.querySelectorAll(".wb-ui").forEach((el) => el.remove());
    // Crop to the drawing
    const xs = board.nodes.flatMap((n) => [n.x, n.x + n.w]);
    const ys = board.nodes.flatMap((n) => [n.y, n.y + n.h + (LABEL_BELOW.includes(n.kind) ? 40 : 0)]);
    const minX = Math.max(0, Math.min(...xs, CANVAS_W) - 20);
    const minY = Math.max(0, Math.min(...ys, CANVAS_H) - 20);
    const maxX = Math.min(CANVAS_W, Math.max(...xs, 0) + 20);
    const maxY = Math.min(CANVAS_H, Math.max(...ys, 0) + 20);
    const w = Math.max(100, maxX - minX);
    const h = Math.max(100, maxY - minY);
    copy.setAttribute("viewBox", `${minX} ${minY} ${w} ${h}`);
    copy.setAttribute("width", String(w));
    copy.setAttribute("height", String(h));
    copy.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    const bg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    bg.setAttribute("x", String(minX));
    bg.setAttribute("y", String(minY));
    bg.setAttribute("width", String(w));
    bg.setAttribute("height", String(h));
    bg.setAttribute("style", `fill:${getComputedStyle(svg).getPropertyValue("background-color") || "#fff"}`);
    copy.insertBefore(bg, copy.firstChild);
    copy.querySelector(".wb-grid-bg")?.remove();
    return new XMLSerializer().serializeToString(copy);
  };

  const download = (blob: Blob, name: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const exportSvg = () => {
    const text = exportSvgText();
    if (text) download(new Blob([text], { type: "image/svg+xml" }), "diagram.svg");
  };

  const exportPng = () => {
    const text = exportSvgText();
    if (!text) return;
    const img = new Image();
    const url = URL.createObjectURL(new Blob([text], { type: "image/svg+xml" }));
    img.onload = () => {
      const scale = 2;
      const c = document.createElement("canvas");
      c.width = img.width * scale;
      c.height = img.height * scale;
      const ctx = c.getContext("2d");
      if (!ctx) return;
      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      c.toBlob((b) => b && download(b, "diagram.png"), "image/png");
    };
    img.src = url;
  };

  /* ---------- Render ---------- */

  const pools = board.nodes.filter((n) => n.kind === "pool");
  const shapes = board.nodes.filter((n) => n.kind !== "pool");
  const connectFrom = drag?.type === "connect" ? node(drag.from) : undefined;

  return (
    <div className="wb">
      <section className="intro">
        <h1>Whiteboard</h1>
        <p>
          Practise the diagrams interviewers ask for: insurance process maps, BPMN diagrams and swimlanes. Add shapes from the palette, drag them into place,
          and drag the round handle on a selected shape onto another shape to connect them. Your drawing is saved in this browser.
        </p>
        <div className="wb-start">
          <button className="btn primary wb-blank-btn" type="button" onClick={openBlank}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <rect x="3" y="4" width="18" height="14" rx="2" />
              <path d="M8 21h8M12 18v3M7 9h5M7 13h9" />
            </svg>
            Open a blank whiteboard
          </button>
          <button className="btn" type="button" onClick={() => setFocus(true)}>
            Continue my drawing full screen
          </button>
        </div>
      </section>

      <div className={`wb-stage${focus ? " focus" : ""}`} role={focus ? "dialog" : undefined} aria-modal={focus || undefined} aria-label={focus ? "Whiteboard" : undefined}>
      <div className="wb-toolbar">
        {focus && <b className="wb-stage-title">Whiteboard</b>}
        <select aria-label="Start from a template" value="" onChange={(e) => e.target.value && loadTemplate(e.target.value)}>
          <option value="">Start from a template…</option>
          {TEMPLATES.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        <div className="wb-group">
          <button className="btn small" type="button" onClick={undo} disabled={!past.current.length} title="Undo (Ctrl+Z)">
            Undo
          </button>
          <button className="btn small" type="button" onClick={redo} disabled={!future.current.length} title="Redo (Ctrl+Shift+Z)">
            Redo
          </button>
        </div>
        <div className="wb-group">
          <button className="btn small" type="button" onClick={() => setZoom((z) => Math.max(0.4, +(z - 0.1).toFixed(1)))} aria-label="Zoom out">
            −
          </button>
          <span className="wb-zoom">{Math.round(zoom * 100)}%</span>
          <button className="btn small" type="button" onClick={() => setZoom((z) => Math.min(1.6, +(z + 0.1).toFixed(1)))} aria-label="Zoom in">
            +
          </button>
        </div>
        <div className="wb-group" role="group" aria-label="New connector type">
          <button className="chip" type="button" aria-pressed={edgeKind === "seq"} onClick={() => setEdgeKind("seq")}>
            Sequence flow
          </button>
          <button className="chip" type="button" aria-pressed={edgeKind === "msg"} onClick={() => setEdgeKind("msg")}>
            Message flow
          </button>
        </div>
        <div className="wb-group wb-right">
          <button className="btn small" type="button" onClick={exportPng}>
            Download PNG
          </button>
          <button className="btn small" type="button" onClick={exportSvg}>
            Download SVG
          </button>
          <button
            className="btn small"
            type="button"
            onClick={() => {
              commit({ nodes: [], edges: [] });
              setSel(null);
            }}
          >
            Clear
          </button>
          {focus ? (
            <button className="btn small primary" type="button" onClick={() => setFocus(false)} title="Exit full screen (Esc)">
              Exit full screen
            </button>
          ) : (
            <button className="btn small" type="button" onClick={() => setFocus(true)}>
              Full screen
            </button>
          )}
        </div>
      </div>

      <div className="wb-layout">
        <aside className="wb-palette" aria-label="Shapes">
          {(["Insurance", "Flowchart", "BPMN"] as const).map((g) => (
            <div key={g} className="wb-pal-group">
              <h3>{g}</h3>
              <div className="wb-pal-items">
                {SHAPES.filter((s) => s.group === g).map((s) => (
                  <button key={s.kind} type="button" className="wb-pal-item" onClick={() => addShape(s.kind)} title={s.meaning}>
                    <svg viewBox="-4 -4 148 92" aria-hidden="true">
                      {s.kind === "pool" ? (
                        <Pool n={{ id: "p", kind: "pool", x: 0, y: 0, w: 140, h: 84, label: "", lanes: ["", ""] }} />
                      ) : (
                        <Shape n={{ id: "p", kind: s.kind, ...fitIcon(s.kind), label: "" }} />
                      )}
                    </svg>
                    <span>{s.name}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </aside>

        <div className="wb-canvas" ref={scrollRef}>
          <svg
            ref={svgRef}
            className={`wb-svg${drag?.type === "pan" ? " panning" : ""}`}
            viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
            width={CANVAS_W * zoom}
            height={CANVAS_H * zoom}
            onPointerDown={startPan}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
            role="application"
            aria-label="Drawing canvas"
          >
            <defs>
              <pattern id="wb-grid" width={20} height={20} patternUnits="userSpaceOnUse">
                <circle className="wb-dot" cx={1} cy={1} r={1} />
              </pattern>
              <marker id="wb-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
                <path className="wb-arrowhead" d="M0,0 L10,5 L0,10 z" />
              </marker>
              <marker id="wb-arrow-open" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="9" markerHeight="9" orient="auto-start-reverse">
                <path className="wb-arrowhead open" d="M1,1 L9,5 L1,9 z" />
              </marker>
              <marker id="wb-circle" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="7" markerHeight="7">
                <circle className="wb-arrowhead open" cx={5} cy={5} r={3.5} />
              </marker>
            </defs>
            <rect className="wb-grid-bg" width={CANVAS_W} height={CANVAS_H} fill="url(#wb-grid)" />

            {pools.map((n) => (
              <g key={n.id} data-node={n.id} className="wb-node" onPointerDown={(e) => startMove(e, n)}>
                <Pool n={n} />
              </g>
            ))}

            {board.edges.map((ed) => {
              const a = node(ed.from);
              const b = node(ed.to);
              if (!a || !b) return null;
              const [x1, y1, x2, y2] = edgePoints(a, b);
              const selected = sel?.type === "edge" && sel.id === ed.id;
              const mx = (x1 + x2) / 2;
              const my = (y1 + y2) / 2;
              return (
                <g
                  key={ed.id}
                  className={`wb-edge${selected ? " selected" : ""}`}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    setSel({ type: "edge", id: ed.id });
                  }}
                >
                  <line className="wb-edge-hit" x1={x1} y1={y1} x2={x2} y2={y2} />
                  <line
                    className={`wb-edge-line ${ed.kind}`}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    markerEnd={ed.kind === "msg" ? "url(#wb-arrow-open)" : "url(#wb-arrow)"}
                    markerStart={ed.kind === "msg" ? "url(#wb-circle)" : undefined}
                  />
                  {ed.label && (
                    <g>
                      <rect className="wb-edge-label-bg" x={mx - ed.label.length * 3.4 - 5} y={my - 10} width={ed.label.length * 6.8 + 10} height={18} rx={4} />
                      <text className="wb-text small" x={mx} y={my + 3} textAnchor="middle">
                        {ed.label}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

            {shapes.map((n) => (
              <g key={n.id} data-node={n.id} className="wb-node" onPointerDown={(e) => startMove(e, n)} onDoubleClick={() => document.getElementById("wb-label")?.focus()}>
                <Shape n={n} />
              </g>
            ))}

            {connectFrom && drag?.type === "connect" && (
              <line className="wb-edge-line seq wb-ui" x1={connectFrom.x + connectFrom.w / 2} y1={connectFrom.y + connectFrom.h / 2} x2={drag.x} y2={drag.y} markerEnd="url(#wb-arrow)" />
            )}

            {selNode && (
              <g className="wb-ui">
                <rect className="wb-sel" x={selNode.x - 5} y={selNode.y - 5} width={selNode.w + 10} height={selNode.h + 10} rx={6} />
                <rect className="wb-handle" x={selNode.x + selNode.w - 1} y={selNode.y + selNode.h - 1} width={12} height={12} rx={2} onPointerDown={(e) => startResize(e, selNode)}>
                  <title>Drag to resize</title>
                </rect>
                {selNode.kind !== "pool" && (
                  <circle className="wb-port" cx={selNode.x + selNode.w + 18} cy={selNode.y + selNode.h / 2} r={8} onPointerDown={(e) => startConnect(e, selNode)}>
                    <title>Drag onto another shape to connect</title>
                  </circle>
                )}
              </g>
            )}
          </svg>
        </div>

        <aside className={`wb-props${sel ? "" : " idle"}`} aria-label="Properties">
          {selNode ? (
            <div className="wb-prop-body">
              <h3>{SHAPE_BY_KIND[selNode.kind]?.name ?? "Shape"}</h3>
              <p className="muted small">{SHAPE_BY_KIND[selNode.kind]?.meaning}</p>
              <label className="wb-field">
                <span>{selNode.kind === "pool" ? "Pool name" : "Label"}</span>
                <textarea id="wb-label" rows={3} value={selNode.label} onChange={(e) => updateNode(selNode.id, { label: e.target.value })} />
              </label>
              {selNode.kind === "pool" && (
                <label className="wb-field">
                  <span>Lanes (one per line)</span>
                  <textarea
                    rows={4}
                    value={(selNode.lanes ?? []).join("\n")}
                    onChange={(e) => updateNode(selNode.id, { lanes: e.target.value.split("\n") })}
                  />
                </label>
              )}
              <div className="wb-prop-actions">
                <button className="btn small" type="button" onClick={duplicateSelected}>
                  Duplicate
                </button>
                <button className="btn small danger" type="button" onClick={removeSelected}>
                  Delete
                </button>
              </div>
            </div>
          ) : selEdge ? (
            <div className="wb-prop-body">
              <h3>Connector</h3>
              <p className="muted small">
                {node(selEdge.from)?.label || "Shape"} → {node(selEdge.to)?.label || "Shape"}
              </p>
              <label className="wb-field">
                <span>Label (for example Yes or No)</span>
                <input type="text" value={selEdge.label} onChange={(e) => updateEdge(selEdge.id, { label: e.target.value })} />
              </label>
              <div className="wb-field">
                <span>Type</span>
                <div className="wb-group">
                  <button className="chip" type="button" aria-pressed={selEdge.kind === "seq"} onClick={() => updateEdge(selEdge.id, { kind: "seq" })}>
                    Sequence
                  </button>
                  <button className="chip" type="button" aria-pressed={selEdge.kind === "msg"} onClick={() => updateEdge(selEdge.id, { kind: "msg" })}>
                    Message
                  </button>
                </div>
              </div>
              <div className="wb-prop-actions">
                <button className="btn small" type="button" onClick={() => updateEdge(selEdge.id, { from: selEdge.to, to: selEdge.from })}>
                  Reverse
                </button>
                <button className="btn small danger" type="button" onClick={removeSelected}>
                  Delete
                </button>
              </div>
            </div>
          ) : (
            <div className="wb-prop-body">
              <h3>How to use</h3>
              <ul className="wb-help">
                <li>Click a shape in the palette to add it.</li>
                <li>Drag shapes to move them; drag a pool to move everything in it.</li>
                <li>Select a shape, then drag its round handle onto another shape to connect them.</li>
                <li>Drag the square handle to resize.</li>
                <li>Drag empty space to move around the canvas.</li>
                <li>Delete removes, Ctrl+D duplicates, Ctrl+Z undoes.</li>
              </ul>
            </div>
          )}
        </aside>
      </div>
      </div>

      <section className="wb-guide">
        <h2>BPMN in five minutes</h2>
        <p className="lead">
          BPMN (Business Process Model and Notation) is the standard way to draw business processes. A swimlane diagram puts each step in the lane of the role
          that does it, so hand-offs between people, teams and systems are easy to see.
        </p>
        <div className="wb-guide-grid">
          {SHAPES.filter((s) => s.group === "BPMN").map((s) => (
            <div key={s.kind} className="wb-guide-item">
              <svg viewBox="-4 -4 148 92" aria-hidden="true">
                {s.kind === "pool" ? (
                  <Pool n={{ id: "p", kind: "pool", x: 0, y: 0, w: 140, h: 84, label: "", lanes: ["", ""] }} />
                ) : (
                  <Shape n={{ id: "p", kind: s.kind, ...fitIcon(s.kind), label: "" }} />
                )}
              </svg>
              <div>
                <b>{s.name}</b>
                <p>{s.meaning}</p>
              </div>
            </div>
          ))}
          <div className="wb-guide-item">
            <svg viewBox="0 0 140 84" aria-hidden="true">
              <line className="wb-edge-line seq" x1={10} y1={30} x2={128} y2={30} markerEnd="url(#wb-arrow)" />
              <line className="wb-edge-line msg" x1={10} y1={60} x2={128} y2={60} markerEnd="url(#wb-arrow-open)" markerStart="url(#wb-circle)" />
            </svg>
            <div>
              <b>Sequence and message flow</b>
              <p>Solid arrow: the order of steps within a pool. Dashed arrow: a message between separate pools or organisations.</p>
            </div>
          </div>
        </div>
        <h3>Tips for interviews</h3>
        <ul className="wb-tips">
          <li>Agree the scope first: where the process starts and ends, and which roles are involved. Those become your events and lanes.</li>
          <li>Name tasks as verb + noun ("Review pre-auth", "Pay garage") and label every gateway path.</li>
          <li>Show the unhappy paths an interviewer will ask about: declined claims, referrals, timeouts.</li>
          <li>Mark SLAs and system touchpoints with notes or timer events; that is where BA value shows.</li>
          <li>Keep it to one screen. If it grows, split it into sub-processes.</li>
        </ul>
      </section>
    </div>
  );
}

/** Size and position a shape to fit a palette icon */
function fitIcon(kind: Kind): { x: number; y: number; w: number; h: number } {
  const s = SHAPE_BY_KIND[kind];
  const scale = Math.min(130 / s.w, 70 / s.h, 1.4);
  const w = s.w * scale;
  const h = s.h * scale;
  return { x: (140 - w) / 2, y: (84 - h) / 2 - (LABEL_BELOW.includes(kind) ? 4 : 0), w, h };
}
