# ✅ CALCULATION UPDATE TESTING CHECKLIST

**Use this after ANY changes to bomCalculator.js**  
**Date:** [Fill in when using]  
**Change Made:** [Describe what you updated]

---

## 🧪 MANDATORY TESTS

### Test 1: Basic Metric Tank (No Partition)
```
Input:
- Dimensions: 5m × 5m × 2m
- Panel Type: Metric (1m × 1m)
- Material: SS316
- Partitions: 0

Expected Results:
- Base Panels: 33 total
  • B: 20 (perimeter)
  • BCL: 2
  • BCR: 2
  • A: 9 (interior)
- Wall Panels: 40 total
  • Tier 1: 4 B + 16 A = 20
  • Tier 2: 4 C + 16 B = 20
- Roof Panels: 25 total
  • R: 21
  • R(AV): 2
  • MH: 2
- Grand Total: 98 panels

Status: [ ] PASS  [ ] FAIL
Notes: _________________________
```

### Test 2: Imperial Tank
```
Input:
- Dimensions: 12ft × 12ft × 8ft (3.66m × 3.66m × 2.44m)
- Panel Type: Imperial (4ft × 4ft)
- Material: HDG
- Partitions: 0

Expected Results:
- Panel Grid: 3 × 3 × 2
- Base Panels: 17 total
  • B: 12 (perimeter)
  • BCL: 2
  • BCR: 2
  • A: 1 (interior)
- Wall Panels: 24 total
  • Tier 1: 4 B + 8 A = 12
  • Tier 2: 4 C + 8 B = 12
- Roof Panels: 9 total
  • R: 5
  • R(AV): 2
  • MH: 2
- Grand Total: 50 panels

Status: [ ] PASS  [ ] FAIL
Notes: _________________________
```

### Test 3: With Single Partition
```
Input:
- Dimensions: 8m × 5m × 3m
- Panel Type: Metric
- Material: SS304
- Partitions: 1

Expected Results:
- Partition runs across: 5m width (shorter side)
- Partition Span: 5 panels
- Base AB Support: (5-4) = 1 panel
- Partition Base Corners: 2 BCL + 2 BCR = 4
- Partition Walls (per tier): 2 Cφ + 3 Bφ = 5 panels
- Total Partition Panels: 5 × 3 tiers = 15 panels

Status: [ ] PASS  [ ] FAIL
Notes: _________________________
```

### Test 4: Multiple Partitions
```
Input:
- Dimensions: 10m × 10m × 4m
- Panel Type: Metric
- Material: MS
- Partitions: 2

Expected Results:
- Partition Span: 10 panels (square tank)
- Base AB: (10-4) = 6 per partition × 2 = 12 panels
- Partition BCL/BCR: 2 × 2 partitions = 8 corners
- Partition Walls: (2 Cφ + 8 Bφ) × 4 tiers × 2 partitions = 80 panels

Status: [ ] PASS  [ ] FAIL
Notes: _________________________
```

### Test 5: FRP Tank
```
Input:
- Dimensions: 2m × 2m × 1m
- Material: FRP
- Partitions: 0

Expected Results:
- Base: 4 × 3B10-FRP
- Walls: 8 × 3S10-FRP-A (perimeter)
- Roof: 1 × 2R00-FRP (4 - 3 reserved)

Status: [ ] PASS  [ ] FAIL
Notes: _________________________
```

---

## 🔍 VALIDATION CHECKS

### SKU Format Validation
Run each test and verify:
- [ ] All SKUs follow correct format pattern
- [ ] Thickness codes formatted correctly (remove decimal point)
- [ ] Material codes match (S2, S1, HDG, MS)
- [ ] Panel type codes correct (m or i)

### Price Lookup Validation
- [ ] All generated SKUs exist in sku_prices.csv
- [ ] No SKUs with $0.00 price (except intentional)
- [ ] "our_final_price" column used correctly
- [ ] Line totals calculated properly (qty × price)

### Quantity Validation
- [ ] No negative quantities
- [ ] No decimal quantities (all whole numbers)
- [ ] Corner panels always = 4 (for main tank per tier)
- [ ] Partition quantities multiply correctly

### Thickness Validation
- [ ] Correct thickness applied per tier
- [ ] Heavier panels at bottom tiers
- [ ] Lighter panels at top tiers
- [ ] Partition uses same thickness as main walls

---

## 📊 EDGE CASE TESTS

### Edge Case 1: Minimum Tank
```
Input: 1m × 1m × 1m, Metric, SS316, 0 partitions

Expected:
- Smallest possible tank
- Base: 4 B + 2 BCL + 2 BCR = 8 panels (no interior)
- Wall: 4 B + 0 A = 4 panels
- Roof: 0 R + 2 R(AV) + 2 MH = 4 panels (no room for R)
- Total: 16 panels minimum

Status: [ ] PASS  [ ] FAIL
```

