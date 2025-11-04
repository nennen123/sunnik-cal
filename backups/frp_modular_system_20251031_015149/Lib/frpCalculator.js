// lib/frpCalculator.js
// Comprehensive FRP Tank Calculator with 772 SKU support

/**
 * Calculate FRP Tank BOM with proper panel selection
 */
export function calculateFRPTank(inputs) {
  const {
    length,
    width,
    height,
    partitionCount = 0,
    buildStandard = 'MS1390',
    internalSupport = false
  } = inputs;

  // FRP uses 1m panels exclusively (metric)
  const panelSize = 1.0;
  const lengthPanels = Math.ceil(length / panelSize);
  const widthPanels = Math.ceil(width / panelSize);
  const heightPanels = Math.ceil(height / panelSize);

  // Determine fiberglass content based on build standard
  const fiberglassContent = buildStandard === 'SS245' ? '4' : '3'; // 40% or 35%

  // Determine base depth code (height in decimeters, round to nearest 5)
  const heightDecimeters = Math.ceil(height * 10);
  const baseDepthCode = Math.ceil(heightDecimeters / 5) * 5;

  // Determine sidewall height code (same as base)
  const sidewallHeightCode = baseDepthCode;

  const bom = {
    base: [],
    walls: [],
    partition: [],
    roof: [],
    structural: [],
    accessories: [],
    summary: {
      totalPanels: 0,
      totalCost: 0
    }
  };

  // =====================
  // BASE PANELS
  // =====================
  const basePositions = calculateBasePositions(lengthPanels, widthPanels, baseDepthCode, fiberglassContent);
  bom.base = basePositions;

  // =====================
  // WALL PANELS
  // =====================
  const wallPositions = calculateWallPositions(lengthPanels, widthPanels, heightPanels, sidewallHeightCode, fiberglassContent);
  bom.walls = wallPositions;

  // =====================
  // PARTITION PANELS
  // =====================
  if (partitionCount > 0) {
    const partitionSpan = Math.min(lengthPanels, widthPanels);
    const partitionPositions = calculatePartitionPositions(partitionCount, partitionSpan, heightPanels, sidewallHeightCode, fiberglassContent);
    bom.partition = partitionPositions;
  }

  // =====================
  // ROOF PANELS
  // =====================
  const roofPositions = calculateRoofPositions(lengthPanels, widthPanels, fiberglassContent);
  bom.roof = roofPositions;

  // =====================
  // STRUCTURAL SUPPORT
  // =====================
  const structural = calculateFRPStructural(lengthPanels, widthPanels, height, heightPanels, internalSupport);
  bom.structural = structural;

  // =====================
  // ACCESSORIES
  // =====================
  const accessories = calculateFRPAccessories(length, width, height);
  bom.accessories = accessories;

  // Calculate totals
  const allPanels = [...bom.base, ...bom.walls, ...bom.partition, ...bom.roof];
  bom.summary.totalPanels = allPanels.reduce((sum, item) => sum + item.quantity, 0);

  return bom;
}

/**
 * Calculate base panel positions with corner and edge logic
 */
function calculateBasePositions(lengthPanels, widthPanels, depthCode, fiberContent) {
  const positions = [];
  const baseSKUBase = `${fiberContent}B${depthCode}-FRP`;

  // Count different position types
  let regularCount = 0;
  let cornerBCL = 0;
  let cornerBCR = 0;
  let edgeAB = 0;

  for (let row = 0; row < widthPanels; row++) {
    for (let col = 0; col < lengthPanels; col++) {
      const isCorner = (
        (row === 0 && col === 0) || // Bottom-left
        (row === 0 && col === lengthPanels - 1) || // Bottom-right
        (row === widthPanels - 1 && col === 0) || // Top-left
        (row === widthPanels - 1 && col === lengthPanels - 1) // Top-right
      );

      const isEdge = (
        row === 0 || row === widthPanels - 1 ||
        col === 0 || col === lengthPanels - 1
      );

      if (isCorner) {
        // Alternate between BCL and BCR
        if ((row === 0 && col === 0) || (row === widthPanels - 1 && col === lengthPanels - 1)) {
          cornerBCL++;
        } else {
          cornerBCR++;
        }
      } else if (isEdge) {
        edgeAB++;
      } else {
        regularCount++;
      }
    }
  }

  // Add regular base panels
  if (regularCount > 0) {
    positions.push({
      sku: baseSKUBase,
      description: `FRP Base Panel - B${depthCode} (${fiberContent === '3' ? '35%' : '40%'})`,
      quantity: regularCount,
      unitPrice: 0,
      category: 'base'
    });
  }

  // Add corner panels - BCL
  if (cornerBCL > 0) {
    positions.push({
      sku: `${baseSKUBase}-BCL`,
      description: `FRP Base Corner Panel - B${depthCode} (${fiberContent === '3' ? '35%' : '40%'}) - BCL`,
      quantity: cornerBCL,
      unitPrice: 0,
      category: 'base'
    });
  }

  // Add corner panels - BCR
  if (cornerBCR > 0) {
    positions.push({
      sku: `${baseSKUBase}-BCR`,
      description: `FRP Base Corner Panel - B${depthCode} (${fiberContent === '3' ? '35%' : '40%'}) - BCR`,
      quantity: cornerBCR,
      unitPrice: 0,
      category: 'base'
    });
  }

  // Add edge panels
  if (edgeAB > 0) {
    positions.push({
      sku: `${baseSKUBase}-AB`,
      description: `FRP Base Edge Panel - B${depthCode} (${fiberContent === '3' ? '35%' : '40%'}) - AB`,
      quantity: edgeAB,
      unitPrice: 0,
      category: 'base'
    });
  }

  return positions;
}

