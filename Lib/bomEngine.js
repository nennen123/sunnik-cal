/**
 * SUNNIK TANK CALCULATOR - BOM ENGINE
 * Converts tank dimensions into component quantities
 */

/**
 * Calculate the number of panels needed based on tank dimensions
 */
export function calculatePanelQuantities(length, width, height, panelSize = 1.0) {
    const basePanelsLength = Math.ceil(length / panelSize);
    const basePanelsWidth = Math.ceil(width / panelSize);
    const basePanels = basePanelsLength * basePanelsWidth;

    const wallPanelsHeight = Math.ceil(height / panelSize);
    const wallPanelsLong = basePanelsLength * wallPanelsHeight * 2;
    const wallPanelsShort = basePanelsWidth * wallPanelsHeight * 2;
    const wallPanels = wallPanelsLong + wallPanelsShort;

    const roofPanels = basePanels;

    return {
      basePanels,
      wallPanels,
      roofPanels,
      totalPanels: basePanels + wallPanels + roofPanels,
      dimensions: {
        basePanelsLength,
        basePanelsWidth,
        wallPanelsHeight,
        perimeter: (basePanelsLength + basePanelsWidth) * 2
      }
    };
  }

  /**
   * Calculate hardware quantities based on panel count
   */
  export function calculateHardwareQuantities(panelQuantities) {
    const { totalPanels } = panelQuantities;

    const boltSets = Math.ceil(totalPanels * 4);
    const cornerBrackets = 8 + Math.ceil(totalPanels / 25);
    const sealingMeters = Math.ceil(totalPanels * 4.2);

    return {
      boltSets,
      cornerBrackets,
      sealingMeters
    };
  }

  /**
   * Calculate volume and determine pricing tier
   */
  export function calculateVolume(length, width, height) {
    const volumeM3 = length * width * height;
    const volumeML = volumeM3;
    const volumeLiters = volumeM3 * 1000;
    const volumeGallons = volumeLiters * 0.264172;

    const volumeTier = volumeML < 6 ? '<6ML' : '>6ML';

    return {
      volumeM3: parseFloat(volumeM3.toFixed(2)),
      volumeML: parseFloat(volumeML.toFixed(2)),
      volumeLiters: Math.round(volumeLiters),
      volumeGallons: Math.round(volumeGallons),
      volumeTier
    };
  }

  /**
   * Determine if internal support is required
   */
  export function calculateInternalSupport(length, width, height) {
    const volumeInfo = calculateVolume(length, width, height);
    const maxDimension = Math.max(length, width, height);

    const isRequired = volumeInfo.volumeML >= 6 || maxDimension > 8;

    let supportBeams = 0;
    let supportColumns = 0;

    if (isRequired) {
      const baseArea = length * width;
      supportColumns = Math.ceil(baseArea / 16);
      supportBeams = Math.ceil((length + width) / 2);
    }

    return {
      isRequired,
      recommendationReason: isRequired
        ? `Internal support required for ${volumeInfo.volumeML}ML tank or dimensions exceeding 8m`
        : 'Internal support not required for this tank size',
      supportBeams,
      supportColumns
    };
  }

  /**
   * Calculate accessories based on tank size
   */
  export function calculateAccessories(length, width, height) {
    const volumeInfo = calculateVolume(length, width, height);

    const accessories = {
      manholes: 1,
      airVents: 1,
      overflowPipes: 1,
      inletConnections: 1,
      outletConnections: 1
    };

    if (volumeInfo.volumeML > 10) {
      accessories.manholes = 2;
    }

    if (volumeInfo.volumeML > 20) {
      accessories.airVents = 2;
    }

    return accessories;
  }

  /**
   * MAIN CALCULATOR: Generate complete BOM
   */
  export function generateBOM(tankSpecs) {
    const {
      length,
      width,
      height,
      materialCode = 'SS316',
      buildStandard = 'LPCB',
      panelSize = 1.0,
      includeInternalSupport = false
    } = tankSpecs;

    if (!length || !width || !height) {
      throw new Error('Tank dimensions are required');
    }

    if (length <= 0 || width <= 0 || height <= 0) {
      throw new Error('Tank dimensions must be positive numbers');
    }

    const volumeInfo = calculateVolume(length, width, height);
    const panelQuantities = calculatePanelQuantities(length, width, height, panelSize);
    const hardwareQuantities = calculateHardwareQuantities(panelQuantities);
    const supportInfo = calculateInternalSupport(length, width, height);
    const accessories = calculateAccessories(length, width, height);

    const useInternalSupport = includeInternalSupport || supportInfo.isRequired;

    return {
      tankSpecifications: {
        length,
        width,
        height,
        materialCode,
        buildStandard,
        panelSize
      },
      volumeInfo,
      components: {
        panels: {
          base: panelQuantities.basePanels,
          wall: panelQuantities.wallPanels,
          roof: panelQuantities.roofPanels,
          total: panelQuantities.totalPanels
        },
        hardware: {
          boltSets: hardwareQuantities.boltSets,
          cornerBrackets: hardwareQuantities.cornerBrackets,
          sealingMeters: hardwareQuantities.sealingMeters
        },
        support: useInternalSupport ? {
          beams: supportInfo.supportBeams,
          columns: supportInfo.supportColumns,
          isRequired: supportInfo.isRequired,
          reason: supportInfo.recommendationReason
        } : null,
        accessories
      },
      summary: {
        totalPanels: panelQuantities.totalPanels,
        volumeTier: volumeInfo.volumeTier,
        requiresInternalSupport: supportInfo.isRequired,
        internalSupportIncluded: useInternalSupport
      }
    };
  }

  /**
   * Format BOM for display
   */
  export function formatBOMLineItems(bom) {
    const lineItems = [];

    lineItems.push({
      category: 'Panels',
      component: 'Base Panel',
      quantity: bom.components.panels.base,
      unit: 'piece',
      specification: `${bom.tankSpecifications.materialCode} - ${bom.tankSpecifications.panelSize}m x ${bom.tankSpecifications.panelSize}m`
    });

    lineItems.push({
      category: 'Panels',
      component: 'Wall Panel',
      quantity: bom.components.panels.wall,
      unit: 'piece',
      specification: `${bom.tankSpecifications.materialCode} - ${bom.tankSpecifications.panelSize}m x ${bom.tankSpecifications.panelSize}m`
    });

    lineItems.push({
      category: 'Panels',
      component: 'Roof Panel',
      quantity: bom.components.panels.roof,
      unit: 'piece',
      specification: `${bom.tankSpecifications.materialCode} - ${bom.tankSpecifications.panelSize}m x ${bom.tankSpecifications.panelSize}m`
    });

    lineItems.push({
      category: 'Hardware',
      component: 'Bolt Sets',
      quantity: bom.components.hardware.boltSets,
      unit: 'set',
      specification: 'M12 Grade 8.8'
    });

    lineItems.push({
      category: 'Hardware',
      component: 'Corner Brackets',
      quantity: bom.components.hardware.cornerBrackets,
      unit: 'piece',
      specification: 'Standard'
    });

    lineItems.push({
      category: 'Hardware',
      component: 'Sealing Strip',
      quantity: bom.components.hardware.sealingMeters,
      unit: 'meter',
      specification: 'Waterproof'
    });

    if (bom.components.support) {
      lineItems.push({
        category: 'Support Structure',
        component: 'Support Beams',
        quantity: bom.components.support.beams,
        unit: 'piece',
        specification: `${bom.tankSpecifications.materialCode}`
      });

      lineItems.push({
        category: 'Support Structure',
        component: 'Support Columns',
        quantity: bom.components.support.columns,
        unit: 'piece',
        specification: `${bom.tankSpecifications.materialCode}`
      });
    }

    Object.entries(bom.components.accessories).forEach(([key, quantity]) => {
      if (quantity > 0) {
        lineItems.push({
          category: 'Accessories',
          component: key.replace(/([A-Z])/g, ' $1').trim(),
          quantity,
          unit: 'piece',
          specification: 'Standard'
        });
      }
    });

    return lineItems;
  }
