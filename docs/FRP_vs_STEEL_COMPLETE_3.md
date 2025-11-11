# FRP vs STEEL - Complete Material Differences

**Created:** 2025-11-07  
**Purpose:** Complete documentation of ALL differences between FRP and Steel tanks  
**Status:** Phase 0 Documentation - COMPLETE  

---

## 📋 **EXECUTIVE SUMMARY**

FRP (Fiberglass Reinforced Plastic) and Steel tanks are fundamentally different materials requiring completely different:
- Support structures
- Accessories
- Bolting systems
- Build standards
- Panel specifications
- Pricing structures

**CRITICAL:** Code must branch between FRP and Steel logic - they cannot share the same calculation rules.

---

## 🏗️ **MATERIAL PROPERTIES**

### **FRP/GRP (Fiberglass Reinforced Plastic)**

**Composition:**
- Minimum 35% fiberglass content
- Polymer resin matrix
- Lightweight (approximately 1/4 weight of steel)

**Strengths:**
- Corrosion resistant (ideal for potable water)
- Chemical resistant
- Lower material cost
- Easier installation (lighter panels)

**Limitations:**
- Cannot support heavy external loads (no I-beams)
- Requires internal support only
- UV degradation if not properly protected
- Fire rating lower than steel

**Typical Applications:**
- Potable water storage
- Chemical storage
- Wastewater treatment
- Residential/commercial water tanks

### **Steel (SS316, SS304, HDG, Mild Steel)**

**SS316 (Marine Grade Stainless):**
- Highest corrosion resistance
- Contains molybdenum (2-3%)
- Suitable for coastal/marine environments
- Most expensive steel option

**SS304 (Standard Stainless):**
- Good corrosion resistance
- Standard commercial grade
- Mid-range pricing
- Most common stainless choice

**HDG (Hot Dip Galvanized):**
- Carbon steel with zinc coating
- Cost-effective
- Good corrosion protection
- Requires maintenance

**Mild Steel:**
- Carbon steel without coating
- Lowest cost
- Requires paint/coating
- Limited corrosion resistance

**Strengths:**
- High structural strength
- Can support external loads (I-beams)
- Fire resistant
- Long lifespan with proper maintenance

**Limitations:**
- Heavy (requires structural support)
- Corrosion potential (except stainless)
- Higher material cost (especially stainless)
- Requires specialized welding/assembly

---

## 📐 **PANEL SPECIFICATIONS**

### **FRP Panels**

**Available Sizes:**
- ✅ **Metric ONLY:** 1m × 1m panels
- ❌ **NO Imperial panels** (4ft × 4ft not available)

**Panel Types:**
- Type 2 panels ONLY
- Single fiberglass specification
- No Type 1 variant

**Panel Codes:**
- Sidewall: S10, S20, S30, S40, S50, S60 (based on height)
- Base: B10, B20, B30, B40, B50, B60 (based on depth)
- Roof: R00, H00, Q00 (variations for manhole/accessories)
- Partition: P10, P20, P30, P40 (based on height)

**Thickness:**
- Standard fiberglass layup
- Not specified by mm thickness like steel
- Factory-determined based on pressure requirements

**SKU Format:**
```
3B20-FRP    = Type 3 (FRP), Base, 2m depth
3S30-FRP-A  = Type 3 (FRP), Sidewall, 3m height, Type A
3R00-FRP    = Type 3 (FRP), Roof, standard
3P20-FRP    = Type 3 (FRP), Partition, 2m height
```

### **Steel Panels**

**Available Sizes:**
- ✅ **Metric:** 1m × 1m panels
- ✅ **Imperial:** 4ft × 4ft (1.22m × 1.22m) panels

**Panel Types:**
- Type 1: Standard thickness series
- Type 2: Heavy-duty thickness series

**Panel Codes:**
- Base: B, BCL, BCR
- Wall: A, AB, TBA, TBAB, PA
- Roof: R, R(AV), MH
- Partition: Uses φ (phi) symbol

**Thickness Specifications:**

**Metric (1m × 1m):**
| Height | Base | Tier 1 | Tier 2 | Tier 3 | Tier 4 |
|--------|------|--------|--------|--------|--------|
| 1m | 3.0mm | 3.0mm | - | - | - |
| 2m | 3.0mm | 3.0mm | 3.0mm | - | - |
| 3m | 4.5mm | 4.5mm | 3.0mm | 3.0mm | - |
| 4m | 5.0mm | 5.0mm | 4.5mm | 3.0mm | 3.0mm |
| 5m | 6.0mm | 6.0mm | 5.0mm | 4.5mm | 3.0mm |

**Imperial (4ft × 4ft):**
| Height | Base | Tier 1 | Tier 2 | Tier 3 |
|--------|------|--------|--------|--------|
| 4ft | 2.5mm | 2.5mm | - | - |
| 8ft | 3.0mm | 3.0mm | 2.5mm | - |
| 12ft | 4.0mm | 4.0mm | 3.0mm | 2.5mm |
| 16ft | 5.0mm | 5.0mm | 4.0mm | 3.0mm |

**SKU Format:**
```
1B45-m-S2   = Type 1, Base, 4.5mm, Metric, SS316
1A3-i-S1    = Type 1, Wall, 3mm, Imperial, SS304
1R15-m-HDG  = Type 1, Roof, 1.5mm, Metric, HDG
1Bφ45-m-S2  = Type 1, Base Partition, 4.5mm, Metric, SS316
```

---

## 🔩 **BOLTING REQUIREMENTS**

### **FRP Tanks**

**Bolts Per Side:**
- Metric (1m panels): **13 bolts per side**
- Imperial: **NOT AVAILABLE** (no Imperial FRP panels)

**Bolt Material:**
- HDG (Hot Dip Galvanized) - Standard
- SS304 - Premium option
- ❌ NOT SS316 (unnecessary for FRP, cost prohibitive)

**Bolt Set Pricing:**
- RM 0.80 - 1.50 per set (4 pieces: bolt + nut + 2 washers)

**Calculation Formula:**
```javascript
const totalPanels = basePanels + wallPanels + roofPanels + partitionPanels;
const boltsPerSide = 13; // Fixed for FRP
const sharedEdgeBolts = (totalPanels * 4 * boltsPerSide) / 2;
const withBuffer = Math.round(sharedEdgeBolts * 1.2);
return withBuffer;
```

**Example:**
- 157 panels (FRP tank)
- (157 × 4 × 13) ÷ 2 × 1.2 = 4,898 bolt sets

### **Steel Tanks**

**Bolts Per Side - Material Specific:**

**SS316/SS304:**
- Metric (1m panels): **16 bolts per side**
- Imperial (4ft panels): **20 bolts per side**

**HDG/Mild Steel:**
- Metric (1m panels): **13 bolts per side**
- Imperial (4ft panels): **16 bolts per side**

**Bolt Material:**
- Must match tank material (SS316 with SS316, HDG with HDG, etc.)

**Bolt Set Pricing:**
- SS316: RM 2.50 - 5.00 per set
- SS304: RM 1.50 - 4.00 per set
- HDG: RM 0.80 - 2.00 per set

**Calculation Formula:**
```javascript
const totalPanels = basePanels + wallPanels + roofPanels + partitionPanels;
const boltsPerSide = getMaterialBoltsPerSide(material, panelType);
// SS316/SS304 Metric: 16, Imperial: 20
// HDG/MS Metric: 13, Imperial: 16
const sharedEdgeBolts = (totalPanels * 4 * boltsPerSide) / 2;
const withBuffer = Math.round(sharedEdgeBolts * 1.2);
return withBuffer;
```

