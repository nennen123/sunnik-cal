# Change Log - Tank Calculator

**Purpose:** Track every change made to the project
**Update:** After EVERY work session
**Format:** Most recent entries at top

---

## 📋 How to Use This File

**After Each Session:**
1. Copy the template from bottom of this file
2. Fill in all sections
3. Paste at top (below this section)
4. Commit changes

**Before Each Session:**
1. Read the last 2-3 entries
2. Understand what was done recently
3. Know what to work on next

---

## [2025-11-27] - Session 2: Accessories SKU Format + Price Application Fix

**Who:** Nelson + Claude
**Duration:** ~20 minutes
**Branch:** main

### What Changed

1. **Accessories SKU Format Update** - Now matches database format:
   - Water Level Indicator: `WLI-BT-{height}M` (e.g., `WLI-BT-30M`)
   - Internal Ladder: `IL-{material}-{height}` (e.g., `IL-SS304-12ft`)
   - External Ladder: `EL-{material}-{height}` (e.g., `EL-HDG-30M`)
   - Safety Cage: `SafetyCage-{height}-{material}` (e.g., `SafetyCage-12ft-HDG`)
   - SS316 ladders fall back to SS304 (no SS316 ladders in database)

2. **Price Application Fix** - handleCalculate now includes all sections:
   - Added `result.supports = applyPrices(result.supports || [])`
   - Added `result.accessories = applyPrices(result.accessories || [])`
   - Total cost now includes supports and accessories

### Files Modified
- `app/lib/bomCalculator.js` - New accessories SKU format with height codes
- `app/calculator/page.js` - Apply prices to supports and accessories

### Database Update Required
Run in Supabase SQL Editor:
```sql
UPDATE products
SET is_available = true
WHERE sku LIKE 'WLI-%'
   OR sku LIKE 'IL-%'
   OR sku LIKE 'EL-%'
   OR sku LIKE 'SafetyCage-%';
```

---

## [2025-11-27] - Bug Fixes: Freeboard, Thickness Calculation, Partition SKUs

**Who:** Nelson + Claude
**Duration:** ~30 minutes
**Branch:** main

### What Changed
Fixed three bugs in the calculator:

1. **Freeboard Input Fix** - Users entering "200" thinking mm got -9,800,000L capacity
   - Changed default from 0.1m to 0.2m (200mm)
   - Added minimum of 0.2m
   - Updated label to "Freeboard (meters)"
   - Fixed QuoteSummary.js which was treating freeboard as mm

2. **Thickness Calculation Fix** - getThicknessByHeight now tier-based
   - Replaced hardcoded height ranges with dynamic tier calculation
   - Uses `Math.ceil(height / panelSize)` for tier count
   - Supports both Metric (1m panels) and Imperial (1.22m panels)

3. **Partition Panel SKU Fix** - Changed φ to ¢
   - SKUs now use `C¢` and `B¢` instead of `Cφ` and `Bφ`
   - Matches database SKU format

### Files Modified
- `app/calculator/page.js` - Added freeboard: 0.2 to default state
- `app/calculator/components/TankInputs.js` - Updated freeboard input (min 0.2, meters)
- `app/calculator/components/QuoteSummary.js` - Fixed freeboard treated as meters not mm
- `app/lib/pdfGenerator.js` - Updated freeboard default to 0.2
- `app/lib/bomCalculator.js` - Replaced getThicknessByHeight, fixed partition symbols
- `docs/CURRENT_STATUS.md` - Updated status

### Tests Run
- ✅ Syntax check passed for all modified files
- ✅ Dev server starts without errors

### Next Steps
1. Test calculator with various configurations
2. Verify pricing lookups
3. Test PDF generation

---

## [2025-11-06] - Session 3 - Memory System Creation

**Who:** [Your Name] + Claude
**Duration:** ~1 hour
**Branch:** main (or develop)

### What Changed
Created 5 permanent memory system files to prevent forgetting between sessions.

### Files Created
- ✅ `/docs/START_HERE.md` - Instructions for every new chat session
- ✅ `/docs/CURRENT_STATUS.md` - Current bugs, test results, what works/breaks
- ✅ `/docs/QUICK_REFERENCE.md` - Business rules and calculations (condensed)
- ✅ `/docs/CHANGELOG.md` - This file (session tracking)
- ✅ `/docs/SESSION_TEMPLATE.md` - Template for documenting sessions

### Files Modified
- None (all new files)

### Tests Run
- ⚠️ None - Documentation phase

### Test Results
**Before:** 3/6 validation tests passing (50%)
**After:** Not applicable (no code changes)

### Status Updates
**CURRENT_STATUS.md:** Created with all 6 test results and 3 critical bugs documented
**System Progress:** Still 75% - No code changes yet

### What Worked Well
- ✅ Created comprehensive documentation system
- ✅ All current knowledge captured in files
- ✅ Clear instructions for future sessions
- ✅ Test results documented as validation targets

