// app/lib/cleatCalculator.test.js
// Test cases for cleat calculations
// Run with: node app/lib/cleatCalculator.test.js

import {
  calculateCleats,
  calculateEdgeCleats,
  calculateCleatA,
  calculateCleatAL,
  calculateCornerCleats
} from './cleatCalculator.js';

console.log('🧪 CLEAT CALCULATOR TESTS\n');
console.log('='.repeat(50));

// ============================================
// TEST 1: 4×4×4 Type 2 (No Partition)
// ============================================
console.log('\n📦 Test 1: 4×4×4 Type 2 (No Partition)');

const test1 = calculateCleats({
  length: 4, width: 4, height: 4,
  panelType: 'm', material: 'HDG', tankType: 2, partitionCount: 0
});

const expected1 = { CleatE: 25, CleatEW: 20, CleatA: 6, CleatAL: 6, CC: 12 };
const edge1 = test1.find(c => c.sku.includes('CleatE-'));
const edgeW1 = test1.find(c => c.sku.includes('CleatEW-'));
const cleatA1 = test1.find(c => c.sku.includes('CleatA-'));
const cleatAL1 = test1.find(c => c.sku.includes('CleatAL-'));
const cc1 = test1.find(c => c.sku.includes('CC-18-'));

console.log(`CleatE:  ${edge1?.quantity || 0} (expected: ${expected1.CleatE}) ${edge1?.quantity === expected1.CleatE ? '✅' : '❌'}`);
console.log(`CleatEW: ${edgeW1?.quantity || 0} (expected: ${expected1.CleatEW}) ${edgeW1?.quantity === expected1.CleatEW ? '✅' : '❌'}`);
console.log(`CleatA:  ${cleatA1?.quantity || 0} (expected: ${expected1.CleatA}) ${cleatA1?.quantity === expected1.CleatA ? '✅' : '❌'}`);
console.log(`CleatAL: ${cleatAL1?.quantity || 0} (expected: ${expected1.CleatAL}) ${cleatAL1?.quantity === expected1.CleatAL ? '✅' : '❌'}`);
console.log(`CC:      ${cc1?.quantity || 0} (expected: ${expected1.CC}) ${cc1?.quantity === expected1.CC ? '✅' : '❌'}`);

// ============================================
// TEST 2: 6×4×4 Type 2 (No Partition)
// ============================================
console.log('\n📦 Test 2: 6×4×4 Type 2 (No Partition)');

const test2 = calculateCleats({
  length: 6, width: 4, height: 4,
  panelType: 'm', material: 'HDG', tankType: 2, partitionCount: 0
});

const expected2 = { CleatE: 35, CleatEW: 28, CleatA: 10, CleatAL: 6, CC: 12 };
const edge2 = test2.find(c => c.sku.includes('CleatE-'));
const edgeW2 = test2.find(c => c.sku.includes('CleatEW-'));
const cleatA2 = test2.find(c => c.sku.includes('CleatA-'));
const cleatAL2 = test2.find(c => c.sku.includes('CleatAL-'));
const cc2 = test2.find(c => c.sku.includes('CC-18-'));

console.log(`CleatE:  ${edge2?.quantity || 0} (expected: ${expected2.CleatE}) ${edge2?.quantity === expected2.CleatE ? '✅' : '❌'}`);
console.log(`CleatEW: ${edgeW2?.quantity || 0} (expected: ${expected2.CleatEW}) ${edgeW2?.quantity === expected2.CleatEW ? '✅' : '❌'}`);
console.log(`CleatA:  ${cleatA2?.quantity || 0} (expected: ${expected2.CleatA}) ${cleatA2?.quantity === expected2.CleatA ? '✅' : '❌'}`);
console.log(`CleatAL: ${cleatAL2?.quantity || 0} (expected: ${expected2.CleatAL}) ${cleatAL2?.quantity === expected2.CleatAL ? '✅' : '❌'}`);
console.log(`CC:      ${cc2?.quantity || 0} (expected: ${expected2.CC}) ${cc2?.quantity === expected2.CC ? '✅' : '❌'}`);

// ============================================
// TEST 3: 6×4×3 Type 1 (No Partition)
// ============================================
console.log('\n📦 Test 3: 6×4×3 Type 1 (No Partition)');

const test3 = calculateCleats({
  length: 6, width: 4, height: 3,
  panelType: 'm', material: 'HDG', tankType: 1, partitionCount: 0
});

const expected3 = { CleatE: 47, CleatEW: 0, CleatA: 10, CleatAL: 6, CC1: 24, CC2: 24 };
const edge3 = test3.find(c => c.sku.includes('CleatE-'));
const edgeW3 = test3.find(c => c.sku.includes('CleatEW-'));
const cleatA3 = test3.find(c => c.sku.includes('CleatA-'));
const cleatAL3 = test3.find(c => c.sku.includes('CleatAL-'));
const cc1_3 = test3.find(c => c.sku === 'CL200I001');
const cc2_3 = test3.find(c => c.sku.includes('CleatCC2-'));

