import { useState, useEffect } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { 
  Save, 
  Download, 
  Plus, 
  Trash2, 
  ArrowLeft,
  Calculator 
} from 'lucide-react';
import { format } from 'date-fns';
import { useStore } from '../store/useStore';
import { generatePDF } from '../services/pdfGenerator';
import { CURRENCIES } from '../utils/currencies';
import type { Document, LineItem, DocumentType, DocumentStatus } from '../types';

const generateId = () => crypto.randomUUID();

export default function DocumentEditorPage() {
  const navigate = useNavigate();
  const { documentId } = useParams({ from: '/documents/$documentId' });
  const { 
    documents, 
    addDocument, 
    updateDocument, 
    deleteDocument,
    businessProfile, 
    clients,
    getNextInvoiceNumber 
  } = useStore();

  const isNew = documentId.startsWith('new-');
  const docType: DocumentType = isNew 
    ? (documentId.replace('new-', '') as DocumentType)
    : documents.find(d => d.id === documentId)?.type || 'invoice';

  const existingDoc = isNew ? null : documents.find((d) => d.id === documentId);

  const [formData, setFormData] = useState<Partial<Document>>({
    type: docType,
    status: 'draft',
    documentNumber: '',
    reference: '',
    salesRep: '',
    clientId: '',
    lineItems: [],
    subtotal: 0,
    taxRate: 15,
    taxAmount: 0,
    discount: 0,
    discountType: 'percentage',
    total: 0,
    currency: businessProfile?.defaultCurrency || 'R',
    notes: '',
    terms: '',
    paymentTerms: '50% deposit payable before work can commence.',
    dueDate: '',
    issueDate: format(new Date(), 'yyyy-MM-dd'),
  });

  useEffect(() => {
    if (existingDoc) {
      setFormData(existingDoc);
    } else {
      // Set document number for new documents
      if (docType === 'invoice') {
        setFormData(prev => ({ ...prev, documentNumber: getNextInvoiceNumber() }));
      } else {
        setFormData(prev => ({ 
          ...prev, 
          documentNumber: `QUO-${Date.now().toString().slice(-6)}` 
        }));
      }
    }
  }, [existingDoc, docType]);

  useEffect(() => {
    calculateTotals();
  }, [formData.lineItems, formData.discount, formData.discountType, formData.taxRate]);

  const calculateTotals = () => {
    const subtotal = formData.lineItems?.reduce((sum, item) => sum + item.total, 0) || 0;
    
    const discountAmount = formData.discountType === 'percentage'
      ? (subtotal * (formData.discount || 0)) / 100
      : formData.discount || 0;
    
    const afterDiscount = subtotal - discountAmount;
    const taxAmount = (afterDiscount * (formData.taxRate || 0)) / 100;
    const total = afterDiscount + taxAmount;

    setFormData(prev => ({
      ...prev,
      subtotal,
      taxAmount,
      total,
    }));
  };

  const handleAddLineItem = () => {
    const newItem: LineItem = {
      id: generateId(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0,
    };
    setFormData({
      ...formData,
      lineItems: [...(formData.lineItems || []), newItem],
    });
  };

  const handleUpdateLineItem = (id: string, field: keyof LineItem, value: any) => {
    const updatedItems = formData.lineItems?.map((item) => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          updated.total = updated.quantity * updated.unitPrice;
        }
        return updated;
      }
      return item;
    });
    setFormData({ ...formData, lineItems: updatedItems });
  };

  const handleDeleteLineItem = (id: string) => {
    setFormData({
      ...formData,
      lineItems: formData.lineItems?.filter((item) => item.id !== id),
    });
  };

  const handleSave = () => {
    if (!businessProfile) {
      alert('Please set up your business profile first');
      return;
    }

    const selectedClient = clients.find((c) => c.id === formData.clientId);
    if (!selectedClient) {
      alert('Please select a client');
      return;
    }

    if (!formData.lineItems || formData.lineItems.length === 0) {
      alert('Please add at least one line item');
      return;
    }

    const document: Document = {
      id: isNew ? generateId() : documentId,
      type: formData.type || docType,
      status: formData.status || 'draft',
      documentNumber: formData.documentNumber || '',
      reference: formData.reference,
      salesRep: formData.salesRep,
      clientId: formData.clientId || '',
      client: selectedClient,
      businessProfile: businessProfile,
      lineItems: formData.lineItems,
      subtotal: formData.subtotal || 0,
      taxRate: formData.taxRate || 0,
      taxAmount: formData.taxAmount || 0,
      discount: formData.discount || 0,
      discountType: formData.discountType || 'percentage',
      total: formData.total || 0,
      currency: formData.currency || 'R',
      notes: formData.notes,
      terms: formData.terms,
      paymentTerms: formData.paymentTerms,
      dueDate: formData.dueDate,
      issueDate: formData.issueDate || format(new Date(), 'yyyy-MM-dd'),
      createdAt: existingDoc?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (isNew) {
      addDocument(document);
    } else {
      updateDocument(documentId, document);
    }

    navigate({ to: '/documents' });
  };

  const handleExportPDF = async () => {
    if (!businessProfile) {
      alert('Please set up your business profile first');
      return;
    }

    const selectedClient = clients.find((c) => c.id === formData.clientId);
    if (!selectedClient) {
      alert('Please select a client');
      return;
    }

    const tempDoc: Document = {
      id: documentId,
      type: formData.type || docType,
      status: formData.status || 'draft',
      documentNumber: formData.documentNumber || '',
      reference: formData.reference,
      salesRep: formData.salesRep,
      clientId: formData.clientId || '',
      client: selectedClient,
      businessProfile: businessProfile,
      lineItems: formData.lineItems || [],
      subtotal: formData.subtotal || 0,
      taxRate: formData.taxRate || 0,
      taxAmount: formData.taxAmount || 0,
      discount: formData.discount || 0,
      discountType: formData.discountType || 'percentage',
      total: formData.total || 0,
      currency: formData.currency || 'R',
      notes: formData.notes,
      terms: formData.terms,
      paymentTerms: formData.paymentTerms,
      dueDate: formData.dueDate,
      issueDate: formData.issueDate || format(new Date(), 'yyyy-MM-dd'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await generatePDF(tempDoc);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this document?')) {
      deleteDocument(documentId);
      navigate({ to: '/documents' });
    }
  };

  console.log('About to render, formData:', formData);

  // Early return for debugging
  if (!businessProfile) {
    return (
      <div className="p-6 lg:p-8 max-w-6xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-yellow-900 mb-2">Business Profile Required</h2>
          <p className="text-yellow-800 mb-4">Please set up your business profile first.</p>
          <button
            onClick={() => navigate({ to: '/business-profile' })}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
          >
            Go to Business Profile
          </button>
        </div>
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <div className="p-6 lg:p-8 max-w-6xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-yellow-900 mb-2">Clients Required</h2>
          <p className="text-yellow-800 mb-4">Please add at least one client first.</p>
          <button
            onClick={() => navigate({ to: '/clients' })}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
          >
            Go to Clients
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate({ to: '/documents' })}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Documents
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isNew ? 'Create' : 'Edit'} {docType === 'invoice' ? 'Invoice' : 'Quotation'}
            </h1>
            <p className="mt-1 text-gray-600">{formData.documentNumber}</p>
          </div>
          <div className="flex items-center space-x-3">
            {!isNew && (
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            )}
            <button
              onClick={handleExportPDF}
              className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Download className="h-5 w-5 mr-2" />
              Export PDF
            </button>
            <button
              onClick={handleSave}
              className="flex items-center px-4 py-2 bg-primary-100 border-2 border-primary-300 text-gray-900 rounded-lg hover:bg-primary-200 transition-colors shadow-sm font-bold"
            >
              <Save className="h-5 w-5 mr-2" />
              Save
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Client *
                </label>
                <select
                  value={formData.clientId}
                  onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a client</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name} {client.company ? `(${client.company})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as DocumentStatus })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  <option value="paid">Paid</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reference
                </label>
                <input
                  type="text"
                  value={formData.reference}
                  onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., Project description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sales Rep
                </label>
                <input
                  type="text"
                  value={formData.salesRep}
                  onChange={(e) => setFormData({ ...formData, salesRep: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Sales representative name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Issue Date *
                </label>
                <input
                  type="date"
                  value={formData.issueDate}
                  onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {CURRENCIES.map((currency) => (
                    <option key={currency.code} value={currency.symbol}>
                      {currency.symbol} - {currency.name} ({currency.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Line Items</h2>
              <button
                onClick={handleAddLineItem}
                className="flex items-center px-3 py-2 bg-primary-100 border-2 border-primary-300 text-gray-900 rounded-lg hover:bg-primary-200 transition-colors text-sm font-bold"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Item
              </button>
            </div>

            <div className="space-y-4">
              {formData.lineItems?.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-12 gap-2 items-start p-4 bg-gray-50 rounded-lg"
                >
                  <div className="col-span-12 md:col-span-5">
                    <input
                      type="text"
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) =>
                        handleUpdateLineItem(item.id, 'description', e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    />
                  </div>
                  <div className="col-span-4 md:col-span-2">
                    <input
                      type="number"
                      placeholder="Qty"
                      min="0"
                      step="0.01"
                      value={item.quantity}
                      onChange={(e) =>
                        handleUpdateLineItem(item.id, 'quantity', parseFloat(e.target.value) || 0)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    />
                  </div>
                  <div className="col-span-4 md:col-span-2">
                    <input
                      type="number"
                      placeholder="Price"
                      min="0"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) =>
                        handleUpdateLineItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    />
                  </div>
                  <div className="col-span-3 md:col-span-2 flex items-center">
                    <span className="text-sm font-medium text-gray-900">
                      {formData.currency}{item.total.toFixed(2)}
                    </span>
                  </div>
                  <div className="col-span-1 flex items-center justify-center">
                    <button
                      onClick={() => handleDeleteLineItem(item.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}

              {(!formData.lineItems || formData.lineItems.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  <Calculator className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                  <p>No line items yet. Click "Add Item" to get started.</p>
                </div>
              )}
            </div>
          </div>

          {/* Notes & Terms */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Any additional notes for the client..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Terms
                </label>
                <textarea
                  value={formData.paymentTerms}
                  onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., 50% deposit payable before work can commence."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Terms & Conditions
                </label>
                <textarea
                  value={formData.terms}
                  onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Additional terms and conditions..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Summary</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.discount}
                    onChange={(e) =>
                      setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })
                    }
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <select
                    value={formData.discountType}
                    onChange={(e) =>
                      setFormData({ ...formData, discountType: e.target.value as 'percentage' | 'fixed' })
                    }
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="percentage">%</option>
                    <option value="fixed">{formData.currency}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  VAT Rate (%)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.taxRate}
                  onChange={(e) =>
                    setFormData({ ...formData, taxRate: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="15"
                />
              </div>

              <div className="pt-4 border-t border-gray-200 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium text-gray-900">
                    {formData.currency}{formData.subtotal?.toFixed(2) || '0.00'}
                  </span>
                </div>

                {formData.discount && formData.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      Discount {formData.discountType === 'percentage' ? `(${formData.discount}%)` : ''}
                    </span>
                    <span className="font-medium text-gray-900">
                      -{formData.currency}
                      {(formData.discountType === 'percentage'
                        ? ((formData.subtotal || 0) * formData.discount) / 100
                        : formData.discount
                      ).toFixed(2)}
                    </span>
                  </div>
                )}

                {formData.taxRate && formData.taxRate > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax ({formData.taxRate}%)</span>
                    <span className="font-medium text-gray-900">
                      {formData.currency}{formData.taxAmount?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                )}

                <div className="flex justify-between pt-3 border-t border-gray-200">
                  <span className="text-base font-semibold text-gray-900">Total</span>
                  <span className="text-xl font-bold text-primary-600">
                    {formData.currency}{formData.total?.toFixed(2) || '0.00'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
