import { useRef, useState } from "react";
import { EXPERIENCE, SECTIONS } from "../data/profile";
import { useInView } from "../lib/hooks";
import { Card, Rich, Section, SectionHead, Tags } from "./ui";
import Icon from "./Icon";

const META = SECTIONS.find(s => s.id === "experience");

function Role({ job, open, onToggle, delay }) {
  return (
    <li className={`relative mb-5 ${open ? "open" : ""}`}>
      <span className="tl-dot" aria-hidden="true" />
      <Card as="article" delay={delay}>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          className="relative z-[1] flex w-full items-start gap-4 p-[20px_22px] text-left max-[600px]:gap-3 max-[600px]:p-4"
        >
          <span className="glyph size-[46px] rounded-[13px] border border-line !bg-surface-2 text-sm max-xs:hidden">{job.logo}</span>
          <span className="min-w-0 flex-1">
            <span className="block text-[clamp(17px,2.2vw,20px)] font-bold">{job.role}</span>
            <span className="mt-px block text-[14.5px] font-semibold text-a1">{job.company}</span>
            <span className="mt-2 flex flex-wrap gap-x-4 gap-y-2 font-mono text-[12.5px] text-faint">
              {job.facts.map(f => <span key={f}>{f}</span>)}
            </span>
          </span>
          <span
            aria-hidden="true"
            className={`mt-1 grid size-8 flex-none place-items-center rounded-[9px] border transition-all duration-300 pointer-coarse:size-10 ${
              open ? "rotate-180 border-a1 text-a1" : "border-line text-dim"
            }`}
          >
            <Icon name="chevron" size={15} />
          </span>
        </button>
        <div className="tl-body">
          <div>
            <div className="px-[22px] pb-[22px] min-[641px]:pl-[84px] max-[600px]:px-4 max-[600px]:pb-[18px]">
              <p className="mb-3.5 border-b border-line pb-3.5 text-[14.5px] text-dim">{job.blurb}</p>
              <ul className="tl-list">
                {job.points.map(p => <li key={p}><Rich text={p} /></li>)}
              </ul>
              <Tags list={job.tags} className="mt-3.5" />
            </div>
          </div>
        </div>
      </Card>
    </li>
  );
}

export default function Experience() {
  const [open, setOpen] = useState(() => new Set([0]));
  const lineRef = useRef(null);
  const drawn = useInView(lineRef, { threshold: 0.08 });

  const toggle = i => setOpen(prev => {
    const next = new Set(prev);
    next.has(i) ? next.delete(i) : next.add(i);
    return next;
  });

  return (
    <Section id={META.id} cursor={META.cursor}>
      <SectionHead eyebrow="01 / Experience" title="Where I've" accent="shipped">
        5 years across network-assurance software, enterprise consulting and applied-analytics education. Tap any role to expand the detail.
      </SectionHead>

      <ol ref={lineRef} className="timeline mt-[52px]" style={{ "--draw": drawn ? 1 : 0 }}>
        {EXPERIENCE.map((job, i) => (
          <Role key={job.company} job={job} open={open.has(i)} onToggle={() => toggle(i)} delay={i * 0.06} />
        ))}
      </ol>
    </Section>
  );
}
