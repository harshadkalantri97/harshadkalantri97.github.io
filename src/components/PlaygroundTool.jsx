import { useEffect, useMemo, useRef, useState } from "react";
import {
  MAX_INPUT, MAX_TABLE_ROWS, SAMPLES, JsonError,
  describeError, headName, isNum, parse, plural, toCsv, toSql, toTsv,
} from "../lib/jsonFlatten";
import { Card } from "./ui";

const LEVELS = [[0, "0 - stream rows"], [1, "1 - top-level blocks"], [2, "2 - two levels deep"], [3, "3 - three levels deep"]];
const VIEWS = [["table", "Table"], ["csv", "CSV"], ["sql", "SQL"]];
const SQL_KW = /\b(CREATE TABLE|INSERT INTO|VALUES|NULL|TRUE|FALSE|INTEGER|NUMERIC|BOOLEAN|TEXT)\b/;
const HIGHLIGHT_LIMIT = 200_000; // past this, plain text renders faster than thousands of spans

function run(src, level) {
  if (!src.trim()) return { kind: "empty" };
  if (src.length > MAX_INPUT) return { kind: "error", msg: "Input is over 2 MB. Paste a smaller sample." };
  const t0 = performance.now();
  let res;
  try {
    res = parse(src, level);
  } catch (e) {
    if (e instanceof JsonError) return { kind: "error", msg: describeError(e.message, e.pos, src) };
    if (e instanceof RangeError) return { kind: "error", msg: "Nesting is too deep to walk in the browser." };
    throw e;
  }
  const ms = performance.now() - t0;
  const { blocks } = res;
  return {
    kind: "ok",
    ...res,
    ms,
    kb: new Blob([src]).size / 1024,
    rowCount: blocks.reduce((n, b) => n + b.rows.length, 0),
    colCount: new Set(blocks.flatMap(b => b.cols)).size,
    texts: { table: toTsv(blocks), csv: toCsv(blocks), sql: toSql(blocks) },
  };
}

