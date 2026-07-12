# CLAUDE.md — Sunnik Tank Calculator

> **Last Updated:** July 12, 2026
> **Deployed version:** v2.4.0 (latest git tag)
> **Owner:** Non-coder building with AI assistance (Claude Code inside Cursor). **Accuracy over speed, always.**

This file is the single source of truth for how to work in this repo. Read it fully before touching code. The **14 Hard Rules** below are non-negotiable. When in doubt, verify against the code — never assume.

---

## What This Project Is

A B2B industrial pricing tool for **square sectional panel water storage tanks**. A sales agent enters tank dimensions, material, and options → the app calculates every component (panels, stays, cleats, bolts, accessories) → it produces **two outputs**: a detailed **BOM PDF** (raw cost) and a customer-facing **Sales Quote PDF** (marked-up price). Pricing comes from a Supabase database of 11,578 SKUs.

- **Live (primary):** https://calc.sunnik.net/calculator
- **Live (Vercel fallback):** https://sunnik-cal.vercel.app/calculator
- **Route is `/calculator`, not root.** Visiting it while logged out **redirects to sunnik.net by design** (`ProtectedRoute`). That redirect is intended behaviour — do **not** diagnose it as a broken domain or auth bug.
- **GitHub:** https://github.com/nennen123/sunnik-cal — auto-deploys from `main` via Vercel (1–2 min).
- **Company:** Sunnik Water Tank Solutions (sunnik.net).

---

## ⛔ HARD RULES — Never Break These

1. **Pricing column:** always read `market_final_price`. **Never** `our_final_price` (that is internal cost — leaking it into a quote is a serious error).
2. **Partition SKU symbol:** use the cent symbol **`¢`**, **never** phi `φ`. The database SKUs use `¢`. (Old docs say `φ` — they are wrong; see Archived Docs.)
3. **FRP = Metric panels + Type 2 only.** No Imperial FRP, no Type 1 FRP. Selecting FRP in the UI auto-forces Metric + Type 2 + FRP build standard (`TankInputs.js`). FRP tanks **5m+ height are special-request sizes**.
4. **SS316 / SS304 = Type 1 only.** The Type 2 button grays out for these materials.
5. **New Supabase table ⇒ all 3 GRANTs immediately.** Every new table must be created with `GRANT` to **`anon`**, **`authenticated`**, and **`service_role`** in the same SQL. Required by the Supabase Data API policy enforced **Oct 30, 2026**. Non-negotiable.
6. **Bolts are sold per BOX, not per piece.** Box quantities are material-specific. Do not price bolts as loose pieces.
7. **Bolts per side:** FRP = **13**, SS316/SS304 = **20**, HDG/MS = **16**. (Verified in `bomCalculator.js`.)
8. **Safety cage only when `height > 3` (strict `>`).** Requires **both** the checkbox **AND** the height check — the code is `if (safetyCage && height > 3)` (`&&`, never `||`), in both the steel and FRP paths.
9. **FRP roof brackets are always ABS.** FRP roof pipe is ABS (MS1390) or UPVC (SS245).
10. **`'use client'` must be LINE 1** of any client component. **Never** put `'use client'` in `app/lib/` files — it breaks SSR.
11. **The two PDF totals differ BY DESIGN.** BOM PDF = raw database cost. Sales Quote = `cost × 1.20 × (1 + markup/100)` (default markup 30% → `× 1.30`). The `1.20` is an operations multiplier; the markup is agent-adjustable. Do **not** "fix" the discrepancy.
12. **SS316 ladder falls back to SS304 BY DESIGN** — there are no SS316 ladder SKUs in the DB (`getLadderMaterialCode()`). Do not "fix" this.
13. **One change at a time. Test immediately. Never rebuild a whole file without testing. Never assume — verify.**
14. **Never edit backup files.** Ignore and never modify any file matching `*.bak`, `*.bak2`, `*.backup.js`, `*_backup*`, `*.pre-*.backup.js`. The live files are the unsuffixed ones (e.g. edit `bomCalculator.js`, never `bomCalculator_v2.3.3_backup.js`).

