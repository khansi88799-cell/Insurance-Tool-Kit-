import { useEffect, useRef, useState } from "react";

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

export type TabId = "learn" | "interview" | "calculators" | "whiteboard";
const TABS: TabId[] = ["learn", "interview", "calculators", "whiteboard"];

/** Current tab from the URL hash, e.g. #calculators or #calculators/health */
export function useHashTab(): [TabId, string, (tab: TabId, sub?: string) => void] {
  const read = (): [TabId, string] => {
    const [t, sub = ""] = window.location.hash.replace(/^#/, "").split("/");
    return [TABS.includes(t as TabId) ? (t as TabId) : "learn", sub];
  };
  const [state, setState] = useState(read);
  // The listener is registered once, so it reads through a ref to always use the latest tab list
  const readRef = useRef(read);
  readRef.current = read;

  useEffect(() => {
    const onHash = () => setState(readRef.current());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const go = (tab: TabId, sub?: string) => {
    window.location.hash = sub ? `${tab}/${sub}` : tab;
    // Update directly too: no hashchange fires when the hash is already this value
    setState([tab, sub ?? ""]);
    window.scrollTo({ top: 0 });
  };
  return [state[0], state[1], go];
}
