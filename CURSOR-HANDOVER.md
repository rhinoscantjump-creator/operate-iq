# Operate IQ — Cursor Handover

**Domain:** [operate-iq.com](https://operate-iq.com)
**Status:** Daily puzzle site. One wordsearch, one sudoku, and one triad per UTC calendar day.
**Built by:** Rhinos Can't Jump ([rhinoscantjump.com](https://rhinoscantjump.com))

---

## What this project is now

A static Astro site that plays three HTML games in the browser. Puzzles are generated from the UTC date (`YYYY-MM-DD`) so every visitor on the same day gets the same boards. Completion and streaks live in `localStorage`. No accounts, no contact form, no sales CTA.

| Surface | Route | Notes |
|---|---|---|
| Today | `/` | Date, countdown, three puzzle cards, streaks |
| Wordsearch | `/wordsearch` | 12×12 in a clipped viewport, Play/Move, pinch-zoom |
| Sudoku | `/sudoku` | Medium 9×9, notes, keypad |
| Triad | `/triad` | Three 5-letter words, eight shared guesses |
| How it works | `/how-it-works` | Rules + UTC reset + local streaks |
| 404 | `/404` | Styled |

---

## Source of truth

- Site copy: `src/data/site.ts`
- Wordsearch themes: `src/data/word-themes.ts`
- Triad word lists: `src/data/triad-words.ts` (independent lists, not NYT Wordle dumps)
- Generators: `src/lib/wordsearch.ts`, `src/lib/sudoku.ts`, `src/lib/triad.ts` (seeded from `src/lib/rng.ts` + `src/lib/date.ts`)
- Persistence: `src/lib/storage.ts`
- Play scripts: `src/client/*.ts`
- Visual design: `design-system/MASTER.md`

---

## Stack & deploy

- Astro 5 static → `dist/`, Vercel via `vercel.json`
- `@astrojs/sitemap` → `/sitemap-index.xml`
- Vercel Web Analytics via `@vercel/analytics/astro`

```bash
npm run dev      # http://localhost:4321
npm run build
git push         # Vercel auto-deploys
```

---

## Constraints

- No contact page, email, or form. Footer points at rhinoscantjump.com.
- Do not add accounts or leaderboards without a product decision (that needs a backend).
- Puzzles must stay deterministic for a given UTC date — do not switch to `Math.random()`.
- Triad must not copy Wordle/Quordle names, green/yellow/gray tiles, or clone-repo code.