**Examples:**
- 138 panels, SS316, Metric: (138 × 4 × 16) ÷ 2 × 1.2 = 5,299 bolt sets
- 146 panels, SS304, Imperial: (146 × 4 × 20) ÷ 2 × 1.2 = 7,008 bolt sets

---

## 🏗️ **SUPPORT STRUCTURES**

### **CRITICAL: Both FRP and Steel Have Internal AND External Support Options**

The difference is **MATERIAL SELECTION**, not availability of support types.

### **FRP Tanks - Support Materials**

**Internal Support:**
- Tie rods (horizontal stays): **SS304**
- Tie rods (vertical stays): **SS304**
- Internal brackets: **SS304**
- Roof support brackets: **ABS plastic**

**External Support:**
- I-Beams: **Available** (HDG steel)
- External brackets: **HDG steel**
- Foundation mounting: **HDG steel**

**Material Notes:**
- Internal components: SS304 (not SS316, cost optimization)
- External components: HDG (galvanized steel)
- Roof components: ABS plastic (lightweight, corrosion-free)
- FRP panels CAN support external I-beam structures

**Support Component Lengths:**
- Horizontal Stays (HS): 4ft, 8ft, 12ft, 16ft intervals
- Vertical Stays (VS): Custom lengths based on tank height
- I-Beams: Standard structural steel sizes

**Calculation:**
```javascript
if (material === 'FRP') {
  supportOptions = {
    internal: true,  // Available
    external: true,  // Available
  };
  
  if (supportType.includes('INTERNAL')) {
    tieRodMaterial = 'SS304';
    internalBracketMaterial = 'SS304';
    roofBracketMaterial = 'ABS';
  }
  
  if (supportType.includes('EXTERNAL')) {
    iBeamMaterial = 'HDG';
    externalBracketMaterial = 'HDG';
  }
}
```

### **Steel Tanks - Support Materials**

**Internal Support:**
- Tie rods (horizontal stays): **Match tank material** (SS316/SS304/HDG)
- Tie rods (vertical stays): **Match tank material**
- Internal brackets: **Match tank material**
- Roof support brackets: **Match tank material**

**External Support:**
- I-Beams: **Available** (HDG steel standard)
- External brackets: **HDG steel**
- Foundation mounting: **HDG steel**

**Material Notes:**
- Internal components: Match tank material for consistency
- External components: HDG standard (regardless of tank material)
- Roof components: Match tank material
- Steel panels can support heavier loads than FRP

**Support Component Lengths:**
- Horizontal Stays (HS): 4ft, 8ft, 12ft, 16ft, 20ft intervals
- Vertical Stays (VS): Custom lengths based on tank height
- I-Beams: Standard structural steel sizes

**Calculation:**
```javascript
if (material === 'SS316' || material === 'SS304' || material === 'HDG') {
  supportOptions = {
    internal: true,  // Available
    external: true,  // Available
  };
  
  if (supportType.includes('INTERNAL')) {
    tieRodMaterial = material;  // Match tank
    internalBracketMaterial = material;  // Match tank
    roofBracketMaterial = material;  // Match tank
  }
  
  if (supportType.includes('EXTERNAL')) {
    iBeamMaterial = 'HDG';  // Standard for all
    externalBracketMaterial = 'HDG';  // Standard for all
  }
}
```

### **Comparison Table: Support Material Selection**

| Component | FRP Tanks | Steel Tanks |
|-----------|-----------|-------------|
| **Internal Tie Rods** | SS304 | Match tank material |
| **Internal Brackets** | SS304 | Match tank material |
| **Roof Brackets** | ABS plastic | Match tank material |
| **External I-Beams** | HDG steel | HDG steel |
| **External Brackets** | HDG steel | HDG steel |

**Key Takeaway:**
- Both materials support internal AND external options
- Difference is in material selection, not availability
- FRP uses SS304 internal, ABS roof, HDG external
- Steel matches tank material for internal/roof, HDG for external

---

## 🪜 **LADDERS**

### **Material Selection - User Customizable**

**Important:** Ladder material is **NOT automatically fixed** by tank material. Users can select from compatible options.

### **FRP Tanks - Ladder Options**

**Internal Ladder Material Options:**
- FRP (recommended - matches tank, cost-effective)
- SS316 (premium upgrade option)
- SS304 (standard upgrade option)

**External Ladder Material Options:**
- HDG (standard, most common)
- SS316 (premium, for coastal environments)

**Default Recommendation:**
- Internal: FRP (cost-effective)
- External: HDG (standard durability)

**User Can Override:**
- Client may request SS316 for all ladders (premium)
- Client may request SS304 for internal (mid-tier upgrade)

**Pricing:**
- User selection affects total quote
- Premium materials increase ladder cost
- Calculator should show material options as dropdown

**Implementation:**
```javascript
if (material === 'FRP') {
  ladderOptions = {
    internal: ['FRP', 'SS304', 'SS316'],  // User selects
    external: ['HDG', 'SS316'],            // User selects
    defaultInternal: 'FRP',
    defaultExternal: 'HDG'
  };
  
  // User selection stored
  selectedInternalLadder = userChoice || 'FRP';
  selectedExternalLadder = userChoice || 'HDG';
}
```

### **Steel Tanks - Ladder Options**

**Internal Ladder Material Options:**
- SS316 (matches SS316 tanks, premium)
- SS304 (matches SS304 tanks, standard stainless)
- HDG (budget option for any steel tank)
- FRP (lightweight budget option)

**External Ladder Material Options:**
- SS316 (premium, coastal)
- SS304 (standard stainless)
- HDG (most common, cost-effective)

**Default Recommendation by Tank Material:**
- SS316 tank → SS316 ladder (default)
- SS304 tank → SS304 ladder (default)
- HDG tank → HDG ladder (default)

**User Can Override:**
- SS316 tank can use HDG ladder (cost savings)
- HDG tank can use SS316 ladder (upgrade)
- Any combination user prefers

**Pricing:**
- User selection affects total quote
- Material mismatch is acceptable (user choice)
- Calculator should show material options as dropdown

**Implementation:**
```javascript
if (material === 'SS316' || material === 'SS304' || material === 'HDG') {
  ladderOptions = {
    internal: ['SS316', 'SS304', 'HDG', 'FRP'],  // User selects
    external: ['SS316', 'SS304', 'HDG'],          // User selects
    defaultInternal: material,  // Match tank by default
    defaultExternal: 'HDG'      // HDG most common
  };
  
  // User selection stored
  selectedInternalLadder = userChoice || material;
  selectedExternalLadder = userChoice || 'HDG';
}
```

### **Ladder Material Comparison**

| Material | Corrosion Resistance | Weight | Cost | Best For |
|----------|---------------------|--------|------|----------|
| **SS316** | Excellent (Marine grade) | Heavy | Highest | Coastal, premium |
| **SS304** | Good | Heavy | Mid-high | Standard commercial |
| **HDG** | Good (Galvanized) | Heavy | Mid | Most common choice |
| **FRP** | Excellent | Lightweight | Low-mid | FRP tanks, budget |

### **UI Implementation**

**Calculator Should Show:**
```
Internal Ladder Material:
[ Dropdown: FRP / SS304 / SS316 / HDG ]
(Default: FRP for FRP tanks, Match material for Steel)

External Ladder Material:
[ Dropdown: HDG / SS316 / SS304 ]
(Default: HDG)
```

**Pricing Lookup:**
```javascript
function getLadderPrice(ladderType, material, height) {
  const sku = generateLadderSKU(ladderType, material, height);
  return getPriceFromCSV(sku);
}
```

### **Key Takeaways**

