// app/calculator/components/PipeFittingsCards.jsx
'use client';

import { useState } from 'react';
import {
  PIPE_OPENING_TYPES,
  PIPE_FLANGE_TYPES,
  PIPE_SIZES,
  PIPE_MATERIALS,
  PIPE_ITEMS_OUTSIDE,
  PIPE_ITEMS_INSIDE,
  DEFAULT_PIPE_FITTING
} from '@/app/lib/accessoryDefaults';

export default function PipeFittingsCards({ fittings = [], onChange }) {
  const addFitting = () => {
    onChange([...fittings, { ...DEFAULT_PIPE_FITTING, id: Date.now() }]);
  };

  const removeFitting = (index) => {
    const updated = fittings.filter((_, i) => i !== index);
    onChange(updated);
  };

  const updateFitting = (index, field, value) => {
    const updated = [...fittings];
    updated[index] = {
      ...updated[index],
      [field]: value
    };
    onChange(updated);
  };

  const getSummary = (fitting) => {
    return `${fitting.opening} - ${fitting.flangeType} ${fitting.size} (${fitting.outsideMaterial} ${fitting.outsideItem} + ${fitting.insideMaterial} ${fitting.insideItem}) × ${fitting.quantity} sets`;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200">
      {/* Section Title */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-8 bg-gradient-to-b from-purple-600 to-purple-800 rounded-full"></div>
        <h2 className="text-2xl font-bold text-gray-800">
          🚰 Pipe Fittings & Accessories
        </h2>
      </div>

      {/* Fitting Cards */}
      {fittings.length === 0 ? (
        // Empty State
        <div className="text-center py-16">
          <div className="text-6xl mb-4 opacity-30">🚰</div>
          <p className="text-lg font-semibold text-gray-700 mb-2">No pipe fittings added yet</p>
          <p className="text-sm text-gray-500">Click the button below to add your first fitting</p>
        </div>
      ) : (
        // Fitting Cards
        <div className="space-y-6 mb-6">
          {fittings.map((fitting, index) => (
            <div key={fitting.id || index} className="bg-gray-50 border-2 border-gray-200 rounded-xl p-5 hover:border-purple-300 hover:shadow-md transition-all duration-200">
              {/* Card Header */}
              <div className="flex justify-between items-center mb-5 pb-4 border-b-2 border-gray-300">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-600 to-purple-800 text-white flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {fitting.opening} - {fitting.flangeType} {fitting.size}
                  </h3>
                </div>
                <button
                  onClick={() => removeFitting(index)}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-all duration-200 hover:-translate-y-0.5"
                >
                  🗑️ Delete
                </button>
              </div>

              {/* Basic Info - 2 columns on desktop, 1 on mobile */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Opening Type
                  </label>
                  <select
                    value={fitting.opening}
                    onChange={(e) => updateFitting(index, 'opening', e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all duration-200 text-sm bg-white"
                  >
                    {PIPE_OPENING_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Flange Type
                  </label>
                  <select
                    value={fitting.flangeType}
                    onChange={(e) => updateFitting(index, 'flangeType', e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all duration-200 text-sm bg-white"
                  >
                    {PIPE_FLANGE_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Pipe Size (Ø)
                  </label>
                  <select
                    value={fitting.size}
                    onChange={(e) => updateFitting(index, 'size', e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all duration-200 text-sm bg-white"
                  >
                    {PIPE_SIZES.map(size => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Quantity (Sets)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={fitting.quantity}
                    onChange={(e) => updateFitting(index, 'quantity', parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all duration-200 text-sm font-semibold text-center"
                  />
                </div>
              </div>

              {/* Outside Tank */}
              <div className="mb-5">
                <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  Outside Tank
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs text-gray-600">Material</label>
                    <select
                      value={fitting.outsideMaterial}
                      onChange={(e) => updateFitting(index, 'outsideMaterial', e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all duration-200 text-sm bg-white"
                    >
                      {PIPE_MATERIALS.map(material => (
                        <option key={material} value={material}>{material}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs text-gray-600">Item/Fitting</label>
                    <select
                      value={fitting.outsideItem}
                      onChange={(e) => updateFitting(index, 'outsideItem', e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all duration-200 text-sm bg-white"
                    >
                      {PIPE_ITEMS_OUTSIDE.map(item => (
                        <option key={item} value={item}>{item}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Inside Tank */}
              <div className="mb-4">
                <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                  Inside Tank
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs text-gray-600">Material</label>
                    <select
                      value={fitting.insideMaterial}
                      onChange={(e) => updateFitting(index, 'insideMaterial', e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all duration-200 text-sm bg-white"
                    >
                      {PIPE_MATERIALS.map(material => (
                        <option key={material} value={material}>{material}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs text-gray-600">Item/Fitting</label>
                    <select
                      value={fitting.insideItem}
                      onChange={(e) => updateFitting(index, 'insideItem', e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all duration-200 text-sm bg-white"
                    >
                      {PIPE_ITEMS_INSIDE.map(item => (
                        <option key={item} value={item}>{item}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Summary Box */}
              <div className="p-3 bg-white border-2 border-purple-200 rounded-lg">
                <p className="text-sm">
                  <strong className="text-purple-700">Summary:</strong> {getSummary(fitting)}
                </p>
                <p className="text-sm mt-1">
                  <strong className="text-purple-700">Estimated Cost:</strong> RM 250.00 <span className="text-orange-600">⚠️ <em>(Placeholder - needs pricing)</em></span>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Button */}
      <button
        onClick={addFitting}
        className="w-full py-4 bg-green-500 text-white rounded-xl font-semibold text-lg flex items-center justify-center gap-3 hover:bg-green-600 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
      >
        <span className="text-2xl">➕</span>
        Add Another Pipe Fitting
      </button>

      {/* Warning */}
      <div className="mt-6 p-4 bg-orange-50 border-l-4 border-orange-500 rounded-lg">
        <p className="text-sm text-orange-800">
          ⚠️ <strong>Pricing Note:</strong> Pipe fitting costs shown are placeholders. Final pricing depends on size, material, and flange type. Please provide specific pricing for accurate quotes.
        </p>
      </div>
    </div>
  );
}