---

## How To Work With Me (the owner is a non-coder)

- Give **clear, step-by-step** instructions. State exactly **which file** and **where** in it.
- **Prefer complete file replacements** over fragile partial edits — *except* for `bomCalculator.js`, which is huge and validated: make **surgical edits** there.
- **Database changes:** give me SQL to paste into the Supabase **SQL Editor** (include the 3 GRANTs per Rule 5).
- **Documentation before implementation.** This project was rebuilt **3 times** because business logic was under-documented. Write down the rule before coding it.
- **Standard test configs:** `5×10×4m Metric + 1 partition` and `5×10×3ft Imperial + 1 partition`.
- Each key file carries its **own version number** in a header comment — **bump it on every change**.
- Bugs tracked as **BUG-00X**. Milestones get **git tags** (restore points — Cursor Composer has overwritten working code before).
- **Cache issues:** `rm -rf .next && npm run dev`.

---

## Tech Stack & Commands

- **Next.js 15** (App Router, `^15.5.9`), **Tailwind**, **Supabase PostgreSQL**, **jsPDF** (+ `jspdf-autotable`), **Vercel**. Package manager: **npm**.

```bash
npm run dev      # dev server (Turbopack)
npm run build    # production build — MUST pass with zero errors before "done"
npm run lint     # ESLint (backup files produce harmless warnings)
```

> There is **no automated test suite** wired for validation. Do **not** reference `npm run test:validate` or similar — it was planned in old docs but never built. Verification is manual (see Definition of Done).

---

## Key Files

| File | Version | Role |
|------|---------|------|
| `app/lib/bomCalculator.js` | **2.3.3** | ⭐ Core calculation engine (~2,700 lines). Surgical edits only. |
| `app/lib/cleatCalculator.js` | 2.3.0 | Cleat formulas (validated, 8 tanks). |
| `app/lib/frpCalculator.js` | — | FRP-specific panel/support logic. |
| `app/lib/bomEngine.js` | — | Panel-quantity helper. |
| `app/lib/pdfGenerator.js` | 1.3.0 | Renders **13 BOM sections**. No `'use client'` (Rule 10). |
| `app/lib/supabasePriceLoader.js` | — | Price lookup, `market_final_price`, 5-min cache, multi-strategy fallback. |
| `app/lib/priceLoader.js` | — | CSV backup loader (`public/sku_prices.csv`). |
| `app/lib/accessoryDefaults.js` | — | Material-based accessory presets (MS1390 / SS245). |
| `app/lib/accessoryPricing.js` | — | Accessory prices + SKU generation. |
| `app/lib/quoteService.js` | — | Save/load quotes, serial numbers, revisions. |
| `app/lib/userProfile.js` | — | User role / markup profile. |
| `app/lib/supabase.js` | — | Supabase client. |
| `app/calculator/page.js` | **2.1.0** | Main calculator page; computes `finalPrice` (Rule 11). |
| `app/calculator/components/TankInputs.js` | **2.2.0** | Input form; FRP forcing + accessory defaults. |
| `app/calculator/components/BOMResults.js` | **3.1.0** | BOM table + BOM PDF export. |
| `app/calculator/components/SalesQuoteSummary.js` | 2.0.0 | Customer quote view; applies `1.20 × markup`; auto-saves quote. |
| `app/calculator/components/*.jsx` | — | Sub-cards: `TankAccessories`, `TankReinforcement`, `BoltNutWasher`, `PipeFittingsCards`, `PriceSummary`, `SkidBase`, `Remarks`. |
| `app/context/AuthContext.js` | — | Supabase auth; **5s `getSession()` timeout** (prevents infinite loading). |
| `app/components/ProtectedRoute.js` | — | Auth guard (logged-out ⇒ redirect to sunnik.net, by design). |

**Database:** Supabase `products` table, 11,578 SKUs, key column `sku`. 110 SKUs at `price = 0` as of Jul 2026 (specialty nozzles, SS ladders — known, low priority).

