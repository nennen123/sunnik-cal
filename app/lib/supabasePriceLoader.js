// app/lib/supabasePriceLoader.js
// Supabase-based SKU pricing loader
// Replaces CSV-based priceLoader.js

import { supabase } from './supabase';

// Price cache to avoid repeated database queries
let priceCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Load all prices from Supabase products table
 * Uses market_final_price column (customer pricing, not our costs)
 *
 * @returns {Promise<Object>} Object mapping SKU to price
 */
export async function loadPrices() {
  // Return cached prices if still valid
  if (priceCache && cacheTimestamp && (Date.now() - cacheTimestamp < CACHE_DURATION)) {
    console.log('📦 Using cached prices');
    return priceCache;
  }

  try {
    console.log('📊 Loading SKU prices from Supabase...');

    // Fetch all products in batches (Supabase limits to 1000 rows per query)
    let allData = [];
    let hasMore = true;
    let offset = 0;
    const batchSize = 1000;

    while (hasMore) {
      const { data, error } = await supabase
        .from('products')
        .select('sku, market_final_price, is_available, description')
        .eq('is_available', true)
        .not('market_final_price', 'is', null)
        .gt('market_final_price', 0)
        .range(offset, offset + batchSize - 1);

      if (error) {
        console.error('❌ Supabase query error:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        hasMore = false;
      } else {
        allData = allData.concat(data);
        offset += batchSize;
        hasMore = data.length === batchSize; // Continue if we got a full batch
        console.log(`  📦 Loaded batch: ${allData.length} SKUs so far...`);
      }
    }

    const data = allData;

    if (!data || data.length === 0) {
      console.warn('⚠️  No products found in database');
      return {};
    }

    // Build price lookup object
    const prices = {};
    let validCount = 0;
    let unavailableCount = 0;

    data.forEach(product => {
      const sku = product.sku?.trim();
      const price = parseFloat(product.market_final_price);

      if (sku && !isNaN(price) && price > 0) {
        prices[sku] = price;
        validCount++;
      } else {
        unavailableCount++;
      }
    });

    // Update cache
    priceCache = prices;
    cacheTimestamp = Date.now();

    console.log(`✅ Loaded ${validCount} valid prices from Supabase`);
    console.log(`📦 Sample SKUs:`, Object.keys(prices).slice(0, 5));
    console.log(`⚠️  Skipped ${unavailableCount} invalid entries`);

    return prices;

  } catch (error) {
    console.error('❌ Error loading prices from Supabase:', error);

    // Fallback to empty object (will use placeholder prices)
    return {};
  }
}

/**
 * Get price for a specific SKU with intelligent fallback logic
 *
 * @param {Object} prices - Price lookup object from loadPrices()
 * @param {string} sku - SKU to look up
 * @returns {number} Price in MYR
 */
export function getPrice(prices, sku) {
  if (!prices || Object.keys(prices).length === 0) {
    console.warn('⚠️  Price database not loaded');
    return 150.0; // Fallback price
  }

  if (!sku) {
    console.warn('⚠️  No SKU provided');
    return 150.0;
  }

  // Strategy 1: Exact match (fastest, most accurate)
  if (prices[sku]) {
    return prices[sku];
  }

  // Strategy 2: Case-insensitive match
  const lowerSku = sku.toLowerCase();
  const exactMatch = Object.keys(prices).find(
    key => key.toLowerCase() === lowerSku
  );

  if (exactMatch) {
    console.log(`🔍 Case-insensitive match: ${sku} → ${exactMatch}`);
    return prices[exactMatch];
  }

  // Strategy 3: Partial match for FRP panels with suffixes
  // Example: "3S10-FRP-A" might match "3S10-FRP"
  const partialMatch = Object.keys(prices).find(key => {
    const baseKey = key.split('-')[0].toLowerCase();
    const baseSku = lowerSku.split('-')[0];
    return baseKey === baseSku && key.toLowerCase().includes('frp');
  });

  if (partialMatch) {
    console.log(`🔍 Partial FRP match: ${sku} → ${partialMatch}`);
    return prices[partialMatch];
  }

  // Strategy 4: Try without special characters for partition panels
  // Example: "1Bφ45-m-S2" might be stored as "1B45-m-S2"
  const normalizedSku = sku.replace(/[φΦ]/g, '');
  if (normalizedSku !== sku && prices[normalizedSku]) {
    console.log(`🔍 Normalized match: ${sku} → ${normalizedSku}`);
    return prices[normalizedSku];
  }

  // No match found - log for debugging
  console.warn(`❌ No price found for SKU: ${sku}`);
  console.warn(`   Available SKUs starting with '${sku.substring(0, 3)}':`,
    Object.keys(prices).filter(k => k.startsWith(sku.substring(0, 3))).slice(0, 5)
  );

  return 150.0; // Fallback price
}

/**
 * Get a specific product by SKU (with full details)
 *
 * @param {string} sku - SKU to look up
 * @returns {Promise<Object|null>} Product object or null
 */
export async function getProduct(sku) {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('sku', sku)
      .eq('is_available', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      throw error;
    }

    return data;

  } catch (error) {
    console.error(`❌ Error fetching product ${sku}:`, error);
    return null;
  }
}

/**
 * Get multiple products by SKUs (batch query for efficiency)
 *
 * @param {string[]} skus - Array of SKUs to look up
 * @returns {Promise<Object>} Object mapping SKU to price
 */
export async function getMultiplePrices(skus) {
  if (!skus || skus.length === 0) {
    return {};
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .select('sku, market_final_price')
      .in('sku', skus)
      .eq('is_available', true);

    if (error) {
      throw error;
    }

    // Build lookup object
    const prices = {};
    data.forEach(product => {
      if (product.sku && product.market_final_price) {
        prices[product.sku] = parseFloat(product.market_final_price);
      }
    });

    return prices;

  } catch (error) {
    console.error('❌ Error fetching multiple prices:', error);
    return {};
  }
}

/**
 * Search for SKUs by pattern (useful for debugging)
 *
 * @param {string} pattern - Pattern to search for (e.g., "3B", "SS316", "FRP")
 * @param {number} limit - Maximum results to return
 * @returns {Promise<Array>} Array of matching products
 */
export async function searchSKUs(pattern, limit = 50) {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('sku, description, market_final_price, is_available')
      .ilike('sku', `%${pattern}%`)
      .eq('is_available', true)
      .limit(limit);

    if (error) {
      throw error;
    }

    return data || [];

  } catch (error) {
    console.error(`❌ Error searching SKUs for pattern '${pattern}':`, error);
    return [];
  }
}

/**
 * Get products by category (useful for filtering)
 *
 * @param {string} category - Item category to filter by
 * @returns {Promise<Array>} Array of products in category
 */
export async function getProductsByCategory(category) {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('item_category2', category)
      .eq('is_available', true)
      .order('sku', { ascending: true });

    if (error) {
      throw error;
    }

    return data || [];

  } catch (error) {
    console.error(`❌ Error fetching products in category '${category}':`, error);
    return [];
  }
}

/**
 * Clear the price cache (force reload on next loadPrices call)
 */
export function clearPriceCache() {
  priceCache = null;
  cacheTimestamp = null;
  console.log('🗑️  Price cache cleared');
}

/**
 * Get cache status (for debugging)
 */
export function getCacheStatus() {
  return {
    cached: !!priceCache,
    itemCount: priceCache ? Object.keys(priceCache).length : 0,
    age: cacheTimestamp ? Date.now() - cacheTimestamp : null,
    expires: cacheTimestamp ? CACHE_DURATION - (Date.now() - cacheTimestamp) : null
  };
}
