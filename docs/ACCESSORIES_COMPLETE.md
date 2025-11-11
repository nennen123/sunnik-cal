# TANK ACCESSORIES - Complete Documentation

**Created:** 2025-11-07  
**Purpose:** Complete documentation of ALL tank accessories beyond panels  
**Status:** Phase 0 Step 2 - ACCESSORIES  

---

## 📋 **EXECUTIVE SUMMARY**

This document covers all accessories required for complete tank installation:
- Breather vents (air circulation)
- Overflow pipes (excess water)
- Inlet/Outlet connections (water flow)
- Drain valves (tank emptying)
- Manholes (access and maintenance)
- Gaskets/Seals (waterproofing)
- Level indicators (already covered in main doc, reference here)
- Pipe fittings (connections)
- Support accessories (already covered in main doc, reference here)
- Optional accessories (alarms, sensors, filters)

---

## 🌬️ **BREATHER VENTS (AIR VENTS)**

### **Purpose**
- Allow air to enter/exit tank as water level changes
- Prevent vacuum formation during draining
- Prevent pressure buildup during filling
- Include insect-proof mesh to prevent contamination

### **FRP Tanks - Breather Vent Specifications**

**Material Options:**
- **ABS plastic** (standard, recommended for FRP)
- **PVC** (alternative, cost-effective)
- SS304 (premium upgrade option)

**Default Selection:**
- Primary: ABS plastic breather vent
- Reason: Lightweight, corrosion-proof, cost-effective

