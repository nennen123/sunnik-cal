# Quick Reference - Business Rules & Calculations

**Last Updated:** 2025-11-06
**Purpose:** Condensed business rules for quick lookup
**Read This:** Every time you start working on the calculator

---

## 🏗️ MATERIALS OVERVIEW

### **Steel Tanks**
- SS316 (Stainless Steel 316) - Marine grade
- SS304 (Stainless Steel 304) - Standard stainless
- HDG (Hot Dip Galvanized) - Cost-effective
- Mild Steel - Basic option

### **FRP/GRP Tanks**
- Fiberglass Reinforced Plastic
- 35% minimum fiberglass content
- Metric (1m) panels ONLY - No Imperial
- Different rules than steel (see below)

---

## 🔩 BOLT CALCULATIONS

### **Bolts Per Side by Material**

**SS316/SS304:**
- Metric (1m panels): **16 bolts per side**
- Imperial (4ft panels): **20 bolts per side**

**HDG/Mild Steel:**
- Metric (1m panels): **13 bolts per side**
- Imperial (4ft panels): **16 bolts per side**

**FRP:**
- Metric (1m panels): **13 bolts per side**
- Imperial: **NOT AVAILABLE**

### **Universal Formula**
```javascript
// CORRECT FORMULA
const totalPanels = basePanels + wallPanels + roofPanels + partitionPanels;
const boltsPerSide = getBoltsPerSide(material, panelType); // See table above
const sharedEdgeBolts = (totalPanels * 4 * boltsPerSide) / 2; // Divide by 2!
const withBuffer = Math.round(sharedEdgeBolts * 1.2); // 20% buffer
return withBuffer;
```

**Why divide by 2?**
- Each panel has 4 sides
- Each side shares with adjacent panel
- Connections counted twice without division
- Example: 2 panels share 1 edge = count once, not twice

**Why 1.2 buffer?**
- Perimeter panels don't share all sides
- Manufacturing extras
- Damage replacement

### **Validation Examples**
```
Test: 138 panels, SS316, Metric
Calculation: (138 × 4 × 16) ÷ 2 × 1.2 = 5,299 bolt sets

Test: 157 panels, FRP, Metric
Calculation: (157 × 4 × 13) ÷ 2 × 1.2 = 4,898 bolt sets

Test: 146 panels, SS304, Imperial
Calculation: (146 × 4 × 20) ÷ 2 × 1.2 = 7,008 bolt sets
```

---

## 📐 PANEL THICKNESS SELECTION

### **Metric Panels (1m × 1m)**

**Height-Based Thickness Rules:**

| Height | Base | Tier 1 (Bottom) | Tier 2 | Tier 3 | Tier 4 (Top) |
|--------|------|----------------|--------|--------|--------------|
| 1m | 3.0mm | 3.0mm | - | - | - |
| 2m | 3.0mm | 3.0mm | 3.0mm | - | - |
| 3m | 4.5mm | 4.5mm | 3.0mm | 3.0mm | - |
| 4m | 5.0mm | 5.0mm | 4.5mm | 3.0mm | 3.0mm |
| 5m | 6.0mm | 6.0mm | 5.0mm | 4.5mm | 3.0mm |

**Rule:** Thicker panels at bottom (high pressure), thinner at top (low pressure)

### **Imperial Panels (4ft × 4ft = 1.22m × 1.22m)**

**Height-Based Thickness Rules:**

| Height | Base | Tier 1 (Bottom) | Tier 2 | Tier 3 (Top) |
|--------|------|----------------|--------|--------------|
| 4ft (1.22m) | 2.5mm | 2.5mm | - | - |
| 8ft (2.44m) | 3.0mm | 3.0mm | 2.5mm | - |
| 12ft (3.66m) | 4.0mm | 4.0mm | 3.0mm | 2.5mm |
| 16ft (4.88m) | 5.0mm | 5.0mm | 4.0mm | 3.0mm |

**Note:** Imperial panels cover more height per tier (1.22m vs 1m)

### **Roof Panels**
- Standard: **1.5mm** for all heights
- Custom heavy duty: **3.0mm** (optional upgrade)

---

## 🏭 BUILD STANDARDS

### **Steel Tanks**

**SONS (Steel Tank Standard)**
- Current implementation
- Panel thickness: See tables above
- Used primarily in Malaysia

**BSI (British Standard)**
- Similar to SONS with variations
- Panel thickness: [NEEDS DOCUMENTATION]
- Used in UK/Commonwealth markets

**LPCB (Loss Prevention Certification Board)**
- Fire protection standard
- Panel thickness: [NEEDS DOCUMENTATION]
- Required for insurance/safety critical

### **FRP Tanks**

**MS1390:2010 (Malaysian Standard - SPAN Approved)**
- Metric (1m) panels Type 2 only
- 35% minimum fiberglass content
- Panel codes: S10-S60 (sidewall), B10-B60 (base), R00 (roof)

**SANS 10329:2020 (South African Standard)**
- Similar to MS1390
- Variations: [NEEDS DOCUMENTATION]

