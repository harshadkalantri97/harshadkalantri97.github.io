import { useEffect, useRef } from "react";
import { useApp } from "../context";

// drifting node network behind the hero; nodes lean away from the pointer
export default function ParticleNet() {
  const ref = useRef(null);
  const colRef = useRef("#22d3ee");
  const { reduced, theme } = useApp();

  // the theme flips data-theme before React re-renders, so the new accent is readable here
  useEffect(() => {
    colRef.current = getComputedStyle(document.documentElement).getPropertyValue("--a1").trim() || "#22d3ee";
  }, [theme]);

  useEffect(() => {
    const cv = ref.current;
    if (!cv || reduced) return;
    const ctx = cv.getContext("2d", { alpha: true });
    let w = 0, h = 0, pts = [], raf = 0, running = true;
    const pointer = { x: -9999, y: -9999 };

    const sizeUp = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      const r = cv.getBoundingClientRect();
      w = r.width; h = r.height;
      cv.width = w * dpr; cv.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.min(72, Math.max(26, Math.round((w * h) / 22000)));
      pts = Array.from({ length: n }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.28, vy: (Math.random() - 0.5) * 0.28,
        r: Math.random() * 1.6 + 0.7,
      }));
    };

    const draw = () => {
      if (!running) return;
      const col = colRef.current;
      ctx.clearRect(0, 0, w, h);
      for (const p of pts) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        const dx = p.x - pointer.x, dy = p.y - pointer.y, d2 = dx * dx + dy * dy;
        if (d2 < 16000 && d2 > 1) { const f = 0.35 / Math.sqrt(d2); p.x += dx * f; p.y += dy * f; }
      }
      ctx.lineWidth = 1;
      ctx.strokeStyle = col;
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
          if (d > 132) continue;
          ctx.globalAlpha = (1 - d / 132) * 0.22;
          ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y); ctx.stroke();
        }
      }
      ctx.globalAlpha = 0.75;
      ctx.fillStyle = col;
      for (const p of pts) { ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill(); }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };
    const restart = () => { cancelAnimationFrame(raf); if (running) draw(); };

    const onResize = () => { sizeUp(); restart(); };
    const onMove = e => { pointer.x = e.clientX; pointer.y = e.clientY - cv.getBoundingClientRect().top; };
    // pause offscreen and in hidden tabs: saves battery
    let visible = true;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; running = visible && !document.hidden; restart(); });
    const onVis = () => { running = visible && !document.hidden; restart(); };

    sizeUp(); draw();
    io.observe(cv);
    addEventListener("resize", onResize);
    addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("visibilitychange", onVis);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      removeEventListener("resize", onResize);
      removeEventListener("pointermove", onMove);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [reduced]);

  return <canvas ref={ref} aria-hidden="true" className="absolute inset-0 size-full opacity-55" />;
}
