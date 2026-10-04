import { useEffect, useState, useSyncExternalStore } from "react";

export function useMedia(query) {
  return useSyncExternalStore(
    cb => {
      const m = matchMedia(query);
      m.addEventListener("change", cb);
      return () => m.removeEventListener("change", cb);
    },
    () => matchMedia(query).matches,
    () => false,
  );
}

export const useReducedMotion = () => useMedia("(prefers-reduced-motion: reduce)");

// one shared observer for every reveal on the page, instead of one per element
let revealIO = null;
const revealCbs = new Map();
function observeOnce(el, cb) {
  if (!("IntersectionObserver" in window)) { cb(); return () => {}; }
  revealIO ||= new IntersectionObserver(entries => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      revealIO.unobserve(e.target);
      revealCbs.get(e.target)?.();
      revealCbs.delete(e.target);
    }
  }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
  revealCbs.set(el, cb);
  revealIO.observe(el);
  return () => { revealIO.unobserve(el); revealCbs.delete(el); };
}

export function useReveal(ref) {
  const [shown, setShown] = useState(false);
  useEffect(() => (ref.current ? observeOnce(ref.current, () => setShown(true)) : undefined), [ref]);
  return shown;
}

export function useInView(ref, { threshold = 0, rootMargin = "0px" } = {}) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setInView(true); io.disconnect(); }
    }, { threshold, rootMargin });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, threshold, rootMargin]);
  return inView;
}

// the hero is observed too, so scrolling back to the top clears the highlight
export function useActiveSection(ids) {
  const [active, setActive] = useState("top");
  useEffect(() => {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id); });
    }, { rootMargin: "-45% 0px -50% 0px" });
    ids.forEach(id => { const el = document.getElementById(id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, [ids]);
  return active;
}
