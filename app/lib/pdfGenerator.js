// app/lib/pdfGenerator.js
// Generate professional PDF quotes for Sunnik Tank BOM

export async function generatePDF(bom, inputs) {
  // Dynamic imports for client-side only
  const { jsPDF } = await import('jspdf');
  const autoTable = (await import('jspdf-autotable')).default;

  const doc = new jsPDF();

  // Page dimensions
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPosition = margin;

  // Colors
  const sunnikBlue = [41, 98, 255];
  const darkGray = [51, 51, 51];
  const lightGray = [242, 242, 242];

  // === HEADER SECTION ===

  // Add Logo with proper aspect ratio
  try {
    const loadImage = (src) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous'; // Handle CORS
        img.onload = () => {
          console.log(`Image loaded: ${img.width}×${img.height}px`);
          resolve(img);
        };
        img.onerror = (err) => {
          console.error('Image load error:', err);
          reject(err);
        };
        // Add timestamp to prevent caching
        img.src = src + '?v=' + Date.now();
      });
    };

    try {
      const logoImg = await loadImage('/sunnik-logo.png');

      // Force square dimensions for 500×500 logo
      const logoSize = 15;

      console.log(`Adding logo to PDF: ${logoSize}×${logoSize}`);

      // Add logo to PDF - explicitly set both width and height
      doc.addImage(
        logoImg,
        'PNG',
        margin,           // x position
        yPosition - 5,    // y position
        logoSize,         // width
        logoSize,         // height (same as width for square)
        undefined,        // alias
        'FAST'           // compression
      );

      console.log('✅ Logo added successfully');
    } catch (imgError) {
      console.error('Logo loading failed:', imgError);
      // Fallback to text
      doc.setFontSize(24);
      doc.setTextColor(sunnikBlue[0], sunnikBlue[1], sunnikBlue[2]);
      doc.setFont('helvetica', 'bold');
      doc.text('SUNNIK', margin, yPosition);
    }
  } catch (error) {
    console.error('Outer logo error:', error);
    // Fallback to text if anything fails
    doc.setFontSize(24);
    doc.setTextColor(sunnikBlue[0], sunnikBlue[1], sunnikBlue[2]);
    doc.setFont('helvetica', 'bold');
    doc.text('SUNNIK', margin, yPosition);
  }

  // Company tagline
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'bold');
  doc.text('Built to outperform', margin, yPosition + 15);

  // Quote title on right
  doc.setFontSize(16);
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('QUOTATION', pageWidth - margin, yPosition, { align: 'right' });

  // Quote number and date
  const quoteNumber = `SQ-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'normal');
  doc.text(`Quote #: ${quoteNumber}`, pageWidth - margin, yPosition + 7, { align: 'right' });
  doc.text(`Date: ${new Date().toLocaleDateString('en-MY', { day: '2-digit', month: '2-digit', year: 'numeric' })}`, pageWidth - margin, yPosition + 12, { align: 'right' });

  yPosition += 25;

  // Divider line
  doc.setDrawColor(sunnikBlue[0], sunnikBlue[1], sunnikBlue[2]);
  doc.setLineWidth(0.5);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);

  yPosition += 15;

  // === TANK SPECIFICATION SECTION ===

  doc.setFontSize(12);
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('TANK SPECIFICATION', margin, yPosition);

  yPosition += 8;

  // Specification box
  doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, 35, 3, 3, 'F');

  // Specs content
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);

  // Calculate volumes
  const nominalVolume = inputs.length * inputs.width * inputs.height;
  const nominalLiters = nominalVolume * 1000;

  const effectiveHeight = inputs.height - (inputs.freeboard || 0.2);
  const effectiveVolume = inputs.length * inputs.width * effectiveHeight;
  const effectiveLiters = effectiveVolume * 1000;

  const specs = [
    { label: 'Dimensions:', value: `${inputs.length}m × ${inputs.width}m × ${inputs.height}m` },
    { label: 'Nominal Capacity:', value: `${nominalLiters.toLocaleString()} L (${nominalVolume.toFixed(2)} m³)` },
    { label: 'Effective Capacity:', value: `${effectiveLiters.toLocaleString()} L (${effectiveVolume.toFixed(2)} m³)` },
    { label: 'Material:', value: getMaterialName(inputs.material) },
    { label: 'Panel Type:', value: `${inputs.panelType === 'm' ? 'Metric (1m × 1m)' : 'Imperial (4ft × 4ft)'} - Type ${inputs.panelTypeDetail}` },
    { label: 'Partitions:', value: inputs.partitionCount > 0 ? `${inputs.partitionCount}` : 'None' }
  ];

  let specY = yPosition + 6;
  specs.forEach((spec, index) => {
    const column = index % 2;
    const row = Math.floor(index / 2);
    const x = margin + 10 + (column * (pageWidth - 2 * margin) / 2);
    const y = specY + (row * 8);

    doc.setFont('helvetica', 'bold');
    doc.text(spec.label, x, y);
    doc.setFont('helvetica', 'normal');
    doc.text(spec.value, x + 35, y);
  });

  yPosition += 45;

  // === BILL OF MATERIALS SECTION ===

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.text('BILL OF MATERIALS', margin, yPosition);

  yPosition += 5;

  // Prepare table data
  const tableData = [];

  // Helper function to add section
  const addSection = (title, items) => {
    if (items.length === 0) return;

    // Section header
    tableData.push([
      { content: title, colSpan: 4, styles: { fillColor: sunnikBlue, textColor: 255, fontStyle: 'bold' } }
    ]);

    // Items
    items.forEach(item => {
      tableData.push([
        `${item.sku}\n${item.description}`,
        { content: `${item.quantity} pcs`, styles: { halign: 'center' } },
        { content: `RM ${item.unitPrice.toFixed(2)}`, styles: { halign: 'right' } },
        { content: `RM ${(item.quantity * item.unitPrice).toFixed(2)}`, styles: { halign: 'right', fontStyle: 'bold' } }
      ]);
    });

    // Section subtotal
    const sectionTotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    tableData.push([
      { content: 'Subtotal', colSpan: 3, styles: { halign: 'right', fontStyle: 'bold', fillColor: lightGray } },
      { content: `RM ${sectionTotal.toFixed(2)}`, styles: { halign: 'right', fontStyle: 'bold', fillColor: lightGray } }
    ]);
  };

  addSection('BASE / FLOOR PANELS', bom.base);
  addSection('WALL PANELS', bom.walls);
  if (bom.partition && bom.partition.length > 0) {
    addSection('PARTITION PANELS', bom.partition);
  }
  addSection('ROOF PANELS', bom.roof);

  if (bom.internalSupport && bom.internalSupport.length > 0) {
    addSection('INTERNAL SUPPORT (TIE RODS)', bom.internalSupport);
  }

  if (bom.externalSupport && bom.externalSupport.length > 0) {
    addSection('EXTERNAL SUPPORT (I-BEAMS)', bom.externalSupport);
  }

  if (bom.accessories && bom.accessories.length > 0) {
    addSection('ACCESSORIES (BOLTS & NUTS)', bom.accessories);
  }

  // Generate table
  autoTable(doc, {
    startY: yPosition,
    head: [[
      { content: 'Item / Description', styles: { fillColor: darkGray, textColor: 255 } },
      { content: 'Quantity', styles: { fillColor: darkGray, textColor: 255, halign: 'center' } },
      { content: 'Unit Price', styles: { fillColor: darkGray, textColor: 255, halign: 'right' } },
      { content: 'Subtotal', styles: { fillColor: darkGray, textColor: 255, halign: 'right' } }
    ]],
    body: tableData,
    theme: 'grid',
    styles: {
      fontSize: 9,
      cellPadding: 4,
      lineColor: [200, 200, 200],
      lineWidth: 0.1
    },
    headStyles: {
      fillColor: darkGray,
      textColor: 255,
      fontStyle: 'bold',
      halign: 'left'
    },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 30 },
      2: { cellWidth: 35 },
      3: { cellWidth: 35 }
    },
    margin: { left: margin, right: margin }
  });

  // Get final Y position after table
  yPosition = doc.lastAutoTable.finalY + 10;

  // === GRAND TOTAL ===

  const totalBoxHeight = 25;
  const totalBoxY = yPosition;

  doc.setFillColor(sunnikBlue[0], sunnikBlue[1], sunnikBlue[2]);
  doc.roundedRect(margin, totalBoxY, pageWidth - 2 * margin, totalBoxHeight, 3, 3, 'F');

  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'normal');
  doc.text('GRAND TOTAL', margin + 10, totalBoxY + 10);

  doc.setFontSize(9);
  doc.text(`${bom.summary.totalPanels} total panels`, margin + 10, totalBoxY + 17);

  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  const totalText = `RM ${bom.summary.totalCost.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  doc.text(totalText, pageWidth - margin - 10, totalBoxY + 15, { align: 'right' });

  yPosition += totalBoxHeight + 15;

  // === NOTES & TERMS ===

  if (yPosition > pageHeight - 80) {
    doc.addPage();
    yPosition = margin;
  }

  doc.setFontSize(10);
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('NOTES:', margin, yPosition);

  yPosition += 6;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);

  const notes = [
    '• This quotation includes panel materials and support structures',
    '• Additional accessories and labor costs may apply',
    '• Prices subject to change based on market rates',
    '• Delivery and installation charges not included',
    '• Valid for 30 days from date of issue'
  ];

  notes.forEach(note => {
    doc.text(note, margin + 5, yPosition);
    yPosition += 5;
  });

  yPosition += 10;

  doc.setFont('helvetica', 'bold');
  doc.text('TERMS & CONDITIONS:', margin, yPosition);
  yPosition += 6;

  doc.setFont('helvetica', 'normal');
  const terms = [
    '• 50% deposit required upon order confirmation',
    '• Balance payment before delivery',
    '• Lead time: 4-6 weeks from deposit',
    '• Warranty: 12 months from installation'
  ];

  terms.forEach(term => {
    doc.text(term, margin + 5, yPosition);
    yPosition += 5;
  });

  // === FOOTER ===

  const footerY = pageHeight - 15;

  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.1);
  doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);

  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.setFont('helvetica', 'normal');
  doc.text('Sunnik Water Tank Solutions | www.sunnik.net', pageWidth / 2, footerY, { align: 'center' });
  doc.text('sales@sunnik.net', pageWidth / 2, footerY + 4, { align: 'center' });

  // === SAVE PDF ===

  const fileName = `Sunnik_Quote_${quoteNumber}_${inputs.length}x${inputs.width}x${inputs.height}m.pdf`;
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