console.log(`CleatE:  ${edge3?.quantity || 0} (expected: ${expected3.CleatE}) ${edge3?.quantity === expected3.CleatE ? '✅' : '❌'}`);
console.log(`CleatEW: ${edgeW3?.quantity || 0} (expected: ${expected3.CleatEW}) ${(edgeW3?.quantity || 0) === expected3.CleatEW ? '✅' : '❌'}`);
console.log(`CleatA:  ${cleatA3?.quantity || 0} (expected: ${expected3.CleatA}) ${cleatA3?.quantity === expected3.CleatA ? '✅' : '❌'}`);
console.log(`CleatAL: ${cleatAL3?.quantity || 0} (expected: ${expected3.CleatAL}) ${cleatAL3?.quantity === expected3.CleatAL ? '✅' : '❌'}`);
console.log(`CC1:     ${cc1_3?.quantity || 0} (expected: ${expected3.CC1}) ${cc1_3?.quantity === expected3.CC1 ? '✅' : '❌'}`);
console.log(`CC2:     ${cc2_3?.quantity || 0} (expected: ${expected3.CC2}) ${cc2_3?.quantity === expected3.CC2 ? '✅' : '❌'}`);

// ============================================
// TEST 4: 6×4×3+1SP Type 1 (With Partition)
// ============================================
console.log('\n📦 Test 4: 6×4×3+1SP Type 1 (With Partition)');

const test4 = calculateCleats({
  length: 6, width: 4, height: 3,
  panelType: 'm', material: 'HDG', tankType: 1, partitionCount: 1
});

const expected4 = { CleatE: 46, CleatEW: 0, CleatA: 9, CleatAL: 8, CC1: 22, CC2: 24, CCP: 7 };
const edge4 = test4.find(c => c.sku.includes('CleatE-'));
const edgeW4 = test4.find(c => c.sku.includes('CleatEW-'));
const cleatA4 = test4.find(c => c.sku.includes('CleatA-'));
const cleatAL4 = test4.find(c => c.sku.includes('CleatAL-'));
const cc1_4 = test4.find(c => c.sku === 'CL200I001');
const cc2_4 = test4.find(c => c.sku.includes('CleatCC2-'));
const ccp4 = test4.find(c => c.sku.includes('CleatCCP-'));

console.log(`CleatE:  ${edge4?.quantity || 0} (expected: ${expected4.CleatE}) ${edge4?.quantity === expected4.CleatE ? '✅' : '❌'}`);
console.log(`CleatEW: ${edgeW4?.quantity || 0} (expected: ${expected4.CleatEW}) ${(edgeW4?.quantity || 0) === expected4.CleatEW ? '✅' : '❌'}`);
console.log(`CleatA:  ${cleatA4?.quantity || 0} (expected: ${expected4.CleatA}) ${cleatA4?.quantity === expected4.CleatA ? '✅' : '❌'}`);
console.log(`CleatAL: ${cleatAL4?.quantity || 0} (expected: ${expected4.CleatAL}) ${cleatAL4?.quantity === expected4.CleatAL ? '✅' : '❌'}`);
console.log(`CC1:     ${cc1_4?.quantity || 0} (expected: ${expected4.CC1}) ${cc1_4?.quantity === expected4.CC1 ? '✅' : '❌'}`);
console.log(`CC2:     ${cc2_4?.quantity || 0} (expected: ${expected4.CC2}) ${cc2_4?.quantity === expected4.CC2 ? '✅' : '❌'}`);
console.log(`CCP:     ${ccp4?.quantity || 0} (expected: ${expected4.CCP}) ${ccp4?.quantity === expected4.CCP ? '✅' : '❌'}`);

// ============================================
// TEST 5: 6×4×4+1SP Type 2 (With Partition)
// ============================================
console.log('\n📦 Test 5: 6×4×4+1SP Type 2 (With Partition)');

const test5 = calculateCleats({
  length: 6, width: 4, height: 4,
  panelType: 'm', material: 'HDG', tankType: 2, partitionCount: 1
});

const expected5 = { CleatA: 9, CleatAL: 8, CC: 18 };
const cleatA5 = test5.find(c => c.sku.includes('CleatA-'));
const cleatAL5 = test5.find(c => c.sku.includes('CleatAL-'));
const cc5 = test5.find(c => c.sku.includes('CC-18-'));

console.log(`CleatA:  ${cleatA5?.quantity || 0} (expected: ${expected5.CleatA}) ${cleatA5?.quantity === expected5.CleatA ? '✅' : '❌'}`);
console.log(`CleatAL: ${cleatAL5?.quantity || 0} (expected: ${expected5.CleatAL}) ${cleatAL5?.quantity === expected5.CleatAL ? '✅' : '❌'}`);
console.log(`CC:      ${cc5?.quantity || 0} (expected: ${expected5.CC}) ${cc5?.quantity === expected5.CC ? '✅' : '❌'}`);

// ============================================
// SUMMARY
// ============================================
console.log('\n' + '='.repeat(50));
console.log('🏁 TESTS COMPLETE');
console.log('='.repeat(50));
