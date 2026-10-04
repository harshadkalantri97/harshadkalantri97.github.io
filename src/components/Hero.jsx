import { useEffect, useRef, useState } from "react";
import { HERO_CURSOR, PROFILE, ROLES, STATS } from "../data/profile";
import { useApp } from "../context";
import { useInView } from "../lib/hooks";
import { Reveal } from "./ui";
import Icon from "./Icon";
import ParticleNet from "./ParticleNet";

// its own component, so the typing only re-renders this one line
function Typed() {
  const { reduced } = useApp();
  const [text, setText] = useState(() => (reduced ? ROLES[0] : ""));

  useEffect(() => {
    if (reduced) { setText(ROLES[0]); return; }
    let ri = 0, ci = 0, del = false, timer = 0;
    const tick = () => {
      const word = ROLES[ri];
      ci += del ? -1 : 1;
      setText(word.slice(0, ci));
      let wait = del ? 34 : 62;
      if (!del && ci === word.length) { wait = 1900; del = true; }
      else if (del && ci === 0) { del = false; ri = (ri + 1) % ROLES.length; wait = 320; }
      timer = setTimeout(tick, wait);
    };
    setText("");
    timer = setTimeout(tick, 300);
    return () => clearTimeout(timer);
  }, [reduced]);

  return <span className="text-fg">{text}</span>;
}

