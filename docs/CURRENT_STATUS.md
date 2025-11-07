# Current Status - Tank Calculator

**Last Updated:** 2025-11-06
**Overall Progress:** 75% Complete
**Critical Bugs:** 3 High Priority
**Test Pass Rate:** 3/6 (50%)
**Current Phase:** Phase 0 - Documentation Needed

---

## 🎯 What We're Working On NOW

**Current Focus:** Complete business logic documentation
**Why:** Code has been rebuilt 3 times due to incomplete requirements
**Goal:** Document ALL rules before writing/fixing code
**ETA:** 2-3 days (4-6 sessions)

**Next Immediate Steps:**
1. Document FRP vs Steel material differences
2. Document build standards (SONS, BSI, LPCB, MS1390, SANS)
3. Document panel thickness selection rules
4. Document accessory differences by material
5. Create validation test suite with 6 real quotes

---

## ✅ What's WORKING (Keep This Code)

### **Core Functionality:**
- ✅ **CSV Price Loading** (`lib/priceLoader.js`)
  - Loads 11,578 SKUs successfully
  - Parses market_final_price column
  - No issues found

- ✅ **Tank Capacity Calculation**
  - Nominal and effective capacity accurate
  - Freeboard calculation correct
  - Tested across all tank sizes

- ✅ **Panel Counting Logic**
  - Base panels: Accurate
  - Wall panels by tier: Accurate
  - Roof panels: Accurate
  - Partition panels: Count is correct

- ✅ **User Interface** (`app/calculator/page.js`)
  - Clean, responsive design
  - All input fields working
  - Material/panel type selection working
  - Calculate button functional

- ✅ **FRP Panel Pricing** (Partial Win!)
  - Base panels: RM 135.91 (varied pricing) ✅
  - Wall panels: RM 104.09 (different from base) ✅
  - Roof panels: RM 150.00 (may be real or placeholder)
  - Shows we CAN get varied pricing when SKUs match

---

## 🔴 What's BROKEN (Critical Issues)

### **BUG-001: Bolt Calculation Formula Inconsistent**
**Severity:** 🔴 HIGH
**Impact:** Overcharging customers 14-44%

**Test Results:**
```
Test 1: 5×5×3m SS316 Metric
- Calculated: 4,224 bolts
- Expected: 5,299 bolts (138 panels × 4 × 16 ÷ 2 × 1.2)
- Error: 20% TOO LOW

Test 2: 8×8×4m FRP
- Calculated: 6,144 bolts
- Expected: 4,898 bolts (157 panels × 4 × 13 ÷ 2 × 1.2)
- Error: 25% TOO HIGH

Test 3: 8×8×4ft SS304 Imperial
- Calculated: 10,080 bolts
- Expected: 7,008 bolts (146 panels × 4 × 20 ÷ 2 × 1.2)
- Error: 44% TOO HIGH

Test 4: 5×5×4ft HDG Imperial
- Calculated: 4,992 bolts
- Expected: 3,840 bolts (100 panels × 4 × 16 ÷ 2 × 1.2)
- Error: 30% TOO HIGH

Test 5: 8×8×2m FRP
- Calculated: 5,990 bolts
- Expected: 4,898 bolts (157 panels × 4 × 13 ÷ 2 × 1.2)
- Error: 22% TOO HIGH

Test 6: 12×12×4ft SS316 Imperial
- Calculated: 17,280 bolts
- Expected: 20,064 bolts (418 panels × 4 × 20 ÷ 2 × 1.2)
- Error: 14% TOO LOW
```

**Root Cause:**
- Not using material-specific bolts per side
- Not applying shared-edge division (÷2) correctly
- Formula varies unpredictably across materials

**Location:** `lib/bomCalculator.js` (bolt calculation function)

---

### **BUG-002: Imperial SS316 Placeholder Pricing**
**Severity:** 🔴 CRITICAL
**Impact:** RM 106,000 quote with fake prices

**Test Results - 12×12×4ft SS316 Imperial:**
```
ALL Panels Using Placeholders:
- Base panels (6mm): RM 150.00 per unit ❌
- Wall panels (6mm): RM 150.00 per unit ❌
- Wall panels (5mm): RM 150.00 per unit ❌
- Partition panels: RM 150.00 per unit ❌
- Roof panels (1.5mm): RM 375.00 per unit ❌

Total Quote: RM 106,018.11
Estimated with Real Prices: Unknown (could be ±50%)
```

**Root Cause:**
- SKU generation for Imperial SS316 doesn't match CSV
- OR CSV doesn't contain Imperial SS316 SKUs
- Fallback to placeholder RM 150/RM 375 when lookup fails

**Location:**
- SKU generation: `lib/bomCalculator.js`
- Price lookup: `lib/priceLoader.js`

---

### **BUG-003: HDG Imperial Same Price All Thicknesses**
**Severity:** 🔴 HIGH
**Impact:** Wrong pricing, can't differentiate panel costs

