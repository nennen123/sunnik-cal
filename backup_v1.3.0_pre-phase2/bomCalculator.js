// app/lib/bomCalculator.js
// Sunnik Tank BOM Calculation Engine
// Version: 1.3.0
// FIXED:
// - BUG-005: FRP Panel Calculation
// - BUG-006: Thickness code format (3.0mm → "3", not "30")
// - BUG-007: 4.5mm doesn't exist, use 5.0mm instead
// - Type 2 Panel Support with tier-based diameter (Ø18 bottom, Ø14 upper)
// - NEW: Build standard-specific thickness (SANS vs BSI/LPCB)
// - NEW: FRP build standard differences (MS1390 vs SS245)
// - NEW: LPCB includes Vortex Pipe as standard
// - BUG-014: Small tank handling (1×1, 2×2, etc. now calculate correctly)
//   - 1×1×1 = 6 panels (was 14), 2×2×1 = 16 panels, 3×3×1 = 30 panels
// - BUG-015: Partition main panels use Math.max(0,...) instead of Math.max(1,...)

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

/**
 * Get FRP build standard specific components
 * MS1390 (Malaysia): EPDM sealant, ABS roof pipe
 * SS245 (Singapore): PVC Foam sealant, UPVC roof pipe
 */
export function getFRPBuildStandardComponents(buildStandard) {
  if (buildStandard === 'SS245') {
    return {
      sealant: 'PVC Foam',
      sealantSKU: 'SEALANT-PVC-FOAM',
      roofPipe: 'UPVC',
      roofPipeSKU: 'ROOF-PIPE-UPVC'
    };
  } else {
    // Default to MS1390
    return {
      sealant: 'EPDM',
      sealantSKU: 'SEALANT-EPDM',
      roofPipe: 'ABS',
      roofPipeSKU: 'ROOF-PIPE-ABS'
    };
  }
}

// ============================================
// THICKNESS CODE HELPER
// ============================================

/**
 * Convert thickness (mm) to SKU code
 * Database format:
 * - Whole numbers: 3.0 → "3", 4.0 → "4", 5.0 → "5", 6.0 → "6"
 * - Half numbers: 2.5 → "25", 1.5 → "15"
 */
function getThicknessCode(thickness) {
  if (thickness % 1 === 0) {
    // Whole number: 3.0 → "3"
    return String(Math.round(thickness));
  } else {
    // Decimal: 2.5 → "25", 1.5 → "15"
    return String(Math.round(thickness * 10));
  }
}

// ============================================
// TYPE 2 DIAMETER HELPER
// ============================================

/**
 * Get diameter code based on tier position for Type 2 panels
 * Based on real Sunnik drawings:
 * - Tier 1 (bottom): Ø18 (larger holes for 5/8" bolts, high water pressure)
 * - Tier 2+: Ø14 (smaller holes for M12 bolts, lower pressure)
 *
 * @param {number} tierIndex - 0-based tier index (0 = bottom)
 * @returns {string} '18' or '14'
 */
function getDiameterForTier(tierIndex) {
  // Bottom tier (index 0) uses Ø18, all others use Ø14
  return tierIndex === 0 ? '18' : '14';
}

// ============================================
// TANK SIZE CATEGORY HELPER (SMALL TANK FIX)
// ============================================

/**
 * Get tank size category for panel calculation adjustments
 * Small tanks need special handling to avoid over-counting panels
 *
 * @param {number} lengthPanels - Number of panels in length
 * @param {number} widthPanels - Number of panels in width
 * @returns {string} 'tiny' (1×N), 'small' (2×N), or 'normal' (3×3+)
 */
function getTankSizeCategory(lengthPanels, widthPanels) {
  const minDim = Math.min(lengthPanels, widthPanels);
  const maxDim = Math.max(lengthPanels, widthPanels);

  // 1×N tanks (including 1×1)
  if (minDim === 1) {
    return 'tiny';
  }

  // 2×N tanks
  if (minDim === 2) {
    return 'small';
  }

  // 3×3 and larger
  return 'normal';
}

// ============================================
// ROOF SUPPORT HELPER FUNCTIONS
// ============================================

/**
 * Get RTS (Roof Tie Support) quantity based on tank dimensions
 * RTS are installed at regular intervals across the roof
 * Rule: 1 RTS per 2 panels in the shorter dimension, minimum 2
 *
 * @param {number} lengthPanels - Number of panels in length
 * @param {number} widthPanels - Number of panels in width
 * @returns {number} Number of RTS required
 */
function getRTSQuantity(lengthPanels, widthPanels) {
  const shorterDim = Math.min(lengthPanels, widthPanels);
  // 1 RTS per 2 panels, minimum 2 for tanks >= 3 panels
  if (shorterDim < 3) return 0; // Small tanks don't need RTS
  return Math.max(2, Math.ceil(shorterDim / 2));
}

/**
 * Get OP Truss size based on span (shorter tank dimension)
 * Larger spans require larger truss sections
 *
 * @param {number} spanPanels - Number of panels to span
 * @param {string} panelType - 'm' (metric 1.0m) or 'i' (imperial 1.22m/4ft)
 * @returns {string} Truss size code (e.g., "100x50", "150x75")
 */
function getOPTrussSize(spanPanels, panelType) {
  const panelSize = panelType === 'm' ? 1.0 : 1.22;
  const spanMeters = spanPanels * panelSize;

  // Size based on span length
  if (spanMeters <= 3) return '100x50';
  if (spanMeters <= 5) return '125x65';
  if (spanMeters <= 7) return '150x75';
  return '200x100'; // Large spans
}

/**
 * Get RTS height based on tank height
 * RTS height matches the internal height of the tank
 *
 * @param {number} heightMeters - Tank height in meters
 * @param {string} panelType - 'm' (metric) or 'i' (imperial)
 * @returns {string} Height code for SKU (e.g., "30M", "12ft")
 */
function getRTSHeight(heightMeters, panelType) {
  if (panelType === 'i') {
    // Imperial: convert to feet
    const heightFeet = Math.round(heightMeters * 3.28084);
    return `${heightFeet}ft`;
  }
  // Metric: round to nearest 0.5m and format
  const rounded = Math.round(heightMeters * 2) / 2;
  const code = Math.round(rounded * 10);
  return `${code}M`;
}

/**
 * Get purlin quantity based on OP truss count and tank length
 * Purlins run perpendicular to trusses, connecting them
 * Rule: 3 purlins per truss (attached to each truss)
 *
 * @param {number} opTrussCount - Number of OP trusses
 * @param {number} lengthPanels - Tank length in panels
 * @returns {number} Number of purlins required
 */
function getPurlinQuantity(opTrussCount, lengthPanels) {
  if (opTrussCount < 2) return 0;
  // 3 purlins per truss
  return opTrussCount * 3;
}

// ============================================
// STEEL PANEL THICKNESS LOGIC
// ============================================

/**
 * Available thicknesses in database:
 * 1.5mm, 2.0mm, 2.5mm, 3.0mm, 4.0mm, 5.0mm, 6.0mm
 * NOTE: 4.5mm does NOT exist - use 5.0mm instead
 */

