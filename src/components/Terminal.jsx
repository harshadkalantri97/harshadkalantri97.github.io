import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { PROFILE, SECTIONS, SKILLS } from "../data/profile";
import { useApp } from "../context";
import { useMedia } from "../lib/hooks";
import Icon from "./Icon";

// a printed line is a list of parts: plain text, a coloured span or a link
const S = (c, t) => ({ c, t });
const A = (href, t) => ({ href, t });
const PROMPT = [S("t-ok", "harshad@portfolio"), ":", S("t-acc", "~"), "$ "];

const GOTO = { top: "top", ...Object.fromEntries(SECTIONS.map(s => [s.id === "achievements" ? "impact" : s.id, s.id])) };
const OPEN = { github: PROFILE.github, linkedin: PROFILE.linkedin, cert: PROFILE.cert };
const FILES = {
  "about.md": "about", "experience.log": "experience", "skills.json": "skills",
  "impact.log": "impact", "education.txt": "education", "contact.txt": "contact", "hire.sh": "cat-hire",
};
const ALIASES = { hire: "./hire.sh", "hire.sh": "./hire.sh", quit: "exit", q: "exit", cls: "clear", man: "help", "?": "help" };
const QUICK = ["help", "whoami", "impact", "projects", "neofetch", "./hire.sh", "clear"];

function Part({ p }) {
  if (typeof p === "string") return p;
  if (p.href) {
    const ext = !p.href.startsWith("mailto:");
    return <a href={p.href} target={ext ? "_blank" : undefined} rel={ext ? "noopener" : undefined}>{p.t}</a>;
  }
  return <span className={p.c}>{p.t}</span>;
}

