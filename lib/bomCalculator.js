import { getPrice } from './priceLoader';

// lib/bomCalculator.js
// Sunnik Tank BOM Calculation Engine - Full SANS 10329:2020 Logic + Support + Bolts

/**
 * Enrich BOM items with prices from price database
 */
function enrichBOMWithPrices(bom, prices) {
  if (!prices) return bom;

  // Handle both steel (supports) and FRP (structural) sections
  const sections = ['base', 'walls', 'partition', 'roof', 'supports', 'structural', 'accessories', 'internalSupport', 'externalSupport'];
  sections.forEach(section => {
    if (Array.isArray(bom[section])) {
      bom[section].forEach(item => {
        if (item.sku && item.unitPrice === 0) {
          const price = getPrice(prices, item.sku);
          item.unitPrice = price || 0;
        }
      });
    }
  });

  return bom;
}

/**
 * Main BOM calculation function
 */
export function calculateBOM(inputs, prices = null) {
  const {
    length,
    width,
    height,
    panelType, // 'm' or 'i'
    material, // 'SS316', 'SS304', 'HDG', 'MS', 'FRP'
    partitionCount = 0,
    roofThickness = 1.5,
    supportType = 'none', // 'none', 'internal', 'external'
    iBeamSize = '150x75',
    freeboard = 100,
    panelTypeDetail = 'type1',
    tankFinish = 'none'
  } = inputs;

  // DIAGNOSTIC: Log input parameters
  console.log(`\n═══════════════════════════════════════`);
  console.log(`🏗️ CALCULATING BOM FOR TANK:`);
  console.log(`   Dimensions: ${length}m × ${width}m × ${height}m`);
  console.log(`   Material: ${material}`);
  console.log(`   Panel Type: ${panelType === 'm' ? 'Metric' : 'Imperial'}`);
  console.log(`   Partitions: ${partitionCount}`);
  console.log(`   Prices loaded: ${prices ? 'Yes (' + Object.keys(prices).length + ' SKUs)' : 'No'}`);
  console.log(`═══════════════════════════════════════\n`);

  const panelSize = panelType === 'm' ? 1.0 : 1.22;

  // Calculate panel grid
  const lengthPanels = Math.ceil(length / panelSize);
  const widthPanels = Math.ceil(width / panelSize);
  const heightPanels = Math.ceil(height / panelSize);
  const perimeter = 2 * (lengthPanels + widthPanels);

  // Determine which side is shorter (for partition orientation)
  const partitionSpan = Math.min(lengthPanels, widthPanels);

  // Get thickness specification from build standard
  const thickness = getThicknessByHeight(height, panelType, inputs.buildStandard || 'SANS');

  const bom = {
    base: [],
    walls: [],
    partition: [],
    roof: [],
    supports: [],
    accessories: [],
    summary: {
      totalPanels: 0,
      totalCost: 0,
      supportItems: 0,
      accessoryItems: 0
    }
  };

  // Material code mapping
  const materialCode = getMaterialCode(material);

  // Panel type number (1 or 2)
  const typeNumber = panelTypeDetail === 'type2' ? '2' : '1';

  if (material === 'FRP') {
    // === FRP TANK CALCULATION ===
    const frpResult = calculateFRPTank(lengthPanels, widthPanels, height, perimeter, panelType, supportType, iBeamSize, panelTypeDetail);

    // Enrich FRP BOM with prices from database
    enrichBOMWithPrices(frpResult, prices);

    // Recalculate total cost after enrichment
    const allItems = [
      ...(frpResult.base || []),
      ...(frpResult.walls || []),
      ...(frpResult.partition || []),
      ...(frpResult.roof || []),
      ...(frpResult.supports || []),
      ...(frpResult.accessories || [])
    ];
    frpResult.summary.totalCost = allItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

    return frpResult;
  }

  // === STEEL TANK CALCULATION ===

  // BASE PANELS
  const baseThickness = thickness.base;

  // Perimeter base panels (B panels)
  bom.base.push({
    sku: generateSKU(typeNumber, 'B', baseThickness, panelType, materialCode),
    description: `Base Panel - ${baseThickness}mm`,
    quantity: perimeter,
    unitPrice: 0
  });

  // Corner panels
  bom.base.push({
    sku: generateSKU(typeNumber, 'BCL', baseThickness, panelType, materialCode),
    description: `Base Corner Left - ${baseThickness}mm`,
    quantity: 2,
    unitPrice: 0
  });

  bom.base.push({
    sku: generateSKU(typeNumber, 'BCR', baseThickness, panelType, materialCode),
    description: `Base Corner Right - ${baseThickness}mm`,
    quantity: 2,
    unitPrice: 0
  });

  // Interior base panels (A panels)
  const interiorBase = (lengthPanels - 2) * (widthPanels - 2);
  if (interiorBase > 0) {
    bom.base.push({
      sku: generateSKU(typeNumber, 'A', baseThickness, panelType, materialCode),
      description: `Interior Base Panel - ${baseThickness}mm`,
      quantity: interiorBase,
      unitPrice: 0
    });
  }

  // Partition base support (if partitions exist)
  if (partitionCount > 0) {
    const abPerPartition = Math.max(1, partitionSpan - 4);

    bom.base.push({
      sku: generateSKU(typeNumber, 'AB', baseThickness, panelType, materialCode),
      description: `Partition Base Support - ${baseThickness}mm`,
      quantity: abPerPartition * partitionCount,
      unitPrice: 0
    });

    // Additional corner panels for partition intersections
    bom.base.push({
      sku: generateSKU(typeNumber, 'BCL', baseThickness, panelType, materialCode),
      description: `Partition Base Corner Left - ${baseThickness}mm`,
      quantity: 2 * partitionCount,
      unitPrice: 0
    });

    bom.base.push({
      sku: generateSKU(typeNumber, 'BCR', baseThickness, panelType, materialCode),
      description: `Partition Base Corner Right - ${baseThickness}mm`,
      quantity: 2 * partitionCount,
      unitPrice: 0
    });
  }

  // WALL PANELS (by tier according to SANS 10329:2020)
  thickness.tiers.forEach((tier, index) => {
    const isBottom = index === 0;
    const isTop = index === thickness.tiers.length - 1;

    if (isBottom) {
      // Bottom tier - B corners + A walls
      bom.walls.push({
        sku: generateSKU(typeNumber, 'B', tier.thickness, panelType, materialCode),
        description: `Wall Corner Bottom - Tier ${tier.height} - ${tier.thickness}mm`,
        quantity: 4,
        unitPrice: 0
      });

      bom.walls.push({
        sku: generateSKU(typeNumber, 'A', tier.thickness, panelType, materialCode),
        description: `Wall Panel - Tier ${tier.height} - ${tier.thickness}mm`,
        quantity: perimeter - 4,
        unitPrice: 0
      });

    } else if (isTop) {
      // Top tier - C corners + B walls
      bom.walls.push({
        sku: generateSKU(typeNumber, 'C', tier.thickness, panelType, materialCode),
        description: `Wall Corner Top - Tier ${tier.height} - ${tier.thickness}mm`,
        quantity: 4,
        unitPrice: 0
      });

      bom.walls.push({
        sku: generateSKU(typeNumber, 'B', tier.thickness, panelType, materialCode),
        description: `Wall Panel Top - Tier ${tier.height} - ${tier.thickness}mm`,
        quantity: perimeter - 4,
        unitPrice: 0
      });

    } else {
      // Middle tiers - all A panels
      bom.walls.push({
        sku: generateSKU(typeNumber, 'A', tier.thickness, panelType, materialCode),
        description: `Wall Panel - Tier ${tier.height} - ${tier.thickness}mm`,
        quantity: perimeter,
        unitPrice: 0
      });
    }
  });

  // PARTITION WALLS (if partitions exist)
  if (partitionCount > 0) {
    thickness.tiers.forEach(tier => {
      // Corner partition panels (Cφ)
      bom.partition.push({
        sku: generateSKU(typeNumber, 'Cφ', tier.thickness, panelType, materialCode),
        description: `Partition Corner - Tier ${tier.height} - ${tier.thickness}mm`,
        quantity: 2 * partitionCount,
        unitPrice: 0
      });

      // Main partition panels (Bφ)
      const mainPartitionPanels = Math.max(1, partitionSpan - 2);
      bom.partition.push({
        sku: generateSKU(typeNumber, 'Bφ', tier.thickness, panelType, materialCode),
        description: `Partition Wall - Tier ${tier.height} - ${tier.thickness}mm`,
        quantity: mainPartitionPanels * partitionCount,
        unitPrice: 0
      });
    });
  }

  // ROOF PANELS
  const roofCount = lengthPanels * widthPanels;
  const roofThicknessCode = roofThickness.toString().replace('.', '');

  bom.roof.push({
    sku: `${typeNumber}R${roofThicknessCode}-${panelType}-${materialCode}`,
    description: `Roof Panel - ${roofThickness}mm`,
    quantity: roofCount - 4,
    unitPrice: 0
  });

  // Air vents
  bom.roof.push({
    sku: `${typeNumber}R(AV)${roofThicknessCode}-${panelType}-${materialCode}`,
    description: `Roof Air Vent - ${roofThickness}mm`,
    quantity: 2,
    unitPrice: 0
  });

  // Manholes
  bom.roof.push({
    sku: `${typeNumber}MH${roofThicknessCode}-${panelType}-${materialCode}`,
    description: `Manhole - ${roofThickness}mm`,
    quantity: 2,
    unitPrice: 0
  });

  // === SUPPORT STRUCTURES ===
  if (supportType === 'internal') {
    bom.supports = calculateInternalSupport(
      lengthPanels,
      widthPanels,
      heightPanels,
      panelType,
      materialCode,
      partitionCount
    );
  } else if (supportType === 'external') {
    bom.supports = calculateExternalSupport(
      lengthPanels,
      widthPanels,
      height,
      panelType,
      iBeamSize
    );
  }

  // === BOLTS & NUTS (ACCESSORIES) ===
  bom.accessories = calculateBoltsAndNuts(
    lengthPanels,
    widthPanels,
    heightPanels,
    panelType,
    material
  );

  // Calculate totals
  const allItems = [...bom.base, ...bom.walls, ...bom.partition, ...bom.roof, ...bom.supports, ...bom.accessories];
  bom.summary.totalPanels = [...bom.base, ...bom.walls, ...bom.partition, ...bom.roof]
    .reduce((sum, item) => sum + item.quantity, 0);

  // Enrich all BOM items with prices from database
  enrichBOMWithPrices(bom, prices);

  bom.summary.totalCost = allItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  bom.summary.supportItems = bom.supports.length;
  bom.summary.accessoryItems = bom.accessories.length;

  return bom;
}

