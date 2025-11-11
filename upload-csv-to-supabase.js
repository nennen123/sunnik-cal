// Upload sku_prices.csv to Supabase products table
// Run: node upload-csv-to-supabase.js

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// IMPORTANT: Replace these with your actual Supabase credentials
const SUPABASE_URL = 'https://eccsgljxrzpvxhpafhmp.supabase.co';  // e.g., https://xxxxx.supabase.co
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjY3NnbGp4cnpwdnhocGFmaG1wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2NDA5OTQsImV4cCI6MjA3NDIxNjk5NH0.hthCeWbCreAVa4ULlsv8qGyf8Gcr1n1pYF_Jn4cdAJw';  // Your anon/public key

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// CSV file path - adjust if needed
const CSV_FILE = './public/sku_prices_clean.csv';  // Using cleaned CSV without duplicates

// Parse CSV with proper handling of quoted fields
function parseCSV(text) {
  const lines = text.split('\n');
  const headers = parseCSVLine(lines[0]);
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;

    const values = parseCSVLine(lines[i]);
    if (values.length === headers.length) {
      const row = {};
      headers.forEach((header, index) => {
        row[header.trim()] = values[index].trim();
      });
      rows.push(row);
    }
  }

  return rows;
}

// Parse a single CSV line with quoted field support
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}

// Convert CSV row to database format
function convertToProduct(csvRow) {
  return {
    sku: csvRow.InternalReference || '',
    description: csvRow.Description || '',
    item_category: csvRow.ItemCategory || '',
    item_category2: csvRow.ItemCategory2 || '',
    department: csvRow.Department || '',
    weight: parseFloat(csvRow.Weight) || null,
    dimension: csvRow.Dimension || '',
    length: parseInt(csvRow.Length) || null,
    thickness: parseFloat(csvRow.Thickness) || null,
    used_for: csvRow.UsedFor || '',
    finishing: csvRow.Finishing || '',
    sad_uom: csvRow.SAD_UOM || '',
    conversion_rate: parseInt(csvRow.conversion_rate) || null,
    purchase_uom: csvRow.PURCHASE_UOM || '',
    warehouse_qty: parseInt(csvRow.Warehouse_QTY) || null,
    available_qty: parseInt(csvRow.Available_QTY) || null,
    warehouse_qty_sg: parseInt(csvRow.Warehouse_QTY_SG) || null,
    available_qty_sg: parseInt(csvRow.Available_QTY_SG) || null,
    pq_qty: parseInt(csvRow.PQ_QTY) || null,
    po_qty: parseInt(csvRow.PO_QTY) || null,
    min_qty: parseInt(csvRow.MinQty) || null,
    reorder_qty: parseInt(csvRow.reOrderQty) || null,
    drawing_ref_t1: csvRow.drawing_Ref_T1 || '',
    drawing_ref_t2: csvRow.drawing_Ref_T2 || '',
    drawing_ref_frp: parseFloat(csvRow.drawing_Ref_FRP) || null,
    packing_reference: csvRow.PackingReference || '',
    our_final_price: parseFloat(csvRow.our_final_price) || null,
    market_final_price: parseFloat(csvRow.market_final_price) || null
  };
}

// Upload in batches
async function uploadInBatches(products, batchSize = 100) {
  const totalBatches = Math.ceil(products.length / batchSize);
  let successCount = 0;
  let errorCount = 0;

  console.log(`\n📦 Uploading ${products.length} products in ${totalBatches} batches...`);

  for (let i = 0; i < products.length; i += batchSize) {
    const batch = products.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;

    try {
      const { data, error } = await supabase
        .from('products')
        .insert(batch);

      if (error) {
        console.error(`❌ Batch ${batchNum}/${totalBatches} failed:`, error.message);
        errorCount += batch.length;
      } else {
        successCount += batch.length;
        console.log(`✅ Batch ${batchNum}/${totalBatches} uploaded (${successCount}/${products.length})`);
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (err) {
      console.error(`❌ Batch ${batchNum}/${totalBatches} error:`, err.message);
      errorCount += batch.length;
    }
  }

  return { successCount, errorCount };
}

// Main function
async function main() {
  console.log('🚀 Starting CSV upload to Supabase...\n');

  // Check if CSV file exists
  if (!fs.existsSync(CSV_FILE)) {
    console.error(`❌ CSV file not found: ${CSV_FILE}`);
    console.log('Please make sure sku_prices.csv is in the correct location.');
    process.exit(1);
  }

  console.log(`📂 Reading CSV file: ${CSV_FILE}`);
  const csvText = fs.readFileSync(CSV_FILE, 'utf-8');

  console.log('📊 Parsing CSV data...');
  const csvRows = parseCSV(csvText);
  console.log(`✅ Parsed ${csvRows.length} rows from CSV\n`);

  // Convert to product format
  console.log('🔄 Converting to database format...');
  const products = csvRows.map(convertToProduct);

  // Filter out invalid products (no SKU)
  const validProducts = products.filter(p => p.sku && p.sku.length > 0);
  console.log(`✅ ${validProducts.length} valid products ready for upload\n`);

  if (validProducts.length === 0) {
    console.error('❌ No valid products to upload!');
    process.exit(1);
  }

  // Upload to Supabase
  const { successCount, errorCount } = await uploadInBatches(validProducts);

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 UPLOAD SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Successfully uploaded: ${successCount} products`);
  console.log(`❌ Failed: ${errorCount} products`);
  console.log(`📈 Success rate: ${((successCount / validProducts.length) * 100).toFixed(1)}%`);
  console.log('='.repeat(60));

  // Verify in database
  console.log('\n🔍 Verifying database...');
  const { count, error } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.error('❌ Verification error:', error.message);
  } else {
    console.log(`✅ Database now contains ${count} products`);
  }

  console.log('\n✨ Upload complete!');
}

// Run the script
main().catch(err => {
  console.error('💥 Fatal error:', err);
  process.exit(1);
});
