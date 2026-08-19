# Operate IQ — Design System Master

**Source of truth for visual and interaction design.** Page notes live in `design-system/pages/`. Log visual changes in `CHANGELOG.md`.

**Product stance:** Daily puzzle destination. One wordsearch, one sudoku, and one WordGuess per UTC day. No accounts, no contact form, no sales CTA. Footer credits Rhinos Can't Jump (`rhinoscantjump.com`).

---

## Color tokens

Keep the dark teal identity.

| Token | Value | Role |
|---|---|---|
| `--ink` | `#05090b` | Page depth |
| `--ink-2` | `#0a1418` | Elevated surface |
| `--panel` | `rgba(12, 24, 30, 0.78)` | Cards / asides |
| `--line` | `rgba(125, 211, 196, 0.16)` | Hairline borders |
| `--line-strong` | `rgba(45, 212, 191, 0.4)` | Hover / board boxes |
| `--text` | `#e8f2f0` | Primary text |
| `--muted` | `#8aa3a0` | Secondary text |
| `--teal` | `#2dd4bf` | Accent / user sudoku entries |
| `--teal-dim` | `#14998a` | Accent gradient end |
| `--teal-ink` | `#04201c` | Text on teal |
| `--amber` | `#f0b429` | Kickers / open status |
| `--ok` | `#5eead4` | Solved / found words |
| `--danger` | `#f07167` | Sudoku conflicts |

**Anti-patterns:** purple gradients, neon glow stacks, cream “game default” themes, skeuomorphic wood puzzle boards.

---

## Typography

| Role | Family | Notes |
|---|---|---|
| Display | Syne 600–800 | Headlines |
| Body | Manrope 400–700 | UI + rules |
| Board | Manrope 700–800 | Grid letters and digits |

---

## Puzzle UI

- Wordsearch: 12×12 cells in a clipped viewport, `touch-action: none`, found cells `--ok`, live selection teal fill. Play/Move toggle above the box; a duplicate pair fades in at the top of the box once zoomed past the starting 1.2×.
- Sudoku: 9×9 with 3×3 box strokes using `--line-strong`. Givens are `--text`; entries are `--teal`; conflicts `--danger`.
- WordGuess: teal = locked place, amber = in the word, muted = absent. Do not use Wordle green/yellow/gray. Twelve shared guesses. On small screens the type-in row sticks to the top, the keyboard to the bottom, and the closest unsolved board snaps down next to the keys.
- Boards sit in a dark inset panel, not a floating “app chrome” card stack.
- Number pad, word list, and WordGuess legend live in a sticky aside on desktop, stacked below the board on small screens. On play phones, the nav and heading slide away so the board sits higher on the page.
- Homepage: 2×2 labeled launch buttons in the hero. Each live puzzle shows its local streak (days completed). Fourth slot reserved. Longer puzzle cards sit below.

---

## Motion

CSS + `public/scripts/motion.js` (IntersectionObserver). No WebGL, GSAP, or Lottie.

Homepage cards use `.reveal`. Play pages stay still so dragging a wordsearch line is not fighting animation.
