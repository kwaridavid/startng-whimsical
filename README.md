# start.ng — whimsical concept redesign

A playful, Duolingo-inspired redesign of [start.ng](https://start.ng/), Nigeria's home for browser games. Built as a static site that deploys to Vercel with zero configuration.

> **Fan-made concept.** This is an independent design exercise. It is not affiliated with, endorsed by, or an official product of start.ng or HNG. Game titles, creators, scores and statistics beyond the public copy are illustrative. All game cover art is CSS and emoji — no copyrighted assets were used.

## What's inside

- **Chunky Duolingo-style design system** — hard-shadow buttons, 2–3px borders, rounded cards, candy palette, pill badges, Nunito + Baloo 2.
- **Tara, the star mascot** — hand-built SVG character with a blink animation, osanobua-level good vibes, and a click easter egg.
- **Playable mini-game** — *Jollof Catch*: 30-second catch game with mouse, touch and arrow-key controls, local best score, and confetti.
- **Whimsical details** — ticker, tilted marquee ribbon, floating hero cards, a winding publishing path, streak/gem chips, confetti, synthesised UI blips, and a mascot.
- **Working interactions** — category filters, FAQ accordion, live midnight countdown, mobile nav, scroll reveals, newsletter validation and toasts.
- **Responsive & accessible** — mobile-first breakpoints, `prefers-reduced-motion` support, keyboard controls, focus styles, semantic landmarks, aria labels.

## Files

```
startng-whimsical/
├─ index.html
├─ assets/
│  ├─ css/styles.css
│  ├─ js/app.js
│  └─ favicon.svg
├─ vercel.json
└─ README.md
```

## Preview locally

Any static server works:

```bash
npx serve .
# or
python -m http.server 3000
```

Then open `http://localhost:3000`.

## Deploy to Vercel

### Option A — Vercel dashboard (recommended)

1. Push this folder to a new public GitHub repo.
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo.
3. Framework preset: **Other**. Build command: none. Output directory: `.` (default).
4. Deploy. Every push to the main branch redeploys automatically.

### Option B — Vercel CLI

```bash
npx vercel
npx vercel --prod
```

No environment variables, API keys, or build step are required.

## Design notes

The reference was Duolingo's learning experience: saturated greens, oversized friendly type, tactile buttons that physically depress, streak/gem status chips, mascot-led encouragement, and small rewards for every interaction. Those patterns were translated into start.ng's own identity — Lagos yellow danfo covers, jollof orange, market green, Naija flags, and a star mascot instead of an owl.

The structure follows the real start.ng homepage: hero → community games → daily tournament → publish flow → creators → about → FAQ → footer, with the site's actual copy and navigation retained where possible.
