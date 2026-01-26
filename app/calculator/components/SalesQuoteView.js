// app/calculator/components/SalesQuoteView.js
// Simplified quote view for sales users - shows final price only, no BOM details

'use client';

import { useState } from 'react';

export default function SalesQuoteView({ bom, inputs, markupPercentage, setMarkupPercentage, finalPrice }) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState(null);

  // Calculate actual dimensions based on dimension mode and panel type
  const panelSize = inputs.panelType === 'i' ? 1.22 : 1.0;
  const dimensionMode = inputs.dimensionMode || 'panel';

  const actualLength = dimensionMode === 'panel' ? inputs.length * panelSize : inputs.length;
  const actualWidth = dimensionMode === 'panel' ? inputs.width * panelSize : inputs.width;
  const actualHeight = dimensionMode === 'panel' ? inputs.height * panelSize : inputs.height;

  const volume = actualLength * actualWidth * actualHeight;
  const volumeLiters = volume * 1000;
  const effectiveVolume = actualLength * actualWidth * (actualHeight - (inputs.freeboard || 0.2));
  const effectiveVolumeLiters = effectiveVolume * 1000;

  const materialNames = {
    'SS316': 'Stainless Steel 316',
    'SS304': 'Stainless Steel 304',
    'HDG': 'Hot Dip Galvanized',
    'MS': 'Mild Steel Painted',
    'FRP': 'Fiberglass Reinforced Plastic'
  };

  // Handle PDF Export for sales
  const handleExportPDF = async () => {
    setIsExporting(true);
    setExportError(null);

    try {
      const { generateSalesPDF } = await import('../../lib/pdfGenerator');
      const fileName = await generateSalesPDF(bom, inputs, markupPercentage, finalPrice);
      console.log(`PDF exported: ${fileName}`);
    } catch (error) {
      console.error('PDF export error:', error);
      setExportError('Failed to export PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tank Specification Card */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-lg p-6 text-white">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-1">Tank Specification</h2>
            <p className="text-blue-100 text-sm">
              Generated on {new Date().toLocaleDateString('en-MY')}
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">
              {effectiveVolumeLiters.toLocaleString()} L
            </div>
            <div className="text-xs text-blue-200">Effective capacity</div>
          </div>
        </div>

        {/* Specs Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="bg-white bg-opacity-10 rounded-lg p-3">
            <div className="text-xs uppercase tracking-wide text-blue-200 mb-1">Dimensions</div>
            <div className="font-semibold text-sm">
              {actualLength.toFixed(1)}m x {actualWidth.toFixed(1)}m x {actualHeight.toFixed(1)}m
            </div>
          </div>
          <div className="bg-white bg-opacity-10 rounded-lg p-3">
            <div className="text-xs uppercase tracking-wide text-blue-200 mb-1">Material</div>
            <div className="font-semibold text-sm">{materialNames[inputs.material] || inputs.material}</div>
          </div>
          <div className="bg-white bg-opacity-10 rounded-lg p-3">
            <div className="text-xs uppercase tracking-wide text-blue-200 mb-1">Build Standard</div>
            <div className="font-semibold text-sm">{inputs.buildStandard || 'BSI'}</div>
          </div>
          <div className="bg-white bg-opacity-10 rounded-lg p-3">
            <div className="text-xs uppercase tracking-wide text-blue-200 mb-1">Panel Type</div>
            <div className="font-semibold text-sm">
              {inputs.panelType === 'm' ? 'Metric' : 'Imperial'} T{inputs.panelTypeDetail || 1}
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Card */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Quote Pricing</h3>

        {/* Markup Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Markup Percentage
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={markupPercentage}
              onChange={(e) => setMarkupPercentage(Number(e.target.value))}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="100"
                value={markupPercentage}
                onChange={(e) => setMarkupPercentage(Math.min(100, Math.max(0, Number(e.target.value))))}
                className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center font-semibold"
              />
              <span className="text-gray-600 font-medium">%</span>
            </div>
          </div>
        </div>

        {/* Price Display */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm uppercase tracking-wide opacity-90">Final Quote Price</div>
              <div className="text-xs mt-1 opacity-75">
                Including {markupPercentage}% markup
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold">
                RM {finalPrice.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        </div>

        {/* Export Button */}
        <div className="mt-6">
          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-lg font-semibold text-lg transition-all duration-200 ${
              isExporting
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
            }`}
          >
            {isExporting ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Generating PDF...</span>
              </>
            ) : (
              <>
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Generate Customer Quote PDF</span>
              </>
            )}
          </button>
        </div>

        {exportError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-center">
            <p className="text-red-600 text-sm">{exportError}</p>
          </div>
        )}
      </div>

      {/* Info Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> The generated PDF will show only the final quoted price to the customer.
          Itemized costs and markup percentages are not included in the customer quote.
        </p>
      </div>
    </div>
  );
}
