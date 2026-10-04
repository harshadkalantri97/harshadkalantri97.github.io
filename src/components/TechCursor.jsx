import { useEffect, useRef } from "react";
import { useApp } from "../context";
import { useMedia } from "../lib/hooks";

// what counts as clickable, and where the native text caret should take over
const HOT = "a[href],button,select,summary,[role=tab],[role=option]";
const TEXT = 'input:not([type=checkbox]):not([type=radio]):not([type=submit]):not([type=button]),textarea,[contenteditable="true"]';
const NOISE = "!<>-_/[]{}=+*^?#$%&@~:;|";
const FALLBACK = "</>";

/* A dot sits exactly under the pointer, and a small tag trails it showing a tech symbol:
   each section names its own (data-cursor), a control can name one too, any other
   control reads as a call "()". The symbol re-decodes whenever it changes, so scrolling
   into a new section visibly swaps it. Mouse only: touch, pens and reduced motion keep
   the normal pointer. */
export default function TechCursor() {
  const { cursorOn, reduced } = useApp();
  const fine = useMedia("(hover: hover) and (pointer: fine)");
  const enabled = cursorOn && fine && !reduced;
  const rootRef = useRef(null);
  const dotRef = useRef(null);
  const tagRef = useRef(null);
  const symRef = useRef(null);

  useEffect(() => {
    if (!enabled) return;
    const html = document.documentElement;
    const root = rootRef.current, dot = dotRef.current, tag = tagRef.current, sym = symRef.current;
    let x = 0, y = 0, tx = 0, ty = 0, shown = false, current = "";
    let loopRaf = 0, decodeRaf = 0, inspectRaf = 0, rollTimer = 0;
    html.classList.add("tc-on");

    const decode = target => {
      if (target === current) return;
      current = target;
      cancelAnimationFrame(decodeRaf);
      const start = performance.now();
      const step = now => {
        const p = Math.min((now - start) / 260, 1);
        const fixed = Math.floor(p * target.length);
        let txt = target.slice(0, fixed);
        for (let i = fixed; i < target.length; i++) txt += target[i] === " " ? " " : NOISE[(Math.random() * NOISE.length) | 0];
        sym.textContent = txt;
        if (p < 1) decodeRaf = requestAnimationFrame(step);
      };
      decodeRaf = requestAnimationFrame(step);
    };

    const inspect = () => {
      inspectRaf = 0;
      const el = document.elementFromPoint(x, y);
      if (!el) return;
      const text = !!el.closest(TEXT);
      const hot = !text && el.closest(HOT);
      root.classList.toggle("text", text);
      root.classList.toggle("hot", !!hot);
      decode(hot ? hot.dataset.cursor || "()" : el.closest("[data-cursor]")?.dataset.cursor || FALLBACK);
    };
    const queueInspect = () => { if (!inspectRaf) inspectRaf = requestAnimationFrame(inspect); };

    // the tag eases toward the pointer and the loop stops once it has caught up
    const follow = () => {
      tx += (x - tx) * 0.22;
      ty += (y - ty) * 0.22;
      tag.style.transform = `translate3d(${tx}px,${ty}px,0)`;
      loopRaf = Math.abs(x - tx) + Math.abs(y - ty) > 0.2 ? requestAnimationFrame(follow) : 0;
    };

    const hide = () => { shown = false; root.classList.remove("show"); };
    const onMove = e => {
      if (e.pointerType && e.pointerType !== "mouse") { hide(); return; }
      x = e.clientX; y = e.clientY;
      dot.style.transform = `translate3d(${x}px,${y}px,0)`;
      if (!shown) { shown = true; tx = x; ty = y; root.classList.add("show"); }
      if (!loopRaf) loopRaf = requestAnimationFrame(follow);
      queueInspect();
    };
    const onDown = () => root.classList.add("down");
    const onUp = () => { root.classList.remove("down"); queueInspect(); };
    const onOut = e => { if (!e.relatedTarget) hide(); };
    const onScroll = () => {
      if (!shown) return;
      queueInspect();
      root.classList.add("roll");
      clearTimeout(rollTimer);
      rollTimer = setTimeout(() => root.classList.remove("roll"), 180);
    };

    addEventListener("pointermove", onMove, { passive: true });
    addEventListener("pointerdown", onDown, { passive: true });
    addEventListener("pointerup", onUp, { passive: true });
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("blur", hide);
    document.addEventListener("mouseout", onOut);
    return () => {
      html.classList.remove("tc-on");
      cancelAnimationFrame(loopRaf);
      cancelAnimationFrame(decodeRaf);
      cancelAnimationFrame(inspectRaf);
      clearTimeout(rollTimer);
      removeEventListener("pointermove", onMove);
      removeEventListener("pointerdown", onDown);
      removeEventListener("pointerup", onUp);
      removeEventListener("scroll", onScroll);
      removeEventListener("blur", hide);
      document.removeEventListener("mouseout", onOut);
    };
  }, [enabled]);

  if (!enabled) return null;
  return (
    <div ref={rootRef} className="tc" aria-hidden="true">
      <div ref={tagRef} className="tc-p"><span className="tc-tag"><span ref={symRef} /></span></div>
      <div ref={dotRef} className="tc-p"><span className="tc-dot" /></div>
    </div>
  );
}
