import { useEffect, useMemo, useRef, useState } from "react";
import { PROFILE, SECTIONS } from "../data/profile";
import { useApp } from "../context";
import { useMedia } from "../lib/hooks";

const LABELS = { playground: "JSON playground", projects: "Academic projects" };
const GLYPH = { section: "#", link: "@", action: ">" };

export default function CommandPalette() {
  const {
    paletteOpen: open, setPaletteOpen, setTermOpen, goTo, downloadResume, copyEmail,
    toggleTheme, cursorOn, toggleCursor,
  } = useApp();
  const fine = useMedia("(hover: hover) and (pointer: fine)");
  const [q, setQ] = useState("");
  const [cur, setCur] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const lastFocus = useRef(null);

  const cmds = useMemo(() => {
    const go = SECTIONS.map(s => ({ t: LABELS[s.id] || s.label, h: "section", run: () => goTo(s.id) }));
    const ext = href => () => window.open(href, "_blank", "noopener");
    return [
      ...go.slice(0, 5),
      { t: "Open terminal", h: "action", run: () => setTermOpen(true) },
      ...go.slice(5),
      { t: "Download resume", h: "action", run: downloadResume },
      { t: "Copy email", h: "action", run: copyEmail },
      { t: "Email Harshad", h: "action", run: () => { location.href = "mailto:" + PROFILE.email; } },
      { t: "Verify certification", h: "link", run: ext(PROFILE.cert) },
      { t: "Open GitHub", h: "link", run: ext(PROFILE.github) },
      { t: "Open LinkedIn", h: "link", run: ext(PROFILE.linkedin) },
      { t: "Toggle theme", h: "action", run: toggleTheme },
      ...(fine ? [{ t: cursorOn ? "Turn off tech cursor" : "Turn on tech cursor", h: "action", run: toggleCursor }] : []),
      { t: "Print this page", h: "action", run: () => print() },
    ];
  }, [goTo, setTermOpen, downloadResume, copyEmail, toggleTheme, fine, cursorOn, toggleCursor]);

  const needle = q.trim().toLowerCase();
  const shown = cmds.filter(c => c.t.toLowerCase().includes(needle) || c.h.includes(needle));

  useEffect(() => {
    if (!open) return;
    lastFocus.current = document.activeElement;
    inputRef.current?.focus();
    setQ("");
    setCur(0);
    return () => lastFocus.current?.focus?.({ preventScroll: true });
  }, [open]);

  useEffect(() => {
    listRef.current?.children[cur]?.scrollIntoView({ block: "nearest" });
  }, [cur]);

  if (!open) return null;

  const close = () => setPaletteOpen(false);
  const runAt = i => {
    const c = shown[i];
    if (!c) return;
    close();
    setTimeout(c.run, 60);
  };
  const onKeyDown = e => {
    if (e.key === "Escape") { e.preventDefault(); close(); }
    else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (shown.length) setCur(c => (c + (e.key === "ArrowDown" ? 1 : -1) + shown.length) % shown.length);
    } else if (e.key === "Enter") { e.preventDefault(); runAt(cur); }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      data-cursor="^K"
      className="no-print fixed inset-0 z-[200] flex items-start justify-center px-[18px] pt-[14vh] pb-[18px]"
    >
      <div className="absolute inset-0 animate-[fade_.2s_ease] bg-[rgba(2,4,10,.66)] backdrop-blur-sm" onClick={close} />
      <div className="relative w-full max-w-[580px] animate-[pop_.22s_cubic-bezier(.2,.8,.3,1)] overflow-hidden rounded-[18px] border border-line-strong bg-elev shadow-[0_40px_100px_-30px_rgba(0,0,0,.8)]">
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded="true"
          aria-controls="cmd-list"
          aria-activedescendant={shown.length ? `cmd-${cur}` : undefined}
          value={q}
          onChange={e => { setQ(e.target.value); setCur(0); }}
          onKeyDown={onKeyDown}
          placeholder="Jump to a section or run a command..."
          autoComplete="off"
          spellCheck={false}
          className="w-full border-b border-line bg-transparent px-5 py-[18px] text-base text-fg outline-none placeholder:text-faint"
        />
        <ul id="cmd-list" ref={listRef} role="listbox" className="max-h-[320px] overflow-auto p-2">
          {shown.length ? (
            shown.map((c, i) => (
              <li
                key={c.t}
                id={`cmd-${i}`}
                role="option"
                aria-selected={i === cur}
                onClick={() => runAt(i)}
                onMouseMove={() => i !== cur && setCur(i)}
                className={`flex cursor-pointer items-center gap-[13px] rounded-[11px] px-3.5 py-3 text-[14.5px] ${i === cur ? "bg-surface-2" : ""}`}
              >
                <span className="grid size-7 flex-none place-items-center rounded-lg bg-surface-2 font-mono text-a1">{GLYPH[c.h]}</span>
                {c.t}
                <small className="ml-auto font-mono text-[11.5px] text-faint">{c.h}</small>
              </li>
            ))
          ) : (
            <li className="py-3 text-center text-faint">No matches</li>
          )}
        </ul>
      </div>
    </div>
  );
}
