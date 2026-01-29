import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Download, Upload, Eye, Edit3 } from 'lucide-react';
import { format } from 'date-fns';
import { useStore } from '../store/useStore';
import { generatePDF } from '../services/pdfGenerator';
import { CURRENCIES } from '../utils/currencies';
import type { Document, LineItem, DocumentType } from '../types';

const generateId = () => crypto.randomUUID();

interface DocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: DocumentType;
}

export default function DocumentModal({ isOpen, onClose, type }: DocumentModalProps) {
  const { businessProfile, clients, getNextInvoiceNumber } = useStore();

  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [logo, setLogo] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    clientId: '',
    reference: '',
    salesRep: businessProfile?.salesRep || '',
    issueDate: format(new Date(), 'yyyy-MM-dd'),
    dueDate: '',
    lineItems: [] as LineItem[],
    discount: 0,
    discountType: 'percentage' as 'percentage' | 'fixed',
    taxRate: 15,
    currency: 'R',
    notes: '',
    terms: '',
    paymentTerms: '50% deposit payable before work can commence.',
  });

  const [subtotal, setSubtotal] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        clientId: clients[0]?.id || '',
        reference: '',
        salesRep: businessProfile?.salesRep || '',
        issueDate: format(new Date(), 'yyyy-MM-dd'),
        dueDate: '',
        lineItems: [],
        discount: 0,
        discountType: 'percentage',
        taxRate: 15,
        currency: 'R',
        notes: '',
        terms: '',
        paymentTerms: '50% deposit payable before work can commence.',
      });
      setActiveTab('edit');
    }
  }, [isOpen, clients, businessProfile]);

  useEffect(() => {
    const sub = formData.lineItems.reduce((sum, item) => sum + item.total, 0);
    const discountAmount =
      formData.discountType === 'percentage'
        ? (sub * formData.discount) / 100
        : formData.discount;
    const afterDiscount = sub - discountAmount;
    const tax = (afterDiscount * formData.taxRate) / 100;
    const tot = afterDiscount + tax;

    setSubtotal(sub);
    setTaxAmount(tax);
    setTotal(tot);
  }, [formData.lineItems, formData.discount, formData.discountType, formData.taxRate]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
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
      lineItems: [...formData.lineItems, newItem],
    });
  };

  const handleUpdateLineItem = (id: string, field: keyof LineItem, value: any) => {
    const updatedItems = formData.lineItems.map((item) => {
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
      lineItems: formData.lineItems.filter((item) => item.id !== id),
    });
  };

  const handleDownloadPDF = async () => {
    const selectedClient = clients.find((c) => c.id === formData.clientId);
    if (!selectedClient || formData.lineItems.length === 0) {
      alert('Please select a client and add at least one line item');
      return;
    }

    const documentNumber =
      type === 'invoice'
        ? getNextInvoiceNumber()
        : `QUO${Date.now().toString().slice(-7)}`;

    const tempDoc: Document = {
      id: generateId(),
      type,
      status: 'draft',
      documentNumber,
      reference: formData.reference,
      salesRep: formData.salesRep,
      clientId: formData.clientId,
      client: selectedClient,
      businessProfile: businessProfile!,
      lineItems: formData.lineItems,
      subtotal,
      taxRate: formData.taxRate,
      taxAmount,
      discount: formData.discount,
      discountType: formData.discountType,
      total,
      currency: formData.currency,
      notes: formData.notes,
      terms: formData.terms,
      paymentTerms: formData.paymentTerms,
      dueDate: formData.dueDate,
      issueDate: formData.issueDate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      logo: logo || undefined, // Include the logo!
    };

    try {
      await generatePDF(tempDoc);
      onClose();
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const selectedClient = clients.find((c) => c.id === formData.clientId);
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Create {type === 'invoice' ? 'Invoice' : 'Quotation'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Fill in details and download your South African {type}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 px-6">
          <button
            onClick={() => setActiveTab('edit')}
            className={`flex items-center px-6 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'edit'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Edit3 className="h-5 w-5 mr-2" />
            Edit Details
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex items-center px-6 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'preview'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Eye className="h-5 w-5 mr-2" />
            Preview
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'edit' ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Form */}
              <div className="lg:col-span-2 space-y-6">
                {/* Logo Upload */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Logo (Optional)
                  </label>
                  <div className="flex items-center space-x-4">
                    {logo && (
                      <img src={logo} alt="Logo" className="h-16 w-16 object-contain border border-gray-300 rounded bg-white p-1" />
                    )}
                    <label className="flex items-center px-4 py-2 bg-white border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                      <Upload className="h-5 w-5 mr-2" />
                      <span className="text-sm font-medium">Upload Logo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </label>
                    {logo && (
                      <button
                        onClick={() => setLogo(null)}
                        className="text-sm text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>

                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Client *
                    </label>
                    <select
                      value={formData.clientId}
                      onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
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

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reference
                    </label>
                    <input
                      type="text"
                      value={formData.reference}
                      onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      placeholder="e.g., 16M LONG X 0.4 HIGH DOUBLE BRICK WALL"
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      placeholder="LERATO KHUNOANA"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Currency
                    </label>
                    <select
                      value={formData.currency}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    >
                      {CURRENCIES.map((currency) => (
                        <option key={currency.code} value={currency.symbol}>
                          {currency.symbol} - {currency.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Issue Date *
                    </label>
                    <input
                      type="date"
                      value={formData.issueDate}
                      onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                {/* Line Items */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Line Items</h3>
                    <button
                      onClick={handleAddLineItem}
                      type="button"
                      className="flex items-center px-3 py-2 bg-primary-100 border-2 border-primary-300 text-gray-900 rounded-lg hover:bg-primary-200 text-sm font-bold"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Item
                    </button>
                  </div>

                  <div className="space-y-3">
                    {formData.lineItems.map((item) => (
                      <div key={item.id} className="grid grid-cols-12 gap-2 items-center p-3 bg-gray-50 rounded-lg">
                        <div className="col-span-5">
                          <input
                            type="text"
                            placeholder="Description"
                            value={item.description}
                            onChange={(e) => handleUpdateLineItem(item.id, 'description', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                        </div>
                        <div className="col-span-2">
                          <input
                            type="number"
                            placeholder="Qty"
                            value={item.quantity}
                            onChange={(e) => handleUpdateLineItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                        </div>
                        <div className="col-span-2">
                          <input
                            type="number"
                            placeholder="Price"
                            value={item.unitPrice}
                            onChange={(e) => handleUpdateLineItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                        </div>
                        <div className="col-span-2 text-sm font-medium text-gray-900">
                          {formData.currency}{item.total.toFixed(2)}
                        </div>
                        <div className="col-span-1">
                          <button
                            type="button"
                            onClick={() => handleDeleteLineItem(item.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {formData.lineItems.length === 0 && (
                      <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                        <p>No items yet. Click "Add Item" to get started.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g., Quoted brick is standard clay brick."
                  />
                </div>

                {/* Payment Terms */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Terms
                  </label>
                  <textarea
                    value={formData.paymentTerms}
                    onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              {/* Summary Sidebar */}
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Discount
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        min="0"
                        value={formData.discount}
                        onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      <select
                        value={formData.discountType}
                        onChange={(e) => setFormData({ ...formData, discountType: e.target.value as any })}
                        className="px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="percentage">%</option>
                        <option value="fixed">{formData.currency}</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      VAT Rate (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.taxRate}
                      onChange={(e) => setFormData({ ...formData, taxRate: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div className="pt-4 mt-4 border-t border-gray-200 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">{formData.currency}{subtotal.toFixed(2)}</span>
                    </div>
                    {formData.discount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Discount</span>
                        <span className="font-medium text-red-600">
                          -{formData.currency}
                          {(formData.discountType === 'percentage'
                            ? (subtotal * formData.discount) / 100
                            : formData.discount
                          ).toFixed(2)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">VAT ({formData.taxRate}%)</span>
                      <span className="font-medium">{formData.currency}{taxAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between pt-3 border-t border-gray-200">
                      <span className="font-semibold text-gray-900">Total</span>
                      <span className="text-xl font-bold text-primary-600">
                        {formData.currency}{total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border-2 border-gray-300 rounded-lg p-8 shadow-inner">
              <div className="max-w-4xl mx-auto bg-white p-8 shadow-lg">
                {/* Preview Header */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    {logo && (
                      <img src={logo} alt="Logo" className="h-16 mb-4" />
                    )}
                    <h1 className="text-3xl font-bold mb-4">{type === 'invoice' ? 'INVOICE' : 'QUOTE'}</h1>
                    <div className="text-sm space-y-1">
                      <div className="flex">
                        <span className="font-bold w-28">NUMBER:</span>
                        <span>{type === 'invoice' ? getNextInvoiceNumber() : `QUO${Date.now().toString().slice(-7)}`}</span>
                      </div>
                      {formData.reference && (
                        <div className="flex">
                          <span className="font-bold w-28">REFERENCE:</span>
                          <span className="flex-1">{formData.reference}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-right space-y-1">
                    <div><span className="font-bold">DATE:</span> {format(new Date(formData.issueDate), 'dd/MM/yyyy')}</div>
                    {formData.dueDate && (
                      <div><span className="font-bold">DUE DATE:</span> {format(new Date(formData.dueDate), 'dd/MM/yyyy')}</div>
                    )}
                    {formData.salesRep && (
                      <div><span className="font-bold">SALES REP:</span> {formData.salesRep.toUpperCase()}</div>
                    )}
                    <div><span className="font-bold">DISCOUNT %:</span> {formData.discountType === 'percentage' ? formData.discount : 0}%</div>
                  </div>
                </div>

                {/* FROM TO Section */}
                <div className="border-y-2 border-gray-900 py-3 mb-6">
                  <div className="grid grid-cols-2 gap-6 text-sm">
                    <div>
                      <p className="font-bold mb-2">FROM</p>
                      <p className="font-bold">{businessProfile?.companyName.toUpperCase()}</p>
                      {businessProfile?.vatNumber && <p>VAT NO: {businessProfile.vatNumber}</p>}
                      <p className="mt-2 text-gray-700">{businessProfile?.address}</p>
                      <p className="text-gray-700">{businessProfile?.city}, {businessProfile?.state} {businessProfile?.zipCode}</p>
                    </div>
                    <div>
                      <p className="font-bold mb-2">TO</p>
                      {selectedClient && (
                        <>
                          <p className="font-bold">{(selectedClient.company || selectedClient.name).toUpperCase()}</p>
                          {selectedClient.vatNumber && <p>CUSTOMER VAT NO: {selectedClient.vatNumber}</p>}
                          <p className="mt-2 text-gray-700">{selectedClient.address}</p>
                          <p className="text-gray-700">{selectedClient.city}, {selectedClient.state} {selectedClient.zipCode}</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Line Items Table */}
                <table className="w-full mb-6 text-xs border border-gray-900">
                  <thead className="bg-white border-b-2 border-gray-900">
                    <tr>
                      <th className="text-left p-2 border-r border-gray-900">Description</th>
                      <th className="text-center p-2 border-r border-gray-900">Quantity</th>
                      <th className="text-right p-2 border-r border-gray-900">Excl. Price</th>
                      <th className="text-center p-2 border-r border-gray-900">VAT %</th>
                      <th className="text-right p-2">Incl. Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.lineItems.map((item, index) => {
                      const inclTotal = item.total * (1 + formData.taxRate / 100);
                      return (
                        <tr key={item.id} className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} border-b border-gray-900`}>
                          <td className="p-2 border-r border-gray-900">{item.description}</td>
                          <td className="text-center p-2 border-r border-gray-900">{item.quantity}</td>
                          <td className="text-right p-2 border-r border-gray-900">{formData.currency}{item.unitPrice.toFixed(2)}</td>
                          <td className="text-center p-2 border-r border-gray-900">{formData.taxRate}%</td>
                          <td className="text-right p-2 font-semibold">{formData.currency}{inclTotal.toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Notes */}
                {formData.notes && (
                  <div className="mb-4 text-sm">
                    <p className="font-bold">Note:</p>
                    <p className="text-gray-700">{formData.notes}</p>
                  </div>
                )}

                {/* Totals Box */}
                <div className="flex justify-end mb-6">
                  <div className="w-72 border-2 border-gray-900 p-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-bold">Total Discount:</span>
                        <span>{formData.currency}{(formData.discountType === 'percentage' ? (subtotal * formData.discount) / 100 : formData.discount).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-bold">Total Exclusive:</span>
                        <span>{formData.currency}{subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-bold">Total VAT:</span>
                        <span>{formData.currency}{taxAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between border-t border-gray-400 pt-2">
                        <span className="font-bold">Grand Total:</span>
                        <span className="font-bold">{formData.currency}{total.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between border-t-2 border-gray-900 pt-2 mt-2">
                        <span className="font-bold text-base">BALANCE DUE</span>
                        <span className="font-bold text-base">{formData.currency}{total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Terms */}
                {formData.paymentTerms && (
                  <div className="mb-4 text-sm">
                    <p className="font-bold">PAYMENT TERMS:</p>
                    <p className="text-gray-700">{formData.paymentTerms}</p>
                  </div>
                )}

                {/* Banking Details */}
                {businessProfile?.bankName && (
                  <div className="border-t border-gray-300 pt-4 text-sm">
                    <p className="font-bold mb-2">Banking Details</p>
                    <div className="space-y-1">
                      <p>Name: {businessProfile.companyName}</p>
                      <p>Bank Name: {businessProfile.bankName}</p>
                      {businessProfile.accountNumber && <p>Account Number: {businessProfile.accountNumber}</p>}
                      {businessProfile.branchCode && <p>Branch Code: {businessProfile.branchCode}</p>}
                      {businessProfile.swiftCode && <p>Swift Code: {businessProfile.swiftCode}</p>}
                      {businessProfile.accountType && <p>Account Type: {businessProfile.accountType}</p>}
                    </div>
                    {businessProfile.companyRegistration && (
                      <p className="mt-2">Company Registration Number: {businessProfile.companyRegistration}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            {formData.lineItems.length} item(s) • Total: {formData.currency}{total.toFixed(2)}
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-bold"
            >
              Cancel
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={!selectedClient || formData.lineItems.length === 0}
              className="flex items-center px-6 py-2 bg-primary-100 border-2 border-primary-300 text-gray-900 rounded-lg hover:bg-primary-200 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="h-5 w-5 mr-2" />
              Download PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