Routes: `/calculator` (main), `/quotes` (saved quotes), `/login`. `/test` and `/test-calc` are auth-less debug pages (deletable).

---

## Business Logic (essentials — deep detail in `docs/`)

**Steel types.** Type 1 = 45°-then-90° joint, diagonal (S) stays, materials SS316/SS304/HDG/MS. Type 2 = 90° L-joint, horizontal (HS) + vertical (VS) stays, HDG/MS only.

**Panel classes** (by grid position): A interior, B edge, C corner, AB partition-junction, BCL/BCR corners; Type 1 partitions use `B¢`/`C¢`, Type 2 partitions use `PA` (+ `TBAB` stay-junction).

**Panel sizes:** Metric 1m×1m (`m`), Imperial 4ft/1.22m (`i`). FRP always Metric.

**Thickness progression (SANS 10329:2020):** thicker at bottom. 1–2m → 3.0mm; 3m → base/T1 4.5, upper 3.0; 4m → 5.0 / 5.0 / 4.5 / 3.0 / 3.0. Thickness codes: 3.0→`3`, 2.5→`25`, 4.5→`45`, 5.0→`5`.

**Accessory defaults** (auto-set on material change in `TankInputs.js`; user-overridable):

| Field | SS316 | SS304 | HDG | MS | FRP |
|-------|-------|-------|-----|-----|-----|
| Internal Ladder | SS316* | SS304 | HDG | MS | SS304 |
| External Ladder | SS316* | SS304 | HDG | MS | HDG |
| WLI | SS316 | SS304 | HDG | MS | HDG |
| BNW | SS316 | SS304 | HDG | MS | SS304 |
| Manhole | SS316 | SS304 | HDG | MS | FRP |
| Bolts/side | 20 | 20 | 16 | 16 | 13 |

*Internal/External ladder SKUs normalize SS316 → SS304 in `getLadderMaterialCode()` (Rule 12).

---

## SKU Format Cheat Sheet

```
Steel Type 1:  1[Loc][Thk]-[Size]-[Mat]           e.g. 1A4-i-S2   1B45-m-S2   1BCL5-i-HDG
Steel Type 2:  2[Loc][Thk]-[Size]-[Ø]-[Mat]       e.g. 2A25-i-14-S1   2A45-i-14-HDG   (Ø14 upper / Ø18 bottom tier)
Type 2 Part.:  2PA[Thk]-[Size]-[Ø]-[Mat]          e.g. 2PA6-m-18-HDG   (+ 2TBAB… stay junction)
FRP panels:    3[Sec][Depth]-FRP[-A|-B]           e.g. 3S40-FRP-B  3S30-FRP-A  3R00-FRP  (B=structural bottom tier, A=upper)
FRP accessory: [Code]-FRP-[Size]                  e.g. IL-FRP-40M
FRP partition: 3P[Depth]-FRP-A (edge) / 3PF[Depth]-FRP-A (middle)
```
- **Material codes:** SS316→`S2`, SS304→`S1`, HDG→`HDG`, MS→`MS`, FRP→`FRP`.
- **Partition SKUs use `¢`, never `φ`** (Rule 2).
- **FRP tier stacking bottom→top:** `S40 → S30 → S20 → S10` (depth code counts down; bottom = highest).
- **Tie Rod length:** `(span × 1000) − 420mm` (fittings), capped at **5800mm** (longer spans get jointed studs + couplers).

---

## Validated Formula Systems — do NOT re-derive (see `docs/`)

These are validated against real engineering drawings. Change only on explicit instruction, then re-validate.

