# Design changelog

Append-only. Newest first. Every visual or interaction change to Operate IQ goes here.

---

## 2026-08-04 — Premium redesign (Optikka-inspired)

**Why:** Raise perceived value for EU/US readers while keeping the dark teal identity and reference-architecture honesty.

**What:**

- Added `design-system/MASTER.md` + page stubs as the visual source of truth
- Rebuilt CSS tokens (deeper ink, quieter panels, refined type/spacing scale)
- Optikka-inspired nav (tracked, sparse) and elevated RCJ hybrid path in footer + home
- Homepage hero signature: CSS/SVG “leak → seal” diagram (no WebGL)
- Sitewide scroll reveals via IntersectionObserver; `prefers-reduced-motion` respected
- Restyled home, hubs index, hub playbooks, leak map, dashboard wireframe, companion, 404

**Not changed:** Hub playbook copy (except product-language if any), no contact form, no new npm motion libraries.