export default function Terminal() {
  const { termOpen: open, setTermOpen, goTo, downloadResume, theme, setTheme, reduced } = useApp();
  const coarse = useMedia("(pointer: coarse)");
  const [lines, setLines] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const hist = useRef([]);
  const hIdx = useRef(0);
  const seq = useRef(0);
  const booted = useRef(false);
  const rootRef = useRef(null);
  const bodyRef = useRef(null);
  const inRef = useRef(null);

  const out = useCallback((...parts) => setLines(ls => [...ls, { id: ++seq.current, parts }]), []);
  const close = useCallback(() => setTermOpen(false), [setTermOpen]);
  const sleep = ms => new Promise(r => setTimeout(r, reduced ? 0 : ms));

  const gotoSection = name => {
    const id = GOTO[name];
    if (!id) { out(S("t-err", `goto: unknown section '${name}'. Try: ${Object.keys(GOTO).join(", ")}`)); return; }
    out(S("t-dim", "-> scrolling to"), " ", S("t-acc", name));
    setTimeout(() => { close(); requestAnimationFrame(() => goTo(id)); }, 380);
  };

  const cmds = {
    help() {
      const rows = [
        ["whoami", "who is this, in one line"],
        ["about", "short bio"],
        ["experience", "work history"],
        ["skills", "tech stack, as JSON"],
        ["impact", "measurable outcomes"],
        ["projects", "academic projects"],
        ["education", "degree and certification"],
        ["contact", "ways to reach me"],
        ["resume", "download the resume PDF"],
        ["open <target>", "github | linkedin | cert | resume"],
        ["goto <section>", Object.keys(GOTO).join(" | ")],
        ["theme [light|dark]", "toggle or set the colour theme"],
        ["neofetch", "system info, portfolio edition"],
        ["./hire.sh", "you know you want to"],
        ["ls | cat | history | clear | date | echo | exit", ""],
      ];
      out(S("t-b", "Available commands"));
      rows.forEach(([c, d]) => out("  ", S("t-acc", c.padEnd(20)), S("t-dim", d)));
      out("");
      out(S("t-dim", "Tab autocompletes | Up/Down browse history | Ctrl+L clears | Esc closes"));
    },
    whoami() {
      out(S("t-b", "harshad"));
      out("Backend engineer - Java/Spring, parsers, ETL, Docker. 5 years. Hyderabad, IN.");
    },
    about() {
      out("I build reliable backend services and integration adapters for network-assurance");
      out("software at MYCOM OSI: high-performance Java parsers, SQL ETL pipelines and REST");
      out("integrations, tuned for throughput and shipped in Docker.");
      out("");
      out(S("t-dim", "Off-duty: software architecture rabbit holes, manga, and travelling across India."));
    },
    experience() {
      [
        ["2021-10 to now", "Software Engineer", "MYCOM OSI", "parsers +65% quality | SQL ETL | Docker | JVM tuning | REST adapters"],
        ["2019-08 to 2020-07", "Technical Consultant", "Azri Consultancy", "25+ articles | enterprise & API documentation"],
        ["2019-01 to 2019-06", "Technical Intern", "INSOFE", "ML / AI / big-data blog for 3,000+ alumni"],
      ].forEach(([when, role, co, what]) => {
        out(S("t-dim", when.padEnd(20)), S("t-b", role.padEnd(23)), S("t-acc", co));
        out(" ".repeat(20), S("t-dim", what));
      });
    },
    skills() {
      const s = {
        languages: ["Java", "SQL", "JavaScript"],
        core_java: ["Collections", "Streams", "Generics", "Exception Handling", "OOP", "DSA"],
        frameworks: ["Spring", "Hibernate"],
        backend: ["REST APIs", "Microservices", "ETL", "JSON/XML/CSV parsing"],
        concurrency: ["Multithreading", "Thread Safety", "JVM Tuning", "Memory Management"],
        devops: ["Docker", "Jenkins", "CI/CD", "AWS"],
        tools: ["Git", "Maven", "Gradle", "Linux", "JUnit"],
      };
      const keys = Object.keys(s), w = Math.max(...keys.map(k => k.length)) + 3;
      out("{");
      keys.forEach((k, i) => {
        const vals = s[k].flatMap((v, j) => (j ? [", ", S("t-ok", `"${v}"`)] : [S("t-ok", `"${v}"`)]));
        out("  ", S("t-acc2", `"${k}":`.padEnd(w)), "[", ...vals, "]", i < keys.length - 1 ? "," : "");
      });
      out("}");
    },
    impact() {
      [
        [" 80%", "IAR Scanner", "faster adapter property analysis"],
        [" 65%", "Adapter parsers", "software quality lift"],
        [" 45%", "Generic JSON Parser", "faster than the parsers it replaced"],
        [" 30%", "Docker migration", "shorter feature dev cycle"],
        ["  1 ", "SNMP Counter Search", "single source of truth for counters"],
      ].forEach(([n, what, why]) => out(S("t-warn", `[${n}]`), "  ", S("t-b", what.padEnd(22)), S("t-dim", why)));
      out("");
      out(S("t-dim", "Try the JSON parser yourself:"), " ", S("t-acc", "goto playground"));
    },
    projects() {
      const dir = (name, stack, end) => out(S("t-dim", "drwxr-xr-x"), "  ", S("t-acc", name.padEnd(17)), S("t-dim", stack.padEnd(35)), end);
      dir("sporty-shoes/", "Java | Spring | Hibernate | MySQL", A("https://github.com/harshadkalantri97/Sporty-Shoes-Phase3", "[source]"));
      dir("icin-banking/", "Java | AWS | JavaScript", A("https://github.com/harshadkalantri97/ICINBankingAppSimplilearn", "[source]"));
      dir("json-flattener/", "runs in this browser", S("t-ok", "goto playground"));
    },
    education() {
      out(S("t-b", "B.Tech, Computer Science"), "  ", S("t-dim", "- BML Munjal University, Gurgaon | 2015-2019"));
      out(S("t-b", "Full Stack Java Developer"), " ", S("t-dim", "- Simplilearn Master's, with distinction | Jun 2021"));
      out(" ".repeat(26), S("t-dim", "credential ID 33577055  "), A(PROFILE.cert, "[verify]"));
    },
    contact() {
      out(S("t-acc", "email   "), "  ", A(`mailto:${PROFILE.email}`, PROFILE.email));
      out(S("t-acc", "linkedin"), "  ", A(PROFILE.linkedin, "in/harshad-kalantri"));
      out(S("t-acc", "github  "), "  ", A(PROFILE.github, "harshadkalantri97"));
      out(S("t-acc", "form    "), "  ", S("t-dim", "goto contact"));
    },
    resume() {
      out(S("t-ok", `Downloading ${PROFILE.resumeName} ...`));
      downloadResume();
    },
    open(arg) {
      if (arg === "resume") return cmds.resume();
      if (!OPEN[arg]) { out(S("t-err", `usage: open <${Object.keys(OPEN).concat("resume").join("|")}>`)); return; }
      out(S("t-ok", `Opening ${arg} in a new tab ...`));
      window.open(OPEN[arg], "_blank", "noopener");
    },
    goto(arg) {
      if (!arg) { out(S("t-err", `usage: goto <${Object.keys(GOTO).join("|")}>`)); return; }
      gotoSection(arg);
    },
    theme(arg) {
      if (arg && arg !== "light" && arg !== "dark") { out(S("t-err", "usage: theme [light|dark]")); return; }
      const next = arg || (theme === "dark" ? "light" : "dark");
      setTheme(next);
      out(S("t-ok", `theme: ${next}`));
    },
    ls(arg) {
      if (arg && arg.replace(/\/$/, "") === "projects") return cmds.projects();
      const files = [["t-ok", "about.md"], ["t-ok", "experience.log"], ["t-ok", "skills.json"], ["t-ok", "impact.log"],
        ["t-ok", "education.txt"], ["t-ok", "contact.txt"], ["t-acc", "projects/"], ["t-acc2", "resume.pdf"], ["t-warn", "hire.sh"]];
      out(...files.flatMap(([c, f], i) => (i ? ["  ", S(c, f)] : [S(c, f)])));
    },
    cat(arg) {
      if (!arg) { out(S("t-err", "usage: cat <file>   (try 'ls')")); return; }
      if (arg === "resume.pdf") { out(S("t-warn", "cat: resume.pdf: binary file - try 'resume' to download it")); return; }
      const target = FILES[arg];
      if (!target) { out(S("t-err", `cat: ${arg}: No such file or directory`)); return; }
      if (target === "cat-hire") {
        out(S("t-dim", "#!/usr/bin/env bash"));
        out("# resolves dependencies, runs the test suite, ships the candidate");
        out("set -euo pipefail");
        out('echo "run me: ./hire.sh"');
        return;
      }
      cmds[target]();
    },
    neofetch() {
      // plain ASCII on purpose: box-drawing glyphs fall back to fonts with other widths and break alignment
      const logo = [" _   _ _  __", "| | | | |/ /", "| |_| | ' / ", "|  _  | . \\ ", "|_| |_|_|\\_\\"];
      const info = [
        [null, [S("t-b", "harshad"), S("t-dim", "@"), S("t-b", "portfolio")]],
        [null, [S("t-dim", "-----------------")]],
        ["OS", ["Backend Engineer 5.0"]],
        ["Host", ["MYCOM OSI"]],
        ["Kernel", ["Java | Spring"]],
        ["Uptime", ["5 years"]],
        ["Shell", ["bash - but the JVM is home"]],
        ["Packages", [`${SKILLS.length} skills`]],
        ["Location", ["Hyderabad, IN"]],
        ["Status", [S("t-ok", "open to opportunities")]],
      ];
      info.forEach(([k, v], i) => out(S("t-acc", (logo[i] || "").padEnd(16)), ...(k ? [S("t-acc", `${k}:`.padEnd(10))] : []), ...v));
    },
    async "./hire.sh"() {
      setBusy(true);
      const steps = [
        ["[1/4] resolving dependencies ", "java, spring, sql, docker"],
        ["[2/4] running test suite ", "65% quality lift | 45% faster parsing"],
        ["[3/4] checking availability ", "open to opportunities"],
        ["[4/4] packaging candidate ", "harshad-kalantri-5y.jar"],
      ];
      for (const [step, result] of steps) {
        await sleep(420);
        out(S("t-dim", step.padEnd(34, ".")), ` ${result} `, S("t-ok", "ok"));
      }
      await sleep(380);
      out("");
      out(S("t-ok", "BUILD SUCCESS"), " ", S("t-dim", "- opening the contact form ..."));
      setBusy(false);
      gotoSection("contact");
    },
    history() { hist.current.forEach((h, i) => out(S("t-dim", String(i + 1).padStart(4)), "  ", h)); },
    clear() { setLines([]); },
    date() { out(new Date().toString()); },
    pwd() { out("/home/harshad"); },
    echo(...args) { out(args.join(" ")); },
    java(arg) {
      if (arg !== "-version" && arg !== "--version") { out(S("t-dim", "usage: java -version")); return; }
      out('openjdk version "21" 2023-09-19 LTS');
      out("Harshad Runtime Environment (build 5y+backend)");
      out("Harshad 64-Bit Server VM (tuned GC, low latency, mixed mode)");
    },
    sudo(...args) {
      const rest = args.join(" ");
      if (rest === "hire-me" || rest === "./hire.sh") return cmds["./hire.sh"]();
      out(S("t-warn", "harshad is not in the sudoers file. This incident will be reported."));
      out(S("t-dim", "(psst - try 'sudo hire-me')"));
    },
    rm() { out(S("t-err", "rm: refusing - this portfolio is immutable infrastructure.")); },
    cd() { out(S("t-dim", "cd: it's a single page - try 'goto <section>' instead.")); },
    exit() { close(); },
  };
  const NAMES = Object.keys(cmds).concat("hire").sort();

  const execLine = async raw => {
    const line = raw.trim();
    out(...PROMPT, raw);
    if (!line) return;
    hist.current.push(line);
    hIdx.current = hist.current.length;
    const [cmd0, ...args] = line.split(/\s+/);
    const cmd = ALIASES[cmd0.toLowerCase()] || cmd0.toLowerCase();
    if (cmd === "vim" || cmd === "nano" || cmd === "emacs") { out(S("t-dim", `${cmd0}: not installed here - try 'cat <file>'.`)); return; }
    const fn = cmds[cmd];
    if (!fn) { out(S("t-err", `command not found: ${cmd0}`), " ", S("t-dim", "- type"), " ", S("t-acc", "help")); return; }
    await fn(...args);
  };

  const complete = () => {
    const parts = input.split(/\s+/);
    let pool, prefix, keep;
    if (parts.length <= 1) {
      pool = NAMES; prefix = parts[0] || ""; keep = "";
    } else {
      const c = (ALIASES[parts[0]] || parts[0]).toLowerCase();
      pool = c === "cat" ? Object.keys(FILES).concat("resume.pdf")
        : c === "goto" ? Object.keys(GOTO)
        : c === "open" ? Object.keys(OPEN).concat("resume")
        : c === "theme" ? ["light", "dark"]
        : c === "ls" ? ["projects/"] : [];
      prefix = parts[parts.length - 1];
      keep = parts.slice(0, -1).join(" ") + " ";
    }
    const hits = pool.filter(p => p.startsWith(prefix));
    if (hits.length === 1) setInput(keep + hits[0] + (parts.length <= 1 ? " " : ""));
    else if (hits.length > 1) {
      out(...PROMPT, input);
      out(...hits.flatMap((h, i) => (i ? ["   ", S("t-acc", h)] : [S("t-acc", h)])));
      // extend to the longest common prefix
      let lcp = hits[0];
      for (const h of hits) while (!h.startsWith(lcp)) lcp = lcp.slice(0, -1);
      setInput(keep + lcp);
    }
  };

  const onKeyDown = async e => {
    if (busy) { e.preventDefault(); return; }
    if (e.key === "Enter") {
      e.preventDefault();
      const v = input;
      setInput("");
      await execLine(v);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (hIdx.current > 0) setInput(hist.current[--hIdx.current]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (hIdx.current < hist.current.length - 1) setInput(hist.current[++hIdx.current]);
      else { hIdx.current = hist.current.length; setInput(""); }
    } else if (e.key === "Tab") {
      e.preventDefault();
      complete();
    } else if (e.ctrlKey && e.key.toLowerCase() === "l") {
      e.preventDefault();
      setLines([]);
    } else if (e.ctrlKey && e.key.toLowerCase() === "c") {
      if (getSelection().toString()) return; // let a real copy through
      e.preventDefault();
      out(...PROMPT, input + "^C");
      setInput("");
    }
  };

  // boot text once; focus the prompt (not on touch screens, where it would throw the keyboard over the text)
  useEffect(() => {
    if (!open) return;
    const before = document.activeElement;
    if (!booted.current) {
      booted.current = true;
      const now = new Date();
      out(S("t-b", "Harshad OS 5.0"), S("t-dim", " - tty1"));
      out(S("t-dim", `Last login: ${now.toDateString()} ${now.toTimeString().slice(0, 8)} from recruiter-laptop`));
      out("Type ", S("t-acc", "help"), " to list commands, or try ", S("t-acc", "neofetch"), ".");
      out("");
    }
    const t = coarse ? 0 : setTimeout(() => inRef.current?.focus(), 30);
    const onKey = e => { if (e.key === "Escape") { e.preventDefault(); close(); } };
    addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      removeEventListener("keydown", onKey);
      before?.focus?.({ preventScroll: true });
    };
  }, [open, coarse, out, close]);

  useLayoutEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [lines]);

  // keep the window inside the visible area while an on-screen keyboard is open
  useEffect(() => {
    const vv = window.visualViewport, el = rootRef.current;
    if (!vv || !el || !open) return;
    const fit = () => {
      const up = vv.height < innerHeight - 60;
      el.style.top = up ? vv.offsetTop + "px" : "";
      el.style.height = up ? vv.height + "px" : "";
      el.style.bottom = up ? "auto" : "";
      if (up && bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    };
    fit();
    vv.addEventListener("resize", fit);
    vv.addEventListener("scroll", fit);
    return () => {
      vv.removeEventListener("resize", fit);
      vv.removeEventListener("scroll", fit);
      el.style.top = el.style.height = el.style.bottom = "";
    };
  }, [open]);

  const focusPrompt = e => {
    if (e.target.closest("a") || getSelection().toString()) return;
    inRef.current?.focus();
  };

  return (
    <div
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      aria-label="Terminal"
      data-cursor="$_"
      className={`no-print fixed inset-0 z-[210] items-center justify-center p-[18px] max-[600px]:p-0 ${open ? "flex" : "hidden"}`}
    >
      <div className="absolute inset-0 animate-[fade_.2s_ease] bg-[rgba(2,4,10,.72)] backdrop-blur-sm" onClick={close} />
      <div className="relative flex h-[min(580px,calc(100svh-36px))] w-full max-w-[880px] animate-[pop_.22s_cubic-bezier(.2,.8,.3,1)] flex-col overflow-hidden rounded-2xl border border-white/15 bg-[#07090f] text-[#d6deeb] shadow-[0_40px_120px_-30px_rgba(0,0,0,.9),0_0_0_1px_rgba(34,211,238,.06)] max-[600px]:h-full max-[600px]:max-w-none max-[600px]:rounded-none">
        <div className="flex items-center gap-[7px] border-b border-white/8 bg-[#0d1018] px-3.5 py-[11px]">
          <i className="block size-[11px] rounded-full bg-[#ff5f57]" />
          <i className="block size-[11px] rounded-full bg-[#febc2e]" />
          <i className="block size-[11px] rounded-full bg-[#28c840]" />
          <span className="ml-2.5 font-mono text-xs text-[#7c869a]">harshad@portfolio: ~</span>
          <button
            type="button"
            onClick={close}
            aria-label="Close terminal"
            className="ml-auto grid size-7 place-items-center rounded-lg text-[#7c869a] transition hover:bg-white/8 hover:text-white pointer-coarse:size-10"
          >
            <Icon name="close" size={14} strokeWidth={2.4} />
          </button>
        </div>

        <div
          ref={bodyRef}
          onClick={focusPrompt}
          className="term-body flex-1 cursor-text overflow-auto px-[18px] pt-4 pb-[18px] font-mono text-[13.5px] leading-[1.6] max-[600px]:p-3.5 max-[600px]:text-[12.5px]"
        >
          <div aria-live="polite">
            {lines.map(l => (
              <div key={l.id} className="min-h-[1.6em] break-words whitespace-pre-wrap">
                {l.parts.map((p, i) => <Part key={i} p={p} />)}
              </div>
            ))}
          </div>
          <div className="flex items-baseline gap-[9px]">
            <span className="flex-none whitespace-nowrap text-[#34d399]">
              harshad@portfolio:<b className="font-normal text-[#22d3ee]">~</b>$
            </span>
            <input
              ref={inRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              disabled={busy}
              type="text"
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              aria-label="Terminal command"
              className="min-w-0 flex-1 border-0 bg-transparent p-0 text-white caret-[#22d3ee] outline-none"
            />
          </div>
        </div>

        <div className="term-hint flex flex-wrap gap-x-[18px] gap-y-1.5 border-t border-white/8 bg-[#0b0e15] px-4 py-[9px] font-mono text-[11.5px] text-[#5d6678] pointer-coarse:px-3 pointer-coarse:pt-2.5 pointer-coarse:pb-[max(10px,env(safe-area-inset-bottom))]">
          {coarse ? (
            // tappable commands replace the keyboard hints on touch screens (no Tab or arrow keys there)
            <div role="group" aria-label="Quick commands" className="flex w-full gap-2 overflow-x-auto [scrollbar-width:none]">
              {QUICK.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => !busy && execLine(c)}
                  className="min-h-10 flex-none rounded-full border border-white/16 bg-white/4 px-3.5 font-mono text-[13px] whitespace-nowrap text-[#d6deeb] active:border-[#22d3ee] active:bg-[#22d3ee]/16"
                >
                  {c}
                </button>
              ))}
            </div>
          ) : (
            <>
              <span><kbd>Tab</kbd> complete</span>
              <span><kbd>Up</kbd><kbd>Down</kbd> history</span>
              <span><kbd>Ctrl</kbd><kbd>L</kbd> clear</span>
              <span><kbd>Esc</kbd> close</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
