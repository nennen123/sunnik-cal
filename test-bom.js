// test-bom.js - Test the BOM calculation engine
import { calculateTankBOM, generateQuoteNumber } from './app/lib/bomEngine.js'

// Test tank specifications
const testTank = {
  length: 5,      // 5 meters
  width: 5,       // 5 meters
  height: 3,      // 3 meters
  materialCode: 'SS316',
  buildStandard: 'LPCB',
  includeInternalSupport: true,
  panelSize: 1    // 1m x 1m panels
}

// Run the test
async function testBOMCalculation() {
  try {
    console.log('🧪 Testing BOM Calculation Engine...')
    console.log('Tank specs:', testTank)

    const result = await calculateTankBOM(testTank)

    console.log('\n📊 BOM Calculation Results:')
    console.log('Volume:', result.tankSpecifications.volume)
    console.log('Panel quantities:', result.quantities.panels)
    console.log('Hardware quantities:', result.quantities.hardware)
    console.log('Total MYR:', result.totals.totalMYR)
    console.log('Total USD:', result.totals.totalUSD)
    console.log('Quote number:', generateQuoteNumber())

  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testBOMCalculation()
