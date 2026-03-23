# CLAUDE.md — Sunnik Tank Calculator

> **Last Updated:** March 17, 2026
> **Version:** 2.4.0 (deployed)
> **Owner:** Non-coder building with AI assistance. Accuracy over speed, always.

---

## What This Project Is

A B2B industrial pricing calculator for **square sectional panel water storage tanks**. Sales agents input tank dimensions, material, and options → the app calculates every component (panels, stays, cleats, bolts, accessories) → generates a professional PDF quotation with real pricing from a database of 11,578 SKUs.

**Live:** https://sunnik-cal.vercel.app/calculator
**GitHub:** https://github.com/nennen123/sunnik-cal
**Company:** Sunnik Water Tank Solutions (sunnik.net)

---

## Tech Stack

- **Framework:** Next.js 15.5.4 (App Router, NOT Pages Router)
- **Styling:** Tailwind CSS
- **Database:** Supabase PostgreSQL (11,578 SKUs in `products` table)
- **Deployment:** Vercel (auto-deploys from `main` branch)
- **Package Manager:** npm

## Commands

```bash
npm run dev          # Start dev server (usually localhost:3001)
npm run build        # Production build
npm run lint         # ESLint check
```

---

## Project Structure

```
sunnik_calc/
├── app/
│   ├── layout.js                        # Root layout with globals.css
│   ├── page.js                          # Landing page (redirects)
│   ├── login/
│   │   └── page.js                      # Login page
│   ├── context/
│   │   └── AuthContext.js               # Supabase auth provider
│   ├── components/
│   │   └── ProtectedRoute.js            # Auth guard wrapper
│   ├── calculator/
│   │   ├── page.js                      # Main calculator page (v2.2.0, 367 lines)
│   │   └── components/
│   │       ├── TankInputs.js            # Input form (v2.1.0)
│   │       ├── BOMResults.js            # BOM display table (v1.2, 313 lines)
│   │       └── QuoteSummary.js          # Price summary
│   └── lib/
│       ├── bomCalculator.js             # ⭐ CORE ENGINE (v2.2.1, ~1400 lines)
│       ├── cleatCalculator.js           # Cleat calculations (v2.3.0, 261 lines)
│       ├── pdfGenerator.js              # PDF quote generation (v1.3.0, 422 lines)
│       ├── supabasePriceLoader.js       # Supabase price fetching with fallbacks
│       ├── priceLoader.js               # CSV price loader (backup method)
│       └── supabase.js                  # Supabase client connection
├── public/
│   └── sku_prices.csv                   # Price database backup (11,578 rows)
└── documentation/                       # Handover docs and changelogs
```

---

## ⚠️ CRITICAL RULES — Never Break These

### 1. Do NOT rewrite entire files
The calculation engine (`bomCalculator.js`) is 1,400+ lines of validated logic. Every formula has been verified against real engineering drawings. Make **surgical edits only** — never regenerate the whole file.

### 2. Test after every change
```bash
npm run build    # Must pass with zero errors
npm run dev      # Then manually verify in browser
```

### 3. Do NOT change these validated formulas without explicit instruction:
- **Panel classification** (A/B/C/AB/BC/BCL/BCR) — validated against 10+ real drawings
- **Thickness progression** (SANS 10329:2020 standard) — engineering requirement
- **Stay arrangement** (Type 1 & Type 2) — validated against 10 tanks
- **Cleat calculations** — validated against 8 tanks
- **FRP tie rod system** — 100% accuracy confirmed
- **SKU generation patterns** — must match the 11,578 SKUs in database

### 4. Price column
Always use `market_final_price` from the database. Never use `our_final_price` — that's internal cost.

### 5. Git workflow
Always commit after changes with clear messages:
```bash
git add .
git commit -m "fix: description of what changed"
git push origin main
```
Vercel auto-deploys from `main` within 1-2 minutes.

---

## Business Logic — How Tanks Work

### Panel Types (Position-Based)
Panels are classified by their position in the tank grid:

