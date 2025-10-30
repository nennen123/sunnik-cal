// app/calculator/components/BOMResults.js

export default function BOMResults({ bom, inputs }) {
  const renderSection = (title, items, bgColor) => {
    if (!items || items.length === 0) return null;

    const sectionTotal = items.reduce((sum, item) =>
      sum + (item.quantity * item.unitPrice), 0
    );

    return (
      <div className="mb-6">
        <div className={`${bgColor} px-4 py-2 font-semibold text-gray-800 rounded-t-lg border-b-2 border-gray-300`}>
          {title}
        </div>
        <div className="bg-white">
          {items.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="col-span-4">
                <div className="font-mono text-sm text-blue-600 font-medium">
                  {item.sku}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {item.description}
                </div>
              </div>
              <div className="col-span-2 text-right">
                <div className="font-semibold text-gray-800">
                  {item.quantity}
                </div>
                <div className="text-xs text-gray-500">pcs</div>
              </div>
              <div className="col-span-3 text-right">
                <div className="text-gray-700">
                  RM {item.unitPrice.toFixed(2)}
                </div>
                <div className="text-xs text-gray-500">per unit</div>
              </div>
              <div className="col-span-3 text-right">
                <div className="font-bold text-gray-900">
                  RM {(item.quantity * item.unitPrice).toFixed(2)}
                </div>
                <div className="text-xs text-gray-500">subtotal</div>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-gray-100 px-4 py-3 rounded-b-lg">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-gray-700">Section Total:</span>
            <span className="font-bold text-lg text-gray-900">
              RM {sectionTotal.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Bill of Materials
        </h2>
        <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
          Export to PDF
        </button>
      </div>

      <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-800 text-white font-semibold rounded-lg mb-4">
        <div className="col-span-4">Item / Description</div>
        <div className="col-span-2 text-right">Quantity</div>
        <div className="col-span-3 text-right">Unit Price</div>
        <div className="col-span-3 text-right">Subtotal</div>
      </div>

      {renderSection('BASE / FLOOR PANELS', bom.base, 'bg-yellow-50')}
      {renderSection('WALL PANELS', bom.walls, 'bg-blue-50')}
      {bom.partition && bom.partition.length > 0 && renderSection('PARTITION PANELS', bom.partition, 'bg-purple-50')}
      {renderSection('ROOF PANELS', bom.roof, 'bg-green-50')}

      {bom.internalSupport && bom.internalSupport.length > 0 && renderSection(
        inputs.material === 'FRP' ? 'STRUCTURAL SUPPORT' : 'INTERNAL SUPPORT (TIE RODS)',
        bom.internalSupport,
        'bg-orange-50'
      )}
      {bom.externalSupport && bom.externalSupport.length > 0 && renderSection('EXTERNAL SUPPORT (I-BEAMS)', bom.externalSupport, 'bg-red-50')}

      {bom.accessories && bom.accessories.length > 0 && renderSection('ACCESSORIES (BOLTS & NUTS)', bom.accessories, 'bg-teal-50')}

      <div className="mt-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-sm uppercase tracking-wide opacity-90">
              Grand Total
            </div>
            <div className="text-xs mt-1 opacity-75">
              {bom.summary.totalPanels} total panels
            </div>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold">
              RM {bom.summary.totalCost.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          <strong>Note:</strong> This BOM includes panels only. Support structures, accessories, and labor costs will be added in the next phase.
        </p>
      </div>
    </div>
  );
}
