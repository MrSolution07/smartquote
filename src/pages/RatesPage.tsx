import { useState } from 'react';
import { DollarSign, Plus, Pencil, Trash2, X } from 'lucide-react';
import { useStore } from '../store/useStore';
import type { RatePreset, RoleType } from '../types';

const generateId = () => crypto.randomUUID();

export default function RatesPage() {
  const { ratePresets, addRatePreset, updateRatePreset, deleteRatePreset } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [editingPreset, setEditingPreset] = useState<RatePreset | null>(null);
  const [formData, setFormData] = useState<Partial<RatePreset>>({
    name: '',
    role: 'developer',
    hourlyRate: 0,
    currency: 'USD',
    description: '',
  });

  const roleColors: Record<RoleType, string> = {
    developer: 'bg-blue-100 text-blue-700',
    designer: 'bg-purple-100 text-purple-700',
    manager: 'bg-green-100 text-green-700',
    consultant: 'bg-yellow-100 text-yellow-700',
    qa: 'bg-pink-100 text-pink-700',
    devops: 'bg-indigo-100 text-indigo-700',
    other: 'bg-gray-100 text-gray-700',
  };

  const handleEdit = (preset: RatePreset) => {
    setEditingPreset(preset);
    setFormData(preset);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this rate preset?')) {
      deleteRatePreset(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingPreset) {
      updateRatePreset(editingPreset.id, formData);
    } else {
      const newPreset: RatePreset = {
        id: generateId(),
        name: formData.name || '',
        role: formData.role || 'developer',
        hourlyRate: formData.hourlyRate || 0,
        currency: formData.currency || 'USD',
        description: formData.description,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      addRatePreset(newPreset);
    }

    resetForm();
  };

  const resetForm = () => {
    setShowModal(false);
    setEditingPreset(null);
    setFormData({
      name: '',
      role: 'developer',
      hourlyRate: 0,
      currency: 'USD',
      description: '',
    });
  };

  const groupedByRole = ratePresets.reduce((acc, preset) => {
    if (!acc[preset.role]) {
      acc[preset.role] = [];
    }
    acc[preset.role].push(preset);
    return acc;
  }, {} as Record<RoleType, RatePreset[]>);

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <DollarSign className="h-8 w-8 text-primary-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Rate Presets</h1>
              <p className="mt-1 text-gray-600">
                Manage your default hourly rates for different roles
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center px-4 py-2 bg-primary-100 border-2 border-primary-300 text-gray-900 rounded-lg hover:bg-primary-200 transition-colors shadow-sm font-bold"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Rate Preset
          </button>
        </div>
      </div>

      {/* Rate Cards */}
      <div className="space-y-6">
        {Object.entries(groupedByRole).map(([role, presets]) => (
          <div key={role} className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${roleColors[role as RoleType]}`}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </span>
                <span className="ml-3 text-sm text-gray-500">
                  {presets.length} preset{presets.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {presets.map((preset) => (
                <div
                  key={preset.id}
                  className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900">{preset.name}</h3>
                    {preset.description && (
                      <p className="mt-1 text-sm text-gray-500">{preset.description}</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        ${preset.hourlyRate.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">per hour</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(preset)}
                        className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(preset.id)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-lg">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingPreset ? 'Edit Rate Preset' : 'Add Rate Preset'}
              </h2>
              <button
                onClick={resetForm}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preset Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Senior Developer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role *
                </label>
                <select
                  required
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as RoleType })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="developer">Developer</option>
                  <option value="designer">Designer</option>
                  <option value="manager">Manager</option>
                  <option value="consultant">Consultant</option>
                  <option value="qa">QA/Testing</option>
                  <option value="devops">DevOps</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hourly Rate *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    $
                  </span>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.hourlyRate}
                    onChange={(e) => setFormData({ ...formData, hourlyRate: parseFloat(e.target.value) })}
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="100.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency *
                </label>
                <input
                  type="text"
                  required
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="USD"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Brief description of this rate preset..."
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-100 border-2 border-primary-300 text-gray-900 rounded-lg hover:bg-primary-200 transition-colors font-bold"
                >
                  {editingPreset ? 'Update' : 'Add'} Preset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