**SS245:2014**
- Singapore standard
- Compatible with MS1390
- Variations: [NEEDS DOCUMENTATION]

---

## 🔄 FRP vs STEEL - Critical Differences

### **Support Structures**

**FRP Tanks:**
- ✅ Internal Support ONLY (tie rods/stays)
- ❌ NO I-Beams (FRP can't support external beam weight)
- Internal brackets: **SS304** (not SS316)
- Roof brackets: **ABS plastic** (not metal)
- Roof pipes: **ABS plastic** (not metal)

**Steel Tanks:**
- ✅ Internal Support (tie rods/stays)
- ✅ External Support (I-Beams) - optional
- Internal brackets: **SS304 or SS316**
- External brackets: **HDG**
- Roof brackets: **SS304 or SS316**
- Roof pipes: **SS304 or SS316**

### **Accessories**

**FRP Tanks:**
- Internal Ladder: **FRP material** (not SS316)
- External Ladder: **HDG only**
- WLI (Water Level Indicator): **HDG recommended** (not SS316)
- Manhole: Normal or Sliding (same as steel)
- Bolts: **HDG or SS304** (13 per side)

**Steel Tanks:**
- Internal Ladder: **SS316 or FRP**
- External Ladder: **HDG or SS316**
- WLI: **SS304, SS316, or HDG options**
- Manhole: Normal or Sliding
- Bolts: **Match tank material** (16-20 per side)

### **Panel Types**

**FRP:**
- Metric ONLY (1m × 1m)
- Type 2 panels only
- No Imperial (4ft) panels available
- SKU format: `3B20-FRP`, `3S20-FRP-A`, `3R00-FRP`

**Steel:**
- Metric (1m × 1m): Type 1 or Type 2
- Imperial (4ft × 4ft): Available
- SKU format: `1B45-m-S2`, `1B3-i-S2`, etc.

---

## 🏷️ SKU FORMAT PATTERNS

### **Steel Tank SKUs**

**Format:** `[LocationCode][Thickness][PanelType]-[Material]`

**Examples:**
- `1B45-m-S2` = Base, 4.5mm, Metric, SS316
- `1A3-i-S1` = Wall, 3mm, Imperial, SS304
- `1R15-m-HDG` = Roof, 1.5mm, Metric, HDG
- `1Bφ45-m-S2` = Partition Base, 4.5mm, Metric, SS316 (note φ)

**Location Codes:**
- `B` = Base/Bottom panel
- `BCL` = Base Corner Left
- `BCR` = Base Corner Right
- `A` = Main wall panel
- `C` = Corner wall panel
- `R` = Roof panel
- `R(AV)` = Roof Air Vent
- `MH` = Manhole
- `Bφ` / `Cφ` = Partition panels (φ = phi symbol)

**Material Codes:**
- `S2` = SS316
- `S1` = SS304
- `HDG` = Hot Dip Galvanized
- `MS` = Mild Steel

**Panel Type:**
- `m` = Metric (1m)
- `i` = Imperial (4ft)

### **FRP Tank SKUs**

**Format:** `[Type][DepthCode]-[Material]`

**Examples:**
- `3B20-FRP` = Base, 2m depth
- `3S20-FRP-A` = Sidewall, 2m height, Type A
- `3R00-FRP` = Roof panel
- `3P10-FRP` = Partition, 1m

**Depth Codes:**
- `B10` to `B60` = Base (1m to 6m depth)
- `S10` to `S60` = Sidewall (1m to 6m height)
- `R00`, `H00`, `Q00` = Roof variations
- `P10` to `P40` = Partition (1m to 4m)

---

## 💰 PRICING STRUCTURE

### **Price Lookup Logic**

1. Generate SKU based on material, thickness, panel type
2. Look up in `sku_prices.csv` using **`market_final_price`** column
3. If not found, try without thickness variation
4. If still not found, fallback to placeholder:
   - Panels: RM 150.00 ⚠️
   - Roof: RM 375.00 ⚠️

### **Price Column to Use**
```javascript
// CORRECT:
const price = parseFloat(priceRow.market_final_price);

// WRONG:
const price = parseFloat(priceRow.our_final_price); // ❌ Don't use this
```

### **Bolt Pricing**

**Important:** Prices should be per SET, not per piece

**Bolt SET = 1 bolt + 1 nut + 2 washers**

**Expected Price Ranges:**
- SS316 bolt sets: RM 2.50 - 5.00 per set
- SS304 bolt sets: RM 1.50 - 4.00 per set
- HDG bolt sets: RM 0.80 - 2.00 per set
- FRP bolt sets: RM 0.80 - 1.50 per set

**SKU Pattern:** `BN300[X]BNM10025` where X = material code

### **Volume Tiers**

- Small tanks (<6ML): Use standard pricing
- Large tanks (>6ML): May have different pricing tier
- Check CSV for volume-based pricing columns

---

## 📊 VALIDATION - Real Quote Targets

Use these to test calculations:

### **Quote 1: 5×5×3m SS316 Metric**
- Panels: 138 total
- Bolts: 5,299 sets
- Material: SS316, Metric, Type 1
- Partitions: 1
- **Target Total:** ~RM 50,000

### **Quote 2: 8×8×4m FRP**
- Panels: 157 total
- Bolts: 4,898 sets
- Material: FRP, Metric
- Partitions: 1
- **Target Total:** RM 28,681.71

### **Quote 3: 8×8×4ft SS304 Imperial**
- Panels: 146 total
- Bolts: 7,008 sets
- Material: SS304, Imperial, Type 1
- Partitions: 1
- **Target Total:** RM 79,435.61

### **Quote 4: 5×5×4ft HDG Imperial**
- Panels: 100 total
- Bolts: 3,840 sets
- Material: HDG, Imperial
- Partitions: 1
- **Target Total:** RM 57,811.81

### **Quote 5: 8×8×2m FRP**
- Panels: 157 total
- Bolts: 4,898 sets
- Material: FRP, Metric
- Partitions: 0
- **Target Total:** RM 26,249.58

### **Quote 6: 12×12×4ft SS316 Imperial**
- Panels: 418 total
- Bolts: 20,064 sets
- Material: SS316, Imperial, Type 2
- Partitions: 1
- **Target Total:** ~RM 106,000 (needs real pricing)

---

## ⚠️ CRITICAL REMINDERS

### **Common Mistakes to Avoid**

1. ❌ **Using wrong price column** - Use `market_final_price`, not `our_final_price`
2. ❌ **Forgetting shared edge division** - Bolt formula MUST divide by 2
3. ❌ **Wrong bolts per side** - Material-specific: 13, 16, or 20
4. ❌ **Treating FRP like steel** - FRP has different support/accessories
5. ❌ **Imperial FRP panels** - FRP is Metric only, no Imperial
6. ❌ **Partition SKU missing φ** - Partitions need phi symbol in SKU

### **Always Check**

- ✅ Material affects bolt count (13/16/20 per side)
- ✅ Panel type affects bolt count (Metric/Imperial different)
- ✅ FRP uses different accessories than steel
- ✅ Thicker panels should cost MORE than thinner
- ✅ Imperial SS316 should have real prices, not RM 150
- ✅ Bolts priced per SET (4 pieces), not per piece

### **Test After Every Change**

Run validation tests to ensure:
- Bolt quantities match expected (within 2%)
- Panel prices are real, not placeholders
- Thicker panels cost more than thinner
- Total quote matches real quote targets

---

## 🔍 DIAGNOSTIC QUESTIONS

**When bolt calculation is wrong, ask:**
- What material? (Affects bolts per side)
- Metric or Imperial? (Affects bolts per side)
- Is formula dividing by 2? (Shared edges)
- Is formula multiplying by 1.2? (Buffer)

**When pricing is wrong, ask:**
- What SKU was generated?
- Does that SKU exist in CSV?
- Is it using `market_final_price` column?
- Is it falling back to placeholder RM 150?

**When FRP doesn't work, ask:**
- Is it trying to use Imperial panels? (FRP is Metric only)
- Is it using steel accessories? (FRP needs different)
- Is it using I-beams? (FRP uses internal support only)
- Are bolts set to 13 per side? (Not 16/20)

---

## 📁 File Locations

**Core Logic:**
- `lib/bomCalculator.js` - Main calculation engine
- `lib/priceLoader.js` - CSV loading and price lookup
- `lib/materialRules.js` - [TO CREATE] FRP vs Steel rules
- `lib/buildStandards.js` - [TO CREATE] SONS, BSI, LPCB rules

**Data:**
- `public/sku_prices.csv` - 11,578 SKU pricing (use `market_final_price`)

**UI:**
- `app/calculator/page.js` - Main calculator interface

**Tests:**
- `tests/validation.test.js` - [TO CREATE] Real quote validation

**Memory:**
- `docs/START_HERE.md` - Read first every session
- `docs/CURRENT_STATUS.md` - Current state and bugs
- `docs/QUICK_REFERENCE.md` - This file
- `docs/CHANGELOG.md` - Session history

---

## 🎯 Quick Decision Tree

**Choosing Material Rules:**
```
Is material FRP?
├─ Yes → Use FRP rules:
│         - 13 bolts per side
│         - Internal support only
│         - ABS roof brackets
│         - FRP internal ladder
│         - Metric panels only
│
└─ No → Use Steel rules:
          - Check if SS316/SS304 (16/20 bolts) or HDG/MS (13/16 bolts)
          - Internal OR external support
          - Metal roof brackets
          - SS316 or FRP internal ladder
          - Metric or Imperial panels
```

**Choosing Panel Thickness:**
```
What's the height?
├─ 1m → Base: 3.0mm, All walls: 3.0mm
├─ 2m → Base: 3.0mm, All walls: 3.0mm
├─ 3m → Base: 4.5mm, Bottom: 4.5mm, Top: 3.0mm
├─ 4m → Base: 5.0mm, Bottom: 5.0mm, Mid: 4.5mm, Top: 3.0mm
└─ 5m+ → Base: 6.0mm, use tier-based thickness table
```

---

**Remember:** This is a QUICK reference. For complete details, see full documentation in project files.

**Last Updated:** 2025-11-06
