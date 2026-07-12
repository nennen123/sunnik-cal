# BUILD_LIST.md — Living Backlog & Done Log

> **Purpose:** The single running record of what's built, what's open, and what's parked.
> **Update at every session close** (it's a step in CLAUDE.md's Definition of Done).
> **Last Updated:** 2026-07-12

---

## ✅ DONE LOG

| Item | Date | Commit | Validated how |
|------|------|--------|---------------|
| FRP Tie Rod system (Phase 3) | Nov 2025 | `8cef49e` (tag v2.1.0) | 100% match to engineering drawings |
| Stay system (Type 1 & Type 2) | Dec 2025 | `291fdc9` (tag v2.2.1) | 10 real engineering drawings |
| Cleat calculator | Dec 2025 | `a6dbe3c` (tag v2.3.0) | 8 real tank BOMs |
| Tie Rod length formula + Stay Plate height rules | Dec 2025 | `ae40319`, `355a4b3` | Formula `(span×1000)−420`, capped 5800mm; vs drawings |
| Supabase authentication | 2025 | `345b966` | Login/logout + ProtectedRoute working live |
| Supabase table GRANTs (anon/authenticated/service_role) | 2026 | n/a (Supabase SQL Editor) | Data API returns rows for anon + authenticated roles |
| Dual-quote PDF system (BOM raw vs Sales ×1.20×markup) + editable quotes/revisions | 2026 | `73ad355` | Manual review; two totals differ by design |
| Auth robustness (5s timeout, stale-token handling) | Mar 2026 | `ca2db84`, `fb2af7c` | No infinite "Checking authentication…"; no crash on expired token |
| Mar-27 10-fix session (safety cage `&&`, 6 missing PDF sections, FRP/MS accessory defaults, MS ladder SKU, `'use client'` fixes, BOM PDF export) | Mar 27 2026 | `6c744b8`→`ce3de47` (handover `b6e692b`) | Manual browser verification; see `SESSION_HANDOVER_Mar27_2026.md` |
| CLAUDE.md model-handover upgrade (14 hard rules, corrected versions, DoD) | Jul 12 2026 | `d10c2a8` | `npm run build` clean; owner review |
| Archive stale Nov-2025 status docs → `docs/archive/` | Jul 12 2026 | `d6c41c9` (restore tag `pre-claudemd-upgrade` → `e93d073`) | 5 files intact in archive; build clean |
| Reconcile QUICK_REFERENCE.md (φ→¢, paths, remove stale flag) | Jul 12 2026 | `edbdadb` | Residual-φ grep clean; build clean |
| Add BUILD_LIST.md + wire into CLAUDE.md (Ground-Truth Docs + DoD step 8) | Jul 12 2026 | `e94f2c6`, `573a88e` | Build clean; owner review |
| Fix stale pointers to archived files (QUICK_REFERENCE Memory → docs/archive/) | Jul 12 2026 | `4b563a4` | Non-archive docs re-grepped; navigational pointers repathed |
| Archive defunct Nov-2025 tracking workflow (HOW_TO_USE_TRACKING, SESSION_TEMPLATE → docs/archive/) | Jul 12 2026 | `5ffb965` | Clean git-mv renames; inbound links only in CHANGELOG (history, left as-is) |
| Reconcile GIT_WORKFLOW.md (lib/→app/lib/, archived refs, dead template lines) + link from CLAUDE.md | Jul 12 2026 | `dd42170` | Residual-ref grep clean; kept live git discipline |
| Archive one-time Phase 0 commit snapshots (GIT_COMMIT_GUIDE, COMMIT_SUMMARY → docs/archive/) | Jul 12 2026 | `638fae4` | Clean git-mv renames; redundant with GIT_WORKFLOW |
| Reconcile TESTING_CHECKLIST (φ→¢, market_final_price) + CSV_ANALYSIS (3-layer bolt wording) + Rule 6 reword | Jul 12 2026 | (this commit) | Bolt/BNW pricing traced in code + verified vs Supabase 5-row BNW check |

---

## 🔨 BUILD LIST (open items)

