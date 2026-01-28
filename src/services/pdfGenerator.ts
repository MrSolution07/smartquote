import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import type { Document } from '../types';

export async function generatePDF(document: Document): Promise<void> {
  const doc = new jsPDF();
  const { businessProfile, client, lineItems, type } = document;

  // Set up document
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPosition = margin;

  // Header - Business Name
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(businessProfile.companyName, margin, yPosition);
  yPosition += 10;

  // Business Details
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(businessProfile.address, margin, yPosition);
  yPosition += 5;
  doc.text(
    `${businessProfile.city}, ${businessProfile.state} ${businessProfile.zipCode}`,
    margin,
    yPosition
  );
  yPosition += 5;
  doc.text(businessProfile.email, margin, yPosition);
  yPosition += 5;
  doc.text(businessProfile.phone, margin, yPosition);
  yPosition += 15;

  // Document Title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  const title = type === 'invoice' ? 'INVOICE' : 'QUOTATION';
  doc.text(title, pageWidth - margin, yPosition - 30, { align: 'right' });

  // Document Number and Date
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`${title} #: ${document.documentNumber}`, pageWidth - margin, yPosition - 22, {
    align: 'right',
  });
  doc.text(`Date: ${format(new Date(document.issueDate), 'MMM dd, yyyy')}`, pageWidth - margin, yPosition - 17, {
    align: 'right',
  });
  
  if (document.dueDate) {
    doc.text(`Due Date: ${format(new Date(document.dueDate), 'MMM dd, yyyy')}`, pageWidth - margin, yPosition - 12, {
      align: 'right',
    });
  }

  // Client Information
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Bill To:', margin, yPosition);
  yPosition += 7;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(client.name, margin, yPosition);
  yPosition += 5;
  
  if (client.company) {
    doc.text(client.company, margin, yPosition);
    yPosition += 5;
  }
  
  if (client.address) {
    doc.text(client.address, margin, yPosition);
    yPosition += 5;
  }
  
  if (client.city && client.state && client.zipCode) {
    doc.text(`${client.city}, ${client.state} ${client.zipCode}`, margin, yPosition);
    yPosition += 5;
  }
  
  doc.text(client.email, margin, yPosition);
  yPosition += 15;

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
    theme: 'striped',
    headStyles: {
      fillColor: [14, 165, 233], // Primary color
      textColor: 255,
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 10,
    },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 30, halign: 'center' },
      2: { cellWidth: 40, halign: 'right' },
      3: { cellWidth: 40, halign: 'right' },
    },
  });

  // Get position after table
  yPosition = (doc as any).lastAutoTable.finalY + 10;

  // Totals
  const totalsX = pageWidth - margin - 60;
  doc.setFontSize(10);

  doc.text('Subtotal:', totalsX, yPosition);
  doc.text(`${document.currency} ${document.subtotal.toFixed(2)}`, pageWidth - margin, yPosition, {
    align: 'right',
  });
  yPosition += 7;

  if (document.discount > 0) {
    const discountLabel = document.discountType === 'percentage' 
      ? `Discount (${document.discount}%):`
      : 'Discount:';
    const discountAmount = document.discountType === 'percentage'
      ? (document.subtotal * document.discount) / 100
      : document.discount;
    
    doc.text(discountLabel, totalsX, yPosition);
    doc.text(`-${document.currency} ${discountAmount.toFixed(2)}`, pageWidth - margin, yPosition, {
      align: 'right',
    });
    yPosition += 7;
  }

  if (document.taxRate > 0) {
    doc.text(`Tax (${document.taxRate}%):`, totalsX, yPosition);
    doc.text(`${document.currency} ${document.taxAmount.toFixed(2)}`, pageWidth - margin, yPosition, {
      align: 'right',
    });
    yPosition += 7;
  }

  // Total
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Total:', totalsX, yPosition);
  doc.text(`${document.currency} ${document.total.toFixed(2)}`, pageWidth - margin, yPosition, {
    align: 'right',
  });
  yPosition += 15;

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

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 15;
  doc.setFontSize(8);
  doc.setTextColor(128);
  doc.text(
    `Generated by SmartQuote on ${format(new Date(), 'MMM dd, yyyy')}`,
    pageWidth / 2,
    footerY,
    { align: 'center' }
  );

  // Save the PDF
  const filename = `${title.toLowerCase()}-${document.documentNumber}.pdf`;
  doc.save(filename);
}
