// app/calculator/components/TankAccessories.jsx
'use client';

import { useState, useEffect } from 'react';
import {
  MANHOLE_TYPES,
  WLI_TYPES,
  LADDER_MATERIALS,
  AIR_VENT_SIZES
} from '@/Lib/accessoryDefaults';
import { getAccessorySKU, getAccessoryPrice, ACCESSORY_PRICES } from '@/Lib/accessoryPricing';

export default function TankAccessories({ values, onChange, tankHeight = 2.0 }) {
  // Check if safety cage should be enabled
  const isSafetyCageEnabled = values?.externalLadder?.quantity > 0;

  const handleChange = (field, subfield, value) => {
    const updated = {
      ...values,
      [field]: {
        ...values[field],
        [subfield]: value
      }
    };

    // If external ladder quantity becomes 0, disable safety cage
    if (field === 'externalLadder' && subfield === 'quantity' && value === 0) {
      updated.safetyCage.enabled = false;
      updated.safetyCage.extensionHeight = '';
    }

    onChange(updated);
  };

  // Calculate individual prices
  const calculatePrice = (accessoryType, material, quantity) => {
    if (quantity === 0) return 0;

    const sku = getAccessorySKU(accessoryType, material?.toLowerCase(), tankHeight);
    const price = sku ? getAccessoryPrice(sku, tankHeight) : 0;
    return price * quantity;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200">
      {/* Section Title */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-8 bg-gradient-to-b from-purple-600 to-purple-800 rounded-full"></div>
        <h2 className="text-2xl font-bold text-gray-800">
          🎨 Tank Accessories & Additional
        </h2>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Manhole */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Manhole
          </label>
          <div className="flex gap-3">
            <input
              type="number"
              min="0"
              max="4"
              value={values?.manhole?.quantity || 1}
              onChange={(e) => handleChange('manhole', 'quantity', parseInt(e.target.value) || 0)}
              className="w-20 px-3 py-3 border-2 border-gray-300 rounded-lg
                       focus:border-purple-500 focus:ring-4 focus:ring-purple-100
                       transition-all duration-200 text-gray-800 font-semibold text-center"
            />
            <select
              value={values?.manhole?.type || 'Normal'}
              onChange={(e) => handleChange('manhole', 'type', e.target.value)}
              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg
                       focus:border-purple-500 focus:ring-4 focus:ring-purple-100
                       transition-all duration-200 text-gray-800 font-medium bg-white cursor-pointer"
            >
              {MANHOLE_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          {values?.manhole?.quantity > 0 && (
            <div className="p-2 bg-green-50 border-l-4 border-green-500 rounded text-sm text-green-800">
              ✅ {values.manhole.quantity} × {values.manhole.type} = RM {(380 * values.manhole.quantity).toFixed(2)}
            </div>
          )}
        </div>

        {/* Water Level Indicator */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Water Level Indicator (WLI)
          </label>
          <div className="flex gap-3">
            <input
              type="number"
              min="0"
              max="2"
              value={values?.wli?.quantity || 1}
              onChange={(e) => handleChange('wli', 'quantity', parseInt(e.target.value) || 0)}
              className="w-20 px-3 py-3 border-2 border-gray-300 rounded-lg
                       focus:border-purple-500 focus:ring-4 focus:ring-purple-100
                       transition-all duration-200 text-gray-800 font-semibold text-center"
            />
            <select
              value={values?.wli?.type || 'HDG Ball Float'}
              onChange={(e) => handleChange('wli', 'type', e.target.value)}
              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg
                       focus:border-purple-500 focus:ring-4 focus:ring-purple-100
                       transition-all duration-200 text-gray-800 font-medium bg-white cursor-pointer"
            >
              {WLI_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          {values?.wli?.quantity > 0 && (
            <div className="p-2 bg-green-50 border-l-4 border-green-500 rounded text-sm text-green-800">
              ✅ {values.wli.quantity} × {values.wli.type} ({tankHeight}m) = RM {calculatePrice('wli', 'hdg', values.wli.quantity).toFixed(2)}
            </div>
          )}
        </div>

        {/* Internal Ladder */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Internal Ladder
          </label>
          <div className="flex gap-3">
            <input
              type="number"
              min="0"
              max="2"
              value={values?.internalLadder?.quantity || 1}
              onChange={(e) => handleChange('internalLadder', 'quantity', parseInt(e.target.value) || 0)}
              className="w-20 px-3 py-3 border-2 border-gray-300 rounded-lg
                       focus:border-purple-500 focus:ring-4 focus:ring-purple-100
                       transition-all duration-200 text-gray-800 font-semibold text-center"
            />
            <select
              value={values?.internalLadder?.material || 'FRP'}
              onChange={(e) => handleChange('internalLadder', 'material', e.target.value)}
              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg
                       focus:border-purple-500 focus:ring-4 focus:ring-purple-100
                       transition-all duration-200 text-gray-800 font-medium bg-white cursor-pointer"
            >
              {LADDER_MATERIALS.map(material => (
                <option key={material} value={material}>{material}</option>
              ))}
            </select>
          </div>
          {values?.internalLadder?.quantity > 0 && (
            <div className="p-2 bg-green-50 border-l-4 border-green-500 rounded text-sm text-green-800">
              ✅ {values.internalLadder.quantity} × {values.internalLadder.material} Int Ladder ({tankHeight}m) = RM {calculatePrice('int_ladder', values.internalLadder.material, values.internalLadder.quantity).toFixed(2)}
            </div>
          )}
        </div>

        {/* External Ladder */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
            External Ladder
          </label>
          <div className="flex gap-3">
            <input
              type="number"
              min="0"
              max="2"
              value={values?.externalLadder?.quantity || 1}
              onChange={(e) => handleChange('externalLadder', 'quantity', parseInt(e.target.value) || 0)}
              className="w-20 px-3 py-3 border-2 border-gray-300 rounded-lg
                       focus:border-purple-500 focus:ring-4 focus:ring-purple-100
                       transition-all duration-200 text-gray-800 font-semibold text-center"
            />
            <select
              value={values?.externalLadder?.material || 'HDG'}
              onChange={(e) => handleChange('externalLadder', 'material', e.target.value)}
              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg
                       focus:border-purple-500 focus:ring-4 focus:ring-purple-100
                       transition-all duration-200 text-gray-800 font-medium bg-white cursor-pointer"
            >
              {LADDER_MATERIALS.map(material => (
                <option key={material} value={material}>{material}</option>
              ))}
            </select>
          </div>
          {values?.externalLadder?.quantity > 0 && (
            <div className="p-2 bg-green-50 border-l-4 border-green-500 rounded text-sm text-green-800">
              ✅ {values.externalLadder.quantity} × {values.externalLadder.material} Ext Ladder ({tankHeight}m) = RM {calculatePrice('ext_ladder', values.externalLadder.material, values.externalLadder.quantity).toFixed(2)}
            </div>
          )}
        </div>

        {/* Safety Cage */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Safety Cage
          </label>
          <div
            className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all duration-200
              ${isSafetyCageEnabled
                ? 'border-gray-300 bg-white hover:border-purple-300 hover:bg-purple-50'
                : 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
              }`}
            onClick={() => isSafetyCageEnabled && handleChange('safetyCage', 'enabled', !values?.safetyCage?.enabled)}
          >
            <input
              type="checkbox"
              checked={values?.safetyCage?.enabled || false}
              onChange={(e) => handleChange('safetyCage', 'enabled', e.target.checked)}
              disabled={!isSafetyCageEnabled}
              className="w-5 h-5 cursor-pointer"
            />
            <span className="flex-1 font-medium text-gray-800">Include Safety Cage</span>
            {values?.safetyCage?.enabled && (
              <span className="text-purple-600 font-bold">+RM 150</span>
            )}
          </div>
          <input
            type="number"
            placeholder="Extend Ext Lad (mm)"
            value={values?.safetyCage?.extensionHeight || ''}
            onChange={(e) => handleChange('safetyCage', 'extensionHeight', e.target.value)}
            disabled={!isSafetyCageEnabled || !values?.safetyCage?.enabled}
            className={`w-full px-4 py-3 border-2 rounded-lg transition-all duration-200
              ${isSafetyCageEnabled && values?.safetyCage?.enabled
                ? 'border-gray-300 bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-100'
                : 'border-gray-200 bg-gray-100 cursor-not-allowed opacity-50'
              }`}
          />
          {!isSafetyCageEnabled && (
            <div className="p-2 bg-yellow-50 border-l-4 border-yellow-500 rounded text-sm text-yellow-800">
              💡 Only available when External Ladder quantity &gt; 0
            </div>
          )}
        </div>

        {/* Air Vent */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Air Vent
          </label>
          <div className="flex gap-3">
            <input
              type="number"
              min="1"
              max="4"
              value={values?.airVent?.quantity || 2}
              onChange={(e) => handleChange('airVent', 'quantity', parseInt(e.target.value) || 1)}
              className="w-20 px-3 py-3 border-2 border-gray-300 rounded-lg
                       focus:border-purple-500 focus:ring-4 focus:ring-purple-100
                       transition-all duration-200 text-gray-800 font-semibold text-center"
            />
            <select
              value={values?.airVent?.size || '50mm'}
              onChange={(e) => handleChange('airVent', 'size', e.target.value)}
              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg
                       focus:border-purple-500 focus:ring-4 focus:ring-purple-100
                       transition-all duration-200 text-gray-800 font-medium bg-white cursor-pointer"
            >
              {AIR_VENT_SIZES.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>
          <div className="p-2 bg-green-50 border-l-4 border-green-500 rounded text-sm text-green-800">
            ✅ {values?.airVent?.quantity || 2} × {values?.airVent?.size || '50mm'} Air Vent = RM {((values?.airVent?.size === '100mm' ? 45 : 25) * (values?.airVent?.quantity || 2)).toFixed(2)}
          </div>
        </div>

      </div>
    </div>
  );
}
