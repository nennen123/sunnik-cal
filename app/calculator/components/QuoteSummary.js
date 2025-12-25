// app/calculator/components/QuoteSummary.js
// Version: 1.3.0
// Updated: Fixed dimension display to use actual dimensions (dimensionMode conversion)

'use client';

import { useState } from 'react';

export default function QuoteSummary({ bom, inputs }) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState(null);

  const materialNames = {
    'SS316': 'Stainless Steel 316',
    'SS304': 'Stainless Steel 304',
    'HDG': 'Hot Dip Galvanized',
    'MS': 'Mild Steel Painted',
    'FRP': 'Fiberglass Reinforced Plastic'
  };

  const buildStandardNames = {
    'BSI': 'BSI (British Standard)',
    'LPCB': 'LPCB (Loss Prevention)',
    'SANS': 'SANS 10329:2020',
    'MS1390': 'MS1390:2010 (SPAN)',
    'SS245': 'SS245:2014 (Singapore)'
  };

  const panelTypeNames = {
    'm': 'Metric (1m × 1m)',
    'i': 'Imperial (4ft × 4ft)'
  };

  // Calculate actual dimensions based on dimension mode and panel type
  const panelSize = inputs.panelType === 'i' ? 1.22 : 1.0;
  const dimensionMode = inputs.dimensionMode || 'panel';

  // Actual dimensions in meters
  const actualLength = dimensionMode === 'panel' ? inputs.length * panelSize : inputs.length;
  const actualWidth = dimensionMode === 'panel' ? inputs.width * panelSize : inputs.width;
  const actualHeight = dimensionMode === 'panel' ? inputs.height * panelSize : inputs.height;

  const volume = actualLength * actualWidth * actualHeight;
  const volumeLiters = volume * 1000;
  const effectiveVolume = actualLength * actualWidth * (actualHeight - (inputs.freeboard || 0.2));
  const effectiveVolumeLiters = effectiveVolume * 1000;

  // Format dimensions string
  let dimensionsStr = `${actualLength.toFixed(actualLength % 1 === 0 ? 0 : 2)}m × ${actualWidth.toFixed(actualWidth % 1 === 0 ? 0 : 2)}m × ${actualHeight.toFixed(actualHeight % 1 === 0 ? 0 : 2)}m`;
  if (inputs.panelType === 'i' && dimensionMode === 'panel') {
    // For Imperial panels in panel mode, show feet too
    const lengthFt = inputs.length * 4;
    const widthFt = inputs.width * 4;
    const heightFt = inputs.height * 4;
    dimensionsStr = `${lengthFt}'×${widthFt}'×${heightFt}' (${actualLength.toFixed(2)}m×${actualWidth.toFixed(2)}m×${actualHeight.toFixed(2)}m)`;
  }

  // Helper function to get support type display
  const getSupportTypeDisplay = () => {
    const hasInternal = inputs.internalSupport === true;
    const hasExternal = inputs.externalSupport === true;
    if (hasInternal && hasExternal) return 'Internal + External';
    if (hasInternal) return 'Internal';
    if (hasExternal) return 'External';
    return 'None';
  };

  // Handle PDF Export
  const handleExportPDF = async () => {
    setIsExporting(true);
    setExportError(null);

    try {
      // Dynamic import to avoid SSR issues
      const { generatePDF } = await import('../../lib/pdfGenerator');
      const fileName = await generatePDF(bom, inputs);
      console.log(`✅ PDF exported: ${fileName}`);
    } catch (error) {
      console.error('PDF export error:', error);
      setExportError('Failed to export PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-lg p-6 text-white">
      {/* Header Row */}
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
          <div className="text-xs text-blue-200">
            Effective capacity
          </div>
          <div className="text-sm text-blue-100 mt-1">
            ({volumeLiters.toLocaleString()} L nominal)
          </div>
        </div>
      </div>

      {/* Specification Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {/* Dimensions */}
        <div className="bg-white bg-opacity-10 rounded-lg p-3">
          <div className="text-xs uppercase tracking-wide text-blue-200 mb-1">
            Dimensions
          </div>
          <div className="font-semibold text-sm">
            {dimensionsStr}
          </div>
        </div>

        {/* Material */}
        <div className="bg-white bg-opacity-10 rounded-lg p-3">
          <div className="text-xs uppercase tracking-wide text-blue-200 mb-1">
            Material
          </div>
          <div className="font-semibold text-sm">
            {inputs.material}
          </div>
        </div>

        {/* Build Standard */}
        <div className="bg-white bg-opacity-10 rounded-lg p-3">
          <div className="text-xs uppercase tracking-wide text-blue-200 mb-1">
            Build Standard
          </div>
          <div className="font-semibold text-sm">
            {inputs.buildStandard || 'BSI'}
          </div>
        </div>

        {/* Panel Type */}
        <div className="bg-white bg-opacity-10 rounded-lg p-3">
          <div className="text-xs uppercase tracking-wide text-blue-200 mb-1">
            Panel Type
          </div>
          <div className="font-semibold text-sm">
            {inputs.panelType === 'm' ? 'Metric' : 'Imperial'} T{inputs.panelTypeDetail || 1}
          </div>
        </div>

        {/* Partitions */}
        <div className="bg-white bg-opacity-10 rounded-lg p-3">
          <div className="text-xs uppercase tracking-wide text-blue-200 mb-1">
            Partitions
          </div>
          <div className="font-semibold text-sm">
            {inputs.partitionCount > 0 ? inputs.partitionCount : 'None'}
          </div>
        </div>

        {/* Support */}
        <div className="bg-white bg-opacity-10 rounded-lg p-3">
          <div className="text-xs uppercase tracking-wide text-blue-200 mb-1">
            Support
          </div>
          <div className="font-semibold text-sm">
            {getSupportTypeDisplay()}
          </div>
        </div>

        {/* Roof */}
        <div className="bg-white bg-opacity-10 rounded-lg p-3">
          <div className="text-xs uppercase tracking-wide text-blue-200 mb-1">
            Roof
          </div>
          <div className="font-semibold text-sm">
            {inputs.roofThickness || 1.5}mm
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-t border-b border-blue-400">
        <div className="text-center">
          <div className="text-2xl font-bold">
            {bom.summary.totalPanels}
          </div>
          <div className="text-xs text-blue-200 uppercase tracking-wide">
            Total Panels
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold">
            {(bom.base?.length || 0) + (bom.walls?.length || 0) + (bom.partition?.length || 0) + (bom.roof?.length || 0) + (bom.supports?.length || 0) + (bom.accessories?.length || 0)}
          </div>
          <div className="text-xs text-blue-200 uppercase tracking-wide">
            Line Items
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold">
            {inputs.pipeFittings?.length || 0}
          </div>
          <div className="text-xs text-blue-200 uppercase tracking-wide">
            Pipe Fittings
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-300">
            RM {bom.summary.totalCost.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-blue-200 uppercase tracking-wide">
            Total Cost
          </div>
        </div>
      </div>

      {/* Export Button */}
      <div className="mt-6 flex justify-center">
        <button
          onClick={handleExportPDF}
          disabled={isExporting}
          className={`
            flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-lg
            transition-all duration-200 shadow-lg
            ${isExporting
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-white text-blue-700 hover:bg-blue-50 hover:shadow-xl active:scale-95'
            }
          `}
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
              <span>Export PDF Quote</span>
            </>
          )}
        </button>
      </div>

      {/* Error Message */}
      {exportError && (
        <div className="mt-4 p-3 bg-red-500 bg-opacity-20 border border-red-400 rounded-lg text-center">
          <p className="text-red-100 text-sm">{exportError}</p>
        </div>
      )}

      {/* Build Standard Info */}
      {bom.summary.buildStandard && (
        <div className="mt-4 text-center text-xs text-blue-200">
          {bom.summary.buildStandard === 'LPCB' && '🔥 LPCB: Includes Vortex Pipe for fire protection'}
          {bom.summary.buildStandard === 'MS1390' && '🇲🇾 MS1390: EPDM sealant, ABS roof pipe (SPAN approved)'}
          {bom.summary.buildStandard === 'SS245' && '🇸🇬 SS245: PVC Foam sealant, UPVC roof pipe'}
        </div>
      )}
    </div>
  );
}
