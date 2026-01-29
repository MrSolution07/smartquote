import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import type { Document } from '../types';

/**
 * South African style PDF generator matching the reference quotation format
 * Based on: Quotation - QUO0001739 - 24-04-2025.pdf
 */
export async function generatePDF(document: Document): Promise<void> {
  const doc = new jsPDF();
  const { businessProfile, client, lineItems, type } = document;

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let yPosition = margin;

  // ========== HEADER SECTION ==========
  
  // Add logo if provided
  if (document.logo) {
    try {
      doc.addImage(document.logo, 'PNG', margin, yPosition, 40, 20);
      yPosition += 25;
    } catch (error) {
      console.error('Failed to add logo to PDF:', error);
    }
  }

  // Title - QUOTE or INVOICE
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  const title = type === 'invoice' ? 'INVOICE' : 'QUOTE';
  doc.text(title, margin, yPosition);
  yPosition += 8;

  // Left Column: NUMBER and REFERENCE
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('NUMBER:', margin, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.text(document.documentNumber, margin + 20, yPosition);
  yPosition += 5;

  if (document.reference) {
    doc.setFont('helvetica', 'bold');
    doc.text('REFERENCE:', margin, yPosition);
    doc.setFont('helvetica', 'normal');
    const refLines = doc.splitTextToSize(document.reference, 80);
    refLines.forEach((line: string, index: number) => {
      doc.text(line, margin + 20, yPosition + (index * 4));
    });
    yPosition += refLines.length * 4 + 1;
  }

  // Right Column: DATE, DUE DATE, SALES REP, DISCOUNT, PAGE
  const rightCol = pageWidth - 70;
  let rightY = margin + (document.logo ? 25 : 0) + 8;

  doc.setFont('helvetica', 'bold');
  doc.text('DATE:', rightCol, rightY);
  doc.setFont('helvetica', 'normal');
  doc.text(format(new Date(document.issueDate), 'dd/MM/yyyy'), rightCol + 20, rightY);
  rightY += 5;

  if (document.dueDate) {
    doc.setFont('helvetica', 'bold');
    doc.text('DUE DATE:', rightCol, rightY);
    doc.setFont('helvetica', 'normal');
    doc.text(format(new Date(document.dueDate), 'dd/MM/yyyy'), rightCol + 20, rightY);
    rightY += 5;
  }

  if (document.salesRep || businessProfile.salesRep) {
    doc.setFont('helvetica', 'bold');
    doc.text('SALES REP:', rightCol, rightY);
    doc.setFont('helvetica', 'normal');
    doc.text((document.salesRep || businessProfile.salesRep || '').toUpperCase(), rightCol + 20, rightY);
    rightY += 5;
  }

  doc.setFont('helvetica', 'bold');
  doc.text('OVERALL DISCOUNT %:', rightCol, rightY);
  doc.setFont('helvetica', 'normal');
  const discountPercent = document.discountType === 'percentage' ? document.discount : 0;
  doc.text(`${discountPercent.toFixed(2)}%`, rightCol + 35, rightY);
  rightY += 5;

  doc.setFont('helvetica', 'bold');
  doc.text('PAGE:', rightCol, rightY);
  doc.setFont('helvetica', 'normal');
  doc.text('1/1', rightCol + 12, rightY);

  // Adjust yPosition to be below both columns
  yPosition = Math.max(yPosition, rightY) + 5;

  // ========== FROM TO SECTION ==========
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('FROM', margin, yPosition);
  doc.text('TO', pageWidth / 2 + 10, yPosition);
  yPosition += 5;

  // FROM - Company name and VAT
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(businessProfile.companyName.toUpperCase(), margin, yPosition);
  doc.text((client.company || client.name).toUpperCase(), pageWidth / 2 + 10, yPosition);
  yPosition += 4;

  doc.setFont('helvetica', 'normal');
  if (businessProfile.vatNumber) {
    doc.text(`VAT NO: ${businessProfile.vatNumber}`, margin, yPosition);
  }
  if (client.vatNumber) {
    doc.text(`CUSTOMER VAT NO: ${client.vatNumber}`, pageWidth / 2 + 10, yPosition);
  }
  yPosition += 5;

  // Addresses Header
  doc.setFont('helvetica', 'bold');
  doc.text('PHYSICAL ADDRESS:', margin, yPosition);
  doc.text('POSTAL ADDRESS:', margin + 45, yPosition);
  doc.text('POSTAL ADDRESS:', pageWidth / 2 + 10, yPosition);
  doc.text('PHYSICAL ADDRESS:', pageWidth / 2 + 55, yPosition);
  yPosition += 4;

  // FROM Physical Address
  doc.setFont('helvetica', 'normal');
  const fromPhysical = businessProfile.physicalAddress || businessProfile.address || '';
  const fromPhysicalLines = doc.splitTextToSize(fromPhysical, 40);
  fromPhysicalLines.forEach((line: string, idx: number) => {
    doc.text(line, margin, yPosition + (idx * 4));
  });

  // FROM Postal Address
  const fromPostal = businessProfile.postalAddress || businessProfile.address || '';
  const fromPostalLines = doc.splitTextToSize(fromPostal, 40);
  fromPostalLines.forEach((line: string, idx: number) => {
    doc.text(line, margin + 45, yPosition + (idx * 4));
  });

  // TO Postal Address
  const toPostal = client.postalAddress || client.address || '';
  const toPostalLines = doc.splitTextToSize(toPostal, 40);
  toPostalLines.forEach((line: string, idx: number) => {
    doc.text(line, pageWidth / 2 + 10, yPosition + (idx * 4));
  });

  // TO Physical Address
  const toPhysical = client.physicalAddress || client.address || '';
  const toPhysicalLines = doc.splitTextToSize(toPhysical, 40);
  toPhysicalLines.forEach((line: string, idx: number) => {
    doc.text(line, pageWidth / 2 + 55, yPosition + (idx * 4));
  });

  const maxAddressLines = Math.max(
    fromPhysicalLines.length,
    fromPostalLines.length,
    toPostalLines.length,
    toPhysicalLines.length
  );
  yPosition += maxAddressLines * 4 + 5;

  // ========== LINE ITEMS TABLE ==========
  const tableData = lineItems.map((item) => {
    const exclTotal = item.total;
    const inclTotal = exclTotal * (1 + document.taxRate / 100);
    
    return [
      item.description,
      item.quantity.toFixed(3),
      `${document.currency}${item.unitPrice.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      '0.00%', // Discount per item
      `${document.taxRate.toFixed(2)}%`,
      `${document.currency}${exclTotal.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      `${document.currency}${inclTotal.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    ];
  });

  autoTable(doc, {
    startY: yPosition,
    head: [['Description', 'Quantity', 'Excl. Price', 'Disc %', 'VAT %', 'Excl. Total', 'Incl. Total']],
    body: tableData,
    theme: 'plain',
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      halign: 'left',
    },
    columnStyles: {
      0: { cellWidth: 60, halign: 'left' },
      1: { cellWidth: 20, halign: 'center' },
      2: { cellWidth: 25, halign: 'right' },
      3: { cellWidth: 15, halign: 'center' },
      4: { cellWidth: 15, halign: 'center' },
      5: { cellWidth: 25, halign: 'right' },
      6: { cellWidth: 25, halign: 'right' },
    },
    didDrawPage: (data) => {
      yPosition = data.cursor!.y;
    },
  });

  yPosition += 5;

  // ========== NOTES SECTION ==========
  if (document.notes) {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('Note:', margin, yPosition);
    doc.setFont('helvetica', 'normal');
    const notesLines = doc.splitTextToSize(document.notes, pageWidth - margin * 2);
    notesLines.forEach((line: string, idx: number) => {
      doc.text(line, margin + 10, yPosition + (idx * 4));
    });
    yPosition += notesLines.length * 4 + 3;
  }

  if (document.reference) {
    doc.setFont('helvetica', 'bold');
    doc.text('Quote/Project Description:', margin, yPosition);
    yPosition += 4;
    doc.setFont('helvetica', 'normal');
    const refDescLines = doc.splitTextToSize(document.reference, pageWidth - margin * 2);
    refDescLines.forEach((line: string, idx: number) => {
      doc.text(line, margin, yPosition + (idx * 4));
    });
    yPosition += refDescLines.length * 4 + 3;
  }

  // Contact Info
  if (businessProfile.phone) {
    doc.setFont('helvetica', 'bold');
    doc.text('VENDOR NO.', margin, yPosition);
    yPosition += 4;
    doc.text('PLEASE CONTACT BELOW', margin, yPosition);
    yPosition += 4;
    doc.setFont('helvetica', 'normal');
    doc.text(businessProfile.phone, margin, yPosition);
    if (businessProfile.salesRep) {
      doc.text(`(${businessProfile.salesRep})`, margin + 30, yPosition);
    }
    yPosition += 8;
  }

  // ========== BANKING DETAILS ==========
  doc.setFont('helvetica', 'bold');
  doc.text('Banking Details', margin, yPosition);
  yPosition += 4;

  doc.setFont('helvetica', 'normal');
  const bankingLeft = margin;
  const bankingRight = pageWidth / 2;

  doc.text(`Name: ${businessProfile.companyName}`, bankingLeft, yPosition);
  if (businessProfile.bankName) {
    doc.text(`Bank Name: ${businessProfile.bankName}`, bankingRight, yPosition);
  }
  yPosition += 4;

  if (businessProfile.accountNumber) {
    doc.text(`Account Number: ${businessProfile.accountNumber}`, bankingLeft, yPosition);
  }
  if (businessProfile.accountType) {
    doc.text(`Account Type: ${businessProfile.accountType}`, bankingRight, yPosition);
  }
  yPosition += 4;

  if (businessProfile.companyRegistration) {
    doc.text(`Company Registration Number: ${businessProfile.companyRegistration}`, bankingLeft, yPosition);
    yPosition += 5;
  }

  // Additional Terms
  doc.setFontSize(7);
  doc.text('Quantities may change depending on the actual scope of work done.', margin, yPosition);
  yPosition += 3;
  doc.text('Once signed, please Fax, mail or e-mail it to the provided address.', margin, yPosition);
  yPosition += 5;

  // ========== PAYMENT TERMS ==========
  if (document.paymentTerms) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('PAYMENT TERMS:', margin, yPosition);
    doc.setFont('helvetica', 'normal');
    const termsLines = doc.splitTextToSize(document.paymentTerms, pageWidth - margin * 2);
    termsLines.forEach((line: string, idx: number) => {
      doc.text(line, margin + 30, yPosition + (idx * 4));
    });
    yPosition += termsLines.length * 4 + 5;
  }

  // ========== TOTALS BOX (Right Side) ==========
  const totalsX = pageWidth - 70;
  const totalsY = pageHeight - 60;
  const boxWidth = 55;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');

  // Calculate discount amount
  const totalDiscount = document.discountType === 'percentage'
    ? (document.subtotal * document.discount) / 100
    : document.discount;

  let currentY = totalsY;

  // Total Discount
  doc.text('Total Discount:', totalsX, currentY);
  doc.text(`${document.currency}${totalDiscount.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`, totalsX + boxWidth, currentY, { align: 'right' });
  currentY += 5;

  // Total Exclusive
  doc.text('Total Exclusive:', totalsX, currentY);
  doc.text(`${document.currency}${document.subtotal.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`, totalsX + boxWidth, currentY, { align: 'right' });
  currentY += 5;

  // Total VAT
  doc.text('Total VAT:', totalsX, currentY);
  doc.text(`${document.currency}${document.taxAmount.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`, totalsX + boxWidth, currentY, { align: 'right' });
  currentY += 5;

  // Sub Total
  const afterDiscount = document.subtotal - totalDiscount;
  doc.text('Sub Total:', totalsX, currentY);
  doc.text(`${document.currency}${(afterDiscount + document.taxAmount).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`, totalsX + boxWidth, currentY, { align: 'right' });
  currentY += 5;

  // Grand Total
  doc.setFont('helvetica', 'bold');
  doc.text('Grand Total:', totalsX, currentY);
  doc.text(`${document.currency}${document.total.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`, totalsX + boxWidth, currentY, { align: 'right' });
  currentY += 7;

  // BALANCE DUE (Highlighted)
  doc.setFontSize(11);
  doc.text('BALANCE DUE', totalsX, currentY);
  doc.setFontSize(12);
  doc.text(`${document.currency}${document.total.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`, totalsX + boxWidth, currentY, { align: 'right' });

  // Page number at bottom
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('-- 1 of 1 --', pageWidth / 2, pageHeight - 10, { align: 'center' });

  // Download
  const filename = `${title.toLowerCase()}-${document.documentNumber}.pdf`;
  doc.save(filename);
}
