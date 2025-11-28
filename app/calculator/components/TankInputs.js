// app/calculator/components/TankInputs.js
// Version: 1.2.0
// Updated: Added Pipe Fittings & Accessories section
// Fixed: MS/HDG Tank Finish dropdowns (BUG-008)

import { useState } from 'react';

export default function TankInputs({ inputs, setInputs }) {
  const handleChange = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  // Handle material change with FRP logic
  const handleMaterialChange = (material) => {
    if (material === 'FRP') {
      // FRP is always Metric Type 2, with FRP-specific build standard
      setInputs(prev => ({
        ...prev,
        material: 'FRP',
        panelType: 'm',
        panelTypeDetail: 2,
        buildStandard: 'MS1390'
      }));
    } else {
      // Switch to steel build standard if coming from FRP
      setInputs(prev => ({
        ...prev,
        material,
        buildStandard: prev.buildStandard === 'MS1390' || prev.buildStandard === 'SS245'
          ? 'BSI'
          : prev.buildStandard
      }));
    }
  };

  // ==========================================
  // PIPE FITTINGS STATE & HANDLERS
  // ==========================================

  // Default pipe fitting template
  const defaultPipeFitting = {
    id: Date.now(),
    opening: 'Outlet',
    flangeType: 'PN16',
    size: '100',
    outsideMaterial: 'SS316',
    outsideItem: 'Flange',
    insideMaterial: 'SS316',
    insideItem: 'Socket',
    quantity: 1
  };

  // Initialize pipe fittings array if not exists
  const pipeFittings = inputs.pipeFittings || [];

  // Add new pipe fitting
  const addPipeFitting = () => {
    const newFitting = {
      ...defaultPipeFitting,
      id: Date.now(),
      // Default material to match tank material
      outsideMaterial: inputs.material === 'FRP' ? 'HDG' :
                       inputs.material === 'MS' ? 'MS' :
                       inputs.material === 'HDG' ? 'HDG' : inputs.material,
      insideMaterial: inputs.material === 'FRP' ? 'HDG' :
                      inputs.material === 'MS' ? 'MS' :
                      inputs.material === 'HDG' ? 'HDG' : inputs.material
    };
    handleChange('pipeFittings', [...pipeFittings, newFitting]);
  };

  // Update pipe fitting
  const updatePipeFitting = (id, field, value) => {
    const updated = pipeFittings.map(pf =>
      pf.id === id ? { ...pf, [field]: value } : pf
    );
    handleChange('pipeFittings', updated);
  };

  // Remove pipe fitting
  const removePipeFitting = (id) => {
    const filtered = pipeFittings.filter(pf => pf.id !== id);
    handleChange('pipeFittings', filtered);
  };

  // Check if FRP is selected (disable panel type controls)
  const isFRP = inputs.material === 'FRP';

  // Pipe fitting options
  const OPENING_TYPES = ['Inlet', 'Outlet', 'Overflow/Warning', 'Drain', 'Balancing'];
  const FLANGE_TYPES = ['PN16', 'Table E', 'ANSI', 'JIS 10K', 'JAMNUT'];
  const PIPE_SIZES = [
    { value: '50', label: '2" (50mm)' },
    { value: '65', label: '2½" (65mm)' },
    { value: '80', label: '3" (80mm)' },
    { value: '100', label: '4" (100mm)' },
    { value: '150', label: '6" (150mm)' },
    { value: '200', label: '8" (200mm)' },
    { value: '250', label: '10" (250mm)' },
    { value: '300', label: '12" (300mm)' }
  ];
  const PIPE_MATERIALS = ['MS', 'HDG', 'SS304', 'SS316'];
  const OUTSIDE_ITEMS = ['Flange', 'S/F Nozzle', 'D/F Nozzle', 'Socket'];
  const INSIDE_ITEMS = ['Flange', 'S/F Nozzle', 'D/F Nozzle', 'Socket', 'Vortex Inhibitor'];

  return (
    <div className="space-y-5">
      {/* Material Selector - MOVED TO TOP */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Material
        </label>
        <select
          value={inputs.material}
          onChange={(e) => handleMaterialChange(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="SS316">SS316 (Stainless Steel 316)</option>
          <option value="SS304">SS304 (Stainless Steel 304)</option>
          <option value="HDG">HDG (Hot Dip Galvanized)</option>
          <option value="MS">MS (Mild Steel)</option>
          <option value="FRP">FRP (Fiberglass)</option>
        </select>
        {isFRP && (
          <p className="text-xs text-blue-600 mt-1">
            ℹ️ FRP panels are Metric (1m) Type 2 only
          </p>
        )}
      </div>

      {/* Build Standard Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Build Standard
        </label>
        <select
          value={inputs.buildStandard || (isFRP ? 'MS1390' : 'BSI')}
          onChange={(e) => handleChange('buildStandard', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {isFRP ? (
            <>
              <option value="MS1390">MS1390:2010 (Malaysian - SPAN Approved)</option>
              <option value="SS245">SS245:2014 (Singapore Standard)</option>
            </>
          ) : (
            <>
              <option value="BSI">BSI (British Standard)</option>
              <option value="LPCB">LPCB (Loss Prevention Certification Board)</option>
              <option value="SANS">SANS 10329:2020 (South African)</option>
            </>
          )}
        </select>
        <p className="text-xs text-gray-500 mt-1">
          {isFRP ? (
            inputs.buildStandard === 'MS1390'
              ? 'Malaysian Standard - EPDM sealant, ABS roof pipe'
              : 'Singapore Standard - PVC Foam sealant, UPVC roof pipe'
          ) : (
            <>
              {inputs.buildStandard === 'SANS' && 'Progressive thickness based on height'}
              {inputs.buildStandard === 'BSI' && '5mm (1-3 panels), 6mm base (4+ panels)'}
              {inputs.buildStandard === 'LPCB' && '5mm (1-3 panels), 6mm base (4+ panels) + Vortex Pipe'}
            </>
          )}
        </p>
      </div>

      {/* Panel Type Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Panel Type
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => !isFRP && handleChange('panelType', 'm')}
            disabled={isFRP}
            className={`py-2 px-4 rounded-lg font-medium transition-colors ${
              inputs.panelType === 'm'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } ${isFRP ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Metric (1m)
          </button>
          <button
            onClick={() => !isFRP && handleChange('panelType', 'i')}
            disabled={isFRP}
            className={`py-2 px-4 rounded-lg font-medium transition-colors ${
              inputs.panelType === 'i'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } ${isFRP ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Imperial (4ft)
          </button>
        </div>
      </div>

      {/* Panel Type Detail */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Panel Type Detail
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => !isFRP && handleChange('panelTypeDetail', 1)}
            disabled={isFRP}
            className={`py-2 px-4 rounded-lg font-medium transition-colors ${
              (inputs.panelTypeDetail || 1) === 1
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } ${isFRP ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Type 1
          </button>
          <button
            onClick={() => !isFRP && handleChange('panelTypeDetail', 2)}
            disabled={isFRP}
            className={`py-2 px-4 rounded-lg font-medium transition-colors ${
              (inputs.panelTypeDetail || 1) === 2
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } ${isFRP ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Type 2
          </button>
        </div>
      </div>

      {/* Tank Dimensions */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-800 uppercase">
          Tank Dimensions ({inputs.panelType === 'm' ? 'meters' : 'feet'})
        </h3>

        {/* Length */}
        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Length
          </label>
          <input
            type="number"
            min="1"
            max="50"
            step="0.1"
            value={inputs.length || ''}
            onChange={(e) => handleChange('length', parseFloat(e.target.value) || 0)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Width */}
        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Width
          </label>
          <input
            type="number"
            min="1"
            max="50"
            step="0.1"
            value={inputs.width || ''}
            onChange={(e) => handleChange('width', parseFloat(e.target.value) || 0)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Height */}
        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Height
          </label>
          <input
            type="number"
            min="1"
            max="20"
            step="0.1"
            value={inputs.height || ''}
            onChange={(e) => handleChange('height', parseFloat(e.target.value) || 0)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Freeboard */}
        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Freeboard (meters)
          </label>
          <input
            type="number"
            min="0.2"
            max="1"
            step="0.1"
            value={inputs.freeboard || 0.2}
            onChange={(e) => handleChange('freeboard', Math.max(0.2, parseFloat(e.target.value) || 0.2))}
            placeholder="0.2"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            Default: 0.2m (200mm minimum air gap at top)
          </p>
        </div>
      </div>

      {/* HDG Tank Finish (only show if HDG is selected) */}
      {inputs.material === 'HDG' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            HDG Tank Finish
          </label>
          <select
            value={inputs.hdgTankFinish || 'HDG'}
            onChange={(e) => handleChange('hdgTankFinish', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="HDG">HDG (Standard)</option>
            <option value="HDG+HDPE">HDG + HDPE Lining</option>
            <option value="HDGEBS">HDG + Epoxy Both Sides</option>
            <option value="HDGEBS+HDPE">HDG + Epoxy Both Sides + HDPE</option>
          </select>
        </div>
      )}

      {/* MS Tank Finish (only show if MS is selected) */}
      {inputs.material === 'MS' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            MS Tank Finish
          </label>
          <select
            value={inputs.msTankFinish || 'Primer'}
            onChange={(e) => handleChange('msTankFinish', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="Primer">Primer Coated</option>
            <option value="MS+HDPE">MS + HDPE Lining</option>
            <option value="MSEBS">MS + Epoxy Both Sides</option>
            <option value="MSEBS+HDPE">MS + Epoxy Both Sides + HDPE</option>
          </select>
        </div>
      )}

      {/* Partition Count */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Number of Partitions
        </label>
        <input
          type="number"
          min="0"
          max="10"
          value={inputs.partitionCount || 0}
          onChange={(e) => handleChange('partitionCount', parseInt(e.target.value) || 0)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-500 mt-1">
          Partitions run across the shorter side
        </p>
      </div>

      {/* Roof Thickness */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Roof Thickness
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleChange('roofThickness', 1.5)}
            className={`py-2 px-4 rounded-lg font-medium transition-colors ${
              inputs.roofThickness === 1.5
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            1.5mm (Standard)
          </button>
          <button
            onClick={() => handleChange('roofThickness', 3.0)}
            className={`py-2 px-4 rounded-lg font-medium transition-colors ${
              inputs.roofThickness === 3.0
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            3.0mm (Custom)
          </button>
        </div>
      </div>

      {/* Support Structure Options */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Support Structure
        </label>

        {/* Internal Support */}
        <div className="flex items-center mb-3">
          <input
            type="checkbox"
            id="internalSupport"
            checked={inputs.internalSupport || false}
            onChange={(e) => handleChange('internalSupport', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="internalSupport" className="ml-2 text-sm text-gray-700">
            Internal Support (Tie Rods/Stays)
          </label>
        </div>

        {/* External Support */}
        <div className="flex items-center mb-3">
          <input
            type="checkbox"
            id="externalSupport"
            checked={inputs.externalSupport || false}
            onChange={(e) => handleChange('externalSupport', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="externalSupport" className="ml-2 text-sm text-gray-700">
            External Support (I-Beams)
          </label>
        </div>

        {/* I-Beam Size Selector */}
        {inputs.externalSupport && (
          <div className="ml-6 mt-3">
            <label className="block text-xs text-gray-600 mb-2">
              I-Beam Size
            </label>
            <select
              value={inputs.iBeamSize || '150x75'}
              onChange={(e) => handleChange('iBeamSize', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="100x50">100mm × 50mm (Light duty)</option>
              <option value="150x75">150mm × 75mm (Standard)</option>
              <option value="200x100">200mm × 100mm (Heavy duty)</option>
              <option value="250x125">250mm × 125mm (Extra heavy)</option>
            </select>
          </div>
        )}
      </div>

      {/* ==========================================
          TANK ACCESSORIES SECTION (moved above Pipe Fittings)
          ========================================== */}
      <div className="border-t pt-5">
        <h3 className="text-sm font-semibold text-gray-800 uppercase mb-4">
          🔧 Tank Accessories
        </h3>

        {/* Water Level Indicator */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Water Level Indicator (WLI)
          </label>
          <select
            value={inputs.wliMaterial || 'None'}
            onChange={(e) => handleChange('wliMaterial', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="None">None</option>
            <option value="HDG">HDG (Hot Dip Galvanized)</option>
            <option value="MS">MS (Mild Steel)</option>
            <option value="SS316">SS316 (Stainless Steel 316)</option>
            <option value="SS304">SS304 (Stainless Steel 304)</option>
            <option value="PVC">PVC Tube</option>
          </select>
        </div>

        {/* Internal Ladder */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Internal Ladder
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                Quantity
              </label>
              <select
                value={inputs.internalLadderQty || 0}
                onChange={(e) => handleChange('internalLadderQty', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={0}>None</option>
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
                <option value={4}>4</option>
                <option value={5}>5</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">
                Material
              </label>
              <select
                value={inputs.internalLadderMaterial || 'HDG'}
                onChange={(e) => handleChange('internalLadderMaterial', e.target.value)}
                disabled={!inputs.internalLadderQty || inputs.internalLadderQty === 0}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="HDG">HDG</option>
                <option value="MS">MS</option>
                <option value="SS316">SS316</option>
                <option value="SS304">SS304</option>
                <option value="FRP">FRP</option>
                <option value="Aluminium">Aluminium</option>
              </select>
            </div>
          </div>
        </div>

        {/* External Ladder */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            External Ladder
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                Quantity
              </label>
              <select
                value={inputs.externalLadderQty || 0}
                onChange={(e) => handleChange('externalLadderQty', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={0}>None</option>
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
                <option value={4}>4</option>
                <option value={5}>5</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">
                Material
              </label>
              <select
                value={inputs.externalLadderMaterial || 'HDG'}
                onChange={(e) => handleChange('externalLadderMaterial', e.target.value)}
                disabled={!inputs.externalLadderQty || inputs.externalLadderQty === 0}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="HDG">HDG</option>
                <option value="MS">MS</option>
                <option value="SS316">SS316</option>
                <option value="SS304">SS304</option>
                <option value="FRP">FRP</option>
                <option value="Aluminium">Aluminium</option>
              </select>
            </div>
          </div>
        </div>

        {/* Safety Cage */}
        <div className="mb-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="safetyCage"
              checked={inputs.safetyCage || false}
              onChange={(e) => handleChange('safetyCage', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="safetyCage" className="ml-2 text-sm font-medium text-gray-700">
              Safety Cage (for external ladder)
            </label>
          </div>
          <p className="text-xs text-gray-500 ml-6 mt-1">
            Required when external ladder exceeds 3m height
          </p>
        </div>

        {/* Bolts, Nuts & Washers Material */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bolts, Nuts & Washers (BNW)
          </label>
          <select
            value={inputs.bnwMaterial || 'HDG'}
            onChange={(e) => handleChange('bnwMaterial', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="HDG">HDG (Hot Dip Galvanized)</option>
            <option value="MS">MS (Mild Steel)</option>
            <option value="ZP">ZP (Zinc Plated)</option>
            <option value="SS316">SS316 (Stainless Steel 316)</option>
            <option value="SS304">SS304 (Stainless Steel 304)</option>
            <option value="HDG-China">HDG (China)</option>
          </select>
        </div>
      </div>

      {/* ==========================================
          PIPE FITTINGS & ACCESSORIES SECTION
          ========================================== */}
      <div className="border-t pt-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-semibold text-gray-800 uppercase">
            🚰 Pipe Fittings & Accessories
          </h3>
          <button
            onClick={addPipeFitting}
            className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Add Fitting
          </button>
        </div>

        {pipeFittings.length === 0 ? (
          <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <p className="text-gray-500 text-sm">No pipe fittings added</p>
            <button
              onClick={addPipeFitting}
              className="mt-2 text-blue-600 text-sm hover:underline"
            >
              Click to add your first fitting
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {pipeFittings.map((fitting, index) => (
              <div
                key={fitting.id}
                className="bg-gray-50 rounded-lg p-4 border border-gray-200"
              >
                {/* Fitting Header */}
                <div className="flex justify-between items-center mb-3">
                  <span className="font-medium text-gray-700">
                    #{index + 1} - {fitting.opening} ({PIPE_SIZES.find(s => s.value === fitting.size)?.label || fitting.size})
                  </span>
                  <button
                    onClick={() => removePipeFitting(fitting.id)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    🗑️ Remove
                  </button>
                </div>

                {/* Row 1: Opening, Type, Size */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Opening</label>
                    <select
                      value={fitting.opening}
                      onChange={(e) => updatePipeFitting(fitting.id, 'opening', e.target.value)}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                    >
                      {OPENING_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Flange Type</label>
                    <select
                      value={fitting.flangeType}
                      onChange={(e) => updatePipeFitting(fitting.id, 'flangeType', e.target.value)}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                    >
                      {FLANGE_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Size</label>
                    <select
                      value={fitting.size}
                      onChange={(e) => updatePipeFitting(fitting.id, 'size', e.target.value)}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                    >
                      {PIPE_SIZES.map(size => (
                        <option key={size.value} value={size.value}>{size.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Row 2: Outside Tank */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Outside - Material</label>
                    <select
                      value={fitting.outsideMaterial}
                      onChange={(e) => updatePipeFitting(fitting.id, 'outsideMaterial', e.target.value)}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                    >
                      {PIPE_MATERIALS.map(mat => (
                        <option key={mat} value={mat}>{mat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Outside - Item</label>
                    <select
                      value={fitting.outsideItem}
                      onChange={(e) => updatePipeFitting(fitting.id, 'outsideItem', e.target.value)}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                    >
                      {OUTSIDE_ITEMS.map(item => (
                        <option key={item} value={item}>{item}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Row 3: Inside Tank */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Inside - Material</label>
                    <select
                      value={fitting.insideMaterial}
                      onChange={(e) => updatePipeFitting(fitting.id, 'insideMaterial', e.target.value)}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                    >
                      {PIPE_MATERIALS.map(mat => (
                        <option key={mat} value={mat}>{mat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Inside - Item</label>
                    <select
                      value={fitting.insideItem}
                      onChange={(e) => updatePipeFitting(fitting.id, 'insideItem', e.target.value)}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                    >
                      {INSIDE_ITEMS.map(item => (
                        <option key={item} value={item}>{item}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Row 4: Quantity */}
                <div className="w-24">
                  <label className="block text-xs text-gray-600 mb-1">Qty (Sets)</label>
                  <select
                    value={fitting.quantity}
                    onChange={(e) => updatePipeFitting(fitting.id, 'quantity', parseInt(e.target.value))}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>

                {/* LPCB Notice for Vortex Inhibitor */}
                {inputs.buildStandard === 'LPCB' && fitting.opening === 'Outlet' && fitting.insideItem !== 'Vortex Inhibitor' && (
                  <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-700">
                    ⚠️ LPCB standard requires Vortex Inhibitor on outlet connections
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pipe Fittings Summary */}
        {pipeFittings.length > 0 && (
          <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>{pipeFittings.length}</strong> pipe fitting(s) configured •
              Total sets: <strong>{pipeFittings.reduce((sum, pf) => sum + pf.quantity, 0)}</strong>
            </p>
          </div>
        )}
      </div>

      {/* Volume Display */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <div className="text-sm text-blue-800 font-medium mb-2">
          Tank Capacity
        </div>

        {/* Nominal Capacity */}
        <div className="mb-2">
          <div className="text-xs text-blue-600">Nominal (full height):</div>
          <div className="text-xl font-bold text-blue-900">
            {((inputs.length || 0) * (inputs.width || 0) * (inputs.height || 0) * 1000).toLocaleString()} L
          </div>
          <div className="text-xs text-blue-600">
            {((inputs.length || 0) * (inputs.width || 0) * (inputs.height || 0)).toFixed(2)} m³
          </div>
        </div>

        {/* Effective Capacity */}
        <div className="pt-2 border-t border-blue-200">
          <div className="text-xs text-blue-600">Effective (after freeboard):</div>
          <div className="text-xl font-bold text-blue-900">
            {((inputs.length || 0) * (inputs.width || 0) * ((inputs.height || 0) - (inputs.freeboard || 0.2)) * 1000).toLocaleString()} L
          </div>
          <div className="text-xs text-blue-600">
            {((inputs.length || 0) * (inputs.width || 0) * ((inputs.height || 0) - (inputs.freeboard || 0.2))).toFixed(2)} m³
          </div>
        </div>
      </div>
    </div>
  );
}
