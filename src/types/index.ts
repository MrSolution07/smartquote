export interface BusinessProfile {
  id: string;
  companyName: string;
  logo?: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  bankName?: string;
  accountNumber?: string;
  accountType?: string;
  routingNumber?: string;
  taxId?: string;
  vatNumber?: string;
  companyRegistration?: string;
  postalAddress?: string;
  physicalAddress?: string;
  salesRep?: string;
  defaultCurrency: string;
  invoicePrefix: string;
  invoiceNumberStart: number;
  createdAt: string;
  updatedAt: string;
}

export interface Currency {
  code: string;
  symbol: string;
  name: string;
}

export interface AIConfig {
  provider: 'groq' | 'huggingface' | 'together' | 'openrouter';
  apiKey: string;
  enabled: boolean;
}

export type ClientCategory = 'individual' | 'small-business' | 'enterprise' | 'non-profit';

export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  category: ClientCategory;
  notes?: string;
  vatNumber?: string;
  physicalAddress?: string;
  postalAddress?: string;
  createdAt: string;
  updatedAt: string;
}

export type RoleType = 'developer' | 'designer' | 'manager' | 'consultant' | 'qa' | 'devops' | 'other';

export interface RatePreset {
  id: string;
  name: string;
  role: RoleType;
  hourlyRate: number;
  currency: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  id: string;
  role: RoleType;
  estimatedHours: number;
  hourlyRate: number;
  contributionPercentage: number;
  level: 'junior' | 'mid' | 'senior' | 'lead';
}

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  taxRate?: number;
}

export interface AIRecommendation {
  totalPrice: number;
  breakdown: LineItem[];
  profitMargin: number;
  reasoning: string;
  teamSuggestions: TeamMember[];
  confidence: number;
}

export type DocumentType = 'quotation' | 'invoice';
export type DocumentStatus = 'draft' | 'sent' | 'paid' | 'cancelled';

export interface Document {
  id: string;
  type: DocumentType;
  status: DocumentStatus;
  documentNumber: string;
  reference?: string;
  salesRep?: string;
  clientId: string;
  client: Client;
  businessProfile: BusinessProfile;
  lineItems: LineItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discount: number;
  discountType: 'percentage' | 'fixed';
  total: number;
  currency: string;
  notes?: string;
  terms?: string;
  paymentTerms?: string;
  dueDate?: string;
  issueDate: string;
  aiRecommendation?: AIRecommendation;
  teamMembers?: TeamMember[];
  createdAt: string;
  updatedAt: string;
}

export interface ProjectInput {
  clientCategory: ClientCategory;
  projectSize: 'small' | 'medium' | 'large' | 'enterprise';
  complexity: 'low' | 'medium' | 'high';
  estimatedDuration: number; // in weeks
  teamSize: number;
  roles: RoleType[];
  description?: string;
  pricingModel?: 'feature-based' | 'hourly';
  features?: string[];
}
