import { CASES, SECTIONS } from "../data/profile";
import { Card, Rich, Section, SectionHead, Tags } from "./ui";
import Icon from "./Icon";

const META = SECTIONS.find(s => s.id === "achievements");

export default function Impact() {
  return (
    <Section id={META.id} cursor={META.cursor}>
      <SectionHead eyebrow="03 / Impact" title="Work that moved a" accent="number">
        Tools and systems I led or built at MYCOM OSI. Source is proprietary, so here's the problem, the approach and the result.
      </SectionHead>

      <div className="mt-[46px] grid grid-cols-1 gap-[18px] min-[920px]:grid-cols-2">
        {CASES.map((c, i) => (
          <Card key={c.title} as="article" tilt delay={i * 0.06} className="p-6">
            <header className="mb-4 flex items-start gap-3.5 border-b border-line pb-4">
              <span className="glyph size-[42px] rounded-xl border border-line">
                <Icon name={c.icon} size={20} />
              </span>
              <div>
                <h3 className="text-lg">{c.title}</h3>
                <span className="font-mono text-[11.5px] tracking-[.04em] text-faint">{c.role}</span>
              </div>
            </header>
            <dl className="grid gap-[13px]">
              {[["Problem", c.problem], ["Approach", c.approach], ["Result", c.result]].map(([k, v]) => (
                <div key={k}>
                  <dt className="mb-[3px] font-mono text-[10.5px] tracking-[.16em] text-a1 uppercase max-xs:text-xs">{k}</dt>
                  <dd className="text-[14.5px] text-dim"><Rich text={v} /></dd>
                </div>
              ))}
            </dl>
            <Tags list={c.tags} className="mt-[18px] border-t border-line pt-4" />
          </Card>
        ))}
      </div>
    </Section>
  );
}
