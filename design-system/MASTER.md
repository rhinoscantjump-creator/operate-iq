# Operate IQ — Design System Master

**Source of truth for visual and interaction design.** Page overrides live in `design-system/pages/`. Every visual change must be logged in `CHANGELOG.md`.

**Product stance:** Published reference architecture (design study), not software for sale. Hybrid outbound path to Rhinos Can’t Jump (`rhinoscantjump.com`) — no contact form on this site.

**Reference feel:** [optikka.com](https://optikka.com/) — extreme breathing room, sparse tracked nav, one signature visual, soft scroll choreography. **Do not** copy Optikka’s cream/orange palette or WebGL/3D.

---

## Color tokens

Keep the dark teal identity; deepen ink and polish contrast.

| Token | Value | Role |
|-------|-------|------|
| `--ink` | `#05090b` | Page depth |
| `--ink-2` | `#0a1418` | Elevated surface base |
| `--bg-glow-teal` | `rgba(45, 212, 191, 0.14)` | Ambient hero wash |
| `--bg-glow-amber` | `rgba(240, 180, 41, 0.08)` | Secondary wash |
| `--panel` | `rgba(12, 24, 30, 0.78)` | Cards / panels |
| `--line` | `rgba(125, 211, 196, 0.16)` | Hairline borders |
| `--line-strong` | `rgba(45, 212, 191, 0.4)` | Hover / focus borders |
| `--text` | `#e8f2f0` | Primary text (≥4.5:1) |
| `--muted` | `#8aa3a0` | Secondary text |
| `--teal` | `#2dd4bf` | Primary accent |
| `--teal-dim` | `#14998a` | Accent gradient end |
| `--teal-ink` | `#04201c` | Text on teal buttons |
| `--amber` | `#f0b429` | Honesty / outline / callouts |
| `--ok` | `#5eead4` | Documented / positive |
| `--danger` | `#f07167` | Failure modes / down trends |

**Anti-patterns:** purple gradients, neon glow stacks, warm-cream “AI default” themes, glassmorphism layers.

---

## Typography

| Role | Family | Notes |
|------|--------|-------|
| Display | Syne 600–800 | Headlines; tight tracking (−0.03em to −0.04em) |
| Body | Manrope 400–700 | UI + long copy; line-height ~1.65 |
| Caption / nav | Manrope | Uppercase nav: 0.08–0.12em letter-spacing |

### Scale

| Step | Size | Use |
|------|------|-----|
| Display | `clamp(2.6rem, 6.5vw, 4.6rem)` | Home H1 |
| H2 | `clamp(1.75rem, 3.2vw, 2.5rem)` | Section titles |
| Hub title | `clamp(2.2rem, 5vw, 3.6rem)` | Hub playbooks |
| Lead | `1.1–1.15rem` | Hero / section leads |
| Body | `1rem` | Default |
| Small | `0.82–0.9rem` | Meta, chips, footer |

Measure: long copy max ~40–44rem.

---

## Spacing & layout

- **Rhythm:** 8px base (`--space-1` … `--space-8`)
- **Density:** Spacious marketing (section margins ~4.5–6rem)
- **Shell:** `min(1120px, calc(100% - 2.5rem))` — slightly narrower than before for editorial focus
- **Radius:** `--radius: 16px` (slightly tighter than 18px for premium restraint)
- **Panels:** Prefer quieter borders and less shadow; avoid card-stacking in the hero

---

## Signature element

**Leak → seal** SVG in the homepage hero: radial pulse + connecting nodes (CSS/SVG only). Teal on dark. Ambient pulse paused under `prefers-reduced-motion`. This is the one memorable visual; keep other decoration quiet.

---

## Motion

**Stack:** CSS transitions + IntersectionObserver (`public/scripts/motion.js`). **No** Three.js, WebGL, GSAP, or Lottie unless MASTER is updated.

| Behavior | Spec |
|----------|------|
| Hover | 150–250ms ease |
| Reveal | Opacity + 12–16px rise; stagger children 60–80ms |
| Hero load | One-shot fade/rise on `.hero` children |
| Signature | Slow pulse ~4–6s; infinite only if motion allowed |

**Rules:**

- Respect `@media (prefers-reduced-motion: reduce)` — show content at rest, no scroll reveals, no pulse
- Prefer `transform` / `opacity` only
- Exit faster than enter when applicable
- Never block first paint on motion scripts

---

## Navigation & hybrid CTA

- Primary nav: **Home · Hubs · Leak map** (tracked, sparse, Optikka-like air)
- Owner score / dashboard: **not** in nav; wireframe only via leak map
- Footer + home RCJ panel: clear path to `product.author.url`
- No contact form, no sales checkout on Operate IQ
- CTAs on this site: read hubs / leak map / visit RCJ — never “buy” or “book a demo”

---

## Components (do / don’t)

| Do | Don’t |
|----|-------|
| Hairline borders, quiet panels | Heavy multi-shadow cards in hero |
| Phosphor/SVG icons if needed | Emoji as structural icons |
| Documented / Outline badges | “Live” / “Coming soon” / “Ships” |
| Invented-numbers framing on scores | Implying measured telemetry |
| One primary action per section | Pill clusters and stat strips in hero |

---

## Accessibility

- Body contrast ≥4.5:1; secondary ≥3:1 where possible
- Focus visible on links/buttons (teal outline)
- Touch targets ≥44px
- Reduced motion fully supported
- Semantic headings; skip link optional later

---

## Page overrides

Before editing a page, check `design-system/pages/<name>.md`. If present, its rules override MASTER for that page only.

---

## Change process

1. Update tokens/CSS/components as needed  
2. Append an entry to `CHANGELOG.md` (date, what, why)  
3. Keep honesty vocabulary: documented / outline / never built  
