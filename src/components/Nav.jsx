import { useEffect, useRef, useState } from "react";
import { PROFILE, SECTIONS } from "../data/profile";
import { useApp } from "../context";
import { useActiveSection } from "../lib/hooks";
import Icon from "./Icon";

const SPY_IDS = ["top", ...SECTIONS.map(s => s.id)];

export function Brand({ className = "" }) {
  return (
    <a href="#top" className={`flex items-center gap-2.5 font-bold tracking-tight ${className}`} aria-label={`${PROFILE.name}, home`}>
      <span className="grid size-[34px] place-items-center rounded-[10px] bg-linear-135 from-a1 to-a2 font-mono text-[13px] font-bold text-[#04121a] shadow-[0_6px_20px_-6px_var(--glow)]">
        HK
      </span>
      <span className="text-sm leading-tight">
        {PROFILE.name}
        <small className="block text-[11px] font-medium tracking-[.06em] text-faint max-xs:text-xs">BACKEND ENGINEER</small>
      </span>
    </a>
  );
}

export default function Nav() {
  const { theme, toggleTheme, setPaletteOpen } = useApp();
  const active = useActiveSection(SPY_IDS);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const barRef = useRef(null);

  useEffect(() => {
    const onScroll = () => {
      const y = scrollY;
      setScrolled(y > 12);
      const max = document.documentElement.scrollHeight - innerHeight;
      if (barRef.current) barRef.current.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    };
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    return () => { removeEventListener("scroll", onScroll); removeEventListener("resize", onScroll); };
  }, []);

  useEffect(() => { document.body.classList.toggle("nav-lock", open); }, [open]);

  return (
    <>
      <div
        ref={barRef}
        className="no-print fixed inset-x-0 top-0 z-[120] h-0.5 origin-left scale-x-0 bg-linear-to-r from-a1 to-a2 shadow-[0_0_14px_var(--glow)]"
      />
      <header
        className={`fixed inset-x-0 top-0 z-[100] flex h-(--nav-h) items-center border-b transition-[background-color,border-color] duration-300 ${
          scrolled || open ? "border-line bg-bg/75 backdrop-blur-xl backdrop-saturate-150" : "border-transparent"
        }`}
      >
        <div className="wrap flex items-center justify-between gap-4">
          <Brand />

          <nav
            aria-label="Sections"
            className={`flex items-center gap-1 max-nav:fixed max-nav:inset-x-0 max-nav:top-(--nav-h) max-nav:flex-col max-nav:items-stretch max-nav:gap-0.5 max-nav:border-b max-nav:border-line max-nav:bg-elev max-nav:px-[18px] max-nav:pt-3.5 max-nav:pb-[22px] max-nav:transition-[translate,visibility] max-nav:duration-300 ${
              open ? "" : "max-nav:invisible max-nav:-translate-y-[120%]"
            }`}
          >
            {SECTIONS.map(s => {
              const on = active === s.id;
              return (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  onClick={() => setOpen(false)}
                  aria-current={on ? "true" : undefined}
                  className={`relative rounded-[10px] px-[13px] py-2 text-sm transition-colors hover:bg-surface hover:text-fg max-nav:px-3 max-nav:py-3.5 max-nav:text-base ${
                    on
                      ? "text-fg after:absolute after:bottom-0.5 after:left-[13px] after:right-[13px] after:h-0.5 after:rounded after:bg-linear-to-r after:from-a1 after:to-a2 max-nav:after:left-3 max-nav:after:right-auto max-nav:after:w-[22px]"
                      : "text-dim"
                  }`}
                >
                  {s.label}
                </a>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              aria-label="Open command palette"
              className="flex h-[38px] items-center gap-2 rounded-[11px] border border-line bg-surface px-3 text-[13px] text-faint transition hover:border-line-strong hover:text-fg max-nav:hidden"
            >
              <Icon name="search" size={14} /> Search <kbd>Ctrl K</kbd>
            </button>
            <button type="button" className="icon-btn" onClick={toggleTheme} aria-label="Toggle colour theme" title="Toggle theme">
              <Icon name={theme === "dark" ? "sun" : "moon"} />
            </button>
            <button
              type="button"
              className="icon-btn nav:hidden"
              onClick={() => setOpen(o => !o)}
              aria-label="Toggle menu"
              aria-expanded={open}
            >
              <Icon name={open ? "close" : "menu"} />
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
