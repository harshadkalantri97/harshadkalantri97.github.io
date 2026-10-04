import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { PROFILE } from "./data/profile";
import { useReducedMotion } from "./lib/hooks";

const AppCtx = createContext(null);
export const useApp = () => useContext(AppCtx);

const read = key => { try { return localStorage.getItem(key); } catch { return null; } };
const write = (key, val) => { try { localStorage.setItem(key, val); } catch { /* private mode */ } };

export function AppProvider({ children }) {
  const reduced = useReducedMotion();
  // index.html sets data-theme before first paint, so there is no flash of the wrong theme
  const [theme, setThemeState] = useState(() => document.documentElement.dataset.theme || "dark");
  const [cursorOn, setCursorOn] = useState(() => read("hk-cursor") !== "off");
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [termOpen, setTermOpen] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);
  const copyTimer = useRef(0);

  useEffect(() => {
    document.body.classList.toggle("lock", paletteOpen || termOpen);
  }, [paletteOpen, termOpen]);

  // the attribute changes first, so effects that read CSS tokens after this render see the new theme
  const setTheme = useCallback(t => {
    document.documentElement.dataset.theme = t;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", t === "dark" ? "#06070b" : "#f7f8fc");
    setThemeState(t);
    write("hk-theme", t);
  }, []);
  const toggleTheme = useCallback(() => setTheme(theme === "dark" ? "light" : "dark"), [theme, setTheme]);
  const toggleCursor = useCallback(() => {
    write("hk-cursor", cursorOn ? "off" : "on");
    setCursorOn(!cursorOn);
  }, [cursorOn]);

  const goTo = useCallback(id => {
    document.getElementById(id)?.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
  }, [reduced]);

  const downloadResume = useCallback(() => {
    const a = document.createElement("a");
    a.href = PROFILE.resume;
    a.download = PROFILE.resumeName;
    a.click();
  }, []);

  const copyEmail = useCallback(async () => {
    try { await navigator.clipboard.writeText(PROFILE.email); }
    catch { location.href = "mailto:" + PROFILE.email; return; }
    setEmailCopied(true);
    clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setEmailCopied(false), 1600);
  }, []);

  // Ctrl/Cmd+K toggles the palette; the backtick key opens the terminal
  useEffect(() => {
    const onKey = e => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (!termOpen) setPaletteOpen(o => !o);
        return;
      }
      if (termOpen || paletteOpen) return;
      const tag = (e.target.tagName || "").toLowerCase();
      const typing = tag === "input" || tag === "textarea" || tag === "select" || e.target.isContentEditable;
      if (e.key === "`" && !typing && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        setTermOpen(true);
      }
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [termOpen, paletteOpen]);

  const value = useMemo(() => ({
    reduced, theme, setTheme, toggleTheme, cursorOn, toggleCursor,
    paletteOpen, setPaletteOpen, termOpen, setTermOpen,
    goTo, downloadResume, copyEmail, emailCopied,
  }), [reduced, theme, setTheme, toggleTheme, cursorOn, toggleCursor, paletteOpen, termOpen, goTo, downloadResume, copyEmail, emailCopied]);

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}
