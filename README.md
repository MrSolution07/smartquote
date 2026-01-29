# SmartQuote - AI-Powered Invoicing & Quotations

> Professional invoicing and quotation tool with AI-powered pricing recommendations for South African businesses and beyond.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://reactjs.org/)

## ✨ Features

### 🤖 **AI-Powered Pricing** (Pre-configured!)
- **Works out of the box** - No API key setup required
- Intelligent pricing recommendations using Groq's Llama 3
- Detailed cost breakdowns by role
- Market insights and industry benchmarks
- Confidence scoring for recommendations
- Automatic fallback to algorithmic pricing

### 📋 **Professional Document Creation**
- **Modal-based workflow** with Edit & Preview tabs
- **South African format** with VAT compliance
- Logo upload support
- Client auto-population from your database
- Real-time calculations
- One-click PDF download
- Support for both Invoices and Quotations

### 💼 **Complete Business Management**
- Business Profile management
- Client database
- Rate presets for different roles
- Document history and tracking
- Multi-currency support (30+ currencies, defaults to ZAR)

### 🔒 **100% Privacy-Focused**
- No server required - runs entirely in your browser
- Data stored locally (localStorage)
- No user accounts or registration
- No tracking or analytics
- AI uses text-only project details (no personal data)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ or Bun
- Modern web browser

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/smartquote.git
cd smartquote

# Install dependencies
npm install
# or
bun install

# Start development server
npm run dev
# or
bun dev
```

The app will open at `http://localhost:5173` (or another port if 5173 is in use).

---

## 🎯 Getting Started

### 1. **Set Up Your Business Profile**
- Click "Business Profile" in the sidebar
- Fill in your company details
- Add banking information (for invoices)
- Upload logo (optional)

### 2. **Add Clients**
- Go to "Clients" page
- Click "Add Client"
- Enter client details (name, address, VAT number, etc.)

### 3. **Try AI Pricing** 🤖
- Navigate to "AI Pricing Assistant" (2nd in menu)
- Fill in project details:
  - Client category
  - Project size & complexity
  - Duration & team size
  - Required roles
- Click "Generate Pricing"
- Get instant AI recommendations!

### 4. **Create Your First Document** 📄
- Go to "Documents" page
- Click "New Invoice" or "New Quotation"
- A modal will open with:
  - **Edit Details tab**: Fill in all information
  - **Preview tab**: See exactly how it will look
- Upload logo (optional)
- Select client (details auto-populate!)
- Add line items
- Adjust discount & VAT
- Click "Download PDF" 🎉

---

## 🛠️ Tech Stack

- **React 19** - Latest React with modern features
- **TypeScript** - Type-safe development
- **TanStack Router** - Type-safe routing
- **TanStack Query** - Server state management
- **Zustand** - Lightweight state management
- **Tailwind CSS** - Utility-first styling
- **jsPDF** - Client-side PDF generation
- **Groq API** - AI-powered pricing (Llama 3 model)
- **Vite** - Fast build tool

---

## 📁 Project Structure

```
smartquote/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── Layout.tsx     # Main app layout & navigation
│   │   └── DocumentModal.tsx  # Document creation modal
│   ├── pages/             # Page components
│   │   ├── Dashboard.tsx
│   │   ├── PricingAssistantPage.tsx  # AI pricing
│   │   ├── DocumentsPage.tsx
│   │   ├── ContactPage.tsx
│   │   └── ...
│   ├── routes/            # TanStack Router routes
│   ├── services/          # Business logic
│   │   ├── aiService.ts   # AI API integration
│   │   ├── aiPricing.ts   # Pricing algorithms
│   │   └── pdfGenerator.ts  # PDF generation
│   ├── store/             # Zustand state management
│   ├── types/             # TypeScript definitions
│   └── utils/             # Utility functions
├── .env                   # Environment variables (not in git)
├── .env.example           # Environment template
└── package.json
```

---

## 🔐 Environment Variables

The app comes with a pre-configured Groq API key in `.env`:

```bash
VITE_GROQ_API_KEY=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
VITE_AI_PROVIDER=groq
```

### Want to use your own API key?