- ✅ Ladder material is USER SELECTABLE
- ✅ Default recommendations provided based on tank material
- ✅ User can override for cost savings or upgrades
- ✅ All combinations are acceptable
- ✅ Calculator must show dropdown options
- ✅ Pricing varies by user selection

---

## 📏 **WATER LEVEL INDICATOR (WLI)**

### **Selection Method - Build Standard Preselection OR Custom**

**Two Ways to Select WLI Material:**
1. **Automatic Preselection** - Based on build standard chosen
2. **Manual Override** - User can customize material selection

### **FRP Tanks - WLI Options**

**Build Standard Preselections:**

**MS1390:2010 (Malaysian Standard):**
- Preselected Material: **HDG** (cost-effective, SPAN approved)
- User can override to: SS304, SS316

**SS245:2014 (Singapore Standard):**
- Preselected Material: **SS304** (higher standard requirement)
- User can override to: HDG, SS316

**Available Materials for FRP:**
- HDG (most common, cost-effective)
- SS304 (standard stainless, premium option)
- SS316 (marine grade, rarely needed for FRP)

**Default Logic:**
```javascript
if (material === 'FRP') {
  // Preselection based on build standard
  if (buildStandard === 'MS1390:2010') {
    wliMaterialDefault = 'HDG';
  } else if (buildStandard === 'SS245:2014') {
    wliMaterialDefault = 'SS304';
  }
  
  // User can override
  wliMaterialOptions = ['HDG', 'SS304', 'SS316'];
  selectedWLI = userCustomSelection || wliMaterialDefault;
}
```

**Pricing:**
- HDG: Lowest cost
- SS304: Mid cost
- SS316: Highest cost (rarely selected for FRP)

### **Steel Tanks - WLI Options**

**Build Standard Preselections:**

**BSI (British Standard):**
- Preselected Material: **Match tank material**
- User can override to any compatible material

**LPCB (Loss Prevention Certification Board):**
- Preselected Material: **Match tank material** (fire safety consistency)
- User can override with caution

**SANS 10329:2020 (South African Standard):**
- Preselected Material: **Match tank material**
- User can override to: Any compatible material

**Available Materials for Steel:**
- SS316 (for SS316 tanks, or coastal environments)
- SS304 (for SS304 tanks, standard commercial)
- HDG (for HDG tanks, or cost savings on stainless tanks)

**Default Logic:**
```javascript
if (material === 'SS316' || material === 'SS304' || material === 'HDG') {
  // Preselection based on build standard
  if (buildStandard === 'BSI' || buildStandard === 'LPCB' || buildStandard === 'SANS') {
    wliMaterialDefault = material; // Match tank
  }
  
  // User can override
  wliMaterialOptions = ['SS316', 'SS304', 'HDG'];
  selectedWLI = userCustomSelection || wliMaterialDefault;
}
```

**Selection Considerations:**

**Coastal Environment:**
- Recommendation: SS316 (regardless of tank material)
- User override: Can downgrade but not recommended

**Indoor/Controlled Environment:**
- Recommendation: Match tank material or downgrade to HDG
- User override: Can upgrade to SS316 if preferred

**Budget Projects:**
- Recommendation: HDG (even for stainless tanks)
- User override: Acceptable with client approval

### **WLI Material Comparison**

| Material | Corrosion Resistance | Cost | Best For |
|----------|---------------------|------|----------|
| **SS316** | Excellent (Marine) | Highest | Coastal, marine environments |
| **SS304** | Good | Mid | Standard commercial, indoor |
| **HDG** | Good (Galvanized) | Lowest | Budget, controlled environments |

### **UI Implementation**

**Calculator Should Show:**

**Step 1: Build Standard Selection**
```
Build Standard:
[ Dropdown: MS1390 / SS245 / BSI / LPCB / SANS ]
```

**Step 2: WLI Material (Auto-filled, Editable)**
```
WLI Material:
[ Dropdown: HDG / SS304 / SS316 ]
Default: [Preselected based on build standard]
(User can change)
```

**Example Flow:**

**FRP Tank Example:**
1. User selects Build Standard: MS1390
2. WLI auto-fills: HDG (preselected)
3. User can change to: SS304 or SS316 if desired
4. Pricing updates based on selection

**Steel Tank Example:**
1. User selects Material: SS316
2. User selects Build Standard: BSI
3. WLI auto-fills: SS316 (matches tank)
4. User can change to: HDG (cost savings) if desired
5. Pricing updates based on selection

### **Implementation Code**

```javascript
function getWLIMaterial(tankMaterial, buildStandard, userOverride = null) {
  let preselected;
  let options;
  
  if (tankMaterial === 'FRP') {
    // FRP preselection logic
    if (buildStandard === 'MS1390:2010') {
      preselected = 'HDG';
    } else if (buildStandard === 'SS245:2014') {
      preselected = 'SS304';
    }
    options = ['HDG', 'SS304', 'SS316'];
    
  } else {
    // Steel preselection logic
    if (['BSI', 'LPCB', 'SANS'].includes(buildStandard)) {
      preselected = tankMaterial; // Match tank
    }
    options = ['SS316', 'SS304', 'HDG'];
  }
  
  // User override takes precedence
  const selected = userOverride || preselected;
  
  return {
    material: selected,
    preselected: preselected,
    options: options,
    isCustom: userOverride !== null
  };
}
```

### **Pricing Lookup**

```javascript
function getWLIPrice(material, height) {
  const sku = generateWLISKU(material, height);
  return getPriceFromCSV(sku);
}
```

### **Key Takeaways**

- ✅ WLI material preselected based on build standard
- ✅ User can override/customize selection
- ✅ All material combinations acceptable
- ✅ Calculator shows dropdown with options
- ✅ Preselection follows best practices
- ✅ User override is common (cost optimization or upgrade)
- ✅ Pricing varies by user selection

---

## 🚪 **MANHOLES**

### **Both FRP and Steel - SIMILAR**

**Types Available:**
- Normal Manhole (hinged lid)
- Sliding Manhole (sliding lid for roof access)

**Material:**
- **FRP Tanks:** FRP manhole cover with SS304 frame
- **Steel Tanks:** Steel manhole matching tank material

**Sizing:**
- Standard: 600mm × 600mm opening
- Large: 800mm × 800mm opening (for maintenance access)

**Differences:**

**FRP:**
- Lighter weight
- Requires rubber gasket seal
- Cannot be welded (bolted only)

**Steel:**
- Heavier, more robust
- Can be welded or bolted
- Metal-to-metal seal option

---

## 🏭 **BUILD STANDARDS**

### **FRP Tanks**

**MS1390:2010 (Malaysian Standard - SPAN Approved)**
- Metric (1m) panels Type 2 ONLY
- 35% minimum fiberglass content
- Pressure rating: Up to 10m water head
- Panel codes: S10-S60 (sidewall), B10-B60 (base), R00 (roof)
- Certification: SPAN (Malaysia water authority) approved

**SS245:2014 (Singapore Standard)**
- Compatible with MS1390
- Additional UV resistance requirements
- Used for Singapore market
- Stricter quality control

**CRITICAL NOTES:**
- ❌ FRP does NOT use BSI, LPCB, or SANS (those are steel standards)
- ✅ FRP has its own standards focused on fiberglass composition
- ✅ FRP standards: MS1390 (Malaysia), SS245 (Singapore)

### **Steel Tanks**

**BSI (British Standard)**
- Used in UK/Commonwealth markets
- Simplified thickness requirements
- Panel thickness based on tank HEIGHT (number of panel tiers)

**BSI Panel Thickness Rules:**