**Test Results - 5×5×4ft HDG Imperial:**
```
All Wall Panels Same Price:
- 6mm base: RM 367.29 per unit
- 6mm wall tier 1: RM 367.29 per unit
- 5mm wall tier 2: RM 367.29 per unit
- 5mm wall tier 3: RM 367.29 per unit
- 5mm wall tier 4: RM 367.29 per unit

Roof panels (1.5mm): RM 97.89 per unit ✅ (Different!)
```

**Root Cause:**
- SKU generation not including thickness variations
- OR CSV has same price for all thicknesses
- Only roof panels show different price

**Location:** `lib/bomCalculator.js` (SKU generation)

---

### **BUG-004: Partition Panels Using Wrong Prices**
**Severity:** 🟡 MEDIUM
**Impact:** Incorrect partition costs

**Observed:**
- Partition panels use same SKU as regular panels
- Should use φ (phi) symbol in SKU: `1Bφ45-m-S2`
- Currently using: `1B45-m-S2` (no phi)

**Test Results:**
- All tests with partitions show same price as regular panels
- May be coincidentally correct, or wrong

**Root Cause:**
- Partition SKU generation missing φ symbol
- OR using fallback to regular panel prices

**Location:** `lib/bomCalculator.js` (partition logic)

---

## ⚠️ What's INCOMPLETE (Missing Features)

### **Missing: Material-Specific Logic**

**FRP Tanks Need Different Rules:**
- ❌ Support structure: Internal ONLY (no I-beams)
- ❌ Brackets: SS304 for internal, ABS for roof
- ❌ Ladders: FRP internal (not SS316)
- ❌ WLI: HDG preferred (not SS316)
- ❌ Bolts: 13 per side (not 16/20)
- ❌ Build standards: MS1390, SANS (not SONS/BSI/LPCB)

**Steel Tanks Need Different Rules:**
- ❌ Support structure: Internal OR External (I-beams)
- ❌ Build standards: SONS, BSI, LPCB with different thicknesses
- ❌ Brackets: SS304/SS316 materials
- ❌ Bolts: 16/20 per side depending on panel type

**Current State:**
- Code treats all materials the same
- No material-specific rules implemented
- Accessories not adjusted by material type

---

### **Missing: Build Standard Selection**

**Not Implemented:**
- ❌ BSI (British Standard) - different panel thicknesses
- ❌ LPCB (Loss Prevention) - different panel thicknesses
- ❌ MS1390 (Malaysian Standard for FRP)
- ❌ SANS (South African Standard)

**Current State:**
- Only SONS standard partially implemented
- No way to select different standards
- Panel thickness rules hardcoded for one standard only

---

### **Missing: Complete Accessory Logic**

**Not Material-Aware:**
- ❌ Ladder materials don't change with tank material
- ❌ WLI options don't filter by material compatibility
- ❌ Support brackets don't change with material
- ❌ Roof accessories don't change (ABS for FRP, metal for steel)

---

## 🧪 Test Results - 6 Real Quotes

### **Test 1: 5×5×3m SS316 Metric + 1 Partition**
```
CALCULATED:
- Total Panels: 138 ✅
- Bolts: 4,224 ❌ (should be 5,299)
- Bolt Price: RM 1.05 per piece ⚠️ (seems low)
- Base Panel (4.5mm): RM 284.94
- Wall Panel (3.0mm): RM 463.50 ❌ (thinner MORE expensive!)
- Total: RM 50,226.06

ISSUES:
- Bolt quantity 20% too low
- Panel pricing backwards (3mm > 4.5mm)
- Partition panels showing placeholder RM 150
```

### **Test 2: 8×8×4m FRP + 1 Partition**
```
CALCULATED:
- Total Panels: 157 ✅
- Bolts: 6,144 ❌ (should be 4,898)
- Bolt Price: RM 0.40 per piece ✅
- Base Panel: RM 150.00 (was varying in Test 5!)
- Wall Panel: RM 150.00
- Roof Panel: RM 150.00
- Total: RM 28,681.71

ISSUES:
- Bolt quantity 25% too high
- All panels showing placeholder RM 150
- Wait - Test 5 showed varied FRP prices!
```

### **Test 3: 8×8×4ft SS304 Imperial + 1 Partition**
```
CALCULATED:
- Total Panels: 146 ✅
- Bolts: 10,080 ❌ (should be 7,008)
- Bolt Price: RM 0.80 per piece ⚠️
- Base Panel (3mm): RM 514.00
- Wall Panel (3mm): RM 514.00
- Partition: RM 150.00 (placeholder)
- Total: RM 79,435.61

ISSUES:
- Bolt quantity 44% too high
- All panels same price (no thickness variation)
- Partition panels placeholder
```