/**
 * Calculate Bolts & Nuts for entire tank
 * Improved formula: accounts for shared edges between panels
 */
function calculateBoltsAndNuts(lengthPanels, widthPanels, heightPanels, panelType, material) {
  const accessories = [];

  const boltsPerSide = getBoltsPerSide(material, panelType);

  // Total panels in the tank
  const basePanels = lengthPanels * widthPanels;
  const roofPanels = lengthPanels * widthPanels;
  const wallPanelsPerTier = (lengthPanels * 2) + (widthPanels * 2);
  const totalWallPanels = wallPanelsPerTier * heightPanels;
  const totalPanels = basePanels + roofPanels + totalWallPanels;

  // Formula: Each panel has 4 sides with bolts
  // Adjacent panels share edges (divide by 2)
  // Add 20% buffer for perimeter and corner connections
  const sharedEdgeBolts = (totalPanels * 4 * boltsPerSide) / 2;
  const totalBolts = Math.round(sharedEdgeBolts * 1.2);

  const boltSKU = getBoltSKU(material, panelType);

  // DIAGNOSTIC: Log bolt calculation
  console.log(`🔩 BOLT CALCULATION:
    Material: ${material} ${panelType}
    Total Panels: ${totalPanels} (base: ${basePanels}, roof: ${roofPanels}, walls: ${totalWallPanels})
    Bolts per side: ${boltsPerSide}
    Formula: (${totalPanels} × 4 × ${boltsPerSide}) ÷ 2 × 1.2
    Shared edges: ${sharedEdgeBolts}
    With buffer: ${totalBolts}
    Bolt SKU: ${boltSKU}
  `);

  accessories.push({
    sku: boltSKU,
    description: `Bolts & Nuts ${getBoltSize(material)} for Panel Connections`,
    quantity: totalBolts,
    unitPrice: 0,
    category: 'accessories',
    breakdown: {
      totalPanels: totalPanels,
      boltsPerSide: boltsPerSide,
      sharedEdgeCalculation: sharedEdgeBolts,
      withBuffer: totalBolts
    }
  });

  return accessories;
}

