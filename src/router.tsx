import { createContext, useCallback, useContext, useEffect, useState, type AnchorHTMLAttributes, type ReactNode } from "react";

export interface Loc {
  pathname: string;
  search: string;
  hash: string;
}

interface State extends Loc {
  /** What to do with the scroll position once the new page has rendered */
  scroll: "top" | "hash" | "none";
  /** Bumped on every navigation so a repeat click on the same link still scrolls */
  n: number;
}

interface Router {
  loc: Loc;
  navigate: (to: string, opts?: { replace?: boolean; scroll?: boolean }) => void;
}

const RouterContext = createContext<Router>({ loc: { pathname: "/", search: "", hash: "" }, navigate: () => {} });

export const useRouter = () => useContext(RouterContext);

/** Scroll to an element and briefly highlight it */
export function jumpTo(id: string, smooth = true) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: smooth ? "smooth" : "instant", block: "start" });
  el.classList.add("flash");
  setTimeout(() => el.classList.remove("flash"), 1600);
}

const current = (): Loc => ({ pathname: window.location.pathname, search: window.location.search, hash: window.location.hash });

/** History API router. On the server, pass `initial` and navigation does nothing. */
export function RouterProvider({ initial, children }: { initial?: Loc; children: ReactNode }) {
  const [state, setState] = useState<State>(() => ({ ...(initial ?? current()), scroll: "hash", n: 0 }));

  useEffect(() => {
    // The browser restores the scroll position itself on Back and Forward
    const onPop = () => setState((s) => ({ ...current(), scroll: "none", n: s.n + 1 }));
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    if (state.scroll === "hash" && state.hash) {
      // On first load the browser can still be settling its own scroll position, which cancels a smooth scroll
      const t = setTimeout(() => jumpTo(decodeURIComponent(state.hash.slice(1)), state.n > 0), 50);
      return () => clearTimeout(t);
    }
    if (state.scroll === "top" || (state.scroll === "hash" && state.n > 0)) window.scrollTo({ top: 0 });
  }, [state.n, state.scroll, state.hash]);

  const navigate = useCallback((to: string, { replace = false, scroll = true }: { replace?: boolean; scroll?: boolean } = {}) => {
    const url = new URL(to, window.location.href);
    window.history[replace ? "replaceState" : "pushState"](null, "", url);
    setState((s) => ({ ...current(), scroll: !scroll ? "none" : url.hash ? "hash" : "top", n: s.n + 1 }));
  }, []);

  const { pathname, search, hash } = state;
  return <RouterContext.Provider value={{ loc: { pathname, search, hash }, navigate }}>{children}</RouterContext.Provider>;
}

/** A real link (crawlable, opens in a new tab with Cmd/Ctrl) that navigates in place on a plain click */
export function Link({ to, onClick, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }) {
  const { navigate } = useRouter();
  return (
    <a
      href={to}
      {...rest}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        navigate(to);
      }}
    />
  );
}