**For tanks 1-3 panels height (1-3m Metric or 4-12ft Imperial):**
- All panels: **5mm thickness**
  - Base panels: 5mm
  - All wall tiers: 5mm
  - Roof panels: 1.5mm (standard)

**For tanks 4+ panels height (4m+ Metric or 16ft+ Imperial):**
- Base panels: **6mm thickness**
- 1st tier (bottom wall): **6mm thickness**
- 2nd tier and above: **5mm thickness**
- Roof panels: 1.5mm (standard)

**BSI Thickness Table - Metric (1m × 1m):**
| Height | Base | Tier 1 | Tier 2 | Tier 3 | Tier 4 |
|--------|------|--------|--------|--------|--------|
| 1m | 5mm | 5mm | - | - | - |
| 2m | 5mm | 5mm | 5mm | - | - |
| 3m | 5mm | 5mm | 5mm | 5mm | - |
| 4m | 6mm | 6mm | 5mm | 5mm | 5mm |
| 5m | 6mm | 6mm | 5mm | 5mm | 5mm |

**BSI Thickness Table - Imperial (4ft × 4ft):**
| Height | Base | Tier 1 | Tier 2 | Tier 3 |
|--------|------|--------|--------|--------|
| 4ft | 5mm | 5mm | - | - |
| 8ft | 5mm | 5mm | 5mm | - |
| 12ft | 5mm | 5mm | 5mm | 5mm |
| 16ft | 6mm | 6mm | 5mm | 5mm |
| 20ft | 6mm | 6mm | 5mm | 5mm |

---

**LPCB (Loss Prevention Certification Board)**
- Fire protection standard
- Required for insurance/safety critical applications
- **SAME thickness rules as BSI** (see BSI tables above)
- **ADDITIONAL REQUIREMENT:** Vortex draining system

**LPCB Panel Thickness:**
- **Identical to BSI thickness rules**
- 1-3 panels height: All 5mm
- 4+ panels height: 6mm base & 1st tier, 5mm above

**LPCB Additional Requirements:**

**Vortex Draining:**
- Specialized drain valve system
- Creates vortex flow for complete tank draining
- Required for fire protection water tanks
- Ensures no stagnant water remains
- Must be included in LPCB quotes

**LPCB Implementation:**
```javascript
if (buildStandard === 'LPCB') {
  // Same thickness as BSI
  const panelThickness = getBSIThickness(tankHeight, tierNumber);
  
  // Add vortex draining requirement
  accessories.push({
    type: 'VORTEX_DRAIN',
    required: true,
    material: 'SS316', // or match tank material
    reason: 'LPCB fire protection standard'
  });
}
```

**LPCB Pricing:**
- Base tank panels: Same as BSI (5mm/6mm panels)
- Additional: Vortex drain valve system (from CSV)
- Typical vortex drain cost: Look up SKU in sku_prices.csv

---

**SANS 10329:2020 (South African National Standard)**
- Steel tank standard for South African market
- Used for export to South Africa
- **Variable thickness standard** (like graduated pressure-based system)

**SANS Panel Thickness Rules:**

Uses graduated thickness based on water pressure (thicker at bottom, thinner at top)

**SANS Thickness Table - Metric (1m × 1m):**
| Height | Base | Tier 1 | Tier 2 | Tier 3 | Tier 4 |
|--------|------|--------|--------|--------|--------|
| 1m | 3.0mm | 3.0mm | - | - | - |
| 2m | 3.0mm | 3.0mm | 3.0mm | - | - |
| 3m | 4.5mm | 4.5mm | 3.0mm | 3.0mm | - |
| 4m | 5.0mm | 5.0mm | 4.5mm | 3.0mm | 3.0mm |
| 5m+ | 6.0mm | 6.0mm | 5.0mm | 4.5mm | 3.0mm |

**SANS Thickness Table - Imperial (4ft × 4ft):**
| Height | Base | Tier 1 | Tier 2 | Tier 3 |
|--------|------|--------|--------|--------|
| 4ft (1.22m) | 2.5mm | 2.5mm | - | - |
| 8ft (2.44m) | 3.0mm | 3.0mm | 2.5mm | - |
| 12ft (3.66m) | 4.0mm | 4.0mm | 3.0mm | 2.5mm |
| 16ft+ (4.88m) | 5.0mm | 5.0mm | 4.0mm | 3.0mm |

**SANS Implementation (from bomCalculator.js):**
```javascript
export function getSANSThickness(heightMeters, panelType) {
  const heightMM = heightMeters * 1000;
  
  if (panelType === 'm') {
    // METRIC PANELS
    if (heightMM >= 1000 && heightMM <= 1020) {
      return { base: 3.0, tiers: [3.0], roof: 1.5 };
    } else if (heightMM >= 2000 && heightMM <= 2040) {
      return { base: 3.0, tiers: [3.0, 3.0], roof: 1.5 };
    } else if (heightMM >= 3000 && heightMM <= 3060) {
      return { base: 4.5, tiers: [4.5, 3.0, 3.0], roof: 1.5 };
    } else if (heightMM >= 4000 && heightMM <= 4080) {
      return { base: 5.0, tiers: [5.0, 4.5, 3.0, 3.0], roof: 1.5 };
    }
  } else if (panelType === 'i') {
    // IMPERIAL PANELS
    if (heightMM >= 1200 && heightMM <= 1220) {
      return { base: 2.5, tiers: [2.5], roof: 1.5 };
    } else if (heightMM >= 2400 && heightMM <= 2440) {
      return { base: 3.0, tiers: [3.0, 2.5], roof: 1.5 };
    } else if (heightMM >= 3600 && heightMM <= 3660) {
      return { base: 4.0, tiers: [4.0, 3.0, 2.5], roof: 1.5 };
    }
  }
}
```

---

**Build Standard Comparison - ALL THREE STANDARDS:**

**Example: 3m Height Tank (Metric):**
| Standard | Base | Tier 1 | Tier 2 | Tier 3 |
|----------|------|--------|--------|--------|
| BSI | 5mm | 5mm | 5mm | 5mm |
| LPCB | 5mm | 5mm | 5mm | 5mm |
| SANS | 4.5mm | 4.5mm | 3.0mm | 3.0mm |

**Example: 4m Height Tank (Metric):**
| Standard | Base | Tier 1 | Tier 2 | Tier 3 | Tier 4 |
|----------|------|--------|--------|--------|--------|
| BSI | 6mm | 6mm | 5mm | 5mm | 5mm |
| LPCB | 6mm | 6mm | 5mm | 5mm | 5mm |
| SANS | 5.0mm | 5.0mm | 4.5mm | 3.0mm | 3.0mm |

**Key Differences Between All Standards:**

**BSI/LPCB (Simplified):**
- Only 2 thickness values: 5mm or 6mm
- Height-based: 1-3 panels = all 5mm, 4+ panels = 6mm bottom
- LPCB adds vortex draining requirement
- Simpler to calculate and quote

**SANS (Graduated):**
- Multiple thickness values: 2.5mm, 3.0mm, 4.0mm, 4.5mm, 5.0mm, 6.0mm
- Pressure-based: Thicker at bottom (high pressure), thinner at top
- More economical on material (uses thinner panels where possible)
- More complex to calculate

**Material Cost Comparison (4m tank example):**
- BSI/LPCB: More expensive (all 6mm bottom + 5mm above)
- SANS: More economical (uses 5mm, 4.5mm, 3mm graduated)
- SANS can save 10-15% on panel costs vs BSI/LPCB

**When to Use Each Standard:**
- BSI: UK/Commonwealth markets, simpler quoting
- LPCB: Fire protection requirements, insurance mandated
- SANS: South African market, cost optimization