| Code | Position | Description |
|------|----------|-------------|
| A | Interior | All 4 neighbours are tank panels |
| B | Edge | One side is the perimeter wall |
| C | Corner | Two adjacent sides are perimeter (convex 90°) |
| AB | Partition junction | Where partition meets perimeter wall |
| BCL | Corner Left | Left-handed corner panel |
| BCR | Corner Right | Right-handed corner panel |
| B¢ / C¢ | Partition column (Type 1) | Partition-specific panels (¢ symbol) |
| PA | Partition panel (Type 2) | Full partition panel, bottom tier thickness only |

### Steel Types
| Type | Joint Style | Stay Direction | Materials |
|------|-------------|----------------|-----------|
| Type 1 | 45° bend then 90° | Diagonal (S stays) | SS316, SS304, HDG, MS |
| Type 2 | 90° L-shape | Horizontal (HS) + Vertical (VS) | HDG, MS only |

**Partition panel differences:** Type 1 uses B¢/C¢ panels; Type 2 uses PA panels instead.

### Panel Sizes
- **Metric:** 1m × 1m (code: `m`)
- **Imperial:** 4ft × 4ft / 1.22m × 1.22m (code: `i`)
- **FRP:** Always metric (1m × 1m)

### Materials & Codes
| Material | SKU Code | Notes |
|----------|----------|-------|
| SS316 | S2 | Premium stainless, Type 1 only |
| SS304 | S1 | Standard stainless, Type 1 only |
| HDG | HDG | Hot Dip Galvanized, Type 1 or 2 |
| Mild Steel | MS | Budget option, Type 1 or 2 |
| FRP/GRP | FRP | Fiberglass, completely different panel system |

### Thickness Progression (SANS 10329:2020)
Thicker panels at the bottom (more water pressure), thinner at the top:

| Height | Base | Tier 1 (bottom) | Tier 2 | Tier 3 | Tier 4 (top) |
|--------|------|-----------------|--------|--------|---------------|
| 1m | 3.0mm | 3.0mm | — | — | — |
| 2m | 3.0mm | 3.0mm | 3.0mm | — | — |
| 3m | 4.5mm | 4.5mm | 3.0mm | 3.0mm | — |
| 4m | 5.0mm | 5.0mm | 4.5mm | 3.0mm | 3.0mm |

### Partition Panel System
Total partition panels = span × tiers × partitions (all types).

**Type 1 Steel:** Uses Cφ (corners, bottom tier only, qty=2×P) and Bφ (edges). Upper tier middles use standard A panels.

**Type 2 Steel:** Uses PA panels (qty=span×P, bottom tier thickness) and TBAB stay junction panels (qty=span×P). Upper tier middles use AB panels. Note: PA SKUs include diameter code even for HDG.

**FRP:** Uses P panels (0.93M, edge tiers) and PF panels (1M full, middle tiers) with tier-specific depth codes counting down from bottom (e.g., P30, PF20, P10 for a 3-tier tank).

---

## SKU Format Patterns

### Steel Type 1
```
Format: 1[Location][Thickness]-[Size]-[Material]
Example: 1A3-i-S1    → Type 1, A panel, 3mm, Imperial, SS304
         1B45-m-S2   → Type 1, B panel, 4.5mm, Metric, SS316
         1BCL5-i-HDG → Type 1, Base Corner Left, 5mm, Imperial, HDG
```

### Steel Type 2
```
Format: 2[Location][Thickness]-[Size]-[Diameter]-[Material]
Example: 2A3-i-14-S1    → Type 2, A panel, 3mm, Imperial, Ø14, SS304
         2A45-i-14-HDG  → Type 2, A panel, 4.5mm, Imperial, Ø14, HDG

Note: HDG Type 2: Most panels omit diameter code, but PA (partition) panels include it
```

### Steel Type 2 Partition
```
Format: 2PA[Thickness]-[Size]-[Diameter]-[Material]
Example: 2PA6-m-18-HDG  → Type 2, Partition A, 6mm, Metric, Ø18, HDG
         2PA45-i-14-S1  → Type 2, Partition A, 4.5mm, Imperial, Ø14, SS304

Note: PA panels always use bottom tier thickness. Ø18 at bottom tier, Ø14 at upper tiers.
Upper tier partition middles use standard AB panels (not PA).

TBAB (Partition Stay Junction):
Format: 2TBAB[Thickness]-[Size]-[Diameter]-[Material]
Example: 2TBAB45-m-18-HDG → Type 2, TBAB, 4.5mm, Metric, Ø18, HDG
Note: Total qty = span × partitions. Height code breakdown (1H/2H/std) not yet implemented.
```

