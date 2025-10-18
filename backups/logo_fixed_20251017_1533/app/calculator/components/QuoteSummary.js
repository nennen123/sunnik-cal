// app/calculator/components/QuoteSummary.js

export default function QuoteSummary({ bom, inputs }) {
  const materialNames = {
    'SS316': 'Stainless Steel 316',
    'SS304': 'Stainless Steel 304',
    'HDG': 'Hot Dip Galvanized',
    'MS': 'Mild Steel',
    'FRP': 'Fiberglass Reinforced Plastic'
  };

  const panelTypeNames = {
    'm': 'Metric (1m × 1m)',
    'i': 'Imperial (4ft × 4ft)'
  };

  const panelTypeDetailNames = {
    'type1': 'Type 1',
    'type2': 'Type 2'
  };

  const tankFinishNames = {
    'none': 'None (Bare MS)',
    'hdg': 'HDG',
    'hdg_hdpe': 'HDG + HDPE',
    'hdgebs': 'HDGEBS',
    'hdgebs_hdpe': 'HDGEBS + HDPE',
    'ms_hdpe': 'MS + HDPE',
    'msebs': 'MSEBS',
    'msebs_hdpe': 'MSEBS + HDPE'
  };

  // Calculate capacities
  const nominalCapacity = inputs.length * inputs.width * inputs.height;
  const nominalLiters = nominalCapacity * 1000;

  const freeboardMeters = (inputs.freeboard || 0) / 1000;
  const effectiveHeight = inputs.height - freeboardMeters;
  const effectiveCapacity = inputs.length * inputs.width * Math.max(0, effectiveHeight);
  const effectiveLiters = effectiveCapacity * 1000;

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
          <div className="text-sm text-blue-200 uppercase tracking-wide mb-1">
            Nominal Capacity
          </div>
          <div className="text-3xl font-bold">
            {nominalLiters.toLocaleString()} L
          </div>
          <div className="text-sm text-blue-100">
            {nominalCapacity.toFixed(2)} m³
          </div>

          <div className="mt-3 pt-3 border-t border-blue-400">
            <div className="text-sm text-green-200 uppercase tracking-wide mb-1">
              Effective Capacity
            </div>
            <div className="text-2xl font-bold text-green-100">
              {effectiveLiters.toLocaleString()} L
            </div>
            <div className="text-xs text-green-200">
              {effectiveCapacity.toFixed(2)} m³ (freeboard: {inputs.freeboard || 0}mm)
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
          {inputs.material === 'MS' && inputs.tankFinish && inputs.tankFinish !== 'none' && (
            <div className="text-xs text-blue-100 mt-1">
              Finish: {tankFinishNames[inputs.tankFinish]}
            </div>
          )}
        </div>

        {/* Panel Details */}
        <div className="bg-white bg-opacity-10 rounded-lg p-4">
          <div className="text-xs uppercase tracking-wide text-blue-200 mb-1">
            Panel Type
          </div>
          <div className="font-semibold">
            {panelTypeNames[inputs.panelType]}
          </div>
          <div className="text-xs text-blue-100 mt-1">
            {panelTypeDetailNames[inputs.panelTypeDetail || 'type1']}
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

        {/* Freeboard */}
        <div className="bg-white bg-opacity-10 rounded-lg p-4">
          <div className="text-xs uppercase tracking-wide text-blue-200 mb-1">
            Freeboard
          </div>
          <div className="font-semibold">
            {inputs.freeboard || 0} mm
          </div>
        </div>

        {/* Support */}
        <div className="bg-white bg-opacity-10 rounded-lg p-4">
          <div className="text-xs uppercase tracking-wide text-blue-200 mb-1">
            Support
          </div>
          <div className="font-semibold">
            {inputs.supportType === 'internal' && 'Internal (Stays)'}
            {inputs.supportType === 'external' && 'External (I-Beams)'}
            {inputs.supportType === 'none' && 'None'}
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
            {bom.base.length + bom.walls.length + bom.partition.length + bom.roof.length + bom.supports.length + bom.accessories.length}
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
