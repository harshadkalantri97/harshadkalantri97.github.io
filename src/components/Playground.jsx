import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { SECTIONS } from "../data/profile";
import { useInView } from "../lib/hooks";
import { Reveal, Section, SectionHead } from "./ui";

const META = SECTIONS.find(s => s.id === "playground");
const loadTool = () => import("./PlaygroundTool");
const PlaygroundTool = lazy(loadTool);

const HOW = [
  {
    title: "Level 0: stream rows",
    body: <>A row leaves the moment each array element is read, carrying every field seen before the array. Nested arrays become indexed columns such as <code>cells.counters.0.name</code>, which is why header fields come first in real PM files.</>,
  },
  {
    title: "Level 1 and up: data blocks",
    body: <>Each branch of the tree, down to the chosen depth, becomes its own data block. Blocks are buffered, their headers merged, and short rows padded before output.</>,
  },
  {
    title: "JSON Lines",
    body: <>If the first line is a complete JSON value, every line is read as its own document. It is the same check the parser makes before choosing how to read a file.</>,
  },
];

export default function Playground() {
  // the parser UI is its own chunk: fetched when the browser is idle or the section is near
  const ref = useRef(null);
  const near = useInView(ref, { rootMargin: "900px 0px" });
  const [idle, setIdle] = useState(false);
  useEffect(() => {
    const ric = window.requestIdleCallback;
    const id = ric ? ric(() => setIdle(true), { timeout: 2500 }) : setTimeout(() => setIdle(true), 1500);
    return () => (ric ? cancelIdleCallback(id) : clearTimeout(id));
  }, []);
  const ready = near || idle;

  return (
    <Section id={META.id} cursor={META.cursor}>
      <SectionHead eyebrow="04 / Playground" title="Try the" accent="JSON parser">
        A browser port of the flattening rules in my Generic JSON Parser. The production version is Java and
        streams tokens with jsoniter. This one follows the same rules, token by token, and runs only in your
        browser. Nothing is uploaded.
      </SectionHead>

      <div ref={ref} className="mt-10">
        {ready ? (
          <Suspense fallback={<Placeholder />}>
            <PlaygroundTool />
          </Suspense>
        ) : (
          <Placeholder />
        )}
      </div>

      <Reveal className="mt-[18px] grid grid-cols-[repeat(auto-fit,minmax(230px,1fr))] gap-3.5">
        {HOW.map(h => (
          <div
            key={h.title}
            className="rounded-[14px] border border-line bg-surface px-4 py-3.5 text-[13.5px] text-dim [&_code]:rounded-[5px] [&_code]:bg-surface-2 [&_code]:px-1.5 [&_code]:py-px [&_code]:text-xs [&_code]:text-a1"
          >
            <b className="mb-[3px] block text-sm text-fg">{h.title}</b>
            {h.body}
          </div>
        ))}
      </Reveal>
    </Section>
  );
}

function Placeholder() {
  return <div className="card h-[576px] max-[860px]:h-[930px]" aria-busy="true" />;
}