1. Get a free key from [Groq Console](https://console.groq.com)
2. Update `.env` with your key
3. Restart the dev server

**Supported providers:**
- Groq (recommended, free)
- HuggingFace
- Together AI
- OpenRouter

---

## 📋 Features In Detail

### AI Pricing Assistant
- **Automatic Analysis**: Analyzes project complexity, team composition, duration
- **Smart Recommendations**: Suggests competitive pricing with profit margins
- **Cost Breakdown**: Detailed hourly rates and totals per role
- **Market Insights**: Industry benchmarks and trends
- **Confidence Score**: Shows how reliable the recommendation is
- **Fallback**: Works even if AI is unavailable (algorithmic mode)

### Document Modal
- **Two-Tab Interface**:
  - **Edit Details**: All form fields in one view
  - **Preview**: See document before downloading
- **Features**:
  - Logo upload
  - Client selection (auto-populates VAT, address)
  - Reference field
  - Sales rep
  - Currency selector (30+ currencies)
  - Line items with auto-calculation
  - Discount (% or fixed amount)
  - VAT rate (defaults to 15%)
  - Notes & payment terms
  - Live totals

### South African PDF Format
- Company & client details with VAT numbers
- Physical & postal addresses
- Sales representative
- Line items table with VAT breakdown
- Total Exclusive, Total VAT, Grand Total
- Balance Due
- Banking details
- Company registration number
- Payment terms

---

## 🗂️ Navigation

1. **Dashboard** - Overview & quick stats
2. **AI Pricing Assistant** - Generate AI-powered quotes ⭐
3. **Business Profile** - Your company details
4. **Clients** - Client database
5. **Rate Presets** - Hourly rates by role
6. **Documents** - Invoices & quotations
7. **Contact Us** - Support & info

---

## 🔒 Privacy & Data

### How Your Data is Stored
- **Local Storage Only**: All data stays in your browser
- **No Cloud Sync**: Nothing sent to external servers (except AI API for pricing)
- **No Accounts**: No sign-up, no passwords, no tracking
- **Clear & Gone**: Clear browser data = all data deleted

### What Gets Sent to AI?
Only project details for pricing analysis:
- Client category (e.g., "small business")
- Project size, complexity, duration
- Team size and required roles
- Project description (optional)

**NOT sent:**
- Client names, addresses, contact info
- Business details
- Financial data
- Any personal information

---

## 🚢 Deployment

### Build for Production

```bash
npm run build
# or
bun run build
```

Output in `dist/` folder. Deploy to:
- **Vercel**: Zero config deployment
- **Netlify**: Drag & drop `dist` folder
- **GitHub Pages**: Static hosting
- **Your own server**: Serve `dist` folder

### Environment Variables for Production

If deploying, add these variables to your hosting platform:

```
VITE_GROQ_API_KEY=your_api_key_here
VITE_AI_PROVIDER=groq
```

---

## 📚 Documentation

- `UPDATES.md` - Latest changes and features
- `AI_SETUP_GUIDE.md` - How to get AI API keys
- `SA_FORMAT_CHANGES.md` - South African format details
- `IMPLEMENTATION_SUMMARY.md` - Technical implementation notes

---

## 🆘 Support

### Need Help?
- Visit the **Contact Us** page in the app
- Check the FAQ section
- Email: support@smartquote.com
- GitHub Issues: [Report a bug](https://github.com/yourusername/smartquote/issues)

### Common Questions

**Q: Is it really free?**
A: Yes! 100% free, no hidden costs, no premium plans.

**Q: Where is my data?**
A: In your browser's localStorage. Clear browser data = data deleted.

**Q: How does AI pricing work?**
A: Uses Groq's free API with Llama 3 model to analyze your project and suggest competitive pricing.

**Q: Can I use this for my business?**
A: Absolutely! It's designed for freelancers, small businesses, and entrepreneurs.

**Q: Do I need to configure AI?**
A: Nope! It's pre-configured and works immediately.

---

## 📜 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Groq](https://groq.com) - For free AI API access
- [TanStack](https://tanstack.com) - For amazing React libraries
- [Tailwind CSS](https://tailwindcss.com) - For beautiful styling
- South African business community - For format requirements

---

## 🌟 Star This Project

If you find SmartQuote useful, please ⭐ star this repository!

---

**Made with ❤️ for small businesses worldwide** 🌍
