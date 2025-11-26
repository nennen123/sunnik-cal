// app/calculator/components/TankReinforcement.jsx
'use client';

import { useState, useEffect } from 'react';
import {
  SPECIFICATIONS,
  TANK_SEALANTS,
  BRACING_OPTIONS,
  EXTERNAL_BRACE_TYPES,
  TIEROD_MATERIALS,
  BRACKET_MATERIALS,
  ROOF_MATERIALS,
  getAccessoryDefaults
} from '@/app/lib/accessoryDefaults';

export default function TankReinforcement({ values, onChange, tankHeight }) {
  const [showExternalBraceWarning, setShowExternalBraceWarning] = useState(false);

  // Check if external brace dropdown should be enabled
  const isExternalBraceEnabled =
    values.bracing === 'External (I-beam)' ||
    values.bracing === 'External (C-channel)' ||
    values.bracing === 'Both (Internal + External)';

  // Show warning for tall tanks
  useEffect(() => {
    if (tankHeight > 5) {
      setShowExternalBraceWarning(true);
    } else {
      setShowExternalBraceWarning(false);
    }
  }, [tankHeight]);

  // Handle specification change - auto-fill all fields
  const handleSpecificationChange = (newSpec) => {
    const defaults = getAccessoryDefaults(newSpec);
    onChange(defaults);
  };

  // Handle individual field changes
  const handleChange = (field, value) => {
    const updated = {
      ...values,
      [field]: value
    };

    // If bracing changed to non-external, clear external brace type
    if (field === 'bracing' && value === 'Internal Brace') {
      updated.externalBraceType = null;
    }

    onChange(updated);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200">
      {/* Section Title */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-8 bg-gradient-to-b from-purple-600 to-purple-800 rounded-full"></div>
        <h2 className="text-2xl font-bold text-gray-800">
          🔧 Tank Reinforcement
        </h2>
      </div>

      {/* Main Grid - 2 columns on desktop, 1 on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Specification - Full Width on both mobile and desktop */}
        <div className="md:col-span-2 space-y-2">
          <label htmlFor="specification" className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Specification
          </label>
          <select
            id="specification"
            value={values.specification || MS1390_DEFAULTS.specification}
            onChange={(e) => handleSpecificationChange(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg
                     focus:border-purple-500 focus:ring-4 focus:ring-purple-100
                     transition-all duration-200 text-gray-800 font-semibold text-lg
                     bg-white cursor-pointer"
          >
            {SPECIFICATIONS.map(spec => (
              <option key={spec} value={spec}>{spec}</option>
            ))}
          </select>
          <div className="p-3 bg-yellow-50 border-l-4 border-yellow-500 rounded">
            <p className="text-sm text-yellow-800">
              💡 <strong>Auto-Fill:</strong> Selecting a specification will automatically set all fields below to recommended defaults
            </p>
          </div>
        </div>

        {/* Tank Sealant */}
        <div className="space-y-2">
          <label htmlFor="tankSealant" className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Tank Sealant
          </label>
          <select
            id="tankSealant"
            value={values.tankSealant || 'EPDM Sealant'}
            onChange={(e) => handleChange('tankSealant', e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg
                     focus:border-purple-500 focus:ring-4 focus:ring-purple-100
                     transition-all duration-200 text-gray-800 font-medium
                     bg-white cursor-pointer"
          >
            {TANK_SEALANTS.map(sealant => (
              <option key={sealant} value={sealant}>{sealant}</option>
            ))}
          </select>
        </div>

        {/* Bracing */}
        <div className="space-y-2">
          <label htmlFor="bracing" className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Bracing
          </label>
          <select
            id="bracing"
            value={values.bracing || 'Internal Brace'}
            onChange={(e) => handleChange('bracing', e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg
                     focus:border-purple-500 focus:ring-4 focus:ring-purple-100
                     transition-all duration-200 text-gray-800 font-medium
                     bg-white cursor-pointer"
          >
            {BRACING_OPTIONS.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          {showExternalBraceWarning && (
            <div className="p-2 bg-red-50 border-l-4 border-red-500 rounded text-sm text-red-800">
              ⚠️ External brace recommended for tanks &gt; 5m height
            </div>
          )}
        </div>

        {/* External Brace Type - Conditional */}
        <div className="space-y-2">
          <label htmlFor="externalBraceType" className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
            External Brace Type
            {!isExternalBraceEnabled && (
              <span className="ml-2 text-xs text-gray-500 font-normal">(Disabled)</span>
            )}
          </label>
          <select
            id="externalBraceType"
            value={values.externalBraceType || ''}
            onChange={(e) => handleChange('externalBraceType', e.target.value)}
            disabled={!isExternalBraceEnabled}
            className={`w-full px-4 py-3 border-2 rounded-lg
                     transition-all duration-200 text-gray-800 font-medium
                     ${isExternalBraceEnabled
                       ? 'border-gray-300 bg-white cursor-pointer focus:border-purple-500 focus:ring-4 focus:ring-purple-100'
                       : 'border-gray-200 bg-gray-100 cursor-not-allowed opacity-50'
                     }`}
          >
            <option value="">Select I-beam size...</option>
            {EXTERNAL_BRACE_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          {!isExternalBraceEnabled && (
            <p className="text-xs text-gray-500">
              💡 Select external bracing option above to enable
            </p>
          )}
        </div>

        {/* Tierods */}
        <div className="space-y-2">
          <label htmlFor="tierods" className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Tierods
          </label>
          <select
            id="tierods"
            value={values.tierods || 'SS304'}
            onChange={(e) => handleChange('tierods', e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg
                     focus:border-purple-500 focus:ring-4 focus:ring-purple-100
                     transition-all duration-200 text-gray-800 font-medium
                     bg-white cursor-pointer"
          >
            {TIEROD_MATERIALS.map(material => (
              <option key={material} value={material}>{material}</option>
            ))}
          </select>
        </div>

        {/* Internal Bracket */}
        <div className="space-y-2">
          <label htmlFor="internalBracket" className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Internal Bracket
          </label>
          <select
            id="internalBracket"
            value={values.internalBracket || 'SS304'}
            onChange={(e) => handleChange('internalBracket', e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg
                     focus:border-purple-500 focus:ring-4 focus:ring-purple-100
                     transition-all duration-200 text-gray-800 font-medium
                     bg-white cursor-pointer"
          >
            {BRACKET_MATERIALS.map(material => (
              <option key={material} value={material}>{material}</option>
            ))}
          </select>
        </div>

        {/* External Bracket */}
        <div className="space-y-2">
          <label htmlFor="externalBracket" className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
            External Bracket
          </label>
          <select
            id="externalBracket"
            value={values.externalBracket || 'HDG'}
            onChange={(e) => handleChange('externalBracket', e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg
                     focus:border-purple-500 focus:ring-4 focus:ring-purple-100
                     transition-all duration-200 text-gray-800 font-medium
                     bg-white cursor-pointer"
          >
            {BRACKET_MATERIALS.map(material => (
              <option key={material} value={material}>{material}</option>
            ))}
          </select>
        </div>

        {/* Roof Bracket */}
        <div className="space-y-2">
          <label htmlFor="roofBracket" className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Roof Bracket
          </label>
          <select
            id="roofBracket"
            value={values.roofBracket || 'ABS'}
            onChange={(e) => handleChange('roofBracket', e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg
                     focus:border-purple-500 focus:ring-4 focus:ring-purple-100
                     transition-all duration-200 text-gray-800 font-medium
                     bg-white cursor-pointer"
          >
            {ROOF_MATERIALS.map(material => (
              <option key={material} value={material}>{material}</option>
            ))}
          </select>
        </div>

        {/* Roof Pipe */}
        <div className="space-y-2">
          <label htmlFor="roofPipe" className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Roof Pipe
          </label>
          <select
            id="roofPipe"
            value={values.roofPipe || 'ABS'}
            onChange={(e) => handleChange('roofPipe', e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg
                     focus:border-purple-500 focus:ring-4 focus:ring-purple-100
                     transition-all duration-200 text-gray-800 font-medium
                     bg-white cursor-pointer"
          >
            {ROOF_MATERIALS.map(material => (
              <option key={material} value={material}>{material}</option>
            ))}
          </select>
        </div>

      </div>

      {/* Current Configuration Summary */}
      <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border-2 border-purple-200">
        <p className="text-sm font-semibold text-gray-700 mb-3">
          📋 Current Configuration:
        </p>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-gray-600">Specification:</span>
            <p className="font-bold text-purple-700 truncate" title={values.specification}>
              {values.specification?.split(' ')[0] || 'MS1390'}
            </p>
          </div>
          <div>
            <span className="text-gray-600">Sealant:</span>
            <p className="font-bold text-purple-700">{values.tankSealant || 'EPDM'}</p>
          </div>
          <div>
            <span className="text-gray-600">Bracing:</span>
            <p className="font-bold text-purple-700">{values.bracing?.split(' ')[0] || 'Internal'}</p>
          </div>
          <div>
            <span className="text-gray-600">Tierods:</span>
            <p className="font-bold text-purple-700">{values.tierods || 'SS304'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
