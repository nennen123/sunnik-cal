'use client';

// Sunnik Tank Quote PDF Generator
// Version: 1.3.0

export async function generatePDF(bom, inputs) {
  console.log('PDF Step 1: Starting');

  // Guard: only run in browser
  if (typeof window === 'undefined') {
    throw new Error('PDF generation must run in browser only');
  }

  console.log('PDF Step 2: Importing jsPDF');
  const jsPDFModule = await import('jspdf');
  const jsPDF = jsPDFModule.jsPDF || jsPDFModule.default;

  console.log('PDF Step 3: Importing autoTable');
  const autoTableModule = await import('jspdf-autotable');
  const autoTable = autoTableModule.default || autoTableModule;

  console.log('PDF Step 4: Creating doc');
  const doc = new jsPDF();

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let yPos = margin;

  const blue = [41, 98, 255];
  const dark = [51, 51, 51];
  const light = [242, 242, 242];

  const colors = {
    base: [66, 133, 244],
    walls: [52, 168, 83],
    partition: [251, 188, 5],
    roof: [234, 67, 53],
    roofSupport: [139, 195, 74],
    stays: [121, 85, 72],
    cleats: [158, 158, 158],
    tieRods: [0, 150, 136],
    hardware: [96, 125, 139],
    stayPlates: [171, 71, 188],
    supports: [103, 58, 183],
    accessories: [0, 172, 193],
    pipeFittings: [255, 112, 67]
  };

  // HEADER
  console.log('PDF Step 5: Header');
  doc.setFontSize(22);
  doc.setTextColor(blue[0], blue[1], blue[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('SUNNIK', margin, yPos + 5);

  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'normal');
  doc.text('Water Tank Solutions', margin, yPos + 11);

  var qNum = 'SQ-' + new Date().getFullYear() + '-' + String(Date.now()).slice(-6);
  doc.setFontSize(14);
  doc.setTextColor(dark[0], dark[1], dark[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('QUOTATION', pageWidth - margin, yPos + 2, { align: 'right' });

  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'normal');
  doc.text('Quote: ' + qNum, pageWidth - margin, yPos + 8, { align: 'right' });
  doc.text('Date: ' + new Date().toLocaleDateString('en-MY'), pageWidth - margin, yPos + 13, { align: 'right' });

  yPos += 20;
  doc.setDrawColor(blue[0], blue[1], blue[2]);
  doc.setLineWidth(0.5);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 10;

  // CUSTOMER
  console.log('PDF Step 6: Customer');
  if (inputs.customerName || inputs.tankLocation) {
    doc.setFontSize(9);
    doc.setTextColor(dark[0], dark[1], dark[2]);
    doc.setFont('helvetica', 'bold');
    doc.text('TO: ' + String(inputs.customerName || 'N/A'), margin, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text('Location: ' + String(inputs.tankLocation || 'N/A'), margin, yPos + 5);
    yPos += 12;
  }

  // SPEC BOX
  console.log('PDF Step 7: Spec box');
  doc.setFontSize(11);
  doc.setTextColor(dark[0], dark[1], dark[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('TANK SPECIFICATION', margin, yPos);
  yPos += 6;

  doc.setFillColor(light[0], light[1], light[2]);
  doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 30, 2, 2, 'F');

  var L = inputs.length || 0;
  var W = inputs.width || 0;
  var H = inputs.height || 0;
  var vol = L * W * H;
  var volL = vol * 1000;

  var specs = [
    ['Dimensions:', L + 'm x ' + W + 'm x ' + H + 'm'],
    ['Volume:', volL.toLocaleString() + ' L (' + vol.toFixed(2) + ' m3)'],
    ['Material:', getMat(inputs.material)],
    ['Standard:', getStd(inputs.buildStandard)],
    ['Panel:', (inputs.panelType === 'm' ? 'Metric 1m' : 'Imperial 4ft') + ' T' + (inputs.panelTypeDetail || 1)],
    ['Partitions:', inputs.partitionCount > 0 ? String(inputs.partitionCount) : 'None']
  ];

  var sY = yPos + 5;
  specs.forEach(function(s, i) {
    var col = i % 3;
    var row = Math.floor(i / 3);
    var cW = (pageWidth - 2 * margin - 10) / 3;
    var x = margin + 5 + col * cW;
    var y = sY + row * 10;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(s[0], x, y);
    doc.setFont('helvetica', 'normal');
    doc.text(String(s[1]), x + doc.getTextWidth(s[0]) + 2, y);
  });

  yPos += 36;

  // BOM TABLE
  console.log('PDF Step 8: Building table');
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(dark[0], dark[1], dark[2]);
  doc.text('BILL OF MATERIALS', margin, yPos);
  yPos += 4;

  var rows = [];

  function addSec(title, items, color) {
    if (!items || items.length === 0) return;
    rows.push([{ content: title, colSpan: 4, styles: { fillColor: color, textColor: 255, fontStyle: 'bold', fontSize: 9 } }]);
    items.forEach(function(item) {
      var up = item.unitPrice || 0;
      var sub = (item.quantity || 0) * up;
      rows.push([
        { content: String(item.sku || '') + '\n' + String(item.description || ''), styles: { fontSize: 8 } },
        { content: String(item.quantity || 0), styles: { halign: 'center', fontSize: 8 } },
        { content: 'RM ' + up.toFixed(2), styles: { halign: 'right', fontSize: 8 } },
        { content: 'RM ' + sub.toFixed(2), styles: { halign: 'right', fontStyle: 'bold', fontSize: 8 } }
      ]);
    });
    var tot = items.reduce(function(s, it) { return s + (it.quantity || 0) * (it.unitPrice || 0); }, 0);
    rows.push([
      { content: title + ' Subtotal', colSpan: 3, styles: { halign: 'right', fontStyle: 'bold', fillColor: [250, 250, 250], fontSize: 8 } },
      { content: 'RM ' + tot.toFixed(2), styles: { halign: 'right', fontStyle: 'bold', fillColor: [250, 250, 250], fontSize: 8 } }
    ]);
  }

  addSec('BASE / FLOOR PANELS', bom.base, colors.base);
  addSec('WALL PANELS', bom.walls, colors.walls);
  if (bom.partition && bom.partition.length > 0) addSec('PARTITION PANELS', bom.partition, colors.partition);
  addSec('ROOF PANELS', bom.roof, colors.roof);
  if (bom.roofSupport && bom.roofSupport.length > 0) addSec('ROOF SUPPORT', bom.roofSupport, colors.roofSupport);
  if (bom.stays && bom.stays.length > 0) addSec('STAY SYSTEM', bom.stays, colors.stays);
  if (bom.cleats && bom.cleats.length > 0) addSec('CLEATS & CONNECTIONS', bom.cleats, colors.cleats);
  if (bom.tieRods && bom.tieRods.length > 0) addSec('TIE RODS (FRP)', bom.tieRods, colors.tieRods);
  if (bom.hardware && bom.hardware.length > 0) addSec('TIE ROD HARDWARE', bom.hardware, colors.hardware);
  if (bom.stayPlates && bom.stayPlates.length > 0) addSec('STAY PLATES', bom.stayPlates, colors.stayPlates);
  if (bom.supports && bom.supports.length > 0) addSec('SUPPORT STRUCTURES', bom.supports, colors.supports);
  if (bom.accessories && bom.accessories.length > 0) addSec('ACCESSORIES', bom.accessories, colors.accessories);
  if (inputs.pipeFittings && inputs.pipeFittings.length > 0) {
    var pfItems = inputs.pipeFittings.map(function(pf) {
      return { sku: String(pf.size || '') + '-' + String(pf.outsideMaterial || ''), description: String(pf.opening || '') + ' ' + String(pf.size || '') + 'mm', quantity: pf.quantity || 1, unitPrice: 0 };
    });
    addSec('PIPE FITTINGS', pfItems, colors.pipeFittings);
  }

  console.log('PDF Step 9: autoTable rows=' + rows.length);
  autoTable(doc, {
    startY: yPos,
    head: [[
      { content: 'Item / Description', styles: { fillColor: dark, textColor: 255, fontSize: 8 } },
      { content: 'Qty', styles: { fillColor: dark, textColor: 255, halign: 'center', fontSize: 8 } },
      { content: 'Unit Price', styles: { fillColor: dark, textColor: 255, halign: 'right', fontSize: 8 } },
      { content: 'Subtotal', styles: { fillColor: dark, textColor: 255, halign: 'right', fontSize: 8 } }
    ]],
    body: rows,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2, lineColor: [220, 220, 220], lineWidth: 0.1, overflow: 'linebreak' },
    headStyles: { fillColor: dark, textColor: 255, fontStyle: 'bold', halign: 'left' },
    columnStyles: { 0: { cellWidth: 90 }, 1: { cellWidth: 20 }, 2: { cellWidth: 30 }, 3: { cellWidth: 30 } },
    margin: { left: margin, right: margin },
    didDrawPage: function() {
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text('Page ' + doc.internal.getCurrentPageInfo().pageNumber, pageWidth - margin, pageHeight - 10, { align: 'right' });
    }
  });

  console.log('PDF Step 10: autoTable done');
  yPos = doc.lastAutoTable.finalY + 8;

  if (yPos > pageHeight - 70) { doc.addPage(); yPos = margin; }

  // GRAND TOTAL
  console.log('PDF Step 11: Total');
  var tc = (bom.summary && bom.summary.totalCost) ? bom.summary.totalCost : 0;
  doc.setFillColor(blue[0], blue[1], blue[2]);
  doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 22, 2, 2, 'F');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'normal');
  doc.text('GRAND TOTAL', margin + 8, yPos + 9);
  doc.setFontSize(8);
  doc.text((bom.summary && bom.summary.totalPanels ? bom.summary.totalPanels : 0) + ' panels | ' + (inputs.buildStandard || 'BSI'), margin + 8, yPos + 15);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('RM ' + tc.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), pageWidth - margin - 8, yPos + 13, { align: 'right' });
  yPos += 32;

  // NOTES
  console.log('PDF Step 12: Notes');
  if (yPos > pageHeight - 55) { doc.addPage(); yPos = margin; }

  var half = (pageWidth - 2 * margin - 10) / 2;
  doc.setFontSize(9); doc.setTextColor(dark[0], dark[1], dark[2]); doc.setFont('helvetica', 'bold');
  doc.text('NOTES:', margin, yPos);
  doc.setFontSize(7); doc.setFont('helvetica', 'normal'); doc.setTextColor(80, 80, 80);
  ['- Panel materials as specified', '- Prices subject to market rates', '- Delivery charges not included', '- Valid for 30 days from issue'].forEach(function(n, i) {
    doc.text(n, margin, yPos + 5 + i * 4);
  });

  doc.setFontSize(9); doc.setTextColor(dark[0], dark[1], dark[2]); doc.setFont('helvetica', 'bold');
  doc.text('TERMS:', margin + half + 10, yPos);
  doc.setFontSize(7); doc.setFont('helvetica', 'normal'); doc.setTextColor(80, 80, 80);
  ['- 50% deposit on confirmation', '- Balance before delivery', '- Lead time: 4-6 weeks', '- Warranty: 12 months'].forEach(function(t, i) {
    doc.text(t, margin + half + 10, yPos + 5 + i * 4);
  });

  // FOOTER
  console.log('PDF Step 13: Footer');
  var fY = pageHeight - 12;
  doc.setDrawColor(200, 200, 200); doc.setLineWidth(0.1);
  doc.line(margin, fY - 5, pageWidth - margin, fY - 5);
  doc.setFontSize(7); doc.setTextColor(120, 120, 120); doc.setFont('helvetica', 'normal');
  doc.text('Sunnik Water Tank Solutions | www.sunnik.net | sales@sunnik.net', pageWidth / 2, fY, { align: 'center' });

  // SAVE
  console.log('PDF Step 14: Saving');
  var fname = 'Sunnik_Quote_' + qNum + '_' + (inputs.material || 'tank') + '.pdf';
  doc.save(fname);
  console.log('PDF Step 15: Complete - ' + fname);
  return fname;
}