### FRP
```
Format: 3[Section][DepthCode]-FRP[-Suffix]
Example: 3B20-FRP      → Base panel, 2m depth
         3S30-FRP-B    → Sidewall, 3m depth, Type B (structural)
         3S30-FRP-A    → Sidewall, 3m depth, Type A (standard)
         3R00-FRP      → Roof panel

FRP Partition:
  3P[DepthCode]-FRP-A   → P panel (0.93M, edge tiers — bottom & top)
  3PF[DepthCode]-FRP-A  → PF panel (1M full, middle tiers)
  Depth codes count down: bottom=totalTiers×10, top=10
  Example (3-tier): 3P30-FRP-A, 3PF20-FRP-A, 3P10-FRP-A
```

### Thickness Code Convention
- 3.0mm → `3` (NOT `30`)
- 2.5mm → `25`
- 4.5mm → `45`
- 5.0mm → `5`

---

## Stay System (Internal Bracing)

### Type 1 Stays (Diagonal)
- SKU prefixes: S, OP, SP (stays, opening stays, partition stays)
- Diagonal 45° angle stays connecting walls to floor
- OP stays span across tank width (horizontal)

### Type 2 Stays (Horizontal + Vertical)
- SKU prefixes: 2HS, 2VS, 2HSO, 2HSP
- Horizontal stays (HS) between walls
- Vertical stays (VS) from wall to floor — **only at Tier 1**
- HSO = Horizontal Stay Opening (spans across tank)

### Tier Distribution Formula
```javascript
doubleTiers = Math.max(0, H - 2);   // Bottom tiers get double stays
singleTiers = Math.min(H, 2);        // Top 2 tiers get single stays
hasWelded = (H >= 4);                 // Tier 1 uses welded components when H≥4
```

### OP Stay Rule
Tanks with width < 20ft (~6m): some floor stays are replaced with OP (horizontal across tank).

---

## Cleat System (Panel Connectors)

### Cleat Types
| Code | Purpose | SKU Pattern |
|------|---------|-------------|
| CA | Main junction cleat | `CleatA-{hole}-{material}` |
| CAL | Left oriented | `CleatAL-{hole}-{material}` |
| CE | Edge connection | `CleatE-{material}` |
| CEW | Edge welded (bottom tier) | `CleatEW-{material}` |
| CC | Corner cleat | `CC-{hole}-{material}` |

### Key Cleat Formulas (v2.3.0)
```javascript
// Edge cleats based on panel junctions
totalBaseJunctions = (L - 1) * (W - 1);
interiorBaseJunctions = Math.max(0, (L - 3) * (W - 3));
perimeterBaseJunctions = totalBaseJunctions - interiorBaseJunctions;
wallJunctionsPerLevel = 2 * (L - 1) + 2 * (W - 1);

// When H >= 4: welded cleats at bottom
CleatEW = perimeterBaseJunctions + wallJunctionsPerLevel;
CleatE = interiorBaseJunctions + (wallJunctionsPerLevel * (H - 2));
```

---

## FRP-Specific Rules

FRP tanks are completely different from steel:
- Always metric (1m × 1m panels)
- Depth codes based on total tank height (S10=1m, S20=2m... S60=6m)
- Bottom tier walls use Type B (structural), upper tiers use Type A
- Half-tier panels (D15) for heights like 3.5m, 4.5m
- Internal support = Tie Rods + Stay Plates (NOT angle stays)
- External support = SHS Beams + Bend Angles (NOT I-beams)
- Build standards: SS245:2014, MS1390:2010 (different from steel)

---

## Price Loading

### Primary: Supabase
```javascript
// supabasePriceLoader.js fetches from Supabase products table
// Uses market_final_price column
// 5-minute cache to avoid excessive queries
// Multi-strategy fallback: exact → case-insensitive → prefix → fuzzy
```

### Backup: CSV
```javascript
// priceLoader.js loads from public/sku_prices.csv
// Same SKU matching strategies
// Used if Supabase is unreachable
```

### If SKU not found → placeholder RM 150 (flagged with ⚠️)

---

## PDF Generation

