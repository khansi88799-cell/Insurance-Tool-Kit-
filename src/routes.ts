/* URL scheme, page titles and descriptions. Shared by the client router and the build-time prerender. Pure data: no React. */
import { CATEGORIES, QUESTIONS, type Category } from "./data/interview";
import { MODULES } from "./data/learn";
import { PRODUCT_ORDER } from "./calc/products";
import type { ProductId } from "./calc/types";

/** Change this one value if the site moves to a custom domain */
export const SITE_URL = "https://insurance-tool-kit.pages.dev";
export const SITE_NAME = "Insurance Learning Desk";
export const OG_IMAGE = "/og-image.png";

export type TabId = "learn" | "interview" | "calculators" | "whiteboard";
export type LearnPage = "home" | "module" | "diagrams" | "plan" | "glossary";

export type Route =
  | { tab: "learn"; page: LearnPage; module?: string }
  | { tab: "interview"; category: Category | "All" }
  | { tab: "calculators"; product: ProductId }
  | { tab: "whiteboard" }
  | { tab: "notfound" };

export const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const CALC_SLUG: Record<ProductId, string> = {
  car: "car-insurance",
  tw: "two-wheeler-insurance",
  cv: "commercial-vehicle-insurance",
  health: "health-insurance",
  life: "term-life-insurance",
};

export const paths = {
  home: "/",
  module: (id: string) => `/learn/${id}`,
  topic: (moduleId: string, topicId: string) => `/learn/${moduleId}#t-${moduleId}-${topicId}`,
  diagrams: "/learn/diagrams",
  diagram: (id: string) => `/learn/diagrams#d-${id}`,
  plan: "/learn/study-plan",
  week: (n: number) => `/learn/study-plan#week-${n}`,
  glossary: "/learn/glossary",
  interview: (cat?: Category | "All") => (cat && cat !== "All" ? `/interview/${slug(cat)}` : "/interview"),
  calc: (p: ProductId) => `/calculators/${CALC_SLUG[p]}`,
  calculators: "/calculators",
  whiteboard: "/whiteboard",
  blankWhiteboard: "/whiteboard?start=blank",
};

const LEARN_PAGES: Record<string, LearnPage> = { diagrams: "diagrams", "study-plan": "plan", glossary: "glossary" };

export function parseRoute(pathname: string): Route {
  const parts = pathname.replace(/\/+$/, "").split("/").filter(Boolean);
  const [tab, sub, extra] = parts;
  if (extra) return { tab: "notfound" };
  if (!tab) return { tab: "learn", page: "home" };
  if (tab === "learn") {
    if (!sub) return { tab: "learn", page: "home" };
    if (LEARN_PAGES[sub]) return { tab: "learn", page: LEARN_PAGES[sub] };
    if (MODULES.some((m) => m.id === sub)) return { tab: "learn", page: "module", module: sub };
  }
  if (tab === "interview") {
    if (!sub) return { tab: "interview", category: "All" };
    const cat = CATEGORIES.find((c) => slug(c) === sub);
    if (cat) return { tab: "interview", category: cat };
  }
  if (tab === "calculators") {
    if (!sub) return { tab: "calculators", product: "car" };
    const p = PRODUCT_ORDER.find((id) => CALC_SLUG[id] === sub);
    if (p) return { tab: "calculators", product: p };
  }
  if (tab === "whiteboard" && !sub) return { tab: "whiteboard" };
  return { tab: "notfound" };
}

