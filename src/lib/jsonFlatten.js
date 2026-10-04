/* Browser port of the Generic JSON parser's rules: a streaming cursor with the same
   whatIsNext / readObject / readArray contract, the level-0 "stream rows" path, the
   DBID-level "data block" path, and JSON Lines detection. */

export const MAX_TABLE_ROWS = 300;
export const MAX_INPUT = 2 * 1024 * 1024;

export const SAMPLES = {
  telecom: {
    label: "Telecom PM counters",
    level: 2,
    text: `{
  "collector": "pm-adaptor-07",
  "granularity": "PT15M",
  "timestamp": "2026-10-04T09:15:00Z",
  "ne": { "id": "ENB-HYD-0142", "vendor": "VendorX", "region": "Hyderabad" },
  "cells": [
    {
      "cellId": "C1",
      "band": "B3",
      "counters": [
        { "name": "RRC.ConnEstab.Att", "value": 1824 },
        { "name": "RRC.ConnEstab.Succ", "value": 1801 }
      ]
    },
    {
      "cellId": "C2",
      "band": "B40",
      "counters": [
        { "name": "RRC.ConnEstab.Att", "value": 2210 },
        { "name": "RRC.ConnEstab.Succ", "value": 2167 },
        { "name": "DRB.UEThpDl", "value": 38.60 }
      ]
    }
  ]
}`,
  },
  order: {
    label: "E-commerce order",
    level: 0,
    text: `{
  "orderId": "SS-10492",
  "placed": "2026-09-28",
  "customer": { "name": "A. Rao", "tier": "gold", "address": { "city": "Pune", "pin": "411001" } },
  "payment": { "method": "UPI", "status": "captured", "paid": true },
  "items": [
    { "sku": "RUN-AIR-42", "qty": 1, "price": 4999.00, "tags": ["running", "men"] },
    { "sku": "SOCK-3P", "qty": 2, "price": 399.00, "tags": ["accessories"] }
  ]
}`,
  },
  events: {
    label: "JSON Lines events",
    level: 0,
    text: [
      '{"ts":"2026-10-04T09:00:01Z","event":"login","user":{"id":7,"country":"IN"},"tags":["web","2fa"]}',
      '{"ts":"2026-10-04T09:00:04Z","event":"search","user":{"id":7,"country":"IN"},"tags":["web"]}',
      '{"ts":"2026-10-04T09:01:12Z","event":"login","user":{"id":12,"country":"DE"},"tags":["mobile"]}',
    ].join("\n"),
  },
};

/* --- streaming cursor: reads one token at a time, never builds a tree --- */
export class JsonError extends Error {
  constructor(msg, pos) { super(msg); this.pos = pos; }
}