/**
 * Get panel thickness based on build standard for STEEL tanks
 *
 * SANS 10329:2020: Progressive thickness (thicker at bottom, thinner at top)
 * BSI & LPCB: Simplified (5mm for 1-3 panels, 6mm base for 4+ panels)
 *
 * @param {number} heightMeters - Tank height in meters
 * @param {string} panelType - 'm' (metric) or 'i' (imperial)
 * @param {string} buildStandard - 'SANS', 'BSI', or 'LPCB'
 */
export function getThicknessByHeight(heightMeters, panelType, buildStandard = 'SANS') {
  const panelSize = panelType === 'm' ? 1.0 : 1.22;
  const numTiers = Math.ceil(heightMeters / panelSize);

  console.log(`📐 Calculating thickness for ${heightMeters}m height, ${numTiers} tiers (${panelType === 'm' ? 'Metric' : 'Imperial'}) - ${buildStandard} standard`);

  // BSI and LPCB use simplified thickness logic
  if (buildStandard === 'BSI' || buildStandard === 'LPCB') {
    return getBSILPCBThickness(numTiers, panelType);
  }

  // SANS 10329:2020 uses progressive thickness
  if (panelType === 'm') {
    return getMetricThickness(numTiers);
  } else {
    return getImperialThickness(numTiers);
  }
}

/**
 * BSI & LPCB Thickness Logic:
 * - 1-3 panels height: 5mm for all panels
 * - 4+ panels height: 6mm for base & tier 1, 5mm for the rest
 */
function getBSILPCBThickness(numTiers, panelType) {
  const roof = 1.5;

  if (numTiers <= 3) {
    // 1-3 panels: All 5mm
    const tiers = [];
    for (let i = 1; i <= numTiers; i++) {
      tiers.push({
        height: i,
        thickness: 5.0,
        code: i === numTiers ? 'C' : 'A'
      });
    }
    return { base: 5.0, wall: 5.0, roof, tiers };
  } else {
    // 4+ panels: 6mm base & tier 1, 5mm rest
    const tiers = [];
    for (let i = 1; i <= numTiers; i++) {
      const thickness = (i === 1) ? 6.0 : 5.0;
      tiers.push({
        height: i,
        thickness,
        code: i === numTiers ? 'C' : 'A'
      });
    }
    return { base: 6.0, wall: 6.0, roof, tiers };
  }
}

/**
 * SANS 10329:2020 Metric Thickness Logic (Progressive)
 */
function getMetricThickness(numTiers) {
  switch (numTiers) {
    case 1:
      return { base: 3.0, wall: 3.0, roof: 1.5, tiers: [{ height: 1, thickness: 3.0, code: 'A' }] };
    case 2:
      return { base: 3.0, wall: 3.0, roof: 1.5, tiers: [
        { height: 1, thickness: 3.0, code: 'A' },
        { height: 2, thickness: 3.0, code: 'C' }
      ]};
    case 3:
      return { base: 5.0, wall: 5.0, roof: 1.5, tiers: [
        { height: 1, thickness: 5.0, code: 'A' },
        { height: 2, thickness: 3.0, code: 'A' },
        { height: 3, thickness: 3.0, code: 'C' }
      ]};
    case 4:
      return { base: 5.0, wall: 5.0, roof: 1.5, tiers: [
        { height: 1, thickness: 5.0, code: 'A' },
        { height: 2, thickness: 5.0, code: 'A' },
        { height: 3, thickness: 3.0, code: 'A' },
        { height: 4, thickness: 3.0, code: 'C' }
      ]};
    case 5:
      return { base: 6.0, wall: 6.0, roof: 1.5, tiers: [
        { height: 1, thickness: 6.0, code: 'A' },
        { height: 2, thickness: 5.0, code: 'A' },
        { height: 3, thickness: 5.0, code: 'A' },
        { height: 4, thickness: 3.0, code: 'A' },
        { height: 5, thickness: 3.0, code: 'C' }
      ]};
    default:
      return { base: 6.0, wall: 6.0, roof: 1.5, tiers: [
        { height: 1, thickness: 6.0, code: 'A' },
        { height: 2, thickness: 6.0, code: 'A' },
        { height: 3, thickness: 5.0, code: 'A' },
        { height: 4, thickness: 5.0, code: 'A' },
        { height: 5, thickness: 3.0, code: 'A' },
        { height: 6, thickness: 3.0, code: 'C' }
      ]};
  }
}

/**
 * SANS 10329:2020 Imperial Thickness Logic (Progressive)
 */
