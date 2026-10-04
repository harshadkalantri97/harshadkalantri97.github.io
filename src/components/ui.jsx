import { useRef } from "react";
import { useMedia, useReveal } from "../lib/hooks";
import { useApp } from "../context";

// "**bold**" markers in the data become <b>
export function Rich({ text }) {
  return text.split(/\*\*(.+?)\*\*/g).map((part, i) =>
    i % 2 ? <b key={i} className="font-semibold text-fg">{part}</b> : part,
  );
}

export function Reveal({ as: Tag = "div", delay = 0, className = "", style, children, ...rest }) {
  const ref = useRef(null);
  const shown = useReveal(ref);
  return (
    <Tag
      ref={ref}
      className={`reveal${shown ? " in" : ""} ${className}`}
      style={delay ? { "--d": `${delay}s`, ...style } : style}
      {...rest}
    >
      {children}
    </Tag>
  );
}

// glass card: pointer spotlight always, 3D tilt when asked for on hover-capable screens
export function Card({ as: Tag = "div", tilt = false, delay = 0, className = "", style, children, ...rest }) {
  const ref = useRef(null);
  const shown = useReveal(ref);
  const { reduced } = useApp();
  const canHover = useMedia("(hover: hover)");

  const onPointerMove = e => {
    const el = ref.current;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    el.style.setProperty("--mx", x + "px");
    el.style.setProperty("--my", y + "px");
    if (tilt && canHover && !reduced) {
      const rx = (y / r.height - 0.5) * -5, ry = (x / r.width - 0.5) * 5;
      el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
    }
  };
  const onPointerLeave = () => { ref.current.style.transform = ""; };

  return (
    <Tag
      ref={ref}
      className={`card reveal${shown ? " in" : ""} ${className}`}
      style={delay ? { "--d": `${delay}s`, ...style } : style}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export function Section({ id, cursor, className = "", children }) {
  return (
    <section id={id} data-cursor={cursor} className={`relative py-[clamp(64px,8vw,104px)] ${className}`}>
      <div className="wrap">{children}</div>
    </section>
  );
}

export function SectionHead({ eyebrow, title, accent, children }) {
  return (
    <Reveal>
      <span className="eyebrow">{eyebrow}</span>
      <h2 className="text-[clamp(30px,4.6vw,48px)]">
        {title} <span className="grad">{accent}</span>
      </h2>
      <p className="mt-3.5 max-w-[62ch] text-[clamp(15px,1.6vw,17px)] text-dim">{children}</p>
    </Reveal>
  );
}

export function Tags({ list, className = "" }) {
  return (
    <div className={`flex flex-wrap gap-[7px] ${className}`}>
      {list.map(t => <span key={t} className="tag">{t}</span>)}
    </div>
  );
}
