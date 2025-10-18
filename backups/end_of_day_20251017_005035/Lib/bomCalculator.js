// lib/bomCalculator.js
// Sunnik Tank BOM Calculation Engine - Full SANS 10329:2020 Logic + Support + Bolts

/**
 * Main BOM calculation function
 */
export function calculateBOM(inputs) {
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

  const panelSize = panelType === 'm' ? 1.0 : 1.22;

  // Calculate panel grid
  const lengthPanels = Math.ceil(length / panelSize);
  const widthPanels = Math.ceil(width / panelSize);
  const heightPanels = Math.ceil(height / panelSize);
  const perimeter = 2 * (lengthPanels + widthPanels);

  // Determine which side is shorter (for partition orientation)
  const partitionSpan = Math.min(lengthPanels, widthPanels);

  // Get thickness specification from SANS 10329:2020
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
  bom.summary.totalCost = allItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  bom.summary.supportItems = bom.supports.length;
  bom.summary.accessoryItems = bom.accessories.length;

  return bom;
}

/**
 * Calculate Bolts & Nuts for entire tank
 */
function calculateBoltsAndNuts(lengthPanels, widthPanels, heightPanels, panelType, material) {
  const accessories = [];

  const boltsPerSide = getBoltsPerSide(material, panelType);

  const countEdges = (rows, cols) => {
    return (rows + 1) * cols + rows * (cols + 1);
  };

  const baseEdges = countEdges(lengthPanels, widthPanels);
  const baseBolts = baseEdges * boltsPerSide;
  const roofBolts = baseBolts;

  const lengthWallEdges = countEdges(heightPanels, lengthPanels);
  const lengthWallBolts = lengthWallEdges * boltsPerSide * 2;

  const widthWallEdges = countEdges(heightPanels, widthPanels);
  const widthWallBolts = widthWallEdges * boltsPerSide * 2;

  const totalBolts = baseBolts + roofBolts + lengthWallBolts + widthWallBolts;

  const boltSKU = getBoltSKU(material, panelType);

  accessories.push({
    sku: boltSKU,
    description: `Bolts & Nuts ${getBoltSize(material)} for Panel Connections`,
    quantity: totalBolts,
    unitPrice: 0,
    category: 'accessories',
    breakdown: {
      base: baseBolts,
      roof: roofBolts,
      lengthWalls: lengthWallBolts,
      widthWalls: widthWallBolts
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
    'FRP': { 'm': 10, 'i': 12 }
  };

  return boltsMap[material]?.[panelType] || 16;
}

function getBoltSKU(material, panelType) {
  const skuMap = {
    'SS316': 'BN-M10-25-S2',
    'SS304': 'BN-M10-25-S1',
    'HDG': 'BN-M10-25-HDG',
    'MS': 'BN-M10-25-MS',
    'FRP': 'BN-M10-25-FRP'
  };

  return skuMap[material] || 'BN-M10-25';
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
 * Get thickness by height
 */
function getThicknessByHeight(heightMeters, panelType) {
  const heightMM = heightMeters * 1000;

  if (panelType === 'm') {
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

  return {
    base: 3.0,
    wall: 3.0,
    roof: 1.5,
    tiers: [{ height: 1, thickness: 3.0, code: 'A' }]
  };
}

function generateSKU(panelType, location, thickness, size, material) {
  const thicknessCode = thickness.toString().replace('.', '');
  return `${panelType}${location}${thicknessCode}-${size}-${material}`;
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
  const typeNumber = panelTypeDetail === 'type2' ? '2' : '1';

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
