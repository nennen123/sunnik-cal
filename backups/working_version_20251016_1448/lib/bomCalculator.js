// lib/bomCalculator.js
// Sunnik Tank BOM Calculation Engine - Full SANS 10329:2020 Logic

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
      roofThickness = 1.5
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
      summary: {
        totalPanels: 0,
        totalCost: 0
      }
    };

    // Material code mapping
    const materialCode = getMaterialCode(material);

    if (material === 'FRP') {
      // === FRP TANK CALCULATION ===
      return calculateFRPTank(lengthPanels, widthPanels, height, perimeter, panelType);
    }

    // === STEEL TANK CALCULATION ===

    // BASE PANELS
    const baseThickness = thickness.base;

    // Perimeter base panels (B panels)
    bom.base.push({
      sku: generateSKU('1', 'B', baseThickness, panelType, materialCode),
      description: `Base Panel - ${baseThickness}mm`,
      quantity: perimeter,
      unitPrice: 0
    });

    // Corner panels
    bom.base.push({
      sku: generateSKU('1', 'BCL', baseThickness, panelType, materialCode),
      description: `Base Corner Left - ${baseThickness}mm`,
      quantity: 2,
      unitPrice: 0
    });

    bom.base.push({
      sku: generateSKU('1', 'BCR', baseThickness, panelType, materialCode),
      description: `Base Corner Right - ${baseThickness}mm`,
      quantity: 2,
      unitPrice: 0
    });

    // Interior base panels (A panels)
    const interiorBase = (lengthPanels - 2) * (widthPanels - 2);
    if (interiorBase > 0) {
      bom.base.push({
        sku: generateSKU('1', 'A', baseThickness, panelType, materialCode),
        description: `Interior Base Panel - ${baseThickness}mm`,
        quantity: interiorBase,
        unitPrice: 0
      });
    }

    // Partition base support (if partitions exist)
    if (partitionCount > 0) {
      const abPerPartition = Math.max(1, partitionSpan - 4);

      bom.base.push({
        sku: generateSKU('1', 'AB', baseThickness, panelType, materialCode),
        description: `Partition Base Support - ${baseThickness}mm`,
        quantity: abPerPartition * partitionCount,
        unitPrice: 0
      });

      // Additional corner panels for partition intersections
      bom.base.push({
        sku: generateSKU('1', 'BCL', baseThickness, panelType, materialCode),
        description: `Partition Base Corner Left - ${baseThickness}mm`,
        quantity: 2 * partitionCount,
        unitPrice: 0
      });

      bom.base.push({
        sku: generateSKU('1', 'BCR', baseThickness, panelType, materialCode),
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
          sku: generateSKU('1', 'B', tier.thickness, panelType, materialCode),
          description: `Wall Corner Bottom - Tier ${tier.height} - ${tier.thickness}mm`,
          quantity: 4,
          unitPrice: 0
        });

        bom.walls.push({
          sku: generateSKU('1', 'A', tier.thickness, panelType, materialCode),
          description: `Wall Panel - Tier ${tier.height} - ${tier.thickness}mm`,
          quantity: perimeter - 4,
          unitPrice: 0
        });

      } else if (isTop) {
        // Top tier - C corners + B walls
        bom.walls.push({
          sku: generateSKU('1', 'C', tier.thickness, panelType, materialCode),
          description: `Wall Corner Top - Tier ${tier.height} - ${tier.thickness}mm`,
          quantity: 4,
          unitPrice: 0
        });

        bom.walls.push({
          sku: generateSKU('1', 'B', tier.thickness, panelType, materialCode),
          description: `Wall Panel Top - Tier ${tier.height} - ${tier.thickness}mm`,
          quantity: perimeter - 4,
          unitPrice: 0
        });

      } else {
        // Middle tiers - all A panels
        bom.walls.push({
          sku: generateSKU('1', 'A', tier.thickness, panelType, materialCode),
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
          sku: generateSKU('1', 'Cφ', tier.thickness, panelType, materialCode),
          description: `Partition Corner - Tier ${tier.height} - ${tier.thickness}mm`,
          quantity: 2 * partitionCount,
          unitPrice: 0
        });

        // Main partition panels (Bφ)
        const mainPartitionPanels = Math.max(1, partitionSpan - 2);
        bom.partition.push({
          sku: generateSKU('1', 'Bφ', tier.thickness, panelType, materialCode),
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
      sku: `1R${roofThicknessCode}-${panelType}-${materialCode}`,
      description: `Roof Panel - ${roofThickness}mm`,
      quantity: roofCount - 4,
      unitPrice: 0
    });

    // Air vents
    bom.roof.push({
      sku: `1R(AV)${roofThicknessCode}-${panelType}-${materialCode}`,
      description: `Roof Air Vent - ${roofThickness}mm`,
      quantity: 2,
      unitPrice: 0
    });

    // Manholes
    bom.roof.push({
      sku: `1MH${roofThicknessCode}-${panelType}-${materialCode}`,
      description: `Manhole - ${roofThickness}mm`,
      quantity: 2,
      unitPrice: 0
    });

    // Calculate totals
    const allItems = [...bom.base, ...bom.walls, ...bom.partition, ...bom.roof];
    bom.summary.totalPanels = allItems.reduce((sum, item) => sum + item.quantity, 0);
    bom.summary.totalCost = allItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

    return bom;
  }

  /**
   * Get thickness based on SANS 10329:2020 standard
   */
  function getThicknessByHeight(heightMeters, panelType) {
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

  /**
   * Generate SKU code for steel panels
   * Format: 1B45-m-S2 (Type-Location-Thickness-Size-Material)
   */
  function generateSKU(panelType, location, thickness, size, material) {
    const thicknessCode = thickness.toString().replace('.', '');
    return `${panelType}${location}${thicknessCode}-${size}-${material}`;
  }

  /**
   * Get material code
   */
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
   * FRP Tank calculation (simplified for now)
   */
  function calculateFRPTank(lengthPanels, widthPanels, height, perimeter, panelType) {
    const bom = {
      base: [],
      walls: [],
      partition: [],
      roof: [],
      summary: { totalPanels: 0, totalCost: 0 }
    };

    // FRP Base
    const baseCount = lengthPanels * widthPanels;
    const baseDepth = Math.ceil(height / 1) * 10;
    bom.base.push({
      sku: `3B${baseDepth}-FRP`,
      description: `FRP Base Panel - B${baseDepth}`,
      quantity: baseCount,
      unitPrice: 0
    });

    // FRP Sidewalls
    const sidewallHeight = Math.ceil(height / 1) * 10;
    bom.walls.push({
      sku: `3S${sidewallHeight}-FRP-A`,
      description: `FRP Sidewall Panel - S${sidewallHeight}`,
      quantity: perimeter,
      unitPrice: 0
    });

    // FRP Roof
    const roofCount = lengthPanels * widthPanels;
    bom.roof.push({
      sku: '2R00-FRP',
      description: 'FRP Roof Panel',
      quantity: roofCount - 3,
      unitPrice: 0
    });

    const allItems = [...bom.base, ...bom.walls, ...bom.roof];
    bom.summary.totalPanels = allItems.reduce((sum, item) => sum + item.quantity, 0);

    return bom;
  }

  /**
   * Calculate tank volume
   */
  export function calculateVolume(length, width, height) {
    const volumeM3 = length * width * height;
    return {
      cubic_meters: volumeM3,
      liters: volumeM3 * 1000,
      gallons: volumeM3 * 264.172
    };
  }