**CRITICAL NOTES:**
- ❌ Steel does NOT use MS1390 or SS245 (those are FRP only)
- ✅ Steel has fire rating requirements (LPCB)
- ✅ Steel can achieve FM approval (Factory Mutual fire rating)
- ✅ Steel standards: BSI (UK), LPCB (Fire), SANS (South Africa)
- ✅ BSI/LPCB use SIMPLIFIED thickness (5mm/6mm only)
- ✅ LPCB requires vortex draining accessory for fire protection
- ✅ SANS uses GRADUATED thickness (variable by tier, cost-optimized)
- ✅ All three standards already in your bomCalculator.js code!

---

**Build Standard Comparison - Panel Thickness:**

**Example: 3m Height Tank (Metric):**
| Standard | Base | Wall Tier 1 | Wall Tier 2 | Wall Tier 3 |
|----------|------|-------------|-------------|-------------|
| BSI | 5mm | 5mm | 5mm | 5mm |
| LPCB | 5mm | 5mm | 5mm | 5mm |
| SANS | TBD | TBD | TBD | TBD |

**Example: 4m Height Tank (Metric):**
| Standard | Base | Wall Tier 1 | Wall Tier 2 | Wall Tier 3 | Wall Tier 4 |
|----------|------|-------------|-------------|-------------|-------------|
| BSI | 6mm | 6mm | 5mm | 5mm | 5mm |
| LPCB | 6mm | 6mm | 5mm | 5mm | 5mm |
| SANS | TBD | TBD | TBD | TBD | TBD |

**Key Differences Between Standards:**
- BSI/LPCB use SIMPLIFIED thickness rules (only 5mm or 6mm)
- Height-based: 1-3 panels = all 5mm, 4+ panels = 6mm bottom
- LPCB = BSI thickness + vortex draining requirement
- Much simpler than variable-thickness standards

**CRITICAL NOTES:**
- ❌ Steel does NOT use MS1390 or SS245 (those are FRP only)
- ✅ Steel has fire rating requirements (LPCB)
- ✅ Steel can achieve FM approval (Factory Mutual fire rating)
- ✅ Steel standards: BSI (UK), LPCB (Fire), SANS (South Africa)
- ✅ BSI/LPCB use only TWO thickness values: 5mm or 6mm
- ✅ LPCB requires vortex draining accessory for fire protection

---

## 💰 **PRICING STRUCTURE**

### **Price Data Source**

**ALL pricing comes from:** `public/sku_prices.csv`  
**Column to use:** `market_final_price`  
**Total SKUs:** 11,578 items

### **Price Lookup Process**

**Step 1: Generate SKU**
```javascript
// FRP Example
const sku = '3B20-FRP';  // Base, 2m depth

// Steel Example  
const sku = '1B45-m-S2';  // Base, 4.5mm, Metric, SS316
```

**Step 2: Look up in CSV**
```javascript
const priceData = loadCSV('public/sku_prices.csv');
const priceRow = priceData.find(row => row.InternalReference === sku);
const price = parseFloat(priceRow.market_final_price);
```

**Step 3: Handle Not Found**
```javascript
if (!priceRow || !price) {
  // Fallback to placeholder (indicates missing SKU)
  console.warn(`SKU not found: ${sku}`);
  return PLACEHOLDER_PRICE; // RM 150.00 for panels, RM 375.00 for roof
}
```

### **Critical Rules**

**DO:**
- ✅ Always use `market_final_price` column
- ✅ Generate exact SKU format for lookup
- ✅ Handle missing SKUs gracefully
- ✅ Log when placeholder prices are used

**DON'T:**
- ❌ Use `our_final_price` column
- ❌ Hardcode prices in calculator
- ❌ Assume prices without CSV lookup
- ❌ Fail silently when SKU not found

### **Cost Comparisons - Understanding Relative Pricing**

**What This Means:**
When quoting different tank configurations, users need to understand how material choices affect total cost. This helps in:
1. Recommending optimal solutions to clients
2. Providing budget vs premium options
3. Understanding cost/benefit tradeoffs

**Material Cost Hierarchy (Panels):**

From HIGHEST to LOWEST cost:
1. **SS316** (Marine Grade Stainless) - 100% baseline
2. **SS304** (Standard Stainless) - ~70-80% of SS316
3. **FRP** (Fiberglass) - ~40-60% of SS316
4. **HDG** (Galvanized) - ~40-50% of SS316
5. **Mild Steel** (Uncoated) - ~30-40% of SS316

**Example Comparison:**
```
Same 5m×5m×3m Tank:
- SS316: RM 50,000 (baseline)
- SS304: RM 35,000-40,000 (30% savings)
- FRP: RM 20,000-30,000 (40-60% savings)
- HDG: RM 20,000-25,000 (50-60% savings)
```

**Accessory Cost Impact:**

Changing accessory materials affects total quote:

**Ladder Material Impact:**
- SS316 ladder: +RM 2,000-3,000
- SS304 ladder: +RM 1,500-2,000
- HDG ladder: +RM 800-1,200
- FRP ladder: +RM 600-1,000

**WLI Material Impact:**
- SS316 WLI: +RM 500-800
- SS304 WLI: +RM 300-500
- HDG WLI: +RM 200-300

**Support Structure Impact:**

**Internal Support Only:**
- Base cost (included in most quotes)
- Material: FRP uses SS304, Steel matches tank

**External Support (I-Beams):**
- Additional cost: +RM 3,000-8,000 (depending on tank size)
- Material: HDG for both FRP and Steel
- Required for: Large tanks, elevated installations

**Configuration Comparison Examples:**

**Example 1: Budget FRP vs Premium Steel**
```
8m×8m×4m Tank

FRP Configuration (Budget):
- Panels: FRP (Metric)
- Support: Internal only (SS304)
- Ladder: FRP internal
- WLI: HDG
- Total: ~RM 28,000

SS316 Configuration (Premium):
- Panels: SS316 (Metric)
- Support: Internal + External (I-beams)
- Ladder: SS316 internal + HDG external
- WLI: SS316
- Total: ~RM 80,000-90,000

Cost Difference: 3x more expensive for SS316
```

**Example 2: Smart Cost Optimization**
```
5m×5m×3m Tank for Indoor Commercial Use

Standard SS316 Config:
- All SS316 accessories
- Total: RM 50,000

Optimized SS316 Config:
- SS316 panels (maintain quality)
- HDG ladder (acceptable for indoor)
- HDG WLI (adequate for indoor)
- Internal support only
- Total: RM 45,000

Savings: RM 5,000 (10%) without compromising tank quality
```

**Example 3: Coastal Environment**
```
10m×10m×4m Tank - Coastal Location

Cannot Compromise:
- Must use SS316 panels (corrosion)
- Must use SS316 WLI (corrosion)
- Recommend SS316 ladders

Can Optimize:
- External support: HDG acceptable (can be replaced)
- Internal support: SS304 acceptable (not exposed to salt)

Premium Config: RM 120,000
Optimized Config: RM 110,000
Savings: RM 10,000 while maintaining coastal durability
```

**Cost Comparison Decision Tree:**

```
Client Budget Constraint?
│
├─ Very Budget Conscious
│  └─ Recommend: HDG or FRP
│     └─ Accessories: HDG (minimize cost)
│
├─ Mid-Range Budget
│  └─ Recommend: FRP (best value) or SS304
│     └─ Accessories: Mix (HDG external, SS304 internal)
│
└─ Premium / No Constraint
   └─ Recommend: SS316 or SS304
      └─ Accessories: Match tank material

Environment Factor?
│
├─ Coastal / Marine
│  └─ MUST use SS316 (no compromise)
│     └─ Can optimize accessories to HDG where protected
│
├─ Industrial / Chemical
│  └─ SS316 or FRP (depending on chemical)
│     └─ Accessories: Match tank
│
└─ Indoor / Controlled
   └─ Any material acceptable
      └─ Cost optimize: HDG accessories even with SS316 tank
```