class JsonCursor {
  constructor(src) { this.s = src; this.i = 0; }
  fail(msg) { throw new JsonError(msg, this.i); }
  ws() {
    const s = this.s;
    let i = this.i;
    while (i < s.length) {
      const c = s.charCodeAt(i);
      if (c === 32 || c === 9 || c === 10 || c === 13) i++;
      else break;
    }
    this.i = i;
  }
  peek() { this.ws(); return this.s[this.i]; }
  atEnd() { this.ws(); return this.i >= this.s.length; }
  whatIsNext() {
    const c = this.peek();
    if (c === "{") return "object";
    if (c === "[") return "array";
    if (c === '"') return "string";
    if (c === "t" || c === "f") return "boolean";
    if (c === "n") return "null";
    if (c === "-" || (c >= "0" && c <= "9")) return "number";
    if (c === undefined) this.fail("Unexpected end of input");
    this.fail(`Unexpected character '${c}'`);
  }
  expect(ch) {
    if (this.peek() !== ch) this.fail(`Expected '${ch}'`);
    this.i++;
  }
  // next key (its ':' consumed), or null at the closing brace
  readObject() {
    const c = this.peek();
    if (c === "{") {
      this.i++;
      if (this.peek() === "}") { this.i++; return null; }
      return this.readKey();
    }
    if (c === ",") { this.i++; return this.readKey(); }
    if (c === "}") { this.i++; return null; }
    this.fail("Expected ',' or '}'");
  }
  readKey() {
    if (this.peek() !== '"') this.fail("Expected a quoted key");
    const k = this.readString();
    this.expect(":");
    return k;
  }
  // true while another element follows, false after the closing bracket
  readArray() {
    const c = this.peek();
    if (c === "[") {
      this.i++;
      if (this.peek() === "]") { this.i++; return false; }
      return true;
    }
    if (c === ",") { this.i++; return true; }
    if (c === "]") { this.i++; return false; }
    this.fail("Expected ',' or ']'");
  }
  readString() {
    this.expect('"');
    const s = this.s, ESC = { '"': '"', "\\": "\\", "/": "/", b: "\b", f: "\f", n: "\n", r: "\r", t: "\t" };
    let out = "", start = this.i;
    for (;;) {
      if (this.i >= s.length) this.fail("Unterminated string");
      const c = s[this.i];
      if (c === '"') { out += s.slice(start, this.i); this.i++; return out; }
      if (c === "\\") {
        out += s.slice(start, this.i);
        const e = s[this.i + 1];
        if (e === "u") {
          const hex = s.slice(this.i + 2, this.i + 6);
          if (!/^[0-9a-fA-F]{4}$/.test(hex)) this.fail("Bad unicode escape");
          out += String.fromCharCode(parseInt(hex, 16));
          this.i += 6;
        } else if (e in ESC) {
          out += ESC[e];
          this.i += 2;
        } else this.fail("Bad escape sequence");
        start = this.i;
        continue;
      }
      if (c < " ") this.fail("Control character in string");
      this.i++;
    }
  }
  // keeps the number exactly as written: 38.60 stays 38.60
  readNumberAsString() {
    this.ws();
    const re = /-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/y;
    re.lastIndex = this.i;
    const m = re.exec(this.s);
    if (!m) this.fail("Invalid number");
    this.i += m[0].length;
    return m[0];
  }
  readBoolean() {
    this.ws();
    if (this.s.startsWith("true", this.i)) { this.i += 4; return true; }
    if (this.s.startsWith("false", this.i)) { this.i += 5; return false; }
    this.fail("Invalid literal");
  }
  readNull() {
    this.ws();
    if (!this.s.startsWith("null", this.i)) this.fail("Invalid literal");
    this.i += 4;
  }
  skip() {
    switch (this.whatIsNext()) {
      case "object": for (let k = this.readObject(); k !== null; k = this.readObject()) this.skip(); break;
      case "array": while (this.readArray()) this.skip(); break;
      case "string": this.readString(); break;
      case "number": this.readNumberAsString(); break;
      case "boolean": this.readBoolean(); break;
      default: this.readNull();
    }
  }
}

/* --- row buffer: parallel column/value arrays with truncate, as in the parser --- */
class RowBuf {
  constructor() { this.cols = []; this.vals = []; }
  put(col, val) {
    if (col == null) return;
    this.cols.push(col);
    this.vals.push(val == null ? "" : val);
  }
  get size() { return this.cols.length; }
  isEmpty() { return this.cols.length === 0; }
  truncate(n) { this.cols.length = n; this.vals.length = n; }
  snapshot() { return { cols: this.cols.slice(), vals: this.vals.slice() }; }
}

const isPrim = t => t === "string" || t === "number" || t === "boolean" || t === "null";
const isAllDigits = s => /^[0-9]+$/.test(s || "");
const joinPath = (prefix, key) => !prefix ? key : (key == null || !key.trim()) ? prefix : prefix + "." + key;
const firstHeader = cols => cols.find(h => h != null && h.trim()) || "default";

