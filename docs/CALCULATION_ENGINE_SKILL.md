# 🧮 SUNNIK TANK CALCULATOR - CALCULATION ENGINE SKILL

**Version:** 1.0  
**Last Updated:** November 4, 2025  
**Purpose:** Master reference and update guide for all BOM calculation logic  
**For:** Non-coder with AI assistant (Claude Code / Cursor)

---

## 📋 TABLE OF CONTENTS

1. [Overview](#overview)
2. [Calculation Flow](#calculation-flow)
3. [Panel Size & Type System](#panel-size--type-system)
4. [Thickness Selection Logic](#thickness-selection-logic)
5. [SKU Generation Rules](#sku-generation-rules)
6. [BOM Components Breakdown](#bom-components-breakdown)
7. [Partition System](#partition-system)
8. [FRP Tank Calculation](#frp-tank-calculation)
9. [Pricing Integration](#pricing-integration)
10. [How to Update Calculations](#how-to-update-calculations)
11. [Common Modifications](#common-modifications)
12. [Testing & Validation](#testing--validation)

---

## 🎯 OVERVIEW

### What This Skill Manages
This skill controls the **core calculation engine** (`bomCalculator.js`) that converts tank dimensions into a complete Bill of Materials (BOM) with accurate SKU codes and quantities.

### Key Responsibilities
- ✅ Tank dimension validation
- ✅ Panel quantity calculations (base, walls, roof, partition)
- ✅ Thickness selection per SANS 10329:2020 standard
- ✅ SKU code generation for all materials
- ✅ Partition wall calculations
- ✅ Price lookup and totaling

### File Location
```
/home/claude/sunnik_calc/app/lib/bomCalculator.js
```

---

## 🔄 CALCULATION FLOW

### Step-by-Step Process
```
1. USER INPUT
   ├─ Tank dimensions (length × width × height in meters or feet)
   ├─ Panel type (Metric 1m×1m OR Imperial 1.22m×1.22m)
   ├─ Material (SS316, SS304, HDG, MS, FRP)
   ├─ Partition count (0, 1, 2, 3...)
   └─ Roof thickness (default 1.5mm)

2. DIMENSION CONVERSION
   ├─ Convert dimensions to panel units
   ├─ Calculate panel grid (lengthPanels × widthPanels × heightPanels)
   └─ Determine perimeter = 2 × (length + width)

3. THICKNESS DETERMINATION
   ├─ Use height to select thickness from SANS 10329:2020
   ├─ Get tier breakdown with thickness per level
   └─ Assign location codes (A, B, C) per tier

4. PARTITION ORIENTATION
   ├─ Identify shorter side (length vs width)
   ├─ Partitions always run across shorter dimension
   └─ Calculate partition span in panels

5. BASE PANEL CALCULATION
   ├─ Perimeter base panels (B)
   ├─ Corner panels (BCL, BCR)
   ├─ Interior panels (A)
   └─ Partition support panels (AB, BCL, BCR)

6. WALL PANEL CALCULATION
   ├─ Calculate per tier based on height
   ├─ Bottom tier: B corners + A panels
   ├─ Middle tiers: A panels only
   └─ Top tier: C corners + B panels

7. PARTITION PANEL CALCULATION
   ├─ Corner panels (Cφ) = 2 per partition per tier
   ├─ Main panels (Bφ) = (span - 2) per partition per tier
   └─ Multiply by partition count

8. ROOF PANEL CALCULATION
   ├─ Regular roof panels (R)
   ├─ Air vents (R(AV)) = 2
   └─ Manholes (MH) = 2

9. SKU GENERATION
   ├─ Apply naming convention per material and panel type
   ├─ Include thickness code and size code
   └─ Format: [Type][Location][Thickness]-[Size]-[Material]

10. PRICE LOOKUP
    ├─ Match SKU to sku_prices.csv
    ├─ Pull "our_final_price" column
    └─ Calculate line totals (quantity × unit price)

11. OUTPUT BOM
    ├─ Organized by category (base, walls, partition, roof)
    ├─ Each line: SKU, description, quantity, unit price, total
    └─ Grand total panels and cost
```

---

## 📐 PANEL SIZE & TYPE SYSTEM

### Metric Panels (Type Code: 'm')
- **Size:** 1m × 1m
- **Used in:** Most tanks in Malaysia and SE Asia
- **Panel Size Value:** 1.0 meter

### Imperial Panels (Type Code: 'i')
- **Size:** 4ft × 4ft (1.22m × 1.22m)
- **Used in:** International projects, some legacy systems
- **Panel Size Value:** 1.22 meters

### How to Calculate Panel Grid
```javascript
const panelSize = panelType === 'm' ? 1.0 : 1.22;
const lengthPanels = Math.ceil(length / panelSize);
const widthPanels = Math.ceil(width / panelSize);
const heightPanels = Math.ceil(height / panelSize);
const perimeter = 2 * (lengthPanels + widthPanels);
```

**Example:**
- Tank: 10m × 5m × 3m (Metric panels)
- Length panels: Math.ceil(10 / 1.0) = 10
- Width panels: Math.ceil(5 / 1.0) = 5
- Height panels: Math.ceil(3 / 1.0) = 3
- Perimeter: 2 × (10 + 5) = 30 panels

---

## 🔧 THICKNESS SELECTION LOGIC

### SANS 10329:2020 Standard
Panel thickness increases with water depth (pressure). Bottom panels are thickest, top panels are thinnest.

### METRIC PANELS (1m × 1m)

| Tank Height | Base Thickness | Wall Tiers | Location Codes |
|-------------|---------------|------------|----------------|
| **1.0m - 1.02m** | 3.0mm | Tier 1: 3.0mm (A) | Single tier |
| **2.0m - 2.04m** | 3.0mm | Tier 1: 3.0mm (A)<br>Tier 2: 3.0mm (A) | Two tiers |
| **3.0m - 3.06m** | 4.5mm | Tier 1: 4.5mm (A)<br>Tier 2: 3.0mm (A)<br>Tier 3: 3.0mm (C) | Three tiers |
| **4.0m - 4.08m** | 5.0mm | Tier 1: 5.0mm (A)<br>Tier 2: 4.5mm (A)<br>Tier 3: 3.0mm (A)<br>Tier 4: 3.0mm (C) | Four tiers |

### IMPERIAL PANELS (1.22m × 1.22m)

| Tank Height | Base Thickness | Wall Tiers | Location Codes |
|-------------|---------------|------------|----------------|
| **1.2m - 1.22m** | 2.5mm | Tier 1: 2.5mm (A) | Single tier |
| **2.4m - 2.44m** | 3.0mm | Tier 1: 3.0mm (A)<br>Tier 2: 2.5mm (A) | Two tiers |
| **3.6m - 3.66m** | 4.0mm | Tier 1: 4.0mm (A)<br>Tier 2: 3.0mm (A)<br>Tier 3: 2.5mm (C) | Three tiers |

### Location Code Meaning
- **A** = Main wall panels (standard)
- **B** = Base/bottom panels or corner bottom
- **C** = Top tier panels (cap/cover)

### Code Implementation
```javascript
export function getThicknessByHeight(heightMeters, panelType) {
  const heightMM = heightMeters * 1000;
  
  if (panelType === 'm') {
    // METRIC PANELS
    if (heightMM >= 1000 && heightMM <= 1020) {
      return {
        base: 3.0,
        wall: 3.0,
        roof: 1.5,
        tiers: [{ height: 1, thickness: 3.0, code: 'A' }]
      };
    }
    // ... more conditions
  } else if (panelType === 'i') {
    // IMPERIAL PANELS
    // ... similar structure
  }
  
  // Default fallback
  return {
    base: 3.0,
    wall: 3.0,
    roof: 1.5,
    tiers: [{ height: 1, thickness: 3.0, code: 'A' }]
  };
}
```

---

## 🏷️ SKU GENERATION RULES

### Steel Panel SKU Format
```
[Type][Location][Thickness]-[Size]-[Material]

Examples:
1A3-m-S2     = Type 1, A panel, 3.0mm, Metric, SS316
1B45-i-HDG   = Type 1, B panel, 4.5mm, Imperial, HDG
1BCL5-m-S1   = Type 1, Base Corner Left, 5.0mm, Metric, SS304
```

### SKU Components

#### Type Code
- **1** = Type 1 panels (standard for most tanks)
- **2** = Type 2 panels (special applications)

#### Location Code
- **A** = Main wall panel
- **B** = Base/bottom panel or corner bottom
- **C** = Top cap panel
- **AB** = Partition base support (center panels under partition)
- **BCL** = Base Corner Left
- **BCR** = Base Corner Right
- **Bφ** = Partition wall main panel
- **Cφ** = Partition wall corner panel
- **R** = Roof panel
- **R(AV)** = Roof air vent
- **MH** = Manhole

#### Thickness Code
Remove the decimal point from thickness:
- 2.5mm → "25"
- 3.0mm → "3"
- 4.5mm → "45"
- 5.0mm → "5"
- 1.5mm → "15"

#### Size Code
- **m** = Metric (1m × 1m)
- **i** = Imperial (4ft × 4ft = 1.22m × 1.22m)

#### Material Code
- **S2** = SS316 (Stainless Steel 316)
- **S1** = SS304 (Stainless Steel 304)
- **HDG** = Hot Dip Galvanized
- **MS** = Mild Steel

### FRP Panel SKU Format
```
[Code][Height]-FRP-[Variant]

Examples:
3B10-FRP      = Base panel, 1m depth
3S20-FRP-A    = Sidewall panel, 2m height, variant A
2R00-FRP      = Roof panel
```

### Code Implementation
```javascript
export function generateSteelSKU(panelType, location, thickness, size, material) {
  const thicknessCode = thickness.toString().replace('.', '');
  return `${panelType}${location}${thicknessCode}-${size}-${material}`;
}

// Usage example:
const sku = generateSteelSKU('1', 'A', 3.0, 'm', 'S2');
// Result: "1A3-m-S2"
```

---

## 🧱 BOM COMPONENTS BREAKDOWN

### 1. BASE PANELS (Floor)

#### Without Partition
```javascript
// Perimeter base panels (around the edge)
quantity = perimeter = 2 × (lengthPanels + widthPanels)
sku = 1B[thickness]-[size]-[material]

// Corner panels
BCL (Base Corner Left) = 2
BCR (Base Corner Right) = 2

// Interior base panels (if tank is large enough)
quantity = (lengthPanels - 2) × (widthPanels - 2)
sku = 1A[thickness]-[size]-[material]
```

#### With Partition
```javascript
// Standard base panels (reduced by partition footprint)
// Same B, BCL, BCR as above

// Partition support panels
AB (center support under partition):
  quantity = Math.max(1, partitionSpan - 4) × partitionCount
  
Partition corners:
  BCL = 2 × partitionCount
  BCR = 2 × partitionCount
```

**Visual Example (8m × 8m tank with 1 partition):**
```
[B][B][B][BCL][AB][AB][AB][BCR][B][B]
└─────────────┬─────────────┘
         Partition runs here
```

### 2. WALL PANELS

Wall panels are calculated **per tier** based on tank height.

#### Bottom Tier (Tier 1)
```javascript
// Corner panels at bottom
quantity = 4
sku = 1B[thickness]-[size]-[material]

// Main wall panels (excluding corners)
quantity = perimeter - 4
sku = 1A[thickness]-[size]-[material]
```

#### Middle Tiers (if height > 2 panels)
```javascript
// All A panels, no corners
quantity = perimeter
sku = 1A[thickness]-[size]-[material]
```

#### Top Tier
```javascript
// Corner panels at top
quantity = 4
sku = 1C[thickness]-[size]-[material]

// Main wall panels top (excluding corners)
quantity = perimeter - 4
sku = 1B[thickness]-[size]-[material]
```

**Visual Example (4m height = 4 tiers):**
```
Tier 4 (Top):    [C][B][B][B]...[B][C]  (3.0mm)
Tier 3:          [A][A][A][A]...[A][A]  (3.0mm)
Tier 2:          [A][A][A][A]...[A][A]  (4.5mm)
Tier 1 (Bottom): [B][A][A][A]...[A][B]  (5.0mm)
```

### 3. PARTITION PANELS

Partitions always run along the **shorter side** of the tank to minimize structural stress.

```javascript
// Determine partition orientation
const partitionSpan = Math.min(lengthPanels, widthPanels);

// For each tier in height:
// Corner panels (where partition meets main walls)
Cφ quantity = 2 × partitionCount
sku = 1Cφ[thickness]-[size]-[material]

// Main partition panels (center of partition wall)
Bφ quantity = Math.max(1, partitionSpan - 2) × partitionCount
sku = 1Bφ[thickness]-[size]-[material]
```

**Visual Example (5m width partition, 3m height):**
```
Main Wall │  PARTITION WALL (5 panels wide)  │ Main Wall
   A      │  [Cφ] [Bφ] [Bφ] [Bφ] [Cφ]       │    A
          │   ↑    ↑    ↑    ↑    ↑         │
          │  Corner  Main panels  Corner    │
          └────────────────────────────────┘
               Floor (AB panels)
```

### 4. ROOF PANELS

```javascript
// Total roof area
const roofCount = lengthPanels × widthPanels;

// Regular roof panels (reserve space for vents/manholes)
R quantity = roofCount - 4
sku = 1R[thickness]-[size]-[material]

// Air vents (always 2)
R(AV) quantity = 2
sku = 1R(AV)[thickness]-[size]-[material]

// Manholes (always 2)
MH quantity = 2
sku = 1MH[thickness]-[size]-[material]
```

---

## 🔄 PARTITION SYSTEM

### Key Rules
1. **Orientation:** Partitions ALWAYS run along the shorter side
2. **Thickness:** Partition panels use SAME thickness as main walls at that tier
3. **Base Support:** Special AB, BCL, BCR panels reinforce floor under partition
4. **Multiple Partitions:** Each partition multiplies the quantities

### Calculation Logic

#### Step 1: Determine Span
```javascript
const lengthPanels = Math.ceil(length / panelSize);
const widthPanels = Math.ceil(width / panelSize);
const partitionSpan = Math.min(lengthPanels, widthPanels);
```

#### Step 2: Base Support
```javascript
if (partitionCount > 0) {
  // Center panels under partition
  const abPerPartition = Math.max(1, partitionSpan - 4);
  AB quantity = abPerPartition × partitionCount
  
  // Corners where partition meets walls
  BCL quantity = 2 × partitionCount
  BCR quantity = 2 × partitionCount
}
```

#### Step 3: Partition Walls (Per Tier)
```javascript
thickness.tiers.forEach(tier => {
  // Corner panels (where partition connects to main walls)
  Cφ quantity = 2 × partitionCount
  sku = `1Cφ${thickness}-${size}-${material}`
  
  // Main partition panels
  const mainPanels = Math.max(1, partitionSpan - 2);
  Bφ quantity = mainPanels × partitionCount
  sku = `1Bφ${thickness}-${size}-${material}`
});
```

### Example: 10m × 5m × 3m Tank, 2 Partitions
```
Tank Grid: 10 panels (L) × 5 panels (W) × 3 panels (H)
Partition Span: min(10, 5) = 5 panels (runs across width)

BASE SUPPORT (per partition):
- AB: (5 - 4) = 1 panel per partition × 2 = 2 panels
- BCL: 2 × 2 = 4 panels
- BCR: 2 × 2 = 4 panels

PARTITION WALLS (per partition per tier):
- Cφ: 2 corners × 2 partitions = 4 panels per tier
- Bφ: (5 - 2) = 3 main × 2 partitions = 6 panels per tier

Total Partition Panels for 3-tier height:
- Cφ: 4 × 3 tiers = 12 panels
- Bφ: 6 × 3 tiers = 18 panels
- Total: 30 partition panels
```

---

## 🌊 FRP TANK CALCULATION

FRP (Fiberglass Reinforced Plastic) tanks use a different panel system than steel.

### Panel Types
- **Base Panels:** B10, B20, B30, B40 (depth-based)
- **Sidewall Panels:** S10, S20, S30, S40, S50, S60 (height-based)
- **Roof Panels:** R00, H00, Q00

### Calculation Logic

#### Base Panels
```javascript
const baseCount = lengthPanels × widthPanels;
const baseDepth = Math.ceil(height / 1) * 10;  // B10, B20, B30, etc.
sku = `3B${baseDepth}-FRP`
```

#### Sidewall Panels
Height determines which codes to use:
```javascript
if (height <= 1) → ['3S10-FRP']
if (height <= 2) → ['3S20-FRP']
if (height <= 3) → ['3S30-FRP']
if (height <= 4) → ['3S40-FRP', '3S30-FRP', '3S20-FRP', '3S10-FRP']
if (height === 5) → ['3S50-FRP', '3S40-FRP', '3S30-FRP', '3S20-FRP', '3S10-FRP']
if (height >= 6) → ['3S60-FRP', '3S50-FRP', '3S40-FRP', '3S30-FRP', '3S20-FRP', '3S10-FRP']
```

Each code gets `perimeter` quantity (one panel per perimeter position).

#### Roof Panels
```javascript
const roofCount = lengthPanels × widthPanels;
R00 quantity = roofCount - 3  // Reserve for accessories
```

### Example: 2m × 2m × 1m FRP Tank
```
Grid: 2 × 2 × 1 panels
Perimeter: 2 × (2 + 2) = 8 panels

BASE:
- 3B10-FRP: 4 panels (2×2 area)

WALLS:
- 3S10-FRP-A: 8 panels (perimeter)

ROOF:
- 2R00-FRP: 1 panel (4 total - 3 reserved)
```

---

## 💰 PRICING INTEGRATION

### Price Lookup Process

#### Step 1: Generate SKU
Use the calculation logic to create exact SKU codes matching the CSV format.

#### Step 2: Match to CSV
```javascript
// sku_prices.csv structure:
InternalReference,Description,ItemCategory,...,our_final_price,market_final_price

// Match on InternalReference column
const priceData = csvData.find(row => row.InternalReference === generatedSKU);
```

#### Step 3: Extract Price
```javascript
// Use "market_final_price" for calculations (CUSTOMER PRICING)
const unitPrice = parseFloat(priceData.market_final_price);
```

#### Step 4: Calculate Line Total
```javascript
const lineTotal = quantity × unitPrice;
```

### Price Column Definitions
- **our_final_price**: Internal cost (for reference/cost analysis)
- **market_final_price**: Customer pricing - USE THIS for BOM calculations ✓

### Handling Missing SKUs
```javascript
if (!priceData) {
  console.warn(`SKU not found in price list: ${sku}`);
  unitPrice = 0;  // Or flag for manual review
}
```

---

## 🔧 HOW TO UPDATE CALCULATIONS

### General Update Process

#### 1. Identify What to Change
Examples:
- Add new thickness tier for taller tanks
- Modify partition base support logic
- Change roof panel reservation count
- Add new material type

#### 2. Locate the Code Section
Use this reference:
- **Thickness logic:** Lines 7-93 in `bomCalculator.js`
- **SKU generation:** Lines 112-121
- **Base panels:** Lines 206-267
- **Wall panels:** Lines 269-317
- **Partition panels:** Lines 319-339
- **Roof panels:** Lines 341-366
- **FRP logic:** Lines 170-201

#### 3. Make the Change
- Edit the specific function or section
- Maintain the same data structure for output
- Test with known examples

#### 4. Validate Results
- Run test calculations with sample tanks
- Compare outputs to manual calculations
- Check all SKUs exist in price CSV

### Communication Protocol

When asking AI to update calculations, provide:
1. **What to change:** "Add support for 5m height metric panels"
2. **Expected behavior:** "Should use 6.0mm base, add tier 5 with 3.0mm"
3. **Affected materials:** "Apply to all steel materials (SS316, SS304, HDG, MS)"

Example Request:
```
"Please update the thickness selection logic for metric panels to support 
5.0m height (5000-5100mm). The specification should be:
- Base: 6.0mm
- Tier 1: 6.0mm (A)
- Tier 2: 5.0mm (A)
- Tier 3: 4.5mm (A)
- Tier 4: 3.0mm (A)
- Tier 5: 3.0mm (C)

Add this as a new condition in the getThicknessByHeight function."
```

---

## 🔄 COMMON MODIFICATIONS

### 1. Add New Height Tier

**Location:** `getThicknessByHeight()` function

**Steps:**
1. Add new condition for height range
2. Define base thickness
3. Define tier array with thickness and codes
4. Return object in standard format

**Example:**
```javascript
else if (heightMM >= 5000 && heightMM <= 5100) {
  return {
    base: 6.0,
    wall: 6.0,
    roof: 1.5,
    tiers: [
      { height: 1, thickness: 6.0, code: 'A' },
      { height: 2, thickness: 5.0, code: 'A' },
      { height: 3, thickness: 4.5, code: 'A' },
      { height: 4, thickness: 3.0, code: 'A' },
      { height: 5, thickness: 3.0, code: 'C' }
    ]
  };
}
```

### 2. Modify Roof Accessory Count

**Location:** Roof panel calculation section (lines 341-366)

**Current Logic:**
```javascript
quantity: roofCount - 4,  // Reserve 4 spaces (2 vents + 2 manholes)
```

**To Change:**
1. Modify the subtraction value
2. Adjust individual accessory quantities
3. Update comments

**Example (3 vents, 1 manhole):**
```javascript
bom.roof.push({
  sku: `1R${roofThicknessCode}-${panelType}-${materialCode}`,
  quantity: roofCount - 4,  // Reserve 4 spaces
  ...
});

bom.roof.push({
  sku: `1R(AV)${roofThicknessCode}-${panelType}-${materialCode}`,
  quantity: 3,  // Changed from 2
  ...
});

bom.roof.push({
  sku: `1MH${roofThicknessCode}-${panelType}-${materialCode}`,
  quantity: 1,  // Changed from 2
  ...
});
```

### 3. Add New Material Type

**Location:** Material code mapping (lines 162-168) + SKU generation

**Steps:**
1. Add material to mapping object
2. Create new material code
3. Ensure SKU format matches price CSV

**Example (Adding Bronze):**
```javascript
const materialCode = {
  'SS316': 'S2',
  'SS304': 'S1',
  'HDG': 'HDG',
  'MS': 'MS',
  'BRONZE': 'BRZ'  // New material
}[material] || 'S2';
```

### 4. Adjust Partition Base Support

**Location:** Lines 244-267

**Current Formula:**
```javascript
const abPerPartition = Math.max(1, partitionSpan - 4);
```

**To Modify:**
Change the subtraction value (currently 4 = corner panels).

**Example (More conservative support):**
```javascript
const abPerPartition = Math.max(2, partitionSpan - 2);  // More AB panels
```

### 5. Change Corner Panel Logic

**Location:** Wall tier calculation (lines 269-317)

**Current Behavior:**
- Bottom tier: 4 B corners + (perimeter - 4) A panels
- Top tier: 4 C corners + (perimeter - 4) B panels

**To Modify:**
Edit the conditional blocks for `isBottom` and `isTop`.

---

## ✅ TESTING & VALIDATION

### Test Cases to Run After Updates

#### Basic Validation
```javascript
// Test Case 1: Small Metric Tank
Input: 2m × 2m × 1m, Metric, SS316, 0 partitions
Expected:
- Base: 8 B panels + 2 BCL + 2 BCR + 0 interior = 12 panels
- Walls: 4 B + 4 A = 8 panels
- Roof: 0 R + 2 R(AV) + 2 MH = 4 panels
Total: 24 panels

// Test Case 2: Standard Metric with Partition
Input: 8m × 5m × 3m, Metric, HDG, 1 partition
Expected:
- Partition runs across 5m (shorter side)
- Partition span: 5 panels
- Base AB: (5 - 4) = 1 panel
- Partition walls: 2 Cφ + 3 Bφ per tier × 3 tiers
```

#### Material Validation
```javascript
// Test each material type
Materials: ['SS316', 'SS304', 'HDG', 'MS', 'FRP']

For each material:
1. Generate BOM for standard tank
2. Check all SKUs generated correctly
3. Verify SKUs exist in sku_prices.csv
4. Confirm prices are > 0
```

#### Edge Case Testing
```javascript
// Edge Case 1: Maximum Partition Count
Input: 20m × 20m × 4m, 10 partitions
Check: All quantities multiply correctly

// Edge Case 2: Very Small Tank
Input: 1m × 1m × 1m, 0 partitions
Check: Minimum panel counts respected

// Edge Case 3: Unusual Dimensions
Input: 7.5m × 3.2m × 2.7m
Check: Ceiling function works properly
```

### Validation Checklist

After ANY calculation update:
- [ ] Run test calculations for all materials
- [ ] Verify SKU format matches price CSV
- [ ] Check partition logic for 0, 1, and 2+ partitions
- [ ] Confirm all quantities are whole numbers (no decimals)
- [ ] Test with metric and imperial panel types
- [ ] Verify total panel count is logical (manual estimate)
- [ ] Check corner panel quantities (always 4 per tier for main tank)
- [ ] Ensure no negative quantities
- [ ] Confirm price lookup returns valid values

### Manual Calculation Example

To validate calculator output, manually calculate a simple tank:

**5m × 5m × 2m, Metric, SS316, No Partition**

```
Panel Size: 1m × 1m
Grid: 5 × 5 × 2

BASE:
- Perimeter: 2 × (5 + 5) = 20 panels (B)
- Corners: 2 BCL + 2 BCR = 4 panels
- Interior: (5-2) × (5-2) = 9 panels (A)
Total Base: 20 + 4 + 9 = 33 panels ✓

WALLS (2 tiers, both 3.0mm):
Tier 1: 4 B + 16 A = 20 panels
Tier 2: 4 C + 16 B = 20 panels
Total Walls: 40 panels ✓

ROOF:
- Area: 5 × 5 = 25 panels
- R: 25 - 4 = 21 panels
- R(AV): 2 panels
- MH: 2 panels
Total Roof: 25 panels ✓

GRAND TOTAL: 33 + 40 + 25 = 98 panels ✓
```

Run the calculator and compare: If results match, validation passes!

---

## 📞 GETTING HELP

### When to Use This Skill
- ✅ Before making ANY changes to calculation logic
- ✅ When adding support for new tank sizes
- ✅ When modifying partition logic
- ✅ When adding new materials
- ✅ When debugging calculation errors
- ✅ When validating output against manual calculations

### What NOT to Change Without Understanding
- ❌ Material code mapping (must match SKU format)
- ❌ SKU generation format (must match price CSV exactly)
- ❌ Thickness tier structure (must align with SANS standard)
- ❌ Corner panel quantities (always 4 for main tank)

### Questions to Ask AI Before Changes
1. "Which section of bomCalculator.js handles [X]?"
2. "What will this change affect downstream?"
3. "How should I test this modification?"
4. "Are there edge cases I should consider?"
5. "Will this break existing SKU lookups?"

---

## 🎯 SUMMARY

### This Skill Controls:
- ✅ All panel quantity calculations
- ✅ Thickness selection logic
- ✅ SKU code generation
- ✅ Partition system behavior
- ✅ Price lookup integration

### Key Principles:
1. **Accuracy First:** Calculations must be precise (real money involved)
2. **SKU Match Required:** All SKUs must exist in price CSV
3. **Test Everything:** Validate every change with multiple test cases
4. **Document Changes:** Update this skill when logic changes
5. **Ask Before Breaking:** Consult this reference before major modifications

### File to Update:
```
/home/claude/sunnik_calc/app/lib/bomCalculator.js
```

### Version Control:
When updating calculations:
1. Document the change in this skill
2. Add a comment in bomCalculator.js with date and reason
3. Test with known examples
4. Update version number in this document

---

**END OF CALCULATION ENGINE SKILL**

*This document is the authoritative reference for all BOM calculation logic. Keep it updated as the calculator evolves.*