- **Stay systems (v2.2.1, 10 tanks).** Type 1: narrow (W≤2) uses OP stays; wide (W≥3ft & H≥4) uses welded. Type 2: VS (tier 1 only) + HS tier logic. Tier split: `doubleTiers = max(0, H−2)`, `singleTiers = min(H, 2)`, `hasWelded = H≥4`.
- **Cleats (v2.3.0, 8 tanks).** `CleatE`/`CleatEW` at panel `+` junctions; `CleatA = 2×(L−1)/9`; corner `CC`: Type 2 = `12 + P×6`, Type 1 = `CC1 + CC2 + CCP`. Welded cleats (`CleatEW`) at bottom when `H≥4`.
- **FRP Tie Rod system.** `EndStuds = joints×H×4`; `StayPlate2H = perimeter×1.5`; `LHB = studs×1.05`; `Washers = studs×1.1`; `Hooks = studs×0.3`; `LongNuts = studs×0.5`. Stay plates: none@1m, cleat@1.5m, `2H`@2–2.5m, `2H+cleat`@3–3.5m, `2H+4H+cleat`@4m+.
- **Estimated (known ~overage, do not treat as bugs):** foam tape ≈ +5% (`1.32 × joints`); sealant gum ≈ +8% (`1.045 × intersections`).

---

## Coding Conventions

- `export function` for all public lib functions; JSDoc on exported functions.
- Console logs use emoji prefixes: 📦 BOM, 🔍 lookup, ⚠️ warning.
- Prices always MYR (Malaysian Ringgit). Dimensions carried as **panels** (integers): `L`=length, `W`=width, `H`=height/tier count.
- Match the style of the file you are editing (naming, comment density, idiom).

---

## Known Limitations (don't treat these as bugs; don't half-build them)

- TBAB height-code breakdown (1H/2H/std) not implemented — total quantity only.
- BOP / CDL / CDR panels not implemented (appeared in 1 of 13 drawings — likely special case).
- FRP patch tape (`PF0000012`) not yet implemented.
- FRP external-brace BOM is simplified (not fully validated).
- Partition counts **> 2** may need extra validation.

---

## Known Non-Bugs / Environment Quirks

- **Logged-out `/calculator` redirects to sunnik.net** — intended `ProtectedRoute` behaviour (Rule/URL note above).
- **VPN blocks Supabase** — if auth or prices hang, turn VPN off.
- **Auth 5s timeout** — a slow (not dead) Supabase may briefly bounce to login before the session resolves. Acceptable tradeoff vs. infinite hang.
- **Two PDF totals differ** — by design (Rule 11).
- **110 SKUs at price = 0** (as of Jul 2026) and rare accessories may show placeholder `RM 150` (flagged `⚠️`). Known, low priority.

---

## ✅ Definition of Done

Work is finished only when **all** of these are true:

1. `npm run build` passes with **zero errors**.
2. Open the calculator in a browser and run **both** standard configs — `5×10×4m Metric + 1 partition` **and** `5×10×3ft Imperial + 1 partition`.
3. Visually verify **all 13 BOM sections** render and totals are sane (BOM raw vs. Sales `×1.20×markup` per Rule 11).
4. **Bump the version header** in every changed file.
5. **Update the newest root `SESSION_HANDOVER_*.md`** (or add a new dated one) with what changed.
6. **Commit** with a clear `Type: description` message and **push** to `main`.
7. **Tag** if this is a milestone.

---

## Ground-Truth Docs (read these; ignore the stale ones)

- **Current state / recent changes:** the newest root `SESSION_HANDOVER_*.md` (**newest date wins** — currently `SESSION_HANDOVER_Mar27_2026.md`).
- **Session history:** `docs/CHANGELOG.md`.
- **Business-rule reference:** `docs/QUICK_REFERENCE.md`, `docs/FRP_vs_STEEL_COMPLETE_3.md`, `docs/ACCESSORIES_COMPLETE.md` (dated but useful for formula detail — verify against code before acting).

> ⚠️ **`docs/archive/` is HISTORICAL (Nov–Dec 2025). Never act on any rule or bug status in it.** Several statements there are the **opposite** of current hard rules (e.g. those files say use `φ`; current code uses `¢`) and they describe bugs that are already fixed. Treat archived status docs as history only.

---

## Emergency Recovery

```bash
git log --oneline -10        # recent commits
git tag                       # restore points (last stable: v2.4.0)
git checkout <hash>           # revert to a working state
git stash                     # set current changes aside
```
