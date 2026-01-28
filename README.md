# SmartQuote - AI-Powered Quotation & Invoice Generator

A modern web application built with the TanStack ecosystem that helps businesses generate professional quotations and invoices with AI-powered pricing intelligence.

## Features

### Core Functionality
- **Business Profile Management** - Set up company information, branding, and banking details
- **Client Management** - Organize and categorize your customer database
- **AI Pricing Assistant** - Get intelligent pricing recommendations based on project complexity, client type, and market rates
- **Custom Rate Presets** - Create and manage reusable rate templates for different roles
- **Document Generation** - Create professional invoices and quotations
- **PDF Export** - Download documents as beautifully formatted PDFs
- **Team Compensation Calculator** - Estimate internal cost allocation and team member contributions

### Technology Stack
- **React 19** - Modern UI library
- **TanStack Router** - Type-safe routing
- **TanStack Query** - Powerful data fetching and caching
- **TanStack Table** - Flexible table component for data management
- **Tailwind CSS** - Utility-first styling
- **Zustand** - Lightweight state management with persistence
- **jsPDF** - PDF generation
- **TypeScript** - Type safety throughout

## Getting Started

### Prerequisites
- Node.js 22.11.0 or higher
- npm 10.9.0 or higher

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Usage Guide

### First-Time Setup

1. **Set Up Business Profile**
   - Navigate to "Business Profile" in the sidebar
   - Fill in your company information, address, and banking details
   - Configure your default currency and invoice numbering format
   - Save your profile

2. **Add Clients**
   - Go to the "Clients" page
   - Click "Add Client" and enter customer information
   - Categorize clients (individual, small business, enterprise, or non-profit)
   - Save the client

3. **Configure Rate Presets (Optional)**
   - Visit the "Rate Presets" page
   - Add custom hourly rates for different roles
   - These will be used by the AI pricing assistant

### Creating Documents

#### Using AI Pricing Assistant

1. Navigate to "AI Pricing Assistant"
2. Fill in project details:
   - Client category
   - Project size and complexity
   - Estimated duration and team size
   - Required roles
3. Click "Generate Pricing"
4. Review the AI recommendations including:
   - Total suggested price
   - Cost breakdown by service
   - Team composition suggestions
   - Profit margin analysis
5. Use these insights when creating your invoice or quotation

#### Creating an Invoice or Quotation

1. Go to "Documents" and click "New Invoice" or "New Quotation"
2. Select a client from the dropdown
3. Add line items with descriptions, quantities, and prices
4. Configure discount and tax rate in the summary sidebar
5. Add notes and terms & conditions
6. Save the document or export it as PDF

### Managing Documents

- View all invoices and quotations on the Documents page
- Edit existing documents by clicking "View/Edit"
- Update document status (draft, sent, paid, cancelled)
- Export any document as a PDF for sharing with clients
- Delete documents if needed

## Data Persistence

All data is stored locally in your browser using localStorage. Your business profile, clients, rate presets, and documents are automatically saved and will persist across browser sessions.

**Note**: Data is stored per browser. If you clear your browser data or use a different browser, your data will not be available.

## AI Pricing Intelligence

The AI pricing assistant uses a sophisticated algorithm to recommend pricing based on:

- **Client Category**: Different pricing strategies for individuals, businesses, enterprises, and non-profits
- **Project Complexity**: Adjusts recommendations based on technical difficulty
- **Team Composition**: Suggests optimal role distribution and experience levels
- **Market Rates**: Uses industry-standard hourly rates as a baseline
- **Profit Margins**: Automatically calculates sustainable profit margins (30-50%)
- **Project Scale**: Considers project size multipliers

The AI provides:
- Total recommended price
- Detailed cost breakdown
- Team composition suggestions with hourly rates
- Contribution percentages for team members
- Reasoning behind the recommendations
- Confidence score

## Future Enhancements

Potential features for future development:
- Payment gateway integration
- Multi-currency support
- Accounting software export (QuickBooks, Xero)
- Analytics and reporting dashboard
- Multi-user team access
- Email integration for sending documents
- Subscription and recurring billing
- Cloud storage and sync
- Mobile app

## Contributing

This is a personal project, but suggestions and feedback are welcome!

## License

MIT License - Feel free to use this project for your business needs.

## Support

For issues or questions, please create an issue in the repository.

---

Built with ❤️ using the TanStack ecosystem