function getBoltsPerSide(material, panelType) {
  const boltsMap = {
    'SS316': { 'm': 16, 'i': 20 },
    'SS304': { 'm': 16, 'i': 20 },
    'HDG': { 'm': 13, 'i': 16 },
    'MS': { 'm': 13, 'i': 16 },
    'FRP': { 'm': 13, 'i': 13 }  // Fixed: FRP is 13 for both metric and imperial
  };

  return boltsMap[material]?.[panelType] || 16;
}

function getBoltSKU(material, panelType) {
  // Correct SKU format from CSV database
  const skuMap = {
    'SS316': 'BN300ABNM10025',  // Stainless Steel 316 Bolts & Nuts M10 x 25MM
    'SS304': 'BN300BBNM10025',  // Stainless Steel 304 Bolts & Nuts M10 x 25MM
    'HDG': 'BN300FBNM10025',    // Hot Dipped Galvanized Bolts & Nuts M10 x 25MM
    'MS': 'BN300FBNM10025',     // Use HDG SKU for MS (Mild Steel)
    'FRP': 'BN300FBNM10025'     // Use HDG SKU for FRP
  };

  return skuMap[material] || 'BN300FBNM10025';
}

function getBoltSize(material) {
  return 'M10×25mm';
}

/**
 * Calculate Internal Support
 */
