// app/calculator/components/TankInputs.js

export default function TankInputs({ inputs, setInputs }) {
  const handleChange = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  // Calculate capacities
  const nominalCapacity = inputs.length * inputs.width * inputs.height;
  const freeboardMeters = (inputs.freeboard || 0) / 1000;
  const effectiveHeight = inputs.height - freeboardMeters;
  const effectiveCapacity = inputs.length * inputs.width * Math.max(0, effectiveHeight);

  return (
    <div className="space-y-5">
      {/* Panel Type Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Panel Size
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleChange('panelType', 'm')}
            className={`py-2 px-4 rounded-lg font-medium transition-colors ${
              inputs.panelType === 'm'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Metric (1m)
          </button>
          <button
            onClick={() => handleChange('panelType', 'i')}
            className={`py-2 px-4 rounded-lg font-medium transition-colors ${
              inputs.panelType === 'i'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Imperial (4ft)
          </button>
        </div>
      </div>

      {/* Panel Type Detail (Type 1 / Type 2) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Panel Type
        </label>
        <select
          value={inputs.panelTypeDetail || 'type1'}
          onChange={(e) => handleChange('panelTypeDetail', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="type1">Type 1 Panel</option>
          <option value="type2">Type 2 Panel</option>
        </select>
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
            value={inputs.length}
            onChange={(e) => handleChange('length', parseFloat(e.target.value))}
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
            value={inputs.width}
            onChange={(e) => handleChange('width', parseFloat(e.target.value))}
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
            value={inputs.height}
            onChange={(e) => handleChange('height', parseFloat(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Material Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Material
        </label>
        <select
          value={inputs.material}
          onChange={(e) => handleChange('material', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="SS316">SS316 (Stainless Steel 316)</option>
          <option value="SS304">SS304 (Stainless Steel 304)</option>
          <option value="HDG">HDG (Hot Dip Galvanized)</option>
          <option value="MS">MS (Mild Steel)</option>
          <option value="FRP">FRP (Fiberglass)</option>
        </select>
      </div>

      {/* Freeboard */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Freeboard (Air Gap)
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            max="500"
            step="10"
            value={inputs.freeboard || 100}
            onChange={(e) => handleChange('freeboard', parseInt(e.target.value))}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <span className="text-gray-600 text-sm font-medium">mm</span>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Air space at top of tank (typically 100-200mm)
        </p>
      </div>

      {/* MS Tank Finish (only show if MS is selected) */}
      {inputs.material === 'MS' && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tank Finish (MS Material)
          </label>
          <select
            value={inputs.tankFinish || 'none'}
            onChange={(e) => handleChange('tankFinish', e.target.value)}
            className="w-full px-4 py-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          >
            <option value="none">None (Bare MS)</option>
            <option value="hdg">HDG (Hot Dip Galvanized)</option>
            <option value="hdg_hdpe">HDG + HDPE Lining</option>
            <option value="hdgebs">HDGEBS (HDG Enamel Both Sides)</option>
            <option value="hdgebs_hdpe">HDGEBS + HDPE Lining</option>
            <option value="ms_hdpe">MS + HDPE Lining</option>
            <option value="msebs">MSEBS (MS Enamel Both Sides)</option>
            <option value="msebs_hdpe">MSEBS + HDPE Lining</option>
          </select>
          <p className="text-xs text-amber-700 mt-2">
            Select coating/lining for mild steel panels
          </p>
        </div>
      )}

      {/* Support Structure Selection */}
      <div className="border-t pt-5 mt-5">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tank Support Structure
        </label>
        <select
          value={inputs.supportType || 'none'}
          onChange={(e) => handleChange('supportType', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="none">No Support Structure</option>
          <option value="internal">Internal Support (Tie Rods/Stays)</option>
          <option value="external">External Support (I-Beams)</option>
        </select>
        <p className="text-xs text-gray-500 mt-1">
          {inputs.supportType === 'internal' && '✓ Recommended for steel tanks up to 4m height'}
          {inputs.supportType === 'external' && '✓ Recommended for FRP tanks and tall steel tanks'}
          {inputs.supportType === 'none' && 'Support structures strengthen the tank'}
        </p>
      </div>

      {/* I-Beam Size Selection (only if external support) */}
      {inputs.supportType === 'external' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            I-Beam Size
          </label>
          <select
            value={inputs.iBeamSize || '150x75'}
            onChange={(e) => handleChange('iBeamSize', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="100x50">100mm × 50mm (Light Duty)</option>
            <option value="150x75">150mm × 75mm (Standard)</option>
            <option value="200x100">200mm × 100mm (Heavy Duty)</option>
            <option value="250x125">250mm × 125mm (Extra Heavy)</option>
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
          value={inputs.partitionCount}
          onChange={(e) => handleChange('partitionCount', parseInt(e.target.value))}
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

      {/* Tank Capacity Display */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border-2 border-blue-200">
        <div className="space-y-3">
          {/* Nominal Capacity */}
          <div>
            <div className="text-xs text-blue-700 font-medium uppercase">
              Nominal Tank Capacity
            </div>
            <div className="text-2xl font-bold text-blue-900">
              {(nominalCapacity * 1000).toLocaleString()} L
            </div>
            <div className="text-xs text-blue-600">
              {nominalCapacity.toFixed(2)} m³ (Full height)
            </div>
          </div>

          {/* Effective Capacity */}
          <div className="pt-3 border-t border-blue-200">
            <div className="text-xs text-green-700 font-medium uppercase">
              Effective Tank Capacity
            </div>
            <div className="text-2xl font-bold text-green-900">
              {(effectiveCapacity * 1000).toLocaleString()} L
            </div>
            <div className="text-xs text-green-600">
              {effectiveCapacity.toFixed(2)} m³ (After {inputs.freeboard || 0}mm freeboard)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
