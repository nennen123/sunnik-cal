'use client'
import { useState } from 'react'

// Simple test without external imports first
export default function HomePage() {
  const [testResults, setTestResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const runSimpleTest = () => {
    setLoading(true)
    setError(null)

    try {
      // Test basic calculations without database
      const length = 5, width = 5, height = 3
      const volumeML = length * width * height * 1000000
      const volumeTier = volumeML < 6000000 ? '<6ML' : '>6ML'

      // Panel calculations
      const basePanels = length * width // 25
      const wallPanels = (2 * length + 2 * width) * height // 60
      const roofPanels = basePanels // 25
      const totalPanels = basePanels + wallPanels + roofPanels

      // Hardware calculations
      const boltSets = Math.ceil(totalPanels / 2) + 8
      const sealMeters = totalPanels * 4

      const results = {
        tankDimensions: { length, width, height },
        volume: {
          volumeML,
          volumeTier,
          volumeDisplay: `${(volumeML / 1000000).toFixed(2)}ML`
        },
        panels: {
          basePanels,
          wallPanels,
          roofPanels,
          totalPanels
        },
        hardware: {
          boltSets,
          sealMeters
        }
      }

      setTestResults(results)
      setLoading(false)

      console.log('✅ Basic calculations working:', results)

    } catch (err) {
      setError(err.message)
      setLoading(false)
      console.error('❌ Test failed:', err)
    }
  }

  const testDatabaseConnection = async () => {
    setLoading(true)
    setError(null)

    try {
      // Dynamic import to avoid SSR issues
      const { createClient } = await import('@supabase/supabase-js')

      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      )

      console.log('Testing database connection...')

      // Test database connection
      const { data, error } = await supabase
        .from('components')
        .select('*')
        .limit(5)

      if (error) throw error

      console.log('✅ Database connection successful! Found components:', data.length)

      // Test pricing query
      const { data: pricingData, error: pricingError } = await supabase
        .from('bom_pricing')
        .select(`
          *,
          components!inner(component_name, component_type),
          materials!inner(material_code, material_name),
          specifications!inner(spec_value)
        `)
        .eq('materials.material_code', 'SS316')
        .eq('volume_tier', '>6ML')
        .eq('is_current', true)
        .limit(5)

      if (pricingError) throw pricingError

      console.log('✅ Pricing query successful! Found pricing records:', pricingData.length)

      setTestResults({
        ...testResults,
        database: {
          connected: true,
          componentsFound: data.length,
          pricingRecords: pricingData.length,
          samplePricing: pricingData[0] || null
        }
      })

      setLoading(false)

    } catch (err) {
      console.error('❌ Database test failed:', err)
      setError(`Database Error: ${err.message}`)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🧪 Sunnik BOM Calculator - Test Suite</h1>
          <p className="text-gray-600">Testing core calculations and database connectivity</p>
        </div>

        {/* Test Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <button
            onClick={runSimpleTest}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '🔄 Testing...' : '🧮 Test Basic Calculations'}
          </button>

          <button
            onClick={testDatabaseConnection}
            disabled={loading}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '🔄 Testing...' : '🗄️ Test Database Connection'}
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="text-red-800 font-semibold mb-2">❌ Test Failed</h3>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Results Display */}
        {testResults && (
          <div className="space-y-6">

            {/* Tank Calculations */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">📐 Tank Calculations (5m × 5m × 3m)</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">Volume</h3>
                  <p className="text-2xl font-bold text-blue-600">{testResults.volume?.volumeDisplay}</p>
                  <p className="text-sm text-blue-700">Tier: {testResults.volume?.volumeTier}</p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-medium text-green-900 mb-2">Total Panels</h3>
                  <p className="text-2xl font-bold text-green-600">{testResults.panels?.totalPanels}</p>
                  <p className="text-sm text-green-700">
                    Base: {testResults.panels?.basePanels} |
                    Wall: {testResults.panels?.wallPanels} |
                    Roof: {testResults.panels?.roofPanels}
                  </p>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="font-medium text-yellow-900 mb-2">Hardware</h3>
                  <p className="text-lg font-bold text-yellow-600">
                    {testResults.hardware?.boltSets} Bolt Sets
                  </p>
                  <p className="text-sm text-yellow-700">{testResults.hardware?.sealMeters}m Seals</p>
                </div>
              </div>
            </div>

            {/* Database Status */}
            {testResults.database && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">🗄️ Database Status</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-medium text-green-900 mb-2">✅ Connection Status</h3>
                    <p className="text-green-700">Successfully connected to Supabase</p>
                    <p className="text-sm text-green-600 mt-1">
                      Found {testResults.database.componentsFound} components
                    </p>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-medium text-blue-900 mb-2">💰 Pricing Data</h3>
                    <p className="text-blue-700">{testResults.database.pricingRecords} SS316 pricing records</p>
                    {testResults.database.samplePricing && (
                      <p className="text-sm text-blue-600 mt-1">
                        Sample: RM {testResults.database.samplePricing.price_myr}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Next Steps */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">🚀 Next Steps</h3>
              <div className="space-y-2 text-blue-800">
                <p>✅ <strong>Basic calculations:</strong> Panel quantities and volume calculations working</p>
                {testResults.database ? (
                  <p>✅ <strong>Database connectivity:</strong> Successfully connected to Supabase with pricing data</p>
                ) : (
                  <p>⏳ <strong>Database test:</strong> Click &quot;Test Database Connection&quot; to verify Supabase integration</p>
                )}
                <p>🎯 <strong>Ready for:</strong> Building the full calculator interface with material selection</p>
              </div>
            </div>

          </div>
        )}

        {/* Initial State */}
        {!testResults && !error && !loading && (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Ready to Test BOM Engine</h2>
            <p className="text-gray-600 mb-6">
              Click the buttons above to test the tank calculation logic and database connectivity.
            </p>
            <div className="text-sm text-gray-500">
              <p>Test 1: Validates panel quantity calculations and volume determination</p>
              <p>Test 2: Verifies Supabase connection and pricing data availability</p>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