function calculateInternalSupport(lengthPanels, widthPanels, heightPanels, panelType, materialCode, partitionCount = 0) {
  const supports = [];
  const panelSize = panelType === 'm' ? 1.0 : 1.22;

  const lengthStays = widthPanels - 1;
  const widthStays = lengthPanels - 1;

  const lengthMeters = lengthPanels * panelSize;
  const widthMeters = widthPanels * panelSize;

  if (heightPanels >= 1) {
    if (lengthStays > 0) {
      supports.push({
        sku: `STAY-18-${Math.round(lengthMeters * 100)}L-${materialCode}`,
        description: `Tie Rod Ø18mm × ${lengthMeters.toFixed(2)}m - Bottom Tier`,
        quantity: lengthStays,
        unitPrice: 0,
        category: 'internal_support'
      });
    }

    if (widthStays > 0) {
      supports.push({
        sku: `STAY-18-${Math.round(widthMeters * 100)}L-${materialCode}`,
        description: `Tie Rod Ø18mm × ${widthMeters.toFixed(2)}m - Bottom Tier`,
        quantity: widthStays,
        unitPrice: 0,
        category: 'internal_support'
      });
    }
  }

  if (heightPanels >= 2) {
    const middleTopTiers = heightPanels - 1;

    if (lengthStays > 0) {
      supports.push({
        sku: `STAY-14-${Math.round(lengthMeters * 100)}L-${materialCode}`,
        description: `Tie Rod Ø14mm × ${lengthMeters.toFixed(2)}m - Upper Tiers`,
        quantity: lengthStays * middleTopTiers,
        unitPrice: 0,
        category: 'internal_support'
      });
    }

    if (widthStays > 0) {
      supports.push({
        sku: `STAY-14-${Math.round(widthMeters * 100)}L-${materialCode}`,
        description: `Tie Rod Ø14mm × ${widthMeters.toFixed(2)}m - Upper Tiers`,
        quantity: widthStays * middleTopTiers,
        unitPrice: 0,
        category: 'internal_support'
      });
    }
  }

  if (partitionCount > 0) {
    const partitionLength = Math.min(lengthMeters, widthMeters);
    const partitionStays = Math.min(lengthPanels, widthPanels) - 1;

    if (partitionStays > 0) {
      supports.push({
        sku: `STAY-P-18-${Math.round(partitionLength * 100)}L-${materialCode}`,
        description: `Partition Tie Rod Ø18mm × ${partitionLength.toFixed(2)}m - Bottom`,
        quantity: partitionStays * partitionCount,
        unitPrice: 0,
        category: 'internal_support'
      });
    }

    if (heightPanels >= 2 && partitionStays > 0) {
      const upperTiers = heightPanels - 1;
      supports.push({
        sku: `STAY-P-14-${Math.round(partitionLength * 100)}L-${materialCode}`,
        description: `Partition Tie Rod Ø14mm × ${partitionLength.toFixed(2)}m - Upper`,
        quantity: partitionStays * partitionCount * upperTiers,
        unitPrice: 0,
        category: 'internal_support'
      });
    }
  }

  return supports;
}

