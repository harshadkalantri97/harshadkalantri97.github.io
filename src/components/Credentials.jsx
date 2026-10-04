import { CREDENTIALS, SECTIONS } from "../data/profile";
import { Card, Rich, Section, SectionHead } from "./ui";
import Icon from "./Icon";

const META = SECTIONS.find(s => s.id === "education");

export default function Credentials() {
  return (
    <Section id={META.id} cursor={META.cursor}>
      <SectionHead eyebrow="06 / Credentials" title="Education &" accent="credentials">
        Where the fundamentals came from, and what I've certified since.
      </SectionHead>

      <div className="mt-[46px] grid grid-cols-[repeat(auto-fit,minmax(256px,1fr))] gap-[18px]">
        {CREDENTIALS.map((c, i) => (
          <Card key={c.title} as="article" tilt delay={i * 0.06} className="flex flex-col p-6">
            <header className="mb-[18px] flex items-center gap-[11px]">
              <span className="grid size-10 flex-none place-items-center rounded-xl border border-line bg-a2/15 text-a2">
                <Icon name={c.icon} size={20} />
              </span>
              <span className="font-mono text-[10.5px] tracking-[.16em] text-faint uppercase max-xs:text-xs">{c.kicker}</span>
            </header>
            <h3 className="text-[17.5px]">{c.title}</h3>
            <p className="mt-[3px] text-sm font-semibold text-a1">{c.org}</p>
            <div className="mt-2.5 flex flex-wrap gap-x-3.5 gap-y-1.5 font-mono text-[11.5px] text-faint">
              {c.facts.map(f => <span key={f}>{f}</span>)}
            </div>
            <p className="mt-3.5 text-sm text-dim"><Rich text={c.note} /></p>
            {c.link && (
              <a className="link-btn mt-[18px] self-start" href={c.link.href} target="_blank" rel="noopener" data-cursor="[ok]">
                <Icon name="external" size={15} /> {c.link.label}
              </a>
            )}
          </Card>
        ))}
      </div>
    </Section>
  );
}
