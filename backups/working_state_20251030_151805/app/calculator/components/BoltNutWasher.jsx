// app/calculator/components/BoltNutWasher.jsx
'use client';

export default function BoltNutWasher({ values, onChange }) {
  const materials = [
    'HDG',
    'SS304',
    'SS316'
  ];

  const handleChange = (field, value) => {
    onChange({
      ...values,
      [field]: value
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200">
      {/* Section Title */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-8 bg-gradient-to-b from-purple-600 to-purple-800 rounded-full"></div>
        <h2 className="text-2xl font-bold text-gray-800">
          🔩 Bolt, Nut & Washer
        </h2>
      </div>

      {/* Material Dropdowns Grid - 2 columns on desktop, 1 on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* External BNW */}
        <div className="space-y-2">
          <label htmlFor="externalBNW" className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
            External BNW
          </label>
          <select
            id="externalBNW"
            value={values.externalBNW || 'HDG'}
            onChange={(e) => handleChange('externalBNW', e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg
                     focus:border-purple-500 focus:ring-4 focus:ring-purple-100
                     transition-all duration-200 text-gray-800 font-medium
                     bg-white cursor-pointer"
          >
            {materials.map(material => (
              <option key={material} value={material}>{material}</option>
            ))}
          </select>
          <p className="text-xs text-gray-500">
            For external wall panels
          </p>
        </div>

        {/* Internal BNW */}
        <div className="space-y-2">
          <label htmlFor="internalBNW" className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Internal BNW
          </label>
          <select
            id="internalBNW"
            value={values.internalBNW || 'SS304'}
            onChange={(e) => handleChange('internalBNW', e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg
                     focus:border-purple-500 focus:ring-4 focus:ring-purple-100
                     transition-all duration-200 text-gray-800 font-medium
                     bg-white cursor-pointer"
          >
            {materials.map(material => (
              <option key={material} value={material}>{material}</option>
            ))}
          </select>
          <p className="text-xs text-gray-500">
            For internal components
          </p>
        </div>

        {/* Roof BNW */}
        <div className="space-y-2">
          <label htmlFor="roofBNW" className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Roof BNW
          </label>
          <select
            id="roofBNW"
            value={values.roofBNW || 'SS304'}
            onChange={(e) => handleChange('roofBNW', e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg
                     focus:border-purple-500 focus:ring-4 focus:ring-purple-100
                     transition-all duration-200 text-gray-800 font-medium
                     bg-white cursor-pointer"
          >
            {materials.map(material => (
              <option key={material} value={material}>{material}</option>
            ))}
          </select>
          <p className="text-xs text-gray-500">
            For roof panels
          </p>
        </div>
      </div>

      {/* Special Request */}
      <div className="space-y-2">
        <label htmlFor="bnwSpecialRequest" className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Special Request (Optional)
        </label>
        <textarea
          id="bnwSpecialRequest"
          value={values.specialRequest || ''}
          onChange={(e) => handleChange('specialRequest', e.target.value)}
          rows={3}
          placeholder="E.g., All stainless steel bolts, specific torque requirements, custom washer sizes..."
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg
                   focus:border-purple-500 focus:ring-4 focus:ring-purple-100
                   transition-all duration-200 resize-none
                   text-gray-800 placeholder-gray-400"
        />
      </div>

      {/* Info Note */}
      <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg">
        <p className="text-sm text-blue-800">
          💡 <strong>Material Selection Guide:</strong>
        </p>
        <ul className="mt-2 ml-4 space-y-1 text-sm text-blue-700">
          <li>• <strong>HDG:</strong> Hot-Dipped Galvanized - Cost-effective, corrosion resistant</li>
          <li>• <strong>SS304:</strong> Stainless Steel 304 - Good corrosion resistance</li>
          <li>• <strong>SS316:</strong> Stainless Steel 316 - Superior corrosion resistance (marine grade)</li>
        </ul>
      </div>

      {/* Current Selection Summary */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
        <p className="text-sm font-semibold text-gray-700 mb-2">
          📋 Current Selection:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">External:</span>
            <span className="ml-2 font-bold text-purple-600">{values.externalBNW || 'HDG'}</span>
          </div>
          <div>
            <span className="text-gray-600">Internal:</span>
            <span className="ml-2 font-bold text-purple-600">{values.internalBNW || 'SS304'}</span>
          </div>
          <div>
            <span className="text-gray-600">Roof:</span>
            <span className="ml-2 font-bold text-purple-600">{values.roofBNW || 'SS304'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
