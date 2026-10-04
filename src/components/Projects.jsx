import { PROJECTS, SECTIONS } from "../data/profile";
import { Card, Section, SectionHead, Tags } from "./ui";
import Icon from "./Icon";

const META = SECTIONS.find(s => s.id === "projects");

export default function Projects() {
  return (
    <Section id={META.id} cursor={META.cursor}>
      <SectionHead eyebrow="05 / Academic Projects" title="Academic" accent="projects">
        Full-stack builds from my Simplilearn Java Full Stack programme - the public code behind the fundamentals.
      </SectionHead>

      <div className="mt-[46px] grid grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))] gap-5">
        {PROJECTS.map((p, i) => (
          <Card key={p.title} as="article" tilt delay={i * 0.08} className="flex flex-col">
            <div className="proj-top relative grid h-[170px] place-items-center overflow-hidden bg-linear-135 from-[color-mix(in_srgb,var(--a1)_26%,var(--bg-elev))] to-[color-mix(in_srgb,var(--a2)_30%,var(--bg-elev))]">
              <span className="relative z-[1] font-mono text-[clamp(34px,5vw,46px)] font-bold tracking-[.06em] text-white/90 [text-shadow:0_8px_30px_rgba(0,0,0,.35)]">
                {p.badge}
              </span>
            </div>
            <div className="flex flex-1 flex-col p-[22px]">
              <h3 className="text-[19px]">{p.title}</h3>
              <p className="mt-[9px] text-[14.5px] text-dim">{p.text}</p>
              <Tags list={p.tags} className="mt-4 mb-5" />
              <div className="mt-auto flex gap-2.5">
                <a className="link-btn" href={p.href} target="_blank" rel="noopener" data-cursor="git">
                  <Icon name="github" size={15} /> Source
                </a>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </Section>
  );
}
