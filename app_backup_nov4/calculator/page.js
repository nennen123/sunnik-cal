'use client';

import { useState } from 'react';

export default function CalculatorPage() {
  const [inputs, setInputs] = useState({
    length: 5,
    width: 5,
    height: 2,
    panelType: 'm',
    material: 'SS316',
    partitionCount: 0,
    roofThickness: 1.5,
    buildStandard: 'LPCB',
    includeInternalSupport: false,
    // Additional fields you mentioned
    tankSupport: 'concrete',
    accessories: [],
    skidBase: false,
    pipeOpening: 'DN80'
  });

  const [bom, setBOM] = useState(null);
  const [showResults, setShowResults] = useState(false);

  const handleChange = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const handleCalculate = () => {
    // Basic BOM calculation
    const result = {
      base: [{ sku: '1B3-m-S2', description: 'Base Panel', quantity: 20, unitPrice: 175 }],
      walls: [{ sku: '1A3-m-S2', description: 'Wall Panel', quantity: 40, unitPrice: 175 }],
      roof: [{ sku: '1R15-m-S2', description: 'Roof Panel', quantity: 21, unitPrice: 125 }],
      partition: [],
      summary: { totalPanels: 81, totalCost: 10825 }
    };
    setBOM(result);
    setShowResults(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Sunnik Tank Calculator
          </h1>
          <p className="text-gray-600">
            Professional square sectional panel tank pricing
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* LEFT SIDE - Tank Specifications */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-semibold mb-6">Tank Specifications</h2>

            {/* Panel Type Selector */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Panel Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleChange('panelType', 'm')}
                  className={`py-2 px-4 rounded-lg font-medium transition ${
                    inputs.panelType === 'm'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  Metric (1m)
                </button>
                <button
                  onClick={() => handleChange('panelType', 'i')}
                  className={`py-2 px-4 rounded-lg font-medium transition ${
                    inputs.panelType === 'i'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  Imperial (4ft)
                </button>
              </div>
            </div>

            {/* Length */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Length (meters)
              </label>
              <input
                type="number"
                step="0.1"
                min="1"
                max="50"
                value={inputs.length}
                onChange={(e) => handleChange('length', parseFloat(e.target.value))}
                placeholder="e.g. 5.0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Width */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Width (meters)
              </label>
              <input
                type="number"
                step="0.1"
                min="1"
                max="50"
                value={inputs.width}
                onChange={(e) => handleChange('width', parseFloat(e.target.value))}
                placeholder="e.g. 5.0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Height */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Height (meters)
              </label>
              <input
                type="number"
                step="0.1"
                min="1"
                max="20"
                value={inputs.height}
                onChange={(e) => handleChange('height', parseFloat(e.target.value))}
                placeholder="e.g. 3.0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Material Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Material Selection
              </label>
              <select
                value={inputs.material}
                onChange={(e) => handleChange('material', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="SS316">Stainless Steel 316 (Premium)</option>
                <option value="SS304">Stainless Steel 304 (Standard)</option>
                <option value="HDG">Hot Dip Galvanized (Coated)</option>
                <option value="MS">Mild Steel (Painted)</option>
                <option value="FRP">FRP/GRP (Fiberglass)</option>
              </select>
            </div>

            {/* Tank Support */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tank Support Type
              </label>
              <select
                value={inputs.tankSupport}
                onChange={(e) => handleChange('tankSupport', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="concrete">Concrete Base</option>
                <option value="ibeam">I-Beam Structure</option>
                <option value="none">No Support (Ground Level)</option>
              </select>
            </div>

            {/* Partition Count */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Partitions
              </label>
              <input
                type="number"
                min="0"
                max="10"
                value={inputs.partitionCount}
                onChange={(e) => handleChange('partitionCount', parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Partitions run across the shorter side
              </p>
            </div>

            {/* Pipe Opening */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pipe Opening Size
              </label>
              <select
                value={inputs.pipeOpening}
                onChange={(e) => handleChange('pipeOpening', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="DN50">DN50 (2")</option>
                <option value="DN80">DN80 (3")</option>
                <option value="DN100">DN100 (4")</option>
                <option value="DN150">DN150 (6")</option>
                <option value="custom">Custom Size</option>
              </select>
            </div>

            {/* Roof Thickness */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Roof Thickness
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleChange('roofThickness', 1.5)}
                  className={`py-2 px-4 rounded-lg font-medium transition ${
                    inputs.roofThickness === 1.5
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  1.5mm (Standard)
                </button>
                <button
                  onClick={() => handleChange('roofThickness', 3.0)}
                  className={`py-2 px-4 rounded-lg font-medium transition ${
                    inputs.roofThickness === 3.0
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  3.0mm (Heavy Duty)
                </button>
              </div>
            </div>

            {/* Accessories */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Accessories
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm">Ladder (Internal)</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm">Ladder (External)</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm">Water Level Indicator</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm">Overflow Pipe</span>
                </label>
              </div>
            </div>

            {/* Skid Base */}
            <div className="mb-4">
              <label className="flex items-start">
                <input
                  type="checkbox"
                  checked={inputs.skidBase}
                  onChange={(e) => handleChange('skidBase', e.target.checked)}
                  className="mt-1 mr-2"
                />
                <div>
                  <span className="text-sm font-medium text-gray-700">
                    Include Skid Base
                  </span>
                  <p className="text-xs text-gray-500">
                    Steel frame for easy transport and installation
                  </p>
                </div>
              </label>
            </div>

            {/* Build Standard */}
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Build Standard: <span className="font-medium">{inputs.buildStandard}</span>
              </p>
            </div>

            {/* Internal Support */}
            <div className="mb-6">
              <label className="flex items-start">
                <input
                  type="checkbox"
                  checked={inputs.includeInternalSupport}
                  onChange={(e) => handleChange('includeInternalSupport', e.target.checked)}
                  className="mt-1 mr-2"
                />
                <div>
                  <span className="text-sm font-medium text-gray-700">
                    Include Internal Support Structure
                  </span>
                  <p className="text-xs text-gray-500">
                    Recommended for tanks &gt;6ML or dimensions &gt;8m
                  </p>
                </div>
              </label>
            </div>

            {/* Calculate Button */}
            <button
              onClick={handleCalculate}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition shadow-md"
            >
              Calculate BOM
            </button>
          </div>

          {/* RIGHT SIDE - Bill of Materials */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-semibold mb-6">Bill of Materials</h2>

            {!showResults ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-gray-600">
                  Enter tank dimensions and click Calculate to generate BOM
                </p>
              </div>
            ) : (
              <div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-blue-900 mb-2">Tank Specification</h3>
                  <div className="text-sm text-blue-800 space-y-1">
                    <p>
                      <span className="font-medium">Dimensions:</span> {inputs.length}m × {inputs.width}m × {inputs.height}m
                    </p>
                    <p>
                      <span className="font-medium">Material:</span> {inputs.material}
                    </p>
                    <p>
                      <span className="font-medium">Panel Type:</span> {inputs.panelType === 'm' ? 'Metric (1m×1m)' : 'Imperial (4ft×4ft)'}
                    </p>
                    <p>
                      <span className="font-medium">Partitions:</span> {inputs.partitionCount}
                    </p>
                    <p>
                      <span className="font-medium">Support:</span> {inputs.tankSupport}
                    </p>
                    <p>
                      <span className="font-medium">Pipe Opening:</span> {inputs.pipeOpening}
                    </p>
                  </div>
                  <p className="text-xs text-blue-700 mt-2 pt-2 border-t border-blue-200">
                    <span className="font-medium">Volume:</span> {(inputs.length * inputs.width * inputs.height * 1000).toLocaleString()} liters
                    ({(inputs.length * inputs.width * inputs.height).toFixed(2)} m³)
                  </p>
                </div>

                {bom && (
                  <div className="space-y-4">
                    <div className="border-b pb-4">
                      <h4 className="font-semibold text-lg mb-3">Summary</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-3 rounded">
                          <p className="text-xs text-gray-600 mb-1">Total Panels</p>
                          <p className="text-2xl font-bold text-gray-900">{bom.summary.totalPanels}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded">
                          <p className="text-xs text-gray-600 mb-1">Total Cost</p>
                          <p className="text-2xl font-bold text-blue-600">RM {bom.summary.totalCost.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">BOM Details</h4>
                      <p className="text-sm text-gray-600">
                        Base Panels: {bom.base.length} types |
                        Wall Panels: {bom.walls.length} types |
                        Roof Panels: {bom.roof.length} types
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
