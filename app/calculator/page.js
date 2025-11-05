'use client';
import { useState, useEffect } from 'react';
import { calculateBOM } from '../../lib/bomCalculator';
import { loadPrices, getPriceValue } from '../../lib/priceLoader';
import { MS1390_DEFAULTS } from '../../lib/accessoryDefaults';

// Core components
import TankInputs from './components/TankInputs';
import BOMResults from './components/BOMResults';

// Accessory components
import TankReinforcement from './components/TankReinforcement';
import TankAccessories from './components/TankAccessories';
import SkidBase from './components/SkidBase';
import BoltNutWasher from './components/BoltNutWasher';
import PipeFittingsCards from './components/PipeFittingsCards';
import Remarks from './components/Remarks';
import PriceSummary from './components/PriceSummary';

// Helper to calculate BOM total from all sections
function calculateBOMTotal(bom) {
  if (!bom) return 0;

  let total = 0;
  // Match actual BOM structure: partition (singular), supports, accessories
  const sections = ['base', 'walls', 'partition', 'roof', 'supports', 'accessories'];

  sections.forEach(sectionName => {
    const section = bom[sectionName];
    if (Array.isArray(section)) {
      section.forEach(item => {
        // Calculate from quantity * unitPrice (not subtotal)
        const itemTotal = (item.quantity || 0) * (item.unitPrice || 0);
        total += itemTotal;
      });
    }
  });

  return total;
}

export default function CalculatorPage() {
  const [inputs, setInputs] = useState({
    length: 2,
    width: 2,
    height: 2,
    panelType: 'm',
    panelTypeDetail: 1,
    material: 'FRP',
    buildStandard: 'MS1390',
    partitionCount: 0,
    roofThickness: 1.5,
    freeboard: 0.1,
    internalSupport: false,
    externalSupport: false,
  });

  const [accessories, setAccessories] = useState(MS1390_DEFAULTS);
  const [bom, setBOM] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [prices, setPrices] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        console.log('📂 Loading prices...');
        const priceData = await loadPrices();
        console.log('✅ Prices loaded successfully');
        setPrices(priceData);
        setLoading(false);
      } catch (error) {
        console.error('❌ Error loading prices:', error);
        setError('Failed to load prices: ' + error.message);
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleCalculate = () => {
    try {
      if (!prices) {
        alert('Prices not loaded yet. Please wait...');
        return;
      }
      const result = calculateBOM(inputs, prices);
      console.log('✅ BOM calculated:', result);
      console.log('💰 BOM total:', calculateBOMTotal(result));
      setBOM(result);
      setShowResults(true);
      setTimeout(() => {
        document.getElementById('results-section')?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }, 100);
    } catch (error) {
      console.error('❌ Error calculating BOM:', error);
      alert('Error: ' + error.message);
    }
  };

  const handleAccessoryChange = (newAccessories) => {
    setAccessories(newAccessories);
  };

  const handlePipeFittingsChange = (newFittings) => {
    setAccessories({ ...accessories, pipeFittings: newFittings });
  };

  const handleRemarksChange = (newRemarks) => {
    setAccessories({ ...accessories, remarks: newRemarks });
  };

  const handleBNWChange = (newBNW) => {
    setAccessories({ ...accessories, ...newBNW });
  };

  const handleSkidBaseChange = (newSkidBase) => {
    setAccessories({ ...accessories, ...newSkidBase });
  };

  const handleReset = () => {
    if (confirm('Reset all fields?')) {
      setInputs({
        length: 2,
        width: 2,
        height: 2,
        panelType: 'm',
        panelTypeDetail: 1,
        material: 'FRP',
        buildStandard: 'MS1390',
        partitionCount: 0,
        roofThickness: 1.5,
        freeboard: 0.1,
        internalSupport: false,
        externalSupport: false,
      });
      setAccessories(MS1390_DEFAULTS);
      setBOM(null);
      setShowResults(false);
    }
  };

  const handleGeneratePDF = () => {
    alert('PDF generation coming soon!');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-700 text-lg font-semibold">Loading Calculator...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-red-50 border-2 border-red-500 rounded-lg p-6 max-w-2xl">
          <h2 className="text-red-800 text-xl font-bold mb-2">Error Loading Calculator</h2>
          <p className="text-red-700">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-red-600 text-white rounded">
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border-2 border-gray-200">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg">
              S
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Sunnik Tank Calculator
              </h1>
              <p className="text-gray-600 mt-1">Your trusted partner in water storage solutions</p>
            </div>
          </div>
        </div>

        {/* Tank Inputs */}
        <TankInputs inputs={inputs} setInputs={setInputs} />

        {/* Configuration Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-2xl shadow-xl p-6 text-white mt-8">
          <h2 className="text-3xl font-bold mb-2">🎨 Configure Tank Accessories</h2>
          <p className="text-purple-100">Complete all specifications before calculating</p>
        </div>

        {/* Accessories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="space-y-6">
            <TankReinforcement values={accessories} onChange={handleAccessoryChange} tankHeight={inputs.height} />
            <SkidBase values={accessories} onChange={handleSkidBaseChange} />
            <Remarks value={accessories.remarks || ''} onChange={handleRemarksChange} />
          </div>
          <div className="space-y-6">
            <TankAccessories values={accessories} onChange={handleAccessoryChange} tankHeight={inputs.height} />
            <BoltNutWasher values={accessories} onChange={handleBNWChange} />
          </div>
        </div>

        {/* Pipe Fittings */}
        <div className="mt-6">
          <PipeFittingsCards fittings={accessories.pipeFittings || []} onChange={handlePipeFittingsChange} />
        </div>

        {/* Calculate Button */}
        <div className="flex justify-center my-8">
          <button onClick={handleCalculate} className="px-16 py-6 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl font-bold text-2xl hover:from-green-600 hover:to-green-700 transition-all duration-200 transform hover:-translate-y-1 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-green-300 flex items-center gap-4">
            <span className="text-3xl">🧮</span>
            Calculate Complete BOM
          </button>
        </div>

        {/* Results */}
        {showResults && bom && (
          <div id="results-section" className="space-y-6 mt-8">
            <div className="bg-green-50 border-2 border-green-500 rounded-xl p-6">
              <div className="flex items-center gap-3">
                <span className="text-4xl">✅</span>
                <div>
                  <h3 className="text-2xl font-bold text-green-800">BOM Calculated!</h3>
                  <p className="text-green-700 mt-1">Review your complete bill of materials</p>
                </div>
              </div>
            </div>

            <PriceSummary baseTankPrice={calculateBOMTotal(bom)} accessories={accessories} onGeneratePDF={handleGeneratePDF} onReset={handleReset} />

            <div className="my-8 border-t-2 border-gray-300"></div>

            <BOMResults bom={bom} inputs={inputs} />
          </div>
        )}
      </div>
    </div>
  );
}