### What Didn't Work
- N/A - Documentation phase only

### Issues Discovered
- Confirmed: 3rd rebuild due to incomplete business rules
- Confirmed: Need to document FRP vs Steel differences before fixing code
- Confirmed: Need complete build standard rules (SONS, BSI, LPCB, MS1390)

### Next Session Priority
1. **Document FRP vs Steel differences** (complete list)
2. **Document build standards** (SONS, BSI, LPCB, MS1390, SANS)
3. **Document panel thickness rules** (all scenarios)
4. **Create validation test suite** (6 real quotes as automated tests)

### Blocking Issues
- None - Ready to start documentation

### Notes
- This memory system should prevent forgetting forever
- Each file serves specific purpose (read START_HERE.md for details)
- New chat sessions should read these 5 files first
- Small focused changes with testing after each

### Git Commit
````bash
git add docs/
git commit -m "Add memory system files - prevent session forgetting

Created 5 core documentation files:
- START_HERE.md: Instructions for every session
- CURRENT_STATUS.md: Bugs, tests, current state
- QUICK_REFERENCE.md: Business rules condensed
- CHANGELOG.md: Session tracking
- SESSION_TEMPLATE.md: Documentation template

This prevents losing progress between sessions and rebuilding 4th time."
git push
````

---

## [2025-11-06] - Session 2 - Bug Investigation

**Who:** [Your Name] + Claude
**Duration:** ~45 minutes
**Branch:** main

### What Changed
Tested calculator with 3 additional test cases to identify patterns in bugs.

### Files Created
- None

### Files Modified
- None (testing only)

### Tests Run
- ✅ Test 4: 5×5×4ft HDG Imperial + 1 partition
- ✅ Test 5: 8×8×2m FRP + 0 partitions
- ✅ Test 6: 12×12×4ft SS316 Imperial + 1 partition

### Test Results
**Test 4 (HDG):**
- Bolts: 4,992 (expected 3,840) - 30% too high ❌
- All wall panels: RM 367.29 regardless of thickness ❌
- Roof panels: RM 97.89 (different from walls) ✅

**Test 5 (FRP):**
- Bolts: 5,990 (expected 4,898) - 22% too high ❌
- Base panels: RM 135.91 ✅ (varied pricing!)
- Wall panels: RM 104.09 ✅ (different from base!)
- Roof panels: RM 150.00 ⚠️ (possibly placeholder)

**Test 6 (SS316 Imperial):**
- Bolts: 17,280 (expected 20,064) - 14% too low ❌
- ALL panels: RM 150.00 ❌ (complete placeholder!)
- Roof panels: RM 375.00 ❌ (placeholder!)
- **RM 106K quote with fake prices!** 🔴

### Status Updates
**Pass Rate:** 0/6 fully passing, 1/6 partially passing (Test 5 FRP)

### What Worked Well
- ✅ Test 5 (FRP) showed varied panel pricing - proof that pricing CAN work!
- ✅ Identified pattern: Imperial panels have major pricing issues
- ✅ Discovered bolt calculation inconsistent across all materials

### What Didn't Work
- ❌ Comprehensive fix prompt from earlier session did not fix the issues
- ❌ Bolt calculation still broken across all tests (14-44% error range)
- ❌ Imperial pricing severely broken (HDG same prices, SS316 all placeholders)

### Issues Discovered
- **BUG-002 CRITICAL:** Imperial SS316 using complete placeholder pricing (RM 106K quote)
- **BUG-003 HIGH:** HDG Imperial all wall panels same price regardless of thickness
- **Pattern:** Bolt errors vary wildly (+44%, +30%, +22%, -14%, -20%) suggesting multiple bugs in formula

### Next Session Priority
1. Create memory system to prevent losing progress (CRITICAL!)
2. Document complete business rules before attempting more fixes
3. Break down fixes into small, testable chunks
4. Stop trying to fix everything at once

### Blocking Issues
- Cannot fix code effectively without complete business rules documented
- Keep rebuilding because requirements incomplete
- Need memory system to prevent 4th rebuild

### Notes
- This is the 3rd time rebuilding the app
- Problem: Business logic incomplete when we start coding
- Solution: Document EVERYTHING first, then code
- Need memory system to prevent forgetting between sessions

### Git Commit
````bash
# No code changes - testing only
# Added test results to notes
````

---

## [2025-11-06] - Session 1 - Initial Bug Discovery

**Who:** [Your Name] + Claude
**Duration:** ~30 minutes
**Branch:** main

### What Changed
Ran comprehensive fix prompt to address bolt calculation and pricing issues.

### Files Created
- None (attempted fixes in existing files)

### Files Modified
- `lib/bomCalculator.js` (attempted fixes - did not work)

