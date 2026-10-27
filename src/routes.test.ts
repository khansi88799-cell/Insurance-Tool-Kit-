import { describe, expect, it } from "vitest";
import { allPaths, legacyHashPath, parseRoute, paths, routeMeta } from "./routes";

describe("routes", () => {
  it("every prerendered path is a real page with its own title", () => {
    const titles = new Set<string>();
    for (const p of allPaths()) {
      const route = parseRoute(p);
      expect(route.tab, p).not.toBe("notfound");
      titles.add(routeMeta(route, p).title);
    }
    // /calculators shows the car calculator, so it shares that page's title (and points its canonical there)
    expect(titles.size).toBe(allPaths().length - 1);
    expect(routeMeta(parseRoute(paths.calculators), paths.calculators).canonical).toBe(paths.calc("car"));
  });

  it("descriptions fit a search snippet", () => {
    for (const p of allPaths()) expect(routeMeta(parseRoute(p), p).description.length, p).toBeLessThanOrEqual(160);
  });

  it("unknown paths are not found", () => {
    for (const p of ["/nope", "/learn/nope", "/interview/nope", "/calculators/bike", "/learn/motor/extra", "/whiteboard/blank"])
      expect(parseRoute(p).tab, p).toBe("notfound");
  });

  it("parses trailing slashes and categories", () => {
    expect(parseRoute("/learn/motor/")).toEqual({ tab: "learn", page: "module", module: "motor" });
    expect(parseRoute("/interview/data-and-sql")).toEqual({ tab: "interview", category: "Data and SQL" });
    expect(parseRoute("/interview/regulation-2025-26")).toEqual({ tab: "interview", category: "Regulation 2025–26" });
  });

  it("maps old #tab links to the new paths", () => {
    expect(legacyHashPath("#learn")).toBe("/");
    expect(legacyHashPath("#learn/d-cashless")).toBe("/learn/diagrams#d-cashless");
    expect(legacyHashPath("#interview/Data%20and%20SQL")).toBe("/interview/data-and-sql");
    expect(legacyHashPath("#interview")).toBe("/interview");
    expect(legacyHashPath("#calculators/tw")).toBe("/calculators/two-wheeler-insurance");
    expect(legacyHashPath("#calculators")).toBe("/calculators");
    expect(legacyHashPath("#whiteboard/blank")).toBe("/whiteboard?start=blank");
    expect(legacyHashPath("#t-motor-premium")).toBeNull();
  });
});
