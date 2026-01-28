import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  BusinessProfile, 
  Client, 
  RatePreset, 
  Document 
} from '../types';

interface AppState {
  // Business Profile
  businessProfile: BusinessProfile | null;
  setBusinessProfile: (profile: BusinessProfile) => void;
  
  // Clients
  clients: Client[];
  addClient: (client: Client) => void;
  updateClient: (id: string, client: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  getClientById: (id: string) => Client | undefined;
  
  // Rate Presets
  ratePresets: RatePreset[];
  addRatePreset: (preset: RatePreset) => void;
  updateRatePreset: (id: string, preset: Partial<RatePreset>) => void;
  deleteRatePreset: (id: string) => void;
  
  // Documents
  documents: Document[];
  addDocument: (document: Document) => void;
  updateDocument: (id: string, document: Partial<Document>) => void;
  deleteDocument: (id: string) => void;
  getDocumentById: (id: string) => Document | undefined;
  getNextInvoiceNumber: () => string;
  
  // UI State
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const generateId = () => crypto.randomUUID();

// Default rate presets
const defaultRatePresets: RatePreset[] = [
  {
    id: generateId(),
    name: 'Junior Developer',
    role: 'developer',
    hourlyRate: 50,
    currency: 'USD',
    description: 'Entry-level development work',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    name: 'Senior Developer',
    role: 'developer',
    hourlyRate: 100,
    currency: 'USD',
    description: 'Senior-level development work',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    name: 'UI/UX Designer',
    role: 'designer',
    hourlyRate: 75,
    currency: 'USD',
    description: 'Design and user experience work',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    name: 'Project Manager',
    role: 'manager',
    hourlyRate: 85,
    currency: 'USD',
    description: 'Project management and coordination',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    name: 'Consultant',
    role: 'consultant',
    hourlyRate: 120,
    currency: 'USD',
    description: 'Strategic consulting services',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Business Profile
      businessProfile: null,
      setBusinessProfile: (profile) => set({ businessProfile: profile }),
      
      // Clients
      clients: [],
      addClient: (client) => set((state) => ({ 
        clients: [...state.clients, client] 
      })),
      updateClient: (id, clientData) => set((state) => ({
        clients: state.clients.map((c) => 
          c.id === id ? { ...c, ...clientData, updatedAt: new Date().toISOString() } : c
        ),
      })),
      deleteClient: (id) => set((state) => ({
        clients: state.clients.filter((c) => c.id !== id),
      })),
      getClientById: (id) => get().clients.find((c) => c.id === id),
      
      // Rate Presets
      ratePresets: defaultRatePresets,
      addRatePreset: (preset) => set((state) => ({
        ratePresets: [...state.ratePresets, preset],
      })),
      updateRatePreset: (id, presetData) => set((state) => ({
        ratePresets: state.ratePresets.map((p) =>
          p.id === id ? { ...p, ...presetData, updatedAt: new Date().toISOString() } : p
        ),
      })),
      deleteRatePreset: (id) => set((state) => ({
        ratePresets: state.ratePresets.filter((p) => p.id !== id),
      })),
      
      // Documents
      documents: [],
      addDocument: (document) => set((state) => ({
        documents: [...state.documents, document],
      })),
      updateDocument: (id, documentData) => set((state) => ({
        documents: state.documents.map((d) =>
          d.id === id ? { ...d, ...documentData, updatedAt: new Date().toISOString() } : d
        ),
      })),
      deleteDocument: (id) => set((state) => ({
        documents: state.documents.filter((d) => d.id !== id),
      })),
      getDocumentById: (id) => get().documents.find((d) => d.id === id),
      getNextInvoiceNumber: () => {
        const { documents, businessProfile } = get();
        const prefix = businessProfile?.invoicePrefix || 'INV';
        const start = businessProfile?.invoiceNumberStart || 1000;
        const invoices = documents.filter((d) => d.type === 'invoice');
        const nextNumber = start + invoices.length;
        return `${prefix}-${nextNumber}`;
      },
      
      // UI State
      sidebarOpen: true,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
    }),
    {
      name: 'smartquote-storage',
    }
  )
);
