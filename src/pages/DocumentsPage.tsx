import { useMemo, useEffect } from 'react';
import { Link, useNavigate, useSearch } from '@tanstack/react-router';
import { FileText, Plus, Eye, Download } from 'lucide-react';
import { format } from 'date-fns';
import { useStore } from '../store/useStore';
import { generatePDF } from '../services/pdfGenerator';
import type { Document, DocumentType } from '../types';

export default function DocumentsPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: '/documents' }) as { create?: string };
  const { documents, businessProfile, clients } = useStore();

  // Handle create action from URL search params
  useEffect(() => {
    if (search?.create) {
      handleCreateNew(search.create as DocumentType);
    }
  }, [search?.create]);

  const handleCreateNew = (type: DocumentType) => {
    if (!businessProfile) {
      alert('Please set up your business profile first');
      navigate({ to: '/business-profile' });
      return;
    }

    if (clients.length === 0) {
      alert('Please add at least one client first');
      navigate({ to: '/clients' });
      return;
    }

    // Create a new document ID and navigate to the editor
    const newId = 'new-' + type;
    navigate({ to: `/documents/${newId}` });
  };

  const handleExportPDF = async (doc: Document) => {
    try {
      await generatePDF(doc);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const groupedDocs = useMemo(() => {
    const invoices = documents.filter((d) => d.type === 'invoice');
    const quotations = documents.filter((d) => d.type === 'quotation');
    return { invoices, quotations };
  }, [documents]);

  const statusColors = {
    draft: 'bg-gray-100 text-gray-700',
    sent: 'bg-blue-100 text-blue-700',
    paid: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  const DocumentCard = ({ doc }: { doc: Document }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{doc.documentNumber}</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[doc.status]}`}>
              {doc.status}
            </span>
          </div>
          <p className="text-sm text-gray-600">{doc.client.name}</p>
          {doc.client.company && (
            <p className="text-xs text-gray-500">{doc.client.company}</p>
          )}
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-gray-900">
            {doc.currency}{doc.total.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Issue Date:</span>
          <span className="text-gray-900">{format(new Date(doc.issueDate), 'MMM dd, yyyy')}</span>
        </div>
        {doc.dueDate && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Due Date:</span>
            <span className="text-gray-900">{format(new Date(doc.dueDate), 'MMM dd, yyyy')}</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Items:</span>
          <span className="text-gray-900">{doc.lineItems.length}</span>
        </div>
      </div>

      <div className="flex items-center space-x-2 pt-4 border-t border-gray-200">
        <Link
          to={`/documents/${doc.id}`}
          className="flex-1 flex items-center justify-center px-4 py-2 bg-primary-100 border-2 border-primary-300 text-gray-900 rounded-lg hover:bg-primary-200 transition-colors font-bold"
        >
          <Eye className="h-4 w-4 mr-2" />
          View/Edit
        </Link>
        <button
          onClick={() => handleExportPDF(doc)}
          className="flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <Download className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FileText className="h-8 w-8 text-primary-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Documents</h1>
              <p className="mt-1 text-gray-600">
                Manage your invoices and quotations
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => handleCreateNew('quotation')}
              className="flex items-center px-4 py-2 bg-white border-2 border-gray-300 text-gray-900 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all font-bold"
            >
              <Plus className="h-5 w-5 mr-2" />
              New Quotation
            </button>
            <button
              onClick={() => handleCreateNew('invoice')}
              className="flex items-center px-4 py-2 bg-primary-100 border-2 border-primary-300 text-gray-900 rounded-lg hover:bg-primary-200 transition-colors shadow-sm font-bold"
            >
              <Plus className="h-5 w-5 mr-2" />
              New Invoice
            </button>
          </div>
        </div>
      </div>

      {documents.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <FileText className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No documents yet</h3>
          <p className="text-gray-600 mb-6">
            Get started by creating your first invoice or quotation.
          </p>
          <div className="flex items-center justify-center space-x-3">
            <button
              onClick={() => handleCreateNew('quotation')}
              className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-900 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all font-bold"
            >
              Create Quotation
            </button>
            <button
              onClick={() => handleCreateNew('invoice')}
              className="px-6 py-3 bg-primary-100 border-2 border-primary-300 text-gray-900 rounded-lg hover:bg-primary-200 transition-colors font-bold"
            >
              Create Invoice
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Invoices */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Invoices ({groupedDocs.invoices.length})
              </h2>
            </div>
            {groupedDocs.invoices.length === 0 ? (
              <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
                <p className="text-gray-600">No invoices yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groupedDocs.invoices.map((doc) => (
                  <DocumentCard key={doc.id} doc={doc} />
                ))}
              </div>
            )}
          </div>

          {/* Quotations */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Quotations ({groupedDocs.quotations.length})
              </h2>
            </div>
            {groupedDocs.quotations.length === 0 ? (
              <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
                <p className="text-gray-600">No quotations yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groupedDocs.quotations.map((doc) => (
                  <DocumentCard key={doc.id} doc={doc} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