// values leave the parser as text: null becomes "", numbers keep their original digits
const readValue = it => {
  switch (it.whatIsNext()) {
    case "string": return it.readString();
    case "number": return it.readNumberAsString();
    case "boolean": return String(it.readBoolean());
    case "null": it.readNull(); return "";
    default: it.skip(); return "";
  }
};

// DBID for level N: the first N named segments of the path (numeric segments are indices)
const dbidByLevel = (path, level) => {
  if (!path || level <= 0) return "";
  const toks = path.split(/[.\\]/).filter(Boolean);
  const names = [], idx = [];
  for (let i = 0; i < toks.length && names.length < level; i++) {
    if (isAllDigits(toks[i])) continue;
    names.push(toks[i]);
    idx.push(null);
    if (i + 1 < toks.length && isAllDigits(toks[i + 1])) { idx[idx.length - 1] = toks[i + 1]; i++; }
  }
  if (!names.length) return "";
  let keep = -1;
  if (names.length >= 2 && level >= 2) {
    for (let p = names.length - 1; p >= 0; p--) if (idx[p] != null) { keep = p; break; }
  }
  return names.map((n, i) => (i === keep ? n + "." + idx[i] : n)).join(".");
};

export function parse(src, level) {
  const blocks = new Map(); // dbid -> { rows: [{cols, vals}], fallback }
  const store = (dbid, row, fallback) => {
    let b = blocks.get(dbid);
    if (!b) blocks.set(dbid, (b = { rows: [], fallback }));
    b.rows.push(row.snapshot());
  };

  /* nested objects and arrays fold into one row; array positions become path segments */
  const flattenNode = (row, it, prefix) => {
    const vt = it.whatIsNext();
    if (isPrim(vt)) {
      if (prefix) row.put(prefix, readValue(it));
      else readValue(it);
      return;
    }
    if (vt === "object") {
      for (let k = it.readObject(); k !== null; k = it.readObject()) {
        const full = joinPath(prefix, k), t = it.whatIsNext();
        if (isPrim(t)) row.put(full, readValue(it));
        else if (t === "object") flattenNode(row, it, full);
        else flattenArray(row, it, full);
      }
      return;
    }
    flattenArray(row, it, prefix || "");
  };
  const flattenArray = (row, it, base) => {
    let idx = 0;
    while (it.readArray()) {
      const ep = base ? base + "." + idx : String(idx), et = it.whatIsNext();
      if (isPrim(et)) row.put(ep, readValue(it));
      else if (et === "object") flattenNode(row, it, ep);
      else flattenArray(row, it, ep);
      idx++;
    }
  };

  /* level 0: emit a row per array element, carrying the fields read so far, then truncate back */
  const emitImmediate = row => {
    if (row.isEmpty()) return;
    // no record processor in the browser, so the block falls back to the row's first header
    store(firstHeader(row.cols), row, true);
  };
  const legacyObject = it => {
    const base = new RowBuf();
    let emittedAny = false;
    for (let key = it.readObject(); key !== null; key = it.readObject()) {
      const ct = it.whatIsNext();
      if (isPrim(ct)) base.put(key, readValue(it));
      else if (ct === "object") flattenNode(base, it, key);
      else {
        const baseSize = base.size;
        while (it.readArray()) {
          const et = it.whatIsNext();
          if (isPrim(et)) base.put(key, readValue(it));
          else flattenNode(base, it, key);
          emitImmediate(base);
          base.truncate(baseSize);
          emittedAny = true;
        }
      }
    }
    if (!emittedAny) emitImmediate(base);
  };
  const legacyArray = it => {
    let idx = 0;
    while (it.readArray()) {
      const et = it.whatIsNext(), row = new RowBuf();
      if (et === "object") flattenNode(row, it, "");
      else if (et === "array") flattenNode(row, it, String(idx));
      else row.put("", readValue(it));
      emitImmediate(row);
      idx++;
    }
  };
  const parseLegacy = it => {
    const vt = it.whatIsNext();
    if (vt === "object") return legacyObject(it);
    if (vt === "array") return legacyArray(it);
    const row = new RowBuf();
    row.put("", readValue(it));
    emitImmediate(row);
  };

  /* level N: walk down to depth N-1 (arrays do not add depth) and buffer rows per data block */
  const target = level - 1;
  const flushRow = (dbidRaw, row) => {
    if (row.isEmpty()) return;
    const dbid = dbidByLevel(dbidRaw, level);
    if (dbid.trim()) store(dbid, row, false);
    else store(firstHeader(row.cols), row, true);
  };
  const arrayCommon = (it, key, depth) => {
    while (it.readArray()) {
      if (isPrim(it.whatIsNext())) {
        const r = new RowBuf();
        r.put(key, readValue(it));
        flushRow(key, r);
      } else expandNode(it, key, depth);
    }
  };
  const expandNode = (it, prefix, depth) => {
    if (depth === target) return emitAtLevel(it, prefix);
    const vt = it.whatIsNext();
    if (vt === "object") {
      let shallow = null;
      for (let key = it.readObject(); key !== null; key = it.readObject()) {
        const full = joinPath(prefix, key), ct = it.whatIsNext();
        if (isPrim(ct)) (shallow || (shallow = new RowBuf())).put(full, readValue(it));
        else if (ct === "array") arrayCommon(it, full, depth);
        else expandNode(it, full, depth + 1);
      }
      if (shallow) flushRow(prefix || "", shallow);
      return;
    }
    if (vt === "array") return arrayCommon(it, prefix, depth);
    if (prefix) {
      const r = new RowBuf();
      r.put(prefix, readValue(it));
      flushRow(prefix, r);
    } else readValue(it);
  };
  const emitAtLevel = (it, prefix) => {
    const vt = it.whatIsNext();
    if (vt === "object") {
      let parent = null;
      for (let key = it.readObject(); key !== null; key = it.readObject()) {
        const full = joinPath(prefix, key), ct = it.whatIsNext();
        if (isPrim(ct)) (parent || (parent = new RowBuf())).put(full, readValue(it));
        else if (ct === "array") {
          while (it.readArray()) {
            const r = new RowBuf();
            if (isPrim(it.whatIsNext())) r.put(full, readValue(it));
            else flattenNode(r, it, full);
            flushRow(full, r);
          }
        } else {
          const r = new RowBuf();
          flattenNode(r, it, full);
          flushRow(full, r);
        }
      }
      if (parent) flushRow(prefix || "", parent);
      return;
    }
    if (vt === "array") {
      while (it.readArray()) {
        const r = new RowBuf();
        if (isPrim(it.whatIsNext())) r.put(prefix, readValue(it));
        else flattenNode(r, it, prefix);
        flushRow(prefix, r);
      }
      return;
    }
    if (!prefix) { readValue(it); return; }
    const r = new RowBuf();
    r.put(prefix, readValue(it));
    flushRow(prefix, r);
  };

  const parseDoc = it => (level === 0 ? parseLegacy(it) : expandNode(it, "", 0));

  /* reader choice: JSON Lines when the first non-blank line is a complete value on its own */
  const lines = src.split("\n");
  const first = lines.find(l => l.trim()) || "";
  const t = first.trim();
  const jsonLines = t.length > 1 && ((t[0] === "{" && t[t.length - 1] === "}") || (t[0] === "[" && t[t.length - 1] === "]"));
  let docs = 0, trailing = false;

  if (jsonLines) {
    let offset = 0;
    for (const raw of lines) {
      const line = raw.replace(/\r$/, "");
      if (line.trim()) {
        const it = new JsonCursor(line);
        try { parseDoc(it); }
        catch (e) { if (e instanceof JsonError) e.pos += offset; throw e; }
        docs++;
      }
      offset += raw.length + 1;
    }
  } else {
    const it = new JsonCursor(src);
    parseDoc(it);
    docs = 1;
    trailing = !it.atEnd(); // one value per document; anything after it is ignored
  }

  // merge: per data block, union of headers in first-seen order, short rows padded with ""
  const out = [];
  for (const [id, b] of blocks) {
    const cols = [], seen = new Set();
    for (const r of b.rows) for (const c of r.cols) if (!seen.has(c)) { seen.add(c); cols.push(c); }
    const rows = b.rows.map(r => {
      const m = new Map();
      r.cols.forEach((c, i) => m.set(c, r.vals[i]));
      return cols.map(c => (m.has(c) ? m.get(c) : ""));
    });
    out.push({ id, cols, rows, fallback: b.fallback });
  }
  return { blocks: out, docs, jsonLines, trailing };
}

