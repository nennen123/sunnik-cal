// lib/accessoryPricing.js
// Accessory pricing and SKU generation

export const ACCESSORY_PRICES = {
  manhole: {
    normal: 380,
    hinged: 450,
    bolted: 420,
    lockable: 500
  },
  wli: {
    base: 150, // Base price per meter
    multiplier: {
      hdg: 1.0,
      ss304: 1.5,
      ss316: 1.8,
      magnetic: 2.5,
      electronic: 3.0
    }
  },
  ladder: {
    internal: {
      frp: 200, // Per meter
      hdg: 180,
      ss304: 250,
      ss316: 300
    },
    external: {
      frp: 180,
      hdg: 160,
      ss304: 220,
      ss316: 270
    }
  },
  safetyCage: 150,
  airVent: {
    '50mm': 25,
    '75mm': 35,
    '100mm': 45
  }
};

/**
 * Generate SKU for accessories
 */
export function getAccessorySKU(type, material, height) {
  const heightM = Math.ceil(height);

  switch(type) {
    case 'wli':
      return `WLI-${material.toUpperCase()}-${heightM}M`;
    case 'int_ladder':
      return `IL-${material.toUpperCase()}-${heightM}M`;
    case 'ext_ladder':
      return `EL-${material.toUpperCase()}-${heightM}M`;
    case 'manhole':
      return `MH-${material.toUpperCase()}`;
    case 'air_vent':
      return `AV-${material}`;
    case 'safety_cage':
      return `SC-HDG-${heightM}M`;
    default:
      return null;
  }
}

/**
 * Calculate accessory price
 */
export function getAccessoryPrice(sku, height = 2.0) {
  // Simple pricing logic - can be enhanced with CSV lookup
  if (sku.startsWith('WLI-')) {
    const material = sku.split('-')[1].toLowerCase();
    const multiplier = ACCESSORY_PRICES.wli.multiplier[material] || 1.0;
    return ACCESSORY_PRICES.wli.base * height * multiplier;
  }

  if (sku.startsWith('IL-')) {
    const material = sku.split('-')[1].toLowerCase();
    return (ACCESSORY_PRICES.ladder.internal[material] || 200) * height;
  }

  if (sku.startsWith('EL-')) {
    const material = sku.split('-')[1].toLowerCase();
    return (ACCESSORY_PRICES.ladder.external[material] || 180) * height;
  }

  if (sku.startsWith('MH-')) {
    return ACCESSORY_PRICES.manhole.normal;
  }

  if (sku.startsWith('AV-')) {
    return ACCESSORY_PRICES.airVent['50mm'];
  }

  if (sku.startsWith('SC-')) {
    return ACCESSORY_PRICES.safetyCage;
  }

  return 0;
}
