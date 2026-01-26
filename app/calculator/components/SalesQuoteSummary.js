// app/calculator/components/SalesQuoteSummary.js
// Customer-friendly quotation view for sales users
// Shows grouped panel counts, accessories descriptions, NO SKU codes
// Version: 2.0.0 - Added auto-save with serial number

'use client';

import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { saveQuote } from '../../lib/quoteService';

export default function SalesQuoteSummary({ bom, inputs, markupPercentage, setMarkupPercentage, finalPrice }) {
  const { user } = useAuth();
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Customer information fields
  const [customerCompany, setCustomerCompany] = useState('');
  const [tankLocation, setTankLocation] = useState('');

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

  // Base price (before markup)
  const basePrice = bom.summary?.totalCost || 0;

  // Material names (customer-friendly)
  const materialNames = {
    'SS316': 'Stainless Steel 316',
    'SS304': 'Stainless Steel 304',
    'HDG': 'Hot Dip Galvanized Steel',
    'MS': 'Mild Steel (Painted)',
    'FRP': 'Fiberglass Reinforced Plastic'
  };

  // Build standard names (customer-friendly)
  const buildStandardNames = {
    'BSI': 'BSI (British Standard)',
    'LPCB': 'LPCB (Fire Protection)',
    'SANS': 'SANS 10329:2020',
    'MS1390': 'MS1390:2010 (SPAN Approved)',
    'SS245': 'SS245:2014 (Singapore)'
  };

  // Ladder material names
  const ladderMaterialNames = {
    'HDG': 'Hot Dip Galvanized',
    'SS304': 'Stainless Steel 304',
    'SS316': 'Stainless Steel 316'
  };

  // === PANEL COUNTS ===
  const basePanelCount = bom.base?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const wallPanelCount = bom.walls?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const roofPanelCount = bom.roof?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const partitionPanelCount = bom.partition?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const totalPanelCount = basePanelCount + wallPanelCount + roofPanelCount + partitionPanelCount;

  // === SUPPORT TYPE DESCRIPTION ===
  const getSupportDescription = () => {
    if (inputs.material === 'FRP') {
      return 'Internal Tie Rod System (SS304)';
    }
    const hasInternal = inputs.internalSupport === true;
    const hasExternal = inputs.externalSupport === true;
    if (hasInternal && hasExternal) return 'Internal Stay System + External I-Beam Bracing';
    if (hasInternal) return 'Internal Stay System';
    if (hasExternal) return 'External I-Beam Bracing';
    return 'Standard Panel Assembly';
  };

  // === ACCESSORIES LIST ===
  const getAccessoriesList = () => {
    const accessories = [];

    // Water Level Indicator
    if (inputs.wliMaterial) {
      accessories.push(`Water Level Indicator - ${inputs.wliMaterial}`);
    }

    // Internal Ladder
    if (inputs.internalLadderQty > 0) {
      const material = ladderMaterialNames[inputs.internalLadderMaterial] || inputs.internalLadderMaterial;
      accessories.push(`Internal Ladder (${material})${inputs.internalLadderQty > 1 ? ` x ${inputs.internalLadderQty}` : ''}`);
    }

    // External Ladder
    if (inputs.externalLadderQty > 0) {
      const material = ladderMaterialNames[inputs.externalLadderMaterial] || inputs.externalLadderMaterial;
      const withCage = inputs.safetyCage ? ' with Safety Cage' : '';
      accessories.push(`External Ladder (${material})${withCage}${inputs.externalLadderQty > 1 ? ` x ${inputs.externalLadderQty}` : ''}`);
    }

    // Manhole covers (from BOM accessories)
    const manholeItems = bom.accessories?.filter(item =>
      item.description?.toLowerCase().includes('manhole') ||
      item.sku?.toLowerCase().includes('mh')
    ) || [];
    if (manholeItems.length > 0) {
      const totalManholes = manholeItems.reduce((sum, item) => sum + item.quantity, 0);
      accessories.push(`Manhole Cover${totalManholes > 1 ? ` x ${totalManholes}` : ''}`);
    }

    // Sealant (always included)
    accessories.push('Sealant & Gaskets (Complete Set)');

    // Bolts, Nuts & Washers
    if (inputs.bnwMaterial) {
      const material = ladderMaterialNames[inputs.bnwMaterial] || inputs.bnwMaterial;
      accessories.push(`Bolts, Nuts & Washers Set (${material})`);
    }

    // Roof support beams (if external support)
    if (bom.roofSupport && bom.roofSupport.length > 0) {
      accessories.push('Roof Support Beams');
    }

    return accessories;
  };

  // === PIPE FITTINGS LIST ===
  const getPipeFittingsList = () => {
    if (!inputs.pipeFittings || inputs.pipeFittings.length === 0) return [];

    return inputs.pipeFittings.map(pf => {
      const flangeType = pf.flangeType || 'Flanged';
      const opening = pf.opening || 'Opening';
      return `${pf.size}mm ${flangeType} ${opening}${pf.quantity > 1 ? ` x ${pf.quantity}` : ''}`;
    });
  };

  const accessories = getAccessoriesList();
  const pipeFittings = getPipeFittingsList();

  // Handle PDF Export with auto-save
  const handleExportPDF = async () => {
    setExportError(null);
    setSuccessMessage(null);

    // Validate required fields
    if (!customerCompany.trim()) {
      setExportError('Please enter customer company name');
      return;
    }
    if (!tankLocation.trim()) {
      setExportError('Please enter tank location');
      return;
    }

    setIsExporting(true);

    try {
      // 1. Save quote to database and get serial number
      const { serialNumber, error: saveError } = await saveQuote({
        userId: user?.id,
        customerCompany: customerCompany.trim(),
        tankLocation: tankLocation.trim(),
        tankConfig: inputs,
        basePrice: basePrice,
        markupPercentage: markupPercentage,
        finalPrice: finalPrice
      });

      if (saveError) {
        console.error('Error saving quote:', saveError);
        setExportError(`Failed to save quote: ${saveError.message || 'Unknown error'}`);
        setIsExporting(false);
        return;
      }

      // 2. Generate PDF with serial number
      const { generateSalesPDF } = await import('../../lib/pdfGenerator');
      const fileName = await generateSalesPDF(
        bom,
        inputs,
        markupPercentage,
        finalPrice,
        serialNumber,
        customerCompany.trim(),
        tankLocation.trim()
      );

      console.log(`Quote saved and PDF exported: ${serialNumber} -> ${fileName}`);
      setSuccessMessage(`Quote ${serialNumber} saved successfully!`);

    } catch (error) {
      console.error('PDF export error:', error);
      setExportError('Failed to generate PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-lg p-6 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold mb-1">Customer Quotation</h2>
            <p className="text-blue-100 text-sm">
              Complete the form below to generate quote
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-blue-200">Date</div>
            <div className="font-semibold">
              {new Date().toLocaleDateString('en-MY', { day: '2-digit', month: 'short', year: 'numeric' })}
            </div>
          </div>
        </div>
      </div>

      {/* Customer Information - NEW */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          Customer Information
          <span className="text-red-500 text-sm font-normal ml-2">* Required</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Customer Company Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={customerCompany}
              onChange={(e) => setCustomerCompany(e.target.value)}
              placeholder="e.g., ABC Construction Sdn Bhd"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tank Location <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={tankLocation}
              onChange={(e) => setTankLocation(e.target.value)}
              placeholder="e.g., Kuala Lumpur, Malaysia"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Tank Configuration */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          Tank Configuration
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Dimensions</span>
              <span className="font-semibold text-gray-900">
                {actualLength.toFixed(1)}m x {actualWidth.toFixed(1)}m x {actualHeight.toFixed(1)}m
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Nominal Volume</span>
              <span className="font-semibold text-gray-900">{volumeLiters.toLocaleString()} Liters</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Effective Capacity</span>
              <span className="font-semibold text-gray-900">{effectiveVolumeLiters.toLocaleString()} Liters</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Material</span>
              <span className="font-semibold text-gray-900">{materialNames[inputs.material] || inputs.material}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Build Standard</span>
              <span className="font-semibold text-gray-900">{buildStandardNames[inputs.buildStandard] || inputs.buildStandard}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Partitions</span>
              <span className="font-semibold text-gray-900">
                {inputs.partitionCount > 0 ? `${inputs.partitionCount} compartment${inputs.partitionCount > 1 ? 's' : ''}` : 'None'}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Support Type</span>
              <span className="font-semibold text-gray-900 text-right">{getSupportDescription()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Panel Summary */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
          </svg>
          Panel Summary
        </h3>

        <div className="space-y-2">
          <div className="flex justify-between py-2 px-3 bg-blue-50 rounded">
            <span className="text-gray-700">Base / Floor Panels</span>
            <span className="font-semibold text-gray-900">{basePanelCount} panels</span>
          </div>
          <div className="flex justify-between py-2 px-3 bg-green-50 rounded">
            <span className="text-gray-700">Wall Panels</span>
            <span className="font-semibold text-gray-900">{wallPanelCount} panels</span>
          </div>
          <div className="flex justify-between py-2 px-3 bg-red-50 rounded">
            <span className="text-gray-700">Roof Panels</span>
            <span className="font-semibold text-gray-900">{roofPanelCount} panels</span>
          </div>
          {partitionPanelCount > 0 && (
            <div className="flex justify-between py-2 px-3 bg-yellow-50 rounded">
              <span className="text-gray-700">Partition Panels</span>
              <span className="font-semibold text-gray-900">{partitionPanelCount} panels</span>
            </div>
          )}
          <div className="flex justify-between py-3 px-3 bg-gray-800 text-white rounded-lg mt-3">
            <span className="font-semibold">TOTAL PANELS</span>
            <span className="font-bold text-lg">{totalPanelCount} panels</span>
          </div>
        </div>
      </div>

      {/* Included Accessories */}
      {accessories.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            Included Accessories
          </h3>

          <ul className="space-y-2">
            {accessories.map((item, index) => (
              <li key={index} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-700">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Pipe Fittings */}
      {pipeFittings.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
            </svg>
            Pipe Fittings
          </h3>

          <ul className="space-y-2">
            {pipeFittings.map((item, index) => (
              <li key={index} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                <svg className="w-4 h-4 text-orange-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-700">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Pricing Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Quotation Pricing
        </h3>

        {/* Markup Input */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-3">
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
              className="flex-1 h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="100"
                value={markupPercentage}
                onChange={(e) => setMarkupPercentage(Math.min(100, Math.max(0, Number(e.target.value))))}
                className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center font-semibold focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="text-gray-600 font-medium">%</span>
            </div>
          </div>
        </div>

        {/* Final Price Display */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm uppercase tracking-wide opacity-90 font-medium">Quoted Price</div>
              <div className="text-xs mt-1 opacity-75">
                Complete tank system
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
            className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-lg font-semibold text-lg transition-all duration-200 ${
              isExporting
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl active:scale-[0.98]'
            }`}
          >
            {isExporting ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Saving & Generating PDF...</span>
              </>
            ) : (
              <>
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Save & Generate Quote PDF</span>
              </>
            )}
          </button>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p className="text-green-800 font-medium">{successMessage}</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {exportError && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-red-600">{exportError}</p>
            </div>
          </div>
        )}
      </div>

      {/* Info Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Quotes are automatically saved with a unique serial number.
            The PDF shows only the final price to customers - individual costs and markup are not disclosed.
          </p>
        </div>
      </div>
    </div>
  );
}
