// Quick test to check Supabase SKU format
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://eccsgljxrzpvxhpafhmp.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjY3NnbGp4cnpwdnhocGFmaG1wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2NDA5OTQsImV4cCI6MjA3NDIxNjk5NH0.hthCeWbCreAVa4ULlsv8qGyf8Gcr1n1pYF_Jn4cdAJw'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  console.log('🔍 Testing Supabase connection...\n')

  // Test 1: Check connection and row count
  const { data: countData, error: countError } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })

  if (countError) {
    console.error('❌ Connection error:', countError)
    return
  }

  console.log(`✅ Connected! Total products: ${countData?.count || 0}\n`)

  // Test 2: Sample SKUs for different categories
  console.log('📋 Sample SKUs in database:\n')

  const categories = [
    'Base Panel',
    'Wall Panel',
    'Partition Panel',
    'Roof Panel'
  ]

  for (const category of categories) {
    const { data, error } = await supabase
      .from('products')
      .select('sku, description, market_final_price, item_category2')
      .eq('item_category2', category)
      .eq('is_available', true)
      .not('market_final_price', 'is', null)
      .limit(5)

    if (!error && data && data.length > 0) {
      console.log(`\n${category}:`)
      data.forEach(p => {
        console.log(`  - ${p.sku.padEnd(20)} RM ${p.market_final_price}`)
      })
    }
  }

  // Test 3: Search for specific SKU patterns
  console.log('\n\n🔍 Searching for common SKU patterns:\n')

  const patterns = ['3B', '1S20', 'SS316', 'FRP']

  for (const pattern of patterns) {
    const { data, error } = await supabase
      .from('products')
      .select('sku, market_final_price')
      .ilike('sku', `%${pattern}%`)
      .eq('is_available', true)
      .limit(3)

    if (!error && data && data.length > 0) {
      console.log(`\nPattern "${pattern}":`)
      data.forEach(p => {
        console.log(`  - ${p.sku}`)
      })
    }
  }
}

testConnection().catch(console.error)