| # | Item | Priority | Resurface trigger (when/why it comes back up) |
|---|------|----------|-----------------------------------------------|
| 1 | **Steel Roof Support verification** — OP Trusses, Purlins, RTS quantities | 🔴 High | Next steel tank with a roof-support BOM to validate against; or a customer disputes roof-support counts |
| 2 | **External Support I-Beam verification** — Baseplates, Bend Angles, Flats | 🔴 High | First real external-support (I-beam) steel order; currently simplified/unvalidated |
| 3 | **110 price-0 SKUs** (specialty nozzles, SS ladders) | 🟡 Medium | Supplier sends pricing → paste into Supabase; or a quote lands on one of these SKUs |
| 4 | **CleatAY / AN / ANY sub-types** — cleat orientation sub-variants | 🟡 Medium | A drawing shows a cleat sub-type the current CA/CE/CC set can't represent |
| 5 | **TBAB height-code breakdown** (1H / 2H / std) | 🟡 Medium | Type 2 partition order where per-height TBAB SKUs matter; today only total qty is output |
| 6 | **BOP / CDL / CDR panels** | 🟢 Low | A second drawing needing them appears (seen in only 1 of 13 so far → likely special case) |
| 7 | **FRP patch tape (`PF0000012`)** | 🟢 Low | FRP BOM needs patch tape line; or customer asks why it's missing |
| 8 | **Type 2 Corner Tape for Steel** | 🟢 Low | Type 2 steel order where corner tape is itemized on the drawing |
| 9 | **Odd-size tank placeholder pricing** — real SKUs for `IL-HDG-60M`, `SafetyCage-60m-HDG`, `SEALANT-PVC-FOAM`, `ROOF-PIPE-UPVC` | 🟡 Medium | A quote hits a 6m/odd size and shows RM 150 ⚠️ placeholders |
| 10 | **Drawing Generator (SVG panel & stay diagrams)** | 🟢 Low (Phase 2) | Owner greenlights Phase 2; sales asks for visual layout output |
| 11 | **Odd-Shape Tank Calculator** (L-shape, U-shape, column cutout) | 🟢 Low (Phase 2) | A non-rectangular tank enquiry the grid model can't handle |
| 12 | **Autodesk Phase 4 revisit** | 🟢 Low (Phase 4) | After Phases 2–3 land and CAD export becomes a priority |
| 13 | **Delete `app/test-calc/` debug page** | 🟢 Low (cleanup) | Once auth-less calculator debugging is no longer needed |
| 14 | **FRP panel-bolt SKU string mismatch** — FRP path emits `BNW-{mat}-FRP` (e.g. `BNW-SS304-FRP`), which does not exist in DB; `getPrice` Strategy 6 fuzzy-resolves it to `BNW-FRP-SET` (RM 45.00) so **the price is currently correct**, but the BOM/PDF shows a phantom SKU and correctness is fragile (depends on `BNW-FRP-SET` being the only `BNW-*FRP*` key). Fix ≈ emit `BNW-FRP-SET` directly (one line). | 🟡 P2 (cosmetic + robustness, not a mispricing) | Verify against a real FRP quote's bolt total first; or a new `BNW-*FRP*` SKU is added (would break the fuzzy match) |

---

## 🅿️ PARKED (deferred — needs an external condition to un-park)

| Item | Un-parks when… |
|------|----------------|
| **BSI & LPCB build-standard thickness rules** (marked [NEEDS DOCUMENTATION]) | Sunnik supplies the official BSI/LPCB panel-thickness tables |
| **SANS 10329 & SS245:2014 standard variations** | The standards' thickness/spec deltas vs MS1390 are documented |
| **> 2 partition configurations** | A real ≥3-partition engineering drawing is available to validate against |
| **FRP external-brace BOM** (currently simplified) | A validated FRP external-brace drawing is provided |
| **FRP 5m+ tanks** (special-request sizes) | A firm special-request order defines the exact spec/pricing |
| **Per-piece `BN300` bolt itemization** (replace aggregate `BNW-*-SET` lines with individual `BN300…` SKUs × per-piece `market_final_price`) | Owner decides quotes must itemize individual bolt SKUs |

---

*How to use: when an item ships, move it to DONE LOG with its commit hash and how it was validated. When a parked item's condition is met, move it into BUILD LIST with a priority. Keep "Last Updated" current.*
