// app/calculator/components/TankInputs.js

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
      buildStandard: 'MS1390'  // <-- ADD THIS LINE
    }));
  } else {
    // Switch to steel build standard if coming from FRP
    setInputs(prev => ({
      ...prev,
      material,
      buildStandard: prev.buildStandard === 'MS1390' || prev.buildStandard === 'SS245'
        ? 'SANS'  // Reset to SANS if was FRP standard
        : prev.buildStandard
    }));
  }
};

  // Check if FRP is selected (disable panel type controls)
  const isFRP = inputs.material === 'FRP';

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
          value={inputs.buildStandard || (isFRP ? 'MS1390' : 'SANS')}
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
              <option value="SANS">SANS 10329:2020 (South African)</option>
              <option value="BSI">BSI (British Standard)</option>
              <option value="LPCB">LPCB (Loss Prevention Certification Board)</option>
            </>
          )}
        </select>
        <p className="text-xs text-gray-500 mt-1">
          {isFRP ? (
            inputs.buildStandard === 'MS1390'
              ? 'Malaysian Standard - 35% fiberglass minimum, SPAN approved'
              : 'Singapore Standard for FRP tanks'
          ) : (
            <>
              {inputs.buildStandard === 'SANS' && 'Standard thickness progression based on height'}
              {inputs.buildStandard === 'BSI' && 'British Standard: 5mm for 1-3 panels, 6mm base for 4+ panels'}
              {inputs.buildStandard === 'LPCB' && 'LPCB Standard: 5mm for 1-3 panels, 6mm base for 4+ panels'}
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
              inputs.panelTypeDetail === 1
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
              inputs.panelTypeDetail === 2
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

      {/* Accessories Section */}
      <div className="border-t pt-5">
        <h3 className="text-sm font-semibold text-gray-800 uppercase mb-4">
          Accessories
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
                <option value="PVC">PVC Tube</option>
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
                <option value="PVC">PVC Tube</option>
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