/**
 * Calculate wall panel positions with proper location codes
 */
function calculateWallPositions(lengthPanels, widthPanels, heightPanels, heightCode, fiberContent) {
  const positions = [];
  const wallSKUBase = `${fiberContent}S${heightCode}-FRP`;

  // Calculate perimeter
  const perimeter = 2 * (lengthPanels + widthPanels);

  // Count positions: 4 corners + (perimeter-4) regular walls
  const cornerCount = 4;
  const mainWallCount = perimeter - cornerCount;

  // Main wall panels (A type - regular walls)
  if (mainWallCount > 0) {
    positions.push({
      sku: `${wallSKUBase}-A`,
      description: `FRP Sidewall Panel - S${heightCode} (${fiberContent === '3' ? '35%' : '40%'})`,
      quantity: mainWallCount,
      unitPrice: 0,
      category: 'wall'
    });
  }

  // Base tier walls (B type - bottom row)
  if (mainWallCount > 0 && heightPanels > 1) {
    positions.push({
      sku: `${wallSKUBase}-B`,
      description: `FRP Sidewall Panel - S${heightCode} (${fiberContent === '3' ? '35%' : '40%'}) - Base Tier`,
      quantity: Math.floor(mainWallCount / 3),
      unitPrice: 0,
      category: 'wall'
    });
  }

  // Corner panels
  if (cornerCount > 0) {
    positions.push({
      sku: `${wallSKUBase}-BCL`,
      description: `FRP Sidewall Corner - S${heightCode} (${fiberContent === '3' ? '35%' : '40%'}) - BCL`,
      quantity: 2,
      unitPrice: 0,
      category: 'wall'
    });

    positions.push({
      sku: `${wallSKUBase}-BCR`,
      description: `FRP Sidewall Corner - S${heightCode} (${fiberContent === '3' ? '35%' : '40%'}) - BCR`,
      quantity: 2,
      unitPrice: 0,
      category: 'wall'
    });
  }

  return positions;
}

/**
 * Calculate partition panel positions
 */
function calculatePartitionPositions(partitionCount, span, heightPanels, heightCode, fiberContent) {
  const positions = [];

  // Partitions use P-series (0.93m wide) panels
  const partitionSKU = `${fiberContent}P${heightCode}-FRP-A`;
  const totalPartitionPanels = partitionCount * span;

  if (totalPartitionPanels > 0) {
    positions.push({
      sku: partitionSKU,
      description: `FRP Partition Panel - P${heightCode} (${fiberContent === '3' ? '35%' : '40%'}) - 0.93m wide`,
      quantity: totalPartitionPanels,
      unitPrice: 0,
      category: 'partition'
    });
  }

  // Add partition tie rods
  if (partitionCount > 0) {
    positions.push({
      sku: 'TR-FRP-P-SS304',
      description: 'Partition End Fix Tie Rod M10 SS304 - FRP Tank',
      quantity: totalPartitionPanels * 2,
      unitPrice: 0,
      category: 'partition'
    });
  }

  return positions;
}

/**
 * Calculate roof panel positions
 */