/** Old #tab/sub links (before real URLs) mapped to their new path, or null */
export function legacyHashPath(hash: string): string | null {
  const m = hash.match(/^#(learn|interview|calculators|whiteboard)(?:\/(.*))?$/);
  if (!m) return null;
  const [, tab, sub = ""] = m;
  if (tab === "learn") return sub.startsWith("d-") ? paths.diagram(sub.slice(2)) : paths.home;
  if (tab === "interview") {
    let c = sub;
    try {
      c = decodeURIComponent(sub);
    } catch {
      /* malformed hash */
    }
    return paths.interview(CATEGORIES.find((x) => x === c));
  }
  if (tab === "calculators") return (PRODUCT_ORDER as string[]).includes(sub) ? paths.calc(sub as ProductId) : paths.calculators;
  return sub === "blank" ? paths.blankWhiteboard : paths.whiteboard;
}

export interface PageMeta {
  title: string;
  description: string;
  /** Preferred URL for this content; differs from the path for duplicates such as /calculators */
  canonical: string;
}

const CALC_META: Record<ProductId, [string, string]> = {
  car: [
    "Car insurance premium calculator (India)",
    "Work out a private car insurance premium step by step: IDV, own damage, NCB, third-party rates from the 2022 Rules, add-ons and GST, with every formula shown.",
  ],
  tw: [
    "Two-wheeler insurance premium calculator (India)",
    "Calculate a bike or scooter insurance premium step by step: IDV, own damage, NCB, third-party rates, add-ons and 18% GST, with every formula shown.",
  ],
  cv: [
    "Commercial vehicle insurance premium calculator (India)",
    "Goods carriers, taxis, buses and special vehicles: own damage, third-party slabs, passenger cover and split GST, calculated step by step.",
  ],
  health: [
    "Health insurance premium calculator (illustrative model)",
    "See how a health insurance premium is built: age bands, family floater factors, zone, sum insured, co-pay and loadings. An illustrative model for learning.",
  ],
  life: [
    "Term life insurance premium calculator (illustrative model)",
    "See how a term life premium is built from age, sum assured, policy term, smoking status and riders. An illustrative model for learning.",
  ],
};

/** Trim to a search-snippet length, at a sentence end when there is one, otherwise at a word */
function clip(s: string, n = 158) {
  if (s.length <= n) return s;
  const cut = s.slice(0, n);
  const end = cut.lastIndexOf(". ");
  return end > 80 ? cut.slice(0, end + 1) : `${cut.slice(0, n - 1).replace(/\s+\S*$/, "")}…`;
}

export function routeMeta(route: Route, pathname: string): PageMeta {
  const at = (title: string, description: string, canonical = pathname): PageMeta => ({ title: `${title} | ${SITE_NAME}`, description: clip(description), canonical });
  switch (route.tab) {
    case "learn": {
      if (route.page === "home")
        return {
          title: `${SITE_NAME}: Indian insurance guide, from beginner to pro`,
          description:
            "Learn Indian insurance from basics to expert: motor, health and life, IRDAI rules for 2026, interview questions, premium calculators and BPMN diagrams.",
          canonical: paths.home,
        };
      if (route.page === "module") {
        const m = MODULES.find((x) => x.id === route.module)!;
        return at(m.title, `Module ${m.number}: ${m.summary} ${m.context}`);
      }
      if (route.page === "diagrams")
        return at(
          "Insurance process diagrams and BPMN swimlanes",
          "Nine reference diagrams for insurance BAs: quote to policy, parties and money flows, premium build-up, motor and cashless health claim swimlanes, reinsurance and data model.",
        );
      if (route.page === "plan")
        return at(
          "Eight-week insurance study plan for beginners",
          "A week-by-week plan to learn Indian insurance in about eight weeks: topics to read, calculators and interview questions to practise, and an output to show for each week.",
        );
      return at("Insurance glossary: key terms explained", "Plain-English definitions of Indian insurance terms such as IDV, NCB, TPA, moratorium, STP and combined ratio, plus the sources used on this site.");
    }
    case "interview": {
      if (route.category === "All")
        return at(
          "Insurance interview questions and answers (2026)",
          `${QUESTIONS.length} insurance interview questions with model answers and worked examples: motor, health, life, regulation, calculations, BPMN diagrams, SQL and behavioural.`,
        );
      const n = QUESTIONS.filter((q) => q.cat === route.category).length;
      return at(
        `${route.category} interview questions for insurance roles`,
        `${n} ${route.category.toLowerCase()} interview questions for insurance BAs and analysts, with model answers and worked examples, updated for Indian rules in 2026.`,
      );
    }
    case "calculators": {
      const [title, description] = CALC_META[route.product];
      return at(title, description, paths.calc(route.product));
    }
    case "whiteboard":
      return at(
        "Insurance and BPMN swimlane whiteboard",
        "Draw insurance process diagrams in your browser: BPMN pools and swimlanes, flowchart shapes and insurance icons, with ready-made claim templates and PNG or SVG export.",
      );
    default:
      return { title: `Page not found | ${SITE_NAME}`, description: "This page does not exist. Go back to the Insurance Learning Desk home page.", canonical: pathname };
  }
}

/** Every page to prerender. The sitemap lists only the ones that are their own canonical URL. */
export function allPaths(): string[] {
  return [
    paths.home,
    ...MODULES.map((m) => paths.module(m.id)),
    paths.diagrams,
    paths.plan,
    paths.glossary,
    paths.interview(),
    ...CATEGORIES.map((c) => paths.interview(c)),
    paths.calculators,
    ...PRODUCT_ORDER.map((p) => paths.calc(p)),
    paths.whiteboard,
  ];
}
