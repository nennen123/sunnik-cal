// app/calculator/components/BOMResults.js
import { generatePDF } from '../../lib/pdfGenerator';

export default function BOMResults({ bom, inputs }) {
  const handleExportPDF = () => {
    try {
      const fileName = generatePDF(bom, inputs);
      console.log(`✅ PDF generated: ${fileName}`);
    } catch (error) {
      console.error('❌ Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  const renderSection = (title, items, bgColor = 'bg-gray-50') => {
    if (items.length === 0) return null;

    const sectionTotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

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
        <button
          onClick={handleExportPDF}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export to PDF
        </button>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-800 text-white font-semibold rounded-lg mb-4">
        <div className="col-span-4">Item / Description</div>
        <div className="col-span-2 text-right">Quantity</div>
        <div className="col-span-3 text-right">Unit Price</div>
        <div className="col-span-3 text-right">Subtotal</div>
      </div>

      {/* BOM Sections */}
      {renderSection('BASE / FLOOR PANELS', bom.base, 'bg-yellow-50')}
      {renderSection('WALL PANELS', bom.walls, 'bg-blue-50')}
      {bom.partition.length > 0 && renderSection('PARTITION PANELS', bom.partition, 'bg-purple-50')}
      {renderSection('ROOF PANELS', bom.roof, 'bg-green-50')}

      {/* Grand Total */}
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

      {/* Note */}
      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          <strong>Note:</strong> This BOM includes panels only. Support structures, accessories, and labor costs will be added in the next phase.
        </p>
      </div>
    </div>
  );
}