**Size Options:**
- Standard: 50mm (2") diameter
- Large tanks (>50m³): 80mm (3") diameter
- Multiple vents for very large tanks

**Quantity Calculation:**
```javascript
function getBreatherVentQuantity(tankCapacity) {
  // Rule: 1 vent per 50m³ capacity
  if (tankCapacity <= 50) {
    return 2; // Minimum 2 for redundancy
  } else {
    return Math.ceil(tankCapacity / 50) + 1; // +1 for safety
  }
}
```

**Pricing:**
- ABS 50mm vent: Look up in CSV (typical: RM 80-150)
- PVC 50mm vent: Look up in CSV (typical: RM 60-100)
- SS304 50mm vent: Look up in CSV (typical: RM 200-300)

**Installation Location:**
- Roof panels (typically R(AV) designated panels)
- Opposite corners for optimal air circulation
- Away from overflow to prevent water entry

### **Steel Tanks - Breather Vent Specifications**

**Material Options:**
- **SS304** (standard, matches stainless tanks)
- **SS316** (marine grade, for SS316 tanks)
- **HDG** (galvanized, for HDG tanks)

**Default Selection:**
- Match tank material for consistency
- SS316 tank → SS316 vent (default)
- SS304 tank → SS304 vent (default)
- HDG tank → HDG vent (default)

**Size Options:**
- Same as FRP: 50mm standard, 80mm for large tanks

**Quantity Calculation:**
- Same as FRP: 1 per 50m³ + redundancy

**Pricing:**
- SS316 vent: Look up in CSV
- SS304 vent: Look up in CSV
- HDG vent: Look up in CSV

**User Customization:**
- User can select different material (cost optimization)
- Example: HDG vent on SS316 tank (acceptable)

---

## 💧 **OVERFLOW PIPES**

### **Purpose**
- Prevent tank overfilling
- Safely discharge excess water
- Typically sized 1-2 pipe sizes larger than inlet

### **FRP Tanks - Overflow Specifications**

**Material Options:**
- **PVC** (standard, cost-effective)
- **HDPE** (high-density polyethylene, durable)
- **SS304** (premium, for potable water)

**Default Selection:**
- Potable water: SS304 or HDPE (food-grade)
- Non-potable: PVC (cost-effective)

**Size Calculation:**
```javascript
function getOverflowSize(inletSize) {
  // Overflow should be 1-2 sizes larger than inlet
  const sizeMap = {
    '25mm': '40mm',  // 1" inlet → 1.5" overflow
    '40mm': '50mm',  // 1.5" inlet → 2" overflow
    '50mm': '80mm',  // 2" inlet → 3" overflow
    '80mm': '100mm', // 3" inlet → 4" overflow
    '100mm': '150mm' // 4" inlet → 6" overflow
  };
  return sizeMap[inletSize] || '80mm'; // Default 3"
}
```

**Common Sizes:**
- Small tanks (<10m³): 50mm (2")
- Medium tanks (10-50m³): 80mm (3")
- Large tanks (>50m³): 100mm (4") or 150mm (6")

**Pricing:**
- Look up pipe fitting SKU in CSV
- Includes: Pipe connection, elbow, outlet extension

**Installation:**
- Location: Top tier, near maximum water level
- Height: Just below freeboard level
- Direction: Discharge away from tank base

### **Steel Tanks - Overflow Specifications**

**Material Options:**
- **SS304** (standard for SS304 tanks)
- **SS316** (for SS316 tanks)
- **HDG** (for HDG tanks)
- **PVC/HDPE** (acceptable on any tank, cost savings)

**Default Selection:**
- Match tank material internally
- Discharge pipe can be PVC/HDPE externally

**Size Calculation:**
- Same as FRP tanks

**User Customization:**
- User can select different material for cost optimization
- Example: PVC overflow on SS316 tank (acceptable, common)

---

## 🚰 **INLET/OUTLET CONNECTIONS**

### **Purpose**
- **Inlet:** Water entry point (top or side)
- **Outlet:** Water exit point (bottom or side)
- Sized based on flow rate requirements

### **FRP Tanks - Inlet/Outlet Specifications**

**Material Options:**
- **PVC flanges** (standard)
- **HDPE flanges** (durable)
- **SS304 flanges** (premium, food-grade)

**Default Selection:**
- Potable water: SS304 or HDPE flanges
- Non-potable: PVC flanges

**Common Sizes:**
- **Inlet:** 25mm (1"), 40mm (1.5"), 50mm (2"), 80mm (3")
- **Outlet:** 50mm (2"), 80mm (3"), 100mm (4"), 150mm (6")

**Sizing Guide:**
```javascript
function getConnectionSizes(tankCapacity, usage) {
  if (usage === 'RESIDENTIAL') {
    return {
      inlet: '25mm',   // 1" for residential
      outlet: '50mm'   // 2" for residential
    };
  } else if (usage === 'COMMERCIAL') {
    if (tankCapacity < 20) {
      return { inlet: '40mm', outlet: '80mm' }; // 1.5" / 3"
    } else if (tankCapacity < 50) {
      return { inlet: '50mm', outlet: '100mm' }; // 2" / 4"
    } else {
      return { inlet: '80mm', outlet: '150mm' }; // 3" / 6"
    }
  } else if (usage === 'FIRE_PROTECTION') {
    // Fire requires large outlets
    return {
      inlet: '80mm',   // 3" minimum
      outlet: '150mm'  // 6" minimum (fire hydrant)
    };
  }
}
```

**Quantity:**
- Inlet: Typically 1-2 connections
- Outlet: Typically 1-2 connections
- Drain: 1 connection (separate from outlet)

**Pricing:**
- Look up flange SKU in CSV
- Includes: Flange, gasket, bolts

### **Steel Tanks - Inlet/Outlet Specifications**

**Material Options:**
- **SS304 flanges** (standard for SS304 tanks)
- **SS316 flanges** (for SS316 tanks)
- **HDG flanges** (for HDG tanks)
- **PVC/HDPE** (cost savings option)

**Default Selection:**
- Match tank material for internal flange
- External piping can be PVC/HDPE

**Sizing:**
- Same as FRP tanks

**User Customization:**
- Can use PVC/HDPE flanges for cost savings (acceptable)

---

## 🚿 **DRAIN VALVES**

### **Purpose**
- Complete tank emptying for maintenance
- Cleaning and inspection access
- Emergency drainage

### **FRP Tanks - Drain Valve Specifications**

**Material Options:**
- **PVC ball valve** (standard)
- **HDPE ball valve** (durable)
- **SS304 ball valve** (premium)

**Default Selection:**
- Standard: PVC ball valve
- Potable water: HDPE or SS304
- Chemical storage: Check compatibility

**Size:**
- Standard: 50mm (2") minimum
- Large tanks: 80mm (3") or 100mm (4")
- Rule: Should allow complete draining in 1-2 hours

**Location:**
- Base panel, lowest point
- Corner location preferred
- External access for operation

**Pricing:**
- Look up valve SKU in CSV
- Includes: Valve, flange, gasket, bolts

**Special Types:**

**Vortex Drain (LPCB requirement):**
- Creates vortex flow for complete drainage
- Required for fire protection tanks (LPCB standard)
- More expensive than standard drain
- Look up "VORTEX_DRAIN" SKU in CSV

### **Steel Tanks - Drain Valve Specifications**

**Material Options:**
- **SS304 ball valve** (for SS304 tanks)
- **SS316 ball valve** (for SS316 tanks)
- **HDG ball valve** (for HDG tanks)
- **PVC/HDPE** (cost savings option)

**Default Selection:**
- Match tank material for consistency
- User can downgrade to PVC/HDPE for cost savings

**Vortex Drain:**
- MANDATORY for LPCB build standard
- Optional upgrade for other standards
- Material: Match tank or stainless steel

---

## 🚪 **MANHOLES**

### **Purpose**
- Access for inspection and maintenance
- Cleaning interior
- Installation of internal accessories

### **Types**

**1. Normal Manhole (Hinged Lid)**
- Hinged cover
- Gasket seal
- Standard size: 600mm × 600mm
- Large size: 800mm × 800mm

**2. Sliding Manhole**
- Sliding cover on roof
- Better for frequent access
- Same sizes as normal

### **FRP Tanks - Manhole Specifications**

**Material:**
- **Manhole frame:** FRP or SS304
- **Manhole cover:** FRP with SS304 hardware
- **Gasket:** EPDM rubber (food-grade)

**Default Selection:**
- Frame: FRP (matches tank)
- Cover: FRP with SS304 bolts
- Gasket: EPDM rubber

**Size Selection:**
```javascript
function getManholeSize(tankDimensions) {
  const minDimension = Math.min(tankDimensions.length, tankDimensions.width);
  
  if (minDimension < 3) {
    return '600mm'; // Small tank, standard manhole
  } else {
    return '800mm'; // Large tank, large manhole
  }
}
```

**Quantity:**
- Standard: 1 manhole
- Large tanks (>100m³): 2 manholes for safety
- Partition tanks: 1 per compartment

**Pricing:**
- Look up manhole SKU in CSV
- Includes: Frame, cover, gasket, bolts, hinges

### **Steel Tanks - Manhole Specifications**

**Material:**
- **Frame & Cover:** Match tank material
- SS316 tank → SS316 manhole
- SS304 tank → SS304 manhole
- HDG tank → HDG manhole

**Gasket:**
- EPDM rubber (standard)
- Silicone (premium, food-grade)

**Size & Quantity:**
- Same as FRP tanks

**User Customization:**
- Can select different material (cost optimization)
- Example: SS304 manhole on SS316 tank (acceptable)

---

## 🔒 **GASKETS & SEALS**

### **Purpose**
- Waterproof sealing between panels
- Prevent leakage
- Maintain water quality

### **Types**

**1. Panel-to-Panel Gaskets (Between Panels)**
- Location: Between all panel edges
- Material: EPDM rubber or PVC foam tape
- Width: 30mm or 45mm depending on panel type

**2. Flange Gaskets (Connections)**
- Location: Inlet, outlet, drain connections
- Material: EPDM rubber (food-grade)
- Size: Match flange diameter

**3. Manhole Gaskets**
- Location: Manhole cover seal
- Material: EPDM rubber
- Profile: D-shaped or O-ring

### **FRP Tanks - Gasket Specifications**

**Panel Gaskets:**
- **Material:** PVC foam tape (standard for FRP)
- **Width:** 
  - 45mm for wall panels
  - 30mm for roof panels
- **Quantity Calculation:**
```javascript
function getGasketLength(panelCount, panelSize) {
  const perimeterPerPanel = 4 * panelSize; // meters
  const totalPerimeter = panelCount * perimeterPerPanel;
  const sharedEdges = totalPerimeter / 2; // Edges are shared
  return sharedEdges * 1.1; // +10% waste allowance
}
```

**Flange Gaskets:**
- Material: EPDM rubber
- Quantity: 1 per connection
- Size: Match flange (DN50, DN80, DN100, etc.)

**Pricing:**
- PVC foam tape: Per meter (look up in CSV)
- EPDM gaskets: Per piece (look up in CSV)

### **Steel Tanks - Gasket Specifications**

**Panel Gaskets:**
- **Material:** EPDM rubber strips or PVC foam tape
- **Width:** Same as FRP (30mm/45mm)

**Calculation:**
- Same as FRP tanks

**Material Selection:**
- EPDM: Premium, longer lasting
- PVC foam: Standard, cost-effective

---

## 📊 **LEVEL INDICATORS (REFERENCE)**

**Already documented in FRP_vs_STEEL_COMPLETE.md**

Quick reference:
- **WLI (Water Level Indicator):** Visual gauge showing water level
- **FRP default:** HDG (preselected by MS1390 standard)
- **Steel default:** Match tank material (preselected by build standard)
- **User customizable:** Can select any compatible material

See main document for complete specifications.

---

## 🔩 **PIPE FITTINGS & CONNECTIONS**

### **Purpose**
- Connect tank to external piping
- Reduce/adapt between different pipe sizes
- Change flow direction (elbows, tees)

### **Common Fittings Required**

**1. Flanges (Already covered above)**
- Inlet flange
- Outlet flange
- Overflow flange
- Drain flange

**2. Reducers/Adapters**
- Purpose: Connect different pipe sizes
- Example: Tank has 80mm outlet, external pipe is 50mm
- Material: Match connection material

**3. Elbows**
- 90° elbows (most common)
- 45° elbows (gradual direction change)
- Material: PVC, HDPE, or stainless

**4. Tees (T-Junctions)**
- Split single pipe into two
- Combine two pipes into one
- Material: Match pipe material

**5. Ball Valves (Isolation)**
- Control flow on/off
- Maintenance isolation
- Material: Match pipe material

### **Sizing & Specification**

```javascript
function getPipeFittings(connections) {
  const fittings = [];
  
  connections.forEach(conn => {
    // Each connection needs minimum:
    fittings.push({
      type: 'FLANGE',
      size: conn.size,
      material: conn.material,
      quantity: 1
    });
    
    fittings.push({
      type: 'BALL_VALVE',
      size: conn.size,
      material: conn.material,
      quantity: 1
    });
    
    // Overflow needs elbow to direct water away
    if (conn.type === 'OVERFLOW') {
      fittings.push({
        type: 'ELBOW_90',
        size: conn.size,
        material: conn.material,
        quantity: 1
      });
    }
  });
  
  return fittings;
}
```

### **Pricing**
- Look up each fitting SKU in CSV
- Common format: `FITTING_[TYPE]_[SIZE]_[MATERIAL]`
- Example: `FITTING_ELBOW90_50MM_PVC`

---

## 🔔 **OPTIONAL ACCESSORIES**

### **1. Level Alarms**

**Purpose:**
- Alert when tank is full (high-level alarm)
- Alert when tank is low (low-level alarm)
- Prevent overflow or pump dry-running

**Types:**
- Float switch (mechanical)
- Ultrasonic sensor (electronic)
- Pressure sensor (electronic)

**Material:**
- SS304/SS316 for sensors
- PVC for float switches

**Pricing:**
- Float switch: RM 100-300 (look up in CSV)
- Ultrasonic: RM 500-1,500 (look up in CSV)

### **2. Temperature Sensors**

**Purpose:**
- Monitor water temperature
- Required for some applications (hot water storage)

**Types:**
- Thermistor probe
- RTD (Resistance Temperature Detector)

**Material:**
- SS304/SS316 probe housing

**Pricing:**
- Look up in CSV (typical: RM 200-500)

### **3. Overflow Strainers**

**Purpose:**
- Filter debris from overflow discharge
- Prevent pipe clogging

**Material:**
- SS304 mesh strainer

**Pricing:**
- Look up in CSV (typical: RM 50-150)

### **4. Insect Screens**

**Purpose:**
- Cover breather vents
- Cover overflow discharge
- Prevent insect entry

**Material:**
- SS304 mesh (fine mesh, <1mm)
- Included with breather vents typically

---

## 🧮 **ACCESSORY CALCULATION SUMMARY**

### **Minimum Required Accessories (Every Tank)**

```javascript
function getMinimumAccessories(tankSpec) {
  return {
    // Air circulation
    breatherVents: calculateBreatherVents(tankSpec.capacity),
    
    // Water flow
    inletConnections: 1, // minimum
    outletConnections: 1, // minimum
    overflowPipe: 1,
    drainValve: 1,
    
    // Access
    manholes: calculateManholes(tankSpec.capacity, tankSpec.partitions),
    
    // Sealing
    panelGaskets: calculateGasketLength(tankSpec.totalPanels, tankSpec.panelSize),
    flangeGaskets: 4, // inlet + outlet + overflow + drain
    manholeGaskets: tankSpec.manholes,
    
    // Level indication
    wli: 1, // standard
    
    // Support (see main document)
    // Ladder (see main document)
  };
}
```

### **Build Standard Specific**

```javascript
function getBuildStandardAccessories(buildStandard) {
  if (buildStandard === 'LPCB') {
    return {
      vortexDrain: 1, // MANDATORY for LPCB
      standardDrain: 0  // Replaced by vortex
    };
  } else {
    return {
      vortexDrain: 0,   // Optional
      standardDrain: 1  // Standard
    };
  }
}
```

---

## 💰 **PRICING STRUCTURE - ACCESSORIES**

### **All Pricing from CSV**

**Critical Rule:** ALL accessory prices must be looked up in `sku_prices.csv` using `market_final_price` column

**SKU Format Examples:**
- Breather vent: `VENT_ABS_50MM` or `VENT_SS304_50MM`
- Overflow fitting: `OVERFLOW_PVC_80MM`
- Drain valve: `VALVE_BALL_SS304_50MM`
- Manhole: `MANHOLE_FRP_600MM` or `MANHOLE_SS316_800MM`
- Gasket: `GASKET_PVC_FOAM_45MM` (per meter)
- Flange: `FLANGE_SS304_DN80`

**Pricing Lookup:**
```javascript
function getAccessoryPrice(accessoryType, material, size) {
  const sku = generateAccessorySKU(accessoryType, material, size);
  return getPriceFromCSV(sku); // market_final_price column
}
```

**If SKU Not Found:**
- Use placeholder price
- Flag for manual review
- Log missing SKU for CSV update

---

## 📦 **ACCESSORY PACKAGES (SUGGESTED)**

### **Basic Package (Budget)**
- Breather vents: PVC/ABS (minimum quantity)
- Overflow: PVC pipe
- Connections: PVC flanges
- Drain: PVC ball valve
- Manhole: 600mm standard
- Gaskets: PVC foam tape
- WLI: HDG (FRP) or match tank (steel)

### **Standard Package (Recommended)**
- Breather vents: Match material (minimum quantity)
- Overflow: HDPE or stainless
- Connections: Match tank material
- Drain: Stainless ball valve
- Manhole: 600mm or 800mm as needed
- Gaskets: EPDM rubber
- WLI: Match tank material

### **Premium Package**
- Breather vents: SS304/SS316 (extra quantity)
- Overflow: SS316 with strainer
- Connections: SS316 flanges
- Drain: SS316 ball valve or vortex drain
- Manhole: 800mm with safety features
- Gaskets: Silicone food-grade
- WLI: SS316 with level alarm
- Optional: Temperature sensors, backup alarms

---

## 🎯 **IMPLEMENTATION CHECKLIST**

### **Calculator Must:**

1. ✅ Calculate breather vent quantity based on capacity
2. ✅ Size overflow based on inlet size
3. ✅ Size inlet/outlet based on usage and capacity
4. ✅ Select appropriate drain valve (vortex for LPCB)
5. ✅ Calculate manhole quantity (1 minimum, +1 per partition)
6. ✅ Calculate gasket lengths for all panels
7. ✅ Count flange gaskets (1 per connection)
8. ✅ Allow user to customize all accessory materials
9. ✅ Provide default recommendations by tank material
10. ✅ Look up all prices from CSV
11. ✅ Flag when using placeholder prices
12. ✅ Show accessory cost subtotal separately from panels

### **User Interface Must Show:**

```
ACCESSORIES SELECTION:

Breather Vents: [2] qty
Material: [ABS ▼] (FRP/SS304/HDG options)

Overflow Pipe: [80mm ▼]
Material: [PVC ▼] (PVC/HDPE/SS304 options)

Inlet Connection: [50mm ▼]
Material: [PVC ▼]

Outlet Connection: [100mm ▼]
Material: [PVC ▼]

Drain Valve: [50mm ▼]
Type: [Standard Ball Valve ▼] (Standard/Vortex options)
Material: [PVC ▼]

Manholes: [1] qty, Size: [600mm ▼]
Material: [Match Tank ▼]

Water Level Indicator:
Material: [HDG ▼] (Preselected, can customize)

Optional Accessories:
☐ Level Alarms
☐ Temperature Sensors
☐ Overflow Strainers

[ Calculate Accessories ] → Shows pricing breakdown
```

---

## ✅ **VALIDATION EXAMPLES**

### **Example 1: Small Residential FRP Tank**
```
Tank: 5m × 5m × 2m (50m³)
Material: FRP

Accessories:
- Breather vents: 2× ABS 50mm = RM 160
- Overflow: 1× PVC 50mm = RM 80
- Inlet: 1× PVC 25mm = RM 60
- Outlet: 1× PVC 50mm = RM 80
- Drain: 1× PVC ball valve 50mm = RM 120
- Manhole: 1× FRP 600mm = RM 800
- Gaskets: 120m PVC foam = RM 360
- WLI: 1× HDG = RM 250

Total Accessories: RM 1,910
```

### **Example 2: Large Commercial Steel Tank**
```
Tank: 10m × 10m × 4m (400m³)
Material: SS316
Build Standard: LPCB

Accessories:
- Breather vents: 10× SS316 50mm = RM 3,000
- Overflow: 1× SS316 150mm = RM 600
- Inlet: 2× SS316 80mm = RM 1,000
- Outlet: 2× SS316 150mm = RM 1,200
- Vortex Drain: 1× SS316 100mm = RM 2,500 (LPCB required)
- Manholes: 2× SS316 800mm = RM 3,600
- Gaskets: 500m EPDM = RM 2,500
- WLI: 1× SS316 = RM 600
- Level Alarm: 1× SS316 = RM 800

Total Accessories: RM 15,800
```

---

**Last Updated:** 2025-11-07  
**Status:** ✅ COMPLETE - All Standard Accessories Documented

**Next Phase:** Phase 0 Step 3 - SKU Generation Rules & Partition Logic (if needed)
