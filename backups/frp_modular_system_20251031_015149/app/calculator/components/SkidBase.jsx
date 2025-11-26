// app/calculator/components/SkidBase.jsx
'use client';

import {
  RC_PLINTH_OPTIONS,
  SKID_BASE_MATERIALS,
  MAIN_BEAM_OPTIONS,
  SUB_BEAM_OPTIONS,
  COATING_OPTIONS
} from '@/app/lib/accessoryDefaults';

export default function SkidBase({ values, onChange }) {
  // Check if custom length input should be enabled
  const isCustomLengthEnabled =
    values?.skidBaseMaterial === 'I-Beam' &&
    values?.lengthType === 'Custom Length';

  const handleChange = (field, value) => {
    const updated = {
      ...values,
      [field]: value
    };

    // If length type changed to Standard, clear custom length
    if (field === 'lengthType' && value === 'Standard Length') {
      updated.customLength = null;
    }

    // If skid material changed away from I-Beam, disable custom length
    if (field === 'skidBaseMaterial' && value !== 'I-Beam') {
      updated.customLength = null;
    }

    onChange(updated);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200">
      {/* Section Title */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-8 bg-gradient-to-b from-purple-600 to-purple-800 rounded-full"></div>
        <h2 className="text-2xl font-bold text-gray-800">
          🏗️ Skid Base Materials
        </h2>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* RC Plinth */}
        <div className="space-y-2">
          <label htmlFor="rcPlinth" className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
            RC Plinth
          </label>
          <select
            id="rcPlinth"
            value={values?.rcPlinth || 'Vertical Orientation'}
            onChange={(e) => handleChange('rcPlinth', e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg
                     focus:border-purple-500 focus:ring-4 focus:ring-purple-100
                     transition-all duration-200 text-gray-800 font-medium bg-white cursor-pointer"
          >
            {RC_PLINTH_OPTIONS.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        {/* Skid Base Material */}
        <div className="space-y-2">
          <label htmlFor="skidBaseMaterial" className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Skid Base Material
          </label>
          <select
            id="skidBaseMaterial"
            value={values?.skidBaseMaterial || 'C-Channel'}
            onChange={(e) => handleChange('skidBaseMaterial', e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg
                     focus:border-purple-500 focus:ring-4 focus:ring-purple-100
                     transition-all duration-200 text-gray-800 font-medium bg-white cursor-pointer"
          >
            {SKID_BASE_MATERIALS.map(material => (
              <option key={material} value={material}>{material}</option>
            ))}
          </select>
        </div>

        {/* Main Beam */}
        <div className="space-y-2">
          <label htmlFor="mainBeam" className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Main Beam
          </label>
          <select
            id="mainBeam"
            value={values?.mainBeam || 'C-Channel 100mm x 50mm x 5mm'}
            onChange={(e) => handleChange('mainBeam', e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg
                     focus:border-purple-500 focus:ring-4 focus:ring-purple-100
                     transition-all duration-200 text-gray-800 font-medium bg-white cursor-pointer"
          >
            {MAIN_BEAM_OPTIONS.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        {/* Sub Beam */}
        <div className="space-y-2">
          <label htmlFor="subBeam" className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Sub Beam
          </label>
          <select
            id="subBeam"
            value={values?.subBeam || 'Angle 80mm x 80mm x 8mm'}
            onChange={(e) => handleChange('subBeam', e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg
                     focus:border-purple-500 focus:ring-4 focus:ring-purple-100
                     transition-all duration-200 text-gray-800 font-medium bg-white cursor-pointer"
          >
            {SUB_BEAM_OPTIONS.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        {/* Length Type */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Length Type
          </label>
          <div className="flex gap-4">
            <div
              className={`flex-1 flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-all duration-200
                ${values?.lengthType === 'Standard Length' || !values?.lengthType
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-300 bg-white hover:border-purple-300'
                }`}
              onClick={() => handleChange('lengthType', 'Standard Length')}
            >
              <input
                type="radio"
                name="lengthType"
                checked={values?.lengthType === 'Standard Length' || !values?.lengthType}
                onChange={() => handleChange('lengthType', 'Standard Length')}
                className="w-4 h-4"
              />
              <label className="cursor-pointer font-medium text-gray-800">Standard Length</label>
            </div>
            <div
              className={`flex-1 flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-all duration-200
                ${values?.lengthType === 'Custom Length'
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-300 bg-white hover:border-purple-300'
                }`}
              onClick={() => handleChange('lengthType', 'Custom Length')}
            >
              <input
                type="radio"
                name="lengthType"
                checked={values?.lengthType === 'Custom Length'}
                onChange={() => handleChange('lengthType', 'Custom Length')}
                className="w-4 h-4"
              />
              <label className="cursor-pointer font-medium text-gray-800">Custom Length</label>
            </div>
          </div>
        </div>

        {/* Custom Length Input */}
        <div className="space-y-2">
          <label htmlFor="customLength" className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Main Beam Length (mm)
            {!isCustomLengthEnabled && (
              <span className="ml-2 text-xs text-gray-500 font-normal">(Only for I-Beam)</span>
            )}
          </label>
          <input
            type="number"
            id="customLength"
            placeholder="Enter custom length in mm"
            value={values?.customLength || ''}
            onChange={(e) => handleChange('customLength', e.target.value)}
            disabled={!isCustomLengthEnabled}
            className={`w-full px-4 py-3 border-2 rounded-lg transition-all duration-200
              ${isCustomLengthEnabled
                ? 'border-gray-300 bg-white text-gray-800 focus:border-purple-500 focus:ring-4 focus:ring-purple-100'
                : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed opacity-50'
              }`}
          />
          {!isCustomLengthEnabled && (
            <div className="p-2 bg-yellow-50 border-l-4 border-yellow-500 rounded text-sm text-yellow-800">
              💡 Enabled when "Custom Length" + "I-Beam" selected
            </div>
          )}
          {isCustomLengthEnabled && values?.customLength && (
            <div className="p-2 bg-orange-50 border-l-4 border-orange-500 rounded text-sm text-orange-800">
              ⚠️ Custom length pricing: <strong>RM 50 per meter</strong> (placeholder - needs final pricing)
            </div>
          )}
        </div>

        {/* Coating */}
        <div className="space-y-2">
          <label htmlFor="coating" className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Coating
          </label>
          <select
            id="coating"
            value={values?.coating || 'Hot-Dipped Galvanize'}
            onChange={(e) => handleChange('coating', e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg
                     focus:border-purple-500 focus:ring-4 focus:ring-purple-100
                     transition-all duration-200 text-gray-800 font-medium bg-white cursor-pointer"
          >
            {COATING_OPTIONS.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

      </div>

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg">
        <p className="text-sm text-blue-800">
          💡 <strong>Skid Base Configuration:</strong> The skid base provides support and load distribution for the tank. Select materials based on tank size and load requirements.
        </p>
      </div>
    </div>
  );
}