function getMat(code) {
  return { 'SS316': 'Stainless Steel 316', 'SS304': 'Stainless Steel 304', 'HDG': 'Hot Dip Galvanized', 'MS': 'Mild Steel', 'FRP': 'Fiberglass (FRP)' }[code] || String(code || '');
}

function getStd(code) {
  return { 'BSI': 'BSI British', 'LPCB': 'LPCB Fire', 'SANS': 'SANS 10329', 'MS1390': 'MS1390 SPAN', 'SS245': 'SS245 Singapore' }[code] || String(code || 'BSI');
}


// ============================================================
// SALES PDF GENERATOR (customer-facing quotation)
// ============================================================

function getMaterialName(code) {
  return { 'SS316': 'Stainless Steel 316', 'SS304': 'Stainless Steel 304', 'HDG': 'Hot Dip Galvanized Steel', 'MS': 'Mild Steel (Painted)', 'FRP': 'Fiberglass Reinforced Plastic' }[code] || String(code || '');
}

function getBuildStandardName(code) {
  return { 'BSI': 'BSI (British)', 'LPCB': 'LPCB (Fire Protection)', 'SANS': 'SANS 10329:2020', 'MS1390': 'MS1390:2010 (SPAN)', 'SS245': 'SS245:2014 (Singapore)' }[code] || String(code || 'BSI');
}

