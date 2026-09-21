# harshadkalantri97.github.io

Personal portfolio — Harshad Kalantri, Software Development Engineer.

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
| `Harshad-Kalantri-Resume.pdf` | Served by the "Download résumé" button |
| `.nojekyll` | Tells GitHub Pages to serve files as-is, skipping Jekyll |

## Features

- Light/dark theme, persisted to `localStorage`
- Particle-network hero canvas (pauses when offscreen or the tab is hidden)
- Scroll-driven reveals, scroll-spy nav, animated timeline and progress rings
- `Ctrl`/`Cmd` + `K` command palette
- Contact form via [Web3Forms](https://web3forms.com) — no backend required
- Honours `prefers-reduced-motion`; keyboard navigable throughout
- JSON-LD `Person` schema and Open Graph tags for search and link previews

## Updating the résumé

Replace `Harshad-Kalantri-Resume.pdf`, keeping the filename, and push. No code change needed.

## Deploying

Pushes to `main` publish automatically via GitHub Pages
(Settings → Pages → Source: *Deploy from a branch* → `main` / `root`).