function getImperialThickness(numTiers) {
  switch (numTiers) {
    case 1:
      return { base: 2.5, wall: 2.5, roof: 1.5, tiers: [{ height: 1, thickness: 2.5, code: 'A' }] };
    case 2:
      return { base: 3.0, wall: 3.0, roof: 1.5, tiers: [
        { height: 1, thickness: 3.0, code: 'A' },
        { height: 2, thickness: 2.5, code: 'C' }
      ]};
    case 3:
      return { base: 4.0, wall: 4.0, roof: 1.5, tiers: [
        { height: 1, thickness: 4.0, code: 'A' },
        { height: 2, thickness: 3.0, code: 'A' },
        { height: 3, thickness: 2.5, code: 'C' }
      ]};
    case 4:
      return { base: 5.0, wall: 5.0, roof: 1.5, tiers: [
        { height: 1, thickness: 5.0, code: 'A' },
        { height: 2, thickness: 4.0, code: 'A' },
        { height: 3, thickness: 3.0, code: 'A' },
        { height: 4, thickness: 2.5, code: 'C' }
      ]};
    case 5:
      return { base: 6.0, wall: 6.0, roof: 1.5, tiers: [
        { height: 1, thickness: 6.0, code: 'A' },
        { height: 2, thickness: 5.0, code: 'A' },
        { height: 3, thickness: 4.0, code: 'A' },
        { height: 4, thickness: 3.0, code: 'A' },
        { height: 5, thickness: 2.5, code: 'C' }
      ]};
    default:
      return { base: 6.0, wall: 6.0, roof: 1.5, tiers: [
        { height: 1, thickness: 6.0, code: 'A' },
        { height: 2, thickness: 6.0, code: 'A' },
        { height: 3, thickness: 5.0, code: 'A' },
        { height: 4, thickness: 4.0, code: 'A' },
        { height: 5, thickness: 3.0, code: 'A' },
        { height: 6, thickness: 2.5, code: 'C' }
      ]};
  }
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
 *
 * Build Standard Differences:
 * - MS1390 (Malaysia): EPDM sealant, ABS roof pipe
 * - SS245 (Singapore): PVC Foam sealant, UPVC roof pipe
 */
export function calculateFRPBOM(inputs) {
  const {
    length,
    width,
    height,
    buildStandard = 'MS1390',
    partitionCount = 0,
    internalSupport = false,
    externalSupport = false,
    wliMaterial = 'None',
    internalLadderQty = 0,
    internalLadderMaterial = 'HDG',
    externalLadderQty = 0,
    externalLadderMaterial = 'HDG',
    safetyCage = false,
    pipeFittings = [] // Array of pipe fitting configurations
  } = inputs;

  // FRP is ALWAYS metric (1m × 1m panels)
  const panelSize = 1.0;

  // Calculate panel grid
  const lengthPanels = Math.ceil(length / panelSize);
  const widthPanels = Math.ceil(width / panelSize);
  const heightPanels = Math.ceil(height / panelSize);
  const perimeter = 2 * (lengthPanels + widthPanels);

  // Get FRP depth code based on tank height
  const depthCode = getFRPDepthCode(height);
  const { fullTiers, hasHalfTier } = getFRPTiers(height);

  // Determine partition span (shorter side)
  const partitionSpan = Math.min(lengthPanels, widthPanels);

  // Get build standard specific components
  const buildComponents = getFRPBuildStandardComponents(buildStandard);

  // Get tank size category for small tank handling
  const tankSizeCategory = getTankSizeCategory(lengthPanels, widthPanels);

  console.log(`📐 FRP Tank size: ${lengthPanels}×${widthPanels} (${tankSizeCategory})`);

  const bom = {
    base: [],
    walls: [],
    partition: [],
    roof: [],
    roofSupport: [],
    supports: [],
    accessories: [],
    pipeFittings: [],
    summary: {
      totalPanels: 0,
      totalCost: 0,
      buildStandard: buildStandard,
      sealantType: buildComponents.sealant,
      roofPipeType: buildComponents.roofPipe
    }
  };

  // ===========================
  // BASE PANELS (with small tank handling)
  // ===========================

  // Small tank handling for FRP base panels
  if (tankSizeCategory === 'tiny') {
    // 1×N tanks: simple base panels
    bom.base.push({
      sku: `3B${depthCode}-FRP`,
      description: `FRP Base Panel B${depthCode}`,
      quantity: lengthPanels * widthPanels,
      unitPrice: 0
    });
  } else if (tankSizeCategory === 'small') {
    // 2×N tanks: 4 corners + edge panels
    bom.base.push({
      sku: `3B${depthCode}-FRP`,
      description: `FRP Base Panel B${depthCode} - Corner`,
      quantity: 4,
      unitPrice: 0
    });

    const edgePanels = (lengthPanels * widthPanels) - 4;
    if (edgePanels > 0) {
      bom.base.push({
        sku: `3B${depthCode}-FRP`,
        description: `FRP Base Panel B${depthCode} - Edge`,
        quantity: edgePanels,
        unitPrice: 0
      });
    }
  } else {
    // Normal tanks (3×3+): Original logic
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
  }

  // Partition base support (AB panels) - only for normal+ tanks
  if (partitionCount > 0 && tankSizeCategory === 'normal') {
    const partitionBaseCount = partitionSpan * partitionCount;
    bom.base.push({
      sku: `3B${depthCode}-FRP-AB`,
      description: `FRP Base Panel B${depthCode}-AB - Partition Support`,
      quantity: partitionBaseCount,
      unitPrice: 0
    });
  }

  // ===========================
  // SIDEWALL PANELS (with small tank handling)
  // ===========================

  // For each full 1m tier
  for (let tier = 1; tier <= fullTiers; tier++) {
    const tierDepthCode = getFRPDepthCode(height); // Use tank depth for all tiers
    const isBottomTier = (tier === 1);

    // Small tank wall handling for FRP
    if (tankSizeCategory === 'tiny') {
      // 1×N tanks: perimeter walls only, no corner distinction
      bom.walls.push({
        sku: `3S${tierDepthCode}-FRP-B`,
        description: `FRP Sidewall S${tierDepthCode}-B - Tier ${tier}`,
        quantity: perimeter,
        unitPrice: 0
      });
    } else if (tankSizeCategory === 'small') {
      // 2×N tanks: 4 corners + edge walls
      bom.walls.push({
        sku: `3S${tierDepthCode}-FRP-BCL`,
        description: `FRP Sidewall S${tierDepthCode}-BCL - Tier ${tier} Corner Left`,
        quantity: 2,
        unitPrice: 0
      });

      bom.walls.push({
        sku: `3S${tierDepthCode}-FRP-BCR`,
        description: `FRP Sidewall S${tierDepthCode}-BCR - Tier ${tier} Corner Right`,
        quantity: 2,
        unitPrice: 0
      });

      const edgeWalls = perimeter - 4;
      if (edgeWalls > 0) {
        if (isBottomTier) {
          bom.walls.push({
            sku: `3S${tierDepthCode}-FRP-B`,
            description: `FRP Sidewall S${tierDepthCode}-B - Tier ${tier} (Structural)`,
            quantity: edgeWalls,
            unitPrice: 0
          });
        } else {
          bom.walls.push({
            sku: `3S${tierDepthCode}-FRP-A`,
            description: `FRP Sidewall S${tierDepthCode}-A - Tier ${tier}`,
            quantity: edgeWalls,
            unitPrice: 0
          });
        }
      }
    } else {
      // Normal tanks (3×3+): Original logic
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
  }

  // Half tier (if tank height has 0.5m component, e.g., 3.5m)
  if (hasHalfTier) {
    bom.walls.push({
      sku: `3D15-FRP`,
      description: `FRP Half Panel D15 - Top Half Tier`,
      quantity: perimeter,
      unitPrice: 0
    });
  }

  // ===========================
  // PARTITION PANELS (if partitions exist)
  // ===========================

  if (partitionCount > 0) {
    for (let tier = 1; tier <= fullTiers; tier++) {
      const tierDepthCode = getFRPDepthCode(height);

      // Partition corner panels (P-BCL, P-BCR)
      bom.partition.push({
        sku: `3P${tierDepthCode}-FRP-BCL`,
        description: `FRP Partition P${tierDepthCode}-BCL - Tier ${tier} Corner Left`,
        quantity: partitionCount,
        unitPrice: 0
      });

      bom.partition.push({
        sku: `3P${tierDepthCode}-FRP-BCR`,
        description: `FRP Partition P${tierDepthCode}-BCR - Tier ${tier} Corner Right`,
        quantity: partitionCount,
        unitPrice: 0
      });

      // Partition main panels (only if partitionSpan > 2)
      const mainPartitionCount = Math.max(0, partitionSpan - 2) * partitionCount;
      if (mainPartitionCount > 0) {
        bom.partition.push({
          sku: `3P${tierDepthCode}-FRP`,
          description: `FRP Partition P${tierDepthCode} - Tier ${tier}`,
          quantity: mainPartitionCount,
          unitPrice: 0
        });
      }
    }
  }

  // ===========================
  // ROOF PANELS (with small tank handling)
  // ===========================

  const roofCount = lengthPanels * widthPanels;

  // Small tank roof handling for FRP
  if (tankSizeCategory === 'tiny' || tankSizeCategory === 'small') {
    // Small tanks: minimal roof panels with 1 manhole
    const manholeCount = roofCount <= 2 ? 1 : Math.min(2, roofCount - 1);
    const mainRoofPanels = Math.max(0, roofCount - manholeCount);

    if (mainRoofPanels > 0) {
      bom.roof.push({
        sku: `3R00-FRP`,
        description: `FRP Roof Panel R00`,
        quantity: mainRoofPanels,
        unitPrice: 0
      });
    }

    // Manholes
    bom.roof.push({
      sku: `3MH-FRP`,
      description: `FRP Manhole`,
      quantity: manholeCount,
      unitPrice: 0
    });
  } else {
    // Normal tanks (3×3+): Original logic
    // Main roof panels
    bom.roof.push({
      sku: `3R00-FRP`,
      description: `FRP Roof Panel R00`,
      quantity: roofCount - 2, // minus manholes
      unitPrice: 0
    });

    // Manholes (standard 2 per tank)
    bom.roof.push({
      sku: `3MH-FRP`,
      description: `FRP Manhole`,
      quantity: 2,
      unitPrice: 0
    });
  }

  // ===========================
  // ROOF SUPPORT (FRP)
  // ===========================

  // FRP roof support uses ABS or UPVC supports based on build standard
  // Only needed for tanks 3×3 and larger
  if (tankSizeCategory === 'normal') {
    // Roof support material based on build standard
    const roofSupportMaterial = buildStandard === 'SS245' ? 'UPVC' : 'ABS';

    // ABS/UPVC Roof Support Beams - span the shorter dimension
    const roofSupportQty = Math.max(2, Math.floor(lengthPanels / 2));
    bom.roofSupport.push({
      sku: `ROOF-SUPPORT-${roofSupportMaterial}-${widthPanels}M`,
      description: `${roofSupportMaterial} Roof Support Beam - ${widthPanels}m span`,
      quantity: roofSupportQty,
      unitPrice: 0
    });

    // Plate Brackets - connect roof supports to roof panels
    const plateBracketQty = roofSupportQty * 2; // 2 brackets per support beam
    bom.roofSupport.push({
      sku: `PLATE-BRACKET-${roofSupportMaterial}`,
      description: `${roofSupportMaterial} Plate Bracket`,
      quantity: plateBracketQty,
      unitPrice: 0
    });

    console.log(`   → FRP Roof Support: ${roofSupportQty}× ${roofSupportMaterial} beams, ${plateBracketQty}× brackets`);
  }

  // ===========================
  // BUILD STANDARD SPECIFIC ITEMS
  // ===========================

  // Sealant based on build standard
  const totalPanelJoints = (lengthPanels * widthPanels) + (perimeter * heightPanels);
  bom.accessories.push({
    sku: buildComponents.sealantSKU,
    description: `${buildComponents.sealant} Sealant - ${buildStandard} Standard`,
    quantity: Math.ceil(totalPanelJoints / 10), // Estimate: 1 roll per 10 joints
    unitPrice: 0
  });

  // Roof Pipe based on build standard
  bom.accessories.push({
    sku: buildComponents.roofPipeSKU,
    description: `${buildComponents.roofPipe} Roof Pipe - ${buildStandard} Standard`,
    quantity: Math.ceil(perimeter / 2), // Estimate based on perimeter
    unitPrice: 0
  });

  // Roof Brackets (ABS for FRP)
  bom.accessories.push({
    sku: `ROOF-BRACKET-ABS`,
    description: `ABS Roof Bracket`,
    quantity: perimeter * 2,
    unitPrice: 0
  });

  // ===========================
  // SUPPORT STRUCTURES (FRP - Internal Only)
  // ===========================

  if (internalSupport) {
    // FRP uses SS304 internal brackets (not SS316)
    const bracketCount = (lengthPanels - 1) * (widthPanels - 1) * heightPanels;
    bom.supports.push({
      sku: `INT-BRACKET-SS304-FRP`,
      description: `Internal Bracket SS304 (FRP Tank)`,
      quantity: bracketCount,
      unitPrice: 0
    });

    // Internal tie rods
    const tieRodCount = (lengthPanels + widthPanels) * heightPanels;
    bom.supports.push({
      sku: `TIE-ROD-SS304-FRP`,
      description: `Tie Rod SS304 (FRP Tank)`,
      quantity: tieRodCount,
      unitPrice: 0
    });
  }

  // Note: FRP does NOT support external I-beam support
  if (externalSupport) {
    console.warn('⚠️ FRP tanks do not support external I-beam structures');
  }

  // ===========================
  // ACCESSORIES
  // ===========================

  // Water Level Indicator
  if (wliMaterial && wliMaterial !== 'None') {
    const wliHeightCode = Math.round(height * 10) + 'M';
    bom.accessories.push({
      sku: `WLI-BT-${wliHeightCode}`,
      description: `Water Level Indicator - Ball Type ${height}M`,
      quantity: 1,
      unitPrice: 0
    });
  }

  // Internal Ladder (FRP tanks use FRP or HDG ladders, not SS316)
  if (internalLadderQty > 0) {
    const ladderMat = internalLadderMaterial === 'FRP' ? 'FRP' : 'HDG';
    const ladderHeightCode = Math.round(height * 10) + 'M';
    bom.accessories.push({
      sku: `IL-${ladderMat}-${ladderHeightCode}`,
      description: `Internal Ladder - ${ladderMat} ${ladderHeightCode}`,
      quantity: internalLadderQty,
      unitPrice: 0
    });
  }

  // External Ladder (HDG only for FRP tanks)
  if (externalLadderQty > 0) {
    const ladderHeightCode = Math.round(height * 10) + 'M';
    bom.accessories.push({
      sku: `EL-HDG-${ladderHeightCode}`,
      description: `External Ladder - HDG ${ladderHeightCode}`,
      quantity: externalLadderQty,
      unitPrice: 0
    });

    // Safety Cage
    if (safetyCage || height > 3) {
      const cageHeightCode = Math.round(height * 10) + 'm';
      bom.accessories.push({
        sku: `SafetyCage-${cageHeightCode}-HDG`,
        description: `Safety Cage - HDG ${cageHeightCode}`,
        quantity: externalLadderQty,
        unitPrice: 0
      });
    }
  }

  // Bolts for FRP (13 per panel side, HDG or SS304)
  const totalPanels = roofCount + (perimeter * heightPanels) + (lengthPanels * widthPanels);
  const boltCount = totalPanels * 13 * 2; // 13 bolts per side, 2 sides
  bom.accessories.push({
    sku: `BNW-HDG-FRP`,
    description: `Bolts, Nuts & Washers - HDG for FRP (${boltCount} pcs approx)`,
    quantity: Math.ceil(boltCount / 100),
    unitPrice: 0
  });

  // ===========================
  // PIPE FITTINGS
  // ===========================

  if (pipeFittings && pipeFittings.length > 0) {
    pipeFittings.forEach(pf => {
      // Generate SKU based on fitting configuration
      const typeCode = pf.outsideItem === 'D/F Nozzle' ? 'DF' :
                       pf.outsideItem === 'S/F Nozzle' ? 'SF' : 'FL';
      const flangeCode = pf.flangeType.replace(/\s+/g, '');

      bom.pipeFittings.push({
        sku: `${pf.size}${typeCode}-${flangeCode}-${pf.outsideMaterial}`,
        description: `${pf.opening} - ${pf.size}mm ${pf.flangeType} | Outside: ${pf.outsideMaterial} ${pf.outsideItem} | Inside: ${pf.insideMaterial} ${pf.insideItem}`,
        quantity: pf.quantity,
        unitPrice: 0
      });
    });

    console.log(`   → ${pipeFittings.length} pipe fitting(s) added to FRP BOM`);
  }

  // ===========================
  // CALCULATE TOTALS
  // ===========================

  const allPanelItems = [...bom.base, ...bom.walls, ...bom.partition, ...bom.roof];
  const allItems = [...allPanelItems, ...bom.roofSupport, ...bom.supports, ...bom.accessories, ...bom.pipeFittings];

  bom.summary.totalPanels = allPanelItems.reduce((sum, item) => sum + item.quantity, 0);
  bom.summary.totalCost = allItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

  console.log(`📦 FRP BOM calculated: ${buildStandard} standard`);
  console.log(`   → Sealant: ${buildComponents.sealant}, Roof Pipe: ${buildComponents.roofPipe}`);

  return bom;
}

// ============================================
// STEEL PANEL SKU GENERATION (Type 1 & Type 2)
// ============================================

/**
 * Generate SKU code for steel panels
 * Supports both Type 1 and Type 2 formats
 *
 * Type 1 Format: 1[Location][Thickness]-[Size]-[Material]
 *   Example: 1A3-m-S1 (A panel, 3mm, Metric, SS304)
 *
 * Type 2 Format (ALL materials): 2[Location][Thickness]-[Size]-[Diameter]-[Material]
 *   SS316: 2A3-m-18-S2 (A panel, 3mm, Metric, Ø18, SS316)
 *   SS304: 2A3-m-14-S1 (A panel, 3mm, Metric, Ø14, SS304)
 *   HDG:   2A45-i-14-HDG (A panel, 4.5mm, Imperial, Ø14, HDG)
 *   MS:    2A5-m-18-MS (A panel, 5mm, Metric, Ø18, MS)
 *
 * FIXED: Uses correct thickness code format (BUG-006)
 * - 3.0mm → "3" (not "30")
 * - 2.5mm → "25"
 *
 * @param {string} panelType - '1' or '2' (Type 1 or Type 2)
 * @param {string} location - 'A', 'B', 'C', 'AB', 'BCL', 'BCR', etc.
 * @param {number} thickness - 2.5, 3.0, 4.0, 5.0, etc.
 * @param {string} size - 'm' or 'i' (Metric or Imperial)
 * @param {string} material - 'S2' (SS316), 'S1' (SS304), 'HDG', 'MS'
 * @param {string|null} diameter - '14' or '18' (required for Type 2)
 * @returns {string} Generated SKU
 */
export function generateSteelSKU(panelType, location, thickness, size, material, diameter = null) {
  const thicknessCode = getThicknessCode(thickness);

  // Type 1: Simple format without diameter
  if (panelType === '1' || panelType === 1) {
    return `1${location}${thicknessCode}-${size}-${material}`;
  }

  // Type 2: ALL materials include diameter code
  // Format: 2[Location][Thickness]-[Size]-[Diameter]-[Material]
  // Examples from database:
  //   SS316: 2A3-m-18-S2
  //   SS304: 2A3-m-14-S1
  //   HDG:   2A45-i-14-HDG
  //   MS:    2A5-m-18-MS
  if (diameter) {
    return `2${location}${thicknessCode}-${size}-${diameter}-${material}`;
  }

  // Fallback: If no diameter provided for Type 2, use Ø18 as default
  return `2${location}${thicknessCode}-${size}-18-${material}`;
}

// ============================================
// STEEL PANEL CALCULATION (Type 1 & Type 2)
// ============================================

/**
 * Calculate Steel tank BOM (SS316, SS304, HDG, MS)
 * Supports both Type 1 and Type 2 panels
 * Supports different build standards (SANS, BSI, LPCB)
 */
export function calculateSteelBOM(inputs) {
  const {
    length,
    width,
    height,
    panelType = 'm', // 'm' or 'i'
    panelTypeDetail = 1, // 1 or 2 (Type 1 or Type 2)
    steelType = '1', // Alternative field name for panelTypeDetail
    material = 'SS316', // 'SS316', 'SS304', 'HDG', 'MS'
    buildStandard = 'SANS', // 'SANS', 'BSI', 'LPCB'
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
    bnwMaterial = 'HDG',
    pipeFittings = [] // Array of pipe fitting configurations
  } = inputs;

  // Determine panel type detail (support both field names)
  const typeDetail = panelTypeDetail || parseInt(steelType) || 1;
  const typePrefix = String(typeDetail);
  const isType2 = typeDetail === 2 || typeDetail === '2';

  const panelSize = panelType === 'm' ? 1.0 : 1.22;

  // Calculate panel grid
  const lengthPanels = Math.ceil(length / panelSize);
  const widthPanels = Math.ceil(width / panelSize);
  const heightPanels = Math.ceil(height / panelSize);
  const perimeter = 2 * (lengthPanels + widthPanels);

  // Determine which side is shorter (for partition orientation)
  const partitionSpan = Math.min(lengthPanels, widthPanels);

  // Get thickness specification based on build standard
  const thickness = getThicknessByHeight(height, panelType, buildStandard);
  const totalTiers = thickness.tiers.length;

  const bom = {
    base: [],
    walls: [],
    partition: [],
    roof: [],
    roofSupport: [],
    supports: [],
    accessories: [],
    pipeFittings: [],
    summary: {
      totalPanels: 0,
      totalCost: 0,
      buildStandard: buildStandard
    }
  };

  // Material code mapping
  const materialCode = {
    'SS316': 'S2',
    'SS304': 'S1',
    'HDG': 'HDG',
    'MS': 'MS'
  }[material] || 'S2';

  // For Type 2, base panels use Ø18 (bottom = high pressure)
  const baseDiameter = isType2 ? '18' : null;

  // ===========================
  // BASE PANELS (with small tank handling)
  // ===========================

  const baseThickness = thickness.base;
  const tankSizeCategory = getTankSizeCategory(lengthPanels, widthPanels);
  const baseSKU = generateSteelSKU(typePrefix, 'B', baseThickness, panelType, materialCode, baseDiameter);

  console.log(`📐 Tank size: ${lengthPanels}×${widthPanels} (${tankSizeCategory})`);

  // Small tank handling: Adjust base panel counts to avoid over-counting
  if (tankSizeCategory === 'tiny') {
    // 1×N tanks: Only base panels, no corners needed (all edges are perimeter)
    // 1×1 = 1 base panel, 1×2 = 2 base panels, etc.
    bom.base.push({
      sku: baseSKU,
      description: `Base Panel - ${baseThickness}mm${isType2 ? ' [Type 2]' : ''} (${buildStandard})`,
      quantity: lengthPanels * widthPanels,
      unitPrice: 0
    });
  } else if (tankSizeCategory === 'small') {
    // 2×N tanks: 4 corners + edge panels only (no interior)
    // 2×2 = 4 panels (all corners), 2×3 = 6 panels, 2×4 = 8 panels
    bom.base.push({
      sku: generateSteelSKU(typePrefix, 'BCL', baseThickness, panelType, materialCode, baseDiameter),
      description: `Base Corner Left - ${baseThickness}mm${isType2 ? ' [Type 2]' : ''}`,
      quantity: 2,
      unitPrice: 0
    });

    bom.base.push({
      sku: generateSteelSKU(typePrefix, 'BCR', baseThickness, panelType, materialCode, baseDiameter),
      description: `Base Corner Right - ${baseThickness}mm${isType2 ? ' [Type 2]' : ''}`,
      quantity: 2,
      unitPrice: 0
    });

    // Edge panels (total - 4 corners)
    const edgePanels = (lengthPanels * widthPanels) - 4;
    if (edgePanels > 0) {
      bom.base.push({
        sku: baseSKU,
        description: `Base Panel - ${baseThickness}mm${isType2 ? ' [Type 2]' : ''} (${buildStandard})`,
        quantity: edgePanels,
        unitPrice: 0
      });
    }
  } else {
    // Normal tanks (3×3+): Base = L×W panels
    // 4 corners + edge panels (edges not corners) + interior panels
    // Total should equal lengthPanels × widthPanels

    // Corner panels (4 total: 2 BCL + 2 BCR)
    bom.base.push({
      sku: generateSteelSKU(typePrefix, 'BCL', baseThickness, panelType, materialCode, baseDiameter),
      description: `Base Corner Left - ${baseThickness}mm${isType2 ? ' [Type 2]' : ''}`,
      quantity: 2,
      unitPrice: 0
    });

    bom.base.push({
      sku: generateSteelSKU(typePrefix, 'BCR', baseThickness, panelType, materialCode, baseDiameter),
      description: `Base Corner Right - ${baseThickness}mm${isType2 ? ' [Type 2]' : ''}`,
      quantity: 2,
      unitPrice: 0
    });

    // Edge panels (perimeter minus corners)
    // Edges = 2*(L-2) + 2*(W-2) = perimeter - 4 - 4 = 2*(L+W) - 8
    const edgeBaseCount = 2 * (lengthPanels - 2) + 2 * (widthPanels - 2);
    if (edgeBaseCount > 0) {
      bom.base.push({
        sku: baseSKU,
        description: `Base Panel - ${baseThickness}mm${isType2 ? ' [Type 2]' : ''} (${buildStandard})`,
        quantity: edgeBaseCount,
        unitPrice: 0
      });
    }

    // Interior base panels
    const interiorBaseCount = Math.max(0, (lengthPanels - 2) * (widthPanels - 2));
    if (interiorBaseCount > 0) {
      bom.base.push({
        sku: generateSteelSKU(typePrefix, 'A', baseThickness, panelType, materialCode, baseDiameter),
        description: `Interior Base Panel - ${baseThickness}mm${isType2 ? ' [Type 2]' : ''}`,
        quantity: interiorBaseCount,
        unitPrice: 0
      });
    }
  }

  // Partition base support
  if (partitionCount > 0) {
    bom.base.push({
      sku: generateSteelSKU(typePrefix, 'AB', baseThickness, panelType, materialCode, baseDiameter),
      description: `Partition Base Support - ${baseThickness}mm${isType2 ? ' [Type 2]' : ''}`,
      quantity: partitionSpan * partitionCount,
      unitPrice: 0
    });

    // Partition corner supports
    bom.base.push({
      sku: generateSteelSKU(typePrefix, 'BCL', baseThickness, panelType, materialCode, baseDiameter),
      description: `Partition Corner Left - ${baseThickness}mm${isType2 ? ' [Type 2]' : ''}`,
      quantity: partitionCount,
      unitPrice: 0
    });

    bom.base.push({
      sku: generateSteelSKU(typePrefix, 'BCR', baseThickness, panelType, materialCode, baseDiameter),
      description: `Partition Corner Right - ${baseThickness}mm${isType2 ? ' [Type 2]' : ''}`,
      quantity: partitionCount,
      unitPrice: 0
    });
  }

  // ===========================
  // WALL PANELS (by tier, with small tank handling)
  // ===========================

  thickness.tiers.forEach((tier, index) => {
    const isBottom = index === 0;
    const isTop = index === thickness.tiers.length - 1;

    // For Type 2, determine diameter based on tier position
    // Bottom tier (index 0) = Ø18, upper tiers = Ø14
    const tierDiameter = isType2 ? getDiameterForTier(index) : null;

    // Small tank wall handling
    if (tankSizeCategory === 'tiny') {
      // 1×N tanks: perimeter walls only, no corner distinction
      // 1×1 = 4 walls, 1×2 = 6 walls, etc.
      bom.walls.push({
        sku: generateSteelSKU(typePrefix, tier.code, tier.thickness, panelType, materialCode, tierDiameter),
        description: `Wall Panel - Tier ${tier.height} - ${tier.thickness}mm${isType2 ? ` [Ø${tierDiameter}]` : ''} (${buildStandard})`,
        quantity: perimeter,
        unitPrice: 0
      });
    } else if (tankSizeCategory === 'small') {
      // 2×N tanks: 4 corners + edge walls
      // 2×2 = 4 corners + 4 edges = 8 walls per tier
      bom.walls.push({
        sku: generateSteelSKU(typePrefix, 'B', tier.thickness, panelType, materialCode, tierDiameter),
        description: `Wall Corner - Tier ${tier.height} - ${tier.thickness}mm${isType2 ? ` [Ø${tierDiameter}]` : ''} (${buildStandard})`,
        quantity: 4,
        unitPrice: 0
      });

      const edgeWalls = perimeter - 4;
      if (edgeWalls > 0) {
        bom.walls.push({
          sku: generateSteelSKU(typePrefix, tier.code, tier.thickness, panelType, materialCode, tierDiameter),
          description: `Wall Panel - Tier ${tier.height} - ${tier.thickness}mm${isType2 ? ` [Ø${tierDiameter}]` : ''} (${buildStandard})`,
          quantity: edgeWalls,
          unitPrice: 0
        });
      }
    } else {
      // Normal tanks (3×3+): Original logic
      if (isBottom) {
        // Bottom tier corners
        bom.walls.push({
          sku: generateSteelSKU(typePrefix, 'B', tier.thickness, panelType, materialCode, tierDiameter),
          description: `Wall Corner Bottom - Tier ${tier.height} - ${tier.thickness}mm${isType2 ? ` [Ø${tierDiameter}]` : ''} (${buildStandard})`,
          quantity: 4,
          unitPrice: 0
        });

        // Bottom tier main walls
        bom.walls.push({
          sku: generateSteelSKU(typePrefix, tier.code, tier.thickness, panelType, materialCode, tierDiameter),
          description: `Wall Panel - Tier ${tier.height} - ${tier.thickness}mm${isType2 ? ` [Ø${tierDiameter}]` : ''} (${buildStandard})`,
          quantity: perimeter - 4,
          unitPrice: 0
        });

      } else if (isTop) {
        // Top tier corners
        bom.walls.push({
          sku: generateSteelSKU(typePrefix, tier.code, tier.thickness, panelType, materialCode, tierDiameter),
          description: `Wall Corner Top - Tier ${tier.height} - ${tier.thickness}mm${isType2 ? ` [Ø${tierDiameter}]` : ''} (${buildStandard})`,
          quantity: 4,
          unitPrice: 0
        });

        // Top tier main walls
        bom.walls.push({
          sku: generateSteelSKU(typePrefix, 'B', tier.thickness, panelType, materialCode, tierDiameter),
          description: `Wall Panel Top - Tier ${tier.height} - ${tier.thickness}mm${isType2 ? ` [Ø${tierDiameter}]` : ''} (${buildStandard})`,
          quantity: perimeter - 4,
          unitPrice: 0
        });

      } else {
        // Middle tiers - all A panels
        bom.walls.push({
          sku: generateSteelSKU(typePrefix, tier.code, tier.thickness, panelType, materialCode, tierDiameter),
          description: `Wall Panel - Tier ${tier.height} - ${tier.thickness}mm${isType2 ? ` [Ø${tierDiameter}]` : ''} (${buildStandard})`,
          quantity: perimeter,
          unitPrice: 0
        });
      }
    }
  });

  // ===========================
  // PARTITION WALLS (if partitions exist)
  // ===========================

  if (partitionCount > 0) {
    // NOTE: Partition panels use ¢ (cent) symbol
    // Partitions use Type 1 format even when tank is Type 2
    // because Type 2 partition SKUs may not exist in database

    thickness.tiers.forEach(tier => {
      const thicknessCode = getThicknessCode(tier.thickness);

      // Corner partition panels (C¢)
      bom.partition.push({
        sku: `1C¢${thicknessCode}-${panelType}-${materialCode}`,
        description: `Partition Corner - Tier ${tier.height} - ${tier.thickness}mm`,
        quantity: 2 * partitionCount,
        unitPrice: 0
      });

      // Main partition panels (B¢) - only if partitionSpan > 2
      const mainPartitionPanels = Math.max(0, partitionSpan - 2);
      if (mainPartitionPanels > 0) {
        bom.partition.push({
          sku: `1B¢${thicknessCode}-${panelType}-${materialCode}`,
          description: `Partition Wall - Tier ${tier.height} - ${tier.thickness}mm`,
          quantity: mainPartitionPanels * partitionCount,
          unitPrice: 0
        });
      }
    });
  }

  // ===========================
  // ROOF PANELS (with small tank handling)
  // ===========================

  // Roof panels use Type 1 format regardless of steelType
  // (Roof panels don't have diameter codes)
  const roofCount = lengthPanels * widthPanels;
  const roofThicknessCode = getThicknessCode(roofThickness);

  // Small tank roof handling
  if (tankSizeCategory === 'tiny' || tankSizeCategory === 'small') {
    // Small tanks: roof = base area (L×W panels)
    // Just use standard roof panels + 1 manhole
    // Total roof panels = roofCount (all standard, 1 is a manhole)
    const manholeQty = 1; // Always 1 manhole for small tanks
    const mainRoofPanels = Math.max(0, roofCount - manholeQty);

    if (mainRoofPanels > 0) {
      bom.roof.push({
        sku: `1R${roofThicknessCode}-${panelType}-${materialCode}`,
        description: `Roof Panel - ${roofThickness}mm`,
        quantity: mainRoofPanels,
        unitPrice: 0
      });
    }

    // Manhole (always 1 for small tanks)
    bom.roof.push({
      sku: `1MH${roofThicknessCode}-${panelType}-${materialCode}`,
      description: `Manhole - ${roofThickness}mm`,
      quantity: manholeQty,
      unitPrice: 0
    });
  } else {
    // Normal tanks (3×3+): Original logic
    bom.roof.push({
      sku: `1R${roofThicknessCode}-${panelType}-${materialCode}`,
      description: `Roof Panel - ${roofThickness}mm`,
      quantity: roofCount - 4, // Main panels minus special panels
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
  }

  // ===========================
  // ROOF SUPPORT (Steel)
  // ===========================

  // Steel roof support: OP Truss, Purlins, RTS (Roof Tie Support)
  // Only for normal tanks (3×3+)
  if (tankSizeCategory === 'normal') {
    // Calculate spans - trusses span the shorter dimension
    const trussSpan = Math.min(lengthPanels, widthPanels);
    const trussLength = Math.max(lengthPanels, widthPanels);

    // OP Truss - main structural supports spanning the tank
    // Rule: 1 truss per 3 panels of length, minimum 2
    const opTrussCount = Math.max(2, Math.ceil(trussLength / 3));
    const trussSize = getOPTrussSize(trussSpan, panelType);

    bom.roofSupport.push({
      sku: `OP-TRUSS-${trussSize}-${materialCode}`,
      description: `OP Truss ${trussSize} - ${material}`,
      quantity: opTrussCount,
      unitPrice: 0
    });

    // Purlins - run perpendicular to trusses, 3 per bay
    const purlinCount = getPurlinQuantity(opTrussCount, trussLength);
    if (purlinCount > 0) {
      bom.roofSupport.push({
        sku: `PURLIN-${materialCode}`,
        description: `Purlin - ${material}`,
        quantity: purlinCount,
        unitPrice: 0
      });
    }

    // RTS (Roof Tie Support) - vertical supports from roof to internal structure
    const rtsCount = getRTSQuantity(lengthPanels, widthPanels);
    if (rtsCount > 0) {
      const rtsHeightCode = getRTSHeight(height, panelType);
      bom.roofSupport.push({
        sku: `RTS-${rtsHeightCode}-${materialCode}`,
        description: `Roof Tie Support ${rtsHeightCode} - ${material}`,
        quantity: rtsCount,
        unitPrice: 0
      });
    }

    console.log(`   → Roof Support: ${opTrussCount}× OP Truss (${trussSize}), ${purlinCount}× Purlins, ${rtsCount}× RTS`);
  }

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

  // Helper function to get ladder height code
  const getLadderHeightCode = (heightMeters, isPanelTypeImperial) => {
    if (isPanelTypeImperial) {
      // Convert to feet and round to nearest standard size (4, 6, 8, 10, 12, 14, 16)
      const heightFeet = Math.round(heightMeters * 3.28084);
      const standardFeet = [4, 6, 8, 10, 12, 14, 16];
      const closest = standardFeet.reduce((prev, curr) =>
        Math.abs(curr - heightFeet) < Math.abs(prev - heightFeet) ? curr : prev
      );
      return `${closest}ft`;
    } else {
      // Metric: round to nearest 0.5m and format as 10M, 15M, 20M, etc.
      const rounded = Math.round(heightMeters * 2) / 2;
      const code = Math.round(rounded * 10);
      return `${code}M`;
    }
  };

  // Helper function to get ladder material code for database
  const getLadderMaterialCode = (selectedMaterial) => {
    // Database has: HDG, FRP, SS304 (no SS316 ladders)
    // If SS316 selected, use SS304 as fallback
    if (selectedMaterial === 'SS316') return 'SS304';
    if (selectedMaterial === 'SS304') return 'SS304';
    if (selectedMaterial === 'FRP') return 'FRP';
    return 'HDG'; // Default to HDG
  };

  const ladderHeightCode = getLadderHeightCode(height, panelType === 'i');
  const isImperial = panelType === 'i';

  // Water Level Indicator - format: WLI-BT-{height}M (Ball Type, height-based)
  if (wliMaterial && wliMaterial !== 'None') {
    const wliHeightCode = Math.round(height * 10) + 'M'; // 3m -> 30M
    bom.accessories.push({
      sku: `WLI-BT-${wliHeightCode}`,
      description: `Water Level Indicator - Ball Type ${height}M`,
      quantity: 1,
      unitPrice: 0
    });
  }

  // Internal Ladder - format: IL-{material}-{height}M or IL-{material}-{height}ft
  if (internalLadderQty > 0) {
    const ladderMat = getLadderMaterialCode(internalLadderMaterial);
    bom.accessories.push({
      sku: `IL-${ladderMat}-${ladderHeightCode}`,
      description: `Internal Ladder - ${ladderMat} ${ladderHeightCode}`,
      quantity: internalLadderQty,
      unitPrice: 0
    });
  }

  // External Ladder - format: EL-{material}-{height}M or EL-{material}-{height}ft
  if (externalLadderQty > 0) {
    const ladderMat = getLadderMaterialCode(externalLadderMaterial);
    bom.accessories.push({
      sku: `EL-${ladderMat}-${ladderHeightCode}`,
      description: `External Ladder - ${ladderMat} ${ladderHeightCode}`,
      quantity: externalLadderQty,
      unitPrice: 0
    });

    // Safety Cage - format: SafetyCage-{height}m-{material} or SafetyCage-{height}ft-{material}
    if (safetyCage || height > 3) {
      let cageHeightCode;
      let cageMaterial = externalLadderMaterial;
      // Map material names to database format
      if (cageMaterial === 'SS316') cageMaterial = 'SS316';
      else if (cageMaterial === 'SS304') cageMaterial = 'SS304';
      else if (cageMaterial === 'MS') cageMaterial = 'MS';
      else cageMaterial = 'HDG';

      if (isImperial) {
        const heightFeet = Math.round(height * 3.28084);
        const standardFeet = [12, 16, 20];
        const closest = standardFeet.reduce((prev, curr) =>
          Math.abs(curr - heightFeet) < Math.abs(prev - heightFeet) ? curr : prev
        );
        cageHeightCode = `${closest}ft`;
      } else {
        const rounded = Math.round(height * 10);
        cageHeightCode = `${rounded}m`;
      }

      bom.accessories.push({
        sku: `SafetyCage-${cageHeightCode}-${cageMaterial}`,
        description: `Safety Cage - ${cageMaterial} ${cageHeightCode}`,
        quantity: externalLadderQty,
        unitPrice: 0
      });
    }
  }

  // Bolts, Nuts & Washers - kept as informational placeholder
  // Note: Individual bolts sold separately in database (BN300A0BM16075, etc.)
  if (bnwMaterial) {
    const boltsPerSide = material.startsWith('SS') ? 20 : 16;
    const totalPanels = bom.base.reduce((sum, item) => sum + item.quantity, 0) +
                        bom.walls.reduce((sum, item) => sum + item.quantity, 0);
    const totalBolts = totalPanels * boltsPerSide * 2;
    bom.accessories.push({
      sku: `BNW-${bnwMaterial}-SET`,
      description: `Bolts, Nuts & Washers Set - ${bnwMaterial} (${totalBolts} pcs approx)`,
      quantity: Math.ceil(totalBolts / 100),
      unitPrice: 0
    });
  }

  // ===========================
  // LPCB SPECIFIC: VORTEX PIPE
  // ===========================

  if (buildStandard === 'LPCB') {
    bom.accessories.push({
      sku: `VORTEX-PIPE-${materialCode}`,
      description: `Vortex Pipe - ${material} (LPCB Standard)`,
      quantity: 1,
      unitPrice: 0
    });
  }

  // ===========================
  // PIPE FITTINGS
  // ===========================

  if (pipeFittings && pipeFittings.length > 0) {
    pipeFittings.forEach(pf => {
      // Generate SKU based on fitting configuration
      // Format: {size}{type}-{flange}-{material}
      // Type: FL = Flange, DF = D/F Nozzle, SF = S/F Nozzle
      const typeCode = pf.outsideItem === 'D/F Nozzle' ? 'DF' :
                       pf.outsideItem === 'S/F Nozzle' ? 'SF' : 'FL';
      const flangeCode = pf.flangeType.replace(/\s+/g, '');

      bom.pipeFittings.push({
        sku: `${pf.size}${typeCode}-${flangeCode}-${pf.outsideMaterial}`,
        description: `${pf.opening} - ${pf.size}mm ${pf.flangeType} | Outside: ${pf.outsideMaterial} ${pf.outsideItem} | Inside: ${pf.insideMaterial} ${pf.insideItem}`,
        quantity: pf.quantity,
        unitPrice: 0 // Pipe fittings pricing is handled separately
      });
    });

    console.log(`   → ${pipeFittings.length} pipe fitting(s) added to BOM`);
  }

  // ===========================
  // CALCULATE TOTALS
  // ===========================

  const allPanelItems = [...bom.base, ...bom.walls, ...bom.partition, ...bom.roof];
  const allItems = [...allPanelItems, ...bom.roofSupport, ...bom.supports, ...bom.accessories, ...bom.pipeFittings];

  bom.summary.totalPanels = allPanelItems.reduce((sum, item) => sum + item.quantity, 0);
  bom.summary.totalCost = allItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

  // Log for debugging
  console.log(`📦 Steel BOM calculated: Type ${typeDetail}, ${material}, ${panelType === 'm' ? 'Metric' : 'Imperial'}, ${buildStandard} standard`);
  if (isType2) {
    console.log(`   → Using Type 2 SKUs with tier-based diameter (Ø18 bottom, Ø14 upper)`);
  }
  if (buildStandard === 'BSI' || buildStandard === 'LPCB') {
    console.log(`   → ${buildStandard} thickness: 5mm (1-3 panels), 6mm base (4+ panels)`);
  }
  if (buildStandard === 'LPCB') {
    console.log(`   → LPCB: Vortex Pipe included as standard`);
  }

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
  const typeDetail = inputs.panelTypeDetail || inputs.steelType || 1;
  const buildStandard = inputs.buildStandard || 'SANS';
  console.log(`📦 Calculating ${material} steel tank BOM (Type ${typeDetail}, ${buildStandard})...`);
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
