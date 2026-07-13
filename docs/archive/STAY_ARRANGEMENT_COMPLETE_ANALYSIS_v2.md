# Complete Stay Arrangement Analysis v2
## Based on 8 Real Tank Drawings (December 4, 2025)

---

## Table of Contents
1. [Drawing Summary](#1-drawing-summary)
2. [Steel Type 2 Analysis](#2-steel-type-2-analysis)
3. [FRP Tie Rod Analysis](#3-frp-tie-rod-analysis)
4. [Partition Stay/Tie Rod Analysis](#4-partition-staytie-rod-analysis)
5. [Key Formulas Derived](#5-key-formulas-derived)
6. [SKU Reference Tables](#6-sku-reference-tables)

---

## 1. Drawing Summary

| # | Tank Type | Size | Material | Partitions | Key Learning |
|---|-----------|------|----------|------------|--------------|
| 1 | Type 2 Metric | 20MÃ—8MÃ—4M | HDG | 1 | Full stay system with partition |
| 2 | Type 2 Metric | 7MÃ—3MÃ—3M | HDG+SS304 | 1 | Contact water material mixing |
| 3 | Type 2 Imperial | 18'Ã—16'Ã—12' | HDG+HDPE | 0 | HDPE lining with tie rods |
| 4 | FRP | 20MÃ—5MÃ—4M | FRP | 0 | Large FRP tie rod system |
| 5 | FRP | 10MÃ—3MÃ—3M | FRP | 0 | Medium FRP tie rod |
| 6 | FRP | 10MÃ—4MÃ—3M | FRP | 0 | Medium FRP tie rod |
| 7 | FRP | 12MÃ—4MÃ—2.5M | FRP | 1 | FRP with partition |
| 8 | FRP | 9MÃ—4.5MÃ—3.5M | FRP | 1 | Complex FRP with half panels |

---

## 2. Steel Type 2 Analysis

### 2.1 Drawing 1: 20M Ã— 8M Ã— 4M + 1SP (HDG)

**Tank Configuration:**
- Length: 20 panels
- Width: 8 panels  
- Height: 4 panels (4M)
- Partition: 1 (across width)

**Panel Summary:**
| Category | Thickness | Code | Qty |
|----------|-----------|------|-----|
| 6mm Base | B6 | 2B6-m-18-HDG | 54 |
| 6mm Base Corner | BCL6, BCR6 | 2BCL6-m-18-HDG, 2BCR6-m-18-HDG | 1 each |
| 6mm Wall TBA1H | TBA1H 6 | 2TBA6-m-18-HDG-1H | 6 |
| 6mm Wall TBA2H | TBA2H 6 | 2TBA6-m-18-HDG-2H | 50 |
| 6mm Wall TBA3H | TBA3H 6 | 2TBA6-m-18-HDG-3H | 8 |
| 6mm Wall TBA4H | TBA4H 6 | 2TBA6-m-18-HDG-4H | 88 |
| 6mm TBAB1H 6L | Boundary | 2TBAB6-m-18-HDG-1H-L | 1 |
| 6mm TBAB1H 6R | Boundary | 2TBAB6-m-18-HDG-1H-R | 1 |
| 6mm TBAB2H 6 | Boundary | 2TBAB6-m-18-HDG-2H | 6 |
| 5mm Wall PA6 | Partition | 2PA6-m-18-HDG | 8 |
| 5mm Wall A5 | Standard | 2A5-m-18-HDG | 186 |
| 5mm Wall AB5 | Boundary | 2AB5-m-18-HDG | 6 |
| 1.5mm Roof | R | 1R15-m-HDG | 154 |
| 1.5mm Roof AV | R(AV) | 1R(AV)15-m-HDG | 4 |
| 1.5mm Manhole | MH | 1MH15-m-HDG | 2 |

**Stay Summary:**
| SKU | Description | Qty |
|-----|-------------|-----|
| 2HS1m-HDG | Horizontal Stay 1m | 24 |
| 2HSP1m-HDG | Partition Horizontal 1m | 6 |
| 2HSP1mW-HDG | Partition Horizontal Welded 1m | 2 |
| 2HS2m-HDG | Horizontal Stay 2m | 18 |
| 2HSP2m-HDG | Partition Horizontal 2m | 6 |
| 2HSP2mW-HDG | Partition Horizontal Welded 2m | 2 |
| 2HS2mW-HDG | Horizontal Stay Welded 2m | 6 |
| 2HSP3m-HDG | Partition Horizontal 3m | 6 |
| 2HS3m-HDG | Horizontal Stay 3m | 18 |
| 2VSP1mW-HDG | Partition Vertical Welded 1m | 3 |
| 2VS1mW-HDG | Vertical Stay Welded 1m | 86 |
| 2VS2m-HDG | Vertical Stay 2m | 60 |
| 2VSP2m-HDG | Partition Vertical 2m | 1 |
| 2VS3m-HDG | Vertical Stay 3m | 29 |
| 2VSP3m-HDG | Partition Vertical 3m | 3 |
| 2VS4m-3h-HDG | Vertical Stay 4m 3-hole | 3 |

**Cleat Summary:**
| SKU | Description | Qty |
|-----|-------------|-----|
| CleatAL-18-HDG | Cleat AL Ã˜18 hole | 15 |
| CleatAY-18-HDG | Cleat AY Ã˜18 hole | 3 |
| CleatAN-18-HDG | Cleat AN Ã˜18 hole | 3 |
| CleatA-18-HDG | Cleat A Ã˜18 hole | 36 |
| CleatE-HDG | Cleat E 5mm | 182 |
| CleatEW-HDG | Cleat E Welded 6mm | 113 |
| CC-18-HDG | Corner Cleat Ã˜18 | 18 |

**Level Views Analysis:**

**1M LEVEL:**
- Shows dense grid pattern of vertical stays
- Note at bottom: "Internal cleats and stays, Use H.T M16 BNW"
- Vertical stays at every panel junction

**2M LEVEL:**
- Similar pattern but with "Normal cleats and stays, Use M16 x 40mm BNW"
- Slightly less dense than 1M level

**3M LEVEL:**
- "Normal cleats and stays, Use M16 x 40mm BNW"
- Standard grid pattern

**4M LEVEL:**
- Sparse pattern
- Only corner stays visible

---

### 2.2 Drawing 2: 7M Ã— 3M Ã— 3M + 1SP (HDG + SS304 Contact Water)

**Tank Configuration:**
- Length: 7 panels
- Width: 3 panels (NARROW - partition stays go to opposite wall!)
- Height: 3 panels (3M)
- Partition: 1
- Special: Contact water requires SS304 at water contact zones

**Panel Summary:**
| Thickness | Code | Qty |
|-----------|------|-----|
| 4.5mm Base | B4.5 | 18 |
| 4.5mm Base Corner | BCL4.5, BCR4.5 | 1 each |
| 4.5mm Wall TBA1H | TBA1H 4.5 | 6 |
| 4.5mm Wall TBA2H | TBA2H 4.5 | 9 |
| 4.5mm Wall TBA4H | TBA4H 4.5 | 3 |
| 4.5mm TBAB1H L/R | TBAB1H 4.5 L/R | 1 each |
| 4.5mm TBAB2H | TBAB2H 4.5 | 1 |
| 4.5mm Partition | PA4.5 | 3 |
| 3mm Wall A3 | A3 | 42 |
| 3mm Wall AB3 | AB3 | 4 |

**Stay Summary (Mixed Materials!):**
| SKU | Description | Qty | Material |
|-----|-------------|-----|----------|
| 2HS1m-S04-3050 | Horizontal 1m SS304 | 6 | SS304 |
| 2HS1m-S04-3040 | Horizontal 1m SS304 (Ã˜14) | 6 | SS304 |
| 2HS1m-HDG | Horizontal 1m HDG | 6 | HDG |
| 2HSP1m-HDG | Partition Horizontal 1m | 2 | HDG |
| 2HSP1m-S04-3050 | Partition Horizontal SS304 | 2 | SS304 |
| 2HSP1m-S04-3040 | Partition Horizontal SS304 (Ã˜14) | 2 | SS304 |
| 2VS1m-S04-3050 | Vertical 1m SS304 | 18 | SS304 |
| 2VSP1m-S04-3050 | Partition Vertical SS304 | 2 | SS304 |
| 2HSO2m-S04-3040 | Horizontal OP 2m SS304 | 7 | SS304 |
| 2HSO3m-S04-3040 | Horizontal OP 3m SS304 | 5 | SS304 |

**KEY INSIGHT - Narrow Tank Partition Stays:**
- Width = 3 panels (narrow)
- Partition stays connect to OPPOSITE WALL (not base)
- Uses "HSO" (Horizontal Stay Opening) pattern
- 2HSO2m and 2HSO3m are horizontal OP stays spanning across

**Level Views:**

**1M LEVEL:**
- "All stays - Ã˜18 x 50âˆ  x 3thk"
- "All CBW - Ã˜18 x 3.0 thk"
- "Use 5/8" x 1 1/2" B&N + 2sq washer"

**2M LEVEL:**
- "All stays - Ã˜14 x 40âˆ  x 3thk"
- "All CBW - (Ã˜14 & Ã˜18 x 2.5 thk)"
- "Use (5/8" x 1 1/2" B&N)&(M12 x 25mm) + 2sq washer"

**3M LEVEL:**
- "Normal cleats and stays"
- "Use M16 x 40mm BNW"

---

### 2.3 Drawing 3: 18' Ã— 16' Ã— 12' (HDG + HDPE Lining)

**Tank Configuration:**
- Length: 4.5 panels (18' Ã· 4' = 4.5)
- Width: 4 panels (16' Ã· 4' = 4)
- Height: 3 panels (12' Ã· 4' = 3)
- Special: HDPE lined tank with internal tie rods

**Panel Summary:**
| Thickness | Code | Qty |
|-----------|------|-----|
| 5mm A5 | 2A5-i-14-HDG | 32 |
| 5mm B5 | 2B5-i-14-HDG | 16 |
| 5mm TBA5 | 2TBA5-i-HDG | 16 |
| 5mm As5 (half) | 2As5-i-14-HDG | 4 |
| 5mm Bs5 (half) | 2Bs5-i-14-HDG | 2 |
| 1.5mm Roof | 1R15-i-HDG | 14 |
| 1.5mm Rs (half) | 1Rs15-i-HDG | 4 |

**HDPE-Specific Components:**
| SKU | Description | Qty |
|-----|-------------|-----|
| 2HS4ft-HDG-HDPE | Horizontal Stay 4ft HDPE | 8 |
| 2HS8ft-HDG-HDPE | Horizontal Stay 8ft HDPE | 2 |
| CleatAL-14-HDG | Cleat AL Ã˜14 hole | 14 |
| CleatA-14-HDG | Cleat A Ã˜14 hole | 8 |
| StayPlate2H-HDG | Stay Plate 2H | 28 |
| TR-18ft-HDPE | End Stud M12 x 2806L | 24 |
| TR-16ft-HDPE | End Stud M12 x 2501L | 32 |

**KEY INSIGHT - HDPE Lined Tanks:**
- Uses Ã˜14 holes throughout (not Ã˜18)
- Has internal tie rods (TR-18ft-HDPE, TR-16ft-HDPE)
- Stay Plates (StayPlate2H-HDG) support tie rods externally
- Hybrid system: angle stays + tie rods

**Level Views:**

**4' LEVEL:**
- Shows tie rod pattern with dimensions 2501 and 2806

**8' LEVEL:**
- Similar tie rod pattern

**12' LEVEL:**
- Sparse stays, only corner connections

---

## 3. FRP Tie Rod Analysis

### 3.1 Drawing 4: 20M Ã— 5M Ã— 4M (Large FRP, No Partition)

**Tank Configuration:**
- Length: 20 panels
- Width: 5 panels
- Height: 4 panels (S10, S20, S30, S40)
- Total Wall Panels: 200

**Panel Summary:**
| Height | Code | Qty |
|--------|------|-----|
| S10 A | 3S10-FRP-A | 50 |
| S20 A | 3S20-FRP-A | 50 |
| S30 A | 3S30-FRP-A | 50 |
| S40 B | 3S40-FRP-B | 50 |
| B40 | 3B40-FRP-A | 100 |
| R00 | 2R00-FRP-A | 99 |
| ML0 | TP000G009 | 1 |

**Tie Rod System:**
| SKU | Description | Qty |
|-----|-------------|-----|
| TR-FRP-11M-SS304 | End Stud M10 x 5800L | 64 |
| TR-FRP-5M-SS304 | End Stud M10 x 2580L | 304 |
| TRE-FRP-5800-SS304 | Tie Rod M10 x 5800L | 32 |
| TRE-FRP-2760-SS304 | Tie Rod M10 x 2760L | 32 |
| BN300R001 | EPDM Rubber Washer | 368 |
| LHB-HDG | HDG Lug Hole Bracket | 384 |
| BN300B0NM10L-40 | SS304 M10 Long Nut | 248 |
| BN300B0NM10 | SS304 M10 Nut (496+736) | 1232 |
| TRB-HOOK | SS304 Tie Rod Hook | 304 |

**External Support:**
| SKU | Description | Qty |
|-----|-------------|-----|
| StayPlate2H-HDG | HDG Stay Plate 2H | 92 |
| StayPlate4H-HDG | HDG Stay Plate 4H | 46 |
| BE2-45-HDG | Main Beam 2069mm | 12 |
| BC2-45-HDG | Main Beam 1998mm | 48 |
| S1M-45-HDG | Sub Beam 950mm | 105 |
| BSB-FRP | Skid Base Bracket | 42 |
| OA100G012 | ABS Roof Plate Support | 38 |
| RS40-ABS | 4M ABS Roof Support | 38 |
| CA-40-FRP | HDG Corner Angle 4M | 4 |
| CC-FRP-SS304 | SS304 Corner Cleat FRP | 4 |

**Bend Angle & Flat:**
| SKU | Description | Qty |
|-----|-------------|-----|
| BA-FRP-940-HDG | HDG 940L x 60 x 25 x 3t Bend Angle | 288 |
| F-FRP-940-HDG | HDG 940L x 46 x 3t Flat | 112 |
| F:FRP-940-35-3-HDG | HDG 940L x 35 x 3t Flat | 450 |

**Tie Rod Pattern (from drawing):**
```
Level labels visible:
g 0PS | g 0PS | g 0PS | ... (repeated across width)
V 0CS | V 0CS | V 0CS | ...
V 02S | V 02S | V 02S | ...
V 01S | V 01S | V 01S | ...
```

This shows tie rod grid codes:
- **g 0PS**: Grid opening position S (?)
- **V 0CS**: Vertical 0 C S (?)
- **V 02S**: Vertical level 2 S
- **V 01S**: Vertical level 1 S

---

### 3.2 Drawing 5: 10M Ã— 3M Ã— 3M (Medium FRP)

**Tank Configuration:**
- Length: 10 panels
- Width: 3 panels
- Height: 3 panels

**Panel Summary:**
| Code | Qty |
|------|-----|
| 3S10-FRP-A | 26 |
| 3S20-FRP-A | 26 |
| 3S30-FRP-B | 26 |
| 3B30-FRP-A | 30 |
| 2R00-FRP-A | 29 |
| ML0 | 1 |

**Tie Rod System:**
| SKU | Description | Qty |
|-----|-------------|-----|
| TR-FRP-10M-SS304 | End Stud M10 x 5080L | 16 |
| TR-FRP-3M-SS304 | End Stud M10 x 1580L | 72 |
| BN300R001 | EPDM Rubber Washer | 88 |
| LHB-HDG | Lug Hole Bracket | 88 |
| BN300B0NM10L-40 | Long Nut | 44 |
| BN300B0NM10 | Nut (88+176) | 264 |
| TRB-HOOK | Tie Rod Hook | 36 |

**External Support:**
| SKU | Description | Qty |
|-----|-------------|-----|
| StayPlate2H-HDG | Stay Plate 2H | 44 |
| BE2-40-HDG | Main Beam | 8 |
| BC2-40-HDG | Main Beam | 12 |
| S1M-40-HDG | Sub Beam | 33 |

---

### 3.3 Drawing 6: 10M Ã— 4M Ã— 3M (Medium FRP)

**Tank Configuration:**
- Length: 10 panels
- Width: 4 panels
- Height: 3 panels

**Panel Summary:**
| Code | Qty |
|------|-----|
| 3S10-FRP-A | 28 |
| 3S20-FRP-A | 28 |
| 3S30-FRP-B | 28 |
| 3B30-FRP-A | 40 |
| 2R00-FRP-A | 39 |
| ML0 | 2 |

**Tie Rod System:**
| SKU | Description | Qty |
|-----|-------------|-----|
| TR-FRP-10M-SS304 | End Stud 5080L | 24 |
| TR-FRP-4M-SS304 | End Stud 2080L | 72 |
| LHB-HDG | Lug Hole Bracket | 96 |
| BN300B0NM10L-40 | Long Nut | 48 |
| BN300B0NM10 | Nut (96+192) | 288 |
| TRB-HOOK | Tie Rod Hook | 56 |

**External Support:**
| SKU | Description | Qty |
|-----|-------------|-----|
| StayPlate2H-HDG | Stay Plate 2H | 48 |
| BE2-40-HDG | Main Beam | 10 |
| BC2-40-HDG | Main Beam | 15 |
| S1M-40-HDG | Sub Beam | 44 |

---

## 4. Partition Stay/Tie Rod Analysis

### 4.1 Drawing 7: 12M Ã— 4M Ã— 2.5M FRP + 1 Partition

**Tank Configuration:**
- Length: 12 panels
- Width: 4 panels
- Height: 2.5M (special: S15, S25, D15 panels)
- Partition: 1

**Panel Summary:**
| Code | Description | Qty |
|------|-------------|-----|
| 3S25-FRP-B | Wall S25 B | 30 |
| 3S25-FRP-BCL | Wall S25 BCL | 1 |
| 3S25-FRP-BCR | Wall S25 BCR | 1 |
| 3D15-FRP-A | Wall D15 A | 30 |
| 3D15-FRP-ABR | Wall D15 ABR | 1 |
| 3D15-FRP-ABL | Wall D15 ABL | 1 |
| 3B25-FRP-A | Base B25 | 44 |
| 3B25-FRP-AB | Base B25 AB | 4 |
| 2R00-FRP-A | Roof R00 | 46 |
| **P25** | Partition Panel 1MÃ—1.5M | 4 |
| **PD 15** | Partition Panel 1MÃ—1.43M | 4 |

**Partition-Specific Components:**
| SKU | Description | Qty |
|-----|-------------|-----|
| TR-FRP-11M-SS304 | End Stud 5800L | 12 |
| TR-FRP-4M-SS304 | End Stud 2080L | 12 |
| **TR-FRP-P-SS304** | **Partition End Fix M10Ã—250L** | 12 |
| **TRE-FRP-2155-SS304** | **Tie Rod M10Ã—2155L** | 12 |
| **PI-C-BRACKET-127-SS304** | **Partition Internal C-Bracket 127mm** | 3 |
| **PI-C-BRACKET-100-SS304** | **Partition Internal C-Bracket 100mm** | 3 |
| **RB-SS304** | **SS304 Partition Roof Bracket** | 16 |
| CEU100-HDG | HDG Cleat EU c/c 100mm | 26 |
| CEU100-SS304 | SS304 Cleat EU c/c 100 | 3 |
| StayPlate2H-SS304 | SS304 Stay Plate 2H | 3 |

**KEY INSIGHTS - FRP Partition:**
- Partition uses special panels: P25 (1MÃ—1.5M) and PD15 (1MÃ—1.43M)
- **TR-FRP-P-SS304**: Short partition end fix (250mm)
- **TRE-FRP-2155-SS304**: Tie rod specifically for partition span
- **PI-C-BRACKET**: Internal C-Bracket to support partition tie rods
- **RB-SS304**: Partition roof bracket

---

### 4.2 Drawing 8: 9M Ã— 4.5M Ã— 3.5M FRP + 1 Partition (Complex)

**Tank Configuration:**
- Length: 9 panels (mix of 1M and 0.5M)
- Width: 4.5 panels (mix of 1M and 0.5M)
- Height: 3.5M (S15, S25, S35, HS35 + half panels)
- Partition: 1
- Complex: Uses MANY half-panel sizes

**Wall Panel Breakdown:**
| Code | Description | Qty |
|------|-------------|-----|
| S15 A | 1MÃ—1M Level 1 | 16 |
| S25 A | 1MÃ—1M Level 2 | 28 |
| S25 AB | 1MÃ—1M Level 2 AB | 4 |
| S35 B | 1MÃ—1M Level 3 | 22 |
| S35 BCL | 1MÃ—1M Level 3 BCL | 1 |
| S35 BCR | 1MÃ—1M Level 3 BCR | 1 |
| **HS10** | **Half panel 0.5MÃ—1M** | 22 |
| **HS10 AB** | Half panel AB | 2 |
| **HS15** | Half panel | 6 |
| **HS25** | Half panel | 6 |
| **HS35 B** | Half panel Level 3 | 6 |

**Partition Panels:**
| Code | Size | Qty |
|------|------|-----|
| PF15 | 1MÃ—1M | 4 |
| PF25 | 1MÃ—1M | 4 |
| P35 | 1MÃ—0.93M | 4 |
| HP15 | Partition 0.5MÃ—1M | 1 |
| HP25 | Partition 0.5MÃ—1M | 1 |
| HP35 | Partition 0.5MÃ—0.93M | 1 |
| HP10 | Partition 1.0MÃ—0.43M | 4 |
| QP10 | Partition 0.5MÃ—0.43M | 1 |

**Tie Rod System:**
| SKU | Description | Qty |
|-----|-------------|-----|
| TR-FRP-4455-SS304 | End Stud M10Ã—4455L | 52 |
| TR-FRP-A-M-SS304 | End Stud M10Ã—2380L | 182 |
| **TR-FRP-P-SS304** | Partition End Fix M10Ã—250L | 32 |
| **TRE-FRP-2155-SS304** | Tie Rod for partition | Note in BOM |
| LHB-HDG | Lug Hole Bracket | 230 |
| BN300B0NM10L-40 | Long Nut | 118 |
| BN300B0NM10 | Nut (236+492) | 728 |
| TRB-HOOK | Tie Rod Hook | 128 |

**External Support:**
| SKU | Description | Qty |
|-----|-------------|-----|
| StayPlate2H-HDG | Stay Plate 2H | 52 |
| StayPlate4H-HDG | Stay Plate 4H | 24 |
| StayPlate2H-SS304 | SS304 Stay Plate 2H | 8 |
| StayPlate4H-SS304 | SS304 Stay Plate 4H | 4 |
| **PI-C-BRACKET-127-SS304** | Partition C-Bracket 127mm | 16 |

---

## 5. Key Formulas Derived

### 5.1 Steel Type 2 Stay Formulas

**Horizontal Stays (HS):**
```
// Per tier, at panel junctions
HS_per_tier = (L - 1) * 2 + (W - 1) * 2

// Total HS across all heights
Total_HS = sum of HS_per_tier for each tier
```

**Vertical Stays (VS):**
```
// Vertical stays connect tiers
// 1M stays at bottom tier (welded)
VS1mW = corner_count + edge_count

// 2M, 3M, 4M stays span multiple tiers
VS_span = based on height and tier configuration
```

**Partition Stays (HSP, VSP):**
For NARROW tanks (Width â‰¤ 3 panels):
```
// Partition stays connect to OPPOSITE WALL
HSO{length} stays span width direction
Length = Width Ã— panel_size
```

For WIDE tanks (Width â‰¥ 4 panels):
```
// Partition stays connect to BASE
VSP{length} stays go diagonal to base
Length determined by HEIGHT tier
```

### 5.2 FRP Tie Rod Formulas

**End Studs (TR):**
```
// Length direction studs
TR_length_qty = (W - 1) Ã— H Ã— 2

// Width direction studs
TR_width_qty = (L - 1) Ã— H Ã— 2

// Stud length = (panels - 1) Ã— 1000mm + 80mm
TR_length_mm = (span_panels - 1) Ã— 1000 + 80
```

**Lug Hole Brackets (LHB):**
```
LHB_qty = Total_TR_studs
```

**Stay Plates:**
```
// 2H plates for 2-tier spans
StayPlate2H = perimeter Ã— (H / 2)

// 4H plates for 4-tier spans
StayPlate4H = corner_count Ã— (H / 4)
```

**Partition Tie Rods (FRP):**
```
// Short partition end fix
TR-FRP-P-SS304 = partition_panel_count Ã— 4

// Partition tie rod length
TRE_partition_length = Width Ã— 1000 - 345mm (approx)
```

---

## 6. SKU Reference Tables

### 6.1 Steel Type 2 Stay SKUs

**Horizontal Stays:**
| SKU Pattern | Description | Actual Length |
|-------------|-------------|---------------|
| 2HS1m-{mat} | 1M Horizontal Stay | 1464mm |
| 2HS2m-{mat} | 2M Horizontal Stay | 2878mm |
| 2HS3m-{mat} | 3M Horizontal Stay | 4293mm |
| 2HS1mW-{mat} | 1M Horizontal Welded | 1464mm |
| 2HS2mW-{mat} | 2M Horizontal Welded | 2878mm |
| 2HS4ft-{mat} | 4ft Horizontal (Imperial) | 1774mm |
| 2HS8ft-{mat} | 8ft Horizontal (Imperial) | 2900mm |
| 2HS4ft-HDG-HDPE | 4ft for HDPE lined | 1771mm |

**Vertical Stays:**
| SKU Pattern | Description | Actual Length |
|-------------|-------------|---------------|
| 2VS1mW-{mat} | 1M Vertical Welded | 1419mm |
| 2VS2m-{mat} | 2M Vertical Stay | 2833mm |
| 2VS3m-{mat} | 3M Vertical Stay | 4247mm |
| 2VS4m-3h-{mat} | 4M Vertical 3-hole | 5661mm |

**Partition Stays:**
| SKU Pattern | Description |
|-------------|-------------|
| 2HSP1m-{mat} | Partition Horizontal 1M |
| 2HSP2m-{mat} | Partition Horizontal 2M |
| 2HSP3m-{mat} | Partition Horizontal 3M |
| 2HSP1mW-{mat} | Partition Horizontal Welded 1M |
| 2HSP2mW-{mat} | Partition Horizontal Welded 2M |
| 2VSP1mW-{mat} | Partition Vertical Welded 1M |
| 2VSP2m-{mat} | Partition Vertical 2M |
| 2VSP3m-{mat} | Partition Vertical 3M |
| 2HSO2m-{mat} | Horizontal OP Stay 2M (narrow tanks) |
| 2HSO3m-{mat} | Horizontal OP Stay 3M (narrow tanks) |

### 6.2 FRP Tie Rod SKUs

**End Studs:**
| SKU Pattern | Description |
|-------------|-------------|
| TR-FRP-{length}M-SS304 | End Stud for main walls |
| TR-FRP-P-SS304 | Partition End Fix (250mm) |

**Tie Rods:**
| SKU Pattern | Description |
|-------------|-------------|
| TRE-FRP-{length}-SS304 | Through tie rod |

**Support Components:**
| SKU | Description |
|-----|-------------|
| LHB-HDG | Lug Hole Bracket |
| TRB-HOOK | Tie Rod Hook |
| BN300R001 | EPDM Rubber Washer |
| BN300B0NM10L-40 | Long Nut M10 |
| BN300B0NM10 | M10 Nut |
| StayPlate2H-HDG | Stay Plate 2-tier |
| StayPlate4H-HDG | Stay Plate 4-tier |
| PI-C-BRACKET-127-SS304 | Partition Internal C-Bracket 127mm |
| PI-C-BRACKET-100-SS304 | Partition Internal C-Bracket 100mm |
| RB-SS304 | Partition Roof Bracket |

---

## Summary of Key Learnings

### Steel Type 2:
1. **TBA panel codes** indicate stay hole count (1H, 2H, 3H, 4H)
2. **Bottom tier** uses heavier hardware (H.T M16 BNW)
3. **Partition in narrow tanks** (W â‰¤ 3) uses HSO stays to opposite wall
4. **Contact water tanks** mix SS304 (water zones) with HDG (upper zones)
5. **HDPE lined tanks** use Ã˜14 holes and internal tie rods

### FRP:
1. **No angle stays** - only tie rods
2. **Tie rod length** = (span_panels - 1) Ã— 1000 + offset
3. **Partition uses** TR-FRP-P-SS304 (short 250mm end fix)
4. **Stay plates** are external support (2H for 2-tier, 4H for 4-tier)
5. **PI-C-BRACKET** provides internal partition support

### Partition Logic:
1. **Narrow tank (W â‰¤ 3)**: Stays go to opposite wall (HSO pattern)
2. **Wide tank (W â‰¥ 4)**: Stays go to base (VSP pattern)
3. **FRP partition**: Uses dedicated partition tie rods and C-brackets
