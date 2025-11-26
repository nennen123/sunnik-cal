// app/lib/bomCalculator.js
// Sunnik Tank BOM Calculation Engine
// Updated: Fixed BUG-005 - FRP Panel Calculation
// Added: supports and accessories arrays for QuoteSummary compatibility

// ============================================
// BUILD STANDARDS CONFIGURATION
// ============================================

/**
 * Get available build standards based on material type
 * FRP uses different standards than Steel
 */
export function getBuildStandards(material) {
  if (material === 'FRP') {
    return [
      { code: 'MS1390', name: 'MS1390:2010 (Malaysian - SPAN Approved)' },
      { code: 'SS245', name: 'SS245:2014 (Singapore Standard)' }
    ];
  } else {
    // Steel tanks (SS316, SS304, HDG, MS)
    return [
      { code: 'BSI', name: 'BSI (British Standard)' },
      { code: 'LPCB', name: 'LPCB (Loss Prevention Certification Board)' },
      { code: 'SANS', name: 'SANS 10329:2020 (South African Standard)' }
    ];
  }
}

// ============================================
// STEEL PANEL THICKNESS LOGIC
// ============================================

/**
 * Get panel thickness based on SANS 10329:2020 standard for STEEL tanks
 * This does NOT apply to FRP tanks
 */