function CountUp({ to, suffix }) {
  const ref = useRef(null);
  const numRef = useRef(null);
  const { reduced } = useApp();
  const inView = useInView(ref, { threshold: 0.4 });

  useEffect(() => {
    if (!inView) return;
    const dur = reduced ? 0 : 1400, t0 = performance.now();
    let raf = 0;
    const step = now => {
      const p = dur ? Math.min((now - t0) / dur, 1) : 1;
      numRef.current.textContent = String(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, reduced]);

  return (
    <div ref={ref} className="font-mono text-[clamp(26px,3.4vw,34px)] font-extrabold tracking-[-.03em]">
      <span className="sr-only">{to}{suffix}</span>
      <span aria-hidden="true">
        <span ref={numRef}>0</span>
        <span className="text-[.55em] text-a1">{suffix}</span>
      </span>
    </div>
  );
}

export default function Hero() {
  const { setTermOpen, copyEmail, emailCopied } = useApp();

  return (
    <section id="top" data-cursor={HERO_CURSOR} className="relative flex min-h-svh items-center overflow-hidden pt-(--nav-h)">
      <ParticleNet />
      <div className="wrap relative z-[2]">
        <div className="grid items-center gap-10 py-10 min-[980px]:grid-cols-[1.25fr_.75fr] min-[980px]:gap-14">
          <div>
            <Reveal as="span" className="inline-flex items-center gap-[9px] rounded-full border border-a1/35 bg-a1/10 px-3.5 py-[7px] text-[13px] font-medium">
              <span className="relative size-2 rounded-full bg-ok">
                <span className="absolute inset-0 animate-ping-soft rounded-full bg-ok" />
              </span>
              Open to new opportunities
            </Reveal>

            <Reveal as="h1" delay={0.06} className="mt-5 mb-1.5 text-[clamp(42px,7.4vw,84px)] font-extrabold tracking-[-.035em]">
              {PROFILE.first} <span className="grad">{PROFILE.last}</span>
            </Reveal>

            <Reveal
              delay={0.12}
              aria-label="Software Development Engineer"
              className="flex min-h-[1.6em] flex-wrap items-center gap-0.5 font-mono text-[clamp(15px,2.4vw,24px)] text-dim"
            >
              <span className="mr-[0.6em] text-a1">&gt;</span><Typed />
              <span aria-hidden="true" className="inline-block h-[1.05em] w-[9px] translate-y-0.5 animate-blink bg-a1" />
            </Reveal>

            <Reveal as="p" delay={0.18} className="mt-[22px] max-w-[60ch] text-[clamp(15px,1.7vw,17px)] text-dim">
              I build <b className="font-semibold text-fg">reliable backend services and integration adapters</b> - high-performance
              Java/Spring parsers, ETL pipelines and REST APIs, tuned for throughput and shipped in Docker across dev, test and prod.
            </Reveal>

            <Reveal delay={0.24} className="mt-[30px] flex flex-wrap gap-3">
              <a className="btn btn-primary" href="#contact" data-cursor="@">
                <Icon name="mail" size={17} /> Get in touch
              </a>
              <a className="btn btn-ghost" href="#achievements" data-cursor="++">
                <Icon name="code" size={17} /> View work
              </a>
              <a className="btn btn-ghost" href={PROFILE.resume} download={PROFILE.resumeName} data-cursor=".pdf">
                <Icon name="download" size={17} /> Download resume
              </a>
            </Reveal>

            <Reveal delay={0.3} className="mt-[26px] flex flex-wrap gap-2.5">
              <button
                type="button"
                className={`chip ${emailCopied ? "!border-a1 !text-a1" : ""}`}
                onClick={copyEmail}
                title="Copy email"
                data-cursor="^C"
              >
                <Icon name="mail" size={15} />
                <span>{emailCopied ? "Copied to clipboard" : PROFILE.email}</span>
              </button>
              <span className="chip">
                <Icon name="pin" size={15} /> {PROFILE.location}
              </span>
              <a className="chip" href={PROFILE.linkedin} target="_blank" rel="noopener" data-cursor="in">
                <Icon name="linkedin" size={15} /> LinkedIn
              </a>
              <a className="chip" href={PROFILE.github} target="_blank" rel="noopener" data-cursor="git">
                <Icon name="github" size={15} /> GitHub
              </a>
            </Reveal>
          </div>

          <Reveal
            as="aside"
            delay={0.2}
            aria-label="Key metrics"
            className="rounded-[22px] border border-line bg-surface p-2 shadow-(--shadow) backdrop-blur-md"
          >
            <div className="flex items-center gap-[7px] px-3 pt-2.5 pb-3">
              <i className="block size-[11px] rounded-full bg-[#ff5f57]" />
              <i className="block size-[11px] rounded-full bg-[#febc2e]" />
              <i className="block size-[11px] rounded-full bg-[#28c840]" />
              <span className="ml-auto font-mono text-[11px] text-faint">~/harshad - impact.log</span>
            </div>
            <div className="grid grid-cols-2 gap-0.5 border-t border-line p-[18px]">
              {STATS.map(s => (
                <div key={s.label} className="rounded-[14px] px-3 py-3.5 transition-colors hover:bg-surface">
                  <CountUp to={s.n} suffix={s.suffix} />
                  <div className="mt-0.5 text-xs tracking-[.02em] text-faint">{s.label}</div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setTermOpen(true)}
              data-cursor="$_"
              className="flex w-full items-center justify-between gap-2.5 rounded-b-[14px] border-t border-line px-[18px] py-3 text-left font-mono text-[12.5px] text-a1 transition-colors hover:bg-surface pointer-coarse:min-h-12"
            >
              <span>
                $ ./open-terminal.sh
                <span aria-hidden="true" className="ml-[3px] inline-block h-[13px] w-[7px] animate-blink bg-a1 align-[-2px]" />
              </span>
              <kbd className="pointer-coarse:hidden">`</kbd>
            </button>
          </Reveal>
        </div>
      </div>

      <div
        aria-hidden="true"
        className="no-print absolute bottom-[26px] left-1/2 z-[2] flex -translate-x-1/2 flex-col items-center gap-[7px] font-mono text-[10.5px] tracking-[.2em] text-faint max-[980px]:hidden [@media(max-height:720px)]:hidden"
      >
        <span className="relative h-[34px] w-[22px] rounded-xl border-[1.5px] border-line-strong">
          <span className="absolute top-1.5 left-1/2 h-1.5 w-[3px] -translate-x-1/2 animate-[wheel_1.8s_ease-in-out_infinite] rounded-sm bg-a1" />
        </span>
        SCROLL
      </div>
    </section>
  );
}
