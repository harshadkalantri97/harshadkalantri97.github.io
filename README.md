# harshadkalantri97.github.io

Personal portfolio of Harshad Kalantri, Software Development Engineer.

**Live:** https://harshadkalantri97.github.io

## What this is

A single self-contained `index.html`: no build step, no dependencies, no framework.
Everything (markup, styles, scripts) lives in that one file. Fonts come from Google
Fonts; nothing else is fetched at runtime.

## Local preview

```bash
python -m http.server 8777
# then open http://127.0.0.1:8777
```

## Structure

| File | Purpose |
|------|---------|
| `index.html` | The entire site |
| `Harshad-Kalantri-Resume.pdf` | Served by the "Download resume" button |
| `og-image.png` | 1200x630 link-preview card for LinkedIn, WhatsApp, Slack and X |
| `.nojekyll` | Tells GitHub Pages to serve files as-is, skipping Jekyll |

## Features

- **JSON parser playground**: a browser port of the flattening rules in my Generic JSON
  Parser. A streaming cursor reads one token at a time; DBID level 0 streams one row per
  array element, levels 1 and up split the tree into data blocks with merged headers, and
  JSON Lines input is detected automatically. Number text is kept exactly as written.
  Output as a table, CSV or typed SQL.
- **Terminal mode**: press the backtick key or the `$ ./open-terminal.sh` button for a shell
  with `help`, `neofetch`, `impact`, `goto <section>`, tab completion and history.
  Try `./hire.sh`.
- Light/dark theme, saved per visitor
- Particle-network hero canvas (pauses when offscreen or the tab is hidden)
- Scroll-driven reveals, scroll-spy nav, animated timeline
- `Ctrl`/`Cmd` + `K` command palette
- Contact form via [Web3Forms](https://web3forms.com), no backend required
- Plain ASCII text throughout, with font ligatures turned off
- Honours `prefers-reduced-motion`; keyboard navigable throughout
- JSON-LD `Person` schema and Open Graph tags for search and link previews

## Updating the resume

Replace `Harshad-Kalantri-Resume.pdf`, keeping the filename, and push. No code change needed.

## Deploying

Pushes to `main` publish automatically via GitHub Pages
(Settings > Pages > Source: *Deploy from a branch* > `main` / `root`).
