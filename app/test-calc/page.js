'use client';

import { useState } from 'react';
import { calculateBOM } from '../lib/bomCalculator';

export default function TestCalc() {
  const [result, setResult] = useState(null);

  const test = () => {
    const bom = calculateBOM({
      length: 2, width: 1, height: 2,
      panelType: 'm', material: 'FRP',
      partitionCount: 0, buildStandard: 'MS1390',
      panelTypeDetail: 2,
      internalSupport: true, externalSupport: false,
      wliQty: 1, wliMaterial: 'HDG',
      internalLadderQty: 1, internalLadderMaterial: 'SS304',
      externalLadderQty: 1, externalLadderMaterial: 'HDG',
      manholeQty: 1, safetyCage: false, bnwMaterial: 'SS304',
      pipeFittings: []
    });
    setResult(JSON.stringify(bom.summary, null, 2));
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Calculator Test (No Auth)</h1>
      <button onClick={test} style={{ padding: '10px 20px', fontSize: 16, cursor: 'pointer' }}>
        Test Calculate FRP 2x1x2
      </button>
      {result && <pre style={{ marginTop: 20, background: '#f0f0f0', padding: 10 }}>{result}</pre>}
    </div>
  );
}
