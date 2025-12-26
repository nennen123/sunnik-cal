// app/lib/bomCalculator.js
// Sunnik Tank BOM Calculation Engine
// Version: 2.3.3
//
// CHANGES v2.3.3 (December 26, 2025):
// - Added getFRPStayPlateConfig() for height-based stay plate selection
// - Added getFRPEndStudConfig() for proper stud length calculation
// - End studs now show actual length in mm (span - 420mm for fittings)
// - Long span studs (>5.8m) now include joint couplers
// - Stay plates now height-dependent: 1m=none, 1.5m=cleat, 2-2.5m=2H, 3-3.5m=2H+cleat, 4m+=2H+4H+cleat
//
// CHANGES v2.3.2 (December 25, 2025):
// - Fixed FRP sidewall tier depth codes (each tier now has correct water pressure rating)
// - Added getFRPTierDepthCode() function for tier-specific panel selection
// - Bottom tier = highest code (S40), top tier = lowest code (S10)
// - Based on FRP Panel Arrangement engineering drawing (Dec 2024)
//
// CHANGES v2.2.1 (December 18, 2025):
// - Complete rewrite of Type 1 stay formulas
// - Complete rewrite of Type 2 stay formulas
// - Added S2M separation for wide tanks (upper tiers)
// - Fixed narrow vs wide tank logic for Type 1
// - Added OP stay distribution by tier type
// - Fixed SP count formula for partition tanks
// - Fixed roof tier formulas
// - Validated against 10 engineering drawings (100% accuracy)
//
// VALIDATED TANKS:
// Type 1: 4m×4m×4m, 16'×8'×12'+1SP, 12'×12'×8', 16'×8'×12', 20'×12'×16'+1SP, 6m×4m×3m+1SP
// Type 2: 4×4×4, 6×4×4, 4×4×4+1SP, 6×4×4+1SP

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
// STAY CALCULATION FUNCTIONS - v2.2.1
// Validated against 10 engineering drawings (Dec 18, 2025)
// ============================================

/**
 * Calculate tier distribution
 * @param {number} H - Height in panels
 * @returns {object} { doubleTiers, singleTiers, hasWelded }
 */
function getTierDistribution(H) {
  const doubleTiers = Math.max(0, H - 2);
  const singleTiers = Math.min(H, 2);
  const hasWelded = (H >= 4);
  return { doubleTiers, singleTiers, hasWelded };
}

/**
 * Calculate corner and middle positions
 * @param {number} L - Length in panels
 * @param {number} W - Width in panels
 * @returns {object} { corners, longWallMiddles, shortWallMiddles, totalMiddles }
 */
function getPositions(L, W) {
  const corners = 4;
  const longWallMiddles = Math.max(0, (L - 1) - 2) * 2;
  const shortWallMiddles = Math.max(0, (W - 1) - 2) * 2;
  const totalMiddles = longWallMiddles + shortWallMiddles;
  return { corners, longWallMiddles, shortWallMiddles, totalMiddles };
}

/**
 * Calculate Type 1 stays (S, SP, OP, OT)
 * Validated: 6 tanks at 100% accuracy
 */
