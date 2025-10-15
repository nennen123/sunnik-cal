// app/calculator/components/QuoteSummary.js

export default function QuoteSummary({ bom, inputs }) {
    const materialNames = {
      'SS316': 'Stainless Steel 316',
      'SS304': 'Stainless Steel 304',
      'HDG': 'Hot Dip Galvanized',
      'MS': 'Mild Steel Painted',
      'FRP': 'Fiberglass Reinforced Plastic'
    };

    const panelTypeNames = {
      'm': 'Metric (1m × 1m)',
      'i': 'Imperial (4ft × 4ft / 1.22m × 1.22m)'
    };

    const volume = inputs.length * inputs.width * inputs.height;
    const volumeLiters = volume * 1000;

    return (
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-lg p-6 text-white">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-1">Tank Specification</h2>
            <p className="text-blue-100 text-sm">
              Generated on {new Date().toLocaleDateString('en-MY')}
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">
              {volumeLiters.toLocaleString()} L
            </div>
            <div className="text-sm text-blue-100">
              {volume.toFixed(2)} m³
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Dimensions */}
          <div className="bg-white bg-opacity-10 rounded-lg p-4">
            <div className="text-xs uppercase tracking-wide text-blue-200 mb-1">
              Dimensions
            </div>
            <div className="font-semibold">
              {inputs.length}m × {inputs.width}m × {inputs.height}m
            </div>
          </div>

          {/* Material */}
          <div className="bg-white bg-opacity-10 rounded-lg p-4">
            <div className="text-xs uppercase tracking-wide text-blue-200 mb-1">
              Material
            </div>
            <div className="font-semibold">
              {materialNames[inputs.material]}
            </div>
          </div>

          {/* Panel Type */}
          <div className="bg-white bg-opacity-10 rounded-lg p-4">
            <div className="text-xs uppercase tracking-wide text-blue-200 mb-1">
              Panel Type
            </div>
            <div className="font-semibold">
              {panelTypeNames[inputs.panelType]}
            </div>
          </div>

          {/* Partitions */}
          <div className="bg-white bg-opacity-10 rounded-lg p-4">
            <div className="text-xs uppercase tracking-wide text-blue-200 mb-1">
              Partitions
            </div>
            <div className="font-semibold">
              {inputs.partitionCount > 0 ? `${inputs.partitionCount} partition${inputs.partitionCount > 1 ? 's' : ''}` : 'None'}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-6 pt-6 border-t border-blue-400 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold">
              {bom.summary.totalPanels}
            </div>
            <div className="text-xs text-blue-200 uppercase tracking-wide">
              Total Panels
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold">
              {bom.base.length + bom.walls.length + bom.partition.length + bom.roof.length}
            </div>
            <div className="text-xs text-blue-200 uppercase tracking-wide">
              Line Items
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold">
              RM {bom.summary.totalCost.toLocaleString()}
            </div>
            <div className="text-xs text-blue-200 uppercase tracking-wide">
              Estimated Cost
            </div>
          </div>
        </div>
      </div>
    );
  }