function Block({ b, first }) {
  const rows = b.rows.slice(0, MAX_TABLE_ROWS);
  return (
    <div className={first ? "" : "border-t border-line"}>
      <div className="sticky left-0 flex flex-wrap items-baseline gap-x-2.5 gap-y-1 bg-[color-mix(in_srgb,var(--a2)_10%,var(--bg-elev))] px-3.5 py-[9px] text-[11.5px] text-faint max-xs:text-xs">
        <span>data block</span>
        <b className="text-[12.5px] font-semibold text-a2">{b.id}</b>
        {b.fallback && <span className="italic">named after its first column</span>}
        <span className="ml-auto">{plural(b.rows.length, "row")}, {plural(b.cols.length, "column")}</span>
      </div>
      <table>
        <thead>
          <tr>
            <th className="rn">#</th>
            {b.cols.map((c, i) => <th key={i}>{headName(c)}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, ri) => (
            <tr key={ri}>
              <td className="rn">{ri + 1}</td>
              {r.map((v, ci) => <td key={ci} className={v !== "" && isNum(v) ? "num" : undefined}>{v}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
      {b.rows.length > MAX_TABLE_ROWS && (
        <div className="px-4 py-3 text-xs text-faint">
          Showing the first {MAX_TABLE_ROWS} of {b.rows.length} rows. CSV and SQL include all of them.
        </div>
      )}
    </div>
  );
}

function SqlText({ text }) {
  if (text.length > HIGHLIGHT_LIMIT) return <pre>{text}</pre>;
  return <pre>{text.split(SQL_KW).map((p, i) => (i % 2 ? <span key={i} className="kw">{p}</span> : p))}</pre>;
}

export default function PlaygroundTool() {
  const [sample, setSample] = useState("telecom");
  const [src, setSrc] = useState(SAMPLES.telecom.text);
  const [parsedSrc, setParsedSrc] = useState(SAMPLES.telecom.text);
  const [level, setLevel] = useState(SAMPLES.telecom.level);
  const [view, setView] = useState("table");
  const [copyMsg, setCopyMsg] = useState("Copy");
  const copyTimer = useRef(0);

  // typing is debounced; picking a sample applies at once
  useEffect(() => {
    if (src === parsedSrc) return;
    const t = setTimeout(() => setParsedSrc(src), 220);
    return () => clearTimeout(t);
  }, [src, parsedSrc]);

  const res = useMemo(() => run(parsedSrc, level), [parsedSrc, level]);

  const loadSample = name => {
    const s = SAMPLES[name];
    setSample(name);
    setSrc(s.text);
    setParsedSrc(s.text);
    setLevel(s.level);
  };

  const copy = async () => {
    const txt = res.kind === "ok" ? res.texts[view] : "";
    if (!txt.trim()) return;
    try { await navigator.clipboard.writeText(txt); setCopyMsg("Copied"); }
    catch { setCopyMsg("Copy failed"); }
    clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopyMsg("Copy"), 1400);
  };

  let output;
  if (res.kind === "empty") output = <div className="px-4 py-3 text-xs text-faint">Paste JSON or JSON Lines on the left, or pick a sample.</div>;
  else if (res.kind === "error") output = <div className="px-4 py-[18px] whitespace-pre-wrap text-bad">{res.msg}</div>;
  else if (view === "table") {
    output = res.blocks.length
      ? res.blocks.map((b, i) => <Block key={b.id} b={b} first={i === 0} />)
      : <div className="px-4 py-3 text-xs text-faint">No rows: nothing at this level holds a value.</div>;
  } else if (view === "csv") output = <pre>{res.texts.csv}</pre>;
  else output = <SqlText text={res.texts.sql} />;

  const head = "flex min-h-[46px] items-center justify-between gap-2.5 border-b border-line px-3.5 py-2 text-xs text-faint";

  return (
    <Card>
      <div className="relative z-[1] flex flex-wrap items-center justify-between gap-x-5 gap-y-3.5 border-b border-line px-[18px] py-4">
        <div role="group" aria-label="Sample payloads" className="flex flex-wrap items-center gap-2">
          <span className="mr-1 font-mono text-[10.5px] tracking-[.16em] text-faint uppercase max-xs:text-xs">Samples</span>
          {Object.entries(SAMPLES).map(([key, s]) => (
            <button
              key={key}
              type="button"
              onClick={() => loadSample(key)}
              className={`rounded-full border px-3 py-1.5 text-[13px] transition pointer-coarse:min-h-11 ${
                sample === key ? "border-a1 bg-a1/10 text-a1" : "border-line bg-surface text-dim hover:border-line-strong hover:text-fg"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-[7px] text-xs text-faint">
          <span className="font-mono tracking-[.04em]">DBID level</span>
          <select
            value={level}
            onChange={e => setLevel(+e.target.value)}
            className="max-w-[200px] rounded-[9px] border border-line bg-elev px-[9px] py-1.5 text-[13px] text-fg focus:border-a1 focus:outline-none pointer-coarse:min-h-11"
          >
            {LEVELS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </label>
      </div>

      <div className="relative z-[1] grid min-[861px]:grid-cols-[minmax(0,.8fr)_minmax(0,1.2fr)]">
        <div className="flex min-w-0 flex-col">
          <div className={head}>
            <span className="font-mono">input</span>
            <span aria-live="polite" className={`font-mono text-[11.5px] max-xs:text-xs ${res.kind === "ok" ? "text-ok" : "text-bad"}`}>
              {res.kind === "ok" ? `valid, ${res.kb.toFixed(1)} KB` : res.kind === "error" ? "invalid JSON" : ""}
            </span>
          </div>
          <textarea
            value={src}
            onChange={e => { setSrc(e.target.value); setSample(null); }}
            spellCheck={false}
            autoComplete="off"
            wrap="off"
            aria-label="JSON input"
            className="h-[420px] w-full resize-y border-0 bg-transparent px-4 py-3.5 font-mono text-[12.5px] leading-[1.6] whitespace-pre text-fg [tab-size:2] outline-none focus:shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--a1)_40%,transparent)] max-[860px]:h-[280px]"
          />
        </div>

        <div className="flex min-w-0 flex-col border-line max-[860px]:border-t min-[861px]:border-l">
          <div className={head}>
            <div role="tablist" aria-label="Output format" className="flex gap-1">
              {VIEWS.map(([v, l]) => (
                <button
                  key={v}
                  type="button"
                  role="tab"
                  aria-selected={view === v}
                  onClick={() => setView(v)}
                  className={`rounded-lg px-[11px] py-[5px] text-[12.5px] transition pointer-coarse:min-h-11 ${
                    view === v ? "bg-surface-2 text-fg" : "text-dim hover:text-fg"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={copy}
              className="rounded-lg border border-line px-[11px] py-[5px] text-xs text-dim transition hover:border-a1 hover:text-a1 pointer-coarse:min-h-11"
            >
              {copyMsg}
            </button>
          </div>
          <div
            tabIndex={0}
            aria-label="Parser output"
            className="pg-out h-[420px] overflow-auto focus:shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--a1)_40%,transparent)] focus:outline-none max-[860px]:h-auto max-[860px]:max-h-[380px]"
          >
            {output}
          </div>
        </div>
      </div>

      <div className="relative z-[1] flex flex-wrap gap-x-[22px] gap-y-2 border-t border-line px-[18px] py-[13px] font-mono text-xs text-faint [&_b]:font-semibold [&_b]:text-fg">
        {res.kind === "error" && <span>Fix the input on the left to see the output.</span>}
        {res.kind === "ok" && (
          <>
            <span>reader <b>{res.jsonLines ? `JSON Lines, ${plural(res.docs, "document")}` : "single document"}</b></span>
            <span>data blocks <b className="!text-a1">{res.blocks.length}</b></span>
            <span>rows <b className="!text-a1">{res.rowCount}</b></span>
            <span>columns <b>{res.colCount}</b></span>
            <span>parsed in <b>{res.ms < 1 ? res.ms.toFixed(2) : res.ms.toFixed(1)} ms</b></span>
            {res.trailing && <span>note <b>text after the first value was ignored</b></span>}
          </>
        )}
      </div>
    </Card>
  );
}
