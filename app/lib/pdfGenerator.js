// app/lib/pdfGenerator.js
// Generate professional PDF quotes for Sunnik Tank BOM
// Version: 1.3.0
// Updated: Fixed dimension display to show actual meters (BUG-009 fix)

export async function generatePDF(bom, inputs, serialNumber) {
  // Dynamic imports for client-side only
  const { jsPDF } = await import('jspdf');
  const autoTable = (await import('jspdf-autotable')).default;

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
  const sectionColors = {
    base: [66, 133, 244],      // Blue
    walls: [52, 168, 83],      // Green
    partition: [251, 188, 5],  // Yellow
    roof: [234, 67, 53],       // Red
    roofSupport: [236, 64, 122], // Pink
    stays: [142, 36, 170],     // Purple
    cleats: [63, 81, 181],     // Indigo
    tieRods: [0, 150, 136],    // Teal
    stayPlates: [255, 152, 0], // Amber
    hardware: [96, 125, 139],  // Slate
    supports: [103, 58, 183],  // Purple
    accessories: [0, 172, 193], // Cyan
    pipeFittings: [255, 112, 67] // Orange
  };

  // === HEADER SECTION ===

  // Company name (fallback - logo can be added later)
  doc.setFontSize(22);
  doc.setTextColor(sunnikBlue[0], sunnikBlue[1], sunnikBlue[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('SUNNIK', margin, yPosition + 5);

  // Company tagline
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'normal');
  doc.text('Water Tank Solutions', margin, yPosition + 11);

  // Quote title on right
  doc.setFontSize(14);
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('BILL OF MATERIALS', pageWidth - margin, yPosition + 2, { align: 'right' });

  // Quote number and date
  const quoteNumber = serialNumber || `SQ-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'normal');
  doc.text(`Quote #: ${quoteNumber}`, pageWidth - margin, yPosition + 8, { align: 'right' });
  doc.text(`Date: ${new Date().toLocaleDateString('en-MY', { day: '2-digit', month: '2-digit', year: 'numeric' })}`, pageWidth - margin, yPosition + 13, { align: 'right' });

  yPosition += 20;

  // Divider line
  doc.setDrawColor(sunnikBlue[0], sunnikBlue[1], sunnikBlue[2]);
  doc.setLineWidth(0.5);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);

  yPosition += 10;

  // === TANK SPECIFICATION SECTION ===

  doc.setFontSize(11);
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('TANK SPECIFICATION', margin, yPosition);

  yPosition += 6;

  // Specification box
  doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, 74, 2, 2, 'F');

  // Specs content
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);

  // Calculate actual dimensions based on dimension mode and panel type
  const panelSize = inputs.panelType === 'm' ? 1.0 : 1.22;
  const dimensionMode = inputs.dimensionMode || 'panel'; // Default to panel mode for backwards compatibility

  // Calculate actual dimensions in meters
  const actualLength = dimensionMode === 'panel' ? inputs.length * panelSize : inputs.length;
  const actualWidth = dimensionMode === 'panel' ? inputs.width * panelSize : inputs.width;
  const actualHeight = dimensionMode === 'panel' ? inputs.height * panelSize : inputs.height;

  const volume = actualLength * actualWidth * actualHeight;
  const volumeLiters = volume * 1000;
  const effectiveVolume = actualLength * actualWidth * (actualHeight - (inputs.freeboard || 0.2));
  const effectiveVolumeLiters = effectiveVolume * 1000;

  // Freeboard default is 200mm (0.2m) if not specified
  const freeboard = inputs.freeboard || 0.2;
  const freeboardMM = Math.round(freeboard * 1000);

  // Format dimensions string based on panel type
  let dimensionsStr = `${actualLength.toFixed(2)}m × ${actualWidth.toFixed(2)}m × ${actualHeight.toFixed(2)}m`;
  if (inputs.panelType === 'i') {
    // For Imperial panels, also show feet
    const lengthFt = Math.round(actualLength / 0.3048);
    const widthFt = Math.round(actualWidth / 0.3048);
    const heightFt = Math.round(actualHeight / 0.3048);
    dimensionsStr += ` (${lengthFt}'×${widthFt}'×${heightFt}')`;
  }

  // Panel count info for display
  const panelCountStr = dimensionMode === 'panel'
    ? `${inputs.length}×${inputs.width}×${inputs.height} panels`
    : `~${Math.ceil(actualLength/panelSize)}×${Math.ceil(actualWidth/panelSize)}×${Math.ceil(actualHeight/panelSize)} panels`;

  // Determine support type display
  const getSupportTypeDisplay = () => {
    const hasInternal = inputs.internalSupport === true;
    const hasExternal = inputs.externalSupport === true;
    if (hasInternal && hasExternal) return 'Internal + External';
    if (hasInternal) return 'Internal (Stay System)';
    if (hasExternal) return 'External (I-Beam Frame)';
    return 'None';
  };

  const specs = [
    { label: 'Dimensions:', value: dimensionsStr },
    { label: 'Nominal Volume:', value: `${volumeLiters.toLocaleString()} L (${volume.toFixed(2)} m³)` },
    { label: 'Effective Volume:', value: `${effectiveVolumeLiters.toLocaleString()} L (${freeboardMM}mm freeboard)` },
    { label: 'Material:', value: getMaterialName(inputs.material) },
    ...(inputs.material !== 'SS316' && inputs.material !== 'SS304'
      ? [{ label: 'Build Standard:', value: getBuildStandardName(inputs.buildStandard) }]
      : []),
    { label: 'Panel Type:', value: `${inputs.panelType === 'm' ? 'Metric (1m)' : 'Imperial (4ft)'} Type ${inputs.panelTypeDetail || 1}` },
    { label: 'Partitions:', value: inputs.partitionCount > 0 ? `${inputs.partitionCount}` : 'None' },
    { label: 'Support:', value: getSupportTypeDisplay() }
  ];

  let specY = yPosition + 7;
  specs.forEach((spec, index) => {
    const y = specY + (index * 8);
    doc.setFont('helvetica', 'bold');
    doc.text(spec.label, margin + 6, y);
    doc.setFont('helvetica', 'normal');
    doc.text(spec.value, margin + 55, y);
  });

  yPosition += 82;

  // === BILL OF MATERIALS SECTION ===

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.text('BILL OF MATERIALS', margin, yPosition);

  yPosition += 4;

  // Prepare table data
  const tableData = [];

  // Helper function to add section
  const addSection = (title, items, color) => {
    if (!items || items.length === 0) return;

    // Section header
    tableData.push([
      { content: title, colSpan: 4, styles: { fillColor: color, textColor: 255, fontStyle: 'bold', fontSize: 9 } }
    ]);

    // Items
    items.forEach(item => {
      const unitPrice = item.unitPrice || 0;
      const subtotal = item.quantity * unitPrice;
      tableData.push([
        { content: `${item.sku || 'N/A'}\n${item.description || ''}`, styles: { fontSize: 8 } },
        { content: `${item.quantity}`, styles: { halign: 'center', fontSize: 8 } },
        { content: `RM ${unitPrice.toFixed(2)}`, styles: { halign: 'right', fontSize: 8 } },
        { content: `RM ${subtotal.toFixed(2)}`, styles: { halign: 'right', fontStyle: 'bold', fontSize: 8 } }
      ]);
    });

    // Section subtotal
    const sectionTotal = items.reduce((sum, item) => sum + (item.quantity * (item.unitPrice || 0)), 0);
    tableData.push([
      { content: `${title} Subtotal`, colSpan: 3, styles: { halign: 'right', fontStyle: 'bold', fillColor: [250, 250, 250], fontSize: 8 } },
      { content: `RM ${sectionTotal.toFixed(2)}`, styles: { halign: 'right', fontStyle: 'bold', fillColor: [250, 250, 250], fontSize: 8 } }
    ]);
  };

  // Add all BOM sections
  addSection('BASE / FLOOR PANELS', bom.base, sectionColors.base);
  addSection('WALL PANELS', bom.walls, sectionColors.walls);
  if (bom.partition && bom.partition.length > 0) {
    addSection('PARTITION PANELS', bom.partition, sectionColors.partition);
  }
  addSection('ROOF PANELS', bom.roof, sectionColors.roof);

  // Roof Support section
  if (bom.roofSupport && bom.roofSupport.length > 0) {
    addSection('ROOF SUPPORT', bom.roofSupport, sectionColors.roofSupport);
  }

  // Steel Stay System (Phase 2)
  if (bom.stays && bom.stays.length > 0) {
    addSection('STAY SYSTEM', bom.stays, sectionColors.stays);
  }
  if (bom.cleats && bom.cleats.length > 0) {
    addSection('CLEATS & CONNECTIONS', bom.cleats, sectionColors.cleats);
  }

  // FRP Internal Support (Phase 3)
  if (bom.tieRods && bom.tieRods.length > 0) {
    addSection('TIE RODS', bom.tieRods, sectionColors.tieRods);
  }
  if (bom.stayPlates && bom.stayPlates.length > 0) {
    addSection('STAY PLATES', bom.stayPlates, sectionColors.stayPlates);
  }
  if (bom.hardware && bom.hardware.length > 0) {
    addSection('TIE ROD HARDWARE', bom.hardware, sectionColors.hardware);
  }

  // External Support structures
  if (bom.supports && bom.supports.length > 0) {
    addSection('SUPPORT STRUCTURES', bom.supports, sectionColors.supports);
  }
  if (bom.accessories && bom.accessories.length > 0) {
    addSection('ACCESSORIES', bom.accessories, sectionColors.accessories);
  }

  // Add Pipe Fittings section if exists
  if (inputs.pipeFittings && inputs.pipeFittings.length > 0) {
    const pipeFittingItems = inputs.pipeFittings.map(pf => ({
      sku: `${pf.size}${pf.outsideItem === 'D/F Nozzle' ? 'DF' : pf.outsideItem === 'S/F Nozzle' ? 'SF' : 'FL'}-${pf.flangeType.replace(' ', '')}-${pf.outsideMaterial}`,
      description: `${pf.opening} - ${pf.size}mm ${pf.flangeType} | Outside: ${pf.outsideMaterial} ${pf.outsideItem} | Inside: ${pf.insideMaterial} ${pf.insideItem}`,
      quantity: pf.quantity,
      unitPrice: 0 // Price lookup would be done in BOM calculator
    }));
    addSection('PIPE FITTINGS', pipeFittingItems, sectionColors.pipeFittings);
  }

  // Generate table
  autoTable(doc, {
    startY: yPosition,
    head: [[
      { content: 'Item / Description', styles: { fillColor: darkGray, textColor: 255, fontSize: 8 } },
      { content: 'Qty', styles: { fillColor: darkGray, textColor: 255, halign: 'center', fontSize: 8 } },
      { content: 'Unit Price', styles: { fillColor: darkGray, textColor: 255, halign: 'right', fontSize: 8 } },
      { content: 'Subtotal', styles: { fillColor: darkGray, textColor: 255, halign: 'right', fontSize: 8 } }
    ]],
    body: tableData,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 2,
      lineColor: [220, 220, 220],
      lineWidth: 0.1,
      overflow: 'linebreak'
    },
    headStyles: {
      fillColor: darkGray,
      textColor: 255,
      fontStyle: 'bold',
      halign: 'left'
    },
    columnStyles: {
      0: { cellWidth: 90 },
      1: { cellWidth: 20 },
      2: { cellWidth: 30 },
      3: { cellWidth: 30 }
    },
    margin: { left: margin, right: margin },
    didDrawPage: function(data) {
      // Add page numbers
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Page ${doc.internal.getCurrentPageInfo().pageNumber}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
    }
  });

  // Get final Y position after table
  yPosition = doc.lastAutoTable.finalY + 8;

  // Check if we need a new page for totals
  if (yPosition > pageHeight - 70) {
    doc.addPage();
    yPosition = margin;
  }

  // === GRAND TOTAL ===

  const totalBoxHeight = 22;
  const totalBoxY = yPosition;

  doc.setFillColor(sunnikBlue[0], sunnikBlue[1], sunnikBlue[2]);
  doc.roundedRect(margin, totalBoxY, pageWidth - 2 * margin, totalBoxHeight, 2, 2, 'F');

  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'normal');
  doc.text('GRAND TOTAL', margin + 8, totalBoxY + 9);

  doc.setFontSize(8);
  const totalSubtext = inputs.material === 'SS316' || inputs.material === 'SS304'
    ? `${bom.summary.totalPanels} panels`
    : `${bom.summary.totalPanels} panels | ${inputs.buildStandard || 'BSI'} standard`;
  doc.text(totalSubtext, margin + 8, totalBoxY + 15);

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  const totalText = `RM ${bom.summary.totalCost.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  doc.text(totalText, pageWidth - margin - 8, totalBoxY + 13, { align: 'right' });

  yPosition += totalBoxHeight + 10;

  // === NOTES & TERMS ===

  if (yPosition > pageHeight - 55) {
    doc.addPage();
    yPosition = margin;
  }

  // Two column layout for notes and terms
  const colWidth = (pageWidth - 2 * margin - 10) / 2;

  // Notes column
  doc.setFontSize(9);
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('NOTES:', margin, yPosition);

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);

  const notes = [
    '• Panel materials as specified',
    '• Prices subject to market rates',
    '• Delivery charges not included',
    '• Valid for 30 days from issue'
  ];

  let noteY = yPosition + 5;
  notes.forEach(note => {
    doc.text(note, margin, noteY);
    noteY += 4;
  });

  // Terms column
  doc.setFontSize(9);
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('TERMS:', margin + colWidth + 10, yPosition);

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);

  const terms = [
    '• 50% deposit on confirmation',
    '• Balance before delivery',
    '• Lead time: 4-6 weeks',
    '• Warranty: 12 months'
  ];

  let termY = yPosition + 5;
  terms.forEach(term => {
    doc.text(term, margin + colWidth + 10, termY);
    termY += 4;
  });

  // === FOOTER ===

  const footerY = pageHeight - 12;

  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.1);
  doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);

  doc.setFontSize(7);
  doc.setTextColor(120, 120, 120);
  doc.setFont('helvetica', 'normal');
  doc.text('Sunnik Water Tank Solutions | www.sunnik.net | sales@sunnik.net', pageWidth / 2, footerY, { align: 'center' });

  // === SAVE PDF ===

  // Use actual dimensions for filename (calculated at top of function)
  const fileName = `Sunnik_BOM_${quoteNumber}_${inputs.material}_${actualLength.toFixed(1)}x${actualWidth.toFixed(1)}x${actualHeight.toFixed(1)}m.pdf`;
  doc.save(fileName);

  return fileName;
}

/**
 * Get material full name
 */
function getMaterialName(code) {
  const names = {
    'SS316': 'Stainless Steel 316',
    'SS304': 'Stainless Steel 304',
    'HDG': 'Hot Dip Galvanized Steel',
    'MS': 'Mild Steel (Painted)',
    'FRP': 'Fiberglass Reinforced Plastic'
  };
  return names[code] || code;
}

/**
 * Get build standard full name
 */
function getBuildStandardName(code) {
  const names = {
    'BSI': 'BSI (British)',
    'LPCB': 'LPCB (Fire Protection)',
    'SANS': 'SANS 10329:2020',
    'MS1390': 'MS1390:2010 (SPAN)',
    'SS245': 'SS245:2014 (Singapore)'
  };
  return names[code] || code || 'BSI';
}

/**
 * Generate customer-friendly PDF for sales users
 * Includes panel summary, accessories, pipe fittings - NO SKU codes or itemized prices
 * Version: 3.0.0 - Added serial number, customer info
 */
export async function generateSalesPDF(bom, inputs, markupPercentage, finalPrice, serialNumber, customerCompany, tankLocation, commissionAmount = 0, customItems = [], subtotalAfterMarkup = null) {
  const { jsPDF } = await import('jspdf');
  const autoTable = (await import('jspdf-autotable')).default;

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
  const quoteNumber = serialNumber || `SQ-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

  // === HELPER FUNCTIONS ===

  // Get support type description
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

  // Ladder material names
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

  // Quote title on right
  doc.setFontSize(14);
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('QUOTATION', pageWidth - margin, yPosition + 2, { align: 'right' });

  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'normal');
  doc.text(`Quote #: ${quoteNumber}`, pageWidth - margin, yPosition + 8, { align: 'right' });
  doc.text(`Date: ${new Date().toLocaleDateString('en-MY', { day: '2-digit', month: '2-digit', year: 'numeric' })}`, pageWidth - margin, yPosition + 13, { align: 'right' });

  yPosition += 20;

  // Divider line
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

  // Calculate actual dimensions
  const panelSize = inputs.panelType === 'm' ? 1.0 : 1.22;
  const dimensionMode = inputs.dimensionMode || 'panel';

  const actualLength = dimensionMode === 'panel' ? inputs.length * panelSize : inputs.length;
  const actualWidth = dimensionMode === 'panel' ? inputs.width * panelSize : inputs.width;
  const actualHeight = dimensionMode === 'panel' ? inputs.height * panelSize : inputs.height;

  const volume = actualLength * actualWidth * actualHeight;
  const volumeLiters = volume * 1000;
  const effectiveVolume = actualLength * actualWidth * (actualHeight - (inputs.freeboard || 0.2));
  const effectiveVolumeLiters = effectiveVolume * 1000;

  // Specification box
  doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, 68, 2, 2, 'F');

  const specs = [
    { label: 'Dimensions:', value: `${actualLength.toFixed(2)}m × ${actualWidth.toFixed(2)}m × ${actualHeight.toFixed(2)}m` },
    { label: 'Nominal Volume:', value: `${volumeLiters.toLocaleString()} Liters` },
    { label: 'Effective Capacity:', value: `${effectiveVolumeLiters.toLocaleString()} Liters` },
    { label: 'Material:', value: getMaterialName(inputs.material) },
    ...(inputs.material !== 'SS316' && inputs.material !== 'SS304'
      ? [{ label: 'Build Standard:', value: getBuildStandardName(inputs.buildStandard) }]
      : []),
    { label: 'Support Type:', value: getSupportDescription() },
    { label: 'Partitions:', value: inputs.partitionCount > 0 ? `${inputs.partitionCount} compartment${inputs.partitionCount > 1 ? 's' : ''}` : 'None' }
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

  // Calculate panel counts from BOM
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

  // Build accessories list from inputs
  const accessoriesData = [];

  if (inputs.wliMaterial) {
    accessoriesData.push([`Water Level Indicator - ${inputs.wliMaterial}`, '1']);
  }

  if (inputs.internalLadderQty > 0) {
    const material = getLadderMaterialName(inputs.internalLadderMaterial);
    accessoriesData.push([`Internal Ladder (${material})`, inputs.internalLadderQty.toString()]);
  }

  if (inputs.externalLadderQty > 0) {
    const material = getLadderMaterialName(inputs.externalLadderMaterial);
    const withCage = inputs.safetyCage ? ' with Safety Cage' : '';
    accessoriesData.push([`External Ladder (${material})${withCage}`, inputs.externalLadderQty.toString()]);
  }

  // Manhole covers from BOM
  const manholeItems = bom.accessories?.filter(item =>
    item.description?.toLowerCase().includes('manhole') || item.sku?.toLowerCase().includes('mh')
  ) || [];
  if (manholeItems.length > 0) {
    const totalManholes = manholeItems.reduce((sum, item) => sum + item.quantity, 0);
    accessoriesData.push(['Manhole Cover', totalManholes.toString()]);
  }

  // Always include sealant and BNW
  accessoriesData.push(['Sealant & Gaskets', 'Complete Set']);

  if (inputs.bnwMaterial) {
    const material = getLadderMaterialName(inputs.bnwMaterial);
    accessoriesData.push([`Bolts, Nuts & Washers (${material})`, 'Complete Set']);
  } else {
    accessoriesData.push(['Bolts, Nuts & Washers', 'Complete Set']);
  }

  // Roof support if applicable
  if (bom.roofSupport && bom.roofSupport.length > 0) {
    accessoriesData.push(['Roof Support Beams', 'Included']);
  }

  // Stay system or tie rods
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
      return [`${pf.size}mm ${flangeType} ${opening}`, pf.quantity?.toString() || '1'];
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
  // Customer-facing: only show additional items (if any) + final total
  // Internal details (markup %, commission) are NEVER shown on customer PDF

  const hasCustomItems = customItems && customItems.filter(i => i.description && i.price).length > 0;
  const spaceNeeded = hasCustomItems ? 120 : 90;

  // Check if we need a new page
  if (yPosition > pageHeight - spaceNeeded) {
    doc.addPage();
    yPosition = margin;
  }

  doc.setFontSize(11);
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('QUOTATION PRICE', margin, yPosition);

  yPosition += 6;

  // Show additional items as customer-visible line items (no internal breakdown)
  if (hasCustomItems) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);

    doc.text('Additional Items:', margin + 5, yPosition + 5);
    yPosition += 7;

    customItems.forEach(item => {
      if (item.description && item.price) {
        doc.text(`•  ${item.description}`, margin + 8, yPosition + 5);
        doc.text(
          `RM ${Number(item.price).toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
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
  const priceText = `RM ${finalPrice.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  doc.text(priceText, pageWidth - margin - 10, yPosition + 20, { align: 'right' });

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

  const terms = [
    'Quotation valid for 30 days from date of issue',
    'Payment: 50% deposit upon confirmation, balance before delivery',
    'Estimated lead time: 4-6 weeks from order confirmation',
    'Delivery charges calculated based on location',
    'Warranty: 12 months from date of delivery',
    'Installation services available upon request (quoted separately)'
  ];

  terms.forEach(term => {
    doc.text(`•  ${term}`, margin, yPosition);
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

  const fileName = `Sunnik_Quote_${quoteNumber}_${inputs.material}_${actualLength.toFixed(1)}x${actualWidth.toFixed(1)}x${actualHeight.toFixed(1)}m.pdf`;
  doc.save(fileName);

  return fileName;
}
