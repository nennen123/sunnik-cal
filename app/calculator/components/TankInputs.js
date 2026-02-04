// app/calculator/components/TankInputs.js
// Version: 2.2.0
// Fixed: dimensionMode now uses inputs state as source of truth (not local state)
// Added: Dimension input mode toggle (panel count vs meter input)
// Fixed: Material change bug (HDG/MS selection)
// Updated: Smart partition positioning with auto-distribute and customize option
// Preserved: ALL v1.2.0 functionality (WLI 6 options, BNW 6 options, Tank Finish, Pipe Fittings)

import { useState, useEffect } from 'react';

export default function TankInputs({ inputs, setInputs }) {
  // Local state for customize mode
  const [customizePartitions, setCustomizePartitions] = useState(false);

  // Use inputs.dimensionMode as source of truth (default to 'panel' if not set)
  const dimensionMode = inputs.dimensionMode || 'panel';

  // Auto-update roof thickness when material or panel type changes
  useEffect(() => {
    if (inputs.material === 'SS316' || inputs.material === 'SS304') {
      setInputs(prev => ({ ...prev, roofThickness: prev.panelType === 'm' ? 1.0 : 1.2 }));
    } else {
      setInputs(prev => ({ ...prev, roofThickness: 1.5 }));
    }
  }, [inputs.material, inputs.panelType]);

  // Auto-select matching accessory materials based on tank material
  useEffect(() => {
    // MS tanks use HDG accessories (standard coating), all others match tank material
    const accessoryMat = inputs.material === 'MS' ? 'HDG' : inputs.material;
    if (['SS316', 'SS304', 'HDG', 'MS'].includes(inputs.material)) {
      setInputs(prev => ({
        ...prev,
        wliMaterial: accessoryMat,
        internalLadderMaterial: accessoryMat,
        externalLadderMaterial: accessoryMat,
        bnwMaterial: accessoryMat,
        pipeFittings: (prev.pipeFittings || []).map(pf => ({
          ...pf,
          outsideMaterial: accessoryMat,
          insideMaterial: accessoryMat
        }))
      }));
    }
  }, [inputs.material]);

  const handleChange = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  // Handle material change with FRP logic - FIXED
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
      // Steel tanks - FIXED: prev is now inside the callback
      setInputs(prev => ({
        ...prev,
        material,
        panelTypeDetail: (material === 'SS316' || material === 'SS304') ? 1 : prev.panelTypeDetail,
        buildStandard: (prev.buildStandard === 'MS1390' || prev.buildStandard === 'SS245')
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

  // Check if Stainless Steel (SS316/SS304 can only use Type 1) - Phase 2
  const isStainless = inputs.material === 'SS316' || inputs.material === 'SS304';

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

  // ==========================================
  // PARTITION POSITION CALCULATIONS (Phase 2)
  // ==========================================

  const panelSize = inputs.panelType === 'm' ? 1.0 : 1.22;
  const lengthPanels = Math.ceil((inputs.length || 1) / panelSize);
  const widthPanels = Math.ceil((inputs.width || 1) / panelSize);

  // Determine partition direction (default: across shorter side = width)
  const partitionAcrossLength = inputs.partitionDirection === 'length';
  const partitionSpanPanels = partitionAcrossLength ? lengthPanels : widthPanels;
  const partitionDimension = partitionAcrossLength ? inputs.length : inputs.width;

  // Calculate auto-distributed partition positions
  const getAutoDistributedPositions = (count) => {
    if (count === 0) return [];
    const positions = [];
    for (let i = 1; i <= count; i++) {
      // Distribute evenly: position = i * (totalPanels / (count + 1))
      const pos = Math.round(i * partitionSpanPanels / (count + 1));
      positions.push(Math.min(pos, partitionSpanPanels - 1)); // Ensure within bounds
    }
    return positions;
  };

  // Get current partition positions (either custom or auto)
  const getPartitionPositions = () => {
    const count = inputs.partitionCount || 0;
    if (count === 0) return [];

    // If custom positions exist and valid, use them
    if (customizePartitions && inputs.partitionPositions && inputs.partitionPositions.length === count) {
      return inputs.partitionPositions;
    }

    // Otherwise auto-distribute
    return getAutoDistributedPositions(count);
  };

  // Generate dropdown options for a partition position
  const getPositionOptions = (partitionIndex) => {
    const options = [];
    for (let i = 1; i < partitionSpanPanels; i++) {
      const position = i * panelSize;
      const remaining = partitionDimension - position;
      options.push({
        value: i,
        label: `After panel ${i} → ${position.toFixed(1)}${inputs.panelType === 'm' ? 'm' : 'ft'} | ${remaining.toFixed(1)}${inputs.panelType === 'm' ? 'm' : 'ft'}`
      });
    }
    return options;
  };

  // Update a specific partition position
  const updatePartitionPosition = (index, value) => {
    const currentPositions = getPartitionPositions();
    const newPositions = [...currentPositions];
    newPositions[index] = parseInt(value);
    // Sort to ensure positions are in order
    newPositions.sort((a, b) => a - b);
    handleChange('partitionPositions', newPositions);
  };

  // Calculate section sizes for preview
  const getSectionSizes = () => {
    const positions = getPartitionPositions();
    const count = inputs.partitionCount || 0;
    if (count === 0) return [partitionDimension];

    const sizes = [];
    let lastPos = 0;

    positions.forEach(pos => {
      sizes.push((pos - lastPos) * panelSize);
      lastPos = pos;
    });
    sizes.push((partitionSpanPanels - lastPos) * panelSize);

    return sizes;
  };

  // Reset to auto-distribution
  const resetToAutoDistribute = () => {
    const autoPositions = getAutoDistributedPositions(inputs.partitionCount || 0);
    handleChange('partitionPositions', autoPositions);
    setCustomizePartitions(false);
  };

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

      {/* Build Standard - Only for HDG, MS, and FRP (NOT SS materials) */}
      {inputs.material !== 'SS316' && inputs.material !== 'SS304' && (
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
      )}

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

      {/* Panel Type Detail - Updated for Phase 2 with SS316/SS304 restriction */}
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
            onClick={() => !isFRP && !isStainless && handleChange('panelTypeDetail', 2)}
            disabled={isFRP || isStainless}
            title={isStainless ? 'Type 2 not available for Stainless Steel' : ''}
            className={`py-2 px-4 rounded-lg font-medium transition-colors ${
              (inputs.panelTypeDetail || 1) === 2
                ? 'bg-blue-600 text-white'
                : isStainless
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } ${isFRP ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Type 2
          </button>
        </div>
        {/* Phase 2: Show warning for SS316/SS304 */}
        {isStainless && (
          <p className="text-xs text-amber-600 mt-1">
            ⚠️ SS316/SS304 only supports Type 1 panels (Type 2 not available)
          </p>
        )}
      </div>

      {/* Tank Dimensions */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-800 uppercase">
          Tank Dimensions
        </h3>

        {/* Dimension Input Mode Toggle */}
        <div className="mb-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Dimension Input Mode
          </label>
          <div className="flex gap-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="dimensionMode"
                value="panel"
                checked={dimensionMode === 'panel'}
                onChange={() => handleChange('dimensionMode', 'panel')}
                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">By Panel Count</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="dimensionMode"
                value="meter"
                checked={dimensionMode === 'meter'}
                onChange={() => handleChange('dimensionMode', 'meter')}
                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">By Meter</span>
            </label>
          </div>
        </div>

        {/* Actual dimensions summary */}
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
          <p className="text-xs text-blue-700 font-medium">
            Actual Size: {dimensionMode === 'panel'
              ? `${(inputs.length * panelSize).toFixed(2)}m × ${(inputs.width * panelSize).toFixed(2)}m × ${(inputs.height * panelSize).toFixed(2)}m`
              : `${inputs.length}m × ${inputs.width}m × ${inputs.height}m`
            }
            {inputs.panelType === 'i' && dimensionMode === 'panel' && (
              <span className="ml-2">
                ({Math.round(inputs.length * 4)}ft × {Math.round(inputs.width * 4)}ft × {Math.round(inputs.height * 4)}ft)
              </span>
            )}
          </p>
          {dimensionMode === 'panel' && (
            <p className="text-xs text-blue-600 mt-1">
              Panel count: {inputs.length} × {inputs.width} × {inputs.height} panels
            </p>
          )}
        </div>

        {/* Length */}
        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Length {dimensionMode === 'panel' ? '(panels)' : '(meters)'}
          </label>
          <input
            type="number"
            min="1"
            max={dimensionMode === 'panel' ? 50 : 60}
            step={dimensionMode === 'panel' ? 1 : 0.1}
            value={inputs.length || ''}
            onChange={(e) => handleChange('length', parseFloat(e.target.value) || 0)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {dimensionMode === 'panel' && (
            <p className="text-xs text-gray-500 mt-1">
              = {(inputs.length * panelSize).toFixed(2)}m
              {inputs.panelType === 'i' && ` (${Math.round(inputs.length * 4)}ft)`}
            </p>
          )}
        </div>

        {/* Width */}
        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Width {dimensionMode === 'panel' ? '(panels)' : '(meters)'}
          </label>
          <input
            type="number"
            min="1"
            max={dimensionMode === 'panel' ? 50 : 60}
            step={dimensionMode === 'panel' ? 1 : 0.1}
            value={inputs.width || ''}
            onChange={(e) => handleChange('width', parseFloat(e.target.value) || 0)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {dimensionMode === 'panel' && (
            <p className="text-xs text-gray-500 mt-1">
              = {(inputs.width * panelSize).toFixed(2)}m
              {inputs.panelType === 'i' && ` (${Math.round(inputs.width * 4)}ft)`}
            </p>
          )}
        </div>

        {/* Height */}
        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Height {dimensionMode === 'panel' ? '(panels)' : '(meters)'}
          </label>
          <input
            type="number"
            min="1"
            max={dimensionMode === 'panel' ? 20 : 25}
            step={dimensionMode === 'panel' ? 1 : 0.1}
            value={inputs.height || ''}
            onChange={(e) => handleChange('height', parseFloat(e.target.value) || 0)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {dimensionMode === 'panel' && (
            <p className="text-xs text-gray-500 mt-1">
              = {(inputs.height * panelSize).toFixed(2)}m
              {inputs.panelType === 'i' && ` (${Math.round(inputs.height * 4)}ft)`}
            </p>
          )}
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
          onChange={(e) => {
            const newCount = parseInt(e.target.value) || 0;
            handleChange('partitionCount', newCount);
            // Reset customize mode and positions when count changes
            setCustomizePartitions(false);
            handleChange('partitionPositions', getAutoDistributedPositions(newCount));
          }}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* ==========================================
          PARTITION CONFIGURATION (Phase 2 - Enhanced)
          Only show when partitions > 0
          ========================================== */}
      {inputs.partitionCount > 0 && (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium text-gray-700">Partition Configuration</h4>
            {!customizePartitions ? (
              <button
                onClick={() => {
                  setCustomizePartitions(true);
                  // Initialize custom positions with auto-distributed values
                  handleChange('partitionPositions', getAutoDistributedPositions(inputs.partitionCount));
                }}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
              >
                📐 Customize Positions
              </button>
            ) : (
              <button
                onClick={resetToAutoDistribute}
                className="text-xs text-gray-600 hover:text-gray-700 font-medium flex items-center gap-1"
              >
                ↺ Reset to Even
              </button>
            )}
          </div>

          {/* Partition Direction */}
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Partition Direction
            </label>
            <select
              value={inputs.partitionDirection || 'width'}
              onChange={(e) => {
                handleChange('partitionDirection', e.target.value);
                // Reset positions when direction changes
                handleChange('partitionPositions', null);
                setCustomizePartitions(false);
              }}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="width">
                Across Width ({inputs.width}{inputs.panelType === 'm' ? 'm' : ' panels'}) → {inputs.partitionCount + 1} sections
              </option>
              <option value="length">
                Across Length ({inputs.length}{inputs.panelType === 'm' ? 'm' : ' panels'}) → {inputs.partitionCount + 1} sections
              </option>
            </select>
          </div>

          {/* Auto-distribute info or Custom position dropdowns */}
          {!customizePartitions ? (
            <div className="text-xs text-gray-600 bg-blue-50 rounded p-2 border border-blue-200">
              ✓ Partitions evenly distributed across {partitionDimension.toFixed(1)}{inputs.panelType === 'm' ? 'm' : 'ft'}
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-gray-500">Adjust each partition position:</p>
              {Array.from({ length: inputs.partitionCount }).map((_, index) => (
                <div key={index}>
                  <label className="block text-xs text-gray-600 mb-1">
                    Partition {index + 1} Position
                  </label>
                  <select
                    value={getPartitionPositions()[index] || getAutoDistributedPositions(inputs.partitionCount)[index]}
                    onChange={(e) => updatePartitionPosition(index, e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {getPositionOptions(index).map(opt => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}

          {/* Visual Preview */}
          <div className="pt-2">
            <div className="text-xs text-gray-600 font-medium mb-2">Preview:</div>
            <div className="flex items-stretch justify-center flex-wrap gap-1">
              {getSectionSizes().map((size, i) => (
                <div key={i} className="flex items-center">
                  <div
                    className="bg-blue-100 border border-blue-300 rounded px-3 py-2 text-xs text-blue-800 font-medium text-center min-w-[60px]"
                    style={{ flex: `${size} 0 0` }}
                  >
                    <div>Section {i + 1}</div>
                    <div className="text-[10px] text-blue-600 mt-0.5">
                      {size.toFixed(1)}{inputs.panelType === 'm' ? 'm' : 'ft'}
                    </div>
                  </div>
                  {i < inputs.partitionCount && (
                    <div className="w-1 h-12 bg-red-500 mx-1 flex-shrink-0" title={`Partition ${i + 1}`}></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Roof Thickness - Dynamic options based on material */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Roof Thickness
        </label>
        <select
          value={inputs.roofThickness}
          onChange={(e) => handleChange('roofThickness', parseFloat(e.target.value))}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          {inputs.material === 'SS316' || inputs.material === 'SS304' ? (
            inputs.panelType === 'm' ? (
              <>
                <option value="1.0">1.0mm (Standard - SS Metric)</option>
                <option value="1.5">1.5mm (Custom)</option>
              </>
            ) : (
              <>
                <option value="1.2">1.2mm (Standard - SS Imperial)</option>
                <option value="1.5">1.5mm (Custom)</option>
              </>
            )
          ) : (
            <>
              <option value="1.5">1.5mm (Standard)</option>
              <option value="3.0">3.0mm (Custom Heavy Duty)</option>
            </>
          )}
        </select>
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
            onChange={(e) => {
              // Prevent unchecking if external is also unchecked
              if (!e.target.checked && !inputs.externalSupport) {
                alert('At least one support type is required');
                return;
              }
              handleChange('internalSupport', e.target.checked);
            }}
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
            checked={inputs.externalSupport !== false}
            onChange={(e) => {
              // Prevent unchecking if internal is also unchecked
              if (!e.target.checked && !inputs.internalSupport) {
                alert('At least one support type is required');
                return;
              }
              handleChange('externalSupport', e.target.checked);
            }}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="externalSupport" className="ml-2 text-sm text-gray-700">
            External Support (I-Beams)
          </label>
        </div>

        {/* Warning if neither selected - should not happen with validation */}
        {!inputs.internalSupport && !inputs.externalSupport && (
          <p className="text-red-600 text-sm mb-3">
            ⚠️ At least one support type is required
          </p>
        )}

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
          STAY SYSTEM INFO BOX (Phase 2)
          Only show for steel tanks with Internal Support enabled
          ========================================== */}
      {!isFRP && inputs.internalSupport && (
        <div className={`rounded-lg p-4 border ${
          (inputs.panelTypeDetail || 1) === 2
            ? 'bg-purple-50 border-purple-200'
            : 'bg-indigo-50 border-indigo-200'
        }`}>
          <div className={`text-sm font-medium ${
            (inputs.panelTypeDetail || 1) === 2 ? 'text-purple-800' : 'text-indigo-800'
          }`}>
            {(inputs.panelTypeDetail || 1) === 2 ? 'Type 2 Stay System' : 'Type 1 Stay System'}
          </div>
          <ul className={`text-xs mt-2 space-y-1 ${
            (inputs.panelTypeDetail || 1) === 2 ? 'text-purple-700' : 'text-indigo-700'
          }`}>
            {(inputs.panelTypeDetail || 1) === 2 ? (
              <>
                <li>• HS - Horizontal Stay (ties wall to base)</li>
                <li>• VS - Vertical Stay (ties wall to base)</li>
                <li>• HSO - Horizontal OP Stay (ties to opposite wall)</li>
                <li>• HSP/VSP - Partition stays</li>
                <li>• Bottom tier welded, upper tiers bolted</li>
              </>
            ) : (
              <>
                <li>• S - Standard Stay (ties wall to base)</li>
                <li>• OP - Opening Stay (ties to opposite wall)</li>
                <li>• POP - Partition OP Stay</li>
                <li>• Simpler construction, all bolted</li>
              </>
            )}
          </ul>
        </div>
      )}

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
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-800 uppercase">
            🚰 Pipe Fittings & Accessories
          </h3>
        </div>

        {pipeFittings.length === 0 ? (
          <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <p className="text-gray-500 text-sm">No pipe fittings added</p>
            <button
              onClick={addPipeFitting}
              className="mt-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
            >
              + Add Fitting
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

            {/* Add Fitting Button - At the end of list */}
            <button
              onClick={addPipeFitting}
              className="w-full py-3 border-2 border-dashed border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 hover:border-blue-400 transition-colors font-medium"
            >
              + Add Another Fitting
            </button>
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
      {(() => {
        // Calculate actual dimensions based on input mode
        const actualLength = dimensionMode === 'panel' ? (inputs.length || 0) * panelSize : (inputs.length || 0);
        const actualWidth = dimensionMode === 'panel' ? (inputs.width || 0) * panelSize : (inputs.width || 0);
        const actualHeight = dimensionMode === 'panel' ? (inputs.height || 0) * panelSize : (inputs.height || 0);
        const nominalVolume = actualLength * actualWidth * actualHeight;
        const effectiveVolume = actualLength * actualWidth * (actualHeight - (inputs.freeboard || 0.2));

        return (
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="text-sm text-blue-800 font-medium mb-2">
              Tank Capacity
            </div>

            {/* Nominal Capacity */}
            <div className="mb-2">
              <div className="text-xs text-blue-600">Nominal (full height):</div>
              <div className="text-xl font-bold text-blue-900">
                {(nominalVolume * 1000).toLocaleString()} L
              </div>
              <div className="text-xs text-blue-600">
                {nominalVolume.toFixed(2)} m³
              </div>
            </div>

            {/* Effective Capacity */}
            <div className="pt-2 border-t border-blue-200">
              <div className="text-xs text-blue-600">Effective (after freeboard):</div>
              <div className="text-xl font-bold text-blue-900">
                {(effectiveVolume * 1000).toLocaleString()} L
              </div>
              <div className="text-xs text-blue-600">
                {effectiveVolume.toFixed(2)} m³
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
// Version 2.2.0 - Fixed dimensionMode state sync issue for PDF generation
// Preserved: WLI 6 options, BNW 6 options, Tank Finish dropdowns, Pipe Fittings