`pdfGenerator.js` creates professional quotations with:
- Company header (Sunnik branding)
- Tank specifications and dimensions
- Complete BOM breakdown by section (base, walls, partition, roof, stays, cleats, accessories)
- Price totals with markup capability
- Terms and conditions

Uses jsPDF library. Each BOM section is rendered as a table.

---

## Authentication

- Supabase Auth (email + password)
- AuthContext.js provides `useAuth()` hook
- ProtectedRoute.js wraps calculator pages
- Login redirects to /calculator, logout redirects to sunnik.net
- User tiers: Agent, Representative (10-30% markup), Admin (full access)

---

## What's Validated & Working (v2.4.0)

| Feature | Version | Validated Against |
|---------|---------|-------------------|
| Steel panel calculations | v1.0 | 8 test configurations |
| FRP panel calculations | v1.0 | 8 test configurations |
| Type 1 stay system | v2.2.1 | 10 real engineering drawings |
| Type 2 stay system | v2.2.1 | 10 real engineering drawings |
| Cleat system (both types) | v2.3.0 | 8 real tank BOMs |
| Type 2 partition (PA panels) | v2.3.1 | 8 real engineering drawings |
| FRP tie rod system | v2.1.0 | 100% match to drawings |
| Supabase price loading | v1.0 | 11,578 SKUs |
| PDF generation | v1.3.0 | Manual review |
| Type 1 partition wall | v2.4.0 | 4 real engineering drawings |
| Type 2 partition (PA + TBAB) | v2.4.0 | 7 real engineering drawings |
| FRP partition (P/PF panels) | v2.4.0 | 1 real engineering drawing |
| Sealant & foam tape | v2.4.0 | 12 real engineering drawings |

---

## Known Limitations

- 336 SKUs in database have price = 0 (awaiting supplier pricing)
- Some accessory SKUs use placeholder prices (IL, EL, SafetyCage for rare sizes)
- Partition calculations for more than 2 partitions may need additional validation
- FRP external brace BOM is simplified (not fully validated)
- Foam tape and sealant gum quantities are estimated with 10% buffer (within 5-8% of real drawings)
- TBAB height code breakdown (1H/2H/std) not implemented — only total quantity
- BOP/CDL/CDR panels not implemented (found in only 1 of 13 drawings — likely special case)
- FRP patch tape (PF0000012) not yet implemented

---

## Phase 2 Features (Planned, Not Started)

1. **Engineering Drawing Generator** — SVG panel & stay arrangement diagrams
2. **Odd-Shape Tank Calculator** — L-shape, U-shape, column cutout tanks using grid-based input
3. ~~**TBAB partition panels**~~ — ✅ Implemented in v2.4.0 (total qty only, height code breakdown pending)
4. ~~**FRP partition panels**~~ — ✅ Implemented in v2.4.0 (P/PF with tier-specific depth codes)
5. See `PHASE2_DEVELOPMENT_PLAN.md` in documentation folder for full spec

---

## Coding Conventions

- Use `export function` for all public functions in lib files
- Console.log with emoji prefixes: 📦 (BOM), 🔍 (lookup), ⚠️ (warning)
- JSDoc comments on all exported functions
- Prices always in MYR (Malaysian Ringgit)
- Panel dimensions always in panels (integer), converted from meters/feet internally
- L = length panels, W = width panels, H = height panels (tier count)

---

## Emergency Recovery

If something breaks:
```bash
git log --oneline -10        # See recent commits
git checkout <commit-hash>   # Revert to working state
git stash                    # Save current changes aside
```

Last confirmed working tag: `v2.3.0`

---

## Quick Reference — File Responsibilities

| When you need to... | Edit this file |
|---------------------|----------------|
| Change panel calculations | `app/lib/bomCalculator.js` |
| Change cleat calculations | `app/lib/cleatCalculator.js` |
| Change PDF output format | `app/lib/pdfGenerator.js` |
| Change price lookup logic | `app/lib/supabasePriceLoader.js` |
| Change input form fields | `app/calculator/components/TankInputs.js` |
| Change BOM display table | `app/calculator/components/BOMResults.js` |
| Change calculator page layout | `app/calculator/page.js` |
| Change authentication flow | `app/context/AuthContext.js` |
| Add/update SKU prices | Supabase dashboard → products table |