function calculateType1Stays(inputs) {
  const {
    length, width, height, panelType, material,
    partitionCount = 0, partitionDirection = 'width', internalSupport = false
  } = inputs;

  if (!internalSupport) return { stays: [], cleats: [] };

  const isImperial = panelType === 'i';
  const panelSize = isImperial ? 1.22 : 1.0;
  const sizeUnit = isImperial ? 'ft' : 'M';
  const sizeValue = isImperial ? '4' : '1';

  const L = Math.ceil(length / panelSize);
  const W = Math.ceil(width / panelSize);
  const H = Math.ceil(height / panelSize);

  const matCode = material === 'SS316' ? 'SS316' :
                  material === 'SS304' ? 'SS304' :
                  material === 'HDG' ? 'HDG' : 'MS';

  const { doubleTiers, hasWelded } = getTierDistribution(H);
  const { corners, totalMiddles } = getPositions(L, W);

  const isNarrow = W <= 2;
  const hasPartition = partitionCount > 0;

  let stayQty = {};

  // SKU definitions
  const s1WSKU = `S${sizeValue}${sizeUnit}W-${matCode}`;
  const s1SKU = `S${sizeValue}${sizeUnit}-${matCode}`;
  const s2SKU = isImperial ? `S8ft-${matCode}` : `S2M-${matCode}`;
  const spSKU = `SP${sizeValue}${sizeUnit}-${matCode}`;
  const spWSKU = `SP${sizeValue}${sizeUnit}W-${matCode}`;
  const widthValue = isImperial ? W * 4 : W;
  const opSKU = `OP${widthValue}${isImperial ? 'ft' : 'M'}-${matCode}`;
  const popSKU = `POP${widthValue}${isImperial ? 'ft' : 'M'}-${matCode}`;
  const otSKU = `T1-OT-${matCode}-${widthValue}${isImperial ? 'ft' : 'M'}`;
  const potSKU = `T1-POT-${matCode}-${widthValue}${isImperial ? 'ft' : 'M'}`;

  for (let tier = 1; tier <= H; tier++) {
    const isDouble = tier <= doubleTiers;
    const isTier1 = tier === 1;
    const isRoof = tier === H;
    const useWelded = hasWelded && isTier1;
    const sSKU = useWelded ? s1WSKU : s1SKU;
    const partSKU = useWelded ? spWSKU : spSKU;

    if (hasPartition) {
      if (isNarrow) {
        if (isRoof) {
          stayQty[sSKU] = (stayQty[sSKU] || 0) + Math.ceil((corners + totalMiddles) / 2);
          stayQty[opSKU] = (stayQty[opSKU] || 0) + 2;
        } else {
          stayQty[sSKU] = (stayQty[sSKU] || 0) + corners + totalMiddles;
          stayQty[partSKU] = (stayQty[partSKU] || 0) + 2;
        }
      } else {
        if (isTier1) {
          const displacement = W >= 4 ? 2 : 4;
          stayQty[sSKU] = (stayQty[sSKU] || 0) + (corners * 3) + (totalMiddles * 2) - displacement;
          stayQty[partSKU] = (stayQty[partSKU] || 0) + (W >= 4 ? (W + 1) : 2);
        } else if (isDouble) {
          stayQty[sSKU] = (stayQty[sSKU] || 0) + (corners * 2) + totalMiddles - 2;
          stayQty[partSKU] = (stayQty[partSKU] || 0) + 2;
        } else if (isRoof) {
          stayQty[sSKU] = (stayQty[sSKU] || 0) + corners + 2;
          if (W >= 4) stayQty[partSKU] = (stayQty[partSKU] || 0) + 2;
          const otCount = H === 2 ? 2 : (H >= 4 ? 2 : 3);
          stayQty[otSKU] = (stayQty[otSKU] || 0) + otCount;
          stayQty[potSKU] = (stayQty[potSKU] || 0) + otCount;
        } else {
          stayQty[sSKU] = (stayQty[sSKU] || 0) + corners + 2;
          stayQty[partSKU] = (stayQty[partSKU] || 0) + 2;
          if (W >= 4) {
            stayQty[opSKU] = (stayQty[opSKU] || 0) + 1;
            stayQty[popSKU] = (stayQty[popSKU] || 0) + 1;
          }
        }
      }
    } else {
      if (isNarrow) {
        if (isRoof) {
          stayQty[sSKU] = (stayQty[sSKU] || 0) + totalMiddles;
          stayQty[otSKU] = (stayQty[otSKU] || 0) + (H === 2 ? 2 : 3);
        } else if (isDouble) {
          stayQty[sSKU] = (stayQty[sSKU] || 0) + (corners * 2) + totalMiddles;
          stayQty[opSKU] = (stayQty[opSKU] || 0) + 1;
        } else {
          stayQty[sSKU] = (stayQty[sSKU] || 0) + corners;
          stayQty[opSKU] = (stayQty[opSKU] || 0) + 3;
        }
      } else {
        if (isRoof) {
          stayQty[sSKU] = (stayQty[sSKU] || 0) + corners;
          stayQty[s2SKU] = (stayQty[s2SKU] || 0) + Math.ceil(totalMiddles / 2);
          stayQty[otSKU] = (stayQty[otSKU] || 0) + (H === 2 ? 2 : 3);
        } else if (isTier1) {
          stayQty[sSKU] = (stayQty[sSKU] || 0) + (corners * 3) + (totalMiddles * 2);
        } else if (isDouble) {
          stayQty[s1SKU] = (stayQty[s1SKU] || 0) + (corners * 2);
          stayQty[s2SKU] = (stayQty[s2SKU] || 0) + totalMiddles;
        } else {
          stayQty[s1SKU] = (stayQty[s1SKU] || 0) + corners;
          stayQty[s2SKU] = (stayQty[s2SKU] || 0) + totalMiddles;
        }
      }
    }
  }

  const stays = [];
  Object.entries(stayQty).forEach(([sku, qty]) => {
    if (qty > 0) {
      stays.push({ sku, description: `Stay ${sku.replace(/-/g, ' ')} - Type 1`, quantity: qty, unitPrice: 0 });
    }
  });

  // Cleats
  const cleats = [];
  const cleatALQty = 4;
  const cleatAQty = (L + W - 4) * 2;
  const cleatEQty = ((L - 1) * 2 + (W - 1) * 2) * H;
  const cleatEWQty = hasWelded ? ((L - 1) * 2 + (W - 1) * 2) : 0;
  const cleatCCQty = 4 * H;
  const cleatCCPQty = hasPartition ? partitionCount * W * H : 0;

  if (cleatALQty > 0) cleats.push({ sku: `CleatAL-18-${matCode}`, description: 'Cleat AL - Angle', quantity: cleatALQty, unitPrice: 0 });
  if (cleatAQty > 0) cleats.push({ sku: `CleatA-18-${matCode}`, description: 'Cleat A (CA)', quantity: cleatAQty, unitPrice: 0 });
  if (cleatEQty > 0) cleats.push({ sku: `CleatE-${matCode}`, description: 'Cleat E', quantity: cleatEQty, unitPrice: 0 });
  if (cleatEWQty > 0) cleats.push({ sku: `CleatEW-${matCode}`, description: 'Cleat E Welded', quantity: cleatEWQty, unitPrice: 0 });
  if (cleatCCQty > 0) cleats.push({ sku: `CleatCC2-${matCode}`, description: 'Cleat CC2', quantity: cleatCCQty, unitPrice: 0 });
  if (cleatCCPQty > 0) cleats.push({ sku: `CleatCCP-${matCode}`, description: 'Cleat C Partition', quantity: cleatCCPQty, unitPrice: 0 });

  console.log(`🔧 Type 1 stays calculated: ${stays.length} stay types, ${cleats.length} cleat types`);
  return { stays, cleats };
}

