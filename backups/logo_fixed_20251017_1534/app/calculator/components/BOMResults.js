// app/calculator/components/BOMResults.js

export default function BOMResults({ bom, inputs }) {
  // Helper function to render a section
  const renderSection = (title, items, colorClass) => {
    if (!items || items.length === 0) return null;

    const sectionTotal = items.reduce((sum, item) =>
      sum + (item.quantity * item.unitPrice), 0
    );

    return (
      <div className="mb-6">
        <div className={`${colorClass} text-white px-4 py-2 font-semibold rounded-t-lg`}>
          {title}
        </div>
        <div className="bg-white rounded-b-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item / Description
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Qty
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unit Price
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subtotal
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {items.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{item.sku}</div>
                    <div className="text-sm text-gray-500">{item.description}</div>
                    {/* Show breakdown for bolts if available */}
                    {item.breakdown && (
                      <div className="text-xs text-gray-400 mt-1">
                        Base: {item.breakdown.base} | Roof: {item.breakdown.roof} |
                        Walls: {item.breakdown.lengthWalls + item.breakdown.widthWalls}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-900">
                    {item.quantity}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-900">
                    RM {item.unitPrice.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">
                    RM {(item.quantity * item.unitPrice).toFixed(2)}
                  </td>
                </tr>
              ))}
              <tr className="bg-gray-50">
                <td colSpan="3" className="px-4 py-3 text-right font-semibold text-gray-700">
                  Section Subtotal:
                </td>
                <td className="px-4 py-3 text-right font-bold text-gray-900">
                  RM {sectionTotal.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Bill of Materials
        </h2>
        <div className="text-sm text-gray-500">
          Generated on {new Date().toLocaleDateString('en-MY')}
        </div>
      </div>

      {/* Base Panels */}
      {renderSection('BASE / FLOOR PANELS', bom.base, 'bg-blue-600')}

      {/* Wall Panels */}
      {renderSection('WALL PANELS', bom.walls, 'bg-green-600')}

      {/* Partition Panels */}
      {bom.partition && bom.partition.length > 0 &&
        renderSection('PARTITION PANELS', bom.partition, 'bg-purple-600')
      }

      {/* Roof Panels */}
      {renderSection('ROOF PANELS', bom.roof, 'bg-orange-600')}

      {/* Support Structures */}
      {bom.supports && bom.supports.length > 0 &&
        renderSection(
          inputs.supportType === 'internal'
            ? 'INTERNAL SUPPORT (TIE RODS/STAYS)'
            : 'EXTERNAL SUPPORT (I-BEAMS & BRACING)',
          bom.supports,
          'bg-indigo-600'
        )
      }

      {/* Accessories (Bolts & Nuts) */}
      {bom.accessories && bom.accessories.length > 0 &&
        renderSection('ACCESSORIES (BOLTS & NUTS)', bom.accessories, 'bg-gray-700')
      }

      {/* Grand Total */}
      <div className="mt-6 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-lg font-semibold">GRAND TOTAL</div>
            <div className="text-sm text-blue-100 mt-1">
              {bom.summary.totalPanels} panels
              {bom.supports && bom.supports.length > 0 &&
                ` + ${bom.summary.supportItems} support items`
              }
              {bom.accessories && bom.accessories.length > 0 &&
                ` + ${bom.summary.accessoryItems} accessory items`
              }
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">
              RM {bom.summary.totalCost.toLocaleString('en-MY', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </div>
            <div className="text-sm text-blue-100 mt-1">
              Complete BOM
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex gap-2">
          <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-yellow-800">
            <p className="font-semibold mb-1">Important Notes:</p>
            <ul className="list-disc list-inside space-y-1 text-yellow-700">
              <li>This quotation includes panels, {inputs.supportType !== 'none' && 'support structures,'} and bolts/nuts</li>
              <li>Additional accessories (cleats, sealants, washers) quoted separately</li>
              <li>Labor costs and installation charges are excluded</li>
              <li>Final pricing subject to site conditions and requirements</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
