// app/calculator/components/SalesQuoteSummary.js
// Customer-friendly quotation view for sales users
// Shows grouped panel counts, accessories descriptions, NO SKU codes
// Version: 2.0.0 - Added auto-save with serial number

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { saveQuote, saveRevision, getBaseSerialNumber, detectChanges } from '../../lib/quoteService';

export default function SalesQuoteSummary({ bom, inputs, markupPercentage, setMarkupPercentage, finalPrice, role = 'sales', editingQuote = null }) {
  const { user } = useAuth();
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Customer information fields
  const [customerCompany, setCustomerCompany] = useState('');
  const [tankLocation, setTankLocation] = useState('');

  // Commission fields
  const [commissionType, setCommissionType] = useState('percentage');
  const [commissionValue, setCommissionValue] = useState(0);

  // Custom additional items
  const [customItems, setCustomItems] = useState([]);

  // Initialize state from loaded quote when editing
  useEffect(() => {
    if (!editingQuote) return;
    setCustomerCompany(editingQuote.customer_company || '');
    setTankLocation(editingQuote.tank_location || '');
    setCommissionType(editingQuote.commission_type || 'percentage');
    setCommissionValue(editingQuote.commission_value || 0);
    const loaded = editingQuote.custom_components || [];
    setCustomItems(loaded.map((item, i) => ({ ...item, id: item.id || Date.now() + i })));
  }, [editingQuote]);

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

  // Derived pricing: finalPrice prop = subtotal after markup
  const subtotalAfterMarkup = finalPrice;
  const commissionAmount = commissionType === 'percentage'
    ? subtotalAfterMarkup * (commissionValue / 100)
    : Number(commissionValue) || 0;
  const customItemsTotal = customItems.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
  const grandTotal = subtotalAfterMarkup + commissionAmount + customItemsTotal;

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

  // Custom items helpers
  const addCustomItem = () => {
    setCustomItems(prev => [...prev, { id: Date.now(), description: '', price: '' }]);
  };
  const updateCustomItem = (id, field, value) => {
    setCustomItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };
  const removeCustomItem = (id) => {
    setCustomItems(prev => prev.filter(item => item.id !== id));
  };

  // Handle Save & PDF Export
  // pdfType: 'quotation' | 'bom' | 'both'
  const handleSaveAndExport = async (pdfType = 'quotation') => {
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
      // 1. Save quote (new or revision) and get serial number
      const commonData = {
        userId: user?.id,
        customerCompany: customerCompany.trim(),
        tankLocation: tankLocation.trim(),
        tankConfig: inputs,
        basePrice: basePrice,
        markupPercentage: markupPercentage,
        finalPrice: grandTotal,
        commissionType: commissionAmount > 0 ? commissionType : null,
        commissionValue: commissionAmount > 0 ? commissionValue : 0,
        commissionAmount: commissionAmount,
        customComponents: customItems.filter(item => item.description && item.price)
      };

      let serialNumber, saveError;

      if (editingQuote) {
        // Save as revision
        const parentId = editingQuote.parent_quote_id || editingQuote.id;
        const baseSN = getBaseSerialNumber(editingQuote.serial_number);
        const changes = detectChanges(editingQuote, {
          tankConfig: inputs,
          markupPercentage,
          finalPrice: grandTotal,
          customerCompany: customerCompany.trim()
        });

        ({ serialNumber, error: saveError } = await saveRevision({
          ...commonData,
          parentQuoteId: parentId,
          baseSerialNumber: baseSN,
          changesSummary: changes
        }));
      } else {
        // Save as new quote
        ({ serialNumber, error: saveError } = await saveQuote(commonData));
      }

      if (saveError) {
        console.error('Error saving quote:', saveError);
        setExportError(`Failed to save quote: ${saveError.message || 'Unknown error'}`);
        setIsExporting(false);
        return;
      }

      // 2. Generate PDF(s) based on type
      const validCustomItems = customItems.filter(item => item.description && item.price);

      if (pdfType === 'quotation' || pdfType === 'both') {
        const { generateSalesPDF } = await import('../../lib/pdfGenerator');
        await generateSalesPDF(
          bom, inputs, markupPercentage, grandTotal, serialNumber,
          customerCompany.trim(), tankLocation.trim(),
          commissionAmount, validCustomItems, subtotalAfterMarkup
        );
      }

      if (pdfType === 'bom' || pdfType === 'both') {
        const { generatePDF } = await import('../../lib/pdfGenerator');
        await generatePDF(bom, inputs, serialNumber);
      }

      const pdfLabel = pdfType === 'both' ? 'PDFs' : 'PDF';
      console.log(`Quote saved and ${pdfLabel} exported: ${serialNumber}`);
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
            <h2 className="text-2xl font-bold mb-1">
              {editingQuote ? 'Revise Quotation' : 'Customer Quotation'}
            </h2>
            <p className="text-blue-100 text-sm">
              {editingQuote
                ? `Revising: ${editingQuote.serial_number}`
                : 'Complete the form below to generate quote'}
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

        {/* Commission Input */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Commission
          </label>
          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={() => { setCommissionType('percentage'); setCommissionValue(0); }}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                commissionType === 'percentage'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-100'
              }`}
            >
              Percentage
            </button>
            <button
              onClick={() => { setCommissionType('fixed'); setCommissionValue(0); }}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                commissionType === 'fixed'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-100'
              }`}
            >
              Fixed Amount
            </button>
          </div>
          <div className="flex items-center gap-2">
            {commissionType === 'fixed' && (
              <span className="text-gray-600 font-medium">RM</span>
            )}
            <input
              type="number"
              min="0"
              max={commissionType === 'percentage' ? 100 : undefined}
              step={commissionType === 'percentage' ? 1 : 100}
              value={commissionValue}
              onChange={(e) => setCommissionValue(Math.max(0, Number(e.target.value)))}
              className="w-32 px-3 py-2 border border-gray-300 rounded-lg text-center font-semibold focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {commissionType === 'percentage' && (
              <span className="text-gray-600 font-medium">%</span>
            )}
            {commissionAmount > 0 && (
              <span className="text-sm text-gray-500 ml-2">
                = RM {commissionAmount.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            )}
          </div>
        </div>

        {/* Custom Additional Items */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Additional Items
            </label>
            <button
              onClick={addCustomItem}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Item
            </button>
          </div>
          {customItems.length === 0 && (
            <p className="text-sm text-gray-400 italic">No additional items</p>
          )}
          {customItems.map((item) => (
            <div key={item.id} className="flex items-center gap-2 mb-2">
              <input
                type="text"
                value={item.description}
                onChange={(e) => updateCustomItem(item.id, 'description', e.target.value)}
                placeholder="Item description"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="flex items-center gap-1">
                <span className="text-gray-500 text-sm">RM</span>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={item.price}
                  onChange={(e) => updateCustomItem(item.id, 'price', e.target.value)}
                  placeholder="0.00"
                  className="w-28 px-3 py-2 border border-gray-300 rounded-lg text-sm text-right font-semibold focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <button
                onClick={() => removeCustomItem(item.id)}
                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Remove item"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
          {customItemsTotal > 0 && (
            <div className="flex justify-end mt-2 pt-2 border-t border-gray-200">
              <span className="text-sm text-gray-600">
                Items subtotal: <span className="font-semibold">RM {customItemsTotal.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </span>
            </div>
          )}
        </div>

        {/* Price Breakdown */}
        <div className="mb-4 space-y-2">
          <div className="flex justify-between text-sm text-gray-600 px-1">
            <span>Subtotal (after markup)</span>
            <span>RM {subtotalAfterMarkup.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          {commissionAmount > 0 && (
            <div className="flex justify-between text-sm text-gray-600 px-1">
              <span>Commission ({commissionType === 'percentage' ? `${commissionValue}%` : 'fixed'})</span>
              <span>RM {commissionAmount.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          )}
          {customItemsTotal > 0 && (
            <div className="flex justify-between text-sm text-gray-600 px-1">
              <span>Additional Items ({customItems.filter(i => i.description && i.price).length})</span>
              <span>RM {customItemsTotal.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          )}
        </div>

        {/* Grand Total Display */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm uppercase tracking-wide opacity-90 font-medium">Total Quoted Price</div>
              <div className="text-xs mt-1 opacity-75">
                Complete tank system{commissionAmount > 0 || customItemsTotal > 0 ? ' + additions' : ''}
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold">
                RM {grandTotal.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        </div>

        {/* Export Buttons */}
        <div className="mt-6 space-y-3">
          {isExporting ? (
            <div className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-lg bg-gray-300 text-gray-500">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="font-semibold text-lg">{editingQuote ? 'Saving Revision...' : 'Saving & Generating PDF...'}</span>
            </div>
          ) : role === 'sales' ? (
            /* Sales: single button */
            <button
              onClick={() => handleSaveAndExport('quotation')}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-lg font-semibold text-lg transition-all duration-200 bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl active:scale-[0.98]"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>{editingQuote ? 'Save as New Revision' : 'Save & Generate Quote PDF'}</span>
            </button>
          ) : (
            /* Admin: 3 buttons */
            <>
              <button
                onClick={() => handleSaveAndExport('quotation')}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-lg font-semibold text-lg transition-all duration-200 bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl active:scale-[0.98]"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>{editingQuote ? 'Save Revision & Quotation' : 'Save & Download Quotation'}</span>
              </button>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleSaveAndExport('bom')}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 bg-gray-700 text-white hover:bg-gray-800 shadow hover:shadow-lg active:scale-[0.98]"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>{editingQuote ? 'Revision & BOM' : 'Save & Full BOM'}</span>
                </button>
                <button
                  onClick={() => handleSaveAndExport('both')}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 bg-green-600 text-white hover:bg-green-700 shadow hover:shadow-lg active:scale-[0.98]"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  <span>{editingQuote ? 'Revision & Both' : 'Save & Both PDFs'}</span>
                </button>
              </div>
            </>
          )}
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