export function getThicknessByHeight(heightMeters, panelType) {
  const heightMM = heightMeters * 1000;

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

// ============================================
// FRP PANEL CALCULATION (BUG-005 FIX)
// ============================================

/**
 * Convert height to FRP depth/height code
 * Examples: 1m → "10", 1.5m → "15", 2m → "20", 3.5m → "35", 4m → "40"
 */
function getFRPDepthCode(heightMeters) {
  // Round to nearest 0.5m and convert to code
  const rounded = Math.round(heightMeters * 2) / 2;
  return String(Math.round(rounded * 10)).padStart(2, '0');
}

/**
 * Check if height has a half-meter component (e.g., 3.5m, 4.5m)
 */
function hasHalfMeterHeight(heightMeters) {
  const decimal = heightMeters % 1;
  return decimal >= 0.4 && decimal <= 0.6; // Allow some tolerance
}

/**
 * Get the number of full 1m tiers and if there's a half tier
 */
function getFRPTiers(heightMeters) {
  const fullTiers = Math.floor(heightMeters);
  const hasHalfTier = hasHalfMeterHeight(heightMeters);
  return { fullTiers, hasHalfTier };
}

/**
 * Calculate FRP tank BOM
 * FRP uses completely different panel system than steel
 */
export function calculateFRPBOM(inputs) {
  const {
    length,
    width,
    height,
    partitionCount = 0,
    internalSupport = false,
    externalSupport = false,
    wliMaterial = 'None',
    internalLadderQty = 0,
    internalLadderMaterial = 'HDG',
    externalLadderQty = 0,
    externalLadderMaterial = 'HDG',
    safetyCage = false
  } = inputs;

  // FRP is ALWAYS metric (1m × 1m panels)
  const panelSize = 1.0;

  // Calculate panel grid
  const lengthPanels = Math.ceil(length / panelSize);
  const widthPanels = Math.ceil(width / panelSize);
  const perimeter = 2 * (lengthPanels + widthPanels);

  // Get FRP depth code based on tank height
  const depthCode = getFRPDepthCode(height);
  const { fullTiers, hasHalfTier } = getFRPTiers(height);

  // Determine partition span (shorter side)
  const partitionSpan = Math.min(lengthPanels, widthPanels);

  const bom = {
    base: [],
    walls: [],
    partition: [],
    roof: [],
    supports: [],
    accessories: [],
    summary: {
      totalPanels: 0,
      totalCost: 0
    }
  };

  // ===========================
  // BASE PANELS
  // ===========================

  // Main base panels (interior)
  const interiorBaseCount = Math.max(0, (lengthPanels - 2) * (widthPanels - 2));
  if (interiorBaseCount > 0) {
    bom.base.push({
      sku: `3B${depthCode}-FRP`,
      description: `FRP Base Panel B${depthCode} - Interior`,
      quantity: interiorBaseCount,
      unitPrice: 0
    });
  }

  // Perimeter base panels (edges, not corners)
  const perimeterEdgeCount = 2 * (lengthPanels - 2) + 2 * (widthPanels - 2);
  if (perimeterEdgeCount > 0) {
    bom.base.push({
      sku: `3B${depthCode}-FRP`,
      description: `FRP Base Panel B${depthCode} - Perimeter Edge`,
      quantity: perimeterEdgeCount,
      unitPrice: 0
    });
  }

  // Corner base panels (4 corners)
  bom.base.push({
    sku: `3B${depthCode}-FRP`,
    description: `FRP Base Panel B${depthCode} - Corner`,
    quantity: 4,
    unitPrice: 0
  });

  // Partition base support (AB panels)
  if (partitionCount > 0) {
    const partitionBaseCount = partitionSpan * partitionCount;
    bom.base.push({
      sku: `3B${depthCode}-FRP-AB`,
      description: `FRP Base Panel B${depthCode}-AB - Partition Support`,
      quantity: partitionBaseCount,
      unitPrice: 0
    });
  }

  // ===========================
  // SIDEWALL PANELS
  // ===========================

  // For each full 1m tier
  for (let tier = 1; tier <= fullTiers; tier++) {
    const tierDepthCode = getFRPDepthCode(height); // Use tank depth for all tiers
    const isBottomTier = (tier === 1);

    // Main wall panels (not corners)
    const mainWallCount = perimeter - 4;

    if (isBottomTier) {
      // Bottom tier uses Type B (structural)
      bom.walls.push({
        sku: `3S${tierDepthCode}-FRP-B`,
        description: `FRP Sidewall S${tierDepthCode}-B - Tier ${tier} (Structural)`,
        quantity: mainWallCount,
        unitPrice: 0
      });
    } else {
      // Upper tiers use Type A (standard)
      bom.walls.push({
        sku: `3S${tierDepthCode}-FRP-A`,
        description: `FRP Sidewall S${tierDepthCode}-A - Tier ${tier}`,
        quantity: mainWallCount,
        unitPrice: 0
      });
    }

    // Corner panels - BCL (Bottom Corner Left) × 2
    bom.walls.push({
      sku: `3S${tierDepthCode}-FRP-BCL`,
      description: `FRP Sidewall S${tierDepthCode}-BCL - Tier ${tier} Corner Left`,
      quantity: 2,
      unitPrice: 0
    });

    // Corner panels - BCR (Bottom Corner Right) × 2
    bom.walls.push({
      sku: `3S${tierDepthCode}-FRP-BCR`,
      description: `FRP Sidewall S${tierDepthCode}-BCR - Tier ${tier} Corner Right`,
      quantity: 2,
      unitPrice: 0
    });
  }

  // Half panels for odd heights (3.5m, 4.5m, etc.)
  if (hasHalfTier) {
    const mainHalfCount = perimeter - 4;

    // Main half panels (D15 = 1M × 1.5M)
    bom.walls.push({
      sku: '3D15-FRP-A',
      description: 'FRP Half Panel D15-A (1M × 1.5M)',
      quantity: mainHalfCount,
      unitPrice: 0
    });

    // Half panel corners
    bom.walls.push({
      sku: '3D15-FRP-BCL',
      description: 'FRP Half Panel D15-BCL - Corner Left',
      quantity: 2,
      unitPrice: 0
    });

    bom.walls.push({
      sku: '3D15-FRP-BCR',
      description: 'FRP Half Panel D15-BCR - Corner Right',
      quantity: 2,
      unitPrice: 0
    });
  }

  // AB panels for partition joints on walls
  if (partitionCount > 0) {
    const tierDepthCode = getFRPDepthCode(height);
    const totalTiers = fullTiers + (hasHalfTier ? 1 : 0);

    // 2 AB panels per partition per tier (where partition meets wall)
    bom.walls.push({
      sku: `3S${tierDepthCode}-FRP-AB`,
      description: `FRP Sidewall S${tierDepthCode}-AB - Partition Joint`,
      quantity: 2 * partitionCount * totalTiers,
      unitPrice: 0
    });
  }

  // ===========================
  // PARTITION PANELS
  // ===========================

  if (partitionCount > 0) {
    const tierDepthCode = getFRPDepthCode(height);
    const totalTiers = fullTiers + (hasHalfTier ? 1 : 0);

    // Main partition panels (PF = full 1M × 1M partition)
    // Quantity = (span - 2 corners) × tiers × number of partitions
    const mainPartitionPerWall = Math.max(0, partitionSpan - 2);

    if (mainPartitionPerWall > 0) {
      bom.partition.push({
        sku: `3PF${tierDepthCode}-FRP-A`,
        description: `FRP Partition Panel PF${tierDepthCode}-A`,
        quantity: mainPartitionPerWall * totalTiers * partitionCount,
        unitPrice: 0
      });
    }

    // Partition corner panels (where partition meets main wall)
    // 2 corners per partition per tier
    bom.partition.push({
      sku: `3P${tierDepthCode}-FRP-A`,
      description: `FRP Partition Corner P${tierDepthCode}-A`,
      quantity: 2 * totalTiers * partitionCount,
      unitPrice: 0
    });
  }

  // ===========================
  // ROOF PANELS
  // ===========================

  const roofCount = lengthPanels * widthPanels;

  // Main roof panels (using 3F00-FRP which has actual pricing)
  // Reserve 2 for manholes
  bom.roof.push({
    sku: '3F00-FRP',
    description: 'FRP Roof Panel (Flat)',
    quantity: Math.max(0, roofCount - 2),
    unitPrice: 0
  });

  // Manhole covers (using half panel as placeholder)
  bom.roof.push({
    sku: '3H00-FRP',
    description: 'FRP Roof Manhole Cover',
    quantity: 2,
    unitPrice: 0
  });

  // ===========================
  // SUPPORT STRUCTURES
  // ===========================

  if (internalSupport) {
    // FRP internal supports - calculate based on tank size
    const horizontalStays = Math.max(0, (lengthPanels - 1) * (heightPanels - 1));
    const verticalStays = Math.max(0, (widthPanels - 1) * (heightPanels - 1));

    if (horizontalStays > 0) {
      bom.supports.push({
        sku: 'IS-FRP-H',
        description: 'FRP Internal Horizontal Stay',
        quantity: horizontalStays,
        unitPrice: 0
      });
    }

    if (verticalStays > 0) {
      bom.supports.push({
        sku: 'IS-FRP-V',
        description: 'FRP Internal Vertical Stay',
        quantity: verticalStays,
        unitPrice: 0
      });
    }
  }

  // Note: FRP tanks typically don't use external I-beam supports
  // They use internal bracing with ABS brackets
  if (externalSupport) {
    bom.supports.push({
      sku: 'ES-FRP-BRACKET',
      description: 'FRP External Support Bracket (ABS)',
      quantity: perimeter * 2,
      unitPrice: 0
    });
  }

  // ===========================
  // ACCESSORIES
  // ===========================

  // Water Level Indicator
  if (wliMaterial && wliMaterial !== 'None') {
    bom.accessories.push({
      sku: `WLI-${wliMaterial}`,
      description: `Water Level Indicator - ${wliMaterial}`,
      quantity: 1,
      unitPrice: 0
    });
  }

  // Internal Ladder
  if (internalLadderQty > 0) {
    bom.accessories.push({
      sku: `LADDER-INT-${internalLadderMaterial}`,
      description: `Internal Ladder - ${internalLadderMaterial}`,
      quantity: internalLadderQty,
      unitPrice: 0
    });
  }

  // External Ladder
  if (externalLadderQty > 0) {
    bom.accessories.push({
      sku: `LADDER-EXT-${externalLadderMaterial}`,
      description: `External Ladder - ${externalLadderMaterial}`,
      quantity: externalLadderQty,
      unitPrice: 0
    });

    // Safety cage if external ladder and height > 3m
    if (safetyCage || height > 3) {
      bom.accessories.push({
        sku: `CAGE-${externalLadderMaterial}`,
        description: `Safety Cage - ${externalLadderMaterial}`,
        quantity: externalLadderQty,
        unitPrice: 0
      });
    }
  }

  // ===========================
  // CALCULATE TOTALS
  // ===========================

  const allPanelItems = [...bom.base, ...bom.walls, ...bom.partition, ...bom.roof];
  const allItems = [...allPanelItems, ...bom.supports, ...bom.accessories];

  bom.summary.totalPanels = allPanelItems.reduce((sum, item) => sum + item.quantity, 0);
  bom.summary.totalCost = allItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

  return bom;
}

// ============================================
// STEEL PANEL CALCULATION
// ============================================

/**
 * Generate SKU code for steel panels
 */
export function generateSteelSKU(panelType, location, thickness, size, material) {
  // panelType: '1' or '2' (Type 1 or Type 2)
  // location: 'A', 'B', 'C', 'AB', 'BCL', 'BCR', etc.
  // thickness: 2.5, 3.0, 4.5, 5.0, etc.
  // size: 'm' or 'i'
  // material: 'S2' (SS316), 'S1' (SS304), 'HDG', 'MS'

  const thicknessCode = thickness.toString().replace('.', '');
  return `${panelType}${location}${thicknessCode}-${size}-${material}`;
}

/**
 * Calculate Steel tank BOM (SS316, SS304, HDG, MS)
 */
export function calculateSteelBOM(inputs) {
  const {
    length,
    width,
    height,
    panelType = 'm', // 'm' or 'i'
    panelTypeDetail = 1, // 1 or 2
    material = 'SS316', // 'SS316', 'SS304', 'HDG', 'MS'
    partitionCount = 0,
    roofThickness = 1.5,
    internalSupport = false,
    externalSupport = false,
    iBeamSize = '150x75',
    wliMaterial = 'None',
    internalLadderQty = 0,
    internalLadderMaterial = 'HDG',
    externalLadderQty = 0,
    externalLadderMaterial = 'HDG',
    safetyCage = false,
    bnwMaterial = 'HDG'
  } = inputs;

  const panelSize = panelType === 'm' ? 1.0 : 1.22;

  // Calculate panel grid
  const lengthPanels = Math.ceil(length / panelSize);
  const widthPanels = Math.ceil(width / panelSize);
  const heightPanels = Math.ceil(height / panelSize);
  const perimeter = 2 * (lengthPanels + widthPanels);

  // Determine which side is shorter (for partition orientation)
  const partitionSpan = Math.min(lengthPanels, widthPanels);

  // Get thickness specification
  const thickness = getThicknessByHeight(height, panelType);

  const bom = {
    base: [],
    walls: [],
    partition: [],
    roof: [],
    supports: [],
    accessories: [],
    summary: {
      totalPanels: 0,
      totalCost: 0
    }
  };

  // Material code mapping
  const materialCode = {
    'SS316': 'S2',
    'SS304': 'S1',
    'HDG': 'HDG',
    'MS': 'MS'
  }[material] || 'S2';

  const typePrefix = String(panelTypeDetail);

  // ===========================
  // BASE PANELS
  // ===========================

  const baseThickness = thickness.base;
  const baseSKU = generateSteelSKU(typePrefix, 'B', baseThickness, panelType, materialCode);

  // Perimeter base panels
  bom.base.push({
    sku: baseSKU,
    description: `Base Panel - ${baseThickness}mm`,
    quantity: perimeter,
    unitPrice: 0
  });

  // Corner panels
  bom.base.push({
    sku: generateSteelSKU(typePrefix, 'BCL', baseThickness, panelType, materialCode),
    description: `Base Corner Left - ${baseThickness}mm`,
    quantity: 2,
    unitPrice: 0
  });

  bom.base.push({
    sku: generateSteelSKU(typePrefix, 'BCR', baseThickness, panelType, materialCode),
    description: `Base Corner Right - ${baseThickness}mm`,
    quantity: 2,
    unitPrice: 0
  });

  // Interior base panels
  const interiorBase = Math.max(0, (lengthPanels - 2) * (widthPanels - 2));
  if (interiorBase > 0) {
    bom.base.push({
      sku: generateSteelSKU(typePrefix, 'A', baseThickness, panelType, materialCode),
      description: `Interior Base Panel - ${baseThickness}mm`,
      quantity: interiorBase,
      unitPrice: 0
    });
  }

  // Partition base support (if partitions exist)
  if (partitionCount > 0) {
    const abPerPartition = Math.max(1, partitionSpan - 4);
    bom.base.push({
      sku: generateSteelSKU(typePrefix, 'AB', baseThickness, panelType, materialCode),
      description: `Partition Base Support - ${baseThickness}mm`,
      quantity: abPerPartition * partitionCount,
      unitPrice: 0
    });

    bom.base.push({
      sku: generateSteelSKU(typePrefix, 'BCL', baseThickness, panelType, materialCode),
      description: `Partition Corner Left - ${baseThickness}mm`,
      quantity: 2 * partitionCount,
      unitPrice: 0
    });

    bom.base.push({
      sku: generateSteelSKU(typePrefix, 'BCR', baseThickness, panelType, materialCode),
      description: `Partition Corner Right - ${baseThickness}mm`,
      quantity: 2 * partitionCount,
      unitPrice: 0
    });
  }

  // ===========================
  // WALL PANELS (by tier)
  // ===========================

  thickness.tiers.forEach((tier, index) => {
    const isBottom = index === 0;
    const isTop = index === thickness.tiers.length - 1;

    if (isBottom) {
      // Bottom tier corners
      bom.walls.push({
        sku: generateSteelSKU(typePrefix, 'B', tier.thickness, panelType, materialCode),
        description: `Wall Corner Bottom - Tier ${tier.height} - ${tier.thickness}mm`,
        quantity: 4,
        unitPrice: 0
      });

      // Bottom tier main walls
      bom.walls.push({
        sku: generateSteelSKU(typePrefix, tier.code, tier.thickness, panelType, materialCode),
        description: `Wall Panel - Tier ${tier.height} - ${tier.thickness}mm`,
        quantity: perimeter - 4,
        unitPrice: 0
      });

    } else if (isTop) {
      // Top tier corners
      bom.walls.push({
        sku: generateSteelSKU(typePrefix, tier.code, tier.thickness, panelType, materialCode),
        description: `Wall Corner Top - Tier ${tier.height} - ${tier.thickness}mm`,
        quantity: 4,
        unitPrice: 0
      });

      // Top tier main walls
      bom.walls.push({
        sku: generateSteelSKU(typePrefix, 'B', tier.thickness, panelType, materialCode),
        description: `Wall Panel Top - Tier ${tier.height} - ${tier.thickness}mm`,
        quantity: perimeter - 4,
        unitPrice: 0
      });

    } else {
      // Middle tiers - all A panels
      bom.walls.push({
        sku: generateSteelSKU(typePrefix, tier.code, tier.thickness, panelType, materialCode),
        description: `Wall Panel - Tier ${tier.height} - ${tier.thickness}mm`,
        quantity: perimeter,
        unitPrice: 0
      });
    }
  });

  // ===========================
  // PARTITION WALLS (if partitions exist)
  // ===========================

  if (partitionCount > 0) {
    thickness.tiers.forEach(tier => {
      // Corner partition panels (Cφ)
      bom.partition.push({
        sku: `${typePrefix}Cφ${tier.thickness.toString().replace('.', '')}-${panelType}-${materialCode}`,
        description: `Partition Corner - Tier ${tier.height} - ${tier.thickness}mm`,
        quantity: 2 * partitionCount,
        unitPrice: 0
      });

      // Main partition panels (Bφ)
      const mainPartitionPanels = Math.max(1, partitionSpan - 2);
      bom.partition.push({
        sku: `${typePrefix}Bφ${tier.thickness.toString().replace('.', '')}-${panelType}-${materialCode}`,
        description: `Partition Wall - Tier ${tier.height} - ${tier.thickness}mm`,
        quantity: mainPartitionPanels * partitionCount,
        unitPrice: 0
      });
    });
  }

  // ===========================
  // ROOF PANELS
  // ===========================

  const roofCount = lengthPanels * widthPanels;
  const roofThicknessCode = roofThickness.toString().replace('.', '');

  bom.roof.push({
    sku: `${typePrefix}R${roofThicknessCode}-${panelType}-${materialCode}`,
    description: `Roof Panel - ${roofThickness}mm`,
    quantity: Math.max(0, roofCount - 4),
    unitPrice: 0
  });

  // Air vents
  bom.roof.push({
    sku: `${typePrefix}R(AV)${roofThicknessCode}-${panelType}-${materialCode}`,
    description: `Roof Air Vent - ${roofThickness}mm`,
    quantity: 2,
    unitPrice: 0
  });

  // Manholes
  bom.roof.push({
    sku: `${typePrefix}MH${roofThicknessCode}-${panelType}-${materialCode}`,
    description: `Manhole - ${roofThickness}mm`,
    quantity: 2,
    unitPrice: 0
  });

  // ===========================
  // SUPPORT STRUCTURES
  // ===========================

  if (internalSupport) {
    // Internal tie rods/stays
    const horizontalStays = Math.max(0, (lengthPanels - 1) * heightPanels);
    const verticalStays = Math.max(0, (widthPanels - 1) * heightPanels);

    if (horizontalStays > 0) {
      bom.supports.push({
        sku: `HS-${materialCode}`,
        description: `Horizontal Stay - ${material}`,
        quantity: horizontalStays,
        unitPrice: 0
      });
    }

    if (verticalStays > 0) {
      bom.supports.push({
        sku: `VS-${materialCode}`,
        description: `Vertical Stay - ${material}`,
        quantity: verticalStays,
        unitPrice: 0
      });
    }
  }

  if (externalSupport) {
    // External I-beam supports
    const iBeamCount = perimeter + 4; // Around perimeter plus corners

    bom.supports.push({
      sku: `IBEAM-${iBeamSize}-${materialCode}`,
      description: `I-Beam ${iBeamSize} - ${material}`,
      quantity: iBeamCount,
      unitPrice: 0
    });

    // Base plates
    bom.supports.push({
      sku: `BASEPLATE-${materialCode}`,
      description: `Base Plate - ${material}`,
      quantity: iBeamCount,
      unitPrice: 0
    });
  }

  // ===========================
  // ACCESSORIES
  // ===========================

  // Water Level Indicator
  if (wliMaterial && wliMaterial !== 'None') {
    bom.accessories.push({
      sku: `WLI-${wliMaterial}`,
      description: `Water Level Indicator - ${wliMaterial}`,
      quantity: 1,
      unitPrice: 0
    });
  }

  // Internal Ladder
  if (internalLadderQty > 0) {
    bom.accessories.push({
      sku: `LADDER-INT-${internalLadderMaterial}`,
      description: `Internal Ladder - ${internalLadderMaterial}`,
      quantity: internalLadderQty,
      unitPrice: 0
    });
  }

  // External Ladder
  if (externalLadderQty > 0) {
    bom.accessories.push({
      sku: `LADDER-EXT-${externalLadderMaterial}`,
      description: `External Ladder - ${externalLadderMaterial}`,
      quantity: externalLadderQty,
      unitPrice: 0
    });

    // Safety cage if external ladder and height > 3m or explicitly requested
    if (safetyCage || height > 3) {
      bom.accessories.push({
        sku: `CAGE-${externalLadderMaterial}`,
        description: `Safety Cage - ${externalLadderMaterial}`,
        quantity: externalLadderQty,
        unitPrice: 0
      });
    }
  }

  // Bolts, Nuts & Washers
  if (bnwMaterial) {
    // Approximate bolt count: 13-20 per panel side depending on material
    const boltsPerSide = material.startsWith('SS') ? 20 : 16;
    const totalBolts = bom.summary.totalPanels * boltsPerSide * 2; // Approximate

    bom.accessories.push({
      sku: `BNW-${bnwMaterial}`,
      description: `Bolts, Nuts & Washers Set - ${bnwMaterial}`,
      quantity: Math.ceil(totalBolts / 100), // Sold in sets of 100
      unitPrice: 0
    });
  }

  // ===========================
  // CALCULATE TOTALS
  // ===========================

  const allPanelItems = [...bom.base, ...bom.walls, ...bom.partition, ...bom.roof];
  const allItems = [...allPanelItems, ...bom.supports, ...bom.accessories];

  bom.summary.totalPanels = allPanelItems.reduce((sum, item) => sum + item.quantity, 0);
  bom.summary.totalCost = allItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

  return bom;
}

// ============================================
// MAIN BOM CALCULATION FUNCTION
// ============================================

/**
 * Main BOM calculation function
 * Routes to FRP or Steel calculation based on material
 */
export function calculateBOM(inputs) {
  const { material } = inputs;

  // FRP uses completely different panel system
  if (material === 'FRP') {
    console.log('📦 Calculating FRP tank BOM...');
    return calculateFRPBOM(inputs);
  }

  // Steel tanks (SS316, SS304, HDG, MS)
  console.log(`📦 Calculating ${material} steel tank BOM...`);
  return calculateSteelBOM(inputs);
}

// ============================================
// LEGACY FUNCTION (kept for compatibility)
// ============================================

/**
 * Get FRP sidewall panel codes based on height
 * @deprecated Use calculateFRPBOM instead which generates correct SKUs
 */
export function getFRPSidewallPanels(heightMeters) {
  // This is the OLD simplified logic - kept for backward compatibility
  // The new calculateFRPBOM function generates proper SKUs
  if (heightMeters <= 1) return ['3S10-FRP'];
  if (heightMeters <= 2) return ['3S20-FRP'];
  if (heightMeters <= 3) return ['3S30-FRP'];
  if (heightMeters <= 4) return ['3S40-FRP', '3S30-FRP', '3S20-FRP', '3S10-FRP'];
  if (heightMeters === 5) return ['3S50-FRP', '3S40-FRP', '3S30-FRP', '3S20-FRP', '3S10-FRP'];
  if (heightMeters >= 6) return ['3S60-FRP', '3S50-FRP', '3S40-FRP', '3S30-FRP', '3S20-FRP', '3S10-FRP'];

  return ['3S10-FRP'];
}
