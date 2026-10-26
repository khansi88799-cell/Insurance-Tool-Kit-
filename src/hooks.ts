import { useEffect, useState } from "react";

/** State persisted in localStorage. Falls back to memory when storage is blocked. */
export function useStoredState<T>(key: string, initial: T | (() => T)) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw !== null) return JSON.parse(raw) as T;
    } catch {
      /* storage unavailable */
    }
    return typeof initial === "function" ? (initial as () => T)() : initial;
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* storage unavailable */
    }
  }, [key, value]);

  return [value, setValue] as const;
}

export type TabId = "learn" | "interview" | "calculators";
const TABS: TabId[] = ["learn", "interview", "calculators"];

/** Current tab from the URL hash, e.g. #calculators or #calculators/health */
export function useHashTab(): [TabId, string, (tab: TabId, sub?: string) => void] {
  const read = (): [TabId, string] => {
    const [t, sub = ""] = window.location.hash.replace(/^#/, "").split("/");
    return [TABS.includes(t as TabId) ? (t as TabId) : "learn", sub];
  };
  const [state, setState] = useState(read);

  useEffect(() => {
    const onHash = () => setState(read());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const go = (tab: TabId, sub?: string) => {
    window.location.hash = sub ? `${tab}/${sub}` : tab;
    window.scrollTo({ top: 0 });
  };
  return [state[0], state[1], go];
}
