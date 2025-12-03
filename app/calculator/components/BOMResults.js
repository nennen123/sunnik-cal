// app/calculator/components/BOMResults.js
// Updated: v1.3.0 - Added roofSupport section (OP Truss, Purlins, RTS)
// v1.2.0 - Added supports, accessories, and pipe fittings sections
// Fixed BUG-009: Pipe fittings and accessories now display in app

export default function BOMResults({ bom }) {
  // Section color scheme (matching PDF)
  const sectionColors = {
    base: 'bg-blue-50 border-blue-300',
    baseHeader: 'bg-blue-100 text-blue-800',
    walls: 'bg-green-50 border-green-300',
    wallsHeader: 'bg-green-100 text-green-800',
    partition: 'bg-yellow-50 border-yellow-300',
    partitionHeader: 'bg-yellow-100 text-yellow-800',
    roof: 'bg-red-50 border-red-300',
    roofHeader: 'bg-red-100 text-red-800',
    roofSupport: 'bg-pink-50 border-pink-300',
    roofSupportHeader: 'bg-pink-100 text-pink-800',
    supports: 'bg-purple-50 border-purple-300',
    supportsHeader: 'bg-purple-100 text-purple-800',
    accessories: 'bg-cyan-50 border-cyan-300',
    accessoriesHeader: 'bg-cyan-100 text-cyan-800',
    pipeFittings: 'bg-orange-50 border-orange-300',
    pipeFittingsHeader: 'bg-orange-100 text-orange-800'
  };

  const renderSection = (title, items, colorKey = 'base') => {
    if (!items || items.length === 0) return null;

    const sectionTotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const bgColor = sectionColors[colorKey] || 'bg-gray-50 border-gray-300';
    const headerColor = sectionColors[`${colorKey}Header`] || 'bg-gray-100 text-gray-800';

    return (
      <div className="mb-6">
        <div className={`${headerColor} px-4 py-2 font-semibold rounded-t-lg border-b-2`}>
          {title}
        </div>
        <div className={`${bgColor} border border-t-0 rounded-b-lg`}>
          {items.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-gray-200 last:border-b-0 hover:bg-white/50 transition-colors"
            >
              <div className="col-span-5">
                <div className="font-mono text-sm text-blue-600 font-medium">
                  {item.sku}
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {item.description}
                </div>
              </div>
              <div className="col-span-2 text-right">
                <div className="font-semibold text-gray-800">
                  {item.quantity}
                </div>
                <div className="text-xs text-gray-500">pcs</div>
              </div>
              <div className="col-span-2 text-right">
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
          {/* Section Total Row */}
          <div className="px-4 py-3 bg-white/50 rounded-b-lg">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-700 text-sm">Section Subtotal:</span>
              <span className="font-bold text-lg text-gray-900">
                RM {sectionTotal.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Calculate section totals for summary
  const calculateSectionTotal = (items) => {
    if (!items || items.length === 0) return 0;
    return items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };

  const baseTotal = calculateSectionTotal(bom.base);
  const wallsTotal = calculateSectionTotal(bom.walls);
  const partitionTotal = calculateSectionTotal(bom.partition);
  const roofTotal = calculateSectionTotal(bom.roof);
  const roofSupportTotal = calculateSectionTotal(bom.roofSupport);
  const supportsTotal = calculateSectionTotal(bom.supports);
  const accessoriesTotal = calculateSectionTotal(bom.accessories);
  const pipeFittingsTotal = calculateSectionTotal(bom.pipeFittings);

  // Grand total from all sections
  const calculatedTotal = baseTotal + wallsTotal + partitionTotal + roofTotal +
                          roofSupportTotal + supportsTotal + accessoriesTotal + pipeFittingsTotal;

  // Use BOM summary total if available, otherwise use calculated
  const grandTotal = bom.summary?.totalCost || calculatedTotal;
  const totalPanels = bom.summary?.totalPanels || 0;

  // Count items per section for stats
  const totalLineItems = [
    ...(bom.base || []),
    ...(bom.walls || []),
    ...(bom.partition || []),
    ...(bom.roof || []),
    ...(bom.roofSupport || []),
    ...(bom.supports || []),
    ...(bom.accessories || []),
    ...(bom.pipeFittings || [])
  ].length;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Bill of Materials
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {totalLineItems} line items across {[
              bom.base?.length > 0,
              bom.walls?.length > 0,
              bom.partition?.length > 0,
              bom.roof?.length > 0,
              bom.roofSupport?.length > 0,
              bom.supports?.length > 0,
              bom.accessories?.length > 0,
              bom.pipeFittings?.length > 0
            ].filter(Boolean).length} sections
          </p>
        </div>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-800 text-white font-semibold rounded-lg mb-4 text-sm">
        <div className="col-span-5">Item / Description</div>
        <div className="col-span-2 text-right">Quantity</div>
        <div className="col-span-2 text-right">Unit Price</div>
        <div className="col-span-3 text-right">Subtotal</div>
      </div>

      {/* BOM Sections - Color coded */}
      {renderSection('BASE / FLOOR PANELS', bom.base, 'base')}
      {renderSection('WALL PANELS', bom.walls, 'walls')}
      {renderSection('PARTITION PANELS', bom.partition, 'partition')}
      {renderSection('ROOF PANELS', bom.roof, 'roof')}
      {renderSection('ROOF SUPPORT', bom.roofSupport, 'roofSupport')}
      {renderSection('SUPPORT STRUCTURES', bom.supports, 'supports')}
      {renderSection('ACCESSORIES', bom.accessories, 'accessories')}
      {renderSection('PIPE FITTINGS', bom.pipeFittings, 'pipeFittings')}

      {/* Section Summary Cards */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        {baseTotal > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="text-xs text-blue-600 font-medium">Base Panels</div>
            <div className="text-lg font-bold text-blue-800">RM {baseTotal.toFixed(0)}</div>
          </div>
        )}
        {wallsTotal > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="text-xs text-green-600 font-medium">Wall Panels</div>
            <div className="text-lg font-bold text-green-800">RM {wallsTotal.toFixed(0)}</div>
          </div>
        )}
        {roofTotal > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="text-xs text-red-600 font-medium">Roof Panels</div>
            <div className="text-lg font-bold text-red-800">RM {roofTotal.toFixed(0)}</div>
          </div>
        )}
        {accessoriesTotal > 0 && (
          <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-3">
            <div className="text-xs text-cyan-600 font-medium">Accessories</div>
            <div className="text-lg font-bold text-cyan-800">RM {accessoriesTotal.toFixed(0)}</div>
          </div>
        )}
      </div>

      {/* Grand Total */}
      <div className="mt-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-sm uppercase tracking-wide opacity-90">
              Grand Total
            </div>
            <div className="text-xs mt-1 opacity-75">
              {totalPanels} total panels • {totalLineItems} line items
            </div>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold">
              RM {grandTotal.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Info Note */}
      {(!bom.supports || bom.supports.length === 0) && (!bom.accessories || bom.accessories.length === 0) && (
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <strong>💡 Tip:</strong> Enable accessories (Water Level Indicator, Ladders, Safety Cage, BNW)
            and support structures in the Tank Accessories section above to include them in the BOM.
          </p>
        </div>
      )}

      {/* Pipe Fittings Note */}
      {bom.pipeFittings && bom.pipeFittings.length > 0 && pipeFittingsTotal === 0 && (
        <div className="mt-4 bg-orange-50 border border-orange-200 rounded-lg p-4">
          <p className="text-sm text-orange-800">
            <strong>ℹ️ Note:</strong> Pipe fittings are shown at RM 0.00 as prices vary based on specifications.
            Final pricing will be confirmed during quotation review.
          </p>
        </div>
      )}
    </div>
  );
}
