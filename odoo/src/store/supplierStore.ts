import { create } from 'zustand';
import { toast } from 'react-toastify';

export interface Supplier {
  id: string;
  name: string;
  category: string;
  contact: string;
  email: string;
  phone: string;
  location: string;
  rating: number;
  performance: number;
  status: 'Premium' | 'Verified' | 'Active' | 'Inactive';
}

interface SupplierState {
  suppliers: Supplier[];
  addSupplier: (supplier: Omit<Supplier, 'id'>) => void;
  updateSupplier: (id: string, supplier: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;
}

const initialSuppliers: Supplier[] = [
  { id: '1', name: 'Techtronics Inc.', category: 'Electronics', contact: 'Sarah Chen', email: 'sales@techtronics.com', phone: '+1 415 555 0123', location: 'San Francisco, USA', rating: 4.8, performance: 98, status: 'Premium' },
  { id: '2', name: 'Global Furniture Hub', category: 'Furniture', contact: 'Marco Ross', email: 'supply@globalfurniture.it', phone: '+39 02 1234 5678', location: 'Milan, Italy', rating: 4.5, performance: 92, status: 'Verified' },
  { id: '3', name: 'Apparel Corp', category: 'Clothing', contact: 'Emma Wilson', email: 'info@apparelcorp.co.uk', phone: '+44 20 7946 0123', location: 'London, UK', rating: 4.2, performance: 85, status: 'Active' },
  { id: '4', name: 'Food Suppliers Ltd', category: 'F&B', contact: 'David Lee', email: 'logistics@foodsuppliers.vn', phone: '+84 28 3823 4567', location: 'Ho Chi Minh City, VN', rating: 4.9, performance: 99, status: 'Premium' },
];

export const useSupplierStore = create<SupplierState>((set) => ({
  suppliers: JSON.parse(localStorage.getItem('core_inventory_suppliers') || JSON.stringify(initialSuppliers)),
  
  addSupplier: (data) => {
    const newSupplier = { ...data, id: crypto.randomUUID() };
    set((state) => {
      const updated = [...state.suppliers, newSupplier];
      localStorage.setItem('core_inventory_suppliers', JSON.stringify(updated));
      return { suppliers: updated };
    });
    toast.success(`${data.name} added as supplier`);
  },

  updateSupplier: (id, updates) => {
    set((state) => {
      const updated = state.suppliers.map(s => s.id === id ? { ...s, ...updates } : s);
      localStorage.setItem('core_inventory_suppliers', JSON.stringify(updated));
      return { suppliers: updated };
    });
    toast.success('Supplier updated');
  },

  deleteSupplier: (id) => {
    set((state) => {
      const updated = state.suppliers.filter(s => s.id !== id);
      localStorage.setItem('core_inventory_suppliers', JSON.stringify(updated));
      return { suppliers: updated };
    });
    toast.success('Supplier removed');
  }
}));
