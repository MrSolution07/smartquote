import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import type { Document } from '../types';

/**
 * South African style PDF generator matching the reference quotation format
 */
export async function generatePDF(document: Document): Promise<void> {
  const doc = new jsPDF();
  const { businessProfile, client, lineItems, type } = document;

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let yPosition = margin;

  // Title - QUOTE or INVOICE
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  const title = type === 'invoice' ? 'INVOICE' : 'QUOTE';
  doc.text(title, margin, yPosition);
  yPosition += 10;

  // Header Information (Left column)
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  
  doc.text('NUMBER:', margin, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.text(document.documentNumber, margin + 25, yPosition);
  yPosition += 5;

  if (document.reference) {
    doc.setFont('helvetica', 'bold');
    doc.text('REFERENCE:', margin, yPosition);
    doc.setFont('helvetica', 'normal');
    const refLines = doc.splitTextToSize(document.reference, 80);
    doc.text(refLines, margin + 25, yPosition);
    yPosition += refLines.length * 5;
  }

  // Date Information (Right column)
  const rightColX = pageWidth - 65;
  yPosition = margin + 10;
  
  doc.setFont('helvetica', 'bold');
  doc.text('DATE:', rightColX, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.text(format(new Date(document.issueDate), 'dd/MM/yyyy'), rightColX + 20, yPosition);
  yPosition += 5;

  if (document.dueDate) {
    doc.setFont('helvetica', 'bold');
    doc.text('DUE DATE:', rightColX, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(format(new Date(document.dueDate), 'dd/MM/yyyy'), rightColX + 20, yPosition);
    yPosition += 5;
  }

  if (document.salesRep || businessProfile.salesRep) {
    doc.setFont('helvetica', 'bold');
    doc.text('SALES REP:', rightColX, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text((document.salesRep || businessProfile.salesRep || '').toUpperCase(), rightColX + 20, yPosition);
    yPosition += 5;
  }

  doc.setFont('helvetica', 'bold');
  doc.text('DISCOUNT %:', rightColX, yPosition);
  doc.setFont('helvetica', 'normal');
  const discountPercent = document.discountType === 'percentage' ? document.discount : 0;
  doc.text(`${discountPercent.toFixed(2)}%`, rightColX + 25, yPosition);
  yPosition += 5;

  doc.setFont('helvetica', 'bold');
  doc.text('PAGE:', rightColX, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.text('1/1', rightColX + 20, yPosition);

  // FROM TO Section
  yPosition = 60;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  
  // Draw line above FROM TO
  doc.line(margin, yPosition - 2, pageWidth - margin, yPosition - 2);
  
  doc.text('FROM', margin, yPosition);
  doc.text('TO', pageWidth / 2 + 10, yPosition);
  yPosition += 6;

  // FROM Section (Business)
  const fromX = margin;
  const toX = pageWidth / 2 + 10;
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(businessProfile.companyName.toUpperCase(), fromX, yPosition);
  doc.text((client.company || client.name).toUpperCase(), toX, yPosition);
  yPosition += 5;

  // VAT Numbers
  if (businessProfile.vatNumber) {
    doc.setFont('helvetica', 'normal');
    doc.text(`VAT NO: ${businessProfile.vatNumber}`, fromX, yPosition);
  }
  if (client.vatNumber) {
    doc.text(`CUSTOMER VAT NO: ${client.vatNumber}`, toX, yPosition);
  }
  yPosition += 6;

  // Addresses Header
  doc.setFont('helvetica', 'bold');
  doc.text('PHYSICAL ADDRESS:', fromX, yPosition);
  doc.text('POSTAL ADDRESS:', fromX + 50, yPosition);
  doc.text('POSTAL ADDRESS:', toX, yPosition);
  doc.text('PHYSICAL ADDRESS:', toX + 45, yPosition);
  yPosition += 5;

  // Physical Address (Business)
  doc.setFont('helvetica', 'normal');
  const businessPhysical = businessProfile.physicalAddress || 
    `${businessProfile.address}\n${businessProfile.city}\n${businessProfile.state}\n${businessProfile.zipCode}`;
  const physicalLines = doc.splitTextToSize(businessPhysical, 45);
  doc.text(physicalLines, fromX, yPosition);

  // Postal Address (Business)
  const businessPostal = businessProfile.postalAddress || businessPhysical;
  const postalLines = doc.splitTextToSize(businessPostal, 45);
  doc.text(postalLines, fromX + 50, yPosition);

  // Client Postal Address
  const clientPostal = client.postalAddress || 
    `${client.address || ''}\n${client.city || ''}\n${client.state || ''}\n${client.zipCode || ''}`;
  const clientPostalLines = doc.splitTextToSize(clientPostal, 45);
  doc.text(clientPostalLines, toX, yPosition);

  // Client Physical Address
  const clientPhysical = client.physicalAddress || clientPostal;
  const clientPhysicalLines = doc.splitTextToSize(clientPhysical, 45);
  doc.text(clientPhysicalLines, toX + 45, yPosition);

  yPosition = Math.max(
    yPosition + physicalLines.length * 4,
    yPosition + postalLines.length * 4,
    yPosition + clientPostalLines.length * 4,
    yPosition + clientPhysicalLines.length * 4
  ) + 5;

  // Line Items Table
  yPosition += 5;
  
  const tableData = lineItems.map((item) => {
    const exclPrice = item.unitPrice;
    const discountPercent = document.discountType === 'percentage' ? document.discount : 0;
    const exclTotal = item.total;
    const inclTotal = exclTotal * (1 + document.taxRate / 100);
    
    return [
      item.description,
      item.quantity.toString(),
      `${document.currency}${exclPrice.toFixed(2)}`,
      `${discountPercent.toFixed(2)}%`,
      `${document.taxRate.toFixed(2)}%`,
      `${document.currency}${exclTotal.toFixed(2)}`,
      `${document.currency}${inclTotal.toFixed(2)}`,
    ];
  });

  autoTable(doc, {
    startY: yPosition,
    head: [['Description', 'Quantity', 'Excl. Price', 'Disc %', 'VAT %', 'Excl. Total', 'Incl. Total']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      fontSize: 8,
      cellPadding: 2,
      lineWidth: 0.5,
      lineColor: [0, 0, 0],
    },
    styles: {
      fontSize: 8,
      cellPadding: 3,
      lineColor: [0, 0, 0],
      lineWidth: 0.5,
    },
    columnStyles: {
      0: { cellWidth: 60 },
      1: { cellWidth: 20, halign: 'center' },
      2: { cellWidth: 22, halign: 'right' },
      3: { cellWidth: 15, halign: 'center' },
      4: { cellWidth: 15, halign: 'center' },
      5: { cellWidth: 25, halign: 'right' },
      6: { cellWidth: 25, halign: 'right' },
    },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 8;

  // Notes Section
  if (document.notes) {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('Note:', margin, yPosition);
    yPosition += 4;
    doc.setFont('helvetica', 'normal');
    const notesLines = doc.splitTextToSize(document.notes, pageWidth - 2 * margin);
    doc.text(notesLines, margin, yPosition);
    yPosition += notesLines.length * 4 + 5;
  }

  // Contact Information
  if (businessProfile.phone || businessProfile.email) {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('PLEASE CONTACT BELOW', margin, yPosition);
    yPosition += 4;
    doc.setFont('helvetica', 'normal');
    if (businessProfile.phone) {
      doc.text(businessProfile.phone, margin, yPosition);
      yPosition += 4;
    }
    if (businessProfile.email) {
      doc.text(businessProfile.email, margin, yPosition);
      yPosition += 4;
    }
    yPosition += 3;
  }

  // Banking Details
  if (businessProfile.bankName) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Banking Details', margin, yPosition);
    yPosition += 5;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    
    const bankingLeft = [
      `Name: ${businessProfile.companyName}`,
      businessProfile.accountNumber ? `Account Number: ${businessProfile.accountNumber}` : '',
    ].filter(Boolean);
    
    const bankingRight = [
      `Bank Name: ${businessProfile.bankName}`,
      businessProfile.accountType ? `Account Type: ${businessProfile.accountType}` : '',
    ].filter(Boolean);
    
    bankingLeft.forEach((line, i) => {
      doc.text(line, margin, yPosition + (i * 4));
    });
    
    bankingRight.forEach((line, i) => {
      doc.text(line, margin + 95, yPosition + (i * 4));
    });
    
    yPosition += Math.max(bankingLeft.length, bankingRight.length) * 4 + 3;
  }

  // Company Registration
  if (businessProfile.companyRegistration) {
    doc.text(`Company Registration Number: ${businessProfile.companyRegistration}`, margin, yPosition);
    yPosition += 5;
  }

  // Payment Terms
  if (document.paymentTerms || document.terms) {
    doc.setFont('helvetica', 'bold');
    doc.text('PAYMENT TERMS:', margin, yPosition);
    yPosition += 4;
    doc.setFont('helvetica', 'normal');
    const terms = document.paymentTerms || document.terms || '';
    const termsLines = doc.splitTextToSize(terms, pageWidth - 2 * margin);
    doc.text(termsLines, margin, yPosition);
    yPosition += termsLines.length * 4 + 5;
  }

  // Totals Box (Right side)
  const totalsX = pageWidth - 70;
  const totalsY = yPosition;
  const totalsWidth = 55;
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');

  let currentY = totalsY;
  
  // Total Discount
  const totalDiscount = document.discountType === 'percentage'
    ? (document.subtotal * document.discount) / 100
    : document.discount;
  
  doc.text('Total Discount:', totalsX, currentY);
  doc.text(`${document.currency}${totalDiscount.toFixed(2)}`, totalsX + totalsWidth, currentY, { align: 'right' });
  currentY += 5;

  // Total Exclusive
  doc.text('Total Exclusive:', totalsX, currentY);
  doc.text(`${document.currency}${document.subtotal.toFixed(2)}`, totalsX + totalsWidth, currentY, { align: 'right' });
  currentY += 5;

  // Total VAT
  doc.text('Total VAT:', totalsX, currentY);
  doc.text(`${document.currency}${document.taxAmount.toFixed(2)}`, totalsX + totalsWidth, currentY, { align: 'right' });
  currentY += 5;

  // Sub Total (after discount, before VAT)
  const afterDiscount = document.subtotal - totalDiscount;
  doc.text('Sub Total:', totalsX, currentY);
  doc.text(`${document.currency}${afterDiscount.toFixed(2)}`, totalsX + totalsWidth, currentY, { align: 'right' });
  currentY += 5;

  // Grand Total
  doc.setFontSize(9);
  doc.text('Grand Total:', totalsX, currentY);
  doc.text(`${document.currency}${document.total.toFixed(2)}`, totalsX + totalsWidth, currentY, { align: 'right' });
  currentY += 7;

  // Balance Due Box
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.rect(totalsX - 2, currentY - 4, totalsWidth + 4, 10);
  doc.text('BALANCE DUE', totalsX, currentY);
  doc.text(`${document.currency}${document.total.toFixed(2)}`, totalsX + totalsWidth, currentY, { align: 'right' });

  // Footer
  const footerY = pageHeight - 10;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`-- 1 of 1 --`, pageWidth / 2, footerY, { align: 'center' });

  // Save the PDF
  const filename = `${title.toLowerCase()}-${document.documentNumber}.pdf`;
  doc.save(filename);
}