/**
 * Calculate External Support
 */
function calculateExternalSupport(lengthPanels, widthPanels, heightMeters, panelType, iBeamSize = '150x75') {
  const supports = [];

  const lengthIBeams = lengthPanels - 1;
  const widthIBeams = widthPanels - 1;

  const totalIBeams = (lengthIBeams * 2) + (widthIBeams * 2);
  const iBeamLength = Math.ceil(heightMeters * 10) / 10;

  supports.push({
    sku: `IBEAM-${iBeamSize}-${Math.round(iBeamLength * 1000)}L-HDG`,
    description: `I-Beam ${iBeamSize} × ${iBeamLength}m HDG`,
    quantity: totalIBeams,
    unitPrice: 0,
    category: 'external_support'
  });

  const panelSizeMM = panelType === 'm' ? 1000 : 1220;
  supports.push({
    sku: `BA-EB-${panelSizeMM}-HDG`,
    description: `Bend Angle ${panelSizeMM}mm for I-Beam Connection`,
    quantity: totalIBeams * 4,
    unitPrice: 0,
    category: 'external_support'
  });

  supports.push({
    sku: `BASEPLATE-${iBeamSize}-HDG`,
    description: `Base Plate for I-Beam ${iBeamSize}`,
    quantity: totalIBeams * 2,
    unitPrice: 0,
    category: 'external_support'
  });

  supports.push({
    sku: `BN-M12-50-HDG`,
    description: `Bolt & Nut M12×50mm HDG for I-Beam`,
    quantity: totalIBeams * 8,
    unitPrice: 0,
    category: 'external_support'
  });

  return supports;
}

/**
 * Get panel thickness based on build standard
 */