**How to Present Cost Comparisons to Clients:**

**Option 1: Good-Better-Best**
```
GOOD (Budget):
- FRP tank, HDG accessories
- Total: RM 28,000
- Lifespan: 15-20 years

BETTER (Recommended):
- SS304 tank, HDG accessories
- Total: RM 40,000
- Lifespan: 25-30 years

BEST (Premium):
- SS316 tank, SS316 accessories
- Total: RM 50,000
- Lifespan: 30-40 years
```

**Option 2: Match to Use Case**
```
Potable Water (Residential):
- FRP recommended: RM 28,000
- Reason: Corrosion-free, food-grade, cost-effective

Chemical Storage (Industrial):
- SS316 recommended: RM 50,000
- Reason: Chemical resistant, durable, certified

Fire Protection (LPCB Required):
- Steel (BSI/LPCB): RM 45,000
- Reason: Fire rating, insurance requirement
```

**Using Cost Comparisons in Calculator:**

**UI Feature - Show Comparison:**
```
Current Configuration: RM 50,000
  SS316 panels: RM 42,000
  SS316 ladder: RM 2,500
  SS316 WLI: RM 600
  I-Beams: RM 4,900

[ Compare with Budget Option ]

Budget Alternative: RM 43,000 (-14% savings)
  SS316 panels: RM 42,000 (same quality)
  HDG ladder: RM 900 (-RM 1,600)
  HDG WLI: RM 250 (-RM 350)
  No I-Beams: RM 0 (-RM 4,900)
  
Cost Reduction: RM 7,000
Trade-off: HDG accessories (suitable for indoor use)
```

**Key Takeaway:**
Cost comparisons help users make informed decisions by:
- Showing material cost hierarchy
- Identifying optimization opportunities
- Matching solutions to budgets
- Explaining cost vs benefit tradeoffs
- Enabling smart accessory selection

All pricing still comes from sku_prices.csv - these are just guidance on relative costs.

### **Bolt Pricing**

**Important:** Bolt prices in CSV should be per SET, not per piece

**Bolt SET = 1 bolt + 1 nut + 2 washers (4 pieces total)**

**SKU Pattern:** 
- `BN300[X]BNM10025` where X = material code
- Look up in CSV using exact SKU

**Expected Range (from CSV):**
- SS316 bolt sets: Higher price range
- SS304 bolt sets: Mid-high price range
- HDG bolt sets: Lower price range
- FRP bolt sets: Lower price range

### **Volume Tiers**

Check CSV for volume-based pricing columns:
- Small tanks (<6ML): Standard pricing
- Large tanks (>6ML): May have different pricing tier
- Review CSV columns for any volume discount structures

### **Missing SKUs - Action Required**

**If SKU not found in CSV:**
1. Log the missing SKU
2. Use placeholder price (temporary)
3. Flag quote as "NEEDS PRICING REVIEW"
4. Report missing SKUs for CSV update

**Common Missing SKU Scenarios:**
- Imperial SS316 panels (historical gap)
- Partition panels with φ symbol
- New panel thickness variants
- Custom accessories

### **Implementation Code**

```javascript
function getPriceFromCSV(sku) {
  const priceData = loadedCSV; // Pre-loaded from sku_prices.csv
  
  // Find exact match
  const row = priceData.find(r => r.InternalReference === sku);
  
  if (row && row.market_final_price) {
    const price = parseFloat(row.market_final_price);
    
    if (!isNaN(price) && price > 0) {
      return {
        price: price,
        source: 'CSV',
        sku: sku
      };
    }
  }
  
  // SKU not found or invalid price
  console.warn(`Pricing issue for SKU: ${sku}`);
  return {
    price: getPlaceholderPrice(sku),
    source: 'PLACEHOLDER',
    sku: sku,
    needsReview: true
  };
}

function getPlaceholderPrice(sku) {
  // Temporary fallback when SKU not in CSV
  if (sku.includes('R') || sku.includes('roof')) {
    return 375.00; // Roof placeholder
  }
  return 150.00; // Panel placeholder
}
```

### **Price Validation**

**After lookup, validate:**
```javascript
function validatePrice(price, sku, material) {
  // Check if placeholder was used
  if (price === 150.00 || price === 375.00) {
    warnings.push(`Using placeholder price for ${sku}`);
  }
  
  // Check if price makes sense for material
  if (material === 'SS316' && price < 200) {
    warnings.push(`SS316 price seems low: ${sku} = RM ${price}`);
  }
  
  if (material === 'FRP' && price > 500) {
    warnings.push(`FRP price seems high: ${sku} = RM ${price}`);
  }
  
  return warnings;
}
```

### **CSV Maintenance**

**Regular tasks:**
1. Update prices when supplier costs change
2. Add new SKUs for new products
3. Review placeholder usage reports
4. Validate thickness-based pricing consistency
5. Check material hierarchy is maintained

---

**Key Takeaway:**
- ALL prices come from `sku_prices.csv`
- Use `market_final_price` column only
- Generate exact SKU for lookup
- Handle missing SKUs with placeholder + warning
- Log all pricing issues for CSV updates

---

## 🔧 **IMPLEMENTATION CHECKLIST**

### **Code Structure Required**

**1. Material Detection:**
```javascript
function isFRP(material) {
  return material === 'FRP' || material === 'GRP';
}

function isSteel(material) {
  return ['SS316', 'SS304', 'HDG', 'MS'].includes(material);
}
```

**2. Support Structure Logic:**
```javascript
function getSupportMaterials(material, supportType) {
  const config = {
    internalAvailable: true,
    externalAvailable: true
  };
  
  if (isFRP(material)) {
    // FRP - Both types available, different materials
    if (supportType.includes('INTERNAL')) {
      config.tieRodMaterial = 'SS304';
      config.internalBracketMaterial = 'SS304';
      config.roofBracketMaterial = 'ABS';
    }
    if (supportType.includes('EXTERNAL')) {
      config.iBeamMaterial = 'HDG';
      config.externalBracketMaterial = 'HDG';
    }
  } else {
    // Steel - Both types available, match tank material internally
    if (supportType.includes('INTERNAL')) {
      config.tieRodMaterial = material;
      config.internalBracketMaterial = material;
      config.roofBracketMaterial = material;
    }
    if (supportType.includes('EXTERNAL')) {
      config.iBeamMaterial = 'HDG';
      config.externalBracketMaterial = 'HDG';
    }
  }
  
  return config;
}
```

**3. Bolt Calculation:**
```javascript
function getBoltsPerSide(material, panelType) {
  if (isFRP(material)) {
    return 13; // Always 13 for FRP
  } else if (material === 'SS316' || material === 'SS304') {
    return panelType === 'METRIC' ? 16 : 20;
  } else if (material === 'HDG' || material === 'MS') {
    return panelType === 'METRIC' ? 13 : 16;
  }
}
```

**4. Panel Type Validation:**
```javascript
function validatePanelType(material, panelType) {
  if (isFRP(material) && panelType === 'IMPERIAL') {
    throw new Error('FRP panels only available in Metric (1m×1m)');
  }
  return true;
}
```

