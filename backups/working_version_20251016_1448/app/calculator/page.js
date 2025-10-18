'use client';

// app/calculator/page.js
import { useState, useEffect } from 'react';
import { calculateBOM } from '../../lib/bomCalculator';
import { loadPrices, getPrice } from '../../lib/priceLoader';
import { generatePDF } from '../../lib/pdfGenerator';
import TankInputs from './components/TankInputs';
import BOMResults from './components/BOMResults';
import QuoteSummary from './components/QuoteSummary';

export default function CalculatorPage() {
  const [inputs, setInputs] = useState({
    length: 5,
    width: 4,
    height: 3,
    panelType: 'm',
    material: 'SS316',
    partitionCount: 0,
    roofThickness: 1.5
  });

  const [bom, setBOM] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [prices, setPrices] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pdfGenerating, setPdfGenerating] = useState(false);

  // Load prices on component mount
  useEffect(() => {
    async function initPrices() {
      setLoading(true);
      const priceData = await loadPrices();
      setPrices(priceData);
      setLoading(false);
    }
    initPrices();
  }, []);

  const handleCalculate = () => {
    const result = calculateBOM(inputs);

    // Apply prices to BOM items
    if (prices) {
      const applyPrices = (items) => {
        return items.map(item => ({
          ...item,
          unitPrice: getPrice(prices, item.sku)
        }));
      };

      result.base = applyPrices(result.base);
      result.walls = applyPrices(result.walls);
      result.partition = applyPrices(result.partition);
      result.roof = applyPrices(result.roof);

      // Recalculate totals with prices
      const allItems = [...result.base, ...result.walls, ...result.partition, ...result.roof];
      result.summary.totalCost = allItems.reduce((sum, item) =>
        sum + (item.quantity * item.unitPrice), 0
      );
    }

    setBOM(result);
    setShowResults(true);
  };

  const handleReset = () => {
    setInputs({
      length: 5,
      width: 4,
      height: 3,
      panelType: 'm',
      material: 'SS316',
      partitionCount: 0,
      roofThickness: 1.5
    });
    setBOM(null);
    setShowResults(false);
  };

  const handleDownloadPDF = async () => {
    if (!bom) return;

    setPdfGenerating(true);
    try {
      await generatePDF(bom, inputs);
      console.log('✅ PDF generated successfully!');
    } catch (error) {
      console.error('❌ Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setPdfGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading price database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            {/* Logo placeholder */}
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            {/* Title */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">
                Tank BOM Calculator
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                Professional water tank quotation system
              </p>
              {prices && (
                <p className="text-sm text-green-600 mt-1">
                  ✓ {Object.keys(prices).length.toLocaleString()} SKU prices loaded
                </p>
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
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Calculate BOM
                </button>

                {showResults && bom && (
                  <button
                    onClick={handleDownloadPDF}
                    disabled={pdfGenerating}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {pdfGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Download PDF Quote
                      </>
                    )}
                  </button>
                )}

                <button
                  onClick={handleReset}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Reset
                </button>
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
                    Enter tank dimensions and click "Calculate BOM" to generate the bill of materials
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
