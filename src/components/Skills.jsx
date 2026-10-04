import { useState } from "react";
import { COMPETENCIES, SECTIONS, SKILL_CATS, SKILLS } from "../data/profile";
import { Card, Reveal, Section, SectionHead } from "./ui";
import Icon from "./Icon";

const META = SECTIONS.find(s => s.id === "skills");
const initials = n => n.replace(/[^A-Za-z0-9/ ]/g, "").split(/[\s/]+/).map(w => w[0]).join("").slice(0, 2).toUpperCase();

export default function Skills() {
  const [cat, setCat] = useState("All");
  const shown = cat === "All" ? SKILLS : SKILLS.filter(s => s.cat === cat);

  return (
    <Section id={META.id} cursor={META.cursor}>
      <SectionHead eyebrow="02 / Toolkit" title="Skills &" accent="technologies">
        Filter by category to see the stack I reach for day to day.
      </SectionHead>

      <Reveal role="tablist" aria-label="Skill categories" className="mt-[34px] flex flex-wrap gap-2">
        {SKILL_CATS.map(c => {
          const on = c === cat;
          return (
            <button
              key={c}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => setCat(c)}
              className={`rounded-full border px-[15px] py-2 text-[13.5px] transition pointer-coarse:min-h-11 ${
                on
                  ? "border-transparent bg-linear-120 from-a1 to-a2 font-semibold text-[#03121a]"
                  : "border-line bg-surface text-dim hover:border-line-strong hover:text-fg"
              }`}
            >
              {c}
            </button>
          );
        })}
      </Reveal>

      <Reveal className="mt-[22px]">
        {/* keyed by category, so the chips replay their entrance on every filter change */}
        <div key={cat} className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] content-start gap-3">
          {shown.map((s, i) => (
            <div
              key={s.name}
              className="skill-in flex items-center gap-[11px] rounded-[14px] border border-line bg-surface px-[15px] py-3.5 transition duration-300 hover:-translate-y-1 hover:border-a1 hover:bg-surface-2"
              style={{ animationDelay: `${Math.min(i, 20) * 22}ms` }}
            >
              <span className="glyph size-8 rounded-[9px]">{initials(s.name)}</span>
              <span>
                <span className="block text-sm leading-tight font-semibold">{s.name}</span>
                <span className="block font-mono text-[11px] text-faint">{s.cat}</span>
              </span>
            </div>
          ))}
        </div>
      </Reveal>

      <div className="mt-[46px] grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
        {COMPETENCIES.map((c, i) => (
          <Card key={c.title} tilt delay={i * 0.06} className="p-6">
            <div className="mb-4 grid size-11 place-items-center rounded-[13px] border border-line bg-linear-135 from-a1/20 to-a2/20 text-a1">
              <Icon name={c.icon} size={21} />
            </div>
            <h3 className="mb-[7px] text-[16.5px]">{c.title}</h3>
            <p className="text-sm text-dim">{c.text}</p>
          </Card>
        ))}
      </div>
    </Section>
  );
}
