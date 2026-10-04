# harshadkalantri97.github.io

Personal portfolio of Harshad Kalantri, Software Development Engineer.

**Live:** https://harshadkalantri97.github.io

## Stack

React 19, Vite and Tailwind CSS v4. Fonts (Inter, JetBrains Mono) are bundled with the
site, so nothing is fetched from third parties at runtime except the contact form submit.

## Run locally

```bash
npm install
npm run dev
```

`npm run build` writes the production site to `dist/`, and `npm run preview` serves it.

## Structure

| Path | Purpose |
|------|---------|
| `src/data/profile.js` | All page content: experience, skills, case studies, projects, credentials |
| `src/components/` | One component per section, plus the terminal, command palette and cursor |
| `src/lib/jsonFlatten.js` | The JSON parser port behind the playground |
| `src/index.css` | Tailwind theme, colour tokens for both themes, shared component styles |
| `public/Harshad-Kalantri-Resume.pdf` | Served by the "Download resume" button |
| `public/og-image.png` | 1200x630 link-preview card for LinkedIn, WhatsApp, Slack and X |
| `.github/workflows/deploy.yml` | Builds and publishes the site on every push to `main` |

To change what the page says, edit `src/data/profile.js`; the components only decide how it looks.

## Features

- **Tech cursor**: on mouse-driven screens the pointer becomes a dot with a trailing tag that
  shows a symbol for the section under it (`>_`, `-o-`, `::`, `++`, `{ }`, `</>`, `[x]`, `@`).
  The symbol re-decodes as you scroll into a new section, and controls show `()` or their own
  symbol. It switches off on touch screens and with reduced motion, and the command palette
  can turn it off.
- **JSON parser playground**: a browser port of the flattening rules in my Generic JSON
  Parser. A streaming cursor reads one token at a time; DBID level 0 streams one row per
  array element, levels 1 and up split the tree into data blocks with merged headers, and
  JSON Lines input is detected automatically. Number text is kept exactly as written.
  Output as a table, CSV or typed SQL. Loaded as its own chunk.
- **Terminal mode**: press the backtick key or the `$ ./open-terminal.sh` button for a shell
  with `help`, `neofetch`, `impact`, `goto <section>`, tab completion and history.
  Try `./hire.sh`. Loaded as its own chunk on first open.
- Light/dark theme, saved per visitor and applied before first paint
- Particle-network hero canvas (pauses when offscreen or the tab is hidden)
- Scroll reveals, scroll-spy nav, animated timeline, filterable skills
- `Ctrl`/`Cmd` + `K` command palette
- Contact form via [Web3Forms](https://web3forms.com), no backend required
- Plain ASCII text throughout, with font ligatures turned off
- Honours `prefers-reduced-motion`; keyboard navigable throughout
- JSON-LD `Person` schema and Open Graph tags for search and link previews

## Updating the resume

Replace `public/Harshad-Kalantri-Resume.pdf`, keeping the filename, and push.

## Deploying

Pushes to `main` build and publish through GitHub Actions
(Settings > Pages > Source: *GitHub Actions*).
