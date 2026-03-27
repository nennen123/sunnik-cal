# Session Handover — March 27, 2026

## Summary

10 fixes across 6 files. BOM PDF export, accessory defaults, safety cage logic, SSR fixes, and auth timeout.

---

## All Fixes

### 1. BOM PDF Export Button (BOMResults.js)
- Added `inputs` prop to component (was passed by page.js but not destructured)
- Added "Export PDF" button with loading spinner, 30s timeout, and error display
- Added `'use client'` directive and `useState` import

### 2. Six Missing PDF Sections (pdfGenerator.js)
- PDF was only rendering 7 of 13 BOM sections
- Added: Roof Support, Stay System, Cleats & Connections, Tie Rods (FRP), Tie Rod Hardware, Stay Plates
- Each with distinct color and null/empty guard
- PDF now matches the on-screen BOM display exactly

### 3. FRP Accessory Defaults (TankInputs.js)
- FRP tanks were defaulting all accessories to FRP material (wrong)
- Fixed: Internal Ladder = SS304, External Ladder = HDG, WLI = HDG, BNW = SS304, Manhole = FRP

### 4. MS Accessory Defaults (TankInputs.js)
- MS tanks were defaulting accessories to HDG (wrong)
- Fixed: All accessories now default to MS (matching tank material)

### 5. Safety Cage AND Logic (bomCalculator.js)
- Was: `if (safetyCage || height > 3)` — cage appeared on 2m tank if checkbox was on
- Fixed: `if (safetyCage && height > 3)` — both conditions required
- Fixed in BOTH steel and FRP calculation paths (lines 1849 and 2665)

### 6. Safety Cage UI Disabled at <=3m (TankInputs.js)
- Checkbox now disabled and grayed out when tank height <= 3m
- Shows "Safety cage available for tanks above 3m height" when disabled
- Auto-clears safetyCage to false when height drops to 3m or below

### 7. MS Ladder SKU Fix (bomCalculator.js)
- `getLadderMaterialCode()` mapped MS to HDG (wrong)
- Fixed: MS now maps to MS — database has IL-MS and EL-MS SKUs
- SS316 still correctly falls back to SS304 (no SS316 ladders in DB)

### 8. SSR 'use client' Fixes (multiple files)
- BOMResults.js: moved `'use client'` from line 6 to line 1
- QuoteSummary.js: moved `'use client'` from line 5 to line 1
- TankInputs.js: added `'use client'` (was missing entirely)
- pdfGenerator.js: removed `'use client'` (unnecessary on library file)

### 9. PDF Export Timeout (QuoteSummary.js)
- Added 30-second timeout via Promise.race on generatePDF call
- Error message now shows actual error text (e.g., "PDF timed out after 30 seconds")
- finally block ensures isExporting always resets

### 10. Auth Timeout (AuthContext.js)
- `supabase.auth.getSession()` could hang forever on page refresh
- Added 5-second timeout — if auth doesn't resolve, setLoading(false) fires
- Page never hangs on "Checking authentication..." indefinitely
- Worst case: 5s wait then loads (if session cached) or redirects to login

---

## Accessory Defaults by Material

| Field | SS316 | SS304 | HDG | MS | FRP |
|-------|-------|-------|-----|-----|-----|
| Internal Ladder | SS316 (DB: SS304) | SS304 | HDG | MS | SS304 |
| External Ladder | SS316 (DB: SS304) | SS304 | HDG | MS | HDG |
| WLI | SS316 | SS304 | HDG | MS | HDG |
| BNW | SS316 | SS304 | HDG | MS | SS304 |
| Manhole | SS316 | SS304 | HDG | MS | FRP |
| Bolts/Side | 20 | 20 | 16 | 16 | 13 |

Note: SS316 ladder SKUs fall back to SS304 in `getLadderMaterialCode()` because the database has no SS316 ladder products. The TankInputs defaults set SS316, but the BOM calculator normalizes to SS304 for ladder SKUs only.

---

## Files Changed

| File | Changes |
|------|---------|
| `app/calculator/components/BOMResults.js` | Added PDF export button, `inputs` prop, `'use client'` on line 1 |
| `app/calculator/components/QuoteSummary.js` | Added 30s PDF timeout, `'use client'` on line 1 |
| `app/calculator/components/TankInputs.js` | FRP/MS defaults, safety cage disabled at <=3m, `'use client'` added |
| `app/lib/bomCalculator.js` | Safety cage && logic (2 locations), MS ladder SKU, FRP accessory materials |
| `app/lib/pdfGenerator.js` | 6 missing BOM sections, removed `'use client'`, browser guard, clean ASCII |
| `app/context/AuthContext.js` | 5s auth timeout on getSession() |

---

## Confirmed Not-Bugs

### Two PDFs show different totals — this is intentional

| PDF | Source | Formula | Example |
|-----|--------|---------|---------|
| BOM PDF (detailed) | `bom.summary.totalCost` | Raw database prices | RM 5,478.90 |
| Sales Quote PDF | `finalPrice` from page.js | `totalCost * 1.20 * (1 + markup/100)` | RM 8,547.08 |

The 1.20x is an operations multiplier (assembly, transport, overhead). The 30% is the default sales markup (adjustable by agent in the UI). Both use `market_final_price` from Supabase — `our_final_price` is never loaded.

---

## Known Items

- **VPN blocks Supabase**: If connected to VPN, Supabase auth and price loading may hang. The 5s auth timeout prevents infinite loading but prices won't load.
- **Auth timeout**: Set to 5 seconds. If Supabase is slow but not dead, user may briefly see login redirect before session resolves. Acceptable tradeoff vs infinite hang.
- **test-calc page**: `app/test-calc/page.js` was created for debugging (calculator without auth). Can be deleted when no longer needed.
- **Backup files**: Multiple `.backup.js` files exist in `app/lib/` and `app/calculator/components/`. They generate lint warnings but don't affect the build.

---

## Deployment

- **Live URL**: https://sunnik-cal.vercel.app/calculator
- **GitHub**: https://github.com/nennen123/sunnik-cal
- **Branch**: main (auto-deploys to Vercel)
- **Latest commit**: ce3de47 — "fix: MS ladder SKU"

### Commits from this session (oldest to newest):
1. `6c744b8` — Safety cage logic, PDF sections, accessory defaults, PDF export button
2. `c23fab3` — FRP accessory defaults (IL SS304, BNW SS304, manhole FRP)
3. `ca2db84` — Auth timeout, 'use client' fixes, test-calc page
4. `ce3de47` — MS ladder SKU fix (MS maps to MS, not HDG)
