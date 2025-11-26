'use client';

import { useState } from 'react';
import { generateBOM } from '@/app/lib/bomEngine';

export default function TankCalculator() {
  const [tankSpecs, setTankSpecs] = useState({
    length: '',
    width: '',
    height: '',
    materialCode: 'SS316',
    buildStandard: 'LPCB',
    includeInternalSupport: false
  });

  const [bom, setBom] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const materials = [
    { code: 'SS316', name: 'Stainless Steel 316 (Premium)', standard: 'LPCB' },
    { code: 'SS304', name: 'Stainless Steel 304 (Standard)', standard: 'BSI' },
    { code: 'HDG', name: 'Hot-Dip Galvanized Steel (Budget)', standard: 'SONS' },
    { code: 'FRP_GRP', name: 'Fiberglass (GRP)', standard: 'SS245:2014' }
  ];

  const handleInputChange = (field, value) => {
    setTankSpecs(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMaterialChange = (materialCode) => {
    const material = materials.find(m => m.code === materialCode);
    setTankSpecs(prev => ({
      ...prev,
      materialCode,
      buildStandard: material.standard
    }));
  };

  const handleCalculate = () => {
    setIsCalculating(true);

    try {
      const specs = {
        length: parseFloat(tankSpecs.length),
        width: parseFloat(tankSpecs.width),
        height: parseFloat(tankSpecs.height),
        materialCode: tankSpecs.materialCode,
        buildStandard: tankSpecs.buildStandard,
        includeInternalSupport: tankSpecs.includeInternalSupport
      };

      const calculatedBom = generateBOM(specs);
      setBom(calculatedBom);
    } catch (error) {
      alert(error.message);
    } finally {
      setIsCalculating(false);
    }
  };

  const isFormValid = tankSpecs.length && tankSpecs.width && tankSpecs.height;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Sunnik Tank Calculator
          </h1>
          <p className="text-slate-600">
            Professional square sectional panel tank pricing
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Input Form */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-6">
              Tank Specifications
            </h2>

            {/* Dimensions */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Length (meters)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  value={tankSpecs.length}
                  onChange={(e) => handleInputChange('length', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g. 5.0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Width (meters)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  value={tankSpecs.width}
                  onChange={(e) => handleInputChange('width', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g. 5.0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Height (meters)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  value={tankSpecs.height}
                  onChange={(e) => handleInputChange('height', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g. 3.0"
                />
              </div>
            </div>

            {/* Material Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Material Selection
              </label>
              <select
                value={tankSpecs.materialCode}
                onChange={(e) => handleMaterialChange(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {materials.map(material => (
                  <option key={material.code} value={material.code}>
                    {material.name}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-sm text-slate-500">
                Build Standard: {tankSpecs.buildStandard}
              </p>
            </div>

            {/* Internal Support */}
            <div className="mb-8">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={tankSpecs.includeInternalSupport}
                  onChange={(e) => handleInputChange('includeInternalSupport', e.target.checked)}
                  className="w-5 h-5 text-blue-600 border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-slate-700">
                  Include Internal Support Structure
                </span>
              </label>
              <p className="mt-1 ml-8 text-sm text-slate-500">
                Recommended for tanks &gt;6ML or dimensions &gt;8m
              </p>
            </div>

            {/* Calculate Button */}
            <button
              onClick={handleCalculate}
              disabled={!isFormValid || isCalculating}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-lg transition-colors"
            >
              {isCalculating ? 'Calculating...' : 'Calculate BOM'}
            </button>
          </div>

          {/* Results Panel */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-6">
              Bill of Materials
            </h2>

            {!bom ? (
              <div className="text-center py-12">
                <div className="text-slate-400 mb-4">
                  <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-slate-600">
                  Enter tank dimensions and click Calculate to generate BOM
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Tank Summary */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-3">Tank Summary</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-blue-700">Dimensions:</span>
                      <p className="font-medium text-blue-900">
                        {bom.tankSpecifications.length}m × {bom.tankSpecifications.width}m × {bom.tankSpecifications.height}m
                      </p>
                    </div>
                    <div>
                      <span className="text-blue-700">Volume:</span>
                      <p className="font-medium text-blue-900">
                        {bom.volumeInfo.volumeML} ML ({bom.volumeInfo.volumeLiters.toLocaleString()} L)
                      </p>
                    </div>
                    <div>
                      <span className="text-blue-700">Material:</span>
                      <p className="font-medium text-blue-900">{bom.tankSpecifications.materialCode}</p>
                    </div>
                    <div>
                      <span className="text-blue-700">Volume Tier:</span>
                      <p className="font-medium text-blue-900">{bom.volumeInfo.volumeTier}</p>
                    </div>
                  </div>
                </div>

                {/* Component Breakdown */}
                <div>
                  <h3 className="font-semibold text-slate-900 mb-3">Components</h3>

                  {/* Panels */}
                  <div className="mb-4">
                    <p className="text-sm font-medium text-slate-700 mb-2">Panels</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Base Panels</span>
                        <span className="font-medium">{bom.components.panels.base} pcs</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Wall Panels</span>
                        <span className="font-medium">{bom.components.panels.wall} pcs</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Roof Panels</span>
                        <span className="font-medium">{bom.components.panels.roof} pcs</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-slate-200">
                        <span className="text-slate-900 font-semibold">Total Panels</span>
                        <span className="font-bold">{bom.components.panels.total} pcs</span>
                      </div>
                    </div>
                  </div>

                  {/* Hardware */}
                  <div className="mb-4">
                    <p className="text-sm font-medium text-slate-700 mb-2">Hardware</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Bolt Sets</span>
                        <span className="font-medium">{bom.components.hardware.boltSets} sets</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Corner Brackets</span>
                        <span className="font-medium">{bom.components.hardware.cornerBrackets} pcs</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Sealing Strip</span>
                        <span className="font-medium">{bom.components.hardware.sealingMeters} m</span>
                      </div>
                    </div>
                  </div>

                  {/* Internal Support */}
                  {bom.components.support && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-slate-700 mb-2">Internal Support</p>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Support Beams</span>
                          <span className="font-medium">{bom.components.support.beams} pcs</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Support Columns</span>
                          <span className="font-medium">{bom.components.support.columns} pcs</span>
                        </div>
                      </div>
                      {bom.components.support.isRequired && (
                        <p className="mt-2 text-xs text-amber-600 bg-amber-50 p-2 rounded">
                          ⚠️ Internal support required for this tank size
                        </p>
                      )}
                    </div>
                  )}

                  {/* Accessories */}
                  <div>
                    <p className="text-sm font-medium text-slate-700 mb-2">Accessories</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Manhole Covers</span>
                        <span className="font-medium">{bom.components.accessories.manholes} pcs</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Air Vents</span>
                        <span className="font-medium">{bom.components.accessories.airVents} pcs</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Inlet/Outlet</span>
                        <span className="font-medium">
                          {bom.components.accessories.inletConnections + bom.components.accessories.outletConnections} pcs
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
