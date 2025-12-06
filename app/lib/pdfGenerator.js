// app/lib/pdfGenerator.js
// Generate professional PDF quotes for Sunnik Tank BOM
// Version: 1.2.1
// Updated: Added Effective Volume display in PDF output

export async function generatePDF(bom, inputs) {
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
  doc.text('QUOTATION', pageWidth - margin, yPosition + 2, { align: 'right' });

  // Quote number and date
  const quoteNumber = `SQ-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
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
  doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, 32, 2, 2, 'F');

  // Specs content
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);

  const volume = inputs.length * inputs.width * inputs.height;
  const volumeLiters = volume * 1000;
  const effectiveVolume = inputs.length * inputs.width * (inputs.height - (inputs.freeboard || 0.2));
  const effectiveVolumeLiters = effectiveVolume * 1000;

  // Freeboard default is 200mm (0.2m) if not specified
  const freeboard = inputs.freeboard || 0.2;
  const freeboardMM = Math.round(freeboard * 1000);

  const specs = [
    { label: 'Dimensions:', value: `${inputs.length}m × ${inputs.width}m × ${inputs.height}m` },
    { label: 'Nominal Volume:', value: `${volumeLiters.toLocaleString()} L (${volume.toFixed(2)} m³)` },
    { label: 'Effective Volume:', value: `${effectiveVolumeLiters.toLocaleString()} L (${freeboardMM}mm freeboard)` },
    { label: 'Material:', value: getMaterialName(inputs.material) },
    { label: 'Build Standard:', value: getBuildStandardName(inputs.buildStandard) },
    { label: 'Panel Type:', value: `${inputs.panelType === 'm' ? 'Metric (1m)' : 'Imperial (4ft)'} Type ${inputs.panelTypeDetail || 1}` },
    { label: 'Partitions:', value: inputs.partitionCount > 0 ? `${inputs.partitionCount}` : 'None' }
  ];

  let specY = yPosition + 5;
  specs.forEach((spec, index) => {
    const column = index % 3;
    const row = Math.floor(index / 3);
    const colWidth = (pageWidth - 2 * margin - 10) / 3;
    const x = margin + 5 + (column * colWidth);
    const y = specY + (row * 10);

    doc.setFont('helvetica', 'bold');
    doc.text(spec.label, x, y);
    doc.setFont('helvetica', 'normal');
    const labelWidth = doc.getTextWidth(spec.label);
    doc.text(spec.value, x + labelWidth + 2, y);
  });

  yPosition += 48;

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
  doc.text(`${bom.summary.totalPanels} panels | ${inputs.buildStandard || 'BSI'} standard`, margin + 8, totalBoxY + 15);

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

  const fileName = `Sunnik_Quote_${quoteNumber}_${inputs.material}_${inputs.length}x${inputs.width}x${inputs.height}m.pdf`;
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