export function getThicknessByHeight(heightMeters, panelType, buildStandard = 'SANS') {
  const heightMM = heightMeters * 1000;
  const panelSize = panelType === 'm' ? 1000 : 1220;
  const heightPanels = Math.ceil(heightMM / panelSize);

  // BSI & LPCB Standards (same thickness rules)
  if (buildStandard === 'BSI' || buildStandard === 'LPCB') {
    if (heightPanels <= 3) {
      // 1-3 panels height: 5mm all
      const tiers = [];
      for (let i = 1; i <= heightPanels; i++) {
        tiers.push({
          height: i,
          thickness: 5.0,
          code: i === heightPanels ? 'C' : 'A'
        });
      }
      return {
        base: 5.0,
        wall: 5.0,
        roof: 1.5,
        tiers: tiers
      };
    } else {
      // 4+ panels height: 6mm base & 1st tier, 5mm the rest
      const tiers = [];
      for (let i = 1; i <= heightPanels; i++) {
        if (i === 1) {
          // First tier: 6mm
          tiers.push({ height: 1, thickness: 6.0, code: 'A' });
        } else if (i === heightPanels) {
          // Top tier: 5mm with C code
          tiers.push({ height: i, thickness: 5.0, code: 'C' });
        } else {
          // Middle tiers: 5mm
          tiers.push({ height: i, thickness: 5.0, code: 'A' });
        }
      }
      return {
        base: 6.0,
        wall: 6.0,
        roof: 1.5,
        tiers: tiers
      };
    }
  }

  // SANS 10329:2020 Standard (original logic)
  if (panelType === 'm') {
    // METRIC PANELS (1m × 1m)
    if (heightMM >= 1000 && heightMM <= 1020) {
      return {
        base: 3.0,
        wall: 3.0,
        roof: 1.5,
        tiers: [{ height: 1, thickness: 3.0, code: 'A' }]
      };
    } else if (heightMM >= 2000 && heightMM <= 2040) {
      return {
        base: 3.0,
        wall: 3.0,
        roof: 1.5,
        tiers: [
          { height: 1, thickness: 3.0, code: 'A' },
          { height: 2, thickness: 3.0, code: 'A' }
        ]
      };
    } else if (heightMM >= 3000 && heightMM <= 3060) {
      return {
        base: 4.5,
        wall: 4.5,
        roof: 1.5,
        tiers: [
          { height: 1, thickness: 4.5, code: 'A' },
          { height: 2, thickness: 3.0, code: 'A' },
          { height: 3, thickness: 3.0, code: 'C' }
        ]
      };
    } else if (heightMM >= 4000 && heightMM <= 4080) {
      return {
        base: 5.0,
        wall: 5.0,
        roof: 1.5,
        tiers: [
          { height: 1, thickness: 5.0, code: 'A' },
          { height: 2, thickness: 4.5, code: 'A' },
          { height: 3, thickness: 3.0, code: 'A' },
          { height: 4, thickness: 3.0, code: 'C' }
        ]
      };
    }
  } else if (panelType === 'i') {
    // IMPERIAL PANELS (4ft × 4ft = 1.22m × 1.22m)
    if (heightMM >= 1200 && heightMM <= 1220) {
      return {
        base: 2.5,
        wall: 2.5,
        roof: 1.5,
        tiers: [{ height: 1, thickness: 2.5, code: 'A' }]
      };
    } else if (heightMM >= 2400 && heightMM <= 2440) {
      return {
        base: 3.0,
        wall: 3.0,
        roof: 1.5,
        tiers: [
          { height: 1, thickness: 3.0, code: 'A' },
          { height: 2, thickness: 2.5, code: 'A' }
        ]
      };
    } else if (heightMM >= 3600 && heightMM <= 3660) {
      return {
        base: 4.0,
        wall: 4.0,
        roof: 1.5,
        tiers: [
          { height: 1, thickness: 4.0, code: 'A' },
          { height: 2, thickness: 3.0, code: 'A' },
          { height: 3, thickness: 2.5, code: 'C' }
        ]
      };
    }
  }

  // Default fallback
  return {
    base: 3.0,
    wall: 3.0,
    roof: 1.5,
    tiers: [{ height: 1, thickness: 3.0, code: 'A' }]
  };
}

/**
 * Map thickness to available CSV SKUs
 * CSV only has: 2.0, 2.5, 3.0, 4.0, 6.0mm (5.0mm has no prices!)
 * SANS standard may specify: 4.5mm (not in CSV)
 */
