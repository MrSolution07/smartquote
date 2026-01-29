import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Sparkles, TrendingUp, Users, Info, FileText } from 'lucide-react';
import { generatePricingRecommendation } from '../services/aiPricing';
import { useStore } from '../store/useStore';
import type { ProjectInput, RoleType } from '../types';

export default function PricingAssistantPage() {
  const { aiConfig } = useStore();
  const [projectInput, setProjectInput] = useState<ProjectInput>({
    clientCategory: 'small-business',
    projectSize: 'medium',
    complexity: 'medium',
    estimatedDuration: 4,
    teamSize: 3,
    roles: ['developer', 'designer'],
    description: '',
  });

  const [features, setFeatures] = useState<string[]>(['']);
  const [pricingModel, setPricingModel] = useState<'feature-based' | 'hourly'>('feature-based');
  const [showResults, setShowResults] = useState(false);

  // Debug AI configuration
  console.log('AI Config:', aiConfig);
  console.log('AI Enabled:', aiConfig?.enabled);
  console.log('API Key Present:', aiConfig?.apiKey ? 'Yes' : 'No');

  const { data: recommendation, isLoading, refetch } = useQuery({
    queryKey: ['pricing-recommendation', projectInput, aiConfig],
    queryFn: () => generatePricingRecommendation(projectInput, aiConfig),
    enabled: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowResults(true);
    refetch();
  };

  const handleRoleToggle = (role: RoleType) => {
    if (projectInput.roles.includes(role)) {
      setProjectInput({
        ...projectInput,
        roles: projectInput.roles.filter((r) => r !== role),
      });
    } else {
      setProjectInput({
        ...projectInput,
        roles: [...projectInput.roles, role],
      });
    }
  };

  const roleOptions: { value: RoleType; label: string }[] = [
    { value: 'developer', label: 'Developer' },
    { value: 'designer', label: 'Designer' },
    { value: 'manager', label: 'Project Manager' },
    { value: 'consultant', label: 'Consultant' },
    { value: 'qa', label: 'QA/Testing' },
    { value: 'devops', label: 'DevOps' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3">
          <Sparkles className="h-8 w-8 text-primary-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">AI Pricing Assistant</h1>
            <p className="mt-1 text-gray-600">
              Get intelligent pricing recommendations based on your project details
            </p>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <Info className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-900">
            <p>
              The AI assistant analyzes project complexity, team composition, client type, and market
              rates to suggest competitive pricing with appropriate profit margins.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Project Details</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client Category
              </label>
              <select
                value={projectInput.clientCategory}
                onChange={(e) =>
                  setProjectInput({ ...projectInput, clientCategory: e.target.value as any })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="individual">Individual</option>
                <option value="small-business">Small Business</option>
                <option value="enterprise">Enterprise</option>
                <option value="non-profit">Non-Profit</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Size
              </label>
              <select
                value={projectInput.projectSize}
                onChange={(e) =>
                  setProjectInput({ ...projectInput, projectSize: e.target.value as any })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Complexity Level
              </label>
              <select
                value={projectInput.complexity}
                onChange={(e) =>
                  setProjectInput({ ...projectInput, complexity: e.target.value as any })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estimated Duration (weeks)
              </label>
              <input
                type="number"
                min="1"
                value={projectInput.estimatedDuration}
                onChange={(e) =>
                  setProjectInput({ ...projectInput, estimatedDuration: parseInt(e.target.value) })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Team Size
              </label>
              <input
                type="number"
                min="1"
                value={projectInput.teamSize}
                onChange={(e) =>
                  setProjectInput({ ...projectInput, teamSize: parseInt(e.target.value) })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Required Roles
              </label>
              <div className="space-y-2">
                {roleOptions.map((role) => (
                  <label
                    key={role.value}
                    className="flex items-center space-x-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      checked={projectInput.roles.includes(role.value)}
                      onChange={() => handleRoleToggle(role.value)}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">{role.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Description (Optional)
              </label>
              <textarea
                value={projectInput.description}
                onChange={(e) =>
                  setProjectInput({ ...projectInput, description: e.target.value })
                }
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Briefly describe the project requirements..."
              />
            </div>

            <button
              type="submit"
              disabled={projectInput.roles.length === 0}
              className="w-full flex items-center justify-center px-6 py-3 bg-primary-100 border-2 border-primary-300 text-gray-900 rounded-lg hover:bg-primary-200 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed font-bold"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 mr-2" />
                  Generate Pricing
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {!showResults && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <Sparkles className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Ready to Get Pricing Recommendations
              </h3>
              <p className="text-gray-600">
                Fill out the project details and click "Generate Pricing" to receive AI-powered
                recommendations.
              </p>
            </div>
          )}

          {showResults && isLoading && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4" />
              <p className="text-gray-600">Analyzing project requirements...</p>
            </div>
          )}

          {showResults && !isLoading && recommendation && (
            <div className="space-y-6">
              {/* Total Price Card */}
              <div className="bg-primary-50 border-2 border-primary-300 rounded-lg shadow-lg p-6 text-gray-900">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-700 text-sm font-bold mb-1">
                      Recommended Total Price
                    </p>
                    <p className="text-4xl font-bold text-gray-900">
                      R{recommendation.totalPrice.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-primary-200 rounded-lg p-4">
                    <TrendingUp className="h-8 w-8 text-gray-900" />
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-sm font-bold">
                  <span>Profit Margin: {recommendation.profitMargin}%</span>
                  <span>Confidence: {recommendation.confidence}%</span>
                </div>
              </div>

              {/* Breakdown */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-primary-600" />
                    Cost Breakdown
                  </h3>
                </div>
                <div className="p-6 space-y-3">
                  {recommendation.breakdown.map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{item.description}</p>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">
                        R{item.total.toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Team Suggestions */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Users className="h-5 w-5 mr-2 text-primary-600" />
                    Team Composition
                  </h3>
                </div>
                <div className="p-6 space-y-4">
                  {recommendation.teamSuggestions.map((member) => (
                    <div key={member.id} className="flex items-center justify-between py-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 capitalize">
                          {member.level} {member.role}
                        </p>
                        <p className="text-xs text-gray-500">
                          {member.estimatedHours}h @ R{member.hourlyRate}/hr
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">
                          R{(member.estimatedHours * member.hourlyRate).toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {member.contributionPercentage}% contribution
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Reasoning */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Info className="h-5 w-5 mr-2 text-primary-600" />
                    AI Analysis
                  </h3>
                </div>
                <div className="p-6">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
                    {recommendation.reasoning}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
