import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import type { Document } from '../types';

export async function generatePDF(document: Document): Promise<void> {
  const doc = new jsPDF();
  const { businessProfile, client, lineItems, type } = document;

  // Set up document
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPosition = margin;

  // Add decorative header bar
  doc.setFillColor(14, 165, 233); // Primary color
  doc.rect(0, 0, pageWidth, 8, 'F');

  yPosition = 20;

  // Header - Business Name with enhanced styling
  doc.setFontSize(26);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59); // Dark gray
  doc.text(businessProfile.companyName, margin, yPosition);
  yPosition += 10;

  // Business Details with improved formatting
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105); // Gray
  doc.text(businessProfile.address, margin, yPosition);
  yPosition += 4.5;
  doc.text(
    `${businessProfile.city}, ${businessProfile.state} ${businessProfile.zipCode}`,
    margin,
    yPosition
  );
  yPosition += 4.5;
  doc.text(`📧 ${businessProfile.email}`, margin, yPosition);
  yPosition += 4.5;
  doc.text(`📞 ${businessProfile.phone}`, margin, yPosition);
  yPosition += 15;

  // Document Title with enhanced box
  const title = type === 'invoice' ? 'INVOICE' : 'QUOTATION';
  const titleBoxWidth = 70;
  const titleBoxHeight = 28;
  const titleBoxX = pageWidth - margin - titleBoxWidth;
  const titleBoxY = yPosition - 38;
  
  // Draw title box with gradient effect (simulated with overlapping rectangles)
  doc.setFillColor(224, 242, 254); // Light blue
  doc.roundedRect(titleBoxX, titleBoxY, titleBoxWidth, titleBoxHeight, 3, 3, 'F');
  doc.setFillColor(14, 165, 233); // Primary color
  doc.roundedRect(titleBoxX, titleBoxY, titleBoxWidth, 4, 3, 3, 'F');
  
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(14, 165, 233);
  doc.text(title, pageWidth - margin - titleBoxWidth / 2, titleBoxY + 12, { align: 'center' });

  // Document Number and Date with better styling
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`${title} #: ${document.documentNumber}`, pageWidth - margin, yPosition - 22, {
    align: 'right',
  });
  doc.text(`📅 ${format(new Date(document.issueDate), 'MMM dd, yyyy')}`, pageWidth - margin, yPosition - 17, {
    align: 'right',
  });
  
  if (document.dueDate) {
    doc.setTextColor(239, 68, 68); // Red for due date
    doc.text(`⏰ Due: ${format(new Date(document.dueDate), 'MMM dd, yyyy')}`, pageWidth - margin, yPosition - 12, {
      align: 'right',
    });
    doc.setTextColor(71, 85, 105); // Reset color
  }

  // Client Information Box
  const clientBoxY = yPosition;
  doc.setFillColor(249, 250, 251); // Light gray background
  doc.roundedRect(margin, clientBoxY, 90, client.company ? 38 : 33, 2, 2, 'F');
  doc.setDrawColor(229, 231, 235);
  doc.roundedRect(margin, clientBoxY, 90, client.company ? 38 : 33, 2, 2, 'S');
  
  yPosition += 6;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(14, 165, 233);
  doc.text('BILL TO:', margin + 4, yPosition);
  yPosition += 6;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text(client.name, margin + 4, yPosition);
  yPosition += 5;
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  
  if (client.company) {
    doc.text(client.company, margin + 4, yPosition);
    yPosition += 4.5;
  }
  
  if (client.address) {
    doc.text(client.address, margin + 4, yPosition);
    yPosition += 4.5;
  }
  
  if (client.city && client.state && client.zipCode) {
    doc.text(`${client.city}, ${client.state} ${client.zipCode}`, margin + 4, yPosition);
    yPosition += 4.5;
  }
  
  doc.text(client.email, margin + 4, yPosition);
  yPosition = clientBoxY + (client.company ? 42 : 37);

  // Line Items Table
  const tableData = lineItems.map((item) => [
    item.description,
    item.quantity.toString(),
    `${document.currency} ${item.unitPrice.toFixed(2)}`,
    `${document.currency} ${item.total.toFixed(2)}`,
  ]);

  autoTable(doc, {
    startY: yPosition,
    head: [['Description', 'Quantity', 'Unit Price', 'Total']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [14, 165, 233], // Primary color
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 11,
      cellPadding: 5,
    },
    styles: {
      fontSize: 9,
      cellPadding: 4,
      lineColor: [229, 231, 235],
      lineWidth: 0.5,
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251],
    },
    columnStyles: {
      0: { cellWidth: 80, textColor: [30, 41, 59] },
      1: { cellWidth: 30, halign: 'center', textColor: [71, 85, 105] },
      2: { cellWidth: 40, halign: 'right', textColor: [71, 85, 105] },
      3: { cellWidth: 40, halign: 'right', fontStyle: 'bold', textColor: [14, 165, 233] },
    },
  });

  // Get position after table
  yPosition = (doc as any).lastAutoTable.finalY + 10;

  // Totals Box with enhanced styling
  const totalsBoxWidth = 80;
  const totalsBoxX = pageWidth - margin - totalsBoxWidth;
  const totalsBoxY = yPosition;
  const totalsBoxHeight = 30 + (document.discount > 0 ? 6 : 0) + (document.taxRate > 0 ? 6 : 0);
  
  doc.setFillColor(249, 250, 251);
  doc.roundedRect(totalsBoxX, totalsBoxY, totalsBoxWidth, totalsBoxHeight, 2, 2, 'F');
  doc.setDrawColor(229, 231, 235);
  doc.roundedRect(totalsBoxX, totalsBoxY, totalsBoxWidth, totalsBoxHeight, 2, 2, 'S');
  
  yPosition += 8;
  const labelX = totalsBoxX + 4;
  const valueX = pageWidth - margin - 4;
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);

  doc.text('Subtotal:', labelX, yPosition);
  doc.text(`${document.currency} ${document.subtotal.toFixed(2)}`, valueX, yPosition, {
    align: 'right',
  });
  yPosition += 6;

  if (document.discount > 0) {
    const discountLabel = document.discountType === 'percentage' 
      ? `Discount (${document.discount}%):`
      : 'Discount:';
    const discountAmount = document.discountType === 'percentage'
      ? (document.subtotal * document.discount) / 100
      : document.discount;
    
    doc.setTextColor(239, 68, 68); // Red for discount
    doc.text(discountLabel, labelX, yPosition);
    doc.text(`-${document.currency} ${discountAmount.toFixed(2)}`, valueX, yPosition, {
      align: 'right',
    });
    doc.setTextColor(71, 85, 105);
    yPosition += 6;
  }

  if (document.taxRate > 0) {
    doc.text(`Tax (${document.taxRate}%):`, labelX, yPosition);
    doc.text(`${document.currency} ${document.taxAmount.toFixed(2)}`, valueX, yPosition, {
      align: 'right',
    });
    yPosition += 6;
  }

  // Draw separator line
  yPosition += 2;
  doc.setDrawColor(14, 165, 233);
  doc.setLineWidth(1);
  doc.line(labelX, yPosition, valueX, yPosition);
  yPosition += 6;

  // Total with emphasis
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(14, 165, 233);
  doc.text('TOTAL:', labelX, yPosition);
  doc.text(`${document.currency} ${document.total.toFixed(2)}`, valueX, yPosition, {
    align: 'right',
  });
  yPosition += 15;
  
  doc.setTextColor(71, 85, 105); // Reset color

  // Notes
  if (document.notes) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Notes:', margin, yPosition);
    yPosition += 7;

    doc.setFont('helvetica', 'normal');
    const notesLines = doc.splitTextToSize(document.notes, pageWidth - 2 * margin);
    doc.text(notesLines, margin, yPosition);
    yPosition += notesLines.length * 5 + 10;
  }

  // Terms
  if (document.terms) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Terms & Conditions:', margin, yPosition);
    yPosition += 7;

    doc.setFont('helvetica', 'normal');
    const termsLines = doc.splitTextToSize(document.terms, pageWidth - 2 * margin);
    doc.text(termsLines, margin, yPosition);
  }

  // Banking Information (for invoices)
  if (type === 'invoice' && businessProfile.bankName) {
    yPosition = doc.internal.pageSize.getHeight() - 40;
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Payment Information:', margin, yPosition);
    yPosition += 7;

    doc.setFont('helvetica', 'normal');
    doc.text(`Bank: ${businessProfile.bankName}`, margin, yPosition);
    yPosition += 5;
    
    if (businessProfile.accountNumber) {
      doc.text(`Account: ${businessProfile.accountNumber}`, margin, yPosition);
      yPosition += 5;
    }
    
    if (businessProfile.routingNumber) {
      doc.text(`Routing: ${businessProfile.routingNumber}`, margin, yPosition);
    }
  }

  // Footer with enhanced design
  const footerY = pageHeight - 20;
  
  // Footer bar
  doc.setFillColor(249, 250, 251);
  doc.rect(0, footerY - 5, pageWidth, 30, 'F');
  doc.setDrawColor(229, 231, 235);
  doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
  
  doc.setFontSize(7);
  doc.setTextColor(107, 114, 128);
  doc.setFont('helvetica', 'italic');
  doc.text(
    `Generated by SmartQuote on ${format(new Date(), 'MMM dd, yyyy')}`,
    pageWidth / 2,
    footerY + 2,
    { align: 'center' }
  );
  
  doc.setFont('helvetica', 'normal');
  doc.text(
    'Thank you for your business!',
    pageWidth / 2,
    footerY + 7,
    { align: 'center' }
  );

  // Save the PDF
  const filename = `${title.toLowerCase()}-${document.documentNumber}.pdf`;
  doc.save(filename);
}
