// app/calculator/components/PriceSummary.jsx
'use client';

export default function PriceSummary({
  baseTankPrice = 0,
  accessories = {},
  onGeneratePDF,
  onReset
}) {
  // Calculate accessory subtotals
  const manholeTotal = (accessories.manhole?.quantity || 0) * 380;
  const wliTotal = (accessories.wli?.quantity || 0) * 1046.93;
  const intLadderTotal = (accessories.internalLadder?.quantity || 0) * 44;
  const extLadderTotal = (accessories.externalLadder?.quantity || 0) * 123.58;
  const safetyCageTotal = accessories.safetyCage?.enabled ? 150 : 0;
  const airVentTotal = (accessories.airVent?.quantity || 2) * (accessories.airVent?.size === '100mm' ? 45 : 25);
  const epdmTotal = 405.60; // Placeholder - should be calculated
  const skidBaseTotal = 224.00; // Placeholder - should be calculated
  const pipeFittingsTotal = (accessories.pipeFittings?.length || 0) * 250;

  const accessoriesSubtotal =
    manholeTotal +
    wliTotal +
    intLadderTotal +
    extLadderTotal +
    safetyCageTotal +
    airVentTotal +
    epdmTotal +
    skidBaseTotal +
    pipeFittingsTotal;

  const grandTotal = baseTankPrice + accessoriesSubtotal;

  return (
    <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl shadow-2xl p-8 text-white">
      {/* Title */}
      <div className="flex items-center gap-3 mb-6">
        <div className="text-3xl">💰</div>
        <h2 className="text-3xl font-bold">Price Summary</h2>
      </div>

      {/* Price Breakdown */}
      <div className="space-y-3">
        {/* Base Tank */}
        <div className="flex justify-between items-center py-3 border-b border-white/20">
          <span className="text-lg">Base Tank (Panels + Hardware)</span>
          <span className="text-xl font-semibold">RM {baseTankPrice.toFixed(2)}</span>
        </div>

        {/* Accessories Breakdown */}
        {manholeTotal > 0 && (
          <div className="flex justify-between items-center py-2 border-b border-white/10 text-white/90">
            <span className="text-sm">Manhole ({accessories.manhole.quantity} × {accessories.manhole.type})</span>
            <span className="font-semibold">RM {manholeTotal.toFixed(2)}</span>
          </div>
        )}

        {wliTotal > 0 && (
          <div className="flex justify-between items-center py-2 border-b border-white/10 text-white/90">
            <span className="text-sm">Water Level Indicator ({accessories.wli.quantity}×)</span>
            <span className="font-semibold">RM {wliTotal.toFixed(2)}</span>
          </div>
        )}

        {intLadderTotal > 0 && (
          <div className="flex justify-between items-center py-2 border-b border-white/10 text-white/90">
            <span className="text-sm">Internal Ladder ({accessories.internalLadder.quantity} × {accessories.internalLadder.material})</span>
            <span className="font-semibold">RM {intLadderTotal.toFixed(2)}</span>
          </div>
        )}

        {extLadderTotal > 0 && (
          <div className="flex justify-between items-center py-2 border-b border-white/10 text-white/90">
            <span className="text-sm">External Ladder ({accessories.externalLadder.quantity} × {accessories.externalLadder.material})</span>
            <span className="font-semibold">RM {extLadderTotal.toFixed(2)}</span>
          </div>
        )}

        {safetyCageTotal > 0 && (
          <div className="flex justify-between items-center py-2 border-b border-white/10 text-white/90">
            <span className="text-sm">Safety Cage</span>
            <span className="font-semibold">RM {safetyCageTotal.toFixed(2)}</span>
          </div>
        )}

        {airVentTotal > 0 && (
          <div className="flex justify-between items-center py-2 border-b border-white/10 text-white/90">
            <span className="text-sm">Air Vent ({accessories.airVent?.quantity || 2} × {accessories.airVent?.size || '50mm'})</span>
            <span className="font-semibold">RM {airVentTotal.toFixed(2)}</span>
          </div>
        )}

        {epdmTotal > 0 && (
          <div className="flex justify-between items-center py-2 border-b border-white/10 text-white/90">
            <span className="text-sm">EPDM Sealant</span>
            <span className="font-semibold">RM {epdmTotal.toFixed(2)}</span>
          </div>
        )}

        {skidBaseTotal > 0 && (
          <div className="flex justify-between items-center py-2 border-b border-white/10 text-white/90">
            <span className="text-sm">Skid Base System</span>
            <span className="font-semibold">RM {skidBaseTotal.toFixed(2)}</span>
          </div>
        )}

        {pipeFittingsTotal > 0 && (
          <div className="flex justify-between items-center py-2 border-b border-white/10 text-white/90">
            <span className="text-sm">Pipe Fittings ({accessories.pipeFittings.length} sets)</span>
            <span className="font-semibold">RM {pipeFittingsTotal.toFixed(2)}</span>
          </div>
        )}

        {/* Grand Total */}
        <div className="flex justify-between items-center pt-6 border-t-2 border-white/30 mt-4">
          <span className="text-2xl font-bold">TOTAL QUOTATION</span>
          <span className="text-3xl font-bold">RM {grandTotal.toFixed(2)}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mt-8">
        <button
          onClick={() => {
            console.log('🖱️  PDF Button Clicked!');
            if (onGeneratePDF) {
              console.log('✅ onGeneratePDF function exists, calling it...');
              onGeneratePDF();
            } else {
              console.error('❌ onGeneratePDF function is undefined!');
              alert('Error: PDF generation function not connected');
            }
          }}
          className="flex-1 py-4 bg-white text-purple-700 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
        >
          📄 Generate Quote PDF
        </button>
        <button
          onClick={onReset}
          className="px-6 py-4 bg-white/20 text-white rounded-xl font-bold text-lg hover:bg-white/30 transition-all duration-200"
        >
          🔄 Reset
        </button>
      </div>
    </div>
  );
}