function calculateRoofPositions(lengthPanels, widthPanels, fiberContent) {
  const positions = [];
  const totalRoofPanels = lengthPanels * widthPanels;

  // Main roof panels (reserve 3 for manhole and air vents)
  const mainRoofCount = totalRoofPanels - 3;

  if (mainRoofCount > 0) {
    positions.push({
      sku: `${fiberContent}F00-FRP`,
      description: `FRP Flat Roof Panel (${fiberContent === '3' ? '35%' : '40%'})`,
      quantity: mainRoofCount,
      unitPrice: 0,
      category: 'roof'
    });
  }

  // Air vent positions (2 panels replaced with vents)
  positions.push({
    sku: '2R00-FRP',
    description: 'FRP Roof Panel - Air Vent Position',
    quantity: 2,
    unitPrice: 0,
    category: 'roof'
  });

  // Manhole position (1 panel)
  positions.push({
    sku: 'TP000G009',
    description: 'FRP Manhole Panel with Cover',
    quantity: 1,
    unitPrice: 0,
    category: 'roof'
  });

  return positions;
}

/**
 * Calculate FRP structural support components
 */
function calculateFRPStructural(lengthPanels, widthPanels, height, heightPanels, internalSupport) {
  const structural = [];

  // Corner angles (based on tank height) - round to nearest 5
  const heightDecimeters = Math.ceil(height * 10);
  const caCode = Math.ceil(heightDecimeters / 5) * 5; // 30 for 3m height
  const cornerAngleSKU = `CA-${caCode}-FRP`;

  structural.push({
    sku: cornerAngleSKU,
    description: `FRP Corner Angle ${(caCode / 10).toFixed(1)}m Height`,
    quantity: 4, // 4 corners per tank
    unitPrice: 0,
    category: 'structural'
  });

  // Internal support (tie rods) if enabled
  if (internalSupport) {
    const panelSize = 1.0; // FRP uses 1m panels
    const lengthMeters = lengthPanels * panelSize;
    const widthMeters = widthPanels * panelSize;

    // Tie rods for internal support
    const lengthStays = widthPanels - 1;
    const widthStays = lengthPanels - 1;

    if (lengthStays > 0) {
      structural.push({
        sku: `TR-FRP-${Math.round(lengthMeters)}M-SS304`,
        description: `FRP Tie Rod SS304 × ${lengthMeters.toFixed(1)}m - Length Direction`,
        quantity: lengthStays * heightPanels,
        unitPrice: 0,
        category: 'structural'
      });
    }

    if (widthStays > 0) {
      structural.push({
        sku: `TR-FRP-${Math.round(widthMeters)}M-SS304`,
        description: `FRP Tie Rod SS304 × ${widthMeters.toFixed(1)}m - Width Direction`,
        quantity: widthStays * heightPanels,
        unitPrice: 0,
        category: 'structural'
      });
    }
  }

  return structural;
}

/**
 * Calculate FRP accessories
 */
function calculateFRPAccessories(length, width, height) {
  const accessories = [];
  const volume = length * width * height;

  // Air vents (based on volume)
  const airVentCount = volume > 20 ? 2 : 1;
  const airVentSKU = volume > 50 ? 'OA200G001' : 'OA200B001';

  accessories.push({
    sku: airVentSKU,
    description: `Dia Ø${volume > 50 ? '100' : '50'} Air Vent FRP (Grey)(Abs) C/W Gasket - SS304 Mesh`,
    quantity: airVentCount,
    unitPrice: 0,
    category: 'accessories'
  });

  // Internal ladder if height >= 2m
  if (height >= 2) {
    const ladderHeight = Math.ceil(height / 0.5) * 0.5;
    const ladderCode = Math.round(ladderHeight * 10);
    const ladderSKU = `IL-FRP-${ladderCode}M`;

    accessories.push({
      sku: ladderSKU,
      description: `FRP Internal Ladder ${ladderHeight}M`,
      quantity: 1,
      unitPrice: 0,
      category: 'accessories'
    });
  }

  // FRP Bolts & Nuts (SS304)
  const totalPanels = Math.ceil(length * width) + Math.ceil((2 * (length + width)) * height);
  const boltsPerPanel = 4;
  const totalBolts = totalPanels * boltsPerPanel;

  accessories.push({
    sku: 'BN300BBNM10025',
    description: 'Stainless Steel 304 Bolts & Nuts M10 x 25MM',
    quantity: totalBolts,
    unitPrice: 0,
    category: 'accessories'
  });

  // Tank tag
  accessories.push({
    sku: 'SI600S003',
    description: 'FRP Tank Tag 1.6MM x 100MM (L) x 50MM (H)',
    quantity: 1,
    unitPrice: 0,
    category: 'accessories'
  });

  return accessories;
}