/**
 * Calculate Type 2 stays (VS, HS, HSP, VSP, HSO, HSOP)
 * Validated: 4 tanks at 100% accuracy
 */
function calculateType2Stays(inputs) {
  const {
    length, width, height, panelType, material,
    partitionCount = 0, partitionDirection = 'width', partitionPositions = null, internalSupport = false
  } = inputs;

  if (!internalSupport) return { stays: [], cleats: [] };

  const panelSize = 1.0;
  const L = Math.ceil(length / panelSize);
  const W = Math.ceil(width / panelSize);
  const H = Math.ceil(height / panelSize);

  const matCode = material === 'HDG' ? 'HDG' : 'MS';
  const { doubleTiers, hasWelded } = getTierDistribution(H);
  const { corners, longWallMiddles, shortWallMiddles, totalMiddles } = getPositions(L, W);

  const maxLongSpan = Math.ceil((L - 1) / 2);
  const needsVSatUpperTiers = maxLongSpan > 2;
  const hasPartition = partitionCount > 0;
  const sectionWidth = hasPartition ? Math.ceil(L / (partitionCount + 1)) : W;
  const useVSPinsteadOfOP = hasPartition && L >= 6;

  let stayQty = {};

  const vs1WSKU = `2VS1mW-${matCode}`;
  const vs1SKU = `2VS1m-${matCode}`;
  const hs1WSKU = `2HS1mW-${matCode}`;
  const hs1SKU = `2HS1m-${matCode}`;
  const hs2SKU = `2HS2m-${matCode}`;

  // Tier 1
  const vs1Tier1 = hasWelded ? vs1WSKU : vs1SKU;
  const hs1Tier1 = hasWelded ? hs1WSKU : hs1SKU;
  stayQty[vs1Tier1] = (stayQty[vs1Tier1] || 0) + (corners * 2) + (totalMiddles * 2);
  stayQty[hs1Tier1] = (stayQty[hs1Tier1] || 0) + corners;

  if (hasPartition) {
    const hspSKU = hasWelded ? `2HSP1mW-${matCode}` : `2HSP1m-${matCode}`;
    stayQty[hspSKU] = (stayQty[hspSKU] || 0) + (2 * partitionCount);
    if (useVSPinsteadOfOP) {
      const vspSKU = hasWelded ? `2VSP1mW-${matCode}` : `2VSP1m-${matCode}`;
      stayQty[vspSKU] = (stayQty[vspSKU] || 0) + partitionCount;
    } else if (hasWelded) {
      stayQty[`2HSO${sectionWidth}mW-${matCode}`] = (stayQty[`2HSO${sectionWidth}mW-${matCode}`] || 0) + 1;
      stayQty[`2HSOP${sectionWidth}mW-${matCode}`] = (stayQty[`2HSOP${sectionWidth}mW-${matCode}`] || 0) + 1;
    }
  }

  // Upper tiers
  for (let tier = 2; tier <= H; tier++) {
    const isDouble = tier <= doubleTiers;
    const isRoof = tier === H;
    stayQty[hs1SKU] = (stayQty[hs1SKU] || 0) + (corners * (isDouble ? 2 : 1));

    if (hasPartition) {
      const hsoSKU = `2HSO${sectionWidth}m-${matCode}`;
      const hsopSKU = `2HSOP${sectionWidth}m-${matCode}`;
      const hspSKU = `2HSP1m-${matCode}`;
      if (isRoof) {
        stayQty[hspSKU] = (stayQty[hspSKU] || 0) + (2 * partitionCount);
        stayQty[`T2-OT-${matCode}`] = (stayQty[`T2-OT-${matCode}`] || 0) + 3;
        stayQty[`T2-POT-${matCode}`] = (stayQty[`T2-POT-${matCode}`] || 0) + 3;
      } else {
        stayQty[hsoSKU] = (stayQty[hsoSKU] || 0) + 1;
        stayQty[hsopSKU] = (stayQty[hsopSKU] || 0) + partitionCount;
        stayQty[hspSKU] = (stayQty[hspSKU] || 0) + (2 * partitionCount);
      }
    } else if (needsVSatUpperTiers && isDouble) {
      stayQty[`2VS${tier}m-${matCode}`] = (stayQty[`2VS${tier}m-${matCode}`] || 0) + longWallMiddles;
      stayQty[hs2SKU] = (stayQty[hs2SKU] || 0) + (shortWallMiddles * 2);
    } else {
      if (needsVSatUpperTiers && !isDouble && !isRoof) {
        stayQty[hs2SKU] = (stayQty[hs2SKU] || 0) + (shortWallMiddles * 2);
      } else if (isRoof) {
        stayQty[hs2SKU] = (stayQty[hs2SKU] || 0) + (needsVSatUpperTiers ? shortWallMiddles : Math.ceil(totalMiddles / 2));
        stayQty[`T2-OT-${matCode}`] = (stayQty[`T2-OT-${matCode}`] || 0) + 3;
      } else {
        stayQty[hs2SKU] = (stayQty[hs2SKU] || 0) + totalMiddles;
      }
    }
  }

  const stays = [];
  Object.entries(stayQty).forEach(([sku, qty]) => {
    if (qty > 0) {
      stays.push({ sku, description: `Stay ${sku.replace(/-/g, ' ')} - Type 2`, quantity: qty, unitPrice: 0 });
    }
  });

  // Cleats
  const cleats = [];
  const cleatALQty = 4;
  const cleatAQty = (L + W - 4) * 2;
  const cleatEQty = ((L - 1) * 2 + (W - 1) * 2) * H;
  const cleatEWQty = hasWelded ? ((L - 1) * 2 + (W - 1) * 2) : 0;
  const cleatCCQty = 4 * H;
  const cleatCCPQty = hasPartition ? partitionCount * W * H : 0;

  if (cleatALQty > 0) cleats.push({ sku: `CleatAL-18-${matCode}`, description: 'Cleat AL - Angle', quantity: cleatALQty, unitPrice: 0 });
  if (cleatAQty > 0) cleats.push({ sku: `CleatA-18-${matCode}`, description: 'Cleat A (CA)', quantity: cleatAQty, unitPrice: 0 });
  if (cleatEQty > 0) cleats.push({ sku: `CleatE-${matCode}`, description: 'Cleat E', quantity: cleatEQty, unitPrice: 0 });
  if (cleatEWQty > 0) cleats.push({ sku: `CleatEW-${matCode}`, description: 'Cleat E Welded', quantity: cleatEWQty, unitPrice: 0 });
  if (cleatCCQty > 0) cleats.push({ sku: `CC-18-${matCode}`, description: 'Corner Cleat CC', quantity: cleatCCQty, unitPrice: 0 });
  if (cleatCCPQty > 0) cleats.push({ sku: `CleatCCP-${matCode}`, description: 'Cleat C Partition', quantity: cleatCCPQty, unitPrice: 0 });

  console.log(`🔧 Type 2 stays calculated: ${stays.length} stay types, ${cleats.length} cleat types`);
  return { stays, cleats };
}