### Tests Run
- ✅ Test 1: 5×5×3m SS316 Metric + 1 partition
- ✅ Test 2: 8×8×4m FRP + 1 partition
- ✅ Test 3: 8×8×4ft SS304 Imperial + 1 partition

### Test Results
**Test 1 (SS316 Metric):**
- Bolts: 4,224 (expected 5,299) - 20% too low ❌
- Base panel 4.5mm: RM 284.94
- Wall panel 3.0mm: RM 463.50 ❌ (thinner MORE expensive!)
- Partition: RM 150.00 (placeholder)

**Test 2 (FRP):**
- Bolts: 6,144 (expected 4,898) - 25% too high ❌
- All panels: RM 150.00 (placeholder) ❌

**Test 3 (SS304 Imperial):**
- Bolts: 10,080 (expected 7,008) - 44% too high ❌
- All panels same price: RM 514.00 ❌

### Status Updates
**Pass Rate:** 0/6 tests passing

### What Worked Well
- ✅ Identified 3 critical bugs affecting all quotes
- ✅ Confirmed bolt calculation broken
- ✅ Confirmed pricing lookup issues

### What Didn't Work
- ❌ Comprehensive fix prompt did not resolve issues
- ❌ Bolt calculation still incorrect after fixes
- ❌ Pricing still using placeholders or wrong values

### Issues Discovered
- **BUG-001:** Bolt calculation formula inconsistent (errors from -20% to +44%)
- **BUG-002:** Panel pricing backwards (3mm costs more than 4.5mm)
- **BUG-004:** Partition panels using wrong SKUs (missing φ symbol)

### Next Session Priority
1. Run more tests to identify patterns
2. Understand why comprehensive fix didn't work
3. Consider creating memory system to prevent repeated mistakes

### Blocking Issues
- Comprehensive fix prompt did not work
- Need to identify actual code issues, not just try to fix blindly
- May need to document complete business rules first

### Notes
- This is after 2 previous rebuilds
- Losing track of what works and what doesn't
- Need better system for tracking changes and testing

### Git Commit
````bash
git add lib/bomCalculator.js
git commit -m "Attempted comprehensive fix for bolt and pricing bugs

Issues remained:
- Bolt calculation still 20-44% off
- Pricing still using placeholders
- Imperial panels severely broken

Need different approach - likely need complete documentation first."
git push
````

---

## 📋 SESSION TEMPLATE (Copy This for New Entries)
````markdown
## [YYYY-MM-DD] - Session X - [Brief Title]

**Who:** [Your Name] + Claude
**Duration:** ~XX minutes
**Branch:** [branch name]

### What Changed
[Brief description of what you worked on]

### Files Created
- [ ] File path and description
- [ ] File path and description

### Files Modified
- [ ] File path (what changed)
- [ ] File path (what changed)

### Tests Run
- [ ] Test name/description
- [ ] Test name/description

### Test Results
**Test Name:**
- Result 1
- Result 2

**Before:** X/6 tests passing
**After:** Y/6 tests passing

### Status Updates
[Update to CURRENT_STATUS.md made? What changed?]

### What Worked Well
- ✅ Thing that worked
- ✅ Thing that worked

### What Didn't Work
- ❌ Thing that failed
- ❌ Thing that failed

### Issues Discovered
- **BUG-XXX:** Description
- **Issue:** Description

### Next Session Priority
1. First thing to do
2. Second thing to do
3. Third thing to do

### Blocking Issues
- Issue preventing progress
- Issue preventing progress

### Notes
[Any additional context, decisions made, things to remember]

### Git Commit
```bash
git add [files]
git commit -m "[Commit message]

[Detailed description of changes]
[Why changes were made]
[Test results]"
git push
```
````

---

## 📝 Writing Good Changelog Entries

### Do This:
- ✅ Be specific about what changed
- ✅ Include test results (before/after)
- ✅ Note what worked AND what didn't
- ✅ Link to bug IDs (BUG-001, etc.)
- ✅ Note blocking issues
- ✅ Update after EVERY session

### Don't Do This:
- ❌ Vague entries like "fixed stuff"
- ❌ Skip test results
- ❌ Only mention what worked (failures are learning!)
- ❌ Forget to update for multiple days
- ❌ Leave out git commit details

### Example - Good Entry:
````markdown
## [2025-11-10] - Session 5 - Fixed Bolt Calculation

**Files Modified:**
- lib/boltCalculator.js (lines 12-45)

**Test Results:**
Before: 0/6 passing
After: 6/6 passing ✅

**What Changed:**
- Applied material-specific bolts per side (13/16/20)
- Added shared-edge division (÷2)
- Added 20% buffer (×1.2)

**Git Commit:** abc123def
````

### Example - Bad Entry:
````markdown
## [2025-11-10] - Fixed some bugs

Changed some code. It works better now.
````

---

**Remember:** Update this file AFTER EVERY work session! Future you will thank present you! 🙏

**Last Updated:** 2025-11-06
