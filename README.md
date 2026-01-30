# SmartQuote - AI-Powered Invoicing & Quotations

> Professional invoicing and quotation tool with AI-powered pricing recommendations for South African businesses and beyond.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://reactjs.org/)

## ✨ Features

## 🎯 **Main Feature: AI-to-Document Conversion**

The core workflow of SmartQuote is simple yet powerful:

1. **Get AI Recommendations** - The AI analyzes your project details and generates intelligent pricing suggestions with detailed breakdowns
2. **Convert to Document** - Click the conversion button to instantly transform AI feedback into a professional invoice or quotation
3. **Customize Before Download** - Modify line items, adjust rates, add discounts, update fields, or change any details to match your needs
4. **Download PDF** - Generate a professional, South African VAT-compliant document ready to send to your client

**This seamless flow means you can leverage AI insights but maintain full control over the final output.**

---

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
git clone https://github.com/MrSolution07/smartquote.git
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

### 💡 How It Works (The Main Flow)

```
AI Pricing Assistant → Generate Recommendations → Click Convert Button → 
Edit & Customize Document → Download Professional PDF
```

**Key Point**: The conversion button is the bridge between AI insights and your final business documents. You get AI-powered pricing intelligence, then full control to modify anything before downloading.

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

### 3. **Use the AI-to-Document Workflow** 🤖➡️📄

**Step 1: Get AI Recommendations**
- Navigate to "AI Pricing Assistant"
- Fill in project details:
  - Client category
  - Project size & complexity
  - Duration & team size
  - Required roles
- Click "Generate Pricing"
- Review AI recommendations with detailed breakdowns

**Step 2: Convert to Document**
- Click the **"Convert to Invoice"** or **"Convert to Quotation"** button
- AI feedback automatically transforms into a structured document
- All pricing details populate the line items

**Step 3: Customize & Finalize**
- Modal opens with Edit & Preview tabs
- Modify any line items, rates, or quantities
- Adjust client details, discount, or VAT
- Add/remove items as needed
- Upload logo (optional)
- Preview the final document

**Step 4: Download**
- Click "Download PDF"
- Get your professional, VAT-compliant document 🎉

### 4. **Or Create Documents Manually** 📄
- Go to "Documents" page
- Click "New Invoice" or "New Quotation"
- Fill in details from scratch
- Download when ready

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

### AI-to-Document Conversion (Main Feature)
The heart of SmartQuote is the seamless conversion from AI recommendations to editable documents:

- **One-Click Conversion**: Transform AI pricing feedback into a structured invoice or quotation instantly
- **Intelligent Mapping**: Line items, rates, quantities, and descriptions automatically populate from AI analysis
- **Full Editability**: Every field can be modified - nothing is locked after conversion
- **Preserve or Customize**: Keep AI suggestions as-is or adjust to your specific needs
- **Quality Control**: Review and refine before sending to clients
- **Professional Output**: Generate VAT-compliant PDFs ready for business use

This feature bridges the gap between AI assistance and real-world business documents, giving you the best of both worlds: intelligent automation with human oversight.

### AI Pricing Assistant
- **Automatic Analysis**: Analyzes project complexity, team composition, duration
- **Smart Recommendations**: Suggests competitive pricing with profit margins
- **Cost Breakdown**: Detailed hourly rates and totals per role
- **Market Insights**: Industry benchmarks and trends
- **Confidence Score**: Shows how reliable the recommendation is
- **Fallback**: Works even if AI is unavailable (algorithmic mode)
- **Convert Button**: Instantly turn recommendations into editable documents

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
2. **AI Pricing Assistant** - Generate AI quotes → Convert to documents ⭐ (Main Feature)
3. **Business Profile** - Your company details
4. **Clients** - Client database
5. **Rate Presets** - Hourly rates by role
6. **Documents** - View, create, and manage invoices & quotations
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
- GitHub Issues: [Report a bug](https://github.com/MrSolution07/smartquote/issues)

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
