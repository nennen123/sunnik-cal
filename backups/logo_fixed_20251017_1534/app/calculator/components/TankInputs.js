// app/calculator/components/TankInputs.js

export default function TankInputs({ inputs, setInputs }) {
  const handleChange = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-5">
      {/* Panel Type Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Panel Type
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

      {/* Panel Type Detail */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Panel Type Detail
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleChange('panelTypeDetail', 1)}
            className={`py-2 px-4 rounded-lg font-medium transition-colors ${
              inputs.panelTypeDetail === 1
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Type 1
          </button>
          <button
            onClick={() => handleChange('panelTypeDetail', 2)}
            className={`py-2 px-4 rounded-lg font-medium transition-colors ${
              inputs.panelTypeDetail === 2
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
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
            Freeboard (air gap in meters)
          </label>
          <input
            type="number"
            min="0"
            max="1"
            step="0.01"
            value={inputs.freeboard || ''}
            onChange={(e) => handleChange('freeboard', parseFloat(e.target.value) || 0.1)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            Default: 0.1m (100mm air gap at top)
          </p>
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

      {/* MS Tank Finish (only show if MS is selected) */}
      {inputs.material === 'MS' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            MS Tank Finish
          </label>
          <select
            value={inputs.msTankFinish || 'None'}
            onChange={(e) => handleChange('msTankFinish', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="None">None</option>
            <option value="HDG">HDG (Hot Dip Galvanized)</option>
            <option value="HDG+HDPE">HDG + HDPE Lining</option>
            <option value="HDGEBS">HDG + Epoxy Both Sides</option>
            <option value="HDGEBS+HDPE">HDG + Epoxy Both Sides + HDPE</option>
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

        {/* I-Beam Size Selector (only show if external support is checked) */}
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
            {((inputs.length || 0) * (inputs.width || 0) * ((inputs.height || 0) - (inputs.freeboard || 0.1)) * 1000).toLocaleString()} L
          </div>
          <div className="text-xs text-blue-600">
            {((inputs.length || 0) * (inputs.width || 0) * ((inputs.height || 0) - (inputs.freeboard || 0.1))).toFixed(2)} m³
          </div>
        </div>
      </div>
    </div>
  );
}
