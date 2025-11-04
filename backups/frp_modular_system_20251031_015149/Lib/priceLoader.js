// app/lib/priceLoader.js
// Load and parse SKU pricing from CSV

let priceCache = null;

/**
 * Simple CSV parser that handles quoted fields
 */
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

/**
 * Load prices from CSV file
 */
export async function loadPrices() {
  if (priceCache) {
    return priceCache;
  }

  try {
    console.log('📊 Loading SKU prices from CSV...');
    const response = await fetch('/sku_prices.csv');

    if (!response.ok) {
      throw new Error(`Failed to load CSV: ${response.status}`);
    }

    const csvText = await response.text();
    const lines = csvText.split('\n');

    if (lines.length < 2) {
      throw new Error('CSV file is empty or invalid');
    }

    // Parse header to find column indices
    const headers = parseCSVLine(lines[0]);
    const skuIndex = headers.findIndex(h => h === 'InternalReference');
    const priceIndex = headers.findIndex(h => h === 'market_final_price');

    console.log(`📋 CSV Headers found: SKU at column ${skuIndex}, Market Price at column ${priceIndex}`);

    if (skuIndex === -1 || priceIndex === -1) {
      console.warn('⚠️  Could not find required columns, using default indices');
      // Fallback to known positions (InternalReference=0, market_final_price=27)
      const skuIdx = 0;
      const priceIdx = 27;
    }

    const prices = {};
    let validCount = 0;
    let skippedCount = 0;

    // Parse data rows
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      try {
        const values = parseCSVLine(line);

        const sku = values[skuIndex]?.trim();
        const priceStr = values[priceIndex]?.trim();
        const price = parseFloat(priceStr);

        if (sku && !isNaN(price) && price > 0) {
          prices[sku] = price;
          validCount++;
        } else {
          skippedCount++;
        }
      } catch (err) {
        skippedCount++;
      }
    }

    priceCache = prices;
    console.log(`✅ Loaded ${validCount} valid prices (skipped ${skippedCount})`);
    console.log(`📦 Sample SKUs:`, Object.keys(prices).slice(0, 5));

    return prices;

  } catch (error) {
    console.error('❌ Error loading prices:', error);
    return {};
  }
}

/**
 * Get price for a specific SKU
 */
export function getPrice(prices, sku) {
  if (!prices || Object.keys(prices).length === 0) {
    console.warn('⚠️  Price database not loaded, using default');
    return 150.0;
  }

  // Try exact match first
  if (prices[sku]) {
    return prices[sku];
  }

  // Try case-insensitive match
  const lowerSku = sku.toLowerCase();
  const matchedKey = Object.keys(prices).find(
    key => key.toLowerCase() === lowerSku
  );

  if (matchedKey) {
    return prices[matchedKey];
  }

  // Try partial match (for FRP panels with suffixes)
  const partialKey = Object.keys(prices).find(
    key => key.toLowerCase().startsWith(lowerSku.split('-')[0].toLowerCase())
  );

  if (partialKey) {
    console.log(`🔍 Using partial match: ${sku} → ${partialKey}`);
    return prices[partialKey];
  }

  // No match found
  console.warn(`⚠️  No price found for SKU: ${sku}`);
  return 150.0; // Default fallback
}

/**
 * Search for SKUs by pattern
 */
export function searchSKUs(prices, pattern) {
  const regex = new RegExp(pattern, 'i');
  return Object.keys(prices)
    .filter(sku => regex.test(sku))
    .map(sku => ({ sku, price: prices[sku] }));
}
