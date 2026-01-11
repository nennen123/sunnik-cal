'use client';

// app/calculator/page.js
// Version: 2.1.0
// Updated: Added dimensionMode state for panel count vs meter input toggle
// Preserved: Phase 2 functionality (partitionPositions, stays/cleats, Supabase pricing)

import { useState, useEffect } from 'react';
import { calculateBOM } from '../lib/bomCalculator';
import { loadPrices, getPrice, getCacheStatus } from '../lib/supabasePriceLoader';
import TankInputs from './components/TankInputs';
import BOMResults from './components/BOMResults';
import QuoteSummary from './components/QuoteSummary';
import { calculateCleats } from '../lib/cleatCalculator';

export default function CalculatorPage() {
  const [inputs, setInputs] = useState({
    length: 5,
    width: 4,
    height: 3,
    freeboard: 0.2,  // Default 200mm in meters
    dimensionMode: 'panel',  // 'panel' = panel count input, 'meter' = actual meter input
    panelType: 'm',
    panelTypeDetail: 1,  // Type 1 or Type 2
    material: 'SS316',
    buildStandard: 'BSI',  // Default build standard for steel
    // Phase 2: Partition configuration
    partitionCount: 0,
    partitionDirection: 'width',  // 'width' or 'length'
    partitionPositions: null,  // Array of panel positions (null = auto-distribute)
    // Existing fields
    roofThickness: 1.5,
    internalSupport: true,   // Default ON for steel tanks (stay system)
    externalSupport: false,  // Default OFF (user enables if needed)
    iBeamSize: '150x75',
    wliMaterial: 'Ball Type',
    internalLadderQty: 1,
    internalLadderMaterial: 'HDG',
    externalLadderQty: 1,
    externalLadderMaterial: 'HDG',
    safetyCage: true,
    bnwMaterial: 'HDG',
    pipeFittings: []  // Array of pipe fitting configurations
  });

  const [bom, setBOM] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [prices, setPrices] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load prices from Supabase on component mount
  useEffect(() => {
    async function initPrices() {
      setLoading(true);
      setError(null);

      try {
        console.log('🔄 Initializing price data from Supabase...');
        const priceData = await loadPrices();

        if (!priceData || Object.keys(priceData).length === 0) {
          throw new Error('No price data loaded from database');
        }

        setPrices(priceData);
        console.log(`✅ Successfully loaded ${Object.keys(priceData).length} prices`);

      } catch (err) {
        console.error('❌ Failed to load prices:', err);
        setError(err.message || 'Failed to load pricing database');
      } finally {
        setLoading(false);
      }
    }

    initPrices();
  }, []);

  const handleCalculate = () => {
    if (!prices || Object.keys(prices).length === 0) {
      alert('⚠️ Price database not loaded. Please refresh the page.');
      return;
    }

    try {
      // DEBUG: Log key inputs to verify they're being passed correctly
      console.log('🔧 Calculating BOM with inputs:', inputs);
      console.log('🔧 dimensionMode:', inputs.dimensionMode);
      console.log('🔧 buildStandard value:', inputs.buildStandard);
      console.log('🔧 panelTypeDetail (Type 1/2):', inputs.panelTypeDetail);
      console.log('🔧 partitionCount:', inputs.partitionCount);
      console.log('🔧 partitionDirection:', inputs.partitionDirection);
      console.log('🔧 partitionPositions:', inputs.partitionPositions);

      // Calculate BOM structure
      const result = calculateBOM(inputs);

      // Calculate cleats using validated cleatCalculator (v2.3.0)
      if (inputs.material !== 'FRP') {
        const cleatsResult = calculateCleats({
          length: inputs.length,
          width: inputs.width,
          height: inputs.height,
          panelType: inputs.panelType,
          material: inputs.material,
          tankType: parseInt(inputs.panelTypeDetail) || 2,
          partitionCount: inputs.partitionCount || 0
        });
        result.cleats = cleatsResult;
      }

      // Apply prices from Supabase to all BOM items
      const applyPrices = (items) => {
        return items.map(item => {
          const price = getPrice(prices, item.sku);
          return {
            ...item,
            unitPrice: price,
            totalPrice: price * item.quantity
          };
        });
      };

      // Apply prices to all sections
      result.base = applyPrices(result.base);
      result.walls = applyPrices(result.walls);
      result.partition = applyPrices(result.partition || []);
      result.roof = applyPrices(result.roof);

      // Apply prices to roof support
      result.roofSupport = applyPrices(result.roofSupport || []);

      // Phase 2: Apply prices to stays and cleats
      result.stays = applyPrices(result.stays || []);
      result.cleats = applyPrices(result.cleats || []);

      // Phase 3: Apply prices to FRP tie rods, hardware, stay plates
      result.tieRods = applyPrices(result.tieRods || []);
      result.hardware = applyPrices(result.hardware || []);
      result.stayPlates = applyPrices(result.stayPlates || []);

      // Apply prices to supports, accessories, and pipe fittings
      result.supports = applyPrices(result.supports || []);
      result.accessories = applyPrices(result.accessories || []);
      result.pipeFittings = applyPrices(result.pipeFittings || []);

      // Recalculate totals with real prices - INCLUDING all sections
      const allPanels = [
        ...result.base,
        ...result.walls,
        ...(result.partition || []),
        ...result.roof
      ];

      const allItems = [
        ...allPanels,
        ...(result.roofSupport || []),
        ...(result.stays || []),
        ...(result.cleats || []),
        ...(result.tieRods || []),
        ...(result.hardware || []),
        ...(result.stayPlates || []),
        ...(result.supports || []),
        ...(result.accessories || []),
        ...(result.pipeFittings || [])
      ];

      result.summary.totalPanels = allPanels.reduce((sum, item) => sum + item.quantity, 0);
      result.summary.totalCost = allItems.reduce((sum, item) => sum + (item.totalPrice || 0), 0);

      // Log calculation details
      console.log('📊 BOM Summary:', {
        totalPanels: result.summary.totalPanels,
        totalCost: result.summary.totalCost.toFixed(2),
        buildStandard: inputs.buildStandard,
        panelTypeDetail: inputs.panelTypeDetail,
        basePanels: result.base.length,
        wallPanels: result.walls.length,
        partitionPanels: result.partition?.length || 0,
        roofPanels: result.roof.length,
        stayItems: result.stays?.length || 0,
        cleatItems: result.cleats?.length || 0,
        // Phase 3: FRP tie rod items
        tieRodItems: result.tieRods?.length || 0,
        hardwareItems: result.hardware?.length || 0,
        stayPlateItems: result.stayPlates?.length || 0
      });

      // Check for placeholder prices (debugging)
      const placeholderItems = allItems.filter(item => item.unitPrice === 150 || item.unitPrice === 375);
      if (placeholderItems.length > 0) {
        console.warn(`⚠️  ${placeholderItems.length} items using placeholder prices:`,
          placeholderItems.map(i => i.sku)
        );
      }

      // Check for zero-priced stay/cleat items (expected until SKUs added)
      const zeroPricedStays = [...(result.stays || []), ...(result.cleats || [])]
        .filter(item => item.unitPrice === 0);
      if (zeroPricedStays.length > 0) {
        console.info(`ℹ️ ${zeroPricedStays.length} stay/cleat items at RM 0.00 (SKUs pending database)`);
      }

      setBOM(result);
      setShowResults(true);

    } catch (err) {
      console.error('❌ Calculation error:', err);
      alert(`Calculation failed: ${err.message}`);
    }
  };

  const handleReset = () => {
    setInputs({
      length: 5,
      width: 4,
      height: 3,
      freeboard: 0.2,
      dimensionMode: 'panel',  // Reset to panel mode
      panelType: 'm',
      panelTypeDetail: 1,
      material: 'SS316',
      buildStandard: 'BSI',
      // Phase 2: Reset partition config
      partitionCount: 0,
      partitionDirection: 'width',
      partitionPositions: null,
      // Existing
      roofThickness: 1.5,
      internalSupport: true,
      externalSupport: false,
      iBeamSize: '150x75',
      wliMaterial: 'Ball Type',
      internalLadderQty: 1,
      internalLadderMaterial: 'HDG',
      externalLadderQty: 1,
      externalLadderMaterial: 'HDG',
      safetyCage: true,
      bnwMaterial: 'HDG',
      pipeFittings: []
    });
    setBOM(null);
    setShowResults(false);
  };

  // Get cache status for display
  const cacheStatus = getCacheStatus();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Sunnik Tank Calculator
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Professional BOM & Quotation System
              </p>
            </div>

            <div className="text-right">
              {loading && (
                <p className="text-sm text-yellow-600">
                  ⏳ Loading price database...
                </p>
              )}
              {error && (
                <p className="text-sm text-red-600">
                  ❌ Error: {error}
                </p>
              )}
              {prices && !loading && !error && (
                <div className="text-sm">
                  <p className="text-green-600 font-medium">
                    ✓ {Object.keys(prices).length.toLocaleString()} SKUs loaded from Supabase
                  </p>
                  {cacheStatus.cached && (
                    <p className="text-gray-500 text-xs mt-1">
                      Cache: {(cacheStatus.age / 1000).toFixed(0)}s old,
                      expires in {(cacheStatus.expires / 1000).toFixed(0)}s
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Panel - Inputs */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-6 text-gray-800">
                Tank Configuration
              </h2>

              <TankInputs
                inputs={inputs}
                setInputs={setInputs}
              />

              <div className="mt-6 space-y-3">
                <button
                  onClick={handleCalculate}
                  disabled={loading || error}
                  className={`w-full font-semibold py-3 px-6 rounded-lg transition-colors ${
                    loading || error
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {loading ? 'Loading...' : 'Calculate BOM'}
                </button>

                <button
                  onClick={handleReset}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Reset
                </button>
              </div>

              {/* Database Status */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="text-sm font-semibold text-blue-900 mb-2">
                  Database Status
                </h3>
                <div className="text-xs text-blue-700 space-y-1">
                  <p>• Source: Supabase (live database)</p>
                  <p>• Pricing: market_final_price (customer quotes)</p>
                  <p>• Cache: Auto-refresh every 5 minutes</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Results */}
          <div className="lg:col-span-2">
            {showResults && bom ? (
              <div className="space-y-6">
                {/* Summary */}
                <QuoteSummary bom={bom} inputs={inputs} />

                {/* BOM Table */}
                <BOMResults bom={bom} inputs={inputs} />
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <div className="text-gray-400">
                  <svg className="mx-auto h-24 w-24 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="text-xl font-medium text-gray-600 mb-2">
                    No BOM Generated Yet
                  </h3>
                  <p className="text-gray-500">
                    {loading
                      ? 'Loading price database...'
                      : error
                      ? 'Please fix the database error and refresh'
                      : 'Enter tank dimensions and click "Calculate BOM" to generate the bill of materials'
                    }
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
// Version 2.1.0 - Added dimensionMode state + BUG-009 fix for narrow tank stays