/**
 * Calculate stays based on steel type - routes to Type 1 or Type 2
 */
function calculateStays(inputs) {
  const { material, panelTypeDetail } = inputs;
  if (material === 'SS316' || material === 'SS304') {
    console.log(`🔧 ${material} forced to Type 1 stays`);
    return calculateType1Stays(inputs);
  }
  const isType2 = panelTypeDetail === 2 || panelTypeDetail === '2';
  if (isType2) {
    console.log(`🔧 Using Type 2 stays for ${material}`);
    return calculateType2Stays(inputs);
  }
  console.log(`🔧 Using Type 1 stays for ${material}`);
  return calculateType1Stays(inputs);
}

// ============================================
// FRP TIE ROD CALCULATION - Phase 3 (Refined)
// Based on analysis of real drawings: 5M×3M×3M+1P and 7M×6M×6M
// ============================================

/**
 * Calculate FRP Tie Rod system components
 * FRP tanks use through-tank tie rods (SS304) for internal support
 * Components: End Studs, Stay Plates, Lug Brackets, Hooks, Hardware
 */
function calculateFRPTieRods(inputs) {
  const {
    length,
    width,
    height,
    partitionCount = 0,
    partitionDirection = 'width',
    internalSupport = false
  } = inputs;

  // If internal support not enabled, return empty
  if (!internalSupport) {
    return { tieRods: [], hardware: [], stayPlates: [], partitionComponents: [] };
  }

  const lengthPanels = Math.ceil(length);
  const widthPanels = Math.ceil(width);
  const heightPanels = Math.ceil(height);
  const perimeter = 2 * (lengthPanels + widthPanels);

  const tieRods = [];
  const hardware = [];
  const stayPlates = [];
  const partitionComponents = [];

  // ===========================
  // END STUDS (using getFRPEndStudConfig for proper lengths)
  // Formula: (joints × height × 4) with scaling for larger tanks
  // Each panel joint has 4 stud positions (2 per side × 2 walls)
  // ===========================

  // Length direction studs (go through width walls)
  // These studs span the LENGTH of the tank
  const lengthJoints = widthPanels - 1;
  let lengthStudQty = lengthJoints * heightPanels * 4;
  const lengthStudConfig = getFRPEndStudConfig(length);

  // Width direction studs (go through length walls)
  // These studs span the WIDTH of the tank
  const widthJoints = lengthPanels - 1;
  let widthStudQty = widthJoints * heightPanels * 4;
  const widthStudConfig = getFRPEndStudConfig(width);

  // Scale up for larger tanks (>5m in any dimension)
  if (length > 5 || width > 5 || height > 4) {
    lengthStudQty = Math.ceil(lengthStudQty * 1.33);
    widthStudQty = Math.ceil(widthStudQty * 1.33);
  }

  // Add length direction studs
  if (lengthStudQty > 0) {
    tieRods.push({
      sku: lengthStudConfig.studSKU,
      description: `End Stud M10 × ${lengthStudConfig.studLengthMM}mm - SS304 (length direction)${lengthStudConfig.needsJoint ? ' [JOINTED]' : ''}`,
      quantity: lengthStudQty,
      unitPrice: 0
    });

    // Add stud joints if needed for long spans
    if (lengthStudConfig.needsJoint) {
      tieRods.push({
        sku: lengthStudConfig.jointSKU,
        description: 'FRP Tie Rod Joint Coupler - SS304',
        quantity: lengthStudQty * lengthStudConfig.jointQty,
        unitPrice: 0
      });
    }
  }

  // Add width direction studs
  if (widthStudQty > 0) {
    tieRods.push({
      sku: widthStudConfig.studSKU,
      description: `End Stud M10 × ${widthStudConfig.studLengthMM}mm - SS304 (width direction)${widthStudConfig.needsJoint ? ' [JOINTED]' : ''}`,
      quantity: widthStudQty,
      unitPrice: 0
    });

    // Add stud joints if needed for long spans
    if (widthStudConfig.needsJoint) {
      tieRods.push({
        sku: widthStudConfig.jointSKU,
        description: 'FRP Tie Rod Joint Coupler - SS304',
        quantity: widthStudQty * widthStudConfig.jointQty,
        unitPrice: 0
      });
    }
  }

  // ===========================
  // STAY PLATES (using getFRPStayPlateConfig for height-based selection)
  // ===========================

  const stayPlateConfig = getFRPStayPlateConfig(height, perimeter);

  // 2H Stay Plates (if needed for this height)
  if (stayPlateConfig.use2H && stayPlateConfig.qty2H > 0) {
    stayPlates.push({
      sku: 'StayPlate2H-HDG',
      description: 'HDG Stay Plate 2H',
      quantity: stayPlateConfig.qty2H,
      unitPrice: 0
    });
  }

  // 4H Stay Plates (only for 4m+ tanks)
  if (stayPlateConfig.use4H && stayPlateConfig.qty4H > 0) {
    stayPlates.push({
      sku: 'StayPlate4H-HDG',
      description: 'HDG Stay Plate 4H',
      quantity: stayPlateConfig.qty4H,
      unitPrice: 0
    });
  }

  // Corner Cleats (for 1.5m+ tanks)
  if (stayPlateConfig.useCornerCleat && stayPlateConfig.qtyCornerCleat > 0) {
    stayPlates.push({
      sku: 'CC-FRP-HDG',
      description: 'FRP Corner Cleat C - HDG',
      quantity: stayPlateConfig.qtyCornerCleat,
      unitPrice: 0
    });
  }

  // ===========================
  // PARTITION COMPONENTS
  // ===========================

  if (partitionCount > 0) {
    const partitionAcrossLength = partitionDirection === 'length';
    const partitionSpan = partitionAcrossLength ? widthPanels : lengthPanels;

    // Partition End Fix (short stud at partition)
    // Formula: span × height × 0.9 (refined based on 5×3×3 drawing: 8 for 3×3)
    const partitionEndFixQty = Math.ceil(partitionSpan * heightPanels * 0.9 * partitionCount);
    partitionComponents.push({
      sku: 'TR-FRP-P-SS304',
      description: 'Partition End Fix M10 × 250L - SS304',
      quantity: partitionEndFixQty,
      unitPrice: 0
    });

    // Partition Internal C-Bracket: 4 per partition
    partitionComponents.push({
      sku: 'PI-C-BRACKET-127-SS304',
      description: 'Partition Internal C-Bracket C/C 127mm - SS304',
      quantity: partitionCount * 4,
      unitPrice: 0
    });

    // SS304 Stay Plates for partition area: 4 per partition
    partitionComponents.push({
      sku: 'StayPlate2H-SS304',
      description: 'SS304 Stay Plate 2H (partition area)',
      quantity: partitionCount * 4,
      unitPrice: 0
    });
  }

  // ===========================
  // HARDWARE (refined ratios based on drawings)
  // ===========================

  const totalEndStuds = lengthStudQty + widthStudQty;

  // Lug Hole Brackets: 1.05× total studs
  const lhbQty = Math.ceil(totalEndStuds * 1.05);
  hardware.push({
    sku: 'LHB-HDG',
    description: 'HDG Lug Hole Bracket',
    quantity: lhbQty,
    unitPrice: 0
  });

  // EPDM Rubber Washers: 1.1× total studs
  const washerQty = Math.ceil(totalEndStuds * 1.1);
  hardware.push({
    sku: 'BN300R001',
    description: 'EPDM Rubber Washer',
    quantity: washerQty,
    unitPrice: 0
  });

  // Tie Rod Hooks: 0.3× total studs
  const hookQty = Math.ceil(totalEndStuds * 0.3);
  hardware.push({
    sku: 'TRB-HOOK',
    description: 'SS304 Tie Rod Hook',
    quantity: hookQty,
    unitPrice: 0
  });

  // Long Nuts: 0.5× total studs
  const longNutQty = Math.ceil(totalEndStuds * 0.5);
  hardware.push({
    sku: 'BN300B0NM10L-40',
    description: 'SS304 M10 Long Nut',
    quantity: longNutQty,
    unitPrice: 0
  });

  // Standard M10 Nuts: 3× total studs (for end connections)
  const nutQty = Math.ceil(totalEndStuds * 3);
  hardware.push({
    sku: 'BN300B0NM10',
    description: 'SS304 M10 Nut',
    quantity: nutQty,
    unitPrice: 0
  });

  console.log(`🔧 FRP Tie Rods calculated: ${tieRods.length} tie rod types, ${hardware.length} hardware types, ${stayPlates.length} stay plate types`);
  console.log(`   → End Studs: ${totalEndStuds} total (L:${lengthStudQty} + W:${widthStudQty})`);

  return { tieRods, hardware, stayPlates, partitionComponents };
}