**5. Build Standard Selection:**
```javascript
function getBuildStandards(material) {
  if (isFRP(material)) {
    return ['MS1390:2010', 'SS245:2014'];
  } else {
    return ['BSI', 'LPCB', 'SANS 10329:2020'];
  }
}

// Panel thickness by build standard
function getPanelThickness(buildStandard, tankHeight, tierNumber, panelType) {
  if (buildStandard === 'BSI' || buildStandard === 'LPCB') {
    // BSI/LPCB simplified rules
    const totalPanels = Math.ceil(tankHeight); // Number of panel tiers
    
    if (panelType === 'ROOF') {
      return 1.5; // Standard roof thickness
    }
    
    if (totalPanels <= 3) {
      // 1-3 panels height: All 5mm
      return 5.0;
    } else {
      // 4+ panels height
      if (panelType === 'BASE' || tierNumber === 1) {
        return 6.0; // Base and 1st tier: 6mm
      } else {
        return 5.0; // 2nd tier and above: 5mm
      }
    }
  } else if (buildStandard === 'SANS 10329:2020') {
    // SANS graduated thickness rules
    const heightMM = tankHeight * 1000;
    const panelSize = panelType === 'METRIC' ? 1.0 : 1.22;
    
    if (panelType === 'ROOF') {
      return 1.5;
    }
    
    // Get thickness table for height
    const thicknessTable = getSANSThickness(tankHeight, panelSize === 1.0 ? 'm' : 'i');
    
    if (panelType === 'BASE') {
      return thicknessTable.base;
    } else {
      // Wall tier (tierNumber starts at 1)
      return thicknessTable.tiers[tierNumber - 1] || 3.0;
    }
  }
  
  // Default fallback
  return 3.0;
}

// SANS thickness lookup
function getSANSThickness(heightMeters, panelType) {
  const heightMM = heightMeters * 1000;
  
  if (panelType === 'm') {
    // Metric
    if (heightMM <= 1020) return { base: 3.0, tiers: [3.0], roof: 1.5 };
    if (heightMM <= 2040) return { base: 3.0, tiers: [3.0, 3.0], roof: 1.5 };
    if (heightMM <= 3060) return { base: 4.5, tiers: [4.5, 3.0, 3.0], roof: 1.5 };
    if (heightMM <= 4080) return { base: 5.0, tiers: [5.0, 4.5, 3.0, 3.0], roof: 1.5 };
    return { base: 6.0, tiers: [6.0, 5.0, 4.5, 3.0], roof: 1.5 };
  } else {
    // Imperial
    if (heightMM <= 1220) return { base: 2.5, tiers: [2.5], roof: 1.5 };
    if (heightMM <= 2440) return { base: 3.0, tiers: [3.0, 2.5], roof: 1.5 };
    if (heightMM <= 3660) return { base: 4.0, tiers: [4.0, 3.0, 2.5], roof: 1.5 };
    return { base: 5.0, tiers: [5.0, 4.0, 3.0], roof: 1.5 };
  }
}

// LPCB accessories
function getRequiredAccessories(buildStandard) {
  const accessories = [];
  
  if (buildStandard === 'LPCB') {
    accessories.push({
      type: 'VORTEX_DRAIN',
      required: true,
      description: 'Vortex draining system for fire protection'
    });
  }
  
  return accessories;
}
```

**6. Accessory Material Selection:**
```javascript
function getAccessoryMaterials(material, buildStandard, accessoryType, userOverride = null) {
  let options = [];
  let preselected;
  
  if (isFRP(material)) {
    switch(accessoryType) {
      case 'INTERNAL_LADDER':
        options = ['FRP', 'SS304', 'SS316'];
        preselected = 'FRP';
        break;
      case 'EXTERNAL_LADDER':
        options = ['HDG', 'SS316'];
        preselected = 'HDG';
        break;
      case 'WLI':
        options = ['HDG', 'SS304', 'SS316'];
        // Preselect based on build standard
        preselected = buildStandard === 'MS1390:2010' ? 'HDG' : 'SS304';
        break;
      case 'ROOF_BRACKET':
        return 'ABS'; // Fixed for FRP
      case 'INTERNAL_BRACKET':
        return 'SS304'; // Fixed for FRP
    }
  } else {
    // Steel
    switch(accessoryType) {
      case 'INTERNAL_LADDER':
        options = ['SS316', 'SS304', 'HDG', 'FRP'];
        preselected = material; // Match tank
        break;
      case 'EXTERNAL_LADDER':
        options = ['SS316', 'SS304', 'HDG'];
        preselected = 'HDG';
        break;
      case 'WLI':
        options = ['SS316', 'SS304', 'HDG'];
        preselected = material; // Match tank by default
        break;
      case 'ROOF_BRACKET':
        return material; // Match tank
      case 'INTERNAL_BRACKET':
        return material; // Match tank
    }
  }
  
  // User override takes precedence
  const selected = userOverride || preselected;
  
  return {
    material: selected,
    preselected: preselected,
    options: options,
    isCustom: userOverride !== null
  };
}
```

---

## ✅ **VALIDATION TESTS**

### **Test Case 1: FRP Tank**
```
Input:
- Material: FRP
- Dimensions: 8m × 8m × 2m
- Partitions: 0
- Build Standard: MS1390:2010

Expected:
- Panels: 157 (metric 1m×1m)
- Bolts: 4,898 sets (157 × 4 × 13 ÷ 2 × 1.2)
- Support: Internal or External option available
  - If Internal: SS304 tie rods, SS304 brackets, ABS roof brackets
  - If External: HDG I-beams, HDG brackets
- Ladder (User Selectable):
  - Internal options: FRP (default) / SS304 / SS316
  - External options: HDG (default) / SS316
- WLI (Preselected, User Can Override):
  - Preselected: HDG (from MS1390 standard)
  - Options: HDG / SS304 / SS316
- Pricing: Look up in sku_prices.csv (market_final_price)
- Cost Comparison: Baseline for FRP configuration
```

### **Test Case 2: SS316 Steel Tank (BSI Standard)**
```
Input:
- Material: SS316
- Dimensions: 5m × 5m × 3m (3 panels height)
- Partitions: 1
- Build Standard: BSI

Expected:
- Panels: 138 (metric 1m×1m)
- Panel Thickness: ALL 5mm (BSI rule: 1-3 panels = all 5mm)
  - Base: 5mm
  - All wall tiers: 5mm
  - Partition: 5mm
  - Roof: 1.5mm
- Bolts: 5,299 sets (138 × 4 × 16 ÷ 2 × 1.2)
- Support: Internal or External option available
  - If Internal: SS316 tie rods, SS316 brackets, SS316 roof brackets
  - If External: HDG I-beams, HDG brackets
- Ladder (User Selectable):
  - Internal options: SS316 (default) / SS304 / HDG / FRP
  - External options: HDG (default) / SS316 / SS304
- WLI (Preselected, User Can Override):
  - Preselected: SS316 (match tank from BSI standard)
  - Options: SS316 / SS304 / HDG
- Pricing: Look up in sku_prices.csv (market_final_price)
  - SKU format: 1B5-m-S2, 1A5-m-S2, etc. (5mm thickness)
- Cost Comparison: Premium configuration baseline
```