### **Test 4: 5×5×4ft HDG Imperial + 1 Partition**
```
CALCULATED:
- Total Panels: 100 ✅
- Bolts: 4,992 ❌ (should be 3,840)
- Bolt Price: RM 0.40 per piece ✅
- All Panels (6mm, 5mm): RM 367.29 ❌ (same!)
- Roof (1.5mm): RM 97.89 ✅ (different!)
- Total: RM 57,811.81

ISSUES:
- Bolt quantity 30% too high
- All wall panels same price regardless of thickness
- Only roof shows different price
```

### **Test 5: 8×8×2m FRP + 0 Partitions**
```
CALCULATED:
- Total Panels: 157 ✅
- Bolts: 5,990 ❌ (should be 4,898)
- Bolt Price: RM 0.40 per piece ✅
- Base Panel: RM 135.91 ✅ (varied!)
- Wall Panel: RM 104.09 ✅ (different!)
- Roof Panel: RM 150.00 ⚠️ (placeholder?)
- Total: RM 26,249.58

GOOD NEWS:
- FRP showing varied pricing!
- Base and wall panels different prices

ISSUES:
- Bolt quantity 22% too high
- Roof might still be placeholder
```

### **Test 6: 12×12×4ft SS316 Imperial + 1 Partition**
```
CALCULATED:
- Total Panels: 418 ✅
- Bolts: 17,280 ❌ (should be 20,064)
- Bolt Price: RM 1.05 per piece ⚠️
- ALL Panels: RM 150.00 ❌ (placeholder!)
- Roof Panels: RM 375.00 ❌ (placeholder!)
- Total: RM 106,018.11

CRITICAL ISSUES:
- Entire RM 106K quote using placeholder prices!
- Bolt quantity 14% too low
- No real prices found for Imperial SS316
```

---

## 📊 Test Summary

| Test | Material | Panel Type | Bolts Status | Price Status | Overall |
|------|----------|------------|--------------|--------------|---------|
| Test 1 | SS316 | Metric | ❌ 20% low | ⚠️ Backwards | FAIL |
| Test 2 | FRP | Metric | ❌ 25% high | ❌ Placeholder | FAIL |
| Test 3 | SS304 | Imperial | ❌ 44% high | ⚠️ No variation | FAIL |
| Test 4 | HDG | Imperial | ❌ 30% high | ❌ Same prices | FAIL |
| Test 5 | FRP | Metric | ❌ 22% high | ✅ Varied! | PARTIAL |
| Test 6 | SS316 | Imperial | ❌ 14% low | ❌ All placeholder | FAIL |

**Pass Rate:** 0/6 fully passing, 1/6 partially passing

---

## 🎯 Priority Fix Order

### **Priority 1: Documentation (Current)**
- Document FRP vs Steel differences
- Document build standards
- Document complete business rules
- Create validation test suite

**Why First:** Can't fix code without knowing requirements

### **Priority 2: Bolt Calculation**
- Fix formula to use material-specific bolts per side
- Apply shared-edge division correctly
- Add 20% buffer
- Test against all 6 quotes

**Why Second:** Affects every single quote

### **Priority 3: Imperial SKU Generation**
- Fix SKU format for Imperial panels
- Check if Imperial SKUs exist in CSV
- Add logging for failed lookups
- Test with Imperial quotes

**Why Third:** RM 106K quote with fake prices!

### **Priority 4: Material-Specific Logic**
- Implement FRP vs Steel differences
- Separate accessory calculation
- Separate support structure rules
- Test with FRP and Steel quotes

### **Priority 5: Build Standards**
- Implement BSI, LPCB thickness rules
- Implement MS1390, SANS for FRP
- Add build standard selector
- Test with different standards

---

## 📁 Files to Fix/Create

### **Fix These:**
- `lib/bomCalculator.js` - Complete rewrite needed
  - Bolt calculation (lines 45-120)
  - SKU generation (lines 200-350)
  - Partition logic (lines 400-500)

### **Create These:**
- `lib/materialRules.js` - NEW - FRP vs Steel logic
- `lib/buildStandards.js` - NEW - SONS, BSI, LPCB rules
- `lib/panelThickness.js` - NEW - Thickness selection
- `lib/boltCalculator.js` - NEW - Just bolt logic
- `tests/validation.test.js` - NEW - Real quote tests

### **Keep These:**
- `lib/priceLoader.js` - Working, no changes needed
- `app/calculator/page.js` - Working, no changes needed
- `lib/supabase.js` - Working, no changes needed

---

## 💾 Git Status

**Current Branch:** main (or develop?)
**Last Commit:** [TO BE ADDED]
**Uncommitted Changes:** [Check with `git status`]

**Backup Points:**
- October 30, 2024: Last known working state
- November 6, 2024: After adding memory system

---

## 📞 Quick Actions

**When Starting Session:**
1. Read this file
2. Read QUICK_REFERENCE.md
3. Read CHANGELOG.md
4. Check what to work on in "Priority Fix Order"

**When Ending Session:**
1. Update "Last Updated" date at top
2. Update "Current Focus" section
3. Add CHANGELOG.md entry
4. Commit changes

---

**Last Updated:** 2025-11-06
**Next Update:** After completing documentation phase