function mapThicknessToAvailable(thickness) {
  // Map 4.5mm → 4.0mm (5.0mm has no prices in CSV)
  // Use 4.0mm as closest available
  if (thickness === 4.5) {
    console.log(`⚠️ Mapping 4.5mm → 4.0mm (4.5mm not in CSV)`);
    return 4.0;
  }
  // Map 5.0mm → 6.0mm (5.0mm has no prices in CSV)
  if (thickness === 5.0) {
    console.log(`⚠️ Mapping 5.0mm → 6.0mm (5.0mm not in CSV)`);
    return 6.0;
  }
  return thickness;
}

function generateSKU(panelType, location, thickness, size, material) {
  // Map to available thickness first
  const mappedThickness = mapThicknessToAvailable(thickness);

  // Format thickness code correctly:
  // 2.5 → "25", 3.0 → "3", 4.5 → "5" (mapped), 5.0 → "5"
  const thicknessCode = (mappedThickness % 1 === 0)
    ? Math.round(mappedThickness).toString()  // Whole number: 3.0 → "3", 5.0 → "5"
    : mappedThickness.toString().replace('.', '');  // Decimal: 2.5 → "25"

  const sku = `${panelType}${location}${thicknessCode}-${size}-${material}`;

  // DIAGNOSTIC: Log SKU generation
  console.log(`🔍 SKU Generated: ${sku} (thickness ${thickness}mm → ${mappedThickness}mm)`);

  return sku;
}

function getMaterialCode(material) {
  const codes = {
    'SS316': 'S2',
    'SS304': 'S1',
    'HDG': 'HDG',
    'MS': 'MS'
  };
  return codes[material] || 'S2';
}

/**
 * FRP Tank calculation
 */
function calculateFRPTank(lengthPanels, widthPanels, height, perimeter, panelType, supportType, iBeamSize, panelTypeDetail = 'type1') {
  const heightPanels = Math.ceil(height);
  const typeNumber = '3';  // FRP ALWAYS uses type number 3 (not 1 or 2)

  const bom = {
    base: [],
    walls: [],
    partition: [],
    roof: [],
    supports: [],
    accessories: [],
    summary: { totalPanels: 0, totalCost: 0, supportItems: 0, accessoryItems: 0 }
  };

  const baseCount = lengthPanels * widthPanels;
  const baseDepth = Math.ceil(height / 1) * 10;
  bom.base.push({
    sku: `${typeNumber}B${baseDepth}-FRP`,
    description: `FRP Base Panel - B${baseDepth}`,
    quantity: baseCount,
    unitPrice: 0
  });

  const sidewallHeight = Math.ceil(height / 1) * 10;
  bom.walls.push({
    sku: `${typeNumber}S${sidewallHeight}-FRP-A`,
    description: `FRP Sidewall Panel - S${sidewallHeight}`,
    quantity: perimeter,
    unitPrice: 0
  });

  const roofCount = lengthPanels * widthPanels;
  bom.roof.push({
    sku: `${typeNumber}R00-FRP`,
    description: 'FRP Roof Panel',
    quantity: roofCount - 3,
    unitPrice: 0
  });

  if (supportType === 'external') {
    bom.supports = calculateExternalSupport(
      lengthPanels,
      widthPanels,
      height,
      panelType,
      iBeamSize
    );
  }

  bom.accessories = calculateBoltsAndNuts(
    lengthPanels,
    widthPanels,
    heightPanels,
    panelType,
    'FRP'
  );

  const allItems = [...bom.base, ...bom.walls, ...bom.roof, ...bom.supports, ...bom.accessories];
  bom.summary.totalPanels = [...bom.base, ...bom.walls, ...bom.roof]
    .reduce((sum, item) => sum + item.quantity, 0);
  bom.summary.supportItems = bom.supports.length;
  bom.summary.accessoryItems = bom.accessories.length;
  bom.summary.totalCost = allItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

  return bom;
}

export function calculateVolume(length, width, height) {
  const volumeM3 = length * width * height;
  return {
    cubic_meters: volumeM3,
    liters: volumeM3 * 1000,
    gallons: volumeM3 * 264.172
  };
}
