import { Mail, MessageSquare, Github, Globe } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <MessageSquare className="h-8 w-8 text-primary-600" />
            <h1 className="text-3xl font-bold text-gray-900">Contact Us</h1>
          </div>
          <p className="text-gray-600">
            Have questions or need help? We'd love to hear from you!
          </p>
        </div>

        {/* Contact Options */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Email */}
          <div className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-primary-300 transition-colors">
            <div className="flex items-start space-x-4">
              <div className="bg-primary-100 rounded-lg p-3">
                <Mail className="h-6 w-6 text-primary-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Email Support</h3>
                <p className="text-gray-600 mb-3">
                  Send us an email and we'll get back to you as soon as possible.
                </p>
                <a
                  href="mailto:support@smartquote.com"
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  support@smartquote.com
                </a>
              </div>
            </div>
          </div>

          {/* GitHub */}
          <div className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-primary-300 transition-colors">
            <div className="flex items-start space-x-4">
              <div className="bg-gray-100 rounded-lg p-3">
                <Github className="h-6 w-6 text-gray-700" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">GitHub</h3>
                <p className="text-gray-600 mb-3">
                  Found a bug or have a feature request? Open an issue on GitHub.
                </p>
                <a
                  href="https://github.com/yourusername/smartquote"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  View on GitHub →
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="bg-gradient-to-br from-primary-50 to-blue-50 border-2 border-primary-200 rounded-lg p-8 mb-8">
          <div className="flex items-start space-x-4">
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <Globe className="h-6 w-6 text-primary-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-3">About SmartQuote</h3>
              <p className="text-gray-700 mb-3">
                SmartQuote is a free, open-source invoicing and quotation tool designed for small businesses,
                freelancers, and entrepreneurs in South Africa and worldwide.
              </p>
              <p className="text-gray-700">
                We use AI-powered pricing recommendations via Groq API to help you create competitive,
                professional quotes and invoices in minutes.
              </p>
            </div>
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">🔒 Your Privacy Matters</h3>
          <p className="text-gray-700 mb-2">
            SmartQuote is 100% client-side. All your data is stored locally in your browser's localStorage.
          </p>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>✅ No server uploads - your data never leaves your device</li>
            <li>✅ No user accounts - no registration required</li>
            <li>✅ No tracking - we don't collect any personal information</li>
            <li>✅ AI-powered pricing uses Groq API (text-only, no personal data sent)</li>
          </ul>
        </div>

        {/* FAQ Section */}
        <div className="mt-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h3>
          
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Is SmartQuote really free?</h4>
              <p className="text-gray-600">
                Yes! SmartQuote is completely free and open-source. No hidden fees, no premium plans.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Where is my data stored?</h4>
              <p className="text-gray-600">
                All data is stored locally in your browser (localStorage). Clear your browser data and it's gone.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">How does AI pricing work?</h4>
              <p className="text-gray-600">
                We use Groq's free API with Llama 3 model to analyze your project details and suggest competitive pricing based on industry standards.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Can I use this for my business?</h4>
              <p className="text-gray-600">
                Absolutely! SmartQuote is designed for freelancers, small businesses, and entrepreneurs worldwide.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