/* --- output formats --- */
export const isNum = v => /^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(v);
export const plural = (n, w) => `${n} ${w}${n === 1 ? "" : "s"}`;
export const headName = c => (c === "" ? "(unnamed)" : c);

const csvCell = v => (/[",\n\r]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v);
const ident = (s, fallback) => {
  const b = String(s).replace(/[^A-Za-z0-9_]+/g, "_").replace(/^_+|_+$/g, "").toLowerCase() || fallback;
  return /^[0-9]/.test(b) ? fallback.charAt(0) + "_" + b : b;
};
const uniq = list => {
  const used = new Set();
  return list.map(b => {
    let s = b, i = 2;
    while (used.has(s)) s = b + "_" + i++;
    used.add(s);
    return s;
  });
};
const sqlType = (rows, ci) => {
  let t = null;
  for (const r of rows) {
    const v = r[ci];
    if (v === "") continue;
    const k = /^-?0\d/.test(v) ? "TEXT"
      : /^-?\d+$/.test(v) ? "INTEGER"
      : isNum(v) ? "NUMERIC"
      : v === "true" || v === "false" ? "BOOLEAN" : "TEXT";
    if (!t) t = k;
    else if (t !== k) {
      if ((t === "INTEGER" && k === "NUMERIC") || (t === "NUMERIC" && k === "INTEGER")) t = "NUMERIC";
      else return "TEXT";
    }
  }
  return t || "TEXT";
};
const sqlVal = (v, type) =>
  v === "" ? "NULL" : type === "TEXT" ? "'" + v.replace(/'/g, "''") + "'" : type === "BOOLEAN" ? v.toUpperCase() : v;

export const toTsv = blocks =>
  blocks.map(b => [`# data block: ${b.id}`, b.cols.map(headName).join("\t"), ...b.rows.map(r => r.join("\t"))].join("\n")).join("\n\n");

export const toCsv = blocks =>
  blocks.map(b => [`# data block: ${b.id}`, b.cols.map(c => csvCell(headName(c))).join(","), ...b.rows.map(r => r.map(csvCell).join(","))].join("\n")).join("\n\n");

export const toSql = blocks => {
  const tables = uniq(blocks.map(b => ident(b.id, "block")));
  return blocks.map((b, bi) => {
    const ids = uniq(b.cols.map(c => ident(c, "col")));
    const types = b.cols.map((_, ci) => sqlType(b.rows, ci));
    const w = Math.max(...ids.map(s => s.length));
    return `CREATE TABLE ${tables[bi]} (\n${ids.map((s, i) => "  " + s.padEnd(w) + "  " + types[i]).join(",\n")}\n);\n\n` +
      `INSERT INTO ${tables[bi]} (${ids.join(", ")}) VALUES\n${b.rows.map(r => "  (" + r.map((v, i) => sqlVal(v, types[i])).join(", ") + ")").join(",\n")};`;
  }).join("\n\n");
};

/* error position as a line and column the reader can find */
export const describeError = (msg, pos, src) => {
  if (pos == null) return msg;
  const before = src.slice(0, pos);
  return `Line ${before.split("\n").length}, column ${pos - before.lastIndexOf("\n")}: ${msg}`;
};