export async function generateSalesPDF(bom, inputs, markupPercentage, finalPrice, serialNumber, customerCompany, tankLocation, commissionAmount = 0, customItems = [], subtotalAfterMarkup = null, currencySymbol = 'RM', usdRate = null) {
  // Guard: only run in browser
  if (typeof window === 'undefined') {
    throw new Error('PDF generation must run in browser only');
  }

  const jsPDFModule = await import('jspdf');
  const jsPDF = jsPDFModule.jsPDF || jsPDFModule.default;
  const autoTableModule = await import('jspdf-autotable');
  const autoTable = autoTableModule.default || autoTableModule;

  // Currency conversion helper
  const isUSD = currencySymbol === 'USD' && usdRate && parseFloat(usdRate) > 0;
  const convertPrice = (rm) => isUSD ? rm / parseFloat(usdRate) : rm;
  const formatCurrency = (amount) => currencySymbol + ' ' + convertPrice(amount).toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const doc = new jsPDF();

  // Page dimensions
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let yPosition = margin;

  // Colors
  const sunnikBlue = [41, 98, 255];
  const darkGray = [51, 51, 51];
  const lightGray = [242, 242, 242];
  const greenColor = [34, 197, 94];

  // Use provided serial number or generate fallback
  const quoteNumber = serialNumber || 'SQ-' + new Date().getFullYear() + '-' + String(Date.now()).slice(-6);

  // === HELPER FUNCTIONS ===

  const getSupportDescription = () => {
    if (inputs.material === 'FRP') {
      return 'Internal Tie Rod System (SS304)';
    }
    const hasInternal = inputs.internalSupport === true;
    const hasExternal = inputs.externalSupport === true;
    if (hasInternal && hasExternal) return 'Internal Stay + External Bracing';
    if (hasInternal) return 'Internal Stay System';
    if (hasExternal) return 'External I-Beam Bracing';
    return 'Standard Assembly';
  };

  const getLadderMaterialName = (code) => {
    const names = { 'HDG': 'Hot Dip Galvanized', 'SS304': 'Stainless Steel 304', 'SS316': 'Stainless Steel 316' };
    return names[code] || code;
  };

  // === HEADER SECTION ===

  doc.setFontSize(22);
  doc.setTextColor(sunnikBlue[0], sunnikBlue[1], sunnikBlue[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('SUNNIK', margin, yPosition + 5);

  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'normal');
  doc.text('Water Tank Solutions', margin, yPosition + 11);

  doc.setFontSize(14);
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('QUOTATION', pageWidth - margin, yPosition + 2, { align: 'right' });

  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'normal');
  doc.text('Quote #: ' + quoteNumber, pageWidth - margin, yPosition + 8, { align: 'right' });
  doc.text('Date: ' + new Date().toLocaleDateString('en-MY', { day: '2-digit', month: '2-digit', year: 'numeric' }), pageWidth - margin, yPosition + 13, { align: 'right' });

  yPosition += 20;

  doc.setDrawColor(sunnikBlue[0], sunnikBlue[1], sunnikBlue[2]);
  doc.setLineWidth(0.5);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);

  yPosition += 10;

  // === CUSTOMER INFORMATION SECTION ===

  if (customerCompany || tankLocation) {
    doc.setFontSize(11);
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.setFont('helvetica', 'bold');
    doc.text('CUSTOMER INFORMATION', margin, yPosition);

    yPosition += 6;

    doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, 20, 2, 2, 'F');

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(80, 80, 80);
    doc.text('Customer:', margin + 6, yPosition + 8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.text(customerCompany || 'N/A', margin + 30, yPosition + 8);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(80, 80, 80);
    doc.text('Location:', margin + 6, yPosition + 15);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.text(tankLocation || 'N/A', margin + 30, yPosition + 15);

    yPosition += 28;
  }

  // === TANK SPECIFICATION SECTION ===

  doc.setFontSize(11);
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('TANK SPECIFICATION', margin, yPosition);

  yPosition += 6;

  const panelSize = inputs.panelType === 'm' ? 1.0 : 1.22;
  const dimensionMode = inputs.dimensionMode || 'panel';

  const actualLength = dimensionMode === 'panel' ? inputs.length * panelSize : inputs.length;
  const actualWidth = dimensionMode === 'panel' ? inputs.width * panelSize : inputs.width;
  const actualHeight = dimensionMode === 'panel' ? inputs.height * panelSize : inputs.height;

  const volume = actualLength * actualWidth * actualHeight;
  const volumeLiters = volume * 1000;
  const effectiveVolume = actualLength * actualWidth * (actualHeight - (inputs.freeboard || 0.2));
  const effectiveVolumeLiters = effectiveVolume * 1000;

  doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, 68, 2, 2, 'F');

  const specs = [
    { label: 'Dimensions:', value: actualLength.toFixed(2) + 'm x ' + actualWidth.toFixed(2) + 'm x ' + actualHeight.toFixed(2) + 'm' },
    { label: 'Nominal Volume:', value: volumeLiters.toLocaleString() + ' Liters' },
    { label: 'Effective Capacity:', value: effectiveVolumeLiters.toLocaleString() + ' Liters' },
    { label: 'Material:', value: getMaterialName(inputs.material) },
    ...(inputs.material !== 'SS316' && inputs.material !== 'SS304'
      ? [{ label: 'Build Standard:', value: getBuildStandardName(inputs.buildStandard) }]
      : []),
    { label: 'Support Type:', value: getSupportDescription() },
    { label: 'Partitions:', value: inputs.partitionCount > 0 ? inputs.partitionCount + ' compartment' + (inputs.partitionCount > 1 ? 's' : '') : 'None' }
  ];

  doc.setFontSize(9);
  let specY = yPosition + 7;
  specs.forEach((spec, index) => {
    const y = specY + (index * 8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(80, 80, 80);
    doc.text(spec.label, margin + 6, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.text(spec.value, margin + 55, y);
  });

  yPosition += 76;

  // === PANEL SUMMARY TABLE ===

  doc.setFontSize(11);
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('PANEL SUMMARY', margin, yPosition);

  yPosition += 3;

  const basePanelCount = bom.base?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const wallPanelCount = bom.walls?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const roofPanelCount = bom.roof?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const partitionPanelCount = bom.partition?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const totalPanelCount = basePanelCount + wallPanelCount + roofPanelCount + partitionPanelCount;

  const panelData = [
    ['Base / Floor Panels', basePanelCount.toString()],
    ['Wall Panels', wallPanelCount.toString()],
    ['Roof Panels', roofPanelCount.toString()]
  ];

  if (partitionPanelCount > 0) {
    panelData.push(['Partition Panels', partitionPanelCount.toString()]);
  }

  panelData.push([{ content: 'TOTAL PANELS', styles: { fontStyle: 'bold' } }, { content: totalPanelCount.toString(), styles: { fontStyle: 'bold' } }]);

  autoTable(doc, {
    startY: yPosition,
    head: [[{ content: 'Description', styles: { fillColor: darkGray } }, { content: 'Quantity', styles: { fillColor: darkGray, halign: 'center' } }]],
    body: panelData,
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: darkGray, textColor: 255, fontStyle: 'bold' },
    columnStyles: { 0: { cellWidth: 120 }, 1: { cellWidth: 40, halign: 'center' } },
    margin: { left: margin, right: margin }
  });

  yPosition = doc.lastAutoTable.finalY + 8;

  // === INCLUDED ACCESSORIES TABLE ===

  doc.setFontSize(11);
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('INCLUDED ACCESSORIES', margin, yPosition);

  yPosition += 3;

  const accessoriesData = [];

  if (inputs.wliMaterial) {
    accessoriesData.push(['Water Level Indicator - ' + inputs.wliMaterial, '1']);
  }

  if (inputs.internalLadderQty > 0) {
    const material = getLadderMaterialName(inputs.internalLadderMaterial);
    accessoriesData.push(['Internal Ladder (' + material + ')', inputs.internalLadderQty.toString()]);
  }

  if (inputs.externalLadderQty > 0) {
    const material = getLadderMaterialName(inputs.externalLadderMaterial);
    const withCage = inputs.safetyCage ? ' with Safety Cage' : '';
    accessoriesData.push(['External Ladder (' + material + ')' + withCage, inputs.externalLadderQty.toString()]);
  }

  const manholeItems = bom.accessories?.filter(item =>
    item.description?.toLowerCase().includes('manhole') || item.sku?.toLowerCase().includes('mh')
  ) || [];
  if (manholeItems.length > 0) {
    const totalManholes = manholeItems.reduce((sum, item) => sum + item.quantity, 0);
    accessoriesData.push(['Manhole Cover', totalManholes.toString()]);
  }

  accessoriesData.push(['Sealant & Gaskets', 'Complete Set']);

  if (inputs.bnwMaterial) {
    const material = getLadderMaterialName(inputs.bnwMaterial);
    accessoriesData.push(['Bolts, Nuts & Washers (' + material + ')', 'Complete Set']);
  } else {
    accessoriesData.push(['Bolts, Nuts & Washers', 'Complete Set']);
  }

  if (bom.roofSupport && bom.roofSupport.length > 0) {
    accessoriesData.push(['Roof Support Beams', 'Included']);
  }

  if (bom.stays && bom.stays.length > 0) {
    accessoriesData.push(['Internal Stay System Components', 'Included']);
  }
  if (bom.tieRods && bom.tieRods.length > 0) {
    accessoriesData.push(['Tie Rod System (SS304)', 'Included']);
  }

  autoTable(doc, {
    startY: yPosition,
    head: [[{ content: 'Description', styles: { fillColor: [103, 58, 183] } }, { content: 'Quantity', styles: { fillColor: [103, 58, 183], halign: 'center' } }]],
    body: accessoriesData,
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [103, 58, 183], textColor: 255, fontStyle: 'bold' },
    columnStyles: { 0: { cellWidth: 120 }, 1: { cellWidth: 40, halign: 'center' } },
    margin: { left: margin, right: margin }
  });

  yPosition = doc.lastAutoTable.finalY + 8;

  // === PIPE FITTINGS TABLE (if any) ===

  if (inputs.pipeFittings && inputs.pipeFittings.length > 0) {
    doc.setFontSize(11);
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.setFont('helvetica', 'bold');
    doc.text('PIPE FITTINGS', margin, yPosition);

    yPosition += 3;

    const pipeFittingsData = inputs.pipeFittings.map(pf => {
      const flangeType = pf.flangeType || 'Flanged';
      const opening = pf.opening || 'Opening';
      return [pf.size + 'mm ' + flangeType + ' ' + opening, pf.quantity?.toString() || '1'];
    });

    autoTable(doc, {
      startY: yPosition,
      head: [[{ content: 'Description', styles: { fillColor: [255, 112, 67] } }, { content: 'Quantity', styles: { fillColor: [255, 112, 67], halign: 'center' } }]],
      body: pipeFittingsData,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [255, 112, 67], textColor: 255, fontStyle: 'bold' },
      columnStyles: { 0: { cellWidth: 120 }, 1: { cellWidth: 40, halign: 'center' } },
      margin: { left: margin, right: margin }
    });

    yPosition = doc.lastAutoTable.finalY + 8;
  }

  // === PRICING SECTION ===

  const hasCustomItems = customItems && customItems.filter(i => i.description && i.price).length > 0;
  const spaceNeeded = hasCustomItems ? 120 : 90;

  if (yPosition > pageHeight - spaceNeeded) {
    doc.addPage();
    yPosition = margin;
  }

  doc.setFontSize(11);
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('QUOTATION PRICE', margin, yPosition);

  yPosition += 6;

  if (hasCustomItems) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);

    doc.text('Additional Items:', margin + 5, yPosition + 5);
    yPosition += 7;

    customItems.forEach(item => {
      if (item.description && item.price) {
        doc.text('-  ' + item.description, margin + 8, yPosition + 5);
        doc.text(
          formatCurrency(Number(item.price)),
          pageWidth - margin - 5, yPosition + 5, { align: 'right' }
        );
        yPosition += 7;
      }
    });

    yPosition += 2;
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 4;
  }

  // Price box - green
  doc.setFillColor(greenColor[0], greenColor[1], greenColor[2]);
  doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, 32, 3, 3, 'F');

  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'normal');
  doc.text('Total Quoted Price', margin + 10, yPosition + 12);

  doc.setFontSize(8);
  doc.text('Complete tank system with all panels, hardware & accessories', margin + 10, yPosition + 20);

  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  const priceText = formatCurrency(finalPrice);
  doc.text(priceText, pageWidth - margin - 10, yPosition + 20, { align: 'right' });

  if (isUSD) {
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text('Exchange rate: 1 USD = ' + usdRate + ' MYR', pageWidth - margin - 10, yPosition + 27, { align: 'right' });
  }

  yPosition += 42;

  // === TERMS & CONDITIONS ===

  doc.setFontSize(10);
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('TERMS & CONDITIONS', margin, yPosition);

  yPosition += 6;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);

  const salesTerms = [
    'Quotation valid for 30 days from date of issue',
    'Payment: 50% deposit upon confirmation, balance before delivery',
    'Estimated lead time: 4-6 weeks from order confirmation',
    'Delivery charges calculated based on location',
    'Warranty: 12 months from date of delivery',
    'Installation services available upon request (quoted separately)'
  ];

  salesTerms.forEach(term => {
    doc.text('-  ' + term, margin, yPosition);
    yPosition += 5;
  });

  // === FOOTER ===

  const footerY = pageHeight - 20;

  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.1);
  doc.line(margin, footerY - 8, pageWidth - margin, footerY - 8);

  doc.setFontSize(9);
  doc.setTextColor(sunnikBlue[0], sunnikBlue[1], sunnikBlue[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('SUNNIK SDN BHD', pageWidth / 2, footerY - 2, { align: 'center' });

  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'normal');
  doc.text('www.sunnik.net | sales@sunnik.net', pageWidth / 2, footerY + 4, { align: 'center' });

  // === SAVE PDF ===

  const fileName = 'Sunnik_Quote_' + quoteNumber + '_' + inputs.material + '_' + actualLength.toFixed(1) + 'x' + actualWidth.toFixed(1) + 'x' + actualHeight.toFixed(1) + 'm.pdf';
  doc.save(fileName);

  return fileName;
}
