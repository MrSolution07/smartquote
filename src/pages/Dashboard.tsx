import { useMemo } from 'react';
import { Link } from '@tanstack/react-router';
import { 
  FileText, 
  Users, 
  Plus,
  Sparkles 
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { format } from 'date-fns';

export default function Dashboard() {
  const { documents, clients, businessProfile } = useStore();

  const stats = useMemo(() => {
    const totalRevenue = documents
      .filter((d) => d.type === 'invoice' && d.status === 'paid')
      .reduce((sum, d) => sum + d.total, 0);

    const pendingAmount = documents
      .filter((d) => d.type === 'invoice' && d.status === 'sent')
      .reduce((sum, d) => sum + d.total, 0);

    const recentDocs = documents
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    return {
      totalRevenue,
      pendingAmount,
      totalInvoices: documents.filter((d) => d.type === 'invoice').length,
      totalQuotations: documents.filter((d) => d.type === 'quotation').length,
      totalClients: clients.length,
      recentDocs,
    };
  }, [documents, clients]);

  const statCards = [
    // {
    //   name: 'Total Revenue',
    //   value: `${businessProfile?.defaultCurrency || '$'}${stats.totalRevenue.toFixed(2)}`,
    //   icon: DollarSign,
    //   color: 'bg-green-500',
    // },
    // {
    //   name: 'Pending Amount',
    //   value: `${businessProfile?.defaultCurrency || '$'}${stats.pendingAmount.toFixed(2)}`,
    //   icon: TrendingUp,
    //   color: 'bg-yellow-500',
    // },
    {
      name: 'Total Clients',
      value: stats.totalClients,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      name: 'Total Documents',
      value: documents.length,
      icon: FileText,
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome back! Here's an overview of your business.
        </p>
      </div>

      {/* Quick Actions */}
      {!businessProfile && (
        <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <Sparkles className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-blue-900">
                Complete your business profile
              </h3>
              <p className="mt-2 text-sm text-blue-700">
                Set up your business information to start generating professional invoices and quotations.
              </p>
              <div className="mt-4">
                <Link
                  to="/business-profile"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Set Up Profile
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions Buttons */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/pricing-assistant"
          className="flex items-center justify-center px-6 py-4 bg-primary-100 border-2 border-primary-300 text-gray-900 rounded-lg hover:bg-primary-200 transition-all shadow-md hover:shadow-lg"
        >
          <Sparkles className="h-5 w-5 mr-2" />
          <span className="font-bold">AI Pricing Assistant</span>
        </Link>
        <Link
          to="/documents"
          search={{ create: 'invoice' }}
          className="flex items-center justify-center px-6 py-4 bg-white border-2 border-gray-300 text-gray-900 rounded-lg hover:border-primary-500 hover:bg-gray-50 transition-all"
        >
          <Plus className="h-5 w-5 mr-2" />
          <span className="font-bold">Create Invoice</span>
        </Link>
        <Link
          to="/documents"
          search={{ create: 'quotation' }}
          className="flex items-center justify-center px-6 py-4 bg-white border-2 border-gray-300 text-gray-900 rounded-lg hover:border-primary-500 hover:bg-gray-50 transition-all"
        >
          <Plus className="h-5 w-5 mr-2" />
          <span className="font-bold">Create Quotation</span>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center">
                <div className={`${stat.color} rounded-lg p-3`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Documents */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Documents</h2>
            <Link
              to="/documents"
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              View all
            </Link>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {stats.recentDocs.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No documents yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating your first invoice or quotation.
              </p>
            </div>
          ) : (
            stats.recentDocs.map((doc) => (
              <Link
                key={doc.id}
                to="/documents/$documentId"
                params={{ documentId: doc.id }}
                className="px-6 py-4 hover:bg-gray-50 flex items-center justify-between transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className={`
                    px-3 py-1 rounded-full text-xs font-medium
                    ${doc.type === 'invoice' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}
                  `}>
                    {doc.type}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {doc.documentNumber}
                    </p>
                    <p className="text-sm text-gray-500">{doc.client.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {doc.currency}{doc.total.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(doc.createdAt), 'MMM dd, yyyy')}
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