### **Test Case 2b: SS316 Steel Tank (LPCB Standard)**
```
Input:
- Material: SS316
- Dimensions: 5m × 5m × 4m (4 panels height)
- Partitions: 1
- Build Standard: LPCB

Expected:
- Panels: 175 (metric 1m×1m)
- Panel Thickness: BSI rules + vortex drain
  - Base: 6mm (4+ panels rule)
  - 1st tier: 6mm (4+ panels rule)
  - 2nd, 3rd, 4th tiers: 5mm
  - Partition: 6mm bottom, 5mm above
  - Roof: 1.5mm
- Bolts: 6,720 sets (175 × 4 × 16 ÷ 2 × 1.2)
- Support: Internal or External option
- Accessories:
  - VORTEX DRAIN: REQUIRED (LPCB standard)
  - Ladder: User selectable
  - WLI: Preselected SS316
- Pricing: Look up in sku_prices.csv
  - Panel SKUs: 1B6-m-S2, 1A6-m-S2 (tier 1), 1A5-m-S2 (tiers 2-4)
  - Vortex drain: Look up vortex drain SKU in CSV
- Cost Comparison: Premium + fire protection
```

### **Test Case 3: HDG Steel Imperial (BSI Standard)**
```
Input:
- Material: HDG
- Dimensions: 5ft × 5ft × 4ft (1 panel height)
- Partitions: 1
- Build Standard: BSI

Expected:
- Panels: 25 (imperial 4ft×4ft)
- Panel Thickness: ALL 5mm (BSI rule: 1 panel = all 5mm)
  - Base: 5mm
  - Wall tier 1: 5mm
  - Partition: 5mm
  - Roof: 1.5mm
- Bolts: 960 sets (25 × 4 × 16 ÷ 2 × 1.2)
- Support: Internal or External option available
  - If Internal: HDG tie rods, HDG brackets, HDG roof brackets
  - If External: HDG I-beams, HDG brackets
- Ladder (User Selectable):
  - Internal options: HDG (default) / SS304 / SS316 / FRP
  - External options: HDG (default) / SS304 / SS316
- WLI (Preselected, User Can Override):
  - Preselected: HDG (match tank from BSI standard)
  - Options: HDG / SS304 / SS316
- Pricing: Look up in sku_prices.csv (market_final_price)
  - SKU format: 1B5-i-HDG, 1A5-i-HDG, etc. (5mm, Imperial)
- Cost Comparison: Budget configuration baseline
```

### **Test Case 3b: SS304 Steel Metric (SANS Standard)**
```
Input:
- Material: SS304
- Dimensions: 5m × 5m × 4m (4 panels height)
- Partitions: 1
- Build Standard: SANS 10329:2020

Expected:
- Panels: 175 (metric 1m×1m)
- Panel Thickness: GRADUATED (SANS variable thickness)
  - Base: 5.0mm (SANS table)
  - 1st tier: 5.0mm (high pressure)
  - 2nd tier: 4.5mm (medium pressure)
  - 3rd tier: 3.0mm (low pressure)
  - 4th tier: 3.0mm (low pressure)
  - Partition: Follows same rules by tier
  - Roof: 1.5mm
- Bolts: 6,720 sets (175 × 4 × 16 ÷ 2 × 1.2)
- Support: Internal or External option
- Accessories:
  - NO vortex drain (not LPCB)
  - Ladder: User selectable
  - WLI: Preselected SS304
- Pricing: Look up in sku_prices.csv
  - Panel SKUs: 1B5-m-S1, 1A5-m-S1, 1A45-m-S1, 1A3-m-S1
  - More economical than BSI/LPCB (uses thinner panels where safe)
- Cost Comparison: Mid-range (between BSI premium and budget)
```

---

## 📝 **SUMMARY - KEY TAKEAWAYS**

### **FRP Tanks:**
1. ✅ Metric (1m) panels ONLY - NO Imperial
2. ✅ Internal AND External support available (different materials: SS304 internal, HDG external, ABS roof)
3. ✅ 13 bolts per side (fixed)
4. ✅ Ladder materials USER CUSTOMIZABLE - Internal: FRP/SS304/SS316, External: HDG/SS316
5. ✅ WLI material - Preselected by build standard (MS1390→HDG, SS245→SS304), user can override
6. ✅ SS304 internal brackets, ABS roof brackets, HDG external brackets
7. ✅ Build standards: MS1390 (Malaysia), SS245 (Singapore)
8. ✅ Pricing from sku_prices.csv (market_final_price column)
9. ✅ Cost comparisons: ~40-60% of SS316 equivalent cost

### **Steel Tanks:**
1. ✅ Metric OR Imperial panels
2. ✅ Internal AND External support available (match tank material internally, HDG for external)
3. ✅ 13/16/20 bolts per side (material/panel dependent)
4. ✅ Ladder materials USER CUSTOMIZABLE - Internal: SS316/SS304/HDG/FRP, External: SS316/SS304/HDG
5. ✅ WLI material - Preselected to match tank, user can override to any compatible material
6. ✅ Metal brackets matching tank material (internal/roof), HDG for external
7. ✅ Build standards: BSI (UK), LPCB (Fire), SANS (South Africa)
8. ✅ Pricing from sku_prices.csv (market_final_price column)
9. ✅ Cost comparisons: SS316=100%, SS304=70-80%, HDG=40-50% relative costs

### **Critical Implementation Requirements:**
- Code MUST branch between FRP and Steel for material selection
- Both have internal AND external support options
- Support MATERIALS differ (not availability)
- Panel type validation required (no Imperial FRP)
- Ladder materials USER SELECTABLE with defaults provided
- WLI materials PRESELECTED by build standard, user can override
- Accessory materials completely different between FRP and Steel
- Bolt calculations different
- Build standards non-overlapping
- ALL pricing from sku_prices.csv ONLY
- Cost comparison UI helps users optimize configurations

---

**This document is COMPLETE and ready for implementation.**

**Next Steps:**
1. Review this document
2. Create `lib/materialRules.js` based on this spec
3. Create `lib/buildStandards.js` with BSI/LPCB/SANS logic
4. Update `lib/bomCalculator.js` to use material and build standard rules
5. Test with validation quotes
6. Move to Phase 0 Step 3: Additional accessories documentation (breather vents, pipes, fittings)

**Last Updated:** 2025-11-07  
**Status:** ✅ COMPLETE - ALL BUILD STANDARDS DOCUMENTED  

**All Corrections and Additions:**
1. ✅ Build standards: FRP=MS1390+SS245, Steel=BSI+LPCB+SANS
2. ✅ **BSI thickness rules FULLY DOCUMENTED** (1-3 panels=5mm, 4+ panels=6mm bottom+5mm above)
3. ✅ **LPCB thickness rules FULLY DOCUMENTED** (same as BSI + vortex draining requirement)
4. ✅ **SANS thickness rules FULLY DOCUMENTED** (graduated variable thickness from bomCalculator.js)
5. ✅ Support structures: BOTH FRP and Steel have internal AND external options (material selection differs)
6. ✅ Pricing: ALL pricing from sku_prices.csv market_final_price column
7. ✅ Ladders: USER CUSTOMIZABLE material selection, defaults provided
8. ✅ WLI: PRESELECTED by build standard, user can override
9. ✅ Cost Comparisons: Comprehensive explanation with decision trees
10. ✅ Implementation code: Panel thickness functions for BSI/LPCB/SANS
11. ✅ Test cases: Updated with BSI/LPCB/SANS examples showing correct thickness
12. ✅ Build standard comparison tables showing all three standards

**Key Insights from Documentation:**
- BSI/LPCB = Simplified (5mm/6mm only) - easier quoting, higher material cost
- SANS = Graduated (2.5-6.0mm variable) - complex quoting, 10-15% material savings
- LPCB = BSI + Vortex drain - fire protection mandated
- All three standards already implemented in your bomCalculator.js code!

**Remaining to Document:**
- Additional accessories (breather vents, overflow pipes, drain valves, pipe fittings, gaskets, sensors)
- Partition calculation nuances
- Complete SKU generation rules

