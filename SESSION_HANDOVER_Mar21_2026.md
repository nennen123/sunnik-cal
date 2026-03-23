# SESSION HANDOVER — March 21, 2026
## Version: 2.4.1 (Partition fixes + Auth crash fix)

## 4 BUGS FIXED THIS SESSION

### BUG 1 — FRP partition hardware counted as panels
- Symptom: 5×4×3 FRP + 1P showed 34 partition panels (correct = 12)
- Cause: calculateFRPTieRods() returned hardware items pushed into bom.partition[]
- Fix: Line 1889 — moved partition hardware to bom.hardware[]
- Verified: Partition panels = 12 ✅

### BUG 2 — FRP partition direction ignored
- Symptom: Switching "Across Length" vs "Across Width" had no effect
- Cause: partitionSpan hardcoded as Math.min(lengthPanels, widthPanels)
- Fix: Line 1388 — added partitionDirection='width' to inputs
        Line 1414 — replaced Math.min with direction-aware logic
- Verified: Width=12, Length=15 ✅

### BUG 3 — Steel partition direction ignored
- Same bug as FRP, in calculateSteelBOM()
- Fix: Line 2059 — added partitionDirection='width' to inputs
        Line 2088 — replaced Math.min with direction-aware logic
- Verified: Width=6 wall panels, Length=9 wall panels ✅

## AUDIT RESULT
- bom.partition[] contains panels only (confirmed) ✅
- totalPanels excludes hardware/accessories (confirmed) ✅
- No further fixes needed for partition section
- Auth error handling: stale tokens handled gracefully (confirmed) ✅

### BUG 4 — Stale auth token crashes app (FIXED)
- Symptom: Firefox showed endless "Loading calculator..." on live site
- Error: "AuthApiError: Invalid Refresh Token: Refresh Token Not Found"
- Cause: app/context/AuthContext.js didn't catch errors from supabase.auth.getSession() — stale browser tokens crashed the entire app
- Fix: Wrapped getSession() and onAuthStateChange() in try-catch blocks
- Commit: fb2af7c
- Result: Users with expired tokens now get silently signed out and see login page instead of crash

## NEXT PRIORITIES (unchanged)
- TBAB height code breakdown (1H/2H/std)
- FRP Patch Tape (PF0000012)
- Type 2 Corner Tape for Steel (PF0000014-10M)
- Phase 2: Drawing Generator
- Phase 2: Odd-Shape Tank Calculator

## DEPLOYMENT
- Live: https://sunnik-cal.vercel.app/calculator
- GitHub: https://github.com/nennen123/sunnik-cal