### Edge Case 2: Maximum Partitions
```
Input: 20m × 20m × 4m, Metric, HDG, 5 partitions

Check:
- [ ] Partition quantities × 5
- [ ] No calculation errors at scale
- [ ] Reasonable grand total

Status: [ ] PASS  [ ] FAIL
```

### Edge Case 3: Odd Dimensions
```
Input: 7.3m × 4.7m × 2.8m, Metric, MS, 1 partition

Check:
- [ ] Ceiling function works (8 × 5 × 3 panels)
- [ ] Partition on shorter side (5 panels)
- [ ] All calculations handle non-even numbers

Status: [ ] PASS  [ ] FAIL
```

---

## 🎯 MATERIAL-SPECIFIC TESTS

Test EACH material type with standard tank:

### SS316 (Material Code: S2)
Input: 5m × 5m × 2m, Metric, 0 partitions
- [ ] SKUs end with "-m-S2"
- [ ] Prices pulled correctly
- [ ] Total calculated

### SS304 (Material Code: S1)
Input: 5m × 5m × 2m, Metric, 0 partitions
- [ ] SKUs end with "-m-S1"
- [ ] Prices pulled correctly
- [ ] Total calculated

### HDG (Hot Dip Galvanized)
Input: 5m × 5m × 2m, Metric, 0 partitions
- [ ] SKUs end with "-m-HDG"
- [ ] Prices pulled correctly
- [ ] Total calculated

### MS (Mild Steel)
Input: 5m × 5m × 2m, Metric, 0 partitions
- [ ] SKUs end with "-m-MS"
- [ ] Prices pulled correctly
- [ ] Total calculated

### FRP (Fiberglass)
Input: 2m × 2m × 1m, 0 partitions
- [ ] Uses FRP panel codes (3B10, 3S10, 2R00)
- [ ] Correct FRP SKU format
- [ ] Prices pulled correctly

---

## 🧮 MANUAL CALCULATION SPOT CHECK

Pick one test case and manually calculate:

**Selected Test:** [Test #]

**Manual Calculation:**
```
Panel Size: _____
Grid: _____ × _____ × _____

BASE PANELS:
- Perimeter B: _____
- Corners (BCL+BCR): _____
- Interior A: _____
- Subtotal: _____

WALL PANELS:
Tier 1: _____ + _____ = _____
Tier 2: _____ + _____ = _____
[Add more tiers if needed]
Subtotal: _____

PARTITION (if any):
- Base support: _____
- Wall panels: _____
- Subtotal: _____

ROOF PANELS:
- R: _____
- R(AV): _____
- MH: _____
- Subtotal: _____

GRAND TOTAL: _____
```

**Calculator Output:** _____

**Match?** [ ] YES  [ ] NO

If NO, investigate: _________________________

---

## 📝 REGRESSION TESTS

Compare output to previous version:

### Before Update
- Test Case: 5m × 5m × 2m, SS316
- Total Panels: _____
- Total Cost: RM _____

### After Update
- Total Panels: _____
- Total Cost: RM _____

### Changes Expected?
[ ] YES - because: _________________________
[ ] NO - should be identical

---

## 🚨 ERROR SCENARIOS

### What to Check If Tests Fail

#### Negative Quantities
- [ ] Check subtraction logic in panel calculations
- [ ] Verify Math.max() used where needed
- [ ] Check partition span calculations

#### Zero Prices
- [ ] Verify SKU format exactly matches CSV
- [ ] Check material code mapping
- [ ] Confirm thickness code (decimal removed)

#### Wrong Tier Count
- [ ] Check height range conditions
- [ ] Verify tier array length
- [ ] Check forEach loop logic

#### Partition Issues
- [ ] Verify Math.min() for shorter side
- [ ] Check multiplication by partitionCount
- [ ] Verify AB calculation formula

---

## ✅ SIGN-OFF

**All Tests Completed:** [ ] YES  [ ] NO

**Test Date:** _____________

**Tested By:** _____________

**Issues Found:** 
_________________________
_________________________
_________________________

**Resolution:**
_________________________
_________________________
_________________________

**Approved for Production:** [ ] YES  [ ] NO

**Notes:**
_________________________
_________________________
_________________________

---

## 📋 QUICK PASS/FAIL SUMMARY

Total Tests Run: _____
Tests Passed: _____
Tests Failed: _____
Pass Rate: _____% (should be 100%)

**Overall Status:** [ ] READY  [ ] NEEDS WORK

---

**Save this checklist after each update to track testing history.**