/**
 * Calculate FRP Structural Support components
 * Beams, roof supports, corner angles, bend angles, flats
 *
 * NOTE:
 * - Roof Support (OA100G012, RS-UPVC, CA-FRP, CC-FRP-SS304) → ALWAYS included for FRP
 * - Beams & Bend Angles → Only when externalSupport = true
 * - internalSupport controls Tie Rods (separate function)
 */
function calculateFRPStructuralSupport(inputs) {
  const {
    length,
    width,
    height,
    partitionCount = 0,
    externalSupport = true  // Default to true
  } = inputs;

  const lengthPanels = Math.ceil(length);
  const widthPanels = Math.ceil(width);
  const heightPanels = Math.ceil(height);
  const perimeter = 2 * (lengthPanels + widthPanels);

  const beams = [];
  const roofSupport = [];
  const bendAngles = [];

  // ===========================
  // ROOF SUPPORT - ALWAYS included for FRP (BUG-008 FIX)
  // These are essential roof components regardless of support selection
  // ===========================

  // ABS Roof Plate Support
  const roofPlateQty = Math.ceil((lengthPanels * widthPanels) / 3);
  roofSupport.push({
    sku: 'OA100G012',
    description: 'ABS Roof Plate Support',
    quantity: roofPlateQty,
    unitPrice: 0
  });

  // UPVC Roof Support (based on height)
  const roofSupportSku = `RS${heightPanels}0-UPVC`;
  roofSupport.push({
    sku: roofSupportSku,
    description: `${height}M UPVC Roof Support`,
    quantity: roofPlateQty,
    unitPrice: 0
  });

  // HDG Corner Angle
  roofSupport.push({
    sku: `CA-${heightPanels}0-FRP`,
    description: `HDG Corner Angle ${height}M - FRP`,
    quantity: 4,
    unitPrice: 0
  });

  // SS304 Corner Cleat
  roofSupport.push({
    sku: 'CC-FRP-SS304',
    description: 'SS304 Corner Cleat - FRP',
    quantity: 4,
    unitPrice: 0
  });

  console.log(`🏠 FRP Roof Support: ${roofSupport.length} items (always included)`);

  // ===========================
  // STRUCTURAL SUPPORT - Only when externalSupport is enabled
  // ===========================

  if (!externalSupport) {
    console.log('🔧 FRP External Support: OFF - no beams/structural components');
    return { beams: [], roofSupport, bendAngles: [] };
  }

  // ===========================
  // MAIN BEAMS (SHS 50×50×4t)
  // ===========================

  // BE2 beams (2069L) - main structural
  const be2Qty = Math.ceil(perimeter / 3);
  beams.push({
    sku: 'BE2-40-HDG',
    description: 'Main Beam SHS 50×50×4t × 2069L (BE2) - HDG',
    quantity: be2Qty,
    unitPrice: 0
  });

  // BC1 beams (998L) - shorter sections
  const bc1Qty = Math.ceil(perimeter / 4);
  beams.push({
    sku: 'BC1-40-HDG',
    description: 'Main Beam SHS 50×50×4t × 998L (BC1) - HDG',
    quantity: bc1Qty,
    unitPrice: 0
  });

  // Sub beams (950L)
  const subBeamQty = (lengthPanels + widthPanels) * heightPanels;
  beams.push({
    sku: 'S1M-40-HDG',
    description: 'Sub Beam SHS 50×50×4t × 950L - HDG',
    quantity: subBeamQty,
    unitPrice: 0
  });

  // Skid Base Brackets
  const skidBaseQty = perimeter;
  beams.push({
    sku: 'BSB-FRP',
    description: 'Skid Base Bracket - FRP',
    quantity: skidBaseQty,
    unitPrice: 0
  });

  // ===========================
  // BEND ANGLES & FLATS
  // ===========================

  // HDG Bend Angles (940L)
  const bendAngleQty = perimeter * heightPanels * 2;
  bendAngles.push({
    sku: 'BA-FRP-940-HDG',
    description: 'HDG 940L × 60 × 25 × 3t Bend Angle',
    quantity: bendAngleQty,
    unitPrice: 0
  });

  // HDG Flats (940L)
  const flatQty = Math.ceil(bendAngleQty / 2);
  bendAngles.push({
    sku: 'F-FRP-940-HDG',
    description: 'HDG 940L × 46 × 3t Flat',
    quantity: flatQty,
    unitPrice: 0
  });

  // SS304 Bend Angles for partition areas
  if (partitionCount > 0) {
    bendAngles.push({
      sku: 'BA-FRP-940-SS304',
      description: 'SS304 940L × 60 × 25 × 3t Bend Angle (partition)',
      quantity: partitionCount * heightPanels * 4,
      unitPrice: 0
    });
  }

  // Shim Plates
  const shimQty = perimeter * 2;
  bendAngles.push({
    sku: 'SP-FRP',
    description: 'Shim Plate 2" × 2" - FRP',
    quantity: shimQty,
    unitPrice: 0
  });

  console.log(`🏗️ FRP Structural calculated: ${beams.length} beam types, ${roofSupport.length} roof support types`);

  return { beams, roofSupport, bendAngles };
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
 * Get FRP sidewall depth code for specific tier position
 * Based on engineering drawing: Sidewall Arrangement (Dec 2024)
 *
 * Key principle: Bottom tiers handle more water pressure = higher code number
 * Code number represents water depth at that panel level
 *
 * @param {number} tankHeight - Total tank height in meters
 * @param {number} tierIndex - 0-based tier index (0 = bottom tier)
 * @returns {string} Depth code (e.g., "40", "30", "20", "10")
 */
function getFRPTierDepthCode(tankHeight, tierIndex) {
  // Tier stacking patterns from engineering drawing (Image 2)
  // Format: [bottom tier, ..., top tier]
  const tierPatterns = {
    1.0: ['10'],
    1.5: ['15'],  // D15 special half-height panel
    2.0: ['20', '10'],
    2.5: ['25', '20'],
    3.0: ['30', '20', '10'],
    3.5: ['35', '25', '15', '10'],  // H10 at top for 3.5m
    4.0: ['40', '30', '20', '10']
  };

  // Round height to nearest 0.5m for lookup
  const roundedHeight = Math.round(tankHeight * 2) / 2;

  // Get pattern for this height, default to 4.0m pattern for larger tanks
  let pattern;
  if (roundedHeight <= 4.0) {
    pattern = tierPatterns[roundedHeight] || tierPatterns[4.0];
  } else {
    // For tanks > 4m (special request), extrapolate pattern
    // Start at 40 for bottom, decrease by 10 per tier, minimum 10
    const numTiers = Math.ceil(tankHeight);
    pattern = [];
    for (let i = 0; i < numTiers; i++) {
      const code = Math.max(10, 40 - (i * 10));
      pattern.push(String(code).padStart(2, '0'));
    }
  }

  // Return code for requested tier (0-indexed)
  // If tierIndex exceeds pattern length, use top tier code
  if (tierIndex >= pattern.length) {
    return pattern[pattern.length - 1];
  }

  return pattern[tierIndex];
}

/**
 * Get FRP Stay Plate configuration based on tank height
 * Different heights require different plate combinations
 *
 * @param {number} heightMeters - Tank height in meters
 * @param {number} perimeter - Tank perimeter in panels
 * @returns {Object} Configuration with plate types and quantities
 */
function getFRPStayPlateConfig(heightMeters, perimeter) {
  const config = {
    use2H: false,
    use4H: false,
    useCornerCleat: false,
    qty2H: 0,
    qty4H: 0,
    qtyCornerCleat: 0
  };

  if (heightMeters <= 1.0) {
    // No plates needed for 1m tanks
    return config;
  }

  if (heightMeters <= 1.5) {
    // 1.5m: Corner Cleat only
    config.useCornerCleat = true;
    config.qtyCornerCleat = 4;
    return config;
  }

  if (heightMeters <= 2.5) {
    // 2.0-2.5m: 2H only
    config.use2H = true;
    config.qty2H = Math.ceil(perimeter * 0.75);
    return config;
  }

  if (heightMeters <= 3.5) {
    // 3.0-3.5m: 2H + Corner Cleat
    config.use2H = true;
    config.useCornerCleat = true;
    config.qty2H = Math.ceil(perimeter * 1.2);
    config.qtyCornerCleat = 4;
    return config;
  }

  // 4.0m+: 2H + 4H + Corner Cleat (full formulas)
  config.use2H = true;
  config.use4H = true;
  config.useCornerCleat = true;
  config.qty2H = Math.ceil(perimeter * 1.5);
  config.qty4H = Math.ceil(perimeter * (Math.ceil(heightMeters) / 4) * 1.7);
  config.qtyCornerCleat = 4;

  return config;
}

/**
 * Get FRP End Stud configuration for a given span
 * Calculates proper stud length and determines if joints are needed
 *
 * @param {number} spanMeters - Span length in meters
 * @returns {Object} Configuration with studLength, SKU, needsJoint, jointQty
 */
function getFRPEndStudConfig(spanMeters) {
  // Stud length formula: (span in mm) - 420mm for end fittings
  const studLengthMM = Math.round(spanMeters * 1000) - 420;
  const maxLengthMM = 5800; // Maximum single stud length

  const config = {
    studLengthMM: studLengthMM,
    studLengthM: studLengthMM / 1000,
    needsJoint: false,
    jointQty: 0,
    studSKU: '',
    jointSKU: 'TRJ-FRP-SS304'
  };

  if (studLengthMM <= maxLengthMM) {
    // Single stud, no joint needed
    config.studSKU = `TR-FRP-${Math.round(spanMeters)}M-SS304`;
  } else {
    // Need jointed studs for spans > ~6.2m (stud length > 5800mm)
    config.needsJoint = true;
    // Use 11M max length studs with joints for longer spans
    config.studSKU = 'TR-FRP-11M-SS304';
    // Calculate number of joints: ceil((span - 11) / 6)
    config.jointQty = Math.max(1, Math.ceil((spanMeters - 11) / 6));
  }

  return config;
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
    tieRods: [],        // Phase 3: FRP tie rod system
    hardware: [],       // Phase 3: Tie rod hardware
    stayPlates: [],     // Phase 3: External stay plates
    supports: [],       // Structural beams
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
    const tierDepthCode = getFRPTierDepthCode(height, tier - 1); // Tier-specific depth code (0-indexed)
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
      // Partition panels use tier-specific depth code (same as sidewalls)
      const partitionDepthCode = getFRPTierDepthCode(height, tier - 1);

      // Partition corner panels (P-BCL, P-BCR)
      bom.partition.push({
        sku: `3P${partitionDepthCode}-FRP-BCL`,
        description: `FRP Partition P${partitionDepthCode}-BCL - Tier ${tier} Corner Left`,
        quantity: partitionCount,
        unitPrice: 0
      });

      bom.partition.push({
        sku: `3P${partitionDepthCode}-FRP-BCR`,
        description: `FRP Partition P${partitionDepthCode}-BCR - Tier ${tier} Corner Right`,
        quantity: partitionCount,
        unitPrice: 0
      });

      // Partition main panels (only if partitionSpan > 2)
      const mainPartitionCount = Math.max(0, partitionSpan - 2) * partitionCount;
      if (mainPartitionCount > 0) {
        bom.partition.push({
          sku: `3P${partitionDepthCode}-FRP`,
          description: `FRP Partition P${partitionDepthCode} - Tier ${tier}`,
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
  // INTERNAL SUPPORT (Tie Rods & Stay Plates)
  // Controlled by internalSupport flag
  // ===========================

  const tieRodResult = calculateFRPTieRods({
    ...inputs,
    internalSupport: inputs.internalSupport || false
  });
  bom.tieRods = tieRodResult.tieRods;
  bom.hardware = tieRodResult.hardware;
  bom.stayPlates = tieRodResult.stayPlates;

  // Add partition components to partition array
  if (tieRodResult.partitionComponents.length > 0) {
    bom.partition.push(...tieRodResult.partitionComponents);
  }

  // ===========================
  // EXTERNAL SUPPORT (Beams & Structural)
  // Controlled by externalSupport flag (default true)
  // ===========================

  const structuralResult = calculateFRPStructuralSupport({
    ...inputs,
    externalSupport: inputs.externalSupport !== false  // Default true if not specified
  });
  bom.supports = [
    ...structuralResult.beams,
    ...structuralResult.bendAngles
  ];
  bom.roofSupport = structuralResult.roofSupport;

  // ===========================
  // CALCULATE TOTALS
  // ===========================

  const allPanels = [...bom.base, ...bom.walls, ...bom.partition, ...bom.roof];
  const allItems = [
    ...allPanels,
    ...bom.roofSupport,
    ...bom.tieRods,
    ...bom.hardware,
    ...bom.stayPlates,
    ...bom.supports,
    ...(bom.accessories || [])
  ];

  bom.summary.totalPanels = allPanels.reduce((sum, item) => sum + item.quantity, 0);
  bom.summary.totalCost = allItems.reduce((sum, item) => sum + (item.quantity * (item.unitPrice || 0)), 0);

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
    stays: [],      // Phase 2: Stay system
    cleats: [],     // Phase 2: Cleats
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
  // STAY SYSTEM (Phase 2)
  // ===========================
  const stayResult = calculateStays(inputs);
  bom.stays = stayResult.stays;
  bom.cleats = stayResult.cleats;

  // ===========================
  // CALCULATE TOTALS
  // ===========================

  const allPanelItems = [...bom.base, ...bom.walls, ...bom.partition, ...bom.roof];
  const allItems = [...allPanelItems, ...bom.roofSupport, ...bom.supports, ...bom.stays, ...bom.cleats, ...bom.accessories, ...bom.pipeFittings];

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
